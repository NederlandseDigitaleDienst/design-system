import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const fullBleedSectionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		container-type: inline-size;
		/* Block-padding overrides from PageSectionMixin; 'initial' lets the
		   block fall back to the responsive default until the mixin sets one. */
		--_full-bleed-section-padding-top: initial;
		--_full-bleed-section-padding-bottom: initial;
		--_full-bleed-section-sm-padding-top: initial;
		--_full-bleed-section-sm-padding-bottom: initial;
		--_full-bleed-section-md-padding-top: initial;
		--_full-bleed-section-md-padding-bottom: initial;
		--_full-bleed-section-lg-padding-top: initial;
		--_full-bleed-section-lg-padding-bottom: initial;
		--_full-bleed-section-max-width: var(--semantics-page-sections-body-max-width);

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
		--_full-bleed-section-max-width: none;
	}


	/* # Block */

	.full-bleed-section {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;


		@container (max-width: ${smMax}) {
			padding-top: var(--_full-bleed-section-sm-padding-top, var(--_full-bleed-section-padding-top, var(--semantics-page-sections-sm-margin-block)));
			padding-bottom: var(--_full-bleed-section-sm-padding-bottom, var(--_full-bleed-section-padding-bottom, var(--semantics-page-sections-sm-margin-block)));
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-top: var(--_full-bleed-section-md-padding-top, var(--_full-bleed-section-padding-top, var(--semantics-page-sections-md-margin-block)));
			padding-bottom: var(--_full-bleed-section-md-padding-bottom, var(--_full-bleed-section-padding-bottom, var(--semantics-page-sections-md-margin-block)));
		}

		@container (min-width: ${lgMin}) {
			padding-top: var(--_full-bleed-section-lg-padding-top, var(--_full-bleed-section-padding-top, var(--semantics-page-sections-lg-margin-block)));
			padding-bottom: var(--_full-bleed-section-lg-padding-bottom, var(--_full-bleed-section-padding-bottom, var(--semantics-page-sections-lg-margin-block)));
		}
	}


	/* # Elements */

	.full-bleed-section__body {
		display: flex;
		width: 100%;
		max-width: var(--_full-bleed-section-max-width);
		flex-direction: column;
		flex-grow: 1;

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

	.full-bleed-section__header[hidden] {
		display: none;
	}

	.full-bleed-section__main {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.full-bleed-section__footer[hidden] {
		display: none;
	}
`;
