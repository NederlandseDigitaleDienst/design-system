/**
 * What every page of the site runs: the stage, and the few things that belong
 * to the site itself. The components are not loaded here. Each page has an
 * entry of its own that loads the ones its markup uses, so a page does not
 * wait for the hundred components it does not show.
 */

import './autoload.js';
import './stage.js';
import './built-with.js';

/**
 * A Storybook address on the root (`?path=/docs/components-actions-button--docs`)
 * goes on to the page that replaced it.
 */
function followOldAddress(): void {
	const path = new URLSearchParams(location.search).get('path');
	const data = document.getElementById('site-redirects');
	if (!path || !data) return;
	const id = path.match(/^\/(?:docs|story)\/([a-z0-9-]+)--/)?.[1];
	const target = id && (JSON.parse(data.textContent ?? '{}') as Record<string, string>)[id];
	if (target) location.replace(import.meta.env.BASE_URL + target.slice(1) + location.hash);
}

/** The search field above a set of cards hides the cards that do not match. */
function wireFilter(): void {
	const field = document.querySelector('[data-site-filter]');
	if (!field) return;
	const empty = document.querySelector<HTMLElement>('.site-filter-empty');
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

/** Below the width where the sidebar is a sheet, a button opens it. */
function wireNavigation(): void {
	for (const trigger of document.querySelectorAll('[data-site-nav-trigger]')) {
		trigger.addEventListener('click', () => {
			(trigger.closest('nldd-sidebar-section') as (HTMLElement & { toggle(): void }) | null)?.toggle();
		});
	}
}

followOldAddress();
wireFilter();
wireNavigation();
