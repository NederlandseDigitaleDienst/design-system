import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDStepIndicator, NLDDStepIndicatorItem } from './step-indicator.js';
import './step-indicator.js';

const THREE_STEPS = `
	<nldd-step-indicator current="2">
		<nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
		<nldd-step-indicator-item text="Controle"></nldd-step-indicator-item>
		<nldd-step-indicator-item text="Bevestigen"></nldd-step-indicator-item>
	</nldd-step-indicator>
`;

describe('nldd-step-indicator', () => {
	let el: NLDDStepIndicator;

	afterEach(() => cleanup(el));

	const items = (): NLDDStepIndicatorItem[] =>
		Array.from(el.querySelectorAll('nldd-step-indicator-item'));

	it('rendert en heeft een shadowRoot', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		expect(el.shadowRoot).toBeTruthy();
	});

	it('leidt de status van elke stap af uit current', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'current', 'future']);
	});

	it('herberekent de statussen wanneer current verandert', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		el.current = 3;
		await waitForUpdate(el);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'past', 'current']);
	});

	it('klemt een current buiten bereik', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		el.current = 9;
		await waitForUpdate(el);
		expect(el.resolvedCurrent).toBe(3);
		expect(items().map(item => item.resolvedStatus)).toEqual(['past', 'past', 'current']);
	});

	it('laat een eigen status van een item winnen van de afleiding', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="1">
				<nldd-step-indicator-item text="Een"></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Twee" status="past"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		expect(items()[1].resolvedStatus).toBe('past');
	});

	it('markeert alleen de huidige stap met aria-current', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		const marked = items().filter(item => item.getAttribute('aria-current') === 'step');
		expect(marked).toHaveLength(1);
		expect(marked[0].text).toBe('Controle');
	});

	it('geeft elke stap de listitem-rol binnen een list', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('[role="list"]')).toBeTruthy();
		expect(items().every(item => item.getAttribute('role') === 'listitem')).toBe(true);
	});

	it('toont een vinkje op een afgeronde stap en een cijfer op de rest', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		const [first, second] = items();
		expect(first.shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('check-mark');
		expect(second.shadowRoot!.querySelector('.step-indicator__item-number')?.textContent?.trim()).toBe('2');
	});

	it('laat een eigen icoon voorgaan op cijfer en vinkje', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="1">
				<nldd-step-indicator-item text="Een" icon="star"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		expect(items()[0].shadowRoot!.querySelector('nldd-icon')?.getAttribute('icon')).toBe('star');
	});

	it('zet de statustekst voor hulpsoftware bij elke stap', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		expect(items().map(item => item._statusText)).toEqual(['Afgerond', 'Huidige stap', 'Nog te doen']);
	});

	it('rendert de compacte tekst en één balksegment per stap', async () => {
		el = await fixture<NLDDStepIndicator>(THREE_STEPS);
		await waitForUpdate(el);
		const text = el.shadowRoot!.querySelector('.step-indicator__compact-text')!.textContent ?? '';
		expect(text).toContain('Stap 2 van 3');
		expect(text).toContain('Controle');
		const segments = el.shadowRoot!.querySelectorAll('.step-indicator__compact-bar-segment');
		expect(segments).toHaveLength(3);
		expect(Array.from(segments).filter(s => s.hasAttribute('data-filled'))).toHaveLength(2);
	});

	it('rendert een stap met href als link', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="2">
				<nldd-step-indicator-item text="Gegevens" href="/stap-1/"></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Controle"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		const link = items()[0].shadowRoot!.querySelector('a.step-indicator__item-control');
		expect(link?.getAttribute('href')).toBe('/stap-1/');
		expect(items()[1].shadowRoot!.querySelector('a.step-indicator__item-control')).toBeNull();
	});

	it('rendert een stap met button als knop', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="2">
				<nldd-step-indicator-item text="Gegevens" button></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Controle"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		const button = items()[0].shadowRoot!.querySelector('button.step-indicator__item-control');
		expect(button).toBeTruthy();
		expect(button!.getAttribute('type')).toBe('button');
	});

	it('laat href winnen van button', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="2">
				<nldd-step-indicator-item text="Gegevens" href="/stap-1/" button></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		expect(items()[0].shadowRoot!.querySelector('a.step-indicator__item-control')).toBeTruthy();
		expect(items()[0].shadowRoot!.querySelector('button.step-indicator__item-control')).toBeNull();
	});

	it('gebruikt accessible-label voor de nav', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator accessible-label="Voortgang aanvraag">
				<nldd-step-indicator-item text="Een"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nav')?.getAttribute('aria-label')).toBe('Voortgang aanvraag');
	});

	it('follows current in the compact view when it changes', async () => {
		el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="1" accessible-label="Voortgang">
				<nldd-step-indicator-item text="Welkom"></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Je profiel"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);

		el.current = 2;
		await waitForUpdate(el);

		const compact = el.shadowRoot!.querySelector('.step-indicator__compact-text')!;
		expect(compact.textContent).toContain('Je profiel');
	});

	it('past een translations-override toe op de compacte tekst', async () => {
		const el = await fixture<NLDDStepIndicator>(`
			<nldd-step-indicator current="1">
				<nldd-step-indicator-item text="Een"></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Twee"></nldd-step-indicator-item>
			</nldd-step-indicator>
		`);
		await waitForUpdate(el);

		el.translations = { 'components.step-indicator.compact-text': 'Step {current} of {total}' };
		await waitForUpdate(el);

		const compact = el.shadowRoot!.querySelector('.step-indicator__compact-text')!;
		expect(compact.textContent).toContain('Step 1 of 2');
	});

});
