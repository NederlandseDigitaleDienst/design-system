import { css } from 'lit';

export const boxStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_box-corner-radius: var(--semantics-surfaces-corner-radius);
		--_box-background-color: var(--semantics-surfaces-tinted-background-color);
		--_box-border-width: var(--semantics-surfaces-border-width);
		--_box-border-color: var(--semantics-surfaces-tinted-border-color);
		--_box-highlight-border: inset 0 0 0 var(--_box-border-width) var(--_box-border-color);

		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Backgrounds */

	:host([background="base"]) {
		--_box-background-color: var(--semantics-surfaces-base-background-color);
		--_box-border-color: var(--semantics-surfaces-base-border-color);
	}

	:host([background="critical"]) {
		--_box-background-color: var(--semantics-categories-critical-tinted-background-color);
		--_box-border-color: var(--semantics-categories-critical-tinted-highlight-border-color);
	}


	/* # Block */

	.box {
		box-sizing: border-box;
		border-radius: var(--_box-corner-radius);
		box-shadow: var(--_box-highlight-border);
		background-color: var(--_box-background-color);
	}


	/* # High Contrast */

	@media (forced-colors: active) {
		.box {
			border: var(--_box-border-width) solid CanvasText;
		}
	}
`;
