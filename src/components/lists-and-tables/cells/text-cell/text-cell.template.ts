import { nothing } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { NLDDTextCell } from './text-cell.js';
import { renderQueryMark } from '../../../../utilities/render-marked.js';

const DIV = unsafeStatic('div');
const P = unsafeStatic('p');

export function template(this: NLDDTextCell) {
	// A filled slot gets a <div> around it: the <p> of the app carries the meaning.
	const overlineTag = this._hasOverlineSlotted ? DIV : P;
	const textTag = this._hasDefaultSlotted ? DIV : P;
	const supportingTextTag = this._hasSupportingTextSlotted ? DIV : P;
	// Fallback content is rendered as a sibling of the slot, NOT inside it.
	// Native slot fallback gets suppressed as soon as ANY node is assigned to
	// the slot — including whitespace-only text nodes that consumers introduce
	// inadvertently (e.g. from formatting or self-closing custom-element tags).
	// By rendering the attribute path outside the slot, we control visibility
	// purely via the `_has*Slotted` state (which filters whitespace).
	return staticHtml`
		<${overlineTag}
			class="text-cell__overline"
			?hidden=${!this.overline && !this._hasOverlineSlotted}
		>
			${this.overline && !this._hasOverlineSlotted
				? renderQueryMark(this.overline, this.query, this.queryMarkMode)
				: nothing}
			<slot
				name="overline"
				@slotchange=${this._onSlotChange}
			></slot>
		</${overlineTag}>
		<${textTag}
			class="text-cell__text"
			?hidden=${!this.text && !this._hasDefaultSlotted}
		>
			${this.text && !this._hasDefaultSlotted
				? renderQueryMark(this.text, this.query, this.queryMarkMode)
				: nothing}
			<slot @slotchange=${this._onSlotChange}></slot>
		</${textTag}>
		<${supportingTextTag}
			class="text-cell__supporting-text"
			?hidden=${!this.supportingText && !this._hasSupportingTextSlotted}
		>
			${this.supportingText && !this._hasSupportingTextSlotted
				? renderQueryMark(this.supportingText, this.query, this.queryMarkMode)
				: nothing}
			<slot
				name="supporting-text"
				@slotchange=${this._onSlotChange}
			></slot>
		</${supportingTextTag}>
	`;
}
