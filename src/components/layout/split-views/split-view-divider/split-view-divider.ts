/**
 * Nederlandse Digitale Dienst Split View Divider Component (Lit + TypeScript)
 *
 * A divider line between panels in a split view.
 * The divider runs from edge to edge in the direction perpendicular to
 * the orientation. An optional drag handle indicates that the divider
 * is draggable (future functionality).
 *
 * @element nldd-split-view-divider
 *
 * @attr {string} orientation - Orientation: 'vertical' | 'horizontal'
 * @attr {boolean} has-drag-handle - Show a drag handle
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../../utilities/reflect-non-default.js';
import { splitViewDividerStyles } from './split-view-divider.styles.js';
import { splitViewDividerTemplate } from './split-view-divider.template.js';

type Orientation = 'vertical' | 'horizontal';

@customElement('nldd-split-view-divider')
export class NLDDSplitViewDivider extends LitElement {
	static override styles = splitViewDividerStyles;

	@property({ reflect: true, converter: reflectNonDefault<Orientation>('vertical') })
	orientation: Orientation = 'vertical';

	@property({ type: Boolean, reflect: true, attribute: 'has-drag-handle' })
	hasDragHandle = false;

	override render() {
		return splitViewDividerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-split-view-divider': NLDDSplitViewDivider;
	}
}
