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
		expect(sheet.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Aanvraag bewerken');
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

	it('houdt de primaire actie in de footer, weg van de sluitknop', async () => {
		const sheet = await mount();
		const footer = sheet.querySelector('nldd-page > [slot="footer"]')!;
		expect(footer.querySelector('nldd-button[variant="primary"]')).not.toBeNull();
		expect(sheet.querySelector('nldd-top-title-bar')!.getAttribute('dismiss-text')).toBe('Sluiten');
	});
});
