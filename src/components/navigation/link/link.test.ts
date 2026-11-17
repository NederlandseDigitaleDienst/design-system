import { describe, it, expect, afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import type { NLDDLink } from './link.js';
import './link.js';
import '../../layout/popover/popover.js';
import '../../../assets/styles/variables.css';
import './link.css';

describe('nldd-link', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-link></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('keeps its underline when it has keyboard focus', async () => {
		el = await fixture('<nldd-link href="#" text="Toegankelijkheid"></nldd-link>');
		await waitForUpdate(el);
		await userEvent.keyboard('{Tab}');
		const anchor = el.shadowRoot!.querySelector('.link')!;
		expect(anchor.matches(':focus-visible')).toBe(true);
		const label = el.shadowRoot!.querySelector('.link__label')!;
		expect(getComputedStyle(label).textDecorationLine).toBe('underline');
	});

	it('defaults size to inherit, and leaves the attribute off', async () => {
		el = await fixture('<nldd-link href="#" text="Go home"></nldd-link>');
		await waitForUpdate(el);
		expect((el as NLDDLink).size).toBe('inherit');
		expect(el.hasAttribute('size')).toBe(false);
		// The bare host and an explicit size="inherit" share every rule, so both
		// stay inline and wrap in running text.
		expect(getComputedStyle(el).display).toBe('inline');
	});

	it('renders text from text attribute', async () => {
		el = await fixture('<nldd-link href="#" text="Go home"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.textContent).toContain('Go home');
	});

	it('sets href on inner anchor', async () => {
		el = await fixture('<nldd-link href="/about" text="About"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('href')).toBe('/about');
	});

	it('defaults rel to noopener noreferrer for target=_blank', async () => {
		el = await fixture('<nldd-link href="https://example.com" target="_blank" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('merges custom rel with noopener noreferrer for target=_blank', async () => {
		el = await fixture('<nldd-link href="https://example.com" target="_blank" rel="nofollow" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const rel = anchor.getAttribute('rel')!.split(/\s+/);
		expect(rel).toContain('nofollow');
		expect(rel).toContain('noopener');
		expect(rel).toContain('noreferrer');
	});

	it('does not add safety attrs when target is not _blank', async () => {
		el = await fixture('<nldd-link href="/local" rel="nofollow" text="Local"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('rel')).toBe('nofollow');
	});

	it('announces "opens in new tab" via a visually-hidden hint when target=_blank', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')?.textContent).toBe(', opent in nieuw tabblad');
		// The name stays content-derived (visible text + hint), so no aria-label override.
		expect(anchor.hasAttribute('aria-label')).toBe(false);
	});

	it('folds the new-tab hint into aria-label when accessible-label is set', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" accessible-label="Externe site" text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.getAttribute('aria-label')).toBe('Externe site, opent in nieuw tabblad');
		// A hidden span would lose to aria-label, so it isn't rendered.
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
	});

	it('omits the new-tab hint when target is not _blank', async () => {
		el = await fixture('<nldd-link href="/local" text="Local"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
		expect(anchor.hasAttribute('aria-label')).toBe(false);
	});

	it('suppresses the new-tab hint when disabled (the anchor does not navigate)', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" disabled text="External"></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.querySelector('.link__link-hint')).toBeNull();
	});

	it('overrides the new-tab wording via the translations property', async () => {
		el = await fixture('<nldd-link href="/overzicht" target="_blank" text="External"></nldd-link>');
		(el as NLDDLink).translations = { 'components.link.link-hint-new-tab-lowercase-label': 'opens in a new tab' };
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', opens in a new tab');
	});

	it('says a link to another website goes there', async () => {
		el = await fixture('<nldd-link href="https://open.overheid.nl/" text="Lees de startnotitie"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', andere website');
	});

	it('makes one sentence of another website in a new tab', async () => {
		el = await fixture('<nldd-link href="https://open.overheid.nl/" target="_blank" text="Lees de startnotitie"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('.link__link-hint')).toHaveLength(1);
		expect(el.shadowRoot!.querySelector('.link__link-hint')?.textContent).toBe(', andere website, opent in nieuw tabblad');
	});

	it('removes href and adds role="link" + tabindex=0 when disabled', async () => {
		el = await fixture('<nldd-link href="#" text="Disabled" disabled></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		expect(anchor.hasAttribute('href')).toBe(false);
		expect(anchor.getAttribute('role')).toBe('link');
		expect(anchor.getAttribute('tabindex')).toBe('0');
		expect(anchor.getAttribute('aria-disabled')).toBe('true');
	});

	it('blocks programmatic click when disabled', async () => {
		el = await fixture('<nldd-link href="#" text="Disabled" disabled></nldd-link>');
		await waitForUpdate(el);
		const anchor = el.shadowRoot!.querySelector('a')!;
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		anchor.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	// — Inherit / inline mode —

	it('has no size attribute by default (inherit mode)', async () => {
		el = await fixture('<nldd-link href="#" text="Inline"></nldd-link>');
		await waitForUpdate(el);
		expect(el.hasAttribute('size')).toBe(false);
	});

	it('inherit mode renders start-icon (whitespace provides spacing)', async () => {
		el = await fixture('<nldd-link href="#" text="With icon" start-icon="download"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__start-icon')).not.toBeNull();
	});

	it('inherit mode renders end-icon (whitespace provides spacing)', async () => {
		el = await fixture('<nldd-link href="#" text="With icon" end-icon="arrow-right"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__end-icon')).not.toBeNull();
	});

	// Whitespace in the <a> renders as a gap in running text ("de disclaimer ."),
	// so the only text besides the label is the space next to an icon.
	describe('whitespace around the label', () => {
		const anchorText = () => el.shadowRoot!.querySelector('a')!.textContent;

		it('has none without an icon', async () => {
			el = await fixture('<nldd-link href="#" text="de disclaimer"></nldd-link>');
			await waitForUpdate(el);
			expect(anchorText()).toBe('de disclaimer');
			const stray = [...el.shadowRoot!.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
			expect(stray).toEqual([]);
		});

		it('has one space before an end-icon and after a start-icon', async () => {
			el = await fixture('<nldd-link href="#" text="Label" start-icon="download" end-icon="arrow-right"></nldd-link>');
			await waitForUpdate(el);
			expect(anchorText()).toBe(' Label ');
		});

		it('has one space next to a slotted icon, and drops it when the icon goes', async () => {
			el = await fixture('<nldd-link href="#" text="Label"><nldd-icon slot="end-icon" icon="arrow-right"></nldd-icon></nldd-link>');
			await waitForUpdate(el);
			expect(anchorText()).toBe('Label ');
			el.querySelector('nldd-icon')!.remove();
			await waitForUpdate(el);
			expect(anchorText()).toBe('Label');
		});
	});

	it('sized mode renders icons as before', async () => {
		el = await fixture('<nldd-link href="#" size="md" text="With icon" start-icon="download"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.link__start-icon')).not.toBeNull();
	});
});

describe('nldd-link no-tab', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the link out of the tab order', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X" no-tab></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('wins over the tab stop a disabled link keeps', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X" disabled no-tab></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDLink>('<nldd-link href="/x" text="X"></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.hasAttribute('tabindex')).toBe(false);
	});
});

describe('<nldd-link> with download', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('puts download on the link and says it downloads the file', async () => {
		el = await fixture('<nldd-link href="/verslag.pdf" download="verslag.pdf" text="Verslag"></nldd-link>');
		await waitForUpdate(el);
		const a = el.shadowRoot!.querySelector('a')!;
		expect(a.getAttribute('download')).toBe('verslag.pdf');
		expect(a.textContent).toContain('downloadt bestand');
	});

	it('states that target does nothing on a download', async () => {
		el = await fixture('<nldd-link href="/verslag.pdf" target="_blank" download="verslag.pdf" text="Verslag"></nldd-link>');
		await waitForUpdate(el);
		expect(el.matches(':state(download-with-target)')).toBe(true);
	});
});

describe('<nldd-link> with an <a> of its own', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const own = (link: HTMLElement) => link.querySelector(':scope > a')!;

	it('draws no link of its own, so the two never nest', async () => {
		el = await fixture('<nldd-link size="md"><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')).toBeNull();
		expect(own(el).assignedSlot).not.toBeNull();
	});

	it('looks like a link through the global stylesheet', async () => {
		el = await fixture('<nldd-link size="md"><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		// A pointer left there by an earlier test would give the hover color.
		await userEvent.unhover(document.body);
		// The color of the <a> transitions; a slow machine reads it halfway,
		// the same color written as oklab.
		own(el).getAnimations().forEach((animation) => animation.finish());
		const style = getComputedStyle(own(el));
		expect(style.textDecorationLine).toBe('underline');
		// A flex item of the host, so the browser makes inline-flex flex.
		expect(style.display).toMatch(/flex$/);
		const reference = document.createElement('span');
		reference.style.color = 'var(--context-link-color)';
		document.body.append(reference);
		expect(style.color).toBe(getComputedStyle(reference).color);
		reference.remove();
	});

	it('says on the <a> that it goes to another website, and follows a change of href', async () => {
		el = await fixture('<nldd-link><a href="https://example.org/">Voorbeeld</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('aria-description')).toBe('andere website');
		a.setAttribute('href', '/patronen');
		await waitForUpdate(el);
		expect(a.hasAttribute('aria-description')).toBe(false);
	});

	it('adds noopener noreferrer to the rel of an <a> that opens a new tab, and takes back only that', async () => {
		el = await fixture('<nldd-link><a href="/patronen" target="_blank" rel="external">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('rel')).toBe('external noopener noreferrer');
		a.removeAttribute('target');
		await waitForUpdate(el);
		expect(a.getAttribute('rel')).toBe('external');
	});

	it('disables the <a>: marked, and a click goes nowhere and reaches no handler of the app', async () => {
		el = await fixture('<nldd-link disabled><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el) as HTMLAnchorElement;
		expect(a.getAttribute('aria-disabled')).toBe('true');
		let reached = false;
		a.addEventListener('click', () => { reached = true; });
		const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
		a.dispatchEvent(click);
		expect(click.defaultPrevented).toBe(true);
		expect(reached).toBe(false);
		(el as HTMLElement & { disabled: boolean }).disabled = false;
		await waitForUpdate(el);
		expect(a.hasAttribute('aria-disabled')).toBe(false);
		const next = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
		a.addEventListener('click', (e) => e.preventDefault());
		a.dispatchEvent(next);
		expect(reached).toBe(true);
	});

	it('stops a middle click on a disabled <a>, which would open it in a new tab', async () => {
		el = await fixture('<nldd-link disabled><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const auxclick = new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true, composed: true });
		own(el).dispatchEvent(auxclick);
		expect(auxclick.defaultPrevented).toBe(true);
	});

	it('keeps the rel the app sets after the first render, and adds to it only what a new tab needs', async () => {
		el = await fixture('<nldd-link><a href="https://example.org/" target="_blank">Voorbeeld</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('rel')).toBe('noopener noreferrer');
		a.setAttribute('rel', 'nofollow');
		await waitForUpdate(el);
		expect(a.getAttribute('rel')).toBe('nofollow noopener noreferrer');
		a.removeAttribute('target');
		await waitForUpdate(el);
		expect(a.getAttribute('rel')).toBe('nofollow');
	});

	it('keeps a disabled <a> without an href reachable by keyboard', async () => {
		el = await fixture('<nldd-link disabled><a>Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('tabindex')).toBe('0');
		expect(a.getAttribute('role')).toBe('link');
	});

	it('says a download downloads the file', async () => {
		el = await fixture('<nldd-link><a href="/verslag.pdf" download>Verslag</a></nldd-link>');
		await waitForUpdate(el);
		expect(own(el).getAttribute('aria-description')).toBe('downloadt bestand');
	});

	it('puts accessible-label and no-tab on the <a>, and leaves what the app set alone', async () => {
		el = await fixture('<nldd-link accessible-label="Alle patronen" no-tab><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('aria-label')).toBe('Alle patronen');
		expect(a.getAttribute('tabindex')).toBe('-1');
		(el as NLDDLink).noTab = false;
		await waitForUpdate(el);
		expect(a.hasAttribute('tabindex')).toBe(false);

		cleanup(el);
		el = await fixture('<nldd-link accessible-label="Alle patronen"><a href="/patronen" aria-label="Patronen bekijken">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		expect(own(el).getAttribute('aria-label')).toBe('Patronen bekijken');
	});

	it('leaves an attribute alone that the app changed after the link set it', async () => {
		el = await fixture('<nldd-link accessible-label="Alle patronen"><a href="/patronen">Patronen</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		a.setAttribute('aria-label', 'Patronen bekijken');
		(el as NLDDLink).accessibleLabel = 'Alle voorbeelden';
		await waitForUpdate(el);
		expect(a.getAttribute('aria-label')).toBe('Patronen bekijken');
		(el as NLDDLink).accessibleLabel = '';
		await waitForUpdate(el);
		expect(a.getAttribute('aria-label')).toBe('Patronen bekijken');
	});

	it('takes back what it set when it leaves the page, and sets it again when it comes back', async () => {
		el = await fixture('<div><nldd-link no-tab><a href="https://example.org/">Voorbeeld</a></nldd-link></div>');
		const link = el.querySelector('nldd-link')!;
		await waitForUpdate(link);
		const a = own(link);
		expect(a.getAttribute('tabindex')).toBe('-1');
		link.remove();
		expect(a.hasAttribute('tabindex')).toBe(false);
		expect(a.hasAttribute('aria-description')).toBe(false);
		el.append(link);
		await waitForUpdate(link);
		expect(a.getAttribute('tabindex')).toBe('-1');
		expect(a.hasAttribute('aria-description')).toBe(true);
	});

	it('lets the popover of interestfor describe the <a>', async () => {
		el = await fixture('<div><nldd-link interestfor="uitleg"><a href="/patronen">Patronen</a></nldd-link><nldd-popover id="uitleg">Hoe je componenten samenstelt</nldd-popover></div>');
		const link = el.querySelector('nldd-link')!;
		await waitForUpdate(link);
		const described = (own(link) as HTMLAnchorElement & { ariaDescribedByElements: Element[] | null }).ariaDescribedByElements;
		expect(described).toEqual([el.querySelector('nldd-popover')]);
	});

	it('draws its own link again, and takes back what it set, when the <a> goes', async () => {
		el = await fixture('<nldd-link href="/componenten" text="Componenten" no-tab><a href="https://example.org/">Voorbeeld</a></nldd-link>');
		await waitForUpdate(el);
		const a = own(el);
		expect(a.getAttribute('tabindex')).toBe('-1');
		a.remove();
		await waitForUpdate(el);
		expect(a.hasAttribute('tabindex')).toBe(false);
		expect(a.hasAttribute('aria-description')).toBe(false);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('href')).toBe('/componenten');
	});
});
