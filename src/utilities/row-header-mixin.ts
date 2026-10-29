import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

type Constructor<T = LitElement> = new (...args: any[]) => T;

/**
 * Adds the `row-header` attribute to the cells that can say what a row is
 * about: `nldd-cell`, `nldd-title-cell`, `nldd-text-cell` and
 * `nldd-description-cell`.
 *
 * It is the `<th scope="row">` of an `nldd-table`. The cell itself does
 * nothing with it: the `nldd-table-row` around it reads the attribute and
 * gives that cell `role="rowheader"` instead of `role="cell"`, so a screen
 * reader names the row when it reads any other cell in it. The row assigns
 * every cell role already, which is why the decision stays there.
 *
 * It sits on the cell rather than on the row, because a cell is what a header
 * is in HTML too, and because a column index on the row breaks as soon as a
 * column is hidden at a breakpoint or reordered. It is a mixin so it works the
 * same on every cell variant, and the variant still decides how the cell
 * looks: a row header gets no styling of its own.
 *
 * In a header row (`slot="header"`) the attribute is ignored and the cell
 * stays a `columnheader`. Outside an `nldd-table` it does nothing.
 *
 * @mixin RowHeaderMixin
 *
 * @attr {boolean} row-header - In an `nldd-table`, makes this cell the header of its row (role="rowheader" instead of "cell"). Semantics only: the cell looks the same. Ignored in a header row.
 */
export function RowHeaderMixin<TBase extends Constructor<LitElement>>(Base: TBase) {
	class WithRowHeader extends Base {
		@property({ type: Boolean, reflect: true, attribute: 'row-header' })
		rowHeader = false;
	}
	return WithRowHeader as unknown as TBase &
		Constructor<LitElement & { rowHeader: boolean }>;
}
