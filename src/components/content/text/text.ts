/**
 * Nederlandse Digitale Dienst Text Component (Lit + TypeScript)
 *
 * One run of body text at a size from the type scale. It is what you reach for
 * where an app would otherwise write a bare `<p>` and inherit whatever the page
 * happens to set: a line under a title, a sentence in a panel, a caption.
 *
 * Every combination it offers exists as a token, so it cannot invent typography
 * — it only names what the scale already has. The three axes are the same three
 * the tokens carry: size, weight and line height.
 *
 * Not for headings, which is `nldd-title`, and not for a block of prose with its
 * own rhythm, spacing and media widths, which is `nldd-rich-text`. This is one
 * run of text and nothing around it.
 *
 * For large letters that are not a heading, such as a number or a statement on
 * a landing page, take a display size: `display-6` to `display-1` are the sizes
 * of `nldd-title`, with its weight, typeface and line height, and they follow
 * the breakpoint as a title does. `weight` and `line-height` belong to the body
 * sizes and do nothing at a display size. For a statement larger than
 * `display-1`, give each breakpoint a size of its own with `sm-custom-size`,
 * `md-custom-size` and `lg-custom-size`.
 *
 * Color follows the context channel a list item, menu or table sets on its
 * content, so text inside a row travels with that row as it is hovered or
 * selected. Standalone that channel is unset and the semantic color answers.
 *
 * A line stops at `--semantics-text-max-width`, 40em, so it holds the same
 * number of characters at every size and a wide column does not turn one
 * sentence into a ruler. Override that variable, or `max-width` on the element,
 * where a line is meant to run the full width: a label in a table cell, a value
 * beside its own heading.
 *
 * @element nldd-text
 * @attr {string} size - Text size: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' on the body scale (default: 'md'), or 'display-6' to 'display-1' for large letters that are not a heading, from small to large
 * @attr {string} sm-custom-size - A size of your own at sm, any CSS length (e.g. '56px', '3.5rem', 'clamp(3rem, 8vw, 7rem)'), for a statement larger than `display-1`. A var() works when the variable holds a length; one that is not defined leaves the text without its size, the floor included. Set per breakpoint on purpose: a breakpoint without one keeps the size from `size`, so text made large for a wide screen never breaks a narrow one. Never smaller than `display-1` at the same breakpoint: a smaller value shows as `display-1`, and a fixed length that is smaller says so in development (a relative value, such as vw, em or a percentage, is not checked there; the floor still holds). Takes the weight, typeface and line height of `display-1`. An invalid value falls back to `size`
 * @attr {string} md-custom-size - The same, at md
 * @attr {string} lg-custom-size - The same, at lg
 * @attr {string} weight - Font weight: 'regular' | 'medium' | 'bold' (default: 'regular'). With 'bold' a slotted `<strong>` no longer stands out: there is nothing bolder in the scale.
 * @attr {string} line-height - Line height: 'flat' | 'tight' | 'snug' | 'loose' (default: 'snug')
 * @attr {string} color - Text color: 'content' (the default) | 'secondary' | 'accent' | 'success' | 'warning' | 'critical' | 'inherit'. 'content' and 'secondary' follow the surrounding content channel; 'inherit' takes the color it inherits, for text on a painted surface.
 * @attr {string} horizontal-alignment - Alignment of the text within the block: 'left' | 'center' | 'right' (default: 'left'). Aligns the words; `horizontal-alignment` on nldd-container moves the box.
 *
 * @slot - The text. Inline elements look as they do in nldd-rich-text: `<strong>` and `<b>` take the bold weight from the scale, `<em>` and `<i>` are italic, `<a>` is an underlined link, `<code>` sits on a tinted surface in the monospace font, `<mark>` is highlighted, `<q>` is quoted in italics, and an element with `data-mention` is a mention (`<a href="…" data-mention>` as the tinted token, `<span data-mention>` without the tint; write the name without the `@`). This holds for elements directly in the text; one inside another (a link inside `<strong>`) keeps only the outer one's styling. Components such as `nldd-tag` are left alone.
 * @accepts strong, b, em, i, a, code, mark, q, span
 */

import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { applyCustomFontSizes, checkCustomFontSizeFloor, DISPLAY_1_FONT_SIZE, type Breakpoint } from '../../../utilities/custom-font-size.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { textStyles } from './text.styles.js';
import { template } from './text.template.js';

type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'display-6' | 'display-5' | 'display-4' | 'display-3' | 'display-2' | 'display-1';
type Weight = 'regular' | 'medium' | 'bold';
type LineHeight = 'flat' | 'tight' | 'snug' | 'loose';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical' | 'inherit';
type HorizontalAlignment = 'left' | 'center' | 'right';

@customElement('nldd-text')
export class NLDDText extends LitElement {
	static override styles = textStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, attribute: 'sm-custom-size', converter: reflectNonDefault<string>('') })
	smCustomSize = '';

	@property({ reflect: true, attribute: 'md-custom-size', converter: reflectNonDefault<string>('') })
	mdCustomSize = '';

	@property({ reflect: true, attribute: 'lg-custom-size', converter: reflectNonDefault<string>('') })
	lgCustomSize = '';

	@property({ reflect: true, converter: reflectNonDefault<Weight>('regular') })
	weight: Weight = 'regular';

	@property({
		reflect: true,
		attribute: 'line-height',
		converter: reflectNonDefault<LineHeight>('snug'),
	})
	lineHeight: LineHeight = 'snug';

	@property({ reflect: true, converter: reflectNonDefault<Color>('content') })
	color: Color = 'content';

	@property({
		reflect: true,
		attribute: 'horizontal-alignment',
		converter: reflectNonDefault<HorizontalAlignment>('left'),
	})
	horizontalAlignment: HorizontalAlignment = 'left';

	/** The valid custom size per breakpoint, worked out before the first paint. */
	private _customSizes: Partial<Record<Breakpoint, string>> = {};

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (!changed.has('smCustomSize') && !changed.has('mdCustomSize') && !changed.has('lgCustomSize')) return;
		this._customSizes = applyCustomFontSizes(this, 'text', { sm: this.smCustomSize, md: this.mdCustomSize, lg: this.lgCustomSize });
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		if (changed.has('smCustomSize') || changed.has('mdCustomSize') || changed.has('lgCustomSize')) {
			checkCustomFontSizeFloor(this, this._customSizes, DISPLAY_1_FONT_SIZE);
		}
	}

	override render() {
		return template();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text': NLDDText;
	}
}
