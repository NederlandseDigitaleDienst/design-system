import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { menuGroupStyles } from './menu.styles.js';
import { menuGroupTemplate, type MenuVariant } from './menu.template.js';
import { syncListItemRole } from './menu-item.js';

/**
 * A labeled group of menu items inside an nldd-menu. Wraps its slotted
 * items in `role="group"` with `aria-labelledby` pointing to the group's
 * `text`, providing native ARIA group semantics that a flat title element
 * can't deliver.
 *
 * The group renders an automatic divider above itself, except when it's
 * the first child of the menu — so consumers don't need to manage
 * separator placement around groups themselves. Spacing above the title
 * is intentionally larger than below, to bind the title visually to the
 * items it labels.
 *
 * Use the wrapper for grouping with a title; for ungrouped flat menus or
 * a divider without a title, the existing `nldd-menu-item` +
 * `nldd-menu-divider` flat structure keeps working unchanged.
 *
 * @element nldd-menu-group
 *
 * @attr {string} text - Group title text shown above the items.
 *
 * @slot - nldd-menu-item children (the items belonging to this group).
 */
export class NLDDMenuGroup extends LitElement {
	static override styles = menuGroupStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	// SSR caveat: this counter is per module instance, not per render. If
	// the component ever runs in a context where modules reload between
	// server and client (SSR hydration, Vite HMR with fresh module state),
	// IDs will mismatch and aria-labelledby refs will break. Browser-only
	// today; revisit if hydration is added.
	private static _idCounter = 0;
	readonly _titleId = `nldd-menu-group-title-${NLDDMenuGroup._idCounter++}`;

	/** @internal The variant of the menu around it, set by that nldd-menu. */
	@state()
	menuVariant: MenuVariant | null = null;

	override updated(changed: Map<string, unknown>): void {
		// In a navigation menu the group is a list item that holds a list of
		// its own, named by the title: a list may only own list items.
		if (changed.has('menuVariant')) syncListItemRole(this, this.menuVariant);
	}

	override render() {
		return menuGroupTemplate(this);
	}
}

if (!customElements.get('nldd-menu-group')) {
	customElements.define('nldd-menu-group', NLDDMenuGroup);
}
