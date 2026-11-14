import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, reduceMotion } from '../test-utils.js';
import { _resetInputModalityForTesting } from './input-modality.js';
import '../components/actions/button/button.js';
import '../components/actions/icon-button/icon-button.js';
import '../components/actions/menu/menu.js';
import '../components/navigation/link/link.js';
import '../components/content/text/text.js';
import '../components/layout/popover/popover.js';
import type { NLDDButton } from '../components/actions/button/button.js';
import type { NLDDPopover } from '../components/layout/popover/popover.js';

const MARKUP = '<div>'
	+ '<input class="field">'
	+ '<nldd-button text="2">'
	+ '<nldd-popover slot="interest"><p>Sam, Noor</p></nldd-popover>'
	+ '</nldd-button>'
	+ '</div>';

function pointer(type: string, target: Element, pointerType: string, x = 0, y = 0): void {
	target.dispatchEvent(new PointerEvent(type, { pointerType, clientX: x, clientY: y, bubbles: type !== 'pointerenter' && type !== 'pointerleave', composed: true }));
}

// On sm the popover is a bottom sheet that slides down before it closes; these
// tests are about when it closes, not how.
let restoreMotion: () => Promise<void>;
beforeAll(async () => { restoreMotion = await reduceMotion(); });
afterAll(async () => { await restoreMotion(); });

describe('nldd-button interest slot', () => {
	let wrapper: HTMLElement;
	let button: NLDDButton;
	let popover: NLDDPopover;
	let inner: HTMLButtonElement;

	async function setup(markup = MARKUP): Promise<void> {
		wrapper = await fixture(markup);
		button = wrapper.querySelector('nldd-button')!;
		await waitForUpdate(button);
		popover = button.querySelector('nldd-popover[slot="interest"]')!;
		await waitForUpdate(popover);
		inner = button.shadowRoot!.querySelector('button')!;
	}

	afterEach(() => {
		vi.useRealTimers();
		if (popover?.matches(':popover-open')) popover.hidePopover();
		if (wrapper) cleanup(wrapper);
	});

	it('anchors the popover and makes it a description of the button', async () => {
		await setup();
		expect(popover.anchorElement).toBe(button);
		expect(popover.getAttribute('role')).toBe('tooltip');
		expect(popover.getAttribute('popover')).toBe('manual');
		// Its content is what is read; a label would take its place.
		expect(popover.hasAttribute('aria-label')).toBe(false);
		expect(inner.ariaDescribedByElements).toEqual([popover]);
		// No disclosure: the button does not open it.
		expect(inner.hasAttribute('aria-expanded')).toBe(false);
		expect(inner.hasAttribute('aria-haspopup')).toBe(false);
	});

	it('opens after the hover delay and leaves focus where it is', async () => {
		await setup();
		const field = wrapper.querySelector<HTMLInputElement>('.field')!;
		field.focus();
		vi.useFakeTimers();
		pointer('pointerenter', button, 'mouse');
		vi.advanceTimersByTime(400);
		expect(popover.matches(':popover-open')).toBe(false);
		vi.advanceTimersByTime(200);
		expect(popover.matches(':popover-open')).toBe(true);
		vi.useRealTimers();
		await waitForUpdate(popover);
		expect(document.activeElement).toBe(field);
	});

	it('closes after the pointer leaves, unless it comes back in time', async () => {
		await setup();
		vi.useFakeTimers();
		pointer('pointerenter', button, 'mouse');
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
		// Across the gap and onto the popover, a child of the button.
		pointer('pointerleave', button, 'mouse');
		vi.advanceTimersByTime(200);
		pointer('pointerenter', button, 'mouse');
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
		pointer('pointerleave', button, 'mouse');
		vi.advanceTimersByTime(300);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('does not open for a pointer that passes over', async () => {
		await setup();
		vi.useFakeTimers();
		pointer('pointerenter', button, 'mouse');
		vi.advanceTimersByTime(300);
		pointer('pointerleave', button, 'mouse');
		vi.advanceTimersByTime(1000);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('opens on focus at once and keeps focus on the button', async () => {
		await setup();
		inner.focus();
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		expect(button.shadowRoot!.activeElement).toBe(inner);
		inner.blur();
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('closes on Escape and stays closed while the button keeps focus', async () => {
		await setup();
		inner.focus();
		expect(popover.matches(':popover-open')).toBe(true);
		const outer = vi.fn();
		document.addEventListener('keydown', outer);
		inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
		document.removeEventListener('keydown', outer);
		expect(popover.matches(':popover-open')).toBe(false);
		// The key stops at the popover: a dialog around it stays open.
		expect(outer).not.toHaveBeenCalled();
		pointer('pointerenter', button, 'mouse');
		expect(popover.matches(':popover-open')).toBe(false);
		expect(button.shadowRoot!.activeElement).toBe(inner);
	});

	it('lets the button keep its click, and closes on it', async () => {
		await setup();
		const clicked = vi.fn();
		button.addEventListener('click', clicked);
		inner.focus();
		expect(popover.matches(':popover-open')).toBe(true);
		inner.click();
		expect(clicked).toHaveBeenCalledTimes(1);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('opens on a long press and does not count it as a click', async () => {
		await setup();
		const clicked = vi.fn();
		button.addEventListener('click', clicked);
		vi.useFakeTimers();
		pointer('pointerdown', inner, 'touch', 10, 10);
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
		pointer('pointerup', inner, 'touch', 10, 10);
		inner.click();
		expect(clicked).not.toHaveBeenCalled();
		expect(popover.matches(':popover-open')).toBe(true);
		// A tap elsewhere closes it.
		pointer('pointerdown', document.body, 'touch');
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('leaves a short tap to the button', async () => {
		await setup();
		const clicked = vi.fn();
		button.addEventListener('click', clicked);
		vi.useFakeTimers();
		pointer('pointerdown', inner, 'touch', 10, 10);
		vi.advanceTimersByTime(200);
		pointer('pointerup', inner, 'touch', 10, 10);
		inner.click();
		vi.advanceTimersByTime(1000);
		expect(clicked).toHaveBeenCalledTimes(1);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('takes a finger that moves for a scroll', async () => {
		await setup();
		vi.useFakeTimers();
		pointer('pointerdown', inner, 'touch', 10, 10);
		pointer('pointermove', inner, 'touch', 10, 40);
		vi.advanceTimersByTime(1000);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('does not open over the menu the button opened', async () => {
		await setup('<div><nldd-button text="2">'
			+ '<nldd-menu slot="popup"><nldd-menu-item text="Bewerken"></nldd-menu-item></nldd-menu>'
			+ '<nldd-popover slot="interest"><p>Sam, Noor</p></nldd-popover>'
			+ '</nldd-button></div>');
		const menu = button.querySelector('nldd-menu')!;
		inner.click();
		await waitForUpdate(menu);
		expect(menu.matches(':popover-open')).toBe(true);
		vi.useFakeTimers();
		pointer('pointerenter', button, 'mouse');
		vi.advanceTimersByTime(1000);
		expect(popover.matches(':popover-open')).toBe(false);
		vi.useRealTimers();
		menu.hidePopover();
	});

	it('lets go of a popover that leaves the slot', async () => {
		await setup();
		popover.remove();
		await waitForUpdate(button);
		expect(popover.anchorElement).toBe(null);
		expect(popover._interest).toBe(false);
		expect(popover.getAttribute('role')).toBe('dialog');
		expect(inner.ariaDescribedByElements).toBe(null);
	});
});

describe('nldd-icon-button interest slot', () => {
	let el: HTMLElement;

	afterEach(() => {
		vi.useRealTimers();
		el?.querySelector<HTMLElement>('nldd-popover:popover-open')?.hidePopover();
		if (el) cleanup(el);
	});

	it('takes the place of the tooltip, which comes back when it goes', async () => {
		el = await fixture('<nldd-icon-button icon="hand-thumbs-up" accessible-label="Duim omhoog">'
			+ '<nldd-popover slot="interest"><p>Sam, Noor</p></nldd-popover>'
			+ '</nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBe(null);
		const popover = el.querySelector('nldd-popover')!;
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.ariaDescribedByElements).toEqual([popover]);
		// The label stays the name.
		expect(inner.getAttribute('aria-label')).toBe('Duim omhoog');
		popover.remove();
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).not.toBe(null);
		expect(el.shadowRoot!.querySelector('button')!.ariaDescribedByElements).toBe(null);
	});

	it('opens on hover', async () => {
		el = await fixture('<nldd-icon-button icon="hand-thumbs-up" accessible-label="Duim omhoog">'
			+ '<nldd-popover slot="interest"><p>Sam, Noor</p></nldd-popover>'
			+ '</nldd-icon-button>');
		await waitForUpdate(el);
		const popover = el.querySelector('nldd-popover')!;
		vi.useFakeTimers();
		pointer('pointerenter', el, 'mouse');
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-link interestfor', () => {
	let wrapper: HTMLElement;
	let link: HTMLElement;
	let popover: NLDDPopover;
	let anchor: HTMLAnchorElement;

	async function setup(): Promise<void> {
		wrapper = await fixture('<div><p>Zie <nldd-link href="#interest-test" interestfor="preview">Aanvraag A-1042</nldd-link>.</p>'
			+ '<nldd-popover id="preview" accessible-label="Aanvraag A-1042"><nldd-text>Dakisolatie</nldd-text></nldd-popover></div>');
		link = wrapper.querySelector('nldd-link')!;
		await waitForUpdate(link);
		popover = wrapper.querySelector('nldd-popover')!;
		await waitForUpdate(popover);
		anchor = link.shadowRoot!.querySelector('a')!;
	}

	afterEach(() => {
		vi.useRealTimers();
		if (popover?.matches(':popover-open')) popover.hidePopover();
		if (wrapper) cleanup(wrapper);
	});

	it('makes the popover it names a description of the link', async () => {
		await setup();
		expect(popover.anchorElement).toBe(link);
		expect(anchor.ariaDescribedByElements).toEqual([popover]);
		// The label names it where it stands; here its content is what is read.
		expect(popover.hasAttribute('aria-label')).toBe(false);
	});

	it('opens after the hover delay, and stays while the pointer is on it', async () => {
		await setup();
		vi.useFakeTimers();
		pointer('pointerenter', link, 'mouse');
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
		// Across the gap onto the popover, which is not a child of the link.
		pointer('pointerleave', link, 'mouse');
		vi.advanceTimersByTime(200);
		pointer('pointerenter', popover, 'mouse');
		vi.advanceTimersByTime(1000);
		expect(popover.matches(':popover-open')).toBe(true);
		pointer('pointerleave', popover, 'mouse');
		vi.advanceTimersByTime(300);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('follows the link on a tap, and not after a long press', async () => {
		await setup();
		vi.useFakeTimers();
		pointer('pointerdown', anchor, 'touch', 10, 10);
		vi.advanceTimersByTime(200);
		pointer('pointerup', anchor, 'touch', 10, 10);
		const tap = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		anchor.dispatchEvent(tap);
		expect(tap.defaultPrevented).toBe(false);
		pointer('pointerdown', anchor, 'touch', 10, 10);
		vi.advanceTimersByTime(500);
		expect(popover.matches(':popover-open')).toBe(true);
		pointer('pointerup', anchor, 'touch', 10, 10);
		const release = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		anchor.dispatchEvent(release);
		expect(release.defaultPrevented).toBe(true);
		// A tap on the popover itself keeps it.
		pointer('pointerdown', popover, 'touch');
		expect(popover.matches(':popover-open')).toBe(true);
	});

	it('says so when the popover is not there', async () => {
		wrapper = await fixture('<div><nldd-link href="#" interestfor="nergens">Aanvraag A-1042</nldd-link></div>');
		link = wrapper.querySelector('nldd-link')!;
		await waitForUpdate(link);
		expect(link.matches(':state(no-interest-target)')).toBe(true);
	});
});

describe('nldd-button interestfor', () => {
	let wrapper: HTMLElement;
	let popover: NLDDPopover;

	afterEach(() => {
		vi.useRealTimers();
		if (popover?.matches(':popover-open')) popover.hidePopover();
		if (wrapper) cleanup(wrapper);
	});

	it('moves a shared popover to the button it opens for', async () => {
		wrapper = await fixture('<div><nldd-button text="2" interestfor="shared"></nldd-button><nldd-button text="3" interestfor="shared"></nldd-button>'
			+ '<nldd-popover id="shared" accessible-label="Wie reageerde"><nldd-text>Sam, Noor</nldd-text></nldd-popover></div>');
		const [first, second] = Array.from(wrapper.querySelectorAll<NLDDButton>('nldd-button'));
		await waitForUpdate(first);
		await waitForUpdate(second);
		popover = wrapper.querySelector('nldd-popover')!;
		await waitForUpdate(popover);
		// The touch presses of earlier tests left the page in touch mode.
		_resetInputModalityForTesting();
		first.shadowRoot!.querySelector('button')!.focus();
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		expect(popover.anchorElement).toBe(first);
		second.shadowRoot!.querySelector('button')!.focus();
		await waitForUpdate(popover);
		// The close of the first arrives a task later.
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(popover.matches(':popover-open')).toBe(true);
		expect(popover.anchorElement).toBe(second);
	});

	it('opens a slotted popover over the one interestfor names', async () => {
		wrapper = await fixture('<div><nldd-button text="2" interestfor="elsewhere"><nldd-popover slot="interest"><nldd-text>Sam</nldd-text></nldd-popover></nldd-button>'
			+ '<nldd-popover id="elsewhere" accessible-label="Elders"><nldd-text>Noor</nldd-text></nldd-popover></div>');
		const button = wrapper.querySelector<NLDDButton>('nldd-button')!;
		await waitForUpdate(button);
		popover = button.querySelector('nldd-popover')!;
		expect(button._interest.overlay).toBe(popover);
		expect(wrapper.querySelector<NLDDPopover>('#elsewhere')!.anchorElement).toBe(null);
	});
});
