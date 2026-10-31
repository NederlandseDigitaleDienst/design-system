/**
 * Nederlandse Digitale Dienst Spacer Cell Component (Lit + TypeScript)
 *
 * A cell component that provides fixed horizontal spacing within list items.
 *
 * @element nldd-spacer-cell
 * @attr {string} size - Spacer size in pixels: '2' | '4' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96' (default: '16')
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { spacerCellStyles } from './spacer-cell.styles.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';

type Size = '2' | '4' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96' | 'flexible';

@customElement('nldd-spacer-cell')
export class NLDDSpacerCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = spacerCellStyles;

	@property({ type: String, reflect: true })
	size: Size = '16';

	override render() {
		return null;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-spacer-cell': NLDDSpacerCell;
	}
}
