import { html, nothing, TemplateResult } from 'lit';
import type { NLDDTabBar, NLDDTabBarItem } from './tab-bar.js';
import '../../content/tooltip/tooltip.js';
import '../../content/icon/icon.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';

export function tabBarTemplate(component: NLDDTabBar): TemplateResult {
	const label = component.accessibleLabel || 'Tabs';
	const isNavigation = component.navigation;

	const itemsContainer = html`
		<div class="tab-bar__items"
			role=${isNavigation ? nothing : 'tablist'}
			aria-label=${isNavigation ? nothing : label}
		>
			<slot @slotchange=${component._onSlotChange}></slot>
		</div>
	`;

	if (isNavigation) {
		return html`
			<nav class="tab-bar"
				aria-label=${label}
			>
				${itemsContainer}
			</nav>
		`;
	}

	return html`
		<div class="tab-bar">
			${itemsContainer}
		</div>
	`;
}

export function tabBarItemTemplate(component: NLDDTabBarItem): TemplateResult {
	const safeHref = sanitizeUrl(component.href);
	const isLink = Boolean(safeHref);
	const isNavigation = component._navigation;
	const isDisabled = component._groupDisabled;
	// A disabled bar takes every tab out of the tab order; otherwise the roving
	// tabindex keeps the current (or fallback) tab as the single entry point.
	const tabindex = isDisabled
		? '-1'
		: component.current || component._isFallbackFocusable ? '0' : '-1';
	const isIconVariant = component._effectiveVariant === 'icon';
	const iconLabel = isIconVariant ? component.text || nothing : nothing;
	/* The icon and icon-and-text variants reserve an icon area; fill it with a
	 * placeholder whenever the consumer provided no icon. */
	const showPlaceholder = isIconVariant || component._effectiveVariant === 'icon-and-text';

	const content = html`
		<span class="tab-bar__item-icon"
			aria-hidden="true"
		>
			${component.icon
				? html`<nldd-icon icon=${component.icon}></nldd-icon>`
				: html`<slot name="icon" @slotchange=${component._onIconSlotChange}>${showPlaceholder ? html`<nldd-icon icon="icon-placeholder"></nldd-icon>` : nothing}</slot>`}
		</span>
		<span class="tab-bar__item-text">
			${component.text}
		</span>
	`;

	let result: TemplateResult;

	if (isLink) {
		result = html`
			<a class="tab-bar__item"
				href=${safeHref!}
				role=${isNavigation ? nothing : 'tab'}
				aria-current=${isNavigation && component.current ? 'page' : nothing}
				aria-selected=${!isNavigation ? (component.current ? 'true' : 'false') : nothing}
				aria-disabled=${isDisabled ? 'true' : nothing}
				aria-label=${iconLabel}
				tabindex=${tabindex}
				@click=${component._handleClick}
			>${content}</a>
		`;
	} else {
		result = html`
			<button class="tab-bar__item"
				type="button"
				role="tab"
				aria-selected=${component.current ? 'true' : 'false'}
				aria-disabled=${isDisabled ? 'true' : nothing}
				aria-label=${iconLabel}
				tabindex=${tabindex}
				@click=${component._handleClick}
			>${content}</button>
		`;
	}

	if (isIconVariant && component.text) {
		return html`<nldd-tooltip text=${component.text}>${result}</nldd-tooltip>`;
	}
	return result;
}
