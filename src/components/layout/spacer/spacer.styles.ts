import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const spacerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_spacer-size: var(--primitives-space-16);

		display: block;
		width: var(--_spacer-size);
		height: var(--_spacer-size);
		flex-shrink: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Direction */

	:host([direction="horizontal"]) {
		height: auto;
	}

	:host([direction="vertical"]) {
		width: auto;
	}


	/* # Size — applies at every breakpoint */

	:host([size="2"]) { --_spacer-size: var(--primitives-space-2); }
	:host([size="4"]) { --_spacer-size: var(--primitives-space-4); }
	:host([size="6"]) { --_spacer-size: var(--primitives-space-6); }
	:host([size="8"]) { --_spacer-size: var(--primitives-space-8); }
	:host([size="10"]) { --_spacer-size: var(--primitives-space-10); }
	:host([size="12"]) { --_spacer-size: var(--primitives-space-12); }
	:host([size="20"]) { --_spacer-size: var(--primitives-space-20); }
	:host([size="24"]) { --_spacer-size: var(--primitives-space-24); }
	:host([size="28"]) { --_spacer-size: var(--primitives-space-28); }
	:host([size="32"]) { --_spacer-size: var(--primitives-space-32); }
	:host([size="40"]) { --_spacer-size: var(--primitives-space-40); }
	:host([size="44"]) { --_spacer-size: var(--primitives-space-44); }
	:host([size="48"]) { --_spacer-size: var(--primitives-space-48); }
	:host([size="56"]) { --_spacer-size: var(--primitives-space-56); }
	:host([size="64"]) { --_spacer-size: var(--primitives-space-64); }
	:host([size="80"]) { --_spacer-size: var(--primitives-space-80); }
	:host([size="96"]) { --_spacer-size: var(--primitives-space-96); }

	/* ## Size: flexible — takes all remaining space in the flex parent */

	:host([size="flexible"]) {
		min-width: 0;
		min-height: 0;
		width: auto;
		height: auto;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([size="flexible"][direction="horizontal"]) {
		min-height: auto;
	}

	:host([size="flexible"][direction="vertical"]) {
		min-width: auto;
	}


	/* # Per-viewport size overrides
	 *
	 * Each per-breakpoint attribute (sm-size / md-size / lg-size) sets the
	 * same --_spacer-size local var inside its respective @media query, so it wins
	 * over the base [size] selector at that breakpoint via cascade source
	 * order. If only [size] is set, --_spacer-size keeps the base value across all
	 * breakpoints.
	 */

	/* ## sm: max-width 640px */

	@media (max-width: ${smMax}) {
		:host([sm-size="2"]) { --_spacer-size: var(--primitives-space-2); }
		:host([sm-size="4"]) { --_spacer-size: var(--primitives-space-4); }
		:host([sm-size="6"]) { --_spacer-size: var(--primitives-space-6); }
		:host([sm-size="8"]) { --_spacer-size: var(--primitives-space-8); }
		:host([sm-size="10"]) { --_spacer-size: var(--primitives-space-10); }
		:host([sm-size="12"]) { --_spacer-size: var(--primitives-space-12); }
		:host([sm-size="16"]) { --_spacer-size: var(--primitives-space-16); }
		:host([sm-size="20"]) { --_spacer-size: var(--primitives-space-20); }
		:host([sm-size="24"]) { --_spacer-size: var(--primitives-space-24); }
		:host([sm-size="28"]) { --_spacer-size: var(--primitives-space-28); }
		:host([sm-size="32"]) { --_spacer-size: var(--primitives-space-32); }
		:host([sm-size="40"]) { --_spacer-size: var(--primitives-space-40); }
		:host([sm-size="44"]) { --_spacer-size: var(--primitives-space-44); }
		:host([sm-size="48"]) { --_spacer-size: var(--primitives-space-48); }
		:host([sm-size="56"]) { --_spacer-size: var(--primitives-space-56); }
		:host([sm-size="64"]) { --_spacer-size: var(--primitives-space-64); }
		:host([sm-size="80"]) { --_spacer-size: var(--primitives-space-80); }
		:host([sm-size="96"]) { --_spacer-size: var(--primitives-space-96); }

		:host([sm-size="flexible"]) {
			min-width: 0;
			min-height: 0;
			width: auto;
			height: auto;
			flex-grow: 1;
			flex-shrink: 1;
			flex-basis: 0;
		}

		:host([sm-size="flexible"][direction="horizontal"]) {
			min-height: auto;
		}

		:host([sm-size="flexible"][direction="vertical"]) {
			min-width: auto;
		}
	}

	/* ## md: 641px–1007px */

	@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
		:host([md-size="2"]) { --_spacer-size: var(--primitives-space-2); }
		:host([md-size="4"]) { --_spacer-size: var(--primitives-space-4); }
		:host([md-size="6"]) { --_spacer-size: var(--primitives-space-6); }
		:host([md-size="8"]) { --_spacer-size: var(--primitives-space-8); }
		:host([md-size="10"]) { --_spacer-size: var(--primitives-space-10); }
		:host([md-size="12"]) { --_spacer-size: var(--primitives-space-12); }
		:host([md-size="16"]) { --_spacer-size: var(--primitives-space-16); }
		:host([md-size="20"]) { --_spacer-size: var(--primitives-space-20); }
		:host([md-size="24"]) { --_spacer-size: var(--primitives-space-24); }
		:host([md-size="28"]) { --_spacer-size: var(--primitives-space-28); }
		:host([md-size="32"]) { --_spacer-size: var(--primitives-space-32); }
		:host([md-size="40"]) { --_spacer-size: var(--primitives-space-40); }
		:host([md-size="44"]) { --_spacer-size: var(--primitives-space-44); }
		:host([md-size="48"]) { --_spacer-size: var(--primitives-space-48); }
		:host([md-size="56"]) { --_spacer-size: var(--primitives-space-56); }
		:host([md-size="64"]) { --_spacer-size: var(--primitives-space-64); }
		:host([md-size="80"]) { --_spacer-size: var(--primitives-space-80); }
		:host([md-size="96"]) { --_spacer-size: var(--primitives-space-96); }

		:host([md-size="flexible"]) {
			min-width: 0;
			min-height: 0;
			width: auto;
			height: auto;
			flex-grow: 1;
			flex-shrink: 1;
			flex-basis: 0;
		}

		:host([md-size="flexible"][direction="horizontal"]) {
			min-height: auto;
		}

		:host([md-size="flexible"][direction="vertical"]) {
			min-width: auto;
		}
	}

	/* ## lg: min-width 1008px */

	@media (min-width: ${lgMin}) {
		:host([lg-size="2"]) { --_spacer-size: var(--primitives-space-2); }
		:host([lg-size="4"]) { --_spacer-size: var(--primitives-space-4); }
		:host([lg-size="6"]) { --_spacer-size: var(--primitives-space-6); }
		:host([lg-size="8"]) { --_spacer-size: var(--primitives-space-8); }
		:host([lg-size="10"]) { --_spacer-size: var(--primitives-space-10); }
		:host([lg-size="12"]) { --_spacer-size: var(--primitives-space-12); }
		:host([lg-size="16"]) { --_spacer-size: var(--primitives-space-16); }
		:host([lg-size="20"]) { --_spacer-size: var(--primitives-space-20); }
		:host([lg-size="24"]) { --_spacer-size: var(--primitives-space-24); }
		:host([lg-size="28"]) { --_spacer-size: var(--primitives-space-28); }
		:host([lg-size="32"]) { --_spacer-size: var(--primitives-space-32); }
		:host([lg-size="40"]) { --_spacer-size: var(--primitives-space-40); }
		:host([lg-size="44"]) { --_spacer-size: var(--primitives-space-44); }
		:host([lg-size="48"]) { --_spacer-size: var(--primitives-space-48); }
		:host([lg-size="56"]) { --_spacer-size: var(--primitives-space-56); }
		:host([lg-size="64"]) { --_spacer-size: var(--primitives-space-64); }
		:host([lg-size="80"]) { --_spacer-size: var(--primitives-space-80); }
		:host([lg-size="96"]) { --_spacer-size: var(--primitives-space-96); }

		:host([lg-size="flexible"]) {
			min-width: 0;
			min-height: 0;
			width: auto;
			height: auto;
			flex-grow: 1;
			flex-shrink: 1;
			flex-basis: 0;
		}

		:host([lg-size="flexible"][direction="horizontal"]) {
			min-height: auto;
		}

		:host([lg-size="flexible"][direction="vertical"]) {
			min-width: auto;
		}
	}
`;
