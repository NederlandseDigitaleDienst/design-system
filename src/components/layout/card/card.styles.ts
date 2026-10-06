import { css } from 'lit';

export const cardStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_card-background-color: var(--semantics-surfaces-base-background-color);
		--_card-border-color: var(--semantics-surfaces-base-border-color);
		--_card-is-hovered-background-color: light-dark(var(--primitives-color-neutral-25), var(--primitives-color-neutral-150));
		--_card-is-hovered-border-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-250));
		--_card-is-active-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-200));
		--_card-is-active-border-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-300));
		--_card-corner-radius: var(--semantics-surfaces-corner-radius);
		--_card-box-shadow: none;
		--_card-highlight-border-width: var(--semantics-surfaces-border-width);

		display: flex;
		/* Anchor for the focus ring, which hangs outside the card box. */
		position: relative;
		width: 100%;
		flex-direction: column;
	}

	:host([hidden]) {
		display: none;
	}


	/* ## Background variants */

	:host([background="tinted"]) {
		--_card-background-color: var(--semantics-surfaces-tinted-background-color);
		--_card-border-color: var(--semantics-surfaces-tinted-border-color);
		--_card-is-hovered-background-color: light-dark(var(--primitives-color-neutral-50), var(--primitives-color-neutral-100));
		--_card-is-hovered-border-color: light-dark(var(--primitives-color-neutral-100), var(--primitives-color-neutral-250));
		--_card-is-active-background-color: light-dark(var(--primitives-color-neutral-75), var(--primitives-color-neutral-150));
		--_card-is-active-border-color: light-dark(var(--primitives-color-neutral-150), var(--primitives-color-neutral-300));
	}


	/* # Block */

	.card {
		display: flex;
		position: relative;
		border-radius: var(--_card-corner-radius);
		box-shadow: var(--_card-box-shadow);
		background-color: var(--_card-background-color);
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		isolation: isolate;
		transition: background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default);
	}

	@media (hover: hover) {
		.card:has(> .card__action:hover) {
			--_card-border-color: var(--_card-is-hovered-border-color);
			background-color: var(--_card-is-hovered-background-color);
		}
	}

	.card:has(> .card__action:active) {
		--_card-border-color: var(--_card-is-active-border-color);
		background-color: var(--_card-is-active-background-color);
	}

	.card::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--_card-highlight-border-width) var(--_card-border-color);
		pointer-events: none;
	}


	/* # Link / button overlay */

	.card__action {
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: inherit;
	}

	a.card__action {
		cursor: var(--semantics-controls-link-cursor);
	}

	/* Strip the native button chrome so the overlay stays invisible; the focus
	   ring is drawn on the card below, same as for the anchor. */
	button.card__action {
		margin: 0;
		outline: none;
		border: none;
		background: none;
		padding: 0;
		appearance: none;
	}

	/* Shown from JS (a class on the host) instead of with
	   :has(.card__action:focus-visible): Safari does not re-evaluate a dynamic
	   pseudo-class inside :has(), so the ring stayed away there while Chromium
	   drew it.

	   The ring is a sibling of the card, not something drawn on it. Two reasons:
	   the card clips its descendants (overflow: hidden keeps images and fills
	   inside the rounded corners), so a ring drawn within would be cut off at the
	   edge; and the card's own box-shadow is a token that may be "none", which
	   cannot be combined with a second shadow in one declaration — the whole
	   declaration would be dropped and the ring's halo with it. */
	.card__focus-ring {
		display: none;
		position: absolute;
		inset: 0;
		border-radius: var(--_card-corner-radius);
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
		pointer-events: none;
	}

	:host(.is-action-focused) .card__focus-ring {
		display: block;
	}


	/* # Elements */

	.card__header {
		flex-shrink: 0;
	}

	.card__header[hidden] {
		display: none;
	}

	.card__main {
		display: flex;
		min-height: 0;
		flex-direction: column;
		flex-grow: 1;
	}

	.card__footer {
		flex-shrink: 0;
	}

	.card__footer[hidden] {
		display: none;
	}
`;
