import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './home-page.html?raw';
import { expectHeaderIntro, expectImageAndText, expectLegalBar, expectSoundHeadings, expectTextAndLinkList, expectTopBar } from '../page-checks.js';
import '../../components/index.js';

describe('patroon: home', () => {
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

	it('heeft zoeken en taal in de bovenbalk, zonder terugknop', () => {
		expectTopBar(root, null);
	});

	it('linkt in de juridische rij direct naar contact, toegankelijkheid en privacy', () => {
		expectLegalBar(root);
	});

	it('geeft de kaarten een intro, zet beeld en tekst naast elkaar en de onderwerpen in een lijst', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		expectHeaderIntro(written.querySelector('nldd-simple-section:has(nldd-collection)')!);
		const halves = [...written.querySelectorAll('nldd-one-half-one-half-section')];
		expect(halves.length).toBe(1);
		expectImageAndText(halves[0], 'left');
		expectTextAndLinkList(written.querySelector('nldd-one-third-two-thirds-section')!);
	});

	it('heeft één h1 en slaat geen kopniveau over', () => {
		expectSoundHeadings(root);
	});

	it('geeft elke kaart een onderwerp als titel en een knop met de actie, zonder dat de kaart zelf een link is', () => {
		// The button drops its default appearance from the DOM once it upgrades,
		// so read the written markup.
		const written = new DOMParser().parseFromString(markup, 'text/html');
		const cards = [...written.querySelector('nldd-collection')!.children];
		expect(cards.length).toBeGreaterThan(1);
		for (const card of cards) {
			expect(card.getAttribute('href') ?? '').toBe('');
			const footer = card.querySelector(':scope > nldd-container[slot="footer"]')!;
			const button = footer.querySelector('nldd-button')!;
			expect(button.getAttribute('appearance')).toBe('neutral-tinted');
			expect(button.getAttribute('href')).toBeTruthy();
			expect(button.getAttribute('text')).not.toBe(card.querySelector('nldd-title')!.getAttribute('text'));
		}
	});

	it('houdt de landmarks van een los document', () => {
		const page = root.querySelector('nldd-page')!;
		expect(page.shadowRoot!.querySelector('main.page__main')).not.toBeNull();
	});

	it('maakt vlakken met attributen en niet met eigen stijl', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		expect(written.querySelectorAll('[style], [class]').length).toBe(0);
		expect(written.querySelector('nldd-simple-section[background="tinted"]')).not.toBeNull();
		expect(written.querySelectorAll('nldd-simple-section[background]').length).toBeGreaterThan(1);
	});

	it('houdt één primaire knop over, voor de oproep onderaan', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		const primary = [...written.querySelectorAll('nldd-button[appearance="primary"]')];
		expect(primary.length).toBe(1);
		const sections = [...written.querySelectorAll('nldd-page > :not([slot])')];
		expect(sections[sections.length - 1].contains(primary[0])).toBe(true);
	});

	it('zet de kaarten in een collection, niet in een eigen raster', () => {
		// The collection drops layout="grid" from the DOM once it upgrades, since
		// grid is its default, so read the written markup for the attributes.
		const written = new DOMParser().parseFromString(markup, 'text/html').querySelector('nldd-collection')!;
		expect(written.getAttribute('layout')).toBe('grid');
		expect(written.hasAttribute('item-width')).toBe(true);
		const cards = [...root.querySelector('nldd-collection')!.children];
		expect(cards.length).toBeGreaterThan(1);
		expect(cards.every((card) => card.tagName === 'NLDD-CARD')).toBe(true);
	});

	it('geeft elke kaart zijn padding via een container', () => {
		const cards = [...root.querySelectorAll('nldd-card')];
		expect(cards.length).toBeGreaterThan(0);
		expect(cards.every((card) => card.querySelector(':scope > nldd-container:not([slot])[padding]') !== null)).toBe(true);
	});

	it('zet de footer in de footer-slot van de pagina, met een juridische rij', () => {
		const footer = root.querySelector('nldd-page-footer')!;
		expect(footer.getAttribute('slot')).toBe('footer');
		expect(footer.parentElement!.tagName).toBe('NLDD-PAGE');
		expect(footer.querySelector('nldd-page-footer-legal-bar[slot="legal-bar"]')).not.toBeNull();
	});
});
