import type { LitElement, ReactiveController } from 'lit';

/**
 * The flags a native control can raise, in the order the platform lists them.
 * `valid` is not one of them: it is the answer, not a reason.
 */
const VALIDITY_FLAGS = [
	'badInput', 'customError', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow',
	'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing',
] as const satisfies readonly (keyof ValidityStateFlags)[];

/** What ElementInternals accepts as a form value. */
export type FormValue = string | File | FormData | null;

// Abstract, so an abstract base (nldd-code-editor and nldd-text-editor share
// NLDDCodeMirrorElement) can be mixed in too.
type Constructor<T = Record<string, unknown>> = abstract new (...args: any[]) => T;

export interface FormAssociatedElement {
	readonly internals: ElementInternals;
	/** The value submitted under `name`; `null` submits nothing. Override this. */
	formValue(): FormValue;
	/** Extra state for bfcache and state restore, when the value alone is not enough. */
	formState(): FormValue | undefined;
	commitFormValue(): void;
	/** The native control whose constraints the host reports as its own. */
	validationTarget(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
	/** Where an invalid submit points its message and puts the focus. */
	validationAnchor(): HTMLElement | undefined;
	/** A reason of your own, on top of the native ones. Empty clears it. */
	setCustomValidity(message: string): void;
	commitValidity(): void;
}

/**
 * Turns a Lit element into a form-associated custom element: it submits under
 * `name`, follows a disabled fieldset, and can be read back with `FormData`.
 *
 * A component supplies the one thing that is its own — what it submits — by
 * overriding `formValue()`. Everything around it lives here, including the
 * timing: the value is committed on every render AND has to be committed again
 * from the handler that changed it, with `commitFormValue()`. A render is a
 * task later than the event, so a listener that serializes the form on `change`
 * (htmx, or a plain `new FormData(form)`) runs before the render and would
 * otherwise read the value from before the change. That contract is checked for
 * every input at once in `form-value-timing.test.ts`.
 *
 * Reset and state restore stay with the component: what "the initial value" is
 * differs per input (checked, text, a number to clamp, two fields at once), so
 * a component implements `formResetCallback` / `formStateRestoreCallback`
 * itself.
 */
export function FormAssociated<T extends Constructor<LitElement>>(Base: T) {
	abstract class FormAssociatedMixin extends Base implements FormAssociatedElement {
		static formAssociated = true;

		readonly internals = this.attachInternals();

		constructor(...args: any[]) {
			super(...args);
			// A controller, not an updated() override: a component that defines
			// its own updated() would have to remember to call super.
			const commit: ReactiveController = { hostUpdated: () => this.commitFormValue() };
			this.addController(commit);
		}

		/** The value submitted under `name`; `null` submits nothing. Override. */
		formValue(): FormValue {
			return null;
		}

		/** Extra state kept for bfcache and state restore, when the submitted
		 *  value alone cannot rebuild the control (a combo box submits a code but
		 *  shows a label). Override alongside `formValue()`. */
		formState(): FormValue | undefined {
			return undefined;
		}

		/** Commit the value now, from the handler that changed it. */
		commitFormValue(): void {
			this.internals.setFormValue(this.formValue(), this.formState());
			this.commitValidity();
		}

		/**
		 * The native control this host speaks for.
		 *
		 * The constraint attributes are handed to a control inside the shadow
		 * root, and that control is not a member of the form around the host: the
		 * form sees the host, the host sees the control, and without something
		 * joining them a `required` field submits empty. Override when the control
		 * is not the first one in the shadow root, or return null for a component
		 * that has no native control to speak for.
		 */
		validationTarget(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
			return this.shadowRoot?.querySelector('input, textarea, select') ?? null;
		}

		/**
		 * Where an invalid submit points its message and puts the focus.
		 *
		 * The native control, where the user reads and fixes it. Not when that
		 * control is hidden, as the radio that only carries `required` is: a radio
		 * inside an element that is itself the radio is a control inside a control,
		 * and a hidden element cannot hold the message. Then it goes on this
		 * element. Override where neither is what the user should land on, such as
		 * a group that has no focus of its own.
		 */
		validationAnchor(): HTMLElement | undefined {
			const target = this.validationTarget();
			return target && !target.hidden ? target : undefined;
		}

		/**
		 * A reason the host is invalid that no attribute can express: a server that
		 * refused the value, or an nldd-validation-list whose rule it fails. Kept
		 * beside the native flags rather than replacing them, because
		 * `setValidity` writes the whole set at once and the two arrive from
		 * different places at different times.
		 */
		setCustomValidity(message: string): void {
			this._customValidity = message;
			this.commitValidity();
		}

		/**
		 * Hands the control's verdict to the form, as the host's own.
		 *
		 * Called on every render and from `commitFormValue`, so it follows the
		 * value for the same reason and with the same timing.
		 */
		commitValidity(): void {
			const target = this.validationTarget();
			const custom = this._customValidity;
			if (!target && !custom) {
				this.internals.setValidity({});
				return;
			}

			const flags: ValidityStateFlags = {};
			let message = '';
			if (target && !target.validity.valid) {
				for (const sleutel of VALIDITY_FLAGS) {
					if (target.validity[sleutel]) flags[sleutel] = true;
				}
				message = target.validationMessage;
			}
			if (custom) {
				flags.customError = true;
				// The custom reason first: it is the one this system wrote, and the
				// native message is the browser's own wording for the same field.
				message = custom;
			}

			const anchor = this.validationAnchor();
			if (Object.keys(flags).length === 0) {
				this.internals.setValidity({});
				return;
			}
			this.internals.setValidity(flags, message, anchor);
		}

		private _customValidity = '';

		formDisabledCallback(disabled: boolean): void {
			// Every form-associated component declares its own `disabled` property
			// (with its own reflection), so the mixin only writes to it.
			(this as unknown as { disabled: boolean }).disabled = disabled;
		}
	}

	return FormAssociatedMixin as unknown as T & Constructor<InstanceType<T> & FormAssociatedElement>;
}
