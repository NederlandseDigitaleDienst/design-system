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
		expect(sheet.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Aanvraag A-1042 bewerken');
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

	it('houdt de titelbalk in beeld, zodat hij de titel kan overnemen', async () => {
		const sheet = await mount();
		expect(sheet.querySelector('nldd-page')!.hasAttribute('sticky-header')).toBe(true);
	});

	it('laat de titelbalk naar de kop in de inhoud wijzen, met dezelfde woorden', async () => {
		const sheet = await mount();
		const bar = sheet.querySelector('nldd-top-title-bar')!;
		const id = bar.getAttribute('collapse-anchor')!;
		const heading = sheet.querySelector(`#${id}`)!;
		expect(heading.tagName).toBe('NLDD-TITLE');
		expect(heading.getAttribute('text')).toBe(bar.getAttribute('text'));
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

describe('patroon: bewerken in een sheet, een stap verder', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	type Stap = HTMLElement & { hidden: boolean };
	const toon = (sheet: Element, id: string) => {
		sheet.querySelectorAll<Stap>('nldd-page').forEach((pagina) => { pagina.hidden = pagina.id !== id; });
	};

	const mount = async () => {
		const { default: step } = await import('./edit-in-a-sheet.step.html?raw');
		root = document.createElement('div');
		root.innerHTML = step;
		document.body.append(root);
		const sheet = root.querySelector('nldd-sheet')!;
		sheet.open = true;
		await waitForUpdate(sheet);
		return sheet;
	};

	it('houdt beide stappen in één sheet, met alleen de eerste in beeld', async () => {
		const sheet = await mount();
		expect(root.querySelectorAll('nldd-sheet')).toHaveLength(1);
		expect(sheet.querySelector<Stap>('#aanvraag')!.hidden).toBe(false);
		expect(sheet.querySelector<Stap>('#team')!.hidden).toBe(true);
	});

	it('geeft de stap een terugknop met de titel van de aanvraag', async () => {
		const sheet = await mount();
		const team = sheet.querySelector<Stap>('#team')!;
		toon(sheet, 'team');
		await waitForUpdate(team);
		const bar = team.querySelector('nldd-top-title-bar') as HTMLElement & { updateComplete: Promise<boolean> };
		await bar.updateComplete;
		expect(bar.shadowRoot!.querySelector('.top-title-bar__text-back-button nldd-button')!.getAttribute('text')).toBe('Aanvraag A-1042 bewerken');
		await waitForUpdate(sheet);
		expect(sheet.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Team kiezen');
	});

	it('bewaart wat in de eerste stap is ingevuld', async () => {
		const sheet = await mount();
		const titel = sheet.querySelector('nldd-text-field') as HTMLElement & { value: string };
		titel.value = 'Dakisolatie en ventilatie';
		toon(sheet, 'team');
		toon(sheet, 'aanvraag');
		expect(sheet.querySelector<Stap>('#aanvraag')!.hidden).toBe(false);
		expect(titel.value).toBe('Dakisolatie en ventilatie');
	});
});
