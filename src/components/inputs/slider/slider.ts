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
 * the nearer thumb there. A thumb dragged or moved with an arrow key (also
 * with Shift) past the other one becomes that end of the range, and focus goes with it, so its name
 * still says which end it is. Home, End, Page Up and Page Down stop at the
 * other thumb, so they never turn the range around. Where the thumbs lie on
 * one value, the first move picks one, to the left the start one.
 *
 * The value shows in a tooltip above the thumb while the pointer is over the
 * slider or its icons, while a thumb has keyboard focus and while it or an icon
 * is pressed; with `tooltip-timing="never"` it does not, for a slider whose
 * value already shows elsewhere. Where the two tooltips of a range would
 * overlap, they show as one ("200 – 1.200"). `formatValue` turns a number into
 * the text of the tooltip and of what a screen reader hears, such as
 * `(value) => \`€ ${value}\``; without it the number is written in the
 * language of the page (`lang`), and in Dutch where none is set.
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
 * A larger step than the arrow keys take is a tenth of the range, and at least
 * one `step`: what Page Up and Page Down do, what Shift with an arrow key does
 * (a Mac keyboard has no Page Up), and what a click on `start-icon` or
 * `end-icon` does. The icons stay out of the tab order and out of the
 * accessibility tree, because the keyboard already has those keys. In a range
 * they only explain the ends, since a click could not say which thumb to move.
 *
 * In a form a slider submits its value under `name`; a range submits both ends
 * under it, the start first.
 *
 * @element nldd-slider
 * @attr {string} size - Slider size: 'xs' | 'sm' | 'md' (default: 'md'), with the height of the other controls of that size. Set automatically by nldd-form-field.
 * @attr {boolean} range - Picks a range, with a thumb for each end: `start-value` and `end-value` in place of `value`
 * @attr {string} histogram - Counts drawn as bars above the track, one per bucket of (max - min) / n, comma- or space-separated; as a property, an array of numbers. The bars within the chosen value or range are colored.
 * @attr {string} start-icon - Icon at the start of the track, such as a quiet speaker for a volume. A click on it moves the value a tenth of the range down (not in a range).
 * @attr {string} end-icon - Icon at the end of the track. A click on it moves the value a tenth of the range up (not in a range).
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
import { property, queryAll, state } from 'lit/decorators.js';
import { customElement } from '../../../utilities/custom-element.js';
import { FormAssociated, type FormValue } from '../../../utilities/form-associated-mixin.js';
import { DescribedBy } from '../../../utilities/described-by-mixin.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { translate } from '../../../utilities/translations.js';
import { nlddSliderTranslations, type NLDDSliderTranslations } from './slider.i18n.js';
import { sliderStyles } from './slider.styles.js';
import { sliderTemplate } from './slider.template.js';
import { deferFocus } from '../../../utilities/defer-focus.js';
import { langOf } from '../../../utilities/carried-context.js';

type Size = 'xs' | 'sm' | 'md';
export type Thumb = 'value' | 'start' | 'end';

/** A number written the way of a language, one formatter per language. */
const formats = new Map<string, Intl.NumberFormat>();
function numberFormat(lang: string): Intl.NumberFormat {
	let format = formats.get(lang);
	if (!format) {
		try {
			format = new Intl.NumberFormat(lang, { maximumFractionDigits: 6 });
		} catch {
			// A `lang` that is no language tag, such as "nl_NL".
			format = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 6 });
		}
		formats.set(lang, format);
	}
	return format;
}

/** The decimals of a number, also written with an exponent ("1e-7"). */
function decimalsOf(number: number): number {
	const [digits, exponent] = String(number).split('e');
	return Math.max(0, (digits.split('.')[1] ?? '').length - Number(exponent ?? 0));
}

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

	/** @internal The thumb a pointer holds, for its pressed look. */
	@state() _held: Thumb | null = null;

	@queryAll('.slider__input')
	private _inputs!: NodeListOf<HTMLInputElement>;

	private _initial: { value?: number; startValue?: number; endValue?: number } = {};
	/** Lays the tooltips out again when the slider or the window changes size. */
	private _resizeObserver: ResizeObserver | null = null;
	/** The thumb a press on the track of a range moves, until it is let go. */
	private _trackThumb: 'start' | 'end' | null = null;
	/** Where a press on two stacked thumbs began, until a move picks one. */
	private _stackedPress: number | null = null;
	/** The input a pointer drags natively, and the end of the range it moves:
	 *  past the other thumb that is the other end, while the drag goes on. */
	private _dragInput: HTMLInputElement | null = null;
	private _dragThumb: 'start' | 'end' | null = null;
	/** Whether the key that moves a thumb is a plain arrow, which may take it
	 *  past the other one. */
	private _arrowKey = false;

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
		return this.formatValue ? this.formatValue(value) : numberFormat(langOf(this) ?? 'nl-NL').format(value);
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
		// Steps such as 0.1 add up to 0.30000000000000004 otherwise; a min of 0.5
		// with a step of 1 keeps its half.
		const decimals = Math.max(decimalsOf(step), decimalsOf(this.min));
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

	/** Back to the values in the attributes, as a native input resets to its
	 *  `value` attribute, or else to what it had when it was first connected. */
	formResetCallback(): void {
		const attribute = (name: string) => {
			const value = parseFloat(this.getAttribute(name) ?? '');
			return Number.isFinite(value) ? value : undefined;
		};
		this.value = attribute('value') ?? this._initial.value;
		this.startValue = attribute('start-value') ?? this._initial.startValue;
		this.endValue = attribute('end-value') ?? this._initial.endValue;
	}

	formStateRestoreCallback(state: File | string | FormData | null): void {
		// A restored state that is not a number keeps the value as it was.
		const number = (entry: unknown) => {
			const value = parseFloat(String(entry));
			return Number.isFinite(value) ? value : undefined;
		};
		if (typeof state === 'string') this.value = number(state) ?? this.value;
		if (state instanceof FormData && this.name) {
			const [start, end] = state.getAll(this.name).map(number);
			this.startValue = start ?? this.startValue;
			this.endValue = end ?? this.endValue;
		}
	}

	protected override updated(changed: PropertyValues): void {
		super.updated?.(changed);
		this._layoutTooltips();
	}

	/** Moves focus to the thumb (the start one of a range). */
	override focus(options?: FocusOptions): void {
		if (deferFocus(this, options)) return;
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
		const input = event.target as HTMLInputElement;
		const dragged = input === this._dragInput && this._dragThumb;
		const moved = dragged || thumb;
		const landed = this._set(moved, parseFloat(input.value), input, !!dragged || this._arrowKey);
		if (landed !== moved && landed !== 'value') {
			if (dragged) {
				this._dragThumb = landed;
				this._held = landed;
			}
			this._focusThumb(landed, !!dragged);
		}
		this._emit('input');
	}

	/** @internal */
	_handleChange(event: Event): void {
		event.stopPropagation();
		this._emit('change');
	}

	/** Moves the value a tenth of the range, at least one step, down (-1) or up (1).
	 *  @internal */
	_handleIconClick(direction: -1 | 1): void {
		if (this.disabled) return;
		this._page('value', direction);
	}

	/** Shift with an arrow key takes the larger step; the native input only
	 *  takes one step for it.
	 *  @internal */
	_handleKeyDown(event: KeyboardEvent, thumb: Thumb): void {
		const arrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
		this._arrowKey = arrow && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;
		if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
		const rtl = getComputedStyle(this).direction === 'rtl';
		const directions: Record<string, -1 | 1> = {
			ArrowUp: 1,
			ArrowDown: -1,
			ArrowRight: rtl ? -1 : 1,
			ArrowLeft: rtl ? 1 : -1,
		};
		const direction = directions[event.key];
		if (!direction) return;
		event.preventDefault();
		this._page(thumb, direction, true);
	}

	/** Moves a thumb a tenth of the range, at least one step, the jump the
	 *  native input takes on Page Up and Page Down. */
	private _page(thumb: Thumb, direction: -1 | 1, pass = false): void {
		const page = Math.max(this.step > 0 ? this.step : 1, (this.max - this.min) / 10);
		const current = () => (thumb === 'value' ? this._value : [this._start, this._end].join());
		const before = current();
		const input = this.shadowRoot?.querySelector<HTMLInputElement>(`.slider__input--${thumb}`) ?? undefined;
		const from = thumb === 'value' ? this._value : thumb === 'start' ? this._start : this._end;
		const landed = this._set(thumb, from + direction * page, input, pass);
		if (landed !== thumb && landed !== 'value') this._focusThumb(landed);
		if (current() === before) return;
		this._emit('input');
		this._emit('change');
	}

	/** @internal */
	_handlePointerDown = (event: PointerEvent): void => {
		if (this.disabled || event.button !== 0) return;
		this._active = true;
		window.addEventListener('pointerup', this._handlePointerUp, { once: true });
		window.addEventListener('pointercancel', this._handlePointerUp, { once: true });
		// A press on an icon only shows the tooltip, with the value it steps to.
		// In a range the inputs only take a press on their thumb, so a press on
		// the track moves the nearer thumb there, and drags it from there. Two
		// stacked thumbs take no press either: the first move picks one.
		const target = event.target as Element;
		this._arrowKey = false;
		if (target.matches('.slider__input')) {
			this._held = target.matches('.slider__input--start') ? 'start' : target.matches('.slider__input--end') ? 'end' : 'value';
		}
		if (this.range && target.matches('.slider__input')) {
			this._dragInput = target as HTMLInputElement;
			this._dragThumb = this._held as 'start' | 'end';
		}
		if (!this.range || !target.closest('.slider__control') || target.matches('.slider__input')) return;
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
		const landed = this._set(this._trackThumb, this._valueAt(event.clientX), undefined, true);
		if (landed !== this._trackThumb && landed !== 'value') this._grab(landed);
		this._emit('input');
	};

	/** Makes a thumb the one a press drags, and gives it focus. */
	private _grab(thumb: 'start' | 'end'): void {
		this._trackThumb = thumb;
		this._held = thumb;
		this._focusThumb(thumb, true);
	}

	/** Under a pointer the focus that moves to the other thumb is no keyboard
	 *  focus, so it draws no ring: Safari would draw one for a focus from script,
	 *  also in the middle of a touch. Safari (from 18.4) and Firefox read the
	 *  option; Chromium ignores it and decides the ring itself, which it already
	 *  leaves off here. */
	private _focusThumb(thumb: 'start' | 'end', pointer = false): void {
		const input = this.shadowRoot?.querySelector<HTMLInputElement>(`.slider__input--${thumb}`);
		input?.focus(pointer ? ({ focusVisible: false } as FocusOptions) : undefined);
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
		this._dragInput = null;
		this._dragThumb = null;
		this._held = null;
	}

	/** Where the middle of the native thumb runs: from `start` over `length`
	 *  pixels, in the direction of the text, and how wide it takes a press. */
	private _thumbPath(): { start: number; length: number; rtl: boolean; hit: number } {
		const control = this.shadowRoot!.querySelector<HTMLElement>('.slider__control')!;
		const rect = control.getBoundingClientRect();
		const style = getComputedStyle(control);
		const thumb = parseFloat(style.getPropertyValue('--_slider-thumb-size')) || 0;
		const hit = parseFloat(style.getPropertyValue('--_slider-thumb-hit-size')) || thumb;
		return { start: rect.left + thumb / 2, length: Math.max(1, rect.width - thumb), rtl: getComputedStyle(this).direction === 'rtl', hit };
	}

	/** The value under a point of the track, the way the native thumb places it. */
	private _valueAt(x: number): number {
		const { start, length, rtl } = this._thumbPath();
		const fraction = Math.max(0, Math.min(1, (x - start) / length));
		return this._snap(this.min + (rtl ? 1 - fraction : fraction) * (this.max - this.min));
	}

	/** Whether a point lies on the pressable area of the stacked thumbs. */
	private _onThumb(x: number): boolean {
		const { start, length, rtl, hit } = this._thumbPath();
		const fraction = this._fraction(this._start);
		return Math.abs(x - (start + length * (rtl ? 1 - fraction : fraction))) <= hit / 2;
	}

	/** Sets a thumb and puts the native inputs back where the values landed.
	 *  With `pass`, a thumb moved past the other one becomes the other end of
	 *  the range, and the other thumb takes its place; without, it stops at the
	 *  other thumb. Returns the end the value landed on. */
	private _set(thumb: Thumb, raw: number, input?: HTMLInputElement, pass = false): Thumb {
		const value = this._snap(raw);
		let landed = thumb;
		if (thumb === 'value') {
			this.value = value;
			if (input && parseFloat(input.value) !== value) input.value = String(value);
		} else {
			const start = this._start;
			const end = this._end;
			if (thumb === 'start' && value > end && pass) {
				[this.startValue, this.endValue, landed] = [end, value, 'end'];
			} else if (thumb === 'end' && value < start && pass) {
				[this.startValue, this.endValue, landed] = [value, start, 'start'];
			} else if (thumb === 'start') {
				this.startValue = Math.min(value, end);
			} else {
				this.endValue = Math.max(value, start);
			}
			for (const el of this._inputs ?? []) {
				const settled = el.classList.contains('slider__input--start') ? this._start : this._end;
				if (parseFloat(el.value) !== settled) el.value = String(settled);
			}
		}
		this.commitFormValue();
		return landed;
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
		if (!root || !slider || this.tooltipTiming === 'never') return;
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
