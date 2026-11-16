/**
 * Nederlandse Digitale Dienst Link Component (Lit + TypeScript)
 *
 * Hyperlink component with two modes:
 *
 * 1. **Standalone (sized)**: set `size="xs"|"sm"|"md"|"lg"` for menus, action
 *    areas or overviews. Fixed text size, `display: inline-flex` with `gap` for
 *    icon spacing.
 *
 * 2. **Inline (inherit)**: leave `size` out or set `size="inherit"` explicitly.
 *    The link inherits `font-size`, `line-height` and `font-family` from its
 *    surroundings. Text wraps naturally across lines (`display: inline`). Icons
 *    work here too; the natural whitespace between icon and text provides the
 *    spacing.
 *
 * For links in CMS or markdown output, where the `<a>` arrives as HTML,
 * `<nldd-rich-text>` with a raw `<a>` remains the route to take.
 *
 * ### An `<a>` of your own
 *
 * Put an `<a>` in the default slot and the component draws no link of its own:
 * it gives yours its look instead. A page then has the link in its HTML before
 * any script runs, for a search engine that does not render the page, a link
 * preview or reader mode, and a router gets the click: put the `<Link>` of
 * React Router or Next in it, which renders an `<a>` and navigates itself.
 * Without that, every click on a link in a shadow root loads the whole page.
 *
 *     <nldd-link size="md"><a href="/patronen">Patronen</a></nldd-link>
 *
 * Everything about the link goes on the `<a>`: `href`, `target`, `rel`,
 * `download`, and its text. Those attributes, `text`, `start-icon` and
 * `end-icon` do nothing on `nldd-link` then. An icon goes in the `<a>` as an
 * nldd-icon, so it is part of what you click and inside the focus ring.
 * `size`, `accessible-label`, `accessible-description`,
 * `accessible-described-by`, `interestfor`, `no-tab` and `disabled` keep
 * working: the component sets `aria-label`, the description, `tabindex` and
 * `aria-disabled` on your `<a>`, and leaves an attribute you set yourself
 * alone. With `target="_blank"` it adds `noopener noreferrer` to the `rel` of
 * the `<a>`, as it does to its own. A disabled link ignores a click before your
 * router sees it. The hint about
 * another website, a new tab or a download goes on it as `aria-description`, so
 * a screen reader reads it after the name, after the text of
 * `accessible-description`. `accessible-described-by` points the `<a>` at the
 * elements it names. Not as hidden text in the `<a>`: a
 * framework that renders the `<a>` owns its children, and an extra one breaks
 * hydration. One `<a>` per link.
 *
 * The look of the `<a>` comes from the global stylesheet, `dist/css/link.css`
 * or `global.css`, which includes it, so the link looks right before the
 * component loads, and without script.
 *
 * @element nldd-link
 * @attr {string} href - Link target
 * @attr {string} target - Link target (e.g. '_blank'); adjusts rel automatically. With '_blank' the link adds a visually hidden "opent in nieuw tabblad" announcement for screen readers (WCAG 2.1 SC 3.2.2). An `href` to another origin than the page (another website, a subdomain too) adds a visually hidden "andere website", in one sentence with the new-tab announcement when both apply; there is no way to switch it off.
 * @attr {string} download - Saves the file the link points at instead of opening it; only used with href. Without a value the browser takes the name from the URL, with one that is the file name. A browser ignores it for a URL on another origin and opens the file there. Adds a visually hidden "downloadt bestand" for screen readers. Leave `target` off: a download opens no tab.
 * @attr {string} rel - Link rel attribute; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {string} size - Text size: 'inherit' (the default) follows the surrounding text and lays the link out inline, so it wraps in running prose. 'xs' | 'sm' | 'md' | 'lg' pin a size and switch to inline-flex, which baseline-aligns a start or end icon with an explicit gap.
 * @attr {string} text - Link text. Content in the default slot wins.
 * @attr {string} start-icon - Icon before the text
 * @attr {string} end-icon - Icon after the text
 * @attr {string} interestfor - ID of an nldd-popover that previews where the link goes, looked up in the tree of this link. It opens on interest instead of on a click: when the pointer rests on the link, when it gets keyboard focus, and on a long press on touch. A click or a tap still follows the link. Focus stays on the link, the popover's content is read as the link's description, and Escape closes it. The pointer can move onto the popover without closing it. Information only: put no link or button in it. Keep the popover outside the paragraph: a link stands in a `<p>`, and a `<p>` of your own inside it would close that paragraph. One popover can serve several links. Keep `accessible-label` on it: it is left out while the popover describes a link.
 * @attr {string} accessible-label - Accessible label for screen readers
 * @attr {boolean} disabled - Disabled state. Avoid it where you can; the design guidelines say why.
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {object} translations - Override translation keys (e.g. the "opent in nieuw tabblad" announcement); unset keys fall back to Dutch.
 *
 * @slot - Link text. Wins over `text`. Or an `<a>` of your own, which takes the place of the link the component draws.
 * @accepts a
 * @slot start-icon - Custom icon before the text. Wins over `start-icon`.
 * @slot end-icon - Custom icon after the text. Wins over `end-icon`.
 */

import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { SlotContent } from '../../../utilities/slot-content.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { linkStyles } from './link.styles.js';
import { template } from './link.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddLinkTranslations } from './link.i18n.js';
import { InterestController } from '../../../utilities/interest-controller.js';
import { applyDescribedBy, DescribedBy } from '../../../utilities/described-by-mixin.js';
import { downloadLinkHintKey } from '../../../utilities/link-hint.js';
import { linkRel } from '../../../utilities/link-rel.js';
import './../../content/icon/icon.js';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'inherit';

@customElement('nldd-link')
export class NLDDLink extends DescribedBy(withTranslations(LitElement, nlddLinkTranslations)) {
	static override styles = linkStyles;

	/** @internal Whether the default slot holds text, which wins over `text`. */
	_textSlot = new SlotContent(this);

	@property({ type: String, reflect: true })
	href: string | undefined = undefined;

	@property({ type: String })
	target: string | undefined = undefined;

	/** Saves the file instead of opening it; only used when href is set. Empty
	 *  for the name from the URL, a name to save it under. */
	@property({ type: String })
	download: string | undefined = undefined;

	@property({ type: String })
	rel: string | undefined = undefined;

	@property({ reflect: true, converter: reflectNonDefault<Size>('inherit') })
	size: Size = 'inherit';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String, attribute: 'start-icon' })
	startIcon = '';

	@property({ type: String, attribute: 'end-icon' })
	endIcon = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	disabled = false;
	/** Take the control out of the tab order (`tabindex="-1"`) — for a control
	 *  owned by a roving container (an `nldd-list` sets it on the rows that are
	 *  not the current one) that manages focus itself. Still mouse- and
	 *  script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;

	@property({ type: String, reflect: true })
	interestfor: string | undefined = undefined;

	/** Wiring for the popover `interestfor` names: opens it on hover, focus
	 *  and long press. */
	_interest = new InterestController(this);

	/** @internal The `<a>` of the app in the default slot, which takes the place
	 *  of the link this component draws. */
	@state() _anchor: HTMLAnchorElement | null = null;

	/** Re-renders when the app changes what the hint on its `<a>` depends on. */
	private _anchorObserver: MutationObserver | null = null;

	/** The attributes this component set on the `<a>`, and the value it set:
	 *  only those are its to change or take away. */
	private _applied = new Map<string, string>();

	/** Whether the start-icon / end-icon slots hold an icon, so the space that
	 *  separates it from the label is only rendered next to an icon. */
	@state() _hasStartSlot = false;
	@state() _hasEndSlot = false;

	private _handleSlotChange(e: Event): void {
		const slot = e.target as HTMLSlotElement;
		const filled = slot.assignedNodes().length > 0;
		if (slot.name === 'start-icon') this._hasStartSlot = filled;
		else this._hasEndSlot = filled;
	}

	private _handleDefaultSlotChange = (e: Event): void => {
		this._textSlot.onChange(e);
		this._findAnchor();
	};

	/** Finds the `<a>` of the app among the children that go in the default slot. */
	private _findAnchor(): void {
		const anchors = [...this.children].filter((child): child is HTMLAnchorElement => child.localName === 'a' && !child.hasAttribute('slot'));
		const anchor = anchors[0] ?? null;
		if (anchor === this._anchor) return;
		if (this._anchor) this._release(this._anchor);
		this._anchor = anchor;
		this._observeAnchor();
	}

	private _observeAnchor(): void {
		this._anchorObserver?.disconnect();
		if (!this._anchor) return;
		this._anchorObserver ??= new MutationObserver(() => this.requestUpdate());
		this._anchorObserver.observe(this._anchor, { attributes: true, attributeFilter: ['href', 'target', 'download', 'rel'] });
	}

	/** Sets an attribute on the `<a>`, unless the app set it itself. */
	private _applyToAnchor(anchor: HTMLAnchorElement, name: string, value: string | null): void {
		const ours = this._applied.has(name) && anchor.getAttribute(name) === this._applied.get(name);
		if (value === null) {
			if (ours) anchor.removeAttribute(name);
			this._applied.delete(name);
			return;
		}
		if (anchor.hasAttribute(name) && !ours) return;
		anchor.setAttribute(name, value);
		this._applied.set(name, value);
	}

	/** The tokens this component added to the `rel` of the `<a>`. */
	private _relAdded: string[] = [];

	/** Adds `noopener noreferrer` to the `rel` of an `<a>` that opens a new tab,
	 *  and takes back only what it added when that changes. */
	private _applyRel(anchor: HTMLAnchorElement, target: string | null): void {
		const current = anchor.getAttribute('rel') ?? '';
		const own = current.split(/\s+/).filter((token) => token && !this._relAdded.includes(token));
		const wanted = linkRel(own.join(' '), target);
		this._relAdded = wanted.split(/\s+/).filter((token) => token && !own.includes(token));
		if (wanted === current) return;
		if (wanted) anchor.setAttribute('rel', wanted);
		else anchor.removeAttribute('rel');
	}

	/** Takes back what this component set on an `<a>` that is no longer its. */
	private _release(anchor: HTMLAnchorElement): void {
		for (const name of [...this._applied.keys()]) this._applyToAnchor(anchor, name, null);
		this._applyRel(anchor, null);
		applyDescribedBy(anchor, [], true);
	}

	private _updateAnchor(anchor: HTMLAnchorElement): void {
		const key = downloadLinkHintKey(anchor.getAttribute('href'), anchor.getAttribute('target'), anchor.getAttribute('download'));
		const description = [this._descriptionTextElement?.textContent, key ? this._t(`components.link.${key}`) : ''].filter(Boolean).join('. ');
		this._applyToAnchor(anchor, 'aria-description', description || null);
		this._applyToAnchor(anchor, 'aria-label', this.accessibleLabel || null);
		// Without an href an <a> is not focusable; a disabled link stays reachable.
		const unreachable = this.disabled && !anchor.hasAttribute('href');
		this._applyToAnchor(anchor, 'tabindex', this.noTab ? '-1' : (unreachable ? '0' : null));
		this._applyToAnchor(anchor, 'role', unreachable ? 'link' : null);
		this._applyToAnchor(anchor, 'aria-disabled', this.disabled ? 'true' : null);
		this._applyRel(anchor, anchor.getAttribute('target'));
	}

	/** Stops a click on a disabled <a> of the app before its own handlers, a
	 *  router's among them, see it: those run after the capture on the host.
	 *  A middle click too, which would open the link in a new tab. */
	private _blockDisabledAnchor = (e: MouseEvent): void => {
		if (!this.disabled || !this._anchor || !e.composedPath().includes(this._anchor)) return;
		e.preventDefault();
		e.stopPropagation();
	};

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('click', this._blockDisabledAnchor, true);
		this.addEventListener('auxclick', this._blockDisabledAnchor, true);
		this._findAnchor();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('click', this._blockDisabledAnchor, true);
		this.removeEventListener('auxclick', this._blockDisabledAnchor, true);
		this._anchorObserver?.disconnect();
		// The <a> can outlive this link; connectedCallback finds it again on a move.
		if (this._anchor) this._release(this._anchor);
		this._anchor = null;
	}

	private _handleClick(e: MouseEvent): void {
		if (this.disabled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (changed.has('interestfor')) this._interest.refresh();
		if (this._anchor) this._updateAnchor(this._anchor);
	}

	/** The `<a>` of the app, or else the one this component renders. */
	override describedTarget(): Element | null {
		return this._anchor ?? this.shadowRoot?.querySelector('.link') ?? null;
	}

	/** The popover in the `interest` slot describes the link. */
	override ownDescriptions(): readonly Element[] {
		return this._interest.overlay ? [this._interest.overlay] : [];
	}

	/** An `<a>` of the app cannot point into this shadow root, so the text of
	 *  `accessible-description` goes on its `aria-description` instead. */
	override _appDescriptions(onSelf: boolean): readonly Element[] {
		const elements = super._appDescriptions(onSelf);
		return this._anchor ? elements.filter((el) => el !== this._descriptionTextElement) : elements;
	}

	override render() {
		return template.call(this, {
			handleClick: this._handleClick.bind(this),
			handleSlotChange: this._handleSlotChange.bind(this),
			handleDefaultSlotChange: this._handleDefaultSlotChange,
		});
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-link': NLDDLink;
	}
}
