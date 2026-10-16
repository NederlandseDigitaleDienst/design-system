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
 * @attr {string} sm-custom-size - A size of your own at sm, any CSS length (e.g. '56px', '3.5rem', 'clamp(...)'), for a statement larger than size 1. For headings use `size`; if a design does not fit the scale, raise it as an issue. Set per breakpoint on purpose: a breakpoint without one keeps the size from `size`, so a title made large for a wide screen never breaks a narrow one. Never smaller than size 1 at the same breakpoint: a smaller value shows as size 1 and says so in development. Takes the weight, typeface and line height of size 1. An invalid value falls back to `size`
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
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { titleStyles } from './title.styles.js';
import { titleTemplate } from './title.template.js';

type Size = 1 | 2 | 3 | 4 | 5 | 6;
type TitleColor = 'content' | 'inherit';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** One warning per page: a missed rename is one search-and-replace, not one per title. */
let warnedAboutSubtitle = false;

type Breakpoint = 'sm' | 'md' | 'lg';

const BREAKPOINTS: readonly Breakpoint[] = ['sm', 'md', 'lg'];

/** The font size of size 1 per breakpoint: the floor of a custom size. */
const SIZE_1_FONT_SIZE: Record<Breakpoint, string> = {
	sm: 'var(--primitives-font-size-700)',
	md: 'var(--primitives-font-size-800)',
	lg: 'var(--primitives-font-size-1000)',
};

/** Font-size values that are not a length: the CSS-wide keywords, and the
 *  absolute and relative size keywords, which resolve against the parent. */
const NOT_A_LENGTH = new Set([
	'inherit', 'initial', 'unset', 'revert', 'revert-layer',
	'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large',
	'larger', 'smaller', 'math',
]);

/** A length font-size takes: no keyword, and no percentage, which would follow the parent's size. */
function isFontSize(value: string): boolean {
	return !NOT_A_LENGTH.has(value.toLowerCase()) && !value.includes('%') && CSS.supports('font-size', value);
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

	override firstUpdated(): void {
		// The subtitle slot was renamed to supporting-text. Content in a slot that
		// no longer exists is not rendered and reports nothing, so say it here.
		if (import.meta.env?.DEV && !warnedAboutSubtitle && this.querySelector(':scope > [slot="subtitle"]')) {
			warnedAboutSubtitle = true;
			console.warn('NLDDTitle: the subtitle slot is now supporting-text. Rename slot="subtitle" to slot="supporting-text", or use the supporting-text attribute, here and on every other nldd-title.');
		}
	}

	/** The valid custom size per breakpoint, worked out before the first paint. */
	private _customSizes: Partial<Record<Breakpoint, string>> = {};

	override willUpdate(changed: PropertyValues): void {
		super.willUpdate(changed);
		if (
			!changed.has('smCustomSize') &&
			!changed.has('mdCustomSize') &&
			!changed.has('lgCustomSize')
		) return;

		// Written here rather than in updated(), so the first paint already has
		// the custom size. A breakpoint left without a valid value keeps the
		// size from the scale.
		const own: Record<Breakpoint, string> = { sm: this.smCustomSize, md: this.mdCustomSize, lg: this.lgCustomSize };
		this._customSizes = {};
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
			if (import.meta.env?.DEV && value !== '' && !valid) {
				this._warnOnce(`invalid-${value}`, `<nldd-title>: "${value}" is not a CSS length, so the title keeps its size from the scale. Use a length such as "96px" or "6rem".`);
			}
		}
	}

	override updated(changed: PropertyValues): void {
		super.updated(changed);
		if (!import.meta.env?.DEV) return;
		if (changed.has('smCustomSize') || changed.has('mdCustomSize') || changed.has('lgCustomSize')) {
			this._checkFloor(this._customSizes);
		}
	}

	/** DEV-only: warnings already given, so each says it once per title. */
	private _warned = new Set<string>();

	private _warnOnce(key: string, message: string): void {
		if (this._warned.has(key)) return;
		this._warned.add(key);
		console.warn(message, this);
	}

	/** DEV-only: says so when a custom size is smaller than size 1, which then shows instead. */
	private _checkFloor(sizes: Partial<Record<Breakpoint, string>>): void {
		if (!this.shadowRoot || Object.keys(sizes).length === 0) return;
		const probe = document.createElement('span');
		probe.style.position = 'absolute';
		probe.style.visibility = 'hidden';
		this.shadowRoot.append(probe);
		const px = (value: string): number => {
			probe.style.fontSize = value;
			return parseFloat(getComputedStyle(probe).fontSize);
		};
		try {
			for (const [breakpoint, value] of Object.entries(sizes) as [Breakpoint, string][]) {
				if (px(value) < px(SIZE_1_FONT_SIZE[breakpoint]) - 0.5) {
					this._warnOnce(`floor-${breakpoint}-${value}`, `<nldd-title>: custom size "${value}" is smaller than size 1 at ${breakpoint} and shows as size 1. Use size for headings up to size 1.`);
				}
			}
		} finally {
			probe.remove();
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
