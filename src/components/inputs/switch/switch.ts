/**
 * Nederlandse Digitale Dienst Switch Component (Lit + TypeScript)
 *
 * A toggle control for on/off settings.
 * Prefer nldd-switch-field for labeled usage — it combines the switch with a visible label.
 * Direct use of nldd-switch requires an accessible-label attribute for screen reader accessibility.
 *
 * On a selected row of nldd-list-item a checked control takes the colors of the
 * row: the row sets `--context-selected-indicator-color` and
 * `--context-selected-contrast-color`, because the accent can fall below 3:1 on
 * the gray of a selected row.
 *
 * @element nldd-switch
 * @attr {boolean} checked - Whether the switch is on/off
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control in the color of the text around it, with the mark in the surface color (`--context-parent-background-color`) or else `--semantics-content-contrast-color`, white or black against the text color. For a control on a colored surface, such as the panel of nldd-hero, where the accent would not stand out. Without it the control uses the accent.
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {string} size - Switch size: 'xs' | 'sm' (default: 'sm')
 * @attr {string} name - Name for form submission; nothing is submitted when the switch is off
 * @attr {string} value - Value submitted with the form when the switch is on (default: 'on')
 * @attr {string} accessible-label - Accessible label forwarded as aria-label to the native input. Required when using nldd-switch without nldd-switch-field.
 * @attr {boolean} required - Required state
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires change - When the switch state changes; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { switchStyles } from './switch.styles.js';
import { switchTemplate } from './switch.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

export type SwitchSize = 'xs' | 'sm';

@customElement('nldd-switch')
export class NLDDSwitch extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = switchStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;
	/** Take the control out of the tab order (`tabindex="-1"`) — for a control
	 *  owned by a roving container (an `nldd-list` sets it on the rows that are
	 *  not the current one) that manages focus itself. Still mouse- and
	 *  script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;


	@property({ reflect: true, converter: reflectNonDefault<SwitchSize>('sm') })
	size: SwitchSize = 'sm';

	/** 'inherit' draws the control in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color: '' | 'inherit' = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String })
	value = 'on';

	private _initialChecked = false;


	@property({ type: Boolean, reflect: true })
	required = false;


	/**
	 * Marks the control as invalid.
	 *
	 * Announced and not drawn. What is wrong belongs in an
	 * nldd-validation-list, in words: a red ring around a single
	 * checkbox or radio would say the option is wrong, while it is the question
	 * that is unanswered. `aria-invalid` still goes on the control, because
	 * choosing not to show something is not a reason to keep quiet about it.
	 */
	@property({ type: Boolean, reflect: true })
	invalid = false;

	override firstUpdated(): void {
		this._initialChecked = this.checked;
	}


	override formValue(): FormValue {
		return this.checked ? this.value : null;
	}

	formResetCallback(): void {
		this.checked = this._initialChecked;
	}


	formStateRestoreCallback(state: File | string | FormData | null): void {
		this.checked = state !== null;
	}

	// ## Swipe gesture

	private _pointerStartX: number | null = null;
	private _swiped = false;
	private static readonly SWIPE_THRESHOLD = 10;

	_handlePointerDown(e: PointerEvent): void {
		this._pointerStartX = e.clientX;
		this._swiped = false;
		try { (e.target as Element).setPointerCapture(e.pointerId); } catch { /* synthetic events in tests have no active pointer */ }
	}

	_handlePointerMove(e: PointerEvent): void {
		if (this._pointerStartX === null) return;
		const dx = e.clientX - this._pointerStartX;
		// Once the threshold is crossed, _swiped locks in — matching iOS switch
		// behavior where intent is set by crossing the threshold, and the final
		// toggle direction is determined by the terminal dx in _handlePointerUp.
		if (Math.abs(dx) >= NLDDSwitch.SWIPE_THRESHOLD) {
			this._swiped = true;
		}
	}

	_handlePointerUp(e: PointerEvent): void {
		if (this._pointerStartX === null) return;
		const dx = e.clientX - this._pointerStartX;
		this._pointerStartX = null;

		if (!this._swiped) return;

		e.preventDefault();
		// Reads the dir HTML attribute from the nearest ancestor. Does not detect
		// RTL set purely via CSS `direction: rtl` (no attribute).
		const isRtl = this.closest('[dir]')?.getAttribute('dir') === 'rtl';
		const shouldCheck = isRtl ? dx < 0 : dx > 0;

		if (shouldCheck !== this.checked) {
			this.toggle();
		}
	}

	_handlePointerCancel(): void {
		this._pointerStartX = null;
		this._swiped = false;
	}

	_handleClick(e: Event): void {
		if (this._swiped) {
			e.preventDefault();
			this._swiped = false;
		}
	}

	// ## Public API

	public toggle(): void {
		if (this.disabled) return;
		this.checked = !this.checked;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	public _handleChange(e: Event): void {
		if (this.disabled) return;
		const input = e.target as HTMLInputElement;
		this.checked = input.checked;
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to the inner native checkbox `<input>`, so consumers can
	 * call `switchEl.focus()` without reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<HTMLInputElement>('.switch__input')?.focus(options);
	}

	override render() {
		return switchTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-switch': NLDDSwitch;
	}
}
