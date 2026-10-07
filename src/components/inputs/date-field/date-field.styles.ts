import { css, unsafeCSS } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const mdMin = unsafeCSS(breakpoints.mdMin);

export const dateFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		/* Roomier than the text measures. Not to prevent clipping (the digits are
		   tabular, so every date measures the same), but as air around the date and
		   as a grip to select and drag by. */
		--_date-field-text-width: 10.5ch;
		/* Room reserved for the separator. The character itself gets its own width,
		   because it is translatable and would clip in a fixed box. Whatever that
		   reservation gets wrong is absorbed by the end date field. */
		--_date-field-separator-width: 3.5ch;
		--_date-field-separator-padding-right: var(--primitives-space-6);
		/* Left side of the field: it is a border-box, and padding-left already
		   subtracts one border, so both borders together add up to one extra. */
		--_date-field-edge-width: calc(var(--_date-field-inline-padding) + var(--semantics-input-fields-border-width));
		/* Everything that cannot shrink. Only the last date field stretches, so this
		   doubles as the lower bound: below it the calendar button would run out of
		   the field. */
		--_date-field-fixed-width: calc(var(--_date-field-edge-width) + var(--_date-field-trailing-width));
		--_date-field-width: calc(var(--_date-field-fixed-width) + var(--_date-field-text-width));
		--_date-field-corner-radius: var(--semantics-controls-md-corner-radius);
		--_date-field-background-color: var(--semantics-input-fields-background-color);
		--_date-field-min-size: var(--semantics-controls-md-min-size);
		--_date-field-inline-padding: var(--semantics-controls-md-inline-padding);
		--_date-field-text-font: var(--semantics-input-fields-md-text-font);
		--_date-field-validation-icon-size: var(--semantics-input-fields-md-validation-icon-size);
		/* As much air to the right of the button as above and below it, so derived
		   from the height difference between field and button instead of a fixed
		   value. */
		--_date-field-end-padding-right: calc((var(--_date-field-min-size) - var(--_date-field-picker-button-size)) / 2 - var(--semantics-input-fields-border-width));
		--_date-field-picker-button-size: var(--semantics-controls-sm-min-size);
		--_date-field-validation-icon-area-width: calc(var(--_date-field-min-size) - var(--semantics-input-fields-border-width) * 2);
		--_date-field-trailing-width: calc(var(--_date-field-validation-icon-area-width) + var(--_date-field-picker-button-size) + var(--_date-field-end-padding-right));

		${inheritedTextReset}
		display: block;
		width: var(--_date-field-width);
		min-width: var(--_date-field-fixed-width);
		max-width: 100%;
		font: var(--_date-field-text-font);
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	/* The default width reserves a slot for both the picker button and the
	   validation icon, so the field never resizes when a validation state appears.
	   Without the button one slot is enough. */
	/* 'fit-content' is not the CSS keyword here but this system's width word:
	   as wide as what is in it. Room held for a validation icon that is not
	   there is not in it, so what is left is the air the field needs between its
	   text and the picker button. The full slot comes back the moment a validation
	   state does, and the field grows at its trailing edge — after the picker
	   button, leaving the date, and a range's separator and end date, where it was. Opt-in, because only the consumer
	   knows whether this field is ever validated. */
	:host([width="fit-content"]:not([valid]):not([invalid])) {
		--_date-field-validation-icon-area-width: var(--primitives-space-8);
	}

	:host([no-picker]) {
		--_date-field-fixed-width: calc(var(--_date-field-edge-width) + var(--_date-field-inline-padding) + var(--_date-field-validation-icon-area-width));
	}

	:host([range]) {
		--_date-field-fixed-width: calc(var(--_date-field-edge-width) + var(--_date-field-text-width) + var(--_date-field-separator-width) + var(--_date-field-trailing-width));
	}

	:host([range][no-picker]) {
		--_date-field-fixed-width: calc(var(--_date-field-edge-width) + var(--_date-field-inline-padding) + var(--_date-field-text-width) + var(--_date-field-separator-width) + var(--_date-field-validation-icon-area-width));
	}

	:host([size="sm"]) {
		--_date-field-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_date-field-min-size: var(--semantics-controls-sm-min-size);
		--_date-field-inline-padding: var(--semantics-controls-sm-inline-padding);
		--_date-field-text-font: var(--semantics-input-fields-sm-text-font);
		--_date-field-validation-icon-size: var(--semantics-input-fields-sm-validation-icon-size);
		--_date-field-picker-button-size: var(--semantics-controls-xs-min-size);
	}


	/* # Block */

	.date-field {
		box-sizing: border-box;
		display: flex;
		border: var(--semantics-input-fields-border);
		border-radius: var(--_date-field-corner-radius);
		background-color: var(--_date-field-background-color);
		min-height: var(--_date-field-min-size);
		padding-left: calc(var(--_date-field-inline-padding) - var(--semantics-input-fields-border-width));
		flex-direction: row;
		align-items: center;
	}

	:host([valid]) .date-field {
		border-color: var(--semantics-input-fields-is-valid-border-color);
	}

	:host([invalid]) .date-field {
		border-color: var(--semantics-input-fields-is-invalid-border-color);
	}

	:host([readonly]) .date-field {
		--_date-field-background-color: var(--semantics-input-fields-is-read-only-background-color);
		border-color: var(--semantics-input-fields-is-read-only-border-color);
	}

	:host([disabled]) .date-field {
		opacity: var(--primitives-opacity-disabled);
	}

	.date-field:has(input:-webkit-autofill),
	.date-field:has(input:autofill) {
		--_date-field-background-color: var(--semantics-input-fields-is-autofill-background-color);
	}

	/* Keyed on the text input, not :focus-within: the calendar button and the
	   popover live inside this box too, so focus-within would draw a second ring
	   around the whole field while the button already has its own. */
	.date-field:has(.date-field__input:focus) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* # Elements */

	.date-field__input {
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		min-width: 0;
		min-height: calc(var(--_date-field-min-size) - var(--semantics-input-fields-border-width) * 2);
		overflow: hidden;
		padding: 0;
		flex-grow: 1;
		color: var(--semantics-content-color);
		font: var(--_date-field-text-font);
		appearance: none;
	}

	:host([disabled]) .date-field__input {
		pointer-events: none;
	}

	.date-field__input::placeholder {
		color: var(--semantics-input-fields-placeholder-color);
	}

	.date-field__input:-webkit-autofill,
	.date-field__input:autofill,
	.date-field__input:-webkit-autofill:disabled,
	.date-field__input:autofill:disabled {
		box-shadow: 0 0 0 999px var(--_date-field-background-color) inset;
		-webkit-text-fill-color: var(--semantics-input-fields-is-autofill-content-color);
	}

	/* Fixed size: if the start field grew and shrank along, the separator and the
	   end date would jump the moment the validation icon claims its room or the
	   field is set narrower. */
	:host([range]) .date-field__input {
		width: var(--_date-field-text-width);
		flex-grow: 0;
		flex-shrink: 0;
	}

	/* The end date does stretch and shrink, just as in a plain date field: it
	   comes after the separator, so nothing before it shifts. */
	:host([range]) .date-field__input:last-of-type {
		flex-grow: 1;
		flex-shrink: 1;
	}

	/* Room after it only: the start field is a little roomier than its text, and
	   that slack already supplies the room before it. Padding on both sides makes
	   it look lopsided on screen. */
	.date-field__separator {
		flex-shrink: 0;
		padding-right: var(--_date-field-separator-padding-right);
		color: var(--semantics-content-secondary-color);
	}

	.date-field__input-fade {
		position: relative;
		width: 0;
		flex-shrink: 0;
		align-self: stretch;
	}

	.date-field__input-fade::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--_date-field-corner-radius);
		background: linear-gradient(90deg, color-mix(in oklch, var(--_date-field-background-color) 0%, transparent) 0%, var(--_date-field-background-color) 100%);
		pointer-events: none;
		width: var(--primitives-space-8);
	}

	.date-field__validation-icon-area {
		display: flex;
		width: var(--_date-field-validation-icon-area-width);
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	:host([valid]) .date-field__validation-icon-area {
		color: var(--semantics-input-fields-is-valid-icon-color);
	}

	:host([invalid]) .date-field__validation-icon-area {
		color: var(--semantics-input-fields-is-invalid-icon-color);
	}

	.date-field__validation-icon {
		display: flex;
		width: var(--_date-field-validation-icon-size);
		height: var(--_date-field-validation-icon-size);
	}

	.date-field__picker-button {
		position: relative;
		flex-shrink: 0;
		padding-right: var(--_date-field-end-padding-right);
		display: flex;
		align-items: center;
	}


	/* The sheet's title bar only makes sense on a small screen, where the popover
	   becomes a bottom sheet. It shows by default and is hidden from md up. */
	@media (min-width: ${mdMin}) {
		.date-field__picker-button nldd-top-title-bar {
			display: none;
		}
	}
`;
