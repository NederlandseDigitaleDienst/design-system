import { css } from 'lit';

export const timelineTrackCellStyles = css`
	:host {
		box-sizing: border-box;
	}

	:host {
		--_lane-size: var(--primitives-space-16);
		--_marker-size: var(--primitives-space-16);
		--_marker-corner-radius: var(--primitives-corner-radius-full);

		--_line-width: var(--primitives-space-2);
		--_track-color: light-dark(var(--primitives-color-accent-750), var(--primitives-color-accent-650));
		--_future-fill-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-200));
		--_marker-z-index: 1;
		--_ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_marker-content-color: var(--semantics-content-contrast-color);
		--_future-content-color: var(--semantics-content-secondary-color);
		--_current-fill-color: light-dark(var(--primitives-color-accent-75), var(--primitives-color-accent-100));
		--_icon-size: calc(var(--_marker-size) * 2 / 3);

		isolation: isolate;
		display: flex;
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		width: var(--_lane-size);
		flex-direction: column;
		align-self: stretch;
		align-items: center;
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="md"]) {
		--_lane-size: var(--primitives-space-24);
		--_marker-size: var(--primitives-space-24);
	}

	:host([level="minor"]) {
		--_marker-size: var(--primitives-space-10);
	}

	:host([size="md"][level="minor"]) {
		--_marker-size: var(--primitives-space-12);
	}

	/* Bleeds back over the host's block padding, so consecutive rows connect. */
	.timeline-track-cell {
		position: relative;
		width: var(--_lane-size);
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
	.timeline-track-cell__full-line,
	.timeline-track-cell__top-line,
	.timeline-track-cell__bottom-line {
		position: absolute;
		left: 50%;
		margin-left: calc(var(--_line-width) / -2);
		box-shadow:
			calc(-1 * var(--_ring-thickness)) 0 0 0 var(--_ring-color),
			var(--_ring-thickness) 0 0 0 var(--_ring-color);
		background-color: var(--_track-color);
		width: var(--_line-width);
	}

	/* The lines that run on downward also bridge the row boundary: an
	   nldd-list-item reserves a divider's worth of space below itself, and
	   without this the track breaks at every row. The top line needs nothing —
	   the row above already covers the band. */
	.timeline-track-cell__full-line {
		top: 0;
		bottom: calc(-1 * var(--semantics-dividers-thickness));
	}

	.timeline-track-cell__top-line {
		bottom: 50%;
		height: 50%;
	}

	.timeline-track-cell__bottom-line {
		top: 50%;
		bottom: calc(-1 * var(--semantics-dividers-thickness));
	}

	:host([status="future"]:not([line])) .timeline-track-cell__top-line,
	:host([status="future"]:not([line])) .timeline-track-cell__bottom-line {
		background-color: var(--_future-fill-color);
	}

	:host([status="current"]:not([line])) .timeline-track-cell__bottom-line {
		background-color: var(--_future-fill-color);
	}

	:host([status="current"][direction="up"]:not([line])) .timeline-track-cell__bottom-line {
		background-color: var(--_track-color);
	}

	:host([status="current"][direction="up"]:not([line])) .timeline-track-cell__top-line {
		background-color: var(--_future-fill-color);
	}

	:host([line="top"]) .timeline-track-cell__top-line,
	:host([line="bottom"]) .timeline-track-cell__bottom-line,
	:host([line="both"]) .timeline-track-cell__top-line,
	:host([line="both"]) .timeline-track-cell__bottom-line {
		background-color: var(--_track-color);
	}

	:host([level="none"][status="future"]) .timeline-track-cell__full-line,
	:host([level="none"][status="current"]:not([direction="up"])) .timeline-track-cell__full-line,
	:host([level="none"][line="none"]) .timeline-track-cell__full-line {
		background-color: var(--_future-fill-color);
	}

	:host([line="top"]) .timeline-track-cell__bottom-line,
	:host([line="bottom"]) .timeline-track-cell__top-line,
	:host([line="none"]) .timeline-track-cell__top-line,
	:host([line="none"]) .timeline-track-cell__bottom-line {
		background-color: var(--_future-fill-color);
	}

	.timeline-track-cell__marker {
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: var(--_marker-z-index);
		display: flex;
		width: var(--_marker-size);
		height: var(--_marker-size);
		margin-top: calc(var(--_marker-size) / -2);
		margin-left: calc(var(--_marker-size) / -2);
		align-items: center;
		justify-content: center;
		border: var(--_line-width) solid var(--_track-color);
		border-radius: var(--_marker-corner-radius);
		box-shadow: 0 0 0 var(--_ring-thickness) var(--_ring-color);
		color: var(--_marker-content-color);
		font: var(--primitives-font-body-sm-medium-flat);
	}

	:host([status="past"]) .timeline-track-cell__marker,
	:host(:not([status])) .timeline-track-cell__marker {
		background-color: var(--_track-color);
	}

	:host([status="current"]) .timeline-track-cell__marker {
		background-color: var(--_current-fill-color);
		color: var(--_track-color);
	}

	:host([status="future"]) .timeline-track-cell__marker {
		border-color: var(--_future-fill-color);
		background-color: var(--_future-fill-color);
		color: var(--_future-content-color);
	}

	.timeline-track-cell__icon {
		width: var(--_icon-size);
		height: var(--_icon-size);
	}

	@media (forced-colors: active) {
		.timeline-track-cell__marker,
		.timeline-track-cell__top-line,
		.timeline-track-cell__bottom-line,
		.timeline-track-cell__full-line {
			forced-color-adjust: none;
		}
	}
`;
