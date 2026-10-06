import { css } from 'lit';

export const toggleButtonGroupStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_toggle-button-group-md-gap: var(--primitives-space-8);
		--_toggle-button-group-sm-gap: var(--primitives-space-6);
		--_toggle-button-group-xs-gap: var(--primitives-space-4);

		display: block;
		isolation: isolate;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.toggle-button-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--_toggle-button-group-md-gap);
	}

	:host([size="sm"]) .toggle-button-group {
		gap: var(--_toggle-button-group-sm-gap);
	}

	:host([size="xs"]) .toggle-button-group {
		gap: var(--_toggle-button-group-xs-gap);
	}
`;
