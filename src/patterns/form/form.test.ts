import { describe, it, expect, afterEach } from 'vitest';
import { waitForUpdate } from '../../test-utils.js';
import markup from './form.html?raw';
import '../../components/index.js';

describe('patroon: formulier', () => {
	let root: HTMLElement;

	afterEach(() => {
		root?.remove();
	});

	const mount = async () => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		for (const el of root.querySelectorAll('nldd-form-field, nldd-text-field, nldd-multi-line-text-field')) await waitForUpdate(el as HTMLElement);
		await new Promise((resolve) => requestAnimationFrame(resolve));
	};

	it('koppelt elk label aan zijn veld zonder for of id', async () => {
		await mount();
		const input = root.querySelector('nldd-text-field[name="email"]')!.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('aria-label')).toBe('E-mailadres');
		expect(root.querySelector('[for]')).toBeNull();
	});

	it('groepeert de velden in een echte fieldset met een groepsnaam', async () => {
		await mount();
		const legends = [...root.querySelectorAll('fieldset > legend .form-section__title')].map((title) => title.textContent!.trim());
		expect(legends).toEqual(['Contactgegevens', 'Je vraag']);
	});

	it('heeft één primaire actie en geen uitweg ernaast', async () => {
		await mount();
		const buttons = root.querySelectorAll('nldd-form-actions nldd-button');
		expect(buttons.length).toBe(1);
		expect(buttons[0].getAttribute('type')).toBe('submit');
	});

	it('markeert het optionele veld, niet de verplichte', async () => {
		await mount();
		const optional = [...root.querySelectorAll('nldd-form-field[optional]')].map((field) => field.getAttribute('label'));
		expect(optional).toEqual(['Telefoonnummer']);
	});
});
