import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const tagStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_tag-corner-radius: var(--primitives-corner-radius-xs);
		--_tag-background-color: var(--semantics-categories-neutral-tinted-background-color);
		--_tag-min-height: var(--primitives-space-24);
		--_tag-inline-padding: var(--primitives-space-6);
		--_tag-gap: var(--primitives-space-3);
		--_tag-content-color: var(--semantics-categories-neutral-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-neutral-tinted-highlight-border-color);
		--_tag-border-width: var(--primitives-border-width-thin);
		--_tag-font: var(--primitives-font-body-sm-medium-flat);
		--_tag-icon-size: var(--primitives-space-16);
		--_tag-icon-offset-correction: var(--primitives-space-1);

		${inheritedTextReset}
		display: inline-flex;
		vertical-align: middle;
	}

	:host([size="sm"]) {
		--_tag-corner-radius: var(--primitives-corner-radius-xxs);
		--_tag-min-height: var(--primitives-space-20);
		--_tag-inline-padding: var(--primitives-space-4);
		--_tag-gap: var(--primitives-space-2);
		--_tag-font: var(--primitives-font-body-xs-medium-flat);
		--_tag-icon-size: var(--primitives-space-14);
	}

	/* ## Color */

	:host([color="accent"]) {
		--_tag-background-color: var(--semantics-categories-accent-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-accent-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-accent-tinted-highlight-border-color);
	}

	:host([color="success"]) {
		--_tag-background-color: var(--semantics-categories-success-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-success-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-success-tinted-highlight-border-color);
	}

	:host([color="warning"]) {
		--_tag-background-color: var(--semantics-categories-warning-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-warning-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-warning-tinted-highlight-border-color);
	}

	:host([color="critical"]) {
		--_tag-background-color: var(--semantics-categories-critical-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-critical-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-critical-tinted-highlight-border-color);
	}

	/* ### Rijkskleuren */

	:host([color="lintblauw"]) {
		--_tag-background-color: var(--semantics-categories-lintblauw-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-lintblauw-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-lintblauw-tinted-highlight-border-color);
	}

	:host([color="donkerblauw"]) {
		--_tag-background-color: var(--semantics-categories-donkerblauw-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-donkerblauw-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-donkerblauw-tinted-highlight-border-color);
	}

	:host([color="hemelblauw"]) {
		--_tag-background-color: var(--semantics-categories-hemelblauw-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-hemelblauw-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-hemelblauw-tinted-highlight-border-color);
	}

	:host([color="lichtblauw"]) {
		--_tag-background-color: var(--semantics-categories-lichtblauw-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-lichtblauw-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-lichtblauw-tinted-highlight-border-color);
	}

	:host([color="paars"]) {
		--_tag-background-color: var(--semantics-categories-paars-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-paars-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-paars-tinted-highlight-border-color);
	}

	:host([color="violet"]) {
		--_tag-background-color: var(--semantics-categories-violet-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-violet-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-violet-tinted-highlight-border-color);
	}

	:host([color="robijnrood"]) {
		--_tag-background-color: var(--semantics-categories-robijnrood-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-robijnrood-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-robijnrood-tinted-highlight-border-color);
	}

	:host([color="roze"]) {
		--_tag-background-color: var(--semantics-categories-roze-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-roze-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-roze-tinted-highlight-border-color);
	}

	:host([color="rood"]) {
		--_tag-background-color: var(--semantics-categories-rood-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-rood-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-rood-tinted-highlight-border-color);
	}

	:host([color="oranje"]) {
		--_tag-background-color: var(--semantics-categories-oranje-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-oranje-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-oranje-tinted-highlight-border-color);
	}

	:host([color="donkergeel"]) {
		--_tag-background-color: var(--semantics-categories-donkergeel-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-donkergeel-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-donkergeel-tinted-highlight-border-color);
	}

	:host([color="geel"]) {
		--_tag-background-color: var(--semantics-categories-geel-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-geel-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-geel-tinted-highlight-border-color);
	}

	:host([color="donkerbruin"]) {
		--_tag-background-color: var(--semantics-categories-donkerbruin-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-donkerbruin-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-donkerbruin-tinted-highlight-border-color);
	}

	:host([color="bruin"]) {
		--_tag-background-color: var(--semantics-categories-bruin-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-bruin-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-bruin-tinted-highlight-border-color);
	}

	:host([color="donkergroen"]) {
		--_tag-background-color: var(--semantics-categories-donkergroen-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-donkergroen-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-donkergroen-tinted-highlight-border-color);
	}

	:host([color="groen"]) {
		--_tag-background-color: var(--semantics-categories-groen-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-groen-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-groen-tinted-highlight-border-color);
	}

	:host([color="mosgroen"]) {
		--_tag-background-color: var(--semantics-categories-mosgroen-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-mosgroen-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-mosgroen-tinted-highlight-border-color);
	}

	:host([color="mintgroen"]) {
		--_tag-background-color: var(--semantics-categories-mintgroen-tinted-background-color);
		--_tag-content-color: var(--semantics-categories-mintgroen-tinted-content-color);
		--_tag-border-color: var(--semantics-categories-mintgroen-tinted-highlight-border-color);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.tag {
		box-sizing: border-box;
		display: inline-flex;
		border-radius: var(--_tag-corner-radius);
		/* Inset box-shadow rather than a border so the outline never adds to
		   the tag's size or shifts the text. */
		box-shadow: inset 0 0 0 var(--_tag-border-width) var(--_tag-border-color);
		background-color: var(--_tag-background-color);
		min-height: var(--_tag-min-height);
		padding: 0 var(--_tag-inline-padding);
		gap: var(--_tag-gap);
		align-items: center;
		color: var(--_tag-content-color);
		font: var(--_tag-font);
		white-space: nowrap;
	}

	@media (forced-colors: active) {
		.tag {
			border: var(--primitives-border-width-thin) solid CanvasText;
			background-color: Canvas;
			color: CanvasText;
		}
	}


	/* # Elements */

	.tag__icon {
		display: inline-flex;
		margin-inline: calc((var(--_tag-min-height) - var(--_tag-icon-size)) / 2 - var(--_tag-inline-padding));
		width: var(--_tag-icon-size);
		height: var(--_tag-icon-size);
		flex-shrink: 0;
		align-items: center;
	}

	.tag__icon:has(+ .tag__text) {
		margin-left: calc((var(--_tag-min-height) - var(--_tag-icon-size)) / 2 - var(--_tag-inline-padding) + var(--_tag-icon-offset-correction));
		margin-right: 0;
	}

	.tag__text {
		display: inline-block;
	}
`;
