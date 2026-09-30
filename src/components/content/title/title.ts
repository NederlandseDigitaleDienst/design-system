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
 * @element nldd-title
 *
 * @attr {number} size - Visual size of the title: 1–6 (default: 3)
 * @attr {string} color - 'content' (the default) takes the system's own content
 *   colors. 'inherit' lets the title follow the text color of the surface
 *   instead (for colored areas such as the filled categories); overline and
 *   supporting-text get the same color at a lowered opacity.
 * @attr {string} text - Title text. Content in the default slot takes its place.
 * @attr {string} supporting-text - Text below the title. Content in the supporting-text slot takes its place.
 * @attr {string} overline - Text above the title. Content in the overline slot takes its place.
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6; absent renders a p, for a title that is not a heading.
 *
 * @slot overline - Overline that is more than text. Takes the place of the overline attribute.
 * @slot - Title that is more than text, such as a link. Takes the place of text, and brings its own h1–h6 for semantics.
 * @slot supporting-text - Supporting text that is more than text. Takes the place of the supporting-text attribute.
 * @slot end - Whatever belongs at the end of the title line: a button, a menu, a status badge, a version. Named for the position, not for a kind of content, because anything can sit there.
 */
import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { titleStyles } from './title.styles.js';
import { titleTemplate } from './title.template.js';

type Size = 1 | 2 | 3 | 4 | 5 | 6;
type TitleColor = 'content' | 'inherit';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** One warning per page: a missed rename is one search-and-replace, not one per title. */
let warnedAboutSubtitle = false;

@customElement('nldd-title')
export class NLDDTitle extends LitElement {
	static override styles = titleStyles;

	@property({ type: Number, reflect: true })
	size: Size = 3;

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

	override firstUpdated(): void {
		// The subtitle slot was renamed to supporting-text. Content in a slot that
		// no longer exists is not rendered and reports nothing, so say it here.
		if (import.meta.env?.DEV && !warnedAboutSubtitle && this.querySelector(':scope > [slot="subtitle"]')) {
			warnedAboutSubtitle = true;
			console.warn('NLDDTitle: the subtitle slot is now supporting-text. Rename slot="subtitle" to slot="supporting-text", or use the supporting-text attribute, here and on every other nldd-title.');
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
