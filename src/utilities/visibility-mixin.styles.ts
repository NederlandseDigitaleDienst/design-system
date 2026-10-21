import { css, unsafeCSS, type CSSResult } from 'lit';
import { queryBreakpoints } from '../assets/styles/breakpoints.js';

const smMax = unsafeCSS(queryBreakpoints.smMax);
const mdMin = unsafeCSS(queryBreakpoints.mdMin);
const mdMax = unsafeCSS(queryBreakpoints.mdMax);
const lgMin = unsafeCSS(queryBreakpoints.lgMin);

// One sheet per container name, so every component passing the same name
// shares a single constructable stylesheet instead of each adopting its own.
const sheets = new Map<string, CSSResult>();

/**
 * The `@container` rules for the named `hide-below` / `hide-above` values.
 *
 * Static, so they reach the shadow root through `adoptedStyleSheets` instead
 * of a `<style>` element. That keeps consumers on a `style-src` without
 * `'unsafe-inline'`; a custom CSS length has no static form and gets its rule
 * from the mixin at runtime, into an adopted sheet of its own.
 *
 * The rules are nested (`:host { @container … }`) rather than flattened, because
 * `@container { :host { … } }` is unreliable in Safari.
 */
export function visibilityStyles(containerName?: string): CSSResult {
	const key = containerName ?? '';
	const cached = sheets.get(key);
	if (cached) return cached;

	const container = unsafeCSS(containerName ? `${containerName} ` : '');
	const sheet = css`
		/* # Hide below: the value names the breakpoint you hide BELOW */

		:host([hide-below="md"]) {
			@container ${container}(max-width: ${smMax}) { display: none !important; }
		}

		:host([hide-below="lg"]) {
			@container ${container}(max-width: ${mdMax}) { display: none !important; }
		}


		/* # Hide above */

		:host([hide-above="sm"]) {
			@container ${container}(min-width: ${mdMin}) { display: none !important; }
		}

		:host([hide-above="md"]) {
			@container ${container}(min-width: ${lgMin}) { display: none !important; }
		}
	`;

	sheets.set(key, sheet);
	return sheet;
}
