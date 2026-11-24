/**
 * Nederlandse Digitale Dienst Page Component (Lit + TypeScript)
 *
 * A page layout with optional sticky header and footer.
 * Without sticky-header, the host is the scroll container and the header
 * is in normal flow. With sticky-header, the header becomes absolute and
 * .page__scroll takes over scrolling, padded by the measured header height.
 * That padding freezes once you scroll, so a collapsing bar cannot drag the
 * content up under the cursor.
 *
 * In root-scroll mode (--context-scroll-mode: root, derived upstream by
 * nldd-shell) the page stops owning a scroller: the document scrolls and the
 * sticky header/footer stick against the document, offset by
 * --context-inset-top/bottom. The mode is read on connect/resize and reflected
 * to [data-scroll] so the CSS can branch.
 *
 * The page passes those insets on to its own content, with its sticky header
 * and footer added: anything sticky inside (an nldd-sidebar-section, a sticky
 * table head) reads --context-inset-top / --context-inset-bottom and clears
 * every bar above and below it without being told a number. The heights are
 * measured, because a top title bar shrinks as you scroll past its anchor. While
 * the page owns the scroller, only its own bars count: the chrome above the page
 * sits outside that scroller and does not push sticky content down.
 *
 * ## Landmarks
 * A page carries the landmarks of a document: its header is the banner, its
 * content the main landmark, its footer the contentinfo. A document has one of
 * each, so a page that sits beside another one cannot have them. Such a page
 * renders a section and a plain div instead, which drops all three at once: a
 * header inside sectioning content is no longer a banner. With
 * `accessible-label` that section is a named region, so there is still one
 * landmark to jump to; without a name it is no landmark at all, which beats an
 * unnamed one.
 *
 * `landmarks` says which of the two a page is, and `auto` (the default) reads
 * it off where the page sits:
 * - in an overlay (nldd-sheet, nldd-modal-dialog, nldd-window, nldd-popover) a
 *   region, because the overlay is not the document;
 * - in a pane of nldd-navigation-split-view, nldd-side-by-side-split-view or
 *   nldd-stacked-split-view a region, because those place pages beside each
 *   other;
 * - anywhere else the page, including the `main` slot of an
 *   nldd-bar-split-view, which stacks bars around a single content area.
 *
 * So an app shell has no main until you say which pane holds the primary
 * content, with `landmarks="page"` on that one page. Only the application
 * knows which pane that is. Two pages that both render a main is invalid HTML,
 * and the page says so in development.
 *
 * ## Steps
 * A step deeper in the same surface is a page beside the one it starts from,
 * in the same parent and slot, not a second sheet on top of the first. Give
 * each page an `id` and the deeper one a `parent`, and hide all but the first:
 *
 *     <nldd-sheet>
 *         <nldd-page id="opdracht">…</nldd-page>
 *         <nldd-page id="kiezer" parent="opdracht" hidden>…</nldd-page>
 *     </nldd-sheet>
 *
 * `show()` on a page shows it and hides the pages beside it. A page with
 * `parent` gives the nldd-top-title-bar in its header a back button with the
 * title of that parent page (its title bar's `text`, or else its
 * `accessible-label`), unless the bar has a `back-text` of its own. A press on
 * it shows the parent and puts focus back on the control that opened the step.
 * That `back` goes no further, so a listener for the back of a split view's pane
 * does not hear it too. With `back-href` the bar is a link and the page leaves
 * it alone.
 *
 * The parent is structure, not history: a page opened straight away still goes
 * back to its parent. Nothing goes into the URL. A step that deserves an
 * address of its own is a page of the application, with `back-href`. In a
 * framework, bind `hidden` and listen for `show` to keep your state in step.
 *
 * @element nldd-page
 * @keywords pagina
 * @related nldd-shell, nldd-window
 *
 * @attr {'inherit'|'base'|'tinted'} background - Use a gray background instead of white
 * @attr {string} accessible-label - Name of the landmark this page is: the region it becomes beside another page, or its main landmark
 * @attr {'auto'|'page'|'region'} landmarks - Whether this page carries the document's landmarks: 'auto' (default) derives it from where the page sits, 'page' keeps banner, main and contentinfo, 'region' drops all three
 * @attr {boolean} sticky-header - Sticky header
 * @attr {boolean} sticky-footer - Sticky footer
 * @attr {string} parent - Id of the page beside this one that this page is a step of. The back button of its title bar shows that page
 *
 * @slot header - Header content. Put a `nldd-top-title-bar` straight in this slot, not in a container: the page measures the bar there, so an anchor scrolled to stays clear of it
 * @slot - Main content (scrollable)
 * @slot footer - Footer content
 *
 * @fires show - Fired on a page that `show()` or a back button has just shown. Bubbles. Read the page from `event.target`
 *
 * @method show - Shows this page and hides the pages beside it, in the same parent and slot. Moves focus into it when focus was in the page it replaces
 * @method back - Shows the parent page and puts focus back on the control that opened this step, as the back button does. For a step that ends with a choice
 *
 * @cssprop --context-inset-top - Height of every bar above the content, sticky header included. Read it as `top` of anything sticky inside the page
 * @cssprop --context-inset-bottom - Height of every bar below the content, sticky footer included. Read it as `bottom` of anything sticky inside the page
 * @cssprop --context-scroller-height - Height of the area the content scrolls in, for sticky content that caps its own height. The height of the page's own scroller while it scrolls in its pane, and `100dvh` while the document scrolls
 */
import { LitElement, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { addStandaloneScrollLayer, findScrollModeProvider, inOverlay, removeStandaloneScrollLayer, whenScrollModeProviderDefined } from '../../../utilities/scroll-mode-controller.js';
import type { ScrollMode, ScrollModeProvider, StandaloneScrollLayer } from '../../../utilities/scroll-mode-controller.js';
import { pageStyles } from './page.styles.js';
import { pageTemplate } from './page.template.js';
import { setState } from '../../../utilities/element-state.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { LayoutPass, sharedResizeObserver } from '../../../utilities/layout-pass.js';
import { FocusReturn, focusAsLastInput, focusIsFree } from '../../../utilities/return-focus.js';
import { deepActiveElement } from '../../../utilities/deep-active-element.js';
import type { CompactingBar, NLDDTopTitleBar } from '../../navigation/top-title-bar/top-title-bar.js';

/** What a page measures of its bars and its scroller, before it writes any of it. */
interface PageInsets {
	header: number;
	headerScrolled: number;
	footer: number;
	headerFull: number;
	scroll: number | null;
}

/**
 * Every page in one pass: all of them read, then all of them write. A page per
 * pass reads a layout that the previous page has just made dirty.
 */
function measurePages(pages: NLDDPage[]): void {
	const live = pages.filter((page) => page.isConnected);
	const measured = live.filter((page) => page._insetsReady);
	const insets = measured.map((page) => page._measureInsets());
	measured.forEach((page, i) => page._applyInsets(insets[i]));
	const scroll = live.map((page) => page._readScrollState());
	live.forEach((page, i) => page._applyScrollState(scroll[i]));
}

const insetObserver = sharedResizeObserver<NLDDPage>(measurePages);

/** The first measurement, before the observer's own first report: written
 *  then, the values would resize what it watches inside its own callback. */
const firstMeasurement = new LayoutPass<NLDDPage>(measurePages);

/** Whether an element Tab could land on is one it lands on: an `<a>` without `href` reports a tabIndex of 0. */
function takesTab(element: HTMLElement): boolean {
	if (element.tabIndex < 0 || element.matches(':disabled')) return false;
	if (element.localName === 'a' && !element.hasAttribute('href') && !element.hasAttribute('tabindex')) return false;
	return element.checkVisibility({ visibilityProperty: true });
}

/** Whether what scrolls in a page (all but its header) holds anything Tab lands on, in light or shadow DOM. */
function holdsFocusable(page: Element): boolean {
	const walk = (parent: Element | ShadowRoot): boolean => {
		for (const child of parent.children) {
			if (!(child instanceof HTMLElement) || child.hidden || child.inert) continue;
			if (parent === page && child.slot === 'header') continue;
			if (takesTab(child)) return true;
			if (child.shadowRoot && walk(child.shadowRoot)) return true;
			if (walk(child)) return true;
		}
		return false;
	};
	return walk(page);
}

/** The first element in a page's content (all but its header) that Tab lands on, in light or shadow DOM. */
function firstFocusable(page: Element): HTMLElement | null {
	const walk = (parent: Element | ShadowRoot): HTMLElement | null => {
		for (const child of parent.children) {
			if (!(child instanceof HTMLElement) || child.hidden || child.inert) continue;
			if (parent === page && child.slot === 'header') continue;
			if (takesTab(child)) return child;
			const inner = (child.shadowRoot && walk(child.shadowRoot)) || walk(child);
			if (inner) return inner;
		}
		return null;
	};
	return walk(page);
}

type Landmarks = 'auto' | 'page' | 'region';

/** An overlay is a document of its own, so the page inside it is not the page. */
const OVERLAYS = ['nldd-sheet', 'nldd-modal-dialog', 'nldd-window', 'nldd-popover'];

/** Split views that place pages beside each other; a bar split view does not. */
const PANED_SPLIT_VIEWS = [
	'nldd-navigation-split-view',
	'nldd-side-by-side-split-view',
	'nldd-stacked-split-view',
];

/** Every connected page, so one can see whether another already holds the main. */
const _connectedPages = new Set<NLDDPage>();

@customElement('nldd-page')
export class NLDDPage extends LitElement implements StandaloneScrollLayer {
	static override styles = pageStyles;

	@property({ reflect: true, converter: reflectNonDefault<'inherit' | 'base' | 'tinted'>('inherit') })
	background: 'inherit' | 'base' | 'tinted' = 'inherit';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ reflect: true, converter: reflectNonDefault<Landmarks>('auto') })
	landmarks: Landmarks = 'auto';

	@property({ type: Boolean, reflect: true, attribute: 'sticky-header' })
	stickyHeader = false;

	@property({ type: Boolean, reflect: true, attribute: 'sticky-footer' })
	stickyFooter = false;

	@property({ type: String, reflect: true })
	parent = '';

	@state()
	_scrolled = false;

	/** Scrolled to the end, so nothing runs on under the sticky footer and its
	 *  fade has nothing to fade. @internal */
	@state()
	_atEnd = true;

	/** What `landmarks="auto"` reads off the page's surroundings. */
	@state()
	private _derived: 'page' | 'region' = 'page';
	private _renderedRegion: boolean | null = null;

	/** True when this page renders a section instead of the document landmarks. @internal */
	get _isRegion(): boolean {
		return this.landmarks === 'auto' ? this._derived === 'region' : this.landmarks === 'region';
	}

	/**
	 * Reads whether this page sits somewhere that already has a page: inside an
	 * overlay, or in a pane beside other panes. The first of those an ancestor
	 * matches decides, so a page in a sheet inside a pane is a region for the
	 * sheet's sake.
	 */
	private _deriveLandmarks(): void {
		for (let el = this.parentElement; el; el = el.parentElement) {
			const tag = el.localName;
			if (OVERLAYS.includes(tag) || PANED_SPLIT_VIEWS.includes(tag)) {
				this._derived = 'region';
				return;
			}
		}
		this._derived = 'page';
	}

	/**
	 * A document has one main, and two pages claiming it is invalid HTML that
	 * nothing on screen gives away. Hidden pages count: a pane that is collapsed
	 * at this window width is the same markup at another. Only the page that
	 * arrived later is the second, so one mistake is one fact.
	 */
	private _syncSecondMain(): void {
		if (!import.meta.env?.DEV) return;
		const [, ...rest] = [..._connectedPages].filter((page) => !page._isRegion);
		setState(this, 'second-main', rest.includes(this));
	}

	private _scrollMode: 'nested' | 'root' = 'nested';
	private _scrollTarget: EventTarget | null = null;
	private _scrollProvider: ScrollModeProvider | null = null;
	private _inOverlay = false;
	/** @internal Whether the bars are observed, and so can be measured. */
	_insetsReady = false;
	private _headerFullHeight = 0;
	private _mainSlot: HTMLSlotElement | null = null;
	/** Watches the main children for a `grow` or `hidden` set after they were
	 *  slotted, since that changes which section grows. */
	private _mainAttrObserver: MutationObserver | null = null;
	/** Whether the scroll listener and observer are wired, for the first read. */
	private _scrollConfigured = false;

	private get _isRoot(): boolean {
		return this._scrollMode === 'root';
	}

	get scrollTarget(): HTMLElement {
		if (this._isRoot) return (document.scrollingElement ?? document.documentElement) as HTMLElement;
		return this.stickyHeader ? (this._scrollEl ?? this) : this;
	}

	/**
	 * The target to attach scroll LISTENERS to for this page's scrolling. In root
	 * mode the document is the scroller and its scroll event fires on `window`
	 * (a listener on `document.scrollingElement` would never fire), so this differs
	 * from `scrollTarget` (which is for reading scrollTop). In nested mode the two
	 * are the same. Components that react to this page's scroll (e.g.
	 * nldd-top-title-bar's collapse-anchor) must listen here and measure position
	 * against the viewport.
	 * @internal
	 */
	get scrollEventTarget(): EventTarget {
		if (this._isRoot) return window;
		return this.stickyHeader ? (this._scrollEl ?? this) : this;
	}

	private get _headerEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.page__header') ?? null;
	}

	private get _scrollEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.page__scroll') ?? null;
	}

	private get _footerEl(): HTMLElement | null {
		return this.shadowRoot?.querySelector('.page__footer') ?? null;
	}

	override connectedCallback() {
		super.connectedCallback();
		this._deriveLandmarks();
		_connectedPages.add(this);
		// Inline on the light-DOM host: a container name belongs to the tree it
		// is set in, so a :host rule's name is not found by a query in a
		// section's own shadow root (Safari holds to that, Chromium does not).
		// Content follows layout-container in any surface; only the page
		// sections query page-container, so no container between them counts.
		this.style.containerType = 'inline-size';
		this.style.containerName = 'layout-container page-container';
		this._inOverlay = inOverlay(this);
		this._scrollProvider = findScrollModeProvider(this);
		if (this._scrollProvider) {
			// Push-driven inside a shell: it pushes the authoritative mode on
			// register (and on every change), so the page never self-reads the var.
			// A stale getComputedStyle read while re-mounting on navigation
			// otherwise stuck the page in nested mode (clipped, footer not sticky
			// against the viewport) until a resize.
			this._scrollProvider.registerScrollConsumer(this);
			if (this.hasUpdated) this._configureScroll();
		} else {
			// Stand-alone (docs): the scroll mode flips at a media-query breakpoint,
			// so read the inherited var and re-read on resize. The first read waits
			// for the first render, which has the elements it wires up.
			if (this.hasUpdated) {
				this._scrollConfigured = false;
				addStandaloneScrollLayer(this, this.ownerDocument);
			}
			whenScrollModeProviderDefined(this, this._adoptScrollProvider);
		}
		// Moved in the DOM: `firstUpdated` does not come again, and
		// `disconnectedCallback` took this listener and observer down.
		if (this.hasUpdated) {
			this._setupMainSlotListener();
			this._watchSteps();
		}
		this.addEventListener('back', this._onBack);
		this.addEventListener('click', this._onClick, { capture: true });
	}

	/** Switches from stand-alone to push once a shell (or sheet, or modal
	 *  dialog) that was not yet defined when this page connected, is. */
	private _adoptScrollProvider = (provider: ScrollModeProvider): void => {
		if (this._scrollProvider) return;
		removeStandaloneScrollLayer(this);
		this._scrollProvider = provider;
		provider.registerScrollConsumer(this);
		if (this.hasUpdated) this._configureScroll();
	};

	override disconnectedCallback() {
		super.disconnectedCallback();
		_connectedPages.delete(this);
		firstMeasurement.cancel(this);
		removeStandaloneScrollLayer(this);
		this._scrollProvider?.unregisterScrollConsumer(this);
		this._scrollProvider = null;
		this._teardownScrollListener();
		this._teardownInsetObserver();
		this._teardownMainSlotListener();
		this._stepObserver?.disconnect();
		this._stepObserver = null;
		this.removeEventListener('back', this._onBack);
		this.removeEventListener('click', this._onClick, { capture: true });
	}

	override firstUpdated() {
		// With a provider the mode was already pushed on register (see
		// connectedCallback); only a stand-alone page self-reads the inherited var.
		if (this._scrollProvider) this._configureScroll();
		else addStandaloneScrollLayer(this, this.ownerDocument);
		this._setupMainSlotListener();
		this._watchSteps();
	}

	override updated(changed: PropertyValues) {
		// A switch between page and region renders new chrome, so the observer
		// and listeners still hold the old elements.
		const retagged = this._renderedRegion !== null && this._renderedRegion !== this._isRegion;
		this._renderedRegion = this._isRegion;
		if (retagged) this._setupMainSlotListener();
		if (changed.has('stickyHeader') || (retagged && this._scrollConfigured)) this._configureScroll();
		this._syncSecondMain();
		if (changed.has('parent')) this._watchSteps();
		// Not reflected, so the observer of a step does not see it change.
		if (changed.has('accessibleLabel') && this.id) {
			for (const page of this._siblingPages) if (page.parent === this.id) page._syncBackText();
		}
	}

	/** Where focus goes back to when this page's back button shows its parent. */
	private _focusReturn = new FocusReturn();
	/** The last control clicked in this page, for Safari, where a click does not
	 *  focus a button and there is no focus to remember. */
	private _lastClicked: HTMLElement | null = null;
	/** Watches the pages beside a step, so its back button follows the title of
	 *  its parent page, a title bar added later and a page a framework shows. */
	private _stepObserver: MutationObserver | null = null;

	/** @internal The pages beside this one: same parent, same slot. */
	get _siblingPages(): NLDDPage[] {
		const parent = this.parentElement;
		if (!parent) return [this];
		return [...parent.children].filter((el): el is NLDDPage => el instanceof NLDDPage && el.slot === this.slot);
	}

	/** @internal The page `parent` names, among the pages beside this one. */
	get _parentPage(): NLDDPage | null {
		if (!this.parent) return null;
		return this._siblingPages.find((page) => page !== this && page.id === this.parent) ?? null;
	}

	/** @internal The nldd-top-title-bar in this page's header. */
	get _titleBar(): NLDDTopTitleBar | null {
		const header = this.querySelector<HTMLElement>(':scope > [slot="header"]');
		if (!header) return null;
		if (header.localName === 'nldd-top-title-bar') return header as NLDDTopTitleBar;
		return header.querySelector('nldd-top-title-bar');
	}

	/** @internal What this page is called: its title bar's text, or else its
	 *  label. The attribute first, which is there before the bar is upgraded. */
	get _title(): string {
		const bar = this._titleBar;
		return bar?.getAttribute('text') || bar?.text || this.accessibleLabel;
	}

	/**
	 * Shows this page and hides the pages beside it. When focus was in the page
	 * this one replaces, it moves into this page, and the control that had it is
	 * remembered for the way back.
	 */
	show(): void {
		const siblings = this._siblingPages;
		const current = siblings.find((page) => page !== this && !page.hidden) ?? null;
		const moveFocus = !!current && focusIsFree(current);
		if (current) {
			this._focusReturn.remember(current._lastClicked);
			current._lastClicked = null;
		}
		this._reveal(siblings);
		if (moveFocus) this._focusStart();
	}

	/** Shows this page among its siblings and says so. */
	private _reveal(siblings: NLDDPage[]): void {
		for (const page of siblings) page.hidden = page !== this;
		this._syncBackText();
		this.dispatchEvent(new CustomEvent('show', { bubbles: true }));
	}

	/** Focus into a page that has just been shown: an element with `autofocus`,
	 *  else the first thing Tab lands on in its content, else its back button. */
	private _focusStart(): void {
		void this.updateComplete.then(() => {
			const auto = this.querySelector<HTMLElement>('[autofocus]');
			const target = auto ?? firstFocusable(this) ?? this._titleBar;
			if (target) focusAsLastInput(target);
		});
	}

	private _onClick = (event: Event): void => {
		const target = event.target;
		if (target instanceof HTMLElement && target !== this) this._lastClicked = target;
	};

	/**
	 * Shows the parent page and puts focus back on the control that opened this
	 * step, as the back button does. For a step that ends with a choice, so the
	 * choice goes back the same way. Without a parent page it does nothing.
	 */
	back(): void {
		const parent = this._parentPage;
		if (!parent) return;
		const hadFocus = focusIsFree(this);
		parent._reveal(this._siblingPages);
		if (!hadFocus) return;
		// Opened straight away, the page remembers no control to go back to.
		this._focusReturn.restore(this);
		const active = deepActiveElement();
		if (!active || active === document.body) parent._focusStart();
	}

	/**
	 * The back of this page's own title bar shows the parent page. A back from a
	 * page nested deeper, or from a bar with `back-href`, is not this page's.
	 */
	private _onBack = (event: Event): void => {
		const bar = this._titleBar;
		if (!this._parentPage || !bar || event.composedPath()[0] !== bar || bar.backHref) return;
		event.stopPropagation();
		this.back();
	};

	/** Hands the parent page's title to the title bar, which shows it when it
	 *  has no `back-text` of its own. */
	/** @internal */
	_syncBackText(): void {
		const bar = this._titleBar;
		if (bar) bar._parentPageText = this._parentPage?._title ?? '';
	}

	private _watchSteps(): void {
		this._stepObserver?.disconnect();
		this._stepObserver = null;
		this._syncBackText();
		const container = this.parentElement;
		if (!this.parent || !container) return;
		this._stepObserver = new MutationObserver(() => this._syncBackText());
		this._stepObserver.observe(container, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['text', 'id', 'hidden', 'slot'],
		});
	}

	/**
	 * ScrollModeConsumer: nldd-shell pushes the derived mode here. Called with
	 * no argument (resize / no shell) it re-reads the inherited var. @internal
	 */
	readScrollMode(mode?: ScrollMode): void {
		if (this._readScrollMode(mode) || !this._scrollConfigured) this._configureScroll();
	}

	// Apply the scroll mode; returns true when it changed so callers can
	// reconfigure. With an explicit mode (shell's push) it is applied directly
	// — race-free, unlike a getComputedStyle read mid-propagation. Otherwise the
	// inherited --context-scroll-mode is read (anything but 'root' means nested).
	/** @internal */
	_readScrollMode(mode?: ScrollMode): boolean {
		const next: ScrollMode = this._inOverlay ? 'nested' : mode ?? this.inheritedScrollMode();
		if (next === this._scrollMode) return false;
		this._scrollMode = next;
		this.dataset.scroll = next;
		return true;
	}

	/** @internal The mode the CSS hands down; a style read. */
	inheritedScrollMode(): ScrollMode {
		return getComputedStyle(this).getPropertyValue('--context-scroll-mode').trim() === 'root' ? 'root' : 'nested';
	}

	/** @internal (Re)wires the scroll listener and inset observer for the current mode. */
	_configureScroll() {
		this._scrollConfigured = true;
		this._teardownScrollListener();
		this._setupScrollListener();
		this._headerFullHeight = 0;
		this._setupInsetObserver();
		// The scroll state is read in the first measurement, with the other pages.
		firstMeasurement.schedule(this, this.ownerDocument);
	}

	/**
	 * Publishes the page's own sticky bars as insets, so sticky content inside
	 * the page knows how far to clear.
	 *
	 * Measured rather than assumed: a top title bar shrinks as you scroll past
	 * its anchor, and a consumer that had written the number down would be wrong
	 * from that moment on. A bar that is not sticky scrolls away and adds
	 * nothing, so it stays at zero.
	 *
	 * It also measures the padding the scroll wrapper reserves for an absolute
	 * sticky header. One observer owns both, because two of them writing styles
	 * that resize what the other watches is what leaves ResizeObserver
	 * notifications undelivered.
	 *
	 * The observer is shared by every page, and the first measurement is one
	 * pass for every page that renders in the same tick; see measurePages.
	 */
	private _setupInsetObserver() {
		this._teardownInsetObserver();
		const header = this._headerEl;
		const footer = this._footerEl;
		if (!header || !footer) return;
		this._insetsReady = true;
		insetObserver.observe(header, this);
		insetObserver.observe(footer, this);
		if (this._scrollEl) insetObserver.observe(this._scrollEl, this);
		const main = this.shadowRoot?.querySelector('.page__main');
		if (main) insetObserver.observe(main, this);
	}

	/** @internal Reads the bars and the scroller; writes nothing. */
	_measureInsets(): PageInsets {
		const header = this._headerEl!;
		return {
			header: this.stickyHeader ? header.offsetHeight : 0,
			headerScrolled: this.stickyHeader ? header.offsetHeight + this._measureBarGrowth() : 0,
			footer: this.stickyFooter ? this._footerEl!.offsetHeight : 0,
			headerFull: this._measureHeaderFullHeight(header),
			// How tall the scroller actually is. Sticky content inside it caps its
			// height on what it can see, and while the page owns the scroller that
			// is not the viewport: the chrome around the page eats into it. In root
			// mode the document scrolls, so nothing is published and 100dvh stands.
			scroll: this._isRoot ? null : this._scrollEl?.clientHeight ?? 0,
		};
	}

	/** @internal */
	_applyInsets(insets: PageInsets): void {
		this._publish('--_page-header-height', `${insets.header}px`);
		this._publish('--_page-header-scrolled-height', `${insets.headerScrolled}px`);
		this._publish('--_page-footer-height', `${insets.footer}px`);
		this._publish('--_page-header-full-height', `${insets.headerFull}px`);
		if (insets.scroll === null) this.style.removeProperty('--_page-scroll-height');
		else this._publish('--_page-scroll-height', `${insets.scroll}px`);
	}

	/**
	 * @internal Content that grows or shrinks moves the end without a scroll
	 * event. And a scroller that holds nothing to focus cannot be scrolled with
	 * the keyboard in Safari and Firefox, where Tab never lands in it. It takes a
	 * tab stop of its own then, and only then: with a link or a field in it, Tab
	 * already gets there and the arrow keys scroll. Without a sticky header the
	 * host is the scroller, so the host takes it, and gives back only its own.
	 */
	_readScrollState(): { focusable: boolean } {
		// Read phase: _onScroll reads the scroller and sets reactive state, which
		// Lit renders later. Keep DOM writes out of here.
		this._onScroll();
		const scroller = this.stickyHeader ? this._scrollEl : this;
		const scrolls = !!scroller && !this._isRoot && scroller.scrollHeight > scroller.clientHeight;
		return { focusable: scrolls && !holdsFocusable(this) };
	}

	/** Whether the host's tabindex is the tab stop this page gave itself. */
	private _hostTabStop = false;

	/** @internal */
	_applyScrollState({ focusable }: { focusable: boolean }): void {
		const inner = this._scrollEl;
		const onHost = focusable && !this.stickyHeader;
		if (inner) {
			if (focusable && this.stickyHeader) inner.setAttribute('tabindex', '0');
			else inner.removeAttribute('tabindex');
		}
		if (onHost && !this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0');
			this._hostTabStop = true;
		} else if (!onHost && this._hostTabStop) {
			this.removeAttribute('tabindex');
			this._hostTabStop = false;
		}
	}

	private _teardownInsetObserver() {
		this._insetsReady = false;
		insetObserver.unobserveAll(this);
	}

	/**
	 * Writes a published variable only when it changes. These values size the
	 * elements the observer watches, so a rewrite feeds the callback its own
	 * next notification, which is what Chromium reports as "ResizeObserver
	 * loop completed with undelivered notifications".
	 */
	private _publish(name: string, value: string) {
		if (this.style.getPropertyValue(name) === value) return;
		this.style.setProperty(name, value);
	}

	/**
	 * How much a top title bar in the header still grows once it turns compact.
	 * An anchor or a focused field lies past the bar's collapse anchor, so by the
	 * time it is scrolled into view the bar is compact: the scroll padding takes
	 * that height up front, or the bar grows over what was just scrolled to.
	 * A bar belongs straight in the header slot, so only those are measured.
	 */
	private _measureBarGrowth(): number {
		let growth = 0;
		for (const el of this.querySelectorAll<HTMLElement & Partial<CompactingBar>>(':scope > [slot="header"]')) {
			if (el._compactHeight === undefined) continue;
			growth += Math.max(0, el._compactHeight - el.offsetHeight);
		}
		return growth;
	}

	/**
	 * The header at its full height: the last measurement taken at scroll top.
	 * A top title bar shrinks as you pass its anchor, and the space reserved for
	 * it must not shrink along, or the content it starts under is dragged up
	 * from under the cursor. Which mode reserves that space is the CSS's call.
	 */
	private _measureHeaderFullHeight(header: HTMLElement): number {
		if (!this.stickyHeader) return 0;
		if (this.scrollTarget.scrollTop === 0) this._headerFullHeight = header.offsetHeight;
		return this._headerFullHeight;
	}

	private _setupScrollListener() {
		// Root mode scrolls the document (listen on window); nested mode scrolls
		// the host, or .page__scroll with a sticky header. See scrollEventTarget.
		const target = this.scrollEventTarget;
		target.addEventListener('scroll', this._onScroll, { passive: true });
		this._scrollTarget = target;
	}

	private _teardownScrollListener() {
		if (this._scrollTarget) {
			this._scrollTarget.removeEventListener('scroll', this._onScroll);
			this._scrollTarget = null;
		}
	}

	// Runs in the read phase of the measurement too (_readScrollState): it
	// reads and sets state, and writes nothing to the DOM itself.
	private _onScroll = () => {
		if (this._isRoot) {
			const root = document.documentElement;
			this._scrolled = window.scrollY > 0;
			this._atEnd = window.scrollY + window.innerHeight >= root.scrollHeight - 1;
			return;
		}
		const scroller = (this.stickyHeader ? this._scrollEl : this) as HTMLElement | null;
		this._scrolled = (scroller?.scrollTop ?? 0) > 0;
		this._atEnd = !scroller || scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
	};

	// Mark the section that takes the remaining height with `data-growing`: the
	// visible main-slot children with `grow`, or the last one when none has it.
	// A data attribute rather than a class, since a framework's class binding
	// rewrites `class` and would wipe it, and not `grow` itself, which is the
	// author's to set. Same shape as nldd-list's _updateItems().
	private _setupMainSlotListener() {
		this._teardownMainSlotListener();
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])') ?? null;
		this._mainSlot = slot;
		if (!slot) return;
		slot.addEventListener('slotchange', this._updateMainItems);
		this._mainAttrObserver = new MutationObserver((records) => {
			if (records.some(record => record.target.parentElement === this)) this._updateMainItems();
		});
		this._mainAttrObserver.observe(this, { attributes: true, attributeFilter: ['grow', 'hidden'], subtree: true });
		this._updateMainItems();
	}

	private _teardownMainSlotListener() {
		if (this._mainSlot) {
			this._mainSlot.removeEventListener('slotchange', this._updateMainItems);
			this._mainSlot = null;
		}
		this._mainAttrObserver?.disconnect();
		this._mainAttrObserver = null;
	}

	private _updateMainItems = () => {
		const slot = this._mainSlot;
		if (!slot) return;
		const items = slot.assignedElements() as HTMLElement[];
		const visible = items.filter(el => !el.hasAttribute('hidden'));
		const chosen = visible.filter(el => el.hasAttribute('grow'));
		const growing = chosen.length > 0 ? chosen : visible.slice(-1);
		items.forEach(el => el.toggleAttribute('data-growing', growing.includes(el)));
	};

	override render() {
		return pageTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-page': NLDDPage;
	}
}
