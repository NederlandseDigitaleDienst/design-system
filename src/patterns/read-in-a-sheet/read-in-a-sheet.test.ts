import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './read-in-a-sheet.html?raw';
import '../../components/index.js';

describe('patroon: lezen in een sheet', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		const sheet = root.querySelector('nldd-sheet')!;
		await waitForUpdate(sheet);
		return sheet;
	};

	it('noemt de sheet naar de titel in de titelbalk', async () => {
		const sheet = await mount();
		await waitForUpdate(sheet);
		expect(sheet.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Stukken bij de aanvraag');
	});

	it('geeft de sheet dezelfde woorden als de rij die hem opent', async () => {
		const sheet = await mount();
		const row = root.querySelector('nldd-list-item nldd-text-cell')!;
		expect(sheet.querySelector('nldd-top-title-bar')!.getAttribute('text')).toBe(row.getAttribute('text'));
	});

	it('maakt van elke rij een knop met een chevron naar rechts', async () => {
		await mount();
		const rows = [...root.querySelectorAll('nldd-page nldd-list-item')];
		expect(rows.length).toBeGreaterThan(1);
		for (const row of rows) {
			expect(row.hasAttribute('button')).toBe(true);
			expect(row.querySelector('nldd-icon-cell')!.getAttribute('icon')).toBe('chevron-right');
		}
	});

	it('houdt de titelbalk in beeld, zodat hij de titel kan overnemen', async () => {
		const sheet = await mount();
		expect(sheet.querySelector('nldd-page')!.hasAttribute('sticky-header')).toBe(true);
	});

	it('laat de titelbalk naar de kop in de inhoud wijzen, met dezelfde woorden', async () => {
		const sheet = await mount();
		const bar = sheet.querySelector('nldd-top-title-bar')!;
		const heading = sheet.querySelector(`#${bar.getAttribute('collapse-anchor')}`)!;
		expect(heading.tagName).toBe('NLDD-TITLE');
		expect(heading.getAttribute('text')).toBe(bar.getAttribute('text'));
	});

	it('heeft alleen een uitweg die sluit heet, en geen actie', async () => {
		const sheet = await mount();
		expect(sheet.querySelector('nldd-top-title-bar')!.getAttribute('dismiss-text')).toBe('Sluit');
		expect(sheet.querySelector('nldd-button, nldd-form')).toBeNull();
	});

	it('sluit via de sluitknop en zet open uit', async () => {
		const sheet = await mount();
		sheet.open = true;
		await waitForUpdate(sheet);
		const closed = new Promise((resolve) => sheet.addEventListener('close', resolve, { once: true }));
		sheet.querySelector('nldd-top-title-bar')!.shadowRoot!.querySelector<HTMLElement>('.top-title-bar__dismiss-button nldd-button')!.click();
		await closed;
		await waitForUpdate(sheet);
		expect(sheet.open).toBe(false);
	});

	it('houdt de pagina met de lijst achter de sheet', async () => {
		const sheet = await mount();
		expect(root.querySelector('nldd-page')!.contains(sheet)).toBe(false);
	});
});
