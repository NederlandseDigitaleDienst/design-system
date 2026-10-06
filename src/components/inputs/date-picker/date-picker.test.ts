import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './date-picker.js';
import { datePickerStyles } from './date-picker.styles.js';
import type { NLDDDatePicker } from './date-picker.js';

function days(el: NLDDDatePicker): HTMLButtonElement[] {
	return Array.from(el.shadowRoot!.querySelectorAll('.date-picker__day'));
}

/** Keyed on the full date: with neighboring months shown, day numbers repeat. */
function dayFor(el: NLDDDatePicker, iso: string): HTMLButtonElement {
	return el.shadowRoot!.querySelector(`.date-picker__day[data-date="${iso}"]`)!;
}

function focusedIso(el: NLDDDatePicker): string {
	return el._focused;
}

function title(el: NLDDDatePicker): string {
	return el.shadowRoot!.querySelector('.date-picker__title')!.textContent!.replace(/\s+/g, ' ').trim();
}

function announcement(el: NLDDDatePicker): string {
	return el.shadowRoot!.querySelector('.date-picker__announcer')!.textContent!.trim();
}

/** Keyboard events are handled on the grid, so they bubble up from the focused day. */
async function press(el: NLDDDatePicker, key: string, shiftKey = false): Promise<void> {
	const target = el.shadowRoot!.querySelector('.date-picker__day[tabindex="0"]')!;
	target.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, composed: true }));
	await waitForUpdate(el);
}

function todayIso(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Fixtures without a chosen date open on the current month, while the tests click
// days in July 2026. `max="2026-07-31"` clamps that opening view to July (see
// _initialFocus) so they do not break once the calendar moves on. Tests that click
// today on purpose keep no bound.
describe('nldd-date-picker', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});


	// # Grid

	it('zet de eerste dag van de maand op de juiste weekdag', async () => {
		// 1 July 2026 is a Wednesday, so with Monday first, June fills the two cells
		// before it.
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const cells = Array.from(el.shadowRoot!.querySelectorAll('tbody tr')[0].querySelectorAll('td'));
		const dateOf = (i: number) => cells[i].querySelector('button')!.getAttribute('data-date');
		expect(dateOf(0)).toBe('2026-06-29');
		expect(dateOf(1)).toBe('2026-06-30');
		expect(dateOf(2)).toBe('2026-07-01');
	});

	it('rendert elke dag van de maand precies één keer', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const july = days(el).filter((d) => d.getAttribute('data-date')!.startsWith('2026-07-'));
		expect(july).toHaveLength(31);
		expect(new Set(july.map((d) => d.getAttribute('data-date'))).size).toBe(31);
	});

	// Fixed height: otherwise the calendar jumps while paging, and in a popover
	// that shifts everything below it along.
	it('toont altijd zes weken', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-02-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('tbody tr')).toHaveLength(6);
		expect(days(el)).toHaveLength(42);
	});


	// # Days outside the month

	it('markeert dagen buiten de getoonde maand', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(dayFor(el, '2026-06-30').classList.contains('is-outside-month')).toBe(true);
		expect(dayFor(el, '2026-07-01').classList.contains('is-outside-month')).toBe(false);
	});

	// The label always names the month, so the 1st of the next month cannot be
	// confused with this month's.
	it('noemt de maand in het label van een dag buiten de maand', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(dayFor(el, '2026-08-01').getAttribute('aria-label')).toContain('1 augustus 2026');
	});

	it('kiest een dag buiten de maand en springt naar die maand', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-08-01').click();
		await waitForUpdate(el);
		expect(el.value).toBe('2026-08-01');
		expect(title(el)).toBe('Augustus 2026');
	});


	// # Week numbers

	it('toont geen weeknummers zonder het attribuut', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.date-picker__week-cell')).toBeNull();
	});

	it('toont ISO-weeknummers met week-numbers', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-07-15" week-numbers></nldd-date-picker>',
		);
		await waitForUpdate(el);
		const numbers = Array.from(el.shadowRoot!.querySelectorAll('.date-picker__week-cell'));
		expect(numbers).toHaveLength(6);
		// The week holding 1 July 2026 (a Wednesday) is ISO week 27.
		expect(numbers[0].textContent!.trim()).toBe('27');
		expect(numbers[0].getAttribute('aria-label')).toBe('Week 27');
		expect(numbers[0].getAttribute('scope')).toBe('row');
	});

	// ISO weeks hang off the Thursday, so the number must not shift when the row
	// starts on Sunday.
	it('houdt het weeknummer gelijk bij een andere eerste weekdag', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-07-15" week-numbers first-day-of-week="0"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		const numbers = Array.from(el.shadowRoot!.querySelectorAll('.date-picker__week-cell'));
		expect(numbers[0].textContent!.trim()).toBe('27');
	});

	it('verschuift de kolommen met first-day-of-week', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-07-15" first-day-of-week="0"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		const headers = Array.from(el.shadowRoot!.querySelectorAll('.date-picker__weekday-header-cell'));
		expect(headers[0].textContent!.trim()).toBe('zo');
		// With Sunday first, Wednesday moves along one place, so three empty cells.
		const cells = Array.from(el.shadowRoot!.querySelectorAll('tbody tr')[0].querySelectorAll('td'));
		expect(cells[3].querySelector('button')!.textContent!.trim()).toBe('1');
	});

	it('toont de volledige weekdag als abbr, want "ma" alleen zegt niets', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		await waitForUpdate(el);
		const first = el.shadowRoot!.querySelector('.date-picker__weekday-header-cell')!;
		expect(first.getAttribute('abbr')).toBe('maandag');
		expect(first.getAttribute('scope')).toBe('col');
	});

	it('is een grid met een gekoppelde maandtitel die wijzigingen aankondigt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const grid = el.shadowRoot!.querySelector('.date-picker__calendar')!;
		const heading = el.shadowRoot!.querySelector('.date-picker__title')!;
		expect(grid.getAttribute('role')).toBe('grid');
		expect(grid.getAttribute('aria-labelledby')).toBe(heading.id);
		expect(heading.getAttribute('aria-live')).toBe('polite');
		expect(title(el)).toBe('Juli 2026');
	});

	// aria-labelledby beats aria-label in the accessible name computation, so with
	// both set the documented accessible-label never reached the screen reader.
	it('laat accessible-label de grid benoemen in plaats van de maandtitel', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker accessible-label="Geboortedatum"></nldd-date-picker>');
		await waitForUpdate(el);
		const grid = el.shadowRoot!.querySelector('.date-picker__calendar')!;
		expect(grid.getAttribute('aria-label')).toBe('Geboortedatum');
		expect(grid.getAttribute('aria-labelledby')).toBeNull();
	});


	// # Keyboard

	it('houdt precies één dag in de tab-volgorde', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(days(el).filter((d) => d.getAttribute('tabindex') === '0')).toHaveLength(1);
	});

	it.each([
		['ArrowLeft', false, '2026-07-14'],
		['ArrowRight', false, '2026-07-16'],
		['ArrowUp', false, '2026-07-08'],
		['ArrowDown', false, '2026-07-22'],
		['Home', false, '2026-07-13'],
		['End', false, '2026-07-19'],
		['PageUp', false, '2026-06-15'],
		['PageDown', false, '2026-08-15'],
		['PageUp', true, '2025-07-15'],
		['PageDown', true, '2027-07-15'],
	])('verplaatst de focus met %s (shift: %s)', async (key, shift, expected) => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		await press(el, key, shift);
		expect(focusedIso(el)).toBe(expected);
	});

	it('neemt de maand mee wanneer de focus over de maandgrens gaat', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		await press(el, 'ArrowRight');
		expect(focusedIso(el)).toBe('2026-08-01');
		expect(title(el)).toBe('Augustus 2026');
	});

	it.each([['Enter'], [' ']])('kiest de datum met %s', async (key) => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		await press(el, 'ArrowRight');
		await press(el, key);
		expect(el.value).toBe('2026-07-16');
	});


	// # Bounds

	it('markeert datums buiten min en max als niet beschikbaar', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-07-15" min="2026-07-10" max="2026-07-20"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-09').getAttribute('aria-disabled')).toBe('true');
		expect(dayFor(el, '2026-07-10').getAttribute('aria-disabled')).toBeNull();
		expect(dayFor(el, '2026-07-21').getAttribute('aria-disabled')).toBe('true');
	});

	it('accepteert today met een verschuiving als grens', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker max="today"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el._max).toBe(todayIso());
	});

	it('kiest een datum buiten de grenzen niet', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-07-15" min="2026-07-10"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		dayFor(el, '2026-07-05').click();
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-15');
	});

	it('markeert losse datums via is-date-unavailable en weigert ze', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-16';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-16').getAttribute('aria-disabled')).toBe('true');
		dayFor(el, '2026-07-16').click();
		await waitForUpdate(el);
		expect(el.value).toBe('2026-07-15');
	});

	// Stays focusable, or the arrow key silently skips a blocked day.
	it('houdt een niet-beschikbare dag bereikbaar met het toetsenbord', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-16';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-16').hasAttribute('disabled')).toBe(false);
		await press(el, 'ArrowRight');
		expect(focusedIso(el)).toBe('2026-07-16');
	});


	// # Today

	it('markeert vandaag met aria-current', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		await waitForUpdate(el);
		const current = days(el).filter((d) => d.getAttribute('aria-current') === 'date');
		expect(current).toHaveLength(1);
		expect(current[0].textContent!.trim()).toBe(String(Number(todayIso().slice(8, 10))));
	});


	// # Range

	it('kiest een periode in twee stappen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-01"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('');

		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	// The second pick may also come before the first, and the announcement has to
	// say so, or it sends a screen reader user in one direction only.
	it('kondigt de tussenstap aan zonder een richting voor te schrijven', async () => {
		// No upper bound: this test clicks today and is date-independent by
		// itself.
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, todayIso()).click();
		await waitForUpdate(el);
		expect(announcement(el)).toContain('Kies nu een tweede datum');
		expect(announcement(el)).toMatch(/eerder of later/);
		expect(announcement(el)).not.toMatch(/einddatum|begindatum/i);
	});

	it('kondigt de volledige periode aan', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.start = '2026-07-01';
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(announcement(el)).toContain('tot en met');
	});

	// The preview under the mouse already draws the range backwards, so starting
	// over here would be the one behavior that contradicts the calendar.
	it('maakt de periode af wanneer de tweede datum vóór de eerste ligt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	// Starting over stays possible: the click after a finished range starts one.
	it('begint een nieuwe periode na een afgeronde periode', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-20';
		await waitForUpdate(el);
		dayFor(el, '2026-07-05').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-05');
		expect(el.end).toBe('');
	});

	it('markeert de dagen tussen begin en eind', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-14';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-12').classList.contains('is-in-range')).toBe(true);
		expect(dayFor(el, '2026-07-10').classList.contains('is-in-range')).toBe(false);
		expect(dayFor(el, '2026-07-15').classList.contains('is-in-range')).toBe(false);
	});

	// The fill marks the end point. The band only connects the days in between, so
	// there should be no blue to the left of the start date.
	it('laat de band bij begin en eind halverwege de dag beginnen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-14';
		await waitForUpdate(el);
		expect(el._bandFor('2026-07-10')).toBe('start');
		expect(el._bandFor('2026-07-12')).toBe('full');
		expect(el._bandFor('2026-07-14')).toBe('end');
		expect(el._bandFor('2026-07-15')).toBe('none');
	});

	// The start and end day carry a class of their own, so the styling makes half a
	// capsule of them (round on the outside, square towards the band).
	it('markeert begin- en einddag als endpoint', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-14';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-10').classList.contains('is-range-start')).toBe(true);
		expect(dayFor(el, '2026-07-14').classList.contains('is-range-end')).toBe(true);
		expect(dayFor(el, '2026-07-12').classList.contains('is-range-start')).toBe(false);
		expect(dayFor(el, '2026-07-12').classList.contains('is-range-end')).toBe(false);
	});

	it('tekent geen band voor een periode van één dag', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-10';
		await waitForUpdate(el);
		expect(el._bandFor('2026-07-10')).toBe('none');
	});

	// The same derivation as a recorded range, so the preview under the mouse does
	// not run differently from what you get.
	it('tekent de band ook voor het voorbeeld onder de muis', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		el._handleDayHover('2026-07-14');
		await waitForUpdate(el);
		expect(el._bandFor('2026-07-10')).toBe('start');
		expect(el._bandFor('2026-07-12')).toBe('full');
		expect(el._bandFor('2026-07-14')).toBe('end');
	});

	// # Dragging

	/** Drag from one day to another. The component reads the day under the mouse. */
	async function drag(picker: NLDDDatePicker, from: string, to: string): Promise<void> {
		const rect = (iso: string) => dayFor(picker, iso).getBoundingClientRect();
		const at = (iso: string) => {
			const r = rect(iso);
			return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
		};
		dayFor(picker, from).dispatchEvent(new PointerEvent('pointerdown', {
			...at(from), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		picker.shadowRoot!.querySelector('.date-picker__calendar')!.dispatchEvent(new PointerEvent('pointermove', {
			...at(to), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(picker);
		document.dispatchEvent(new PointerEvent('pointerup', {
			...at(to), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(picker);
	}

	it('kiest een periode door te slepen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.start = '2026-07-01';
		await waitForUpdate(el);
		await drag(el, '2026-07-10', '2026-07-20');
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	// The gesture states the direction, so this calls for a reversed range and not
	// a restart.
	it('keert de periode om bij achteruit slepen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.start = '2026-07-01';
		await waitForUpdate(el);
		await drag(el, '2026-07-20', '2026-07-10');
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	/** Clicking the way the browser does it: a pointerdown always comes first. */
	async function clickDay(picker: NLDDDatePicker, iso: string): Promise<void> {
		const day = dayFor(picker, iso);
		const r = day.getBoundingClientRect();
		const at = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
		day.dispatchEvent(new PointerEvent('pointerdown', {
			...at, pointerType: 'mouse', bubbles: true, composed: true,
		}));
		document.dispatchEvent(new PointerEvent('pointerup', {
			...at, pointerType: 'mouse', bubbles: true, composed: true,
		}));
		day.click();
		await waitForUpdate(picker);
	}

	// The click after a drag lands on the grid and not on a day, so the suppression
	// has to lapse on the next pointerdown. Otherwise it eats the next real click
	// and you have to click twice.
	it('begint direct een nieuwe periode na een sleep', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		await drag(el, '2026-07-10', '2026-07-20');
		await clickDay(el, '2026-07-05');
		expect(el.start).toBe('2026-07-05');
		expect(el.end).toBe('');
	});

	// Without the marker the band runs to a day that shows nothing itself.
	it('accentueert de einddatum al tijdens het slepen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		const from = dayFor(el, '2026-07-10').getBoundingClientRect();
		const to = dayFor(el, '2026-07-14').getBoundingClientRect();
		dayFor(el, '2026-07-10').dispatchEvent(new PointerEvent('pointerdown', {
			clientX: from.left + from.width / 2, clientY: from.top + from.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		el.shadowRoot!.querySelector('.date-picker__calendar')!.dispatchEvent(new PointerEvent('pointermove', {
			clientX: to.left + to.width / 2, clientY: to.top + to.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el._isSelected('2026-07-10')).toBe(true);
		expect(el._isSelected('2026-07-14')).toBe(true);
		expect(dayFor(el, '2026-07-14').classList.contains('is-selected')).toBe(true);
	});

	it('toont de band al tijdens het slepen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		const from = dayFor(el, '2026-07-10').getBoundingClientRect();
		const to = dayFor(el, '2026-07-14').getBoundingClientRect();
		dayFor(el, '2026-07-10').dispatchEvent(new PointerEvent('pointerdown', {
			clientX: from.left + from.width / 2, clientY: from.top + from.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		el.shadowRoot!.querySelector('.date-picker__calendar')!.dispatchEvent(new PointerEvent('pointermove', {
			clientX: to.left + to.width / 2, clientY: to.top + to.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el._bandFor('2026-07-12')).toBe('full');
	});

	// Without suppression the click on release starts a new range right away.
	it('start geen nieuwe periode met de klik na het slepen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		await drag(el, '2026-07-10', '2026-07-20');
		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	// A plain click must not count as a drag, or clicking twice stops working.
	it('laat klikken zonder bewegen gewoon door de klik-route lopen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		const day = dayFor(el, '2026-07-10');
		const r = day.getBoundingClientRect();
		day.dispatchEvent(new PointerEvent('pointerdown', {
			clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		document.dispatchEvent(new PointerEvent('pointerup', {
			clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
			pointerType: 'mouse', bubbles: true, composed: true,
		}));
		day.click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('');
	});

	// On touch a horizontal swipe cannot be told apart from scrolling.
	it('sleept niet op touch', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		const day = dayFor(el, '2026-07-10');
		const r = day.getBoundingClientRect();
		day.dispatchEvent(new PointerEvent('pointerdown', {
			clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
			pointerType: 'touch', bubbles: true, composed: true,
		}));
		const to = dayFor(el, '2026-07-20').getBoundingClientRect();
		el.shadowRoot!.querySelector('.date-picker__calendar')!.dispatchEvent(new PointerEvent('pointermove', {
			clientX: to.left + to.width / 2, clientY: to.top + to.height / 2,
			pointerType: 'touch', bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el.start).toBe('');
	});


	it('vuurt change pas wanneer de periode compleet is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-01"></nldd-date-picker>');
		await waitForUpdate(el);
		const changes: unknown[] = [];
		el.addEventListener('change', (e) => changes.push((e as CustomEvent).detail));

		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		expect(changes).toHaveLength(0);

		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(changes).toEqual([{ start: '2026-07-10', end: '2026-07-20' }]);
	});


	// # Cell descriptions

	it('geeft elke dag een volledige datum als label', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-15').getAttribute('aria-label')).toContain('woensdag 15 juli 2026');
	});

	it('vermeldt in het label dat een dag niet beschikbaar is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-16';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-16').getAttribute('aria-label')).toContain('niet beschikbaar');
	});

	it('vermeldt in het label dat een dag in de periode valt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10"></nldd-date-picker>');
		el.end = '2026-07-14';
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-12').getAttribute('aria-label')).toContain('in de periode');
		expect(dayFor(el, '2026-07-10').getAttribute('aria-label')).toContain('begin van de periode');
		expect(dayFor(el, '2026-07-14').getAttribute('aria-label')).toContain('einde van de periode');
	});


	// # Today button

	it('navigeert met Vandaag terug naar de huidige maand', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2020-01-15"></nldd-date-picker>');
		await waitForUpdate(el);
		el._handleToday();
		await waitForUpdate(el);
		expect(el._view).toBe(`${todayIso().slice(0, 7)}-01`);
		expect(el._focused).toBe(todayIso());
	});

	// Navigating is not choosing: someone looking around wants to get back, not to gain a date.
	it('kiest niets met Vandaag', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2020-01-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const changes: unknown[] = [];
		el.addEventListener('change', (e) => changes.push((e as CustomEvent).detail));
		el._handleToday();
		await waitForUpdate(el);
		expect(el.value).toBe('2020-01-15');
		expect(changes).toHaveLength(0);
	});

	// Outside the bounds the button would lie: clamping to the nearest allowed date
	// makes "Vandaag" jump back eighteen years.
	it('verbergt Vandaag wanneer vandaag buiten de grenzen valt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker max="today-18y"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el._todayReachable).toBe(false);
		const labels = Array.from(el.shadowRoot!.querySelectorAll('nldd-button'))
			.map((b) => b.getAttribute('text'));
		expect(labels).not.toContain('Vandaag');
	});

	it('toont Vandaag wanneer vandaag binnen de grenzen valt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker min="today-1y" max="today+1y"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el._todayReachable).toBe(true);
		const labels = Array.from(el.shadowRoot!.querySelectorAll('nldd-button'))
			.map((b) => b.getAttribute('text'));
		expect(labels).toContain('Vandaag');
	});


	// # Paging and focus

	// Paging twice is pressing the same button twice, so focus belongs on the
	// arrow. Only the roving tabindex moves along, so tabbing into the grid lands
	// on the equivalent day. PageUp/PageDown from the grid runs through _moveFocus
	// and does move focus.
	it('houdt de focus op de pijl bij het bladeren', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const arrow = el.shadowRoot!.querySelector('nldd-icon-button[icon="chevron-right"]')!;
		const inner = arrow.shadowRoot!.querySelector('button')!;
		inner.focus();
		inner.click();
		await waitForUpdate(el);

		expect(arrow.shadowRoot!.activeElement).toBe(inner);
		expect(title(el)).toBe('Augustus 2026');
		// The roving tabindex moved along to the equivalent day.
		expect(el.shadowRoot!.querySelector('[data-date="2026-08-15"]')!.getAttribute('tabindex')).toBe('0');
	});

	it('houdt de focus op Vandaag bij het terugspringen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2020-01-15"></nldd-date-picker>');
		await waitForUpdate(el);
		el._stacked = true;
		await waitForUpdate(el);
		const today = el.shadowRoot!.querySelector('.date-picker__footer nldd-button')!;
		const inner = today.shadowRoot!.querySelector('button')!;
		inner.focus();
		inner.click();
		await waitForUpdate(el);

		expect(today.shadowRoot!.activeElement).toBe(inner);
		expect(el._view).toBe(todayIso().slice(0, 8) + '01');
	});

	// # Year menu

	// The title promised month and year and opened years only. Each part is its own
	// button with its own menu now, and there is no dead text between them.
	it('maakt maand en jaar allebei een knop met een eigen menu', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const buttons = el.shadowRoot!.querySelectorAll('.date-picker__title-month-button, .date-picker__title-year-button');
		expect(buttons.length).toBe(2);
		for (const button of buttons) {
			expect(button.getAttribute('aria-haspopup')).toBe('menu');
			expect(button.getAttribute('aria-expanded')).toBe('false');
		}
		// Everything in the heading sits in one of the two buttons.
		const heading = el.shadowRoot!.querySelector('.date-picker__title')!;
		const buiten = [...heading.childNodes].filter(
			(node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim(),
		);
		expect(buiten).toEqual([]);
	});

	// A menu that opens to confirm what you already see is worse than no menu, and
	// the chevron then promises a choice that is not there.
	it('laat de chevron en het menu weg als er maar één maand bereikbaar is', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-08-12" min="2026-08-01" max="2026-08-31"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		expect(el._months).toEqual([8]);
		expect(el.shadowRoot!.querySelector('.date-picker__title-month-button')).toBeNull();
		expect(el.shadowRoot!.querySelector('.date-picker__month-menu')).toBeNull();
		expect(el.shadowRoot!.querySelector('.date-picker__title-year-button')).toBeNull();
		expect(el.shadowRoot!.querySelector('.date-picker__year-menu')).toBeNull();
		expect(title(el)).toBe('Augustus 2026');
	});

	// Offering twelve months while a bound quietly clamps eleven of them back to
	// the month you were already on.
	it('begrenst de maandlijst met min en max', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-08-12" min="2026-05-01" max="2026-10-31"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		expect(el._months).toEqual([5, 6, 7, 8, 9, 10]);
		expect(el.shadowRoot!.querySelectorAll('.date-picker__month-menu nldd-menu-item').length).toBe(6);
	});

	// Outside the bound's own year that bound does not count: with max in 2026,
	// December 2025 is simply allowed.
	it('begrenst de maandlijst alleen in het jaar waar de grens ligt', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2025-12-01" min="2025-01-01" max="2026-03-31"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		expect(el._months.length).toBe(12);
	});

	// The arrows do not clamp the view, only the focus, so you can page past a
	// bound. That month should not turn up in the menu anyway.
	it('biedt geen maanden aan buiten de grens, ook niet als je erheen bladert', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-08-12" min="2026-08-01" max="2026-11-30"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		el._shiftView(-2);
		await waitForUpdate(el);

		expect(el._view.slice(0, 7)).toBe('2026-06');
		expect(el._months).toEqual([8, 9, 10, 11]);
		const items = el.shadowRoot!.querySelectorAll('.date-picker__month-menu nldd-menu-item');
		expect([...items].map((item) => item.getAttribute('text'))).toEqual([
			'Augustus', 'September', 'Oktober', 'November',
		]);
		// Nothing is on: you are looking at a month this calendar does not accept.
		expect(el.shadowRoot!.querySelector('.date-picker__month-menu nldd-menu-item[selected]')).toBeNull();
	});

	// A whole year past the bound, not one month of the year on screen is
	// selectable. Comparing months alone then fell back to all twelve, with a check
	// mark on a month the calendar would quietly clamp back.
	it('biedt geen maandmenu buiten het jaar van de grens', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2026-08-12" min="2026-08-01" max="2026-11-30"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		el._shiftView(-14);
		await waitForUpdate(el);

		expect(el._view.slice(0, 7)).toBe('2025-06');
		expect(el._months).toEqual([]);
		expect(el.shadowRoot!.querySelector('.date-picker__month-menu')).toBeNull();
		expect(el.shadowRoot!.querySelector('.date-picker__title-month-button')).toBeNull();
		// The heading stays readable as plain text.
		expect(title(el)).toBe('Juni 2025');
	});

	// Without a bound the window is chosen arbitrarily, so that one does stretch.
	it('rekt het standaard jaarvenster op naar het jaar waar je heen bladert', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-08-12"></nldd-date-picker>');
		await waitForUpdate(el);
		el._shiftView(-12 * 130);
		await waitForUpdate(el);

		expect(el._years).toContain(el._viewYear);
	});

	it('kiest een maand uit het maandmenu', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const items = el.shadowRoot!.querySelectorAll('.date-picker__month-menu nldd-menu-item');
		expect(items.length).toBe(12);
		expect(items[6].hasAttribute('selected')).toBe(true);

		(items[10] as HTMLElement).click();
		await waitForUpdate(el);
		expect(title(el)).toBe('November 2026');
		// The year and the day stay put, only the month moves.
		expect(focusedIso(el)).toBe('2026-11-15');
	});

	// 31 March into February does not exist, so the day drops to the last one that
	// does, the same as a leap year through the year menu.
	it('klemt de dag als de gekozen maand korter is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-03-31"></nldd-date-picker>');
		await waitForUpdate(el);
		const items = el.shadowRoot!.querySelectorAll('.date-picker__month-menu nldd-menu-item');

		(items[1] as HTMLElement).click();
		await waitForUpdate(el);
		expect(focusedIso(el)).toBe('2026-02-28');
	});

	// Without this you start on the first year in the list and walk a century back
	// with the arrow keys to the year you were already looking at.
	it('opent het jaarmenu op het jaar dat in beeld staat', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		(el.shadowRoot!.querySelector('.date-picker__title-year-button') as HTMLButtonElement).click();

		// The menu only focuses itself after its own opening sequence, so wait for
		// that to settle instead of guessing one fixed delay.
		let active: Element | null = null;
		for (let i = 0; i < 40; i += 1) {
			await new Promise((resolve) => setTimeout(resolve, 25));
			active = el.shadowRoot!.activeElement;
			if (active?.getAttribute('text') === '2026') break;
		}
		expect(active?.tagName).toBe('NLDD-MENU-ITEM');
		expect(active?.getAttribute('text')).toBe('2026');
	});

	it('begrenst de jaarlijst met min en max', async () => {
		el = await fixture<NLDDDatePicker>(
			'<nldd-date-picker value="2005-07-15" min="2000-01-01" max="2010-12-31"></nldd-date-picker>',
		);
		await waitForUpdate(el);
		expect(el._years[0]).toBe(2000);
		expect(el._years[el._years.length - 1]).toBe(2010);
	});

	// Otherwise the menu shows no selection at all once you page past the edge.
	it('houdt het getoonde jaar altijd in de lijst', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="1850-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el._years).toContain(1850);
	});

	it('springt met een jaar naar die maand zonder iets te kiezen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		el._handleYearSelect(2001);
		await waitForUpdate(el);
		expect(el._view).toBe('2001-07-01');
		expect(el._focused).toBe('2001-07-15');
		expect(el.value).toBe('2026-07-15');
	});

	// 29 February does not exist every year.
	it('klemt een schrikkeldag bij het wisselen van jaar', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2024-02-29"></nldd-date-picker>');
		await waitForUpdate(el);
		el._handleYearSelect(2025);
		await waitForUpdate(el);
		expect(el._focused).toBe('2025-02-28');
	});


	// # Focus

	// An overlay focusing the calendar otherwise lands on the host, which forwards
	// nowhere, and then the arrow keys do nothing until you tab in yourself.
	it('zet focus op de dag met de roving tabindex', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		el.focus();
		const active = el.shadowRoot!.activeElement;
		expect(active?.getAttribute('data-date')).toBe('2026-07-15');
		expect(active?.getAttribute('tabindex')).toBe('0');
	});

	it('zet focus op vandaag wanneer er niets gekozen is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		await waitForUpdate(el);
		el.focus();
		expect(el.shadowRoot!.activeElement?.getAttribute('data-date')).toBe(todayIso());
	});


	// # Focus ring and input modality

	// Browsers treat programmatic focus as focus-visible, and opening the calendar
	// with the mouse focuses a day, so there would be a ring without a key ever
	// being touched.
	it('onderdrukt de focusring wanneer de focus van een aanwijzer komt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));

		el.focus();
		expect(dayFor(el, '2026-07-15').classList.contains('is-pointer-focus')).toBe(true);
	});

	// The transition is what counts: without the class, "absent" would hold even
	// without the fix, so both sides live in one test.
	it('toont de focusring weer zodra het toetsenbord wordt gebruikt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const day = dayFor(el, '2026-07-15');

		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		el.focus();
		expect(day.classList.contains('is-pointer-focus')).toBe(true);

		day.blur();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		el.focus();
		expect(day.classList.contains('is-pointer-focus')).toBe(false);
	});


	// Arrow keys move focus programmatically, and the browser keeps judging the
	// session by the click that opened the calendar, so :focus-visible never
	// matches while navigating. The ring therefore hangs off :focus plus the
	// modality class.
	it('toont de ring tijdens pijltjesnavigatie na openen met de muis', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const ringSelector = '.date-picker__day:focus:not(.is-pointer-focus)';

		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		el.focus();
		expect(dayFor(el, '2026-07-15').matches(ringSelector)).toBe(false);

		await press(el, 'ArrowRight');
		expect(dayFor(el, '2026-07-16').matches(ringSelector)).toBe(true);
	});

	// The reported case: the first arrow key did move focus but showed no ring,
	// only the second did. Reproduced here with a keydown that never reaches the
	// document listener (composed: false), so the modality stays on mouse, just as
	// when that listener had not caught up yet. The calendar has to show the ring
	// on its own then, because it moves the focus itself.
	it('toont de ring al bij de eerste pijltjestoets, ook als de modaliteit nog op muis staat', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		el.focus();
		expect(dayFor(el, '2026-07-15').classList.contains('is-pointer-focus')).toBe(true);

		el.shadowRoot!.querySelector('.date-picker__day[tabindex="0"]')!
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: false }));
		await waitForUpdate(el);

		expect(dayFor(el, '2026-07-16').classList.contains('is-pointer-focus')).toBe(false);
	});

	// Paging with the mouse must not turn the ring on.
	it('houdt de ring weg wanneer een muisklik de maand verzet', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));
		el.focus();

		el._shiftView(1);
		await waitForUpdate(el);
		el.focus();
		expect(dayFor(el, '2026-08-15').classList.contains('is-pointer-focus')).toBe(true);
	});

	// Against the stylesheet text, by way of exception: variables.css is not loaded
	// in the tests, so the real ring cannot be measured (the token is empty and the
	// outline stays none). Without this check, a return to :focus-visible, the bug
	// that caused this, would slip through every test.
	it('hangt de dagring aan :focus en niet aan :focus-visible', () => {
		const css = datePickerStyles.cssText;
		expect(css).toContain('.date-picker__day:focus:not(.is-pointer-focus)');
		expect(css).not.toContain('.date-picker__day:focus-visible');
	});


	// # Stacked layout

	// "Vandaag" sits bottom left in both layouts: it is a shortcut and not paging,
	// and without that button a fully spelled-out month fits in the heading beside
	// the year and two menu buttons.
	it('houdt de paginering in de kop op een breed scherm, met Vandaag eronder', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		el._stacked = false;
		await waitForUpdate(el);
		const header = el.shadowRoot!.querySelector('.date-picker__header')!;
		expect(header.querySelector('.date-picker__pagination')).not.toBeNull();
		expect(header.querySelector('nldd-button')).toBeNull();

		const footer = el.shadowRoot!.querySelector('.date-picker__footer')!;
		expect(footer.querySelector('.date-picker__footer-start nldd-button')).not.toBeNull();
		expect(footer.querySelector('nldd-button-bar')).toBeNull();
	});

	// Below the grid and in two corners, so a thumb touching one group does not
	// cover the other.
	it('zet de paginering onder de kalender wanneer hij gestapeld is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		el._stacked = true;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.date-picker__pagination')).toBeNull();
		const footer = el.shadowRoot!.querySelector('.date-picker__footer');
		expect(footer).not.toBeNull();
		// Today on the left, the month arrows on the right in a bar of their own.
		expect(footer!.querySelector('.date-picker__footer-start nldd-button')).not.toBeNull();
		expect(footer!.querySelector('nldd-button-bar')).not.toBeNull();
	});

	// On the property, not the attribute: md is the default and reflectNonDefault
	// deliberately keeps that out of the DOM.
	it('vergroot de knoppen naar md wanneer hij gestapeld is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		el._stacked = true;
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.date-picker__footer')!;
		const bar = footer.querySelector('nldd-button-bar') as HTMLElement & { size?: string };
		const today = footer.querySelector('nldd-button') as HTMLElement & { size?: string };
		expect(bar.size).toBe('md');
		expect(today.size).toBe('md');
	});

	it('houdt de knoppen op sm in de brede indeling', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		el._stacked = false;
		await waitForUpdate(el);
		const bar = el.shadowRoot!.querySelector('.date-picker__pagination nldd-button-bar') as HTMLElement & { size?: string };
		expect(bar.size).toBe('sm');
	});

	// Otherwise Vandaag appears twice: on its own bottom left and in the bar beside it.
	it('zet Vandaag niet ook in de paginering wanneer hij gestapeld is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker></nldd-date-picker>');
		el._stacked = true;
		await waitForUpdate(el);
		const bar = el.shadowRoot!.querySelector('.date-picker__footer nldd-button-bar')!;
		expect(bar.querySelector('nldd-button')).toBeNull();
	});

	it('laat Vandaag ook gestapeld weg wanneer vandaag buiten bereik valt', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker max="today-18y"></nldd-date-picker>');
		el._stacked = true;
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.date-picker__footer')!;
		expect(footer.querySelector('nldd-button')).toBeNull();
		// The corner stays, so the arrows do not slide to the left.
		expect(footer.querySelector('.date-picker__footer-start')).not.toBeNull();
	});


	// # Day button

	// The whole cell is the touch target, the shape sits on the indicator inside it.
	it('geeft elke dag een indicator als apart element', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const day = dayFor(el, '2026-07-15');
		expect(day.querySelector('.date-picker__day-indicator')).not.toBeNull();
		expect(getComputedStyle(day).borderRadius).toBe('0px');
	});

	// The hover rule carries a pseudo-class and so outweighs a bare selected rule.
	// Without repeating it, a chosen day looks unchosen under the mouse.
	it('blijft een gekozen dag als gekozen tonen onder de muis', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		const day = dayFor(el, '2026-07-15');
		const indicator = day.querySelector('.date-picker__day-indicator')!;
		const selectedBackground = getComputedStyle(indicator).backgroundColor;

		day.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
		await waitForUpdate(el);
		expect(getComputedStyle(indicator).backgroundColor).toBe(selectedBackground);
	});
});

describe('nldd-date-picker labels tijdens het kiezen van een periode', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The first pick was called "begin van de periode", but a second pick before it
	// makes it the end instead. As long as that is still possible, the label must
	// not claim a direction.
	it('noemt de eerste keuze geen begindatum zolang de periode niet af is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-15').click();
		await waitForUpdate(el);
		const label = dayFor(el, '2026-07-15').getAttribute('aria-label') ?? '';
		expect(label).toContain('periode nog niet compleet');
		expect(label).not.toContain('begin van de periode');
	});

	it('noemt begin en einde wel zodra de periode af is', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-15').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		expect(dayFor(el, '2026-07-10').getAttribute('aria-label')).toContain('begin van de periode');
		expect(dayFor(el, '2026-07-15').getAttribute('aria-label')).toContain('einde van de periode');
	});
});

describe('nldd-date-picker maandnaam en hoofdletter', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The month name exists in two forms because it belongs differently in two
	// places: capitalized in the heading, lowercase inside a date label. Were the
	// code to do that itself (with CSS or charAt(0).toUpperCase()), a translator
	// could not turn it off, and which form belongs in which language is the
	// translator's call.
	it('haalt beide vormen uit de vertaling, zodat een consument ze los kan zetten', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		el.translations = {
			'components.date-picker.july-capitalize': 'HOOIMAAND',
			'components.date-picker.july-lowercase': 'hooimaand',
		};
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.date-picker__title')!.textContent!.trim()).toContain('HOOIMAAND');
		expect(dayFor(el, '2026-07-15').getAttribute('aria-label')).toContain('hooimaand');
	});

	it('gebruikt standaard de hoofdlettervorm in de kop en de kleine in het label', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker value="2026-07-15"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.date-picker__title')!.textContent!.trim()).toContain('Juli');
		expect(dayFor(el, '2026-07-15').getAttribute('aria-label')).toContain('juli');
	});
});

describe('nldd-date-picker aankondigingen bevatten alleen de datum', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The announcement used the full cell label, so the markers hanging off that
	// cell ended up halfway through the sentence: "vrijdag 10 juli 2026, begin van
	// de periode tot en met woensdag 15 juli 2026, einde van de periode".
	it('laat de celaanduidingen uit de periode-aankondiging', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-15').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		expect(announcement(el)).toBe('Geselecteerd: vrijdag 10 juli 2026 tot en met woensdag 15 juli 2026.');
	});

	it('laat de celaanduidingen ook uit de tussenstap', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range max="2026-07-31"></nldd-date-picker>');
		await waitForUpdate(el);
		dayFor(el, '2026-07-15').click();
		await waitForUpdate(el);
		expect(announcement(el)).not.toContain('periode nog niet compleet');
		expect(announcement(el)).toContain('woensdag 15 juli 2026');
	});
});

describe('nldd-date-picker weigert een periode over een geblokkeerde dag', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// Both endpoints can be available with a booked day sitting between them. The
	// endpoint check missed that, so change fired with a range enclosing a visibly
	// blocked date.
	it('legt geen periode vast met een niet-beschikbare dag ertussen', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-15';
		await waitForUpdate(el);
		let change = 0;
		el.addEventListener('change', () => { change += 1; });
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(el.end).toBe('');
		expect(change).toBe(0);
		expect(announcement(el)).toContain('niet beschikbaar');
	});

	it('legt een periode zonder geblokkeerde dagen wel vast', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-25';
		await waitForUpdate(el);
		dayFor(el, '2026-07-10').click();
		await waitForUpdate(el);
		dayFor(el, '2026-07-20').click();
		await waitForUpdate(el);
		expect(el.start).toBe('2026-07-10');
		expect(el.end).toBe('2026-07-20');
	});

	// The drag route (_onDocumentPointerUp) shares the same guard as the click
	// route but does not pass through _select: a drag across a blocked day in
	// between must not record either.
	it('weigert ook een gesleepte periode over een niet-beschikbare dag', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range value="" max="2026-07-31"></nldd-date-picker>');
		el.isDateUnavailable = (iso) => iso === '2026-07-15';
		await waitForUpdate(el);
		let change = 0;
		el.addEventListener('change', () => { change += 1; });
		const at = (iso: string) => {
			const r = dayFor(el, iso).getBoundingClientRect();
			return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
		};
		dayFor(el, '2026-07-10').dispatchEvent(new PointerEvent('pointerdown', {
			...at('2026-07-10'), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		el.shadowRoot!.querySelector('.date-picker__calendar')!.dispatchEvent(new PointerEvent('pointermove', {
			...at('2026-07-20'), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		document.dispatchEvent(new PointerEvent('pointerup', {
			...at('2026-07-20'), pointerType: 'mouse', bubbles: true, composed: true,
		}));
		await waitForUpdate(el);
		expect(el.end).toBe('');
		expect(change).toBe(0);
		expect(announcement(el)).toContain('niet beschikbaar');
	});
});

describe('nldd-date-picker breedte en periode-indicatoren', () => {
	let el: NLDDDatePicker;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('width="full" en een CSS-lengte sturen de hostbreedte; ongeldig valt terug', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker width="full"></nldd-date-picker>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_date-picker-width')).toBe('100%');

		el.width = '560px';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_date-picker-width')).toBe('560px');
		expect(Math.round(el.getBoundingClientRect().width)).toBe(560);

		el.width = 'kapot';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_date-picker-width')).toBe('');
	});

	// The endpoints are the same square as a single selection (as wide as it is
	// tall, in wider cells too), with square corners facing the range so the square
	// meets the band without a slight notch.
	it('eindpunten zijn vierkant en alleen aan de buitenkant afgerond', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10" end="2026-07-20" width="700px" style="--semantics-controls-md-corner-radius: 8px"></nldd-date-picker>');
		await waitForUpdate(el);
		const indicator = (iso: string) =>
			dayFor(el, iso).querySelector('.date-picker__day-indicator') as HTMLElement;
		const start = indicator('2026-07-10');
		const end = indicator('2026-07-20');

		for (const dot of [start, end]) {
			const r = dot.getBoundingClientRect();
			expect(Math.round(r.width)).toBe(Math.round(r.height));
		}
		const startStyle = getComputedStyle(start);
		expect(startStyle.borderStartStartRadius).not.toBe('0px');
		expect(startStyle.borderStartEndRadius).toBe('0px');
		const endStyle = getComputedStyle(end);
		expect(endStyle.borderStartStartRadius).toBe('0px');
		expect(endStyle.borderStartEndRadius).not.toBe('0px');
	});

	it('een periode van één dag houdt alle vier de hoeken', async () => {
		el = await fixture<NLDDDatePicker>('<nldd-date-picker range start="2026-07-10" end="2026-07-10" style="--semantics-controls-md-corner-radius: 8px"></nldd-date-picker>');
		await waitForUpdate(el);
		const dot = dayFor(el, '2026-07-10').querySelector('.date-picker__day-indicator') as HTMLElement;
		const style = getComputedStyle(dot);
		expect(style.borderStartStartRadius).not.toBe('0px');
		expect(style.borderStartEndRadius).not.toBe('0px');
	});
});
