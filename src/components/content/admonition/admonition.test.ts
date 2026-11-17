import { describe, it, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDAdmonition } from './admonition.js';
import './admonition.js';

describe('nldd-admonition', () => {
	let el: NLDDAdmonition;
	let removeTokens: () => void;

	beforeAll(() => {
		removeTokens = loadTokens();
	});

	afterAll(() => removeTokens());

	afterEach(() => {
		if (el) cleanup(el);
	});

	const titleBar = () => el.shadowRoot!.querySelector<HTMLElement>('.admonition__title-bar');

	it('renders without errors', async () => {
		el = await fixture('<nldd-admonition text="Let op"><p>Inhoud</p></nldd-admonition>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is a note, not a live region, so nothing is read out when the page loads', async () => {
		el = await fixture('<nldd-admonition variant="critical" text="Waarschuwing"></nldd-admonition>');
		expect(el.getAttribute('role')).toBe('note');
		expect(el.hasAttribute('aria-live')).toBe(false);
	});

	it('keeps a role the page sets itself', async () => {
		el = await fixture('<nldd-admonition role="region" aria-label="Tip" text="Tip"></nldd-admonition>');
		expect(el.getAttribute('role')).toBe('region');
	});

	it('shows the title in a bar, with the icon of the variant', async () => {
		el = await fixture('<nldd-admonition variant="warning" text="Let op"></nldd-admonition>');
		expect(titleBar()!.textContent).toContain('Let op');
		expect(el.shadowRoot!.querySelector('nldd-icon')!.getAttribute('icon')).toBe('exclamation-triangle-filled');
	});

	it('draws a line between the bar and the content, also when it does not collapse', async () => {
		el = await fixture('<nldd-admonition text="Let op"><p>Inhoud</p></nldd-admonition>');
		expect(getComputedStyle(titleBar()!).boxShadow).toContain('0px -1px 0px');
		cleanup(el);
		el = await fixture('<nldd-admonition text="Vraag" collapsible collapsed><p>Inhoud</p></nldd-admonition>');
		expect(getComputedStyle(titleBar()!).boxShadow).not.toContain('0px -1px 0px');
	});

	it('renders the title as a heading at heading-level', async () => {
		el = await fixture('<nldd-admonition text="Let op" heading-level="3"></nldd-admonition>');
		expect(el.shadowRoot!.querySelector('h3')!.textContent).toBe('Let op');
	});

	it('has no bar without text, and puts the icon before the content', async () => {
		el = await fixture('<nldd-admonition><p>Inhoud</p></nldd-admonition>');
		expect(titleBar()).toBeNull();
		expect(el.shadowRoot!.querySelector('.admonition__main > .admonition__variant-icon')).not.toBeNull();
	});

	it('takes an icon override', async () => {
		el = await fixture('<nldd-admonition text="Tip" icon="lightbulb"></nldd-admonition>');
		expect(el.shadowRoot!.querySelector('nldd-icon')!.getAttribute('icon')).toBe('lightbulb');
	});

	it('opens and closes as a native details with collapsible, and starts open', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible><p>Inhoud</p></nldd-admonition>');
		const details = el.shadowRoot!.querySelector('details')!;
		expect(details).not.toBeNull();
		expect(details.open).toBe(true);
		expect(el.shadowRoot!.querySelector('summary')!.textContent).toContain('Vraag');
	});

	it('starts closed with collapsed', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible collapsed></nldd-admonition>');
		expect(el.collapsed).toBe(true);
		expect(el.shadowRoot!.querySelector('details')!.open).toBe(false);
	});

	it('keeps collapsed in step with a click on the title and fires toggle', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible></nldd-admonition>');
		let toggles = 0;
		el.addEventListener('toggle', () => toggles++);
		el.shadowRoot!.querySelector('summary')!.click();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await waitForUpdate(el);
		expect(el.collapsed).toBe(true);
		expect(el.hasAttribute('collapsed')).toBe(true);
		expect(toggles).toBe(1);
	});

	it('opens and closes from the property', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible></nldd-admonition>');
		el.collapsed = true;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('details')!.open).toBe(false);
	});

	it('animates the height of the content as it opens', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible collapsed><p>Inhoud</p></nldd-admonition>');
		const details = el.shadowRoot!.querySelector('details')!;
		// A transition needs a style to start from.
		expect(getComputedStyle(details, '::details-content').blockSize).toBe('0px');
		el.collapsed = false;
		await el.updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 60));
		const height = parseFloat(getComputedStyle(details, '::details-content').blockSize);
		await new Promise((resolve) => setTimeout(resolve, 400));
		const opened = parseFloat(getComputedStyle(details, '::details-content').blockSize);
		expect(height).toBeGreaterThan(0);
		expect(height).toBeLessThan(opened);
	});

	it('keeps the bar square with its line until the content has closed', async () => {
		el = await fixture('<nldd-admonition text="Vraag" collapsible><p>Inhoud</p></nldd-admonition>');
		expect(getComputedStyle(titleBar()!).boxShadow).toContain('0px -1px 0px');
		el.collapsed = true;
		await el.updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(getComputedStyle(titleBar()!).borderBottomLeftRadius).toBe('0px');
		expect(getComputedStyle(titleBar()!).boxShadow).toContain('0px -1px 0px');
		await new Promise((resolve) => setTimeout(resolve, 400));
		expect(getComputedStyle(titleBar()!).borderBottomLeftRadius).not.toBe('0px');
		expect(getComputedStyle(titleBar()!).boxShadow).not.toContain('0px -1px 0px');
	});

	it('does not collapse without a title to click on', async () => {
		el = await fixture('<nldd-admonition collapsible></nldd-admonition>');
		expect(el.shadowRoot!.querySelector('details')).toBeNull();
	});
});
