import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const linkStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	/* Two modes: no [size] or [size="inherit"] → display:inline (wraps in
	   running text, inherits font). Sized xs/sm/md/lg → inline-flex (start/end
	   icons baseline-aligned with explicit gap). */

	:host {
		${inheritedTextReset}
		-webkit-tap-highlight-color: transparent;
	}

	:host(:not([size])),
	:host([size="inherit"]) {
		display: inline;
	}

	:host([size="xs"]),
	:host([size="sm"]),
	:host([size="md"]),
	:host([size="lg"]) {
		display: inline-flex;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Block */

	.link {
		border-radius: var(--primitives-corner-radius-xs);
		background: none;
		color: var(--semantics-links-color);
		text-decoration: none;
		transition: color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default);
		appearance: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.link {
			transition: none;
		}
	}

	:host(:not([size])) .link,
	:host([size="inherit"]) .link {
		display: inline;
	}

	:host([size="xs"]) .link {
		display: inline-flex;
		gap: var(--primitives-space-4);
		align-items: center;
		font: var(--primitives-font-body-xs-regular-flat);
	}

	:host([size="sm"]) .link {
		display: inline-flex;
		gap: var(--primitives-space-4);
		align-items: center;
		font: var(--primitives-font-body-sm-regular-flat);
	}

	:host([size="md"]) .link {
		display: inline-flex;
		gap: var(--primitives-space-6);
		align-items: center;
		font: var(--primitives-font-body-md-regular-flat);
	}

	:host([size="lg"]) .link {
		display: inline-flex;
		gap: var(--primitives-space-6);
		align-items: center;
		font: var(--primitives-font-body-lg-regular-flat);
	}

	@media (hover: hover) {
		.link:hover {
			color: var(--semantics-links-is-hovered-color);
		}
	}

	.link:active {
		color: var(--semantics-links-is-active-color);
	}

	.link:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	@media (forced-colors: active) {
		.link:focus-visible {
			outline: 2px solid CanvasText;
		}
	}

	.link:focus:not(:focus-visible) {
		outline: none;
	}


	/* # Elements */

	.link__label {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.link:focus-visible .link__label {
		text-decoration: none;
	}

	.link__start-icon,
	.link__end-icon {
		display: inline-flex;
		position: relative;
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		align-items: center;
	}

	:host(:not([size])) .link__start-icon,
	:host([size="inherit"]) .link__start-icon,
	:host(:not([size])) .link__end-icon,
	:host([size="inherit"]) .link__end-icon {
		top: 0.2em;
	}

	/* Visually-hidden link hint (another website, a new tab); part of
	   the link's accessible name but never shown. Standard visually-hidden recipe. */
	.link__link-hint {
		position: absolute;
		margin: -1px;
		border: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		padding: 0;
		white-space: nowrap;
		clip-path: inset(50%);
	}
`;
