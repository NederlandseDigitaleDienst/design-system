import { html } from 'lit';
import type { NLDDButtonGroup } from './button-group.js';

export function template(this: NLDDButtonGroup) {
	return html`
	<div class="button-group">
		<slot @slotchange=${this._handleSlotChange}></slot>
	</div>
	`;
}
