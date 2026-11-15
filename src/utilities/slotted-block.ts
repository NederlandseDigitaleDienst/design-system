/**
 * A slot for text holds the element that carries it: a `<p>`, or a heading
 * where the component draws one. The component draws a plain box around what
 * is in the slot, and the page has the paragraph or heading in its HTML before
 * any script runs. Plain text belongs in the attribute.
 *
 * An inline element straight in the slot the rules see in the markup. Text
 * they only see in the browser, so a component says so with the `loose-text`
 * state.
 */

import { setState } from './element-state.js';

/** Whether these slotted nodes hold text of their own, outside any element. */
export function holdsLooseText(nodes: readonly Node[]): boolean {
	return nodes.some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
}

/** Keeps the `loose-text` state of a host: set while any of its slots holds loose text. */
export class LooseText {
	private readonly _slots = new Set<string>();

	constructor(private readonly _host: HTMLElement) {}

	read(name: string, nodes: readonly Node[]): void {
		if (holdsLooseText(nodes)) this._slots.add(name);
		else this._slots.delete(name);
		setState(this._host, 'loose-text', this._slots.size > 0);
	}
}
