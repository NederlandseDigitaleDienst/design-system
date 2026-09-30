import { html, nothing } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { NLDDTitleCell } from './title-cell.js';
import { renderQueryMark } from '../../../../utilities/render-marked.js';

// SAFETY: whitelist of allowed heading tags for unsafeStatic.
// This map is the sole guard against XSS — never derive a tag name
// from unvalidated input. Any heading-level value not in this map
// falls back to <p>.
const HEADING_TAGS: Record<number, ReturnType<typeof unsafeStatic>> = {
	1: unsafeStatic('h1'),
	2: unsafeStatic('h2'),
	3: unsafeStatic('h3'),
	4: unsafeStatic('h4'),
	5: unsafeStatic('h5'),
	6: unsafeStatic('h6'),
};

// Fallback content (the rendered text attribute) is rendered as a sibling of
// the slot, NOT inside it. Native slot fallback gets suppressed as soon as ANY
// node is assigned to the slot — including whitespace-only text nodes that
// consumers introduce inadvertently. By rendering the attribute path outside
// the slot, we control visibility purely via the `_has*Slotted` state (which
// filters whitespace).
function renderTitle(component: NLDDTitleCell) {
	const fallback = component.text && !component._hasDefaultSlotted
		? renderQueryMark(component.text, component.query, component.queryMarkMode)
		: nothing;
	const isHidden = !component.text && !component._hasDefaultSlotted;
	const tag = HEADING_TAGS[component.headingLevel as number];

	if (tag) {
		return staticHtml`<${tag}
			class="title-cell__title"
			?hidden=${isHidden}
		>${fallback}<slot @slotchange=${component._onSlotChange}></slot></${tag}>`;
	}
	return html`<p
		class="title-cell__title"
		?hidden=${isHidden}
	>${fallback}<slot @slotchange=${component._onSlotChange}></slot></p>`;
}

export const template = function (this: NLDDTitleCell) {
	return html`
		<p
			class="title-cell__overline"
			?hidden=${!this.overline && !this._hasOverlineSlotted}
		>
			${this.overline && !this._hasOverlineSlotted
				? renderQueryMark(this.overline, this.query, this.queryMarkMode)
				: nothing}
			<slot
				name="overline"
				@slotchange=${this._onSlotChange}
			></slot>
		</p>
		${renderTitle(this)}
		<p
			class="title-cell__supporting-text"
			?hidden=${!this.supportingText && !this._hasSupportingTextSlotted}
		>
			${this.supportingText && !this._hasSupportingTextSlotted
				? renderQueryMark(this.supportingText, this.query, this.queryMarkMode)
				: nothing}
			<slot
				name="supporting-text"
				@slotchange=${this._onSlotChange}
			></slot>
		</p>
	`;
};
