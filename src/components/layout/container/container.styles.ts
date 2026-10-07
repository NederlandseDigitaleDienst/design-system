import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const containerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host — external contract; padding and the query container live on
	   .container in the shadow root, out of reach of consumer resets */

	:host {
		--_container-min-column-width: var(--primitives-area-280);
		--_container-width: 100%;
		--_container-min-width: auto;
		--_container-max-width: none;
		--_container-justify-content: initial;
		--_container-justify-items: initial;
		--_container-align-items: initial;
		--_container-sm-gap: 0;
		--_container-md-gap: 0;
		--_container-lg-gap: 0;
		--_container-gap: var(--_container-sm-gap);
		--_container-padding-top: 0;
		--_container-padding-right: 0;
		--_container-padding-bottom: 0;
		--_container-padding-left: 0;
		--_container-sm-padding-top: var(--_container-padding-top);
		--_container-sm-padding-right: var(--_container-padding-right);
		--_container-sm-padding-bottom: var(--_container-padding-bottom);
		--_container-sm-padding-left: var(--_container-padding-left);
		--_container-md-padding-top: var(--_container-padding-top);
		--_container-md-padding-right: var(--_container-padding-right);
		--_container-md-padding-bottom: var(--_container-padding-bottom);
		--_container-md-padding-left: var(--_container-padding-left);
		--_container-lg-padding-top: var(--_container-padding-top);
		--_container-lg-padding-right: var(--_container-padding-right);
		--_container-lg-padding-bottom: var(--_container-padding-bottom);
		--_container-lg-padding-left: var(--_container-padding-left);
		--_container-slot-order: 0;
		--_container-slot-sm-order: var(--_container-slot-order);
		--_container-slot-md-order: var(--_container-slot-order);
		--_container-slot-lg-order: var(--_container-slot-order);
		/* Two sets, because a container inside a layout-container follows that
		   container and anywhere else the viewport. Multicol reads the gap in three
		   rules, so the value is swapped here rather than declared in each. The
		   bare --_container-gap is what stands when neither set matches. */
		@media (max-width: ${smMax}) { --_container-gap: var(--_container-sm-gap); }
		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) { --_container-gap: var(--_container-md-gap); }
		@media (min-width: ${lgMin}) { --_container-gap: var(--_container-lg-gap); }

		@container layout-container (max-width: ${smMax}) { --_container-gap: var(--_container-sm-gap); }
		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) { --_container-gap: var(--_container-md-gap); }
		@container layout-container (min-width: ${lgMin}) { --_container-gap: var(--_container-lg-gap); }

		display: block;
		width: var(--_container-width);
		min-width: var(--_container-min-width);
		max-width: var(--_container-max-width);
		height: auto;
	}

	:host([width="fit-content"]) {
		--_container-width: fit-content;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Outer chrome — padding + query container. Size queries measure the
	   content box, so .container reports the same padded interior width the
	   host reported when it carried the padding itself. */

	.container {
		container-type: inline-size;
		box-sizing: border-box;
		padding-top: var(--_container-padding-top);
		padding-right: var(--_container-padding-right);
		padding-bottom: var(--_container-padding-bottom);
		padding-left: var(--_container-padding-left);

		@media (max-width: ${smMax}) {
			padding-top: var(--_container-sm-padding-top);
			padding-right: var(--_container-sm-padding-right);
			padding-bottom: var(--_container-sm-padding-bottom);
			padding-left: var(--_container-sm-padding-left);
		}

		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-top: var(--_container-md-padding-top);
			padding-right: var(--_container-md-padding-right);
			padding-bottom: var(--_container-md-padding-bottom);
			padding-left: var(--_container-md-padding-left);
		}

		@media (min-width: ${lgMin}) {
			padding-top: var(--_container-lg-padding-top);
			padding-right: var(--_container-lg-padding-right);
			padding-bottom: var(--_container-lg-padding-bottom);
			padding-left: var(--_container-lg-padding-left);
		}

		@container layout-container (max-width: ${smMax}) {
			padding-top: var(--_container-sm-padding-top);
			padding-right: var(--_container-sm-padding-right);
			padding-bottom: var(--_container-sm-padding-bottom);
			padding-left: var(--_container-sm-padding-left);
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			padding-top: var(--_container-md-padding-top);
			padding-right: var(--_container-md-padding-right);
			padding-bottom: var(--_container-md-padding-bottom);
			padding-left: var(--_container-md-padding-left);
		}

		@container layout-container (min-width: ${lgMin}) {
			padding-top: var(--_container-lg-padding-top);
			padding-right: var(--_container-lg-padding-right);
			padding-bottom: var(--_container-lg-padding-bottom);
			padding-left: var(--_container-lg-padding-left);
		}
	}


	/* # Inner — actual layout */

	.container__inner {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: var(--_container-justify-content);
		justify-items: var(--_container-justify-items);
		align-items: var(--_container-align-items);
		gap: var(--_container-gap);
	}

	:host([layout="row"]) .container__inner {
		flex-direction: row;
	}

	:host([layout="wrap"]) .container__inner {
		flex-direction: row;
		flex-wrap: wrap;
	}

	:host([layout="grid"]) .container__inner {
		display: grid;
		grid-template-columns: repeat(
			var(--_container-column-count, auto-fit),
			minmax(var(--_container-track-min, var(--_container-min-column-width)), 1fr)
		);
	}

	:host([layout="columns"]) .container__inner {
		display: block;
		columns: var(--_container-min-column-width);
		column-gap: var(--_container-gap);
	}

	:host([layout="columns"]) ::slotted(*) {
		break-inside: avoid;
	}

	/* Lanes â native CSS grid-lanes where supported, CSS multicol fallback
	   otherwise. CSS-only (no JS). Fallback flows column-order; native lanes
	   packs shortest-column (row-order). */
	:host([layout="lanes"]) .container__inner {
		display: block;
		columns: var(--_container-min-column-width);
		column-gap: var(--_container-gap);
	}

	:host([layout="lanes"]) ::slotted(*) {
		break-inside: avoid;
		/* multicol has no row-gap; item margin supplies the vertical gap. The
		   native branch resets this (grid-lanes gap covers both axes). */
		margin-bottom: var(--_container-gap);
	}

	@supports (display: grid-lanes) {
		:host([layout="lanes"]) .container__inner {
			display: grid-lanes;
			grid-template-columns: repeat(
				var(--_container-column-count, auto-fill),
				minmax(var(--_container-track-min, var(--_container-min-column-width)), 1fr)
			);
		}

		:host([layout="lanes"]) ::slotted(*) {
			margin-bottom: 0;
		}
	}

	:host([layout="columns"][column-count]) .container__inner,
	:host([layout="columns"][sm-column-count]) .container__inner,
	:host([layout="columns"][md-column-count]) .container__inner,
	:host([layout="columns"][lg-column-count]) .container__inner,
	:host([layout="lanes"][column-count]) .container__inner,
	:host([layout="lanes"][sm-column-count]) .container__inner,
	:host([layout="lanes"][md-column-count]) .container__inner,
	:host([layout="lanes"][lg-column-count]) .container__inner {
		column-count: var(--_container-column-count);
		column-width: auto;
	}


	/* # Column count — base scope */

	:host([column-count="1"]) .container__inner { --_container-column-count: 1; }
	:host([column-count="2"]) .container__inner { --_container-column-count: 2; }
	:host([column-count="3"]) .container__inner { --_container-column-count: 3; }
	:host([column-count="4"]) .container__inner { --_container-column-count: 4; }
	:host([column-count="5"]) .container__inner { --_container-column-count: 5; }
	:host([column-count="6"]) .container__inner { --_container-column-count: 6; }
	:host([column-count="7"]) .container__inner { --_container-column-count: 7; }
	:host([column-count="8"]) .container__inner { --_container-column-count: 8; }
	:host([column-count]) .container__inner { --_container-track-min: 0; }


	/* # Column count — sm scope (queries :host own width) */

	@container (max-width: ${smMax}) {
		:host([sm-column-count="1"]) .container__inner { --_container-column-count: 1; }
		:host([sm-column-count="2"]) .container__inner { --_container-column-count: 2; }
		:host([sm-column-count="3"]) .container__inner { --_container-column-count: 3; }
		:host([sm-column-count="4"]) .container__inner { --_container-column-count: 4; }
		:host([sm-column-count="5"]) .container__inner { --_container-column-count: 5; }
		:host([sm-column-count="6"]) .container__inner { --_container-column-count: 6; }
		:host([sm-column-count="7"]) .container__inner { --_container-column-count: 7; }
		:host([sm-column-count="8"]) .container__inner { --_container-column-count: 8; }
		:host([sm-column-count]) .container__inner { --_container-track-min: 0; }
	}


	/* # Column count — md scope */

	@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
		:host([md-column-count="1"]) .container__inner { --_container-column-count: 1; }
		:host([md-column-count="2"]) .container__inner { --_container-column-count: 2; }
		:host([md-column-count="3"]) .container__inner { --_container-column-count: 3; }
		:host([md-column-count="4"]) .container__inner { --_container-column-count: 4; }
		:host([md-column-count="5"]) .container__inner { --_container-column-count: 5; }
		:host([md-column-count="6"]) .container__inner { --_container-column-count: 6; }
		:host([md-column-count="7"]) .container__inner { --_container-column-count: 7; }
		:host([md-column-count="8"]) .container__inner { --_container-column-count: 8; }
		:host([md-column-count]) .container__inner { --_container-track-min: 0; }
	}


	/* # Column count — lg scope */

	@container (min-width: ${lgMin}) {
		:host([lg-column-count="1"]) .container__inner { --_container-column-count: 1; }
		:host([lg-column-count="2"]) .container__inner { --_container-column-count: 2; }
		:host([lg-column-count="3"]) .container__inner { --_container-column-count: 3; }
		:host([lg-column-count="4"]) .container__inner { --_container-column-count: 4; }
		:host([lg-column-count="5"]) .container__inner { --_container-column-count: 5; }
		:host([lg-column-count="6"]) .container__inner { --_container-column-count: 6; }
		:host([lg-column-count="7"]) .container__inner { --_container-column-count: 7; }
		:host([lg-column-count="8"]) .container__inner { --_container-column-count: 8; }
		:host([lg-column-count]) .container__inner { --_container-track-min: 0; }
	}


	/* # Slot order — per-child via order / sm-order / md-order / lg-order
	   attributes on slotted children. Container JS bridges those to
	   --_container-slot-{attr} inline custom props on the child; the queries below
	   pick the right value per breakpoint with var() cascading
	   sm/md/lg-order → order → 0. No-op for layout="columns" (multicol). */

	::slotted(*) {
		/* Keep padded slotted items inside their track (multicol/grid columns). */
		box-sizing: border-box;
		order: var(--_container-slot-order, 0);
	}

	@container (max-width: ${smMax}) {
		::slotted(*) { order: var(--_container-slot-sm-order, var(--_container-slot-order, 0)); }
	}

	@container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
		::slotted(*) { order: var(--_container-slot-md-order, var(--_container-slot-order, 0)); }
	}

	@container (min-width: ${lgMin}) {
		::slotted(*) { order: var(--_container-slot-lg-order, var(--_container-slot-order, 0)); }
	}
`;
