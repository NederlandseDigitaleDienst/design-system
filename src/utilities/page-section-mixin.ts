import { property } from 'lit/decorators.js';
import { LitElement, type PropertyValues } from 'lit';
import { reflectNonDefault } from './reflect-non-default.js';

type Constructor<T = LitElement> = new (...args: any[]) => T;

export type PageSectionBackground = 'inherit' | 'base' | 'tinted';
export type PageSectionPadding =
	| '0' | '2' | '4' | '6' | '8' | '10' | '12' | '16' | '20' | '24'
	| '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';

const BACKGROUND_TOKEN: Record<'base' | 'tinted', string> = {
	base: 'var(--semantics-surfaces-base-background-color)',
	tinted: 'var(--semantics-surfaces-tinted-background-color)',
};

function paddingToValue(size: string | undefined): string | null {
	if (size === undefined || size === '') return null;
	if (size === '0') return '0';
	return `var(--primitives-space-${size})`;
}

// Block-padding override scopes: base ('') + the sm/md/lg breakpoints. Each
// scope reads its own props and writes `--_{component}-{scope-}padding-top/bottom` (the component is its tag without `nldd-`), which
// the section CSS resolves per breakpoint (scope override → base override →
// responsive default). The CSS var prefix is `${scope}-` (empty for base).
const PADDING_SCOPES = ['', 'sm', 'md', 'lg'] as const;
const PADDING_KEYS = [
	'paddingBlock', 'paddingTop', 'paddingBottom',
	'smPaddingBlock', 'smPaddingTop', 'smPaddingBottom',
	'mdPaddingBlock', 'mdPaddingTop', 'mdPaddingBottom',
	'lgPaddingBlock', 'lgPaddingTop', 'lgPaddingBottom',
];

/**
 * Shared surface controls for the page-section components. Adds three
 * orthogonal capabilities, all written as inline host styles / custom
 * properties (no per-component CSS needed for the background — custom
 * properties inherit through the shadow boundary into the section's block
 * element and slotted content):
 *
 * - **background**: `inherit` (the default — transparent, shows the ancestor's
 *   surface) | `base` (the base surface color) | `tinted`. Setting
 *   `base`/`tinted` also cascades `--context-parent-background-color` so
 *   descendants (cards, nested sections) read the same surface.
 * - **block padding**: `padding-block` (both edges) with `padding-top`
 *   / `padding-bottom` per-edge overrides, each with responsive `sm-` /
 *   `md-` / `lg-` variants (12 attrs total). Token scale `0`–`96`; `0` strips
 *   the padding. Per breakpoint the section CSS resolves: scope override →
 *   base override → responsive default. The inline (gutter) padding stays
 *   design-controlled.
 * - **height**: any CSS length (e.g. '400px', '100dvh') applied as the host's
 *   min-height (so the section is at least that tall) — mirroring how `width`
 *   maps to the body max-width.
 * - **grow**: the section takes the height the page has left, so the footer
 *   sits at the bottom of a short page. Without it, nldd-page lets its last
 *   section grow. nldd-page reads this and marks the growing section with
 *   `data-growing`; it never writes `grow`, which stays the author's.
 *
 * @example
 * ```ts
 * class NLDDSimpleSection extends PageSectionMixin(LitElement) { … }
 * ```
 */
export function PageSectionMixin<TBase extends Constructor<LitElement>>(
	Base: TBase,
) {
	class WithPageSection extends Base {
		@property({ reflect: true, converter: reflectNonDefault<PageSectionBackground>('inherit') })
		background: PageSectionBackground = 'inherit';

		@property({ type: String, reflect: true })
		height?: string;

		@property({ type: Boolean, reflect: true })
		grow = false;

		@property({ type: String, reflect: true, attribute: 'padding-block' })
		paddingBlock?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'padding-top' })
		paddingTop?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'padding-bottom' })
		paddingBottom?: PageSectionPadding;

		@property({ type: String, reflect: true, attribute: 'sm-padding-block' })
		smPaddingBlock?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'sm-padding-top' })
		smPaddingTop?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'sm-padding-bottom' })
		smPaddingBottom?: PageSectionPadding;

		@property({ type: String, reflect: true, attribute: 'md-padding-block' })
		mdPaddingBlock?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'md-padding-top' })
		mdPaddingTop?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'md-padding-bottom' })
		mdPaddingBottom?: PageSectionPadding;

		@property({ type: String, reflect: true, attribute: 'lg-padding-block' })
		lgPaddingBlock?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'lg-padding-top' })
		lgPaddingTop?: PageSectionPadding;
		@property({ type: String, reflect: true, attribute: 'lg-padding-bottom' })
		lgPaddingBottom?: PageSectionPadding;

		override updated(changed: PropertyValues): void {
			super.updated(changed);
			if (changed.has('background')) this._applyBackground();
			if (PADDING_KEYS.some((k) => changed.has(k))) this._applyPadding();
			if (changed.has('height')) this._applyHeight();
		}

		// Hide a slot wrapper (header/footer) when the slot has no assigned
		// elements, so empty regions collapse. Shared by every page section.
		_onSlotChange(e: Event): void {
			const slot = e.target as HTMLSlotElement;
			const wrapper = slot.parentElement;
			if (!wrapper) return;
			wrapper.hidden = slot.assignedElements().length === 0;
		}

		private _applyBackground(): void {
			if (this.background === 'base' || this.background === 'tinted') {
				const token = BACKGROUND_TOKEN[this.background];
				this.style.backgroundColor = token;
				// Cascade so descendants (cards, nested sections) match.
				this.style.setProperty('--context-parent-background-color', token);
			} else {
				this.style.backgroundColor = '';
				this.style.removeProperty('--context-parent-background-color');
			}
		}

		private _applyPadding(): void {
			const self = this as unknown as Record<string, string | undefined>;
			for (const scope of PADDING_SCOPES) {
				// Property names: base = paddingBlock(…); scoped = smPaddingBlock(…).
				const prop = (suffix: string) =>
					scope ? `${scope}Padding${suffix}` : `padding${suffix}`;
				const block = self[prop('Block')];
				const top = self[prop('Top')];
				const bottom = self[prop('Bottom')];
				const prefix = scope ? `${scope}-` : '';
				this._setVar(`--_${this.localName.slice(5)}-${prefix}padding-top`, paddingToValue(top ?? block));
				this._setVar(`--_${this.localName.slice(5)}-${prefix}padding-bottom`, paddingToValue(bottom ?? block));
			}
		}

		private _applyHeight(): void {
			// Like `width` (which sets the body max-width), the `height` keyword
			// maps to a constraint — here the host's min-height.
			const v = this.height;
			if (v && typeof CSS !== 'undefined' && CSS.supports('min-height', v)) {
				this.style.minHeight = v;
			} else {
				this.style.removeProperty('min-height');
			}
		}

		private _setVar(name: string, value: string | null): void {
			if (value === null) this.style.removeProperty(name);
			else this.style.setProperty(name, value);
		}
	}

	return WithPageSection as unknown as TBase &
		Constructor<
			LitElement & {
				background: PageSectionBackground;
				paddingBlock?: PageSectionPadding;
				paddingTop?: PageSectionPadding;
				paddingBottom?: PageSectionPadding;
				smPaddingBlock?: PageSectionPadding;
				smPaddingTop?: PageSectionPadding;
				smPaddingBottom?: PageSectionPadding;
				mdPaddingBlock?: PageSectionPadding;
				mdPaddingTop?: PageSectionPadding;
				mdPaddingBottom?: PageSectionPadding;
				lgPaddingBlock?: PageSectionPadding;
				lgPaddingTop?: PageSectionPadding;
				lgPaddingBottom?: PageSectionPadding;
				height?: string;
				grow: boolean;
				_onSlotChange(e: Event): void;
			}
		>;
}
