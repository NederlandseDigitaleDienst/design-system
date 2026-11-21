import { _setOSOverride } from '../../../utilities/os.js';
import { describe, it, expect, afterEach, onTestFinished, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, until } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDTooltip } from './tooltip.js';
import './tooltip.js';

function isTooltipVisible(el: NLDDTooltip): boolean {
	const tooltip = el.shadowRoot!.querySelector<HTMLElement>('.tooltip');
	return tooltip?.matches(':popover-open') ?? false;
}

/**
 * Tooltip uses a 700ms pointer-hover show delay (read from CSS
 * `--_tooltip-show-delay`). In tests we override it to 0 so mouseenter shows the
 * tooltip on the next microtask instead of forcing every test to wait.
 */
function instantShow(el: NLDDTooltip): void {
	el.style.setProperty('--_tooltip-show-delay', '0');
}

/**
 * The hide side of the same trick. The tooltip waits 50ms before it goes, and
 * a test that budgets wall-clock time for that is really measuring how busy
 * the machine is: on a loaded runner the timer lands late and the assertion
 * reads a tooltip that was on its way out as one that stayed.
 */
function instantHide(el: NLDDTooltip): void {
	el.style.setProperty('--_tooltip-hide-delay', '0');
}

/**
 * Common open-the-tooltip flow: zero out the show delay, fire mouseenter, and
 * wait until the popover is actually open. The show runs on a timer and then a
 * render, so waiting for the state beats counting ticks, which passes on a
 * quick machine and fails on a loaded one.
 */
async function triggerShow(el: NLDDTooltip, trigger: Element): Promise<void> {
	instantShow(el);
	trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
	// Not every caller expects the tooltip to appear: the empty-text and
	// timing=never tests use this same flow to assert that it stays away, and
	// there running out the clock is the answer rather than a failure.
	await until(() => isTooltipVisible(el), { throwOnTimeout: false });
	// The popover being open is not the same as the show having settled. Hiding
	// it while it is still opening leaves it open, so let the render finish
	// before a test does anything with it.
	await waitForUpdate(el);
}

/**
 * What the tooltip thinks it is doing, for a failure message that says more than
 * "expected true to be false". These two hide tests fail on CI and on no machine
 * here, so the next failure should arrive with its reasons attached.
 */
function tooltipState(el: NLDDTooltip) {
	return {
		popoverOpen: isTooltipVisible(el),
		visible: (el as unknown as { _visible: boolean })._visible,
		hideDelay: getComputedStyle(el).getPropertyValue('--_tooltip-hide-delay').trim(),
		pendingHide: (el as unknown as { _interest: { _hideTimer: unknown } })._interest._hideTimer !== null,
	};
}

describe('nldd-tooltip', () => {
	let el: NLDDTooltip;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"></nldd-tooltip>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('rendert tooltip met aria-hidden', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"></nldd-tooltip>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('.tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('aria-hidden')).toBe('true');
	});

	it('toont de tooltip tekst', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Helptekst"></nldd-tooltip>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.tooltip__body')?.textContent?.trim()).toBe('Helptekst');
	});

	it('tooltip is standaard niet zichtbaar', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"></nldd-tooltip>');
		await waitForUpdate(el);
		expect(isTooltipVisible(el)).toBe(false);
	});

	it('standaard placement is bottom', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"></nldd-tooltip>');
		await waitForUpdate(el);
		expect(el.placement).toBe('bottom');
	});
});

describe('nldd-tooltip – show/hide', () => {
	let el: NLDDTooltip;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('wordt zichtbaar bij mouseenter op trigger', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		await triggerShow(el, el.querySelector('button')!);
		expect(isTooltipVisible(el)).toBe(true);
	});

	it('wordt zichtbaar bij focusin op trigger', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);

		const trigger = el.querySelector('button')!;
		trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitForUpdate(el);

		expect(isTooltipVisible(el)).toBe(true);
	});

	it('wordt verborgen bij mouseleave', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		await triggerShow(el, trigger);
		instantHide(el);
		trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		// The hide runs on a timer and then a render, so wait for the state and not
		// for a set number of ticks: that passes here and fails on a loaded CI.
		await until(() => !isTooltipVisible(el));

		expect(tooltipState(el)).toEqual({
			popoverOpen: false, visible: false, hideDelay: '0', pendingHide: false,
		});
	});

	it('blijft zichtbaar bij tooltip hover', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		await triggerShow(el, trigger);

		instantHide(el);
		trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		const tooltipEl = el.shadowRoot!.querySelector('.tooltip')!;
		tooltipEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await new Promise(resolve => setTimeout(resolve, 0));
		await waitForUpdate(el);

		expect(isTooltipVisible(el)).toBe(true);
	});

	it('Escape sluit de tooltip', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		await triggerShow(el, el.querySelector('button')!);
		expect(isTooltipVisible(el)).toBe(true);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await until(() => !isTooltipVisible(el));
		expect(tooltipState(el)).toMatchObject({ popoverOpen: false, visible: false });
	});

	it('Escape sluit de tooltip ook als de focus ergens anders staat', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		await triggerShow(el, el.querySelector('button')!);
		expect(isTooltipVisible(el)).toBe(true);

		// Opened by hover, so nothing inside the tooltip has focus and the key
		// arrives at whatever does.
		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await until(() => !isTooltipVisible(el));
		expect(tooltipState(el)).toMatchObject({ popoverOpen: false, visible: false });
	});

	it('Escape sluit alleen de tooltip, niet de dialog eromheen', async () => {
		// showModal() focuses the first control it finds. Without the autofocus
		// that would be the trigger, the tooltip would show on that focus, and a
		// runner window that regains OS focus mid-test refocuses it and shows the
		// tooltip again after Escape put it away. Hover alone is what is tested.
		el = await fixture<NLDDTooltip>('<dialog><button autofocus>Eerst</button><nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip></dialog>') as unknown as NLDDTooltip;
		const dialog = el as unknown as HTMLDialogElement;
		const tooltip = dialog.querySelector('nldd-tooltip') as NLDDTooltip;
		const button = tooltip.querySelector('button')!;
		dialog.showModal();
		await waitForUpdate(tooltip);
		await triggerShow(tooltip, button);
		expect(isTooltipVisible(tooltip)).toBe(true);

		// What the dialog would hear. A dispatched key and not a pressed one: a
		// real key press goes to whichever test page holds the OS focus, which
		// made this test fail now and then in a full run. What keeps a native
		// dialog open is that the key is canceled and never arrives, and that is
		// what is asked here.
		const heard: KeyboardEvent[] = [];
		const listen = (e: Event) => heard.push(e as KeyboardEvent);
		dialog.addEventListener('keydown', listen);
		const press = () => {
			const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true });
			button.dispatchEvent(event);
			return event;
		};

		const first = press();
		expect(first.defaultPrevented).toBe(true);
		expect(heard.length).toBe(0);
		await until(() => !isTooltipVisible(tooltip));
		expect(dialog.open).toBe(true);

		// With the tooltip gone the next press is the dialog's again.
		const second = press();
		expect(second.defaultPrevented).toBe(false);
		expect(heard.length).toBe(1);
		dialog.removeEventListener('keydown', listen);
		dialog.close();
	});

	it('Escape buiten een geforceerd open tooltip laat hem staan', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test" open><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		let dismissed = false;
		el.addEventListener('dismiss', () => { dismissed = true; });

		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		document.body.dispatchEvent(event);
		expect(dismissed).toBe(false);
		expect(event.defaultPrevented).toBe(false);

		let reachedParent = false;
		el.parentElement!.addEventListener('dismiss', () => { reachedParent = true; });
		el.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
		expect(dismissed).toBe(true);
		// A banner or notification around it fires a dismiss of its own.
		expect(reachedParent).toBe(false);
	});

	it('toont niet bij lege text', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text=""><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		await triggerShow(el, el.querySelector('button')!);
		expect(isTooltipVisible(el)).toBe(false);
	});

	it('timing=never flip annuleert een pending show-timer voordat die afloopt', async () => {
		// Use a non-zero delay so we can flip `timing` to 'never' while the
		// timer is still scheduled. This is the exact race the updated()
		// handler is meant to win — without the clearTimeout, the timer would
		// fire and open the tooltip even though the consumer just suppressed it.
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		el.style.setProperty('--_tooltip-show-delay', '50');

		const trigger = el.querySelector('button')!;
		trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		// Don't wait for the timer to fire — flip timing mid-flight.
		el.timing = 'never';
		await waitForUpdate(el);

		// Wait past the original show-delay window — the canceled timer must
		// not still open the tooltip.
		await new Promise(resolve => setTimeout(resolve, 100));
		expect(isTooltipVisible(el)).toBe(false);
	});

	it('timing=never flip verbergt een al zichtbare tooltip direct', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		await waitForUpdate(el);
		await triggerShow(el, el.querySelector('button')!);
		expect(isTooltipVisible(el)).toBe(true);

		el.timing = 'never';
		await waitForUpdate(el);
		expect(isTooltipVisible(el)).toBe(false);
	});
});

describe('nldd-tooltip – aria-describedby', () => {
	let el: NLDDTooltip;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('zet aria-describedby op het trigger element', async () => {
		el = await fixture<NLDDTooltip>(`
			<nldd-tooltip text="Helptekst">
				<button>Trigger</button>
			</nldd-tooltip>
		`);
		await waitForUpdate(el);

		const trigger = el.querySelector('button');
		const describedBy = trigger?.getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();

		const descriptionEl = document.getElementById(describedBy!);
		expect(descriptionEl).not.toBeNull();
		expect(descriptionEl?.textContent).toBe('Helptekst');
	});

	it('verwijdert aria-describedby bij lege text', async () => {
		el = await fixture<NLDDTooltip>(`
			<nldd-tooltip text="Helptekst">
				<button>Trigger</button>
			</nldd-tooltip>
		`);
		await waitForUpdate(el);

		el.text = '';
		await waitForUpdate(el);

		const trigger = el.querySelector('button');
		expect(trigger?.hasAttribute('aria-describedby')).toBe(false);
	});

	it('verwijdert description span bij disconnect', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>T</button></nldd-tooltip>');
		await waitForUpdate(el);
		const id = el.querySelector('button')!.getAttribute('aria-describedby')!;
		expect(document.getElementById(id)).not.toBeNull();
		cleanup(el);
		expect(document.getElementById(id)).toBeNull();
	});

	it('verwijdert aria-describedby en de description span wanneer timing flipt naar never', async () => {
		// Same intent as hiding the visual popover: when timing is 'never',
		// screen readers shouldn't keep announcing the tooltip text either.
		// Primary use-case is `.timing=${isShort ? 'delay' : 'never'}` in
		// document-tab-bar where the full label is already inline.
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>T</button></nldd-tooltip>');
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		const id = trigger.getAttribute('aria-describedby')!;
		expect(id).toBeTruthy();
		expect(document.getElementById(id)).not.toBeNull();

		el.timing = 'never';
		await waitForUpdate(el);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
		expect(document.getElementById(id)).toBeNull();
	});

	it('herstelt aria-describedby wanneer timing terug naar default flipt', async () => {
		el = await fixture<NLDDTooltip>('<nldd-tooltip text="Test" timing="never"><button>T</button></nldd-tooltip>');
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);

		el.timing = 'delay';
		await waitForUpdate(el);
		const id = trigger.getAttribute('aria-describedby');
		expect(id).toBeTruthy();
		expect(document.getElementById(id!)?.textContent).toBe('Test');
	});

	// Both a tooltip (popover="manual") and an nldd-popover (popover="auto")
	// live in the top layer, where the last one shown paints on top. Clearing
	// the tooltip on activation keeps it from covering whatever the click opened.
	it('verdwijnt zodra de trigger wordt geactiveerd', async () => {
		el = await fixture('<nldd-tooltip text="Bewaar"><button>Ster</button></nldd-tooltip>');
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		(el as unknown as { _visible: boolean })._visible = true;
		await waitForUpdate(el);
		expect((el as unknown as { _visible: boolean })._visible).toBe(true);

		trigger.click();
		await waitForUpdate(el);
		expect((el as unknown as { _visible: boolean })._visible).toBe(false);
	});

	it('laat een geforceerd geopende tooltip met rust bij activatie', async () => {
		el = await fixture('<nldd-tooltip text="Gekopieerd" open><button>Kopieer</button></nldd-tooltip>');
		await waitForUpdate(el);
		el.querySelector('button')!.click();
		await waitForUpdate(el);
		expect((el as unknown as { _visible: boolean })._visible).toBe(true);
	});
	// The hidden description must not extend the document: absolute without
	// offsets sits at the end of the body and its pixel adds a scrollbar.
	it('legt de verborgen beschrijving linksboven vast', async () => {
		el = await fixture(`
			<nldd-tooltip text="Uitleg"><button>Trigger</button></nldd-tooltip>
		`);
		await waitForUpdate(el);
		const trigger = el.querySelector('button')!;
		trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await waitForUpdate(el);

		const description = document.getElementById(
			trigger.getAttribute('aria-describedby')!,
		) as HTMLElement;
		expect(description.style.top).toBe('0px');
		expect(description.style.left).toBe('0px');
		expect(description.getBoundingClientRect().bottom).toBeLessThanOrEqual(2);
	});

	describe('shortcut', () => {
		afterEach(() => _setOSOverride(null));

		it('opens with only a shortcut, without text', async () => {
			el = await fixture<NLDDTooltip>('<nldd-tooltip shortcut="Ctrl+B"><button>Vet</button></nldd-tooltip>');
			await waitForUpdate(el);
			el.querySelector('button')!.focus();
			await waitForUpdate(el);
			expect((el as NLDDTooltip)._visible).toBe(true);
		});

		it('shows the shortcut after the text', async () => {
			el = await fixture<NLDDTooltip>('<nldd-tooltip text="Opslaan" shortcut="Ctrl+S" shortcut-mac="Cmd+S"><button>Opslaan</button></nldd-tooltip>');
			await waitForUpdate(el);
			const body = el.shadowRoot!.querySelector('.tooltip__body')!;
			expect(body.querySelector('.tooltip__text')!.textContent).toBe('Opslaan');
			const keys = body.querySelector('nldd-keyboard-shortcut')!;
			expect(keys.getAttribute('keys')).toBe('Ctrl+S');
			expect(keys.getAttribute('mac-keys')).toBe('Cmd+S');
		});

		it('puts the keys on the baseline of the text', async () => {
			const removeTokens = loadTokens();
			onTestFinished(removeTokens);
			_setOSOverride('windows');
			el = await fixture<NLDDTooltip>('<nldd-tooltip text="Link" shortcut="Ctrl+K" open><button>Link</button></nldd-tooltip>');
			await waitForUpdate(el);
			const glyphBottom = (node: Element) => {
				const range = document.createRange();
				range.selectNodeContents(node);
				return range.getBoundingClientRect().bottom;
			};
			const text = el.shadowRoot!.querySelector('.tooltip__text')!;
			const key = el.shadowRoot!.querySelector('nldd-keyboard-shortcut')!.shadowRoot!.querySelector('.keyboard-shortcut__key')!;
			expect(glyphBottom(text)).toBeGreaterThan(0);
			expect(glyphBottom(key)).toBeCloseTo(glyphBottom(text), 1);
		});

		it('adds the shortcut to the description of a light-DOM trigger', async () => {
			_setOSOverride('windows');
			el = await fixture<NLDDTooltip>('<nldd-tooltip text="Opslaan" shortcut="Ctrl+S"><button>Opslaan</button></nldd-tooltip>');
			await waitForUpdate(el);
			const id = el.querySelector('button')!.getAttribute('aria-describedby')!;
			expect(document.getElementById(id)!.textContent).toBe('Opslaan Ctrl S');
		});
	});
});

describe('nldd-tooltip – description in the light DOM', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('reads no computed style on mount, so a long list of tooltips forces no recalculation', async () => {
		const spy = vi.spyOn(window, 'getComputedStyle');
		el = await fixture(`<div>${
			Array.from({ length: 20 }, (_, i) => `<nldd-tooltip text="Actie ${i}"><button type="button">Rij ${i}</button></nldd-tooltip>`).join('')
		}</div>`);
		await Promise.all([...el.querySelectorAll('nldd-tooltip')].map((tooltip) => (tooltip as NLDDTooltip).updateComplete));
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('still gives the hidden description the language of the tooltip', async () => {
		el = await fixture('<div lang="en"><nldd-tooltip text="Save"><button type="button">Save</button></nldd-tooltip></div>');
		const tooltip = el.querySelector('nldd-tooltip') as NLDDTooltip;
		await waitForUpdate(tooltip);
		const id = el.querySelector('button')!.getAttribute('aria-describedby')!;
		const description = document.getElementById(id)!;
		expect(description.textContent).toBe('Save');
		expect(description.getAttribute('lang')).toBe('en');
		expect(description.style.colorScheme).toBe('');
	});

	// Chrome focuses a button on the press, before its click. Shown for that
	// focus, the tooltip flashed up and went again with the click.
	it('flitst niet op bij een klik', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Kopieer"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await waitForUpdate(tooltip);
		let opened = false;
		tooltip.shadowRoot!.querySelector('.tooltip')!.addEventListener('beforetoggle', (event) => {
			if ((event as ToggleEvent).newState === 'open') opened = true;
		});
		// The real pointer stays where it clicked, over the next test's trigger.
		const corner = document.createElement('div');
		corner.style.cssText = 'position:fixed;right:0;bottom:0;width:4px;height:4px';
		document.body.append(corner);
		onTestFinished(async () => {
			await userEvent.hover(corner);
			corner.remove();
		});
		await userEvent.click(tooltip.querySelector('button')!);
		await waitForUpdate(tooltip);
		expect(opened).toBe(false);
	});

	// Focus without a key the page hears, as from VoiceOver or a dialog that
	// opens on a click and focuses its first control, still shows it.
	it('toont zich bij focus na een klik elders', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Kopieer"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await waitForUpdate(tooltip);
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
		document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }));
		tooltip.querySelector('button')!.focus();
		await until(() => isTooltipVisible(tooltip));
	});

	// A press whose release never reaches the page, as after a drag off the window.
	it('toont zich weer bij focus als een druk nooit losliet', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Kopieer"><button>Trigger</button></nldd-tooltip><button id="elders">Elders</button>');
		el = tooltip;
		await waitForUpdate(tooltip);
		const trigger = tooltip.querySelector('button')!;
		trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'mouse' }));
		trigger.focus();
		document.getElementById('elders')!.focus();
		trigger.focus();
		await until(() => isTooltipVisible(tooltip));
	});

	it('verdwijnt bij scrollen als hover hem toonde', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await waitForUpdate(tooltip);
		await triggerShow(tooltip, tooltip.querySelector('button')!);
		window.dispatchEvent(new Event('scroll'));
		await until(() => !isTooltipVisible(tooltip));
		expect(isTooltipVisible(tooltip)).toBe(false);
	});

	it('blijft bij scrollen als focus hem toonde', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await waitForUpdate(tooltip);
		tooltip.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await until(() => isTooltipVisible(tooltip));
		window.dispatchEvent(new Event('scroll'));
		await waitForUpdate(tooltip);
		expect(isTooltipVisible(tooltip)).toBe(true);
	});

	it('verdwijnt bij een resize als hover hem toonde', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await waitForUpdate(tooltip);
		await triggerShow(tooltip, tooltip.querySelector('button')!);
		window.dispatchEvent(new Event('resize'));
		await until(() => !isTooltipVisible(tooltip));
	});

	// A toolbar that is only there at another width hides the trigger.
	it('verdwijnt bij een resize die de trigger verbergt, ook met focus', async () => {
		const tooltip = await fixture<NLDDTooltip>('<div><nldd-tooltip text="Test"><button>Trigger</button></nldd-tooltip></div>');
		const real = tooltip.querySelector('nldd-tooltip') as NLDDTooltip;
		el = tooltip;
		await waitForUpdate(real);
		real.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		await until(() => isTooltipVisible(real));
		(tooltip as HTMLElement).style.display = 'none';
		window.dispatchEvent(new Event('resize'));
		await until(() => !isTooltipVisible(real));
	});

	it('blijft bij scrollen als open hem vastzet', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Test" open><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await until(() => isTooltipVisible(tooltip));
		window.dispatchEvent(new Event('scroll'));
		await waitForUpdate(tooltip);
		expect(isTooltipVisible(tooltip)).toBe(true);
	});

	// Like the content of nldd-page: a scroll event stays in its shadow root,
	// so a listener on the document never heard it.
	it('hoort een scroller in een shadow root', async () => {
		const host = document.createElement('div');
		host.attachShadow({ mode: 'open' }).innerHTML = '<div style="overflow:auto;height:200px"><div style="height:2000px;padding-top:100px"><slot></slot></div></div>';
		host.innerHTML = '<nldd-tooltip text="Test" open placement="left" style="display:inline-block;margin-left:400px"><button>Trigger</button></nldd-tooltip><nldd-tooltip text="Hover"><button>Trigger</button></nldd-tooltip>';
		document.body.append(host);
		onTestFinished(() => host.remove());
		const [forced, hovered] = host.querySelectorAll<NLDDTooltip>('nldd-tooltip');
		const scroller = host.shadowRoot!.firstElementChild as HTMLElement;
		await waitForUpdate(hovered);
		await triggerShow(hovered, hovered.querySelector('button')!);
		await until(() => isTooltipVisible(forced) && isTooltipVisible(hovered));
		const tip = forced.shadowRoot!.querySelector<HTMLElement>('.tooltip')!;
		const before = tip.getBoundingClientRect().top;

		scroller.scrollTop = 50;
		await until(() => !isTooltipVisible(hovered));
		await until(() => Math.round(before - tip.getBoundingClientRect().top) === 50);
		expect(isTooltipVisible(forced)).toBe(true);
	});

	// The copy button of nldd-code-viewer releases "Gekopieerd" and puts its
	// label back in one go: the label flashed while the tooltip faded out.
	it('fadet uit met de tekst die hij had', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Gekopieerd" open style="--_tooltip-hide-duration:300ms"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		await until(() => isTooltipVisible(tooltip));
		const text = () => tooltip.shadowRoot!.querySelector('.tooltip__text')?.textContent;
		tooltip.open = false;
		tooltip.text = 'Kopieer';
		await until(() => !isTooltipVisible(tooltip));
		expect(text()).toBe('Gekopieerd');
		await until(() => text() === 'Kopieer');
	});

	it('gaat mee met zijn trigger terwijl hij uitfadet', async () => {
		const host = document.createElement('div');
		host.attachShadow({ mode: 'open' }).innerHTML = '<div style="overflow:auto;height:200px"><div style="height:2000px;padding-top:100px"><slot></slot></div></div>';
		host.innerHTML = '<nldd-tooltip text="Gekopieerd" open placement="left" style="display:inline-block;margin-left:400px;--_tooltip-hide-duration:2s"><button>Trigger</button></nldd-tooltip>';
		document.body.append(host);
		onTestFinished(() => host.remove());
		const tooltip = host.querySelector<NLDDTooltip>('nldd-tooltip')!;
		await until(() => isTooltipVisible(tooltip));
		const tip = tooltip.shadowRoot!.querySelector<HTMLElement>('.tooltip')!;
		const before = tip.getBoundingClientRect().top;
		tooltip.open = false;
		await until(() => !isTooltipVisible(tooltip));

		(host.shadowRoot!.firstElementChild as HTMLElement).scrollTop = 50;
		await until(() => Math.round(before - tip.getBoundingClientRect().top) === 50);
	});

	it('gaat mee met zijn trigger en verbergt zich als die uit beeld scrolt', async () => {
		const tooltip = await fixture<NLDDTooltip>('<nldd-tooltip text="Test" open placement="left" style="display:inline-block;margin:300px 0 0 400px"><button>Trigger</button></nldd-tooltip>');
		el = tooltip;
		const spacer = document.createElement('div');
		spacer.style.height = '5000px';
		document.body.append(spacer);
		onTestFinished(() => { spacer.remove(); window.scrollTo(0, 0); });
		await until(() => isTooltipVisible(tooltip));
		const tip = tooltip.shadowRoot!.querySelector<HTMLElement>('.tooltip')!;
		const button = tooltip.querySelector('button')!;
		const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

		window.scrollTo(0, 0);
		await settle();
		expect(tip.hasAttribute('reference-hidden')).toBe(false);

		// Without limitShift, shift pinned it to the top of the screen.
		window.scrollTo(0, button.getBoundingClientRect().top + window.scrollY + 500);
		await settle();
		expect(tip.getBoundingClientRect().bottom).toBeLessThan(0);
		expect(tip.hasAttribute('reference-hidden')).toBe(true);
		expect(getComputedStyle(tip).visibility).toBe('hidden');

		window.scrollTo(0, 0);
		await settle();
		expect(tip.hasAttribute('reference-hidden')).toBe(false);
	});
	it('blijft zichtbaar in een popover onder een ouder die afsnijdt', async () => {
		// Like the site's theme menu: an absolute popover in a relative button, in a
		// 20px bar with overflow: hidden. In the top layer the bar clips nothing.
		const bar = await fixture<HTMLElement>(`
			<div style="height:20px;overflow:hidden">
				<span style="position:relative">
					<div popover="manual" style="position:absolute;inset:200px auto auto 200px;margin:0;padding:40px">
						<nldd-tooltip text="Test" open><button>Trigger</button></nldd-tooltip>
					</div>
				</span>
			</div>`);
		el = bar;
		const popover = bar.querySelector<HTMLElement>('[popover]')!;
		popover.showPopover();
		const tooltip = bar.querySelector<NLDDTooltip>('nldd-tooltip')!;
		await until(() => isTooltipVisible(tooltip));
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(tooltip.shadowRoot!.querySelector('.tooltip')!.hasAttribute('reference-hidden')).toBe(false);
	});
});
