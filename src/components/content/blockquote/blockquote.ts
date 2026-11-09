/**
 * Nederlandse Digitale Dienst Blockquote Component (Lit + TypeScript)
 *
 * Shows a quote with an optional source attribution.
 *
 * @element nldd-blockquote
 * @attr {string} cite - URL of the source (forwarded to the <blockquote> element)
 * @attr {string} sm-custom-size - A size of your own for the quote at sm, any CSS length (e.g. '32px', '2rem', 'clamp(1.5rem, 4vw, 3rem)'), for a quote that stands out on its own, such as on a landing page. A quote in running text keeps its own size. Set per breakpoint on purpose: a breakpoint without one keeps the quote's own size, so a quote made large for a wide screen never breaks a narrow one. Never smaller than the quote's own size at the same breakpoint: a smaller value shows at that size, and a fixed length that is smaller says so in development (a relative value, such as vw, em or a percentage, is not checked there; the floor still holds). Only the quote grows, with its line height and the space between paragraphs; the attribution and the border stay as they are. An invalid value falls back to the quote's own size
 * @attr {string} md-custom-size - The same, at md
 * @attr {string} lg-custom-size - The same, at lg
 *
 * @slot - The paragraph or paragraphs of the quote; prefer <p> elements
 * @accepts p
 * @slot attribution - Optional source attribution (author, title, and so on). An nldd-identity is allowed here; the em dash ("— ") is then left out.
 */

import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { applyCustomFontSizes, checkCustomFontSizeFloor, type Breakpoint } from '../../../utilities/custom-font-size.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { blockquoteStyles } from './blockquote.styles.js';
import { template } from './blockquote.template.js';

/** The quote's own font size per breakpoint: the floor of a custom size. */
const QUOTE_FONT_SIZE: Record<Breakpoint, string> = {
	sm: 'var(--primitives-font-size-200)',
	md: 'var(--primitives-font-size-300)',
	lg: 'var(--primitives-font-size-300)',
};

@customElement('nldd-blockquote')
export class NLDDBlockquote extends LitElement {
	static override styles = blockquoteStyles;

	@property({ type: String })
	cite: string | undefined = undefined;

	@property({ reflect: true, attribute: 'sm-custom-size', converter: reflectNonDefault<string>('') })
	smCustomSize = '';

	@property({ reflect: true, attribute: 'md-custom-size', converter: reflectNonDefault<string>('') })
	mdCustomSize = '';

	@property({ reflect: true, attribute: 'lg-custom-size', converter: reflectNonDefault<string>('') })
	lgCustomSize = '';

	@state()
	_hasAttribution = false;

	@state()
	_hasIdentityAttribution = false;

	/** @internal */
	_handleAttributionSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		this._hasAttribution = slot.assignedNodes({ flatten: true }).some(n => {
			if (n.nodeType === Node.ELEMENT_NODE) return true;
			return (n.textContent ?? '').trim().length > 0;
		});
		// A identity brings its own layout (avatars + stacked text); the leading
		// em-dash assumes inline text and would wrap onto its own line above
		// the block, so it is suppressed for identity attributions. Matched by
		// tag name rather than instanceof to avoid statically importing (and so
		// bundling) nldd-identity into every blockquote consumer.
		this._hasIdentityAttribution = slot.assignedElements({ flatten: true }).some(el => el.tagName === 'NLDD-IDENTITY');
	};

	/** The valid custom size per breakpoint, worked out before the first paint. */
	private _customSizes: Partial<Record<Breakpoint, string>> = {};

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (!changed.has('smCustomSize') && !changed.has('mdCustomSize') && !changed.has('lgCustomSize')) return;
		this._customSizes = applyCustomFontSizes(this, 'blockquote', { sm: this.smCustomSize, md: this.mdCustomSize, lg: this.lgCustomSize });
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		if (changed.has('smCustomSize') || changed.has('mdCustomSize') || changed.has('lgCustomSize')) {
			checkCustomFontSizeFloor(this, this._customSizes, QUOTE_FONT_SIZE);
		}
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-blockquote': NLDDBlockquote;
	}
}
