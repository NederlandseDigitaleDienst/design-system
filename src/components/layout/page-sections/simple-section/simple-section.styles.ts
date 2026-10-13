import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const simpleSectionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		container-type: inline-size;
		/* Block-padding overrides from PageSectionMixin; 'initial' makes the
		   var() in .simple-section fall back to the responsive default until the
		   mixin sets a value inline on the host. */
		--_simple-section-padding-top: initial;
		--_simple-section-padding-bottom: initial;
		--_simple-section-sm-padding-top: initial;
		--_simple-section-sm-padding-bottom: initial;
		--_simple-section-md-padding-top: initial;
		--_simple-section-md-padding-bottom: initial;
		--_simple-section-lg-padding-top: initial;
		--_simple-section-lg-padding-bottom: initial;
		--_simple-section-max-width: var(--semantics-page-sections-body-max-width);

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
		--_simple-section-max-width: none;
	}

	/* On the main rather than the body: the body also holds the header and the
	   footer, and the children land in the main. It is a flex column, so down the
	   section is the main axis and across it is the cross axis. */
	:host([vertical-alignment="center"]) .simple-section__main {
		justify-content: center;
	}

	:host([vertical-alignment="bottom"]) .simple-section__main {
		justify-content: flex-end;
	}

	:host([horizontal-alignment="center"]) .simple-section__main {
		align-items: center;
	}

	:host([horizontal-alignment="right"]) .simple-section__main {
		align-items: flex-end;
	}


	/* # Block */

	.simple-section {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;


		@container (max-width: ${smMax}) {
			padding-inline: var(--semantics-page-sections-sm-margin-inline);
			padding-top: var(--_simple-section-sm-padding-top, var(--_simple-section-padding-top, var(--semantics-page-sections-sm-margin-block)));
			padding-bottom: var(--_simple-section-sm-padding-bottom, var(--_simple-section-padding-bottom, var(--semantics-page-sections-sm-margin-block)));
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-inline: var(--semantics-page-sections-md-margin-inline);
			padding-top: var(--_simple-section-md-padding-top, var(--_simple-section-padding-top, var(--semantics-page-sections-md-margin-block)));
			padding-bottom: var(--_simple-section-md-padding-bottom, var(--_simple-section-padding-bottom, var(--semantics-page-sections-md-margin-block)));
		}

		@container (min-width: ${lgMin}) {
			padding-inline: var(--semantics-page-sections-lg-margin-inline);
			padding-top: var(--_simple-section-lg-padding-top, var(--_simple-section-padding-top, var(--semantics-page-sections-lg-margin-block)));
			padding-bottom: var(--_simple-section-lg-padding-bottom, var(--_simple-section-padding-bottom, var(--semantics-page-sections-lg-margin-block)));
		}
	}


	/* # Elements */

	.simple-section__body {
		display: flex;
		width: 100%;
		max-width: var(--_simple-section-max-width);
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

	.simple-section__header[hidden] {
		display: none;
	}

	.simple-section__main {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.simple-section__footer[hidden] {
		display: none;
	}
`;
