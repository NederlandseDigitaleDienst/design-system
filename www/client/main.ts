/**
 * What every page of the site runs: the stage, and the few things that belong
 * to the site itself. The components are not loaded here. Each page has an
 * entry of its own that loads the ones its markup uses, so a page does not
 * wait for the hundred components it does not show.
 */

import './autoload.js';
import { chooseScheme, chooseTheme, chosenScheme, chosenTheme, showTheme } from './theme.js';
import './stage.js';
import './navigate.js';

/**
 * A title bar with a back button and no link goes back to the sections, which
 * have no page of their own. Main empties, or the list of a section goes away,
 * and the split view shows the pane before it.
 */
function wireBack(): void {
	const view = document.querySelector('nldd-navigation-split-view');
	view?.addEventListener('back', (event) => {
		const pane = (event.target as Element).closest('nldd-split-view-pane');
		if (pane?.getAttribute('slot') === 'secondary-sidebar') pane.remove();
		else pane?.removeAttribute('has-content');
	});
}

/**
 * Below the width where the sidebar is a sheet, a button opens it. The button
 * says whether the sheet is open, as the content page pattern has it.
 */
function wireSidebar(root: ParentNode = document): void {
	for (const trigger of root.querySelectorAll<HTMLElement & { expanded: boolean }>('[data-site-sidebar]')) {
		const section = trigger.closest('nldd-sidebar-section') as (HTMLElement & { show(): void }) | null;
		if (!section) continue;
		trigger.addEventListener('click', () => section.show());
		section.addEventListener('open', () => {
			trigger.expanded = true;
		});
		section.addEventListener('close', () => {
			trigger.expanded = false;
		});
	}
}

let contentsWatcher: IntersectionObserver | null = null;

/**
 * The row in the table of contents of the heading being read is current: the
 * last heading past the top third of the window, else the first, as the
 * content page pattern has it.
 */
function wireContents(root: ParentNode = document): void {
	contentsWatcher?.disconnect();
	contentsWatcher = null;
	const rows = [
		...root.querySelectorAll<HTMLElement & { current: boolean }>(
			'nldd-sidebar-section > [slot="sidebar"] nldd-list-item[href^="#"]',
		),
	];
	const headings = rows
		.map((row) => document.getElementById(decodeURIComponent(row.getAttribute('href')!.slice(1))))
		.filter((heading): heading is HTMLElement => !!heading);
	if (!headings.length) return;
	const mark = () => {
		const line = innerHeight / 3;
		const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line).length;
		const active = Math.max(passed - 1, 0);
		rows.forEach((row, index) => {
			row.current = index === active;
		});
	};
	contentsWatcher = new IntersectionObserver(mark, { rootMargin: '0px 0px -67% 0px' });
	for (const heading of headings) contentsWatcher.observe(heading);
}

const SCHEME_ICONS: Record<string, string> = { system: 'display', dark: 'moon', light: 'sun' };

/**
 * The theme picker in the toolbar: swatches for the theme, toggle buttons for
 * the color scheme. The button shows the scheme as its icon and the theme as
 * its text. The overflow menu of the toolbar has the themes as radio items.
 * Both choices go along to the next page.
 */
function wireTheme(): void {
	const button = document.querySelector<HTMLElement>('[data-site-theme-button]');
	const picker = document.querySelector<HTMLElement & { value: string }>('[data-site-theme-picker]');
	const items = [...document.querySelectorAll<HTMLElement>('[data-site-theme-item]')];
	const schemes = document.querySelector('[data-site-scheme]');

	const showChosenTheme = (theme: string) => {
		const name = picker?.querySelector(`nldd-swatch-picker-item[value="${theme}"]`)?.getAttribute('text');
		if (name) button?.setAttribute('text', name);
		if (picker && picker.value !== theme) picker.value = theme;
		for (const item of items) item.toggleAttribute('selected', item.getAttribute('value') === theme);
	};
	const showChosenScheme = (scheme: string) => {
		button?.setAttribute('start-icon', SCHEME_ICONS[scheme] ?? SCHEME_ICONS.system);
		for (const toggle of schemes?.querySelectorAll('nldd-toggle-button') ?? []) {
			toggle.toggleAttribute('selected', toggle.getAttribute('value') === scheme);
		}
	};

	showTheme(chosenTheme());
	showChosenTheme(chosenTheme());
	showChosenScheme(chosenScheme());

	picker?.addEventListener('change', (event) => {
		const theme = (event as CustomEvent<{ value: string }>).detail.value;
		chooseTheme(theme);
		showChosenTheme(theme);
	});
	for (const item of items) {
		item.addEventListener('select', () => {
			const theme = item.getAttribute('value') ?? '';
			chooseTheme(theme);
			showChosenTheme(theme);
		});
	}
	schemes?.addEventListener('change', (event) => {
		const { selected, value } = (event as CustomEvent<{ selected: boolean; value: string }>).detail;
		if (!selected) return;
		chooseScheme(value);
		showChosenScheme(value);
	});
}

wireTheme();
wireBack();
wireSidebar();
wireContents();
document.addEventListener('site-navigate', (event) => {
	const { main } = (event as CustomEvent<{ main: Element }>).detail;
	wireSidebar(main);
	wireContents(main);
});
