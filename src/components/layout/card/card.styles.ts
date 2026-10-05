import { css } from 'lit';

export const cardStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_background-color: var(--components-card-background-color);
		--_border-color: var(--components-card-highlight-border-color);
		--_is-hovered-background-color: var(--components-card-is-hovered-background-color);
		--_is-hovered-border-color: var(--components-card-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--components-card-is-active-background-color);
		--_is-active-border-color: var(--components-card-is-active-highlight-border-color);

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
		--_background-color: var(--components-card-tinted-background-color);
		--_border-color: var(--components-card-tinted-highlight-border-color);
		--_is-hovered-background-color: var(--components-card-tinted-is-hovered-background-color);
		--_is-hovered-border-color: var(--components-card-tinted-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--components-card-tinted-is-active-background-color);
		--_is-active-border-color: var(--components-card-tinted-is-active-highlight-border-color);
	}


	/* # Block */

	.card {
		display: flex;
		position: relative;
		border-radius: var(--components-card-corner-radius);
		box-shadow: var(--components-card-box-shadow);
		background-color: var(--_background-color);
		overflow: hidden;
		flex-direction: column;
		flex-grow: 1;
		isolation: isolate;
		transition: background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default);
	}

	/* A card that is one link or button reacts like a button: one step up on
	   hover, one more while pressed. Only the overlay counts, so a button lifted
	   above it in the footer does not light up the whole card. */
	@media (hover: hover) {
		.card:has(> .card__action:hover) {
			--_border-color: var(--_is-hovered-border-color);
			background-color: var(--_is-hovered-background-color);
		}
	}

	.card:has(> .card__action:active) {
		--_border-color: var(--_is-active-border-color);
		background-color: var(--_is-active-background-color);
	}

	.card::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 var(--components-card-highlight-border-width) var(--_border-color);
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
		border-radius: var(--components-card-corner-radius);
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
