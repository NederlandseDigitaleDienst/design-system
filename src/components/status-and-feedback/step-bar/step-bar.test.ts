import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDStepBar, NLDDStepBarItem } from './step-bar.js';
import './step-bar.js';

const THREE_STEPS = `
	<nldd-step-bar>
		<nldd-step-bar-item text="Gegevens"></nldd-step-bar-item>
		<nldd-step-bar-item text="Controle" status="current"></nldd-step-bar-item>
		<nldd-step-bar-item text="Bevestigen"></nldd-step-bar-item>
	</nldd-step-bar>
`;

describe('nldd-step-bar', () => {
	let el: NLDDStepBar;

	afterEach(() => cleanup(el));

	const items = (): NLDDStepBarItem[] =>
		Array.from(el.querySelectorAll('nldd-step-bar-item'));

	it('rendert en heeft een shadowRoot', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		expect(el.shadowRoot).toBeTruthy();
	});

	it('leidt de status van elke stap af uit de stap met status="current"', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'current', 'future']);
	});

	it('herberekent de statussen wanneer status="current" naar een andere stap gaat', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		items()[1].removeAttribute('status');
		items()[2].setAttribute('status', 'current');
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'past', 'current']);
	});

	it('maakt stap 1 de huidige als geen stap status="current" heeft', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Een"></nldd-step-bar-item>
				<nldd-step-bar-item text="Twee"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['current', 'future']);
	});

	it('laat de laatste stap met status="current" winnen en waarschuwt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Een" status="current"></nldd-step-bar-item>
				<nldd-step-bar-item text="Twee" status="current"></nldd-step-bar-item>
				<nldd-step-bar-item text="Drie"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'current', 'future']);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('the last one wins'));
		warn.mockRestore();
	});

	it('waarschuwt als current nog op de ouder staat', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar current="2">
				<nldd-step-bar-item text="Een"></nldd-step-bar-item>
				<nldd-step-bar-item text="Twee"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('moved to the step'));
		expect(items().map(item => item.resolvedStatus)).toEqual(['current', 'future']);
		warn.mockRestore();
	});

	it('waarschuwt ook als current pas later op de ouder komt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		expect(warn).not.toHaveBeenCalled();
		el.setAttribute('current', '3');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('status="current"'));
		warn.mockRestore();
	});

	it('laat een eigen status van een item winnen van de afleiding', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Een"></nldd-step-bar-item>
				<nldd-step-bar-item text="Twee" status="past"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(items()[1].resolvedStatus).toBe('past');
	});

	it('markeert alleen de huidige stap met aria-current', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		const marked = items().filter(item => item.getAttribute('aria-current') === 'step');
		expect(marked).toHaveLength(1);
		expect(marked[0].text).toBe('Controle');
	});

	it('geeft elke stap de listitem-rol binnen een list', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="list"]')).toBeTruthy();
		expect(items().every(item => item.getAttribute('role') === 'listitem')).toBe(true);
	});

	it('toont een vinkje op een afgeronde stap en een cijfer op de rest', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		const [first, second] = items();
		expect(first.shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('check-mark');
		expect(second.shadowRoot!.querySelector('.step-bar__item-number')?.textContent?.trim()).toBe('2');
	});

	it('laat een eigen icoon voorgaan op cijfer en vinkje', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Een" icon="star"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(items()[0].shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('star');
	});

	it('zet de statustekst voor hulpsoftware bij elke stap', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		expect(items().map(item => item._statusText)).toEqual(['Afgerond', 'Huidige stap', 'Nog te doen']);
	});

	it('rendert de compacte tekst en één balksegment per stap', async () => {
		el = await fixture<NLDDStepBar>(THREE_STEPS);
		await waitForUpdate(el);
		const text = el.shadowRoot!.querySelector('.step-bar__compact-text')!.textContent ?? '';
		expect(text).toContain('Stap 2 van 3');
		expect(text).toContain('Controle');
		const segments = el.shadowRoot!.querySelectorAll('.step-bar__compact-bar-segment');
		expect(segments).toHaveLength(3);
		expect(Array.from(segments).filter(s => s.hasAttribute('data-filled'))).toHaveLength(2);
	});

	it('rendert een stap met href als link', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Gegevens" href="/stap-1/"></nldd-step-bar-item>
				<nldd-step-bar-item text="Controle" status="current"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		const link = items()[0].shadowRoot!.querySelector('a.step-bar__item-control');
		expect(link?.getAttribute('href')).toBe('/stap-1/');
		expect(items()[1].shadowRoot!.querySelector('a.step-bar__item-control')).toBeNull();
	});

	it('rendert een stap met button als knop', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Gegevens" button></nldd-step-bar-item>
				<nldd-step-bar-item text="Controle" status="current"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		const button = items()[0].shadowRoot!.querySelector('button.step-bar__item-control');
		expect(button).toBeTruthy();
		expect(button!.getAttribute('type')).toBe('button');
	});

	it('laat href winnen van button', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Gegevens" href="/stap-1/" button></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(items()[0].shadowRoot!.querySelector('a.step-bar__item-control')).toBeTruthy();
		expect(items()[0].shadowRoot!.querySelector('button.step-bar__item-control')).toBeNull();
	});

	it('gebruikt accessible-label voor de nav', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar accessible-label="Voortgang aanvraag">
				<nldd-step-bar-item text="Een"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nav')?.getAttribute('aria-label')).toBe('Voortgang aanvraag');
	});

	it('volgt de huidige stap in de compacte weergave als die verandert', async () => {
		el = await fixture<NLDDStepBar>(`
			<nldd-step-bar accessible-label="Voortgang">
				<nldd-step-bar-item text="Welkom"></nldd-step-bar-item>
				<nldd-step-bar-item text="Je profiel"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);

		items()[1].status = 'current';
		await waitForUpdate(el);

		const compact = el.shadowRoot!.querySelector('.step-bar__compact-text')!;
		expect(compact.textContent).toContain('Je profiel');
	});

	it('past een translations-override toe op de compacte tekst', async () => {
		const el = await fixture<NLDDStepBar>(`
			<nldd-step-bar>
				<nldd-step-bar-item text="Een"></nldd-step-bar-item>
				<nldd-step-bar-item text="Twee"></nldd-step-bar-item>
			</nldd-step-bar>
		`);
		await waitForUpdate(el);

		el.translations = { 'components.step-bar.compact-text': 'Step {current} of {total}' };
		await waitForUpdate(el);

		const compact = el.shadowRoot!.querySelector('.step-bar__compact-text')!;
		expect(compact.textContent).toContain('Step 1 of 2');
	});

});
