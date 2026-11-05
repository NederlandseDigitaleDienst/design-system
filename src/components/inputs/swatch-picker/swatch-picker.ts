/**
 * Nederlandse Digitale Dienst Swatch Picker Component (Lit + TypeScript)
 *
 * A row of swatches to choose one from: a color, or an image of a pattern or a
 * material. The row wraps onto the next line when the swatches do not fit.
 *
 * It is a radio group: Tab enters and leaves it in one stop, the arrow keys
 * choose, and the value goes with a form under `name`. The chosen swatch shows
 * a check mark. Put it in an `nldd-form-field`, which names the group.
 *
 * Every swatch needs a name, since a color or an image says nothing to a screen
 * reader. A swatch with a category `color` takes the name of that color from
 * the translations ("Rood"); one with a `custom-color` or an `image` has to say
 * it in `text`. The name shows as a tooltip.
 *
 * Exports both NLDDSwatchPicker and NLDDSwatchPickerItem.
 *
 * @element nldd-swatch-picker
 * @attr {string} size - Swatch size, on the control scale: 'xs' (24px) | 'sm' (32px) | 'md' (44px) (default: 'md')
 * @attr {string} accessible-label - Accessible name for the group, set as aria-label. In an nldd-form-field the field names it.
 * @attr {string} accessible-labeled-by - Id of an external label element, set as aria-labelledby on the group
 * @attr {boolean} invalid - Marks the group as invalid. Announced with aria-invalid; nothing is drawn for it.
 * @attr {boolean} disabled - Disabled state for all swatches
 * @attr {string} name - Name for form submission
 * @attr {string} value - Value of the chosen swatch
 * @attr {boolean} required - Something has to be chosen
 *
 * @fires change - When the choice changes; detail: { value: string }
 *
 * @slot - nldd-swatch-picker-item elements
 *
 * ---
 *
 * @element nldd-swatch-picker-item
 * @attr {string} color - Category color: 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw' | 'paars' | 'violet' | 'robijnrood' | 'roze' | 'rood' | 'oranje' | 'donkergeel' | 'geel' | 'donkerbruin' | 'bruin' | 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen'. Brings its name along, so `text` is optional.
 * @attr {string} custom-color - Any CSS color of your own (e.g. '#7a1f3d' or 'var(--brand-color)'), for a color outside the categories. Needs `text`.
 * @attr {string} image - URL of an image that fills the swatch, for a pattern or a material. Needs `text`.
 * @attr {string} image-srcset - Sources of the image at other pixel densities, with x descriptors (e.g. '/oak.jpg 1x, /oak@2x.jpg 2x'). The swatch has a fixed size, so there are no widths to choose from.
 * @attr {string} text - Name of the swatch, for screen readers and the tooltip. Overrides the name of a category `color`.
 * @attr {boolean} selected - Whether this swatch is chosen (set by the picker)
 * @attr {boolean} disabled - Disabled state
 * @attr {string} value - Value for this swatch
 * @attr {string} size - Swatch size: 'xs' | 'sm' | 'md' (set by the picker, default: 'md')
 * @attr {object} translations - Override translation keys (the names of the category colors); unset keys fall back to Dutch.
 */
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { radioPositions, type RadioPosition } from '../../../utilities/radio-position.js';
import { setOwnedAttribute } from '../../../utilities/owned-attribute.js';
import { submitOnEnter } from '../../../utilities/implicit-submission.js';
import { deferFocus } from '../../../utilities/defer-focus.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import type { NLDDTooltip } from '../../content/tooltip/tooltip.js';
import { swatchPickerStyles, swatchPickerItemStyles } from './swatch-picker.styles.js';
import { swatchPickerTemplate, swatchPickerItemTemplate } from './swatch-picker.template.js';
import { nlddSwatchPickerItemTranslations, type NLDDSwatchPickerItemTranslations } from './swatch-picker.i18n.js';
import '../../content/icon/icon.js';

/** How long the name stays after a tap, in ms. */
const NAME_AFTER_TAP_MS = 1500;

export type SwatchPickerSize = 'xs' | 'sm' | 'md';
export type SwatchColor = 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw' | 'paars' | 'violet' | 'robijnrood' | 'roze' | 'rood' | 'oranje' | 'donkergeel' | 'geel' | 'donkerbruin' | 'bruin' | 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen';


// # nldd-swatch-picker-item

@customElement('nldd-swatch-picker-item')
export class NLDDSwatchPickerItem extends withTranslations(LitElement, nlddSwatchPickerItemTranslations) {
	static override styles = swatchPickerItemStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	color: SwatchColor | '' = '';

	@property({ reflect: true, attribute: 'custom-color', converter: reflectNonDefault<string>('') })
	customColor = '';

	@property({ type: String })
	image = '';

	@property({ type: String, attribute: 'image-srcset' })
	imageSrcset = '';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: Boolean, reflect: true })
	selected = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: String })
	value = '';

	/** Set by nldd-swatch-picker. Not part of the public API. */
	@property({ reflect: true, converter: reflectNonDefault<SwatchPickerSize>('md') })
	size: SwatchPickerSize = 'md';

	/** Set by nldd-swatch-picker: this swatch's place in the group, which it
	 *  cannot count by itself. */
	@state()
	_groupPosition: RadioPosition | null = null;

	/** The aria-label this swatch wrote on itself, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	/** Ends the name shown after a tap. */
	private _nameTimer = 0;

	/** The pointer of the last press, so a click knows how to keep the name. */
	private _pointerType = '';

	/** The name of the swatch: its own text, or that of its category color. */
	get _name(): string {
		if (this.text) return this.text;
		if (!this.color) return '';
		return this._t(`components.swatch-picker-item.${this.color}-text` as keyof NLDDSwatchPickerItemTranslations);
	}

	override connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('pointerdown', this._onPointerDown);
		this.addEventListener('pointerleave', this._onPointerLeave);
		this.addEventListener('click', this._onClick);
		this.addEventListener('keydown', this._onKeyDown);
		this.addEventListener('focus', this._onFocus);
		this.addEventListener('blur', this._onBlur);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('pointerdown', this._onPointerDown);
		this.removeEventListener('pointerleave', this._onPointerLeave);
		this.removeEventListener('click', this._onClick);
		this.removeEventListener('keydown', this._onKeyDown);
		this.removeEventListener('focus', this._onFocus);
		this.removeEventListener('blur', this._onBlur);
		this._hideName();
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has('customColor')) {
			if (this.customColor && CSS.supports('color', this.customColor)) {
				this.style.setProperty('--_swatch-picker-item-custom-color', this.customColor);
			} else {
				this.style.removeProperty('--_swatch-picker-item-custom-color');
			}
		}
		this._syncAria();
	}

	/**
	 * The swatch is the radio itself. A native radio in a shadow root of its own
	 * is a group of one: a screen reader counts it as "1 of 1" and Tab stops at
	 * every option. The role on the element puts the group back in one tree,
	 * under the radiogroup the picker carries.
	 */
	private _syncAria(): void {
		this.setAttribute('role', 'radio');
		this.setAttribute('aria-checked', String(this.selected));
		this._appliedLabel = setOwnedAttribute(this, 'aria-label', this._name, this._appliedLabel);
		if (this.disabled) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');
		const position = this._groupPosition;
		if (position) {
			this.setAttribute('aria-posinset', String(position.posInSet));
			this.setAttribute('aria-setsize', String(position.setSize));
		} else {
			this.removeAttribute('aria-posinset');
			this.removeAttribute('aria-setsize');
		}
		// A disabled option is not in the tab order, as a native one is not.
		const tabbable = !this.disabled && position?.tabbable !== false;
		this.setAttribute('tabindex', tabbable ? '0' : '-1');
	}

	/** The tooltip, which shows itself when focus moves into it. The focus is on
	 *  this element, outside it, so it hears about focus from here. */
	private get _tooltip(): NLDDTooltip | null {
		return this.shadowRoot?.querySelector('nldd-tooltip') ?? null;
	}

	private _onFocus = (): void => {
		this._tooltip?._handleFocusIn();
	};

	private _onBlur = (): void => {
		this._tooltip?._handleTriggerLeave();
	};

	/** Chosen, the way a click, the space bar or an arrow key in the group does
	 *  it. A radio never unchecks itself, so a chosen swatch says nothing.
	 *
	 *  @internal */
	public _select(): void {
		if (this.disabled || this.selected) return;
		this.dispatchEvent(new CustomEvent('item-change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	}

	private _onClick = (): void => {
		this._select();
		this._showName();
	};

	private _onPointerDown = (e: PointerEvent): void => {
		this._pointerType = e.pointerType;
		// Before the click, which closes a tooltip that is not held open: held
		// already, the hovered name stays where it is instead of flickering.
		if (e.pointerType !== 'touch') this._showName();
	};

	private _onPointerLeave = (e: PointerEvent): void => {
		if (e.pointerType !== 'touch') this._hideName();
	};

	/**
	 * Keeps the name in view after a click or a tap: a click hides a tooltip,
	 * and a tap never shows one, while the name is the only label a swatch has.
	 * After a click it stays until the pointer leaves the swatch. After a tap it
	 * stays a moment, clear of the finger.
	 */
	private _showName(): void {
		const tooltip = this._tooltip;
		if (!tooltip || !this._name) return;
		// One name at a time: a tap on the next swatch closes the one before,
		// which would otherwise stay for the rest of its moment.
		this.closest('nldd-swatch-picker')
			?.querySelectorAll<NLDDSwatchPickerItem>('nldd-swatch-picker-item')
			.forEach((item) => { if (item !== this) item._hideName(); });
		tooltip.open = true;
		clearTimeout(this._nameTimer);
		this._nameTimer = this._pointerType === 'touch'
			? window.setTimeout(() => this._hideName(), NAME_AFTER_TAP_MS)
			: 0;
		// Held for the pointer, so it goes the way a hover does: on a scroll too.
		document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
	}

	private _onScroll = (): void => {
		this._hideName();
	};

	private _hideName(): void {
		document.removeEventListener('scroll', this._onScroll, { capture: true });
		clearTimeout(this._nameTimer);
		this._nameTimer = 0;
		const tooltip = this._tooltip;
		if (tooltip) tooltip.open = false;
	}

	private _onKeyDown = (e: KeyboardEvent): void => {
		if (this.disabled) return;
		// Space is the key a radio answers to itself. The arrow keys and Enter
		// belong to the group: it knows the form.
		if (e.key === ' ') {
			e.preventDefault();
			this._select();
		}
	};

	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		super.focus(options);
	}

	override render() {
		return swatchPickerItemTemplate(this);
	}
}


// # nldd-swatch-picker

@customElement('nldd-swatch-picker')
export class NLDDSwatchPicker extends FormAssociated(LitElement) {
	static override styles = swatchPickerStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	@property({ reflect: true, converter: reflectNonDefault<SwatchPickerSize>('md') })
	size: SwatchPickerSize = 'md';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: String, attribute: 'accessible-labeled-by' })
	accessibleLabeledBy = '';

	/**
	 * Marks the group as invalid. Announced and not drawn, and on the group: a
	 * red ring around one swatch would say that swatch is wrong, while it is the
	 * question that is unanswered.
	 */
	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: String, reflect: true })
	value = '';

	/** Something has to be chosen. Carried by a hidden radio of the group's own,
	 *  checked as soon as anything is chosen, so the browser writes the message. */
	@property({ type: Boolean, reflect: true })
	required = false;

	private _initialValue = '';

	/** The name this group wrote onto its host, so it only takes back its own. */
	private _appliedLabel: string | null = null;

	override connectedCallback(): void {
		super.connectedCallback();
		this.setAttribute('role', 'radiogroup');
		this.addEventListener('item-change', this._handleItemChange as EventListener);
		this.addEventListener('keydown', this._handleKeydown);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.removeEventListener('item-change', this._handleItemChange as EventListener);
		this.removeEventListener('keydown', this._handleKeydown);
	}

	override firstUpdated(): void {
		this._syncItems();
		this._initialValue = this.value;
	}

	override formValue(): FormValue {
		return this.value || null;
	}

	formResetCallback(): void {
		this.value = this._initialValue;
	}

	formStateRestoreCallback(state: FormData | string | null): void {
		if (typeof state === 'string') this.value = state;
	}

	/** The group has no focus of its own, so an invalid submit lands where Tab
	 *  would: on the chosen swatch, or the first one that is enabled. */
	override validationAnchor(): HTMLElement | undefined {
		const items = this._getItems().filter((item) => !item.disabled);
		return items.find((item) => item.selected) ?? items[0];
	}

	override updated(changedProperties: Map<string, unknown>): void {
		if (
			changedProperties.has('value') ||
			changedProperties.has('size') ||
			changedProperties.has('disabled') ||
			changedProperties.has('required') ||
			changedProperties.has('invalid')
		) {
			this._syncItems();
		}
		if (changedProperties.has('value')) this.commitFormValue();
		if (changedProperties.has('accessibleLabel')) {
			this._appliedLabel = setOwnedAttribute(this, 'aria-label', this.accessibleLabel, this._appliedLabel);
		}
		if (changedProperties.has('accessibleLabeledBy')) {
			if (this.accessibleLabeledBy) this.setAttribute('aria-labelledby', this.accessibleLabeledBy);
			else this.removeAttribute('aria-labelledby');
		}
	}

	private _getItems(): NLDDSwatchPickerItem[] {
		const slot = this.shadowRoot?.querySelector('slot');
		if (!slot) return [];
		return slot
			.assignedElements()
			.filter((el): el is NLDDSwatchPickerItem => el.localName === 'nldd-swatch-picker-item');
	}

	private _syncItems(): void {
		const items = this._getItems();
		this.toggleAttribute('aria-required', this.required);
		if (this.invalid) this.setAttribute('aria-invalid', 'true');
		else this.removeAttribute('aria-invalid');

		for (const item of items) {
			if (this.disabled && !item.hasAttribute('disabled')) {
				item.setAttribute('group-disabled', '');
				item.disabled = true;
			} else if (!this.disabled && item.hasAttribute('group-disabled')) {
				item.removeAttribute('group-disabled');
				item.disabled = false;
			}
			item.size = this.size;
			item.selected = !!this.value && item.value === this.value;
		}

		const positions = radioPositions(items, (item) => item.selected, (item) => item.disabled);
		items.forEach((item, index) => {
			item._groupPosition = positions[index] ?? null;
		});
	}

	private _handleItemChange = (e: CustomEvent<{ value: string }>): void => {
		e.stopPropagation();
		if (this.disabled || e.detail.value === this.value) return;
		this.value = e.detail.value;
		this._syncItems();
		this.commitFormValue();
		this.dispatchEvent(new CustomEvent('change', {
			detail: { value: this.value },
			bubbles: true,
			composed: true,
		}));
	};

	private _handleKeydown = (e: KeyboardEvent): void => {
		if (this.disabled) return;
		// Enter on a radio submits the form it belongs to, and the group is what
		// the form knows.
		if (e.key === 'Enter') {
			submitOnEnter(this, e);
			return;
		}
		const items = this._getItems().filter((item) => !item.disabled);
		if (items.length === 0) return;
		const current = items.findIndex((item) => item.selected);
		let next: number;
		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				next = current <= 0 ? items.length - 1 : current - 1;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				next = current >= items.length - 1 ? 0 : current + 1;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = items.length - 1;
				break;
			default:
				return;
		}
		e.preventDefault();
		if (next === current || !items[next]) return;
		items[next].focus();
		// Through the swatch, as a click: it fires item-change, and the group
		// answers with change, so every way of choosing sends both.
		items[next]._select();
	};

	/** @internal */
	_onSlotChange(): void {
		this._syncItems();
	}

	/** Focus goes to the chosen swatch, or the first enabled one: where Tab lands. */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
		const items = this._getItems().filter((item) => !item.disabled);
		(items.find((item) => item.selected) ?? items[0])?.focus(options);
	}

	override render() {
		return swatchPickerTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-swatch-picker': NLDDSwatchPicker;
		'nldd-swatch-picker-item': NLDDSwatchPickerItem;
	}
}
