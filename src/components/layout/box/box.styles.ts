import { css } from 'lit';

export const boxStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--semantics-surfaces-corner-radius);
		--_background-color: var(--semantics-surfaces-tinted-background-color);
		--_border-width: var(--semantics-surfaces-border-width);
		--_border-color: var(--semantics-surfaces-tinted-border-color);
		--_highlight-border: inset 0 0 0 var(--_border-width) var(--_border-color);

		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Backgrounds */

	:host([background="base"]) {
		--_background-color: var(--semantics-surfaces-base-background-color);
		--_border-color: var(--semantics-surfaces-base-border-color);
	}

	:host([background="critical"]) {
		--_background-color: var(--semantics-categories-critical-tinted-background-color);
		--_border-color: var(--semantics-categories-critical-tinted-highlight-border-color);
	}


	/* # Block */

	.box {
		box-sizing: border-box;
		border-radius: var(--_corner-radius);
		box-shadow: var(--_highlight-border);
		background-color: var(--_background-color);
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		.box {
			border: var(--_border-width) solid CanvasText;
		}
	}
`;
