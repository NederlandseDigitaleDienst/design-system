import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './topic-page.html?raw';
import { expectBreadcrumbsInFooter, expectLegalBar, expectNamedLinkCards, expectSoundHeadings, expectTopBar } from '../page-checks.js';
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

	it('heeft één h1 en slaat geen kopniveau over', () => {
		expectSoundHeadings(root);
	});

	it('zet de hoofdtaak in de eerste sectie, als enige primaire knop', () => {
		const first = root.querySelector('nldd-page > :not([slot])')!;
		expect(first.querySelector('nldd-title[heading-level="1"]')).not.toBeNull();
		expect(first.querySelector('nldd-rich-text')).not.toBeNull();
		expect(first.querySelector('nldd-button[appearance="primary"][href]')).not.toBeNull();
		expect(root.querySelectorAll('nldd-button[appearance="primary"]').length).toBe(1);
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
