import { html, nothing } from 'lit';
import type { NLDDToolbarTitle } from './toolbar-title.js';
import { linkRel } from '../../../utilities/link-rel.js';
import { linkHintKey } from '../../../utilities/link-hint.js';

// # Title template

export function toolbarTitleTemplate(component: NLDDToolbarTitle) {
	const titleGroup = html`
		<div class="toolbar__title-group">
			${component.text ? html`<p class="toolbar__title">${component.text}</p>` : nothing}
			${component.supportingText ? html`<p class="toolbar__supporting-text">${component.supportingText}</p>` : nothing}
		</div>
	`;

	// The link takes the mark and the name, never the action slot: a control
	// inside a link is a control you cannot reach without following the link.
	// A link to another website or a new tab says so (WCAG 2.1 SC 3.2.2).
	const hintKey = linkHintKey(component.href, component.target);
	return html`
		${component.href ? html`
			<a class="toolbar__title-link"
				href=${component.href}
				target=${component.target || nothing}
				rel=${linkRel(null, component.target) || nothing}
			>
				<slot name="media"></slot>
				${titleGroup}${hintKey ? html`<span class="toolbar__link-hint">, ${component._t(`components.toolbar.${hintKey}`)}</span>` : nothing}
			</a>
		` : html`
			<slot name="media"></slot>
			${titleGroup}
		`}
		<slot name="action"></slot>
	`;
}
