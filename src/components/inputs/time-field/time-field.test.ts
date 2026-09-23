import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { parseTime, roundToStep, type NLDDTimeField } from './time-field.js';
import type { NLDDPopover } from '../../layout/popover/popover.js';
import './time-field.js';

async function typeInto(el: NLDDTimeField, text: string, commit = false) {
	const input = el.shadowRoot!.querySelector('input')!;
	input.value = text;
	input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
	if (commit) input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
	await waitForUpdate(el);
	return input;
}

async function openPicker(el: NLDDTimeField) {
	el.shadowRoot!.querySelector<HTMLElement>('.time-field__picker-button nldd-icon-button')!.click();
	await new Promise((r) => setTimeout(r, 200));
}

/**
 * Fixes the clock for the tests that start from the current time. Only Date is
 * faked: fake the timers too and the setTimeout inside waitForUpdate never
 * fires, so the test hangs instead of failing.
 */
function atTime(time: string) {
	const [hours, minutes] = time.split(':').map(Number);
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date(2026, 6, 1, hours, minutes));
}

/** What the picker reports once scrolling comes to rest. */
function scrollPickerTo(el: NLDDTimeField, value: string) {
	el.shadowRoot!.querySelector('nldd-time-picker')!.dispatchEvent(new CustomEvent('input', {
		detail: { value }, bubbles: true, composed: true,
	}));
}


/* ============================================================
   Parsing
   ============================================================ */

describe('parseTime', () => {
	it.each([
		['9', '09:00'],
		['09', '09:00'],
		['14', '14:00'],
		['0', '00:00'],
		['23', '23:00'],
		['9:5', '09:05'],
		['9:30', '09:30'],
		['09:30', '09:30'],
		['9.30', '09:30'],
		['9,30', '09:30'],
		['9u30', '09:30'],
		['9U30', '09:30'],
		['9h30', '09:30'],
		['9u', '09:00'],
		['930', '09:30'],
		['0930', '09:30'],
		['1430', '14:30'],
		['  9:30  ', '09:30'],
	])('leest %s als %s', (raw, expected) => {
		expect(parseTime(raw)).toBe(expected);
	});

	it.each([
		[''],
		['   '],
		['abc'],
		['25:00'],
		['9:60'],
		['24:00'],
		['12345'],
		// Halfway through typing: punctuation without minutes is not a value yet.
		['9:'],
		['9.'],
		[':30'],
		['-1'],
	])('wijst %s af', (raw) => {
		expect(parseTime(raw)).toBeNull();
	});
});


/* ============================================================
   Rounding
   ============================================================ */

describe('roundToStep', () => {
	it('rondt af naar de dichtstbijzijnde stap', () => {
		expect(roundToStep('09:07', 15)).toBe('09:00');
		expect(roundToStep('09:08', 15)).toBe('09:15');
	});

	it('rondt een gelijkstand naar boven af', () => {
		expect(roundToStep('09:05', 10)).toBe('09:10');
	});

	it('telt de stap vanaf de basis', () => {
		expect(roundToStep('09:07', 15, '09:07')).toBe('09:07');
		expect(roundToStep('09:20', 15, '09:07')).toBe('09:22');
	});

	it('rondt niets af bij stap 1', () => {
		expect(roundToStep('09:07', 1)).toBe('09:07');
	});

	it('rolt niet door over de dagrand', () => {
		expect(roundToStep('23:53', 15)).toBe('23:45');
		expect(roundToStep('23:59', 30)).toBe('23:30');
	});
});


/* ============================================================
   Smoke
   ============================================================ */

describe('nldd-time-field', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); vi.restoreAllMocks(); vi.useRealTimers(); });

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('toont een waarde uit het attribuut in de input', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('09:30');
	});
});


/* ============================================================
   Value and normalizing
   ============================================================ */

describe('nldd-time-field – waarde', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('zet value tijdens typen zodra er iets leesbaars staat', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await typeInto(el, '9u30');
		expect(el.value).toBe('09:30');
	});

	it('normaliseert de weergave bij commit', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		const input = await typeInto(el, '9u30', true);
		expect(input.value).toBe('09:30');
		expect(el.value).toBe('09:30');
	});

	it('laat onleesbare tekst staan en houdt value leeg', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		const input = await typeInto(el, 'morgenvroeg', true);
		expect(input.value).toBe('morgenvroeg');
		expect(el.value).toBe('');
	});

	it('rondt bij commit af op de stap', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field step="15"></nldd-time-field>');
		const input = await typeInto(el, '09:08', true);
		expect(el.value).toBe('09:15');
		expect(input.value).toBe('09:15');
	});

	// Lit skips a DOM write as soon as the new text equals what it last rendered.
	// Exactly what happens when you retype a normalized value differently: 09:30
	// becomes 930 and rounds back to 09:30.
	it('normaliseert ook wanneer de nieuwe tekst gelijk is aan de vorige waarde', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		const input = await typeInto(el, '930', true);
		expect(input.value).toBe('09:30');
		expect(el.value).toBe('09:30');
	});

	it('rondt niet af tijdens typen', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field step="15"></nldd-time-field>');
		await typeInto(el, '09:08');
		expect(el.value).toBe('09:08');
	});
});


/* ============================================================
   Bounds
   ============================================================ */

describe('nldd-time-field – grenzen', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('weigert een tijd voor min en laat de tekst staan', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="09:00"></nldd-time-field>');
		const input = await typeInto(el, '08:00', true);
		expect(el.value).toBe('');
		expect(input.value).toBe('08:00');
	});

	it('weigert een tijd na max', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field max="17:00"></nldd-time-field>');
		await typeInto(el, '17:01', true);
		expect(el.value).toBe('');
	});

	it('accepteert de grenzen zelf', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="09:00" max="17:00"></nldd-time-field>');
		await typeInto(el, '09:00', true);
		expect(el.value).toBe('09:00');
		await typeInto(el, '17:00', true);
		expect(el.value).toBe('17:00');
	});

	it('telt de stap vanaf min', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="09:07" step="15"></nldd-time-field>');
		await typeInto(el, '09:20', true);
		expect(el.value).toBe('09:22');
	});
});


/* ============================================================
   Events
   ============================================================ */

describe('nldd-time-field – events', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('vuurt één input-event per toetsaanslag, nooit ook het native event', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		const details: unknown[] = [];
		el.addEventListener('input', ((e: CustomEvent) => { details.push(e.detail); }) as EventListener);
		await typeInto(el, '09:30');
		expect(details).toEqual([{ value: '09:30' }]);
	});

	it('vuurt één change-event per commit', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		const details: unknown[] = [];
		el.addEventListener('change', ((e: CustomEvent) => { details.push(e.detail); }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		input.value = '9u30';
		input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(details).toEqual([{ value: '09:30' }]);
	});

	it('geeft een lege waarde door zodra de invoer onleesbaar wordt', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		const seen: string[] = [];
		el.addEventListener('input', ((e: CustomEvent) => { seen.push(e.detail.value); }) as EventListener);
		await typeInto(el, 'x');
		expect(seen).toEqual(['']);
	});
});


/* ============================================================
   Arrow keys
   ============================================================ */

describe('nldd-time-field – pijltjestoetsen', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	async function arrow(field: NLDDTimeField, key: 'ArrowUp' | 'ArrowDown') {
		const input = field.shadowRoot!.querySelector('input')!;
		input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }));
		await waitForUpdate(field);
		return input;
	}

	it('verspringt met de stap vanaf een bestaande waarde', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:00" step="15"></nldd-time-field>');
		await waitForUpdate(el);
		await arrow(el, 'ArrowUp');
		expect(el.value).toBe('09:15');
		await arrow(el, 'ArrowDown');
		expect(el.value).toBe('09:00');
	});

	it('begint op min wanneer het veld leeg is', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="09:00" step="15"></nldd-time-field>');
		await waitForUpdate(el);
		await arrow(el, 'ArrowUp');
		expect(el.value).toBe('09:00');
	});

	it('begint zonder min op de huidige tijd, afgerond op de stap', async () => {
		atTime('09:07');
		el = await fixture<NLDDTimeField>('<nldd-time-field step="15"></nldd-time-field>');
		await waitForUpdate(el);
		await arrow(el, 'ArrowUp');
		expect(el.value).toBe('09:00');
	});

	it('komt niet voorbij max', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="17:00" max="17:00" step="15"></nldd-time-field>');
		await waitForUpdate(el);
		await arrow(el, 'ArrowUp');
		expect(el.value).toBe('17:00');
	});

	it('doet niets wanneer het veld readonly is', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:00" readonly></nldd-time-field>');
		await waitForUpdate(el);
		await arrow(el, 'ArrowUp');
		expect(el.value).toBe('09:00');
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-time-field – toegankelijkheid', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('valt terug op een Nederlands label zonder accessible-label', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Tijd');
	});

	it('zet accessible-label op de input', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field accessible-label="Starttijd"></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Starttijd');
	});

	it('wijst de interne input naar de elementen die hem beschrijven', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		const uitleg = document.createElement('p');
		document.body.appendChild(uitleg);
		(el as unknown as { describedByElements: readonly Element[] }).describedByElements = [uitleg];
		await waitForUpdate(el);
		const intern = el.shadowRoot!.querySelector('input')! as Element & { ariaDescribedByElements?: readonly Element[] | null };
		expect(intern.ariaDescribedByElements).toEqual([uitleg]);
		uitleg.remove();
	});

	it('opent een cijfertoetsenbord op mobiel', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('inputmode')).toBe('numeric');
	});
});


/* ============================================================
   Picker
   ============================================================ */

describe('nldd-time-field – picker', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('toont standaard een knop om de picker te openen', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		const knop = el.shadowRoot!.querySelector('.time-field__picker-button nldd-icon-button');
		expect(knop).not.toBeNull();
		expect(knop!.getAttribute('text')).toBe('Tijd kiezen');
	});

	it('verbergt de knop met no-picker', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field no-picker></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.time-field__picker-button')).toBeNull();
	});

	// A time has two parts, so picking the hour is half an answer. Were the
	// popover to close on that, you would never reach the minutes.
	it('sluit de popover niet als er een waarde wordt gekozen', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await el.shadowRoot!.querySelector<HTMLElement>('.time-field__picker-button nldd-icon-button')!.click();
		await new Promise((r) => setTimeout(r, 200));
		const popover = el.shadowRoot!.querySelector<HTMLElement>('nldd-popover')!;
		const picker = el.shadowRoot!.querySelector('nldd-time-picker')!;
		picker.dispatchEvent(new CustomEvent('change', {
			detail: { value: '14:30' }, bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el.value).toBe('14:30');
		expect(popover.matches(':popover-open')).toBe(true);
	});

	it('sluit de popover met de knop eronder', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await el.shadowRoot!.querySelector<HTMLElement>('.time-field__picker-button nldd-icon-button')!.click();
		await new Promise((r) => setTimeout(r, 200));
		const popover = el.shadowRoot!.querySelector<HTMLElement>('nldd-popover')!;
		expect(popover.matches(':popover-open')).toBe(true);
		el.shadowRoot!.querySelector<HTMLElement>('nldd-popover nldd-button')!.click();
		await new Promise((r) => setTimeout(r, 200));
		expect(popover.matches(':popover-open')).toBe(false);
	});

	// An empty picker would show two columns on 00. The starting point puts the
	// wheels on a time without filling in the field yet.
	it('opent de picker op een beginpunt als het veld leeg is', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="08:00"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		expect(el.value).toBe('');
		expect(el.shadowRoot!.querySelector('nldd-time-picker')!.value).toBe('08:00');
	});

	it('bevestigt het beginpunt met de knop eronder', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="08:00"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		el.shadowRoot!.querySelector<HTMLElement>('nldd-popover nldd-button')!.click();
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('08:00');
	});

	it('laat een leeg veld leeg als de picker onaangeroerd sluit', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="08:00"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		el.shadowRoot!.querySelector<NLDDPopover>('nldd-popover')!.hide();
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('');
	});

	// Scrolling is a proposal: the field shows it already, but only records on
	// close.
	it('meldt change pas bij het sluiten', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		const changes: string[] = [];
		el.addEventListener('change', () => changes.push(el.value));
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		expect(el.value).toBe('14:30');
		expect(changes).toEqual([]);
		el.shadowRoot!.querySelector<HTMLElement>('nldd-popover nldd-button')!.click();
		await new Promise((r) => setTimeout(r, 200));
		expect(changes).toEqual(['14:30']);
	});

	// Enter is the default action in a dialog, and here that is "Klaar".
	it('sluit de picker met Enter op een waarde in de selectie', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		const popover = el.shadowRoot!.querySelector<NLDDPopover>('nldd-popover')!;
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('nldd-time-picker')!.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }),
		);
		await new Promise((r) => setTimeout(r, 200));
		expect(popover.matches(':popover-open')).toBe(false);
		expect(el.value).toBe('14:30');
	});

	it('houdt een gekozen tijd bij een klik ernaast', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector<NLDDPopover>('nldd-popover')!.hide();
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('14:30');
	});

	it('zet de oude waarde terug bij annuleren', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('nldd-top-title-bar')!.dispatchEvent(
			new CustomEvent('dismiss', { bubbles: true, composed: true }),
		);
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('09:30');
		expect(el.shadowRoot!.querySelector<HTMLInputElement>('.time-field__input')!.value).toBe('09:30');
	});

	// The browser closes on Escape by itself and a lone synthetic key cannot
	// replay that. What counts here is that the key reads as canceling and not as
	// choosing.
	it('zet de oude waarde terug bij Escape', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		el.shadowRoot!.querySelector<NLDDPopover>('nldd-popover')!.hide();
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('09:30');
	});

	it('laat een leeg veld leeg na annuleren', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field min="08:00"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		scrollPickerTo(el, '14:30');
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('nldd-top-title-bar')!.dispatchEvent(
			new CustomEvent('dismiss', { bubbles: true, composed: true }),
		);
		await new Promise((r) => setTimeout(r, 200));
		expect(el.value).toBe('');
		expect(el.shadowRoot!.querySelector<HTMLInputElement>('.time-field__input')!.value).toBe('');
	});

	// With the picker open there is no toggle event left when the field leaves the
	// DOM, so the listener on document would stay behind.
	it('haalt de Escape-listener weg als het veld verdwijnt met de picker open', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		const verwijderd: EventListenerOrEventListenerObject[] = [];
		const origineel = document.removeEventListener.bind(document);
		document.removeEventListener = ((type: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
			if (type === 'keydown') verwijderd.push(handler);
			origineel(type, handler, options);
		}) as typeof document.removeEventListener;
		try {
			el.remove();
		} finally {
			document.removeEventListener = origineel;
		}
		expect(verwijderd.length).toBeGreaterThan(0);
	});

	// nldd-popover reads autofocus to pick its focus target. Without it, focus
	// stops on the popover and the arrow keys do nothing until you tab in.
	it('geeft de ingebouwde picker autofocus', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field value="09:30"></nldd-time-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-time-picker')!.hasAttribute('autofocus')).toBe(true);
	});

	// Only max, no min: the current time can lie past it, and a starting point
	// outside the bounds leaves the wheels without a selection. The clock is fixed
	// past max, because between midnight and 00:30 it is not.
	it('houdt het beginpunt binnen max', async () => {
		atTime('13:05');
		el = await fixture<NLDDTimeField>('<nldd-time-field max="00:30" step="15"></nldd-time-field>');
		await waitForUpdate(el);
		await openPicker(el);
		const picker = el.shadowRoot!.querySelector('nldd-time-picker')!;
		expect(picker.value).toBe('00:30');
		expect(picker.shadowRoot!.querySelectorAll('[data-selected]').length).toBe(2);
	});

	// A button's size is an attribute and so cannot be chosen with a media query.
	// The field therefore asks the same question in JS.
	it('kiest de knopmaat op het aanwijzertype', async () => {
		el = await fixture<NLDDTimeField>('<nldd-time-field></nldd-time-field>');
		await waitForUpdate(el);
		const verwacht = matchMedia('(pointer: fine)').matches ? 'sm' : 'md';
		expect(el._pickerButtonSize).toBe(verwacht);
	});
});


/* ============================================================
   Form
   ============================================================ */

describe('nldd-time-field – formulier', () => {
	let el: NLDDTimeField;

	afterEach(() => { if (el) cleanup(el); });

	it('draagt zijn waarde bij aan de formulierdata', async () => {
		const form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-time-field name="start" value="09:30"></nldd-time-field>
			</form>
		`);
		el = form.querySelector('nldd-time-field')!;
		await waitForUpdate(el);
		expect(new FormData(form).get('start')).toBe('09:30');
		cleanup(form);
	});

	it('zet bij reset terug naar de beginwaarde', async () => {
		const form = await fixture<HTMLFormElement>(`
			<form>
				<nldd-time-field name="start" value="09:30"></nldd-time-field>
			</form>
		`);
		el = form.querySelector('nldd-time-field')!;
		await waitForUpdate(el);
		await typeInto(el, '11:00', true);
		expect(el.value).toBe('11:00');
		form.reset();
		await waitForUpdate(el);
		expect(el.value).toBe('09:30');
		expect(el.shadowRoot!.querySelector('input')!.value).toBe('09:30');
		cleanup(form);
	});
});
