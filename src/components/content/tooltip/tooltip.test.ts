import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, until } from '../../../test-utils.js';
import type { NLDDTooltip } from './tooltip.js';
import './tooltip.js';

function isTooltipVisible(el: NLDDTooltip): boolean {
	const tooltip = el.shadowRoot!.querySelector<HTMLElement>('.tooltip');
	return tooltip?.matches(':popover-open') ?? false;
}

/**
 * Tooltip uses a 700ms pointer-hover show delay (read from CSS
 * `--_show-delay`). In tests we override it to 0 so mouseenter shows the
 * tooltip on the next microtask instead of forcing every test to wait.
 */
function instantShow(el: NLDDTooltip): void {
	el.style.setProperty('--_show-delay', '0');
}

/**
 * The hide side of the same trick. The tooltip waits 50ms before it goes, and
 * a test that budgets wall-clock time for that is really measuring how busy
 * the machine is: on a loaded runner the timer lands late and the assertion
 * reads a tooltip that was on its way out as one that stayed.
 */
function instantHide(el: NLDDTooltip): void {
	el.style.setProperty('--_hide-delay', '0');
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
		hideDelay: getComputedStyle(el).getPropertyValue('--_hide-delay').trim(),
		pendingHide: (el as unknown as { _hideTimeout: unknown })._hideTimeout !== null,
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
		el.style.setProperty('--_show-delay', '50');

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

});
