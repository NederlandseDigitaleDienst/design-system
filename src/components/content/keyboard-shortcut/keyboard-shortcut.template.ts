import { html } from 'lit';
import type { NLDDKeyboardShortcut } from './keyboard-shortcut.js';
import type { DisplayKey } from '../../../utilities/shortcut.js';

/** A symbol is shown, its name is read. */
function keyContent({ label, name }: DisplayKey) {
	if (label === name) return label;
	return html`<span class="keyboard-shortcut__symbol" aria-hidden="true">${label}</span><span class="keyboard-shortcut__key-name">${name}</span>`;
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

	// Keycaps stand apart on their own. As text, macOS writes ⇧⌘Z: no '+' after
	// a modifier symbol, but still between two keys (G+H).
	const joined = (index: number) => component.appearance === 'text' && index > 0 && !keys[index - 1].symbol;

	return html`
		<kbd class="keyboard-shortcut">
			${keys.map((key, index) => html`
				${joined(index) ? html`<span class="keyboard-shortcut__separator"
					aria-hidden="true"
				>+</span>` : ''}
				<kbd class="keyboard-shortcut__key">${keyContent(key)}</kbd>
			`)}
		</kbd>
	`;
}
