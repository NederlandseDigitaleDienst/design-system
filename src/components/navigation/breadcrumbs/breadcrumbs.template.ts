import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDBreadcrumbs, NLDDBreadcrumbsItem } from './breadcrumbs.js';
import '../../content/icon/icon.js';

export function breadcrumbsTemplate(component: NLDDBreadcrumbs): TemplateResult {
	const label = component.accessibleLabel || component._t('components.breadcrumbs.accessible-label');

	return html`
		<nav class="breadcrumbs"
			aria-label=${label || nothing}
		>
			<div class="breadcrumbs__items"
				role="list"
			>
				<slot></slot>
			</div>
		</nav>
	`;
}

export function breadcrumbsItemTemplate(component: NLDDBreadcrumbsItem): TemplateResult {
	// What is in the slot wins; `text` shows while it is empty.
	const label = html`${component._textSlot.has ? nothing : component.text}<slot @slotchange=${component._textSlot.onChange}></slot>`;
	// The crumbs flow as text, so white space here is a space on the page. The
	// separator is text too: a word joiner, which keeps it on the line of the last
	// word, with the chevron drawn beside it out of flow. The space after it is
	// where the line may break; white space between items in the page's markup
	// collapses into it.
	const separator = html`<span class="breadcrumbs__separator"
		aria-hidden="true"
	>\u2060<span class="breadcrumbs__separator-icon"><nldd-icon icon="chevron-right-small"></nldd-icon></span></span> `;
	if (!component.current && component.href) {
		return html`<span class="breadcrumbs__item"><a class="breadcrumbs__item-link"
			href=${component.href}
		>${label}</a></span>${separator}`;
	}
	// aria-current also lives on the host (for the role=listitem) — mirroring
	// here makes it visible to AT+browser combinations (e.g. VoiceOver/Safari)
	// that miss reflected ARIA on shadow hosts.
	return html`<span class="breadcrumbs__item"
		aria-current=${component.current ? 'page' : nothing}
	>${label}</span>${separator}`;
}
