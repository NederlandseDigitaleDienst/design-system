import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';
import { inheritedTextReset, slottedReset } from '../../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const heroStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		container-type: inline-size;
		/* Block-padding overrides from PageSectionMixin; 'initial' makes the
		   var() in .hero fall back to the responsive default until the mixin
		   sets a value inline on the host. */
		--_hero-padding-top: initial;
		--_hero-padding-bottom: initial;
		--_hero-sm-padding-top: initial;
		--_hero-sm-padding-bottom: initial;
		--_hero-md-padding-top: initial;
		--_hero-md-padding-bottom: initial;
		--_hero-lg-padding-top: initial;
		--_hero-lg-padding-bottom: initial;
		--_hero-max-width: var(--semantics-page-sections-body-max-width);
		--_hero-media-aspect-ratio: 21 / 9;
		--_hero-main-width: 50%;
		--_hero-main-background-color: var(--semantics-categories-accent-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-accent-reference-content-color);
		--_hero-main-padding: var(--primitives-space-16);
		--_hero-main-inset: 0;
		--_hero-sm-main-inset: var(--semantics-page-sections-sm-gap);

		${inheritedTextReset}
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
	}

	:host([hidden]) {
		display: none;
	}

	:host([data-growing]),
	:host([grow]) {
		flex-grow: 1;
	}

	:host([width="full"]) {
		--_hero-max-width: none;
	}

	:host([main-width="2/3"]) {
		--_hero-main-width: 66.667%;
	}

	:host([main-width="3/4"]) {
		--_hero-main-width: 75%;
	}

	:host([main-width="full"]) {
		--_hero-main-width: 100%;
	}

	:host([main-background="base"]) {
		--_hero-main-background-color: var(--semantics-surfaces-base-background-color);
		--_hero-main-content-color: var(--semantics-content-color);
	}

	:host([main-background="lintblauw"]) {
		--_hero-main-background-color: var(--semantics-categories-lintblauw-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-lintblauw-reference-content-color);
	}

	:host([main-background="donkerblauw"]) {
		--_hero-main-background-color: var(--semantics-categories-donkerblauw-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-donkerblauw-reference-content-color);
	}

	:host([main-background="hemelblauw"]) {
		--_hero-main-background-color: var(--semantics-categories-hemelblauw-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-hemelblauw-reference-content-color);
	}

	:host([main-background="lichtblauw"]) {
		--_hero-main-background-color: var(--semantics-categories-lichtblauw-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-lichtblauw-reference-content-color);
	}

	:host([main-background="paars"]) {
		--_hero-main-background-color: var(--semantics-categories-paars-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-paars-reference-content-color);
	}

	:host([main-background="violet"]) {
		--_hero-main-background-color: var(--semantics-categories-violet-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-violet-reference-content-color);
	}

	:host([main-background="robijnrood"]) {
		--_hero-main-background-color: var(--semantics-categories-robijnrood-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-robijnrood-reference-content-color);
	}

	:host([main-background="roze"]) {
		--_hero-main-background-color: var(--semantics-categories-roze-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-roze-reference-content-color);
	}

	:host([main-background="rood"]) {
		--_hero-main-background-color: var(--semantics-categories-rood-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-rood-reference-content-color);
	}

	:host([main-background="oranje"]) {
		--_hero-main-background-color: var(--semantics-categories-oranje-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-oranje-reference-content-color);
	}

	:host([main-background="donkergeel"]) {
		--_hero-main-background-color: var(--semantics-categories-donkergeel-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-donkergeel-reference-content-color);
	}

	:host([main-background="geel"]) {
		--_hero-main-background-color: var(--semantics-categories-geel-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-geel-reference-content-color);
	}

	:host([main-background="donkerbruin"]) {
		--_hero-main-background-color: var(--semantics-categories-donkerbruin-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-donkerbruin-reference-content-color);
	}

	:host([main-background="bruin"]) {
		--_hero-main-background-color: var(--semantics-categories-bruin-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-bruin-reference-content-color);
	}

	:host([main-background="donkergroen"]) {
		--_hero-main-background-color: var(--semantics-categories-donkergroen-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-donkergroen-reference-content-color);
	}

	:host([main-background="groen"]) {
		--_hero-main-background-color: var(--semantics-categories-groen-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-groen-reference-content-color);
	}

	:host([main-background="mosgroen"]) {
		--_hero-main-background-color: var(--semantics-categories-mosgroen-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-mosgroen-reference-content-color);
	}

	:host([main-background="mintgroen"]) {
		--_hero-main-background-color: var(--semantics-categories-mintgroen-reference-background-color);
		--_hero-main-content-color: var(--semantics-categories-mintgroen-reference-content-color);
	}


	/* # Block */

	.hero {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;

		/* The responsive overrides live here, not on :host — a container query
		   inside :host would match an ancestor container, while these must query
		   the host's own inline size. */

		@container (max-width: ${smMax}) {
			padding-inline: var(--semantics-page-sections-sm-margin-inline);
			padding-top: var(--_hero-sm-padding-top, var(--_hero-padding-top, calc(var(--semantics-page-sections-sm-margin-block) / 2)));
			padding-bottom: var(--_hero-sm-padding-bottom, var(--_hero-padding-bottom, var(--semantics-page-sections-sm-margin-block)));
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_hero-main-padding: var(--primitives-space-24);
			--_hero-main-inset: var(--semantics-page-sections-md-gap);
			padding-inline: var(--semantics-page-sections-md-margin-inline);
			padding-top: var(--_hero-md-padding-top, var(--_hero-padding-top, calc(var(--semantics-page-sections-md-margin-block) / 2)));
			padding-bottom: var(--_hero-md-padding-bottom, var(--_hero-padding-bottom, var(--semantics-page-sections-md-margin-block)));
		}

		@container (min-width: ${lgMin}) {
			--_hero-main-padding: var(--primitives-space-32);
			--_hero-main-inset: var(--semantics-page-sections-lg-gap);
			padding-inline: var(--semantics-page-sections-lg-margin-inline);
			padding-top: var(--_hero-lg-padding-top, var(--_hero-padding-top, calc(var(--semantics-page-sections-lg-margin-block) / 2)));
			padding-bottom: var(--_hero-lg-padding-bottom, var(--_hero-padding-bottom, var(--semantics-page-sections-lg-margin-block)));
		}
	}


	/* # Body
	   No overflow clipping here: it would zero the grid's automatic content
	   minimum and stop the hero from growing with the panel. The background
	   is painted in the panel color so subpixel seams between the media and
	   the panel (fractional aspect-ratio heights) never show as a light
	   hairline. */

	.hero__body {
		display: grid;
		position: relative;
		width: 100%;
		max-width: var(--_hero-max-width);
		flex-grow: 1;
		grid-template-columns: 100%;
	}

	:host(:not([data-has-media])) .hero__body {
		background-color: var(--_hero-main-background-color);
	}

	/* Without media a base-colored panel would be invisible on the base surface;
	   give it a full border so the rectangle reads. */
	:host(:not([data-has-media])[main-background="base"]) .hero__body {
		border: var(--primitives-border-width-regular) solid var(--semantics-content-color);
	}

	/* A ghost cell sets the body's minimum height from the aspect ratio
	   without forcing it: the panel shares the same grid cell, so a taller
	   panel grows the row past this floor. Putting the ratio on a ghost
	   (instead of aspect-ratio on the body) keeps growth content-driven
	   rather than rigidly tied to the width. align-self: start stops the
	   stretch fit from cancelling the ratio. */
	:host([data-has-media]) .hero__body::before {
		@container (min-width: ${mdMin}) {
			content: '';
			aspect-ratio: var(--_hero-media-aspect-ratio);
			grid-area: 1 / 1;
			align-self: start;
		}
	}

	@media (forced-colors: active) {
		.hero__body {
			border: var(--primitives-border-width-thin) solid CanvasText;
		}
	}


	/* # Media */

	.hero__media {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.hero__media[hidden] {
		display: none;
	}

	.hero__media ::slotted(img) {
		${slottedReset}
		display: block !important;
		width: 100% !important;
		height: 100% !important;
		object-fit: cover !important;
	}

	.hero__media ::slotted(nldd-image) {
		display: block !important;
		width: 100% !important;
		height: 100% !important;
	}

	.hero__media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}


	/* # Main */

	.hero__main {
		/* Cascade the panel color so descendants that key off the parent
		   background (inherit-filled buttons, badge rings) read this
		   surface. */
		--context-parent-background-color: var(--_hero-main-background-color);

		box-sizing: border-box;
		display: flex;
		position: relative;
		grid-area: 1 / 1;
		align-self: end;
		justify-self: start;
		background-color: var(--_hero-main-background-color);
		width: var(--_hero-main-width);
		padding: var(--_hero-main-padding);
		flex-direction: column;
		color: var(--_hero-main-content-color);
	}

	:host(:not([data-has-media])) .hero__main {
		width: 100%;
	}

	:host([data-has-media]) .hero__main {
		margin: var(--_hero-main-inset);
	}

	:host([data-has-media][main-width="full"]) .hero__main {
		justify-self: stretch;
		width: auto;
	}

	:host([main-position="top-left"]) .hero__main {
		align-self: start;
	}

	:host([main-position="top-right"]) .hero__main {
		align-self: start;
		justify-self: end;
	}

	:host([main-position="bottom-right"]) .hero__main {
		justify-self: end;
	}

	:host([main-position="bottom-center"]) .hero__main {
		justify-self: center;
	}

	:host([main-position="top-center"]) .hero__main {
		align-self: start;
		justify-self: center;
	}

	:host([main-position="left"]) .hero__main {
		align-self: stretch;
	}

	:host([main-position="right"]) .hero__main {
		align-self: stretch;
		justify-self: end;
	}

	@media (forced-colors: active) {
		.hero__main {
			border: var(--primitives-border-width-thin) solid CanvasText;
		}
	}


	/* # Mobile — the media on top, the panel below it, indented and overlapping
	   it a little. */

	@container (max-width: ${smMax}) {
		.hero__body {
			display: flex;
			flex-direction: column;
		}

		.hero__media {
			position: static;
			overflow: hidden;
			aspect-ratio: var(--_hero-media-aspect-ratio);
		}

		.hero__main {
			width: 100%;
		}

		:host([data-has-media]) .hero__main {
			margin: calc(-1 * var(--_hero-sm-main-inset)) var(--_hero-sm-main-inset) 0;
			width: auto;
			align-self: stretch;
		}
	}
`;
