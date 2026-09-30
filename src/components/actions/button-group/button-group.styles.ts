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
		   width alone leaves the button itself content-sized in a stretched box.
		   An icon-only control is the exception: its size is its icon, and a
		   full-width bar with one glyph in the middle is not a bigger target for
		   the thumb, just a wider one. */
		:host([orientation="auto"]) ::slotted(:not(nldd-icon-button)),
		:host(:not([orientation])) ::slotted(:not(nldd-icon-button)) {
			display: block;
			width: 100%;
		}

		/* align-self as well: a column stretches its items across the full width
		   on its own, so without this the icon button is a wide bar regardless of
		   the width rule above. */
		:host([orientation="auto"]) ::slotted(nldd-icon-button),
		:host(:not([orientation])) ::slotted(nldd-icon-button) {
			align-self: flex-start;
		}
	}

	:host([orientation="vertical"]) .button-group {
		--context-button-width: 100%;
	}

	:host([orientation="vertical"]) ::slotted(:not(nldd-icon-button)) {
		display: block;
		width: 100%;
	}

	:host([orientation="vertical"]) ::slotted(nldd-icon-button) {
		align-self: flex-start;
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
