import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './button-group.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

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

describe('nldd-button-group – gestapeld', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('rekt de knoppen, maar laat een icoonknop zijn eigen maat', async () => {
		el = await fixture<HTMLElement>(
			`<div style="width: 320px">
				<nldd-button-group>
					<nldd-button text="Bewaar"></nldd-button>
					<nldd-icon-button icon="settings" text="Instellingen"></nldd-icon-button>
				</nldd-button-group>
			</div>`,
		);
		const groep = el.querySelector('nldd-button-group')!;
		await waitForUpdate(groep as HTMLElement);
		const knop = el.querySelector('nldd-button')! as HTMLElement;
		const icoonknop = el.querySelector('nldd-icon-button')! as HTMLElement;
		await waitForUpdate(icoonknop);
		// Het contract, niet de pixels: zonder variables.css heeft een icoonknop
		// in deze omgeving geen eigen maat, dus meten zegt hier niets.
		expect(getComputedStyle(knop).width).toBe('320px');
		// Een kolom rekt zijn items vanzelf over de volle breedte; dit houdt de
		// icoonknop op zijn eigen maat, want een balk met één glyph erin is geen
		// groter doel, alleen een breder.
		expect(getComputedStyle(icoonknop).alignSelf).toBe('flex-start');
	});

	it('waarschuwt als de groep geen breedte krijgt van zijn ouder', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<HTMLElement>(
			`<div style="display: inline-flex">
				<nldd-button-group>
					<nldd-button text="Een"></nldd-button>
					<nldd-button text="Twee"></nldd-button>
				</nldd-button-group>
			</div>`,
		);
		await waitForUpdate(el.querySelector('nldd-button-group') as HTMLElement);
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		expect(warn.mock.calls.some(([m]) => String(m).includes('0 wide'))).toBe(true);
	});
});
