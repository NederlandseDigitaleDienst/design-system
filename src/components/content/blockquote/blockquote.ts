/**
 * Nederlandse Digitale Dienst Blockquote Component (Lit + TypeScript)
 *
 * Shows a quote with an optional source attribution.
 *
 * @element nldd-blockquote
 * @attr {string} cite - URL of the source (forwarded to the <blockquote> element)
 *
 * @slot - The paragraph or paragraphs of the quote; prefer <p> elements
 * @slot attribution - Optional source attribution (author, title, and so on). An nldd-identity is allowed here; the em dash ("— ") is then left out.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { blockquoteStyles } from './blockquote.styles.js';
import { template } from './blockquote.template.js';

@customElement('nldd-blockquote')
export class NLDDBlockquote extends LitElement {
	static override styles = blockquoteStyles;

	@property({ type: String })
	cite: string | undefined = undefined;

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

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-blockquote': NLDDBlockquote;
	}
}
