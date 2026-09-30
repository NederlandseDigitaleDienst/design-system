/**
 * Nederlandse Digitale Dienst Top Title Bar Component (Lit + TypeScript)
 *
 * A toolbar for page and container headings with optional navigation and action buttons.
 *
 * The component has two states:
 * - Default: the back button shows the previous page title as a text button
 * - Compact (class `is-compact`): the back button is an icon button, a divider and the
 *   toolbar title are visible
 *
 * When `collapse-anchor` is set, the `is-compact` class is automatically applied
 * as soon as the top of the anchor element reaches this bar's own top edge (the
 * sticky header line). Measuring the bar rather than the page keeps it correct in
 * both nested and root scroll modes; it also re-points at the live scroll target
 * when the page switches mode.
 *
 * Without `collapse-anchor` the bar takes a static state: compact when `text`
 * is set (so the title shows in the title-group), non-compact otherwise (so
 * the `back-text` button stays visible).
 *
 * An anchored bar hides its own title from assistive technology. The anchor is
 * the heading the title swaps in for, so both carry the same words: once you
 * scroll past the heading, a screen reader would otherwise find the same title
 * twice. Sighted readers see one at a time, and this makes that true for
 * everyone. Anchor at the heading, then, and not at some other element that
 * happens to sit at the right height: the bar hands its title over to it.
 *
 * @element nldd-top-title-bar
 *
 * @attr {string} text - Title of the bar, rendered as the heading in the title group.
 * @attr {string} supporting-text - Text under the title.
 * @attr {1|2|3|4|5|6} heading-level - Heading level of the title: 1–6 (default: 1). Lower it where the bar is not the top of the page, such as a pane beside content that already has its h1.
 * @attr {string} collapse-anchor - Id of the element whose top edge triggers the compact state on scroll. Without it the state is static (see above).
 * @attr {string} back-text - Text of the back button and its accessible name. Empty hides the back button (and the divider).
 * @attr {string} back-href - URL for the back button; renders a link and suppresses the `back` event.
 * @attr {string} dismiss-text - Text of the dismiss button. Empty hides that button.
 *
 * @slot toolbar - Optional buttons to the left of the dismiss button
 *
 * @fires back - Fired when the back button is clicked (not fired when back-href is set). It bubbles and is composed, so an ancestor hears it too, which is how nldd-navigation-split-view lets a consumer catch the back of any pane in one place. Listen in one place then: bound to both this bar and an ancestor, a single press runs the handler twice.
 * @fires dismiss - Fired when the dismiss button is clicked. Bubbles and is composed, with the same caveat as `back`.
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { topTitleBarStyles } from './top-title-bar.styles.js';
import { topTitleBarTemplate } from './top-title-bar.template.js';
import type { NLDDPage } from '../../layout/page/page.js';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@customElement('nldd-top-title-bar')
export class NLDDTopTitleBar extends LitElement {
	static override styles = topTitleBarStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ reflect: true, attribute: 'heading-level', converter: reflectNonDefault<HeadingLevel>(1) })
	headingLevel: HeadingLevel = 1;

	@property({ type: String, attribute: 'collapse-anchor' })
	collapseAnchor = '';

	@property({ reflect: true, attribute: 'back-text', converter: reflectNonDefault<string>('') })
	backText = '';

	@property({ type: String, attribute: 'back-href' })
	backHref = '';

	@property({ reflect: true, attribute: 'dismiss-text', converter: reflectNonDefault<string>('') })
	dismissText = '';

	@state()
	_hasToolbarItems = false;

	private _pageElement: Element | null = null;

	/** Reactive: the title group hides from assistive software once the anchor is
	 *  really there, not the moment someone types an id. A typo would otherwise
	 *  leave the page without an accessible title at all, and nothing on screen
	 *  would say so. */
	@state()
	private _anchorElement: Element | null = null;
	private _activeScrollTarget: EventTarget | null = null;
	private _scrollTargetStyleObserver: MutationObserver | null = null;
	private _pageModeObserver: MutationObserver | null = null;
	private _anchorLayoutObserver: ResizeObserver | null = null;
	private _anchorAppearObserver: MutationObserver | null = null;
	private _boundOnScroll = this._onScroll.bind(this);

	override connectedCallback(): void {
		super.connectedCallback();
		this._connectPage();
		this._connectAnchor();
		this._updateAutoCompact();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._teardownAnchor();
	}

	override updated(changed: Map<string, unknown>): void {
		if (changed.has('collapseAnchor')) {
			this._teardownAnchor();
			if (this.collapseAnchor) {
				this._connectAnchor();
			}
			this._updateAutoCompact();
		} else if (changed.has('text')) {
			this._updateAutoCompact();
		}
	}

	// Without a scroll anchor the bar can't toggle compact state on scroll,
	// so we settle on a static state. With a `text` value we auto-compact
	// (so the title shows in the title-group); without `text` we stay
	// non-compact so the `back-text` button is visible. With an anchor the
	// scroll listener owns the class — this method is a no-op.
	private _updateAutoCompact(): void {
		if (this.collapseAnchor) return;
		this.classList.toggle('is-compact', Boolean(this.text));
	}

	private _connectPage(): void {
		let el: Element | null = this;
		while (el) {
			if (el.tagName.toLowerCase() === 'nldd-page') {
				this._pageElement = el;
				return;
			}
			// Traverse up, piercing shadow DOM boundaries via getRootNode().host
			el = el.parentElement ?? (
				el.getRootNode() instanceof ShadowRoot
					? (el.getRootNode() as ShadowRoot).host
					: null
			);
		}
	}

	/** @internal */
	get _hasAnchor(): boolean {
		return this._anchorElement !== null;
	}

	private _connectAnchor(): void {
		if (!this.collapseAnchor) return;

		const root = this.getRootNode() as Document | ShadowRoot;
		this._anchorElement = (root as Document).getElementById?.(this.collapseAnchor)
			?? root.querySelector(`#${this.collapseAnchor}`);

		if (!this._anchorElement) {
			if (import.meta.env?.DEV) {
				console.warn(
					`[nldd-top-title-bar] collapse-anchor="${this.collapseAnchor}" matches nothing yet. `
					+ 'If it never renders, the bar keeps its own title and reads it out twice.',
				);
			}
			this._waitForAnchor(root);
			return;
		}

		this._wireScrollTarget();

		// The page's scroll target flips when it switches scroll mode (nested
		// inner scroller <-> the document, derived on resize by nldd-app-view).
		// Re-wire onto the new target whenever the page reflects a new
		// [data-scroll], so the collapse keeps tracking the live scroller.
		if (this._pageElement) {
			this._pageModeObserver = new MutationObserver(() => this._wireScrollTarget());
			this._pageModeObserver.observe(this._pageElement, {
				attributes: true,
				attributeFilter: ['data-scroll'],
			});
		}

		// updateComplete only awaits this bar's own render, not the pane below it.
		// A pane pushed by the app can still be laying out, or mid-transition, so
		// the first measurement can land on an anchor without a box. Re-measure the
		// moment it gets one.
		this._anchorLayoutObserver = new ResizeObserver(() => this._onScroll());
		this._anchorLayoutObserver.observe(this._anchorElement);

		// Initial check after layout is complete
		this.updateComplete.then(() => this._onScroll());
	}

	// A page that renders its title only once its data has loaded has no anchor
	// when this bar connects. Without this the bar gives up for good: it never
	// collapses, so a `text` that was meant to appear on scroll never does.
	// Watch for the id showing up, then connect as usual.
	private _waitForAnchor(root: Document | ShadowRoot): void {
		this._anchorAppearObserver = new MutationObserver(() => {
			const found = (root as Document).getElementById?.(this.collapseAnchor)
				?? root.querySelector(`#${this.collapseAnchor}`);
			if (!found) return;
			this._anchorAppearObserver?.disconnect();
			this._anchorAppearObserver = null;
			this._connectAnchor();
		});
		this._anchorAppearObserver.observe(root, { childList: true, subtree: true });
	}

	// (Re)attach the scroll + style listeners to the page's current scroll
	// target — the host document in root-scroll mode, the page (or its inner
	// scroller) in nested mode.
	private _wireScrollTarget(): void {
		this._activeScrollTarget?.removeEventListener('scroll', this._boundOnScroll);
		this._scrollTargetStyleObserver?.disconnect();
		this._scrollTargetStyleObserver = null;

		const page = this._pageElement as NLDDPage | null;
		// scrollEventTarget (not scrollTarget): in root-scroll mode the viewport's
		// scroll event fires on `window`, not on document.scrollingElement, so a
		// listener on the latter would never fire and the bar would never collapse.
		this._activeScrollTarget = page ? page.scrollEventTarget : window;
		this._activeScrollTarget.addEventListener('scroll', this._boundOnScroll, { passive: true });

		// nldd-page sets padding-top on its scroll target asynchronously
		// (ResizeObserver on the header). If our initial _onScroll runs
		// before that, the anchor's measured position is wrong and we
		// flash into is-compact until the user scrolls. Observe inline-
		// style changes on the scroll target so we re-check the moment
		// padding-top lands.
		if (this._activeScrollTarget instanceof Element) {
			this._scrollTargetStyleObserver = new MutationObserver(() => this._onScroll());
			this._scrollTargetStyleObserver.observe(this._activeScrollTarget, {
				attributes: true,
				attributeFilter: ['style'],
			});
		}

		this._onScroll();
	}

	private _teardownAnchor(): void {
		this._activeScrollTarget?.removeEventListener('scroll', this._boundOnScroll);
		this._activeScrollTarget = null;
		this._anchorElement = null;
		this._scrollTargetStyleObserver?.disconnect();
		this._scrollTargetStyleObserver = null;
		this._pageModeObserver?.disconnect();
		this._pageModeObserver = null;
		this._anchorLayoutObserver?.disconnect();
		this._anchorLayoutObserver = null;
		this._anchorAppearObserver?.disconnect();
		this._anchorAppearObserver = null;
	}

	private _onScroll(): void {
		if (!this._anchorElement || !this._pageElement) return;
		// Collapse once the anchor reaches this bar's own top edge. Measuring the
		// bar (not the page) keeps this correct in both scroll modes: in nested
		// scroll the bar is pinned at the page top, so its top equals the page top
		// (unchanged behavior); in root-scroll mode the bar is position:sticky
		// against the document while the page element itself scrolls away, so the
		// page top is no longer the sticky line — the bar's own top still is.
		const anchor = this._anchorElement.getBoundingClientRect();
		// An anchor without a box measures 0, and 0 is above this bar, so a
		// measurement taken before the pane laid out would always read as "scrolled
		// past" and collapse the bar. The title then shows twice: once here and
		// once in the pane, as soon as that does lay out. Leaving the class alone
		// keeps the last known good state until the anchor is real.
		if (anchor.width === 0 && anchor.height === 0) return;
		const barTop = this.getBoundingClientRect().top;
		this.classList.toggle('is-compact', anchor.top <= barTop);
	}

	_onToolbarSlotChange = (e: Event) => {
		const slot = e.target as HTMLSlotElement;
		this._hasToolbarItems = slot.assignedElements().length > 0;
	};

	_handleBack(): void {
		if (this.backHref) return;
		this.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));
	}

	_handleDismiss(): void {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
	}

	override render() {
		return topTitleBarTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-top-title-bar': NLDDTopTitleBar;
	}
}
