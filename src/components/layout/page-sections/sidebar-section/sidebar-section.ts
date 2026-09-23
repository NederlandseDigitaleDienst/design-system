/**
 * Nederlandse Digitale Dienst Sidebar Section Component (Lit + TypeScript)
 *
 * A page section with a left sidebar alongside the main content.
 *
 * - **Wide (section >= 1008px):** two columns. The sidebar is a sticky, scrollable
 *   tinted box (max-width 320px) beside the main content. Its sticky top/bottom insets
 *   default to 16px; override with `sticky-top` / `sticky-bottom` so it clears
 *   other sticky page elements (e.g. a sticky header).
 * - **Narrow (section < 1008px):** the sidebar collapses behind a sheet (a left panel on
 *   md+ viewports, a bottom sheet on mobile), and the host reflects a `collapsed`
 *   attribute. The consumer owns the trigger: place
 *   any chrome (a button, a chosen-filters bar, …) wherever you want, show it only
 *   while collapsed (e.g. `nldd-sidebar-section[collapsed] .my-trigger { … }` or by
 *   reading `collapsed` / listening to `collapse-change`), and call `show()` /
 *   `toggle()` to open the sheet. Bind `aria-expanded` via the `open`/`close` events.
 *   The sheet gets a sticky title bar by default — the `sidebar-label` as title plus a
 *   "Sluit" button — overridable via the `sheet-top-title-bar` slot.
 *
 * The sidebar content lives in `slot="sidebar"`. Its slot outlet moves between the
 * box (expanded) and the sheet (collapsed) so there is a single, never-duplicated
 * copy — the light DOM (and its state) is preserved across the switch.
 *
 * The box <-> sheet switch follows the section's OWN width (a ResizeObserver on the
 * host), not the viewport — so a sidebar-section in a narrow column or a split-view
 * pane collapses to the sheet just like one in a narrow viewport, and the sidebar
 * never stacks above or crowds the main. Set `no-collapse` to opt out: a narrow
 * section then stacks the sidebar (full-width) above the main instead of using a sheet.
 *
 * Inherits block `padding` and `height` from PageSectionMixin.
 *
 * @element nldd-sidebar-section
 *
 * @attr {string} [width] - Body max-width: 'full' removes the constraint; any CSS length overrides the default.
 * @attr {string} [sidebar-label] - Accessible name for the sidebar (the aside landmark on lg and the sheet on sm/md). Default 'Zijbalk'.
 * @attr {object} [translations] - Override translation keys (sheet title fallback, dismiss label); unset keys fall back to Dutch.
 * @attr {boolean} [no-collapse] - Opt out of the sheet: a narrow section stacks the sidebar above the main instead of collapsing. `collapsed` then stays false.
 * @attr {string} [sticky-top] - Sticky top inset on lg (CSS length; default = 16px).
 * @attr {string} [sticky-bottom] - Sticky bottom inset on lg (CSS length; default = 16px).
 * @attr {boolean} [collapsed] - Read-only, reflected: true while the sidebar is a sheet (the section is narrower than lg). Target it via CSS to reveal sheet-only chrome.
 *
 * @slot - Main content
 * @slot sidebar - Sidebar content (sticky box when expanded, a left/bottom sheet when collapsed). The box and the sheet add no padding of their own — wrap the content in a padded container (e.g. nldd-container) for inset spacing.
 * @slot sheet-top-title-bar - Replaces the sheet's default title bar (when collapsed). Empty falls back to an `nldd-top-title-bar` with the `sidebar-label` as title and a "Sluit" button.
 * @slot header - Content above the columns
 * @slot footer - Content below the columns
 *
 * @fires open - The sidebar sheet opened.
 * @fires close - The sidebar sheet closed.
 * @fires collapse-change - The collapsed state flipped because the section's width crossed the lg breakpoint; `{ collapsed }`.
 *
 * @method show() - Opens the sidebar sheet (collapsed only; no-op on lg).
 * @method hide() - Closes the sidebar sheet.
 * @method toggle() - Opens or closes the sidebar sheet (collapsed only).
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageSectionMixin } from '../../../../utilities/page-section-mixin.js';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';
import { sidebarSectionStyles } from './sidebar-section.styles.js';
import { sidebarSectionTemplate } from './sidebar-section.template.js';
import { nlddSidebarSectionTranslations } from './sidebar-section.i18n.js';
import '../../sheet/sheet.js';
import '../../page/page.js';
import '../../../navigation/top-title-bar/top-title-bar.js';
import type { NLDDSheet } from '../../sheet/sheet.js';

@customElement('nldd-sidebar-section')
export class NLDDSidebarSection extends PageSectionMixin(LitElement) {
	static override styles = sidebarSectionStyles;

	@property({ type: String, reflect: true })
	width = '';

	@property({ type: String, attribute: 'sidebar-label' })
	sidebarLabel = '';

	/** Override translation keys (sheet title fallback and dismiss label); unset keys fall back to Dutch. */
	@property({ type: Object })
	translations: Partial<typeof nlddSidebarSectionTranslations> = {};

	@property({ type: Boolean, reflect: true, attribute: 'no-collapse' })
	noCollapse = false;

	@property({ type: String, reflect: true, attribute: 'sticky-top' })
	stickyTop = '';

	@property({ type: String, reflect: true, attribute: 'sticky-bottom' })
	stickyBottom = '';

	@property({ type: Boolean, reflect: true })
	collapsed = false;

	@query('.sidebar-section__sheet')
	private _sheet?: NLDDSheet;

	private _ro?: ResizeObserver;
	private readonly _lgMin = parseInt(breakpoints.lgMin, 10);
	private _hasMeasured = false;
	private _sheetOpen = false;

	get _resolvedSidebarLabel(): string {
		return this.sidebarLabel || this._t('components.sidebar-section.sidebar-label');
	}

	/** Dismiss-button label for the sheet's default title bar (i18n). */
	get _sheetDismissText(): string {
		return this._t('components.sidebar-section.sheet-dismiss-action');
	}

	private _t(key: keyof typeof nlddSidebarSectionTranslations): string {
		return this.translations[key] ?? nlddSidebarSectionTranslations[key];
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// Collapse on the section's OWN width, not the viewport, so it adapts to
		// whatever space it's placed in (a narrow column, a split-view pane, …).
		this._ro = new ResizeObserver(this._onResize);
		this._ro.observe(this);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._ro?.disconnect();
		this._ro = undefined;
		this._hasMeasured = false;
	}

	override firstUpdated(): void {
		// Seed the collapsed state from the rendered width before the first paint,
		// so there's no flash of the wrong layout; the ResizeObserver owns it after.
		this._applyCollapsed(this.clientWidth, false);
	}

	private _onResize = (entries: ResizeObserverEntry[]): void => {
		const entry = entries[0];
		const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
		// The first delivery is the initial measurement, not a breakpoint crossing.
		const announce = this._hasMeasured;
		this._hasMeasured = true;
		this._applyCollapsed(width, announce);
	};

	private _applyCollapsed(width: number, announce: boolean): void {
		// no-collapse opts out of the sheet entirely — the sidebar stacks instead.
		const next = width < this._lgMin && !this.noCollapse;
		if (next === this.collapsed) return;
		this.collapsed = next;
		if (announce) {
			this.dispatchEvent(new CustomEvent('collapse-change', {
				detail: { collapsed: next },
				bubbles: true,
				composed: true,
			}));
		}
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (changed.has('width')) {
			const w = this.width;
			// 'full' is handled by CSS (--_max-width: none); CSS lengths feed the var.
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_max-width', w);
			} else {
				this.style.removeProperty('--_max-width');
			}
		}
		if (changed.has('stickyTop')) this._applyInset('--_sticky-top', this.stickyTop);
		if (changed.has('stickyBottom')) this._applyInset('--_sticky-bottom', this.stickyBottom);
		// Toggling no-collapse flips whether a narrow section collapses — re-evaluate.
		if (changed.has('noCollapse')) this._applyCollapsed(this.clientWidth, false);
		// Expanding to the box (lg) moves the sidebar slot out of the sheet, so close
		// any open sheet rather than leave an empty modal behind.
		if (changed.has('collapsed') && !this.collapsed) this._sheet?.hide();
	}

	private _applyInset(name: string, value: string): void {
		if (value && CSS.supports('top', value)) {
			this.style.setProperty(name, value);
		} else {
			this.style.removeProperty(name);
		}
	}

	/** Opens the sidebar sheet. No-op on lg, where the sidebar is always visible. */
	show(): void {
		if (!this.collapsed) return;
		this._sheet?.show();
	}

	/** Closes the sidebar sheet. */
	hide(): void {
		this._sheet?.hide();
	}

	/** Opens or closes the sidebar sheet. No-op on lg. */
	toggle(): void {
		if (!this.collapsed) return;
		if (this._sheetOpen) this._sheet?.hide();
		else this._sheet?.show();
	}

	// Track open state for toggle(); the open/close events still bubble out to the
	// consumer (for aria-expanded) — these handlers don't stop them.
	_onSheetOpen = (): void => { this._sheetOpen = true; };
	_onSheetClose = (): void => { this._sheetOpen = false; };

	override render() {
		return sidebarSectionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-sidebar-section': NLDDSidebarSection;
	}
}
