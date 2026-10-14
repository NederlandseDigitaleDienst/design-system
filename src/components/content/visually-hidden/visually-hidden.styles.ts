import { css } from 'lit';

export const visuallyHiddenStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		display: block;
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
		clip-path: inset(50%);
	}

	:host([hidden]) {
		display: none;
	}
`;
