import { css } from 'lit';


export const validationListStyles = css`


	/* # Host */

	:host {
		--_validation-list-gap: var(--primitives-space-2);

		display: block;
	}

	:host(:not(.has-items)) {
		display: none;
	}

	:host([hidden]) {
		display: none;
	}


	/* # List */

	.validation-list {
		display: flex;
		flex-direction: column;
		gap: var(--_validation-list-gap);
	}
`;


export const validationItemStyles = css`


	/* # Host */

	:host {
		--_validation-item-content-color: var(--semantics-content-color);
		--_validation-item-font: var(--primitives-font-body-sm-regular-tight);

		display: none;
		color: var(--_validation-item-content-color);
		font: var(--_validation-item-font);
	}

	:host([visible]) {
		display: block;
	}

	:host([unmet]) {
		--_validation-item-content-color: var(--semantics-content-critical-color);
	}

	/* After the visible rule at equal specificity: hidden must also win on an
	   item that is currently shown. */
	:host([hidden]) {
		display: none;
	}
`;
