import { html } from 'lit';
import type { NLDDKeyboardShortcut } from './keyboard-shortcut.js';
import type { DisplayKey } from '../../../utilities/shortcut.js';

/** A symbol is shown, its name is read. */
function keyContent({ label, spoken }: DisplayKey) {
	if (label === spoken) return label;
	return html`<span class="keyboard-shortcut__symbol" aria-hidden="true">${label}</span><span class="keyboard-shortcut__spoken">${spoken}</span>`;
}

export function template(component: NLDDKeyboardShortcut) {
	const keys = component._displayKeys;

	if (keys.length === 0) {
		return html`
			<kbd class="keyboard-shortcut">
				<slot></slot>
			</kbd>
		`;
	}

	// Keycaps stand apart on their own, and macOS writes ⇧⌘Z without one.
	const joined = component.appearance === 'text' && component._resolvedOS !== 'mac';

	return html`
		<kbd class="keyboard-shortcut">
			${keys.map((key, index) => html`
				${joined && index > 0 ? html`<span class="keyboard-shortcut__separator"
					aria-hidden="true"
				>+</span>` : ''}
				<kbd class="keyboard-shortcut__key">${keyContent(key)}</kbd>
			`)}
		</kbd>
	`;
}
