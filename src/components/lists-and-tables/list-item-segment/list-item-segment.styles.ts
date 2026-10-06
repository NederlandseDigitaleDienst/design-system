import { css } from 'lit';

export const listItemSegmentStyles = css`
	:host {
		box-sizing: border-box;
	}

	:host {
		--_background-color: transparent;
		--_min-size: var(--context-list-item-size, var(--semantics-controls-md-min-size));
		--_expanded-rotation: 90deg;
		--_fill-z-index: -1;

		display: flex;
		position: relative;
		/* Its own stacking context, so the fill below (z-index -1) stays behind
		   this segment's content but in front of the row's fill. Without it the
		   two -1 layers land in the same context — the row's while it is lit —
		   and the segment's disappears underneath. */
		isolation: isolate;
		align-items: stretch;
		/* The row's areas center their children; this must span instead, so its hit
		   area and fill reach the row's top and bottom edges. */
		align-self: stretch;
		flex-grow: 0;
		flex-shrink: 1;
		/* Square floor from the row's control size, so an icon-only action is still
		   a touch target. On the host, not the control: the host is the flex item,
		   so a floor on the control would be measured against a host that had
		   already shrunk to zero. */
		min-width: var(--_min-size);
		min-height: var(--_min-size);
		-webkit-tap-highlight-color: transparent;
	}

	:host([hidden]) {
		display: none;
	}

	/* A growing action needs no floor and needs min-width: 0, so its text can
	   truncate instead of pushing its siblings out. */
	:host([width="full"]) {
		flex-grow: 1;
		min-width: 0;
	}

	:host([width="full"]) .list-item-segment {
		justify-content: flex-start;
	}

	/* The cell turns its own glyph from this, so the cell's box stays put: a
	   rotated cell reports a turned box, and the row measures that box to place
	   its divider. */
	:host([disclosure].is-expanded) ::slotted(nldd-icon-cell) {
		--context-cell-glyph-rotation: var(--_expanded-rotation);
	}

	/* The control owns its inline padding, fixed at the indicator inset. Do not
	   add spacer cells for room or hit area: that doubles the space. */
	.list-item-segment {
		box-sizing: border-box;
		display: flex;
		position: relative;
		margin: 0;
		outline: none;
		border: none;
		background: none;
		width: 100%;
		min-width: 0;
		padding: 0;
		padding-inline: var(--semantics-list-items-indicator-inline-inset);
		flex-direction: row;
		align-items: center;
		justify-content: center;
		color: inherit;
		text-align: start;
		text-decoration: none;
	}

	a.list-item-segment {
		cursor: var(--semantics-controls-link-cursor);
	}

	/* There is no disabled attribute for an anchor, so the segment blocks the
	   click itself and aria-disabled carries the state. */
	button.list-item-segment:disabled,
	:host([disabled]) a.list-item-segment {
		cursor: default;
		opacity: var(--primitives-opacity-disabled);
	}

	.list-item-segment::before {
		content: '';
		display: block;
		position: absolute;
		z-index: var(--_fill-z-index);
		inset-block: 0;
		inset-inline: 0;
		border-radius: var(--semantics-list-items-indicator-corner-radius);
		background-color: var(--_background-color);
		pointer-events: none;
	}

	/* The row hands down which fill a hovered segment takes. Unset on an ordinary
	   row, where the fallback answers. */
	@media (hover: hover) {
		:host(:not([disabled])) a.list-item-segment:hover,
		button.list-item-segment:not(:disabled):hover {
			--_background-color: var(--context-list-item-hovered-background-color, var(--semantics-list-items-is-hovered-background-color));
			--context-content-color: var(--context-list-item-hovered-content-color, var(--semantics-list-items-is-hovered-content-color));
			--context-content-secondary-color: var(--context-list-item-hovered-content-color, var(--semantics-list-items-is-hovered-content-color));
		}
	}

	/* Press feedback — works on touch where :hover doesn't. JS-driven so a touch
	   that turns into a scroll clears it (pointercancel) instead of flashing. */
	/* The element selectors match the weight of the hover rule above: a pointer
	   that presses is hovering as well, and the press has to win. */
	:host(:not([disabled])) a.list-item-segment.is-pressed,
	button.list-item-segment:not(:disabled).is-pressed,
	:host(:not([disabled])) .list-item-segment.is-pressed {
		--_background-color: var(--context-list-item-active-background-color, var(--semantics-list-items-is-active-background-color));
		--context-content-color: var(--context-list-item-active-content-color, var(--context-list-item-hovered-content-color, var(--semantics-list-items-is-active-content-color)));
		--context-content-secondary-color: var(--context-list-item-active-content-color, var(--context-list-item-hovered-content-color, var(--semantics-list-items-is-active-content-color)));
	}

	/* After the hover rule on purpose: hovering back over the segment must not
	   dim it while what it opened is still on screen. */
	:host([expanded]) .list-item-segment {
		--_background-color: var(--semantics-list-items-is-expanded-background-color);
		--context-content-color: var(--semantics-list-items-is-expanded-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-expanded-content-color);
	}

	@media (hover: hover) {
		:host([expanded]:not([disabled])) a.list-item-segment:hover,
		:host([expanded]) button.list-item-segment:not(:disabled):hover {
			--_background-color: var(--semantics-list-items-is-expanded-is-hovered-background-color);
			--context-content-color: var(--semantics-list-items-is-expanded-content-color);
			--context-content-secondary-color: var(--semantics-list-items-is-expanded-content-color);
		}
	}

	:host([expanded]:not([disabled])) a.list-item-segment.is-pressed,
	:host([expanded]) button.list-item-segment:not(:disabled).is-pressed,
	:host([expanded]:not([disabled])) .list-item-segment.is-pressed {
		--_background-color: var(--semantics-list-items-is-expanded-is-active-background-color);
		--context-content-color: var(--semantics-list-items-is-expanded-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-expanded-content-color);
	}

	:host([checked]) .list-item-segment {
		--_background-color: var(--semantics-list-items-is-selected-background-color);
		--context-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
	}

	.list-item-segment:focus-visible:not(.is-pointer-focus)::after {
		content: '';
		display: block;
		position: absolute;
		inset: 0;
		border-radius: var(--semantics-list-items-indicator-corner-radius);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
		pointer-events: none;
	}
`;
