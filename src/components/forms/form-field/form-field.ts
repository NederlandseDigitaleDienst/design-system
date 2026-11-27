/**
 * Nederlandse Digitale Dienst Form Field Component (Lit + TypeScript)
 *
 * A field around one input: its label, supporting label, optional badge,
 * validation and help text. It finds the input among its children, hands it
 * the label as its accessible name and gives it an id, so you write no `for`
 * or `id` yourself. An input that is defined later, as the autoloader does,
 * or that appears later inside a wrapper, is found when it arrives. The input
 * is the first one it finds, leaving out what sits in an nldd-toolbar inside
 * the field: a toolbar works on the field, such as the formatting bar above an
 * nldd-text-editor, and is never the field itself. A native `for` cannot cross
 * a shadow boundary, so a click on the label focuses the input from script.
 *
 * Mark the optional fields with `optional`, not the required ones; the design
 * guidelines say why. Put the requirements on a value in an
 * nldd-validation-list inside the same field. What only your server knows,
 * such as a password found in a breach, the app names in `unmet` on the input
 * itself: see nldd-validation-list. The field hands the list its input and puts
 * the list in the input's accessible description, before the help text. A list
 * with a `for` of its own describes the control it names instead.
 *
 * Plain help text goes in `help-text`. Help text with more in it, such as a
 * link, goes in an nldd-text in the `help-text` slot. The field gives that
 * nldd-text its size, color and weight, so every help text looks the same.
 *
 * The accessible name is the label, followed by "optioneel" when the field is
 * `optional`. The accessible description is what is wrong first, then the help
 * text in the slot, then the supporting label and `help-text`. Those last two
 * are text in the field itself, and a control that carries its own role, such
 * as a radio group or a native input, can only take text as
 * `aria-description`: a browser reads that only while nothing else describes
 * the control, so not while an error shows.
 *
 * @element nldd-form-field
 * @keywords veld, label
 *
 * @attr {'top'|'right'|'left'} label-alignment - 'top' (default) | 'right' | 'left'. A value of its own wins over the one of a wrapping nldd-form.
 * @attr {string} label - Field label text. Omit for no-label layout. Supports **bold** markdown syntax, for the word to type in a confirmation; the accessible name of the control takes the text without the markers.
 * @attr {string} supporting-label - Short supporting text below the label. Same typography as optional badge. Supports **bold** markdown syntax. Read as part of the accessible description of the input.
 * @attr {string} help-text - Help text below the input, as plain text. Supports **bold** markdown syntax. Read as part of the accessible description of the input, after the validation and the supporting label. Help text with a link goes in the `help-text` slot, which takes its place.
 * @attr {boolean} optional - Shows an optional badge next to the label, and adds it to the accessible name of the input. Its text is the translation key `components.form-field.optional-label` ("Optioneel"); the name is `components.form-field.optional-accessible-label` ("{label}, optioneel").
 * @attr {object} translations - Override translation keys, such as the text of the optional badge; unset keys fall back to Dutch
 *
 * @slot - The slotted input (e.g. nldd-text-field) and its nldd-validation-list.
 * @slot help-text - Help text with more than plain text in it, such as a link: an nldd-text. The field sets its `size`, `color` and `weight`. Takes the place of `help-text`.
 *
 * @example
 * <nldd-form-field label="Password">
 *   <nldd-password-field invalid></nldd-password-field>
 *   <nldd-validation-list>
 *     <nldd-validation-item id="password-required" required>This field is required.</nldd-validation-item>
 *     <nldd-validation-item id="password-length" minlength="8">Must be at least 8 characters.</nldd-validation-item>
 *   </nldd-validation-list>
 *   <nldd-text slot="help-text">
 *     <p>We only use this to sign you in. <a href="/help">Learn more</a>.</p>
 *   </nldd-text>
 * </nldd-form-field>
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { stripBold } from '../../../utilities/render-marked.js';
import { applyDescribedBy, type DescribedElement } from '../../../utilities/described-by-mixin.js';
import { formFieldStyles } from './form-field.styles.js';
import { formFieldTemplate } from './form-field.template.js';
import { setState, styleValueState } from '../../../utilities/element-state.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddFormFieldTranslations } from './form-field.i18n.js';

export type LabelAlignment = 'top' | 'left' | 'right';

/** Help text in the `help-text` slot, which is never the input. */
const isHelpText = (el: Element): boolean => el.getAttribute('slot') === 'help-text';

/**
 * What the field sets on an nldd-text in its `help-text` slot. One look for
 * every help text: the size and weight of body text a step down, in the color
 * of the text around it.
 *
 * Properties and not attributes: nldd-text writes no attribute for a default
 * value, so an attribute set to one is taken away again. A property set before
 * the nldd-text is defined is picked up by Lit when it upgrades.
 */
const HELP_TEXT_PROPERTIES = { size: 'sm', color: 'content', weight: 'regular' } as const;

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
	// A hidden input has no box and no place in the accessibility tree, so a
	// label or a description on it reaches no one. Server-rendered forms put
	// them beside the control (a Django formset's counters).
	return (el instanceof HTMLInputElement && el.type !== 'hidden')
		|| el instanceof HTMLSelectElement
		|| el instanceof HTMLTextAreaElement
		|| (el.constructor as { isFormInput?: boolean }).isFormInput === true;
}

const isToolbar = (el: Element): boolean => el.tagName.toLowerCase() === 'nldd-toolbar';

/** Whether a toolbar sits between `el` and `top`, a child of the field. */
function inToolbar(el: Element, top: Element): boolean {
	for (let node = el.parentElement; node && node !== top; node = node.parentElement) {
		if (isToolbar(node)) return true;
	}
	return false;
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

/** A validation list as the field sees it: it says when one of its items shows or hides. */
type ValidationListHost = HTMLElement & { onItemVisibilityChange: (() => void) | null };

@customElement('nldd-form-field')
export class NLDDFormField extends withTranslations(LitElement, nlddFormFieldTranslations) {
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
	 * which the alignment inherited from nldd-form relies on. Visually
	 * `undefined` and `'top'` render identically (no `[label-alignment]`
	 * rules apply for either).
	 */
	@property({ type: String, attribute: 'label-alignment', reflect: true })
	labelAlignment: LabelAlignment | undefined = undefined;

	/** @internal Set by a wrapping nldd-form: its `label-alignment`. No attribute:
	 *  the styles read it as `:state(form-label-left)` or `:state(form-label-right)`,
	 *  and a `label-alignment` of its own wins. */
	@property({ attribute: false })
	formLabelAlignment: LabelAlignment | undefined = undefined;

	/** Label text. When empty no label is rendered but side-alignment indent is preserved. */
	@property({ type: String })
	label = '';

	/**
	 * Short supporting text shown below the label. Same typography as the
	 * optional badge. Use `help-text` for longer descriptive text.
	 */
	@property({ type: String, attribute: 'supporting-label' })
	supportingLabel = '';

	/** Plain help text below the input. Help text with a link goes in the `help-text` slot. */
	@property({ type: String, attribute: 'help-text' })
	helpText = '';

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

	private _childObserver: MutationObserver | null = null;
	/** Watches the validation lists for items that come or go. */
	private _listObserver: MutationObserver | null = null;
	/** Handed to each validation list, which calls it when an item shows or hides. */
	private _onItemVisibilityChange = () => this._syncDescription();
	/** The lists that hold that callback now, to take it back from. */
	private _watchedLists: ValidationListHost[] = [];

	/** The last label this field wrote onto the control, so it only takes back its own. */
	private _appliedLabel: string | null = null;
	/** The aria-description this field wrote onto a control without the DescribedBy channel. */
	private _appliedDescription: string | null = null;
	/** The control this field is about now, to hand back what it wrote when that changes. */
	private _input: Element | null = null;
	/** Controls other than the input that a validation list with `for` describes. */
	private _describedOthers = new Set<Element>();
	/** Tags of children that are not defined yet, waited for once each. */
	private _pendingTags = new Set<string>();

	override render() {
		return formFieldTemplate(this);
	}

	override updated(changed: Map<PropertyKey, unknown>) {
		if (changed.has('label') || changed.has('optional') || changed.has('translations')) {
			this._onSlotChange();
		} else if (changed.has('supportingLabel') || changed.has('helpText')) {
			this._syncDescription();
		}
	}

	override willUpdate(changed: Map<string, unknown>) {
		super.willUpdate(changed);
		if (changed.has('formLabelAlignment')) styleValueState(this, 'form-label', this.formLabelAlignment, ['left', 'right']);
	}

	override connectedCallback() {
		super.connectedCallback();
		// The whole subtree: an input that appears later inside a wrapper (a `v-if`
		// in a `div`) is as much the field's input as a direct child.
		// And help text that is hidden or shown: a hidden element that is referenced
		// is still read out.
		this._childObserver = new MutationObserver((mutations) => {
			const moved = mutations.some(m => m.attributeName === 'slot'
				|| [...m.addedNodes, ...m.removedNodes].some(n => n.nodeType === Node.ELEMENT_NODE));
			if (moved) this._onSlotChange();
			else if (mutations.some(m => m.attributeName === 'hidden' && isHelpText(m.target as Element))) this._syncDescription();
		});
		this._childObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['slot', 'hidden'] });
		// Moved in the DOM: `firstUpdated` does not come again, and the observer
		// on the validation lists only starts from here.
		if (this.hasUpdated) this._onSlotChange();
	}

	override firstUpdated() {
		this._onSlotChange();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._childObserver?.disconnect();
		this._listObserver?.disconnect();
		this._watchLists([]);
	}

	/**
	 * Waits for each child that is not defined yet, and looks again once it is.
	 *
	 * Whether an element is an input is asked of its class, and an element whose
	 * class is not registered yet has none to ask. The autoloader defines tags in
	 * the order it meets them, so the field is often defined before its input.
	 * Upgrading an element fires no mutation and no `slotchange`, so without this
	 * the field never looks again (#512).
	 */
	private _awaitUndefined(): void {
		for (const el of Array.from(this.querySelectorAll(':not(:defined)'))) {
			const tag = el.localName;
			if (this._pendingTags.has(tag)) continue;
			this._pendingTags.add(tag);
			customElements.whenDefined(tag).then(() => {
				this._pendingTags.delete(tag);
				if (this.isConnected) this._onSlotChange();
			});
		}
	}

	/** Hands back what this field wrote on a control it is no longer about. */
	private _release(control: Element): void {
		const attribute = this._labelAttribute(control);
		if (attribute) setOwnedAttribute(control, attribute, '', this._appliedLabel);
		this._appliedLabel = null;
		this._describe(control, [], []);
		this._appliedDescription = null;
	}

	/** Hands the visibility callback to these lists, and takes it back from the others. */
	private _watchLists(lists: ValidationListHost[]): void {
		for (const list of this._watchedLists) {
			if (!lists.includes(list) && list.onItemVisibilityChange === this._onItemVisibilityChange) list.onItemVisibilityChange = null;
		}
		for (const list of lists) list.onItemVisibilityChange = this._onItemVisibilityChange;
		this._watchedLists = lists;
	}

	/**
	 * Called when the label is clicked. Focuses the slotted input.
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
		this._awaitUndefined();
		for (const help of this._helpTexts()) {
			if (help.localName !== 'nldd-text') continue;
			Object.assign(help, HELP_TEXT_PROPERTIES);
		}
		const input = this._findInput();
		// A consumer's own element can be an input too, which no selector can know.
		setState(this, 'has-input', Boolean(input));
		if (this._input && this._input !== input) this._release(this._input);
		this._input = input ?? null;
		if (!input) {
			this._syncDescription();
			return;
		}

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
		const attribute = this._labelAttribute(input);
		if (!attribute) return;

		this._appliedLabel = setOwnedAttribute(input, attribute, this._accessibleName(), this._appliedLabel);
	}

	/** The attribute through which this control takes a name, or null for one that names itself. */
	private _labelAttribute(input: Element): string | null {
		return 'accessibleLabel' in input
			? 'accessible-label'
			: input instanceof HTMLInputElement
				|| input instanceof HTMLSelectElement
				|| input instanceof HTMLTextAreaElement
				? 'aria-label'
				: null;
	}

	/**
	 * The label as a name: without its markers, and with "optioneel" after it
	 * when the field is optional.
	 *
	 * The badge is on screen beside the label, and a screen reader user needs it
	 * as much. In the name and not the description: a description is read later
	 * or not at all, depending on the reader's settings, while the name is read
	 * every time the field is reached. This field composes the name as a string
	 * anyway, so where the badge sits in the layout makes no difference.
	 */
	private _accessibleName(): string {
		const label = stripBold(this.label);
		if (!label || !this.optional) return label;
		return this._t('components.form-field.optional-accessible-label', { label });
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
	 * match.
	 */
	private _adoptValidationLists(input: Element): void {
		const lists = Array.from(this.children)
			.filter((el): el is HTMLElement & { control: Element | null } =>
				el.tagName.toLowerCase() === 'nldd-validation-list');
		for (const list of lists) {
			if (!list.getAttribute('for')) list.control = input;
		}
		if (!import.meta.env?.DEV) return;

		const readsValue = lists.some(list => !list.getAttribute('for') && Array.from(list.children)
			.some(item => item.hasAttribute('match') || item.hasAttribute('minlength') || item.hasAttribute('maxlength')));
		const controls = Array.from(this.children)
			.filter(el => !isHelpText(el) && isFormInput(el));
		setState(this, 'list-reads-first-control', readsValue && controls.length > 1);
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
			.filter(el => !isHelpText(el) && !isToolbar(el));
		for (const child of children) {
			if (isFormInput(child)) return child;
			const nested = Array.from(child.querySelectorAll('*')).find(el => isFormInput(el) && !inToolbar(el, child));
			if (nested) return nested;
		}
		return undefined;
	}

	/**
	 * Hands each control the elements that describe it.
	 *
	 * Elements and not ids. An IDREF resolves inside the tree of the element
	 * that carries it, so an id written here cannot be found from inside a
	 * component's shadow root: the attribute lands, the id is right, and the
	 * description comes out empty. A control that renders its own input takes
	 * `describedByElements` and puts the references where they belong; anything
	 * that is the control itself, a native input or a host with a role of its
	 * own, is pointed at directly.
	 *
	 * The items of a validation list that are on screen, not the list. Safari
	 * passes nothing on to VoiceOver for an element whose text sits in a
	 * `role="list"`, which the list renders, so a reference to the list was an
	 * empty description there. Only the visible items, because an element
	 * referenced directly is read even while it is hidden: a met requirement
	 * would still be read out. The references change when an item shows or
	 * hides, which is when the description changes anyway.
	 *
	 * A list with a `for` describes the control it names, and the input of the
	 * field only through the lists without one. The "Anders" field beside a
	 * radio group carries its own error; handing that to the group read it out
	 * on the wrong control and left the field that was wrong without it (#415).
	 *
	 * The supporting label and `help-text` sit in this shadow root, where no
	 * reference from the control can reach them, so they go over as text. Help
	 * text in the slot is in the light DOM and goes over as an element, which
	 * every control can point at: a host that carries its own role, such as a
	 * radio group, says text only as `aria-description`, and a browser drops
	 * that as soon as there is an `aria-describedby`.
	 *
	 * What is wrong first: it is why you are here. Then the help text, with the
	 * supporting label and `help-text` after the elements.
	 */
	private _syncDescription() {
		const input = this._input;

		const children = Array.from(this.children);
		const tag = (el: Element) => el.tagName.toLowerCase();
		const lists = children.filter(el => tag(el) === 'nldd-validation-list');
		this._listObserver ??= new MutationObserver(() => this._syncDescription());
		this._listObserver.disconnect();
		for (const list of lists) this._listObserver.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['for'] });
		this._watchLists(lists as ValidationListHost[]);

		const root = this.getRootNode() as Document | ShadowRoot;
		const visibleItems = (list: Element) => Array.from(list.children)
			.filter(el => tag(el) === 'nldd-validation-item' && (el as HTMLElement & { visible?: boolean }).visible);
		const byControl = new Map<Element, Element[]>();
		for (const list of lists) {
			const id = list.getAttribute('for');
			const control = id ? root.getElementById?.(id) ?? null : input;
			if (!control) continue;
			byControl.set(control, [...(byControl.get(control) ?? []), ...visibleItems(list)]);
		}

		for (const control of this._describedOthers) {
			if (control !== input && !byControl.has(control)) this._describe(control, []);
		}
		this._describedOthers = new Set([...byControl.keys()].filter(control => control !== input));
		for (const control of this._describedOthers) this._describe(control, byControl.get(control) ?? []);

		if (!input) return;
		// Help text in the slot takes the place of `help-text`, also while it is hidden.
		const slotted = this._helpTexts();
		const help = slotted.filter(el => !(el as HTMLElement).hidden);
		const texts = [stripBold(this.supportingLabel), slotted.length ? '' : stripBold(this.helpText)].map(text => text.trim()).filter(Boolean);
		this._describe(input, [...(byControl.get(input) ?? []), ...help], texts);
	}

	/** The elements in the `help-text` slot. */
	private _helpTexts(): Element[] {
		return Array.from(this.children).filter(isHelpText);
	}

	/**
	 * Hands one control its description: elements to point at and, for the
	 * input of the field, texts to say. Texts left out leave what the control
	 * says alone, so a control that only a list with `for` describes keeps an
	 * `aria-description` of its own.
	 *
	 * Only what changed is written: a control renders on each new array, and
	 * one that adds a child of its own on render would otherwise set off the
	 * observer on this field again.
	 */
	private _describe(control: Element, elements: readonly Element[], texts?: readonly string[]): void {
		if ('describedByElements' in control) {
			const described = control as unknown as DescribedElement;
			if (!sameItems(described.describedByElements, elements)) described.describedByElements = [...elements];
			if (texts && 'describedByTexts' in control && !sameItems(described.describedByTexts, texts)) described.describedByTexts = [...texts];
			return;
		}
		applyDescribedBy(control, elements);
		// Not every browser reflects `ariaDescription`, so the attribute. Support
		// for it is not complete everywhere; a native input in a field is rare,
		// and every input of this system takes the texts as elements instead.
		if (texts) this._appliedDescription = setOwnedAttribute(control, 'aria-description', texts.join(' '), this._appliedDescription);
	}
}

/** Whether two lists hold the same items in the same order. */
function sameItems<T>(a: readonly T[] | undefined, b: readonly T[]): boolean {
	return Boolean(a) && a!.length === b.length && a!.every((item, i) => item === b[i]);
}


declare global {
	interface HTMLElementTagNameMap {
		'nldd-form-field': NLDDFormField;
	}
}
