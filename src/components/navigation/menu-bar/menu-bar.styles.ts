import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const menuBarStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		${inheritedTextReset}
		display: flex;
		min-width: 0;
		flex-grow: 1;
		flex-shrink: 1;
		-webkit-user-select: none;
		user-select: none;
	}

	:host([hidden]),
	:host([empty]) {
		display: none;
	}


	/* # Block */

	.menu-bar {
		display: flex;
		min-width: 0;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		align-items: center;
	}


	/* # Elements */

	.menu-bar__list {
		display: flex;
		min-width: 0;
		flex-direction: row;
		flex-grow: 1;
		flex-shrink: 1;
		align-items: center;
	}

	.menu-bar__overflow-button {
		display: none;
	}
`;
