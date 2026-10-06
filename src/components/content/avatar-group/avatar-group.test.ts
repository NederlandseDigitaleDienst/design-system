import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './avatar-group.js';

describe('nldd-avatar-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-avatar-group></nldd-avatar-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('slot de avatars in de groep', async () => {
		el = await fixture(`
			<nldd-avatar-group>
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot')!;
		expect(slot.assignedElements().length).toBe(2);
	});

	it('is geen groep voor hulpsoftware zonder accessible-label', async () => {
		el = await fixture('<nldd-avatar-group><nldd-avatar name="Jan" decorative></nldd-avatar></nldd-avatar-group>');
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.avatar-group')!;
		expect(group.getAttribute('role')).toBeNull();
		expect(group.getAttribute('aria-label')).toBeNull();
	});

	it('wordt een gelabelde groep met accessible-label', async () => {
		el = await fixture('<nldd-avatar-group accessible-label="Redactie"><nldd-avatar name="Jan" decorative></nldd-avatar></nldd-avatar-group>');
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.avatar-group')!;
		expect(group.getAttribute('role')).toBe('group');
		expect(group.getAttribute('aria-label')).toBe('Redactie');
	});

	it('houdt alles zichtbaar zolang er niet meer dan max avatars zijn', async () => {
		el = await fixture(`
			<nldd-avatar-group max="3">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar-group__overflow-button')).toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-popover')).toBeNull();
	});

	it('zet alles voorbij max achter een +N knop met hun namen', async () => {
		el = await fixture(`
			<nldd-avatar-group max="2">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
				<nldd-avatar name="Fatima Ahmadi" decorative></nldd-avatar>
				<nldd-avatar name="Sanne de Vries" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);

		const knop = el.shadowRoot!.querySelector('.avatar-group__overflow-button')!;
		expect(knop.textContent!.trim()).toBe('+2');

		// The names behind the button are exactly those past max, in the same order.
		const namen = Array.from(el.shadowRoot!.querySelectorAll('nldd-text-cell'))
			.map(cel => cel.getAttribute('text'));
		expect(namen).toEqual(['Fatima Ahmadi', 'Sanne de Vries']);

		// And the rule that hides the rest counts from the first one that no longer fits.
		const regels = el.shadowRoot!.querySelector('#generated-rules')!.textContent!;
		expect(regels).toContain(':nth-child(n + 3)');
	});

	it('verbergt niemand bij max="0"', async () => {
		el = await fixture(`
			<nldd-avatar-group max="0">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar-group__overflow-button')).toBeNull();
	});

	// No assertions on the sizes and the overlap: the test document carries no
	// design tokens, so every --_* that resolves to one computes to nothing
	// here. Those are checked by eye in the Sizes and Overlap stories.
});
