import { html, nothing } from 'lit';
import type { NLDDMenuBar } from './menu-bar.js';

export function template(component: NLDDMenuBar) {
	return html`
		<nav class="menu-bar"
			aria-label=${component.accessibleLabel || nothing}
		>
			<div class="menu-bar__list"
				role="list"
			>
				<slot></slot>
				<div class="menu-bar__overflow-button"
					role="listitem"
				>
					<nldd-menu-bar-item
						text="${component._overflowText}"
						icon="ellipsis"
						icon-only
						haspopup="menu"
						?expanded=${component._menuOpen}
						@pointerdown=${component._handleOverflowButtonPointerdown}
						@click=${component._toggleOverflowMenu}
					>
						<!-- The overflow popover is opened/closed explicitly by
							 _toggleOverflowMenu (same mechanism as an expandable
							 nldd-menu-bar-item's own submenu): anchored to this
							 always-visible trigger + a reopen guard. aria-controls
							 omitted: ARIA IDREF attributes cannot cross shadow DOM
							 boundaries and the menu is reparented to document.body;
							 haspopup + expanded forward to the inner button and give
							 sufficient AT context for WCAG 2.1 AA. -->
					</nldd-menu-bar-item>
				</div>
			</div>
		</nav>
	`;
}
