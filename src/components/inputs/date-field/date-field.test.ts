import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import dateFieldCss from './date-field.styles.ts?raw';
import './date-field.js';
import type { NLDDDateField } from './date-field.js';
import { PICKER_POPOVER_WIDTH } from './date-field.template.js';

/** The visible text input; the picker's native input is a separate element. */
function textInput(el: HTMLElement): HTMLInputElement {
	return el.shadowRoot!.querySelector('.date-field__input') as HTMLInputElement;
}

function pickerButton(el: HTMLElement): HTMLElement | null {
	return el.shadowRoot!.querySelector('.date-field__picker-button nldd-icon-button');
}

function popover(el: HTMLElement): HTMLElement | null {
	return el.shadowRoot!.querySelector('nldd-popover');
}

function picker(el: HTMLElement): HTMLElement | null {
	return el.shadowRoot!.querySelector('nldd-date-picker');
}

/**
 * Simulate the popover closing. hide() is a no-op here (it never really opened),
 * so the close toggle that carries the focus intent is fired by hand, then the
 * microtask the field waits for before taking focus back is flushed.
 */
async function closePopover(el: NLDDDateField): Promise<void> {
	el._handlePopoverToggle(Object.assign(new Event('toggle'), { newState: 'closed' }));
	await Promise.resolve();
	await waitForUpdate(el);
}

/** Type into the visible field and commit, the way a user would. */
async function type(el: NLDDDateField, text: string): Promise<void> {
	const input = textInput(el);
	input.value = text;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await waitForUpdate(el);
	input.dispatchEvent(new Event('change', { bubbles: true }));
	await waitForUpdate(el);
}

describe('nldd-date-field', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('toont een ISO-waarde in Nederlandse notatie', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field value="2026-12-31"></nldd-date-field>');
		await waitForUpdate(el);
		expect(textInput(el).value).toBe('31-12-2026');
	});

	// Accept generously, normalize once, no masking while typing.
	it.each([
		['31-12-2026', '2026-12-31'],
		['31/12/2026', '2026-12-31'],
		['31.12.2026', '2026-12-31'],
		['1-2-2026', '2026-02-01'],
		['31122026', '2026-12-31'],
		['2026-12-31', '2026-12-31'],
	])('leest %s als %s', async (typed, iso) => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await type(el, typed);
		expect(el.value).toBe(iso);
	});

	it('normaliseert de weergave pas bij het vastleggen', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		const input = textInput(el);

		input.value = '1/2/2026';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		// While typing, the text stays exactly as entered.
		expect(input.value).toBe('1/2/2026');

		input.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(textInput(el).value).toBe('01-02-2026');
	});

	it('laat onleesbare invoer staan en houdt de waarde leeg', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await type(el, 'morgen');
		expect(el.value).toBe('');
		// Never wipe it silently: the user has to see what is there to repair it.
		expect(textInput(el).value).toBe('morgen');
	});

	it('weigert een niet-bestaande datum', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await type(el, '31-02-2026');
		expect(el.value).toBe('');
	});

	it('maakt de waarde leeg bij een leeg veld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field value="2026-12-31"></nldd-date-field>');
		await type(el, '');
		expect(el.value).toBe('');
	});

	it('vuurt change met de ISO-waarde', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		let detail: unknown = null;
		el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
		await type(el, '31-12-2026');
		expect(detail).toEqual({ value: '2026-12-31' });
	});

	it('geeft de interne input geen name - het component submit zelf één waarde', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field name="date"></nldd-date-field>');
		await waitForUpdate(el);
		expect(textInput(el).hasAttribute('name')).toBe(false);
	});

	// Anyone serializing the form on change (htmx, or plain new FormData(form))
	// does so synchronously. With the form value only set in updated(), that
	// listener read the value from before the change and the date just picked
	// disappeared again.
	it('heeft de nieuwe formwaarde al staan wanneer change afgaat', async () => {
		const form = document.createElement('form');
		document.body.appendChild(form);
		el = await fixture<NLDDDateField>('<nldd-date-field name="date"></nldd-date-field>');
		form.appendChild(el);
		await waitForUpdate(el);

		let seen: FormDataEntryValue | null = null;
		el.addEventListener('change', () => {
			seen = new FormData(form).get('date');
		});

		const input = textInput(el);
		input.value = '31-12-2026';
		input.dispatchEvent(new Event('change', { bubbles: true }));

		expect(seen).toBe('2026-12-31');
		form.remove();
	});


	// The calendar button and the popover live in the same box, so with
	// :focus-within the field drew a second ring around everything while the button
	// already had one.
	it('toont de veldring alleen voor het tekstveld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		const box = el.shadowRoot!.querySelector('.date-field')!;

		textInput(el).focus();
		expect(box.matches('.date-field:has(.date-field__input:focus)')).toBe(true);

		textInput(el).blur();
		expect(box.matches('.date-field:has(.date-field__input:focus)')).toBe(false);
	});


	// The fade keeps the room beside it open, so without a validation state there
	// should be no empty element in the DOM.
	it('rendert geen validatiecel zonder validatiestaat', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.date-field__validation-icon-area')).toBeNull();
	});

	// Two nearly identical branches in the template drifted apart: the valid branch
	// was missing the wrapper that sets the size, so that icon filled the cell.
	it.each([['valid'], ['invalid']])('zet het %s-icoon in een wrapper met een vaste maat', async (state) => {
		el = await fixture<NLDDDateField>(`<nldd-date-field ${state}></nldd-date-field>`);
		await waitForUpdate(el);
		const glyph = el.shadowRoot!.querySelector('.date-field__validation-icon');
		expect(glyph).not.toBeNull();
		expect(glyph!.querySelector('nldd-icon')!.getAttribute('icon')).toBe(state);
	});


	// # Range

	function inputs(el: NLDDDateField): HTMLInputElement[] {
		return Array.from(el.shadowRoot!.querySelectorAll('.date-field__input'));
	}

	it('toont één invoerveld zonder range', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(inputs(el)).toHaveLength(1);
		expect(el.shadowRoot!.querySelector('.date-field__separator')).toBeNull();
	});

	it('toont twee invoervelden met range', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		expect(inputs(el)).toHaveLength(2);
		expect(el.shadowRoot!.querySelector('.date-field__separator')).not.toBeNull();
	});

	it('leest beide velden los van elkaar', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		const [start, end] = inputs(el);

		start.value = '01-07-2026';
		start.dispatchEvent(new Event('change', { bubbles: true }));
		end.value = '14-07-2026';
		end.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);

		expect(el.value).toBe('2026-07-01/2026-07-14');
	});

	// One name and one value, like every other form field: the ISO 8601 notation
	// for an interval makes an invented second name unnecessary.
	it('dient de periode in als één waarde onder één naam', async () => {
		const form = document.createElement('form');
		document.body.appendChild(form);
		el = document.createElement('nldd-date-field') as NLDDDateField;
		el.range = true;
		el.name = 'period';
		form.appendChild(el);
		await waitForUpdate(el);
		el.value = '2026-07-06/2026-07-20';
		await waitForUpdate(el);

		const entries = [...new FormData(form).entries()];
		expect(entries).toEqual([['period', '2026-07-06/2026-07-20']]);
		form.remove();
	});

	it('splitst de waarde in twee velden', async () => {
		el = await fixture<NLDDDateField>(
			'<nldd-date-field range value="2026-07-06/2026-07-20"></nldd-date-field>',
		);
		await waitForUpdate(el);
		expect(inputs(el).map((i) => i.value)).toEqual(['06-07-2026', '20-07-2026']);
	});

	// A half-filled range is invalid input, and the receiving end should see that
	// rather than an empty field that says nothing.
	it('houdt een halfgevulde periode zichtbaar in de waarde', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		const [start] = inputs(el);
		start.value = '06-07-2026';
		start.dispatchEvent(new Event('change', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-06/');
	});

	// nldd-form-field sets one label and one id. The field divides that over its
	// two inputs itself, so form-field needs to know nothing about ranges.
	it('geeft de groep één naam en elk veld een eigen', async () => {
		el = await fixture<NLDDDateField>(
			'<nldd-date-field range accessible-label="Periode"></nldd-date-field>',
		);
		await waitForUpdate(el);
		const box = el.shadowRoot!.querySelector('.date-field')!;
		expect(box.getAttribute('role')).toBe('group');
		expect(box.getAttribute('aria-label')).toBe('Periode');

		const [start, end] = inputs(el);
		expect(start.getAttribute('aria-label')).toBe('Periode, van');
		expect(end.getAttribute('aria-label')).toBe('Periode, tot en met');
	});

	it('zet het id van form-field op het eerste veld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range input-id="field-1"></nldd-date-field>');
		await waitForUpdate(el);
		const [start, end] = inputs(el);
		expect(start.id).toBe('field-1');
		expect(end.id).toBe('');
	});

	it('zet de kalender in bereikmodus en geeft beide uiteinden door', async () => {
		el = await fixture<NLDDDateField>(
			'<nldd-date-field range value="2026-07-01/2026-07-14"></nldd-date-field>',
		);
		await waitForUpdate(el);
		expect(picker(el)!.hasAttribute('range')).toBe(true);
		expect(picker(el)!.getAttribute('start')).toBe('2026-07-01');
		expect(picker(el)!.getAttribute('end')).toBe('2026-07-14');
	});

	it('neemt een periode uit de kalender over', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { start: '2026-07-01', end: '2026-07-14' }, bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-01/2026-07-14');
		expect(inputs(el)[1].value).toBe('14-07-2026');
	});

	it('vuurt change met beide waarden in bereikmodus', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		let detail: unknown = null;
		el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { start: '2026-07-01', end: '2026-07-14' }, bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(detail).toEqual({ value: '2026-07-01/2026-07-14' });
	});


	// # Calendar

	// The button's focus ring carries a 6px halo that should land exactly on the
	// field's border. An overflow clip on the field cut that halo off at the
	// padding box and let the border run straight through it. Nothing can escape
	// without a clip, so the field does not clip.
	it('knipt de focusring van de kalenderknop niet af', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		const wrap = el.shadowRoot!.querySelector('.date-field') as HTMLElement;
		expect(getComputedStyle(wrap).overflow).toBe('visible');
	});

	it('toont de kalenderknop standaard', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(pickerButton(el)).not.toBeNull();
		expect(popover(el)).not.toBeNull();
	});

	// The popover hangs off the calendar button, which sits at the end of the
	// field. With bottom-start the calendar ran off to the right and barely touched
	// the field. bottom-end puts it under the input.
	it('klapt de kalender naar links open, onder het veld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(popover(el)!.getAttribute('placement')).toBe('bottom-end');
	});

	it('verbergt de kalender met no-picker', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field no-picker></nldd-date-field>');
		await waitForUpdate(el);
		expect(pickerButton(el)).toBeNull();
		expect(popover(el)).toBeNull();
	});

	it('geeft min en max door aan de kalender', async () => {
		el = await fixture<NLDDDateField>(
			'<nldd-date-field min="2026-01-01" max="2026-12-31"></nldd-date-field>',
		);
		await waitForUpdate(el);
		expect(picker(el)!.getAttribute('min')).toBe('2026-01-01');
		expect(picker(el)!.getAttribute('max')).toBe('2026-12-31');
	});

	// nldd-popover reads this to pick its focus target. Without it, focus stays on
	// the popover itself and you have to tab into the grid first.
	it('wijst de kalender aan als focusdoel van de popover', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(picker(el)!.hasAttribute('autofocus')).toBe(true);
		expect(popover(el)!.querySelector('[autofocus]')).toBe(picker(el));
	});

	it('geeft de waarde door aan de kalender', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field value="2026-12-31"></nldd-date-field>');
		await waitForUpdate(el);
		expect(picker(el)!.getAttribute('value')).toBe('2026-12-31');
	});

	// Where the native picker fell down: it had no close counterpart, and in Safari
	// closing hung off the invisible input itself.
	it('opent en sluit de kalender met dezelfde knop', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		const calls: string[] = [];
		const pop = popover(el) as unknown as { show(): void; hide(): void };
		pop.show = () => calls.push('show');
		pop.hide = () => calls.push('hide');

		el._handlePickerClick();
		expect(calls).toEqual(['show']);

		// The popover reports its open state back through toggle, which the field
		// mirrors, so the same button closes it the second time.
		popover(el)!.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'open' }));
		await waitForUpdate(el);
		expect(el._pickerOpen).toBe(true);

		el._handlePickerClick();
		expect(calls).toEqual(['show', 'hide']);
	});

	// The popover restores focus to the host, which delegates it to the text input,
	// so without intervention focus jumps back past the button you just used and
	// you have to tab forward again to reopen.
	it('zet de focus na het kiezen terug op de kalenderknop', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		textInput(el).focus();

		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { value: '2026-12-31' }, bubbles: true, composed: true,
		}));
		await closePopover(el);

		expect(el.shadowRoot!.activeElement).toBe(pickerButton(el));
	});

	// A range is not done in one click: after the second date you want the cursor
	// at the end of the end-date input, where the choice just landed, not back on
	// the button.
	it('zet de focus na een periode op het einde van het einddatumveld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		textInput(el).focus();

		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { start: '2026-07-08', end: '2026-07-15' }, bubbles: true, composed: true,
		}));
		await closePopover(el);

		const end = el.shadowRoot!.querySelectorAll('.date-field__input')[1] as HTMLInputElement;
		expect(el.shadowRoot!.activeElement).toBe(end);
		expect(end.selectionStart).toBe(end.value.length);
	});

	// The same restore as after a choice: cancel, Escape and a click beside it
	// should also put focus on the button, not leave it on the input.
	it('zet de focus na dismiss terug op de kalenderknop', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		textInput(el).focus();
		el._handlePickerDismiss(new Event('dismiss'));
		await closePopover(el);
		expect(el.shadowRoot!.activeElement).toBe(pickerButton(el));
	});

	it('neemt een datum uit de kalender over in de weergave', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { value: '2026-12-31' }, bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el.value).toBe('2026-12-31');
		expect(textInput(el).value).toBe('31-12-2026');
	});

	it('vuurt change met de datum uit de kalender', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		let detail: unknown = null;
		el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
		picker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { value: '2026-12-31' }, bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(detail).toEqual({ value: '2026-12-31' });
	});
});

describe('nldd-date-field met een eigen kalender in de slot', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function slottedPicker(host: NLDDDateField): HTMLElement | null {
		return host.querySelector('nldd-date-picker');
	}

	// Without this there are two calendars in the popover, because the default one
	// is only left out once the field notices the slot is filled.
	it('vervangt de standaardkalender in plaats van er een toe te voegen', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field>
				<nldd-date-picker slot="picker" week-numbers></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-date-picker')).toBeNull();
		expect(slottedPicker(el)).not.toBeNull();
	});

	it('laat de standaardkalender staan zolang de slot leeg is', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-date-picker')).not.toBeNull();
	});

	// The field owns the form value. A consumer setting it on the calendar itself
	// would create two sources of truth.
	it('schrijft waarde en grenzen op de gesloten kalender', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field value="2026-07-14" min="2026-07-01" max="2026-07-31">
				<nldd-date-picker slot="picker"></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		const p = slottedPicker(el) as HTMLElement & { value: string; min: string; max: string; range: boolean };
		expect(p.value).toBe('2026-07-14');
		expect(p.min).toBe('2026-07-01');
		expect(p.max).toBe('2026-07-31');
		expect(p.range).toBe(false);
	});

	it('geeft een periode door als start en eind', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field range value="2026-07-06/2026-07-20">
				<nldd-date-picker slot="picker"></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		const p = slottedPicker(el) as HTMLElement & { start: string; end: string; range: boolean };
		expect(p.range).toBe(true);
		expect(p.start).toBe('2026-07-06');
		expect(p.end).toBe('2026-07-20');
	});

	// The choice comes from the light DOM and has to reach the field through the slot.
	it('neemt een keuze uit de gesloten kalender over', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field>
				<nldd-date-picker slot="picker"></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		slottedPicker(el)!.dispatchEvent(new CustomEvent('change', {
			detail: { value: '2026-07-14' },
			bubbles: true,
			composed: true,
		}));
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-14');
	});

	it('laat eigenschappen die alleen de kalender kent met rust', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field>
				<nldd-date-picker slot="picker" week-numbers first-day-of-week="0"></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		const p = slottedPicker(el) as HTMLElement & { weekNumbers: boolean; firstDayOfWeek: number };
		expect(p.weekNumbers).toBe(true);
		expect(p.firstDayOfWeek).toBe(0);
	});
});

describe('nldd-date-field grenzen, separators en range-toggle', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// min/max went to the calendar, which blocks out-of-range days, but typed input
	// was never held against the bounds.
	it('legt een getypte datum buiten max niet vast', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field max="2026-07-31"></nldd-date-field>');
		await waitForUpdate(el);
		await type(el, '15-08-2026');
		expect(el.value).toBe('');
		expect(textInput(el).value).toBe('15-08-2026');
	});

	it('legt een getypte datum vóór min niet vast', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field min="2026-07-01"></nldd-date-field>');
		await waitForUpdate(el);
		await type(el, '20-06-2026');
		expect(el.value).toBe('');
	});

	it('legt een datum binnen de grenzen wel vast', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field min="2026-07-01" max="2026-07-31"></nldd-date-field>');
		await waitForUpdate(el);
		await type(el, '15-07-2026');
		expect(el.value).toBe('2026-07-15');
	});

	// Both range inputs run through the same _commit/_withinBounds as a single
	// field, so a typed value outside the bounds must not land in a range either.
	// The raw text does stay put so the user can correct it.
	it('legt een getypte range-datum buiten max niet vast', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range max="2026-07-31"></nldd-date-field>');
		await waitForUpdate(el);
		const [start, end] = [...el.shadowRoot!.querySelectorAll('.date-field__input')] as HTMLInputElement[];
		const typeInto = async (input: HTMLInputElement, text: string) => {
			input.value = text;
			input.dispatchEvent(new Event('input', { bubbles: true }));
			await waitForUpdate(el);
			input.dispatchEvent(new Event('change', { bubbles: true }));
			await waitForUpdate(el);
		};
		await typeInto(start, '10-07-2026');
		await typeInto(end, '15-08-2026');
		expect(el._startValue).toBe('2026-07-10');
		expect(el._endValue).toBe('');
		expect(end.value).toBe('15-08-2026');
	});

	// \D accepted any non-digit as a separator, a letter included.
	it('weigert een letter als scheidingsteken', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		await type(el, '2026x01x01');
		expect(el.value).toBe('');
	});

	it('accepteert punt en schuine streep als scheidingsteken', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		await type(el, '01.02.2026');
		expect(el.value).toBe('2026-02-01');
		await type(el, '03/04/2026');
		expect(el.value).toBe('2026-04-03');
	});

	// value keeps one shape per mode: always an interval with range, always a bare
	// date without it.
	it('maakt een kale datum een interval bij inschakelen van range', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field value="2026-07-06"></nldd-date-field>');
		await waitForUpdate(el);
		el.range = true;
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-06/');
		expect(el._startValue).toBe('2026-07-06');
		expect(el._endValue).toBe('');
	});

	it('collapseert een interval naar de startdatum bij uitschakelen van range', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2026-07-06/2026-07-20"></nldd-date-field>');
		await waitForUpdate(el);
		el.range = false;
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-06');
	});
});

describe('nldd-date-field popoverbreedte loopt niet vast', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The width was set on the popover from outside, and Lit does not undo that on
	// a later render, so after measuring a wide closed calendar the popover stayed
	// too wide, even once that calendar was gone.
	it('valt terug op de standaardbreedte als de gesloten kalender verdwijnt', async () => {
		el = await fixture<NLDDDateField>(`
			<nldd-date-field>
				<nldd-date-picker slot="picker" week-numbers></nldd-date-picker>
			</nldd-date-field>
		`);
		await waitForUpdate(el);
		// As if the closed calendar had been measured and found wide.
		el._pickerPopoverWidth = 'calc(500px + var(--primitives-space-16) * 2)';
		await waitForUpdate(el);
		// Calendar gone, then the popover opens again.
		el.querySelector('nldd-date-picker')!.remove();
		el._handlePickerSlotChange();
		await waitForUpdate(el);
		const openEvent = Object.assign(new Event('toggle'), { newState: 'open' });
		el._handlePopoverToggle(openEvent as ToggleEvent);
		await waitForUpdate(el);
		expect(el._pickerPopoverWidth).toBe(PICKER_POPOVER_WIDTH);
	});
});

describe('nldd-date-field is nooit een naamloze control', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// Without accessible-label and without nldd-form-field the input got no name at
	// all: no label, no aria-label. It now falls back to a neutral one.
	it('geeft de invoer een terugval-naam zonder accessible-label', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field></nldd-date-field>');
		await waitForUpdate(el);
		expect(textInput(el).getAttribute('aria-label')).toBe('Datum');
	});

	it('laat accessible-label voorgaan op de terugval', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field accessible-label="Geboortedatum"></nldd-date-field>');
		await waitForUpdate(el);
		expect(textInput(el).getAttribute('aria-label')).toBe('Geboortedatum');
	});

	it('benoemt in range-modus de groep en beide invoervelden', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range></nldd-date-field>');
		await waitForUpdate(el);
		const inputs = el.shadowRoot!.querySelectorAll('.date-field__input');
		expect(el.shadowRoot!.querySelector('.date-field')!.getAttribute('aria-label')).toBe('Periode');
		expect(inputs[0].getAttribute('aria-label')).toBe('Periode, van');
		expect(inputs[1].getAttribute('aria-label')).toBe('Periode, tot en met');
	});
});

describe('nldd-date-field sorteert een omgekeerd getypte periode op blur', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function fieldBlur(host: NLDDDateField, relatedTarget: Node | null = null) {
		host.shadowRoot!.querySelector('.date-field')!
			.dispatchEvent(new FocusEvent('focusout', { relatedTarget, bubbles: true }));
	}

	// The calendar always sorts a dragged range; typing did not, so "van 2027 t/m
	// 2026" stayed backwards.
	it('zet de vroegste datum voorop als de focus het veld verlaat', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2027-06-09/2026-06-26"></nldd-date-field>');
		await waitForUpdate(el);
		fieldBlur(el);
		await waitForUpdate(el);
		expect(el.value).toBe('2026-06-26/2027-06-09');
	});

	it('laat een periode die al goed staat met rust', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2026-06-09/2026-06-26"></nldd-date-field>');
		await waitForUpdate(el);
		fieldBlur(el);
		await waitForUpdate(el);
		expect(el.value).toBe('2026-06-09/2026-06-26');
	});

	// Moving between the two inputs must not sort, or a value you just typed jumps
	// to the other field while you are still working.
	it('sorteert niet als de focus binnen het veld blijft', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2027-06-09/2026-06-26"></nldd-date-field>');
		await waitForUpdate(el);
		const tweede = el.shadowRoot!.querySelectorAll('.date-field__input')[1];
		fieldBlur(el, tweede);
		await waitForUpdate(el);
		expect(el.value).toBe('2027-06-09/2026-06-26');
	});

	it('doet niets zonder range', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field value="2026-06-09"></nldd-date-field>');
		await waitForUpdate(el);
		fieldBlur(el);
		await waitForUpdate(el);
		expect(el.value).toBe('2026-06-09');
	});

	// Clicking the calendar button does not leave the field (the button sits in the
	// same shadow root), so the sort on blur is skipped. Sorting on open instead,
	// so the calendar shows the range the way it stores it.
	it('sorteert ook wanneer de kalender opengaat', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2027-06-09/2026-06-26"></nldd-date-field>');
		await waitForUpdate(el);
		const openEvent = Object.assign(new Event('toggle'), { newState: 'open' });
		el._handlePopoverToggle(openEvent as ToggleEvent);
		await waitForUpdate(el);
		expect(el.value).toBe('2026-06-26/2027-06-09');
	});
});

describe('nldd-date-field springt met backspace van een leeg einddatumveld terug', () => {
	let el: NLDDDateField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function inputs(host: NLDDDateField) {
		return Array.from(host.shadowRoot!.querySelectorAll('.date-field__input')) as HTMLInputElement[];
	}

	function backspace(input: HTMLInputElement) {
		const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
		input.dispatchEvent(event);
		return event;
	}

	// That way you clear a whole range in one run of backspaces, without reaching
	// for the mouse to move between the two fields.
	it('zet de focus op het einde van het startdatumveld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2026-06-09/"></nldd-date-field>');
		await waitForUpdate(el);
		const [start, end] = inputs(el);
		end.focus();
		const event = backspace(end);
		await waitForUpdate(el);
		expect(event.defaultPrevented).toBe(true);
		expect(el.shadowRoot!.activeElement).toBe(start);
		expect(start.selectionStart).toBe(start.value.length);
	});

	it('laat een gevuld einddatumveld met rust', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="2026-06-09/2026-06-26"></nldd-date-field>');
		await waitForUpdate(el);
		const [, end] = inputs(el);
		end.focus();
		const event = backspace(end);
		await waitForUpdate(el);
		expect(event.defaultPrevented).toBe(false);
		expect(el.shadowRoot!.activeElement).toBe(end);
	});

	it('doet niets vanuit het startdatumveld', async () => {
		el = await fixture<NLDDDateField>('<nldd-date-field range value="/"></nldd-date-field>');
		await waitForUpdate(el);
		const [start] = inputs(el);
		start.focus();
		const event = backspace(start);
		await waitForUpdate(el);
		expect(event.defaultPrevented).toBe(false);
	});
});

describe('nldd-date-field readonly', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('drops the picker button, rather than dimming it', async () => {
		el = await fixture('<nldd-date-field value="2026-08-19" readonly></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).toBeNull();
	});

	it('keeps the picker on a field that can change', async () => {
		el = await fixture('<nldd-date-field value="2026-08-19"></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).not.toBeNull();
	});
});

describe('nldd-date-field width="fit-content"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('is not handed to CSS as the keyword', async () => {
		// CSS.supports accepts fit-content as the real keyword, which would size
		// the field to the content of its shadow root. What is wanted is the
		// default calculation with the icon slot dropped, so the override comes off
		// and the stylesheet does the rest.
		el = await fixture('<nldd-date-field width="fit-content" accessible-label="Due"></nldd-date-field>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_width')).toBe('');
		expect(el.getAttribute('width')).toBe('fit-content');
	});

	it('sets a narrower slot, and only while there is no validation state', () => {
		// Read from the source the same way the progress components check their
		// tokens: the widths here are calc() over tokens the test page does not
		// carry, and a browser does not evaluate calc() for an unregistered custom
		// property, so there is nothing to measure.
		const rule = /:host\(\[width="fit-content"\]:not\(\[valid\]\):not\(\[invalid\]\)\)\s*\{([^}]*)\}/
			.exec(dateFieldCss);
		expect(rule, 'no fit-content rule in date-field.styles.ts').not.toBeNull();
		expect(rule![1]).toContain('--_validation-icon-area-width');
		expect(rule![1]).toContain('--primitives-space-8');
	});
});
