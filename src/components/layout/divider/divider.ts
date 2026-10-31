/**
 * Nederlandse Digitale Dienst Divider Component (Lit + TypeScript)
 *
 * A rule that visually separates sections of content.
 *
 * @element nldd-divider
 */
import { LitElement } from 'lit';
import { customElement } from '../../../utilities/custom-element.js';
import { dividerStyles } from './divider.styles.js';
import { dividerTemplate } from './divider.template.js';

@customElement('nldd-divider')
export class NLDDDivider extends LitElement {
	static override styles = dividerStyles;

	override render() {
		return dividerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-divider': NLDDDivider;
	}
}
