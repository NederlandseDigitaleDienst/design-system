/**
 * Nederlandse Digitale Dienst Drag Handle Cell Component (Lit + TypeScript)
 *
 * A cell that displays a drag handle for reorderable list items.
 * Always vertically centered and sized to fit the handle.
 *
 * ### Usage with nldd-list
 * To enable drag-to-reorder, add the `reorderable-only` attribute to this element.
 * This attribute is required for `nldd-list` to detect the drag handle in the
 * composed event path and activate pointer and keyboard drag mode:
 *
 * ```html
 * <nldd-list reorderable>
 *   <nldd-list-item>
 *     <nldd-drag-handle-cell reorderable-only></nldd-drag-handle-cell>
 *     <nldd-text-cell text="Item"></nldd-text-cell>
 *   </nldd-list-item>
 * </nldd-list>
 * ```
 *
 * Without `reorderable-only`, pointer and keyboard drag will never trigger.
 *
 * @element nldd-drag-handle-cell
 * @attr {string} size - Handle size: 'sm' | 'md' (default: 'md')
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch. Sets the handle's accessible label.
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { dragHandleCellStyles } from './drag-handle-cell.styles.js';
import { template } from './drag-handle-cell.template.js';
import { nlddDragHandleCellTranslations } from './drag-handle-cell.i18n.js';
import type { NLDDDragHandleCellTranslations } from './drag-handle-cell.i18n.js';
import { translate } from '../../../../utilities/translations.js';

type Size = 'sm' | 'md';

@customElement('nldd-drag-handle-cell')
export class NLDDDragHandleCell extends LitElement {
	static override styles = dragHandleCellStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/** Override one or more translation keys. Unset keys fall back to the Dutch default. */
	@property({ type: Object })
	translations: Partial<NLDDDragHandleCellTranslations> = {};

	// — i18n ————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDDragHandleCellTranslations): string {
		return translate(this.translations, nlddDragHandleCellTranslations, key);
	}

	override render() {
		const label = this._t('components.drag-handle-cell.accessible-label');
		return template(this.size, label);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-drag-handle-cell': NLDDDragHandleCell;
	}
}
