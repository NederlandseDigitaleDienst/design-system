/**
 * Nederlandse Digitale Dienst Radio Button Group Component (Lit + TypeScript)
 *
 * Groups nldd-radio-button-field elements, handles keyboard navigation,
 * and forwards name and disabled state to all child fields.
 * Use inside nldd-form-field which provides the group label.
 *
 * @element nldd-radio-button-group
 * @attr {string} name - Forwarded to all slotted nldd-radio-button-field elements
 * @attr {boolean} disabled - Disables all slotted fields
 * @attr {boolean} required - Marks the group as required
 * @attr {string} accessible-label - Accessible name for the group, set as aria-label on the group
 * @attr {string} accessible-labeled-by - Id of an external label element, set as aria-labelledby on the group
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @slot - Slot for nldd-radio-button-field elements
 *
 * @fires change - Bubbles up from the checked field; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { radioButtonGroupStyles } from './radio-button-group.styles.js';
import { radioButtonGroupTemplate } from './radio-button-group.template.js';
import type { NLDDRadioButtonField } from '../radio-button-field/radio-button-field.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { deferFocus } from '../../../utilities/defer-focus.js';
import { ChoiceGroup, announceGroupState } from '../../../utilities/choice-group.js';

@customElement('nldd-radio-button-group')
export class NLDDRadioButtonGroup extends LitElement {
	static override styles = radioButtonGroupStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: String })
	name = '';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: Boolean, reflect: true })
	required = false;

	/** Accessible name forwarded as aria-label to the group host. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String, attribute: 'accessible-labeled-by' })
	accessibleLabeledBy = '';

	/** The name this group wrote onto its host, so it only takes back its own. */
	private _appliedLabel: string | null = null;


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

	private _choices = new ChoiceGroup<NLDDRadioButtonField>(this, {
		options: () => this._getFields(),
		isSelected: (field) => field.checked,
		deselect: (field) => { field.checked = false; },
		single: () => true,
		name: () => this.name,
		required: () => this.required,
	});

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', 'radiogroup');
		this.addEventListener('keydown', this._handleKeyDown);
		this.addEventListener('change', this._choices.handleChange);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('keydown', this._handleKeyDown);
		this.removeEventListener('change', this._choices.handleChange);
	}

	override updated(changed: Map<PropertyKey, unknown>): void {
		if (changed.has('name') || changed.has('disabled') || changed.has('required')) {
			this._choices.sync();
		}
		// Only ever take back a name this group wrote itself. Without the guard the
		// first update would strip an aria-label the consumer put on the host,
		// because "no accessible-label here" would be read as "remove the name".
		// Announced, not drawn. See the note on `invalid`.
		if (changed.has('invalid') || changed.has('required')) {
			announceGroupState(this, { required: this.required, invalid: this.invalid });
		}
		if (changed.has('accessibleLabel')) {
			this._appliedLabel = setOwnedAttribute(this, 'aria-label', this.accessibleLabel, this._appliedLabel);
		}
		if (changed.has('accessibleLabeledBy')) {
			if (this.accessibleLabeledBy) {
				this.setAttribute('aria-labelledby', this.accessibleLabeledBy);
			} else {
				this.removeAttribute('aria-labelledby');
			}
		}
	}

	private _getFields(): NLDDRadioButtonField[] {
		return Array.from(this.querySelectorAll('nldd-radio-button-field'));
	}

	private _getEnabledFields(): NLDDRadioButtonField[] {
		return this._getFields().filter(f => !f.disabled);
	}

	private _handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
			e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

		const fields = this._getEnabledFields();
		if (fields.length === 0) return;

		const activeField = fields.find(f => f.checked) ?? fields[0];
		const currentIndex = fields.indexOf(activeField);
		const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
		const nextIndex = isNext
			? (currentIndex + 1) % fields.length
			: (currentIndex - 1 + fields.length) % fields.length;

		const nextField = fields[nextIndex];
		if (!nextField) return;

		e.preventDefault();

		activeField.checked = false;
		activeField.commitFormValue?.();
		nextField.checked = true;
		nextField.commitFormValue?.();
		this._choices.settle();

		nextField.focus();

		nextField.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: nextField.value },
			bubbles: true,
			composed: true,
		}));
	};

	_onSlotChange = (): void => {
		this._choices.sync();
	};

	/**
	 * Delegates focus to the checked option, or to the first enabled one when
	 * nothing is checked. That is where the keyboard puts focus when tabbing
	 * into a radio group, so a label pointing at the group lands in the same
	 * place.
	 */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		this._choices.focus(options);
	}

	override render() {
		return radioButtonGroupTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-radio-button-group': NLDDRadioButtonGroup;
	}
}
