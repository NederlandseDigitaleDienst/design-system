import { css } from 'lit';

export const textStyles = css`


	/* # Host */

	:host {
		--_text-font-size: var(--primitives-font-size-100);
		--_text-font-weight: var(--primitives-font-weight-body-regular);
		--_text-line-height: var(--primitives-line-height-snug);
		--_text-max-width: var(--semantics-text-max-width);
		--_text-color: var(--context-content-color, var(--semantics-content-color));
		--_text-align: left;
		--_text-link-color: var(--semantics-links-color);
		--_text-link-is-hovered-color: var(--semantics-links-is-hovered-color);
		--_text-link-is-active-color: var(--semantics-links-is-active-color);
		--_text-link-underline-offset: var(--primitives-space-2);
		--_text-code-padding: var(--primitives-space-4);
		--_text-code-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_text-code-background-color: var(--semantics-surfaces-tinted-background-color);
		--_text-code-font-family: var(--primitives-font-family-monospace);
		--_text-mark-padding: var(--primitives-space-1) var(--primitives-space-2);
		--_text-mark-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_text-mark-background-color: var(--semantics-content-mark-background-color);
		--_text-mark-color: var(--semantics-content-mark-color);

		display: block;
		max-width: var(--_text-max-width);
		color: var(--_text-color);
		text-align: var(--_text-align);
		font: var(--_text-font-weight) var(--_text-font-size) / var(--_text-line-height) var(--primitives-font-family-body);
		text-wrap: pretty;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Size */

	:host([size="xxs"]) {
		--_text-font-size: var(--primitives-font-size-70);
	}

	:host([size="xs"]) {
		--_text-font-size: var(--primitives-font-size-80);
	}

	:host([size="sm"]) {
		--_text-font-size: var(--primitives-font-size-90);
	}

	:host([size="lg"]) {
		--_text-font-size: var(--primitives-font-size-200);
	}


	/* # Weight */

	:host([weight="medium"]) {
		--_text-font-weight: var(--primitives-font-weight-body-medium);
	}

	:host([weight="bold"]) {
		--_text-font-weight: var(--primitives-font-weight-body-bold);
	}

	/* Not the browser's "bolder", which is relative: from medium it lands on 700
	   and from bold it asks for a weight this font does not have, so the browser
	   thickens the glyphs itself. */
	::slotted(strong),
	::slotted(b) {
		color: inherit;
		font-weight: var(--primitives-font-weight-body-bold);
	}


	/* # Inline elements */

	::slotted(em),
	::slotted(i) {
		color: inherit;
		font-style: italic;
	}

	::slotted(a) {
		color: var(--_text-link-color);
		text-decoration: underline;
		text-underline-offset: var(--_text-link-underline-offset);
	}

	::slotted(a:hover) {
		color: var(--_text-link-is-hovered-color);
	}

	::slotted(a:active) {
		color: var(--_text-link-is-active-color);
	}

	:host([color="inherit"]) ::slotted(a) {
		color: currentColor;
	}

	::slotted(code) {
		border-radius: var(--_text-code-corner-radius);
		background-color: var(--_text-code-background-color);
		padding: var(--_text-code-padding);
		font-family: var(--_text-code-font-family);
		font-size: 0.85em;
	}

	::slotted(mark) {
		border-radius: var(--_text-mark-corner-radius);
		background-color: var(--_text-mark-background-color);
		padding: var(--_text-mark-padding);
		color: var(--_text-mark-color);
	}


	/* # Line height */

	:host([line-height="flat"]) {
		--_text-line-height: var(--primitives-line-height-flat);
	}

	:host([line-height="tight"]) {
		--_text-line-height: var(--primitives-line-height-tight);
	}

	:host([line-height="loose"]) {
		--_text-line-height: var(--primitives-line-height-loose);
	}


	/* # Color */

	:host([color="secondary"]) {
		--_text-color: var(--context-content-secondary-color, var(--semantics-content-secondary-color));
	}

	:host([color="accent"]) {
		--_text-color: var(--semantics-content-accent-color);
	}

	:host([color="success"]) {
		--_text-color: var(--semantics-content-success-color);
	}

	:host([color="warning"]) {
		--_text-color: var(--semantics-content-warning-color);
	}

	:host([color="critical"]) {
		--_text-color: var(--semantics-content-critical-color);
	}

	:host([color="inherit"]) {
		--_text-color: inherit;
	}


	/* # Alignment */

	:host([horizontal-alignment="center"]) {
		--_text-align: center;
	}

	:host([horizontal-alignment="right"]) {
		--_text-align: right;
	}
`;
