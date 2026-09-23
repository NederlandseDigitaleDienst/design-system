import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.ts';

const smMax = unsafeCSS(breakpoints.smMax);

export const buttonGroupStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_width: 100%;
		--_flex-direction: column;
		--_flex-wrap: nowrap;
		--_gap: var(--components-button-group-md-gap);

		display: flex;
		width: 100%;
		justify-content: flex-start;
		container-type: inline-size;
	}

	:host([size="sm"]) {
		--_gap: var(--components-button-group-sm-gap);
	}

	/* ## In a row
	   The row keeps the full width (like the stack) so full-width children
	   can actually stretch; content-sized buttons still sit left within
	   the row. */

	:host([orientation="horizontal"]),
	:host([orientation="auto"]),
	:host(:not([orientation])) {
		--_flex-direction: row;
		--_flex-wrap: wrap;
	}

	/* ## Auto
	   Auto is the default: a row, and stacked over the full width on a narrow
	   container, where two labels beside each other leave no room for either. */

	@container (max-width: ${smMax}) {
		:host([orientation="auto"]) .button-group,
		:host(:not([orientation])) .button-group {
			flex-direction: column;
			--context-button-width: 100%;
		}

		/* display as well as width: a button host shrink-wraps as inline-flex, so
		   width alone leaves the button itself content-sized in a stretched box. */
		:host([orientation="auto"]) ::slotted(*),
		:host(:not([orientation])) ::slotted(*) {
			display: block;
			width: 100%;
		}
	}

	:host([orientation="vertical"]) .button-group {
		--context-button-width: 100%;
	}

	:host([orientation="vertical"]) ::slotted(*) {
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	::slotted([hidden]) {
		display: none !important;
	}


	/* # Block */

	.button-group {
		display: flex;
		width: var(--_width);
		flex-direction: var(--_flex-direction);
		flex-wrap: var(--_flex-wrap);
		gap: var(--_gap);
	}
`;
