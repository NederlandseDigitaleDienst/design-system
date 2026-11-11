/**
 * Nederlandse Digitale Dienst Reorder Handle Cell Component (Lit + TypeScript)
 *
 * The grip that drags its row in a `reorderable` nldd-list, by pointer or with
 * the arrow keys. Always vertically centered and sized to fit the handle.
 *
 * It carries `reorder-handle` by itself, so it shows only while the row is
 * `reorderable` and needs nothing else:
 *
 * ```html
 * <nldd-list reorderable>
 *   <nldd-list-item>
 *     <nldd-reorder-handle-cell></nldd-reorder-handle-cell>
 *     <nldd-text-cell text="Item"></nldd-text-cell>
 *   </nldd-list-item>
 * </nldd-list>
 * ```
 *
 * Any other cell becomes the grip with `reorder-handle`, such as an nldd-cell
 * with a control of your own.
 *
 * @element nldd-reorder-handle-cell
 * @attr {string} size - Handle size: 'sm' | 'md' (default: 'md')
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch. Sets the handle's accessible label.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ReorderHandleMixin } from '../../../../utilities/reorder-handle-mixin.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { reorderHandleCellStyles } from './reorder-handle-cell.styles.js';
import { template } from './reorder-handle-cell.template.js';
import { nlddReorderHandleCellTranslations } from './reorder-handle-cell.i18n.js';
import type { NLDDReorderHandleCellTranslations } from './reorder-handle-cell.i18n.js';
import { translate } from '../../../../utilities/translations.js';

type Size = 'sm' | 'md';

@customElement('nldd-reorder-handle-cell')
export class NLDDReorderHandleCell extends ReorderHandleMixin(LitElement, true) {
	static override styles = reorderHandleCellStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/** Override one or more translation keys. Unset keys fall back to the Dutch default. */
	@property({ type: Object })
	translations: Partial<NLDDReorderHandleCellTranslations> = {};

	// — i18n ————————————————————————————————————————————————————————————————

	private _t(key: keyof NLDDReorderHandleCellTranslations): string {
		return translate(this.translations, nlddReorderHandleCellTranslations, key);
	}

	override render() {
		const label = this._t('components.reorder-handle-cell.accessible-label');
		return template(this.size, label);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-reorder-handle-cell': NLDDReorderHandleCell;
	}
}
