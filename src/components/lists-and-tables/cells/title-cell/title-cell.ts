/**
 * Nederlandse Digitale Dienst Title Cell Component (Lit + TypeScript)
 *
 * A cell component for displaying a title with optional overline and supporting text in lists.
 *
 * ### Vertical alignment
 * `vertical-alignment="center"` (default) stretches the cell to fill the full
 * row height and centers its content within that space. Use `min-height` to set
 * a minimum centered region. For strict top alignment without a minimum height,
 * use `vertical-alignment="top"`.
 *
 * ### Slots vs attributes
 * Each text region (overline, title, supporting text) takes plain text in its
 * attribute, or the element itself in its slot: a heading (`h1`–`h6`) or a
 * `<p>` for the title, a `<p>` for the other two, as the cell draws them for the
 * attribute. Use the slot when you need inline elements like `<nldd-tag>`,
 * `<nldd-icon>` or other components mixed with text, and put them in that
 * element: the heading is then in the HTML before any script runs. The slot
 * wins over the attribute, and `heading-level` only applies to the attribute.
 * Each region chooses for itself, so an attribute and a slot stand side by
 * side: plain text in `supporting-text`, a heading with a tag in the default slot.
 * Note that `query` highlighting and `**bold**` parsing only apply to the
 * attribute path; slotted content is rendered as-is.
 *
 * @element nldd-title-cell
 * @attr {string} size - Visual size of the title: 'display-1' to 'display-6', from large to small (unset: looks like 'display-5', and becomes 'display-6' in an `nldd-table-row`, where a title the size of the other cells reads better). Unlike nldd-title, `heading-level` does not set it: every row in a list looks the same, whatever its level
 * @attr {'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical'} color - Text color variant (default: 'content'). `secondary` demotes the title to match the muted overline/supporting-text. `accent`, `success`, `warning` and `critical` tint all three regions so the cell reads as a coherent state.
 * @attr {string} width - 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). Default: 'full'
 * @attr {string} min-width - Minimum width as CSS length (e.g. '80px', '5rem')
 * @attr {string} max-width - Maximum width as CSS length (e.g. '300px', '20rem')
 * @attr {string} min-height - Minimum height as CSS length (e.g. '44px', '3rem')
 * @attr {'left' | 'center' | 'right'} horizontal-alignment - Horizontal alignment (default: 'left')
 * @attr {'top' | 'center' | 'bottom'} vertical-alignment - Vertical alignment (default: 'center')
 *
 * @attr {string} text - Title text content. Supports **bold** syntax for inline bold segments. Content in the default slot wins.
 * @attr {string} supporting-text - Optional supporting text displayed below the title. Supports **bold**. Falls back to `supporting-text` slot.
 * @attr {string} overline - Optional overline text displayed above the title. Supports **bold**. Falls back to `overline` slot.
 * @attr {number} heading-level - Heading level for the title element: 1–6 (default: none, renders a <p>)
 *
 * @slot overline - A `<p>` of your own for an overline that is more than text. Wins over `overline`.
 * @slot - (default) A heading (`h1`–`h6`) or `<p>` of your own for a title that is more than text. Wins over `text`.
 * @slot supporting-text - A `<p>` of your own for supporting text that is more than text. Wins over `supporting-text`.
 * @accepts h1, h2, h3, h4, h5, h6, p
 *
 * ### Query mark
 * Set `query` to a substring to bold-highlight the match across text, overline
 * and supporting-text. `query-mark-mode` selects the strategy:
 * - `'predictive'` (default): bolds the non-matched remainder — the ARIA APG
 *   pattern for combobox predictive completion.
 * - `'match'`: bolds the matched query — useful for search-result highlighting
 *   in longer text.
 *
 * When `query` is set, `**bold**` markdown in the same field is ignored.
 * Query highlighting only applies to the attribute path; slotted content is
 * not modified.
 *
 * @attr {string} query - Query substring to bold-highlight across text fields. Empty = no marking.
 * @attr {string} query-mark-mode - 'match' | 'predictive' (default: 'predictive')
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { holdsLooseText } from '../../../../utilities/slotted-block.js';
import { setState } from '../../../../utilities/element-state.js';
import { ReorderHandleMixin } from '../../../../utilities/reorder-handle-mixin.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { titleCellStyles } from './title-cell.styles.js';
import { template } from './title-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import { RowHeaderMixin } from '../../../../utilities/row-header-mixin.js';
import type { QueryMarkMode } from '../../../../utilities/render-marked.js';

export type TitleCellSize = 'display-1' | 'display-2' | 'display-3' | 'display-4' | 'display-5' | 'display-6';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical';
type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-title-cell')
export class NLDDTitleCell extends ReorderHandleMixin(RowHeaderMixin(VisibilityMixin(LitElement, 'cells-container'))) {
	static override styles = [titleCellStyles];

	/** Unset looks like display-5, and like display-6 in an nldd-table-row,
	 *  which is why it has no value of its own: the row can only tell an unset
	 *  size from a chosen display-5 when unset is not display-5. */
	@property({ reflect: true })
	size?: TitleCellSize;

	@property({ reflect: true, converter: reflectNonDefault<Color>('content') })
	color: Color = 'content';

	@property({ reflect: true, converter: reflectNonDefault<string>('full') })
	width: string = 'full';

	@property({ type: String, reflect: true, attribute: 'min-width' })
	minWidth?: string;

	@property({ type: String, reflect: true, attribute: 'max-width' })
	maxWidth?: string;

	@property({ type: String, reflect: true, attribute: 'min-height' })
	minHeight?: string;

	@property({ reflect: true, attribute: 'horizontal-alignment', converter: reflectNonDefault<HorizontalAlignment>('left') })
	horizontalAlignment: HorizontalAlignment = 'left';

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<VerticalAlignment>('center') })
	verticalAlignment: VerticalAlignment = 'center';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'supporting-text', converter: reflectNonDefault<string>('') })
	supportingText = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	overline = '';

	/** Heading level for the title element (1–6). When not set, renders a <p>. */
	@property({ type: Number, attribute: 'heading-level' })
	headingLevel: number | undefined = undefined;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	query = '';

	@property({ type: String, attribute: 'query-mark-mode' })
	queryMarkMode: QueryMarkMode = 'predictive';

	/** @internal */
	@state() _hasOverlineSlotted = false;
	/** @internal */
	@state() _hasDefaultSlotted = false;
	/** @internal */
	@state() _hasSupportingTextSlotted = false;
	/** The slots that hold text of their own, outside any element. */
	private _looseSlots = new Set<string>();

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
			this.style.setProperty('--_title-cell-width', w);
		} else {
			this.style.removeProperty('--_title-cell-width');
		}
		if (w && !widthIsKeyword && !widthIsValidLength) {
			this.width = '';
		}
		if (this.minWidth) {
			this.style.setProperty('--_title-cell-min-width', this.minWidth);
		} else {
			this.style.removeProperty('--_title-cell-min-width');
		}
		if (this.maxWidth) {
			this.style.setProperty('--_title-cell-max-width', this.maxWidth);
		} else {
			this.style.removeProperty('--_title-cell-max-width');
		}
		if (this.minHeight) {
			this.style.setProperty('--_title-cell-min-height', this.minHeight);
		} else {
			this.style.removeProperty('--_title-cell-min-height');
		}
	}

	/** @internal */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		// assignedNodes() (not flatten): only what the consumer slotted counts.
		const hasContent = slot.assignedNodes().some((node) =>
			node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== ''));
		if (holdsLooseText(slot)) this._looseSlots.add(slot.name);
		else this._looseSlots.delete(slot.name);
		setState(this, 'loose-text', this._looseSlots.size > 0);
		switch (slot.name) {
			case 'overline':
				this._hasOverlineSlotted = hasContent;
				break;
			case 'supporting-text':
				this._hasSupportingTextSlotted = hasContent;
				break;
			default:
				this._hasDefaultSlotted = hasContent;
				break;
		}
	};

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-title-cell': NLDDTitleCell;
	}
}
