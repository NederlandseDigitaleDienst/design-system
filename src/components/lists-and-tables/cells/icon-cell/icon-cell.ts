/**
 * Nederlandse Digitale Dienst Icon Cell Component (Lit + TypeScript)
 *
 * A cell component for displaying icons in lists with configurable
 * alignment and size. Set `icon` to render an `nldd-icon` by name, or
 * slot custom content as an escape hatch for non-standard iconography.
 *
 * @element nldd-icon-cell
 * @attr {string} size - Size: '16' | '20' | '24' | '32' (default: '24')
 * @attr {'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical'} color - Color variant of the icon (default: 'content')
 * @attr {string} vertical-alignment - Vertical alignment: 'top' | 'center' | 'bottom' (default: 'center')
 * @attr {string} icon - Icon name (renders `<nldd-icon>`). Content in the default slot wins.
 * @attr {boolean} disclosure - Marks this icon as the chevron of a row or segment that opens and closes: the row turns it with `expanded`.
 *
 * @slot - Custom icon content, for iconography outside the icon set. Wins over `icon`.
 *
 * @csspart icon - The glyph itself, whether it comes from `icon` or from the slot. Transform this rather than the cell: a transform on the host changes the box `getBoundingClientRect()` reports, and a row measures its cells to place the divider.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { iconCellStyles } from './icon-cell.styles.js';
import { template } from './icon-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import '../../../content/icon/icon.js';
import { SlotContent } from '../../../../utilities/slot-content.js';

type VerticalAlignment = 'top' | 'center' | 'bottom';
type Size = '16' | '20' | '24' | '32';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical';

@customElement('nldd-icon-cell')
export class NLDDIconCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = iconCellStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('24') })
	size: Size = '24';

	@property({ reflect: true, converter: reflectNonDefault<Color>('content') })
	color: Color = 'content';

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<VerticalAlignment>('center') })
	verticalAlignment: VerticalAlignment = 'center';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	icon = '';

	/** @internal Whether the default slot holds an icon, which wins over `icon`. */
	_slot = new SlotContent(this);

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-icon-cell': NLDDIconCell;
	}
}
