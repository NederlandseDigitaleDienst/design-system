/**
 * Nederlandse Digitale Dienst App View Component (Lit + TypeScript)
 *
 * The required root shell of a Nederlandse Digitale Dienst application. Always contains
 * a split view or an nldd-page as direct content.
 *
 * ## Typography
 * The document font comes from the package stylesheet
 * (`@nldd/design-system/styles`), not from this component: it gives `body` the
 * body font and content color as soon as an app-view is on the page, inside
 * `@layer reset` so any rule of your own wins. Import only the tokens
 * (`/styles/tokens`) and text you write in the light DOM keeps the browser
 * default.
 *
 * ## Background color
 * Set background="tinted" to give the whole application a tinted background.
 * All descendants read --context-parent-background-color via --_background-color automatically.
 * Individual components can override locally with their own background attribute.
 *
 * The same background color is forced on `document.body` so that browser-
 * chrome surfaces (iOS overscroll bounce, status bar, page-margin areas)
 * blend with the app instead of revealing the user-agent's default white.
 * Cleared when the app-view disconnects.
 *
 * ## Scroll mode
 * The app scrolls the DOCUMENT (root mode) or lets each `nldd-page` scroll
 * inside its pane (nested mode). The mode is derived from the outermost
 * horizontal split view: one column means the document scrolls, several columns
 * mean the panes do. An app without such a split view is a single column at
 * every width and therefore scrolls the document too — nested scrolling would
 * cost it the rubber-band and the collapsing browser toolbar on iOS for nothing.
 * Set `--context-scroll-mode` on the `nldd-app-view` itself to override the
 * derived mode; an inherited value loses from it.
 *
 * ## Overscroll
 * In nested scroll mode `overscroll-behavior: none` is set on
 * `document.documentElement` and `document.body` while the app-view is
 * connected. Combined with `overscroll-behavior: contain` on `nldd-page`'s
 * scroll target, this prevents iOS rubber-band on the viewport when scroll
 * gestures land outside an `nldd-page` (e.g. on a top-bar). In root scroll mode
 * the document itself is the scroller, so this is lifted to let the native
 * rubber-band happen. Cleared on last disconnect.
 *
 * @element nldd-app-view
 *
 * @attr {'base'|'tinted'} background - Background color (cascades to descendants)
 *
 * @slot - Default slot for the application content
 */
import { LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { ScrollModeController, SINGLE_COLUMN_CHANGE_EVENT } from '../../../utilities/scroll-mode-controller.js';
import type { ScrollMode, ScrollModeConsumer, ScrollModeProvider } from '../../../utilities/scroll-mode-controller.js';
import { appViewStyles } from './app-view.styles.js';
import { appViewTemplate } from './app-view.template.js';

/** A horizontal split view that reports whether it is collapsed to one column. */
interface SingleColumnSource extends HTMLElement {
	isSingleColumn: boolean;
}

// Track every connected app-view as a stack — the top is the current owner
// of the body-background style. Multiple instances can briefly coexist
// (tabs, modals, tests). Stack semantics handle disconnect order correctly:
// the older instance's background is restored when the younger owner leaves.
const _connectedStack: NLDDAppView[] = [];

function _currentOwner(): NLDDAppView | null {
	// Walk from the top down, skipping any entries that are no longer
	// connected (defensive: covers test isolation gaps where an instance is
	// removed without going through disconnectedCallback).
	for (let i = _connectedStack.length - 1; i >= 0; i--) {
		if (_connectedStack[i].isConnected) return _connectedStack[i];
	}
	return null;
}

@customElement('nldd-app-view')
export class NLDDAppView extends LitElement implements ScrollModeProvider {
	static override styles = appViewStyles;

	@property({ reflect: true, converter: reflectNonDefault<'base' | 'tinted'>('base') })
	background: 'base' | 'tinted' = 'base';

	// Every layout layer (this app-view, the split views, their panes, nested
	// pages) registers here so the derived scroll mode can be pushed to it.
	private _scrollConsumers = new Set<ScrollModeConsumer>();

	// Last mode this app-view derived and published, or null when it defers to an
	// inherited value (no horizontal split view present).
	private _derivedMode: ScrollMode | null = null;

	// Reflects --context-scroll-mode to [data-scroll] (the CSS flow branch) and,
	// on change, re-applies the document overscroll policy below. app-view's own
	// controller registers as a consumer too (closest() matches itself).
	private _scrollMode = new ScrollModeController(this, () => this._applyOverscroll());

	// ---- ScrollModeProvider ---------------------------------------------------

	/** @internal */
	registerScrollConsumer(consumer: ScrollModeConsumer): void {
		this._scrollConsumers.add(consumer);
		// The layer that just arrived may BE the split view this app-view derives
		// from: a consumer that renders its split view behind a condition (a
		// loading state, an error takeover, an empty state) swaps it out and back,
		// and while it was gone the derivation said `root`. Re-derive before
		// handing out the mode, so the new layer gets the fresh answer rather than
		// the one that was true while the split view was missing.
		this._evaluateScrollMode();
		// Hand a newly-registered layer (e.g. a page freshly re-mounted on
		// navigation) the current derived mode immediately, so it never depends
		// on a possibly-stale self-read of the inherited var.
		if (this._derivedMode) consumer.readScrollMode(this._derivedMode);
	}

	/** @internal */
	unregisterScrollConsumer(consumer: ScrollModeConsumer): void {
		this._scrollConsumers.delete(consumer);
		// Mirror of the register side: the layer that left may have been the split
		// view, and a single column with no split view scrolls the document.
		// disconnectedCallback runs after removal from the DOM, so the derivation
		// no longer finds it.
		this._evaluateScrollMode();
	}

	// The outermost (first in document order) horizontal split view — the one
	// whose single-column state decides whether the whole app is one scrolling
	// column. Vertical splitters (stacked-split-view) never collapse horizontally
	// and don't participate. Returns null for a bare-page app.
	private _outermostSplitView(): SingleColumnSource | null {
		return this.querySelector('nldd-navigation-split-view, nldd-side-by-side-split-view');
	}

	private _onSingleColumnChange = (): void => {
		this._evaluateScrollMode();
	};

	/**
	 * Derive the document-vs-nested scroll mode from the outermost horizontal
	 * split view and push it to every registered layer. Without such a split view
	 * the app is a single column at any width, so it scrolls the document: nested
	 * scrolling costs you the rubber-band and the collapsing browser toolbar on
	 * iOS for nothing. Set `--context-scroll-mode: nested` on the `nldd-app-view`
	 * itself to override (an inherited value loses from the derived one).
	 */
	private _evaluateScrollMode(): void {
		const splitView = this._outermostSplitView();
		// A split view that hasn't upgraded yet has no getter — wait for the
		// `single-column-change` event it fires once it has measured itself.
		if (splitView && typeof splitView.isSingleColumn !== 'boolean') return;

		const next: ScrollMode = splitView
			? (splitView.isSingleColumn ? 'root' : 'nested')
			: 'root';
		if (next === this._derivedMode) return;
		this._derivedMode = next;

		this.style.setProperty('--context-scroll-mode', next);
		// Push the derived mode to every layer. Pass the value explicitly rather
		// than letting each layer re-read the CSS var: a plain var change wouldn't
		// reach the resize-polling layers in the same frame, and a getComputedStyle
		// read during this synchronous push can be stale for a deeply-nested layer
		// (the var may not have propagated through an ancestor's pending re-render).
		this._scrollConsumers.forEach(consumer => consumer.readScrollMode(this._derivedMode ?? undefined));
	}

	override connectedCallback(): void {
		super.connectedCallback();
		_connectedStack.push(this);
		this._writeBodyBackground();
		this._applyOverscroll();
		// A split view fires this as it collapses to / expands out of one column.
		this.addEventListener(SINGLE_COLUMN_CHANGE_EVENT, this._onSingleColumnChange);
		// Best-effort initial derive (covers an already-upgraded split view, e.g.
		// on re-connection); the split view's first event settles the rest.
		this._evaluateScrollMode();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener(SINGLE_COLUMN_CHANGE_EVENT, this._onSingleColumnChange);
		const idx = _connectedStack.indexOf(this);
		if (idx >= 0) _connectedStack.splice(idx, 1);
		const owner = _currentOwner();
		if (owner) {
			// Re-apply whichever instance is now on top — fixes the case where a
			// younger instance disconnects first and an older one is still in the
			// DOM but had its background/overscroll overwritten.
			owner._writeBodyBackground();
			owner._applyOverscroll();
		} else {
			document.body.style.removeProperty('background-color');
			document.documentElement.style.removeProperty('overscroll-behavior');
			document.body.style.removeProperty('overscroll-behavior');
		}
	}

	// Nested mode pins the viewport (no rubber-band on gestures outside an
	// nldd-page); root mode lets the document rubber-band natively. Only the
	// current owner writes this shared document-level style.
	private _applyOverscroll(): void {
		if (_currentOwner() !== this) return;
		if (this._scrollMode.mode === 'root') {
			document.documentElement.style.removeProperty('overscroll-behavior');
			document.body.style.removeProperty('overscroll-behavior');
		} else {
			document.documentElement.style.overscrollBehavior = 'none';
			document.body.style.overscrollBehavior = 'none';
		}
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('background') && _currentOwner() === this) {
			this._writeBodyBackground();
		}
	}

	private _writeBodyBackground(): void {
		const token = this.background === 'tinted'
			? '--semantics-surfaces-tinted-background-color'
			: '--semantics-surfaces-base-background-color';
		document.body.style.backgroundColor = `var(${token})`;
	}

	override render() {
		return appViewTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-app-view': NLDDAppView;
	}
}
