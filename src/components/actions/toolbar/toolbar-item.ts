import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toolbarItemStyles } from './toolbar.styles.js';
import { toolbarItemTemplate } from './toolbar-item.template.js';

export type Size = 'sm' | 'md' | 'lg';

/** Consumer-set sizing props shared by nldd-toolbar-item and
 *  nldd-toolbar-title, read off generic Elements during measurement. */
export interface SizingElement {
	minWidth: string;
	maxWidth: string;
	width: string;
}

/**
 * One control in an nldd-toolbar, with its alternative for the overflow menu.
 *
 * @element nldd-toolbar-item
 * @attr {string} width - Fluid width: a percentage (e.g. '40%') or any CSS length (e.g. '240px'). Setting it (or min-width or max-width) makes the item fluid so it grows to fill the available space.
 * @attr {string} min-width - Minimum (fluid) width as a CSS length (e.g. '240px'). Setting it also makes the item fluid.
 * @attr {string} max-width - Maximum (fluid) width as a CSS length (e.g. '480px'). Setting it also makes the item fluid.
 * @attr {string} label - Text label shown below the item when the toolbar has show-item-labels.
 * @attr {number} priority - Overflow order: items with a lower priority move into the overflow menu first (default 0). Items sharing a priority overflow together, regardless of position.
 * @attr {'sm'|'md'|'lg'} size - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md') onto the item host, so size-dependent styling can key off it.
 * @attr {boolean} show-item-labels - Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's show-item-labels, so the item renders its label below the control.
 * @attr {boolean} fluid - Set by nldd-toolbar, not a consumer attribute: marks an item that grows or shrinks to fill space. Toggled synchronously during measurement, so it can appear or disappear between layout frames — do not style against it. It is not reflected as a JS property — read it with hasAttribute('fluid').
 * @attr {boolean} solo-fluid - Set by nldd-toolbar, not a consumer attribute: the sole fluid item, allowed to shrink below its content. Same synchronous-toggle and property-read caveats as fluid.
 * @attr {boolean} hidden - Set by nldd-toolbar, not a consumer attribute, when the item moves into the overflow menu. Same synchronous-toggle caveat.
 * @attr {boolean} shrinkable - Set by nldd-toolbar, not a consumer attribute: the item holds a control that overflows by itself (nldd-tab-bar), so it gets the width that control wants with everything shown. Same synchronous-toggle caveat.
 * @attr {boolean} shrunk - Set by nldd-toolbar, not a consumer attribute: a shrinkable item narrowed down to what its control needs at least, before it would move into the overflow menu. Same synchronous-toggle caveat.
 *
 * @slot - The control shown in the toolbar (e.g. nldd-icon-button)
 * @slot overflow - Required: nldd-menu-item / nldd-menu-divider / nldd-menu-group children, shown in the overflow menu when this item overflows. Without them the action is gone on a narrow toolbar, and the item warns in development.
 *
 */
@customElement('nldd-toolbar-item')
export class NLDDToolbarItem extends LitElement {
	static override styles = toolbarItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	width = '';

	@property({ reflect: true, attribute: 'min-width', converter: reflectNonDefault<string>('') })
	minWidth = '';

	@property({ reflect: true, attribute: 'max-width', converter: reflectNonDefault<string>('') })
	maxWidth = '';

	@property({ type: String })
	label = '';

	// Overflow order. The parent toolbar reads this as a PROPERTY (el.priority), so
	// both a bound property (Vue/React `:priority`, `el.priority = 2`) and a plain
	// attribute (`priority="2"`) work. Reflected so an explicit value is visible in
	// the DOM and a runtime property change re-triggers the toolbar's overflow
	// recompute (its observer watches the attribute). The converter reflects the
	// default 0 as *no attribute* (toAttribute → null), so the DOM isn't polluted
	// with `priority="0"` on every item; 0 means "no explicit priority".
	@property({
		reflect: true,
		converter: {
			fromAttribute: (value: string | null) => (value === null ? 0 : Number(value)),
			toAttribute: (value: number) => (value === 0 ? null : String(value)),
		},
	})
	priority = 0;

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/** Set by nldd-toolbar; not part of the public API. @internal */
	@property({ type: Boolean, reflect: true, attribute: 'show-item-labels' })
	showItemLabels = false;

	// Layout state — `fluid`, `solo-fluid` and `hidden` — is owned by
	// nldd-toolbar and toggled directly as attributes during measurement
	// (synchronous, so the host box reflows immediately). They are not
	// reactive properties: Lit would reflect them asynchronously, which would
	// desync the attribute from the synchronous getBoundingClientRect reads.

	override render() {
		return toolbarItemTemplate(this);
	}
}
