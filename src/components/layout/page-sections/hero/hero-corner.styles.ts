import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

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
