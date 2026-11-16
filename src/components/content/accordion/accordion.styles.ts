import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const accordionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_accordion-highlight-border-width: var(--semantics-surfaces-highlight-border-width);
		--_accordion-highlight-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_accordion-corner-radius: var(--primitives-corner-radius-lg);
		--_accordion-background-color: var(--semantics-surfaces-base-background-color);

		${inheritedTextReset}
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.accordion {
		box-sizing: border-box;
		display: block;
		border: var(--_accordion-highlight-border-width) solid var(--_accordion-highlight-border-color);
		border-radius: var(--_accordion-corner-radius);
		background-color: var(--_accordion-background-color);
	}

	@media (forced-colors: active) {
		.accordion {
			border-color: CanvasText;
		}
	}
`;
