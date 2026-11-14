import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const termStyles = css`


	/* # Host */

	:host {
		--_term-corner-radius: var(--primitives-corner-radius-xs);
		--_term-underline-color: var(--context-content-secondary-color);
		--_term-is-hovered-underline-color: var(--context-content-color);

		${inheritedTextReset}
		display: inline;
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Term */

	.term {
		display: inline;
		border-radius: var(--_term-corner-radius);
		color: inherit;
		text-decoration: underline dotted;
		text-decoration-color: var(--_term-underline-color);
		text-underline-offset: 0.15em;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.term:hover {
			text-decoration-color: var(--_term-is-hovered-underline-color);
		}
	}


	/* # Focus */

	.term:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	.term:focus:not(:focus-visible) {
		outline: none;
	}

	@media (forced-colors: active) {
		.term {
			text-decoration-color: CanvasText;
		}

		.term:focus-visible {
			outline: 2px solid CanvasText;
		}
	}
`;
