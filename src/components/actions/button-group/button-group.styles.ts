import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.ts';

const smMax = unsafeCSS(breakpoints.smMax);

export const buttonGroupStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_button-group-width: 100%;
		--_button-group-flex-direction: column;
		--_button-group-flex-wrap: nowrap;
		--_button-group-gap: var(--primitives-space-8);

		display: flex;
		width: 100%;
		justify-content: flex-start;
	}

	/* Only auto asks its own width a question, so only auto becomes a container.
	   A container may not size itself from its contents, and a group pinned to a
	   row or a stack would then measure zero in a parent that shrink-wraps, for
	   a query it never runs. */
	:host(:not([orientation="horizontal"], [orientation="vertical"])) {
		container-type: inline-size;
	}

	:host([size="sm"]) {
		--_button-group-gap: var(--primitives-space-6);
	}

	/* ## In a row
	   The row keeps the full width (like the stack) so full-width children
	   can actually stretch; content-sized buttons still sit left within
	   the row. */

	:host([orientation="horizontal"]),
	:host(:not([orientation="horizontal"], [orientation="vertical"])) {
		--_button-group-flex-direction: row;
		--_button-group-flex-wrap: wrap;
	}

	/* ## Auto
	   Auto is the default: a row, and stacked over the full width on a narrow
	   container, where two labels beside each other leave no room for either.

	   Auto is matched as "neither of the other two" rather than as itself: the
	   attribute reflects only when it is not the default, so auto is written out
	   OR absent, and a rule that named it would have needed a second selector
	   beside it everywhere. */

	@container (max-width: ${smMax}) {
		:host(:not([orientation="horizontal"], [orientation="vertical"])) .button-group {
			flex-direction: column;
			--context-button-width: 100%;
		}

		/* display as well as width: a button host shrink-wraps as inline-flex, so
		   width alone leaves the button itself content-sized in a stretched box.
		   An icon-only control is the exception: its size is its icon, and a
		   full-width bar with one glyph in the middle is not a bigger target for
		   the thumb, just a wider one. */
		:host(:not([orientation="horizontal"], [orientation="vertical"])) ::slotted(:not(nldd-icon-button)) {
			display: block;
			width: 100%;
		}

		/* align-self as well: a column stretches its items across the full width
		   on its own, so without this the icon button is a wide bar regardless of
		   the width rule above. */
		:host(:not([orientation="horizontal"], [orientation="vertical"])) ::slotted(nldd-icon-button) {
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

	/* The stacking rules above set display on every slotted child at a higher
	   specificity than this selector, so without !important a hidden button in
	   a stacked group stays in the row. */
	::slotted([hidden]) {
		display: none !important;
	}


	/* # Block */

	.button-group {
		display: flex;
		width: var(--_button-group-width);
		flex-direction: var(--_button-group-flex-direction);
		flex-wrap: var(--_button-group-flex-wrap);
		gap: var(--_button-group-gap);
	}
`;
