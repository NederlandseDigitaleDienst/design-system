import { css, unsafeCSS } from 'lit';
import { queryBreakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(queryBreakpoints.smMax);
const mdMin = unsafeCSS(queryBreakpoints.mdMin);
const mdMax = unsafeCSS(queryBreakpoints.mdMax);
const lgMin = unsafeCSS(queryBreakpoints.lgMin);

export const heroCornerStyles = css`


	/* # Corner */

	:host([data-media-corner]) {
		--_hero-corner-radius: calc(var(--semantics-brand-ribbon-sm-width) * 1.5);
		--_hero-media-corner-limit: initial;
		--_hero-main-corner-limit: initial;
	}

	/* On .hero, not :host: a var() resolves where it is declared, so on :host
	   this would halve the sm radius at every breakpoint. */
	:host([data-media-corner]) .hero {
		--_hero-media-corner-radius: min(var(--_hero-corner-radius), var(--_hero-media-corner-limit, var(--_hero-corner-radius)));
		--_hero-main-corner-radius: calc(var(--_hero-media-corner-radius) / 2);

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_hero-corner-radius: calc(var(--semantics-brand-ribbon-md-width) * 2);
		}

		@container (min-width: ${lgMin}) {
			--_hero-corner-radius: calc(var(--semantics-brand-ribbon-lg-width) * 2);
		}
	}

	:host([data-media-corner]:not([data-has-media])) .hero {
		--_hero-main-corner-radius: min(var(--_hero-corner-radius) / 2, var(--_hero-main-corner-limit, var(--_hero-corner-radius)));
	}

	/* ## Contained */

	:host([data-media-corner][data-has-media]) .hero {
		@container (min-width: ${mdMin}) {
			--_hero-main-inset: var(--primitives-space-0);
		}
	}

	:host([data-has-media]:is([data-main-corner="top-left"], [data-main-corner="top-right"])) .hero__main {
		@container (min-width: ${mdMin}) {
			margin-top: var(--_hero-corner-radius);
		}
	}

	:host([data-has-media]:is([data-main-corner="bottom-left"], [data-main-corner="bottom-right"])) .hero__main {
		@container (min-width: ${mdMin}) {
			margin-bottom: var(--_hero-corner-radius);
		}
	}

	/* On mobile the panel stands under the image instead of over its edge, as
	   wide as the image, so the rounded corner reads as the corner of one shape. */
	:host([data-media-corner][data-has-media]) .hero__main {
		@container (max-width: ${smMax}) {
			margin: 0;
		}
	}

	/* A panel along the same edge as the rounded corner of the image stops
	   before the curve, with the panel's own padding as the gap. */
	:host([data-has-media][main-position^="top"][data-media-corner^="top"]) .hero__main,
	:host([data-has-media]:is([main-position^="bottom"], :not([main-position]))[data-media-corner^="bottom"]) .hero__main {
		@container (min-width: ${mdMin}) {
			max-width: min(var(--_hero-main-max-width), 100% - var(--_hero-media-corner-radius) - var(--_hero-main-padding));
		}
	}

	:host([data-has-media][data-main-width-length][main-position^="top"][data-media-corner^="top"]) .hero__main,
	:host([data-has-media][data-main-width-length]:is([main-position^="bottom"], :not([main-position]))[data-media-corner^="bottom"]) .hero__main {
		@container (min-width: ${mdMin}) {
			max-width: calc(100% - var(--_hero-media-corner-radius) - var(--_hero-main-padding));
		}
	}

	/* ## Media */

	:host([data-has-media][data-media-corner="top-left"]) .hero__media {
		border-top-left-radius: var(--_hero-media-corner-radius);
	}

	:host([data-has-media][data-media-corner="top-right"]) .hero__media {
		border-top-right-radius: var(--_hero-media-corner-radius);
	}

	:host([data-has-media][data-media-corner="bottom-left"]) .hero__media {
		@container (min-width: ${mdMin}) {
			border-bottom-left-radius: var(--_hero-media-corner-radius);
		}

		@container (max-width: ${smMax}) {
			border-top-left-radius: var(--_hero-media-corner-radius);
		}
	}

	:host([data-has-media][data-media-corner="bottom-right"]) .hero__media {
		@container (min-width: ${mdMin}) {
			border-bottom-right-radius: var(--_hero-media-corner-radius);
		}

		@container (max-width: ${smMax}) {
			border-top-right-radius: var(--_hero-media-corner-radius);
		}
	}

	/* ## Main */

	:host([data-main-corner="top-left"]) .hero__main {
		@container (min-width: ${mdMin}) {
			border-top-left-radius: var(--_hero-main-corner-radius);
		}
	}

	:host([data-main-corner="top-right"]) .hero__main {
		@container (min-width: ${mdMin}) {
			border-top-right-radius: var(--_hero-main-corner-radius);
		}
	}

	:host([data-main-corner="bottom-left"]) .hero__main {
		@container (min-width: ${mdMin}) {
			border-bottom-left-radius: var(--_hero-main-corner-radius);
		}
	}

	:host([data-main-corner="bottom-right"]) .hero__main {
		@container (min-width: ${mdMin}) {
			border-bottom-right-radius: var(--_hero-main-corner-radius);
		}
	}

	/* Along the two sides of its rounded corner the panel takes more padding, so
	   the content keeps the usual padding to the curve as well:
	   r - (r - p) / sqrt(2), rounded up to a step of the scale. */
	:host([data-main-corner]) .hero {
		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_hero-main-corner-padding: var(--primitives-space-32);
		}

		@container (min-width: ${lgMin}) {
			--_hero-main-corner-padding: var(--primitives-space-40);
		}
	}

	:host(:is([data-main-corner="top-left"], [data-main-corner="top-right"])) .hero__main {
		@container (min-width: ${mdMin}) {
			padding-top: var(--_hero-main-corner-padding);
		}
	}

	:host(:is([data-main-corner="bottom-left"], [data-main-corner="bottom-right"])) .hero__main {
		@container (min-width: ${mdMin}) {
			padding-bottom: var(--_hero-main-corner-padding);
		}
	}

	:host(:is([data-main-corner="top-left"], [data-main-corner="bottom-left"])) .hero__main {
		@container (min-width: ${mdMin}) {
			padding-left: var(--_hero-main-corner-padding);
		}
	}

	:host(:is([data-main-corner="top-right"], [data-main-corner="bottom-right"])) .hero__main {
		@container (min-width: ${mdMin}) {
			padding-right: var(--_hero-main-corner-padding);
		}
	}

	/* ## Without media */

	:host(:not([data-has-media])[data-media-corner="top-left"]) :is(.hero__body, .hero__main) {
		border-top-left-radius: var(--_hero-main-corner-radius);
	}

	:host(:not([data-has-media])[data-media-corner="top-right"]) :is(.hero__body, .hero__main) {
		border-top-right-radius: var(--_hero-main-corner-radius);
	}

	:host(:not([data-has-media])[data-media-corner="bottom-left"]) :is(.hero__body, .hero__main) {
		border-bottom-left-radius: var(--_hero-main-corner-radius);
	}

	:host(:not([data-has-media])[data-media-corner="bottom-right"]) :is(.hero__body, .hero__main) {
		border-bottom-right-radius: var(--_hero-main-corner-radius);
	}

	:host(:not([data-has-media]):is([data-media-corner="top-left"], [data-media-corner="bottom-left"])) .hero__main {
		padding-left: calc(var(--_hero-main-padding) + var(--_hero-main-corner-radius) / 2);
	}

	:host(:not([data-has-media]):is([data-media-corner="top-right"], [data-media-corner="bottom-right"])) .hero__main {
		padding-right: calc(var(--_hero-main-padding) + var(--_hero-main-corner-radius) / 2);
	}
`;
