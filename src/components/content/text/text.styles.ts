import { css } from 'lit';

export const textStyles = css`


	/* # Host */

	:host {
		--_font-size: var(--primitives-font-size-100);
		--_font-weight: var(--primitives-font-weight-body-regular);
		--_line-height: var(--primitives-line-height-snug);
		--_max-width: var(--semantics-text-max-width);
		--_color: var(--context-content-color, var(--semantics-content-color));
		--_text-align: left;

		display: block;
		max-width: var(--_max-width);
		color: var(--_color);
		text-align: var(--_text-align);
		font: var(--_font-weight) var(--_font-size) / var(--_line-height) var(--primitives-font-family-body);
		text-wrap: pretty;
	}

	:host([hidden]) {
		display: none;
	}


	/* # Size */

	:host([size="xxs"]) {
		--_font-size: var(--primitives-font-size-70);
	}

	:host([size="xs"]) {
		--_font-size: var(--primitives-font-size-80);
	}

	:host([size="sm"]) {
		--_font-size: var(--primitives-font-size-90);
	}

	:host([size="lg"]) {
		--_font-size: var(--primitives-font-size-200);
	}


	/* # Weight */

	:host([weight="medium"]) {
		--_font-weight: var(--primitives-font-weight-body-medium);
	}

	:host([weight="bold"]) {
		--_font-weight: var(--primitives-font-weight-body-bold);
	}

	/* Not the browser's "bolder", which is relative: from medium it lands on 700
	   and from bold it asks for a weight this font does not have, so the browser
	   thickens the glyphs itself. */
	::slotted(strong),
	::slotted(b) {
		color: inherit;
		font-weight: var(--primitives-font-weight-body-bold);
	}


	/* # Line height */

	:host([line-height="flat"]) {
		--_line-height: var(--primitives-line-height-flat);
	}

	:host([line-height="tight"]) {
		--_line-height: var(--primitives-line-height-tight);
	}

	:host([line-height="loose"]) {
		--_line-height: var(--primitives-line-height-loose);
	}


	/* # Color */

	:host([color="secondary"]) {
		--_color: var(--context-content-secondary-color, var(--semantics-content-secondary-color));
	}

	:host([color="accent"]) {
		--_color: var(--semantics-content-accent-color);
	}

	:host([color="success"]) {
		--_color: var(--semantics-content-success-color);
	}

	:host([color="warning"]) {
		--_color: var(--semantics-content-warning-color);
	}

	:host([color="critical"]) {
		--_color: var(--semantics-content-critical-color);
	}

	:host([color="inherit"]) {
		--_color: inherit;
	}


	/* # Alignment */

	:host([horizontal-alignment="center"]) {
		--_text-align: center;
	}

	:host([horizontal-alignment="right"]) {
		--_text-align: right;
	}
`;
