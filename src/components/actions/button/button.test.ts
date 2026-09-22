import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDButton } from './button.js';
import './button.js';
import '../../../assets/styles/variables.css';
import '../menu/menu.js';
import '../../layout/popover/popover.js';

describe('nldd-button', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-button></nldd-button>');
		await waitForUpdate(el);

		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders text from text attribute', async () => {
		el = await fixture('<nldd-button text="Click me"></nldd-button>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.button__content')!;
		expect(content.textContent).toContain('Click me');
	});

	it('renders a text slot when the text attribute is not set', async () => {
		el = await fixture('<nldd-button><strong slot="text">Bold label</strong></nldd-button>');
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('.button__text slot[name="text"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		const assigned = slot.assignedElements();
		expect(assigned.length).toBe(1);
		expect(assigned[0].textContent).toBe('Bold label');
	});

	it('text attribute takes precedence over the text slot (no slot rendered)', async () => {
		el = await fixture('<nldd-button text="Attr wins"><span slot="text">Slotted</span></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__text slot[name="text"]')).toBeNull();
		expect(el.shadowRoot!.querySelector('.button__text')!.textContent).toContain('Attr wins');
	});

	it('forwards aria-label to the inner button element', async () => {
		el = await fixture('<nldd-button accessible-label="Close dialog" text="X"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button');
		expect(inner!.getAttribute('aria-label')).toBe('Close dialog');
	});

	it('does not set aria-label on inner button when property is empty', async () => {
		el = await fixture('<nldd-button text="Click me"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button');
		expect(inner!.hasAttribute('aria-label')).toBe(false);
	});

	it('reflects the size attribute (lg)', async () => {
		el = await fixture<NLDDButton>('<nldd-button size="lg" text="Groot"></nldd-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('size')).toBe('lg');
	});

	it('does not reflect horizontal-alignment="center" by default', async () => {
		el = await fixture('<nldd-button text="X"></nldd-button>');
		await waitForUpdate(el);
		// Default is '' (centered via CSS); the old default reflected
		// horizontal-alignment="center" onto every button, which was noise.
		expect(el.getAttribute('horizontal-alignment')).not.toBe('center');
	});

	it('reflects the horizontal-alignment attribute', async () => {
		el = await fixture('<nldd-button horizontal-alignment="left" text="X"></nldd-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('horizontal-alignment')).toBe('left');
	});

	it('renders supporting text when set', async () => {
		el = await fixture('<nldd-button text="Opslaan" supporting-text="Alle wijzigingen"></nldd-button>');
		await waitForUpdate(el);
		const supporting = el.shadowRoot!.querySelector('.button__supporting-text');
		expect(supporting).not.toBeNull();
		expect(supporting!.textContent).toContain('Alle wijzigingen');
	});

	it('does not render a supporting-text element when not set', async () => {
		el = await fixture('<nldd-button text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__supporting-text')).toBeNull();
	});

	it('includes supporting text in the button content (part of the accessible name)', async () => {
		el = await fixture('<nldd-button text="Opslaan" supporting-text="Alle wijzigingen"></nldd-button>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.button__content')!;
		expect(content.textContent).toContain('Opslaan');
		expect(content.textContent).toContain('Alle wijzigingen');
	});

	it('adds the has-supporting-text class to the inner control when supporting text is set', async () => {
		el = await fixture('<nldd-button text="Opslaan" supporting-text="Alle wijzigingen"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('.button')!;
		expect(inner.classList.contains('has-supporting-text')).toBe(true);
	});

	it('pins the expandable disclosure chevron to the right (absolute, outside content)', async () => {
		el = await fixture('<nldd-button text="Kies" expandable></nldd-button>');
		await waitForUpdate(el);
		const disclosure = el.shadowRoot!.querySelector('.button__disclosure-icon')!;
		expect(disclosure).not.toBeNull();
		expect(disclosure.parentElement!.classList.contains('button')).toBe(true);
		expect(el.shadowRoot!.querySelector('.button__content .button__disclosure-icon')).toBeNull();
		expect(getComputedStyle(disclosure).position).toBe('absolute');
	});
});

describe('nldd-button – icon attributes', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders no icons when no icon attributes are set', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Click me"></nldd-button>');
		await waitForUpdate(el);

		const shadowIcons = el.shadowRoot!.querySelectorAll('.button__start-icon, .button__end-icon');
		expect(shadowIcons.length).toBe(0);
	});

	it('renders start icon from start-icon attribute', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Like" start-icon="heart"></nldd-button>');
		await waitForUpdate(el);

		const startIcon = el.shadowRoot!.querySelector('.button__start-icon');
		const endIcon = el.shadowRoot!.querySelector('.button__end-icon');

		expect(startIcon).not.toBeNull();
		expect(startIcon!.querySelector('nldd-icon')!.getAttribute('name')).toBe('heart');
		expect(endIcon).toBeNull();
	});

	it('renders end icon from end-icon attribute', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Next" end-icon="arrow-right"></nldd-button>');
		await waitForUpdate(el);

		const startIcon = el.shadowRoot!.querySelector('.button__start-icon');
		const endIcon = el.shadowRoot!.querySelector('.button__end-icon');

		expect(startIcon).toBeNull();
		expect(endIcon).not.toBeNull();
		expect(endIcon!.querySelector('nldd-icon')!.getAttribute('name')).toBe('arrow-right');
	});

	it('renders both start and end icons', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Favorite" start-icon="heart" end-icon="chevron-down-small"></nldd-button>');
		await waitForUpdate(el);

		const startIcon = el.shadowRoot!.querySelector('.button__start-icon');
		const endIcon = el.shadowRoot!.querySelector('.button__end-icon');

		expect(startIcon).not.toBeNull();
		expect(startIcon!.querySelector('nldd-icon')!.getAttribute('name')).toBe('heart');
		expect(endIcon).not.toBeNull();
		expect(endIcon!.querySelector('nldd-icon')!.getAttribute('name')).toBe('chevron-down-small');
	});

	it('wraps the start/end icon in a container span (class on the container, not on nldd-icon)', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" start-icon="heart" end-icon="arrow-right"></nldd-button>');
		await waitForUpdate(el);
		const start = el.shadowRoot!.querySelector('.button__start-icon')!;
		const end = el.shadowRoot!.querySelector('.button__end-icon')!;
		expect(start.tagName.toLowerCase()).toBe('span');
		expect(start.querySelector('nldd-icon')).not.toBeNull();
		expect(end.tagName.toLowerCase()).toBe('span');
		expect(end.querySelector('nldd-icon')).not.toBeNull();
	});

	it('reflects the no-highlight-border attribute', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" no-highlight-border></nldd-button>');
		await waitForUpdate(el);
		expect(el.hasAttribute('no-highlight-border')).toBe(true);
	});

	it('makes the highlight border transparent when no-highlight-border is set', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" no-highlight-border></nldd-button>');
		await waitForUpdate(el);
		expect(getComputedStyle(el).getPropertyValue('--_highlight-border-color').trim()).toBe('transparent');
	});

	it('hides the expandable chevron while loading but keeps it laid out', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Kies" expandable loading></nldd-button>');
		await waitForUpdate(el);
		const disclosure = el.shadowRoot!.querySelector('.button__disclosure-icon')!;
		expect(disclosure).not.toBeNull();
		expect(getComputedStyle(disclosure).opacity).toBe('0');
		expect(getComputedStyle(disclosure).display).not.toBe('none');
	});

	it('accepts the neutral-base variant', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" variant="neutral-base"></nldd-button>');
		await waitForUpdate(el);
		expect(el.getAttribute('variant')).toBe('neutral-base');
	});

	it('renders start-icon slot when start-icon attribute is not set', async () => {
		el = await fixture<NLDDButton>(`
			<nldd-button text="Custom">
				<svg slot="start-icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-button>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="start-icon"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		expect(slot!.assignedElements().length).toBe(1);
	});

	it('renders end-icon slot when end-icon attribute is not set', async () => {
		el = await fixture<NLDDButton>(`
			<nldd-button text="Custom">
				<svg slot="end-icon" width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
			</nldd-button>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot[name="end-icon"]') as HTMLSlotElement;
		expect(slot).not.toBeNull();
		expect(slot!.assignedElements().length).toBe(1);
	});
});

describe('nldd-button – href / link rendering', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders a <button> by default', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Click"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
	});

	it('does not reflect href attribute when not set', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Click"></nldd-button>');
		await waitForUpdate(el);
		expect(el.hasAttribute('href')).toBe(false);
	});

	it('renders an <a> when href is set', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('sets href on the anchor element', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('href')).toBe('/overzicht');
	});

	it('forwards target, and adds noopener noreferrer to a rel of your own', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" target="_blank" rel="external" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.getAttribute('target')).toBe('_blank');
		expect(a.getAttribute('rel')).toBe('external noopener noreferrer');
	});

	it('defaults rel to noopener noreferrer when target is _blank and rel is not set', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" target="_blank" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('announces "opens in new tab" via a visually-hidden hint when target=_blank (content-derived name)', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" target="_blank" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.querySelector('.button__opens-in-new-tab-hint')?.textContent).toBe('Opent in nieuw tabblad');
		// The name stays content-derived (visible text + hint), so no aria-label override.
		expect(a.hasAttribute('aria-label')).toBe(false);
	});

	it('folds the new-tab hint into aria-label when an accessible-label is set', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" target="_blank" accessible-label="Ga terug" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.getAttribute('aria-label')).toBe('Ga terug, Opent in nieuw tabblad');
		// A hidden span would lose to aria-label, so it isn't rendered.
		expect(a.querySelector('.button__opens-in-new-tab-hint')).toBeNull();
	});

	it('omits the new-tab hint when target is not _blank', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.querySelector('.button__opens-in-new-tab-hint')).toBeNull();
		expect(a.hasAttribute('aria-label')).toBe(false);
	});

	it('overrides the new-tab wording via the translations property', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" target="_blank" text="Terug"></nldd-button>');
		el.translations = { 'components.button.opens-in-new-tab-label': 'Opens in a new tab' };
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__opens-in-new-tab-hint')?.textContent).toBe('Opens in a new tab');
	});

	it('sets aria-disabled on the anchor when disabled', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" disabled text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-disabled')).toBe('true');
	});

	it('forwards accessible-label to the anchor element', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" accessible-label="Ga terug naar overzicht" text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('aria-label')).toBe('Ga terug naar overzicht');
	});

	it('prevents default click on disabled anchor to block navigation', async () => {
		el = await fixture<NLDDButton>('<nldd-button href="/overzicht" disabled text="Terug"></nldd-button>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');
		anchor.dispatchEvent(event);
		expect(preventSpy).toHaveBeenCalled();
	});

	it('switches from <button> to <a> when href is set dynamically', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Terug"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')).not.toBeNull();

		el.href = '/overzicht';
		await waitForUpdate(el);

		expect(el.shadowRoot!.querySelector('a')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('button')).toBeNull();
	});

	it('focus() delegates to the inner button', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Klik"></nldd-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.button'));
	});

	it('focus() delegates to the inner anchor when href is set', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Klik" href="/x"></nldd-button>');
		await waitForUpdate(el);
		el.focus();
		expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.button'));
	});
});

describe('nldd-button – aria-expanded / aria-haspopup', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('omits aria-expanded on a plain button (no expandable, no popup-type, not open)', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Sla op"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.hasAttribute('aria-expanded')).toBe(false);
		expect(inner.hasAttribute('aria-haspopup')).toBe(false);
	});

	it('sets aria-expanded="false" when expandable and not open', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Menu" expandable></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('false');
	});

	it('sets aria-expanded="true" when expandable and open', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Menu" expandable expanded></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
	});

	it('sets aria-expanded="false" when popup-type set and not open', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Acties" popup-type="menu"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('false');
		expect(inner.getAttribute('aria-haspopup')).toBe('menu');
	});

	it('sets aria-expanded="true" + aria-haspopup when popup-type set and open', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Acties" popup-type="dialog" expanded></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
		expect(inner.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('forwards aria-expanded + aria-haspopup to the anchor when href is set', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Menu" href="/m" popup-type="menu" expanded></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('a')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
		expect(inner.getAttribute('aria-haspopup')).toBe('menu');
	});

	it('sets aria-expanded="true" when only open is set (edge case, no expandable/popup-type)', async () => {
		// Keeps backwards compatibility for consumers that manage aria-expanded
		// manually on the host. Plain buttons without expandable/popup-type
		// still forward open as aria-expanded="true".
		el = await fixture<NLDDButton>('<nldd-button text="X" expanded></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-expanded')).toBe('true');
		expect(inner.hasAttribute('aria-haspopup')).toBe(false);
	});
});

describe('nldd-button – single-line / width', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('wraps text in a .button__text span', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Lange knop tekst"></nldd-button>');
		await waitForUpdate(el);
		const textSpan = el.shadowRoot!.querySelector('.button__text');
		expect(textSpan).not.toBeNull();
		expect(textSpan!.textContent).toBe('Lange knop tekst');
	});

	it('reflects single-line attribute to the host', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" single-line></nldd-button>');
		await waitForUpdate(el);
		expect(el.hasAttribute('single-line')).toBe(true);
		expect(el.singleLine).toBe(true);
	});

	it('applies inline host width and --_width=100% when width is a CSS length', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" width="240px"></nldd-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('240px');
		expect(el.style.getPropertyValue('--_width')).toBe('100%');
	});

	it('sets --_width=100% but leaves inline width empty for width="full"', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" width="full"></nldd-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('');
		expect(el.style.getPropertyValue('--_width')).toBe('100%');
	});

	it('stretches in a flex column only with width="full"', async () => {
		el = await fixture<NLDDButton>(`
			<div style="display: flex; flex-direction: column; width: 600px;">
				<nldd-button text="Kort"></nldd-button>
				<nldd-button text="Kort" width="full"></nldd-button>
			</div>
		`);
		await waitForUpdate(el);
		const [gewoon, vol] = [...el.querySelectorAll('nldd-button')];
		expect(gewoon.getBoundingClientRect().width).toBeLessThan(300);
		expect(Math.round(vol.getBoundingClientRect().width)).toBe(600);
	});

	it('caps the button with max-width, also alongside width="full"', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" width="full" max-width="320px"></nldd-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.maxWidth).toBe('320px');
		// The inner control follows the host's cap, so the button really is capped
		// and not just its (invisible) host box.
		const control = el.shadowRoot!.querySelector('.button')!;
		expect(control.getBoundingClientRect().width).toBeLessThanOrEqual(320);
	});

	// Without reflectNonDefault, Lit reflects the empty default as max-width="",
	// and [max-width] matches on presence — which would truncate every label in
	// the system.
	it('zet geen max-width-attribuut zonder waarde', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" max-width="320px"></nldd-button>');
		await waitForUpdate(el);
		// Clearing it has to REMOVE the attribute. Lit's default converter would
		// write max-width="" instead, and [max-width] matches on presence — so
		// every button would keep truncating after one framework re-render.
		el.maxWidth = '';
		await waitForUpdate(el);
		expect(el.hasAttribute('max-width')).toBe(false);
		const label = el.shadowRoot!.querySelector('.button__text')!;
		expect(getComputedStyle(label).whiteSpace).not.toBe('nowrap');
	});

	it('ignores an invalid max-width', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" max-width="not-a-length"></nldd-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.maxWidth).toBe('');
	});

	it('clears inline width and --_width when width is cleared', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" width="240px"></nldd-button>');
		await waitForUpdate(el);
		el.width = '';
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('');
		expect(el.style.getPropertyValue('--_width')).toBe('');
	});

	it('ignores invalid width values (drops both inline width and --_width)', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="X" width="not-a-length"></nldd-button>');
		await waitForUpdate(el);
		expect((el as HTMLElement).style.width).toBe('');
		expect(el.style.getPropertyValue('--_width')).toBe('');
	});
});

describe('nldd-button – popoverTargetElement / popoverTargetAction IDL forwarding', () => {
	let el: NLDDButton;
	let popover: HTMLDivElement;

	afterEach(() => {
		if (el) cleanup(el);
		if (popover) popover.remove();
	});

	it('forwards popoverTargetElement (Element ref) to the inner button across shadow boundaries', async () => {
		popover = document.createElement('div');
		popover.setAttribute('popover', '');
		document.body.appendChild(popover);

		el = await fixture<NLDDButton>('<nldd-button text="X"></nldd-button>');
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

		el = await fixture<NLDDButton>('<nldd-button text="X"></nldd-button>');
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
		el = await fixture<NLDDButton>('<nldd-button text="X"></nldd-button>');
		await waitForUpdate(el);

		const inner = el.shadowRoot!.querySelector('button') as HTMLButtonElement;
		// Default for HTMLButtonElement is 'toggle' — our property defaults match.
		expect(inner.popoverTargetAction).toBe('toggle');

		el.popoverTargetAction = 'show';
		await waitForUpdate(el);
		expect(inner.popoverTargetAction).toBe('show');

		el.popoverTargetAction = 'hide';
		await waitForUpdate(el);
		expect(inner.popoverTargetAction).toBe('hide');
	});
});

describe('nldd-button – form association', () => {
	let host: HTMLElement;

	afterEach(() => {
		if (host) cleanup(host);
	});

	function clickInner(root: ParentNode) {
		const btn = root.querySelector('nldd-button')!;
		(btn.shadowRoot!.querySelector('button') as HTMLElement).click();
	}

	it('submits the closest form on click when type=submit', async () => {
		host = await fixture('<form><input name="x" /><nldd-button type="submit" text="Go"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(true);
	});

	it('does not submit when type is the default (button)', async () => {
		host = await fixture('<form><input name="x" /><nldd-button text="Go"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(false);
	});

	it('does not submit when disabled', async () => {
		host = await fixture('<form><input name="x" /><nldd-button type="submit" disabled text="Go"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		clickInner(host);
		expect(submitted).toBe(false);
	});

	it('resets the form on click when type=reset', async () => {
		host = await fixture('<form><input name="x" /><nldd-button type="reset" text="Reset"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		const input = host.querySelector('input') as HTMLInputElement;
		input.value = 'changed';
		clickInner(host);
		expect(input.value).toBe('');
	});

	it('a link button (href) never triggers form submission', async () => {
		host = await fixture('<form><input name="x" /><nldd-button type="submit" href="/x" text="Link"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		const a = host.querySelector('nldd-button')!.shadowRoot!.querySelector('a') as HTMLElement;
		a.addEventListener('click', (e) => e.preventDefault());
		a.click();
		expect(submitted).toBe(false);
	});
});

describe('nldd-button – loading', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('overlays an activity indicator when loading', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__activity-indicator')).not.toBeNull();
	});

	it('renders the activity indicator + aria-busy on the <a> when loading with href', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading href="/opslaan" text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a');
		expect(anchor).not.toBeNull();
		expect(anchor!.getAttribute('aria-busy')).toBe('true');
		const indicator = el.shadowRoot!.querySelector('nldd-activity-indicator');
		expect(indicator).not.toBeNull();
		// Sibling of the <a> (not inside it) and not aria-hidden, so its
		// role="status" live region announces loading without joining the
		// link's content-derived accessible name.
		expect(anchor!.contains(indicator)).toBe(false);
		expect(indicator!.hasAttribute('aria-hidden')).toBe(false);
	});

	it('renders no activity indicator when not loading', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__activity-indicator')).toBeNull();
	});

	it('marks the inner button aria-busy when loading', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-busy')).toBe('true');
	});

	it('keeps the content in the DOM (hidden via CSS) so width is preserved', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.button__content')).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.button__text')!.textContent).toContain('Opslaan');
	});

	it('prevents the default click action while loading', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		const preventSpy = vi.spyOn(event, 'preventDefault');
		inner.dispatchEvent(event);
		expect(preventSpy).toHaveBeenCalled();
	});

	it('does not submit the closest form when clicked while loading', async () => {
		const host = await fixture('<form><nldd-button type="submit" loading text="Verzenden"></nldd-button></form>');
		await waitForUpdate(host.querySelector('nldd-button')!);
		let submitted = false;
		host.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
		(host.querySelector('nldd-button')!.shadowRoot!.querySelector('button') as HTMLElement).click();
		expect(submitted).toBe(false);
		cleanup(host);
	});

	it('does not hard-disable the inner button (stays focusable) while loading', async () => {
		el = await fixture<NLDDButton>('<nldd-button loading text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(false);
	});

	it('joins text and supporting-text in the accessible name with a comma and space', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Opslaan" supporting-text="Alle wijzigingen"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-label')).toBe('Opslaan, Alle wijzigingen');
	});

	it('falls back to supporting-text for the accessible name when text is empty', async () => {
		el = await fixture<NLDDButton>('<nldd-button supporting-text="Alle wijzigingen"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-label')).toBe('Alle wijzigingen');
	});

	it('lets accessible-label override the supporting-text-derived name', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Opslaan" supporting-text="Alle wijzigingen" accessible-label="Bewaar"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('aria-label')).toBe('Bewaar');
	});
});

describe('nldd-button slotted menu', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = '<nldd-button expandable text="Acties">'
		+ '<nldd-menu slot="popup"><nldd-menu-item text="Bewerken"></nldd-menu-item></nldd-menu>'
		+ '</nldd-button>';

	it('anchors a slotted nldd-menu to the host button', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement & { anchorElement: Element | null };
		expect(menu.anchorElement).toBe(el);
	});

	it('opens the slotted menu on click', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu') as HTMLElement;
		expect(menu.matches(':popover-open')).toBe(false);
		el.shadowRoot!.querySelector<HTMLElement>('.button')!.click();
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-button slotted popover', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const MARKUP = '<nldd-button expandable text="Info">'
		+ '<nldd-popover slot="popup" accessible-label="Info">'
		+ '<button class="pop-btn">inside</button>'
		+ '</nldd-popover>'
		+ '</nldd-button>';

	it('anchors a slotted nldd-popover to the host button', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement & { anchorElement: Element | null };
		expect(pop.anchorElement).toBe(el);
	});

	it('opens the slotted popover on click', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement;
		expect(pop.matches(':popover-open')).toBe(false);
		el.shadowRoot!.querySelector<HTMLElement>('.button')!.click();
		await waitForUpdate(el);
		expect(pop.matches(':popover-open')).toBe(true);
	});

	it('keeps the nested popover open when its own content is clicked', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		const pop = el.querySelector('nldd-popover') as HTMLElement;
		el.shadowRoot!.querySelector<HTMLElement>('.button')!.click();
		await waitForUpdate(el);
		expect(pop.matches(':popover-open')).toBe(true);
		// A click on the popover's own content must NOT dismiss it (the nesting
		// bug: the anchor is an ancestor of the content, so a naive self-toggle
		// would close it). The driven-mode bail prevents that.
		pop.querySelector<HTMLElement>('.pop-btn')!.click();
		await waitForUpdate(el);
		expect(pop.matches(':popover-open')).toBe(true);
	});

	it('syncs expanded back onto the button while the popover is open', async () => {
		el = await fixture<NLDDButton>(MARKUP);
		await waitForUpdate(el);
		el.shadowRoot!.querySelector<HTMLElement>('.button')!.click();
		await waitForUpdate(el);
		expect(el.expanded).toBe(true);
	});
});

describe('nldd-button – slotted popup overlay', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The popover initializes the trigger's aria on connect, before any open:
	// a screen-reader user must hear "opens a dialog" on first tab, not only
	// after opening it once.
	it('sets aria-haspopup on the inner button before the popover is ever opened', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Filters"><nldd-popover slot="popup" accessible-label="Filters"></nldd-popover></nldd-button>');
		await waitForUpdate(el);
		await Promise.resolve(); // the popover defers its anchor-aria init to a microtask
		await waitForUpdate(el);
		const inner = el.shadowRoot!.querySelector('button')!;
		expect(inner.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('releases the previous overlay when the popup slot empties', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Acties"><nldd-menu slot="popup"></nldd-menu></nldd-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBe(el);
		// Left anchored, a removed overlay keeps positioning against — and syncing
		// expanded onto — a button that no longer owns it.
		menu.remove();
		await waitForUpdate(el);
		expect((menu as unknown as { anchorElement: Element | null }).anchorElement).toBeNull();
	});

	it('opens the overlay on a keyboard click after a pointer gesture that never became a click', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Acties"><nldd-menu slot="popup"></nldd-menu></nldd-button>');
		await waitForUpdate(el);
		const menu = el.querySelector('nldd-menu')!;
		// Overlay open, pointer goes down on the button, then the gesture ends
		// elsewhere (drag off / touch scroll): no click, so the snapshot lingers.
		menu.showPopover();
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('button')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
		menu.hidePopover();
		await waitForUpdate(el);
		// Keyboard activation: a click with detail 0 and no preceding pointerdown.
		el.shadowRoot!.querySelector('button')!.dispatchEvent(
			new MouseEvent('click', { bubbles: true, composed: true, detail: 0 })
		);
		await waitForUpdate(el);
		expect(menu.matches(':popover-open')).toBe(true);
	});
});

describe('nldd-button no-tab', () => {
	let el: NLDDButton;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the button out of the tab order', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Opslaan" no-tab></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Opslaan"></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.hasAttribute('tabindex')).toBe(false);
	});

	it('takes the link variant out of the tab order', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Ga" href="#x" no-tab></nldd-button>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('gives a slotted start icon the same size as its own icon', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Ga"><svg slot="start-icon" viewBox="0 0 24 24"></svg></nldd-button>');
		await waitForUpdate(el);
		const own = await fixture<NLDDButton>('<nldd-button text="Ga" start-icon="book"></nldd-button>');
		await waitForUpdate(own);
		const slotted = getComputedStyle(el.querySelector('svg')!);
		const span = getComputedStyle(own.shadowRoot!.querySelector('.button__start-icon')!);

		expect(slotted.width).toBe(span.width);
		expect(slotted.height).toBe(span.height);
		cleanup(own);
	});

	it('reserves no icon space on a button without an icon', async () => {
		el = await fixture<NLDDButton>('<nldd-button text="Ga"></nldd-button>');
		await waitForUpdate(el);
		const content = el.shadowRoot!.querySelector('.button__content')!;
		const text = el.shadowRoot!.querySelector('.button__text-area')!;

		expect(content.getBoundingClientRect().width).toBeCloseTo(text.getBoundingClientRect().width, 1);
	});
});
