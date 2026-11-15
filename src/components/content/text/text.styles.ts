import { css, unsafeCSS, type CSSResult } from 'lit';
import { queryBreakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedBlockReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(queryBreakpoints.smMax);
const mdMin = unsafeCSS(queryBreakpoints.mdMin);
const mdMax = unsafeCSS(queryBreakpoints.mdMax);
const lgMin = unsafeCSS(queryBreakpoints.lgMin);

/** Sets --_text-font per breakpoint, from the viewport and from a layout-container alike, as nldd-title does. */
const fontPerBreakpoint = (host: string, sm: string, md: string, lg: string): CSSResult => css`
	${unsafeCSS(host)} {
		@media (max-width: ${smMax}) {
			--_text-font: ${unsafeCSS(sm)};
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_text-font: ${unsafeCSS(md)};
		}

		@media (min-width: ${lgMin}) {
			--_text-font: ${unsafeCSS(lg)};
		}

		@container layout-container (max-width: ${smMax}) {
			--_text-font: ${unsafeCSS(sm)};
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_text-font: ${unsafeCSS(md)};
		}

		@container layout-container (min-width: ${lgMin}) {
			--_text-font: ${unsafeCSS(lg)};
		}
	}
`;

/** Sets --_text-font at one breakpoint only, for a custom size. */
const fontAt = (host: string, query: CSSResult, containerQuery: CSSResult, font: string): CSSResult => css`
	${unsafeCSS(host)} {
		@media ${query} {
			--_text-font: ${unsafeCSS(font)};
		}

		@container layout-container ${containerQuery} {
			--_text-font: ${unsafeCSS(font)};
		}
	}
`;

const DISPLAY_SIZES = [6, 5, 4, 3, 2, 1];

export const textStyles = css`


	/* # Host */

	:host {
		--_text-font-size: var(--primitives-font-size-100);
		--_text-font-weight: var(--primitives-font-weight-body-regular);
		--_text-line-height: var(--primitives-line-height-snug);
		--_text-max-width: var(--semantics-text-max-width);
		--_text-font: var(--_text-font-weight) var(--_text-font-size) / var(--_text-line-height) var(--primitives-font-family-body);
		--_text-hyphenate-limit-before: 5;
		--_text-hyphenate-limit-after: 5;
		--_text-sm-custom-size: initial;
		--_text-md-custom-size: initial;
		--_text-lg-custom-size: initial;
		--_text-sm-custom-font: var(--primitives-font-weight-display-bold) max(var(--_text-sm-custom-size), var(--primitives-font-size-700)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);
		--_text-md-custom-font: var(--primitives-font-weight-display-bold) max(var(--_text-md-custom-size), var(--primitives-font-size-800)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);
		--_text-lg-custom-font: var(--primitives-font-weight-display-bold) max(var(--_text-lg-custom-size), var(--primitives-font-size-1000)) / var(--primitives-line-height-flat) var(--primitives-font-family-display);
		--_text-color: var(--context-content-color);
		--_text-align: left;

		display: block;
		max-width: var(--_text-max-width);
		color: var(--_text-color);
		text-align: var(--_text-align);
		font: var(--_text-font);
		text-wrap: pretty;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Size */

	:host([size="xxs"]) {
		--_text-font-size: var(--primitives-font-size-70);
	}

	:host([size="xs"]) {
		--_text-font-size: var(--primitives-font-size-80);
	}

	:host([size="sm"]) {
		--_text-font-size: var(--primitives-font-size-90);
	}

	:host([size="lg"]) {
		--_text-font-size: var(--primitives-font-size-200);
	}

	/* ## Display */

	${unsafeCSS(DISPLAY_SIZES.map((n) => fontPerBreakpoint(`:host([size="display-${n}"])`, `var(--primitives-font-display-${n}-sm)`, `var(--primitives-font-display-${n}-md)`, `var(--primitives-font-display-${n}-lg)`).cssText).join('\n'))}

	/* ## Custom size */

	${fontAt(':host([data-sm-custom-size])', css`(max-width: ${smMax})`, css`(max-width: ${smMax})`, 'var(--_text-sm-custom-font)')}
	${fontAt(':host([data-md-custom-size])', css`(min-width: ${mdMin}) and (max-width: ${mdMax})`, css`(min-width: ${mdMin}) and (max-width: ${mdMax})`, 'var(--_text-md-custom-font)')}
	${fontAt(':host([data-lg-custom-size])', css`(min-width: ${lgMin})`, css`(min-width: ${lgMin})`, 'var(--_text-lg-custom-font)')}

	/* The measure is in ch, as on nldd-title: 40em of large letters is a ruler. */
	:host([size^="display-"]),
	:host([data-sm-custom-size]),
	:host([data-md-custom-size]),
	:host([data-lg-custom-size]) {
		--_text-max-width: 40ch;

		overflow-wrap: anywhere;
		text-wrap: balance;
		-webkit-hyphens: auto;
		hyphens: auto;
		-webkit-hyphenate-limit-before: var(--_text-hyphenate-limit-before);
		-webkit-hyphenate-limit-after: var(--_text-hyphenate-limit-after);
		hyphenate-limit-chars: 12 var(--_text-hyphenate-limit-before) var(--_text-hyphenate-limit-after);
	}


	/* # Weight */

	:host([weight="medium"]) {
		--_text-font-weight: var(--primitives-font-weight-body-medium);
	}

	:host([weight="bold"]) {
		--_text-font-weight: var(--primitives-font-weight-body-bold);
	}


	/* # Slot */

	::slotted(:is(p, span)) {
		${slottedBlockReset}
	}

	.text {
		margin: 0;
		font: inherit;
	}


	/* # Line height */

	:host([line-height="flat"]) {
		--_text-line-height: var(--primitives-line-height-flat);
	}

	:host([line-height="tight"]) {
		--_text-line-height: var(--primitives-line-height-tight);
	}

	:host([line-height="loose"]) {
		--_text-line-height: var(--primitives-line-height-loose);
	}


	/* # Color */

	:host([color="secondary"]) {
		--_text-color: var(--context-content-secondary-color);
	}

	:host([color="accent"]) {
		--_text-color: var(--context-content-accent-color);
	}

	:host([color="success"]) {
		--_text-color: var(--context-content-success-color);
	}

	:host([color="warning"]) {
		--_text-color: var(--context-content-warning-color);
	}

	:host([color="critical"]) {
		--_text-color: var(--context-content-critical-color);
	}


	/* # Alignment */

	:host([horizontal-alignment="center"]) {
		--_text-align: center;
	}

	:host([horizontal-alignment="right"]) {
		--_text-align: right;
	}
`;
