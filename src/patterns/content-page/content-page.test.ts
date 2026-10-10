import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './content-page.html?raw';
import short from './content-page.short.html?raw';
import { Standaard } from './content-page.stories.js';
import { expectBreadcrumbsInFooter, expectLegalBar, expectNamedLinkCards, expectSoundHeadings, expectTopBar } from '../page-checks.js';
import '../../components/index.js';

describe('patroon: contentpagina', () => {
	let root: HTMLElement;

	beforeEach(async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-title, nldd-page, nldd-card')) await waitForUpdate(el as HTMLElement);
	});

	afterEach(() => {
		root?.remove();
	});

	it('heeft zoeken en taal in de bovenbalk, met een terugknop', () => {
		expectTopBar(root, 'Aanvragen');
	});

	it('linkt in de juridische rij direct naar contact, toegankelijkheid en privacy', () => {
		expectLegalBar(root);
	});

	it('heeft één h1, ook met de koppen in de rich text, en slaat geen kopniveau over', () => {
		expectSoundHeadings(root);
		expect(root.querySelectorAll('nldd-rich-text h2').length).toBeGreaterThan(0);
	});

	it('opent zonder hero, met de titel als kop', () => {
		expect(root.querySelector('nldd-hero')).toBeNull();
		const first = root.querySelector('nldd-page > :not([slot])')!;
		expect(first.querySelector(':scope > nldd-title[slot="header"][heading-level="1"]')).not.toBeNull();
	});

	it('zet een inhoudsopgave in de sidebar die naar elke kop in de tekst springt', () => {
		const section = root.querySelector('nldd-sidebar-section')!;
		const toc = section.querySelector(':scope > [slot="sidebar"] nldd-list[type="navigation"]')!;
		expect(toc.getAttribute('aria-label')).toBeTruthy();
		const headings = [...section.querySelectorAll(':scope > nldd-rich-text h2')];
		const links = [...toc.querySelectorAll('nldd-list-item')];
		expect(links.map((item) => item.getAttribute('href'))).toEqual(headings.map((h) => `#${h.id}`));
		expect(links.map((item) => item.querySelector('nldd-text-cell')!.getAttribute('text'))).toEqual(headings.map((h) => h.textContent));
		expect(links.every((item) => item.getAttribute('current-type') === 'location')).toBe(true);
		expect(links.filter((item) => item.hasAttribute('current')).length).toBe(1);
		expect(links[0].shadowRoot!.querySelector('a')!.getAttribute('aria-current')).toBe('location');
	});

	it('zet de actie na de uitleg, als enige primaire knop', () => {
		const section = root.querySelector('nldd-sidebar-section')!;
		const text = section.querySelector(':scope > nldd-rich-text')!;
		const card = section.querySelector(':scope > nldd-card')!;
		expect(text.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(card.querySelector('nldd-button[appearance="primary"]')).not.toBeNull();
		expect(root.querySelectorAll('nldd-button[appearance="primary"]').length).toBe(1);
	});

	it('laat de tekst groeien en niet Ook handig', () => {
		const sections = [...root.querySelectorAll('nldd-page > :not([slot])')];
		expect(sections[0].hasAttribute('grow')).toBe(true);
		expect(sections[sections.length - 1].hasAttribute('grow')).toBe(false);
	});

	it('houdt de landmarks van een los document', () => {
		const page = root.querySelector('nldd-page')!;
		expect(page.shadowRoot!.querySelector('main.page__main')).not.toBeNull();
		expect(page.hasAttribute('sticky-header')).toBe(false);
	});

	it('maakt vlakken met attributen en niet met eigen stijl', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		expect(written.querySelectorAll('[style], [class]').length).toBe(0);
		expect(written.querySelector('nldd-simple-section[background="tinted"]')).not.toBeNull();
	});

	it('maakt van elke kaart één link met een naam, met de padding in een container', () => {
		expectNamedLinkCards(root);
		const cards = [...root.querySelectorAll('nldd-card')];
		expect(cards.every((card) => card.querySelector(':scope > nldd-container[padding]') !== null)).toBe(true);
	});

	it('zet het kruimelpad onderaan, in de footer', () => {
		expectBreadcrumbsInFooter(root);
	});

	describe('de inhoudsopgave als sheet, op smal', () => {
		let story: HTMLElement;
		type Zijbalk = HTMLElement & { collapsed: boolean; updateComplete: Promise<boolean> };

		beforeEach(async () => {
			root.remove();
			story = document.createElement('div');
			story.style.width = '600px';
			story.append(Standaard.render());
			document.body.append(story);
			const section = story.querySelector('nldd-sidebar-section') as Zijbalk;
			await waitForUpdate(section);
			await expect.poll(() => section.collapsed).toBe(true);
		});

		afterEach(() => {
			story.remove();
		});

		it('toont de knop onder de titel alleen zolang er een sheet is', () => {
			const button = story.querySelector('#inhoud-openen')!;
			expect(getComputedStyle(button).display).not.toBe('none');
			expect(button.getAttribute('slot')).toBe('header');
			expect(button.parentElement!.tagName).toBe('NLDD-SIDEBAR-SECTION');
		});

		it('sluit de sheet bij een keuze, springt naar de kop en markeert die rij', async () => {
			const button = story.querySelector('#inhoud-openen') as HTMLElement;
			const inner = () => button.shadowRoot!.querySelector('button')!;
			inner().click();
			await expect.poll(() => inner().getAttribute('aria-expanded')).toBe('true');
			const rows = [...story.querySelectorAll('[slot="sidebar"] nldd-list-item')];
			const last = rows[rows.length - 1];
			last.shadowRoot!.querySelector('a')!.click();
			await expect.poll(() => inner().getAttribute('aria-expanded')).toBe('false');
			const heading = story.querySelector('#na-het-indienen');
			await expect.poll(() => document.activeElement).toBe(heading);
			await expect.poll(() => rows.map((row) => row.hasAttribute('current'))).toEqual([false, false, true]);
		});
	});

	describe('zonder inhoudsopgave', () => {
		let page: HTMLElement;

		beforeEach(async () => {
			page = document.createElement('div');
			page.innerHTML = short;
			document.body.append(page);
			for (const el of page.querySelectorAll('nldd-title, nldd-page, nldd-card')) await waitForUpdate(el as HTMLElement);
		});

		afterEach(() => {
			page.remove();
		});

		it('heeft dezelfde bovenbalk, footer en koppen als de pagina met inhoudsopgave', () => {
			expectTopBar(page, 'Aanvragen');
			expectLegalBar(page);
			expectBreadcrumbsInFooter(page);
			expectSoundHeadings(page);
			expectNamedLinkCards(page);
		});

		it('heeft geen sidebar en minder dan drie koppen in de tekst', () => {
			expect(page.querySelector('nldd-sidebar-section')).toBeNull();
			expect(page.querySelector('#inhoud-openen')).toBeNull();
			const h2s = page.querySelectorAll('nldd-rich-text h2');
			expect(h2s.length).toBeGreaterThan(0);
			expect(h2s.length).toBeLessThan(3);
		});

		it('zet de tekst links en de actie rechts, met de titel in de header', () => {
			const section = page.querySelector('nldd-page > :not([slot])')!;
			expect(section.tagName).toBe('NLDD-TWO-THIRDS-ONE-THIRD-SECTION');
			expect(section.hasAttribute('grow')).toBe(true);
			expect(section.querySelector(':scope > nldd-title[slot="header"][heading-level="1"]')).not.toBeNull();
			expect(section.querySelector(':scope > nldd-rich-text[slot="left"]')).not.toBeNull();
			expect(section.querySelector(':scope > nldd-card[slot="right"] nldd-button[appearance="primary"]')).not.toBeNull();
			expect(page.querySelectorAll('nldd-button[appearance="primary"]').length).toBe(1);
		});
	});
});
