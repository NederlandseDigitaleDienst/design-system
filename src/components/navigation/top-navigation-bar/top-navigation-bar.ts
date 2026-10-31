/**
 * Nederlandse Digitale Dienst Top Navigation Bar Component (Lit + TypeScript)
 *
 * The top bar of a page: a logo bar with the Rijkslogo and an optional
 * wordmark, and below it the main bar with the website title, a back button,
 * the global navigation and the utility navigation. On narrow widths the global
 * navigation moves into a menu sheet behind the menu button.
 *
 * The top bar of a website, and of nothing else: put it in the `header` slot
 * of an `nldd-page`. Do not combine it with a split view. A split view is the
 * layout of an application, whose panes carry a bar of their own, usually an
 * `nldd-toolbar`, and a site header above it gives a second layer of
 * navigation and a second thing that scrolls. Does a page need a sidebar under
 * this bar, use an `nldd-sidebar-section` inside that `nldd-page`.
 *
 * @element nldd-top-navigation-bar
 *
 * @attr {boolean} no-logo - Hides the whole logo bar, wordmark included.
 * @attr {string} logo-title - Title of the wordmark next to the logo. Without it the logo stands alone.
 * @attr {string} logo-subtitle - Subtitle under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-supporting-text-1 - First supporting line under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-supporting-text-2 - Second supporting line under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-href - URL for the logo and wordmark. Without it they are not a link but an image with an accessible label. Leave it out when `website-href` already goes to the same page: two links to the start page side by side are two tab stops and the same link twice in a screen reader's list of links.
 * @attr {string} website-title - Name of the website or application, above the menu bar. Empty leaves the title line out. On a narrow screen, where it has a line of its own, a long name wraps; on md and lg it sits beside the menu on one line, so keep it short enough to fit there.
 * @attr {string} website-href - URL for the website title. Without it the title stays plain text.
 * @attr {string} back-href - URL of the back button. Without it a click fires the `back-click` event, so the consumer navigates itself.
 * @attr {string} back-text - Text of the back button. The button appears as soon as back-text or back-href is set; without text it falls back to the translation ("Terug").
 * @attr {string} width - Limits the bar content to a max-width so it lines up with the page sections. 'full' fills the entire width, or pass your own CSS length.
 *
 * @slot global - The global navigation: an nldd-menu-bar with nldd-menu-bar-item elements. On narrow widths these items move into the menu sheet behind the menu button.
 * @slot utility - The utility navigation, such as search and language: an nldd-menu-bar with nldd-menu-bar-item elements. Stays in the bar on every width.
 */

import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { topNavigationBarStyles } from './top-navigation-bar.styles.js';
import { template } from './top-navigation-bar.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddTopNavigationBarTranslations, type NLDDTopNavigationBarTranslations } from './top-navigation-bar.i18n.js';
import '../menu-bar-item/menu-bar-item.js';
import { NLDDMenuBarItem } from '../menu-bar-item/menu-bar-item.js';
import '../menu-bar/menu-bar.js';
import { NLDDMenuBar } from '../menu-bar/menu-bar.js';
import '../../content/icon/icon.js';
import { breakpointPx } from '../../../assets/styles/breakpoints.js';
import { TopNavigationMenuSheet } from './top-navigation-bar.menu-sheet.js';
import { setState } from '../../../utilities/element-state.js';

/** The absolute URL an href goes to; an anchor resolves it without throwing. */
function resolvedHref(href: string): string {
	const anchor = document.createElement('a');
	anchor.href = href;
	return anchor.href;
}

// # nldd-top-navigation-bar

@customElement('nldd-top-navigation-bar')
export class NLDDTopNavigationBar extends withTranslations(LitElement, nlddTopNavigationBarTranslations) {
	static override styles = topNavigationBarStyles;

	// ## Main properties

	@property({ reflect: true, attribute: 'website-title', converter: reflectNonDefault<string>('') })
	websiteTitle = '';

	@property({ type: Boolean, attribute: 'no-logo', reflect: true })
	noLogo = false;

	/**
	 * Caps the bar content to a max-width so it lines up with page-section
	 * content. `full` spans the full width; any CSS length overrides the default.
	 */
	@property({ type: String, reflect: true })
	width = '';

	// ## Logo properties

	@property({ reflect: true, attribute: 'logo-title', converter: reflectNonDefault<string>('') })
	logoTitle = '';

	@property({ reflect: true, attribute: 'logo-subtitle', converter: reflectNonDefault<string>('') })
	logoSubtitle = '';

	@property({ reflect: true, attribute: 'logo-supporting-text-1', converter: reflectNonDefault<string>('') })
	logoSupportingText1 = '';

	@property({ reflect: true, attribute: 'logo-supporting-text-2', converter: reflectNonDefault<string>('') })
	logoSupportingText2 = '';

	// ## Link properties

	@property({ type: String, attribute: 'logo-href' })
	logoHref = '';

	@property({ type: String, attribute: 'website-href' })
	websiteHref = '';

	// ## Back button properties

	@property({ type: String, attribute: 'back-href' })
	backHref = '';

	@property({ reflect: true, attribute: 'back-text', converter: reflectNonDefault<string>('') })
	backText = '';

	// ## Internal state

	@query('.top-navigation-bar__menu-button')
	private _menuButton!: HTMLElement;

	@query('slot[name="global"]')
	private _globalSlot!: HTMLSlotElement;

	@query('slot[name="utility"]')
	private _utilitySlot!: HTMLSlotElement;

	/** The menu on a narrow screen (top-navigation-bar.menu-sheet.ts). @internal */
	readonly _menuSheet = new TopNavigationMenuSheet(this);

	private _resizeObserver: ResizeObserver | null = null;
	private _compactRAF: number | null = null;
	private _setupRAF: number | null = null;

	// Tracks the accessible-label we last applied to each slotted menu-bar, so
	// our default can follow translation changes while a consumer-set label is
	// left untouched — including one set asynchronously after the first sync.
	private _appliedMenuBarLabels = new WeakMap<NLDDMenuBar, string>();

	private _appliedTexts: string | null = null;

	/** The texts this bar puts on elements it does not render itself, as one string. */
	private _translatedTexts(): string {
		return [
			this._menuText,
			this._t('components.top-navigation-bar.menu-sheet-dismiss-action'),
			this._t('components.top-navigation-bar.global-menu-bar-label'),
			this._t('components.top-navigation-bar.utility-menu-bar-label'),
		].join('\n');
	}

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		setState(this, 'same-href', Boolean(this.logoHref) && Boolean(this.websiteHref)
			&& resolvedHref(this.logoHref) === resolvedHref(this.websiteHref));
		// Not only on `translations`: setTranslations() re-renders without it.
		const texts = this._translatedTexts();
		if (texts !== this._appliedTexts) {
			this._appliedTexts = texts;
			this._menuSheet.applyTexts();
			this._syncSlottedMenuBarLabels();
		}
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_top-navigation-bar-max-width', w);
			} else {
				this.style.removeProperty('--_top-navigation-bar-max-width');
			}
		}
	}

	// ## Slotted menu-bars

	/** Items live inside the consumer-supplied <nldd-menu-bar> in the given slot. */
	private _getSlottedMenuBar(slot: HTMLSlotElement | undefined): NLDDMenuBar | null {
		const assigned = slot?.assignedElements({ flatten: true }) ?? [];
		return (assigned.find(el => el.tagName === 'NLDD-MENU-BAR') as NLDDMenuBar | undefined) ?? null;
	}

	/** @internal The consumer's global menu bar, for the menu sheet. */
	get _globalMenuBar(): NLDDMenuBar | null {
		return this._getSlottedMenuBar(this._globalSlot);
	}

	private _getSlottedItems(slot: HTMLSlotElement | undefined): NLDDMenuBarItem[] {
		const menuBar = this._getSlottedMenuBar(slot);
		if (!menuBar) return [];
		return Array.from(menuBar.querySelectorAll(':scope > nldd-menu-bar-item')) as NLDDMenuBarItem[];
	}

	private _syncSlottedMenuBarLabels(): void {
		// Apply a default accessible-label that follows translation changes,
		// but back off the moment the consumer owns the label.
		type LabelKey = keyof NLDDTopNavigationBarTranslations;
		const setDefault = (menuBar: NLDDMenuBar | null, labelKey: LabelKey) => {
			if (!menuBar) return;
			const current = menuBar.getAttribute('accessible-label');
			const ourLast = this._appliedMenuBarLabels.get(menuBar);
			// Consumer owns the label if they set one we never applied, or
			// changed it away from our last applied value (even asynchronously
			// after the first sync). Stop managing it in both cases.
			if (current !== null && current !== ourLast) {
				this._appliedMenuBarLabels.delete(menuBar);
				return;
			}
			const next = this._t(labelKey);
			menuBar.setAttribute('accessible-label', next);
			this._appliedMenuBarLabels.set(menuBar, next);
		};
		setDefault(this._getSlottedMenuBar(this._globalSlot), 'components.top-navigation-bar.global-menu-bar-label');
		setDefault(this._getSlottedMenuBar(this._utilitySlot), 'components.top-navigation-bar.utility-menu-bar-label');
	}

	// ## Computed properties

	/** @internal Used by template */
	get _hasBackButton(): boolean {
		return Boolean(this.backHref || this.backText);
	}

	/** @internal Used by template */
	get _backText(): string {
		return this.backText || this._t('components.top-navigation-bar.back-action');
	}

	/** @internal Used by template */
	get _menuText(): string {
		return this._t('components.top-navigation-bar.menu-action');
	}

	// ## Lifecycle

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('select', this._handleItemSelect);
		window.addEventListener('scroll', this._syncLogoOffset, { passive: true });
		window.addEventListener('resize', this._syncLogoOffset, { passive: true });
		// Here and not in firstUpdated: disconnecting takes it down, and a bar
		// moved in the DOM or kept by a framework connects again without a first
		// update, so it would no longer turn compact on a narrow screen.
		this._setupCompactDetection();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('select', this._handleItemSelect);
		window.removeEventListener('scroll', this._syncLogoOffset);
		window.removeEventListener('resize', this._syncLogoOffset);
		this._cleanupCompactDetection();
		this._menuSheet.remove();
	}

	override firstUpdated(): void {
		// Sync has-global-items immediately to prevent layout flash
		this._syncHasGlobalItems();
		this._syncLogoOffset();
	}

	/**
	 * How far the logo sits below the top of the page, so the ribbon drawn above
	 * it starts at the top of the page and not over a bar above this one. Only
	 * read while the page is at the top, which is the only time it shows.
	 */
	private _syncLogoOffset = (): void => {
		if (window.scrollY > 0) return;
		const logo = this.shadowRoot?.querySelector('.top-navigation-bar__logo');
		if (!logo) return;
		const offset = Math.max(0, Math.round(logo.getBoundingClientRect().top + window.scrollY));
		this.style.setProperty('--_top-navigation-bar-logo-offset', `${offset}px`);
	};

	/**
	 * Handles selection of global menu items.
	 * Sets `current` on the clicked item and removes it from siblings.
	 * Dispatches `itemselect` event so consumers can override or react.
	 * To manage state externally, listen for `itemselect` and call
	 * `event.preventDefault()` to prevent automatic current management.
	 */
	private _handleItemSelect = (event: Event): void => {
		const detail = (event as CustomEvent).detail;
		if (!detail?.item) return;
		const globalItems = this._getSlottedItems(this._globalSlot);
		if (!globalItems.includes(detail.item)) return;

		const selectEvent = new CustomEvent('itemselect', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail,
		});
		this.dispatchEvent(selectEvent);

		if (!selectEvent.defaultPrevented) {
			detail.item.current = true;
			globalItems.forEach(item => {
				if (item !== detail.item) {
					item.removeAttribute('current');
				}
			});
		}
	};

	// ## Compact attribute propagation

	private _setupCompactDetection(): void {
		this._cleanupCompactDetection();
		this._setupRAF = requestAnimationFrame(() => {
			this._setupRAF = null;
			if (!this.isConnected) return;
			this._resizeObserver = new ResizeObserver(() => {
				this._scheduleCompactUpdate();
			});
			this._resizeObserver.observe(this);
			this._scheduleCompactUpdate();
		});
	}

	private _cleanupCompactDetection(): void {
		if (this._setupRAF) {
			cancelAnimationFrame(this._setupRAF);
			this._setupRAF = null;
		}
		if (this._compactRAF) {
			cancelAnimationFrame(this._compactRAF);
			this._compactRAF = null;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}
	}

	/** @internal Used by template */
	_onGlobalSlotChange = (): void => {
		this._syncHasGlobalItems();
		this._syncSlottedMenuBarLabels();
		this._syncCompactAttribute();
	};

	/** @internal Used by template */
	_onUtilitySlotChange = (): void => {
		this._syncSlottedMenuBarLabels();
		this._syncCompactAttribute();
	};

	private _scheduleCompactUpdate = (): void => {
		if (this._compactRAF) cancelAnimationFrame(this._compactRAF);
		this._compactRAF = requestAnimationFrame(() => {
			this._syncCompactAttribute();
		});
	};

	/** Update has-global-items class on host based on global slot content. */
	private _syncHasGlobalItems(): void {
		this.classList.toggle('has-global-items', this._getSlottedItems(this._globalSlot).length > 0);
	}

	/** Propagate compact to menu-bars and internal items when container is sm. */
	private _syncCompactAttribute(): void {
		const isCompact = this._isSmBreakpoint();

		// Slotted menu-bars (consumer-supplied)
		const slottedMenuBars = [
			this._getSlottedMenuBar(this._globalSlot),
			this._getSlottedMenuBar(this._utilitySlot),
		].filter((mb): mb is NLDDMenuBar => mb !== null);
		for (const menuBar of slottedMenuBars) {
			menuBar.toggleAttribute('compact', isCompact);
			menuBar.requestOverflowUpdate();
		}

		// Internal items not inside a menu-bar (menu-button, back-button)
		const internalItems = this.shadowRoot?.querySelectorAll('nldd-menu-bar-item') ?? [];
		for (const item of internalItems) {
			item.toggleAttribute('compact', isCompact);
		}

		this._syncHasGlobalItems();
	}

	/** Check if the container is at the sm breakpoint (<= smMax). */
	private _isSmBreakpoint(): boolean {
		const container = this.shadowRoot?.querySelector('.top-navigation-bar') as HTMLElement;
		if (!container) return false;
		return container.clientWidth <= breakpointPx('smMax');
	}

	// ## Menu sheet

	/** @internal Used by template */
	_onMenuButtonClick = (): Promise<void> =>
		this._menuSheet.open(this._menuButton?.querySelector('nldd-menu-bar-item') ?? null);

	// ## Back button

	/** @internal Used by template */
	_handleBackClick = (e: Event): void => {
		if (!this.backHref) {
			e.preventDefault();
			this.dispatchEvent(
				new CustomEvent('back-click', {
					bubbles: true,
					composed: true,
				})
			);
		}
	};

	// ## Render

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-top-navigation-bar': NLDDTopNavigationBar;
	}
}
