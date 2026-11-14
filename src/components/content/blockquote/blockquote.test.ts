import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import './blockquote.js';

describe('nldd-blockquote', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-blockquote>Quote</nldd-blockquote>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('forwards cite to the <blockquote> element', async () => {
		el = await fixture('<nldd-blockquote cite="https://example.com">Quote</nldd-blockquote>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('blockquote')!;
		expect(inner.getAttribute('cite')).toBe('https://example.com');
	});

	it('hides attribution footer when slot is empty', async () => {
		el = await fixture('<nldd-blockquote>Quote</nldd-blockquote>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.blockquote__attribution') as HTMLElement;
		expect(footer.hasAttribute('hidden')).toBe(true);
	});

	it('shows attribution footer when slot has content', async () => {
		el = await fixture('<nldd-blockquote>Quote<span slot="attribution">Author</span></nldd-blockquote>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.blockquote__attribution') as HTMLElement;
		expect(footer.hasAttribute('hidden')).toBe(false);
	});

	it('suppresses the em-dash for a identity attribution', async () => {
		el = await fixture('<nldd-blockquote>Quote<nldd-identity slot="attribution" text="Jan"></nldd-identity></nldd-blockquote>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.blockquote__attribution') as HTMLElement;
		expect(footer.classList.contains('is-identity')).toBe(true);
	});

	it('keeps the em-dash for a plain text attribution', async () => {
		el = await fixture('<nldd-blockquote>Quote<span slot="attribution">Author</span></nldd-blockquote>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.blockquote__attribution') as HTMLElement;
		expect(footer.classList.contains('is-identity')).toBe(false);
	});
});

describe('nldd-blockquote – custom-size', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeEach(() => {
		removeTokens = loadTokens();
	});

	afterEach(() => {
		if (el) cleanup(el);
		removeTokens();
	});

	const blockquote = async (attrs: string): Promise<HTMLElement> => {
		el = await fixture(`<nldd-blockquote ${attrs}><p>Een citaat.</p><p>Nog een alinea.</p><p slot="attribution">Team Beleid</p></nldd-blockquote>`);
		await waitForUpdate(el);
		return el;
	};

	const style = (selector: string) => getComputedStyle(el.shadowRoot!.querySelector(selector)!);
	const all = 'sm-custom-size="48px" md-custom-size="48px" lg-custom-size="48px"';

	it('writes each breakpoint value into its own variable', async () => {
		await blockquote('sm-custom-size="24px" md-custom-size="32px" lg-custom-size="40px"');
		expect(el.style.getPropertyValue('--_blockquote-sm-custom-size')).toBe('24px');
		expect(el.style.getPropertyValue('--_blockquote-md-custom-size')).toBe('32px');
		expect(el.style.getPropertyValue('--_blockquote-lg-custom-size')).toBe('40px');
	});

	it('grows the quote, its line height and the space between paragraphs', async () => {
		await blockquote('');
		const own = style('.blockquote__quote');
		const before = { size: parseFloat(own.fontSize), line: parseFloat(own.lineHeight), gap: parseFloat(own.rowGap) };
		cleanup(el);
		await blockquote(all);
		const custom = style('.blockquote__quote');
		expect(custom.fontSize).toBe('48px');
		expect(parseFloat(custom.lineHeight) / 48).toBeCloseTo(before.line / before.size, 2);
		expect(parseFloat(custom.rowGap)).toBeGreaterThan(before.gap);
		expect(custom.fontStyle).toBe('italic');
	});

	it('leaves the attribution as it is', async () => {
		await blockquote('');
		const own = style('.blockquote__attribution').fontSize;
		cleanup(el);
		await blockquote(all);
		expect(style('.blockquote__attribution').fontSize).toBe(own);
	});

	it('never goes below the quote\'s own size', async () => {
		await blockquote('');
		const own = style('.blockquote__quote').fontSize;
		cleanup(el);
		await blockquote('sm-custom-size="4px" md-custom-size="4px" lg-custom-size="4px"');
		expect(style('.blockquote__quote').fontSize).toBe(own);
		expect(el.matches(':state(custom-size-below-floor)')).toBe(true);
	});

	it('grows the quote at size lg, and leaves the attribution as it is', async () => {
		await blockquote('');
		const md = { quote: parseFloat(style('.blockquote__quote').fontSize), attribution: style('.blockquote__attribution').fontSize };
		cleanup(el);
		await blockquote('size="lg"');
		expect(parseFloat(style('.blockquote__quote').fontSize)).toBeGreaterThan(md.quote);
		expect(style('.blockquote__quote').fontStyle).toBe('italic');
		expect(style('.blockquote__attribution').fontSize).toBe(md.attribution);
	});

	it('never goes below the size from size', async () => {
		await blockquote('size="lg"');
		const own = style('.blockquote__quote').fontSize;
		cleanup(el);
		await blockquote('size="lg" sm-custom-size="4px" md-custom-size="4px" lg-custom-size="4px"');
		expect(style('.blockquote__quote').fontSize).toBe(own);
		expect(el.matches(':state(custom-size-below-floor)')).toBe(true);
	});

	it('does not reflect the default size', async () => {
		await blockquote('');
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('keeps its own size for a value that is not a length', async () => {
		await blockquote('lg-custom-size="huge"');
		expect(el.hasAttribute('data-lg-custom-size')).toBe(false);
		expect(el.matches(':state(invalid-custom-size)')).toBe(true);
	});
});
