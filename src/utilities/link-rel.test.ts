import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import { linkRel } from './link-rel.js';
import '../components/actions/button/button.js';
import '../components/actions/icon-button/icon-button.js';
import '../components/content/avatar/avatar.js';
import '../components/layout/card/card.js';
import '../components/lists-and-tables/list-item/list-item.js';
import '../components/lists-and-tables/list-item-segment/list-item-segment.js';
import '../components/lists-and-tables/cells/text-cell/text-cell.js';
import '../components/navigation/link/link.js';
import '../components/status-and-feedback/status-bar/status-bar.js';

describe('linkRel', () => {
	it('adds noopener noreferrer for a new tab', () => {
		expect(linkRel(undefined, '_blank')).toBe('noopener noreferrer');
	});

	it('keeps a rel of your own and adds to it, without doubling', () => {
		expect(linkRel('external', '_blank')).toBe('external noopener noreferrer');
		expect(linkRel('noopener external', '_blank')).toBe('noopener external noreferrer');
	});

	it('leaves the rel alone without a new tab', () => {
		expect(linkRel('external', '_self')).toBe('external');
		expect(linkRel(undefined, undefined)).toBe('');
	});
});

/**
 * Every component that renders a link does the same thing with `rel`. They used
 * to do three different things: add to it, replace it, or pass it on bare. A
 * button with `target="_blank" rel="external"` lost its noopener, and a list
 * row with `target="_blank"` never had one.
 */
const cases: { name: string; markup: (attrs: string) => string; anchor: string }[] = [
	{ name: 'nldd-button', markup: (a) => `<nldd-button href="/x" text="X" ${a}></nldd-button>`, anchor: 'a' },
	{ name: 'nldd-icon-button', markup: (a) => `<nldd-icon-button href="/x" icon="arrow-left" text="X" ${a}></nldd-icon-button>`, anchor: 'a' },
	{ name: 'nldd-link', markup: (a) => `<nldd-link href="/x" text="X" ${a}></nldd-link>`, anchor: 'a' },
	{ name: 'nldd-card', markup: (a) => `<nldd-card href="/x" accessible-label="X" ${a}></nldd-card>`, anchor: 'a' },
	{ name: 'nldd-avatar', markup: (a) => `<nldd-avatar name="X" href="/x" ${a}></nldd-avatar>`, anchor: 'a' },
	{ name: 'nldd-status-bar', markup: (a) => `<nldd-status-bar text="X" href="/x" ${a}></nldd-status-bar>`, anchor: 'a' },
	{ name: 'nldd-list-item', markup: (a) => `<nldd-list-item href="/x" ${a}></nldd-list-item>`, anchor: 'a' },
	{
		name: 'nldd-list-item-segment',
		markup: (a) => `<nldd-list-item><nldd-list-item-segment href="/x" ${a}><nldd-text-cell text="X"></nldd-text-cell></nldd-list-item-segment></nldd-list-item>`,
		anchor: 'a',
	},
];

describe('rel on every link, the same rule', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	async function relOf(name: string, markup: string, anchor: string): Promise<string | null> {
		el = await fixture<HTMLElement>(markup);
		const host = (el.matches(name) ? el : el.querySelector(name)) as HTMLElement;
		await waitForUpdate(host);
		return host.shadowRoot!.querySelector(anchor)!.getAttribute('rel');
	}

	for (const { name, markup, anchor } of cases) {
		it(`${name}: a new tab adds noopener noreferrer to a rel of your own`, async () => {
			expect(await relOf(name, markup('target="_blank" rel="external"'), anchor)).toBe('external noopener noreferrer');
		});

		it(`${name}: a new tab without a rel gets noopener noreferrer`, async () => {
			expect(await relOf(name, markup('target="_blank"'), anchor)).toBe('noopener noreferrer');
		});

		it(`${name}: without a new tab the rel stays as it is`, async () => {
			expect(await relOf(name, markup('rel="external"'), anchor)).toBe('external');
		});
	}
});
