import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDText } from './text.js';

export function template(this: NLDDText): TemplateResult {
	// What is in the slot wins; `text` shows while it is empty.
	return html`${this.text && !this._textSlot.has ? html`<p class="text">${this.text}</p>` : nothing}<slot @slotchange=${this._textSlot.onChange}></slot>`;
}
