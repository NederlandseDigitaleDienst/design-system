import { css, unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.js';
import { slottedReset, inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

const smMax = unsafeCSS(breakpoints.smMax);

export const identityStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_identity-gap: var(--primitives-space-8);
		--_identity-avatar-size: var(--primitives-space-40);
		--_identity-avatar-corner-radius: var(--primitives-corner-radius-full);
		--_identity-text-color: var(--semantics-content-color);
		--_identity-text-font: var(--primitives-font-body-md-medium-tight);
		--_identity-supporting-text-color: var(--semantics-content-secondary-color);
		--_identity-supporting-text-font: var(--primitives-font-body-sm-regular-tight);

		${inheritedTextReset}
		container-type: inline-size;
		display: block;
		width: 100%;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Identity */

	.identity {
		display: flex;
		align-items: center;
		gap: var(--_identity-gap);
	}

	.identity[data-multiple-avatars] {
		@container (max-width: ${smMax}) {
			flex-direction: column;
			align-items: flex-start;
		}
	}


	/* # Avatars

	   The avatars themselves belong to nldd-avatar-group: it sizes them, makes
	   them overlap and draws the ring. Identity only decides where the row
	   sits. Note that a group has to be slotted by the consumer — an avatar
	   forwarded through this slot never becomes a child of a group rendered
	   here, and ::slotted() only reaches its own assigned nodes. */

	.identity__avatars {
		display: flex;
	}

	/* One avatar may be slotted bare, and then identity gives it its size: a
	   group of one would be a wrapper that says nothing. From two on, the group
	   does the work, and these rules do not reach into it. */
	.identity__avatars ::slotted(nldd-avatar) {
		width: var(--_identity-avatar-size) !important;
		height: var(--_identity-avatar-size) !important;
	}

	.identity__avatars ::slotted(img) {
		${slottedReset}
		display: block !important;
		border-radius: var(--_identity-avatar-corner-radius) !important;
		width: var(--_identity-avatar-size) !important;
		height: var(--_identity-avatar-size) !important;
		object-fit: cover !important;
	}

	.identity__avatars[hidden] {
		display: none;
	}


	/* # Text area */

	.identity__text-area {
		display: flex;
		min-width: 0;
		flex-direction: column;
	}

	.identity__text-area[hidden] {
		display: none;
	}

	.identity__text {
		margin: 0;
		color: var(--_identity-text-color);
		font: var(--_identity-text-font);
		text-wrap: pretty;
	}

	.identity__text[hidden] {
		display: none;
	}

	.identity__supporting-text {
		margin: 0;
		color: var(--_identity-supporting-text-color);
		font: var(--_identity-supporting-text-font);
		text-wrap: pretty;
	}

	.identity__supporting-text[hidden] {
		display: none;
	}
`;
