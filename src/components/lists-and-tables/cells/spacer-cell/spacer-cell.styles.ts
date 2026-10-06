import { css } from 'lit';

export const spacerCellStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_spacer-cell-width: var(--primitives-space-16);

		display: block;
		width: var(--_spacer-cell-width);
		flex-grow: 0;
		flex-shrink: 0;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Size */

	:host([size="2"])  { --_spacer-cell-width: var(--primitives-space-2); }
	:host([size="4"])  { --_spacer-cell-width: var(--primitives-space-4); }
	:host([size="6"])  { --_spacer-cell-width: var(--primitives-space-6); }
	:host([size="8"])  { --_spacer-cell-width: var(--primitives-space-8); }
	:host([size="10"]) { --_spacer-cell-width: var(--primitives-space-10); }
	:host([size="12"]) { --_spacer-cell-width: var(--primitives-space-12); }
	:host([size="20"]) { --_spacer-cell-width: var(--primitives-space-20); }
	:host([size="24"]) { --_spacer-cell-width: var(--primitives-space-24); }
	:host([size="28"]) { --_spacer-cell-width: var(--primitives-space-28); }
	:host([size="32"]) { --_spacer-cell-width: var(--primitives-space-32); }
	:host([size="40"]) { --_spacer-cell-width: var(--primitives-space-40); }
	:host([size="44"]) { --_spacer-cell-width: var(--primitives-space-44); }
	:host([size="48"]) { --_spacer-cell-width: var(--primitives-space-48); }
	:host([size="56"]) { --_spacer-cell-width: var(--primitives-space-56); }
	:host([size="64"]) { --_spacer-cell-width: var(--primitives-space-64); }
	:host([size="80"]) { --_spacer-cell-width: var(--primitives-space-80); }
	:host([size="96"]) { --_spacer-cell-width: var(--primitives-space-96); }

	:host([size="flexible"]) {
		--_spacer-cell-width: auto;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
	}
`;
