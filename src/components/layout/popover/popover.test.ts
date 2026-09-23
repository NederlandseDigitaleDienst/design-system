import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './popover.js';
import type { NLDDPopover } from './popover.js';

describe('nldd-popover', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-popover accessible-label="Test"></nldd-popover>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('zet popover, role en tabindex attributen op de host', async () => {
		el = await fixture('<nldd-popover accessible-label="Test"></nldd-popover>');
		await waitForUpdate(el);
		expect(el.getAttribute('popover')).toBe('');
		expect(el.getAttribute('role')).toBe('dialog');
		// aria-modal is not set explicitly: the default for role="dialog" is false
		// and spelling it out adds nothing.
		expect(el.hasAttribute('aria-modal')).toBe(false);
		expect(el.getAttribute('tabindex')).toBe('-1');
	});

	it('zet aria-label op basis van accessible-label', async () => {
		el = await fixture('<nldd-popover accessible-label="Mijn popover"></nldd-popover>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Mijn popover');
	});

	it('show() opent en zet open=true; hide() sluit', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="trigger-show">Trigger</button>
				<nldd-popover anchor="trigger-show" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		await waitForUpdate(popover);

		popover.show();
		await waitForUpdate(popover);
		expect(popover.open).toBe(true);

		popover.hide();
		await waitForUpdate(popover);
		expect(popover.open).toBe(false);
	});

	it('toggle() wisselt staat', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="trigger-toggle">Trigger</button>
				<nldd-popover anchor="trigger-toggle" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		await waitForUpdate(popover);

		popover.toggle();
		await waitForUpdate(popover);
		expect(popover.open).toBe(true);

		popover.toggle();
		await waitForUpdate(popover);
		expect(popover.open).toBe(false);
	});

	it('vuurt open en close events', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="trigger-events">Trigger</button>
				<nldd-popover anchor="trigger-events" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		await waitForUpdate(popover);

		const opened = vi.fn();
		const closed = vi.fn();
		popover.addEventListener('open', opened);
		popover.addEventListener('close', closed);

		popover.show();
		await waitForUpdate(popover);
		expect(opened).toHaveBeenCalledTimes(1);

		popover.hide();
		await waitForUpdate(popover);
		expect(closed).toHaveBeenCalledTimes(1);
	});

	it('initialiseert aria-expanded en aria-haspopup op de anchor bij connect', async () => {
		// A screen reader should announce the trigger as a toggle control from the
		// first render, not only after the first open.
		const wrapper = await fixture(`
			<div>
				<button id="trigger-init-aria">Trigger</button>
				<nldd-popover anchor="trigger-init-aria" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const trigger = wrapper.querySelector('#trigger-init-aria')!;
		// Wait until the deferred microtask in connectedCallback has run
		await new Promise(resolve => setTimeout(resolve, 0));
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('update aria-expanded en aria-haspopup op de anchor', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="trigger-aria">Trigger</button>
				<nldd-popover anchor="trigger-aria" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		const trigger = wrapper.querySelector('#trigger-aria')!;
		await waitForUpdate(popover);

		popover.show();
		await waitForUpdate(popover);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');

		popover.hide();
		await waitForUpdate(popover);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('warnt en doet niets als anchor niet gevonden wordt', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-popover anchor="non-existent" accessible-label="Test"></nldd-popover>');
		await waitForUpdate(el);

		(el as NLDDPopover).show();
		await waitForUpdate(el);

		expect(warn).toHaveBeenCalled();
		expect((el as NLDDPopover).open).toBe(false);
		warn.mockRestore();
	});

	it('anchorElement property heeft voorrang op anchor attribuut', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="anchor-by-id">By ID</button>
				<button id="anchor-by-prop">By prop</button>
				<nldd-popover anchor="anchor-by-id" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		const propAnchor = wrapper.querySelector('#anchor-by-prop')!;
		popover.anchorElement = propAnchor;
		await waitForUpdate(popover);

		popover.show();
		await waitForUpdate(popover);

		expect(propAnchor.getAttribute('aria-expanded')).toBe('true');
		expect(wrapper.querySelector('#anchor-by-id')!.hasAttribute('aria-expanded')).toBe(false);
	});

	it('disconnect strip alle aria-* van anchor (geen stale state in SPA flows)', async () => {
		// Regression: in SPA patterns (v-if, React conditional render) the popover
		// can disappear while the anchor stays. A leftover aria-controls pointing at
		// an element that does not exist is a WCAG 4.1.2 failure.
		const wrapper = await fixture(`
			<div>
				<button id="trigger-disconnect">Trigger</button>
				<nldd-popover anchor="trigger-disconnect" id="disconnect-popover" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const trigger = wrapper.querySelector('#trigger-disconnect')!;
		const popover = wrapper.querySelector('nldd-popover')!;
		// Wait until the deferred init-aria call has run
		await new Promise(resolve => setTimeout(resolve, 0));
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-controls')).toBe('disconnect-popover');

		// Verwijder popover uit DOM (bv. v-if false)
		popover.remove();

		// The anchor must have no leftover aria-*
		expect(trigger.hasAttribute('aria-expanded')).toBe(false);
		expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
		expect(trigger.hasAttribute('aria-controls')).toBe(false);
	});

	it('updated() reageert op anchor-wissel zelfs als popover gesloten is', async () => {
		// Regression: _updateAnchorAria used not to be called when anchor or
		// anchorElement changed at runtime while the popover was closed, so the old
		// trigger kept a stale aria-expanded
		// en aria-controls.
		const wrapper = await fixture(`
			<div>
				<button id="initial-anchor">Initial</button>
				<button id="new-anchor">New</button>
				<nldd-popover anchor="initial-anchor" id="my-popover" accessible-label="Test"></nldd-popover>
			</div>
		`);
		el = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		const initial = wrapper.querySelector('#initial-anchor')!;
		const newAnchor = wrapper.querySelector('#new-anchor')!;
		// Wait until the deferred init-aria call has run
		await new Promise(resolve => setTimeout(resolve, 0));
		expect(initial.getAttribute('aria-expanded')).toBe('false');
		expect(initial.getAttribute('aria-controls')).toBe('my-popover');

		// Change the anchor while the popover is closed
		popover.setAttribute('anchor', 'new-anchor');
		await waitForUpdate(popover);

		// Oude anchor: aria-expanded en aria-controls weg
		expect(initial.hasAttribute('aria-expanded')).toBe(false);
		expect(initial.hasAttribute('aria-controls')).toBe(false);
		// Nieuwe anchor: aria-expanded = false (gesloten), aria-controls gezet
		expect(newAnchor.getAttribute('aria-expanded')).toBe('false');
		expect(newAnchor.getAttribute('aria-controls')).toBe('my-popover');
	});


	describe('focus management & keyboard navigation', () => {
		it('zet focus terug op de anchor na hide()', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-return-focus">Trigger</button>
					<nldd-popover anchor="trigger-return-focus" accessible-label="Test"></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			const trigger = wrapper.querySelector<HTMLButtonElement>('#trigger-return-focus')!;
			await waitForUpdate(popover);

			// Focus the trigger so _previousFocus remembers it on open
			trigger.focus();
			expect(document.activeElement).toBe(trigger);

			popover.show();
			await waitForUpdate(popover);

			popover.hide();
			await waitForUpdate(popover);

			expect(document.activeElement).toBe(trigger);
		});

		it('Tab op laatste focusable sluit de popover', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-tab-out">Trigger</button>
					<nldd-popover anchor="trigger-tab-out" accessible-label="Test">
						<button id="popover-btn-1">Eerste</button>
						<button id="popover-btn-2">Laatste</button>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);
			expect(popover.open).toBe(true);

			const last = wrapper.querySelector<HTMLButtonElement>('#popover-btn-2')!;
			last.focus();

			// Tab forward on the last focusable closes the popover. Dispatched on the
			// focused element, so composedPath()[0] is the button (matching how a real
			// browser delivers the event).
			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true,
				composed: true,
			});
			last.dispatchEvent(tabEvent);
			await waitForUpdate(popover);

			expect(popover.open).toBe(false);
		});

		it('Shift+Tab op eerste focusable sluit de popover', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-shift-tab">Trigger</button>
					<nldd-popover anchor="trigger-shift-tab" accessible-label="Test">
						<button id="popover-btn-first">Eerste</button>
						<button id="popover-btn-second">Tweede</button>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			const first = wrapper.querySelector<HTMLButtonElement>('#popover-btn-first')!;
			first.focus();

			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				shiftKey: true,
				bubbles: true,
				cancelable: true,
				composed: true,
			});
			first.dispatchEvent(tabEvent);
			await waitForUpdate(popover);

			expect(popover.open).toBe(false);
		});

		it('Shift+Tab vanuit shadow-DOM custom element sluit niet wanneer er een focusable vóór staat', async () => {
			// Regression: document.activeElement used to return the host (custom
			// element) instead of the inner <button>. indexOf gave -1, and
			// (-1 <= 0) === true, which made Shift-Tab always close, even in the
			// middle of the popover. This test simulates an nldd-button-like custom
			// element with an inner button.
			class TestCustomBtn extends HTMLElement {
				static observedAttributes = [];
				constructor() {
					super();
					const sr = this.attachShadow({ mode: 'open' });
					sr.innerHTML = '<button class="inner">slot</button>';
				}
			}
			if (!customElements.get('test-custom-btn')) {
				customElements.define('test-custom-btn', TestCustomBtn);
			}

			const wrapper = await fixture(`
				<div>
					<button id="trigger-shadow-shift">Trigger</button>
					<nldd-popover anchor="trigger-shadow-shift" accessible-label="Test">
						<button id="first-light">First</button>
						<test-custom-btn id="second-shadow"></test-custom-btn>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			// Focus the custom element's inner button (position 2)
			const customBtn = wrapper.querySelector('#second-shadow') as HTMLElement;
			const innerBtn = customBtn.shadowRoot!.querySelector('.inner') as HTMLButtonElement;
			innerBtn.focus();

			// Shift-Tab from position 2 must NOT close: there is still a focusable
			// before it (the light-DOM button at position 1).
			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				shiftKey: true,
				bubbles: true,
				cancelable: true,
				composed: true,
			});
			innerBtn.dispatchEvent(tabEvent);
			await waitForUpdate(popover);

			expect(popover.open).toBe(true);
		});

		it('Tab in het midden van de popover sluit niet', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-middle-tab">Trigger</button>
					<nldd-popover anchor="trigger-middle-tab" accessible-label="Test">
						<button id="middle-btn-1">A</button>
						<button id="middle-btn-2">B</button>
						<button id="middle-btn-3">C</button>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			// Focus on the middle one, Tab must not close
			const middle = wrapper.querySelector<HTMLButtonElement>('#middle-btn-2')!;
			middle.focus();
			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true,
				composed: true,
			});
			middle.dispatchEvent(tabEvent);
			await waitForUpdate(popover);

			expect(popover.open).toBe(true);
		});

		it('zet is-pointer-focus class wanneer geopend met de muis', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-pointer">Trigger</button>
					<nldd-popover anchor="trigger-pointer" accessible-label="Test"></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			// Mark the input modality as 'mouse'. The listener sits on document
			// (earlier Tab tests set modality to 'keyboard', so an explicit
			// pointerdown is nodig om 'm te resetten).
			document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true }));

			popover.show();
			await waitForUpdate(popover);

			expect(popover.classList.contains('is-pointer-focus')).toBe(true);
		});

		it('focust [autofocus] element binnen de popover als aanwezig', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-autofocus">Trigger</button>
					<nldd-popover anchor="trigger-autofocus" accessible-label="Test">
						<button id="not-auto">Niet</button>
						<button id="auto-target" autofocus>Wel</button>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			const autoTarget = wrapper.querySelector('#auto-target');
			expect(document.activeElement).toBe(autoTarget);
		});

		it('focust de popover-host zelf als er geen [autofocus] is', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-host-focus">Trigger</button>
					<nldd-popover anchor="trigger-host-focus" accessible-label="Test">
						<p>Geen focusable</p>
					</nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			expect(document.activeElement).toBe(popover);
		});
	});


	describe('position overrides (centered + edge attrs)', () => {
		// Force md/lg viewport so the sm bottom-sheet branch isn't taken.
		// reposition() reads `_smQuery.matches`, which we override to false.
		function asMd(popover: NLDDPopover) {
			(popover as unknown as { _smQuery: MediaQueryList })._smQuery = {
				matches: false,
				addEventListener: () => {},
				removeEventListener: () => {},
			} as unknown as MediaQueryList;
		}

		it('centered=true centreert beide assen via translate(-50%, -50%)', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-centered">Trigger</button>
					<nldd-popover anchor="trigger-centered" accessible-label="Test" centered></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			asMd(popover);
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			expect(popover.style.top).toBe('50%');
			expect(popover.style.left).toBe('50%');
			expect(popover.style.transform).toContain('-50%');
			expect(popover.style.transform).toContain(', -50%');
		});

		it('laat geen centreer-transform achter wanneer centered wegvalt', async () => {
			// A responsive popover that switches from centered to anchored on a
			// breakpoint change: without cleanup it keeps translate(-50%, ...) and
			// lands half its width off its anchor, partly off screen.
			const wrapper = await fixture(`
				<div>
					<button id="trigger-uncenter">Trigger</button>
					<nldd-popover anchor="trigger-uncenter" accessible-label="Test" centered top="0"></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			asMd(popover);
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);
			expect(popover.style.transform).toContain('-50%');

			popover.centered = false;
			popover.top = '';
			await waitForUpdate(popover);
			await new Promise(r => setTimeout(r, 0));

			expect(popover.style.transform).toBe('');
		});

		it('centered + top="0" → horizontaal gecentreerd, top-aligned', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-centered-top">Trigger</button>
					<nldd-popover anchor="trigger-centered-top" accessible-label="Test" centered top="0"></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			asMd(popover);
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			expect(popover.style.top).toBe('0px');
			expect(popover.style.left).toBe('50%');
			// The Y axis uses no translate, the X axis does. (jsdom normalizes "0" to "0px".)
			expect(popover.style.transform).toMatch(/translate\(-50%,\s*0(px)?\)/);
		});

		it('expliciete edge attrs zonder centered worden ingeklemd', async () => {
			const wrapper = await fixture(`
				<div>
					<button id="trigger-edge">Trigger</button>
					<nldd-popover anchor="trigger-edge" accessible-label="Test" top="10px" right="20px"></nldd-popover>
				</div>
			`);
			el = wrapper;
			const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
			asMd(popover);
			await waitForUpdate(popover);

			popover.show();
			await waitForUpdate(popover);

			expect(popover.style.top).toBe('10px');
			expect(popover.style.right).toBe('20px');
			// No transform: neither axis was centered.
			expect(popover.style.transform).toBe('');
		});

		it('sm-full-height attribuut wordt op de host gereflecteerd', async () => {
			el = await fixture('<nldd-popover accessible-label="Test" sm-full-height></nldd-popover>');
			await waitForUpdate(el);
			expect(el.hasAttribute('sm-full-height')).toBe(true);
		});

		// A roving-tabindex widget (grid, toolbar, tree) puts all of its items on -1
		// except one. Counting those, tab-out never saw that focus was at the end
		// and the user tabbed out of the popover while it stayed open.
		it('telt alleen echt tabbare elementen, geen tabindex="-1"', async () => {
			el = await fixture(`
				<nldd-popover accessible-label="Test">
					<button id="een">Een</button>
					<button id="rovend" tabindex="-1">Overgeslagen</button>
					<button id="twee">Twee</button>
				</nldd-popover>
			`);
			await waitForUpdate(el);
			// Closed, the popover is display:none and the visibility check filters everything out.
			(el as HTMLElement).showPopover();
			await waitForUpdate(el);
			const focusables = (el as unknown as { _getFocusables(): HTMLElement[] })._getFocusables();
			expect(focusables.map((e) => e.id)).toEqual(['een', 'twee']);
			(el as HTMLElement).hidePopover();
		});

		it('top/left/right/bottom defaulten naar undefined — geen lege reflectie', async () => {
			el = await fixture('<nldd-popover accessible-label="Test"></nldd-popover>');
			await waitForUpdate(el);
			// Lit used to reflect an empty string as top="" and so on onto every
			// popover. With an undefined default the attribute may be absent.
			expect(el.hasAttribute('top')).toBe(false);
			expect(el.hasAttribute('left')).toBe(false);
			expect(el.hasAttribute('right')).toBe(false);
			expect(el.hasAttribute('bottom')).toBe(false);
		});
	});
});

describe('nldd-popover verplaatst focus zelf met Tab', () => {
	let elTab: HTMLElement;

	afterEach(() => {
		if (elTab) cleanup(elTab);
	});

	// We move focus ourselves now, so we owe the tab order too: a positive
	// tabindex jumps the queue. Without sorting it ran on DOM order.
	it('respecteert een positieve tabindex boven documentvolgorde', async () => {
		const wrapper = await fixture(`
			<div>
				<button id="pos-trigger">Open</button>
				<nldd-popover anchor="pos-trigger" accessible-label="Test">
					<button id="eerst-in-dom" tabindex="2">A</button>
					<button id="laatst-in-dom" tabindex="1">B</button>
				</nldd-popover>
			</div>
		`);
		elTab = wrapper;
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover & { show(): void };
		await waitForUpdate(popover);
		popover.show();
		await waitForUpdate(popover);
		// tabindex 1 comes before tabindex 2, even though B is later in the DOM.
		popover.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true }));
		await waitForUpdate(popover);
		expect(document.activeElement?.id).toBe('laatst-in-dom');
	});

	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	async function metTweeKnoppen() {
		const wrapper = await fixture(`
			<div>
				<button id="trigger-tab">Open</button>
				<nldd-popover anchor="trigger-tab" accessible-label="Test">
					<button id="een">Een</button>
					<button id="twee">Twee</button>
				</nldd-popover>
			</div>
		`);
		const popover = wrapper.querySelector('nldd-popover') as HTMLElement & { show(): void };
		await waitForUpdate(popover);
		popover.show();
		await waitForUpdate(popover);
		return { wrapper, popover };
	}

	// Safari does not tab into the top layer: with the container focused it skips
	// the whole popover and lands on whatever follows it in the document. Our list
	// was right, so the component moves focus itself now.
	it('stapt vanaf de container naar de eerste knop', async () => {
		const { wrapper, popover } = await metTweeKnoppen();
		el = wrapper;
		popover.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true }));
		await waitForUpdate(popover);
		expect(document.activeElement?.id).toBe('een');
	});

	// Between elements the browser moves focus itself. A focus the browser moves
	// on a key press gets a ring unconditionally; a focus WE move only inherits the
	// ring state of the element being left. Intercepting every Tab therefore meant
	// one mouse click anywhere started a chain in which no Tab stop showed a focus
	// ring again.
	it('laat een Tab tussen twee knoppen aan de browser', async () => {
		const { wrapper, popover } = await metTweeKnoppen();
		el = wrapper;
		const een = wrapper.querySelector('#een') as HTMLElement;
		een.focus();
		const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true });
		een.dispatchEvent(event);
		await waitForUpdate(popover);
		expect(event.defaultPrevented).toBe(false);
		expect(popover.matches(':popover-open')).toBe(true);
	});

	it('sluit pas voorbij de laatste knop', async () => {
		const { wrapper, popover } = await metTweeKnoppen();
		el = wrapper;
		const twee = wrapper.querySelector('#twee') as HTMLElement;
		twee.focus();
		twee.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true }));
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(false);
	});
});

describe('nldd-popover slikt de eerste tik op klein scherm', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	function asSm(popover: NLDDPopover) {
		(popover as unknown as { _smQuery: MediaQueryList })._smQuery = {
			matches: true,
			addEventListener: () => {},
			removeEventListener: () => {},
		} as unknown as MediaQueryList;
	}

	async function openOnSm() {
		const wrapper = await fixture(`
			<div>
				<button id="sm-trigger">Open</button>
				<button id="sm-target">Doel</button>
				<nldd-popover anchor="sm-trigger" accessible-label="Test"></nldd-popover>
			</div>
		`);
		const popover = wrapper.querySelector('nldd-popover') as NLDDPopover;
		asSm(popover);
		await waitForUpdate(popover);
		popover.show();
		await waitForUpdate(popover);
		return { wrapper, popover, target: wrapper.querySelector('#sm-target') as HTMLElement };
	}

	// The dimming on a small screen let the tap through to the page underneath, so
	// one tap both closed the sheet and activated whatever sat under it.
	it('sluit de popover en houdt de klik eronder tegen', async () => {
		const { wrapper, popover, target } = await openOnSm();
		el = wrapper;
		let raakt = 0;
		target.addEventListener('click', () => { raakt += 1; });

		document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		target.dispatchEvent(click);

		expect(raakt).toBe(0);
		expect(click.defaultPrevented).toBe(true);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	// A tap that turns into a scroll or drag ends without a click, so the
	// swallow flag must not linger and catch a later, unrelated click. After the
	// swallowed tap the popover is closed, so a new gesture no longer absorbs and
	// should simply clear the flag.
	it('laat een latere ongerelateerde klik met rust na een tik zonder klik', async () => {
		const { wrapper, popover, target } = await openOnSm();
		el = wrapper;
		// As if an earlier tap was swallowed but gave no click and the popover closed.
		(popover as unknown as { _swallowNextClick: boolean })._swallowNextClick = true;
		popover.hide();
		await waitForUpdate(popover);
		let raakt = 0;
		target.addEventListener('click', () => { raakt += 1; });
		// A new, separate gesture with a real click.
		document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		target.dispatchEvent(click);

		expect(raakt).toBe(1);
		expect(click.defaultPrevented).toBe(false);
	});

	// The pointerdown route clears the flag on the next gesture. A canceled gesture
	// (scroll or drag) never delivers that pointerdown, so pointercancel has to
	// clear it too, or a later click still runs into the swallow flag.
	it('wist de opslik-vlag bij een geannuleerd gebaar', async () => {
		const { wrapper, popover, target } = await openOnSm();
		el = wrapper;
		// As if a tap was swallowed (flag set, sheet closed) and the gesture then
		// becomes a scroll: the browser sends pointercancel instead of a click.
		(popover as unknown as { _swallowNextClick: boolean })._swallowNextClick = true;
		popover.hide();
		await waitForUpdate(popover);
		document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true }));
		let raakt = 0;
		target.addEventListener('click', () => { raakt += 1; });
		const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
		target.dispatchEvent(click);

		expect(raakt).toBe(1);
		expect(click.defaultPrevented).toBe(false);
	});

	it('negeert een inhoudsmaat als breedte en houdt de standaardbreedte', async () => {
		el = await fixture('<nldd-popover width="fit-content" accessible-label="t"></nldd-popover>');
		await waitForUpdate(el);
		// Had the value been let through, the browser would compute the popover at
		// 0px: an inline-size container cannot take its width from its own content.
		expect(el.style.getPropertyValue('--components-popover-default-width')).toBe('');
	});

	it('zet een echte lengte wel door', async () => {
		el = await fixture('<nldd-popover width="480px" accessible-label="t"></nldd-popover>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--components-popover-default-width')).toBe('480px');
	});

});

describe('nldd-popover – open attribute', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const withAnchor = async (attrs = '') => {
		el = await fixture(`
			<div>
				<button id="trigger-open-attr">Trigger</button>
				<nldd-popover anchor="trigger-open-attr" accessible-label="Test" ${attrs}></nldd-popover>
			</div>
		`);
		const popover = el.querySelector('nldd-popover') as NLDDPopover;
		await waitForUpdate(popover);
		return popover;
	};

	it('opens from the first render when open is set', async () => {
		const popover = await withAnchor('open');
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
	});

	it('opens and closes when open is set and cleared', async () => {
		const popover = await withAnchor();
		popover.open = true;
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(true);
		popover.open = false;
		await waitForUpdate(popover);
		expect(popover.matches(':popover-open')).toBe(false);
	});

	it('clears open when it closes another way', async () => {
		const popover = await withAnchor();
		popover.show();
		await waitForUpdate(popover);
		expect(popover.hasAttribute('open')).toBe(true);
		(popover as HTMLElement).hidePopover();
		await waitForUpdate(popover);
		expect(popover.open).toBe(false);
		expect(popover.hasAttribute('open')).toBe(false);
	});

	it('does not keep open without an anchor to open against', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture('<nldd-popover accessible-label="Test"></nldd-popover>');
		const popover = el as NLDDPopover;
		popover.open = true;
		await waitForUpdate(popover);
		expect(popover.open).toBe(false);
		expect(popover.hasAttribute('open')).toBe(false);
	});
});
