/* eslint-disable lit-a11y/click-events-have-key-events -- native dialog handles keyboard via @cancel */
import { html, TemplateResult, nothing } from 'lit';
import type { NLDDNavigationSplitView } from './navigation-split-view.js';
import '../split-view-divider/split-view-divider.js';

export function navigationSplitViewTemplate(component: NLDDNavigationSplitView): TemplateResult {
	// A seam divider only belongs BETWEEN two visible panes — never trailing a
	// lone pane (e.g. the sidebar in full-stack, which showed a dangling divider
	// on its right edge) nor leading a lone inspector.
	const showPrimary = component._showPrimarySidebar;
	const showSecondary = component._showSecondarySidebar;
	const showMain = component._showMain;
	const showInspector = component._showInspector;
	const dividerAfterPrimary = showPrimary && (showSecondary || showMain || showInspector);
	const dividerAfterSecondary = showSecondary && (showMain || showInspector);
	const dividerBeforeInspector = showInspector && (showPrimary || showSecondary || showMain);

	return html`
		<div class="navigation-split-view">
			${showPrimary ? html`
				<div class="navigation-split-view__primary-sidebar-pane">
					<slot name="primary-sidebar"></slot>
				</div>
			` : nothing}
			${dividerAfterPrimary ? html`<nldd-split-view-divider orientation="vertical"></nldd-split-view-divider>` : nothing}
			${showSecondary ? html`
				<div class="navigation-split-view__secondary-sidebar-pane">
					<slot name="secondary-sidebar"></slot>
				</div>
			` : nothing}
			${dividerAfterSecondary ? html`<nldd-split-view-divider orientation="vertical"></nldd-split-view-divider>` : nothing}
			${showMain ? html`
				<div class="navigation-split-view__main-pane">
					<slot name="main"></slot>
				</div>
			` : nothing}
			${showInspector ? html`
				${dividerBeforeInspector ? html`<nldd-split-view-divider orientation="vertical"></nldd-split-view-divider>` : nothing}
				<div class="navigation-split-view__inspector-pane">
					<slot name="inspector"></slot>
				</div>
			` : component.inspectorAutoHidden || component.inspectorAsSheet ? html`
				<dialog class="navigation-split-view__inspector-sheet"
					aria-label=${component.inspectorAccessibleLabel}
					aria-modal="true"
					@click=${component._handleInspectorSheetClick}
					@cancel=${component._handleInspectorSheetCancel}
				>
					<div class="navigation-split-view__inspector-sheet-body">
						<slot name="inspector"></slot>
					</div>
				</dialog>
			` : nothing}
			${component.primarySidebarAsSheet ? html`
				<dialog class="navigation-split-view__primary-sidebar-sheet"
					aria-label=${component.primarySidebarAccessibleLabel}
					aria-modal="true"
					@click=${component._handlePrimarySidebarSheetClick}
					@cancel=${component._handlePrimarySidebarSheetCancel}
				>
					<div class="navigation-split-view__primary-sidebar-sheet-body">
						${component._hasSecondarySidebar && component._paneHasContent('secondary-sidebar') ? html`
							<slot name="secondary-sidebar"></slot>
						` : html`
							<slot name="primary-sidebar"></slot>
						`}
					</div>
				</dialog>
			` : nothing}
		</div>
	`;
}
