import { property } from 'lit/decorators.js';
import { LitElement, type PropertyValues, type CSSResultGroup, type CSSResultOrNative } from 'lit';
import { visibilityStyles } from './visibility-mixin.styles.js';

type Constructor<T = LitElement> = new (...args: any[]) => T;

type StyleFinalizer = {
	finalizeStyles(styles?: CSSResultGroup): Array<CSSResultOrNative>;
};

const NAMED_BREAKPOINTS = new Set(['sm', 'md', 'lg']);

// A named breakpoint is already covered by the static stylesheet. Only a custom
// CSS length has to become a rule at runtime, because a container query cannot
// read its threshold from a variable.
function customThreshold(value: string | undefined): string | null {
	if (value === undefined || NAMED_BREAKPOINTS.has(value)) return null;
	return value;
}

/**
 * The open edges hide nothing, so the attribute is written but never applies.
 * That reads like a working value, and the name invites it: `hide-below`
 * names the breakpoint you hide BELOW, so "hide it at sm" comes out as
 * `hide-below="md"` and `hide-below="sm"` does nothing at all. Say so once,
 * rather than let it look applied.
 */

/**
 * Adds `hide-below` and `hide-above` attributes that toggle visibility based
 * on the inline-size of an ancestor CSS container.
 *
 * Without a `containerName` argument the rule is an anonymous `@container (…)`
 * query — it matches the nearest ancestor that declares
 * `container-type: inline-size`. Pass a name to target a specific container
 * (e.g. `'cells-container'` for cells inside `nldd-list`, which sets that
 * name inline on its host as a Safari shadow-DOM workaround).
 *
 * Values are either a named breakpoint — `sm` / `md` / `lg` — or a CSS length
 * (e.g. '320px', '20rem'). Named values resolve to the standard breakpoint
 * thresholds: `hide-below` uses the breakpoint's lower bound (e.g.
 * `hide-below="lg"` hides in sm+md and shows in lg), `hide-above` its upper
 * bound; the open edges (below sm, above lg) are no-ops.
 *
 * The named values are static CSS (see `visibility-mixin.styles.ts`), added
 * through `finalizeStyles` so that a component's own `static styles` does not
 * have to know about them. A custom length has no static form: the threshold
 * is only known at runtime and a container query cannot read one from a CSS
 * variable, so its rule is written at runtime into a constructable stylesheet
 * the shadow root adopts. Neither path is an inline stylesheet, so no consumer
 * needs `'unsafe-inline'` in its `style-src` for either.
 *
 * @mixin VisibilityMixin
 *
 * @attr {string} hide-below - Hides the element below this breakpoint: `sm` | `md` | `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns).
 * @attr {string} hide-above - Hides the element above this breakpoint: `sm` | `md` | `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns).
 *
 * @example
 * ```ts
 * // Cell inside nldd-list — target the named cells-container
 * class NLDDTextCell extends VisibilityMixin(LitElement, 'cells-container') { … }
 *
 * // Other component — fall back to the nearest unnamed container
 * class SomeComponent extends VisibilityMixin(LitElement) { … }
 * ```
 */
export function VisibilityMixin<TBase extends Constructor<LitElement>>(
	Base: TBase,
	containerName?: string,
) {
	class WithVisibility extends Base {
		// Lit calls this from finalize() with whatever the most-derived class put
		// in `static styles`, which is why the mixin can add its sheet here and a
		// component's own `static styles =` never clobbers it.
		//
		// `Base` is the direct superclass, so this is `super.finalizeStyles` with
		// the receiver kept; it is reached through the cast because a
		// `Constructor<LitElement>` type parameter does not carry Lit's statics.
		/** @internal */
		protected static finalizeStyles(styles?: CSSResultGroup): Array<CSSResultOrNative> {
			const inherited = (Base as unknown as StyleFinalizer).finalizeStyles.call(this, styles);
			return [...inherited, visibilityStyles(containerName)];
		}

		@property({ type: String, reflect: true, attribute: 'hide-below' })
		hideBelow?: string;

		@property({ type: String, reflect: true, attribute: 'hide-above' })
		hideAbove?: string;

		private _visibilitySheet?: CSSStyleSheet;

		override updated(changed: PropertyValues): void {
			super.updated(changed);
			if (changed.has('hideBelow') || changed.has('hideAbove')) {
				this._updateVisibilityRules();
			}
		}

		// The rule for a custom length is built here, into a stylesheet the shadow
		// root adopts rather than a <style> element written into it. A CSP judges
		// the element and leaves the CSSOM alone, so this path needs no
		// 'unsafe-inline' either.
		private _updateVisibilityRules(): void {
			const root = this.shadowRoot;
			if (!root) return;
			const containerPrefix = containerName ? `${containerName} ` : '';
			const rules: string[] = [];

			const below = customThreshold(this.hideBelow);
			if (below) {
				rules.push(
					`:host { @container ${containerPrefix}(max-width: ${below}) { display: none !important; } }`,
				);
			}

			const above = customThreshold(this.hideAbove);
			if (above) {
				rules.push(
					`:host { @container ${containerPrefix}(min-width: ${above}) { display: none !important; } }`,
				);
			}

			if (rules.length === 0) {
				if (this._visibilitySheet) {
					const dropped = this._visibilitySheet;
					root.adoptedStyleSheets = Array.from(root.adoptedStyleSheets)
						.filter((sheet) => sheet !== dropped);
					this._visibilitySheet = undefined;
				}
				return;
			}
			if (!this._visibilitySheet) {
				this._visibilitySheet = new CSSStyleSheet();
				// Last, so it outranks the static sheet on a tie.
				root.adoptedStyleSheets = [...root.adoptedStyleSheets, this._visibilitySheet];
			}
			this._visibilitySheet.replaceSync(rules.join('\n'));
		}
	}
	return WithVisibility as unknown as TBase &
		Constructor<LitElement & { hideBelow?: string; hideAbove?: string }>;
}
