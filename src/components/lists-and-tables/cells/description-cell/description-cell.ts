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
 * ### Width and breaking
 * A cell of `width="full"` takes the room the row has left, but not less than
 * 160px, so its text stays readable: about 20 characters. In a row too narrow
 * for that the row runs wider than its box, which is the sign to hide a cell
 * at that width (`hide-below`) or to combine two. In `nldd-table` the columns
 * set the width, so a cell there has no floor. A `width="fit-content"` cell is
 * as wide as its text on one line, and never narrower than its longest word.
 * `min-width` always wins: `0` lets the cell shrink freely, so a long URL
 * breaks; `min-content` keeps the longest word whole; `max-content` keeps the
 * text on one line. A `max-width` below 160px lowers the floor with it.
 *
 * Text breaks at spaces and hyphens. A word wider than the cell breaks between
 * two letters, without a hyphen. Set `hyphens` to break long words by
 * syllable instead.
 *
 * The cell gives the element in a slot its font and color, and styles nothing
 * inside it. For a link, code or bold text in the description, put an
 * `nldd-text` in the slot, with a `<p>` in it: that brings the inline styles
 * of nldd-text, and its own rules for breaking.
 *
 * @element nldd-description-cell
 * @attr {string} width - 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). Default: 'full'
 * @attr {string} min-width - Minimum width: a CSS length (e.g. '80px', '5rem'), or `min-content` or `max-content`. Wins over the default floor, `width` and `max-width`
 * @attr {string} max-width - Maximum width as CSS length (e.g. '300px', '20rem')
 * @attr {string} min-height - Minimum height as CSS length (e.g. '44px', '3rem')
 * @attr {'top' | 'center' | 'bottom'} vertical-alignment - Vertical alignment (default: 'center')
 * @attr {boolean} hyphens - Breaks a word of at least 6 letters by syllable, with a hyphen, as `hyphens` on nldd-text does. Needs a `lang` on the page (`lang="nl"` on `<html>`): without one the browser does not hyphenate, and a long word still breaks between two letters. Reaches text in the two slots, not an `nldd-text` in them: that has a `hyphens` of its own.
 *
 * @slot title - The label displayed above the description
 * @slot description - The description content
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ReorderHandleMixin } from '../../../../utilities/reorder-handle-mixin.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { descriptionCellStyles } from './description-cell.styles.js';
import { template } from './description-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import { RowHeaderMixin } from '../../../../utilities/row-header-mixin.js';

type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-description-cell')
export class NLDDDescriptionCell extends ReorderHandleMixin(RowHeaderMixin(VisibilityMixin(LitElement, 'cells-container'))) {
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

	@property({ type: Boolean, reflect: true })
	hyphens = false;

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
