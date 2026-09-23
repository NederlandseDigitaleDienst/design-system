import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './edit-in-a-sheet.html?raw';
import '../../components/index.js';

describe('patroon: bewerken in een sheet', () => {
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
		expect(sheet.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Aanvraag 2024-001 bewerken');
	});

	it('sluit via de sluitknop in de titelbalk, zet open uit en vuurt close één keer', async () => {
		const sheet = await mount();
		sheet.open = true;
		await waitForUpdate(sheet);
		expect(sheet.shadowRoot!.querySelector('dialog')!.open).toBe(true);

		let closes = 0;
		sheet.addEventListener('close', () => { closes += 1; });
		const closed = new Promise((resolve) => sheet.addEventListener('close', resolve, { once: true }));
		const titleBar = sheet.querySelector('nldd-top-title-bar')!;
		titleBar.shadowRoot!.querySelector<HTMLElement>('.top-title-bar__dismiss-button nldd-button')!.click();
		await closed;
		await waitForUpdate(sheet);

		expect(closes).toBe(1);
		expect(sheet.open).toBe(false);
	});

	it('zet de primaire actie in het formulier, onder het laatste veld', async () => {
		const sheet = await mount();
		const form = sheet.querySelector('nldd-form')!;
		const save = form.querySelector('nldd-form-actions nldd-button[type="submit"]')!;
		expect(save).not.toBeNull();
		// Na het laatste veld, want daar kijkt de gebruiker als hij klaar is.
		const fields = [...form.querySelectorAll('nldd-form-field')];
		const last = fields[fields.length - 1];
		expect(last.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('laat de uitweg boven annuleren heten, weg van de primaire actie', async () => {
		const sheet = await mount();
		expect(sheet.querySelector('nldd-top-title-bar')!.getAttribute('dismiss-text')).toBe('Annuleer');
	});

	it('houdt de context achter de sheet in beeld', async () => {
		const sheet = await mount();
		const page = root.querySelector('nldd-page')!;
		expect(page.contains(sheet)).toBe(false);
		expect(page.querySelectorAll('nldd-list-item').length).toBeGreaterThan(1);
	});
});
