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
 * @attr {1|2|3|4|5|6} heading-level - Renders text as h1–h6; absent renders a p, for a title that is not a heading.
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
import { setState } from '../../../utilities/element-state.js';

type Size = 1 | 2 | 3 | 4 | 5 | 6;
type TitleColor = 'content' | 'inherit';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Breakpoint = 'sm' | 'md' | 'lg';

const BREAKPOINTS: readonly Breakpoint[] = ['sm', 'md', 'lg'];

/** The font size of size 1 per breakpoint: the floor of a custom size. */
const SIZE_1_FONT_SIZE: Record<Breakpoint, string> = {
	sm: 'var(--primitives-font-size-700)',
	md: 'var(--primitives-font-size-800)',
	lg: 'var(--primitives-font-size-1000)',
};

/** Font-size values that are not a length: the CSS-wide keywords and the
 *  absolute and relative size keywords. */
const NOT_A_LENGTH = new Set([
	'inherit', 'initial', 'unset', 'revert', 'revert-layer',
	'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large',
	'larger', 'smaller', 'math',
]);

/** A length font-size takes. A keyword cannot go inside the max() that keeps the floor, so it would void the whole font. */
function isFontSize(value: string): boolean {
	return !NOT_A_LENGTH.has(value.toLowerCase()) && CSS.supports('font-size', value);
}

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
		if (
			!changed.has('smCustomSize') &&
			!changed.has('mdCustomSize') &&
			!changed.has('lgCustomSize')
		) return;
		// Nothing to measure or write when rendered without a DOM, as on a server.
		if (typeof CSS === 'undefined') return;

		// Written here rather than in updated(), so the first paint already has
		// the custom size. A breakpoint left without a valid value keeps the
		// size from the scale.
		const own: Record<Breakpoint, string> = { sm: this.smCustomSize, md: this.mdCustomSize, lg: this.lgCustomSize };
		this._customSizes = {};
		let invalid = false;
		for (const breakpoint of BREAKPOINTS) {
			const value = (own[breakpoint] || '').trim();
			const valid = value !== '' && isFontSize(value);
			if (valid) {
				this._customSizes[breakpoint] = value;
				this.style.setProperty(`--_title-${breakpoint}-custom-size`, value);
			} else {
				this.style.removeProperty(`--_title-${breakpoint}-custom-size`);
			}
			this.toggleAttribute(`data-${breakpoint}-custom-size`, valid);
			if (value !== '' && !valid) invalid = true;
		}
		setState(this, 'invalid-custom-size', invalid);
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		if (changed.has('smCustomSize') || changed.has('mdCustomSize') || changed.has('lgCustomSize')) {
			this._checkFloor(this._customSizes);
		}
	}

	/** DEV-only: whether a custom size is smaller than size 1, which then shows instead. */
	private _checkFloor(sizes: Partial<Record<Breakpoint, string>>): void {
		if (!this.shadowRoot || Object.keys(sizes).length === 0) {
			setState(this, 'custom-size-below-floor', false);
			return;
		}
		const probe = document.createElement('span');
		probe.style.position = 'absolute';
		probe.style.visibility = 'hidden';
		this.shadowRoot.append(probe);
		const px = (value: string): number => {
			probe.style.fontSize = value;
			return parseFloat(getComputedStyle(probe).fontSize);
		};
		let below = false;
		try {
			for (const [breakpoint, value] of Object.entries(sizes) as [Breakpoint, string][]) {
				// A value relative to the viewport, a container or the surrounding
				// text resolves to something else elsewhere, so it is left to the
				// CSS floor rather than measured here.
				if (/%|\d(?:v[whib]|vmin|vmax|cq[whib]|cqmin|cqmax|em|ex|ch|cap|ic|lh)\b/.test(value)) continue;
				if (px(value) < px(SIZE_1_FONT_SIZE[breakpoint]) - 0.5) below = true;
			}
		} finally {
			probe.remove();
		}
		setState(this, 'custom-size-below-floor', below);
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
