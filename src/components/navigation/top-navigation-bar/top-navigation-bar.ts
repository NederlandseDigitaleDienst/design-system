/**
 * Nederlandse Digitale Dienst Top Navigation Bar Component (Lit + TypeScript)
 *
 * The top bar of a page: a logo bar with the Rijkslogo and an optional
 * wordmark, and below it the main bar with the website title, a back button,
 * the global navigation and the utility navigation. On narrow widths the global
 * navigation moves into a menu sheet behind the menu button.
 *
 * @element nldd-top-navigation-bar
 *
 * @attr {boolean} no-logo - Hides the whole logo bar, wordmark included.
 * @attr {string} logo-title - Title of the wordmark next to the logo. Without it the logo stands alone.
 * @attr {string} logo-subtitle - Subtitle under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-supporting-text-1 - First supporting line under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-supporting-text-2 - Second supporting line under the wordmark title. Only visible when there is a wordmark.
 * @attr {string} logo-href - URL for the logo and wordmark. Without it they are not a link but an image with an accessible label.
 * @attr {string} website-title - Name of the website or application, above the menu bar. Empty leaves the title line out.
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
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';

/** Minimal typed interface for nldd-sheet API. */
interface Sheet extends HTMLElement {
	show(): void;
	hide(): void;
}

/** One entry rendered as a row in the menu sheet — derived from a global
 * menu-bar-item (top level) or a submenu's menu-item (deeper levels). */
interface SheetEntry {
	text: string;
	/** Sanitized href; empty when the row is a button rather than a link. */
	href: string;
	/** Marks the row as the current/selected one. */
	selected: boolean;
	/** Child nldd-menu when this row drills into a deeper level, else null. */
	submenu: Element | null;
	/** Triggers the source item's action — only used for button (non-link,
	 *  non-submenu) rows. */
	activate: () => void;
}

/** One level on the sheet's drill-down stack. `container` is the element whose
 * direct children make up the level: the global nldd-menu-bar at the root, or a
 * nldd-menu submenu deeper in. */
interface SheetLevel {
	title: string;
	container: Element | null;
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

	private _globalMenuSheet: Sheet | null = null;
	private _globalMenuSheetList: HTMLElement | null = null;
	private _globalMenuSheetTitleBar: HTMLElement | null = null;
	/** Drill-down stack for the menu sheet; the last entry is the visible
	 * level. Reset to the root level each time the sheet opens. */
	private _sheetStack: SheetLevel[] = [];

	private _resizeObserver: ResizeObserver | null = null;
	private _compactRAF: number | null = null;
	private _setupRAF: number | null = null;

	// Tracks the accessible-label we last applied to each slotted menu-bar, so
	// our default can follow translation changes while a consumer-set label is
	// left untouched — including one set asynchronously after the first sync.
	private _appliedMenuBarLabels = new WeakMap<NLDDMenuBar, string>();

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (changed.has('translations')) {
			this._globalMenuSheet?.setAttribute('accessible-label', this._menuText);
			this._globalMenuSheetTitleBar?.setAttribute('dismiss-text', this._t('components.top-navigation-bar.menu-sheet-dismiss-action'));
			// Keep the sheet's root-level title in sync with the translated menu
			// label, then re-render so the visible level — and any back button
			// pointing at the root — picks it up.
			if (this._sheetStack.length > 0) {
				this._sheetStack[0].title = this._menuText;
				this._renderSheetLevel();
			}
			this._syncSlottedMenuBarLabels();
		}
		if (changed.has('width')) {
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_max-width', w);
			} else {
				this.style.removeProperty('--_max-width');
			}
		}
	}

	// ## Slotted menu-bars

	/** Items live inside the consumer-supplied <nldd-menu-bar> in the given slot. */
	private _getSlottedMenuBar(slot: HTMLSlotElement | undefined): NLDDMenuBar | null {
		const assigned = slot?.assignedElements({ flatten: true }) ?? [];
		return (assigned.find(el => el.tagName === 'NLDD-MENU-BAR') as NLDDMenuBar | undefined) ?? null;
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
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('select', this._handleItemSelect);
		this._cleanupCompactDetection();
		// remove() detaches the sheet from DOM; browser GC handles remaining references
		this._globalMenuSheet?.remove();
		this._globalMenuSheet = null;
		this._globalMenuSheetList = null;
		this._globalMenuSheetTitleBar = null;
		this._sheetStack = [];
	}

	override firstUpdated(): void {
		// Sync has-global-items immediately to prevent layout flash
		this._syncHasGlobalItems();
		this._setupCompactDetection();
	}

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
		return container.clientWidth <= parseInt(breakpoints.smMax);
	}

	// ## Menu sheet

	private async _loadGlobalMenuSheetDependencies(): Promise<void> {
		await Promise.all([
			import('../../layout/sheet/sheet.js'),
			import('../../layout/page/page.js'),
			import('../../layout/page-sections/simple-section/simple-section.js'),
			import('../../navigation/top-title-bar/top-title-bar.js'),
			import('../../lists-and-tables/list/list.js'),
			import('../../lists-and-tables/list-item/list-item.js'),
			import('../../lists-and-tables/cells/text-cell/text-cell.js'),
			import('../../lists-and-tables/cells/icon-cell/icon-cell.js'),
			import('../../content/icon/icon.js'),
		]);
	}

	private _createGlobalMenuSheet(): Sheet {
		const sheet = document.createElement('nldd-sheet') as unknown as Sheet;
		sheet.setAttribute('placement', 'left');
		sheet.setAttribute('accessible-label', this._t('components.top-navigation-bar.menu-action'));

		const page = document.createElement('nldd-page');
		page.setAttribute('sticky-header', '');

		const titleBar = document.createElement('nldd-top-title-bar');
		titleBar.setAttribute('slot', 'header');
		titleBar.setAttribute('dismiss-text', this._t('components.top-navigation-bar.menu-sheet-dismiss-action'));
		// The back button (rendered by _renderSheetLevel on deeper levels) walks
		// one level up. nldd-sheet already handles the `dismiss` event itself;
		// `back` is ours, so listen for it directly on the title bar. Its title
		// (`text`) and `back-text` are set per level in _renderSheetLevel.
		titleBar.addEventListener('back', this._onSheetBack);
		this._globalMenuSheetTitleBar = titleBar;
		page.appendChild(titleBar);

		const section = document.createElement('nldd-simple-section');

		this._globalMenuSheetList = document.createElement('nldd-list');
		this._globalMenuSheetList.setAttribute('variant', 'simple');
		this._globalMenuSheetList.setAttribute('dividers', 'never');
		section.appendChild(this._globalMenuSheetList);

		page.appendChild(section);
		sheet.appendChild(page);
		document.body.appendChild(sheet);
		return sheet;
	}

	/** Reset the sheet to its root level (the global menu-bar) and render it.
	 * Called every time the sheet opens, so a reopened sheet always starts at
	 * the top regardless of where the user drilled to last time. */
	private _resetSheetToRoot(): void {
		this._sheetStack = [{ title: this._menuText, container: this._getSlottedMenuBar(this._globalSlot) }];
		this._renderSheetLevel();
	}

	/** Back button: pop one drill-down level and re-render, moving focus into
	 * the now-visible parent level. */
	private _onSheetBack = (): void => {
		if (this._sheetStack.length <= 1) return;
		// The popped level's title is the text of the row that opened it; pass it
		// so focus returns to that row (APG menu pattern), not the first one.
		const openerText = this._sheetStack[this._sheetStack.length - 1].title;
		this._sheetStack.pop();
		this._renderSheetLevel(true, openerText);
	};

	/** Read the rows for a level from its container — the global menu-bar's
	 * menu-bar-items at the root, or a submenu's menu-items deeper in. */
	private _readSheetEntries(container: Element | null): SheetEntry[] {
		if (!container) return [];

		if (container.tagName === 'NLDD-MENU-BAR') {
			const items = Array.from(container.querySelectorAll(':scope > nldd-menu-bar-item')) as NLDDMenuBarItem[];
			return items.map(item => ({
				text: item.text,
				href: sanitizeUrl(item.href) ?? '',
				selected: item.current,
				submenu: item.querySelector(':scope > nldd-menu'),
				activate: () => item.click(),
			}));
		}

		// A submenu: its own menu-items (also those wrapped in a group). Reading
		// is enough — the source nldd-menu is never moved, so the desktop
		// popover it also serves stays intact.
		const items = Array.from(
			container.querySelectorAll(':scope > nldd-menu-item, :scope > nldd-menu-group > nldd-menu-item'),
		) as HTMLElement[];
		return items.map(item => ({
			text: (item as { text?: string }).text || item.getAttribute('text') || '',
			href: sanitizeUrl((item as { href?: string }).href || '') ?? '',
			selected: item.hasAttribute('selected'),
			submenu: item.querySelector(':scope > nldd-menu'),
			// A leaf menu-item's own click would call hidePopover() on its
			// (closed) submenu and throw; dispatch the same `select` event it
			// fires instead, so consumer listeners react without the popover call.
			activate: () => item.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true })),
		}));
	}

	/** Render the current (top-of-stack) level into the sheet: update the title
	 * bar (title + back button) and rebuild the list. Pass `moveFocus` after a
	 * drill or back so focus lands on the new level's first row. */
	private _renderSheetLevel(moveFocus = false, focusOpenerText?: string): void {
		const list = this._globalMenuSheetList;
		const titleBar = this._globalMenuSheetTitleBar;
		if (!list || !titleBar || this._sheetStack.length === 0) return;

		const depth = this._sheetStack.length;
		const level = this._sheetStack[depth - 1];

		titleBar.setAttribute('text', level.title);
		if (depth > 1) {
			// The title-bar convention is that the back button shows the
			// previous level's title (e.g. "Menu").
			titleBar.setAttribute('back-text', this._sheetStack[depth - 2].title);
		} else {
			titleBar.removeAttribute('back-text');
		}

		list.replaceChildren();
		let openerItem: HTMLElement | null = null;
		for (const entry of this._readSheetEntries(level.container)) {
			const listItem = document.createElement('nldd-list-item');
			const textCell = document.createElement('nldd-text-cell');
			textCell.setAttribute('text', entry.text);
			listItem.appendChild(textCell);

			if (entry.submenu) {
				// Drill-in row: a button with a trailing chevron that pushes the
				// submenu as the next level.
				listItem.setAttribute('button', '');
				const chevron = document.createElement('nldd-icon-cell');
				chevron.setAttribute('icon', 'chevron-right-small');
				listItem.appendChild(chevron);
				const { text, submenu } = entry;
				listItem.addEventListener('click', () => {
					this._sheetStack.push({ title: text, container: submenu });
					this._renderSheetLevel(true);
				});
			} else if (entry.href) {
				listItem.setAttribute('href', entry.href);
				listItem.addEventListener('click', () => this._globalMenuSheet?.hide());
			} else {
				listItem.setAttribute('button', '');
				const { activate } = entry;
				listItem.addEventListener('click', () => {
					activate();
					this._globalMenuSheet?.hide();
				});
			}
			if (entry.selected) listItem.setAttribute('selected', '');
			if (focusOpenerText !== undefined && entry.text === focusOpenerText) openerItem = listItem;

			list.appendChild(listItem);
		}

		if (moveFocus) {
			// nldd-list-item overrides focus() to delegate to its inner button/
			// anchor, so this lands on the actionable element (keyboard a11y). On
			// back, focus the row that opened the sub-level; otherwise the first.
			requestAnimationFrame(() => {
				(openerItem ?? list.querySelector<HTMLElement>('nldd-list-item'))?.focus();
			});
		}
	}

	/** @internal Used by template */
	_onMenuButtonClick = async (): Promise<void> => {
		if (!this._globalMenuSheet) {
			try {
				await this._loadGlobalMenuSheetDependencies();
			} catch (error) {
				if (import.meta.env?.DEV) {
					console.error('nldd-top-navigation-bar: failed to load menu sheet dependencies', error);
				}
				return;
			}
			if (!this.isConnected) return; // guard against disconnect during async load
			if (this._globalMenuSheet) return; // guard against double-click race
			this._globalMenuSheet = this._createGlobalMenuSheet();
			const menuButtonItem = this._menuButton?.querySelector('nldd-menu-bar-item');
			this._globalMenuSheet.addEventListener('open', () => {
				if (menuButtonItem) (menuButtonItem as NLDDMenuBarItem).expanded = true;
			});
			this._globalMenuSheet.addEventListener('close', () => {
				if (menuButtonItem) (menuButtonItem as NLDDMenuBarItem).expanded = false;
			});
		}
		this._resetSheetToRoot();
		// Defer show() so the current click event completes before the modal backdrop appears
		requestAnimationFrame(() => {
			this._globalMenuSheet?.show();
		});
	};

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
