/**
 * Nederlandse Digitale Dienst Accordion Component (Lit + TypeScript)
 *
 * A stack of nldd-accordion-item elements, each a title that opens and closes
 * its content in place. Fold away only short, additional content: an answer
 * to a question, a detail most readers skip. Content folded in place costs
 * orientation, since the page grows and shifts under the reader. Content
 * that is long, holds a form or is a task of its own goes in rows of an
 * nldd-list that each open an nldd-sheet; see the design guidelines on
 * expand/collapse.
 *
 * The items join into one block: a border around them, a line between them,
 * each title in a tinted bar and its content on the base surface. It looks
 * like a `details` in nldd-rich-text, so in running text that is the lighter
 * choice.
 *
 * With `exclusive` only one item is open at a time: opening one closes the
 * other. Nothing else differs, so each item stays a native `details` with its
 * keyboard, screen reader and find-in-page behavior.
 *
 * @element nldd-accordion
 *
 * @attr {boolean} exclusive - Only one item is open at a time
 *
 * @slot - nldd-accordion-item elements.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { NLDDAccordionItem } from '../accordion-item/accordion-item.js';
import { accordionStyles } from './accordion.styles.js';
import { accordionTemplate } from './accordion.template.js';

@customElement('nldd-accordion')
export class NLDDAccordion extends LitElement {
	static override styles = accordionStyles;

	@property({ type: Boolean, reflect: true })
	exclusive = false;

	get _items(): NLDDAccordionItem[] {
		return Array.from(this.children).filter(
			(child): child is NLDDAccordionItem => child instanceof NLDDAccordionItem,
		);
	}

	/** An item says it toggled on its own host and the event does not bubble,
	 *  so the accordion listens in the capture phase. */
	private _onToggle = (event: Event): void => {
		const item = event.target;
		if (!this.exclusive || !(item instanceof NLDDAccordionItem)) return;
		if (item.parentElement !== this || !item.open) return;
		this._closeAllBut(item);
	};

	/** As with `details` that share a name, the first open item wins. */
	public _onSlotChange = (): void => {
		if (!this.exclusive) return;
		const first = this._items.find((item) => item.open);
		if (first) this._closeAllBut(first);
	};

	private _closeAllBut(keep: NLDDAccordionItem): void {
		for (const item of this._items) {
			if (item !== keep && item.open) item.open = false;
		}
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('toggle', this._onToggle, { capture: true });
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('toggle', this._onToggle, { capture: true });
	}

	override updated(changed: Map<string, unknown>): void {
		if (changed.has('exclusive') && this.exclusive) this._onSlotChange();
	}

	override render() {
		return accordionTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-accordion': NLDDAccordion;
	}
}
