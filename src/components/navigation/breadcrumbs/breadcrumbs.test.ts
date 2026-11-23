import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './breadcrumbs.js';
import { loadTokens } from '../../../test-tokens.js';
import { wrapUiText } from '../../../assets/styles/text-wrap.js';
import { wrapOf, wrapOfSets } from '../../../assets/styles/text-wrap.fixtures.js';

describe('nldd-breadcrumbs', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a nav landmark with the default aria-label', async () => {
		el = await fixture(`
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Here" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		`);
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav');
		expect(nav).not.toBeNull();
		expect(nav!.getAttribute('aria-label')).toBe('Kruimelpad');
	});

	it('renders every item into the list', async () => {
		el = await fixture(`
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Documentatie" href="/docs/"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item text="Here" current></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!;
		expect(slot.assignedElements().length).toBe(3);
	});

});

describe('nldd-breadcrumbs-item', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('sets role="listitem" on the host', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('listitem');
	});

	it('does not overwrite a consumer-provided role', async () => {
		el = await fixture('<nldd-breadcrumbs-item role="treeitem" text="Home"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('treeitem');
	});

	it('renders as a link when href is set', async () => {
		el = await fixture('<nldd-breadcrumbs-item href="/docs/" text="Docs"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a');
		expect(a).not.toBeNull();
		expect(a!.getAttribute('href')).toBe('/docs/');
	});

	it('renders plain text and sets aria-current on the host when current', async () => {
		el = await fixture('<nldd-breadcrumbs-item current text="Here" href="/here/"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
		expect(el.getAttribute('aria-current')).toBe('page');
	});

	it('clears aria-current when current is toggled off', async () => {
		el = await fixture('<nldd-breadcrumbs-item current text="Here"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-current')).toBe('page');
		el.removeAttribute('current');
		await waitForUpdate(el);
		expect(el.hasAttribute('aria-current')).toBe(false);
	});

	it('renders a chevron-right separator after every item', async () => {
		el = await fixture('<nldd-breadcrumbs-item text="Home" href="/"></nldd-breadcrumbs-item>');
		await waitForUpdate(el);
		const sep = el.shadowRoot!.querySelector('.breadcrumbs__separator');
		expect(sep).not.toBeNull();
		expect(sep?.querySelector('nldd-icon')?.getAttribute('icon')).toBe('chevron-right-small');
	});
});

describe('nldd-breadcrumbs – breaking long crumbs', () => {
	const WORD = 'Arbeidsongeschiktheidsverzekering';
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => { removeTokens = loadTokens(); });

	afterEach(() => {
		cleanup(el);
		removeTokens();
	});

	const trail = `
		<nldd-breadcrumbs>
			<nldd-breadcrumbs-item href="/" text="Mijn Dienst"></nldd-breadcrumbs-item>
			<nldd-breadcrumbs-item href="/aanvragen" text="Aanvragen over de ${WORD}"></nldd-breadcrumbs-item>
			<nldd-breadcrumbs-item current text="Over de ${WORD}aanvraag"></nldd-breadcrumbs-item>
		</nldd-breadcrumbs>`;

	it('keeps every crumb inside 220px, the chevron on the line of its last word', async () => {
		el = await fixture(`<div style="width: 220px">${trail}</div>`);
		const items = [...el.querySelectorAll('nldd-breadcrumbs-item')];
		await Promise.all(items.map((item) => waitForUpdate(item as HTMLElement)));
		const right = el.getBoundingClientRect().right;
		for (const item of items) {
			const text = item.shadowRoot!.querySelector('.breadcrumbs__item')!;
			const lines = [...text.getClientRects()];
			expect(Math.max(...lines.map((line) => line.right)) - right, item.getAttribute('text')!).toBeLessThanOrEqual(1);
			const chevron = item.shadowRoot!.querySelector('.breadcrumbs__separator nldd-icon')!.getBoundingClientRect();
			if (!chevron.width) continue;
			const last = lines[lines.length - 1];
			expect(chevron.left - last.right).toBeLessThan(8);
			expect(chevron.top).toBeLessThan(last.bottom);
			expect(chevron.bottom).toBeGreaterThan(last.top);
		}
	});

	// A word wider than the line breaks wherever the browser can fit it, also
	// just before the chevron; with words that fit, the chevron stays with the last.
	it('keeps the chevron with the last word, at any width', async () => {
		el = await fixture(`<div style="width: 360px">
			<nldd-breadcrumbs>
				<nldd-breadcrumbs-item href="/" text="Mijn Dienst"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item href="/dossiers" text="Dossiers van team Uitvoering"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item href="/dossiers/d-318" text="Dossier D-318 met aanvragen"></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item current text="Aanvraag A-1042"></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
		</div>`);
		const items = [...el.querySelectorAll('nldd-breadcrumbs-item')].slice(0, -1);
		await Promise.all(items.map((item) => waitForUpdate(item as HTMLElement)));
		for (let width = 120; width <= 360; width += 1) {
			el.style.width = `${width}px`;
			for (const item of items) {
				const lines = [...item.shadowRoot!.querySelector('.breadcrumbs__item')!.getClientRects()];
				const last = lines[lines.length - 1];
				const chevron = item.shadowRoot!.querySelector('.breadcrumbs__separator nldd-icon')!.getBoundingClientRect();
				expect(chevron.top < last.bottom && chevron.bottom > last.top, `${width}px: ${item.getAttribute('text')}`).toBe(true);
			}
		}
	});

	it('gives a crumb wrapUiText', async () => {
		el = await fixture(trail);
		const item = el.querySelector('nldd-breadcrumbs-item')!;
		await waitForUpdate(item as HTMLElement);
		expect(wrapOf(item.shadowRoot!.querySelector('.breadcrumbs__item')!)).toEqual(wrapOfSets(wrapUiText));
	});
});
