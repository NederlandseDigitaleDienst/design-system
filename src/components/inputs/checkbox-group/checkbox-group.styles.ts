import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const checkboxGroupStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		${inheritedTextReset}
		display: block;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.checkbox-group {
		display: flex;
		flex-direction: column;
	}
`;
