import { html, nothing } from 'lit';
import type { NLDDToolbarItem } from './toolbar-item.js';

// # Item template

export function toolbarItemTemplate(component: NLDDToolbarItem) {
	return html`
		<div class="toolbar__item-content">
			<slot></slot>
		</div>
		${component.label ? html`<span class="toolbar__item-label">${component.label}</span>` : nothing}
		<slot name="overflow"></slot>
	`;
}
