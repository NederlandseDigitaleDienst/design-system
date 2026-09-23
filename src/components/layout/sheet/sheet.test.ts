import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDSheet } from './sheet.js';
import './sheet.js';
import '../../inputs/text-field/text-field.js';
import '../split-views/split-view-pane/split-view-pane.js';
import '../../navigation/top-title-bar/top-title-bar.js';
import { sheetStyles } from './sheet.styles.js';


/* ============================================================
   Smoke tests
   ============================================================ */

describe('nldd-sheet', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a dialog element', async () => {
		el = await fixture('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('dialog')).not.toBeNull();
	});

	it('defaults to placement right', async () => {
		el = await fixture('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		// The default (right) is kept out of the DOM; the property is the source of truth.
		expect((el as unknown as { placement: string }).placement).toBe('right');
		expect(el.hasAttribute('placement')).toBe(false);
	});

	/* See the same test on nldd-modal-dialog: an opening animation that ends on
	 * a transform leaves that transform behind, and anything inside positioned
	 * against the viewport then measures against the sheet. */
	it('keeps no transform once it has opened', async () => {
		// The duration and the easing are tokens, and a test document has no
		// variables.css: without them the `animation` shorthand is invalid and
		// nothing animates at all.
		el = await fixture('<nldd-sheet style="--semantics-sheets-side-animation-duration: 20ms; --semantics-sheets-bottom-animation-duration: 20ms; --primitives-transition-easing-default: linear"></nldd-sheet>');
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		(el as NLDDSheet).show();
		await (el as NLDDSheet).updateComplete;
		await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
		expect(getComputedStyle(dialog).transform).toBe('none');
	});

	it('opens modal, with a backdrop and the page behind it inert', async () => {
		el = await fixture('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		(el as NLDDSheet).show();
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(dialog.matches(':modal')).toBe(true);
	});

	it('reflects placement attribute', async () => {
		el = await fixture('<nldd-sheet placement="bottom"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.getAttribute('placement')).toBe('bottom');
	});
});


/* ============================================================
   show() / hide()
   ============================================================ */

describe('nldd-sheet – tonen en verbergen', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) {
			const dialog = el.shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('opens the dialog when show() is called', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(dialog.open).toBe(true);
	});

	/** Like `fixture`, but returns before the first render: these tests are about
	 *  what happens when a consumer calls show() in that very window. */
	const mountUnrendered = (): NLDDSheet => {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = '<nldd-sheet></nldd-sheet>';
		document.body.appendChild(wrapper);
		return wrapper.firstElementChild as NLDDSheet;
	};

	it('still opens when show() is called before the first render', async () => {
		el = mountUnrendered();
		expect(el.shadowRoot?.querySelector('dialog')).toBeFalsy();
		el.show();

		await waitForUpdate(el);
		await el.updateComplete;
		expect(el.shadowRoot!.querySelector('dialog')!.open).toBe(true);
	});

	it('lets a hide() before the first render cancel that pending open', async () => {
		el = mountUnrendered();
		el.show();
		el.hide();

		await waitForUpdate(el);
		await el.updateComplete;
		expect(el.shadowRoot!.querySelector('dialog')!.open).toBe(false);
	});

	it('fires open event when show() is called', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		const listener = vi.fn();
		el.addEventListener('open', listener);
		el.show();
		expect(listener).toHaveBeenCalledOnce();
	});

	it('adds is-closing class when hide() is called', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();
		el.hide();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(dialog.classList.contains('is-closing')).toBe(true);
	});

	it('does not fire close event immediately when hide() is called', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();
		const listener = vi.fn();
		el.addEventListener('close', listener);
		el.hide();
		expect(listener).not.toHaveBeenCalled();
	});

	it('does nothing when hide() is called on a closed sheet', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		// Should not throw
		expect(() => el.hide()).not.toThrow();
	});

	it('uses showModal(), never show()', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(dialog.open).toBe(true);
		expect(dialog.matches(':modal')).toBe(true);
	});
});


/* ============================================================
   Backdrop click
   ============================================================ */

describe('nldd-sheet – backdrop klik', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) {
			const dialog = el.shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('calls hide() when both the press and the release are on the dialog (backdrop)', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();

		const hideSpy = vi.spyOn(el, 'hide');
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		const down = new PointerEvent('pointerdown', { bubbles: true });
		Object.defineProperty(down, 'target', { value: dialog });
		el._handleDialogPointerDown(down);
		const event = new MouseEvent('click', { bubbles: true });
		Object.defineProperty(event, 'target', { value: dialog });
		el._handleDialogClick(event);

		expect(hideSpy).toHaveBeenCalledOnce();
	});

	it('does not hide() when the press started inside the sheet and the release lands on the backdrop', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet><input></nldd-sheet>');
		await waitForUpdate(el);
		el.show();

		const hideSpy = vi.spyOn(el, 'hide');
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		const body = el.shadowRoot!.querySelector('.sheet__body')!;
		// Press begins on the content (e.g. selecting text in the input)…
		const down = new PointerEvent('pointerdown', { bubbles: true });
		Object.defineProperty(down, 'target', { value: body });
		el._handleDialogPointerDown(down);
		// …and the drag ends on the backdrop, so the click resolves to the dialog.
		const event = new MouseEvent('click', { bubbles: true });
		Object.defineProperty(event, 'target', { value: dialog });
		el._handleDialogClick(event);

		expect(hideSpy).not.toHaveBeenCalled();
	});
});


/* ============================================================
   Escape key / cancel event
   ============================================================ */

describe('nldd-sheet – Escape-toets', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) {
			const dialog = el.shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('prevents default cancel event and calls hide()', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();

		const hideSpy = vi.spyOn(el, 'hide');
		const event = new Event('cancel', { cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');

		el._handleCancel(event);

		expect(preventSpy).toHaveBeenCalled();
		expect(hideSpy).toHaveBeenCalledOnce();
	});
});


/* ============================================================
   Dismiss event
   ============================================================ */

describe('nldd-sheet – dismiss event', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) {
			const dialog = el.shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('calls hide() when the dismiss comes from its top-title-bar', async () => {
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<nldd-top-title-bar dismiss-text="Sluit"></nldd-top-title-bar>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		el.show();

		const hideSpy = vi.spyOn(el, 'hide');
		el.querySelector('nldd-top-title-bar')!
			.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));

		expect(hideSpy).toHaveBeenCalledOnce();
	});

	it('ignores a dismiss from another component inside it (e.g. nldd-token)', async () => {
		// Regression: nldd-token (and nldd-banner, nldd-document-tab-bar) fire
		// `dismiss` for their own element. Removing a token inside a sheet used to
		// bubble up and close the whole sheet.
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<nldd-token control="dismiss">Label</nldd-token>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		el.show();

		const hideSpy = vi.spyOn(el, 'hide');
		el.querySelector('nldd-token')!
			.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));

		expect(hideSpy).not.toHaveBeenCalled();
	});

	it('a nested sheet title-bar dismiss closes only the inner sheet, not the outer', async () => {
		// Both overlays listen for a bubbling `dismiss`; without stopPropagation the
		// inner title-bar's dismiss would match the outer sheet too and close both.
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<nldd-sheet class="inner">
					<nldd-top-title-bar dismiss-text="Sluit"></nldd-top-title-bar>
				</nldd-sheet>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		const inner = el.querySelector('.inner') as NLDDSheet;
		el.show();
		inner.show();
		await waitForUpdate(el);

		const outerHide = vi.spyOn(el, 'hide');
		const innerHide = vi.spyOn(inner, 'hide');
		inner.querySelector('nldd-top-title-bar')!
			.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));

		expect(innerHide).toHaveBeenCalledOnce();
		expect(outerHide).not.toHaveBeenCalled();
	});
});


/* ============================================================
   Placement
   ============================================================ */

describe('nldd-sheet – placement', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('reflects placement="left"', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="left"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.getAttribute('placement')).toBe('left');
	});

	it('reflects placement="bottom"', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.getAttribute('placement')).toBe('bottom');
	});
});


/* ============================================================
   Full-height
   ============================================================ */

describe('nldd-sheet – height', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('defaults height to empty string and sets no --_height var (CSS default = full)', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.height).toBe('');
		expect(el.style.getPropertyValue('--_height')).toBe('');
	});

	it('reflects height attribute when set in markup', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="fit-content"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.height).toBe('fit-content');
		expect(el.getAttribute('height')).toBe('fit-content');
	});

	it('sets --_height for fit-content', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="fit-content"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height').trim()).toBe('fit-content');
	});

	it('sets --_height for a CSS length', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="50dvh"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height').trim()).toBe('50dvh');
	});

	it('does not set --_height for the "full" alias (uses CSS default)', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="full"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height')).toBe('');
	});

	it('ignores invalid CSS values (falls back, no --_height)', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="not-a-length"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height')).toBe('');
	});

	// The warning is gated on import.meta.env.DEV; skip when the suite runs
	// in production mode so a missing warn isn't a false failure.
	it.skipIf(!import.meta.env.DEV)('warns exactly once on an invalid height value', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="not-a-length"></nldd-sheet>');
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toContain('Invalid height value "not-a-length"');

		el.height = 'also-bogus';
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledTimes(1);
		warnSpy.mockRestore();
	});

	it('clears --_height when property is reset to empty', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet placement="bottom" height="50%"></nldd-sheet>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height').trim()).toBe('50%');

		el.height = '';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_height')).toBe('');
	});
});


/* ============================================================
   Slot
   ============================================================ */

describe('nldd-sheet – slot', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders slotted content', async () => {
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<div id="content">Inhoud</div>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot')!;
		expect(slot.assignedElements().length).toBe(1);
	});
});


/* ============================================================
   Focus management
   ============================================================ */

describe('nldd-sheet – focus management', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) {
			const dialog = el.shadowRoot?.querySelector('dialog');
			if (dialog?.open) dialog.close();
			cleanup(el);
		}
	});

	it('focuses the dialog when show() is called', async () => {
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<h2>Sheet titel</h2>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		el.show();
		const dialog = el.shadowRoot!.querySelector('dialog')!;
		expect(document.activeElement === dialog || el.shadowRoot!.activeElement === dialog).toBe(true);
	});

	it('respects autofocus attribute on slotted content', async () => {
		el = await fixture<NLDDSheet>(`
			<nldd-sheet>
				<button autofocus>Focus me</button>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		el.show();
		const button = el.querySelector<HTMLElement>('button')!;
		expect(document.activeElement === button).toBe(true);
	});
});

describe('nldd-sheet neemt geen ruimte in de flow', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The sheet itself is a position:fixed <dialog>, so the host should not be a
	// box. As a block it is an ordinary flex item, and inside an
	// nldd-split-view-pane it picks up flex-grow through ::slotted and eats the
	// height its siblings needed.
	it('zet de host op display: contents', async () => {
		el = await fixture('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		expect(sheetStyles.cssText).toMatch(/:host\s*\{[^}]*display:\s*contents/);
	});
});

describe('nldd-sheet meldt sluiten via elke route', () => {
	let el: HTMLElement & { show(): void; hide(): void };

	afterEach(() => {
		if (el) cleanup(el);
	});

	function dialogVan(host: HTMLElement): HTMLDialogElement {
		return host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
	}

	// hide() cannot be the only source of `close`: anything that closes the
	// dialog directly skips it, and the sheet would go quiet.
	it('stuurt close wanneer de dialog buiten hide() om sluit', async () => {
		el = await fixture<HTMLElement & { show(): void; hide(): void }>(
			'<nldd-sheet accessible-label="Test"></nldd-sheet>',
		);
		await waitForUpdate(el);
		let aantal = 0;
		el.addEventListener('close', () => { aantal += 1; });
		el.show();
		await waitForUpdate(el);
		const dialog = dialogVan(el);
		dialog.close();
		dialog.dispatchEvent(new Event('close'));
		await waitForUpdate(el);
		expect(aantal).toBe(1);
	});

	// A nested overlay (say the nldd-popover datepicker inside an nldd-date-field)
	// fires its own `close` with composed + bubbles. That reaches the dialog and
	// hits the same @close listener. Without a target check the sheet emitted its
	// own close, tearing the sheet down for consumers while it stayed open.
	it('emit geen close voor een gebubbelde close uit geneste inhoud', async () => {
		el = await fixture<HTMLElement & { show(): void; hide(): void }>(
			'<nldd-sheet accessible-label="Test"><div class="inner"></div></nldd-sheet>',
		);
		await waitForUpdate(el);
		// Only count the close the sheet emits itself (target = the host), not the
		// nested event that bubbles past this same listener (target = .inner).
		let aantal = 0;
		el.addEventListener('close', (e) => { if (e.target === el) aantal += 1; });
		el.show();
		await waitForUpdate(el);
		el.querySelector('.inner')!.dispatchEvent(
			new CustomEvent('close', { bubbles: true, composed: true }),
		);
		await waitForUpdate(el);
		expect(aantal).toBe(0);
	});

	// And the same the other way round: a sheet inside a sheet is an ordinary
	// thing to build (a floor plan with a form for one room over it), and closing
	// the inner one must not reach a listener on the outer. Without this the
	// consumer has to check the target of every close it receives, which is a
	// trap nobody meets until they nest two overlays.
	it('laat de close van een geneste sheet niet bij de buitenste aankomen', async () => {
		el = await fixture<HTMLElement & { show(): void; hide(): void }>(
			`<nldd-sheet accessible-label="Buiten">
				<nldd-sheet accessible-label="Binnen"></nldd-sheet>
			</nldd-sheet>`,
		);
		await waitForUpdate(el);
		const binnen = el.querySelector('nldd-sheet') as HTMLElement & {
			show(): void;
			hide(): void;
		};
		let buiten = 0;
		let binnenAantal = 0;
		el.addEventListener('close', () => { buiten += 1; });
		binnen.addEventListener('close', () => { binnenAantal += 1; });
		el.show();
		binnen.show();
		await waitForUpdate(el);
		binnen.hide();
		await new Promise((r) => setTimeout(r, 60));
		await waitForUpdate(el);
		expect(binnenAantal).toBe(1);
		expect(buiten).toBe(0);
	});

	it('stuurt close niet twee keer als beide routes samenvallen', async () => {
		el = await fixture<HTMLElement & { show(): void; hide(): void }>(
			'<nldd-sheet accessible-label="Test"></nldd-sheet>',
		);
		await waitForUpdate(el);
		let aantal = 0;
		el.addEventListener('close', () => { aantal += 1; });
		el.show();
		await waitForUpdate(el);
		el.hide();
		await new Promise((r) => setTimeout(r, 60));
		dialogVan(el).dispatchEvent(new Event('close'));
		await waitForUpdate(el);
		expect(aantal).toBe(1);
	});
});

describe('nldd-sheet – close fallback', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('closes even when animationend never arrives', async () => {
		// The animation tokens are not loaded in the test environment, which would
		// make the `animation` shorthand invalid and animationName 'none' — and
		// then the reduced-motion fallback closes the sheet and this test proves
		// nothing. Supply them so a real animation runs.
		el = await fixture<HTMLElement>('<nldd-sheet accessible-label="Test" style="--semantics-sheets-side-animation-duration: 200ms; --semantics-sheets-bottom-animation-duration: 200ms; --primitives-transition-easing-default: linear"><div>inhoud</div></nldd-sheet>');
		await waitForUpdate(el);
		const sheet = el as HTMLElement & { show: () => void; hide: () => void };
		sheet.show();
		await waitForUpdate(el);
		const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.open).toBe(true);

		// Swallow the animationend registration, so the close can only come from
		// the fallback. That is the situation a background tab creates: the
		// animation is paused, the event never arrives, and without the timer the
		// sheet stays open AND stays `_closing` — wedged against every later
		// hide().
		const realAdd = dialog.addEventListener.bind(dialog);
		dialog.addEventListener = ((type: string, ...rest: unknown[]) => {
			if (type === 'animationend') return;
			return (realAdd as (...a: unknown[]) => void)(type, ...rest);
		}) as typeof dialog.addEventListener;

		sheet.hide();
		expect(dialog.open).toBe(true);
		await new Promise(r => setTimeout(r, 1200));
		expect(dialog.open).toBe(false);
	}, 5000);
});

describe('nldd-sheet – autofocus', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('focuses a design-system field marked autofocus', async () => {
		el = await fixture(`
			<nldd-sheet accessible-label="Test">
				<nldd-text-field autofocus accessible-label="Naam"></nldd-text-field>
			</nldd-sheet>
		`);
		await waitForUpdate(el);
		const field = el.querySelector('nldd-text-field')!;
		await waitForUpdate(field as HTMLElement);
		(el as unknown as { show(): void }).show();
		await waitForUpdate(el);
		// The input lives in the field's shadow root, so the browser's own
		// autofocus never reaches it — the sheet has to focus the host.
		expect(document.activeElement).toBe(field);
		expect(field.shadowRoot!.activeElement?.tagName.toLowerCase()).toBe('input');
	});
});

describe('nldd-sheet inside a pane that hides back buttons', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('keeps the back button of a bar inside it', async () => {
		el = await fixture(`
			<nldd-split-view-pane hide-back>
				<nldd-sheet accessible-label="X">
					<nldd-top-title-bar back-text="Back" text="X"></nldd-top-title-bar>
				</nldd-sheet>
			</nldd-split-view-pane>`);
		await waitForUpdate(el);
		const bar = el.querySelector('nldd-top-title-bar') as HTMLElement;
		expect(getComputedStyle(bar).getPropertyValue('--context-back-button-display').trim()).toBe('flex');
	});

	it('leaves a bar in the pane itself alone', async () => {
		el = await fixture(`
			<nldd-split-view-pane hide-back>
				<nldd-top-title-bar back-text="Back" text="X"></nldd-top-title-bar>
			</nldd-split-view-pane>`);
		await waitForUpdate(el);
		const bar = el.querySelector('nldd-top-title-bar') as HTMLElement;
		expect(getComputedStyle(bar).getPropertyValue('--context-back-button-display').trim()).toBe('none');
	});
});

describe('nldd-sheet – accessible name', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	const label = (host: NLDDSheet) => host.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label');
	const withBar = (attrs: string, text: string) =>
		`<nldd-sheet ${attrs}><nldd-page><nldd-top-title-bar slot="header" text="${text}"></nldd-top-title-bar></nldd-page></nldd-sheet>`;

	it('takes the text of its title bar', async () => {
		el = await fixture<NLDDSheet>(withBar('', 'Filters'));
		await waitForUpdate(el);
		expect(label(el)).toBe('Filters');
	});

	it('an accessible-label wins over the title bar', async () => {
		el = await fixture<NLDDSheet>(withBar('accessible-label="Zoekfilters"', 'Filters'));
		await waitForUpdate(el);
		expect(label(el)).toBe('Zoekfilters');
	});

	it('follows a title that changes', async () => {
		el = await fixture<NLDDSheet>(withBar('', 'Filters'));
		const bar = el.querySelector('nldd-top-title-bar') as HTMLElement & { text: string };
		bar.text = 'Sortering';
		await waitForUpdate(bar);
		await waitForUpdate(el);
		expect(label(el)).toBe('Sortering');
	});

	it('picks up a title bar that arrives later', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		el.insertAdjacentHTML('beforeend', '<nldd-top-title-bar text="Later"></nldd-top-title-bar>');
		await waitForUpdate(el);
		expect(label(el)).toBe('Later');
	});

	it('is not named by the title bar of an overlay nested inside it', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet><nldd-sheet><nldd-top-title-bar text="Binnen"></nldd-top-title-bar></nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		expect(label(el)).toBe('Venster');
	});

	it('is called Venster without either, and warns when it opens', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDSheet>('<nldd-sheet></nldd-sheet>');
		await waitForUpdate(el);
		el.show();
		expect(label(el)).toBe('Venster');
		expect(warn.mock.calls.some(([message]) => String(message).includes('No accessible-label'))).toBe(true);
	});

	it('does not warn when its title bar names it', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDSheet>(withBar('', 'Filters'));
		await waitForUpdate(el);
		el.show();
		expect(warn.mock.calls.some(([message]) => String(message).includes('No accessible-label'))).toBe(false);
	});
});

describe('nldd-sheet – open attribute', () => {
	let el: NLDDSheet;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const dialog = () => el.shadowRoot!.querySelector('dialog')!;

	it('opens from the first render when open is set', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet accessible-label="Test" open></nldd-sheet>');
		await waitForUpdate(el);
		expect(dialog().open).toBe(true);
	});

	it('opens and closes when open is set and cleared', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet accessible-label="Test"></nldd-sheet>');
		el.open = true;
		await waitForUpdate(el);
		expect(dialog().open).toBe(true);

		const closed = new Promise((resolve) => el.addEventListener('close', resolve, { once: true }));
		el.open = false;
		await closed;
		expect(dialog().open).toBe(false);
	});

	it('reflects show() and hide() in the attribute', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet accessible-label="Test"></nldd-sheet>');
		el.show();
		await waitForUpdate(el);
		expect(el.hasAttribute('open')).toBe(true);
		el.hide();
		await waitForUpdate(el);
		expect(el.hasAttribute('open')).toBe(false);
	});

	it('clears open when it closes another way', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet accessible-label="Test" open></nldd-sheet>');
		await waitForUpdate(el);
		dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
		await waitForUpdate(el);
		expect(el.open).toBe(false);
		expect(el.hasAttribute('open')).toBe(false);
	});

	it('stays open when open is set again during the close animation', async () => {
		el = await fixture<NLDDSheet>('<nldd-sheet accessible-label="Test" open></nldd-sheet>');
		await waitForUpdate(el);
		el.open = false;
		await el.updateComplete;
		expect(dialog().classList.contains('is-closing')).toBe(true);
		el.open = true;
		await el.updateComplete;
		dialog().dispatchEvent(new Event('animationend'));
		await waitForUpdate(el);
		expect(dialog().open).toBe(true);
		expect(dialog().classList.contains('is-closing')).toBe(false);
	});
});
