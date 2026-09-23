import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './badge.js';

describe('nldd-badge', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-badge></nldd-badge>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders number as label', async () => {
		el = await fixture('<nldd-badge number="5"></nldd-badge>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.badge__text')!;
		expect(label.textContent).toBe('5');
	});

	it('clamps number above max to "{max}+"', async () => {
		el = await fixture('<nldd-badge number="150" max="99"></nldd-badge>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.badge__text')!;
		expect(label.textContent).toBe('99+');
	});

	it('prefers text over number', async () => {
		el = await fixture('<nldd-badge text="Nieuw" number="3"></nldd-badge>');
		await waitForUpdate(el);
		const label = el.shadowRoot!.querySelector('.badge__text')!;
		expect(label.textContent).toBe('Nieuw');
	});

	it('renders as dot automatically when text and number are empty', async () => {
		el = await fixture('<nldd-badge></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.classList.contains('badge--dot')).toBe(true);
		expect(el.shadowRoot!.querySelector('.badge__text')).toBeNull();
	});

	it('drops dot mode when number is set', async () => {
		el = await fixture('<nldd-badge number="5"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.classList.contains('badge--dot')).toBe(false);
	});

	it('renders icon-only as square', async () => {
		el = await fixture('<nldd-badge icon="check-mark"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.classList.contains('badge--icon-only')).toBe(true);
		expect(badge.classList.contains('badge--dot')).toBe(false);
		expect(el.shadowRoot!.querySelector('.badge__icon nldd-icon')!.getAttribute('icon')).toBe('check-mark');
		expect(el.shadowRoot!.querySelector('.badge__text')).toBeNull();
	});

	it('renders icon with text', async () => {
		el = await fixture('<nldd-badge icon="check-mark" text="OK"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.classList.contains('badge--icon-only')).toBe(false);
		expect(el.shadowRoot!.querySelector('.badge__icon')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.badge__text')!.textContent).toBe('OK');
	});

	it('omits role and aria-label when text is visible', async () => {
		el = await fixture('<nldd-badge text="Nieuw"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.hasAttribute('role')).toBe(false);
		expect(badge.hasAttribute('aria-label')).toBe(false);
	});

	it('omits role and aria-label when number is visible', async () => {
		el = await fixture('<nldd-badge number="5"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.hasAttribute('role')).toBe(false);
		expect(badge.hasAttribute('aria-label')).toBe(false);
	});

	it('sets role=img + i18n notification label in dot mode', async () => {
		el = await fixture('<nldd-badge></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.getAttribute('role')).toBe('img');
		expect(badge.getAttribute('aria-label')).toBe('Notificatie');
	});

	it('sets role=img + i18n label in icon-only mode', async () => {
		el = await fixture('<nldd-badge icon="check-mark"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.getAttribute('role')).toBe('img');
		expect(badge.getAttribute('aria-label')).toBe('Notificatie');
	});

	it('uses accessible-label in icon-only mode', async () => {
		el = await fixture('<nldd-badge icon="check-mark" accessible-label="Geverifieerd"></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.getAttribute('aria-label')).toBe('Geverifieerd');
	});

	it('rendert geen pulse-ring zonder het pulse-attribuut', async () => {
		el = await fixture('<nldd-badge></nldd-badge>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.badge__pulse')).toBeNull();
	});

	it('rendert een pulse-ring met het pulse-attribuut', async () => {
		el = await fixture('<nldd-badge pulse></nldd-badge>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.badge__pulse')).not.toBeNull();
	});

	it('houdt de ring buiten de toegankelijkheidsboom en het klikgebied', async () => {
		el = await fixture('<nldd-badge pulse></nldd-badge>');
		await waitForUpdate(el);
		const ring = el.shadowRoot!.querySelector('.badge__pulse')!;
		const styles = getComputedStyle(ring);
		expect(ring.textContent).toBe('');
		expect(styles.position).toBe('absolute');
		expect(styles.pointerEvents).toBe('none');
	});

	it('zegt niets meer wanneer hij decoratief is', async () => {
		el = await fixture('<nldd-badge color="success" decorative></nldd-badge>');
		await waitForUpdate(el);
		const badge = el.shadowRoot!.querySelector('.badge')!;
		expect(badge.getAttribute('aria-hidden')).toBe('true');
		expect(badge.getAttribute('role')).toBeNull();
		expect(badge.getAttribute('aria-label')).toBeNull();
	});

	it('laat het standaard-maximum niet in de DOM achter', async () => {
		el = await fixture('<nldd-badge number="5"></nldd-badge>');
		await waitForUpdate(el);
		expect(el.getAttribute('max')).toBeNull();
		(el as HTMLElement & { max: number }).max = 9;
		await waitForUpdate(el);
		expect(el.getAttribute('max')).toBe('9');
	});

	it('geeft een eigen kleur door aan de styles', async () => {
		el = await fixture('<nldd-badge custom-color="#3b82f6" number="3"></nldd-badge>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_custom-color')).toBe('#3b82f6');
		expect(getComputedStyle(el).color).toBe('rgb(59, 130, 246)');
	});

	it('haalt de eigen kleur weer weg zodra hij leeg is', async () => {
		el = await fixture('<nldd-badge custom-color="#3b82f6"></nldd-badge>');
		await waitForUpdate(el);
		(el as HTMLElement & { customColor: string }).customColor = '';
		await waitForUpdate(el);
		expect(el.hasAttribute('custom-color')).toBe(false);
		expect(el.style.getPropertyValue('--_custom-color')).toBe('');
	});
});

/** Black or white, whatever notation the browser answers in. The color space
 *  carries digits of its own (xyz-d65), so it is stripped before the channels
 *  are read. */
function picked(color: string): 'black' | 'white' | 'iets anders' {
	const channels = (color.replace(/[a-z]+-?d?\d*/gi, ' ').match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
	if (channels.length !== 3) return 'iets anders';
	if (channels.every(c => c >= 0.99)) return 'white';
	if (channels.every(c => c <= 0.01)) return 'black';
	return 'iets anders';
}

describe('nldd-badge color="inherit"', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('flips the text against the fill it actually paints, not against the color it inherits', async () => {
		// A row hands its content color down through the context channel while its
		// own text color stays what it was. The two used to disagree, and a white
		// channel over dark text painted white on white.
		// The contrast token lives in variables.css, which the test environment does
		// not load, so the fixture carries the same formula.
		el = await fixture(`
			<div style="color: rgb(0, 0, 0); --context-content-color: rgb(255, 255, 255); --semantics-content-contrast-color: color(from currentColor xyz clamp(0, (0.1791 / y - 1) * infinity, 1) clamp(0, (0.1791 / y - 1) * infinity, 1) clamp(0, (0.1791 / y - 1) * infinity, 1) / 1);">
				<nldd-badge color="inherit" text="3"></nldd-badge>
			</div>
		`);
		const badge = el.querySelector('nldd-badge')!;
		await waitForUpdate(badge);
		const shape = badge.shadowRoot!.querySelector('.badge')!;
		const text = badge.shadowRoot!.querySelector('.badge__text')!;
		expect(getComputedStyle(shape).backgroundColor).toBe('rgb(255, 255, 255)');
		expect(picked(getComputedStyle(text).color)).toBe('black');
	});

	it('paints custom-color and puts a contrasting text on it', async () => {
		// The contrast token lives in variables.css, which the test environment does
		// not load, so the fixture carries the same formula.
		el = await fixture(`
			<div style="--semantics-content-contrast-color: color(from currentColor xyz clamp(0, (0.1791 / y - 1) * infinity, 1) clamp(0, (0.1791 / y - 1) * infinity, 1) clamp(0, (0.1791 / y - 1) * infinity, 1) / 1);">
				<nldd-badge custom-color="rgb(20, 20, 20)" text="3"></nldd-badge>
			</div>
		`);
		const badge = el.querySelector('nldd-badge')!;
		await waitForUpdate(badge);
		const shape = badge.shadowRoot!.querySelector('.badge')!;
		const text = badge.shadowRoot!.querySelector('.badge__text')!;
		expect(getComputedStyle(shape).backgroundColor).toBe('rgb(20, 20, 20)');
		// The formula answers in whatever color space it is written in, so read the
		// channels rather than the notation.
		expect(picked(getComputedStyle(text).color)).toBe('white');
	});

	it('falls back to the inherited color where no channel is set', async () => {
		el = await fixture(`
			<div style="color: rgb(0, 0, 0);">
				<nldd-badge color="inherit" text="3"></nldd-badge>
			</div>
		`);
		const badge = el.querySelector('nldd-badge')!;
		await waitForUpdate(badge);
		const shape = badge.shadowRoot!.querySelector('.badge')!;
		expect(getComputedStyle(shape).backgroundColor).toBe('rgb(0, 0, 0)');
	});
});
