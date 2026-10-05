import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import '../../../assets/styles/variables.css';
import type { NLDDButtonBar } from './button-bar.js';
import './button-bar.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

describe('nldd-button-bar', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-button-bar></nldd-button-bar>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});
});

describe('nldd-button-bar – child building & attribute propagation', () => {
	let el: NLDDButtonBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('assigns slot="child-N" to button children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
				<nldd-button text="B"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		const buttons = el.querySelectorAll('nldd-button');
		expect(buttons[0].getAttribute('slot')).toBe('child-0');
		expect(buttons[1].getAttribute('slot')).toBe('child-1');
	});

	it('renders divider as separator in shadow DOM without slot on light DOM', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="B"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		// Divider in light DOM should NOT have a slot attribute
		const divider = el.querySelector('nldd-button-bar-divider')!;
		expect(divider.hasAttribute('slot')).toBe(false);

		// Shadow DOM should contain a divider
		const divider2 = el.shadowRoot!.querySelector('.button-bar__divider');
		expect(divider2).not.toBeNull();
	});

	it('treats nldd-icon-button the same as nldd-button', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-icon-button icon="heart" text="Like"></nldd-icon-button>
				<nldd-button text="Text"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		const iconBtn = el.querySelector('nldd-icon-button')!;
		const btn = el.querySelector('nldd-button')!;

		expect(iconBtn.getAttribute('slot')).toBe('child-0');
		expect(btn.getAttribute('slot')).toBe('child-1');
	});

	it('cleans stale slot attrs before rebuild', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
				<nldd-button text="B"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		const btnA = el.querySelectorAll('nldd-button')[0];
		expect(btnA.getAttribute('slot')).toBe('child-0');

		// Add a third button — triggers rebuild via MO
		const btnC = document.createElement('nldd-button');
		btnC.setAttribute('text', 'C');
		el.appendChild(btnC);

		await waitForUpdate(el);

		// All slots should be cleanly reassigned (0, 1, 2)
		const buttons = el.querySelectorAll('nldd-button');
		expect(buttons[0].getAttribute('slot')).toBe('child-0');
		expect(buttons[1].getAttribute('slot')).toBe('child-1');
		expect(buttons[2].getAttribute('slot')).toBe('child-2');
	});

	it('propagates initial size to button children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar size="sm">
				<nldd-button text="A"></nldd-button>
				<nldd-icon-button icon="x" text="Close"></nldd-icon-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.getAttribute('size')).toBe('sm');
		expect(el.querySelector('nldd-icon-button')!.getAttribute('size')).toBe('sm');
	});

	it('propagates lg size to icon-button children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar size="lg">
				<nldd-icon-button icon="chevron-left" text="Vorige"></nldd-icon-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="chevron-right" text="Volgende"></nldd-icon-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		el.querySelectorAll('nldd-icon-button').forEach(btn => {
			expect(btn.getAttribute('size')).toBe('lg');
		});
	});

	it('sets no-highlight-border on button children (the bar draws the group border)', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
				<nldd-icon-button icon="x" text="Close"></nldd-icon-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);
		expect(el.querySelector('nldd-button')!.hasAttribute('no-highlight-border')).toBe(true);
		expect(el.querySelector('nldd-icon-button')!.hasAttribute('no-highlight-border')).toBe(true);
	});

	it('propagates initial appearance to button children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar appearance="accent-filled">
				<nldd-button text="A"></nldd-button>
				<nldd-icon-button icon="x" text="Close"></nldd-icon-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.getAttribute('appearance')).toBe('accent-filled');
		expect(el.querySelector('nldd-icon-button')!.getAttribute('appearance')).toBe('accent-filled');
	});

	it('propagates appearance change to children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar appearance="neutral-tinted">
				<nldd-button text="A"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		// neutral-tinted is the button's default, so it is kept out of the DOM;
		// the propagated value is the source of truth on the property.
		expect((el.querySelector('nldd-button') as unknown as { appearance: string }).appearance).toBe('neutral-tinted');

		el.appearance = 'accent-filled';
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.getAttribute('appearance')).toBe('accent-filled');
	});

	it('propagates size change to children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar size="md">
				<nldd-button text="A"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		// Check the property, not the attribute: nldd-button omits the default
		// `size="md"` from the DOM (the attribute only carries non-defaults), so the
		// property is the source of truth for the propagated size.
		expect((el.querySelector('nldd-button') as unknown as { size: string }).size).toBe('md');

		el.size = 'xs';
		await waitForUpdate(el);

		expect((el.querySelector('nldd-button') as unknown as { size: string }).size).toBe('xs');
	});

	it('propagates disabled to children', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar disabled>
				<nldd-button text="A"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.hasAttribute('disabled')).toBe(true);
	});

	it('removes disabled from children when bar is re-enabled', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar disabled>
				<nldd-button text="A"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.hasAttribute('disabled')).toBe(true);

		el.disabled = false;
		await waitForUpdate(el);

		expect(el.querySelector('nldd-button')!.hasAttribute('disabled')).toBe(false);
	});

	it('updates slots when a child is added after mount', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		const newBtn = document.createElement('nldd-button');
		newBtn.setAttribute('text', 'B');
		el.appendChild(newBtn);

		await waitForUpdate(el);

		expect(newBtn.getAttribute('slot')).toBe('child-1');
		// Verify a corresponding named slot exists in shadow DOM
		const namedSlot = el.shadowRoot!.querySelector('slot[name="child-1"]');
		expect(namedSlot).not.toBeNull();
	});

	it('updates slots when a child is removed after mount', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-button text="A"></nldd-button>
				<nldd-button text="B"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		// Remove first button
		el.querySelector('nldd-button')!.remove();

		await waitForUpdate(el);

		// Remaining button should be re-slotted as child-0
		const remaining = el.querySelector('nldd-button')!;
		expect(remaining.getAttribute('slot')).toBe('child-0');
	});
});

describe('nldd-button-bar – on a colored surface', () => {
	let el: NLDDButtonBar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const surface = (bar: HTMLElement) => getComputedStyle(bar.shadowRoot!.querySelector('.button-bar')!).backgroundColor;
	const resting = (button: Element) => getComputedStyle(button.shadowRoot!.querySelector('.button, .icon-button')!).backgroundColor;

	it('draws the inherit-tinted surface once: the bar has it, its buttons are clear', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar appearance="inherit-tinted" style="color: rgb(255, 255, 255)">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(surface(el)).not.toBe('rgba(0, 0, 0, 0)');
		for (const child of el.querySelectorAll('nldd-button, nldd-icon-button')) {
			expect(resting(child)).toBe('rgba(0, 0, 0, 0)');
		}
	});

	it('keeps an expanded button in an inherit-tinted bar clear as well: inherit has no state colors', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar appearance="inherit-tinted" style="color: rgb(255, 255, 255)">
				<nldd-button text="Open" expandable expanded></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(resting(el.querySelector('nldd-button')!)).toBe('rgba(0, 0, 0, 0)');
	});

	it('gives the inherit-filled bar a surface of its own', async () => {
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar appearance="inherit-filled" style="color: rgb(255, 255, 255)">
				<nldd-button text="Bewerk"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(surface(el)).toBe('rgb(255, 255, 255)');
	});
});

describe('nldd-button-bar – toggle buttons', () => {
	let el: NLDDButtonBar;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('warns about an nldd-toggle-button and points to the components for toggles', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDButtonBar>(`
			<nldd-button-bar>
				<nldd-toggle-button text="Vet"></nldd-toggle-button>
				<nldd-button text="Bewerk"></nldd-button>
			</nldd-button-bar>
		`);
		await waitForUpdate(el);

		expect(warn).toHaveBeenCalledWith(expect.stringMatching(/nldd-toggle-button-group.*nldd-segmented-control/));
	});
});
