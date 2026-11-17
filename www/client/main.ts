/**
 * What every page of the site runs: the stage, and the few things that belong
 * to the site itself. The components are not loaded here. Each page has an
 * entry of its own that loads the ones its markup uses, so a page does not
 * wait for the hundred components it does not show.
 */

import './autoload.js';
import { chooseTheme, chosenTheme, showTheme } from './theme.js';
import './stage.js';
import './built-with.js';

/** The search field above a set of cards hides the cards that do not match. */
function wireFilter(): void {
	const field = document.querySelector('[data-site-filter]');
	if (!field) return;
	const empty = document.querySelector<HTMLElement>('[data-site-filter-empty]');
	field.addEventListener('input', (event) => {
		const query = String((event as CustomEvent).detail?.value ?? '').trim().toLowerCase();
		let shown = 0;
		for (const group of document.querySelectorAll<HTMLElement>('[data-filter-group]')) {
			let inGroup = 0;
			for (const card of group.querySelectorAll<HTMLElement>('[data-search]')) {
				const match = !query || (card.dataset.search ?? '').includes(query);
				card.hidden = !match;
				if (match) inGroup += 1;
			}
			group.hidden = inGroup === 0;
			shown += inGroup;
		}
		if (empty) empty.hidden = shown > 0;
	});
}

/**
 * Below the width where the sidebar is a sheet, a button opens it. The button
 * says whether the sheet is open, as the content page pattern has it.
 */
function wireSidebar(): void {
	for (const trigger of document.querySelectorAll<HTMLElement & { expanded: boolean }>('[data-site-sidebar]')) {
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

/**
 * The menu in the bar shows the site in another theme, and the choice goes
 * along to the next page.
 */
function wireTheme(): void {
	const items = [...document.querySelectorAll<HTMLElement>('[data-site-theme] nldd-menu-item')];
	const mark = (theme: string) => {
		for (const item of items) item.toggleAttribute('selected', item.getAttribute('value') === theme);
	};
	showTheme(chosenTheme());
	mark(chosenTheme());
	for (const item of items) {
		item.addEventListener('select', () => {
			const theme = item.getAttribute('value') ?? '';
			chooseTheme(theme);
			mark(theme);
		});
	}
}

wireTheme();
wireFilter();
wireSidebar();
