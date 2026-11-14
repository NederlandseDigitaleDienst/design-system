/**
 * Nederlandse Digitale Dienst Title Bar Component (Lit + TypeScript)
 *
 * A title bar with an optional overline, title, and supporting text on the left,
 * and a slot at the end of the title line on the right.
 *
 * The title comes from `text`, with `heading-level` for its place in the
 * heading structure. The level also sets the size: an h2 looks like
 * `display-2`. Set `size` where the look should differ from the level, such as
 * a section heading that is smaller than its place. A heading of your own in
 * the default slot sets the level the same way, so `<h2>` there looks like
 * `display-2` without a `heading-level`. A title without a level is no heading
 * and shows as body text, whatever its `size`: give it a level, or for large
 * letters that are not a heading use nldd-text with a display size.
 * `overline` and `supporting-text` go above and below it. Each of the three
 * has a slot in the same place for content that is more than text, and a
 * filled slot takes the place of the attribute. Both grow and shrink with the
 * size of the title, and keep to the width of a line of reading (40em), with
 * balanced lines. The supporting text is a line or two, not a paragraph.
 *
 * Inline elements in a slotted heading (a link, strong, em, code, mark, q) look
 * as they do in nldd-text. A shadow root cannot reach inside a slotted element,
 * so that styling comes from a global stylesheet: `dist/css/title.css`, or
 * `global.css`, which includes it.
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
 * @attr {string} size - Visual size of the title, when it should differ from its level: 'display-1' to 'display-6', from large to small (default: the display size of the level). Has no effect without a level
 * @attr {string} sm-custom-size - A size of your own at sm, any CSS length (e.g. '56px', '3.5rem', 'clamp(3rem, 8vw, 7rem)'), for a statement larger than `display-1`. A var() works when the variable holds a length; one that is not defined leaves the title without its size, the floor included. For headings use `size`; if a design does not fit the scale, raise it as an issue. Set per breakpoint on purpose: a breakpoint without one keeps the size from `size`, so a title made large for a wide screen never breaks a narrow one. Never smaller than `display-1` at the same breakpoint: a smaller value shows as `display-1`, and a fixed length that is smaller says so in development (a relative value, such as vw, em or a percentage, is not checked there; the floor still holds). Takes the weight, typeface and line height of `display-1`. An invalid value falls back to `size`
 * @attr {string} md-custom-size - The same, at md
 * @attr {string} lg-custom-size - The same, at lg
 * @attr {string} text - Title text. Content in the default slot takes its place.
 * @attr {string} supporting-text - Text below the title. Content in the supporting-text slot takes its place.
 * @attr {string} overline - Text above the title. Content in the overline slot takes its place.
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6, and sets the default size. Absent renders a p in body text, unless the default slot brings its own heading.
 *
 * @slot overline - Overline that is more than text. Takes the place of the overline attribute.
 * @slot - Title that is more than text, such as a link. Takes the place of text, and brings its own h1–h6 for semantics.
 * @accepts h1, h2, h3, h4, h5, h6, a, strong, b, em, i, code, mark, q
 * @slot supporting-text - Supporting text that is more than text. Takes the place of the supporting-text attribute.
 * @slot end - One thing at the end of the title line: a button, a menu, a status badge, a version. Named for the position, not for a kind of content, because anything can sit there. More than one action goes in an nldd-toolbar below the title, not in this slot: the line has no room for a row of buttons on a narrow screen, and a toolbar moves what does not fit to its overflow menu.
 */
import { LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { titleStyles } from './title.styles.js';
import { titleTemplate } from './title.template.js';
import { applyCustomFontSizes, checkCustomFontSizeFloor, DISPLAY_1_FONT_SIZE, type Breakpoint } from '../../../utilities/custom-font-size.js';

export type TitleSize = 'display-1' | 'display-2' | 'display-3' | 'display-4' | 'display-5' | 'display-6';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@customElement('nldd-title')
export class NLDDTitle extends LitElement {
	static override styles = titleStyles;

	@property({ reflect: true })
	size?: TitleSize;

	@property({ reflect: true, attribute: 'sm-custom-size', converter: reflectNonDefault<string>('') })
	smCustomSize = '';

	@property({ reflect: true, attribute: 'md-custom-size', converter: reflectNonDefault<string>('') })
	mdCustomSize = '';

	@property({ reflect: true, attribute: 'lg-custom-size', converter: reflectNonDefault<string>('') })
	lgCustomSize = '';

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
	/** @internal The level of a heading in the default slot. */
	@state() _slottedLevel: HeadingLevel | null = null;

	/** @internal */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		// Whitespace between the tags is not content: without this check the text
		// would vanish behind a slot that only holds a newline.
		const hasContent = slot.assignedNodes().some((node) =>
			node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim().length > 0);
		if (slot.name === 'overline') this._hasOverlineSlotted = hasContent;
		else if (slot.name === 'supporting-text') this._hasSupportingTextSlotted = hasContent;
		else {
			this._hasDefaultSlotted = hasContent;
			const heading = slot.assignedElements().find((el) => /^H[1-6]$/.test(el.tagName));
			this._slottedLevel = heading ? Number(heading.tagName[1]) as HeadingLevel : null;
		}
	};

	/** The valid custom size per breakpoint, worked out before the first paint. */
	private _customSizes: Partial<Record<Breakpoint, string>> = {};

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		// The level the styles size by: the attribute, or the slotted heading.
		const level = this.headingLevel ?? this._slottedLevel;
		if (level && level >= 1 && level <= 6) this.setAttribute('data-level', String(level));
		else this.removeAttribute('data-level');
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
