/**
 * Nederlandse Digitale Dienst Text Cell Component (Lit + TypeScript)
 *
 * A cell component for displaying text content in lists with configurable
 * alignment, size and color. This is the most fundamental list cell component.
 *
 * ### Vertical alignment
 * `vertical-alignment="center"` (default) stretches the cell to fill the full
 * row height and centers its content within that space. Use `min-height` to set
 * a minimum centered region. For strict top alignment without a minimum height,
 * use `vertical-alignment="top"`.
 *
 * ### Slots vs attributes
 * Each text region (overline, main text, supporting text) takes plain text in
 * its attribute, which the cell draws as a `<p>`, or a `<p>` of your own in its
 * slot. Use the slot when you need components mixed with text, such as
 * `<nldd-link>`, `<nldd-tag>` or `<nldd-icon>`, and put them in that `<p>`: the
 * paragraph is then in the HTML before any script runs. The slot wins over the
 * attribute. Each region chooses for itself, so an attribute and a slot stand
 * side by side: plain text in `overline`, a `<p>` with a tag in the default
 * slot. The cell does not style plain HTML: for bold, write `**bold**` in the
 * attribute, and for code put an `<nldd-text>` in the `<p>`, with the `<code>`
 * in a `<span>` of its own.
 * The element in a slot takes the text style of the cell: a font, margin or
 * other style the page sets on it does not apply.
 * Note that `query` highlighting and `**bold**` parsing only apply to the
 * attribute path; slotted content is rendered as-is.
 *
 * @element nldd-text-cell
 * @attr {string} size - Cell size: 'sm' | 'md' (default: 'md')
 * @attr {string} color - Text color variant: 'content' (the default) | 'secondary' | 'accent' | 'success' | 'warning' | 'critical'. All variants other than those two apply to all three text fields so the cell reads as a coherent state.
 * @attr {string} width - 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). Default: 'full'
 * @attr {string} min-width - Minimum width as CSS length (e.g. '80px', '5rem')
 * @attr {string} max-width - Maximum width as CSS length (e.g. '200px', '20rem')
 * @attr {string} min-height - Minimum height as CSS length (e.g. '44px', '3rem')
 * @attr {string} horizontal-alignment - Horizontal alignment: 'left' | 'center' | 'right' (default: 'left')
 * @attr {string} vertical-alignment - Vertical alignment: 'top' | 'center' | 'bottom' (default: 'center')
 *
 * @attr {string} text - Main text content. Supports **bold** syntax for inline bold segments. Content in the default slot wins.
 * @attr {string} supporting-text - Optional supporting text displayed below the main content. Supports **bold**. Falls back to `supporting-text` slot.
 * @attr {string} overline - Optional overline text displayed above the main content. Supports **bold**. Falls back to `overline` slot.
 *
 * @slot overline - A `<p>` of your own for an overline that is more than text. Wins over `overline`.
 * @slot - (default) A `<p>` of your own for main text that is more than text. Wins over `text`.
 * @slot supporting-text - A `<p>` of your own for supporting text that is more than text. Wins over `supporting-text`.
 * @accepts p
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
import { LooseText } from '../../../../utilities/slotted-block.js';
import { holdsContent, slottedNodes } from '../../../../utilities/slot-content.js';
import { ReorderHandleMixin } from '../../../../utilities/reorder-handle-mixin.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { textCellStyles } from './text-cell.styles.js';
import { template } from './text-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import { RowHeaderMixin } from '../../../../utilities/row-header-mixin.js';
import type { QueryMarkMode } from '../../../../utilities/render-marked.js';

type Size = 'sm' | 'md';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical';
type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-text-cell')
export class NLDDTextCell extends ReorderHandleMixin(RowHeaderMixin(VisibilityMixin(LitElement, 'cells-container'))) {
	static override styles = [textCellStyles];

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

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
	private _looseText = new LooseText(this);

	override updated(changed: Map<string, unknown>) {
		super.updated(changed);
		if (changed.has('width') || changed.has('minWidth') || changed.has('maxWidth') || changed.has('minHeight')) {
			this._applyDimensionStyles();
		}
	}

	private _applyDimensionStyles() {
		// width's 'full' and 'fit-content' are handled via [width] attribute
		// selectors in CSS; any other value is a CSS length fed through --_text-cell-width.
		const w = this.width;
		const widthIsKeyword = w === 'full' || w === 'fit-content';
		const widthIsValidLength = !!w && !widthIsKeyword && CSS.supports('width', w);
		if (widthIsValidLength) {
			this.style.setProperty('--_text-cell-width', w);
		} else {
			this.style.removeProperty('--_text-cell-width');
		}
		if (w && !widthIsKeyword && !widthIsValidLength) {
			this.width = '';
		}
		if (this.minWidth) {
			this.style.setProperty('--_text-cell-min-width', this.minWidth);
		} else {
			this.style.removeProperty('--_text-cell-min-width');
		}
		if (this.maxWidth) {
			this.style.setProperty('--_text-cell-max-width', this.maxWidth);
		} else {
			this.style.removeProperty('--_text-cell-max-width');
		}
		if (this.minHeight) {
			this.style.setProperty('--_text-cell-min-height', this.minHeight);
		} else {
			this.style.removeProperty('--_text-cell-min-height');
		}
	}

	/** @internal */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		// assignedNodes() (not flatten): only what the consumer slotted counts.
		this._readSlot(slot.name, slot.assignedNodes());
	};

	/** Reads the children as the cell connects, so the first render already
	 *  draws the box that fits them instead of swapping it on slotchange. */
	override connectedCallback(): void {
		super.connectedCallback();
		for (const name of ['overline', '', 'supporting-text']) this._readSlot(name, slottedNodes(this, name));
	}

	private _readSlot(name: string, nodes: readonly Node[]): void {
		this._looseText.read(name, nodes);
		const hasContent = holdsContent(nodes);
		if (name === 'overline') this._hasOverlineSlotted = hasContent;
		else if (name === 'supporting-text') this._hasSupportingTextSlotted = hasContent;
		else this._hasDefaultSlotted = hasContent;
	}

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-text-cell': NLDDTextCell;
	}
}
