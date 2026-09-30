import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const toolbarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_gap: var(--components-toolbar-md-gap);
		/* --_width..--_overflow-button-width: measured + set by toolbar.ts; 0px is a valid pre-measurement placeholder */
		--_width: 0px;
		--_start-width: 0px;
		--_center-width: 0px;
		--_end-width: 0px;
		--_overflow-button-width: 0px;
		/* The gap between a side area and its spacer only exists when that area is
		   non-empty; toolbar.ts drops these to 0px when start/end is empty so the
		   spacer basis doesn't over-subtract and pull the center off-center. */
		--_left-spacer-gap: var(--_gap);
		--_right-spacer-gap: var(--_gap);
		--_label-margin-top: var(--primitives-space-4);

		${inheritedTextReset}
		box-sizing: border-box;
		display: block;
	}

	:host([size="sm"]) {
		--_gap: var(--components-toolbar-sm-gap);
	}

	:host([size="lg"]) {
		--_gap: var(--components-toolbar-lg-gap);
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.toolbar {
		display: flex;
		width: 100%;
		flex-direction: row;
		gap: var(--_gap);
		align-items: center;
	}


	/* # Items */

	.toolbar__items {
		display: flex;
		min-width: 0;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		gap: var(--_gap);
		align-items: flex-start;
	}


	/* # Spacers */

	.toolbar__flexible-spacer {
		margin-left: calc(-1 * var(--_gap));
		flex-grow: 1;
		flex-shrink: 1;
	}

	.toolbar__center-fill {
		display: flex;
		min-width: 0;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		align-items: flex-start;
		justify-content: center;
	}

	.toolbar__left-spacer {
		margin-right: calc(-1 * var(--_gap));
		min-width: 0;
		flex-grow: 0;
		flex-shrink: 1;
		flex-basis: calc(
			var(--_width) / 2
			- var(--_start-width)
			- var(--_center-width) / 2
			- var(--_left-spacer-gap)
		);
	}

	.toolbar__right-spacer {
		margin-left: calc(-1 * var(--_gap));
		min-width: 0;
		flex-grow: 0;
		flex-shrink: 1;
		flex-basis: calc(
			var(--_width) / 2
			- var(--_end-width)
			- var(--_center-width) / 2
			- var(--_right-spacer-gap)
			- var(--_overflow-button-width)
		);
	}


	/* # Overflow button */

	.toolbar__overflow-button {
		display: inline-flex;
		flex-direction: column;
		flex-grow: 0;
		flex-shrink: 0;
		align-items: center;
	}

	.toolbar__overflow-button.is-hidden {
		display: none;
	}

	.toolbar__overflow-button-label {
		display: none;
		margin-top: var(--_label-margin-top);
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-xs-regular-flat);
		white-space: nowrap;
	}

	:host([show-item-labels]) .toolbar__overflow-button-label {
		display: block;
	}
`;

export const toolbarItemStyles = css`


	/* # Host */

	:host {
		--_item-max-width: none;
		--_item-min-width: 0px;
		--_item-width: auto;
		--_label-margin-top: var(--primitives-space-4);

		display: inline-flex;
		max-width: var(--_item-max-width);
		flex-direction: column;
		flex-grow: 0;
		flex-shrink: 0;
		align-items: center;
	}

	:host([fluid]) {
		min-width: var(--_item-min-width);
		flex-shrink: 1;
		flex-basis: var(--_item-width);
	}

	:host([solo-fluid]) {
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.toolbar__item-content {
		display: inline-flex;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	:host([fluid]) .toolbar__item-content ::slotted(*),
	:host([solo-fluid]) .toolbar__item-content ::slotted(*) {
		width: 100%;
	}


	/* # Elements */

	.toolbar__item-label {
		display: none;
		margin-top: var(--_label-margin-top);
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-xs-regular-flat);
		white-space: nowrap;
	}

	:host([show-item-labels]) .toolbar__item-label {
		display: block;
	}


	/* # Slots */

	slot[name="overflow"] {
		display: none;
	}
`;

export const toolbarTitleStyles = css`


	/* # Host */

	:host {
		--_title-group-min-width: 0px;
		--_title-width: auto;
		--_title-max-width: var(--primitives-area-240);
		--_title-group-height: var(--semantics-controls-md-min-size);
		--_content-gap: var(--primitives-space-6);
		--_title-font: var(--primitives-font-body-lg-semi-bold-flat);
		--_supporting-text-font: var(--primitives-font-body-xs-regular-flat);

		${inheritedTextReset}
		display: inline-flex;
		min-width: var(--_title-group-min-width);
		height: var(--_title-group-height);
		flex-direction: row;
		flex-shrink: 1;
		flex-basis: var(--_title-width);
		gap: var(--_content-gap);
		align-items: center;
	}

	:host([size="sm"]) {
		--_title-group-height: var(--semantics-controls-sm-min-size);
		--_title-font: var(--primitives-font-body-sm-semi-bold-flat);
		--_supporting-text-font: var(--primitives-font-body-xxs-regular-flat);
	}

	:host([size="lg"]) {
		--_title-group-height: var(--semantics-controls-lg-min-size);
	}

	:host([solo-fluid]) {
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}

	/* Sole toolbar element: let the text fill the row instead of capping at
	   --_title-max-width, matching the pre-fit-content stretch behavior. */
	:host([solo-fluid]) .toolbar__title-group {
		max-width: none;
	}

	:host([align="center"]) .toolbar__title-group {
		align-items: center;
	}

	/* A solo-fluid title fills the whole row (flex-grow above), so text-align on
	   the shrink-wrapped title-group can't center it. Center the group (with its
	   trailing action, as one unit) along the row's main axis instead. Scoped to
	   solo-fluid so a title balanced by real start/end items keeps using the
	   toolbar spacers. */
	:host([solo-fluid][align="center"]) {
		justify-content: center;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Elements */

	/* The title + supporting text column: the fit-content-capped, clipping part. The
	   action slot sits outside this cap so the control is never truncated. */
	.toolbar__title-group {
		display: flex;
		min-width: 0;
		max-width: var(--_title-max-width);
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		overflow: hidden;
	}

	.toolbar__title-link {
		display: inline-flex;
		border-radius: var(--semantics-controls-sm-corner-radius);
		color: inherit;
		min-width: 0;
		gap: var(--_content-gap);
		align-items: center;
		text-decoration: none;
	}

	.toolbar__opens-in-new-tab-hint {
		position: absolute;
		margin: -1px;
		border: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		padding: 0;
		white-space: nowrap;
		clip-path: inset(50%);
	}

	.toolbar__title-link:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}


	/* The space around these is a gap on the host: a margin here loses to the
	   consumer's own margin reset, which lives in the tree the element is in.
	   And no width, because ::slotted does beat the element's own :host. */
	::slotted([slot="media"]),
	::slotted([slot="action"]) {
		flex-shrink: 0;
	}

	::slotted([slot="media"]) {
		max-height: 100%;
	}

	/* text-align lives on the text elements, not :host: the inheritedTextReset on
	   :host locks text-align to start, so a host-level override would need
	   !important. The title and supporting text are shadow elements outside that reset. */
	.toolbar__title {
		margin: 0;
		max-width: 100%;
		overflow: hidden;
		color: var(--semantics-content-color);
		font: var(--_title-font);
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	:host([align="center"]) .toolbar__title {
		text-align: center;
	}

	.toolbar__supporting-text {
		margin: 0;
		max-width: 100%;
		overflow: hidden;
		color: var(--semantics-content-secondary-color);
		font: var(--_supporting-text-font);
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	:host([align="center"]) .toolbar__supporting-text {
		text-align: center;
	}
`;
