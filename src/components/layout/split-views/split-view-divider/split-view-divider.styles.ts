import { css } from 'lit';

export const splitViewDividerStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_split-view-divider-thickness: var(--semantics-dividers-thickness);

		display: flex;
		flex-shrink: 0;
		align-self: stretch;
	}

	:host([hidden]) {
		display: none;
	}

	:host([has-drag-handle]) {
		--_split-view-divider-thickness: var(--primitives-space-12);
	}


	/* # Block */

	.split-view-divider {
		display: flex;
		position: relative;
		background-color: var(--semantics-dividers-color);
		width: var(--_split-view-divider-thickness);
		height: 100%;
		align-items: center;
		justify-content: center;
	}

	:host([orientation="horizontal"]) .split-view-divider {
		width: 100%;
		height: var(--_split-view-divider-thickness);
	}

	@media (forced-colors: active) {
		.split-view-divider {
			background-color: CanvasText;
		}
	}


	/* # Elements */

	.split-view-divider__drag-handle {
		position: absolute;
		border-radius: var(--primitives-corner-radius-full);
		background-color: var(--semantics-content-secondary-color);
		width: var(--primitives-space-4);
		height: var(--primitives-space-40);
	}

	:host([orientation="horizontal"]) .split-view-divider__drag-handle {
		width: var(--primitives-space-40);
		height: var(--primitives-space-4);
	}
`;
