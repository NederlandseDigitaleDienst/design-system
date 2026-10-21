/**
 * Nederlandse Digitale Dienst Switch Field Component (Lit + TypeScript)
 *
 * A switch toggle with an inline label for use in forms.
 *
 * @element nldd-switch-field
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control and its label in the color of the text around it, for a field on a colored surface such as the panel of nldd-hero. Passed to the control inside.
 * @attr {string} value - Value for form submission
 * @attr {string} name - Name for form submission
 * @attr {string} label - Label text for the switch
 * @attr {boolean} required - Required state
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @fires change - When checked state changes; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { customElement, property } from 'lit/decorators.js';
import { switchFieldStyles } from './switch-field.styles.js';
import { switchFieldTemplate } from './switch-field.template.js';
import type { NLDDSwitch } from '../switch/switch.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';

@customElement('nldd-switch-field')
export class NLDDSwitchField extends DescribedBy(LitElement) {
	static override styles = switchFieldStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	value = 'on';

	@property({ type: String })
	name = '';

	/** 'inherit' draws the control and its label in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color = '';

	@property({ type: String })
	label = '';


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

	public _handleLabelClick(e: Event): void {
		if (this.disabled) return;
		if ((e.target as HTMLElement).closest?.('nldd-switch')) return;
		const switchEl = this.shadowRoot?.querySelector('nldd-switch') as NLDDSwitch | null;
		switchEl?.toggle();
	}

	public _handleChange(e: Event): void {
		this.checked = (e as CustomEvent<{ checked: boolean }>).detail.checked;
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: this.checked, value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	/**
	 * Delegates focus to the inner `<nldd-switch>`, which in turn focuses its
	 * native checkbox input. Lets consumers call `switchFieldEl.focus()` without
	 * reaching into shadow DOM.
	 */
	override focus(options?: FocusOptions): void {
		this.shadowRoot?.querySelector<NLDDSwitch>('nldd-switch')?.focus(options);
	}

	/** The switch it renders knows which element inside itself is the control. */
	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('nldd-switch') ?? null;
	}

	override render() {
		return switchFieldTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-switch-field': NLDDSwitchField;
	}
}
