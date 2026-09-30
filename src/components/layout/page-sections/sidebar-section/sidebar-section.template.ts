import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDSidebarSection } from './sidebar-section.js';

export function sidebarSectionTemplate(component: NLDDSidebarSection): TemplateResult {
	const collapsed = component.collapsed;
	const sidebarLabel = component._resolvedSidebarLabel;
	return html`
		<section class="sidebar-section">
			<div class="sidebar-section__body">
				<header class="sidebar-section__header"
					hidden
				>
					<slot
						name="header"
						@slotchange=${component._onSlotChange}
					></slot>
				</header>
				<div class="sidebar-section__columns">
					${!collapsed ? html`
						<aside class="sidebar-section__sidebar"
							aria-label=${sidebarLabel}
						>
							<div class="sidebar-section__sidebar-box">
								<slot name="sidebar"></slot>
							</div>
						</aside>
					` : nothing}
					<div class="sidebar-section__main">
						<slot></slot>
					</div>
				</div>
				<footer class="sidebar-section__footer"
					hidden
				>
					<slot
						name="footer"
						@slotchange=${component._onSlotChange}
					></slot>
				</footer>
			</div>
		</section>
		<nldd-sheet class="sidebar-section__sheet"
			placement="left"
			accessible-label=${sidebarLabel}
			@open=${component._onSheetOpen}
			@close=${component._onSheetClose}
		>
			${collapsed ? html`
				<nldd-page sticky-header>
					<slot
						name="sheet-top-title-bar"
						slot="header"
					>
						<nldd-top-title-bar
							text=${sidebarLabel}
							dismiss-text=${component._sheetDismissText}
						></nldd-top-title-bar>
					</slot>
					<slot name="sidebar"></slot>
				</nldd-page>
			` : nothing}
		</nldd-sheet>
	`;
}
