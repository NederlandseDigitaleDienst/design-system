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
	return slot.assignedNodes().some((node) => node.nodeType === Node.ELEMENT_NODE
		|| (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0));
}

/**
 * Tracks whether a slot holds something, for a component whose slot wins over
 * an attribute. Pass `onChange` to the slot's `@slotchange` and render the
 * attribute only while `has` is false:
 *
 * ```ts
 * private _textSlot = new SlotContent(this);
 * // in the template
 * html`${this._textSlot.has ? nothing : this.text}<slot @slotchange=${this._textSlot.onChange}></slot>`
 * ```
 */
export class SlotContent {
	has = false;

	constructor(private readonly _host: { requestUpdate(): void }) {}

	onChange = (e: Event): void => {
		const has = hasSlotContent(e.target as HTMLSlotElement);
		if (has === this.has) return;
		this.has = has;
		this._host.requestUpdate();
	};
}
