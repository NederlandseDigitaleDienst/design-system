import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDToken } from './token.js';
import './token.js';
import '../../actions/menu/menu.js';


/* ============================================================
   Rendering
   ============================================================ */

describe('nldd-token', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-token></nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a div for control=none', async () => {
		el = await fixture('<nldd-token>Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('div.token')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button.token')).toBeNull();
	});

	it('renders the text property in the token text', async () => {
		el = await fixture('<nldd-token text="Status: Actief"></nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token__text')!.textContent).toContain('Status: Actief');
	});

	it('renders a div for control=dismiss', async () => {
		el = await fixture('<nldd-token control="dismiss">Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('div.token')).not.toBeNull();
	});

	it('renders a div with a menu icon-button for control=menu', async () => {
		el = await fixture('<nldd-token control="menu">Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('div.token')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button.token')).toBeNull();
		expect(el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')).not.toBeNull();
	});

	it('renders a dismiss action for control=dismiss', async () => {
		el = await fixture('<nldd-token control="dismiss">Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token__dismiss-action')).not.toBeNull();
	});

	it('does not render a dismiss action for control=none', async () => {
		el = await fixture('<nldd-token>Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token__dismiss-action')).toBeNull();
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-token – state', () => {
	let el: NLDDToken;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('open is false by default', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu">Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.expanded).toBe(false);
	});

	it('open reflects as attribute', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu" expanded>Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.hasAttribute('expanded')).toBe(true);
	});

	it('menu icon-button is not expanded and has popup-type=menu when closed', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu">Label</nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.hasAttribute('expanded')).toBe(false);
		expect(button.getAttribute('popup-type')).toBe('menu');
	});

	it('menu icon-button is expanded when the menu is open', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu" expanded>Label</nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.hasAttribute('expanded')).toBe(true);
	});

	it('disabled reflects as attribute', async () => {
		el = await fixture<NLDDToken>('<nldd-token disabled>Label</nldd-token>');
		await waitForUpdate(el);
		expect(el.hasAttribute('disabled')).toBe(true);
	});

	it('menu icon-button uses the chevron icon', async () => {
		el = await fixture('<nldd-token control="menu">Label</nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.getAttribute('icon')).toBe('chevron-down-small');
	});

	it('dismiss nldd-icon-button is disabled when token is disabled', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss" disabled>Label</nldd-token>');
		await waitForUpdate(el);
		const dismiss = el.shadowRoot!.querySelector<HTMLElement>('.token__dismiss-action nldd-icon-button')!;
		expect(dismiss.hasAttribute('disabled')).toBe(true);
	});

	it('menu icon-button is disabled when token is disabled', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu" disabled>Label</nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.hasAttribute('disabled')).toBe(true);
	});
});


/* ============================================================
   Dismiss
   ============================================================ */

describe('nldd-token – dismiss', () => {
	let el: NLDDToken;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('clicking dismiss dispatches dismiss event', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss">Label</nldd-token>');
		await waitForUpdate(el);

		let fired = false;
		el.addEventListener('dismiss', () => { fired = true; });

		el.shadowRoot!.querySelector<HTMLElement>('.token__dismiss-action nldd-icon-button')!.click();
		expect(fired).toBe(true);
	});

	it('dismiss does not fire when disabled', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss" disabled>Label</nldd-token>');
		await waitForUpdate(el);

		let fired = false;
		el.addEventListener('dismiss', () => { fired = true; });

		el.shadowRoot!.querySelector<HTMLElement>('.token__dismiss-action nldd-icon-button')!.click();
		expect(fired).toBe(false);
	});

	it('names the dismiss button after the token text', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss" text="Spoed"></nldd-token>');
		await waitForUpdate(el);
		const dismiss = el.shadowRoot!.querySelector('.token__dismiss-action nldd-icon-button')!;
		expect(dismiss.getAttribute('accessible-label')).toBe('Verwijder "Spoed"');
	});

	it('names the dismiss button after slotted text and follows it', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss">Spoed</nldd-token>');
		await waitForUpdate(el);
		const dismiss = el.shadowRoot!.querySelector('.token__dismiss-action nldd-icon-button')!;
		expect(dismiss.getAttribute('accessible-label')).toBe('Verwijder "Spoed"');
		el.firstChild!.textContent = 'Normaal';
		await waitForUpdate(el);
		expect(dismiss.getAttribute('accessible-label')).toBe('Verwijder "Normaal"');
	});

	it('falls back to a bare label on a token without text', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss"></nldd-token>');
		await waitForUpdate(el);
		const dismiss = el.shadowRoot!.querySelector('.token__dismiss-action nldd-icon-button')!;
		expect(dismiss.getAttribute('accessible-label')).toBe('Verwijder');
	});

	it('dismiss button uses custom dismiss-text', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="dismiss" dismiss-text="Remove filter">Label</nldd-token>');
		await waitForUpdate(el);
		const dismiss = el.shadowRoot!.querySelector('.token__dismiss-action nldd-icon-button')!;
		expect(dismiss.getAttribute('accessible-label')).toBe('Remove filter');
	});
});


/* ============================================================
   Menu
   ============================================================ */

describe('nldd-token – menu', () => {
	let el: NLDDToken;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('names the menu button after the token text, not after the menu', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu">Spoed<nldd-menu slot="menu"><nldd-menu-item text="Bewerk"></nldd-menu-item></nldd-menu></nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.getAttribute('accessible-label')).toBe('Toon opties voor "Spoed"');
	});

	it('lets menu-text replace the whole label', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu" text="Spoed" menu-text="Acties"></nldd-token>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button')!;
		expect(button.getAttribute('accessible-label')).toBe('Acties');
	});

	it('wires a slotted menu, anchored to the chevron button (menu variant)', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu"><nldd-menu slot="menu"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-token>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as unknown as { anchorElement: Element | null; variant: string };
		expect(menu.anchorElement).toBe(el.shadowRoot!.querySelector('.token__menu-action nldd-icon-button'));
		expect(menu.variant).toBe('menu');
	});

	it('clicking the chevron opens the slotted menu as a popover', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu"><nldd-menu slot="menu"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-token>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement;
		el.shadowRoot!.querySelector<HTMLElement>('.token__menu-action nldd-icon-button')!.click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('opens the menu on Enter when the host is focused (roving)', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu"><nldd-menu slot="menu"><nldd-menu-item text="A"></nldd-menu-item></nldd-menu></nldd-token>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement;
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});

	it('menu does not toggle when disabled', async () => {
		el = await fixture<NLDDToken>('<nldd-token control="menu" disabled>Label</nldd-token>');
		await waitForUpdate(el);

		el._handleMenuClick();
		await waitForUpdate(el);
		expect(el.expanded).toBe(false);
	});

	/* ============================================================
	   Roving container (no-tab control)
	   ============================================================ */

	it('roving forwards no-tab to the dismiss control', async () => {
		el = await fixture<NLDDToken>('<nldd-token text="x" control="dismiss" roving></nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')!.hasAttribute('no-tab')).toBe(true);
	});

	it('roving forwards no-tab to the menu control', async () => {
		el = await fixture<NLDDToken>('<nldd-token text="x" control="menu" roving></nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')!.hasAttribute('no-tab')).toBe(true);
	});

	it('leaves the control tabbable when not roving', async () => {
		el = await fixture<NLDDToken>('<nldd-token text="x" control="dismiss"></nldd-token>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')!.hasAttribute('no-tab')).toBe(false);
	});
});
