import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const topNavigationBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_logo-width: var(--semantics-brand-ribbon-sm-width);
		--_logo-offset: 0px;
		--_logo-background-color: #154273;
		--_wordmark-content-color: light-dark(var(--primitives-color-reference-lintblauw), var(--primitives-color-neutral-1000));
		--_wordmark-max-width: 280px;
		--_max-width: var(--semantics-page-sections-body-max-width);

		${inheritedTextReset}
		container-type: inline-size;
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.top-navigation-bar {
		/* The ribbon's width, and with it everything measured against the ribbon:
		   its own height and the wordmark beside it. Here rather than on :host,
		   because a container query cannot measure the container it sits on. */
		--_logo-height: calc(var(--_logo-width) * 2);

		@container (max-width: ${smMax}) {
			--_logo-width: var(--semantics-brand-ribbon-sm-width);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			--_logo-width: var(--semantics-brand-ribbon-md-width);
		}

		@container (min-width: ${lgMin}) {
			--_logo-width: var(--semantics-brand-ribbon-lg-width);
		}

		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;

		/* The page-section inline margin lives on the wrapper; each bar caps to
		   the content width and centers, so bar content lines up with page
		   sections. width=full drops the cap (bars fill the margin box). */
		@container (max-width: ${smMax}) {
			padding-inline: var(--semantics-page-sections-sm-margin-inline);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-inline: var(--semantics-page-sections-md-margin-inline);
		}

		@container (min-width: ${lgMin}) {
			padding-inline: var(--semantics-page-sections-lg-margin-inline);
		}
	}

	:host([width="full"]) {
		--_max-width: none;
	}


	/* # Logo bar */

	.top-navigation-bar__logo-bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--primitives-space-8);
		align-items: center;
		width: 100%;
		max-width: var(--_max-width);
	}

	/* ## Logo */

	.top-navigation-bar__logo {
		display: flex;
		width: var(--_logo-width);
		height: var(--_logo-height);
		grid-column: 2;
		align-self: start;
		align-items: center;
		justify-content: center;
	}

	/* WebKit only: Chrome paints nothing above the page and leaves the fixed
	   ::after behind, so a hard pull shows a gap between it and the logo. */
	@supports (animation-timeline: scroll()) and (font: -apple-system-body) {
		.top-navigation-bar__logo {
			position: relative;
		}

		/* The ribbon carries on above the page, seen when it is pulled down.
		   No z-index: Safari does not paint it above the page with one. */
		.top-navigation-bar__logo::before {
			content: '';
			position: absolute;
			bottom: calc(100% + var(--_logo-offset));
			left: 0;
			width: 100%;
			height: 100lvh;
			background-color: var(--_logo-background-color);
			pointer-events: none;
		}

		/* Safari only paints above the page while something fixed touches the
		   top edge. This sits behind the logo, gone as soon as the page scrolls. */
		.top-navigation-bar__logo::after {
			content: '';
			position: fixed;
			top: 0;
			z-index: -1;
			width: var(--_logo-width);
			height: var(--_logo-height);
			background-color: var(--_logo-background-color);
			pointer-events: none;
			animation: top-navigation-bar-ribbon-at-top linear both;
			animation-timeline: scroll(root);
			animation-range: 0 1px;
		}
	}

	@keyframes top-navigation-bar-ribbon-at-top {
		to {
			visibility: hidden;
		}
	}

	.top-navigation-bar__logo svg {
		width: 100%;
		height: 100%;
	}

	a.top-navigation-bar__logo {
		color: inherit;
		text-decoration: none;
	}

	a.top-navigation-bar__logo:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	/* ## Logo and wordmark */

	.top-navigation-bar__logo-and-wordmark {
		display: grid;
		grid-column: 2 / 4;
		grid-template-columns: subgrid;
		align-items: center;
	}

	.top-navigation-bar__logo-and-wordmark > .top-navigation-bar__logo {
		grid-column: 1;
	}

	.top-navigation-bar__logo-and-wordmark > .top-navigation-bar__wordmark {
		grid-column: 2;
	}

	/* The link spans the wordmark's whole track so the ribbon stays centered;
	   only the ribbon and the text take the click, not the space beside them. */
	a.top-navigation-bar__logo-and-wordmark {
		pointer-events: none;
		text-decoration: none;
	}

	a.top-navigation-bar__logo-and-wordmark > .top-navigation-bar__logo,
	a.top-navigation-bar__logo-and-wordmark .top-navigation-bar__wordmark-content > p {
		pointer-events: auto;
	}

	a.top-navigation-bar__logo-and-wordmark .top-navigation-bar__wordmark-content > p {
		width: fit-content;
	}

	a.top-navigation-bar__logo-and-wordmark:focus-visible {
		outline: none;
	}

	a.top-navigation-bar__logo-and-wordmark:focus-visible > .top-navigation-bar__logo {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	/* ## Wordmark */

	.top-navigation-bar__wordmark {
		box-sizing: border-box;
		display: flex;
		/* A grid item is at least as wide as its longest word unless told
		   otherwise, and the column it sits in is one of the two that keep the
		   ribbon centred. One unbreakable name would push the ribbon off centre
		   and the page past the screen. */
		min-width: 0;
		min-height: var(--_logo-height);
		grid-column: 3;
		flex-direction: column;
		color: var(--_wordmark-content-color);

		/* The distance the text keeps from the top edge once it outgrows the
		   ribbon. Only at the top: space under it would raise the bar for
		   nothing. The minimum gives up the same 12, so the text still centres
		   on the middle of the ribbon rather than 6px below it. */
		@container (max-width: ${smMax}) {
			align-self: start;
			min-height: calc(var(--_logo-height) - var(--primitives-space-12));
			padding-block-start: var(--primitives-space-12);
		}
	}

	.top-navigation-bar__wordmark-spacer {
		height: var(--_logo-width);
		flex-grow: 0;
		flex-shrink: 0;

		@container (max-width: ${smMax}) {
			display: none;
		}
	}

	.top-navigation-bar__wordmark-content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 50%;
		max-width: var(--_wordmark-max-width);
		/* anywhere rather than break-word: only this one takes the break into
		   the min-content width, which is what the track measures. A name that
		   cannot break wraps mid-word here, because a name cut off by an
		   ellipsis cannot be read at all. */
		overflow-wrap: anywhere;

		/* Centred against the ribbon, and what does not fit grows downward: an
		   auto margin takes positive free space and never negative, so the text
		   cannot ride up past the top. Growing is the flex item's job here, and
		   an item that grows leaves nothing for the margins to centre with. */
		@container (max-width: ${smMax}) {
			flex-grow: 0;
			flex-basis: auto;
			margin-block: auto;
		}
	}

	.top-navigation-bar__wordmark-title {
		margin: 0;
		font: var(--primitives-font-body-sm-medium-flat);
		text-wrap: balance;
	}

	.top-navigation-bar__wordmark-subtitle {
		margin: 0;
		font: var(--primitives-font-body-xs-regular-flat);
		text-wrap: balance;
	}

	.top-navigation-bar__wordmark-supporting-text {
		margin: 0;
		font: var(--primitives-font-body-xxs-regular-flat);
		text-wrap: balance;
	}


	/* # Main bar */

	.top-navigation-bar__main-bar {
		display: flex;
		width: 100%;
		max-width: var(--_max-width);

		@container (max-width: ${smMax}) {
			flex-direction: column;
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			flex-direction: row;
			align-items: center;
			gap: var(--components-menu-bar-item-inline-padding);
		}

		@container (min-width: ${lgMin}) {
			flex-direction: row;
			align-items: center;
			gap: var(--components-menu-bar-item-inline-padding);
		}
	}

	/* ## Title bar */

	.top-navigation-bar__website-title-bar {
		display: flex;
		align-items: center;

		@container (max-width: ${smMax}) {
			justify-content: center;
		}

		@container (min-width: ${mdMin}) {
			padding-inline-end: var(--components-menu-bar-item-inline-padding);
			justify-content: flex-start;
		}
	}

	/* Without a logo above it the title is the first thing in the bar, so its
	   focus ring has nothing to sit in. Six is what that ring needs: two of
	   offset, two of outline, and the halo that follows it. */

	:host([no-logo]) .top-navigation-bar__website-title-bar {
		@container (max-width: ${smMax}) {
			padding-top: var(--primitives-space-6);
		}
	}

	/* ## Title */

	.top-navigation-bar__website-title {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		min-width: var(--semantics-controls-xs-min-size);
		min-height: var(--semantics-controls-xs-min-size);
		font: var(--components-top-navigation-bar-title-sm-font);
		color: var(--semantics-content-color);
		white-space: nowrap;

		@container (max-width: ${smMax}) {
			padding-top: var(--primitives-space-4);
		}

		@container (min-width: ${mdMin}) {
			font: var(--components-top-navigation-bar-title-md-font);
		}

		@container (min-width: ${lgMin}) {
			font: var(--components-top-navigation-bar-title-lg-font);
		}
	}

	a.top-navigation-bar__website-title {
		border-radius: var(--primitives-corner-radius-xxs);
		text-decoration: none;
	}

	a.top-navigation-bar__website-title:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	/* ## Menu bar */

	.top-navigation-bar__menu-bar {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: var(--primitives-space-12);
		flex-grow: 1;
		/* Pull the menu out by the menu-bar items own inline padding so the first
		   and last item text (not its hit-area) lines up with the content edge. */
		margin-inline: calc(-1 * var(--components-menu-bar-item-inline-padding));
	}

	/* ## Menu bar start */

	.top-navigation-bar__menu-bar-start {
		display: flex;
		min-width: 0;
		align-items: center;

		@container (max-width: ${mdMax}) {
			flex-grow: 0;
			flex-shrink: 0;
		}

		@container (min-width: ${lgMin}) {
			flex-grow: 1;
			flex-shrink: 1;
		}
	}

	/* ## Menu bar end */

	.top-navigation-bar__menu-bar-end {
		display: flex;
		min-width: 0;
		align-items: center;

		@container (max-width: ${mdMax}) {
			flex-grow: 1;
			flex-shrink: 1;
		}

		@container (min-width: ${lgMin}) {
			flex-grow: 0;
			flex-shrink: 0;
		}
	}

	/* ## Global bar */

	.top-navigation-bar__global-menu-bar {
		display: none;
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		@container (min-width: ${lgMin}) {
			:host(.has-global-items) & {
				display: flex;
			}
		}
	}

	/* ## Menu button */

	.top-navigation-bar__menu-button {
		display: none;

		@container (max-width: ${mdMax}) {
			:host(.has-global-items) & {
				display: inline-block;
			}
		}
	}

	/* ## Utility menu bar */

	.top-navigation-bar__utility-menu-bar {
		display: flex;
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		justify-content: flex-end;
	}

	slot[name="utility"]::slotted(nldd-menu-bar) {
		flex-grow: 0;
	}
`;
