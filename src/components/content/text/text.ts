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
 * @attr {string} size - Text size on the body scale: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {string} weight - Font weight: 'regular' | 'medium' | 'bold' (default: 'regular'). With 'bold' a slotted `<strong>` no longer stands out: there is nothing bolder in the scale.
 * @attr {string} line-height - Line height: 'flat' | 'tight' | 'snug' | 'loose' (default: 'snug')
 * @attr {string} color - Text color: 'content' (the default) | 'secondary' | 'accent' | 'success' | 'warning' | 'critical' | 'inherit'. 'content' and 'secondary' follow the surrounding content channel; 'inherit' takes the color it inherits, for text on a painted surface.
 * @attr {string} horizontal-alignment - Alignment of the text within the block: 'left' | 'center' | 'right' (default: 'left'). Aligns the words; `horizontal-alignment` on nldd-container moves the box.
 *
 * @slot - The text. Inline elements look as they do in nldd-rich-text: `<strong>` and `<b>` take the bold weight from the scale, `<em>` and `<i>` are italic, `<a>` is an underlined link, `<code>` sits on a tinted surface in the monospace font, `<mark>` is highlighted, `<q>` is quoted in italics, and an element with `data-mention` is a mention (`<a href="…" data-mention>` as the tinted token, `<span data-mention>` without the tint; write the name without the `@`). This holds for elements directly in the text; one inside another (a link inside `<strong>`) keeps only the outer one's styling. Components such as `nldd-tag` are left alone.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { textStyles } from './text.styles.js';
import { template } from './text.template.js';

type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
type Weight = 'regular' | 'medium' | 'bold';
type LineHeight = 'flat' | 'tight' | 'snug' | 'loose';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical' | 'inherit';
type HorizontalAlignment = 'left' | 'center' | 'right';

@customElement('nldd-text')
export class NLDDText extends LitElement {
	static override styles = textStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

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

	override render() {
		return template();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text': NLDDText;
	}
}
