/**
 * Nederlandse Digitale Dienst Radio Button Component (Lit + TypeScript)
 *
 * WAI-ARIA: put the buttons of one group in a container with
 * role="radiogroup" and a name of its own. A screen reader counts the options
 * from that container, so a bare <fieldset> (which is a group, not a
 * radiogroup) leaves them uncounted. nldd-radio-button-group does this for you.
 *
 * Radio buttons with the same name, in the same form and the same tree, form
 * one group the way native radios do: checking one unchecks the others, the
 * arrow keys move between them, Tab stops at the group once, and a screen
 * reader hears each one's place in it. The element itself is the radio, because
 * an input per shadow root would leave every button a group of one.
 *
 * The shape is all this component draws. A radio with a label beside it is
 * nldd-radio-button-field.
 *
 * @example
 * <fieldset role="radiogroup" aria-labelledby="options-label">
 *   <legend id="options-label">Kies een optie</legend>
 *   <nldd-radio-button name="options" value="1" accessible-label="Optie 1"></nldd-radio-button>
 *   <nldd-radio-button name="options" value="2" accessible-label="Optie 2"></nldd-radio-button>
 * </fieldset>
 *
 * On a selected row of nldd-list-item a checked control takes the colors of the
 * row: the row sets `--context-selected-indicator-color` and
 * `--context-selected-contrast-color`, because the accent can fall below 3:1 on
 * the gray of a selected row.
 *
 * @element nldd-radio-button
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disabled state
 * @attr {'inherit'} color - 'inherit' draws the control in the color of the text around it, with the mark in the surface color (`--context-parent-background-color`) or else `--semantics-content-contrast-color`, white or black against the text color. For a control on a colored surface, such as the panel of nldd-hero, where the accent would not stand out. Without it the control uses the accent.
 * @attr {boolean} no-tab - Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable.
 * @attr {boolean} decorative - Renders the shape only: no role, no focus, no
 *   name/value, nothing announced. For a control that owns the state elsewhere,
 *   such as a list row or an nldd-radio-button-field that is itself the radio;
 *   putting a second radio in there would nest a control inside a control.
 * @attr {boolean} required - Required state. What it asks is whether anything in the group is checked, as a native radio does.
 * @attr {boolean} focus-ring - Draws the focus ring around the shape. Set by nldd-radio-button-field, which is the radio itself and holds the focus. Not part of the public API.
 * @attr {string} name - Radio group name for form submission; ties the buttons of one group together
 * @attr {string} value - Value submitted with the form when this radio button is checked
 * @attr {string} accessible-label - Accessible label, set as aria-label on this element: it is the radio.
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 *   Note: aria-labelledby is not supported as IDREF resolution cannot cross shadow DOM boundaries.
 *
 * @fires change - When checked state changes; detail: { checked: boolean, value: string, name: string }
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { radioButtonStyles } from './radio-button.styles.js';
import { radioButtonTemplate } from './radio-button.template.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { RadioGrouping } from '../../../utilities/radio-grouping.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';

@customElement('nldd-radio-button')
export class NLDDRadioButton extends DescribedBy(FormAssociated(LitElement)) {

	static override styles = radioButtonStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;


	private _initialChecked = false;

	@property({ type: Boolean, reflect: true })
	checked = false;

	@property({ type: Boolean, reflect: true })
	decorative = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;
	/** Take the control out of the tab order (`tabindex="-1"`) — for a control
	 *  owned by a roving container (an `nldd-list` sets it on the rows that are
	 *  not the current one) that manages focus itself. Still mouse- and
	 *  script-focusable. */
	@property({ type: Boolean, reflect: true, attribute: 'no-tab' })
	noTab = false;


	@property({ type: Boolean, reflect: true })
	required = false;

	/** Set by nldd-radio-button-field. Not part of the public API: that field is
	 *  the radio and holds the focus, while the shape it rings is drawn here. */
	@property({ type: Boolean, reflect: true, attribute: 'focus-ring' })
	focusRing = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String })
	value = '';

	/** 'inherit' draws the control in the surrounding text color. */
	@property({ reflect: true, converter: reflectNonDefault('') })
	color = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';


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

	/** Its place among the radio buttons that share its name, and whether any of
	 *  them is checked. */
	private _grouping = new RadioGrouping(this);

	/** The aria-label this radio wrote on itself, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	/** Whether anything in its group is checked, which is what `required` asks
	 *  of a radio: one of these, not this one. */
	get _groupHasSelection(): boolean {
		return this._grouping.answered;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('click', this._onClick);
		this.addEventListener('keydown', this._onKeyDown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('click', this._onClick);
		this.removeEventListener('keydown', this._onKeyDown);
	}

	override firstUpdated(): void {
		this._initialChecked = this.checked;
	}

	/** Counting happens before the render, not after it: the place this radio is
	 *  given decides what `updated()` writes on it, and a count from there would
	 *  ask for a second render of what was just drawn. */
	override willUpdate(changed: PropertyValues<this>): void {
		if (changed.has('checked') && this.checked) this._grouping.uncheckOthers();
		if (changed.has('name') || changed.has('decorative')) this._grouping.regroup();
		else if (changed.has('checked') || changed.has('disabled')) this._grouping.refresh();
	}

	override updated(changed: PropertyValues<this>): void {
		super.updated(changed);
		this._syncHostAria();
	}

	/**
	 * This element is the radio.
	 *
	 * A native `<input type="radio">` groups with the radios of the same name in
	 * its own tree, and one per shadow root leaves every radio a group of one: a
	 * screen reader announces "1 of 1" and Tab stops at each of them. The role
	 * on the element itself puts every radio of a group in one tree again, where
	 * the browser counts them together.
	 */
	private _syncHostAria(): void {
		if (this.decorative) {
			for (const name of ['role', 'aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize', 'tabindex']) {
				this.removeAttribute(name);
			}
			return;
		}
		this.setAttribute('role', 'radio');
		this.setAttribute('aria-checked', String(this.checked));
		this._appliedLabel = setOwnedAttribute(this, 'aria-label', this.accessibleLabel, this._appliedLabel);
		if (this.disabled) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');

		const position = this._grouping.position;
		if (position) {
			this.setAttribute('aria-posinset', String(position.posInSet));
			this.setAttribute('aria-setsize', String(position.setSize));
		} else {
			this.removeAttribute('aria-posinset');
			this.removeAttribute('aria-setsize');
		}
		// A disabled radio is not in the tab order, as a native one is not.
		const tabbable = !this.disabled && !this.noTab && position?.tabbable !== false;
		this.setAttribute('tabindex', tabbable ? '0' : '-1');
	}

	/** The element assistive software meets is this one, so the description and
	 *  the invalid state belong here rather than on something inside. */
	override describedTarget(): Element | null {
		return this;
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

	/** Checks this radio, the way a click or the space bar does. */
	public select(): void {
		if (this.disabled || this.decorative || this.checked) return;
		this.checked = true;
		this.commitFormValue();
		this._grouping.uncheckOthers();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { checked: true, value: this.value, name: this.name },
			bubbles: true,
			composed: true,
		}));
	}

	private _onClick = (): void => {
		this.select();
	};

	private _onKeyDown = (e: KeyboardEvent): void => {
		if (this.disabled || this.decorative) return;
		// The keys a native radio answers to. Space checks it, Enter submits the
		// form it belongs to, and the arrow keys move through the group.
		if (e.key === ' ') {
			e.preventDefault();
			this.select();
			return;
		}
		if (e.key === 'Enter') {
			submitOnEnter(this, e);
			return;
		}
		// The arrow keys move through the group and check what they land on, as
		// with native radios. Not when a roving container manages focus itself:
		// it set no-tab and owns the keys.
		if (!this.noTab) this._grouping.moveWithArrow(e);
	};

	override render() {
		return radioButtonTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-radio-button': NLDDRadioButton;
	}
}
