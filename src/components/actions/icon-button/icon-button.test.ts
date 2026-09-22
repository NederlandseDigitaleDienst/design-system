import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDIconButton } from './icon-button.js';
import './icon-button.js';
import '../menu/menu.js';
import '../../layout/popover/popover.js';

describe('nldd-icon-button', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-icon-button></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});
});


/* ============================================================
   Icon & text attributes
   ============================================================ */

describe('nldd-icon-button – icon & text attributes', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders nldd-icon from icon attribute', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download" text="Download"></nldd-icon-button>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('nldd-icon.icon-button__icon nldd-icon, .icon-button__icon nldd-icon');
		expect(icon).not.toBeNull();
	});

	it('renders text from text attribute', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download" text="Download"></nldd-icon-button>');
		await waitForUpdate(el);
		const textEl = el.shadowRoot!.querySelector('.icon-button__text');
		expect(textEl).not.toBeNull();
		expect(textEl!.textContent).toBe('Download');
	});

	it('renders icon slot when icon attribute is not set', async () => {
		el = await fixture<NLDDIconButton>(`
			<nldd-icon-button text="Custom">
				<svg slot="icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-icon-button>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		expect(slot!.assignedElements().length).toBe(1);
	});

	it('does not render text span when text is empty', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download"></nldd-icon-button>');
		await waitForUpdate(el);
		const textEl = el.shadowRoot!.querySelector('.icon-button__text');
		expect(textEl).toBeNull();
	});

	it('warns when slot-based icon-only has no accessible name', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDIconButton>(`
			<nldd-icon-button>
				<svg slot="icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-icon-button>
		`);
		await waitForUpdate(el);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accessible-label'));
		warnSpy.mockRestore();
	});

	it('does not warn when slot-based icon has text', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDIconButton>(`
			<nldd-icon-button text="Custom">
				<svg slot="icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-icon-button>
		`);
		await waitForUpdate(el);
		expect(warnSpy).not.toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});


/* ============================================================
   Accessible label & aria-label
   ============================================================ */

describe('nldd-icon-button – accessible label & aria-label', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('uses text as aria-label when no accessible-label is set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download" text="Download"></nldd-icon-button>');
		await waitForUpdate(el);
		const btn = el.shadowRoot!.querySelector('button')!;
		expect(btn.getAttribute('aria-label')).toBe('Download');
	});

	it('uses accessible-label as aria-label when set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="eye" text="Toon" accessible-label="Toon wachtwoord"></nldd-icon-button>');
		await waitForUpdate(el);
		const btn = el.shadowRoot!.querySelector('button')!;
		expect(btn.getAttribute('aria-label')).toBe('Toon wachtwoord');
	});

	it('has no aria-label when neither text nor accessible-label is set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download"></nldd-icon-button>');
		await waitForUpdate(el);
		const btn = el.shadowRoot!.querySelector('button')!;
		const ariaLabel = btn.getAttribute('aria-label');
		expect(ariaLabel === null || ariaLabel === '').toBe(true);
	});
});


/* ============================================================
   Title tooltip
   ============================================================ */

// Note: aria-describedby from nldd-tooltip does not reach the inner <button>
// in nldd-icon-button's shadow DOM. This is a known shadow DOM + ARIA limitation.
// The tooltip is visual-only for custom element triggers; aria-label on the
// inner button provides the accessible name.
describe('nldd-icon-button – tooltip', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders nldd-tooltip with text for non-lg sizes', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button size="md" icon="download" text="Download"></nldd-icon-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Download');
	});

	it('renders nldd-tooltip with accessible-label when set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button size="md" icon="eye" text="Toon" accessible-label="Toon wachtwoord"></nldd-icon-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Toon wachtwoord');
	});

	it('omits nldd-tooltip for lg size without accessible-label', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button size="lg" icon="download" text="Download"></nldd-icon-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).toBeNull();
	});

	it('renders nldd-tooltip for lg size when accessible-label is set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button size="lg" icon="eye" text="Toon" accessible-label="Toon wachtwoord"></nldd-icon-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('text')).toBe('Toon wachtwoord');
	});

	it('forwards tooltip-timing="instant" to the inner nldd-tooltip', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button size="md" icon="download" text="Download" tooltip-timing="instant"></nldd-icon-button>');
		await waitForUpdate(el);
		const tooltip = el.shadowRoot!.querySelector('nldd-tooltip');
		expect(tooltip).not.toBeNull();
		expect(tooltip!.getAttribute('timing')).toBe('instant');
	});
});


/* ============================================================
   Disabled & aria-disabled
   ============================================================ */

describe('nldd-icon-button – disabled & aria-disabled', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('does not set aria-disabled when not disabled', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="Close"></nldd-icon-button>');
		await waitForUpdate(el);
		const btn = el.shadowRoot!.querySelector('button')!;
		expect(btn.hasAttribute('aria-disabled')).toBe(false);
	});

	it('sets aria-disabled="true" when disabled', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="Close" disabled></nldd-icon-button>');
		await waitForUpdate(el);
		const btn = el.shadowRoot!.querySelector('button')!;
		expect(btn.getAttribute('aria-disabled')).toBe('true');
	});
});


/* ============================================================
   href / link rendering
   ============================================================ */

describe('nldd-icon-button – href / link rendering', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a <button> by default', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="Sluiten"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
	});

	it('renders an <a> when href is set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('sets href on the anchor element', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('href')).toBe('/overzicht');
	});

	it('forwards target, and adds noopener noreferrer to a rel of your own', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" target="_blank" rel="external" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.getAttribute('target')).toBe('_blank');
		expect(a.getAttribute('rel')).toBe('external noopener noreferrer');
	});

	it('defaults rel to noopener noreferrer when target is _blank and rel is not set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" target="_blank" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('folds the "opens in new tab" announcement into aria-label when target=_blank', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" target="_blank" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		// The control always carries an aria-label, so the hint joins it (a hidden
		// span would be overridden by aria-label in the accessible-name cascade).
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe('Terug, Opent in nieuw tabblad');
	});

	it('omits the new-tab announcement when target is not _blank', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe('Terug');
	});

	it('overrides the new-tab wording via the translations property', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" target="_blank" icon="arrow-left" text="Terug"></nldd-icon-button>');
		el.translations = { 'components.icon-button.opens-in-new-tab-label': 'Opens in a new tab' };
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe('Terug, Opens in a new tab');
	});

	it('sets aria-disabled on the anchor when disabled', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" disabled icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-disabled')).toBe('true');
	});

	it('forwards accessible-label to the anchor as aria-label', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" accessible-label="Ga terug naar overzicht" icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe('Ga terug naar overzicht');
	});

	it('prevents default click on disabled anchor to block navigation', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button href="/overzicht" disabled icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');
		anchor.dispatchEvent(event);
		expect(preventSpy).toHaveBeenCalled();
	});

	it('switches from <button> to <a> when href is set dynamically', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="arrow-left" text="Terug"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')).not.toBeNull();

		el.href = '/overzicht';
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('a')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('focus() delegates to the inner button', async () => {
		const el = await fixture<NLDDIconButton>('<nldd-icon-button text="Sluit" icon="dismiss" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.icon-button'));
		cleanup(el);
	});
});

describe('nldd-icon-button – aria-expanded / aria-haspopup', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('omits aria-expanded on a plain icon-button (no expandable, no popup-type, not open)', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="Sluit" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.hasAttribute('aria-expanded')).toBe(false);
		expect(inner.hasAttribute('aria-haspopup')).toBe(false);
	});

	it('sets aria-expanded="false" when expandable and not open', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="more" text="Menu" expandable tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('false');
	});

	it('sets aria-expanded="true" when expandable and open', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="more" text="Menu" expandable expanded tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
	});

	it('sets aria-expanded="false" + aria-haspopup when popup-type set and not open', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="more" text="Acties" popup-type="menu" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('false');
		expect(inner.getAttribute('aria-haspopup')).toBe('menu');
	});

	it('sets aria-expanded="true" + aria-haspopup when popup-type set and open', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="more" text="Acties" popup-type="dialog" expanded tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
		expect(inner.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('forwards aria-expanded + aria-haspopup to the anchor when href is set', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="more" text="Menu" href="/m" popup-type="menu" expanded tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('a')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
		expect(inner.getAttribute('aria-haspopup')).toBe('menu');
	});
});

describe('nldd-icon-button – width', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('applies inline host width and --_width=100% when width is a CSS length', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" width="240px" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('100%');
	});

	it('sets --_width=100% but leaves inline width empty for width="full"', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" width="full" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('');
		expect(el.style.getPropertyValue('--_width')).toBe('100%');
	});

	it('ignores invalid width values', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" width="not-a-length" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('');
		expect(el.style.getPropertyValue('--_width')).toBe('');
	});
});

describe('nldd-icon-button – popoverTargetElement / popoverTargetAction IDL forwarding', () => {
	let el: NLDDIconButton;
	let popover: HTMLDivElement;

	afterEach(() => {
		if (el) cleanup(el);
		if (popover) popover.remove();
	});

	it('forwards popoverTargetElement (Element ref) to the inner button across shadow boundaries', async () => {
		popover = document.createElement('div');
		popover.setAttribute('popover', '');
		document.body.appendChild(popover);

		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);

		el.popoverTargetElement = popover;
		await waitForUpdate(el);

		const inner = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
		expect(inner.popoverTargetElement).toBe(popover);
	});

	it('clears the inner button popoverTargetElement when host property is set back to null', async () => {
		popover = document.createElement('div');
		popover.setAttribute('popover', '');
		document.body.appendChild(popover);

		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		el.popoverTargetElement = popover;
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
		expect(inner.popoverTargetElement).toBe(popover);

		el.popoverTargetElement = null;
		await waitForUpdate(el);
		expect(inner.popoverTargetElement).toBe(null);
	});

	it('forwards popoverTargetAction to the inner button', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss" text="X" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);

		const inner = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
		expect(inner.popoverTargetAction).toBe('toggle');

		el.popoverTargetAction = 'show';
		await waitForUpdate(el);
		expect(inner.popoverTargetAction).toBe('show');

		el.popoverTargetAction = 'hide';
		await waitForUpdate(el);
		expect(inner.popoverTargetAction).toBe('hide');
	});
});

describe('nldd-icon-button – form association', () => {
	let host: HTMLElement;

	afterEach(() => {
		if (host) cleanup(host);
	});

	function clickInner(root: ParentNode) {
		const btn = root.querySelector('nldd-icon-button')!;
		(btn.shadowRoot!.querySelector('button') as HTMLElement).click();
	}

	it('submits the closest form on click when type=submit', async () => {
		host = await fixture('<form><input name="x" /><nldd-icon-button type="submit" icon="check-mark" accessible-label="Verstuur"></nldd-icon-button></form>');
		await waitForUpdate(host.querySelector('nldd-icon-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(true);
	});

	it('does not submit when type is the default (button)', async () => {
		host = await fixture('<form><input name="x" /><nldd-icon-button icon="check-mark" accessible-label="Actie"></nldd-icon-button></form>');
		await waitForUpdate(host.querySelector('nldd-icon-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(false);
	});

	it('resets the form on click when type=reset', async () => {
		host = await fixture('<form><input name="x" /><nldd-icon-button type="reset" icon="arrow-2-counter-clockwise" accessible-label="Reset"></nldd-icon-button></form>');
		await waitForUpdate(host.querySelector('nldd-icon-button')!);
		const input = host.querySelector('input') as HTMLInputElement;
		input.value = 'changed';
		clickInner(host);
		expect(input.value).toBe('');
	});

	it('does not submit when disabled', async () => {
		host = await fixture('<form><input name="x" /><nldd-icon-button type="submit" disabled icon="check-mark" accessible-label="Verstuur"></nldd-icon-button></form>');
		await waitForUpdate(host.querySelector('nldd-icon-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(false);
	});

	it('a link icon-button (href) never triggers form submission', async () => {
		host = await fixture('<form><input name="x" /><nldd-icon-button type="submit" href="/x" icon="arrow-right" accessible-label="Link"></nldd-icon-button></form>');
		await waitForUpdate(host.querySelector('nldd-icon-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		const a = host.querySelector('nldd-icon-button')!.shadowRoot!.querySelector('a') as HTMLElement;
		a.addEventListener('click', (e) => e.preventDefault());
		a.click();
		expect(submitted).toBe(false);
	});
});

describe('nldd-icon-button – loading', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('overlays an activity indicator when loading', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button loading icon="download" text="Opslaan"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.icon-button__activity-indicator')).not.toBeNull();
	});

	it('renders the activity indicator + aria-busy on the <a> when loading with href', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button loading href="/opslaan" icon="download" accessible-label="Opslaan" tooltip-timing="never"></nldd-icon-button>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a');
		expect(anchor).not.toBeNull();
		expect(anchor!.getAttribute('aria-busy')).toBe('true');
		const indicator = el.shadowRoot!.querySelector('nldd-activity-indicator');
		expect(indicator).not.toBeNull();
		// Sibling of the <a> (not inside it) and not aria-hidden, so its
		// role="status" live region works without nesting in an interactive el.
		expect(anchor!.contains(indicator)).toBe(false);
		expect(indicator!.hasAttribute('aria-hidden')).toBe(false);
	});

	it('renders no activity indicator when not loading', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="download" text="Opslaan"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.icon-button__activity-indicator')).toBeNull();
	});

	it('marks the inner button aria-busy when loading', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button loading icon="download" text="Opslaan"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
	});

	it('prevents the default click action while loading', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button loading icon="download" text="Opslaan"></nldd-icon-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');
		inner.dispatchEvent(event);
		expect(preventSpy).toHaveBeenCalled();
	});

	it('does not hard-disable the inner button (stays focusable) while loading', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button loading icon="download" text="Opslaan"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(false);
	});

	it('renders the icon-placeholder fallback and keeps _hasIcon false when no icon is provided', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button accessible-label="X"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon[name="icon-placeholder"]')).not.toBeNull();
		expect((el as unknown as { _hasIcon: boolean })._hasIcon).toBe(false);
	});

	it('sets _hasIcon true once an icon is slotted (via _onIconSlotChange)', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button accessible-label="X"><svg slot="icon"></svg></nldd-icon-button>');
		await waitForUpdate(el);
		expect((el as unknown as { _hasIcon: boolean })._hasIcon).toBe(true);
	});

	// — no-tab (control owned by a roving container) ————————————————————————————

	it('no-tab takes the button out of the tab order', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss-small" accessible-label="Verwijder" no-tab></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.icon-button')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss-small" accessible-label="Verwijder"></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.icon-button')!.hasAttribute('tabindex')).toBe(false);
	});

	it('no-tab takes the link variant out of the tab order', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="dismiss-small" accessible-label="Ga" href="#x" no-tab></nldd-icon-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a.icon-button')!.getAttribute('tabindex')).toBe('-1');
	});
});

describe('nldd-icon-button slotted menu', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = '<nldd-icon-button icon="ellipsis" text="Meer">'
		+ '<nldd-menu slot="popup"><nldd-menu-item text="Bewerken"></nldd-menu-item></nldd-menu>'
		+ '</nldd-icon-button>';

	it('anchors a slotted nldd-menu to the host button', async () => {
		el = await fixture<NLDDIconButton>(MARKUP);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement & { anchorElement: Element | null };
		expect(menu.anchorElement).toBe(el);
	});

	it('opens the slotted menu on click', async () => {
		el = await fixture<NLDDIconButton>(MARKUP);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement;
		expect(menu.matches(':popover-open')).toBe(false);
		el.shadowRoot!.querySelector<HTMLElement>('.icon-button')!.click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-icon-button slotted popover', () => {
	let el: NLDDIconButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = '<nldd-icon-button icon="ellipsis" text="Info">'
		+ '<nldd-popover slot="popup" accessible-label="Info">'
		+ '<button class="pop-btn">inside</button>'
		+ '</nldd-popover>'
		+ '</nldd-icon-button>';

	it('anchors a slotted nldd-popover to the host button', async () => {
		el = await fixture<NLDDIconButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement & { anchorElement: Element | null };
		expect(pop.anchorElement).toBe(el);
	});

	it('opens the slotted popover on click and syncs expanded', async () => {
		el = await fixture<NLDDIconButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement;
		expect(pop.matches(':popover-open')).toBe(false);
		el.shadowRoot!.querySelector<HTMLElement>('.icon-button')!.click();
		await waitForUpdate(el);
		expect(pop.matches(':popover-open')).toBe(true);
		expect(el.expanded).toBe(true);
	});

	it('keeps the nested popover open when its own content is clicked', async () => {
		el = await fixture<NLDDIconButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement;
		el.shadowRoot!.querySelector<HTMLElement>('.icon-button')!.click();
		await waitForUpdate(el);
		pop.querySelector<HTMLElement>('.pop-btn')!.click();
		await waitForUpdate(el);
		expect(pop.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-icon-button – slotted popup overlay', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('releases the previous overlay when the popup slot empties', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="ellipsis" accessible-label="Acties"><nldd-menu slot="popup"></nldd-menu></nldd-icon-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBe(el);
		menu.remove();
		await waitForUpdate(el);
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBeNull();
	});

	it('opens the overlay on a keyboard click after a pointer gesture that never became a click', async () => {
		el = await fixture<NLDDIconButton>('<nldd-icon-button icon="ellipsis" accessible-label="Acties"><nldd-menu slot="popup"></nldd-menu></nldd-icon-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		menu.showPopover();
		await waitForUpdate(el);
		// Pointer goes down, the browser light-dismisses, the gesture ends elsewhere: no click.
		el.shadowRoot!.querySelector('button')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		menu.hidePopover();
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('button')!.dispatchEvent(
			new MouseEvent('click', { bubbles: true, composed: true, detail: 0 })
		);
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});
});


/* ============================================================
   Host box
   ============================================================ */

describe('nldd-icon-button – host box', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The host used to be an inline-block, so the control sat on a line and the
	// strut's descender grew the host with whatever line-height it inherited: the
	// same button came out taller in body text than in a form.
	it('is as tall as its button, whatever line-height it inherits', async () => {
		el = await fixture('<div style="font-size: 18px; line-height: 27px;"><nldd-icon-button icon="ellipsis" text="More"></nldd-icon-button></div>');
		await waitForUpdate(el);

		const host = el.querySelector('nldd-icon-button') as NLDDIconButton;
		const button = host.shadowRoot!.querySelector('button')!;

		expect(host.getBoundingClientRect().height).toBe(button.getBoundingClientRect().height);
	});
});
