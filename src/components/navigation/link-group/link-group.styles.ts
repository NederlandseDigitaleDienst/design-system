import { css } from 'lit';

export const linkGroupStyles = css`


	/* # Host */

	:host {
		--_link-group-flex-direction: row;
		--_link-group-flex-wrap: wrap;
		--_link-group-row-gap: var(--primitives-space-12);
		--_link-group-column-gap: var(--primitives-space-16);
		--_link-group-align-items: baseline;
		--_link-group-justify-content: flex-start;

		box-sizing: border-box;
		display: block;
	}

	:host([size="xs"]),
	:host([size="sm"]) {
		--_link-group-row-gap: var(--primitives-space-8);
		--_link-group-column-gap: var(--primitives-space-12);
	}

	:host([orientation="vertical"]) {
		--_link-group-flex-direction: column;
		--_link-group-flex-wrap: nowrap;
		--_link-group-align-items: flex-start;
	}

	:host([horizontal-alignment="center"]) {
		--_link-group-justify-content: center;
	}

	:host([horizontal-alignment="center"][orientation="vertical"]) {
		--_link-group-align-items: center;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Block */

	.link-group__items {
		display: flex;
		flex-direction: var(--_link-group-flex-direction);
		flex-wrap: var(--_link-group-flex-wrap);
		row-gap: var(--_link-group-row-gap);
		column-gap: var(--_link-group-column-gap);
		align-items: var(--_link-group-align-items);
		justify-content: var(--_link-group-justify-content);
	}

	:host([horizontal-alignment="center"]) .link-group__items {
		text-align: center;
	}
`;
