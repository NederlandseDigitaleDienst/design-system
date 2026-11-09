/**
 * Nederlandse Digitale Dienst Link Group Component (Lit + TypeScript)
 *
 * A set of related `nldd-link` elements, such as the links under the name of a
 * service in a footer or the links to the other parts of a site. The links sit
 * in a row that wraps onto the next line when they do not fit, or stacked with
 * `orientation="vertical"`. With `horizontal-alignment="center"` the whole set
 * is centered, line by line, so a short list reads as one cloud in the middle.
 *
 * The group is a `nav` landmark with the links as a list, so a screen reader
 * says how many there are. Give it an `accessible-label` as soon as a page has
 * more than one `nav`, so each landmark can be told apart.
 *
 * The group sets its `size` on every link in it: links in one group are the
 * same size.
 *
 * @element nldd-link-group
 * @attr {string} size - Text size, set on every link in it: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {string} orientation - Layout direction: 'horizontal' (a row that wraps) | 'vertical' (default: 'horizontal')
 * @attr {string} horizontal-alignment - Alignment of the links: 'left' | 'center' (default: 'left')
 * @attr {string} accessible-label - Accessible name of the nav landmark
 *
 * @slot - nldd-link elements
 */
import { LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { markListItems } from '../../../utilities/list-items.js';
import { linkGroupStyles } from './link-group.styles.js';
import { template } from './link-group.template.js';

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Orientation = 'horizontal' | 'vertical';
type HorizontalAlignment = 'left' | 'center';

@customElement('nldd-link-group')
export class NLDDLinkGroup extends LitElement {
	static override styles = linkGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ reflect: true, converter: reflectNonDefault<Orientation>('horizontal') })
	orientation: Orientation = 'horizontal';

	@property({ attribute: 'horizontal-alignment', reflect: true, converter: reflectNonDefault<HorizontalAlignment>('left') })
	horizontalAlignment: HorizontalAlignment = 'left';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@query('slot')
	private _slot!: HTMLSlotElement;

	/** @internal */
	_handleSlotChange(): void {
		const assigned = this._slot.assignedElements({ flatten: true });
		markListItems(assigned);
		for (const el of assigned) el.setAttribute('size', this.size);
	}

	override updated(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('size') && this._slot) this._handleSlotChange();
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-link-group': NLDDLinkGroup;
	}
}
