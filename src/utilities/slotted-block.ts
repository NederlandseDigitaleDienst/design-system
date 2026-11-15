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

/** Whether a slot holds text of its own, outside any element. */
export function holdsLooseText(slot: HTMLSlotElement): boolean {
	return slot.assignedNodes().some((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
}
