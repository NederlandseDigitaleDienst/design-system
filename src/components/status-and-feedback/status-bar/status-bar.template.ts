import { html, nothing } from 'lit';
import type { NLDDStatusBar } from './status-bar.js';
import { linkRel } from '../../../utilities/link-rel.js';

export function statusBarTemplate(component: NLDDStatusBar) {
	const interactive = Boolean(component.href || component.button);
	const content = html`
		<span class="status-bar__text">${component.text}</span>
		${interactive ? html`
			<span class="status-bar__action-icon"
				aria-hidden="true"
			>
				<nldd-icon icon="chevron-right-small"></nldd-icon>
			</span>
		` : nothing}
	`;
	if (component.href) {
		return html`
			<a class="status-bar"
				href=${component.href}
				target=${component.target || nothing}
				rel=${linkRel(component.rel, component.target) || nothing}
			>${content}</a>
		`;
	}
	if (component.button) {
		return html`
			<button class="status-bar"
				type="button"
			>${content}</button>
		`;
	}
	return html`<div class="status-bar">${content}</div>`;
}
