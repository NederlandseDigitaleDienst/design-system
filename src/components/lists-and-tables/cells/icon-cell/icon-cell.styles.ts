import { css } from 'lit';

export const iconCellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_icon-cell-size: var(--primitives-space-24);
		--_icon-cell-content-color: var(--context-content-color, var(--semantics-content-color));

		display: flex;
		/* !important: shields the row padding from consumer universal resets, which beat normal :host declarations per CSS Scoping. */
		padding-block: var(--context-cell-padding-block, 0px) !important;
		width: var(--_icon-cell-size);
		flex-direction: column;
		align-items: center;
		color: var(--_icon-cell-content-color);
	}

	:host([hidden]) {
		display: none;
	}

	:host([size="16"]) {
		--_icon-cell-size: var(--primitives-space-16);
	}

	:host([size="20"]) {
		--_icon-cell-size: var(--primitives-space-20);
	}

	:host([size="32"]) {
		--_icon-cell-size: var(--primitives-space-32);
	}

	/* ## Color */

	:host([color="secondary"]) {
		--_icon-cell-content-color: var(--context-content-secondary-color, var(--semantics-content-secondary-color));
	}

	:host([color="accent"]) {
		--_icon-cell-content-color: var(--context-content-accent-color, var(--semantics-content-accent-color));
	}

	:host([color="success"]) {
		--_icon-cell-content-color: var(--context-content-success-color, var(--semantics-content-success-color));
	}

	:host([color="warning"]) {
		--_icon-cell-content-color: var(--context-content-warning-color, var(--semantics-content-warning-color));
	}

	:host([color="critical"]) {
		--_icon-cell-content-color: var(--context-content-critical-color, var(--semantics-content-critical-color));
	}


	/* # Vertical alignment */

	:host([vertical-alignment="center"]),
	:host(:not([vertical-alignment])) {
		align-self: stretch;
		justify-content: center;
	}

	:host([vertical-alignment="top"]) {
		align-self: flex-start;
		justify-content: flex-start;
	}

	:host([vertical-alignment="bottom"]) {
		align-self: flex-end;
		justify-content: flex-end;
	}


	/* # Elements */

	/* No width/height here: a slotted nldd-icon defines its own --_icon-cell-size,
	   which shadows this cell's --_icon-cell-size in ::slotted var() resolution
	   (custom props resolve against the slotted element). The icon sizes
	   itself — width fills the cell, height auto keeps it square. */
	::slotted(*) {
		display: block;
		flex-shrink: 0;
	}

	/* A disclosure chevron turns on command of the row or the segment, which set
	   --context-cell-glyph-rotation. The glyph turns, never the cell: a transform
	   on the cell changes the box getBoundingClientRect() reports, and that box is
	   what a row measures to place its divider. */
	.icon-cell__glyph {
		/* Flex, not block: a block box adds the line-height leading around the
		   glyph, which made the cell measure taller than the icon it holds. The
		   centering lives here too — the glyph sits in this box, so the host can
		   no longer place it. */
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		rotate: var(--context-cell-glyph-rotation, 0deg);
		transition: rotate var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default);
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-cell__glyph {
			transition: none;
		}
	}
`;
