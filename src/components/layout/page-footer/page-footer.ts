/**
 * Nederlandse Digitale Dienst Page Footer Component (Lit + TypeScript)
 *
 * The footer band at the bottom of a page. Hosts three optional rows in a
 * fixed order: breadcrumbs (top), consumer-defined main content (middle),
 * and a legal-bar (bottom). Dividers are drawn automatically between
 * non-empty rows. Establishes its own container query
 * (`page-footer-container`) so the responsive padding and gap react to the
 * footer's own width, not the viewport.
 *
 * The host has `id="page-footer"` so a skip-link can target it directly.
 *
 * Use the sub-components `nldd-page-footer-legal-bar` and
 * `nldd-page-footer-legal-bar-item` for the bottom row.
 *
 * @element nldd-page-footer
 *
 * @attr {string} [width] - Body max-width, mirroring a page section: 'full' removes the constraint so the content spans the full width; any CSS length (e.g. '480px') overrides the default max-width.
 *
 * @slot breadcrumbs - `nldd-breadcrumbs` for the top row.
 * @slot - Main footer content (typically a container with a grid of link columns).
 * @slot legal-bar - `nldd-page-footer-legal-bar` for the bottom row.
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import {
	pageFooterStyles,
	pageFooterLegalBarStyles,
	pageFooterLegalBarItemStyles,
} from './page-footer.styles.js';
import {
	pageFooterTemplate,
	pageFooterLegalBarTemplate,
	pageFooterLegalBarItemTemplate,
} from './page-footer.template.js';
import { nlddPageFooterTranslations, type NLDDPageFooterTranslations } from './page-footer.i18n.js';


// # nldd-page-footer-legal-bar-item

/**
 * A single entry in an `nldd-page-footer-legal-bar`. Renders as a link
 * when `href` is set, as plain text otherwise. Uses the content color
 * (not the link color) so the legal bar reads as a subdued utility row.
 *
 * @element nldd-page-footer-legal-bar-item
 *
 * @attr {string} text - Item label. Falls back to the default slot.
 * @attr {string} href - Link target. When omitted, the item renders as plain text.
 *
 * @slot - Item label (alternative to `text`).
 */
export class NLDDPageFooterLegalBarItem extends LitElement {
	static override styles = pageFooterLegalBarItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String, reflect: true })
	href?: string;

	override render() {
		return pageFooterLegalBarItemTemplate(this);
	}
}

// Sub-component of nldd-page-footer-legal-bar. Exported as a public class
// for type imports and slot-content composition. The guard registration
// (matches nldd-menu's nldd-menu-item) is for de-dupe safety: @customElement
// throws if the same tag is defined twice during HMR or test re-imports,
// the guard keeps the first registration authoritative.
if (!customElements.get('nldd-page-footer-legal-bar-item')) {
	customElements.define('nldd-page-footer-legal-bar-item', NLDDPageFooterLegalBarItem);
}


// # nldd-page-footer-legal-bar

/**
 * Holds the legal links row at the bottom of a `nldd-page-footer`. Items
 * in `start` render flush-left, items in `end` flush-right, separated by
 * spacing only (no separators). On narrow containers the two groups wrap
 * to their own rows with `start` above `end`.
 *
 * @element nldd-page-footer-legal-bar
 *
 * @attr {string} accessible-label - Override the nav's aria-label. Defaults to the i18n value (NL: "Juridische links").
 * @attr {object} translations - Override translation keys; unset keys fall back to the Dutch default.
 *
 * @slot start - Items rendered flush-left (e.g. © notice, version).
 * @slot end - Items rendered flush-right (e.g. privacy, accessibility).
 */
export class NLDDPageFooterLegalBar extends LitElement {
	static override styles = pageFooterLegalBarStyles;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDPageFooterTranslations> = {};

	@state()
	_hasStart = false;

	@state()
	_hasEnd = false;

	private _mergedTranslations: NLDDPageFooterTranslations = { ...nlddPageFooterTranslations };

	override willUpdate(changed: PropertyValues): void {
		if (changed.has('translations') || changed.has('accessibleLabel')) {
			this._mergedTranslations = {
				...nlddPageFooterTranslations,
				...this.translations,
			};
			if (this.accessibleLabel) {
				this._mergedTranslations['components.page-footer.legal-bar-accessible-label'] = this.accessibleLabel;
			}
		}
	}

	_t(key: keyof NLDDPageFooterTranslations): string {
		// Return '' (not the key) for missing translations so callers can do
		// `value || nothing` to suppress aria-label / text rather than
		// announcing the raw key string. Warn in DEV.
		const value = this._mergedTranslations[key];
		if (value === undefined && import.meta.env?.DEV) {
			console.warn(`<nldd-page-footer-legal-bar>: missing translation for "${key}"`);
		}
		return value ?? '';
	}

	_onSlotChange = (e: Event) => {
		const slot = e.target as HTMLSlotElement;
		const hasContent = slot.assignedElements().length > 0;
		const name = slot.getAttribute('name') ?? '';
		if (name === 'start') this._hasStart = hasContent;
		else if (name === 'end') this._hasEnd = hasContent;
	};

	override render() {
		return pageFooterLegalBarTemplate(this);
	}
}

// Sub-component of nldd-page-footer — see note on
// nldd-page-footer-legal-bar-item above for the guard-pattern rationale.
if (!customElements.get('nldd-page-footer-legal-bar')) {
	customElements.define('nldd-page-footer-legal-bar', NLDDPageFooterLegalBar);
}


// # nldd-page-footer

@customElement('nldd-page-footer')
export class NLDDPageFooter extends LitElement {
	static override styles = pageFooterStyles;

	/** Body max-width: 'full' (removes the constraint) or any CSS length.
	 *  Mirrors a page section's width. */
	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@state()
	_hasBreadcrumbs = false;

	@state()
	_hasMain = false;

	@state()
	_hasLegalBar = false;

	override connectedCallback(): void {
		super.connectedCallback();
		// Expose the contentinfo landmark on the host. VoiceOver/Safari
		// (and a few other AT+browser combos) don't reliably traverse a
		// shadow root to surface a <footer> as a landmark, so the role
		// goes on the host element where the AT tree builder always sees
		// it. Don't override a consumer-provided role.
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'contentinfo');
		}
		// Skip-link target: `<a href="#page-footer">` can only reach an id
		// in the light DOM, not one inside our shadow root. Set it on the
		// host (don't override a consumer-provided id).
		if (!this.id) {
			// DEV: warn on duplicate id="page-footer" in the document — a
			// second nldd-page-footer (SPA without cleanup, repeated layout
			// fragment) silently breaks HTML uniqueness (WCAG SC 4.1.1) and
			// makes skip-links target the wrong instance. Check BEFORE
			// setting this.id so we can't self-match.
			if (import.meta.env?.DEV && document.getElementById('page-footer')) {
				console.warn(
					'<nldd-page-footer>: another element already has id="page-footer"; ' +
					'set a unique id on this instance so skip-links target the right one.',
				);
			}
			this.id = 'page-footer';
		}
	}

	_hasMeaningfulContent(slot: HTMLSlotElement | null): boolean {
		const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
		return nodes.some(n =>
			n.nodeType === Node.ELEMENT_NODE
			|| (n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? '') !== ''),
		);
	}

	_onSlotChange = (e: Event) => {
		const slot = e.target as HTMLSlotElement;
		const hasContent = this._hasMeaningfulContent(slot);
		const name = slot.getAttribute('name') ?? '';
		if (name === 'breadcrumbs') this._hasBreadcrumbs = hasContent;
		else if (name === 'legal-bar') this._hasLegalBar = hasContent;
		else this._hasMain = hasContent;
	};

	// Reflect the visible-row count as host attributes for styling. Done here
	// (not in the slotchange handler) so a fully empty footer — whose empty
	// slots may never fire slotchange — still gets `empty` on first render.
	override updated(changed: PropertyValues): void {
		const visibleCount =
			(this._hasBreadcrumbs ? 1 : 0) +
			(this._hasMain ? 1 : 0) +
			(this._hasLegalBar ? 1 : 0);
		// One visible row → centered single-slot padding; zero rows → the gray
		// band drops and only the lintje shows (see :host([empty]) in the styles).
		this.toggleAttribute('single-slot', visibleCount === 1);
		this.toggleAttribute('empty', visibleCount === 0);

		if (changed.has('width')) {
			// A CSS length feeds the body max-width; 'full' is handled by CSS
			// (:host([width="full"]) sets --_max-width: none); default clears it.
			const w = this.width;
			if (w && w !== 'full' && CSS.supports('max-width', w)) {
				this.style.setProperty('--_max-width', w);
			} else {
				this.style.removeProperty('--_max-width');
			}
		}
	}

	override render() {
		return pageFooterTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-page-footer': NLDDPageFooter;
		'nldd-page-footer-legal-bar': NLDDPageFooterLegalBar;
		'nldd-page-footer-legal-bar-item': NLDDPageFooterLegalBarItem;
	}
}
