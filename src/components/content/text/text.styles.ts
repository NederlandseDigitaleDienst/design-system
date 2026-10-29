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
		--_text-link-corner-radius: var(--primitives-corner-radius-xxs);
		--_text-link-is-hovered-inherit-thickness: var(--primitives-border-width-regular);
		--_text-mention-color: var(--semantics-mentions-content-color);
		--_text-mention-icon-size: 0.95em;
		--_text-mention-inline-padding: 0.3em;
		--_text-mention-corner-radius: var(--primitives-corner-radius-sm);
		--_text-mention-border-width: var(--semantics-surfaces-highlight-border-width);
		--_text-mention-border-color: var(--semantics-mentions-highlight-border-color);
		--_text-mention-background-color: var(--semantics-mentions-background-color);
		--_text-mention-is-hovered-background-color: var(--semantics-mentions-is-hovered-background-color);
		--_text-mention-is-active-background-color: var(--semantics-mentions-is-active-background-color);
		--_text-code-padding: var(--primitives-space-2) var(--primitives-space-4);
		--_text-code-corner-radius: var(--semantics-controls-xs-corner-radius);
		--_text-code-border-width: var(--semantics-surfaces-highlight-border-width);
		--_text-code-border-color: var(--semantics-surfaces-tinted-highlight-border-color);
		--_text-code-background-color: var(--semantics-surfaces-tinted-background-color);
		--_text-code-font-family: var(--primitives-font-family-monospace);
		--_text-code-font-size: var(--semantics-code-inline-font-size);
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
		border-radius: var(--_text-link-corner-radius);
		color: var(--_text-link-color);
		text-decoration: underline;
		text-underline-offset: var(--_text-link-underline-offset);
		cursor: pointer;
	}

	::slotted(a:hover) {
		color: var(--_text-link-is-hovered-color);
	}

	::slotted(a:active) {
		color: var(--_text-link-is-active-color);
	}

	::slotted(:focus-visible) {
		outline: var(--semantics-focus-ring-outline);
		outline-offset: var(--semantics-focus-ring-outline-offset);
		box-shadow: var(--semantics-focus-ring-box-shadow);
	}

	::slotted(:focus:not(:focus-visible)) {
		outline: none;
	}

	:host([color="inherit"]) ::slotted(a) {
		color: currentColor;
		text-decoration-color: currentColor;
	}

	:host([color="inherit"]) ::slotted(a:hover) {
		color: currentColor;
		text-decoration-thickness: var(--_text-link-is-hovered-inherit-thickness);
	}

	:host([color="inherit"]) ::slotted(a:active) {
		color: currentColor;
	}

	::slotted([data-mention]) {
		color: var(--_text-mention-color);
		font-weight: var(--primitives-font-weight-body-bold);
		white-space: nowrap;
	}

	::slotted([data-mention])::before {
		content: '';
		display: inline-block;
		margin-inline-end: 0.1em;
		background-color: currentColor;
		width: var(--_text-mention-icon-size);
		height: var(--_text-mention-icon-size);
		vertical-align: -0.16em;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M16 12c0 2.73 1.3 3.5 2 3.5s2-.77 2-3.5a8 8 0 1 0-5.93 7.73l.52 1.93A10 10 0 1 1 22 12c0 3.27-1.7 5.5-4 5.5-1.36 0-2.5-.78-3.22-2.08A4.3 4.3 0 0 1 11.5 17C9 17 7 14.76 7 12s2-5 4.5-5c.92 0 1.78.31 2.5.84V7h2zm-4.5-3C10.3 9 9 10.14 9 12s1.31 3 2.5 3 2.5-1.14 2.5-3-1.31-3-2.5-3'/%3E%3C/svg%3E") center / contain no-repeat;

		@media (forced-colors: active) {
			forced-color-adjust: none;
			background-color: CanvasText;
		}
	}

	::slotted(a[data-mention]) {
		padding-block: max(0em, (1lh - 1.2em) / 2);
		padding-inline: max(0em, (max(1.2em, 1lh) - var(--_text-mention-icon-size)) / 2) var(--_text-mention-inline-padding);
		border-radius: var(--_text-mention-corner-radius);
		box-shadow: inset 0 0 0 var(--_text-mention-border-width) var(--_text-mention-border-color);
		background-color: var(--_text-mention-background-color);
		color: var(--_text-mention-color);
		text-decoration: none;
		cursor: default;
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
	}

	::slotted(a[data-mention]:hover) {
		background-color: var(--_text-mention-is-hovered-background-color);
		color: var(--_text-mention-color);
	}

	::slotted(a[data-mention]:active) {
		background-color: var(--_text-mention-is-active-background-color);
		color: var(--_text-mention-color);
	}

	:host([color="inherit"]) ::slotted(a[data-mention]) {
		color: var(--_text-mention-color);
	}

	@media (forced-colors: active) {
		::slotted(a[data-mention])::before {
			background-color: LinkText;
		}
	}

	::slotted(code) {
		border-radius: var(--_text-code-corner-radius);
		box-shadow: inset 0 0 0 var(--_text-code-border-width) var(--_text-code-border-color);
		background-color: var(--_text-code-background-color);
		padding: var(--_text-code-padding);
		font-family: var(--_text-code-font-family);
		font-size: var(--_text-code-font-size);
	}

	::slotted(q) {
		font-style: italic;
	}

	::slotted(q)::before {
		content: open-quote;
	}

	::slotted(q)::after {
		content: close-quote;
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
