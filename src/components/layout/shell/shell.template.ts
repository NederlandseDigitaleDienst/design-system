import { html, TemplateResult } from 'lit';
import type { NLDDShell } from './shell.js';

export function shellTemplate(_component: NLDDShell): TemplateResult {
	return html`
		<div class="shell">
			<slot></slot>
		</div>
	`;
}
