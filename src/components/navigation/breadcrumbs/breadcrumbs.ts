/**
 * Nederlandse Digitale Dienst Breadcrumbs Component (Lit + TypeScript)
 *
 * A trail of `nldd-breadcrumbs-item`s separated by `›`, rendered as a
 * `<nav>` landmark wrapping a `<div role="list">` (with each item carrying
 * `role="listitem"`). Explicit ARIA roles travel reliably across the slot
 * boundary where the implicit `<ol>`/`<li>` mapping is inconsistent across
 * AT + browser combos. The trail wraps onto multiple lines when it doesn't
 * fit, so it adapts to any width.
 *
 * @element nldd-breadcrumbs
 *
 * @attr {string} accessible-label - Override the nav's aria-label. Defaults to the i18n value (NL: "Kruimelpad").
 * @attr {object} translations - Override translation keys; unset keys fall back to the Dutch default.
 *
 * @slot - `nldd-breadcrumbs-item` children.
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { breadcrumbsStyles, breadcrumbsItemStyles } from './breadcrumbs.styles.js';
import { breadcrumbsTemplate, breadcrumbsItemTemplate } from './breadcrumbs.template.js';
import { nlddBreadcrumbsTranslations, type NLDDBreadcrumbsTranslations } from './breadcrumbs.i18n.js';
import { translate } from '../../../utilities/translations.js';


// # nldd-breadcrumbs-item

/**
 * A single entry in an `nldd-breadcrumbs` list. Renders as a link when
 * `href` is set, as plain text marked `aria-current="page"` when `current`
 * is set, and as plain text otherwise. Each item renders its own trailing
 * `›` separator; the last item in the list hides it via `:host(:last-of-type)`.
 *
 * @element nldd-breadcrumbs-item
 *
 * @attr {string} href - Link target. Ignored when `current` is set.
 * @attr {boolean} current - Marks this item as the current page (renders as plain text + `aria-current="page"`). Typical use is on the last item.
 * @attr {string} text - Item label. Falls back to the default slot.
 *
 * @slot - Item label (alternative to `text`).
 */
export class NLDDBreadcrumbsItem extends LitElement {
	static override styles = breadcrumbsItemStyles;

	@property({ type: String, reflect: true })
	href?: string;

	@property({ type: Boolean, reflect: true })
	current = false;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	override connectedCallback(): void {
		super.connectedCallback();
		// The parent .breadcrumbs__items is a div role="list"; each item
		// gets the matching listitem role so screen readers announce a
		// proper list with N items. Explicit ARIA is what AT actually
		// reads across the slot boundary — the implicit <ol>/<li>
		// mapping doesn't traverse it reliably.
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'listitem');
		}
	}

	override updated(changed: PropertyValues): void {
		// Reflect aria-current on the host (the semantic listitem) rather
		// than on an inner span — the listitem is the element screen readers
		// announce, so the current-page hint should live there.
		if (changed.has('current')) {
			if (this.current) {
				this.setAttribute('aria-current', 'page');
			} else {
				this.removeAttribute('aria-current');
			}
		}
	}

	override render() {
		return breadcrumbsItemTemplate(this);
	}
}

// Sub-component of nldd-breadcrumbs. Exported as a public class for type
// imports. The guard registration (matches nldd-menu's nldd-menu-item /
// nldd-menu-divider) is for de-dupe safety: @customElement throws if the
// same tag is defined twice during HMR or test re-imports, the guard keeps
// the first registration authoritative.
if (!customElements.get('nldd-breadcrumbs-item')) {
	customElements.define('nldd-breadcrumbs-item', NLDDBreadcrumbsItem);
}


// # nldd-breadcrumbs

@customElement('nldd-breadcrumbs')
export class NLDDBreadcrumbs extends LitElement {
	static override styles = breadcrumbsStyles;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Object })
	translations: Partial<NLDDBreadcrumbsTranslations> = {};

	_t(key: keyof NLDDBreadcrumbsTranslations): string {
		if (key === 'components.breadcrumbs.accessible-label' && this.accessibleLabel) {
			return this.accessibleLabel;
		}
		return translate(this.translations, nlddBreadcrumbsTranslations, key);
	}

	override render() {
		return breadcrumbsTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-breadcrumbs': NLDDBreadcrumbs;
		'nldd-breadcrumbs-item': NLDDBreadcrumbsItem;
	}
}
