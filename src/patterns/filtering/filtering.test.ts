import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './filtering.html?raw';
import '../../components/index.js';

describe('patroon: filteren', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-search-field, nldd-token, nldd-sidebar-section, nldd-list')) await waitForUpdate(el as HTMLElement);
	};

	it('zet de filters in de zijbalk van de sectie, niet in een eigen sheet', async () => {
		await mount();
		const section = root.querySelector('nldd-sidebar-section')!;
		expect(section.getAttribute('sidebar-label')).toBe('Filters');
		const lijsten = [...section.querySelectorAll('[slot="sidebar"] nldd-list')];
		expect(lijsten.length).toBe(2);
		expect(lijsten.every((lijst) => lijst.getAttribute('accessible-label'))).toBeTruthy();
		// De rij is zelf de checkbox, dus de checkbox erin is alleen weergave.
		const rijen = [...section.querySelectorAll('[slot="sidebar"] nldd-list-item')];
		expect(rijen.every((rij) => rij.hasAttribute('checkbox'))).toBe(true);
		expect(rijen.every((rij) => rij.querySelector('nldd-checkbox[decorative]') !== null)).toBe(true);
		// Eén kopie van de filters, dus de keuzes overleven de wissel tussen kolom en sheet.
		expect(root.querySelectorAll('nldd-sheet').length).toBe(0);
	});

	it('toont de knop naar de filters alleen als er een sheet te openen valt', async () => {
		await mount();
		const section = root.querySelector('nldd-sidebar-section')!;
		const trigger = root.querySelector('#filters-openen')! as HTMLElement;
		// De sectie zet `collapsed` zelf vanuit een ResizeObserver; hier sturen we
		// het attribuut met de hand om beide kanten van de CSS-regel te meten.
		section.removeAttribute('collapsed');
		expect(getComputedStyle(trigger).display).toBe('none');
		section.setAttribute('collapsed', '');
		// De werkbalk zet zelf `hidden` op een item dat in het overflow-menu past,
		// en daar houdt de regel rekening mee: zonder :not([hidden]) zou de knop
		// juist naast de overflow-knop blijven staan.
		trigger.removeAttribute('hidden');
		// Niet op 'inline-flex' toetsen: in een flex-rij blokificeert dat naar 'flex'.
		expect(getComputedStyle(trigger).display).not.toBe('none');
	});

	it('zet het zoekveld in de werkbalk, met een naam', async () => {
		await mount();
		const search = root.querySelector('nldd-toolbar nldd-search-field')!;
		// Geen accessible-label: de placeholder is hier een naam en geen voorbeeld.
		expect(search.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Zoeken');
		expect(search.closest('nldd-toolbar-item')!.getAttribute('min-width')).toBe('240px');
	});

	it('geeft elke werkbalkknop een terugval in het overflow-menu', async () => {
		await mount();
		const items = [...root.querySelectorAll('nldd-toolbar-item')];
		expect(items.length).toBeGreaterThan(0);
		expect(items.every((item) => item.querySelector('[slot="overflow"]') !== null)).toBe(true);
	});

	it('noemt bij elk actief filter de verwijderknop naar het filter', async () => {
		await mount();
		for (const token of root.querySelectorAll('nldd-token')) {
			const button = token.shadowRoot!.querySelector('.token__dismiss-action nldd-icon-button')!;
			expect(button.getAttribute('accessible-label')).toBe(`Verwijder "${token.getAttribute('text')}"`);
		}
	});

	it('laat de tokens doorlopen op een volgende regel', async () => {
		await mount();
		expect(root.querySelector('nldd-token')!.parentElement!.getAttribute('layout')).toBe('wrap');
	});

	it('meldt het aantal resultaten in een live region', async () => {
		await mount();
		const telling = root.querySelector('[aria-live="polite"]')!;
		expect(telling.textContent!.trim()).toBe('2 dossiers');
		// Boven de lijst en onder de tokens: het hoort bij de selectie, niet bij de bediening.
		expect(telling.closest('nldd-toolbar')).toBeNull();
		const kinderen = [...root.querySelector('nldd-sidebar-section')!.children];
		const tellingIndex = kinderen.findIndex((kind) => kind.contains(telling));
		const lijstIndex = kinderen.findIndex((kind) => kind.matches('nldd-list'));
		const tokensIndex = kinderen.findIndex((kind) => kind.querySelector('nldd-token'));
		expect(tokensIndex).toBeLessThan(tellingIndex);
		expect(tellingIndex).toBeLessThan(lijstIndex);
	});

	it('geeft de lijst een eigen zin voor als het filter niets overlaat', async () => {
		await mount();
		expect(root.querySelector('nldd-list > [slot="no-results"]')).not.toBeNull();
	});
});
