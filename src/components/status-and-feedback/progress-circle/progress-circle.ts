/**
 * Nederlandse Digitale Dienst Progress Circle Component (Lit + TypeScript)
 *
 * Exports both NLDDProgressCircle and NLDDProgressCircleSegmentIndicator.
 *
 * A circular progress indicator that mirrors the API of nldd-progress-bar:
 * single-value or multi-segment, progress or distribution mode, 24 colors,
 * fade transitions between determinate/indeterminate, indeterminate indicator.
 *
 * Visual differences vs the bar:
 * - SVG arcs instead of rectangular bars.
 * - Label below the circle (not above).
 * - No center text; the consumer can wrap the circle if needed.
 * - One combined tooltip on the whole circle showing all segment info
 *   (no per-segment tooltips).
 * - Indeterminate uses a rotating elastic arc (Material-style) instead of
 *   the bar's Knight Rider scanner.
 *
 * @element nldd-progress-circle
 *
 * @attr {'progress'|'distribution'} mode - Semantics for ARIA and gap behavior (default: 'progress')
 * @attr {number} max - Total value (default: 100)
 * @attr {number} value - Single-segment shorthand (ignored when segment children exist)
 * @attr {string} color - Color. Semantic (neutral, accent, success, warning, critical) or a Rijkskleur. Default 'accent'.
 * @attr {string} size - Circle diameter in px. Matches nldd-icon sizes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96 (default: '28')
 * @attr {string} text - Label below the circle
 * @attr {'percentage'|'absolute'|'fraction'} value-format - Format of the displayed value (default: 'percentage')
 * @attr {'inline'|'tooltip'|'none'} value-display - Where the value shows: inline below the label, in a tooltip, or hidden (default: 'tooltip')
 * @attr {string} value-text - Full override of the displayed value (inline + tooltip)
 * @attr {string} accessible-label - Full override of aria-valuetext
 * @attr {boolean} indeterminate - Renders the rotating elastic arc animation
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - Place for nldd-progress-circle-segment-indicator elements
 *
 * @element nldd-progress-circle-segment-indicator
 *
 * @attr {number} value - Share of the parent's total (default 0; <=0 hides segment)
 * @attr {string} color - Color (semantic or Rijkskleur). Default 'accent'.
 * @attr {string} name - Optional name used in the combined tooltip + screenreader text
 */
import { LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { progressCircleStyles, progressCircleSegmentIndicatorStyles } from './progress-circle.styles.js';
import { progressCircleTemplate, getCircumference, getStrokeWidthPx } from './progress-circle.template.js';
import { nlddProgressCircleTranslations } from './progress-circle.i18n.js';
import type { NLDDProgressCircleTranslations } from './progress-circle.i18n.js';
import '../../content/tooltip/tooltip.js';

/** Indeterminate ↔ determinate crossfade duration. Must stay in sync with
 *  --primitives-transition-duration-slow used by the matching CSS animations
 *  and with nldd-progress-bar's matching constant. Exported so the test
 *  suite can cross-check this value against the resolved CSS token. */
export const INDETERMINATE_TRANSITION_MS = 300;

export type ProgressCircleMode = 'progress' | 'distribution';
export type ProgressCircleSize = '16' | '20' | '24' | '28' | '32' | '40' | '44' | '48' | '56' | '64' | '80' | '96';
export type ProgressCircleValueFormat = 'percentage' | 'absolute' | 'fraction';
export type ProgressCircleValueDisplay = 'inline' | 'tooltip' | 'none';

export type ProgressCircleColor =
	| 'neutral' | 'accent' | 'success' | 'warning' | 'critical'
	| 'lintblauw' | 'donkerblauw' | 'hemelblauw' | 'lichtblauw'
	| 'paars' | 'violet'
	| 'robijnrood' | 'roze' | 'rood' | 'oranje'
	| 'donkergeel' | 'geel'
	| 'donkerbruin' | 'bruin'
	| 'donkergroen' | 'groen' | 'mosgroen' | 'mintgroen';


// # nldd-progress-circle-segment-indicator

@customElement('nldd-progress-circle-segment-indicator')
export class NLDDProgressCircleSegmentIndicator extends LitElement {
	static override styles = progressCircleSegmentIndicatorStyles;

	@property({ type: Number, reflect: true })
	value = 0;

	@property({ reflect: true, converter: reflectNonDefault<ProgressCircleColor>('accent') })
	color: ProgressCircleColor = 'accent';

	@property({ type: String, reflect: true })
	name = '';

	override render() {
		// Data-only element — the parent reads value/color/name and renders
		// the actual SVG arc. Return Lit's `nothing` sentinel so no DOM is
		// created (an empty html`` literal would still produce a Lit
		// TemplateResult).
		return nothing;
	}
}


// # nldd-progress-circle

@customElement('nldd-progress-circle')
export class NLDDProgressCircle extends LitElement {
	static override styles = progressCircleStyles;

	@property({ reflect: true, converter: reflectNonDefault<ProgressCircleMode>('progress') })
	mode: ProgressCircleMode = 'progress';

	@property({ type: Number, reflect: true })
	max = 100;

	@property({ type: Number, reflect: true })
	value: number | null = null;

	@property({ reflect: true, converter: reflectNonDefault<ProgressCircleColor>('accent') })
	color: ProgressCircleColor = 'accent';

	@property({ reflect: true, converter: reflectNonDefault<ProgressCircleSize>('28') })
	size: ProgressCircleSize = '28';

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ reflect: true, attribute: 'value-format', converter: reflectNonDefault<ProgressCircleValueFormat>('percentage') })
	valueFormat: ProgressCircleValueFormat = 'percentage';

	@property({ type: String, reflect: true, attribute: 'value-text' })
	valueText = '';

	@property({ reflect: true, attribute: 'value-display', converter: reflectNonDefault<ProgressCircleValueDisplay>('tooltip') })
	valueDisplay: ProgressCircleValueDisplay = 'tooltip';

	@property({ type: String, reflect: true, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Boolean, reflect: true })
	indeterminate = false;

	@property({ type: Object })
	translations: Partial<NLDDProgressCircleTranslations> = {};

	@state()
	private _segmentIndicators: NLDDProgressCircleSegmentIndicator[] = [];

	@state()
	_indeterminateExiting = false;

	@state()
	_indeterminateEntering = false;

	/** When true, _buildArcs returns zero-length arcs so the first render
	 *  after the indeterminate→determinate transition starts at length 0.
	 *  Cleared on the next frame so the CSS dasharray transition animates
	 *  the segments growing into their final positions. */
	@state()
	private _arcsAtZero = false;

	private _exitTimeout?: ReturnType<typeof setTimeout>;
	private _enterTimeout?: ReturnType<typeof setTimeout>;
	private _growRafId?: number;
	private _attributeObserver?: MutationObserver;

	private static _idCounter = 0;

	/** Per-instance suffix so the in-shadow SVG <filter> ids and their url(#…)
	 *  references stay unique per element. Fragment references resolve within a
	 *  shadow tree's own scope in modern browsers, but a per-instance id removes
	 *  any cross-instance ambiguity (and old-WebKit shadow-SVG reference quirks).
	 *  Browser-only: the module counter would need stable ids for SSR hydration.
	 *  @internal */
	readonly _uid = `pc-${NLDDProgressCircle._idCounter++}`;

	public _t(key: keyof NLDDProgressCircleTranslations): string {
		return this.translations[key] ?? nlddProgressCircleTranslations[key];
	}

	get _hasSegmentIndicators(): boolean {
		return this._segmentIndicators.length > 0;
	}

	get _totalValue(): number {
		if (this._hasSegmentIndicators) {
			return this._segmentIndicators.reduce((sum, s) => sum + Math.max(0, s.value), 0);
		}
		return Math.max(0, this.value ?? 0);
	}

	get _percentage(): number {
		if (this.max <= 0) return 0;
		return Math.min(100, (this._totalValue / this.max) * 100);
	}

	/** Formatted value for inline display (value-display="inline"). Mirrors
	 *  nldd-progress-bar: valueText wins, empty while indeterminate, otherwise
	 *  the total formatted per value-format. */
	get _displayValue(): string {
		if (this.valueText) return this.valueText;
		if (this.indeterminate) return '';
		return this._formatValuePart(this._totalValue, Math.round(this._percentage));
	}

	/** Compact text shown in the tooltip — only in value-display="tooltip" mode
	 *  (returns '' otherwise, so the template skips the tooltip wrapper). Follows
	 *  value-format (matching nldd-progress-bar's per-segment tooltip style) and
	 *  omits the "voltooid" suffix that aria-valuetext uses for screen readers.
	 *  valueText overrides the whole thing; indeterminate shows the loading text. */
	get _tooltipText(): string {
		if (this.valueDisplay !== 'tooltip') return '';
		if (this.indeterminate) return this._t('components.progress-circle.loading-label');
		if (this.valueText) return this.valueText;

		if (!this._hasSegmentIndicators) {
			const v = Math.max(0, this.value ?? 0);
			const pct = this.max > 0 ? Math.round((v / this.max) * 100) : 0;
			return this._formatValuePart(v, pct);
		}

		const named = this._segmentIndicators.filter(s => s.name);
		const allNamed = named.length === this._segmentIndicators.length && this._segmentIndicators.length > 0;
		const segmentIndicatorDescriptions = this._segmentIndicators
			.filter(s => s.value > 0)
			.map(s => {
				const pct = this.max > 0 ? Math.round((s.value / this.max) * 100) : 0;
				const valuePart = this._formatValuePart(s.value, pct);
				return s.name ? `${s.name}: ${valuePart}` : valuePart;
			});

		if (this.mode === 'distribution') {
			return segmentIndicatorDescriptions.join(', ');
		}

		const totalPct = Math.round(this._percentage);
		const totalValuePart = this._formatValuePart(this._totalValue, totalPct);
		if (allNamed) {
			const totalPrefix = this._t('components.progress-circle.total-prefix-text');
			return `${segmentIndicatorDescriptions.join(', ')}. ${totalPrefix} ${totalValuePart}`;
		}
		return totalValuePart;
	}

	/** Verbose text used for aria-valuetext (screen readers). Includes the
	 *  "voltooid" suffix and total-prefix for clearer announcements. */
	get _ariaValueText(): string {
		if (this.accessibleLabel) return this.accessibleLabel;
		if (this.indeterminate) return this._t('components.progress-circle.loading-label');

		const completedSuffix = this._t('components.progress-circle.completed-suffix-text');
		const totalPrefix = this._t('components.progress-circle.total-prefix-text');

		if (!this._hasSegmentIndicators) {
			return `${Math.round(this._percentage)}% ${completedSuffix}`;
		}

		const named = this._segmentIndicators.filter(s => s.name);
		const allNamed = named.length === this._segmentIndicators.length && this._segmentIndicators.length > 0;
		const segmentIndicatorDescriptions = this._segmentIndicators
			.filter(s => s.value > 0)
			.map(s => {
				const pct = this.max > 0 ? Math.round((s.value / this.max) * 100) : 0;
				const valuePart = this._formatValuePart(s.value, pct);
				return s.name ? `${s.name}: ${valuePart}` : valuePart;
			});

		if (this.mode === 'distribution') {
			return segmentIndicatorDescriptions.join(', ');
		}

		const totalPct = Math.round(this._percentage);
		if (allNamed) {
			return `${segmentIndicatorDescriptions.join(', ')}. ${totalPrefix} ${totalPct}% ${completedSuffix}.`;
		}
		return `${totalPct}% ${completedSuffix}`;
	}

	private _formatValuePart(value: number, pct: number): string {
		switch (this.valueFormat) {
			case 'absolute': return `${value}`;
			case 'fraction': return `${value} / ${this.max}`;
			case 'percentage':
			default: return `${pct}%`;
		}
	}

	override willUpdate(changed: Map<string, unknown>): void {
		if (changed.has('indeterminate')) {
			const previous = changed.get('indeterminate');
			if (previous === true && !this.indeterminate) {
				this._beginIndeterminateExit();
			} else if (previous === false && this.indeterminate) {
				this._beginIndeterminateEnter();
			}
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._cancelIndeterminateExit();
		this._cancelIndeterminateEnter();
		this._attributeObserver?.disconnect();
	}

	private _beginIndeterminateExit(): void {
		this._cancelIndeterminateEnter();
		this._indeterminateExiting = true;
		// First render: arcs at length 0. Then on the next frame switch to
		// actual lengths so the dasharray transition animates the growth.
		this._arcsAtZero = true;
		this.updateComplete.then(() => {
			this._growRafId = requestAnimationFrame(() => {
				this._growRafId = undefined;
				this._arcsAtZero = false;
			});
		});
		this._exitTimeout = setTimeout(() => {
			this._indeterminateExiting = false;
			this._exitTimeout = undefined;
		}, INDETERMINATE_TRANSITION_MS);
	}

	private _beginIndeterminateEnter(): void {
		this._cancelIndeterminateExit();
		this._indeterminateEntering = true;
		this._enterTimeout = setTimeout(() => {
			this._indeterminateEntering = false;
			this._enterTimeout = undefined;
		}, INDETERMINATE_TRANSITION_MS);
	}

	private _cancelIndeterminateExit(): void {
		if (this._exitTimeout) {
			clearTimeout(this._exitTimeout);
			this._exitTimeout = undefined;
		}
		if (this._growRafId !== undefined) {
			cancelAnimationFrame(this._growRafId);
			this._growRafId = undefined;
		}
		this._indeterminateExiting = false;
		this._arcsAtZero = false;
	}

	private _cancelIndeterminateEnter(): void {
		if (this._enterTimeout) {
			clearTimeout(this._enterTimeout);
			this._enterTimeout = undefined;
		}
		this._indeterminateEntering = false;
	}

	private _onSlotChange(): void {
		const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
		const assigned = slot?.assignedElements({ flatten: true }) ?? [];
		this._segmentIndicators = assigned.filter(
			// instanceof, not tagName === '...': tagName comparison breaks
			// under scoped custom-element registries where the same class
			// can be registered under a different tag.
			(el): el is NLDDProgressCircleSegmentIndicator => el instanceof NLDDProgressCircleSegmentIndicator,
		);

		this._attributeObserver?.disconnect();
		this._attributeObserver = new MutationObserver(() => this.requestUpdate());
		for (const seg of this._segmentIndicators) {
			this._attributeObserver.observe(seg, {
				attributes: true,
				attributeFilter: ['value', 'color', 'name'],
			});
		}
		// Setting _segmentIndicators (a @state) above already schedules a re-render —
		// the trailing requestUpdate() was a duplicate that produced a second
		// render on every slot mutation.
	}

	/** Build the SVG arc list for the current segments (or a single synthetic
	 *  segment when the user provides only `value`). Each arc gets a length
	 *  and offset on the shared circle so they line up.
	 *
	 *  @internal `public` here is required for the render template to call
	 *  this method (templates live outside the class). Treat it as private
	 *  externally — the leading underscore signals "not API". */
	public _buildArcs(): Array<{ length: number; offset: number; color: ProgressCircleColor }> {
		const arcs: Array<{ length: number; offset: number; color: ProgressCircleColor }> = [];

		// Include zero-value segments too — they still render an (invisible)
		// SVG circle so that CSS transitions have a previous state to animate
		// from when the value later grows. Without this, going from 0 to N
		// would pop in instead of animating.
		const sourceSegmentIndicators: Array<{ value: number; color: ProgressCircleColor }> = this._hasSegmentIndicators
			? this._segmentIndicators.map(s => ({ value: Math.max(0, s.value), color: s.color }))
			: this.value !== null
				? [{ value: Math.max(0, this.value), color: this.color }]
				: [];

		// Gap between adjacent segments, computed in user units so it stays a
		// consistent number of CSS pixels regardless of the rendered size.
		// viewBox is 100, so user_units = pixels × (100 / sizeInPixels).
		// Progress mode uses rounded caps which extend half-stroke-width past
		// the path end on each side; we add the full stroke width (= two
		// half-strokes) so the visible gap is 1px. Distribution mode uses butt
		// caps so a 2px gap is enough. Single-segment progress (just `value`,
		// no children) has no neighbors so no gap.
		const sizeInPixels = Number(this.size) || 28;
		const strokeWidthPx = getStrokeWidthPx(sizeInPixels);
		const isMultiSegmentIndicator = sourceSegmentIndicators.length > 1 || this.mode === 'distribution';
		const isProgressMode = this.mode !== 'distribution';
		const visibleGapPx = isMultiSegmentIndicator ? (isProgressMode ? 1 : 2) : 0;
		const capCompensationPx = isProgressMode && isMultiSegmentIndicator ? strokeWidthPx : 0;
		const gapLength = (visibleGapPx + capCompensationPx) * (100 / sizeInPixels);

		// Circumference depends on radius, which depends on size (so the stroke
		// stays inside the viewBox). Compute once per build.
		const circumference = getCircumference(sizeInPixels);

		const total = this._totalValue;
		// Both modes measure against max so a partial total fills only part
		// of the ring. If the sum exceeds max we normalize proportionally to
		// avoid overflow (matches nldd-progress-bar behavior).
		const denominator = total > this.max ? total : this.max;

		let cumulative = 0;
		for (const seg of sourceSegmentIndicators) {
			const fraction = denominator > 0 ? seg.value / denominator : 0;
			const rawLength = fraction * circumference;
			// Subtract gap from segment length so the gap appears between
			// adjacent segments. Skip the gap on segments smaller than the gap.
			// While _arcsAtZero is true (first frame of indeterminate exit) all
			// arcs render at length 0 so the dasharray transition grows them in.
			// Zero-value segments still get pushed (length 0) so the SVG element
			// exists and CSS transitions can animate when the value later grows.
			const length = this._arcsAtZero || seg.value <= 0
				? 0
				: Math.max(0, rawLength - gapLength);
			arcs.push({ length, offset: cumulative, color: seg.color });
			cumulative += rawLength;
		}
		return arcs;
	}

	override render() {
		return progressCircleTemplate(this, this._onSlotChangeBound);
	}

	override updated(changed: Map<string, unknown>): void {
		// Sync only when the entering/exiting flags change. The previous
		// implementation re-walked the shadow DOM on every render —
		// querySelectorAll + setAttribute/removeAttribute is cheap but
		// non-zero, and a busy parent that re-renders for unrelated reasons
		// (slot change, attribute mutation) shouldn't pay for it.
		if (changed.has('_indeterminateEntering') || changed.has('_indeterminateExiting')) {
			this._syncDynamicAttributes();
		}
	}

	/**
	 * Toggle the data-shrink / data-fade attributes after Lit's render. These
	 * are conditional (presence-or-absence) and Lit's `=${expr}` binding has
	 * quirks removing SVG attributes; setAttribute/removeAttribute is reliable.
	 * Other dynamic SVG attributes (stroke-dasharray, stroke-dashoffset) are
	 * always set and live in the Lit template.
	 */
	private _syncDynamicAttributes(): void {
		const segments = this.shadowRoot?.querySelectorAll<SVGCircleElement>('.progress-circle__segment-indicator');
		if (segments) {
			for (const el of segments) {
				if (this._indeterminateEntering) {
					el.setAttribute('data-shrink', '');
				} else {
					el.removeAttribute('data-shrink');
				}
			}
		}

		const indicator = this.shadowRoot?.querySelector<SVGCircleElement>('.progress-circle__indeterminate-indicator');
		if (indicator) {
			if (this._indeterminateExiting && !this.indeterminate) {
				indicator.setAttribute('data-fade', 'out');
			} else {
				indicator.removeAttribute('data-fade');
			}
		}
	}

	private _onSlotChangeBound = this._onSlotChange.bind(this);
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-progress-circle': NLDDProgressCircle;
		'nldd-progress-circle-segment-indicator': NLDDProgressCircleSegmentIndicator;
	}
}
