import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './button-group.js';
import '../button/button.js';

describe('nldd-button-group', () => {
	let el: HTMLElement;

	/** The buttons carry the size the group hands them, which is one Lit update
	 *  per button away. */
	const settled = async (group: Element) => {
		for (const button of group.querySelectorAll('nldd-button')) await waitForUpdate(button as HTMLElement);
	};

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('legt de knoppen op een rij in een brede container', async () => {
		el = await fixture(`
			<div style="width: 800px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(1);
		expect(buttons[0].getBoundingClientRect().width).toBeLessThan(400);
	});

	it('stapelt ze op volle breedte op een smalle container', async () => {
		el = await fixture(`
			<div style="width: 400px;">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(2);
		expect(Math.round(buttons[0].getBoundingClientRect().width)).toBe(400);
		// The button inside the host as well: a stretched host with a
		// content-sized button in it is a click target that ends halfway.
		const inner = buttons[0].shadowRoot!.querySelector('.button')!;
		expect(Math.round(inner.getBoundingClientRect().width)).toBe(400);
	});

	it('houdt een eigen richting aan, ook op een smalle container', async () => {
		el = await fixture(`
			<div style="width: 400px;">
				<nldd-button-group orientation="horizontal">
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-button text="Annuleer"></nldd-button>
				</nldd-button-group>
			</div>
		`);
		await settled(el.querySelector('nldd-button-group')!);
		const buttons = [...el.querySelectorAll('nldd-button')] as HTMLElement[];
		expect(new Set(buttons.map((button) => button.offsetTop)).size).toBe(1);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-button-group></nldd-button-group>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});
});
