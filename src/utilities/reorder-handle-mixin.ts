import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

type Constructor<T = LitElement> = new (...args: any[]) => T;

/**
 * Adds the `reorder-handle` attribute to every cell, so any cell can be the
 * grip that drags its row in a `reorderable` nldd-list: nldd-reorder-handle-cell,
 * which is one by default, or an nldd-cell with a control of your own, or a
 * cell without a control.
 *
 * The cell itself does nothing with it. The nldd-list-item around it shows
 * the cell only while the row is `reorderable`, and the nldd-list starts a
 * drag, by pointer or with the arrow keys, only from inside such a cell.
 *
 * @mixin ReorderHandleMixin
 *
 * @attr {boolean} reorder-handle - Makes this cell the grip that drags its row in a `reorderable` nldd-list. The cell shows only while the row is `reorderable`.
 */
export function ReorderHandleMixin<TBase extends Constructor<LitElement>>(Base: TBase, handle = false) {
	class WithReorderHandle extends Base {
		@property({ type: Boolean, reflect: true, attribute: 'reorder-handle' })
		reorderHandle = handle;
	}
	return WithReorderHandle as unknown as TBase &
		Constructor<LitElement & { reorderHandle: boolean }>;
}
