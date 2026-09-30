import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const topTitleBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		${inheritedTextReset}
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.top-title-bar {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		padding-inline: var(--primitives-space-6);
		flex-direction: row;
		align-items: center;
	}


	/* # Elements */

	.top-title-bar__start {
		display: flex;
		min-width: 0;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		align-items: center;
	}

	.top-title-bar__end {
		display: flex;
		margin-top: var(--primitives-space-6);
		flex-direction: row;
		flex-grow: 0;
		flex-shrink: 0;
		align-items: center;
	}

	.top-title-bar__end[hidden] {
		display: none;
	}

	.top-title-bar__back-button {
		display: var(--context-back-button-display, flex);
		margin-top: var(--primitives-space-6);
		min-width: 0;
		flex-direction: row;
		align-items: center;
	}

	.top-title-bar__text-back-button {
		display: flex;
		min-width: 0;
	}

	:host(.is-compact) .top-title-bar__text-back-button {
		display: none;
	}

	.top-title-bar__icon-back-button {
		display: none;
	}

	:host(.is-compact) .top-title-bar__icon-back-button {
		display: flex;
	}

	.top-title-bar__divider {
		display: none;
		background-color: var(--components-top-title-bar-divider-color);
		width: var(--semantics-dividers-thickness);
		height: var(--primitives-space-24);
		flex-shrink: 0;
	}

	:host(.is-compact) .top-title-bar__divider {
		display: block;
	}

	.top-title-bar__title-group {
		display: none;
		margin-top: var(--primitives-space-6);
		min-width: 0;
		min-height: var(--semantics-controls-md-min-size);
		overflow: hidden;
		padding-inline: var(--primitives-space-10);
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 1;
		justify-content: center;
	}

	:host(.is-compact) .top-title-bar__title-group {
		display: flex;
	}

	.top-title-bar__title {
		margin: 0;
		overflow: hidden;
		color: var(--semantics-content-color);
		font: var(--primitives-font-body-lg-semi-bold-flat);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.top-title-bar__title:has(+ .top-title-bar__supporting-text) {
		font: var(--primitives-font-body-md-semi-bold-flat);
	}

	@media (forced-colors: active) {
		.top-title-bar__title {
			color: CanvasText;
		}
	}

	.top-title-bar__supporting-text {
		margin: 0;
		overflow: hidden;
		color: var(--semantics-content-secondary-color);
		font: var(--primitives-font-body-xxs-regular-flat);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.top-title-bar__dismiss-button {
		display: var(--context-dismiss-button-display, block);
	}
`;
