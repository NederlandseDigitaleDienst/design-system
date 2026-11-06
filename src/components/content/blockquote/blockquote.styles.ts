import { css, unsafeCSS } from 'lit';
import { queryBreakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(queryBreakpoints.smMax);
const mdMin = unsafeCSS(queryBreakpoints.mdMin);
const mdMax = unsafeCSS(queryBreakpoints.mdMax);
const lgMin = unsafeCSS(queryBreakpoints.lgMin);

export const blockquoteStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_blockquote-spacing: var(--semantics-blockquotes-md-spacing);
		--_blockquote-quote-font: var(--semantics-blockquotes-md-quote-font);
		--_blockquote-attribution-font: var(--semantics-blockquotes-md-attribution-font);
		--_blockquote-sm-custom-size: initial;
		--_blockquote-md-custom-size: initial;
		--_blockquote-lg-custom-size: initial;
		--_blockquote-sm-custom-font: italic var(--primitives-font-weight-body-regular) max(var(--_blockquote-sm-custom-size), var(--primitives-font-size-200)) / var(--primitives-line-height-snug) var(--primitives-font-family-body);
		--_blockquote-md-custom-font: italic var(--primitives-font-weight-body-regular) max(var(--_blockquote-md-custom-size), var(--primitives-font-size-300)) / var(--primitives-line-height-snug) var(--primitives-font-family-body);
		--_blockquote-lg-custom-font: italic var(--primitives-font-weight-body-regular) max(var(--_blockquote-lg-custom-size), var(--primitives-font-size-300)) / var(--primitives-line-height-snug) var(--primitives-font-family-body);

		@media (max-width: ${smMax}) {
			--_blockquote-spacing: var(--semantics-blockquotes-sm-spacing);
			--_blockquote-quote-font: var(--semantics-blockquotes-sm-quote-font);
			--_blockquote-attribution-font: var(--semantics-blockquotes-sm-attribution-font);
		}

		@container layout-container (max-width: ${smMax}) {
			--_blockquote-spacing: var(--semantics-blockquotes-sm-spacing);
			--_blockquote-quote-font: var(--semantics-blockquotes-sm-quote-font);
			--_blockquote-attribution-font: var(--semantics-blockquotes-sm-attribution-font);
		}

		${inheritedTextReset}
		display: block;
		max-width: var(--semantics-blockquotes-max-width);
	}

	:host([hidden]) {
		display: none;
	}

	/* ## Custom size */

	:host([data-sm-custom-size]) {
		@media (max-width: ${smMax}) {
			--_blockquote-quote-font: var(--_blockquote-sm-custom-font);
		}

		@container layout-container (max-width: ${smMax}) {
			--_blockquote-quote-font: var(--_blockquote-sm-custom-font);
		}
	}

	:host([data-md-custom-size]) {
		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-font: var(--_blockquote-md-custom-font);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-font: var(--_blockquote-md-custom-font);
		}
	}

	:host([data-lg-custom-size]) {
		@media (min-width: ${lgMin}) {
			--_blockquote-quote-font: var(--_blockquote-lg-custom-font);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_blockquote-quote-font: var(--_blockquote-lg-custom-font);
		}
	}


	/* # Block */

	.blockquote {
		display: flex;
		margin: 0;
		border-left: var(--semantics-blockquotes-border);
		padding-inline: var(--_blockquote-spacing);
		padding-bottom: 0;
		flex-direction: column;
		gap: calc(var(--_blockquote-spacing) / 2);
		color: var(--semantics-content-color);
		text-wrap: pretty;
	}


	/* # Elements */

	.blockquote__quote {
		display: flex;
		flex-direction: column;
		gap: calc(1lh / 2);
		font: var(--_blockquote-quote-font);
	}

	.blockquote__attribution {
		display: block;
		font: var(--_blockquote-attribution-font);
	}

	.blockquote__attribution::before {
		content: '— ' / '';
	}

	.blockquote__attribution.is-identity::before {
		content: none;
	}

	.blockquote__attribution[hidden] {
		display: none;
	}

	::slotted(p) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
	}

	.blockquote__attribution::slotted(p) {
		display: inline !important;
	}
`;
