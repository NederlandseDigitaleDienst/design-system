import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate, until } from '../../../test-utils.js';
import './notification.js';
import '../../actions/button/button.js';
import '../../layout/sheet/sheet.js';
import '../modal-dialog/modal-dialog.js';
import { _resetOverlayWatchForTesting } from './notifications-area.js';
import type { NLDDNotification } from './notification.js';

/** The component moves itself out of the fixture and into the shared region, so
 *  the usual cleanup cannot reach it. */
function clearRegion(): void {
	document.getElementById('nldd-notifications-area')?.remove();
}

/** Real timers with a short duration rather than fake ones: the notification
 *  starts its clock from a microtask after it has joined the region, and how a
 *  fake clock interleaves with that differs per platform. */
function wacht(ms: number): Promise<void> {
	return new Promise((resolve) => { setTimeout(resolve, ms); });
}

async function maak(html: string): Promise<NLDDNotification> {
	const el = await fixture<NLDDNotification>(html);
	await waitForUpdate(el);
	// joinArea runs in a microtask, so wait one turn for the move.
	await Promise.resolve();
	await waitForUpdate(el);
	return el;
}

describe('nldd-notification', () => {
	let el: NLDDNotification;

	afterEach(() => {
		if (el) cleanup(el);
		clearRegion();
		vi.useRealTimers();
	});

	it('rendert zonder fouten', async () => {
		el = await maak('<nldd-notification text="Opgeslagen"></nldd-notification>');
		expect(el.shadowRoot).not.toBeNull();
	});

	it('verhuist zichzelf naar de gedeelde regio', async () => {
		el = await maak('<nldd-notification text="Opgeslagen"></nldd-notification>');
		const region = document.getElementById('nldd-notifications-area');
		expect(region).not.toBeNull();
		expect(el.parentElement).toBe(region);
	});

	it('kondigt een fout aan met role alert en de rest met role status', async () => {
		el = await maak('<nldd-notification text="Mislukt" variant="critical"></nldd-notification>');
		expect(el.getAttribute('role')).toBe('alert');
		cleanup(el);
		clearRegion();

		el = await maak('<nldd-notification text="Opgeslagen" variant="success"></nldd-notification>');
		expect(el.getAttribute('role')).toBe('status');
	});

	it('kiest een gevuld icoon per variant', async () => {
		el = await maak('<nldd-notification text="Opgeslagen" variant="success"></nldd-notification>');
		expect(el._resolvedIcon).toBe('check-circle-filled');
	});

	it('verdwijnt vanzelf als hij bovenaan staat', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = '<nldd-notification text="Opgeslagen" duration="60"></nldd-notification>';
		const item = host.querySelector('nldd-notification')!;
		const gezien = vi.fn();
		item.addEventListener('dismiss', gezien);

		await wacht(400);
		expect(gezien).toHaveBeenCalled();

		host.remove();
	});

	it('telt gewoon af als de aanwijzer er stil boven blijkt te liggen', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = '<nldd-notification text="Opgeslagen" duration="60"></nldd-notification>';
		const item = host.querySelector('nldd-notification')!;
		const gezien = vi.fn();
		item.addEventListener('dismiss', gezien);

		// Wat de browser doet zodra de melding op zijn vaste plek verschijnt en daar
		// toevallig een stilstaande aanwijzer ligt: een echte pointerenter zonder
		// dat er iets bewogen heeft. Dat is geen hover.
		item.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
		await wacht(400);
		expect(gezien).toHaveBeenCalled();

		host.remove();
	});

	it('pauzeert wel zodra de aanwijzer er echt overheen beweegt', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = '<nldd-notification text="Opgeslagen" duration="60"></nldd-notification>';
		const item = host.querySelector('nldd-notification')!;
		const gezien = vi.fn();
		item.addEventListener('dismiss', gezien);

		await Promise.resolve();
		await Promise.resolve();
		item.dispatchEvent(new PointerEvent('pointermove', { bubbles: false }));
		await wacht(400);
		expect(gezien).not.toHaveBeenCalled();

		host.remove();
	});

	it('laat een fout staan, hoe lang je ook wacht', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = '<nldd-notification text="Mislukt" variant="critical" duration="60"></nldd-notification>';
		const item = host.querySelector('nldd-notification')!;
		const gezien = vi.fn();
		item.addEventListener('dismiss', gezien);

		await wacht(400);
		expect(gezien).not.toHaveBeenCalled();

		host.remove();
	});

	it('telt alleen af voor de voorste van de stapel, de nieuwste', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = `
			<nldd-notification text="Eerste" duration="60"></nldd-notification>
			<nldd-notification text="Tweede" duration="60"></nldd-notification>
		`;
		const [eerste, tweede] = Array.from(host.querySelectorAll('nldd-notification'));
		const eersteWeg = vi.fn();
		const tweedeWeg = vi.fn();
		eerste.addEventListener('dismiss', eersteWeg);
		tweede.addEventListener('dismiss', tweedeWeg);

		await wacht(400);
		expect(tweedeWeg).toHaveBeenCalled();
		expect(eersteWeg).not.toHaveBeenCalled();

		host.remove();
	});

	it('zet de nieuwste vooraan en schuift de oudere naar achteren', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = `
			<nldd-notification text="Eerste" duration="0"></nldd-notification>
			<nldd-notification text="Tweede" duration="0"></nldd-notification>
		`;
		await Promise.resolve();
		await Promise.resolve();

		const region = document.getElementById('nldd-notifications-area')!;
		const stapel = Array.from(region.querySelectorAll('nldd-notification'));
		expect(stapel.map((item) => item.getAttribute('text'))).toEqual(['Tweede', 'Eerste']);
		expect((stapel[0] as HTMLElement).style.getPropertyValue('--_stack-depth')).toBe('0');
		expect((stapel[1] as HTMLElement).style.getPropertyValue('--_stack-depth')).toBe('1');

		host.remove();
	});

	it('klapt de stapel open bij een klik op de strook en weer dicht daarbuiten', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		host.innerHTML = `
			<nldd-notification text="Eerste" duration="0"></nldd-notification>
			<nldd-notification text="Tweede" duration="0"></nldd-notification>
		`;
		await Promise.resolve();
		await Promise.resolve();

		const region = document.getElementById('nldd-notifications-area')!;
		const strook = region.querySelector<HTMLElement>('[data-expander]')!;
		expect(strook.style.display).toBe('block');

		strook.click();
		expect(region.style.display).toBe('flex');
		expect(strook.style.display).toBe('none');
		Array.from(region.querySelectorAll('nldd-notification')).forEach((item) => {
			expect((item as HTMLElement).style.getPropertyValue('--_stack-depth')).toBe('0');
		});

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		expect(region.style.display).toBe('grid');

		host.remove();
	});

	it('stuurt dismiss bij een klik op de sluitknop', async () => {
		el = await maak('<nldd-notification text="Opgeslagen"></nldd-notification>');
		const gezien = vi.fn();
		el.addEventListener('dismiss', gezien);
		const knop = el.shadowRoot!.querySelector('nldd-icon-button') as HTMLElement;
		knop.click();
		expect(gezien).toHaveBeenCalled();
	});

	it('waarschuwt in DEV bij meer dan twee acties', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await maak(`
			<nldd-notification text="Opgeslagen">
				<button slot="actions">1</button>
				<button slot="actions">2</button>
				<button slot="actions">3</button>
			</nldd-notification>
		`);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe('nldd-notification in a modal overlay', () => {
	const REGION = 'nldd-notifications-area';
	let sheet: HTMLElement;
	// Overlays a test opens besides the sheet. Cleaned up here rather than at the
	// end of the test, because one left open would draw the region of the next.
	let others: HTMLElement[] = [];

	// The token stylesheet is not loaded in tests, and without this value the
	// region's top/right are invalid and it falls back to its static position,
	// which would make a hit test say nothing about the real layout.
	beforeEach(() => {
		document.documentElement.style.setProperty('--semantics-overlays-inset', '16px');
		// A freshly loaded page each time, so no test passes because an earlier one
		// already had the region watching.
		_resetOverlayWatchForTesting();
	});

	afterEach(() => {
		document.documentElement.style.removeProperty('--semantics-overlays-inset');
		if (sheet) cleanup(sheet);
		others.forEach((el) => cleanup(el));
		others = [];
		document.getElementById(REGION)?.remove();
		document.querySelectorAll('nldd-notification').forEach((n) => n.remove());
	});

	const region = () => document.getElementById(REGION);
	const settle = () => new Promise((r) => setTimeout(r, 150));

	async function openSheet(): Promise<HTMLElement> {
		const el = await fixture('<nldd-sheet accessible-label="Sheet"><div style="height:120px">x</div></nldd-sheet>');
		await waitForUpdate(el);
		(el as unknown as { show(): void }).show();
		await settle();
		return el;
	}

	async function raise(): Promise<HTMLElement> {
		const note = document.createElement('nldd-notification');
		note.setAttribute('text', 'Bericht');
		note.setAttribute('duration', '0');
		document.body.appendChild(note);
		await settle();
		return note;
	}

	/** What the consumer actually cares about: can the message be clicked. */
	function hitTagAt(el: HTMLElement): string {
		const r = el.getBoundingClientRect();
		const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
		return hit ? hit.tagName : 'NULL';
	}

	/** Placed against the screen, where the inset puts it, and not against the
	 *  box of the overlay that holds it. */
	function inCorner(): boolean {
		const r = region()!.getBoundingClientRect();
		return Math.round(r.top) === 16 && Math.round(document.documentElement.clientWidth - r.right) === 16;
	}

	it('reaches the first notification raised while a sheet is open, instead of leaving it behind the sheet', async () => {
		sheet = await openSheet();
		const note = await raise();

		expect(region()!.parentElement).toBe(sheet);
		expect(region()!.matches(':popover-open')).toBe(true);
		expect(inCorner()).toBe(true);
		expect(note.isConnected).toBe(true);
		expect(hitTagAt(note)).toBe('NLDD-NOTIFICATION');
	});

	it('keeps a notification in a modal dialog in the corner of the screen, above the dialog', async () => {
		// The dialog keeps a transform after it opens, which would make its own
		// box the one the region is placed in, and cut the notification off.
		const dialog = await fixture('<nldd-modal-dialog accessible-label="Dialog" text="Zeker weten?"></nldd-modal-dialog>');
		others.push(dialog);
		await waitForUpdate(dialog);
		(dialog as unknown as { show(): void }).show();
		await settle();
		const note = await raise();

		expect(region()!.parentElement).toBe(dialog);
		expect(inCorner()).toBe(true);
		expect(hitTagAt(note)).toBe('NLDD-NOTIFICATION');
	});

	it('lets Tab reach a notification in a modal dialog', async () => {
		const dialog = await fixture('<nldd-modal-dialog accessible-label="Dialog" text="Zeker weten?"><nldd-button slot="actions" text="Sluit"></nldd-button></nldd-modal-dialog>');
		others.push(dialog);
		await waitForUpdate(dialog);
		(dialog as unknown as { show(): void }).show();
		await settle();
		const note = await raise();

		// On from the dialog, however many stops it has of its own.
		let reached = false;
		for (let i = 0; i < 6 && !reached; i++) {
			await userEvent.keyboard('{Tab}');
			reached = note.contains(document.activeElement);
		}
		expect(reached).toBe(true);
	});

	it('finds a sheet that was already open when the notification code loaded', async () => {
		sheet = await openSheet();
		// What a page that imports the notification code later sees.
		_resetOverlayWatchForTesting();
		const note = await raise();

		expect(region()!.parentElement).toBe(sheet);
		expect(hitTagAt(note)).toBe('NLDD-NOTIFICATION');
	});

	it('stacks overlays in the order they opened, not the order they sit in the page', async () => {
		// First in the document, last to open, so it is the one on top.
		const dialog = await fixture('<nldd-modal-dialog accessible-label="Dialog" text="Zeker weten?"></nldd-modal-dialog>');
		others.push(dialog);
		await waitForUpdate(dialog);
		sheet = await openSheet();
		(dialog as unknown as { show(): void }).show();
		await settle();
		const note = await raise();

		expect(region()!.parentElement).toBe(dialog);
		expect(hitTagAt(note)).toBe('NLDD-NOTIFICATION');
	});

	it('leaves the region on the body for a modal that has no place for it', async () => {
		// Modal, but without a notifications slot, like the sheets of
		// nldd-navigation-split-view. Slotted into it, the region would not render.
		if (!customElements.get('test-bare-modal')) {
			customElements.define('test-bare-modal', class extends HTMLElement {
				constructor() {
					super();
					this.attachShadow({ mode: 'open' }).innerHTML = '<dialog>x</dialog>';
				}
			});
		}
		const bare = await fixture('<test-bare-modal></test-bare-modal>');
		others.push(bare);
		bare.shadowRoot!.querySelector('dialog')!.showModal();
		bare.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
		// And the same for one found by looking rather than by its event.
		_resetOverlayWatchForTesting();
		await raise();

		expect(region()!.parentElement).toBe(document.body);
	});

	it('carries a notification that was already on screen into a sheet that opens over it', async () => {
		const note = await raise();
		expect(region()!.parentElement).toBe(document.body);

		sheet = await openSheet();

		expect(region()!.parentElement).toBe(sheet);
		// The move disconnects the region; a notification must not read that as
		// having been dismissed.
		expect(note.isConnected).toBe(true);
		expect(region()!.contains(note)).toBe(true);
	});

	/** With an action, and removed by its consumer once dismissed. */
	async function raiseWithAction(text: string): Promise<HTMLElement> {
		const note = document.createElement('nldd-notification');
		note.setAttribute('variant', 'critical');
		note.setAttribute('text', text);
		note.addEventListener('dismiss', () => note.remove());
		note.innerHTML = '<nldd-button slot="actions" size="sm" text="Actie"></nldd-button>';
		document.body.appendChild(note);
		await settle();
		return note;
	}

	const buttonIn = (host: Element) => host.shadowRoot!.querySelector('button')!;
	const dismissButton = (note: HTMLElement) => buttonIn(note.shadowRoot!.querySelector('nldd-icon-button')!);
	const actionButton = (note: HTMLElement) => buttonIn(note.querySelector('nldd-button')!);
	const openList = () => region()!.querySelector<HTMLElement>('[data-expander]')!.click();

	it('keeps the open list open when one of its notifications is dismissed', async () => {
		sheet = await openSheet();
		await raiseWithAction('Een');
		const middle = await raiseWithAction('Twee');
		await raiseWithAction('Drie');
		openList();
		expect(region()!.style.display).toBe('flex');

		await userEvent.click(dismissButton(middle));

		expect(middle.isConnected).toBe(false);
		expect(region()!.style.display).toBe('flex');
	});

	it('keeps the open list open when a click inside it moves focus', async () => {
		sheet = await openSheet();
		const first = await raiseWithAction('Een');
		const second = await raiseWithAction('Twee');
		openList();

		await userEvent.click(actionButton(first));
		await userEvent.click(second.shadowRoot!.querySelector('.notification__text')!);

		expect(region()!.style.display).toBe('flex');
	});

	it('does not open the deck for a click on a button of the front notification', async () => {
		sheet = await openSheet();
		await raiseWithAction('Een');
		const front = await raiseWithAction('Twee');

		await userEvent.click(actionButton(front));

		expect(region()!.style.display).toBe('grid');
	});

	it('opens the deck when Tab reaches it and closes it when Shift+Tab leaves it', async () => {
		sheet = await fixture('<nldd-sheet accessible-label="Sheet"><button>Voor</button></nldd-sheet>');
		await waitForUpdate(sheet);
		(sheet as unknown as { show(): void }).show();
		await settle();
		await raiseWithAction('Een');
		await raiseWithAction('Twee');
		sheet.querySelector('button')!.focus();

		await userEvent.keyboard('{Tab}');
		expect(region()!.style.display).toBe('flex');

		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(region()!.style.display).toBe('grid');
	});

	it('dismisses only the notification when Escape is pressed on its action', async () => {
		sheet = await openSheet();
		const note = await raiseWithAction('Een');
		const dismissed = vi.fn();
		note.addEventListener('dismiss', dismissed);
		actionButton(note).focus();

		await userEvent.keyboard('{Escape}');
		await settle();

		expect(dismissed).toHaveBeenCalledTimes(1);
		expect(sheet.shadowRoot!.querySelector('dialog')!.open).toBe(true);
	});

	it('keeps the strip that opens the deck inside the box of the region', async () => {
		// Part of the region's own layout, so it follows the deck rather than the
		// region's edge.
		const root = document.documentElement.style;
		root.setProperty('--primitives-space-24', '24px');
		try {
			sheet = await openSheet();
			await raise();
			await raise();
			const strip = region()!.querySelector<HTMLElement>('[data-expander]')!;
			const s = strip.getBoundingClientRect();
			const r = region()!.getBoundingClientRect();

			expect(Math.round(s.height)).toBe(24);
			expect(s.top).toBeGreaterThanOrEqual(r.top);
			expect(s.bottom).toBeLessThanOrEqual(r.bottom);
			expect(document.elementFromPoint(Math.round(s.left + s.width / 2), Math.round(s.top + s.height / 2))).toBe(strip);
		} finally {
			root.removeProperty('--primitives-space-24');
		}
	});

	it('keeps the strip right under the front notification when the region is taller than the deck', async () => {
		// A region taller than its deck, as Safari made it in an overlay while the
		// rows still stretched.
		const root = document.documentElement.style;
		root.setProperty('--primitives-space-24', '24px');
		try {
			sheet = await openSheet();
			await raise();
			const front = await raise();
			region()!.style.height = '600px';
			const strip = region()!.querySelector<HTMLElement>('[data-expander]')!;

			expect(Math.round(strip.getBoundingClientRect().top)).toBe(Math.round(front.getBoundingClientRect().bottom));
		} finally {
			root.removeProperty('--primitives-space-24');
		}
	});

	it('does not play its arrival again when it moves into a sheet', async () => {
		// Without the tokens the arrival has no duration, and so no animation at all.
		const root = document.documentElement.style;
		root.setProperty('--primitives-transition-duration-medium', '300ms');
		root.setProperty('--primitives-transition-easing-default', 'linear');
		try {
			const note = await raise();
			await until(() => note.hasAttribute('data-arrived'));

			// Looked at right after the move, while a replay would still be running.
			sheet = await fixture('<nldd-sheet accessible-label="Sheet"><div style="height:120px">x</div></nldd-sheet>');
			await waitForUpdate(sheet);
			(sheet as unknown as { show(): void }).show();
			await until(() => region()?.parentElement === sheet);

			const arriving = note.getAnimations().filter((a) => (a as CSSAnimation).animationName === 'notification-arrive' && a.playState === 'running');
			expect(arriving).toHaveLength(0);
		} finally {
			root.removeProperty('--primitives-transition-duration-medium');
			root.removeProperty('--primitives-transition-easing-default');
		}
	});

	it('sinks back to the body when the sheet closes', async () => {
		sheet = await openSheet();
		const note = await raise();
		expect(region()!.parentElement).toBe(sheet);

		(sheet as unknown as { hide(): void }).hide();
		await until(() => region()?.parentElement === document.body);

		expect(region()!.parentElement).toBe(document.body);
		expect(region()!.hasAttribute('popover')).toBe(false);
		expect(note.isConnected).toBe(true);
	});

	it('follows the topmost overlay when one opens over another, and one level back when it closes', async () => {
		sheet = await openSheet();
		await raise();
		expect(region()!.parentElement).toBe(sheet);

		const dialog = await fixture('<nldd-modal-dialog accessible-label="Dialog" text="Zeker weten?"></nldd-modal-dialog>');
		await waitForUpdate(dialog);
		(dialog as unknown as { show(): void }).show();
		await settle();
		expect(region()!.parentElement).toBe(dialog);

		(dialog as unknown as { hide(): void }).hide();
		await until(() => region()?.parentElement === sheet);
		expect(region()!.parentElement).toBe(sheet);

		cleanup(dialog);
	});
});
