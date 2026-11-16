/**
 * Nederlandse Digitale Dienst Checkbox Group Component (Lit + TypeScript)
 *
 * Groups nldd-checkbox-field elements as nldd-radio-button-group groups radio
 * buttons: the same layout, one name for all of them, and a group that a
 * screen reader announces with its label. Each checkbox is a stop of its own
 * for Tab, as checkboxes are; the arrow keys belong to a radio group.
 * Use inside nldd-form-field, which provides the group label.
 *
 * `required` asks for at least one checked box, not for every box: while none
 * is checked, each field reports a missing value, and as soon as one is
 * checked, none does. Nothing announces it per box, since no single box is
 * required, and ARIA has no `aria-required` for a group: say it in the label
 * or the help text, or mark the other questions optional.
 *
 * @element nldd-checkbox-group
 * @attr {string} name - Forwarded to all nldd-checkbox-field elements in the group
 * @attr {boolean} disabled - Disables all fields in the group
 * @attr {boolean} required - At least one box in the group has to be checked. Set on every field in the group, nested ones included, over a `required` of their own.
 * @attr {string} accessible-label - Accessible name for the group, set as aria-label on the group
 * @attr {string} accessible-labeled-by - Id of an external label element, set as aria-labelledby on the group
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @slot - Slot for nldd-checkbox-field elements. Options nested in the `children` slot of a field belong to the group too; see nldd-checkbox-field.
 *
 * @fires change - Bubbles up from the field that changed; detail: { checked: boolean, value: string }
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { checkboxGroupStyles } from './checkbox-group.styles.js';
import { checkboxGroupTemplate } from './checkbox-group.template.js';
import type { NLDDCheckboxField } from '../checkbox-field/checkbox-field.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { deferFocus } from '../../../utilities/defer-focus.js';

@customElement('nldd-checkbox-group')
export class NLDDCheckboxGroup extends LitElement {
	static override styles = checkboxGroupStyles;

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
	 * checkbox would say the option is wrong, while it is the question
	 * that is unanswered. `aria-invalid` still goes on the control, because
	 * choosing not to show something is not a reason to keep quiet about it.
	 */
	@property({ type: Boolean, reflect: true })
	invalid = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', 'group');
		this.addEventListener('change', this._handleChange);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('change', this._handleChange);
	}

	override updated(changed: Map<PropertyKey, unknown>): void {
		if (changed.has('name') || changed.has('disabled') || changed.has('required')) {
			this._syncFields();
		}
		if (changed.has('invalid')) {
			if (this.invalid) this.setAttribute('aria-invalid', 'true');
			else this.removeAttribute('aria-invalid');
		}
		// Only ever take back a name this group wrote itself, so an aria-label the
		// consumer put on the host stays.
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

	/** Every field in the group, those nested under another one included. */
	private _getFields(): NLDDCheckboxField[] {
		return Array.from(this.querySelectorAll('nldd-checkbox-field'));
	}

	private _syncFields(): void {
		this._getFields().forEach(field => {
			if (this.name) field.name = this.name;
			field.required = this.required;
			if (this.disabled) {
				if (!field.hasAttribute('disabled')) {
					field.setAttribute('group-disabled', '');
					field.disabled = true;
				}
			} else if (field.hasAttribute('group-disabled')) {
				field.removeAttribute('group-disabled');
				field.disabled = false;
			}
		});
		this._syncAnswered();
	}

	/** Whether any box is checked: what `required` asks of the group. A field
	 *  only sees itself, so the group tells each of them. */
	private _syncAnswered(): void {
		const fields = this._getFields();
		const answered = fields.some((field) => field.checked);
		fields.forEach((field) => {
			field._groupHasSelection = answered;
			// Synchronously: a consumer reading validity in its change listener
			// should see the answer the group just changed.
			field.commitFormValue?.();
		});
	}

	private _handleChange = (): void => {
		this._syncAnswered();
	};

	/** Called by a field whose `checked` changed, whoever changed it: the
	 *  user, the app or a form reset. */
	_optionChanged(): void {
		// Once for all of them: checking an option with others under it changes
		// every one of those, each of which reports here.
		if (this._answerQueued) return;
		this._answerQueued = true;
		queueMicrotask(() => {
			this._answerQueued = false;
			this._syncAnswered();
		});
	}

	private _answerQueued = false;

	_onSlotChange = (): void => {
		this._syncFields();
	};

	/** Delegates focus to the first checked box, or else to the first one that
	 *  is enabled, so a label pointing at the group lands on a box. */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		const fields = this._getFields().filter((field) => !field.disabled);
		(fields.find((field) => field.checked) ?? fields[0])?.focus(options);
	}

	override render() {
		return checkboxGroupTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-checkbox-group': NLDDCheckboxGroup;
	}
}
