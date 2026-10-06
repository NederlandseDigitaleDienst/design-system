/**
 * Nederlandse Digitale Dienst Description Cell Component (Lit + TypeScript)
 *
 * A cell component for displaying a title-description pair in lists.
 *
 * ### Vertical alignment
 * `vertical-alignment="center"` (default) stretches the cell to fill the full
 * row height and centers its content within that space. Use `min-height` to set
 * a minimum centered region. For strict top alignment without a minimum height,
 * use `vertical-alignment="top"`.
 *
 * @element nldd-description-cell
 * @attr {string} width - 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). Default: 'full'
 * @attr {string} min-width - Minimum width as CSS length (e.g. '80px', '5rem')
 * @attr {string} max-width - Maximum width as CSS length (e.g. '300px', '20rem')
 * @attr {string} min-height - Minimum height as CSS length (e.g. '44px', '3rem')
 * @attr {'top' | 'center' | 'bottom'} vertical-alignment - Vertical alignment (default: 'center')
 *
 * @slot title - The label displayed above the description
 * @slot description - The description content
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { descriptionCellStyles } from './description-cell.styles.js';
import { template } from './description-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';

type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-description-cell')
export class NLDDDescriptionCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = [descriptionCellStyles];

	/** 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). */
	@property({ reflect: true, converter: reflectNonDefault<string>('full') })
	width: string = 'full';

	@property({ type: String, reflect: true, attribute: 'min-width' })
	minWidth?: string;

	@property({ type: String, reflect: true, attribute: 'max-width' })
	maxWidth?: string;

	@property({ type: String, reflect: true, attribute: 'min-height' })
	minHeight?: string;

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<VerticalAlignment>('center') })
	verticalAlignment: VerticalAlignment = 'center';

	override updated(changed: Map<string, unknown>) {
		super.updated(changed);
		if (changed.has('width') || changed.has('minWidth') || changed.has('maxWidth') || changed.has('minHeight')) {
			this._applyDimensionStyles();
		}
	}

	private _applyDimensionStyles() {
		const w = this.width;
		const widthIsKeyword = w === 'full' || w === 'fit-content';
		const widthIsValidLength = !!w && !widthIsKeyword && CSS.supports('width', w);
		if (widthIsValidLength) {
			this.style.setProperty('--_description-cell-width', w);
		} else {
			this.style.removeProperty('--_description-cell-width');
		}
		if (w && !widthIsKeyword && !widthIsValidLength) {
			this.width = '';
		}
		if (this.minWidth) {
			this.style.setProperty('--_description-cell-min-width', this.minWidth);
		} else {
			this.style.removeProperty('--_description-cell-min-width');
		}
		if (this.maxWidth) {
			this.style.setProperty('--_description-cell-max-width', this.maxWidth);
		} else {
			this.style.removeProperty('--_description-cell-max-width');
		}
		if (this.minHeight) {
			this.style.setProperty('--_description-cell-min-height', this.minHeight);
		} else {
			this.style.removeProperty('--_description-cell-min-height');
		}
	}

	override render() {
		return template();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-description-cell': NLDDDescriptionCell;
	}
}
