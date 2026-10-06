import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const buttonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_button-corner-radius: var(--semantics-controls-md-corner-radius);
		/* A parent that stacks its buttons says so through the context variable;
		   the button's own width attribute overrides it with an inline style. */
		--_button-width: var(--context-button-width, auto);
		--_button-min-size: var(--semantics-controls-md-min-size);
		--_button-block-padding: var(--semantics-controls-md-block-padding);
		--_button-inline-padding: var(--semantics-buttons-md-inline-padding);
		--_button-gap: var(--semantics-buttons-md-gap);
		--_button-font: var(--semantics-buttons-md-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-md-icon-size);
		--_button-disclosure-icon-size: var(--primitives-space-20);
		--_button-supporting-font: var(--semantics-buttons-md-supporting-text-font);
		--_button-background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_button-primary-content-color: var(--semantics-buttons-neutral-tinted-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-tinted-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);

		${inheritedTextReset}
		/* inline-flex, not inline-block: a block container puts the control on a
		   line, and the strut's descender then grows the host with the inherited
		   line-height, so the same button is taller in body text than in a form. */
		display: inline-flex;
		position: relative;
		/* A definite width, so a flex or grid parent doesn't stretch the host: an
		   inline-block shrink-wraps in normal flow, but as a flex item it would be
		   stretched to the full line while the button inside stays content-sized —
		   leaving an invisible box around the button that swallows clicks that
		   look like they land beside it. align-self would only cover flex. */
		width: fit-content;
		max-width: 100%;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	:host([size="xs"]) {
		--_button-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_button-min-size: var(--semantics-controls-xs-min-size);
		--_button-block-padding: var(--semantics-controls-xs-block-padding);
		--_button-inline-padding: var(--semantics-buttons-xs-inline-padding);
		--_button-gap: var(--semantics-buttons-xs-gap);
		--_button-font: var(--semantics-buttons-xs-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-xs-icon-size);
		--_button-disclosure-icon-size: var(--primitives-space-16);
		--_button-supporting-font: var(--semantics-buttons-xs-supporting-text-font);
	}

	:host([size="sm"]) {
		--_button-corner-radius: var(--semantics-controls-sm-corner-radius);
		--_button-min-size: var(--semantics-controls-sm-min-size);
		--_button-block-padding: var(--semantics-controls-sm-block-padding);
		--_button-inline-padding: var(--semantics-buttons-sm-inline-padding);
		--_button-gap: var(--semantics-buttons-sm-gap);
		--_button-font: var(--semantics-buttons-sm-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-sm-icon-size);
		--_button-disclosure-icon-size: var(--primitives-space-18);
		--_button-supporting-font: var(--semantics-buttons-sm-supporting-text-font);
	}

	:host([size="lg"]) {
		--_button-corner-radius: var(--semantics-controls-lg-corner-radius);
		--_button-min-size: var(--semantics-controls-lg-min-size);
		--_button-block-padding: var(--semantics-controls-lg-block-padding);
		--_button-inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_button-gap: var(--semantics-buttons-lg-gap);
		--_button-font: var(--semantics-buttons-lg-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-lg-icon-size);
		--_button-disclosure-icon-size: var(--primitives-space-24);
		--_button-supporting-font: var(--semantics-buttons-lg-supporting-text-font);
	}

	:host([appearance="neutral-base"]) {
		--_button-background-color: var(--semantics-buttons-neutral-base-background-color);
		--_button-primary-content-color: var(--semantics-buttons-neutral-base-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-base-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-neutral-base-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-neutral-base-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-base-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-base-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-neutral-base-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-base-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-base-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-active-highlight-border-color);
	}

	:host([appearance="neutral-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-neutral-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	:host([appearance="accent-filled"]),
	:host([appearance="primary"]) {
		--_button-background-color: var(--semantics-buttons-accent-filled-background-color);
		--_button-primary-content-color: var(--semantics-buttons-accent-filled-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-accent-filled-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-accent-filled-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-accent-filled-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-accent-filled-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-accent-filled-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-accent-filled-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-accent-filled-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-accent-filled-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-accent-filled-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-accent-filled-is-active-highlight-border-color);
	}

	:host([appearance="accent-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-accent-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-accent-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	:host([appearance="critical-tinted"]),
	:host([appearance="destructive"]) {
		--_button-background-color: var(--semantics-buttons-critical-tinted-background-color);
		--_button-primary-content-color: var(--semantics-buttons-critical-tinted-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-critical-tinted-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-critical-tinted-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-critical-tinted-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-critical-tinted-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-critical-tinted-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-critical-tinted-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-critical-tinted-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-critical-tinted-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-critical-tinted-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-critical-tinted-is-active-highlight-border-color);
	}

	:host([appearance="critical-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-critical-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-critical-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	/* The on-color variants derive from currentColor (which stays
	   unresolved inside the tokens). The filled label prefers the surface
	   color from --context-parent-background-color; that var() must resolve
	   here on the host — inside a :root token it would freeze — with the
	   tokens' white/black contrast flip as fallback. */

	:host([appearance="inherit-tinted"]),
	:host([expanded][appearance="inherit-tinted"]) {
		--_button-background-color: var(--context-button-background-color, var(--semantics-buttons-inherit-tinted-background-color));
		--_button-primary-content-color: var(--semantics-buttons-inherit-tinted-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-inherit-tinted-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-inherit-tinted-highlight-border-color);
		--_button-is-hovered-background-color: var(--_button-background-color);
		--_button-is-hovered-primary-content-color: var(--_button-primary-content-color);
		--_button-is-hovered-secondary-content-color: var(--_button-secondary-content-color);
		--_button-is-hovered-highlight-border-color: var(--_button-highlight-border-color);
		--_button-is-active-background-color: var(--_button-background-color);
		--_button-is-active-primary-content-color: var(--_button-primary-content-color);
		--_button-is-active-secondary-content-color: var(--_button-secondary-content-color);
		--_button-is-active-highlight-border-color: var(--_button-highlight-border-color);
	}

	:host([appearance="inherit-filled"]),
	:host([expanded][appearance="inherit-filled"]) {
		--_button-background-color: var(--semantics-buttons-inherit-filled-background-color);
		--_button-primary-content-color: var(--context-parent-background-color, var(--semantics-buttons-inherit-filled-content-color));
		--_button-secondary-content-color: var(--semantics-buttons-inherit-filled-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-inherit-filled-highlight-border-color);
		--_button-is-hovered-background-color: var(--_button-background-color);
		--_button-is-hovered-primary-content-color: var(--_button-primary-content-color);
		--_button-is-hovered-secondary-content-color: var(--_button-secondary-content-color);
		--_button-is-hovered-highlight-border-color: var(--_button-highlight-border-color);
		--_button-is-active-background-color: var(--_button-background-color);
		--_button-is-active-primary-content-color: var(--_button-primary-content-color);
		--_button-is-active-secondary-content-color: var(--_button-secondary-content-color);
		--_button-is-active-highlight-border-color: var(--_button-highlight-border-color);
	}

	/* For inherit-filled the inner button keeps the inherited on-color:
	   its currentColor background and the label's contrast flip resolve
	   against it, and would otherwise self-reference the label. The label
	   color moves to the content layer instead. The higher specificity of
	   these rules deliberately pins the color through hover/active/expanded. */
	:host([appearance="inherit-filled"]) .button {
		color: inherit;
	}

	:host([appearance="inherit-filled"]) .button > * {
		color: var(--_button-primary-content-color);
	}

	/* ## Expanded — default (incl. unknown variant) */

	:host([expanded]) {
		--_button-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-background-color);
		--_button-primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][appearance="neutral-base"]) {
		--_button-background-color: var(--semantics-buttons-neutral-base-is-expanded-background-color);
		--_button-primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][appearance="neutral-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-neutral-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-neutral-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	:host([expanded][appearance="accent-filled"]),
	:host([expanded][appearance="primary"]) {
		--_button-background-color: var(--semantics-buttons-accent-filled-is-expanded-background-color);
		--_button-primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][appearance="accent-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-accent-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-accent-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	:host([expanded][appearance="critical-tinted"]),
	:host([expanded][appearance="destructive"]) {
		--_button-background-color: var(--semantics-buttons-critical-tinted-is-expanded-background-color);
		--_button-primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-content-secondary-color);
		--_button-highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-highlight-border-color);
		--_button-is-hovered-background-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-background-color);
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-highlight-border-color);
		--_button-is-active-background-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-background-color);
		--_button-is-active-primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][appearance="critical-transparent"]) {
		--_button-background-color: transparent;
		--_button-primary-content-color: var(--semantics-buttons-critical-transparent-content-color);
		--_button-secondary-content-color: var(--semantics-buttons-critical-transparent-content-secondary-color);
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-background-color: transparent;
		--_button-is-hovered-primary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-color);
		--_button-is-hovered-secondary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-secondary-color);
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-background-color: transparent;
		--_button-is-active-primary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-color);
		--_button-is-active-secondary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-secondary-color);
		--_button-is-active-highlight-border-color: transparent;
	}

	:host([width="full"]) {
		display: block;
		width: 100%;
	}

	:host([horizontal-alignment="left"]) .button {
		justify-content: flex-start;
		text-align: left;
	}

	:host([horizontal-alignment="right"]) .button {
		justify-content: flex-end;
		text-align: right;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}

	:host([no-highlight-border]),
	:host([no-highlight-border][expanded]) {
		--_button-highlight-border-color: transparent;
		--_button-is-hovered-highlight-border-color: transparent;
		--_button-is-active-highlight-border-color: transparent;
	}


	/* # Block */

	.button {
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		margin: 0;
		border: none;
		border-radius: var(--_button-corner-radius);
		background: none;
		background-color: var(--_button-background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_button-highlight-border-color);
		width: var(--_button-width);
		min-width: var(--_button-min-size);
		max-width: 100%;
		min-height: var(--_button-min-size);
		padding: var(--_button-block-padding) var(--_button-inline-padding);
		gap: var(--_button-gap);
		align-items: center;
		justify-content: center;
		color: var(--_button-primary-content-color);
		font: var(--_button-font);
		text-align: center;
		text-decoration: none;
		text-wrap: pretty;
		transition:
			background-color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default),
			color var(--primitives-transition-duration-fast) var(--primitives-transition-easing-default)
		;
		appearance: none;
	}

	a.button {
		cursor: var(--semantics-controls-link-cursor);
	}

	.button:hover {
		@media (hover: hover) {
			background-color: var(--_button-is-hovered-background-color);
			color: var(--_button-is-hovered-primary-content-color);
			--_button-highlight-border-color: var(--_button-is-hovered-highlight-border-color);
		}
	}

	.button:active {
		background-color: var(--_button-is-active-background-color);
		color: var(--_button-is-active-primary-content-color);
		--_button-highlight-border-color: var(--_button-is-active-highlight-border-color);
	}

	/* Loading keeps the control focusable (not disabled); activation is blocked in JS. */
	:host([loading]) .button {
		cursor: default;
	}

	.button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_button-highlight-border-color);
	}

	.button:focus:not(:focus-visible) {
		outline: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.button,
		.button__content {
			transition: none;
		}
	}


	/* # Elements */

	.button__content {
		display: inline-flex;
		max-width: 100%;
		min-width: 0;
		align-items: center;
		/* Space between the icons and the text-area. Was padding-inline on the
		   text-area; a flex gap keeps it off the text and out of the no-icon edges. */
		gap: var(--_button-gap);
		transition: opacity var(--primitives-transition-duration-slow) var(--primitives-transition-easing-default);
	}

	/* Loading crossfades the content out (opacity, not visibility, so the button
	   keeps its accessible name) while the indicator fades in. The content stays
	   laid out, so the button keeps its width. */
	:host([loading]) .button__content {
		opacity: 0;
	}

	:host([loading]) .button__disclosure-icon {
		opacity: 0;
	}

	/* Wrapper overlaid on the control, positioned against the host (which is
	   position:relative). It lives outside the <button>/<a> so the indicator's
	   role="status" live region announces loading without joining the button's
	   accessible name. The activity-indicator inside fills it and centers its
	   circle, which inherits the content color via currentColor. */
	.button__activity-indicator {
		position: absolute;
		inset: 0;
		color: var(--_button-primary-content-color);
	}

	::slotted(nldd-icon) {
		display: none;
	}

	.button__text {
		min-width: 0;
	}

	/* A capped button truncates by itself: max-width is there to keep the button
	   within a bound, and a label that wrapped to three lines would defeat that. */
	:host([single-line]) .button__text,
	:host([max-width]) .button__text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.button__text-area {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	:host([size="xs"]) .button__text-area,
	:host([size="sm"]) .button__text-area {
		flex-direction: row;
		align-items: baseline;
		gap: var(--_button-gap);
	}

	.button__supporting-text {
		min-width: 0;
		color: var(--_button-secondary-content-color);
		font: var(--_button-supporting-font);
	}

	.button:hover .button__supporting-text {
		@media (hover: hover) {
			color: var(--_button-is-hovered-secondary-content-color);
		}
	}

	.button:active .button__supporting-text {
		color: var(--_button-is-active-secondary-content-color);
	}

	/* Visually-hidden "opens in new tab" announcement (href + target="_blank");
	   part of the link's accessible name but never shown. Standard recipe. */
	.button__opens-in-new-tab-hint {
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

	:host([single-line]) .button__supporting-text,
	:host([max-width]) .button__supporting-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:host(:not([size])) .button.has-supporting-text,
	:host([size="md"]) .button.has-supporting-text {
		--_button-font: var(--semantics-buttons-sm-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-md-has-supporting-text-icon-size);
		--_button-inline-padding: var(--semantics-buttons-md-has-supporting-text-inline-padding);
		--_button-block-padding: var(--primitives-space-4);
	}

	:host([size="lg"]) .button.has-supporting-text {
		--_button-font: var(--semantics-buttons-md-primary-text-font);
		--_button-icon-size: var(--semantics-buttons-lg-has-supporting-text-icon-size);
		--_button-inline-padding: var(--semantics-buttons-lg-has-supporting-text-inline-padding);
		--_button-block-padding: var(--primitives-space-4);
	}

	.button__start-icon,
	.button__end-icon {
		display: flex;
		width: var(--_button-icon-size);
		height: var(--_button-icon-size);
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	/* Those spans are only rendered for the attribute; slotted content lands in a
	   bare slot. Sizing it here rather than wrapping the slot in the same span,
	   because that span has a width and would reserve icon space on every button
	   that has no icon at all. */
	::slotted([slot="start-icon"]),
	::slotted([slot="end-icon"]) {
		flex-shrink: 0;
		width: var(--_button-icon-size);
		height: var(--_button-icon-size);
	}

	:host([expandable]) .button {
		padding-inline-end: calc(var(--_button-inline-padding) + var(--_button-gap) + var(--_button-disclosure-icon-size));
	}

	.button__disclosure-icon {
		display: block;
		position: absolute;
		top: 50%;
		inset-inline-end: var(--_button-inline-padding);
		width: var(--_button-disclosure-icon-size);
		height: var(--_button-disclosure-icon-size);
		transform: translateY(-50%);
	}
`;
