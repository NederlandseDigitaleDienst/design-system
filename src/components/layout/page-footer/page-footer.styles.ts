import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const pageFooterStyles = css`
	:host {
		box-sizing: border-box;
	}
	:host {
		--_page-footer-max-width: var(--semantics-page-sections-body-max-width);
		/* Official Rijksoverheid lintje color — identical across all
		   .rijks.app / .overheid.nl sites by visual-identity policy, so it
		   intentionally lives outside the semantic token system. Local
		   --_ var keeps the value discoverable in one place. */
		--_page-footer-lintje-color: #154273;
		--_page-footer-background-color: light-dark(var(--primitives-color-neutral-75), var(--primitives-color-neutral-50));
		--_page-footer-divider-color: light-dark(var(--primitives-color-neutral-200), var(--primitives-color-neutral-150));
		--context-parent-background-color: var(--_page-footer-background-color);

		container-type: inline-size;
		display: block;
		background-color: var(--_page-footer-background-color);
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}

	:host([empty]) {
		background-color: transparent;
	}

	:host([width="full"]) {
		--_page-footer-max-width: none;
	}

	.page-footer {
		--_page-footer-lintje-height: calc(var(--_page-footer-lintje-width) / 2);

		box-sizing: border-box;
		display: flex;
		position: relative;
		width: 100%;
		flex-direction: column;
		align-items: center;

		@container (max-width: ${smMax}) {
			padding-inline: var(--semantics-page-sections-sm-margin-inline);
			--_page-footer-lintje-width: var(--primitives-space-40);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-inline: var(--semantics-page-sections-md-margin-inline);
			--_page-footer-lintje-width: var(--primitives-space-44);
		}

		@container (min-width: ${lgMin}) {
			padding-inline: var(--semantics-page-sections-lg-margin-inline);
			--_page-footer-lintje-width: var(--primitives-space-48);
		}
	}

	/* Empty footer = only the lintje. Add top space equal to the lintje height
	   (container-type on :host makes a BFC, so this margin stays inside the
	   transparent host) so a preceding tinted page section doesn't butt right up
	   against the lintje. */
	:host([empty]) .page-footer {
		min-height: var(--_page-footer-lintje-height);
		margin-top: var(--_page-footer-lintje-height);
	}

	.page-footer::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		background-color: var(--_page-footer-lintje-color);
		width: var(--_page-footer-lintje-width);
		height: var(--_page-footer-lintje-height);
		transform: translateX(-50%);
	}

	@media (forced-colors: active) {
		.page-footer::after {
			background-color: ButtonText;
		}
	}

	.page-footer__body {
		display: flex;
		width: 100%;
		max-width: var(--_page-footer-max-width);
		flex-direction: column;
	}

	.page-footer__breadcrumbs,
	.page-footer__legal-bar {
		@container (max-width: ${smMax}) {
			padding-block: var(--primitives-space-16);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-block: var(--primitives-space-24);
		}

		@container (min-width: ${lgMin}) {
			padding-block: var(--primitives-space-24);
		}
	}

	.page-footer__main {
		@container (max-width: ${smMax}) {
			padding-block: var(--primitives-space-24);
		}

		@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-block: var(--primitives-space-32);
		}

		@container (min-width: ${lgMin}) {
			padding-block: var(--primitives-space-48);
		}
	}

	.page-footer__body > div:not([hidden]):not(:has(~ div:not([hidden]))) {
		padding-bottom: calc(var(--primitives-space-16) + var(--_page-footer-lintje-height));
	}

	:host([single-slot]) .page-footer__body > div:not([hidden]) {
		padding-top: calc(var(--primitives-space-16) + var(--_page-footer-lintje-height));
	}

	.page-footer__breadcrumbs[hidden],
	.page-footer__main[hidden],
	.page-footer__legal-bar[hidden],
	.page-footer__divider[hidden] {
		display: none;
	}

	.page-footer__divider {
		margin: 0;
		border: none;
		background-color: var(--_page-footer-divider-color);
		width: 100%;
		height: var(--semantics-dividers-thickness);
	}

	@media (forced-colors: active) {
		.page-footer__divider {
			background-color: CanvasText;
		}
	}
`;

export const pageFooterLegalBarStyles = css`
	:host {
		display: block;
	}

	:host([hidden]) {
		display: none;
	}

	.page-footer__legal-bar {
		display: flex;
		flex-wrap: wrap;
		row-gap: var(--primitives-space-4);
		column-gap: var(--primitives-space-16);
		align-items: flex-start;
		justify-content: space-between;
	}

	.page-footer__legal-bar-start {
		display: flex;
		flex-wrap: wrap;
		gap: var(--primitives-space-12);
		order: 0;
	}

	.page-footer__legal-bar-end {
		display: flex;
		flex-wrap: wrap;
		gap: var(--primitives-space-12);
		order: 1;
	}

	.page-footer__legal-bar-start[hidden],
	.page-footer__legal-bar-end[hidden] {
		display: none;
	}

	/* Without start items the end area is the only flex child, and space-between
	   puts a lone child at the start. The auto margin pushes it back to the end.
	   Scoped to this case so the wrapping behavior with both areas is untouched. */
	.page-footer__legal-bar-start[hidden] + .page-footer__legal-bar-end {
		margin-inline-start: auto;
	}
`;

export const pageFooterLegalBarItemStyles = css`
	:host {
		--_page-footer-legal-bar-item-color: var(--semantics-content-secondary-color);

		${inheritedTextReset}
		display: inline-flex;
	}

	:host([hidden]) {
		display: none;
	}

	.page-footer__legal-bar-item {
		display: inline-flex;
		color: var(--_page-footer-legal-bar-item-color);
		font: var(--primitives-font-body-sm-regular-tight);
	}

	.page-footer__legal-bar-item-link {
		color: var(--_page-footer-legal-bar-item-color);
		text-decoration: underline;
	}

	.page-footer__legal-bar-item-link:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		border-radius: var(--primitives-corner-radius-xs);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}
`;
