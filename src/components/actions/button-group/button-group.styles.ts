import { css } from 'lit';

export const buttonGroupStyles = css`


	/* # Host */

	:host {
		--_button-group-flex-direction: column;
		--_button-group-flex-wrap: nowrap;
		--_button-group-gap: var(--primitives-space-8);

		box-sizing: border-box;
		display: flex;
		width: 100%;
	}

	/* Only auto asks its own width a question, so only auto becomes a container.
	   A container may not size itself from its contents, and a group pinned to a
	   row or a stack would then measure zero in a parent that shrink-wraps, for
	   a query it never runs. width="full" asks what fits instead. */
	:host(:not([orientation="horizontal"], [orientation="vertical"], [width="full"])) {
		container-type: inline-size;
	}

	:host([size="sm"]) {
		--_button-group-gap: var(--primitives-space-6);
	}

	:host([hidden]) {
		display: none;
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
	   Auto is the default: a row, and stacked over the full width in a container
	   of 30rem (480px) or less, the width of a phone, where two labels beside each
	   other leave no room for either. Not the sm breakpoint: a card or a dialog
	   between 480px and 640px still has room for a row.

	   Auto is matched as "neither of the other two" rather than as itself: the
	   attribute reflects only when it is not the default, so auto is written out
	   OR absent, and a rule that named it would have needed a second selector
	   beside it everywhere. */

	@container (max-width: 30rem) {
		:host(:not([orientation="horizontal"], [orientation="vertical"], [width="full"])) .button-group {
			--_button-group-flex-direction: column;
			--context-button-width: 100%;
		}

		/* display as well as width: a button host shrink-wraps as inline-flex, so
		   width alone leaves the button itself content-sized in a stretched box.
		   An icon-only control is the exception: its size is its icon, and a
		   full-width bar with one glyph in the middle is not a bigger target for
		   the thumb, just a wider one. */
		:host(:not([orientation="horizontal"], [orientation="vertical"], [width="full"])) ::slotted(:not(nldd-icon-button)) {
			display: block;
			width: 100%;
		}

		/* align-self as well: a column stretches its items across the full width
		   on its own, so without this the icon button is a wide bar regardless of
		   the width rule above. */
		:host(:not([orientation="horizontal"], [orientation="vertical"], [width="full"])) ::slotted(nldd-icon-button) {
			align-self: flex-start;
		}
	}

	/* ## Vertical */

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

	/* ## Full width
	   Equal shares from zero. With auto no button shrinks below its label (or the
	   group), so one that does not fit wraps and fills the next line. */

	:host([width="full"]:not([orientation="vertical"])) .button-group {
		--context-button-width: 100%;
	}

	:host([width="full"][orientation="horizontal"]) .button-group {
		--_button-group-flex-wrap: nowrap;
	}

	:host([width="full"]:not([orientation="vertical"])) ::slotted(:not(nldd-icon-button)) {
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([width="full"]:not([orientation="horizontal"], [orientation="vertical"])) ::slotted(:not(nldd-icon-button)) {
		min-width: fit-content;
	}

	:host([width="full"]) ::slotted(nldd-icon-button) {
		flex-grow: 0;
		flex-shrink: 0;
	}

	/* The stack rules set display on slotted children at a higher specificity,
	   so without !important a hidden or a fourth button still shows. */
	::slotted([hidden]),
	::slotted(:nth-child(n + 4)) {
		display: none !important;
	}


	/* # Block */

	.button-group {
		display: flex;
		width: 100%;
		flex-direction: var(--_button-group-flex-direction);
		flex-wrap: var(--_button-group-flex-wrap);
		gap: var(--_button-group-gap);
	}
`;
