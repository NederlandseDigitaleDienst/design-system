import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { styleState } from '../../../utilities/element-state.js';
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
 * @attr {boolean} hidden - Set by nldd-toolbar, not a consumer attribute, when the item moves into the overflow menu. Toggled synchronously during measurement, so do not style against it.
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

	// Layout state, owned by nldd-toolbar. Not attributes: a consumer never sets
	// them. Each setter flips its `:state()` synchronously, because the toolbar
	// reads the box right after, in the same measurement.
	private _states = new Set<string>();

	private _toggleState(name: string, on: boolean): void {
		if (on) this._states.add(name);
		else this._states.delete(name);
		styleState(this, name, on);
	}

	/** @internal The toolbar's show-item-labels: renders the label below the control. Read as `:state(show-item-labels)`. */
	get showItemLabels(): boolean { return this._states.has('show-item-labels'); }
	/** @internal */
	set showItemLabels(on: boolean) { this._toggleState('show-item-labels', on); }

	/** @internal The item grows or shrinks to fill space. Read as `:state(fluid)`. */
	get fluid(): boolean { return this._states.has('fluid'); }
	/** @internal */
	set fluid(on: boolean) { this._toggleState('fluid', on); }

	/** @internal The sole fluid item, allowed to shrink below its content. Read as `:state(solo-fluid)`. */
	get soloFluid(): boolean { return this._states.has('solo-fluid'); }
	/** @internal */
	set soloFluid(on: boolean) { this._toggleState('solo-fluid', on); }

	/** @internal Holds a control that overflows by itself (nldd-tab-bar), so it gets the width that control wants with everything shown. Read as `:state(shrinkable)`. */
	get shrinkable(): boolean { return this._states.has('shrinkable'); }
	/** @internal */
	set shrinkable(on: boolean) { this._toggleState('shrinkable', on); }

	/** @internal A shrinkable item narrowed down to what its control needs at least, before it moves into the overflow menu. Read as `:state(shrunk)`. */
	get shrunk(): boolean { return this._states.has('shrunk'); }
	/** @internal */
	set shrunk(on: boolean) { this._toggleState('shrunk', on); }

	override render() {
		return toolbarItemTemplate(this);
	}
}
