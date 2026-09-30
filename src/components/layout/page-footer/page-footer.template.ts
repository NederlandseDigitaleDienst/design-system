import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDPageFooter, NLDDPageFooterLegalBar, NLDDPageFooterLegalBarItem } from './page-footer.js';

export function pageFooterTemplate(component: NLDDPageFooter): TemplateResult {
	const showDividerAboveMain = component._hasBreadcrumbs && component._hasMain;
	const showDividerAboveLegal = (component._hasBreadcrumbs || component._hasMain) && component._hasLegalBar;
	// The host carries role="contentinfo" (set in connectedCallback) so AT
	// that doesn't traverse the shadow root still sees the landmark. Using
	// <div> here instead of <footer> avoids double-announcing the landmark
	// in AT that DOES cross the boundary.
	return html`
		<div class="page-footer">
			<div class="page-footer__body">
				<div class="page-footer__breadcrumbs"
					?hidden=${!component._hasBreadcrumbs}
				>
					<slot
						name="breadcrumbs"
						@slotchange=${component._onSlotChange}
					></slot>
				</div>
				<hr class="page-footer__divider"
					?hidden=${!showDividerAboveMain}
				>
				<div class="page-footer__main"
					?hidden=${!component._hasMain}
				>
					<slot @slotchange=${component._onSlotChange}></slot>
				</div>
				<hr class="page-footer__divider"
					?hidden=${!showDividerAboveLegal}
				>
				<div class="page-footer__legal-bar"
					?hidden=${!component._hasLegalBar}
				>
					<slot
						name="legal-bar"
						@slotchange=${component._onSlotChange}
					></slot>
				</div>
			</div>
		</div>
	`;
}

export function pageFooterLegalBarTemplate(component: NLDDPageFooterLegalBar): TemplateResult {
	const label = component._t('components.page-footer.legal-bar-accessible-label');
	return html`
		<nav class="page-footer__legal-bar"
			aria-label=${label || nothing}
			?hidden=${!component._hasStart && !component._hasEnd}
		>
			<div class="page-footer__legal-bar-start"
				?hidden=${!component._hasStart}
			>
				<slot
					name="start"
					@slotchange=${component._onSlotChange}
				></slot>
			</div>
			<div class="page-footer__legal-bar-end"
				?hidden=${!component._hasEnd}
			>
				<slot
					name="end"
					@slotchange=${component._onSlotChange}
				></slot>
			</div>
		</nav>
	`;
}

export function pageFooterLegalBarItemTemplate(component: NLDDPageFooterLegalBarItem): TemplateResult {
	// `text=""` (empty string) intentionally falls through to the slot —
	// Lit normalizes the absent-attribute case to '', so a single falsy
	// check covers both "no text attr" and "explicit empty text".
	const label = component.text || html`<slot></slot>`;
	if (component.href) {
		return html`
			<span class="page-footer__legal-bar-item">
				<a class="page-footer__legal-bar-item-link"
					href=${component.href}
				>${label}</a>
			</span>
		`;
	}
	return html`<span class="page-footer__legal-bar-item">${label}</span>`;
}
