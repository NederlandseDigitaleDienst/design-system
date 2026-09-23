import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './filter-a-list.html?raw';
import '../../components/index.js';

describe('patroon: een lijst filteren', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-search-field, nldd-token, nldd-sheet, nldd-list')) await waitForUpdate(el as HTMLElement);
	};

	it('zet het zoekveld in de kop van de pagina, met een naam', async () => {
		await mount();
		const search = root.querySelector('nldd-page > nldd-search-field')!;
		expect(search.getAttribute('slot')).toBe('header');
		expect(search.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Zoek een dossier');
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

	it('houdt de sheet met filters dicht in de pagina, zodat het formulier er altijd is', async () => {
		await mount();
		const sheet = root.querySelector('nldd-sheet')!;
		expect(sheet.open).toBe(false);
		expect(sheet.querySelector('nldd-form[name="filters"]')).not.toBeNull();
	});

	it('geeft de lijst een eigen zin voor als het filter niets overlaat', async () => {
		await mount();
		expect(root.querySelector('nldd-list > [slot="no-results"]')).not.toBeNull();
	});
});
