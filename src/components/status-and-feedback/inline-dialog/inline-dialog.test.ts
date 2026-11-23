import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './inline-dialog.js';
import { loadTokens } from '../../../test-tokens.js';
import { wrapBodyText, wrapUiText } from '../../../assets/styles/text-wrap.js';
import { wrapOf, wrapOfSets } from '../../../assets/styles/text-wrap.fixtures.js';

describe('nldd-inline-dialog', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-inline-dialog></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders text as p when heading-level is not set', async () => {
		el = await fixture('<nldd-inline-dialog text="Bevestiging vereist"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('p.inline-dialog__text')?.textContent?.trim()).toBe('Bevestiging vereist');
	});

	it('renders text as h2 when heading-level="2"', async () => {
		el = await fixture('<nldd-inline-dialog text="Bevestiging vereist" heading-level="2"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('h2.inline-dialog__text')?.textContent?.trim()).toBe('Bevestiging vereist');
	});

	it('renders text as h3 when heading-level="3"', async () => {
		el = await fixture('<nldd-inline-dialog text="Bevestiging vereist" heading-level="3"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('h3.inline-dialog__text')?.textContent?.trim()).toBe('Bevestiging vereist');
	});

	it('renders supporting-text when set', async () => {
		el = await fixture('<nldd-inline-dialog supporting-text="Dit kan niet ongedaan worden gemaakt."></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.inline-dialog__supporting-text')?.textContent?.trim()).toBe('Dit kan niet ongedaan worden gemaakt.');
	});

	it('does not render text element when text is absent', async () => {
		el = await fixture('<nldd-inline-dialog></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.inline-dialog__text')).toBeNull();
	});

	it('does not render supporting-text element when absent', async () => {
		el = await fixture('<nldd-inline-dialog></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.inline-dialog__supporting-text')).toBeNull();
	});

	it('renders icon when icon is set', async () => {
		el = await fixture('<nldd-inline-dialog icon="check-mark-circle"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.inline-dialog__icon')).not.toBeNull();
	});

	it('does not render icon when icon is absent and no variant', async () => {
		el = await fixture('<nldd-inline-dialog></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.inline-dialog__icon')).toBeNull();
	});

	it('forces icon to "alert" when variant="alert" and no explicit icon', async () => {
		el = await fixture('<nldd-inline-dialog variant="alert"></nldd-inline-dialog>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon');
		expect(icon?.getAttribute('icon')).toBe('alert');
	});

	it('variant="alert" always overrides explicit icon', async () => {
		el = await fixture('<nldd-inline-dialog variant="alert" icon="info-circle"></nldd-inline-dialog>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon');
		expect(icon?.getAttribute('icon')).toBe('alert');
	});

	it('reflects variant attribute', async () => {
		el = await fixture('<nldd-inline-dialog variant="alert"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('alert');
	});

	it('renders an activity indicator instead of an icon when variant="loading"', async () => {
		el = await fixture('<nldd-inline-dialog variant="loading" text="Bezig met laden"></nldd-inline-dialog>');
		await waitForUpdate(el);
		const spinner = el.shadowRoot!.querySelector('nldd-activity-indicator');
		expect(spinner).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-icon')).toBeNull(); // the icon is replaced, not shown alongside
		expect(spinner!.getAttribute('timing')).toBe('instant'); // no anti-flash delay: the dialog is already loading
	});

	it('sizes the loading spinner to the icon size (md=40, lg=48)', async () => {
		el = await fixture('<nldd-inline-dialog variant="loading" size="lg"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-activity-indicator')!.getAttribute('size')).toBe('48');
	});

	it('variant="loading" overrides an explicit icon', async () => {
		el = await fixture('<nldd-inline-dialog variant="loading" icon="info-circle"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-activity-indicator')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-icon')).toBeNull();
	});

	it('reflects size attribute', async () => {
		el = await fixture('<nldd-inline-dialog size="lg"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('lg');
	});

	it('defaults size to md when omitted', async () => {
		el = await fixture('<nldd-inline-dialog></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect((el as unknown as { size: string }).size).toBe('md');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('renders actions slot wrapped in nldd-button-group', async () => {
		el = await fixture(`
			<nldd-inline-dialog>
				<nldd-button slot="actions" appearance="primary" text="Bevestig"></nldd-button>
			</nldd-inline-dialog>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-button-group')).not.toBeNull();
	});

	it('renders success icon when variant="success"', async () => {
		el = await fixture('<nldd-inline-dialog variant="success"></nldd-inline-dialog>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon');
		expect(icon?.getAttribute('icon')).toBe('success');
	});

	it('reflects icon-color attribute', async () => {
		el = await fixture('<nldd-inline-dialog icon="info-circle" icon-color="success"></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(el.getAttribute('icon-color')).toBe('success');
	});

	it('icon-color overrides the variant icon color', async () => {
		el = await fixture('<nldd-inline-dialog variant="alert" icon-color="critical"></nldd-inline-dialog>');
		await waitForUpdate(el);
		const iconColor = getComputedStyle(el).getPropertyValue('--_inline-dialog-icon-color').trim();
		const expected = getComputedStyle(document.documentElement)
			.getPropertyValue('--semantics-content-critical-color').trim();
		expect(iconColor).toBe(expected);
	});

	describe('horizontal alignment', () => {
		const block = (host: HTMLElement) => host.shadowRoot!.querySelector('.inline-dialog')!;
		// The property, not the attribute: nldd-button-group drops `orientation`
		// from the DOM when it equals its own default.
		const orientation = (host: HTMLElement) =>
			(host.shadowRoot!.querySelector('nldd-button-group') as unknown as { orientation: string }).orientation;

		it('centers a bare message', async () => {
			el = await fixture('<nldd-inline-dialog text="Geen resultaten"></nldd-inline-dialog>');
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(false);
		});

		it('centers a message with actions but no slotted content', async () => {
			el = await fixture(`
				<nldd-inline-dialog text="Geen resultaten">
					<nldd-button slot="actions" text="Wissen"></nldd-button>
				</nldd-inline-dialog>
			`);
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(false);
			expect(orientation(el)).toBe('vertical');
		});

		it('aligns left as soon as the default slot holds content', async () => {
			el = await fixture(`
				<nldd-inline-dialog text="Map hernoemen">
					<nldd-text-field label="Naam"></nldd-text-field>
				</nldd-inline-dialog>
			`);
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(true);
		});

		it('treats plain text in the default slot as content', async () => {
			el = await fixture('<nldd-inline-dialog text="Let op">Een losse notitie.</nldd-inline-dialog>');
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(true);
		});

		it('lays the actions out in a row when aligned left', async () => {
			el = await fixture(`
				<nldd-inline-dialog text="Map hernoemen">
					<nldd-text-field label="Naam"></nldd-text-field>
					<nldd-button slot="actions" text="Opslaan"></nldd-button>
				</nldd-inline-dialog>
			`);
			await waitForUpdate(el);
			expect(orientation(el)).toBe('horizontal');
		});

		it('horizontal-alignment="center" keeps slotted content centered', async () => {
			el = await fixture(`
				<nldd-inline-dialog text="Map hernoemen" horizontal-alignment="center">
					<nldd-text-field label="Naam"></nldd-text-field>
				</nldd-inline-dialog>
			`);
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(false);
		});

		it('horizontal-alignment="left" aligns a bare message left', async () => {
			el = await fixture('<nldd-inline-dialog text="Geen resultaten" horizontal-alignment="left"></nldd-inline-dialog>');
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(true);
		});

		it('follows the slot when content arrives after first render', async () => {
			el = await fixture('<nldd-inline-dialog text="Map hernoemen"></nldd-inline-dialog>');
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(false);

			el.appendChild(document.createElement('nldd-text-field'));
			await waitForUpdate(el);
			expect(block(el).classList.contains('inline-dialog--left-aligned')).toBe(true);
		});
	});
});

describe('nldd-inline-dialog – breaking long words', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => { removeTokens = loadTokens(); });
	afterEach(() => { cleanup(el); removeTokens(); });

	const WORD = 'Arbeidsongeschiktheidsverzekering';

	it.each([
		['centered', ''],
		['left-aligned', 'horizontal-alignment="left" size="lg"'],
	])('keeps the title and the supporting text inside 200px, %s', async (_name, attrs) => {
		el = await fixture(`<div style="width: 200px"><nldd-inline-dialog ${attrs} text="Geen ${WORD}" supporting-text="Uw ${WORD}aanvraag is niet gevonden"></nldd-inline-dialog></div>`);
		const dialog = el.querySelector('nldd-inline-dialog')!;
		await waitForUpdate(dialog as HTMLElement);
		const box = el.getBoundingClientRect();
		for (const part of dialog.shadowRoot!.querySelectorAll('.inline-dialog__text, .inline-dialog__supporting-text')) {
			const range = document.createRange();
			range.selectNodeContents(part);
			const rect = range.getBoundingClientRect();
			expect(rect.left).toBeGreaterThanOrEqual(box.left - 1);
			expect(rect.right).toBeLessThanOrEqual(box.right + 1);
		}
	});

	it('gives the title wrapUiText and the supporting text wrapBodyText', async () => {
		el = await fixture('<nldd-inline-dialog text="Geen resultaten" supporting-text="Pas de filters aan."></nldd-inline-dialog>');
		await waitForUpdate(el);
		expect(wrapOf(el.shadowRoot!.querySelector('.inline-dialog__text')!)).toEqual(wrapOfSets(wrapUiText));
		expect(wrapOf(el.shadowRoot!.querySelector('.inline-dialog__supporting-text')!)).toEqual(wrapOfSets(wrapBodyText));
	});
});
