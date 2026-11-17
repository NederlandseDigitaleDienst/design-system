import { defaultConverter, type LitElement, type PropertyDeclaration, type ReactiveController } from 'lit';
import { internalsOf } from './element-state.js';

/**
 * The flags a native control can raise, in the order the platform lists them.
 * `valid` is not one of them: it is the answer, not a reason.
 */
const VALIDITY_FLAGS = [
	'badInput', 'customError', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow',
	'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing',
] as const satisfies readonly (keyof ValidityStateFlags)[];

/** Flags a component raises itself, with the message that goes with them. */
export interface OwnValidity {
	flags: ValidityStateFlags;
	message: string;
}

let uncheckedMessage = '';

/**
 * What `required` asks of a field around a checkbox or switch: a native control
 * inside its own shadow root is out of reach of the form, so the field answers
 * itself. In the browser's own words, as a native checkbox says it.
 */
export function uncheckedValidity(field: { required: boolean; checked: boolean; disabled: boolean }): OwnValidity | null {
	if (!field.required || field.checked || field.disabled) return null;
	if (!uncheckedMessage) {
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.required = true;
		uncheckedMessage = input.validationMessage || 'Check this box.';
	}
	return { flags: { valueMissing: true }, message: uncheckedMessage };
}

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
	/** What a reset puts the property `name` back to: its attribute, or what it held after the first render. */
	formDefault(name: string): unknown;
	/** Puts the value back to its default, as a form reset does. */
	formResetCallback(): void;
	/** Fills the value from what bfcache or autocomplete saved. */
	formStateRestoreCallback(state: FormValue, mode?: 'restore' | 'autocomplete'): void;
	/** Commits the value, then fires `type`: a listener reads the form as it is now. */
	emitFormEvent(type: string, detail?: unknown, init?: EventInit): boolean;
	/** The native control whose constraints the host reports as its own. */
	validationTarget(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
	/** Where an invalid submit points its message and puts the focus. */
	validationAnchor(): HTMLElement | undefined;
	/** What the component knows is wrong beyond its native control, or null. */
	ownValidity(): OwnValidity | null;
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
 * Reset and state restore follow `static formProperties`, the properties that
 * hold the value. A reset puts each back to its default, as a native input
 * does: the attribute when there is one, else what the property held after the
 * first render (a framework sets the property, not the attribute). A property
 * that reflects is its own attribute, so it always goes back to the first
 * render. A restore fills a single property from the saved state: a boolean is
 * on when a value was saved, anything else goes through the property's own
 * converter. A component overrides the callbacks only for what is its own: a
 * value to clamp, text to clear, two properties in one state.
 */
export function FormAssociated<T extends Constructor<LitElement>>(Base: T) {
	abstract class FormAssociatedMixin extends Base implements FormAssociatedElement {
		static formAssociated = true;

		readonly internals = internalsOf(this);

		/** The properties that hold the value, for reset and restore. */
		static formProperties: readonly string[] = [];

		constructor(...args: any[]) {
			super(...args);
			// A controller, not an updated() override: a component that defines
			// its own updated() would have to remember to call super.
			const commit: ReactiveController = {
				hostConnected: () => {
					if (this.hasUpdated || this._defaultsPending) return;
					this._defaultsPending = true;
					// After the first render has settled, as a component's own firstUpdated saw it.
					void this.updateComplete.then(() => this._takeDefaults());
				},
				hostUpdated: () => this.commitFormValue(),
			};
			this.addController(commit);
		}

		private _defaultsPending = false;
		private _defaults = new Map<string, unknown>();

		private get _formProperties(): readonly string[] {
			return (this.constructor as unknown as { formProperties: readonly string[] }).formProperties;
		}

		private _options(name: string): PropertyDeclaration {
			return (this.constructor as unknown as typeof LitElement).getPropertyOptions(name);
		}

		private _fromAttribute(name: string, text: string | null): unknown {
			const options = this._options(name);
			const converter = options.converter ?? defaultConverter;
			const from = typeof converter === 'function' ? converter : converter.fromAttribute ?? defaultConverter.fromAttribute!;
			return from(text, options.type);
		}

		private _takeDefaults(): void {
			for (const name of this._formProperties) {
				this._defaults.set(name, copy((this as Record<string, unknown>)[name]));
			}
		}

		/** What a reset puts `name` back to: its attribute, or the first render. */
		formDefault(name: string): unknown {
			const options = this._options(name);
			const attribute = typeof options.attribute === 'string' ? options.attribute : name.toLowerCase();
			if (options.attribute !== false && !options.reflect && this.hasAttribute(attribute)) {
				const value = this._fromAttribute(name, this.getAttribute(attribute));
				// An attribute that is no number says nothing: keep what it rendered with.
				if (!(typeof value === 'number' && Number.isNaN(value))) return value;
			}
			return copy(this._defaults.get(name));
		}

		formResetCallback(): void {
			for (const name of this._formProperties) {
				(this as Record<string, unknown>)[name] = this.formDefault(name);
			}
		}

		formStateRestoreCallback(state: FormValue, _mode?: 'restore' | 'autocomplete'): void {
			const properties = this._formProperties;
			if (properties.length !== 1) return;
			const [name] = properties;
			if (this._options(name).type === Boolean) (this as Record<string, unknown>)[name] = state !== null;
			else if (typeof state === 'string') (this as Record<string, unknown>)[name] = this._fromAttribute(name, state);
		}

		emitFormEvent(type: string, detail?: unknown, init: EventInit = {}): boolean {
			this.commitFormValue();
			return this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, ...init, detail }));
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
		 * What the component knows is wrong and its native control does not, such
		 * as typed text that is no date in a text input. Override; null is valid.
		 */
		ownValidity(): OwnValidity | null {
			return null;
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
			const own = this.ownValidity();
			if (!target && !custom && !own) {
				this.internals.setValidity({});
				return;
			}

			const flags: ValidityStateFlags = {};
			let message = '';
			// A disabled control is barred from validation: its flags can still be
			// set while its message is empty, and setValidity refuses that pair.
			if (target && target.willValidate && !target.validity.valid) {
				for (const sleutel of VALIDITY_FLAGS) {
					if (target.validity[sleutel]) flags[sleutel] = true;
				}
				message = target.validationMessage;
			}
			if (own) {
				Object.assign(flags, own.flags);
				message = own.message;
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

	/** An array is a value too: the default must not move with the live one. */
	function copy<V>(value: V): V {
		return (Array.isArray(value) ? [...value] : value) as V;
	}

	return FormAssociatedMixin as unknown as T & Constructor<InstanceType<T> & FormAssociatedElement>;
}
