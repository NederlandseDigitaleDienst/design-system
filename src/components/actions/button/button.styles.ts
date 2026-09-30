import { css } from 'lit';
import { inheritedTextReset } from '../../../assets/styles/shadow-resets.js';

export const buttonStyles = css`
	:host {
		box-sizing: border-box;
	}


	/* # Host */

	:host {
		--_corner-radius: var(--semantics-controls-md-corner-radius);
		/* A parent that stacks its buttons says so through the context variable;
		   the button's own width attribute overrides it with an inline style. */
		--_width: var(--context-button-width, auto);
		--_min-size: var(--semantics-controls-md-min-size);
		--_block-padding: var(--semantics-controls-md-block-padding);
		--_inline-padding: var(--semantics-buttons-md-inline-padding);
		--_gap: var(--semantics-buttons-md-gap);
		--_font: var(--semantics-buttons-md-primary-text-font);
		--_icon-size: var(--semantics-buttons-md-icon-size);
		--_disclosure-icon-size: var(--primitives-space-20);
		--_supporting-font: var(--semantics-buttons-md-supporting-text-font);
		--_background-color: var(--semantics-buttons-neutral-tinted-background-color);
		--_primary-content-color: var(--semantics-buttons-neutral-tinted-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-active-highlight-border-color);

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
		--_corner-radius: var(--semantics-controls-xs-corner-radius);
		--_min-size: var(--semantics-controls-xs-min-size);
		--_block-padding: var(--semantics-controls-xs-block-padding);
		--_inline-padding: var(--semantics-buttons-xs-inline-padding);
		--_gap: var(--semantics-buttons-xs-gap);
		--_font: var(--semantics-buttons-xs-primary-text-font);
		--_icon-size: var(--semantics-buttons-xs-icon-size);
		--_disclosure-icon-size: var(--primitives-space-16);
		--_supporting-font: var(--semantics-buttons-xs-supporting-text-font);
	}

	:host([size="sm"]) {
		--_corner-radius: var(--semantics-controls-sm-corner-radius);
		--_min-size: var(--semantics-controls-sm-min-size);
		--_block-padding: var(--semantics-controls-sm-block-padding);
		--_inline-padding: var(--semantics-buttons-sm-inline-padding);
		--_gap: var(--semantics-buttons-sm-gap);
		--_font: var(--semantics-buttons-sm-primary-text-font);
		--_icon-size: var(--semantics-buttons-sm-icon-size);
		--_disclosure-icon-size: var(--primitives-space-18);
		--_supporting-font: var(--semantics-buttons-sm-supporting-text-font);
	}

	:host([size="lg"]) {
		--_corner-radius: var(--semantics-controls-lg-corner-radius);
		--_min-size: var(--semantics-controls-lg-min-size);
		--_block-padding: var(--semantics-controls-lg-block-padding);
		--_inline-padding: var(--semantics-buttons-lg-inline-padding);
		--_gap: var(--semantics-buttons-lg-gap);
		--_font: var(--semantics-buttons-lg-primary-text-font);
		--_icon-size: var(--semantics-buttons-lg-icon-size);
		--_disclosure-icon-size: var(--primitives-space-24);
		--_supporting-font: var(--semantics-buttons-lg-supporting-text-font);
	}

	:host([variant="neutral-base"]) {
		--_background-color: var(--semantics-buttons-neutral-base-background-color);
		--_primary-content-color: var(--semantics-buttons-neutral-base-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-base-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-neutral-base-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-base-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-base-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-base-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-base-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-base-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-base-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-active-highlight-border-color);
	}

	:host([variant="neutral-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-neutral-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	:host([variant="accent-filled"]),
	:host([variant="primary"]) {
		--_background-color: var(--semantics-buttons-accent-filled-background-color);
		--_primary-content-color: var(--semantics-buttons-accent-filled-content-color);
		--_secondary-content-color: var(--semantics-buttons-accent-filled-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-accent-filled-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-accent-filled-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-accent-filled-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-accent-filled-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-accent-filled-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-accent-filled-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-accent-filled-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-accent-filled-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-accent-filled-is-active-highlight-border-color);
	}

	:host([variant="accent-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-accent-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-accent-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	:host([variant="critical-tinted"]),
	:host([variant="destructive"]) {
		--_background-color: var(--semantics-buttons-critical-tinted-background-color);
		--_primary-content-color: var(--semantics-buttons-critical-tinted-content-color);
		--_secondary-content-color: var(--semantics-buttons-critical-tinted-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-critical-tinted-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-critical-tinted-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-critical-tinted-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-critical-tinted-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-critical-tinted-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-critical-tinted-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-critical-tinted-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-critical-tinted-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-critical-tinted-is-active-highlight-border-color);
	}

	:host([variant="critical-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-critical-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-critical-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	/* The on-color variants derive from currentColor (which stays
	   unresolved inside the tokens). The filled label prefers the surface
	   color from --context-parent-background-color; that var() must resolve
	   here on the host — inside a :root token it would freeze — with the
	   tokens' white/black contrast flip as fallback. */

	:host([variant="inherit-tinted"]) {
		--_background-color: var(--semantics-buttons-inherit-tinted-background-color);
		--_primary-content-color: var(--semantics-buttons-inherit-tinted-content-color);
		--_secondary-content-color: var(--semantics-buttons-inherit-tinted-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-inherit-tinted-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-inherit-tinted-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-inherit-tinted-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-inherit-tinted-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-inherit-tinted-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-inherit-tinted-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-inherit-tinted-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-inherit-tinted-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-inherit-tinted-is-active-highlight-border-color);
	}

	:host([variant="inherit-filled"]) {
		--_background-color: var(--semantics-buttons-inherit-filled-background-color);
		--_primary-content-color: var(--context-parent-background-color, var(--semantics-buttons-inherit-filled-content-color));
		--_secondary-content-color: var(--semantics-buttons-inherit-filled-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-inherit-filled-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-inherit-filled-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-inherit-filled-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-inherit-filled-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-inherit-filled-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-inherit-filled-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-inherit-filled-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-inherit-filled-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-inherit-filled-is-active-highlight-border-color);
	}

	/* For inherit-filled the inner button keeps the inherited on-color:
	   its currentColor background and the label's contrast flip resolve
	   against it, and would otherwise self-reference the label. The label
	   color moves to the content layer instead. The higher specificity of
	   these rules deliberately pins the color through hover/active/expanded. */
	:host([variant="inherit-filled"]) .button {
		color: inherit;
	}

	:host([variant="inherit-filled"]) .button > * {
		color: var(--_primary-content-color);
	}

	/* ## Expanded — default (incl. unknown variant) */

	:host([expanded]) {
		--_background-color: var(--semantics-buttons-neutral-tinted-is-expanded-background-color);
		--_primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-tinted-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][variant="neutral-base"]) {
		--_background-color: var(--semantics-buttons-neutral-base-is-expanded-background-color);
		--_primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-neutral-base-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][variant="neutral-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-neutral-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-neutral-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-neutral-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	:host([expanded][variant="accent-filled"]),
	:host([expanded][variant="primary"]) {
		--_background-color: var(--semantics-buttons-accent-filled-is-expanded-background-color);
		--_primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-content-color);
		--_secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-accent-filled-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][variant="accent-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-accent-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-accent-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-accent-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-accent-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	:host([expanded][variant="critical-tinted"]),
	:host([expanded][variant="destructive"]) {
		--_background-color: var(--semantics-buttons-critical-tinted-is-expanded-background-color);
		--_primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-content-color);
		--_secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-critical-tinted-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][variant="critical-transparent"]) {
		--_background-color: transparent;
		--_primary-content-color: var(--semantics-buttons-critical-transparent-content-color);
		--_secondary-content-color: var(--semantics-buttons-critical-transparent-content-secondary-color);
		--_highlight-border-color: transparent;
		--_is-hovered-background-color: transparent;
		--_is-hovered-primary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-critical-transparent-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-background-color: transparent;
		--_is-active-primary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-critical-transparent-is-active-content-secondary-color);
		--_is-active-highlight-border-color: transparent;
	}

	/* The on-color variants keep their currentColor-derived content; expanded
	   only deepens the background. Content is restated (not inherited from the
	   resting block) because the default [expanded] block has equal
	   specificity and later source order, so it would otherwise win. */
	:host([expanded][variant="inherit-tinted"]) {
		--_background-color: var(--semantics-buttons-inherit-tinted-is-expanded-background-color);
		--_primary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-content-color);
		--_secondary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-inherit-tinted-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-inherit-tinted-is-expanded-is-active-highlight-border-color);
	}

	:host([expanded][variant="inherit-filled"]) {
		--_background-color: var(--semantics-buttons-inherit-filled-is-expanded-background-color);
		--_primary-content-color: var(--context-parent-background-color, var(--semantics-buttons-inherit-filled-is-expanded-content-color));
		--_secondary-content-color: var(--semantics-buttons-inherit-filled-is-expanded-content-secondary-color);
		--_highlight-border-color: var(--semantics-buttons-inherit-filled-is-expanded-highlight-border-color);
		--_is-hovered-background-color: var(--semantics-buttons-inherit-filled-is-expanded-is-hovered-background-color);
		--_is-hovered-primary-content-color: var(--semantics-buttons-inherit-filled-is-expanded-is-hovered-content-color);
		--_is-hovered-secondary-content-color: var(--semantics-buttons-inherit-filled-is-expanded-is-hovered-content-secondary-color);
		--_is-hovered-highlight-border-color: var(--semantics-buttons-inherit-filled-is-expanded-is-hovered-highlight-border-color);
		--_is-active-background-color: var(--semantics-buttons-inherit-filled-is-expanded-is-active-background-color);
		--_is-active-primary-content-color: var(--semantics-buttons-inherit-filled-is-expanded-is-active-content-color);
		--_is-active-secondary-content-color: var(--semantics-buttons-inherit-filled-is-expanded-is-active-content-secondary-color);
		--_is-active-highlight-border-color: var(--semantics-buttons-inherit-filled-is-expanded-is-active-highlight-border-color);
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
		--_highlight-border-color: transparent;
		--_is-hovered-highlight-border-color: transparent;
		--_is-active-highlight-border-color: transparent;
	}


	/* # Block */

	.button {
		box-sizing: border-box;
		display: inline-flex;
		position: relative;
		margin: 0;
		border: none;
		border-radius: var(--_corner-radius);
		background: none;
		background-color: var(--_background-color);
		box-shadow: inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
		width: var(--_width);
		min-width: var(--_min-size);
		max-width: 100%;
		min-height: var(--_min-size);
		padding: var(--_block-padding) var(--_inline-padding);
		gap: var(--_gap);
		align-items: center;
		justify-content: center;
		color: var(--_primary-content-color);
		font: var(--_font);
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
			background-color: var(--_is-hovered-background-color);
			color: var(--_is-hovered-primary-content-color);
			--_highlight-border-color: var(--_is-hovered-highlight-border-color);
		}
	}

	.button:active {
		background-color: var(--_is-active-background-color);
		color: var(--_is-active-primary-content-color);
		--_highlight-border-color: var(--_is-active-highlight-border-color);
	}

	/* Loading keeps the control focusable (not disabled); activation is blocked in JS. */
	:host([loading]) .button {
		cursor: default;
	}

	.button:focus-visible {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow), inset 0 0 0 var(--primitives-border-width-thin) var(--_highlight-border-color);
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
		gap: var(--_gap);
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
		color: var(--_primary-content-color);
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
		gap: var(--_gap);
	}

	.button__supporting-text {
		min-width: 0;
		color: var(--_secondary-content-color);
		font: var(--_supporting-font);
	}

	.button:hover .button__supporting-text {
		@media (hover: hover) {
			color: var(--_is-hovered-secondary-content-color);
		}
	}

	.button:active .button__supporting-text {
		color: var(--_is-active-secondary-content-color);
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
		--_font: var(--semantics-buttons-sm-primary-text-font);
		--_icon-size: var(--semantics-buttons-md-has-supporting-text-icon-size);
		--_inline-padding: var(--semantics-buttons-md-has-supporting-text-inline-padding);
		--_block-padding: var(--primitives-space-4);
	}

	:host([size="lg"]) .button.has-supporting-text {
		--_font: var(--semantics-buttons-md-primary-text-font);
		--_icon-size: var(--semantics-buttons-lg-has-supporting-text-icon-size);
		--_inline-padding: var(--semantics-buttons-lg-has-supporting-text-inline-padding);
		--_block-padding: var(--primitives-space-4);
	}

	.button__start-icon,
	.button__end-icon {
		display: flex;
		width: var(--_icon-size);
		height: var(--_icon-size);
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
		width: var(--_icon-size);
		height: var(--_icon-size);
	}

	:host([expandable]) .button {
		padding-inline-end: calc(var(--_inline-padding) + var(--_gap) + var(--_disclosure-icon-size));
	}

	.button__disclosure-icon {
		display: block;
		position: absolute;
		top: 50%;
		inset-inline-end: var(--_inline-padding);
		width: var(--_disclosure-icon-size);
		height: var(--_disclosure-icon-size);
		transform: translateY(-50%);
	}
`;
