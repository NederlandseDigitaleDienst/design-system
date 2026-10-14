import { css } from 'lit';

export const visuallyHiddenStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		display: block;
		position: absolute;
		/* !important: a reset on * would beat it on the host. The 1px offset keeps
		   the box from adding a pixel to the scroll area of a container. */
		margin: -1px !important;
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
