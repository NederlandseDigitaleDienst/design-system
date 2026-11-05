import { css } from 'lit';


// # nldd-swatch-picker

export const swatchPickerStyles = css`


	/* # Host */

	:host {
		--_swatch-picker-gap: var(--primitives-space-8);

		box-sizing: border-box;
		display: block;
	}

	:host([size="xs"]),
	:host([size="sm"]) {
		--_swatch-picker-gap: var(--primitives-space-6);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.swatch-picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--_swatch-picker-gap);
	}
`;


// # nldd-swatch-picker-item

export const swatchPickerItemStyles = css`


	/* # Host */

	:host {
		--_swatch-picker-item-size: var(--semantics-controls-md-min-size);
		--_swatch-picker-item-custom-color: transparent;
		--_swatch-picker-item-background-color: var(--_swatch-picker-item-custom-color);
		--_swatch-picker-item-highlight-border-width: var(--primitives-border-width-thin);
		--_swatch-picker-item-highlight-border-color: light-dark(rgba(0, 0, 0, 0.15), rgba(255, 255, 255, 0.20));
		--_swatch-picker-item-indicator-size: 60%;
		--_swatch-picker-item-indicator-background-color: light-dark(rgba(255, 255, 255, 0.90), rgba(0, 0, 0, 0.60));
		--_swatch-picker-item-indicator-icon-size: 88%;
		--_swatch-picker-item-indicator-content-color: var(--primitives-color-neutral-1000);
		--context-tooltip-fingertip-size: var(--semantics-fingertip-size);
		/* The name sits over the swatch above it, and the swatches are what you
		   click: a click on the name lands on that swatch, not on this one. */
		--context-tooltip-pointer-events: none;

		box-sizing: border-box;
		display: inline-flex;
		border-radius: 50%;
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="xs"]) {
		--_swatch-picker-item-size: var(--semantics-controls-xs-min-size);
		--_swatch-picker-item-indicator-icon-size: 100%;
	}

	:host([size="sm"]) {
		--_swatch-picker-item-size: var(--semantics-controls-sm-min-size);
		--_swatch-picker-item-indicator-icon-size: 94%;
	}

	:host([color="lintblauw"]) { --_swatch-picker-item-background-color: var(--semantics-categories-lintblauw-filled-background-color); }
	:host([color="donkerblauw"]) { --_swatch-picker-item-background-color: var(--semantics-categories-donkerblauw-filled-background-color); }
	:host([color="hemelblauw"]) { --_swatch-picker-item-background-color: var(--semantics-categories-hemelblauw-filled-background-color); }
	:host([color="lichtblauw"]) { --_swatch-picker-item-background-color: var(--semantics-categories-lichtblauw-filled-background-color); }
	:host([color="paars"]) { --_swatch-picker-item-background-color: var(--semantics-categories-paars-filled-background-color); }
	:host([color="violet"]) { --_swatch-picker-item-background-color: var(--semantics-categories-violet-filled-background-color); }
	:host([color="robijnrood"]) { --_swatch-picker-item-background-color: var(--semantics-categories-robijnrood-filled-background-color); }
	:host([color="roze"]) { --_swatch-picker-item-background-color: var(--semantics-categories-roze-filled-background-color); }
	:host([color="rood"]) { --_swatch-picker-item-background-color: var(--semantics-categories-rood-filled-background-color); }
	:host([color="oranje"]) { --_swatch-picker-item-background-color: var(--semantics-categories-oranje-filled-background-color); }
	:host([color="donkergeel"]) { --_swatch-picker-item-background-color: var(--semantics-categories-donkergeel-filled-background-color); }
	:host([color="geel"]) { --_swatch-picker-item-background-color: var(--semantics-categories-geel-filled-background-color); }
	:host([color="donkerbruin"]) { --_swatch-picker-item-background-color: var(--semantics-categories-donkerbruin-filled-background-color); }
	:host([color="bruin"]) { --_swatch-picker-item-background-color: var(--semantics-categories-bruin-filled-background-color); }
	:host([color="donkergroen"]) { --_swatch-picker-item-background-color: var(--semantics-categories-donkergroen-filled-background-color); }
	:host([color="groen"]) { --_swatch-picker-item-background-color: var(--semantics-categories-groen-filled-background-color); }
	:host([color="mosgroen"]) { --_swatch-picker-item-background-color: var(--semantics-categories-mosgroen-filled-background-color); }
	:host([color="mintgroen"]) { --_swatch-picker-item-background-color: var(--semantics-categories-mintgroen-filled-background-color); }

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.swatch-picker__item {
		box-sizing: border-box;
		display: block;
		position: relative;
		border-radius: 50%;
		background-color: var(--_swatch-picker-item-background-color);
		width: var(--_swatch-picker-item-size);
		height: var(--_swatch-picker-item-size);
		overflow: hidden;
		forced-color-adjust: none;
	}

	.swatch-picker__item::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--_swatch-picker-item-highlight-border-width) var(--_swatch-picker-item-highlight-border-color);
		pointer-events: none;
	}

	:host(:focus-visible) .swatch-picker__item {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	@media (forced-colors: active) {
		:host(:focus-visible) .swatch-picker__item {
			outline: 2px solid Highlight;
			outline-offset: 2px;
		}
	}


	/* # Image */

	.swatch-picker__item-image {
		display: block;
		position: absolute;
		inset: 0;
		border-radius: inherit;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}


	/* # Indicator */

	.swatch-picker__item-indicator {
		display: flex;
		position: absolute;
		top: 50%;
		left: 50%;
		visibility: hidden;
		z-index: 1;
		border-radius: 50%;
		box-shadow: 0 0 0 var(--_swatch-picker-item-highlight-border-width) var(--_swatch-picker-item-highlight-border-color);
		background-color: var(--_swatch-picker-item-indicator-background-color);
		width: var(--_swatch-picker-item-indicator-size);
		height: var(--_swatch-picker-item-indicator-size);
		align-items: center;
		justify-content: center;
		color: var(--_swatch-picker-item-indicator-content-color);
		transform: translate(-50%, -50%);
	}

	:host([selected]) .swatch-picker__item-indicator {
		visibility: visible;
	}

	.swatch-picker__item-indicator-icon {
		display: flex;
		width: var(--_swatch-picker-item-indicator-icon-size);
		height: var(--_swatch-picker-item-indicator-icon-size);
	}
`;
