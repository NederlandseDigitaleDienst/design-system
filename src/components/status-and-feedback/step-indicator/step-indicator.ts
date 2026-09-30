/**
 * Nederlandse Digitale Dienst Step Indicator Component (Lit + TypeScript)
 *
 * Shows where you are in a process of several steps: a row of discs with a
 * number (or a check mark on what is done), a label under each and a line
 * connecting them.
 *
 * The parent holds the truth: `current` (1-based) derives the status of every
 * child — `past` before it, `future` after. A child can override that with a
 * `status` of its own, for flows that jump back or skip a step.
 *
 * Horizontal only. For steps under each other, build an `nldd-list` with an
 * `nldd-timeline-track-cell` and an `nldd-title-cell` per row: vertical steps
 * usually carry more than a title, and a list row already does that.
 *
 * Below the sm breakpoint (a container query, so measured on the component
 * itself rather than on the viewport) it folds into one line of text plus a
 * segmented bar. The full list of steps stays in the DOM, only visually hidden,
 * so assistive software hears no less than a wide screen shows.
 *
 * Accessibility: a `nav` with a label, holding a `role="list"` with a
 * `role="listitem"` per step. The current step gets `aria-current="step"`, the
 * only notion WAI-ARIA has for this. "Done" and "still to do" do not exist as
 * ARIA tokens and travel along as visually hidden text instead.
 *
 * @element nldd-step-indicator
 *
 * @attr {string} accessible-label - Name of the nav; defaults to the i18n value ("Voortgang")
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 * @attr {number} current - 1-based number of the current step (default 1)
 *
 * @slot - `nldd-step-indicator-item` children
 *
 * @example
 * ```html
 * <nldd-step-indicator
 * 	current="2"
 * 	accessible-label="Voortgang aanvraag"
 * >
 *   <nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
 *   <nldd-step-indicator-item text="Controle"></nldd-step-indicator-item>
 *   <nldd-step-indicator-item text="Bevestigen"></nldd-step-indicator-item>
 * </nldd-step-indicator>
 * ```
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddStepIndicatorTranslations, type NLDDStepIndicatorTranslations } from './step-indicator.i18n.js';
import { stepIndicatorStyles, stepIndicatorItemStyles } from './step-indicator.styles.js';
import { stepIndicatorTemplate, stepIndicatorItemTemplate } from './step-indicator.template.js';
import '../../content/icon/icon.js';

/** The same three names as nldd-timeline-track-cell, so one flow reads in a
 *  single vocabulary whether it runs horizontally or vertically. */
export type StepIndicatorStatus = 'past' | 'current' | 'future';


// # nldd-step-indicator-item

/**
 * One step in an `nldd-step-indicator`. The parent decides the status and the
 * number; those live here as internal state rather than as public API, except
 * for `status`, which overrides what `current` derives.
 *
 * @element nldd-step-indicator-item
 *
 * @attr {string} status - `past` | `current` | `future`; overrides what the parent derives
 * @attr {string} text   - Label under the disc
 * @attr {string} icon   - Icon in the disc instead of the number or the check mark
 * @attr {string} href   - Makes the step a link (back to a completed step, for instance)
 * @attr {boolean} button - Makes the step a button, for flows without a URL per step; ignored when `href` is set
 *
 * @slot - Label (an alternative to `text`)
 */
export class NLDDStepIndicatorItem extends LitElement {
	static override styles = stepIndicatorItemStyles;

	@property({ type: String, reflect: true })
	status?: StepIndicatorStatus;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	text = '';

	@property({ type: String })
	icon = '';

	@property({ type: String, reflect: true })
	href = '';

	/** For flows without a URL per step (a wizard inside one window). Ignored
	 *  once `href` is set: one step is one action, and a link outranks a button
	 *  -- the same rule as nldd-card and nldd-avatar. */
	@property({ type: Boolean, reflect: true })
	button = false;

	/** Set by the parent: the derived status when the item has none of its own,
	 *  the position number, and the status text for assistive tech. */
	@state()
	_derivedStatus: StepIndicatorStatus = 'future';

	@state()
	_index = 1;

	@state()
	_statusText = '';

	/** The status that counts: the item's own wins over the derived one. */
	get resolvedStatus(): StepIndicatorStatus {
		return this.status ?? this._derivedStatus;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// Explicit ARIA, like nldd-breadcrumbs: the implicit <li> mapping does not
		// travel reliably across the slot boundary.
		if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
	}

	override updated(changed: PropertyValues): void {
		if (changed.has('status') || changed.has('_derivedStatus')) {
			// On the host (the listitem), because that is what assistive tech announces.
			if (this.resolvedStatus === 'current') this.setAttribute('aria-current', 'step');
			else this.removeAttribute('aria-current');
		}
	}

	override render() {
		return stepIndicatorItemTemplate(this);
	}
}

// Sub-component of nldd-step-indicator. The guard registration (like
// nldd-breadcrumbs-item's) keeps the first registration authoritative across HMR
// and test re-imports.
if (!customElements.get('nldd-step-indicator-item')) {
	customElements.define('nldd-step-indicator-item', NLDDStepIndicatorItem);
}


// # nldd-step-indicator

@customElement('nldd-step-indicator')
export class NLDDStepIndicator extends withTranslations<NLDDStepIndicatorTranslations>(
	LitElement,
	nlddStepIndicatorTranslations,
) {
	static override styles = stepIndicatorStyles;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	@property({ type: Number, reflect: true })
	current = 1;

	/** The steps, tracked so the compact view (text + bar) is driven by the same
	 *  source as the row of markers. */
	@state()
	_items: NLDDStepIndicatorItem[] = [];

	get total(): number {
		return this._items.length;
	}

	/** The current step, clamped to the number of steps: an out-of-range
	 *  `current` would otherwise mark every step past (or none at all). */
	get resolvedCurrent(): number {
		if (this.total === 0) return this.current;
		return Math.min(Math.max(this.current, 1), this.total);
	}

	get currentItem(): NLDDStepIndicatorItem | undefined {
		return this._items.find(item => item.resolvedStatus === 'current')
			?? this._items[this.resolvedCurrent - 1];
	}

	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		this._items = slot.assignedElements({ flatten: true })
			.filter((el): el is NLDDStepIndicatorItem => el.localName === 'nldd-step-indicator-item');
	};

	/** Before render, not after: the compact view reads the current item back out
	 *  of the children, so their statuses have to be fresh by the time this
	 *  element renders. */
	override willUpdate(changed: PropertyValues): void {
		// withTranslations merges a consumer's `translations` override in its own
		// willUpdate; without this call the override is silently ignored.
		super.willUpdate(changed);
		if (changed.has('current') || changed.has('_items')) this._syncItems();
	}

	/** Push position, derived status and status text down to the children. Push
	 *  rather than pull: a child reading its own parent has no way of knowing
	 *  when `current` changes. */
	private _syncItems(): void {
		const current = this.resolvedCurrent;
		this._items.forEach((item, index) => {
			const position = index + 1;
			item._index = position;
			item._derivedStatus = position < current ? 'past' : position === current ? 'current' : 'future';
			item._statusText = this._t(`components.step-indicator.status-${item.resolvedStatus}-label`);
		});
	}

	override render() {
		return stepIndicatorTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-step-indicator': NLDDStepIndicator;
		'nldd-step-indicator-item': NLDDStepIndicatorItem;
	}
}
