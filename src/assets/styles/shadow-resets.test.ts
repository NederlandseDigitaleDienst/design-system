import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup } from '../../test-utils.js';
import { hostileHostCss } from './shadow-resets.fixtures.js';
import '../../components/content/title/title.js';
import '../../components/inputs/dropdown/dropdown.js';
import '../../components/forms/form-field/form-field.js';
import '../../components/content/image/image.js';
import '../../components/content/blockquote/blockquote.js';
import '../../components/lists-and-tables/cells/description-cell/description-cell.js';

/**
 * Regression coverage for the shadow-resets (./shadow-resets.ts).
 *
 * Per component: render it, snapshot the slotted element's computed style, then
 * inject a hostile host stylesheet (Tailwind Preflight + aggressive overrides) at
 * the document level. The reset must make that injection a no-op — the after
 * snapshot must equal the before snapshot for every protected property.
 *
 * Token-independent by design: it asserts "host CSS cannot change the rendering",
 * not specific token values, so it holds without variables.css loaded in the test
 * browser. If a slot loses its reset, the host bleeds in and before !== after.
 *
 * Runs in a real browser (vitest browser mode, Chromium via Playwright), so
 * getComputedStyle resolves the actual cascade — ::slotted and cross-tree
 * !important included. These assertions would NOT hold under jsdom.
 */
describe('shadow-resets: host CSS cannot bleed into slotted content', () => {
	let el: HTMLElement | undefined;
	let injected: HTMLStyleElement | undefined;

	afterEach(() => {
		if (el) {
			cleanup(el);
			el = undefined;
		}
		if (injected) {
			injected.remove();
			injected = undefined;
		}
	});

	function snapshot(node: Element, props: string[]): Record<string, string> {
		const cs = getComputedStyle(node) as unknown as Record<string, string>;
		return Object.fromEntries(props.map(p => [p, cs[p]]));
	}

	async function assertUnaffected(markup: string, selector: string, props: string[], opts: { shadow?: boolean } = {}): Promise<void> {
		el = await fixture(markup);
		const root: ParentNode = opts.shadow ? el.shadowRoot! : el;
		const node = root.querySelector(selector);
		expect(node, `element "${selector}" not found`).not.toBeNull();

		const before = snapshot(node!, props);

		injected = document.createElement('style');
		injected.textContent = hostileHostCss;
		document.head.appendChild(injected);

		const after = snapshot(node!, props);
		expect(after).toEqual(before);
	}

	it('title — slotted heading keeps its font and blocks inherited typography leaks', async () => {
		await assertUnaffected(
			'<nldd-title><h1>Titel</h1></nldd-title>',
			'h1',
			['fontSize', 'marginTop', 'letterSpacing', 'textTransform'],
		);
	});

	it('dropdown — slotted native select keeps its overlay and blocks inherited typography leaks', async () => {
		await assertUnaffected(
			'<nldd-dropdown><select><option>Optie</option></select></nldd-dropdown>',
			'select',
			['opacity', 'position', 'appearance', 'fontSize', 'letterSpacing', 'textTransform'],
		);
	});

	it('image — slotted img keeps its sizing', async () => {
		await assertUnaffected(
			'<nldd-image><img alt="x"></nldd-image>',
			'img',
			['display', 'width', 'maxWidth'],
		);
	});

	it('blockquote — slotted paragraph keeps margin and blocks the letter-spacing leak', async () => {
		await assertUnaffected(
			'<nldd-blockquote><p>Quote</p></nldd-blockquote>',
			'p',
			['marginTop', 'letterSpacing'],
		);
	});

	it('blockquote — slotted attribution keeps display:inline + reset margin under a hostile p { display: none !important }', async () => {
		// The attribution <p> matches the generic ::slotted(p) reset (margin) AND
		// the specific .blockquote__attribution::slotted(p) { display: inline }.
		// Both are important inner-tree declarations, so they beat an important
		// host rule — "later declaration wins" only applies within one tree.
		el = await fixture('<nldd-blockquote><p>Quote</p><p slot="attribution">Auteur</p></nldd-blockquote>');
		const attribution = el.querySelector('p[slot="attribution"]')!;
		expect(getComputedStyle(attribution).display).toBe('inline');

		injected = document.createElement('style');
		injected.textContent = 'p { display: none !important; margin: 40px !important; }';
		document.head.appendChild(injected);

		expect(getComputedStyle(attribution).display).toBe('inline');
		expect(getComputedStyle(attribution).marginTop).toBe('0px');
	});

	it('description-cell — slotted title keeps margin and blocks the text-transform leak', async () => {
		await assertUnaffected(
			'<nldd-description-cell><span slot="title">Titel</span></nldd-description-cell>',
			'[slot="title"]',
			['marginTop', 'textTransform'],
		);
	});
});
