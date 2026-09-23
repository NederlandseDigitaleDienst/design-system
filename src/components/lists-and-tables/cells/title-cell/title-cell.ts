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
 * Each text region (overline, title, supporting text) accepts either a string
 * attribute or slotted DOM content. The slot is the source of truth: if the
 * consumer provides slotted content, it replaces the attribute-based render
 * for that region. Use slots when you need inline elements like `<nldd-tag>`,
 * `<nldd-icon>` or other components mixed with text. Note that `query`
 * highlighting and `**bold**` parsing only apply to the attribute path —
 * slotted content is rendered as-is.
 *
 * @element nldd-title-cell
 * @attr {1|2|3|4|5|6} size - Visual size of the title (default: 5)
 * @attr {'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical'} color - Text color variant (default: 'content'). `secondary` demotes the title to match the muted overline/supporting-text. `accent`, `success`, `warning` and `critical` tint all three regions so the cell reads as a coherent state.
 * @attr {string} width - 'full' | 'fit-content' | CSS length (e.g. '200px', '20rem'). Default: 'full'
 * @attr {string} min-width - Minimum width as CSS length (e.g. '80px', '5rem')
 * @attr {string} max-width - Maximum width as CSS length (e.g. '300px', '20rem')
 * @attr {string} min-height - Minimum height as CSS length (e.g. '44px', '3rem')
 * @attr {'left' | 'center' | 'right'} horizontal-alignment - Horizontal alignment (default: 'left')
 * @attr {'top' | 'center' | 'bottom'} vertical-alignment - Vertical alignment (default: 'center')
 *
 * @attr {string} text - Title text content. Supports **bold** syntax for inline bold segments. Falls back to default slot.
 * @attr {string} supporting-text - Optional supporting text displayed below the title. Supports **bold**. Falls back to `supporting-text` slot.
 * @attr {string} overline - Optional overline text displayed above the title. Supports **bold**. Falls back to `overline` slot.
 * @attr {number} heading-level - Heading level for the title element: 1–6 (default: none, renders a <p>)
 *
 * @slot overline - Rich content for the overline region. Overrides the `overline` attribute when content is assigned.
 * @slot - (default) Rich content for the title. Overrides the `text` attribute when content is assigned.
 * @slot supporting-text - Rich content for the supporting text region. Overrides the `supporting-text` attribute when content is assigned.
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
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { titleCellStyles } from './title-cell.styles.js';
import { template } from './title-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import type { QueryMarkMode } from '../../../../utilities/render-marked.js';

export type TitleCellSize = 1 | 2 | 3 | 4 | 5 | 6;
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical';
type HorizontalAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';

@customElement('nldd-title-cell')
export class NLDDTitleCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = [titleCellStyles];

	@property({ type: Number, reflect: true })
	size: TitleCellSize = 5;

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
			this.style.setProperty('--_width', w);
		} else {
			this.style.removeProperty('--_width');
		}
		if (w && !widthIsKeyword && !widthIsValidLength) {
			this.width = '';
		}
		if (this.minWidth) {
			this.style.setProperty('--_min-width', this.minWidth);
		} else {
			this.style.removeProperty('--_min-width');
		}
		if (this.maxWidth) {
			this.style.setProperty('--_max-width', this.maxWidth);
		} else {
			this.style.removeProperty('--_max-width');
		}
		if (this.minHeight) {
			this.style.setProperty('--_min-height', this.minHeight);
		} else {
			this.style.removeProperty('--_min-height');
		}
	}

	/** @internal */
	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		// Use assignedNodes() (not flatten) so we only count what the consumer
		// actually slotted — fallback content is excluded by design.
		const hasContent = slot.assignedNodes().some((node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				return (node.textContent ?? '').trim().length > 0;
			}
			return node.nodeType === Node.ELEMENT_NODE;
		});
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
