/**
 * Moves between the pages of the documentation without loading the whole
 * page. Every page is still a page of its own, built by the generator: this
 * fetches the next one and puts its panes in place of the ones on screen, so
 * the toolbar and the sidebars stay where they are, scrolled as they were.
 *
 * Only what differs is replaced: main always, the second sidebar when the
 * section has another list, and in both sidebars the item that is current.
 * The components the new panes use are loaded before they are shown, so they
 * do not appear bare. Whatever this cannot do (another kind of page, a failed
 * request) is left to the browser, as an ordinary navigation.
 */

import loaders from 'virtual:site-components';

const PANE = (slot: string) => `:scope > nldd-split-view-pane[slot="${slot}"]`;

/** The link a click follows, when it is one this script may take over. */
function linkOf(event: MouseEvent): URL | null {
	if (event.defaultPrevented || event.button !== 0) return null;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
	const path = event.composedPath();
	// An example on a stage is a page of its own; its links are left to it.
	if (path.some((node) => node instanceof Element && node.localName === 'site-stage')) return null;
	const anchor = path.find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement && node.hasAttribute('href'));
	if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null;
	const url = new URL(anchor.href, location.href);
	if (url.origin !== location.origin) return null;
	// A jump within the page stays the browser's.
	if (url.pathname === location.pathname && url.search === location.search && url.hash) return null;
	return url;
}

async function fetchPage(url: URL): Promise<Document | null> {
	const response = await fetch(url, { headers: { Accept: 'text/html' } });
	if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return null;
	return new DOMParser().parseFromString(await response.text(), 'text/html');
}

/** Loads the components a piece of markup uses that the page does not have yet. */
async function loadComponents(root: Element): Promise<void> {
	const tags = new Set([root, ...root.querySelectorAll('*')].map((element) => element.localName));
	await Promise.all(
		[...tags]
			.filter((tag) => loaders[tag] && !customElements.get(tag))
			.map((tag) => loaders[tag]().then(() => customElements.whenDefined(tag))),
	);
}

/** Marks in a list on screen the item the new page marks. */
function syncCurrent(onScreen: Element, next: Element): void {
	const current = new Set(
		[...next.querySelectorAll('nldd-list-item[current]')].map((item) => item.getAttribute('href')),
	);
	for (const item of onScreen.querySelectorAll('nldd-list-item[href]')) {
		item.toggleAttribute('current', current.has(item.getAttribute('href')));
	}
}

const hrefsOf = (pane: Element | null) =>
	[...(pane?.querySelectorAll('nldd-list-item[href]') ?? [])].map((item) => item.getAttribute('href')).join(' ');

/**
 * Where each sidebar on screen is scrolled to, to put back after the swap: a
 * sidebar that comes back as a new element (another list) starts at its top,
 * one that stays is where it was, whatever the browser did meanwhile.
 */
function sidebarScroll(view: Element): { restore(): void } {
	const scrollerOf = (pane: Element | null) =>
		pane?.querySelector(':scope > nldd-page')?.shadowRoot?.querySelector<HTMLElement>('.page__scroll') ?? null;
	const kept = ['primary-sidebar', 'secondary-sidebar'].map((slot) => {
		const pane = view.querySelector(PANE(slot));
		return { pane, top: scrollerOf(pane)?.scrollTop ?? 0 };
	});
	return {
		restore() {
			for (const { pane, top } of kept) {
				const scroller = pane?.isConnected ? scrollerOf(pane) : null;
				if (scroller && scroller.scrollTop !== top) scroller.scrollTop = top;
			}
		},
	};
}

/** Puts the panes of the next page in place. */
function swap(view: Element, next: Document, nextView: Element): Element {
	const primary = view.querySelector(PANE('primary-sidebar'));
	const nextPrimary = nextView.querySelector(PANE('primary-sidebar'));
	if (primary && nextPrimary) syncCurrent(primary, nextPrimary);

	const secondary = view.querySelector(PANE('secondary-sidebar'));
	const nextSecondary = nextView.querySelector(PANE('secondary-sidebar'));
	if (secondary && nextSecondary && hrefsOf(secondary) === hrefsOf(nextSecondary)) {
		syncCurrent(secondary, nextSecondary);
	} else if (nextSecondary) {
		const adopted = document.adoptNode(nextSecondary);
		if (secondary) secondary.replaceWith(adopted);
		else view.querySelector(PANE('main'))?.before(adopted);
	} else {
		secondary?.remove();
	}

	// The pane stays and takes the content of the next one: in WebKit a pane
	// that leaves its slot resets the scroll of the sidebars beside it.
	const nextMain = nextView.querySelector(PANE('main'))!;
	const main = view.querySelector(PANE('main'))!;
	main.toggleAttribute('has-content', nextMain.hasAttribute('has-content'));
	main.replaceChildren(...[...nextMain.children].map((child) => document.adoptNode(child)));

	document.title = next.title;
	const description = next.querySelector('meta[name="description"]')?.getAttribute('content');
	if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
	return main;
}

/**
 * After the swap: the place on the page the URL names, and focus. A choice in
 * a sidebar keeps its focus there, as in an application, so the item shows
 * as chosen. A tab chosen in main is there again on the new page, and gets
 * the focus back. Otherwise focus was in main, which is gone, and goes to the
 * title of the new page, so a screen reader hears where it is.
 */
async function settle(
	view: Element,
	main: Element,
	url: URL,
	{ restore, keepFocus, tab }: { restore: boolean; keepFocus: boolean; tab: boolean },
): Promise<void> {
	const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
	if (target) target.scrollIntoView();
	else if (!restore) scrollTo(0, 0);
	// When the panes stack, the sidebar gives way to main: focus goes along.
	await new Promise((resolve) => setTimeout(resolve));
	await (view as Element & { updateComplete?: Promise<unknown> }).updateComplete;
	const focused = document.activeElement?.closest('nldd-split-view-pane');
	const chosenTab = tab ? main.querySelector<HTMLElement>('nldd-tab-bar-item[current]') : null;
	if (chosenTab) chosenTab.focus({ preventScroll: true });
	else if (keepFocus && focused?.checkVisibility()) {
		// Stays where it is.
	} else if (main.checkVisibility()) focusTitle(main);
	else {
		const shown = ORDER.map((name) => view.querySelector(PANE(name))).filter((pane) => pane?.checkVisibility());
		if (shown.length) focusPane(shown[shown.length - 1]!);
	}
	document.dispatchEvent(new CustomEvent('site-navigate', { detail: { main } }));
}

function focusTitle(main: Element): void {
	const heading = main.querySelector<HTMLElement>('#pagina-titel :is(h1, h2)') ?? main.querySelector<HTMLElement>('nldd-page');
	if (!heading) return;
	heading.tabIndex = -1;
	// Focus is there to announce the page, not to show where you are: no ring,
	// also in Safari, where the reset of nldd-title brings back its own.
	// @ts-expect-error lib.dom lacks focusVisible; this fails once it has it.
	const noRing: FocusOptions = { preventScroll: true, focusVisible: false };
	heading.focus(noRing);
}

let pending: AbortController | null = null;

/** A back button took a pane away, so the page on screen is less than its own. */
let trimmed = false;

/** The page on screen, so a step back within it (to an anchor) is left alone. */
let shown = location.pathname + location.search;

async function go(
	url: URL,
	{ push, fromSidebar = false, fromTab = false }: { push: boolean; fromSidebar?: boolean; fromTab?: boolean },
): Promise<void> {
	const view = document.querySelector('nldd-navigation-split-view');
	if (!view) {
		location.assign(url);
		return;
	}
	pending?.abort();
	const controller = (pending = new AbortController());
	const next = await fetchPage(url).catch(() => null);
	if (controller.signal.aborted) return;
	const nextView = next?.querySelector('nldd-navigation-split-view');
	if (!next || !nextView?.querySelector(PANE('main'))) {
		location.assign(url);
		return;
	}
	await loadComponents(nextView);
	if (controller.signal.aborted) return;

	if (push) history.pushState({ site: true }, '', url);
	shown = url.pathname + url.search;
	trimmed = false;
	const scrolled = sidebarScroll(view);
	const main = swap(view, next, nextView);
	scrolled.restore();
	await settle(view, main, url, { restore: !push, keepFocus: fromSidebar, tab: fromTab });
}

/**
 * A row chosen in a sidebar is marked at once, before the page is there, so
 * the choice shows the moment it is made.
 */
function markChosen(event: Event): boolean {
	const item = event
		.composedPath()
		.find((node): node is Element => node instanceof Element && node.localName === 'nldd-list-item');
	const pane = item?.closest('nldd-split-view-pane');
	if (!item || !pane || pane.getAttribute('slot') === 'main') return false;
	for (const other of item.closest('nldd-split-view-pane')!.querySelectorAll('nldd-list-item[current]')) {
		if (other !== item) other.removeAttribute('current');
	}
	item.setAttribute('current', '');
	return true;
}

document.addEventListener('click', (event) => {
	const url = linkOf(event);
	if (!url) return;
	event.preventDefault();
	const fromSidebar = markChosen(event);
	// The page on screen: nothing to load, unless a back button took a pane away.
	if (url.pathname + url.search === shown) {
		if (trimmed) void go(url, { push: false, fromSidebar });
		return;
	}
	const fromTab = event.composedPath().some((node) => node instanceof Element && node.localName === 'nldd-tab-bar-item');
	void go(url, { push: true, fromSidebar, fromTab });
});

document.querySelector('nldd-navigation-split-view')?.addEventListener('back', () => {
	trimmed = true;
});

addEventListener('popstate', () => {
	const url = new URL(location.href);
	if (url.pathname + url.search === shown) return;
	void go(url, { push: false });
});

/*
 * Trial: arrow keys move between the panes, as in an application with columns.
 * Right goes from a list to the next pane, left from there back to the row it
 * came from. This belongs in nldd-navigation-split-view; it is here to try it.
 */
const ORDER = ['primary-sidebar', 'secondary-sidebar', 'main'];

function focusPane(pane: Element): void {
	if (pane.getAttribute('slot') === 'main') {
		focusTitle(pane);
		return;
	}
	const row = pane.querySelector<HTMLElement>('nldd-list-item[current]') ?? pane.querySelector<HTMLElement>('nldd-list-item');
	row?.focus();
}

document.querySelector('nldd-navigation-split-view')?.addEventListener('keydown', (event) => {
	const { key } = event as KeyboardEvent;
	if (event.defaultPrevented || (key !== 'ArrowRight' && key !== 'ArrowLeft')) return;
	const keyboard = event as KeyboardEvent;
	if (keyboard.metaKey || keyboard.ctrlKey || keyboard.shiftKey || keyboard.altKey) return;
	const view = event.currentTarget as Element;
	const path = event.composedPath();
	const pane = path.find((node): node is Element => node instanceof Element && node.localName === 'nldd-split-view-pane');
	if (!pane || pane.parentElement !== view) return;
	const onRow = path.some((node) => node instanceof Element && node.localName === 'nldd-list-item');
	const onTitle = path.some((node) => node instanceof Element && node.matches('#pagina-titel :is(h1, h2)'));
	const slot = pane.getAttribute('slot') ?? '';
	if (slot === 'main' ? !onTitle || key === 'ArrowRight' : !onRow) return;
	const panes = ORDER.map((name) => view.querySelector(PANE(name))).filter(
		(candidate): candidate is Element => !!candidate && candidate.checkVisibility(),
	);
	const index = panes.indexOf(pane);
	const target = panes[key === 'ArrowRight' ? index + 1 : index - 1];
	if (index < 0 || !target) return;
	event.preventDefault();
	focusPane(target);
});
