import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDDocumentTabBar, NLDDDocumentTabBarItem } from './document-tab-bar.js';
import './../../actions/icon-button/icon-button.js';
import './../../content/icon/icon.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';
import './../../content/tooltip/tooltip.js';

export function documentTabBarTemplate(component: NLDDDocumentTabBar): TemplateResult {
	const hasOverflow = component._overflowCount > 0;
	const label = component.accessibleLabel || 'Tabbladen';
	const isNavigation = component.navigation;

	// Overflow button: aria-controls is intentionally omitted. ARIA IDREF
	// attributes cannot cross shadow DOM boundaries (the menu is reparented
	// to document.body). popup-type + expanded forward to the inner button
	// as aria-haspopup / aria-expanded and give sufficient AT context for
	// WCAG 2.1 AA. Restore aria-controls once nldd-menu moves into the
	// shadow root, or CSS Anchor Positioning lets the menu escape the
	// stacking context without document.body.
	const inner = html`
		<div class="document-tab-bar__items"
			role=${isNavigation ? nothing : 'tablist'}
			aria-label=${isNavigation ? nothing : label}
		>
			<slot @slotchange=${component._onSlotChange}></slot>
		</div>
		<div class=${classMap({ 'document-tab-bar__overflow': true, 'is-hidden': !hasOverflow })}>
			<nldd-icon-button
				text=${component._t('components.document-tab-bar.overflow-action')}
				variant="neutral-tinted"
				icon="ellipsis"
				tooltip-timing="never"
				popup-type="menu"
				?expanded=${component._menuOpen}
			></nldd-icon-button>
		</div>
		<div class="document-tab-bar__end"
			hidden
		>
			<slot name="end" @slotchange=${component._onEndSlotChange}></slot>
		</div>
	`;

	return html`
		${isNavigation
			? html`<nav class="document-tab-bar"
					aria-label=${label}
				>${inner}</nav>`
			: html`<div class="document-tab-bar">${inner}</div>`}
		<div class="document-tab-bar__polite-announcer"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		></div>
		<div class="document-tab-bar__assertive-announcer"
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		></div>
	`;
}

export function documentTabBarItemTemplate(component: NLDDDocumentTabBarItem): TemplateResult {
	const shortTextValue = component.shortText || component.text;
	const shortSupportingTextValue = component.shortSupportingText || component.supportingText;
	const isNavigation = component._navigation;
	const safeHref = sanitizeUrl(component.href);
	const isLink = Boolean(safeHref);
	const tabindex = component.selected || component._isFallbackFocusable ? '0' : '-1';

	const tooltipText = component.supportingText
		? `${component.text} · ${component.supportingText}`
		: component.text;

	const tabContent = html`
		<span class="document-tab-bar__item-normal"
			aria-hidden="true"
		>
			<span class="document-tab-bar__item-text">${component.text}</span>
			${component.supportingText
				? html`<span class="document-tab-bar__item-supporting-text">${component.supportingText}</span>`
				: nothing}
		</span>
		<span class="document-tab-bar__item-short">
			<span class="document-tab-bar__item-short-text">${shortTextValue}</span>
			${shortSupportingTextValue
				? html`<span class="document-tab-bar__item-short-supporting-text">${shortSupportingTextValue}</span>`
				: nothing}
		</span>
	`;

	const tab = isLink
		? html`<a class="document-tab-bar__item-tab"
				href=${safeHref!}
				role=${isNavigation ? nothing : 'tab'}
				aria-current=${isNavigation && component.selected ? 'page' : nothing}
				aria-selected=${!isNavigation ? (component.selected ? 'true' : 'false') : nothing}
				aria-label=${tooltipText}
				tabindex=${tabindex}
				@click=${component._handleClick}
			>${tabContent}</a>`
		: html`<button class="document-tab-bar__item-tab"
				type="button"
				role="tab"
				aria-selected=${component.selected ? 'true' : 'false'}
				aria-label=${tooltipText}
				tabindex=${tabindex}
				@click=${component._handleClick}
			>${tabContent}</button>`;

	return html`
		<nldd-tooltip text=${tooltipText} timing=${component._isShort ? 'delay' : 'never'}>
			<div class="document-tab-bar__item">
				${tab}
				<button class="document-tab-bar__item-dismiss-button"
					aria-label=${component._dismissButtonAccessibilityLabel}
					tabindex=${component.selected || component._isFallbackFocusable ? '0' : '-1'}
					@click=${component._handleDismiss}
				>
					<span class="document-tab-bar__item-dismiss-icon">
						<nldd-icon icon="dismiss"></nldd-icon>
					</span>
				</button>
			</div>
		</nldd-tooltip>
	`;
}
