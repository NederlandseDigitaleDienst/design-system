import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './navigation-page.html?raw';
import cards from './navigation-page.cards.html?raw';
import { expectBreadcrumbsInFooter, expectLegalBar, expectNamedLinkCards, expectSoundHeadings, expectTopBar, headingLevels } from '../page-checks.js';
import '../../components/index.js';

describe('patroon: navigatiepagina', () => {
	let root: HTMLElement;

	const mount = async (source: string) => {
		root = document.createElement('div');
		root.innerHTML = source;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-page, nldd-card, nldd-list-item')) await waitForUpdate(el as HTMLElement);
	};

	afterEach(() => {
		root?.remove();
	});

	for (const [name, source] of [['lijst', markup], ['kaarten', cards]]) {
		it(`heeft zoeken en taal in de bovenbalk, met een terugknop (${name})`, async () => {
			await mount(source);
			expectTopBar(root, 'Home');
		});

		it(`heeft één h1 en slaat geen kopniveau over (${name})`, async () => {
			await mount(source);
			expectSoundHeadings(root);
		});

		it(`opent met de titel en een korte intro, zonder hero of uitgelicht vlak (${name})`, async () => {
			await mount(source);
			expect(root.querySelector('nldd-hero')).toBeNull();
			// A section reflects its default background once it upgrades, so read the written markup.
			const sections = new DOMParser().parseFromString(source, 'text/html').querySelectorAll('nldd-page > :not([slot])');
			expect(sections.length).toBe(1);
			expect(sections[0].hasAttribute('background')).toBe(false);
			const title = sections[0].querySelector(':scope > nldd-title[heading-level="1"]')!;
			const slot = title.getAttribute('slot');
			expect(['header', 'left']).toContain(slot);
			expect(sections[0].querySelector(`:scope > nldd-container`)).toBeNull();
			expect(sections[0].querySelectorAll(`:scope > nldd-rich-text[slot="${slot}"] p`).length).toBe(1);
		});

		it(`zet het kruimelpad onderaan, in de footer (${name})`, async () => {
			await mount(source);
			expectBreadcrumbsInFooter(root);
			expectLegalBar(root);
		});
	}

	it('zet de lijst naast de intro, als navigatie met een naam waarin elke rij één link is', async () => {
		await mount(markup);
		const section = root.querySelector('nldd-one-third-two-thirds-section')!;
		expect(section.querySelector(':scope > nldd-title[slot="left"][heading-level="1"]')).not.toBeNull();
		const list = section.querySelector(':scope > [slot="right"]')!;
		expect(list.tagName).toBe('NLDD-LIST');
		expect(list.getAttribute('type')).toBe('navigation');
		expect(list.getAttribute('aria-label')).toBeTruthy();
		const rows = [...list.children];
		expect(rows.length).toBeGreaterThan(3);
		expect(rows.every((row) => row.tagName === 'NLDD-LIST-ITEM' && row.getAttribute('href'))).toBe(true);
		expect(rows.every((row) => row.shadowRoot!.querySelector('a') !== null)).toBe(true);
		for (const row of rows) {
			const cells = [...row.children].map((cell) => cell.tagName);
			expect(cells).toEqual(['NLDD-TEXT-CELL', 'NLDD-SPACER-CELL', 'NLDD-ICON-CELL']);
			expect(row.lastElementChild!.getAttribute('icon')).toBe('chevron-right');
		}
		expect(headingLevels(root)).toEqual([1]);
	});

	it('zet de kaarten onder de intro in een collection over de volle breedte, en elke kaart is één link met een naam', async () => {
		await mount(cards);
		const section = root.querySelector('nldd-simple-section')!;
		expect(section.querySelector(':scope > nldd-title[slot="header"][heading-level="1"]')).not.toBeNull();
		const collection = section.querySelector(':scope > nldd-collection')!;
		expect(collection.hasAttribute('slot')).toBe(false);
		const items = [...collection.children];
		expect(items.length).toBeGreaterThan(3);
		expect(items.every((card) => card.tagName === 'NLDD-CARD' && card.getAttribute('href'))).toBe(true);
		expect(root.querySelectorAll('nldd-card nldd-button, nldd-card nldd-link').length).toBe(0);
		expectNamedLinkCards(root);
		expect(headingLevels(root)).toEqual([1, 2, 2, 2, 2, 2, 2]);
	});
});
