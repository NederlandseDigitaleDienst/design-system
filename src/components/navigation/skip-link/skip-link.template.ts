import { html } from 'lit';
import type { NLDDSkipLink } from './skip-link.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';

export function template(component: NLDDSkipLink) {
	const safeHref = sanitizeUrl(component.href);

	return html`
		<div class="skip-link">
			${safeHref ? html`
				<a class="skip-link__control"
					href=${safeHref}
					@click=${component._handleLinkClick}
				><span class="skip-link__text">${component._text}</span></a>
			` : html`
				<button class="skip-link__control"
					type="button"
					@click=${component._handleClick}
				><span class="skip-link__text">${component._text}</span></button>
			`}
		</div>
		<slot @slotchange=${component._handleSlotChange}></slot>
	`;
}
