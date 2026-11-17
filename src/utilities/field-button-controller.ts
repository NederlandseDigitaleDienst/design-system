import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { setState } from './element-state.js';

interface FieldHost extends ReactiveControllerHost, HTMLElement {
	size: string;
	disabled: boolean;
}

/**
 * The `button` slot of a text field: gives the button a size one step below
 * the field, so it sits inside the border, and disables it with the field.
 * Used by nldd-text-field and nldd-multi-line-text-field.
 */
export class FieldButtonController implements ReactiveController {
	/** Whether the slot holds anything, so an empty one reserves no space. */
	hasButton = false;

	/** Buttons whose size the field has set, so a size of their own can be told apart. */
	private _sized = new WeakSet<Element>();

	/** Buttons the field disabled, so it only enables what it disabled itself. */
	private _disabled = new WeakSet<Element>();

	constructor(private readonly host: FieldHost) {
		host.addController(this);
	}

	/** The size a slotted button gets: `sm` in a field of `md`, `xs` in one of `sm`. */
	get size(): 'sm' | 'xs' {
		return this.host.size === 'sm' ? 'xs' : 'sm';
	}

	private _buttons(): Element[] {
		const slot = this.host.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="button"]');
		return slot?.assignedElements({ flatten: true }) ?? [];
	}

	hostUpdated(): void {
		this._sync();
	}

	handleSlotChange = (): void => {
		const hasButton = this._buttons().length > 0;
		if (hasButton !== this.hasButton) {
			this.hasButton = hasButton;
			this.host.requestUpdate();
		}
		this._sync();
	};

	private _sync(): void {
		for (const button of this._buttons()) {
			const own = button.getAttribute('size');
			if (own !== null && own !== this.size && !this._sized.has(button)) setState(this.host, 'own-button-size-overwritten', true);
			if (own !== this.size) button.setAttribute('size', this.size);
			this._sized.add(button);

			if (this.host.disabled && !button.hasAttribute('disabled')) {
				button.setAttribute('disabled', '');
				this._disabled.add(button);
			} else if (!this.host.disabled && this._disabled.has(button)) {
				button.removeAttribute('disabled');
				this._disabled.delete(button);
			}
		}
	}
}
