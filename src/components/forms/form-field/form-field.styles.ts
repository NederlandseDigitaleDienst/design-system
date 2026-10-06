import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const mdMin = unsafeCSS(breakpoints.mdMin);

export const formFieldStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_form-field-gap: var(--primitives-space-4);
		--_form-field-description-gap: var(--primitives-space-4);

		${inheritedTextReset}
		display: block;
		width: 100%;
		container-type: inline-size;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--_form-field-gap);
		isolation: isolate;
	}

	:host([label-alignment="left"]) .form-field,
	:host([label-alignment="right"]) .form-field,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field {
		@container (min-width: ${mdMin}) {
			flex-direction: row;
			gap: var(--semantics-forms-columns-gap);
			align-items: start;
		}
	}


	/* # Header */

	.form-field__header {
		box-sizing: border-box;
		display: flex;
		/* Paints above .form-field__main so a label descender stays readable where it
		   overlaps the input focus ring — this is what lets the top-aligned --_form-field-gap stay
		   tight. Reset to auto in the side-by-side layout below (no vertical overlap there). */
		z-index: 1;
		flex-direction: column;
	}

	:host([label-alignment="left"]) .form-field__header,
	:host([label-alignment="right"]) .form-field__header,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field__header,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field__header {
		@container (min-width: ${mdMin}) {
			z-index: auto;
			width: var(--semantics-forms-label-column-width);
			min-height: var(--semantics-controls-md-min-size);
			flex-grow: 0;
			flex-shrink: 0;
			justify-content: center;
		}
	}

	:host([label-alignment="right"]) .form-field__header,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field__header {
		@container (min-width: ${mdMin}) {
			align-items: end;
			text-align: right;
		}
	}

	:host([label-alignment="left"]) .form-field__header,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field__header {
		@container (min-width: ${mdMin}) {
			align-items: start;
			text-align: left;
		}
	}

	.form-field__header.is-empty {
		display: none;
	}

	:host([label-alignment="left"]) .form-field__header.is-empty,
	:host([label-alignment="right"]) .form-field__header.is-empty,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field__header.is-empty,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field__header.is-empty {
		@container (min-width: ${mdMin}) {
			display: flex;
		}
	}


	/* # Label */

	.form-field__label {
		display: inline-flex;
		gap: var(--primitives-space-4);
		align-items: baseline;
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-md-regular-flat);
		text-wrap: pretty;
	}

	:host([label-alignment="left"]) .form-field__label,
	:host([label-alignment="right"]) .form-field__label,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field__label,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field__label {
		@container (min-width: ${mdMin}) {
			display: flex;
			flex-direction: column;
			gap: var(--primitives-space-0);
		}
	}

	:host([label-alignment="right"]) .form-field__label,
	:host(:not([label-alignment])[form-label-alignment="right"]) .form-field__label {
		@container (min-width: ${mdMin}) {
			align-items: end;
		}
	}

	:host([label-alignment="left"]) .form-field__label,
	:host(:not([label-alignment])[form-label-alignment="left"]) .form-field__label {
		@container (min-width: ${mdMin}) {
			align-items: start;
		}
	}


	/* # Optional indicator */

	.form-field__optional {
		color: var(--semantics-content-secondary-color);
		font: var(--primitives-font-body-xs-regular-tight);
	}


	/* # Supporting label */

	.form-field__supporting-label {
		color: var(--semantics-content-secondary-color);
		font: var(--primitives-font-body-xs-regular-tight);
		text-wrap: pretty;
	}


	/* # Main */

	.form-field__main {
		display: flex;
		min-width: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	::slotted(nldd-validation-list) {
		margin-block-start: var(--_form-field-description-gap);
	}


`;

export const formFieldHelpTextStyles = css`


	/* # Host */

	:host {
		${inheritedTextReset}
		display: contents;
	}

	/* display: contents outranks the UA [hidden] rule, so restate it here or
	   consumers cannot hide the help text (e.g. behind a period toggle). */
	:host([hidden]) {
		display: none;
	}


	/* # Help text */

	.form-field__help-text {
		margin: var(--primitives-space-4) 0 0;
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-sm-regular-tight);
	}


	/* # Links */

	::slotted(a) {
		${slottedReset}
		${inheritedTextReset}
		border-radius: var(--primitives-corner-radius-xxs) !important;
		color: var(--semantics-links-color) !important;
		text-decoration: underline !important;
		text-underline-offset: var(--primitives-space-2) !important;
	}

	@media (hover: hover) {
		::slotted(a:hover) {
			color: var(--semantics-links-is-hovered-color) !important;
		}
	}

	::slotted(a:active) {
		color: var(--semantics-links-is-active-color) !important;
	}

	::slotted(a:focus-visible) {
		outline: var(--semantics-focus-ring-outline) !important;
		outline-offset: var(--semantics-focus-ring-outline-offset) !important;
		box-shadow: var(--semantics-focus-ring-box-shadow) !important;
	}

	::slotted(a:focus:not(:focus-visible)) {
		outline: none !important;
	}
`;
