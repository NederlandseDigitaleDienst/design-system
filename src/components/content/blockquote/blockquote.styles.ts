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
		--_blockquote-quote-max-width: 30em;
		--_blockquote-sm-size: var(--primitives-font-size-200);
		--_blockquote-md-size: var(--primitives-font-size-300);
		--_blockquote-lg-size: var(--primitives-font-size-300);
		--_blockquote-sm-custom-size: initial;
		--_blockquote-md-custom-size: initial;
		--_blockquote-lg-custom-size: initial;
		--_blockquote-sized-font: italic var(--primitives-font-weight-body-regular) var(--_blockquote-quote-size) / var(--primitives-line-height-snug) var(--primitives-font-family-body);

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
	}

	:host([hidden]) {
		display: none;
	}

	/* ## Size */

	:host([size="lg"]) {
		--_blockquote-sm-size: var(--primitives-font-size-300);
		--_blockquote-md-size: var(--primitives-font-size-500);
		--_blockquote-lg-size: var(--primitives-font-size-700);
		--_blockquote-quote-font: var(--_blockquote-sized-font);

		@media (max-width: ${smMax}) {
			--_blockquote-quote-size: var(--_blockquote-sm-size);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-size: var(--_blockquote-md-size);
		}

		@media (min-width: ${lgMin}) {
			--_blockquote-quote-size: var(--_blockquote-lg-size);
		}

		@container layout-container (max-width: ${smMax}) {
			--_blockquote-quote-size: var(--_blockquote-sm-size);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-size: var(--_blockquote-md-size);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_blockquote-quote-size: var(--_blockquote-lg-size);
		}
	}

	/* ## Custom size */

	:host([data-sm-custom-size]) {
		@media (max-width: ${smMax}) {
			--_blockquote-quote-size: max(var(--_blockquote-sm-custom-size), var(--_blockquote-sm-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
		}

		@container layout-container (max-width: ${smMax}) {
			--_blockquote-quote-size: max(var(--_blockquote-sm-custom-size), var(--_blockquote-sm-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
		}
	}

	:host([data-md-custom-size]) {
		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-size: max(var(--_blockquote-md-custom-size), var(--_blockquote-md-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_blockquote-quote-size: max(var(--_blockquote-md-custom-size), var(--_blockquote-md-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
		}
	}

	:host([data-lg-custom-size]) {
		@media (min-width: ${lgMin}) {
			--_blockquote-quote-size: max(var(--_blockquote-lg-custom-size), var(--_blockquote-lg-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_blockquote-quote-size: max(var(--_blockquote-lg-custom-size), var(--_blockquote-lg-size));
			--_blockquote-quote-font: var(--_blockquote-sized-font);
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
		max-width: var(--_blockquote-quote-max-width);
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
