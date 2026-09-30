import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './application.html?raw';
import '../../components/index.js';

describe('patroon: applicatie', () => {
	let root: HTMLElement;

	beforeEach(async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-top-title-bar, nldd-page')) await waitForUpdate(el as HTMLElement);
	});

	afterEach(() => {
		root?.remove();
	});

	/** The heading levels a screen reader hears, in document order. An anchored
	 *  title bar still renders its heading, but hides it: the anchor carries it. */
	const headingLevels = () => [...root.querySelectorAll('nldd-title, nldd-top-title-bar')]
		// De sheet telt niet mee: dicht staat die niet in de boom, en open is de
		// rest inert, dus de twee koppenstructuren bestaan nooit tegelijk.
		.filter((el) => el.closest('nldd-sheet') === null)
		.map((el) => el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6'))
		.filter((heading): heading is HTMLHeadingElement => heading !== null)
		.filter((heading) => heading.closest('[aria-hidden="true"]') === null)
		.map((heading) => Number(heading.tagName.slice(1)));

	it('heeft één h1 en slaat geen kopniveau over', () => {
		const levels = headingLevels();
		expect(levels.filter((level) => level === 1).length).toBe(1);
		levels.forEach((level, i) => {
			if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
		});
	});

	it('zet de balk om de panelen heen, met een pagina per paneel', () => {
		const appView = root.firstElementChild!;
		expect(appView.tagName).toBe('NLDD-APP-VIEW');
		const bar = appView.firstElementChild!;
		expect(bar.tagName).toBe('NLDD-BAR-SPLIT-VIEW');
		// De balk van het scherm staat buiten de panelen, in een eigen pane per
		// breekpunt: op md met een zoekknop, vanaf lg met een zoekveld, en op sm
		// een balk die ná de inhoud staat en dus onderaan komt.
		const panesInBar = [...bar.querySelectorAll(':scope > nldd-split-view-pane')];
		expect(panesInBar.map((pane) => pane.getAttribute('slot'))).toEqual(['toolbar-md', 'toolbar-lg', 'main', 'toolbar-sm']);
		const [mdBar, lgBar, , phoneBar] = panesInBar;
		expect(mdBar.getAttribute('only')).toBe('md');
		expect(lgBar.getAttribute('above')).toBe('lg');
		expect(phoneBar.getAttribute('only')).toBe('sm');
		for (const strip of [mdBar, lgBar]) {
			expect(strip.querySelector('nldd-container[padding]')).not.toBeNull();
			expect(strip.querySelector('nldd-toolbar')).not.toBeNull();
			expect(strip.querySelector('nldd-tab-bar')).not.toBeNull();
		}
		// Zoeken is een knop zolang de balk smal is, en een veld zodra het past.
		expect(mdBar.querySelector('nldd-button[text="Zoeken"]')).not.toBeNull();
		expect(mdBar.querySelector('nldd-search-field')).toBeNull();
		const zoeken = lgBar.querySelector('nldd-toolbar-item[slot="center"]')!;
		expect(zoeken.querySelector('nldd-search-field')).not.toBeNull();
		expect(zoeken.getAttribute('min-width')).toBe('240px');
		// Op een telefoon zetten de tab bar en de knoppen hun label onder het icoon.
		expect(phoneBar.querySelector('nldd-toolbar[size="lg"]')).not.toBeNull();
		expect(phoneBar.querySelector('nldd-button')).toBeNull();
		expect(phoneBar.querySelectorAll('nldd-icon-button[text]').length).toBe(2);
		expect([...phoneBar.querySelectorAll('nldd-tab-bar-item')].every((tab) => tab.hasAttribute('icon'))).toBe(true);
		// Het account hangt aan een knop met een menu, niet aan een losse knop.
		const account = lgBar.querySelector('[icon="account"]')!;
		expect(account.hasAttribute('expandable')).toBe(true);
		expect(account.querySelector('nldd-menu[slot="popup"]')).not.toBeNull();
		const nav = bar.querySelector('nldd-split-view-pane[slot="main"] > nldd-navigation-split-view')!;
		expect(nav).not.toBeNull();
		const panes = [...nav.querySelectorAll(':scope > nldd-split-view-pane')];
		expect(panes.map((pane) => pane.getAttribute('slot'))).toEqual(['primary-sidebar', 'main']);
		expect(panes.every((pane) => pane.querySelector(':scope > nldd-page') !== null)).toBe(true);
	});

	it('houdt één main over, bij het paneel met de hoofdinhoud', () => {
		const mains = [...root.querySelectorAll('nldd-page')].filter((page) => page.shadowRoot!.querySelector('main.page__main'));
		expect(mains.length).toBe(1);
		expect(mains[0].closest('nldd-split-view-pane')!.getAttribute('slot')).toBe('main');
	});

	it('laat elke werkbalkknop terugvallen op het overflow-menu', () => {
		const items = [...root.querySelectorAll('nldd-toolbar-item')];
		expect(items.length).toBeGreaterThan(0);
		// Zonder een kind in slot="overflow" is de actie weg zodra de balk te smal
		// wordt: de knop verdwijnt en er komt niets voor in de plaats.
		expect(items.every((item) => item.querySelector('[slot="overflow"]') !== null)).toBe(true);
		// En wat in de fallback staat is hetzelfde menu, niet een deel ervan.
		for (const account of root.querySelectorAll('nldd-toolbar-item:has([icon="account"])')) {
			const popup = [...account.querySelectorAll('nldd-menu[slot="popup"] > nldd-menu-item')];
			const fallback = [...account.querySelectorAll('[slot="overflow"] nldd-menu-item')];
			expect(fallback.map((item) => item.getAttribute('text'))).toEqual(popup.map((item) => item.getAttribute('text')));
		}
	});

	it('zet het detail in een sheet buiten de app view', () => {
		const sheet = root.querySelector('nldd-sheet')!;
		expect(sheet.closest('nldd-app-view')).toBeNull();
		expect(sheet.querySelector('nldd-top-title-bar')!.getAttribute('text')).toBe('Dossier D-318');
	});

	it('wijst elke rij naar wat die opent', () => {
		const rows = [...root.querySelectorAll('nldd-navigation-split-view > nldd-split-view-pane[slot="main"] nldd-list-item')];
		expect(rows.length).toBeGreaterThan(1);
		expect(rows.every((row) => row.querySelector('nldd-icon-cell[icon="chevron-right"]') !== null)).toBe(true);
	});

	it('zet een vlak met background en niet met eigen stijl', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		expect(written.querySelectorAll('[style]').length).toBe(0);
	});

	it('geeft de lijst een eigen werkbalk, binnen het paneel', () => {
		const pane = root.querySelector('nldd-navigation-split-view > nldd-split-view-pane[slot="main"]')!;
		const toolbar = pane.querySelector('nldd-toolbar')!;
		expect(toolbar).not.toBeNull();
		expect(toolbar.querySelector('nldd-button[text="Nieuw dossier"]')).not.toBeNull();
		// En de titelbalk van het paneel wijst naar de kop in de inhoud.
		for (const bar of root.querySelectorAll('nldd-top-title-bar[collapse-anchor]')) {
			const anchor = root.querySelector(`#${bar.getAttribute('collapse-anchor')}`)!;
			expect(anchor.getAttribute('text')).toBe(bar.getAttribute('text'));
		}
	});
});
