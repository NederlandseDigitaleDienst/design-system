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
