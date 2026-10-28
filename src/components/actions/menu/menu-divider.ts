import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { menuDividerStyles } from './menu.styles.js';
import { menuDividerTemplate, type MenuVariant } from './menu.template.js';

/**
 * A horizontal rule between groups of items in an `nldd-menu`.
 *
 * @element nldd-menu-divider
 */
export class NLDDMenuDivider extends LitElement {
	static override styles = menuDividerStyles;

	/** @internal The variant of the menu around it, set by that nldd-menu. */
	@state()
	menuVariant: MenuVariant | null = null;

	override render() {
		return menuDividerTemplate(this.menuVariant);
	}
}

if (!customElements.get('nldd-menu-divider')) {
	customElements.define('nldd-menu-divider', NLDDMenuDivider);
}
