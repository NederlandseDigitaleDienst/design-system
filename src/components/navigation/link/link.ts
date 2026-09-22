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
 * @element nldd-link
 * @attr {string} href - Link target
 * @attr {string} target - Link target (e.g. '_blank'); adjusts rel automatically. With '_blank' the link adds a visually hidden "Opent in nieuw tabblad" announcement for screen readers (WCAG 2.1 SC 3.2.2).
 * @attr {string} rel - Link rel attribute; with target '_blank', 'noopener noreferrer' is added to whatever you set
 * @attr {string} size - Text size: 'inherit' (the default) follows the surrounding text and lays the link out inline, so it wraps in running prose. 'xs' | 'sm' | 'md' | 'lg' pin a size and switch to inline-flex, which baseline-aligns a start or end icon with an explicit gap.
 * @attr {string} text - Link text (alternative to the default slot)
 * @attr {string} start-icon - Icon before the text
 * @attr {string} end-icon - Icon after the text
 * @attr {string} accessible-label - Accessible label for screen readers
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {object} translations - Override translation keys (e.g. the "Opent in nieuw tabblad" announcement); unset keys fall back to Dutch.
 *
 * @slot - Link text (alternative to the text attribute)
 * @slot start-icon - Custom icon before the text
 * @slot end-icon - Custom icon after the text
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { linkStyles } from './link.styles.js';
import { template } from './link.template.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddLinkTranslations } from './link.i18n.js';
import './../../content/icon/icon.js';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'inherit';

@customElement('nldd-link')
export class NLDDLink extends withTranslations(LitElement, nlddLinkTranslations) {
	static override styles = linkStyles;

	@property({ type: String, reflect: true })
	href: string | undefined = undefined;

	@property({ type: String })
	target: string | undefined = undefined;

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


	private _handleClick(e: MouseEvent): void {
		if (this.disabled) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	override render() {
		return template.call(this, {
			handleClick: this._handleClick.bind(this),
		});
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-link': NLDDLink;
	}
}
