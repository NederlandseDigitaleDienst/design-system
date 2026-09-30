/**
 * Nederlandse Digitale Dienst Form Field Components (Lit + TypeScript)
 *
 * A field around one input: its label, supporting label, optional badge,
 * validation and help text. It finds the input among its children, hands it
 * the label as its accessible name and gives it an id, so you write no `for`
 * or `id` yourself.
 *
 * Mark the optional fields with `optional`, not the required ones; the design
 * guidelines say why. Put the requirements on a value in an
 * nldd-validation-list inside the same field. What only your server knows,
 * such as a password found in a breach, the app names in `unmet` on the input
 * itself: see nldd-validation-list.
 *
 * @element nldd-form-field
 *
 * @attr {string} label-alignment - 'top' (default) | 'right' | 'left'. A value of its own always wins over the inherited form-label-alignment.
 * @attr {string} label - Field label text. Omit for no-label layout.
 * @attr {string} supporting-label - Short supporting text below the label. Same typography as optional badge.
 * @attr {boolean} optional - Shows an optional badge next to the label.
 * @attr {string} optional-label - Text for the optional badge. Defaults to 'Optioneel'.
 * @attr {string} form-label-alignment - Set by a wrapping nldd-form as a fallback. Do not set it yourself in consumer code.
 *
 * @slot - The slotted input (e.g. nldd-text-field), its nldd-validation-list and its nldd-form-field-help-text.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @element nldd-form-field-help-text
 *
 * @slot - Help text content. May contain inline elements including links.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @example
 * <nldd-form-field label="Password">
 *   <nldd-password-field invalid></nldd-password-field>
 *   <nldd-validation-list>
 *     <nldd-validation-item id="password-required" required>This field is required.</nldd-validation-item>
 *     <nldd-validation-item id="password-length" minlength="8">Must be at least 8 characters.</nldd-validation-item>
 *   </nldd-validation-list>
 *   <nldd-form-field-help-text>
 *     We only use this to sign you in. <a href="/help">Learn more</a>.
 *   </nldd-form-field-help-text>
 * </nldd-form-field>
 */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { applyDescribedBy, type DescribedElement } from '../../../utilities/described-by-mixin.js';
import {
	formFieldStyles,
	formFieldHelpTextStyles,
} from './form-field.styles.js';
import {
	formFieldTemplate,
	formFieldHelpTextTemplate,
} from './form-field.template.js';

export type LabelAlignment = 'top' | 'left' | 'right';

// Exclude helper elements so _findInput() never returns them instead of the actual input
const HELPER_TAGS = ['nldd-form-field-help-text'];

/**
 * Whether this element is the input a field is about.
 *
 * Asked, not inferred. Every input in this system carries
 * `static isFormInput = true`, and a native `<input>`, `<select>` or
 * `<textarea>` is one by the platform's own definition. Nothing else counts,
 * deliberately: half the components in the package accept `accessible-label`
 * and taking that as the signal would let a tag or a button beside your field
 * be mistaken for the field.
 *
 * A consumer with an input of their own says so the same way, or names the
 * control themselves and leaves this field out of it.
 */
function isFormInput(el: Element): boolean {
	return el instanceof HTMLInputElement
		|| el instanceof HTMLSelectElement
		|| el instanceof HTMLTextAreaElement
		|| (el.constructor as { isFormInput?: boolean }).isFormInput === true;
}

// crypto.randomUUID() requires a secure context (HTTPS or localhost).
// The fallback uses Math.random() which is sufficient for non-security-sensitive DOM IDs.
function generateId(): string {
	const uuid = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
	return `nldd-field-input-${uuid}`;
}


/* ============================================================
   nldd-form-field
   ============================================================ */

@customElement('nldd-form-field')
export class NLDDFormField extends LitElement {
	static override styles = formFieldStyles;

	/**
	 * Controls how the label is positioned relative to the input.
	 *  - 'top'   : label above the input (default)
	 *  - 'right' : 240 px column, right-aligned text
	 *  - 'left'  : 240 px column, left-aligned text
	 *
	 * Collapses to 'top' automatically when the container is < 640 px wide.
	 *
	 * Default is `undefined` (and not `'top'`) so Lit doesn't reflect the
	 * default value to the attribute on first update. That keeps the
	 * "no own value set" state visible to CSS as `:not([label-alignment])`,
	 * which the form-label-alignment fallback selectors rely on. Visually
	 * `undefined` and `'top'` render identically (no `[label-alignment]`
	 * rules apply for either).
	 */
	@property({ type: String, attribute: 'label-alignment', reflect: true })
	labelAlignment: LabelAlignment | undefined = undefined;

	/** Label text. When empty no label is rendered but side-alignment indent is preserved. */
	@property({ type: String })
	label = '';

	/**
	 * Short supporting text shown below the label. Same typography as the
	 * optional badge. Use nldd-form-field-help-text for longer descriptive text.
	 */
	@property({ type: String, attribute: 'supporting-label' })
	supportingLabel = '';

	/**
	 * When true an "Optional" badge is shown next to the label.
	 * Required fields are intentionally left unmarked per design spec.
	 *
	 * Note: nldd-form-field does not auto-propagate `required` or `aria-required`
	 * to the slotted input. If the field is required, set `required` directly
	 * on the slotted input element so screen readers announce it correctly.
	 */
	@property({ type: Boolean })
	optional = false;

	/** Label text for the optional badge. Defaults to 'Optioneel'. Override for localisation. */
	@property({ type: String, attribute: 'optional-label' })
	optionalLabel = 'Optioneel';

	private _childObserver: MutationObserver | null = null;

	/** The last label this field wrote onto the control, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	/** Keeps the "no input found" warning to one per field rather than one per mutation. */
	private _warnedNoInput = false;

	override render() {
		return formFieldTemplate(this);
	}

	override updated(changed: Map<PropertyKey, unknown>) {
		if (changed.has('label')) {
			this._onSlotChange();
		}
	}

	override connectedCallback() {
		super.connectedCallback();
		this._childObserver = new MutationObserver(() => this._onSlotChange());
		this._childObserver.observe(this, { childList: true });
	}

	override firstUpdated() {
		this._onSlotChange();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._childObserver?.disconnect();
	}

	/**
	 * Called when the label is clicked — focuses the slotted input.
	 *
	 * The label carries no `for` and does not wrap the control, which sits in
	 * the slot beside it, so it labels nothing as far as the platform is
	 * concerned and has no activation behavior to suppress. Focus is moved by
	 * hand instead. This is a field caption, not a control label: it never
	 * toggles a checkbox or picks a radio, because every one of those carries
	 * its own label, and a caption over a group could not say which one it
	 * meant anyway.
	 *
	 * Reaching the control relies on it being focusable: a native input, or a
	 * component with its own `focus()` or `delegatesFocus`. Components that
	 * wrap a control owe consumers that `focus()`.
	 */
	public _focusInput(e: Event) {
		const input = this._findInput();
		if (!input) return;

		e.preventDefault();
		(input as HTMLElement).focus();
	}

	private _onSlotChange() {
		const input = this._findInput();
		if (!input) {
			// Only once there is something to look at. An empty field is usually one
			// still being filled, and a component that forgot `static isFormInput`
			// should be the one that stands out.
			const hasContent = Array.from(this.children)
				.some(el => !HELPER_TAGS.includes(el.tagName.toLowerCase()));
			if (import.meta.env?.DEV && hasContent && !this._warnedNoInput) {
				this._warnedNoInput = true;
				const which = this.label ? ` (label="${this.label}")` : '';
				console.warn(`<nldd-form-field>${which}: No form input found among its children. The label cannot name anything or move focus into it. Every nldd input carries \`static isFormInput = true\`; a component of your own says the same, or names its control itself.`);
			}
			return;
		}
		this._warnedNoInput = false;

		// Ensure the inner native input has an id so aria-describedby can reference it.
		// `inputId` is a component that hands out the id of the control it renders, which
		// is a different question from how it wants to be named, so it is asked separately
		// (see _applyAccessibleLabel). For plain <input> elements we set the id directly.
		// We never set the host element's id to avoid duplicate IDs.
		if ('inputId' in input) {
			const existingId = (input as HTMLElement & { inputId: string }).inputId;
			const generatedId = existingId || generateId();
			(input as HTMLElement & { inputId: string }).inputId = generatedId;
		} else {
			if (!input.id) input.id = generateId();
		}

		this._applyAccessibleLabel(input);
		this._adoptValidationLists(input);
		this._syncDescription();
	}

	/**
	 * Hands the label to the control as its accessible name, through whichever
	 * channel the control offers.
	 *
	 * It has to be handed over rather than referenced. `for` and
	 * `aria-labelledby` are IDREFs and an IDREF only resolves inside its own
	 * tree, so a label in this shadow root cannot point at a control in the
	 * consumer's light DOM.
	 *
	 * Which channel is a question about the control, not about its element
	 * kind, and those two came apart. `accessible-label` is the naming channel
	 * of this system: a component that has it forwards the name to whatever it
	 * renders inside. A native `<input>` takes `aria-label`. A component with
	 * neither carries a visible label of its own (`nldd-checkbox-field` and its
	 * siblings), and that label already names the control. Overwriting it would
	 * replace "Nieuwsbrief" with the caption above it, so those are left alone.
	 *
	 * The caption fills a gap, it does not overrule. A name set on the control
	 * itself is the more specific one, so this field leaves it alone and never
	 * takes back what it did not write.
	 */
	private _applyAccessibleLabel(input: Element): void {
		const attribute = 'accessibleLabel' in input
			? 'accessible-label'
			: input instanceof HTMLInputElement
				|| input instanceof HTMLSelectElement
				|| input instanceof HTMLTextAreaElement
				? 'aria-label'
				: null;
		if (!attribute) return;

		this._appliedLabel = setOwnedAttribute(input, attribute, this.label, this._appliedLabel);
	}

	/**
	 * Hands every validation list in this field the control it is about, so it
	 * does not have to go looking for one.
	 *
	 * A list with a `for` of its own is left alone: that is how you say it is
	 * about a different control than the first.
	 *
	 * More than one control in a field is allowed and sometimes right, a radio
	 * group with an "Anders" text field beside it being the case this component
	 * is built for. But a list that reads a value would then quietly read the
	 * wrong one, and nothing on screen would show it: the rules simply never
	 * match. Say so once, where it can still be fixed.
	 */
	private _adoptValidationLists(input: Element): void {
		const lists = Array.from(this.children)
			.filter((el): el is HTMLElement & { control: Element | null } =>
				el.tagName.toLowerCase() === 'nldd-validation-list');
		if (!lists.length) return;

		for (const list of lists) {
			if (!list.getAttribute('for')) list.control = input;
		}

		if (!import.meta.env?.DEV) return;
		const controls = Array.from(this.children)
			.filter(el => !HELPER_TAGS.includes(el.tagName.toLowerCase()) && isFormInput(el));
		if (controls.length < 2) return;

		const readsValue = lists.some(list => !list.getAttribute('for') && Array.from(list.children)
			.some(item => item.hasAttribute('match') || item.hasAttribute('minlength') || item.hasAttribute('maxlength')));
		if (!readsValue) return;

		const which = this.label ? ` (label="${this.label}")` : '';
		console.warn(
			`<nldd-form-field>${which}: more than one control, and the validation list has rules that read a value. `
			+ `It is reading <${input.localName}>, the first one. Set \`for\` on the list if it should read another.`,
		);
	}

	/**
	 * The input this field is about: the first one in the light DOM, wrapped or
	 * not.
	 *
	 * A field may hold more than one. A radio group whose last option is
	 * "Anders" and the text field that appears with it are one question and
	 * belong in one field. The first input carries the caption, and the ones
	 * after it name themselves.
	 *
	 * Looking inside matters because a `div` or an `nldd-container` around your
	 * input is a normal thing to write. Stopping at that wrapper sent the id,
	 * the name and the error wiring to the wrapper and left the field unnamed,
	 * with nothing about it visible on screen.
	 *
	 * Finding nothing is a real answer: the field then wires up nothing at all
	 * and says so in DEV, rather than picking whatever came first and quietly
	 * treating a tag or a button as your input.
	 */
	private _findInput(): Element | undefined {
		const children = Array.from(this.children)
			.filter(el => !HELPER_TAGS.includes(el.tagName.toLowerCase()));
		for (const child of children) {
			if (isFormInput(child)) return child;
			const nested = Array.from(child.querySelectorAll('*')).find(isFormInput);
			if (nested) return nested;
		}
		return undefined;
	}

	/**
	 * Hands the control the elements that describe it.
	 *
	 * Elements and not ids. An IDREF resolves inside the tree of the element
	 * that carries it, so an id written here cannot be found from inside a
	 * component's shadow root: the attribute lands, the id is right, and the
	 * description comes out empty. A control that renders its own input takes
	 * `describedByElements` and puts the references where they belong; anything
	 * that is the control itself, a native input or a host with a role of its
	 * own, is pointed at directly.
	 *
	 * The list once, not each of its items. The items come and go while you
	 * type, and a description rewritten per keystroke is a lot of churn in
	 * something assistive software is reading. A hidden item counts for nothing
	 * in the description, so one reference gives exactly what is on screen, and
	 * this never has to run again when the value changes.
	 *
	 * The requirements before the plain help text: what is wrong is why you are
	 * here.
	 */
	private _syncDescription() {
		const input = this._findInput();
		if (!input) return;

		const children = Array.from(this.children);
		const tag = (el: Element) => el.tagName.toLowerCase();
		const describedBy = [
			...children.filter(el => tag(el) === 'nldd-validation-list'),
			...children.filter(el => tag(el) === 'nldd-form-field-help-text'),
		];

		if ('describedByElements' in input) {
			(input as unknown as DescribedElement).describedByElements = describedBy;
		} else {
			applyDescribedBy(input, describedBy);
		}
	}
}


/* ============================================================
   nldd-form-field-help-text
   ============================================================ */

@customElement('nldd-form-field-help-text')
export class NLDDFormFieldHelpText extends LitElement {
	static override styles = formFieldHelpTextStyles;

	override connectedCallback() {
		super.connectedCallback();
		// Assign to the 'help' slot automatically so consumers don't need to set slot="help" manually.
		// Note: this will overwrite any explicit slot attribute set by the consumer.
		this.slot = 'help';
	}

	override render() {
		return formFieldHelpTextTemplate(this);
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-field': NLDDFormField;
		'nldd-form-field-help-text': NLDDFormFieldHelpText;
	}
}
