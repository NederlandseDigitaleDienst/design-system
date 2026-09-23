import { property } from 'lit/decorators.js';
import { LitElement, type PropertyValues } from 'lit';
import { onColorSchemeChange } from './color-scheme-repaint.js';

type Constructor<T = LitElement> = new (...args: any[]) => T;

export type PageSectionBackground = 'inherit' | 'base' | 'tinted';
export type PageSectionScheme = 'inherit' | 'light' | 'dark' | 'inverted';
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
// scope reads its own props and writes `--_{scope-}padding-top/bottom`, which
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
 * properties (no per-component CSS needed for background or scheme — both
 * `color-scheme` and custom properties inherit through the shadow boundary
 * into the section's block element and slotted content):
 *
 * - **background**: `inherit` (the default — transparent, shows the ancestor's
 *   surface) | `base` (the base surface color) | `tinted`. Setting
 *   `base`/`tinted` also cascades `--context-parent-background-color` so
 *   descendants (cards, nested sections) read the same surface.
 * - **scheme**: `inherit` (default) | `light` | `dark` | `inverted`.
 *   `inverted` resolves to the opposite of the surrounding page scheme and
 *   re-resolves when `:root[data-scheme]` flips (via onColorSchemeChange).
 * - **block padding**: `padding-block` (both edges) with `padding-top`
 *   / `padding-bottom` per-edge overrides, each with responsive `sm-` /
 *   `md-` / `lg-` variants (12 attrs total). Token scale `0`–`96`; `0` strips
 *   the padding. Per breakpoint the section CSS resolves: scope override →
 *   base override → responsive default. The inline (gutter) padding stays
 *   design-controlled.
 * - **height**: any CSS length (e.g. '400px', '100dvh') applied as the host's
 *   min-height (so the section is at least that tall) — mirroring how `width`
 *   maps to the body max-width.
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
		@property({ type: String, reflect: true })
		background: PageSectionBackground = 'inherit';

		@property({ type: String, reflect: true })
		scheme: PageSectionScheme = 'inherit';

		@property({ type: String, reflect: true })
		height?: string;

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

		private _unsubScheme?: () => void;

		override connectedCallback(): void {
			super.connectedCallback();
			// Re-resolve `inverted` whenever the page color-scheme flips.
			this._unsubScheme = onColorSchemeChange(() => {
				if (this.scheme === 'inverted') this._applyScheme();
			});
		}

		override disconnectedCallback(): void {
			super.disconnectedCallback();
			this._unsubScheme?.();
			this._unsubScheme = undefined;
		}

		override updated(changed: PropertyValues): void {
			super.updated(changed);
			if (changed.has('background')) this._applyBackground();
			if (changed.has('scheme')) this._applyScheme();
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

		private _applyScheme(): void {
			if (this.scheme === 'light' || this.scheme === 'dark') {
				this.style.colorScheme = this.scheme;
			} else if (this.scheme === 'inverted') {
				this.style.colorScheme = this._resolveActiveScheme() === 'dark' ? 'light' : 'dark';
			} else {
				this.style.removeProperty('color-scheme');
			}
		}

		/**
		 * Best-effort detection of the *actively rendered* scheme around the
		 * section, used to invert it.
		 *
		 * `getComputedStyle(parent).colorScheme` returns the *declared* value
		 * (`'light dark'` for "supports both"; `'normal'` for the initial
		 * value) — not the one the browser actually paints with. For
		 * `'inverted'` we want the painted scheme, so:
		 *   1. Prefer the app's explicit override on `:root[data-scheme]`
		 *      (the project's site-wide light/dark toggle).
		 *   2. Walk up to find an ancestor that pins a single scheme.
		 *   3. Otherwise fall back to `prefers-color-scheme` — that's what
		 *      `'light dark'` resolves to in practice.
		 *
		 * Perf: the per-call cost is `getComputedStyle()` for each ancestor
		 * up to one that pins a scheme. This only runs when the project
		 * does NOT set `:root[data-scheme]` (apps with a global theme
		 * toggle, like regelrecht, hit the fast path and never enter the
		 * walk). When the fallback is needed the walk is bounded by the
		 * DOM depth and only fires on `scheme` prop change or a
		 * color-scheme repaint event — not on every render.
		 *
		 * Cross-shadow caveat: `parentElement` doesn't traverse shadow
		 * boundaries, so a `color-scheme` declared on an outer custom
		 * element's host won't be picked up by the walk; we then fall
		 * through to `prefers-color-scheme`. For reliable `'inverted'`
		 * behavior inside nested shadow trees, set `data-scheme` on
		 * `:root` so the fast path resolves the painted scheme directly.
		 */
		private _resolveActiveScheme(): 'light' | 'dark' {
			const root = document.documentElement.getAttribute('data-scheme');
			if (root === 'light' || root === 'dark') return root;
			let el: Element | null = this.parentElement;
			while (el) {
				const declared = getComputedStyle(el).colorScheme;
				const hasLight = declared.includes('light');
				const hasDark = declared.includes('dark');
				if (hasDark && !hasLight) return 'dark';
				if (hasLight && !hasDark) return 'light';
				el = el.parentElement;
			}
			return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
				this._setVar(`--_${prefix}padding-top`, paddingToValue(top ?? block));
				this._setVar(`--_${prefix}padding-bottom`, paddingToValue(bottom ?? block));
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
				scheme: PageSectionScheme;
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
				_onSlotChange(e: Event): void;
			}
		>;
}
