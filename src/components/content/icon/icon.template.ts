import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function template(iconSvg: string | null) {
	if (!iconSvg) {
		return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"></svg>`;
	}

	return html`${unsafeHTML(iconSvg)}`;
}
