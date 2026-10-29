/**
 * Nederlandse Digitale Dienst Slider Component (Lit + TypeScript)
 *
 * A value picked along a track, by dragging its thumb, pressing the track or
 * with the arrow keys. With `range` it picks a range instead, with a thumb for
 * each end. The names follow Apple's: the track, the thumb, and the minimum
 * track, the part filled up to the thumb, or between the thumbs of a range.
 *
 * A slider is for a value that may be roughly right, such as a filter ("a
 * price between …"). For a value that has to be exact, an `nldd-number-field`
 * is easier: a thumb is hard to put on one number, the more so with a hand
 * that is not steady.
 *
 * It is built on native range inputs, so the keyboard (arrows, Page Up and
 * Page Down, Home and End), touch, the form and a screen reader work as they do
 * for any slider. A range is two of them over each other, each with its own
 * name for a screen reader ("Prijs, minimum"), and a press on the track moves
 * the nearer thumb there. The thumbs do not pass each other; where they lie
 * on one value, the first move picks one, to the left the start one.
 *
 * The value shows in a tooltip above the thumb while the pointer is over the
 * slider, while a thumb has keyboard focus and while it is dragged; with
 * `tooltip-timing="never"` it does not, for a slider whose value already shows
 * elsewhere. Where the
 * two tooltips of a range would overlap, they show as one ("200 – 1.200").
 * `formatValue` turns a number into the text of the tooltip and of what a
 * screen reader hears, such as `(value) => \`€ ${value}\``; without it the
 * number is written the Dutch way.
 *
 * `histogram` draws counts as bars above the track, such as how many results
 * there are at each price, so the range can be chosen with the spread in view.
 * Give one count per bucket: n counts split min to max into n equal buckets of
 * (max - min) / n, the first count for the first bucket. Only the proportions
 * matter (the highest count is the full height), a 0 is an empty bucket, and
 * 20 to 40 buckets read best, whatever the `step`. A bar whose middle lies
 * within the chosen value or range is colored. The bars are decoration for a
 * screen reader: say what they show in the text around it.
 *
 * In a form a slider submits its value under `name`; a range submits both ends
 * under it, the start first.
 *
 * @element nldd-slider
 * @attr {string} size - Slider size: 'xs' | 'sm' | 'md' (default: 'md'), with the height of the other controls of that size. Set automatically by nldd-form-field.
 * @attr {boolean} range - Picks a range, with a thumb for each end: `start-value` and `end-value` in place of `value`
 * @attr {string} histogram - Counts drawn as bars above the track, one per bucket of (max - min) / n, comma- or space-separated; as a property, an array of numbers. The bars within the chosen value or range are colored.
 * @attr {string} start-icon - Icon at the start of the track, such as a quiet speaker for a volume
 * @attr {string} end-icon - Icon at the end of the track
 * @attr {string} accessible-label - Accessible name; a range adds "minimum" and "maximum" to it for its thumbs. Set automatically by nldd-form-field.
 * @attr {string} tooltip-timing - When the value shows above the thumb: 'instant' (the default: on hover, keyboard focus and while dragging) or 'never', for a slider whose value shows elsewhere, such as in fields above it
 * @attr {boolean} invalid - Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it.
 * @attr {boolean} disabled - Disabled state
 * @attr {string} name - Name for form submission
 * @attr {number} value - The value (default: the middle between min and max)
 * @attr {number} start-value - The start of a range (default: min)
 * @attr {number} end-value - The end of a range (default: max)
 * @attr {number} min - Smallest value (default: 0)
 * @attr {number} max - Largest value (default: 100)
 * @attr {number} step - Step between values (default: 1)
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @prop {(value: number) => string} formatValue - Turns a value into the text of its tooltip and of what a screen reader hears
 *
 * @fires input - While a thumb moves; detail: { value } or, with `range`, { startValue, endValue }
 * @fires change - When a thumb is let go, or a key moved it; detail as for input
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, queryAll, state } from 'lit/decorators.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { translate } from '../../../utilities/translations.js';
import { nlddSliderTranslations, type NLDDSliderTranslations } from './slider.i18n.js';
import { sliderStyles } from './slider.styles.js';
import { sliderTemplate } from './slider.template.js';

type Size = 'xs' | 'sm' | 'md';
type Thumb = 'value' | 'start' | 'end';

const NUMBER = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 6 });

@customElement('nldd-slider')
export class NLDDSlider extends DescribedBy(FormAssociated(LitElement)) {
	static override styles = sliderStyles;

	/** Says this is the control an nldd-form-field is about, so the field can
	 *  find it, name it and move focus into it. See nldd-form-field. */
	static isFormInput = true;

	// Property order matches the story controls.
	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	@property({ type: Boolean, reflect: true })
	range = false;

	@property({
		converter: {
			fromAttribute: (value: string | null) => (value ?? '').split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => Number.isFinite(n)),
			toAttribute: (value: number[]) => value.join(','),
		},
	})
	histogram: number[] = [];

	@property({ type: String, attribute: 'start-icon' })
	startIcon = '';

	@property({ type: String, attribute: 'end-icon' })
	endIcon = '';

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ reflect: true, attribute: 'tooltip-timing', converter: reflectNonDefault<'instant' | 'never'>('instant') })
	tooltipTiming: 'instant' | 'never' = 'instant';

	@property({ type: Boolean, reflect: true })
	invalid = false;

	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ reflect: true, converter: reflectNonDefault('') })
	name = '';

	@property({ type: Number })
	value: number | undefined = undefined;

	@property({ type: Number, attribute: 'start-value' })
	startValue: number | undefined = undefined;

	@property({ type: Number, attribute: 'end-value' })
	endValue: number | undefined = undefined;

	@property({ type: Number })
	min = 0;

	@property({ type: Number })
	max = 100;

	@property({ type: Number })
	step = 1;

	@property({ type: Object })
	translations: Partial<NLDDSliderTranslations> = {};

	@property({ attribute: false })
	formatValue: ((value: number) => string) | null = null;

	/** @internal While a thumb is pressed or dragged, so its tooltip shows. */
	@state() _active = false;

	@queryAll('.slider__input')
	private _inputs!: NodeListOf<HTMLInputElement>;

	private _initial: { value?: number; startValue?: number; endValue?: number } = {};
	/** Lays the tooltips out again when the slider or the window changes size. */
	private _resizeObserver: ResizeObserver | null = null;
	/** The thumb a press on the track of a range moves, until it is let go. */
	private _trackThumb: 'start' | 'end' | null = null;
	/** Where a press on two stacked thumbs began, until a move picks one. */
	private _stackedPress: number | null = null;

	/** @internal */
	_t(key: keyof NLDDSliderTranslations): string {
		return translate(this.translations, nlddSliderTranslations, key);
	}

	// — Values ———————————————————————————————————————————————————————————————

	/** @internal The value of a single slider, settled within min and max. */
	get _value(): number {
		return this._snap(this.value ?? (this.min + this.max) / 2);
	}

	/** @internal The start of a range. */
	get _start(): number {
		return Math.min(this._snap(this.startValue ?? this.min), this._end);
	}

	/** @internal The end of a range. */
	get _end(): number {
		return this._snap(this.endValue ?? this.max);
	}

	/** @internal Where a value sits along the track, from 0 to 1. */
	_fraction(value: number): number {
		return this.max > this.min ? (value - this.min) / (this.max - this.min) : 0;
	}

	/** @internal A value as the tooltip and a screen reader say it. */
	_format(value: number): string {
		return this.formatValue ? this.formatValue(value) : NUMBER.format(value);
	}

	/** @internal The name of a thumb for a screen reader. */
	_label(thumb: Thumb): string | undefined {
		if (thumb === 'value') return this.accessibleLabel || undefined;
		const end = this._t(thumb === 'start' ? 'components.slider.start-value-label' : 'components.slider.end-value-label');
		return this.accessibleLabel ? `${this.accessibleLabel}, ${end.toLowerCase()}` : end;
	}

	/** Rounds to the nearest step and keeps it within min and max. */
	private _snap(value: number): number {
		const step = this.step > 0 ? this.step : 1;
		const snapped = this.min + Math.round((value - this.min) / step) * step;
		// Steps such as 0.1 add up to 0.30000000000000004 otherwise.
		const decimals = (String(step).split('.')[1] ?? '').length;
		return Math.max(this.min, Math.min(this.max, Number(snapped.toFixed(decimals))));
	}

	// — Form —————————————————————————————————————————————————————————————————

	override connectedCallback(): void {
		super.connectedCallback();
		if (!this.hasUpdated) this._initial = { value: this.value, startValue: this.startValue, endValue: this.endValue };
		this._resizeObserver = new ResizeObserver(this._layoutTooltips);
		this._resizeObserver.observe(this);
		window.addEventListener('resize', this._layoutTooltips);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
		window.removeEventListener('resize', this._layoutTooltips);
		// Taken out mid-press: the release never reaches it.
		this._stopPress();
		this._active = false;
	}

	override formValue(): FormValue {
		if (!this.range) return String(this._value);
		if (!this.name) return null;
		const data = new FormData();
		data.append(this.name, String(this._start));
		data.append(this.name, String(this._end));
		return data;
	}

	formResetCallback(): void {
		this.value = this._initial.value;
		this.startValue = this._initial.startValue;
		this.endValue = this._initial.endValue;
	}

	formStateRestoreCallback(state: File | string | FormData | null): void {
		if (typeof state === 'string') this.value = parseFloat(state);
		if (state instanceof FormData && this.name) {
			const [start, end] = state.getAll(this.name).map((entry) => parseFloat(String(entry)));
			this.startValue = start;
			this.endValue = end;
		}
	}

	protected override updated(changed: PropertyValues): void {
		super.updated?.(changed);
		this._layoutTooltips();
	}

	/** Moves focus to the thumb (the start one of a range). */
	override focus(options?: FocusOptions): void {
		this._inputs?.[0]?.focus(options);
	}

	override describedTarget(): Element | null {
		return this.shadowRoot?.querySelector('.slider__input') ?? null;
	}

	// — Events ———————————————————————————————————————————————————————————————

	/** @internal */
	_handleInput(event: Event, thumb: Thumb): void {
		// The native input event crosses the shadow root; the host fires its own.
		event.stopPropagation();
		this._set(thumb, parseFloat((event.target as HTMLInputElement).value), event.target as HTMLInputElement);
		this._emit('input');
	}

	/** @internal */
	_handleChange(event: Event): void {
		event.stopPropagation();
		this._emit('change');
	}

	/** @internal */
	_handlePointerDown = (event: PointerEvent): void => {
		if (this.disabled || event.button !== 0) return;
		this._active = true;
		window.addEventListener('pointerup', this._handlePointerUp, { once: true });
		window.addEventListener('pointercancel', this._handlePointerUp, { once: true });
		// In a range the inputs only take a press on their thumb, so a press on
		// the track moves the nearer thumb there, and drags it from there. Two
		// stacked thumbs take no press either: the first move picks one.
		if (!this.range || (event.target as Element).matches('.slider__input')) return;
		window.addEventListener('pointermove', this._handleTrackMove);
		event.preventDefault();
		if (this._start === this._end && this._onThumb(event.clientX)) {
			this._stackedPress = event.clientX;
			return;
		}
		const value = this._valueAt(event.clientX);
		const thumb = Math.abs(value - this._start) < Math.abs(value - this._end) || (value < this._start)
			? 'start'
			: 'end';
		this._grab(thumb);
		this._set(thumb, value);
		this._emit('input');
	};

	private _handleTrackMove = (event: PointerEvent): void => {
		if (!this.isConnected) return;
		if (this._stackedPress !== null) {
			const moved = event.clientX - this._stackedPress;
			if (moved === 0) return;
			const rtl = getComputedStyle(this).direction === 'rtl';
			this._grab((moved < 0) !== rtl ? 'start' : 'end');
			this._stackedPress = null;
		}
		if (!this._trackThumb) return;
		this._set(this._trackThumb, this._valueAt(event.clientX));
		this._emit('input');
	};

	/** Makes a thumb the one a press drags, and gives it focus. */
	private _grab(thumb: 'start' | 'end'): void {
		this._trackThumb = thumb;
		this.shadowRoot?.querySelector<HTMLInputElement>(`.slider__input--${thumb}`)?.focus();
	}

	private _handlePointerUp = (): void => {
		this._active = false;
		const thumb = this._trackThumb;
		this._stopPress();
		if (thumb) this._emit('change');
	};

	/** Ends a press: its listeners on the window, and the thumb it drags. */
	private _stopPress(): void {
		window.removeEventListener('pointermove', this._handleTrackMove);
		window.removeEventListener('pointerup', this._handlePointerUp);
		window.removeEventListener('pointercancel', this._handlePointerUp);
		this._trackThumb = null;
		this._stackedPress = null;
	}

	/** The value under a point of the track, the way the native thumb places it. */
	private _valueAt(x: number): number {
		const control = this.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
		const rect = control.getBoundingClientRect();
		const thumb = parseFloat(getComputedStyle(control).getPropertyValue('--_slider-thumb-size')) || 0;
		let fraction = (x - rect.left - thumb / 2) / Math.max(1, rect.width - thumb);
		if (getComputedStyle(this).direction === 'rtl') fraction = 1 - fraction;
		return this._snap(this.min + Math.max(0, Math.min(1, fraction)) * (this.max - this.min));
	}

	/** Whether a point lies on the pressable area of the stacked thumbs. */
	private _onThumb(x: number): boolean {
		const control = this.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
		const rect = control.getBoundingClientRect();
		const style = getComputedStyle(control);
		const thumb = parseFloat(style.getPropertyValue('--_slider-thumb-size')) || 0;
		const hit = parseFloat(style.getPropertyValue('--_slider-thumb-hit-size')) || thumb;
		let fraction = this._fraction(this._start);
		if (getComputedStyle(this).direction === 'rtl') fraction = 1 - fraction;
		return Math.abs(x - (rect.left + thumb / 2 + (rect.width - thumb) * fraction)) <= hit / 2;
	}

	/** Sets a thumb, keeps the thumbs of a range from passing each other, and
	 *  puts the native input back where the value landed. */
	private _set(thumb: Thumb, raw: number, input?: HTMLInputElement): void {
		const value = this._snap(raw);
		if (thumb === 'value') this.value = value;
		if (thumb === 'start') this.startValue = Math.min(value, this._end);
		if (thumb === 'end') this.endValue = Math.max(value, this._start);
		const settled = thumb === 'value' ? this.value! : thumb === 'start' ? this.startValue! : this.endValue!;
		if (input && parseFloat(input.value) !== settled) input.value = String(settled);
		this.commitFormValue();
	}

	private _emit(type: 'input' | 'change'): void {
		const detail = this.range ? { startValue: this._start, endValue: this._end } : { value: this._value };
		this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
	}

	// — Tooltips —————————————————————————————————————————————————————————————

	/** Joins the two tooltips of a range where they would overlap, and keeps a
	 *  tooltip inside the window at the ends of the track. */
	private _layoutTooltips = (): void => {
		const root = this.shadowRoot;
		const slider = root?.querySelector<HTMLElement>('.slider');
		if (!root || !slider) return;
		const tooltips = Array.from(root.querySelectorAll<HTMLElement>('.slider__tooltip'));
		for (const tooltip of tooltips) tooltip.style.removeProperty('--_slider-tooltip-shift');
		if (this.range && tooltips.length) {
			const [start, end] = root.querySelectorAll<HTMLElement>('.slider__tooltip--start, .slider__tooltip--end');
			const a = start.getBoundingClientRect();
			const b = end.getBoundingClientRect();
			const overlap = a.right > b.left - 4 && b.right > a.left - 4;
			// .slider is a static class, so a render never takes this one off.
			slider.classList.toggle('is-merged', overlap);
		}
		const margin = 8;
		for (const tooltip of tooltips) {
			const rect = tooltip.getBoundingClientRect();
			if (!rect.width) continue;
			const shift = rect.left < margin
				? margin - rect.left
				: rect.right > window.innerWidth - margin ? window.innerWidth - margin - rect.right : 0;
			if (shift) tooltip.style.setProperty('--_slider-tooltip-shift', `${shift}px`);
		}
	};

	override render() {
		return sliderTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-slider': NLDDSlider;
	}
}
