import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './topic-page.html?raw';
import { expectBreadcrumbsInFooter, expectHeaderIntro, expectImageAndText, expectLegalBar, expectNamedLinkCards, expectSoundHeadings, expectTextAndLinkList, expectTopBar } from '../page-checks.js';
import '../../components/index.js';

describe('patroon: onderwerppagina', () => {
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
		expectTopBar(root, 'Onderwerpen');
	});

	it('linkt in de juridische rij direct naar contact, toegankelijkheid en privacy', () => {
		expectLegalBar(root);
	});

	it('zet tekst en beeld naast elkaar, geeft de kaarten een intro en de pagina\'s eronder een lijst', () => {
		const written = new DOMParser().parseFromString(markup, 'text/html');
		const halves = [...written.querySelectorAll('nldd-one-half-one-half-section')];
		expect(halves.length).toBe(1);
		expectImageAndText(halves[0], 'right');
		expectHeaderIntro(written.querySelector('nldd-simple-section:has(nldd-collection)')!);
		expectTextAndLinkList(written.querySelector('nldd-one-third-two-thirds-section')!);
	});

	it('heeft één h1 en slaat geen kopniveau over', () => {
		expectSoundHeadings(root);
	});

	it('opent met een hero met de h1, een korte uitleg en de hoofdtaak als enige knop', () => {
		const first = root.querySelector('nldd-page > :not([slot])')!;
		expect(first.tagName).toBe('NLDD-HERO');
		expect(first.querySelector(':scope > nldd-title[heading-level="1"][color="inherit"]')).not.toBeNull();
		expect(first.querySelector(':scope > nldd-rich-text[color="inherit"]')).not.toBeNull();
		const buttons = [...first.querySelectorAll('nldd-button')];
		expect(buttons.length).toBe(1);
		expect(buttons[0].getAttribute('appearance')).toBe('inherit-filled');
		expect(buttons[0].getAttribute('href')).toBeTruthy();
		expect(root.querySelectorAll('nldd-button').length).toBe(1);
	});

	it('maakt van elke kaart één link met een naam', () => {
		expectNamedLinkCards(root);
	});

	it('zet verwante onderwerpen als links, niet als kaarten', () => {
		const sections = [...root.querySelectorAll('nldd-page > :not([slot])')];
		const related = sections[sections.length - 1];
		expect(related.querySelectorAll('nldd-link[href]').length).toBeGreaterThan(1);
		expect(related.querySelector('nldd-card')).toBeNull();
	});

	it('zet het kruimelpad onderaan, in de footer', () => {
		expectBreadcrumbsInFooter(root);
	});
});
