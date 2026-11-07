import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, until } from '../../../test-utils.js';
import type { NLDDTimePicker } from './time-picker.js';
import './time-picker.js';

function column(el: NLDDTimePicker, name: 'hours' | 'minutes'): HTMLElement {
	return el.shadowRoot!.querySelector(`[data-column="${name}"]`)!;
}

function options(el: NLDDTimePicker, name: 'hours' | 'minutes'): string[] {
	return [...column(el, name).querySelectorAll('.time-picker__list-item')].map((o) => o.textContent!.trim());
}

function selected(el: NLDDTimePicker, name: 'hours' | 'minutes'): string | null {
	return column(el, name).querySelector('[data-selected]')?.textContent?.trim() ?? null;
}

function selection(el: NLDDTimePicker, name: 'hours' | 'minutes'): HTMLElement {
	const index = name === 'hours' ? 0 : 1;
	return [...el.shadowRoot!.querySelectorAll<HTMLElement>('.time-picker__value')][index];
}

async function press(el: NLDDTimePicker, name: 'hours' | 'minutes', key: string) {
	column(el, name).dispatchEvent(new KeyboardEvent('keydown', {
		key, bubbles: true, composed: true, cancelable: true,
	}));
	await waitForUpdate(el);
}


/* ============================================================
   Smoke and columns
   ============================================================ */

describe('nldd-time-picker', () => {
	let el: NLDDTimePicker;

	afterEach(() => { if (el) cleanup(el); });

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker></nldd-time-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('toont 24 uren en 60 minuten bij de standaardstap', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker></nldd-time-picker>');
		await waitForUpdate(el);
		expect(options(el, 'hours')).toHaveLength(24);
		expect(options(el, 'minutes')).toHaveLength(60);
	});

	it('toont per stap alleen de geldige minuten', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(options(el, 'minutes')).toEqual(['00', '15', '30', '45']);
	});

	it('telt de stap vanaf min', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker min="09:07" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(options(el, 'minutes')).toEqual(['07', '22', '37', '52']);
	});

	it('laat uren buiten min en max weg', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker min="09:00" max="11:00"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(options(el, 'hours')).toEqual(['09', '10', '11']);
	});

	it('toont in het laatste uur alleen de minuten tot en met max', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="11:00" min="09:00" max="11:30" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(options(el, 'minutes')).toEqual(['00', '15', '30']);
	});
});


/* ============================================================
   Picking
   ============================================================ */

describe('nldd-time-picker – kiezen', () => {
	let el: NLDDTimePicker;

	afterEach(() => { if (el) cleanup(el); });

	it('markeert de gekozen tijd in beide kolommen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(selected(el, 'hours')).toBe('09');
		expect(selected(el, 'minutes')).toBe('30');
	});

	// A value clicked above or below the selection glides into it; one set from
	// outside, such as on opening, stands there at once.
	it('scrollt een aangeklikte waarde vloeiend naar het midden, een gezette direct', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30" style="--primitives-transition-duration-medium: 200ms; --semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>');
		await waitForUpdate(el);
		const kolom = column(el, 'hours');
		const midden = (o: HTMLElement) => o.offsetTop + o.offsetHeight / 2 - kolom.clientHeight / 2;
		const opties = [...kolom.querySelectorAll<HTMLElement>('.time-picker__list-item')];

		opties[11].click();
		await waitForUpdate(el);
		expect(el.value).toBe('11:30');
		expect(kolom.hasAttribute('data-gliding')).toBe(true);
		await until(() => !kolom.hasAttribute('data-gliding'), { timeout: 1000 });
		expect(Math.abs(kolom.scrollTop - midden(opties[11]))).toBeLessThan(1);

		el.value = '14:00';
		await waitForUpdate(el);
		expect(kolom.hasAttribute('data-gliding')).toBe(false);
		expect(Math.abs(kolom.scrollTop - midden(opties[14]))).toBeLessThan(1);
	});

	// Scrolling changes the value but confirms nothing: a field showing the picker
	// in a popover would otherwise snap shut the moment you stop scrolling, and
	// then you never saw the second column.
	it('vuurt input bij scrollen en geen change', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		await new Promise((r) => setTimeout(r, 250));
		const gezien: string[] = [];
		el.addEventListener('input', (() => gezien.push('input')) as EventListener);
		el.addEventListener('change', (() => gezien.push('change')) as EventListener);
		const kolom = column(el, 'hours');
		const optie = [...kolom.querySelectorAll<HTMLElement>('.time-picker__list-item')][14];
		kolom.scrollTop = optie.offsetTop + optie.offsetHeight / 2 - kolom.clientHeight / 2;
		kolom.dispatchEvent(new Event('scroll'));
		await new Promise((r) => setTimeout(r, 250));
		expect(gezien).toEqual(['input']);
		expect(el.value).toBe('14:30');
	});

	// While scrolling, the values slide past under a stationary cursor. Without
	// this a different one lights up every time, and a tap halfway through a swipe
	// can pick something by accident.
	it('zet de muis uit op de waarden tijdens het scrollen', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		await new Promise((r) => setTimeout(r, 250));
		const kolom = column(el, 'hours');
		const item = kolom.querySelector('.time-picker__list-item')!;
		expect(getComputedStyle(item).pointerEvents).not.toBe('none');
		kolom.dispatchEvent(new Event('scroll'));
		await waitForUpdate(el);
		expect(getComputedStyle(item).pointerEvents).toBe('none');
		// The styling itself as well, because a :hover already in place keeps
		// matching until the browser redoes the hit test.
		const hoverRegels = [...el.shadowRoot!.adoptedStyleSheets]
			.flatMap((sheet) => [...sheet.cssRules])
			.filter((r): r is CSSStyleRule => 'selectorText' in r)
			.filter((r) => r.selectorText.includes('data-scrolling') && r.selectorText.includes(':hover'));
		expect(hoverRegels).toHaveLength(1);
		expect(hoverRegels[0].style.backgroundColor).toBe('transparent');
		// And back on once scrolling comes to rest.
		await new Promise((r) => setTimeout(r, 250));
		expect(getComputedStyle(item).pointerEvents).not.toBe('none');
	});

	it('bevestigt met Enter op de selectie', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const gezien: string[] = [];
		el.addEventListener('change', (() => gezien.push('change')) as EventListener);
		selection(el, 'hours').dispatchEvent(new KeyboardEvent('keydown', {
			key: 'Enter', bubbles: true, composed: true, cancelable: true,
		}));
		await waitForUpdate(el);
		expect(gezien).toEqual(['change']);
	});

	it('vuurt change bij een klik op een uur', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const seen: string[] = [];
		el.addEventListener('change', ((e: CustomEvent) => { seen.push(e.detail.value); }) as EventListener);
		const tien = [...column(el, 'hours').querySelectorAll('.time-picker__list-item')][10] as HTMLElement;
		tien.click();
		await waitForUpdate(el);
		expect(seen).toEqual(['10:30']);
	});

	// Otherwise every hour drops you back to :00 and you have to find the minute
	// again, while all you wanted was to move the hour.
	it('houdt de minuut vast bij het wisselen van uur', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:45" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		const veertien = [...column(el, 'hours').querySelectorAll('.time-picker__list-item')][14] as HTMLElement;
		veertien.click();
		await waitForUpdate(el);
		expect(el.value).toBe('14:45');
	});

	it('valt terug op de eerste mogelijke minuut als de huidige niet past', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:45" min="09:00" max="10:15" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		const tien = [...column(el, 'hours').querySelectorAll('.time-picker__list-item')][1] as HTMLElement;
		tien.click();
		await waitForUpdate(el);
		expect(el.value).toBe('10:00');
	});

	// Clicking the same value again is a confirmation ("yes, this one") and so
	// does give a change, but nothing changed and so there is no input.
	it('bevestigt zonder input als dezelfde waarde opnieuw wordt gekozen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const gezien: string[] = [];
		el.addEventListener('input', (() => gezien.push('input')) as EventListener);
		el.addEventListener('change', (() => gezien.push('change')) as EventListener);
		(column(el, 'minutes').querySelector('[data-selected]') as HTMLElement).click();
		await waitForUpdate(el);
		expect(gezien).toEqual(['change']);
	});
});


/* ============================================================
   Keyboard
   ============================================================ */

describe('nldd-time-picker – toetsenbord', () => {
	let el: NLDDTimePicker;

	afterEach(() => { if (el) cleanup(el); });

	it('loopt met de pijltoetsen door een kolom zonder te bevestigen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const gezien: string[] = [];
		el.addEventListener('change', (() => gezien.push('change')) as EventListener);
		await press(el, 'hours', 'ArrowDown');
		expect(el.value).toBe('10:30');
		await press(el, 'hours', 'ArrowUp');
		expect(el.value).toBe('09:30');
		expect(gezien).toEqual([]);
	});

	it('springt met Home en End naar de randen van de kolom', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		await press(el, 'hours', 'Home');
		expect(el.value).toBe('00:30');
		await press(el, 'hours', 'End');
		expect(el.value).toBe('23:30');
	});

	it('blijft binnen de kolom aan de randen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="00:00"></nldd-time-picker>');
		await waitForUpdate(el);
		await press(el, 'hours', 'ArrowUp');
		expect(el.value).toBe('00:00');
	});

	it('wisselt in het wiel tussen de twee spinbuttons', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const uur = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.time-picker__value')][0];
		uur.dispatchEvent(new KeyboardEvent('keydown', {
			key: 'ArrowRight', bubbles: true, composed: true, cancelable: true,
		}));
		await waitForUpdate(el);
		expect(el.shadowRoot!.activeElement?.getAttribute('aria-label')).toBe('Minuut');
	});

	it('verspringt in de minutenkolom met de stap', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:00" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		await press(el, 'minutes', 'ArrowDown');
		expect(el.value).toBe('09:15');
	});
});


/* ============================================================
   Accessibility
   ============================================================ */

describe('nldd-time-picker – toegankelijkheid', () => {
	let el: NLDDTimePicker;

	afterEach(() => { if (el) cleanup(el); });

	it('geeft de twee spinbuttons elk een eigen naam', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker></nldd-time-picker>');
		await waitForUpdate(el);
		expect(selection(el, 'hours').getAttribute('aria-label')).toBe('Uur');
		expect(selection(el, 'minutes').getAttribute('aria-label')).toBe('Minuut');
	});

	it('valt terug op een Nederlandse naam voor het geheel', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker></nldd-time-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Tijd kiezen');
	});

	// One tab stop per column: otherwise Tab walks you through 24 hours before you
	// reach the minutes.
});


/* ============================================================
   Wheel
   ============================================================ */

describe('nldd-time-picker – wiel', () => {
	let el: NLDDTimePicker;

	afterEach(() => { if (el) cleanup(el); });

	// What you operate in the wheel is the selection, not the list behind it, and a
	// wheel is a spinbutton. The columns are scenery then: aria-hidden and not
	// focusable, so the values are not read out twice and focus no longer
	// disturbs the scroll position.
	it('legt de betekenis in de selectie en verbergt de kolommen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		expect(column(el, 'hours').getAttribute('aria-hidden')).toBe('true');
		expect(column(el, 'hours').getAttribute('role')).toBe('presentation');
		const focusbaar = [...column(el, 'hours').querySelectorAll('[tabindex="0"]')];
		expect(focusbaar).toHaveLength(0);
	});

	it('geeft uur en minuut elk een eigen spinbutton', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		const uur = selection(el, 'hours');
		expect(uur.getAttribute('role')).toBe('spinbutton');
		expect(uur.getAttribute('aria-label')).toBe('Uur');
		expect(uur.getAttribute('tabindex')).toBe('0');
		expect(uur.getAttribute('aria-valuenow')).toBe('9');
		expect(uur.getAttribute('aria-valuetext')).toBe('09');
		const minuut = selection(el, 'minutes');
		expect(minuut.getAttribute('aria-valuemin')).toBe('0');
		expect(minuut.getAttribute('aria-valuemax')).toBe('45');
	});

	it('verzet de waarde met de pijltjes op de selectie', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30" step="15"></nldd-time-picker>');
		await waitForUpdate(el);
		selection(el, 'minutes').dispatchEvent(new KeyboardEvent('keydown', {
			key: 'ArrowDown', bubbles: true, composed: true, cancelable: true,
		}));
		await waitForUpdate(el);
		expect(el.value).toBe('09:45');
	});

	// Both control sizes on the same value: the component takes the small one
	// under (pointer: fine) and the large one outside it, and which of the two the
	// test runner reports does not matter for this measurement.
	it('past de hoogte aan op het aantal rijen', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" rows="5" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		expect(column(el, 'hours').clientHeight).toBe(5 * 44);
	});

	// Even is allowed: the chosen value sits in the middle, so half a row then
	// runs off the top and bottom instead of showing whole rows.
	it('accepteert ook een even aantal rijen', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" rows="6" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		expect(column(el, 'hours').clientHeight).toBe(6 * 44);
		const kolom = column(el, 'hours');
		const gekozen = kolom.querySelector<HTMLElement>('[data-selected]')!;
		// The chosen value still sits exactly in the middle.
		expect(gekozen.offsetTop + gekozen.offsetHeight / 2 - kolom.scrollTop)
			.toBe(kolom.clientHeight / 2);
	});

	it('houdt minimaal drie rijen aan', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" rows="1" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		expect(column(el, 'hours').clientHeight).toBe(3 * 44);
	});

	// Safari does not count the bottom padding of a scroll container towards the
	// scrollable overflow. With padding-block, a short column lost exactly all of
	// its overflow (132px above plus 176px of values is exactly the column height)
	// and there was nothing left to scroll.
	it('houdt ook een korte kolom scrollbaar', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" step="15" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		const minuten = column(el, 'minutes');
		expect(minuten.querySelectorAll('.time-picker__list-item')).toHaveLength(4);
		expect(minuten.scrollHeight).toBeGreaterThan(minuten.clientHeight);
	});

	// The selection lies over the middle of both columns. If it catches the mouse, a
	// swipe right there does not scroll the column beneath it, and that is exactly
	// where you put the mouse down.
	it('laat de muis door de selectie heen naar de kolom eronder', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const selectionEl = el.shadowRoot!.querySelector('.time-picker__selection')!;
		expect(getComputedStyle(selectionEl).pointerEvents).toBe('none');
		for (const waarde of el.shadowRoot!.querySelectorAll('.time-picker__value')) {
			expect(getComputedStyle(waarde).pointerEvents).toBe('none');
		}
	});

	// The selection already says which value applies, and so does the field around it.
	// A second marker in the column adds nothing and competes with it as soon as
	// you scroll away.
	it('markeert de gekozen waarde niet in de kolom', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const gekozen = column(el, 'hours').querySelector('[data-selected]')!;
		const gewoon = column(el, 'hours').querySelectorAll('.time-picker__list-item')[3];
		const stijl = (el: Element) => {
			const s = getComputedStyle(el);
			return { kleur: s.color, vlak: s.backgroundColor };
		};
		expect(stijl(gekozen)).toEqual(stijl(gewoon));
	});

	it('kiest de waarde die in het midden tot stilstand komt', async () => {
		// variables.css is not loaded here, so without this token the column would
		// have no fixed height and would not scroll at all.
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		// On render the picker scrolls to the chosen value itself and ignores scroll
		// events while that movement runs. Wait until that guard is gone, otherwise
		// this scroll is taken for its own.
		await new Promise((r) => setTimeout(r, 250));
		const kolom = column(el, 'hours');
		const optie = [...kolom.querySelectorAll<HTMLElement>('.time-picker__list-item')][14];
		// From the measured positions, not from an assumed formula: this is exactly
		// the sum the component inverts to work out what sits in the middle.
		kolom.scrollTop = optie.offsetTop + optie.offsetHeight / 2 - kolom.clientHeight / 2;
		kolom.dispatchEvent(new Event('scroll'));
		await new Promise((r) => setTimeout(r, 250));
		expect(el.value).toBe('14:30');
	});

	// The selection has to follow every movement, not the recorded value: otherwise the
	// number stays put while the column slides beneath it, and it lies about where
	// you are.
	it('toont tijdens het scrollen wat er in het midden ligt, voordat het vastligt', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		await new Promise((r) => setTimeout(r, 250));
		const kolom = column(el, 'hours');
		const optie = [...kolom.querySelectorAll<HTMLElement>('.time-picker__list-item')][14];
		kolom.scrollTop = optie.offsetTop + optie.offsetHeight / 2 - kolom.clientHeight / 2;
		kolom.dispatchEvent(new Event('scroll'));
		await waitForUpdate(el);
		const inSelection = () => el.shadowRoot!.querySelector('.time-picker__selection')!
			.textContent!.replace(/\s+/g, '');
		expect(inSelection()).toBe('14:30');
		expect(el.value).toBe('09:30');
		await new Promise((r) => setTimeout(r, 250));
		expect(el.value).toBe('14:30');
	});

	// Without this guard, scrolling the chosen value into view would pick
	// something else along the way.
	it('kiest niets tijdens het eigen scrollen naar de gekozen waarde', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		el.scrollSelectedIntoView();
		const kolom = column(el, 'hours');
		kolom.scrollTop = 0;
		kolom.dispatchEvent(new Event('scroll'));
		await new Promise((r) => setTimeout(r, 250));
		expect(el.value).toBe('09:30');
	});
	// The host forwards nowhere, so an overlay focusing the picker would leave the
	// arrow keys dead until the user tabbed into the selection themselves.
	it('focust het uur wanneer de picker zelf focus krijgt', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		el.focus();
		expect(el.shadowRoot!.activeElement).toBe(selection(el, 'hours'));
	});

	// A focusable element inside an aria-hidden subtree is not allowed: clicking
	// one moves focus into a part the screen reader cannot see.
	it('heeft geen focusbare elementen in de verborgen kolommen', async () => {
		el = await fixture<NLDDTimePicker>('<nldd-time-picker value="09:30"></nldd-time-picker>');
		await waitForUpdate(el);
		const kolom = column(el, 'hours');
		expect(kolom.querySelectorAll('button, [tabindex], a, input').length).toBe(0);
		kolom.querySelector<HTMLElement>('.time-picker__list-item')!.click();
		expect(el.shadowRoot!.activeElement).toBeNull();
	});

	// A settle timer that outlives the element still runs _select on it, which
	// dispatches input and change from something no longer in the document.
	it('legt niets meer vast als de picker tijdens het scrollen verdwijnt', async () => {
		el = await fixture<NLDDTimePicker>(
			'<nldd-time-picker value="09:30" style="--semantics-controls-md-min-size: 44px; --semantics-controls-sm-min-size: 44px"></nldd-time-picker>',
		);
		await waitForUpdate(el);
		await new Promise((r) => setTimeout(r, 250));
		const events: string[] = [];
		el.addEventListener('input', () => events.push('input'));
		el.addEventListener('change', () => events.push('change'));
		const kolom = column(el, 'hours');
		const optie = [...kolom.querySelectorAll<HTMLElement>('.time-picker__list-item')][14];
		kolom.scrollTop = optie.offsetTop + optie.offsetHeight / 2 - kolom.clientHeight / 2;
		kolom.dispatchEvent(new Event('scroll'));
		el.remove();
		await new Promise((r) => setTimeout(r, 250));
		expect(events).toEqual([]);
		expect(el.value).toBe('09:30');
	});
});
