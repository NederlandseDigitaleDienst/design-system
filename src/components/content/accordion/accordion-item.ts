/**
 * Nederlandse Digitale Dienst Accordion Item Component (Lit + TypeScript)
 *
 * One item of an nldd-accordion: a title in a tinted bar that opens and closes
 * the content below it. It is a native `details` inside, so the keyboard, a
 * screen reader and find in page work as they do there, and find in page
 * opens it. It starts closed, as a `details` does; add `open` to start open.
 *
 * The title is the name of the button that opens the item, so it is plain
 * text and not a heading.
 *
 * @element nldd-accordion-item
 *
 * @attr {string} text - Title in the bar
 * @attr {boolean} open - Whether the item is open
 *
 * @slot - The content: an nldd-rich-text, or an nldd-text for a single paragraph.
 *
 * @fires toggle - When the item opens or closes, also when `open` is set from code, as nldd-accordion needs for `exclusive`, and once on load for an item that starts open, as a native details does; read `open` for the new state.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { accordionItemStyles } from './accordion-item.styles.js';
import { accordionItemTemplate } from './accordion-item.template.js';
import '../icon/icon.js';

@customElement('nldd-accordion-item')
export class NLDDAccordionItem extends LitElement {
	static override styles = accordionItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: Boolean, reflect: true })
	open = false;

	/** The native details toggled, by a click or by `open`: keep `open` in step
	 *  and say so. A toggle event does not cross the shadow boundary, so the
	 *  host fires its own. */
	public _onToggle = (event: Event): void => {
		this.open = (event.currentTarget as HTMLDetailsElement).open;
		this.dispatchEvent(new Event('toggle'));
	};

	override render() {
		return accordionItemTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-accordion-item': NLDDAccordionItem;
	}
}
