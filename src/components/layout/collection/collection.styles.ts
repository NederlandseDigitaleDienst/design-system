import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const collectionStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_collection-item-width: var(--primitives-area-280);
		--_collection-focus-ring-z-index: 1;

		/* Two sets, because a collection inside a layout-container follows that
		   container and anywhere else the viewport. The bare --_collection-gap is what
		   stands when neither set matches. */
		--_collection-sm-gap: var(--primitives-space-16);
		--_collection-md-gap: var(--primitives-space-24);
		--_collection-lg-gap: var(--primitives-space-24);
		--_collection-gap: var(--_collection-sm-gap);

		@media (max-width: ${smMax}) { --_collection-gap: var(--_collection-sm-gap); }
		@media (min-width: ${mdMin}) and (max-width: ${mdMax}) { --_collection-gap: var(--_collection-md-gap); }
		@media (min-width: ${lgMin}) { --_collection-gap: var(--_collection-lg-gap); }

		@container layout-container (max-width: ${smMax}) { --_collection-gap: var(--_collection-sm-gap); }
		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) { --_collection-gap: var(--_collection-md-gap); }
		@container layout-container (min-width: ${lgMin}) { --_collection-gap: var(--_collection-lg-gap); }

		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		gap: var(--_collection-gap);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Items */

	.collection__items {
		display: flex;
		width: 100%;
		gap: var(--_collection-gap);
	}

	/* ## Grid */

	:host([layout="grid"]) .collection__items,
	:host(:not([layout])) .collection__items {
		/* min(item-width, 100%) clamps the track min to the container width so
		   a single column never forces horizontal overflow on narrow screens. */
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(var(--_collection-item-width), 100%), 1fr));
	}

	/* A grid item's automatic minimum is min-content, so one long unbreakable
	   string inside a card would stretch its whole track past 1fr. Every
	   consumer had to repeat min-width: 0 themselves; the track sizes the item,
	   not the content. */
	:host([layout="grid"]) .collection__items ::slotted(*),
	:host(:not([layout])) .collection__items ::slotted(*) {
		min-width: 0;
	}

	/* ## Stack */

	:host([layout="stack"]) .collection__items {
		flex-direction: column;
	}


	/* ## Lanes */

	/* Falls back to the grid above, not to the multicol nldd-container uses:
	   this component pages, and multicol redistributes the whole set every time
	   load-more adds to it. */
	:host([layout="lanes"]) .collection__items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(var(--_collection-item-width), 100%), 1fr));
	}

	:host([layout="lanes"]) .collection__items ::slotted(*) {
		min-width: 0;
	}

	@supports (display: grid-lanes) {
		:host([layout="lanes"]) .collection__items {
			display: grid-lanes;
		}
	}

	/* ## Horizontal scroll */

	:host([layout="horizontal-scroll"]) .collection__items {
		margin-inline: calc(var(--primitives-space-16) * -1);
		margin-block: calc(var(--primitives-space-16) * -1);
		overflow-x: auto;
		padding-inline: var(--primitives-space-16);
		padding-block: var(--primitives-space-16);
		flex-direction: row;
		flex-wrap: nowrap;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		scroll-padding-inline-start: var(--primitives-space-16);
	}

	:host([layout="horizontal-scroll"][scrollable]) .collection__items {
		mask-image: linear-gradient(
			to right,
			transparent 0,
			black var(--primitives-space-16),
			black calc(100% - var(--primitives-space-16)),
			transparent 100%
		);
	}

	:host([layout="horizontal-scroll"]) .collection__items::-webkit-scrollbar {
		display: none;
	}

	:host([layout="horizontal-scroll"]) .collection__items ::slotted(*) {
		max-width: 100%;
		flex-grow: 1;
		flex-shrink: 0;
		flex-basis: var(--_collection-item-width);
		scroll-snap-align: start;
	}

	/* The horizontal-scroll items has a mask-image that fades the left
	 * and right edges, which would clip an outline drawn directly on it.
	 * The .collection__scroll-area wrapper has no mask and is the layout
	 * box that matches the visible content area; its ::after sits above
	 * slotted cards via z-index, so card box-shadows can't overlap the
	 * ring. :has() works here because both elements are in the same
	 * shadow tree (unlike :host(:has()), which doesn't pierce). */
	.collection__scroll-area {
		position: relative;
	}

	.collection__items:focus-visible {
		outline: none;
	}

	.collection__scroll-area:has(.collection__items:focus-visible)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: var(--_collection-focus-ring-z-index);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
		pointer-events: none;
	}


	/* # Footer */

	.collection__footer {
		display: flex;
		width: 100%;
	}

	.collection__footer[hidden] {
		display: none;
	}

	/* ## Scroll navigation — horizontal scroll */

	:host([layout="horizontal-scroll"]) .collection__footer {
		justify-content: flex-end;
		gap: var(--primitives-space-16);
	}
`;
