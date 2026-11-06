/**
 * Nederlandse Digitale Dienst Title Bar Component (Lit + TypeScript)
 *
 * A title bar with an optional overline, title, and supporting text on the left,
 * and a slot at the end of the title line on the right.
 *
 * The title comes from `text`, with `heading-level` for its place in the
 * heading structure. `size` is how it looks, `heading-level` what it is, and
 * the two are set apart. `overline` and `supporting-text` go above and below
 * it. Each of the three has a slot in the same place for content that is more
 * than text, and a filled slot takes the place of the attribute.
 *
 * A word too long for the line is hyphenated by syllable, with the `lang` of
 * the page: only a word of at least 12 letters, with at least 5 on each side, so
 * a short word moves to the next line whole. A soft hyphen (`&shy;`) adds a
 * place to break of your own, also where the browser has no dictionary for the
 * language: `overheids&shy;informatie`, or `\u00AD` in a string set from
 * script, where an entity is not read. Most browsers then break that word only
 * there; Safari may still pick a syllable of its own.
 *
 * @element nldd-title
 *
 * @attr {number} size - Visual size of the title: 1–6 (default: 3)
 * @attr {string} sm-custom-size - A size of your own at sm, any CSS length (e.g. '56px', '3.5rem', 'clamp(3rem, 8vw, 7rem)'), for a statement larger than size 1. A var() works when the variable holds a length; one that is not defined leaves the title without its size, the floor included. For headings use `size`; if a design does not fit the scale, raise it as an issue. Set per breakpoint on purpose: a breakpoint without one keeps the size from `size`, so a title made large for a wide screen never breaks a narrow one. Never smaller than size 1 at the same breakpoint: a smaller value shows as size 1, and a fixed length that is smaller says so in development (a relative value, such as vw, em or a percentage, is not checked there; the floor still holds). Takes the weight, typeface and line height of size 1. An invalid value falls back to `size`
 * @attr {string} md-custom-size - The same, at md
 * @attr {string} lg-custom-size - The same, at lg
 * @attr {string} color - 'content' (the default) takes the system's own content
 *   colors. 'inherit' lets the title follow the text color of the surface
 *   instead (for colored areas such as the filled categories); overline and
 *   supporting-text get the same color at a lowered opacity.
 * @attr {string} text - Title text. Content in the default slot takes its place.
 * @attr {string} supporting-text - Text below the title. Content in the supporting-text slot takes its place.
 * @attr {string} overline - Text above the title. Content in the overline slot takes its place.
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6. Absent renders a p, which is no heading: for large letters that are not a heading, use nldd-text with a display size.
 *
 * @slot overline - Overline that is more than text. Takes the place of the overline attribute.
 * @slot - Title that is more than text, such as a link. Takes the place of text, and brings its own h1–h6 for semantics.
 * @slot supporting-text - Supporting text that is more than text. Takes the place of the supporting-text attribute.
 * @slot end - Whatever belongs at the end of the title line: a button, a menu, a status badge, a version. Named for the position, not for a kind of content, because anything can sit there.
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { titleStyles } from './title.styles.js';
import { titleTemplate } from './title.template.js';
import { applyCustomFontSizes, checkCustomFontSizeFloor, DISPLAY_1_FONT_SIZE, type Breakpoint } from '../../../utilities/custom-font-size.js';

type Size = 1 | 2 | 3 | 4 | 5 | 6;
type TitleColor = 'content' | 'inherit';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@customElement('nldd-title')
export class NLDDTitle extends LitElement {
	static override styles = titleStyles;

	@property({ type: Number, reflect: true })
	size: Size = 3;

	@property({ reflect: true, attribute: 'sm-custom-size', converter: reflectNonDefault<string>('') })
	smCustomSize = '';

	@property({ reflect: true, attribute: 'md-custom-size', converter: reflectNonDefault<string>('') })
	mdCustomSize = '';

	@property({ reflect: true, attribute: 'lg-custom-size', converter: reflectNonDefault<string>('') })
	lgCustomSize = '';

	@property({ reflect: true, converter: reflectNonDefault<TitleColor>('content') })
	color: TitleColor = 'content';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	overline = '';

	@property({ type: Number, reflect: true, attribute: 'heading-level' })
	headingLevel: HeadingLevel | null = null;

	/** @internal */
	@state() _hasOverlineSlotted = false;
	/** @internal */
	@state() _hasDefaultSlotted = false;
	/** @internal */
	@state() _hasSupportingTextSlotted = false;

	/** @internal */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		// Whitespace between the tags is not content: without this check the text
		// would vanish behind a slot that only holds a newline.
		const hasContent = slot.assignedNodes().some((node) =>
			node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim().length > 0);
		if (slot.name === 'overline') this._hasOverlineSlotted = hasContent;
		else if (slot.name === 'supporting-text') this._hasSupportingTextSlotted = hasContent;
		else this._hasDefaultSlotted = hasContent;
	};

	/** The valid custom size per breakpoint, worked out before the first paint. */
	private _customSizes: Partial<Record<Breakpoint, string>> = {};

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (!changed.has('smCustomSize') && !changed.has('mdCustomSize') && !changed.has('lgCustomSize')) return;
		this._customSizes = applyCustomFontSizes(this, 'title', { sm: this.smCustomSize, md: this.mdCustomSize, lg: this.lgCustomSize });
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		if (changed.has('smCustomSize') || changed.has('mdCustomSize') || changed.has('lgCustomSize')) {
			checkCustomFontSizeFloor(this, this._customSizes, DISPLAY_1_FONT_SIZE);
		}
	}

	override render() {
		return titleTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-title': NLDDTitle;
	}
}
