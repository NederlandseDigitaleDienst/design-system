import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);

export const blockquoteStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_blockquote-spacing: var(--semantics-blockquotes-md-spacing);
		--_blockquote-quote-font: var(--semantics-blockquotes-md-quote-font);
		--_blockquote-attribution-font: var(--semantics-blockquotes-md-attribution-font);

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
		gap: calc(var(--_blockquote-spacing) / 2);
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
