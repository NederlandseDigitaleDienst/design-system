/**
 * Nederlandse Digitale Dienst Toggle Button Group Component (Lit + TypeScript)
 *
 * Groups nldd-toggle-button elements and manages selection, keyboard navigation,
 * and forwarding of type, name, appearance, size, and disabled state to all buttons.
 *
 * For type="radio" (single-select), arrow keys navigate between buttons and
 * automatically select the focused one.
 * For type="checkbox" (multi-select), multiple buttons can be selected simultaneously.
 *
 * @element nldd-toggle-button-group
 *
 * @attr {'button' | 'checkbox' | 'radio'} type - Selection mode (default: 'checkbox')
 * @attr {string} name - Forwarded to all buttons
 * @attr {'neutral-tinted' | 'neutral-base' | 'neutral-transparent' | 'accent-transparent'} appearance - Forwarded to all buttons (default: 'neutral-tinted')
 * @attr {'xs' | 'sm' | 'md'} size - Forwarded to all buttons (default: 'md')
 * @attr {boolean} disabled - Disables all buttons
 * @attr {string} accessible-label - Accessible name for the group (aria-label)
 * @attr {string} accessible-labeled-by - ID of an external label element (aria-labelledby)
 * @attr {boolean} required - Marks the group as required. Enforced in radio mode; in checkbox mode only announced.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *
 * @slot - nldd-toggle-button elements
 *
 * @fires change - Bubbles up from the changed button; detail: { selected: boolean, value: string }
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { toggleButtonGroupStyles } from './toggle-button-group.styles.js';
import { toggleButtonGroupTemplate } from './toggle-button-group.template.js';
import type { NLDDToggleButton, ToggleButtonAppearance, ToggleButtonSize } from '../toggle-button/toggle-button.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { radioPositions } from '../../../utilities/radio-position.js';

type GroupType = 'button' | 'checkbox' | 'radio';

@customElement('nldd-toggle-button-group')
export class NLDDToggleButtonGroup extends LitElement {
	/**
	 * Marks the group as required: something has to be selected.
	 *
	 * Handed to the items, because that is where the platform reads it. One
	 * required radio makes the whole group required, and the browser writes its
	 * own message in the user's language.
	 *
	 * Only in radio mode. The same attribute on a checkbox means that box has to
	 * be ticked, so spreading it over a checkbox group would demand all of them
	 * instead of one. HTML has no way to say "at least one of these", and
	 * neither do we: `aria-required` still goes on the group so assistive
	 * software says it, but nothing enforces it.
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	private _warnedRequired = false;

	static override styles = toggleButtonGroupStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ type: String, reflect: true })
	type: GroupType = 'checkbox';

	@property({ type: String })
	name = '';

	@property({ reflect: true, converter: reflectNonDefault<ToggleButtonAppearance>('neutral-tinted') })
	appearance: ToggleButtonAppearance = 'neutral-tinted';

	@property({ reflect: true, converter: reflectNonDefault<ToggleButtonSize>('md') })
	size: ToggleButtonSize = 'md';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	/** Accessible name forwarded as aria-label to the group host. */
	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** ID of an external label element forwarded as aria-labelledby to the group host. */
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

	override connectedCallback(): void {
		super.connectedCallback();
		this._syncRole();
		this.addEventListener('change', this._handleChange);
		this.addEventListener('keydown', this._handleKeyDown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('change', this._handleChange);
		this.removeEventListener('keydown', this._handleKeyDown);
	}

	private _syncRole(): void {
		this.setAttribute('role', this.type === 'radio' ? 'radiogroup' : 'group');
	}

	override firstUpdated(): void {
		import.meta.env?.DEV && !this.accessibleLabel && !this.accessibleLabeledBy &&
			console.warn('<nldd-toggle-button-group>: No accessible name provided. Add an accessible-label or accessible-labeled-by attribute for screen reader accessibility.');
	}

	override updated(changed: Map<PropertyKey, unknown>): void {
		if (changed.has('type') || changed.has('name') || changed.has('appearance') || changed.has('size') || changed.has('disabled')) {
			this._syncButtons();
		}
		if (changed.has('type')) {
			this._syncRole();
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

	private _getButtons(): NLDDToggleButton[] {
		return Array.from(this.querySelectorAll('nldd-toggle-button'));
	}

	private _getEnabledButtons(): NLDDToggleButton[] {
		return this._getButtons().filter(b => !b.disabled);
	}

	private _syncButtons(): void {
		this.toggleAttribute('aria-required', this.required);
		// Announced, not drawn. See the note on `invalid`.
		if (this.invalid) this.setAttribute('aria-invalid', 'true');
		else this.removeAttribute('aria-invalid');

		if (import.meta.env?.DEV && this.required && this.type === 'checkbox' && !this._warnedRequired) {
			this._warnedRequired = true;
			console.warn(
				`<${this.localName}>: \`required\` on a checkbox group is announced but not enforced. `
				+ 'HTML has no way to say "at least one of these", so the form still submits with nothing '
				+ 'selected. Check it yourself on submit, or use radio mode.',
			);
		}

		this._getButtons().forEach(button => {
			button.type = this.type;
			button.appearance = this.appearance;
			button.size = this.size;
			button.required = this.required && this.type === 'radio';

			// name is only meaningful for checkbox and radio
			if (this.type !== 'button') {
				button.name = this.name;
			}

			if (this.disabled) {
				if (!button.hasAttribute('disabled')) {
					button.setAttribute('group-disabled', '');
					button.disabled = true;
				}
			} else if (button.hasAttribute('group-disabled')) {
				button.removeAttribute('group-disabled');
				button.disabled = false;
			}
		});
		this._positionButtons();
	}

	/** In radio mode, each button its place in the group and the group one stop
	 *  for Tab. Every button renders its input in a shadow root of its own, so
	 *  the browser would count each as a group of one. */
	private _positionButtons(): void {
		const buttons = this._getButtons();
		if (this.type !== 'radio') {
			buttons.forEach((button) => { button._groupPosition = null; });
			return;
		}
		const answered = buttons.some((button) => button.selected);
		radioPositions(buttons, (button) => button.selected, (button) => button.disabled)
			.forEach((position, index) => {
				buttons[index]._groupPosition = position;
				buttons[index]._groupHasSelection = answered;
			});
	}

	private _handleChange = (e: Event): void => {
		if (this.type !== 'radio') return;

		const changedButton = e.target as NLDDToggleButton;
		if (!changedButton.selected) return;

		// Deselect all other buttons when a radio button is selected
		this._getButtons().forEach(button => {
			if (button === changedButton) return;
			button.selected = false;
			// Synchronously, not via the button's own update cycle: the change
			// event is still propagating, and a consumer serializing the form in
			// its listener would otherwise still see this button's old value.
			button.commitFormValue?.();
		});
		this._positionButtons();
	};

	private _handleKeyDown = (e: KeyboardEvent): void => {
		if (this.type !== 'radio') return;
		if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;

		const buttons = this._getEnabledButtons();
		if (buttons.length === 0) return;

		const activeButton = buttons.find(b => b.selected);
		const currentIndex = activeButton ? buttons.indexOf(activeButton) : -1;
		const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
		const nextIndex = isNext
			? (currentIndex + 1) % buttons.length
			: currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;

		const nextButton = buttons[nextIndex];
		if (!nextButton) return;

		e.preventDefault();

		// Directly mutate selected rather than calling toggle() to avoid triggering
		// _handleChange which would attempt to deselect other buttons a second time.
		if (activeButton) {
			activeButton.selected = false;
			activeButton.commitFormValue?.();
		}
		nextButton.selected = true;
		nextButton.commitFormValue?.();
		this._positionButtons();

		nextButton.focus();

		nextButton.dispatchEvent(new CustomEvent('change', {
			detail: { selected: true, value: nextButton.value },
			bubbles: true,
			composed: true,
		}));
	};

	public _onSlotChange = (): void => {
		this._syncButtons();
	};

	/**
	 * Delegates focus to the first selected button, or to the first enabled one
	 * when nothing is selected. With `type="checkbox"` more than one can be
	 * selected; focus goes to the first of them, in DOM order.
	 */
	override focus(options?: FocusOptions): void {
		const buttons = this._getEnabledButtons();
		(buttons.find(button => button.selected) ?? buttons[0])?.focus(options);
	}

	override render() {
		return toggleButtonGroupTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-toggle-button-group': NLDDToggleButtonGroup;
	}
}
