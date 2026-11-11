import { css, unsafeCSS } from 'lit';
import { queryBreakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(queryBreakpoints.smMax);
const mdMin = unsafeCSS(queryBreakpoints.mdMin);
const mdMax = unsafeCSS(queryBreakpoints.mdMax);
const lgMin = unsafeCSS(queryBreakpoints.lgMin);

const OVERLINE_SIZES: Record<number, string> = { 1: 'md', 2: 'md', 3: 'md', 4: 'sm', 5: 'sm', 6: 'xs' };
const SUPPORTING_TEXT_SIZES: Record<number, string> = { 1: 'md', 2: 'md', 3: 'md', 4: 'md', 5: 'sm', 6: 'sm' };

/** The display size n, for `size="display-n"` or for level n without a size, from the viewport and from a layout-container alike, with the overline and supporting text that go with it. */
function sizeRule(n: number): string {
	const at = (bp: string) => `--_title-font: var(--primitives-font-display-${n}-${bp});`;
	const queries: Array<[string, string]> = [
		['sm', `(max-width: ${queryBreakpoints.smMax})`],
		['md', `(min-width: ${queryBreakpoints.mdMin}) and (max-width: ${queryBreakpoints.mdMax})`],
		['lg', `(min-width: ${queryBreakpoints.lgMin})`],
	];
	return `
	:host([data-level][size="display-${n}"]),
	:host(:not([size^="display-"])[data-level="${n}"]) {
		--_title-overline-font: var(--primitives-font-body-${OVERLINE_SIZES[n]}-regular-tight);
		--_title-supporting-text-font: var(--primitives-font-body-${SUPPORTING_TEXT_SIZES[n]}-regular-tight);

${queries.map(([bp, q]) => `		@media ${q} {\n\t\t\t${at(bp)}\n\t\t}\n`).join('\n')}
${queries.map(([bp, q]) => `		@container layout-container ${q} {\n\t\t\t${at(bp)}\n\t\t}\n`).join('\n')}
	}
`;
}

export const titleStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_title-hyphenate-limit-before: 5;
		--_title-hyphenate-limit-after: 5;
		--_title-hyphenate-limit-chars: 12 var(--_title-hyphenate-limit-before) var(--_title-hyphenate-limit-after);
		--_title-sm-custom-size: initial;
		--_title-md-custom-size: initial;
		--_title-lg-custom-size: initial;
		--_title-sm-custom-font: var(--primitives-font-weight-display-bold) max(var(--_title-sm-custom-size), var(--primitives-font-size-700)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);
		--_title-md-custom-font: var(--primitives-font-weight-display-bold) max(var(--_title-md-custom-size), var(--primitives-font-size-800)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);
		--_title-lg-custom-font: var(--primitives-font-weight-display-bold) max(var(--_title-lg-custom-size), var(--primitives-font-size-1000)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);

		--_title-font: var(--primitives-font-body-md-regular-snug);
		--_title-overline-font: var(--primitives-font-body-sm-regular-tight);
		--_title-supporting-text-font: var(--primitives-font-body-md-regular-tight);
		--_title-secondary-text-max-width: var(--semantics-text-max-width);

		${inheritedTextReset}
		display: flex;
	}

	/* # Size */

	${unsafeCSS([1, 2, 3, 4, 5, 6].map((n) => sizeRule(n)).join('\n'))}

	/* ## Custom size */

	:host([data-level][data-sm-custom-size]) {
		@media (max-width: ${smMax}) {
			--_title-font: var(--_title-sm-custom-font);
		}

		@container layout-container (max-width: ${smMax}) {
			--_title-font: var(--_title-sm-custom-font);
		}
	}

	:host([data-level][data-md-custom-size]) {
		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_title-font: var(--_title-md-custom-font);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_title-font: var(--_title-md-custom-font);
		}
	}

	:host([data-level][data-lg-custom-size]) {
		@media (min-width: ${lgMin}) {
			--_title-font: var(--_title-lg-custom-font);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_title-font: var(--_title-lg-custom-font);
		}
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.title {
		display: flex;
		width: 100%;
		flex-direction: row;
		gap: var(--primitives-space-12);
		align-items: center;
	}


	/* # Elements */

	.title__title-group {
		display: flex;
		min-width: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	.title__overline {
		margin: 0;
		max-width: var(--_title-secondary-text-max-width);
		color: var(--semantics-content-secondary-color);
		font: var(--_title-overline-font);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	::slotted([slot="overline"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		max-width: var(--_title-secondary-text-max-width) !important;
		color: var(--semantics-content-secondary-color) !important;
		font: var(--_title-overline-font) !important;
		overflow-wrap: anywhere !important;
		text-wrap: balance !important;
	}

	/* The measure is in ch, so one value covers every size: ch scales with the
	   font, and 40 characters stays 40 characters at 18px and at 52px. */
	.title__text {
		margin: 0;
		max-width: 40ch;
		color: var(--semantics-content-color);
		font: var(--_title-font);
		overflow-wrap: anywhere;
		text-wrap: balance;
		-webkit-hyphens: auto;
		hyphens: auto;
		-webkit-hyphenate-limit-before: var(--_title-hyphenate-limit-before);
		-webkit-hyphenate-limit-after: var(--_title-hyphenate-limit-after);
		hyphenate-limit-chars: var(--_title-hyphenate-limit-chars);
	}

	::slotted(:not([slot])) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		max-width: 40ch !important;
		color: var(--semantics-content-color) !important;
		font: var(--_title-font) !important;
		overflow-wrap: anywhere !important;
		text-wrap: balance !important;
		-webkit-hyphens: auto !important;
		hyphens: auto !important;
		-webkit-hyphenate-limit-before: var(--_title-hyphenate-limit-before) !important;
		-webkit-hyphenate-limit-after: var(--_title-hyphenate-limit-after) !important;
		hyphenate-limit-chars: var(--_title-hyphenate-limit-chars) !important;
	}

	.title__supporting-text {
		margin: 0;
		max-width: var(--_title-secondary-text-max-width);
		color: var(--semantics-content-secondary-color);
		font: var(--_title-supporting-text-font);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	::slotted([slot="supporting-text"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		max-width: var(--_title-secondary-text-max-width) !important;
		color: var(--semantics-content-secondary-color) !important;
		font: var(--_title-supporting-text-font) !important;
		overflow-wrap: anywhere !important;
		text-wrap: balance !important;
	}

	:host([color="inherit"]) .title__text {
		color: inherit;
	}

	:host([color="inherit"]) .title__overline,
	:host([color="inherit"]) .title__supporting-text {
		color: color-mix(in oklab, currentColor var(--semantics-content-secondary-opacity), transparent);
	}

	/* !important matches the hardened slotted rules above. */

	:host([color="inherit"]) ::slotted(:not([slot])) {
		color: inherit !important;
	}

	:host([color="inherit"]) ::slotted([slot="overline"]),
	:host([color="inherit"]) ::slotted([slot="supporting-text"]) {
		color: color-mix(in oklab, currentColor var(--semantics-content-secondary-opacity), transparent) !important;
	}

	.title__end {
		display: flex;
		flex-direction: row;
		flex-shrink: 0;
		align-items: center;
	}
`;
