import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const bannerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host
	 *
	 * The visual framework lives on .banner, not :host: outer-document rules
	 * (a consumer's universal reset) beat normal :host declarations per CSS
	 * Scoping. The host only keeps the external contract. */

	:host {
		--_banner-corner-radius: var(--semantics-surfaces-corner-radius);
		--_banner-padding: var(--primitives-space-12);
		--_banner-background-color: var(--semantics-categories-neutral-tinted-background-color);
		--_banner-border-color: var(--semantics-categories-neutral-tinted-highlight-border-color);
		--_banner-border-width: var(--primitives-border-width-thin);
		--_banner-icon-color: var(--semantics-categories-neutral-tinted-content-color);
		--_banner-icon-size: var(--primitives-space-32);
		--_banner-content-color: var(--semantics-content-color);
		--_banner-text-icon-offset: calc((var(--_banner-icon-size) - var(--primitives-font-size-100) * var(--primitives-line-height-tight)) / 2);
		--_banner-column-gap: var(--primitives-space-8);
		--_banner-dismiss-inset: 0px;
		--_banner-dismissible-padding-right: calc(var(--_banner-dismiss-inset) + var(--semantics-controls-md-min-size));
		--_banner-main-gap: var(--primitives-space-8);
		--_banner-actions-gap: var(--primitives-space-4);

		${inheritedTextReset}
		display: block;
		width: 100%;
		color: var(--_banner-content-color);
	}

	:host([hidden]) {
		display: none;
	}

	/* The dismiss slot narrows with the icon-button the template swaps in, so
	   the reserved right padding tracks the control size rather than a fixed
	   value. --_banner-text-icon-offset follows --_banner-icon-size on its own.

	   --_banner-dismiss-inset pulls the 32px button up until its center sits on the
	   24px icon's center (8 - (32 - 24) / 2 = 4), and the same value on the
	   right gives the button equal air on both sides of its corner. */

	:host([size="sm"]) {
		--_banner-padding: var(--primitives-space-8);
		--_banner-icon-size: var(--primitives-space-24);
		--_banner-column-gap: var(--primitives-space-4);
		--_banner-dismiss-inset: calc(var(--_banner-padding) - (var(--semantics-controls-sm-min-size) - var(--_banner-icon-size)) / 2);
		--_banner-dismissible-padding-right: calc(var(--_banner-dismiss-inset) + var(--semantics-controls-sm-min-size));
	}

	:host([variant="accent"]) {
		--_banner-background-color: var(--semantics-categories-accent-tinted-background-color);
		--_banner-border-color: var(--semantics-categories-accent-tinted-highlight-border-color);
		--_banner-icon-color: var(--semantics-categories-accent-tinted-content-color);
	}

	:host([variant="success"]) {
		--_banner-background-color: var(--semantics-categories-success-tinted-background-color);
		--_banner-border-color: var(--semantics-categories-success-tinted-highlight-border-color);
		--_banner-icon-color: var(--semantics-categories-success-tinted-content-color);
	}

	:host([variant="warning"]) {
		--_banner-background-color: var(--semantics-categories-warning-tinted-background-color);
		--_banner-border-color: var(--semantics-categories-warning-tinted-highlight-border-color);
		--_banner-icon-color: var(--semantics-categories-warning-tinted-content-color);
	}

	:host([variant="critical"]) {
		--_banner-background-color: var(--semantics-categories-critical-tinted-background-color);
		--_banner-border-color: var(--semantics-categories-critical-tinted-highlight-border-color);
		--_banner-icon-color: var(--semantics-categories-critical-tinted-content-color);
	}

	/* # Block */

	.banner {
		box-sizing: border-box;
		display: grid;
		position: relative;
		border-radius: var(--_banner-corner-radius);
		box-shadow: inset 0 0 0 var(--_banner-border-width) var(--_banner-border-color);
		background-color: var(--_banner-background-color);
		padding: var(--_banner-padding);
		grid-template-columns: auto 1fr;
		gap: var(--_banner-column-gap);
	}

	:host([dismissible]) .banner {
		padding-right: var(--_banner-dismissible-padding-right);
	}

	@media (forced-colors: active) {
		.banner {
			border: var(--_banner-border-width) solid CanvasText;
		}
	}


	/* # Icon */

	.banner__icon {
		display: flex;
		grid-column: 1;
		grid-row: 1;
		width: var(--_banner-icon-size);
		align-items: flex-start;
		color: var(--_banner-icon-color);
	}


	/* # Main */

	.banner__main {
		display: flex;
		grid-column: 2;
		grid-row: 1;
		min-width: 0;
		flex-direction: column;
		gap: var(--_banner-main-gap);
	}

	.banner__heading {
		display: flex;
		padding-top: var(--_banner-text-icon-offset);
		flex-direction: column;
	}

	.banner__heading:has(.banner__supporting-text) {
		padding-top: calc(var(--_banner-text-icon-offset) - var(--primitives-space-2));
	}

	/* A banner carries text it did not write: a server message, an identifier, a
	   URL. One token longer than the banner is wide would otherwise run past the
	   edge and get clipped, so a word that cannot fit on a line of its own is
	   broken rather than lost. */
	.banner__text {
		margin: 0;
		overflow-wrap: break-word;
		font: var(--primitives-font-body-md-bold-tight);
		text-wrap: pretty;
	}

	.banner__supporting-text {
		margin: 0;
		overflow-wrap: break-word;
		font: var(--primitives-font-body-md-regular-tight);
		text-wrap: pretty;
	}

	.banner__content {
		display: contents;
	}

	.banner__content[hidden] {
		display: none;
	}

	.banner__actions {
		display: flex;
		margin-top: var(--_banner-actions-gap);
	}

	.banner__actions[hidden] {
		display: none;
	}


	/* # Dismiss */

	.banner__dismiss-button {
		display: flex;
		position: absolute;
		top: var(--_banner-dismiss-inset);
		right: var(--_banner-dismiss-inset);
	}
`;
