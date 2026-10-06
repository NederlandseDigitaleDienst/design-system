import { css } from 'lit';

export const stepCellStyles = css`
	:host {
		box-sizing: border-box;
	}

	:host {
		--_step-cell-lane-size: var(--primitives-space-16);
		--_step-cell-marker-size: var(--primitives-space-16);
		--_step-cell-marker-corner-radius: var(--primitives-corner-radius-full);

		--_step-cell-line-width: var(--primitives-space-2);
		--_step-cell-track-color: light-dark(var(--primitives-color-accent-750), var(--primitives-color-accent-650));
		--_step-cell-future-fill-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-200));
		--_step-cell-marker-z-index: 1;
		--_step-cell-ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_step-cell-ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_step-cell-marker-content-color: var(--semantics-content-contrast-color);
		--_step-cell-future-content-color: var(--semantics-content-secondary-color);
		--_step-cell-current-fill-color: light-dark(var(--primitives-color-accent-75), var(--primitives-color-accent-100));
		--_step-cell-icon-size: calc(var(--_step-cell-marker-size) * 2 / 3);

		isolation: isolate;
		display: flex;
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		width: var(--_step-cell-lane-size);
		flex-direction: column;
		align-self: stretch;
		align-items: center;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="md"]) {
		--_step-cell-lane-size: var(--primitives-space-24);
		--_step-cell-marker-size: var(--primitives-space-24);
	}

	:host([level="minor"]) {
		--_step-cell-marker-size: var(--primitives-space-10);
	}

	:host([size="md"][level="minor"]) {
		--_step-cell-marker-size: var(--primitives-space-12);
	}

	/* Bleeds back over the host's block padding, so consecutive rows connect. */
	.step-cell {
		position: relative;
		width: var(--_step-cell-lane-size);
		height: calc(100% + 2 * var(--context-cell-padding-block, 0px));
		min-height: var(--primitives-space-48);
		margin-block: calc(var(--context-cell-padding-block, 0px) * -1);
	}

	/* The ring, but only left and right. A spread would put the same band above
	   and below the line, and there it would cut the track at every row
	   boundary: the lines that run on downward deliberately reach past the cell
	   to bridge the divider. Two offset copies do the sides and nothing else. A
	   copy shifted sideways has the same top and bottom as the line itself, so
	   it can only show along the edge it is pushed out from. */
	.step-cell__full-line,
	.step-cell__top-line,
	.step-cell__bottom-line {
		position: absolute;
		left: 50%;
		margin-left: calc(var(--_step-cell-line-width) / -2);
		box-shadow:
			calc(-1 * var(--_step-cell-ring-thickness)) 0 0 0 var(--_step-cell-ring-color),
			var(--_step-cell-ring-thickness) 0 0 0 var(--_step-cell-ring-color);
		background-color: var(--_step-cell-track-color);
		width: var(--_step-cell-line-width);
	}

	/* The lines that run on downward also bridge the row boundary: an
	   nldd-list-item reserves a divider's worth of space below itself, and
	   without this the track breaks at every row. The top line needs nothing —
	   the row above already covers the band. */
	.step-cell__full-line {
		top: 0;
		bottom: calc(-1 * var(--semantics-dividers-thickness));
	}

	.step-cell__top-line {
		bottom: 50%;
		height: 50%;
	}

	.step-cell__bottom-line {
		top: 50%;
		bottom: calc(-1 * var(--semantics-dividers-thickness));
	}

	:host([status="future"]:not([line])) .step-cell__top-line,
	:host([status="future"]:not([line])) .step-cell__bottom-line {
		background-color: var(--_step-cell-future-fill-color);
	}

	:host([status="current"]:not([line])) .step-cell__bottom-line {
		background-color: var(--_step-cell-future-fill-color);
	}

	:host([status="current"][direction="up"]:not([line])) .step-cell__bottom-line {
		background-color: var(--_step-cell-track-color);
	}

	:host([status="current"][direction="up"]:not([line])) .step-cell__top-line {
		background-color: var(--_step-cell-future-fill-color);
	}

	:host([line="top"]) .step-cell__top-line,
	:host([line="bottom"]) .step-cell__bottom-line,
	:host([line="both"]) .step-cell__top-line,
	:host([line="both"]) .step-cell__bottom-line {
		background-color: var(--_step-cell-track-color);
	}

	:host([level="none"][status="future"]) .step-cell__full-line,
	:host([level="none"][status="current"]:not([direction="up"])) .step-cell__full-line,
	:host([level="none"][line="none"]) .step-cell__full-line {
		background-color: var(--_step-cell-future-fill-color);
	}

	:host([line="top"]) .step-cell__bottom-line,
	:host([line="bottom"]) .step-cell__top-line,
	:host([line="none"]) .step-cell__top-line,
	:host([line="none"]) .step-cell__bottom-line {
		background-color: var(--_step-cell-future-fill-color);
	}

	.step-cell__marker {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: var(--_step-cell-marker-z-index);
		display: flex;
		width: var(--_step-cell-marker-size);
		height: var(--_step-cell-marker-size);
		margin-top: calc(var(--_step-cell-marker-size) / -2);
		margin-left: calc(var(--_step-cell-marker-size) / -2);
		align-items: center;
		justify-content: center;
		border: var(--_step-cell-line-width) solid var(--_step-cell-track-color);
		border-radius: var(--_step-cell-marker-corner-radius);
		box-shadow: 0 0 0 var(--_step-cell-ring-thickness) var(--_step-cell-ring-color);
		color: var(--_step-cell-marker-content-color);
		font: var(--primitives-font-body-sm-medium-flat);
	}

	:host([status="past"]) .step-cell__marker,
	:host(:not([status])) .step-cell__marker {
		background-color: var(--_step-cell-track-color);
	}

	:host([status="current"]) .step-cell__marker {
		background-color: var(--_step-cell-current-fill-color);
		color: var(--_step-cell-track-color);
	}

	:host([status="future"]) .step-cell__marker {
		border-color: var(--_step-cell-future-fill-color);
		background-color: var(--_step-cell-future-fill-color);
		color: var(--_step-cell-future-content-color);
	}

	.step-cell__icon {
		width: var(--_step-cell-icon-size);
		height: var(--_step-cell-icon-size);
	}

	@media (forced-colors: active) {
		.step-cell__marker,
		.step-cell__top-line,
		.step-cell__bottom-line,
		.step-cell__full-line {
			forced-color-adjust: none;
		}
	}
`;
