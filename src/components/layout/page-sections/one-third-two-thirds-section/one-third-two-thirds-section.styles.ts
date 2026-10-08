import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const oneThirdTwoThirdsSectionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		container-type: inline-size;
		/* Block-padding overrides from PageSectionMixin; 'initial' lets the
		   block fall back to the responsive default until the mixin sets one. */
		--_one-third-two-thirds-section-padding-top: initial;
		--_one-third-two-thirds-section-padding-bottom: initial;
		--_one-third-two-thirds-section-sm-padding-top: initial;
		--_one-third-two-thirds-section-sm-padding-bottom: initial;
		--_one-third-two-thirds-section-md-padding-top: initial;
		--_one-third-two-thirds-section-md-padding-bottom: initial;
		--_one-third-two-thirds-section-lg-padding-top: initial;
		--_one-third-two-thirds-section-lg-padding-bottom: initial;
		--_one-third-two-thirds-section-max-width: var(--semantics-page-sections-body-max-width);

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
		--_one-third-two-thirds-section-max-width: none;
	}


	/* # Block */

	.one-third-two-thirds-section {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;


		@container (max-width: ${smMax}) {
			padding-inline: var(--semantics-page-sections-sm-margin-inline);
			padding-top: var(--_one-third-two-thirds-section-sm-padding-top, var(--_one-third-two-thirds-section-padding-top, var(--semantics-page-sections-sm-margin-block)));
			padding-bottom: var(--_one-third-two-thirds-section-sm-padding-bottom, var(--_one-third-two-thirds-section-padding-bottom, var(--semantics-page-sections-sm-margin-block)));
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-inline: var(--semantics-page-sections-md-margin-inline);
			padding-top: var(--_one-third-two-thirds-section-md-padding-top, var(--_one-third-two-thirds-section-padding-top, var(--semantics-page-sections-md-margin-block)));
			padding-bottom: var(--_one-third-two-thirds-section-md-padding-bottom, var(--_one-third-two-thirds-section-padding-bottom, var(--semantics-page-sections-md-margin-block)));
		}

		@container (min-width: ${lgMin}) {
			padding-inline: var(--semantics-page-sections-lg-margin-inline);
			padding-top: var(--_one-third-two-thirds-section-lg-padding-top, var(--_one-third-two-thirds-section-padding-top, var(--semantics-page-sections-lg-margin-block)));
			padding-bottom: var(--_one-third-two-thirds-section-lg-padding-bottom, var(--_one-third-two-thirds-section-padding-bottom, var(--semantics-page-sections-lg-margin-block)));
		}
	}


	/* # Elements */

	.one-third-two-thirds-section__body {
		display: flex;
		width: 100%;
		max-width: var(--_one-third-two-thirds-section-max-width);
		flex-direction: column;

		@container (max-width: ${smMax}) {
			gap: var(--semantics-page-sections-sm-gap);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			gap: var(--semantics-page-sections-md-gap);
		}

		@container (min-width: ${lgMin}) {
			gap: var(--semantics-page-sections-lg-gap);
		}
	}

	.one-third-two-thirds-section__header[hidden],
	.one-third-two-thirds-section__footer[hidden] {
		display: none;
	}

	.one-third-two-thirds-section__columns {
		display: flex;
		flex-wrap: wrap;

		/* Below ~768px the 2/3 column would shrink under 400px and read as
		   two near-equal columns; stack to a single column instead. nowrap
		   stops the column-direction wrap container from stretching the
		   shorter column to fill height. */
		@container (max-width: 768px) {
			flex-direction: column;
			flex-wrap: nowrap;
		}

		@container (max-width: ${smMax}) {
			gap: var(--semantics-page-sections-sm-gap);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			gap: var(--semantics-page-sections-md-gap);
		}

		@container (min-width: ${lgMin}) {
			gap: var(--semantics-page-sections-lg-gap);
		}
	}

	.one-third-two-thirds-section__left-column {
		min-width: var(--primitives-area-280);
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	.one-third-two-thirds-section__right-column {
		min-width: var(--primitives-area-280);
		flex-grow: 2;
		flex-shrink: 1;
		flex-basis: 0;
	}
`;
