import { focusAsLastInput, focusIsFree } from './return-focus.js';

/**
 * The focus restore a field shares around its picker popover (nldd-date-field,
 * nldd-time-field).
 *
 * With `delegatesFocus`, Safari does not focus a button on click: it focuses the
 * text field instead. On close the popover restores focus to the element from
 * before it opened, so in Safari that lands on the input rather than the picker
 * button. The field takes focus back itself, one microtask after the popover's
 * own restore so it is not overwritten. A microtask rather than a frame: it
 * beats that same restore but is not throttled while the tab is unfocused.
 */
export class PickerPopoverController {
	constructor(
		private readonly _host: HTMLElement,
		private readonly _trigger: () => HTMLElement | null,
	) {}

	/**
	 * Focus the trigger button. `asked` forces it (a dismiss, Escape or an
	 * explicit close); otherwise only when the close left focus loose, as after a
	 * click beside the popover, and not when the click put focus elsewhere.
	 */
	focusTrigger(asked: boolean): void {
		const trigger = this._trigger();
		if (trigger && (asked || focusIsFree(this._host))) focusAsLastInput(trigger);
	}

	/** `focusTrigger`, one microtask after the popover's own restore. */
	restoreFocus(asked: boolean): void {
		queueMicrotask(() => this.focusTrigger(asked));
	}
}
