/**
 * Nederlandse Digitale Dienst Visually Hidden Component (Lit + TypeScript)
 *
 * Text a screen reader reads and the screen does not show. It stays in the
 * accessibility tree and in the reading order, and takes no room on the page.
 *
 * For a name that is visually redundant: the header of a column of checkboxes,
 * where the checkboxes say enough to anyone who can see them, or the "(opent in
 * een nieuw venster)" after a link whose icon already says it.
 *
 * Not for repairing structure that is missing. Hidden text that describes how
 * something is laid out ("subpagina van Aanvragen") stands in for semantics the
 * markup should carry, and only a screen reader gets the stand-in. Not for a
 * status either: a status that matters to a screen reader matters to anyone,
 * so show it, as text with `role="status"` or as an `nldd-notification`. And
 * not for the name of a component that takes `accessible-label`: give it that.
 *
 * Nothing in it should take focus. A control inside would be reached with Tab
 * and be nowhere on the screen.
 *
 * @element nldd-visually-hidden
 *
 * @slot - The text, read by a screen reader and not shown.
 */

import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { visuallyHiddenStyles } from './visually-hidden.styles.js';
import { template } from './visually-hidden.template.js';

@customElement('nldd-visually-hidden')
export class NLDDVisuallyHidden extends LitElement {
	static override styles = visuallyHiddenStyles;

	override render() {
		return template();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-visually-hidden': NLDDVisuallyHidden;
	}
}
