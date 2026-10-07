import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import type { CSSResult } from 'lit';
import { fixture, cleanup } from '../test-utils.js';
import { loadTokens } from '../test-tokens.js';
import { menuItemStyles } from './actions/menu/menu.styles.js';
import { stepBarItemStyles } from './status-and-feedback/step-bar/step-bar.styles.js';
import { documentTabBarItemStyles } from './navigation/document-tab-bar/document-tab-bar.styles.js';
import './actions/menu/menu.js';
import './status-and-feedback/step-bar/step-bar.js';
import './navigation/document-tab-bar/document-tab-bar.js';

/**
 * Three subcomponents read local variables their parent defines: the menu item,
 * the step bar item and the document tab bar item. Some of those variables only
 * show in a state a story at rest does not reach (a highlighted menu item, a
 * hovered dismiss button), so a broken name there goes unnoticed. This places
 * each child in its parent and checks that every variable the child reads but
 * does not set in its own base :host has a value.
 */

/** Declarations at the top level of the stylesheet's plain `:host { … }` blocks. */
function baseHostNames(css: string): Set<string> {
	const names = new Set<string>();
	for (const match of css.matchAll(/:host\s*\{/g)) {
		let depth = 0;
		let i = match.index! + match[0].length - 1;
		const start = i;
		for (; i < css.length; i++) {
			if (css[i] === '{') depth++;
			else if (css[i] === '}' && --depth === 0) break;
		}
		const body = css.slice(start + 1, i);
		let level = 0;
		let line = '';
		for (const char of body) {
			if (char === '{') level++;
			else if (char === '}') level--;
			else if (level === 0) line += char;
		}
		for (const name of line.matchAll(/(--_[a-z0-9-]+)\s*:/g)) names.add(name[1]);
	}
	return names;
}

function inheritedNames(styles: CSSResult): string[] {
	const css = styles.cssText;
	const own = baseHostNames(css);
	const read = new Set([...css.matchAll(/var\((--_[a-z0-9-]+)/g)].map((match) => match[1]));
	return [...read].filter((name) => !own.has(name)).sort();
}

const PAIRS = [
	{ child: 'nldd-menu-item', styles: menuItemStyles, markup: '<nldd-menu><nldd-menu-item text="Bewerken"></nldd-menu-item></nldd-menu>' },
	{ child: 'nldd-step-bar-item', styles: stepBarItemStyles, markup: '<nldd-step-bar><nldd-step-bar-item text="Gegevens"></nldd-step-bar-item></nldd-step-bar>' },
	{ child: 'nldd-document-tab-bar-item', styles: documentTabBarItemStyles, markup: '<nldd-document-tab-bar><nldd-document-tab-bar-item text="Aanvraag A-1042"></nldd-document-tab-bar-item></nldd-document-tab-bar>' },
];

describe('subcomponents – the variables they take from their parent', () => {
	let el: HTMLElement;
	let removeTokens: () => void;

	beforeAll(() => { removeTokens = loadTokens(); });
	afterAll(() => removeTokens());
	afterEach(() => {
		if (el) cleanup(el);
	});

	for (const { child, styles, markup } of PAIRS) {
		it(`${child} finds a value for every variable it inherits`, async () => {
			const names = inheritedNames(styles);
			expect(names.length).toBeGreaterThan(0);

			el = await fixture(`<div>${markup}</div>`);
			const host = el.querySelector(child)!;
			const style = getComputedStyle(host);
			const missing = names.filter((name) => style.getPropertyValue(name).trim() === '');
			expect(missing).toEqual([]);
		});
	}
});
