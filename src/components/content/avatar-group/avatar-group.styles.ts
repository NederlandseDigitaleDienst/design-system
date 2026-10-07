import { css } from 'lit';

export const avatarGroupStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_avatar-group-size: var(--primitives-space-40);
		--_avatar-group-overlap-size: calc(var(--_avatar-group-size) * 0.2);
		--_avatar-group-ring-thickness: var(--semantics-surfaces-ring-thickness);
		--_avatar-group-ring-color: var(--context-parent-background-color, var(--semantics-surfaces-base-background-color));
		--_avatar-group-corner-radius: var(--primitives-corner-radius-full);
		--_avatar-group-overflow-background-color: light-dark(var(--primitives-color-neutral-25), var(--primitives-color-neutral-150));
		--_avatar-group-overflow-hover-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-200));
		--_avatar-group-overflow-content-color: var(--semantics-content-secondary-color);
		--_avatar-group-overflow-font: var(--primitives-font-body-xs-medium-flat);

		display: inline-flex;
		vertical-align: middle;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Size */

	:host([size="16"]) { --_avatar-group-size: var(--primitives-space-16); }
	:host([size="20"]) { --_avatar-group-size: var(--primitives-space-20); }
	:host([size="24"]) { --_avatar-group-size: var(--primitives-space-24); }
	:host([size="28"]) { --_avatar-group-size: var(--primitives-space-28); }
	:host([size="32"]) { --_avatar-group-size: var(--primitives-space-32); }
	:host([size="44"]) { --_avatar-group-size: var(--primitives-space-44); }
	:host([size="48"]) { --_avatar-group-size: var(--primitives-space-48); }
	:host([size="56"]) { --_avatar-group-size: var(--primitives-space-56); }
	:host([size="64"]) { --_avatar-group-size: var(--primitives-space-64); }
	:host([size="80"]) { --_avatar-group-size: var(--primitives-space-80); }
	:host([size="96"]) { --_avatar-group-size: var(--primitives-space-96); }


	/* # Group */

	.avatar-group {
		display: flex;
		padding-inline-start: var(--_avatar-group-overlap-size);
	}


	/* # Overflow

	   A step away from the surface rather than towards it: it is the one disc
	   that holds no face, and it has to stay a disc. In light that means one
	   step down from the avatar fill; in dark the scale runs the other way, so
	   it is one step up from the surface instead — a darker disc would sink
	   into the page. */

	.avatar-group__overflow-button {
		appearance: none;
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		z-index: 0;
		flex-shrink: 0;
		margin-inline-start: calc(-1 * var(--_avatar-group-overlap-size));
		border: none;
		border-radius: var(--_avatar-group-corner-radius);
		box-shadow: 0 0 0 var(--_avatar-group-ring-thickness) var(--_avatar-group-ring-color);
		background-color: var(--_avatar-group-overflow-background-color);
		width: var(--_avatar-group-size);
		height: var(--_avatar-group-size);
		padding: 0;
		align-items: center;
		justify-content: center;
		color: var(--_avatar-group-overflow-content-color);
		font: var(--_avatar-group-overflow-font);
	}

	/* The smallest step the neutral scale has, one notch off the resting fill.
	   No semantic hover token fits: the button-hover colors are meant for a
	   control that already looks like a button, and here they read as a jump.
	   It only has to confirm that this disc is clickable. */
	.avatar-group__overflow-button:hover {
		background-color: var(--_avatar-group-overflow-hover-background-color);
	}

	.avatar-group__overflow-button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
	}


	/* # Avatars

	   A slotted avatar can't be wrapped, so the group sizes it here. The ring
	   is a box-shadow rather than a border: it sits outside the shape without
	   changing the diameter, so overlap stays exact. */

	/* !important: nldd-avatar sizes itself from :host([size]) in its own shadow
	   tree, and a tree's own rules beat an outer ::slotted() of equal weight. */
	.avatar-group ::slotted(nldd-avatar) {
		position: relative;
		flex-shrink: 0;
		margin-inline-start: calc(-1 * var(--_avatar-group-overlap-size));
		border-radius: var(--_avatar-group-corner-radius);
		box-shadow: 0 0 0 var(--_avatar-group-ring-thickness) var(--_avatar-group-ring-color);
		width: var(--_avatar-group-size) !important;
		height: var(--_avatar-group-size) !important;
	}

	/* A box-shadow does not paint in forced colors, so the separation comes
	   back as a real border there. */
	@media (forced-colors: active) {
		.avatar-group ::slotted(nldd-avatar) {
			border: var(--_avatar-group-ring-thickness) solid Canvas;
		}
	}
`;
