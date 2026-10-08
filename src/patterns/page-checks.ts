import { expect } from 'vitest';

/**
 * The heading levels a page renders, in document order: the ones nldd-title
 * draws in its shadow root and the plain ones inside an nldd-rich-text.
 */
export function headingLevels(root: HTMLElement): number[] {
	return [...root.querySelectorAll('nldd-title, nldd-rich-text :is(h1, h2, h3, h4, h5, h6)')]
		.map((el) => /^H[1-6]$/.test(el.tagName) ? el : el.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6'))
		.filter((heading): heading is HTMLHeadingElement => heading !== null)
		.map((heading) => Number(heading.tagName.slice(1)));
}

/** One h1, and no level skipped on the way down. */
export function expectSoundHeadings(root: HTMLElement) {
	const levels = headingLevels(root);
	expect(levels.filter((level) => level === 1).length).toBe(1);
	levels.forEach((level, i) => {
		if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
	});
}

/** Every card that is a link carries a name, since its overlay anchor has no text. */
export function expectNamedLinkCards(root: HTMLElement) {
	// The card reflects an empty href onto every instance, so match a real one.
	const cards = [...root.querySelectorAll('nldd-card[href]:not([href=""])')];
	expect(cards.length).toBeGreaterThan(0);
	for (const card of cards) {
		const title = card.querySelector('nldd-title')?.getAttribute('text');
		expect(card.getAttribute('accessible-label')).toBe(title);
		expect(card.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe(title);
	}
}

/** The breadcrumbs sit in the footer row, ending on the current page. */
export function expectBreadcrumbsInFooter(root: HTMLElement) {
	const crumbs = root.querySelector('nldd-breadcrumbs')!;
	expect(crumbs.getAttribute('slot')).toBe('breadcrumbs');
	expect(crumbs.parentElement!.tagName).toBe('NLDD-PAGE-FOOTER');
	expect(crumbs.lastElementChild!.hasAttribute('current')).toBe(true);
}

/**
 * The top bar carries search and language in its utility slot, and a way back
 * to the page above on every page but the home.
 */
export function expectTopBar(root: HTMLElement, back: string | null) {
	const bar = root.querySelector('nldd-top-navigation-bar')!;
	const utility = bar.querySelector(':scope > nldd-menu-bar[slot="utility"]')!;
	expect(utility.querySelector('nldd-menu-bar-item[icon="magnifier"][href]')).not.toBeNull();
	const switcher = utility.querySelector('nldd-menu-bar-item[expandable]')!;
	const code = switcher.getAttribute('text')!;
	expect(code).toMatch(/^[A-Z]{2}$/);
	expect(switcher.getAttribute('accessible-label')).toContain(code);
	const languages = [...switcher.querySelectorAll('nldd-menu-item[type="radio"]')];
	expect(languages.length).toBeGreaterThan(1);
	expect(languages.filter((item) => item.hasAttribute('selected')).length).toBe(1);
	expect(languages.every((item) => item.getAttribute('text')!.length > 2)).toBe(true);
	for (const item of languages) {
		if (item.getAttribute('text') !== 'Nederlands') expect(item.hasAttribute('lang')).toBe(true);
	}
	if (back === null) {
		expect(bar.hasAttribute('back-text') || bar.hasAttribute('back-href')).toBe(false);
	} else {
		expect(bar.getAttribute('back-text')).toBe(back);
		expect(bar.getAttribute('back-href')).toBeTruthy();
	}
}

/**
 * The legal bar links straight to contact, accessibility and privacy on every
 * page: a privacy statement grouped under "Over deze website" alone is not
 * easily accessible (WP260, paragraph 11).
 */
export function expectLegalBar(root: HTMLElement) {
	const bar = root.querySelector('nldd-page-footer > nldd-page-footer-legal-bar[slot="legal-bar"]')!;
	const end = [...bar.querySelectorAll(':scope > nldd-page-footer-legal-bar-item[slot="end"]')];
	expect(end.map((item) => item.getAttribute('text'))).toEqual(['Contact', 'Toegankelijkheid', 'Privacy', 'Over deze website']);
	expect(end.every((item) => item.getAttribute('href'))).toBe(true);
}

/**
 * A section with an image on one side and a title, text and link on the other,
 * in that order in the markup so the narrow stack reads the same way.
 */
export function expectImageAndText(section: Element, imageSide: 'left' | 'right') {
	expect(section.tagName).toBe('NLDD-ONE-HALF-ONE-HALF-SECTION');
	const textSide = imageSide === 'left' ? 'right' : 'left';
	const image = section.querySelector(`:scope > nldd-image[slot="${imageSide}"]`)!;
	expect(image.getAttribute('aspect-ratio')).toBeTruthy();
	const text = [...section.querySelectorAll(`:scope > [slot="${textSide}"]`)];
	expect(text.map((el) => el.tagName)).toEqual(expect.arrayContaining(['NLDD-TITLE', 'NLDD-RICH-TEXT', 'NLDD-LINK']));
	const first = section.querySelector(':scope > [slot="left"], :scope > [slot="right"]')!;
	expect(first.getAttribute('slot')).toBe('left');
}

/**
 * A section like the navigation page: the title and a short text in the left
 * third, a navigation list in the other two thirds whose rows each end on a
 * chevron.
 */
export function expectTextAndLinkList(section: Element) {
	expect(section.tagName).toBe('NLDD-ONE-THIRD-TWO-THIRDS-SECTION');
	const title = section.querySelector(':scope > nldd-title[slot="left"]')!;
	expect(section.querySelector(':scope > nldd-rich-text[slot="left"]')).not.toBeNull();
	const list = section.querySelector(':scope > nldd-list[slot="right"]')!;
	expect(list.getAttribute('type')).toBe('navigation');
	expect(list.getAttribute('aria-label')).toBe(title.getAttribute('text'));
	const rows = [...list.querySelectorAll(':scope > nldd-list-item')];
	expect(rows.length).toBeGreaterThan(1);
	for (const row of rows) {
		expect(row.getAttribute('href')).toBeTruthy();
		expect([...row.children].map((cell) => cell.tagName)).toEqual(['NLDD-TEXT-CELL', 'NLDD-SPACER-CELL', 'NLDD-ICON-CELL']);
	}
}

/** The section header holds the title and an intro, loose in the slot. */
export function expectHeaderIntro(section: Element) {
	expect(section.querySelector(':scope > nldd-title[slot="header"]')).not.toBeNull();
	expect(section.querySelectorAll(':scope > nldd-rich-text[slot="header"] p').length).toBe(1);
}
