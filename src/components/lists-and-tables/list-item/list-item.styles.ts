import { css } from 'lit';

export const listItemStyles = css`
	:host {
		box-sizing: border-box;
	}



	:host {
		--_background-color: transparent;
		--_content-z-index: 0;
		--_focus-z-index: 1;
		--_indicator-z-index: calc(var(--_content-z-index) - 1);
		/* Set from JS by the divider-start/divider-end markers; initial keeps
		   them guaranteed-invalid so the var() fallbacks below apply. */
		--_divider-inset-start: initial;
		--_divider-inset-end: initial;
		--_list-item-md-padding-block: var(--primitives-space-10);
		--_list-item-sm-padding-block: var(--primitives-space-6);

		--context-list-item-size: var(--semantics-controls-md-min-size);
		--context-cell-padding-block: var(--_list-item-md-padding-block);
		container-type: inline-size;
		display: block;
		width: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="sm"]) {
		--context-cell-padding-block: var(--_list-item-sm-padding-block);
		--context-list-item-size: var(--semantics-controls-sm-min-size);
	}

	:host(.is-interactive) {
		/* Not the host's 100%: a width plus negative margins is over-constrained
		   in block layout, so the row would shift instead of widen. */
		width: auto;
		/* !important: shields the widening from consumer universal resets, which
		   beat normal :host declarations per CSS Scoping. A negative margin
		   cannot move inward — an inner element cannot reach outside the host. */
		margin-inline: calc(-1 * var(--semantics-list-items-indicator-inline-inset)) !important;
	}

	:host(.is-interactive) .list-item {
		padding-inline: var(--semantics-list-items-indicator-inline-inset);
	}

	:host(.is-interactive) .list-item:has(> .list-item__action) {
		padding-inline: 0;
	}

	/* A segment at a row edge already owns the padding for that side,
	   so the row drops its own there. Mid-row it claims nothing. */
	:host(.is-interactive.has-leading-segment) .list-item {
		padding-inline-start: 0;
	}

	:host(.is-interactive.has-trailing-segment) .list-item {
		padding-inline-end: 0;
	}

	:host([hidden]) {
		display: none;
	}

	:host(:focus-within) {
		position: relative;
		z-index: var(--_focus-z-index);
	}

	/* The focus ring reaches past the row's own box, and a branch paints its
	   children group right after the row, in the same stacking context — so on a
	   branch the ring's bottom edge disappeared under the first child. Raising
	   the row settles it in both directions: with focus in a child, the rule
	   matches this row too, and the group (later in the tree) still wins. */
	:host(:focus-within) .list-item {
		z-index: var(--_focus-z-index);
	}

	:host(.is-dragging) {
		opacity: var(--semantics-controls-is-dragging-opacity);
	}

	:host(.is-dragging-pointer) {
		display: none;
	}

	:host(:not([reorderable])) ::slotted([reorderable-only]) {
		display: none;
	}

	:host([reorderable]) ::slotted([reorderable-only]) {
		cursor: grab;
		touch-action: none;
	}

	:host(.is-dragging) ::slotted([reorderable-only]) {
		cursor: grabbing;
	}



	/* The row reserves the divider's line below itself, rather than the host
	   doing it: on a branch the children group follows the row inside the host,
	   so a margin on the host would land after the whole subtree — leaving the
	   divider to overlap the first child and an extra line's worth of space
	   under the last one. */
	.list-item {
		box-sizing: border-box;
		display: flex;
		position: relative;
		margin-block-end: var(--semantics-dividers-thickness);
		width: 100%;
		min-height: var(--context-list-item-size);
		flex-direction: row;
		align-items: stretch;
		isolation: isolate;
	}



	.list-item__action {
		box-sizing: border-box;
		display: flex;
		margin: 0;
		outline: none;
		border: none;
		background: none;
		width: 100%;
		padding: 0;
		padding-inline: var(--semantics-list-items-indicator-inline-inset);
		flex-direction: row;
		align-items: stretch;
		text-align: start;
		color: inherit;
		text-decoration: none;
	}

	a.list-item__action {
		cursor: var(--semantics-controls-link-cursor);
	}

	/* There is no disabled attribute for an anchor, so the row blocks the click
	   itself and aria-disabled carries the state. */
	button.list-item__action:disabled,
	:host([disabled]) a.list-item__action {
		cursor: default;
		opacity: var(--primitives-opacity-disabled);
	}

	.list-item__opens-in-new-tab-hint {
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



	/* On the control when the row is one, so hover, focus and press can drive it. */
	.list-item:not(:has(.list-item__action))::before,
	.list-item__action::before {
		content: '';
		display: block;
		position: absolute;
		inset-block: 0;
		inset-inline: calc(-1 * var(--semantics-list-items-indicator-inline-inset));
		z-index: var(--_indicator-z-index);
		border-radius: var(--semantics-list-items-indicator-corner-radius);
		background-color: var(--_background-color);
		pointer-events: none;
	}

	:host(.is-interactive) .list-item:not(:has(.list-item__action))::before,
	.list-item__action::before {
		inset-inline: 0;
	}

	/* data-current is set by the row itself when one of its own segments carries
	   current, so a segmented row paints without one on the host. */
	:host(:is([selected], [checkbox][checked])),
	:host(:is([current], [data-current])) {
		--_background-color: var(--semantics-list-items-is-selected-background-color);
		--context-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
	}


	/* A checked checkbox action selects the whole row, so the fill runs across
	   the disclosure action too instead of stopping at its boundary. */
	.list-item.is-action-checked {
		--_background-color: var(--semantics-list-items-is-selected-background-color);
		--context-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
	}

	/* Hover only on hover-capable devices, so a touch that turns into a scroll
	   does not flash the row under the finger.

	   The row hands its rung down to its segments through the two context
	   variables at the end of each block: a segmented row has no control of its
	   own, so the segment paints, and it must paint on the same scale as the
	   row it sits in. */
	@media (hover: hover) {
		:host(:not([disabled])) .list-item__action:hover {
			--_background-color: var(--semantics-list-items-is-hovered-background-color);
			--context-content-color: var(--semantics-list-items-is-hovered-content-color);
			--context-content-secondary-color: var(--semantics-list-items-is-hovered-content-color);
		}

		:host(:is([selected], [checkbox][checked]):not([disabled])) .list-item__action:hover,
		:host(:is([current], [data-current]):not([disabled])) .list-item__action:hover {
			--_background-color: var(--semantics-list-items-is-selected-is-hovered-background-color);
			--context-content-color: var(--semantics-list-items-is-selected-content-color);
			--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
		}
	}

	:host(:is([selected], [checkbox][checked])) {
		--context-list-item-hovered-background-color: var(--semantics-list-items-is-selected-is-hovered-background-color);
		--context-list-item-hovered-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-list-item-active-background-color: var(--semantics-list-items-is-selected-is-active-background-color);
	}

	/* Pressing the row you are on lands on the accent whether or not focus got
	   there first. Safari does not focus a button on click, and a press that
	   waits for focus would go grey there while the other browsers go accent.
	   Hover still follows the focus: that is the state, not the gesture. */
	:host(:is([current], [data-current])) {
		--context-list-item-hovered-background-color: var(--semantics-list-items-is-selected-is-hovered-background-color);
		--context-list-item-hovered-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-list-item-active-background-color: var(--semantics-list-items-is-highlighted-is-active-background-color);
		--context-list-item-active-content-color: var(--semantics-list-items-is-highlighted-content-color);
	}

	/* focus-within on the host, not on the row-wide control: focus inside a
	   nested nldd-list-item-segment has to match, and a segmented row has no
	   control of its own to key off.

	   After the hover rules on purpose: a pointer that lands on the row is
	   hovering it as well, and the state it just gave focus to has to win. */
	:host(:is([current], [data-current]):focus-within) .list-item,
	:host(:is([current], [data-current]):focus-within) .list-item__action {
		--context-content-color: var(--semantics-list-items-is-highlighted-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-highlighted-content-color);
	}

	:host(:is([current], [data-current]):focus-within) {
		--context-list-item-hovered-background-color: var(--semantics-list-items-is-highlighted-is-hovered-background-color);
		--context-list-item-hovered-content-color: var(--semantics-list-items-is-highlighted-content-color);
		--context-list-item-active-background-color: var(--semantics-list-items-is-highlighted-is-active-background-color);
	}

	:host(:is([current], [data-current]):focus-within) .list-item::before,
	:host(:is([current], [data-current]):focus-within) .list-item__action::before {
		background-color: var(--semantics-list-items-is-highlighted-background-color);
	}

	/* Only the row-wide control, never the row itself: on a segmented row the
	   hovered segment deepens on its own, and a row that darkened as a whole
	   would hide which segment you are on. */
	@media (hover: hover) {
		:host(:is([current], [data-current]):focus-within:not([disabled])) .list-item__action:hover::before {
			background-color: var(--semantics-list-items-is-highlighted-is-hovered-background-color);
		}
	}

	/* Two selectors, because pressing means hovering too and the hover rule
	   above carries a pseudo-class more: the focused one has to match its
	   weight to win, and the plain one catches Safari, where the mouse being
	   down means the row is not focused at all. */
	:host(:is([current], [data-current]):not([disabled])) .list-item__action.is-pressed::before,
	:host(:is([current], [data-current]):focus-within:not([disabled])) .list-item__action.is-pressed::before {
		background-color: var(--semantics-list-items-is-highlighted-is-active-background-color);
	}

	/* The content color has to travel with the fill: the neutral press rule
	   above sets it too, and black on a deep accent is unreadable. */
	:host(:is([current], [data-current]):focus-within:not([disabled])) .list-item__action:hover {
		--context-content-color: var(--semantics-list-items-is-highlighted-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-highlighted-content-color);
	}

	/* JS-driven rather than :active, so a touch that turns into a scroll clears
	   the press (pointercancel) instead of flashing it. */
	:host(:not([disabled])) .list-item__action.is-pressed {
		--_background-color: var(--semantics-list-items-is-active-background-color);
		--context-content-color: var(--semantics-list-items-is-active-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-active-content-color);
	}

	:host(:is([selected], [checkbox][checked]):not([disabled])) .list-item__action.is-pressed,
	:host(:is([current], [data-current]):not([disabled])) .list-item__action.is-pressed {
		--_background-color: var(--semantics-list-items-is-selected-is-active-background-color);
		--context-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
	}

	:host(:is([selected], [checkbox][checked])) .list-item__action {
		--_background-color: var(--semantics-list-items-is-selected-background-color);
		--context-content-color: var(--semantics-list-items-is-selected-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-selected-content-color);
	}

	/* .is-highlighted is set by the list: in a listbox the focus stays in the
	   search input, so the option cannot carry the state itself. */
	/* After the neutral press rules above, or black lands on a deep accent. */
	:host(:is([current], [data-current]):not([disabled])) .list-item__action.is-pressed {
		--context-content-color: var(--semantics-list-items-is-highlighted-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-highlighted-content-color);
	}

	.list-item.is-highlighted,
	:host(:is([selected], [checkbox][checked])) .list-item.is-highlighted .list-item__action {
		--_background-color: var(--semantics-list-items-is-highlighted-background-color);
		--context-content-color: var(--semantics-list-items-is-highlighted-content-color);
		--context-content-secondary-color: var(--semantics-list-items-is-highlighted-content-color);
	}



	/* The ring follows the real (widened) box: inset 0 against the row block,
	   painting outward like every other control. */
	.list-item__action:focus-visible:not(.is-pointer-focus)::after,
	:host(:focus-visible) .list-item::after {
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

	/* A tree row without a control of its own takes focus on the host, and the
	   host wraps the children group as well — so the browser's own ring would be
	   drawn around the whole open branch. Ours goes on the row. */
	:host(:focus-visible) {
		outline: none;
	}

	/* The cell turns its own glyph from this, so the cell's box stays put: a
	   rotated cell reports a turned box, and that box is what the divider
	   measurement below reads. */
	:host([expanded]) ::slotted(nldd-icon-cell[disclosure]) {
		--context-cell-glyph-rotation: 90deg;
	}


	/* Indentation is the consumer's. Re-inset a widened parent's strip, or each
	   nested level would bleed a further inset outward. */

	.list-item__children {
		display: block;
	}

	:host(.is-interactive) .list-item__children {
		padding-inline: var(--semantics-list-items-indicator-inline-inset);
	}

	.list-item__children[hidden] {
		display: none;
	}


	/* Content-wide by default; the divider-start/divider-end cell markers
	   override it through the measured --_divider-inset-* vars. */

	/* A segment with focus paints its ring past its own box, and the
	   divider is rendered after the slot — so without this the line ran straight
	   through the ring. Lifting the focused action puts the ring on top. */
	::slotted(nldd-list-item-segment:focus-within) {
		z-index: var(--_focus-z-index);
	}

	.list-item__divider {
		display: var(--context-list-divider-display, block);
		position: absolute;
		/* Hangs in the row's bottom margin: the boundary band belongs to the pair
		   of rows, not to either one. */
		inset-block-end: calc(-1 * var(--semantics-dividers-thickness));
		inset-inline: var(--_divider-inset-start, 0px) var(--_divider-inset-end, 0px);
		background-color: var(--semantics-dividers-color);
		height: var(--semantics-dividers-thickness);
	}

	:host(.is-interactive) .list-item__divider {
		inset-inline:
			var(--_divider-inset-start, var(--semantics-list-items-indicator-inline-inset))
			var(--_divider-inset-end, var(--semantics-list-items-indicator-inline-inset));
	}

	:host(.is-boxed.is-last) .list-item {
		margin-block-end: 0;
	}

	:host(.is-boxed.is-last) .list-item__divider,
	:host(.is-dragging) .list-item__divider,
	:host([data-nldd-clone]) .list-item__divider {
		display: none;
	}
`;
