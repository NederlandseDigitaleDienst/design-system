import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Whether a slot holds something to show: an element, or text that is more
 * than whitespace.
 *
 * A default slot also gets the whitespace and line breaks between the tags of
 * the markup around it, and that whitespace switches off the slot's fallback
 * content. A component that lets its slot win over an attribute therefore
 * renders the attribute beside the slot, and hides it when this says so.
 */
export function hasSlotContent(slot: HTMLSlotElement): boolean {
	return holdsContent(slot.assignedNodes());
}

/** Whether these nodes hold something to show, by the rule of {@link hasSlotContent}. */
export function holdsContent(nodes: readonly Node[]): boolean {
	return nodes.some((node) => node.nodeType === Node.ELEMENT_NODE
		|| (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0));
}

/**
 * The children of a host that go to a slot, read from the host itself: before
 * the first render there is no slot to ask. `''` is the default slot, which also
 * takes the text between the tags.
 */
export function slottedNodes(host: Element, name = ''): Node[] {
	return [...host.childNodes].filter((node) => node.nodeType === Node.ELEMENT_NODE
		? ((node as Element).getAttribute('slot') ?? '') === name
		: node.nodeType === Node.TEXT_NODE && name === '');
}

/**
 * Tracks whether the default slot holds something, for a component whose slot
 * wins over an attribute. Pass `onChange` to the slot's `@slotchange` and render
 * the attribute only while `has` is false:
 *
 * ```ts
 * private _textSlot = new SlotContent(this);
 * // in the template
 * html`${this._textSlot.has ? nothing : this.text}<slot @slotchange=${this._textSlot.onChange}></slot>`
 * ```
 *
 * It reads the children of the host as it connects, so the first render already
 * knows, before the slot reports its first change.
 */
export class SlotContent implements ReactiveController {
	has = false;

	constructor(private readonly _host: ReactiveControllerHost & HTMLElement) {
		_host.addController(this);
	}

	hostConnected(): void {
		this.has = holdsContent(slottedNodes(this._host));
	}

	onChange = (e: Event): void => {
		const has = hasSlotContent(e.target as HTMLSlotElement);
		if (has === this.has) return;
		this.has = has;
		this._host.requestUpdate();
	};
}
