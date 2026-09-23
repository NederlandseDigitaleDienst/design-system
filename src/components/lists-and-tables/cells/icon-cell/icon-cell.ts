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
 * @attr {string} icon - Icon name (renders `<nldd-icon>`). Takes precedence over the default slot.
 *
 * @slot - Fallback for custom icon content when `icon` is not set.
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { iconCellStyles } from './icon-cell.styles.js';
import { template } from './icon-cell.template.js';
import { VisibilityMixin } from '../../../../utilities/visibility-mixin.js';
import '../../../content/icon/icon.js';

type VerticalAlignment = 'top' | 'center' | 'bottom';
type Size = '16' | '20' | '24' | '32';
type Color = 'content' | 'secondary' | 'accent' | 'success' | 'warning' | 'critical';

@customElement('nldd-icon-cell')
export class NLDDIconCell extends VisibilityMixin(LitElement, 'cells-container') {
	static override styles = iconCellStyles;

	@property({ type: String, reflect: true })
	size: Size = '24';

	@property({ reflect: true, converter: reflectNonDefault<Color>('content') })
	color: Color = 'content';

	@property({ reflect: true, attribute: 'vertical-alignment', converter: reflectNonDefault<VerticalAlignment>('center') })
	verticalAlignment: VerticalAlignment = 'center';

	@property({ type: String, reflect: true })
	icon = '';

	override render() {
		return template.call(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-icon-cell': NLDDIconCell;
	}
}
