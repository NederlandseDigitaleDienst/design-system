import { html, nothing } from 'lit';
import type { NLDDLinkGroup } from './link-group.js';

export function template(component: NLDDLinkGroup) {
	return html`
		<nav class="link-group"
			aria-label=${component.accessibleLabel || nothing}
		>
			<div class="link-group__items"
				role="list"
			>
				<slot @slotchange=${component._handleSlotChange}></slot>
			</div>
		</nav>
	`;
}
