import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const titleStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-3-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-3-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-3-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-3-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-3-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-3-lg);
		}

		${inheritedTextReset}
		display: flex;
	}

	:host([size="1"]) {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-1-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-1-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-1-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-1-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-1-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-1-lg);
		}
	}

	:host([size="2"]) {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-2-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-2-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-2-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-2-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-2-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-2-lg);
		}
	}

	:host([size="4"]) {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-4-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-4-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-4-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-4-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-4-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-4-lg);
		}
	}

	:host([size="5"]) {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-5-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-5-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-5-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-5-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-5-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-5-lg);
		}
	}

	:host([size="6"]) {
		@media (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-6-sm);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-6-md);
		}

		@media (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-6-lg);
		}

		@container layout-container (max-width: ${smMax}) {
			--_font: var(--primitives-font-display-6-sm);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_font: var(--primitives-font-display-6-md);
		}

		@container layout-container (min-width: ${lgMin}) {
			--_font: var(--primitives-font-display-6-lg);
		}
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.title {
		display: flex;
		width: 100%;
		flex-direction: row;
		gap: var(--primitives-space-12);
		align-items: center;
	}


	/* # Elements */

	.title__title-group {
		display: flex;
		min-width: 0;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	.title__overline {
		margin: 0;
		color: var(--semantics-content-secondary-color);
		font: var(--primitives-font-body-sm-regular-tight);
		overflow-wrap: anywhere;
	}

	::slotted([slot="overline"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		color: var(--semantics-content-secondary-color) !important;
		font: var(--primitives-font-body-sm-regular-tight) !important;
		overflow-wrap: anywhere !important;
	}

	/* The measure is in ch, so one value covers every size: ch scales with the
	   font, and 40 characters stays 40 characters at 18px and at 52px. */
	.title__text {
		margin: 0;
		max-width: 40ch;
		color: var(--semantics-content-color);
		font: var(--_font);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	::slotted(:not([slot])) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		max-width: 40ch !important;
		color: var(--semantics-content-color) !important;
		font: var(--_font) !important;
		overflow-wrap: anywhere !important;
		text-wrap: balance !important;
	}

	.title__supporting-text {
		margin: 0;
		color: var(--semantics-content-secondary-color);
		font: var(--primitives-font-body-md-regular-tight);
		overflow-wrap: anywhere;
	}

	::slotted([slot="supporting-text"]) {
		${slottedReset}
		${inheritedTextReset}
		margin: 0 !important;
		color: var(--semantics-content-secondary-color) !important;
		font: var(--primitives-font-body-md-regular-tight) !important;
		overflow-wrap: anywhere !important;
	}

	:host([size="5"]) .title__supporting-text,
	:host([size="6"]) .title__supporting-text {
		font: var(--primitives-font-body-sm-regular-tight);
	}

	:host([size="5"]) ::slotted([slot="supporting-text"]),
	:host([size="6"]) ::slotted([slot="supporting-text"]) {
		font: var(--primitives-font-body-sm-regular-tight) !important;
	}

	:host([color="inherit"]) .title__text {
		color: inherit;
	}

	:host([color="inherit"]) .title__overline,
	:host([color="inherit"]) .title__supporting-text {
		color: color-mix(in oklab, currentColor var(--semantics-content-secondary-opacity), transparent);
	}

	/* !important matches the hardened slotted rules above. */

	:host([color="inherit"]) ::slotted(:not([slot])) {
		color: inherit !important;
	}

	:host([color="inherit"]) ::slotted([slot="overline"]),
	:host([color="inherit"]) ::slotted([slot="supporting-text"]) {
		color: color-mix(in oklab, currentColor var(--semantics-content-secondary-opacity), transparent) !important;
	}

	.title__end {
		display: flex;
		flex-direction: row;
		flex-shrink: 0;
		align-items: center;
	}
`;
