/**
 * Nederlandse Digitale Dienst Step Indicator Component (Lit + TypeScript)
 *
 * Shows where you are in a process of several steps: a row of discs with a
 * number (or a check mark on what is done), a label under each and a line
 * connecting them.
 *
 * Mark the step you are on with `current`, the same boolean attribute
 * `nldd-breadcrumbs-item`, `nldd-list-item` and `nldd-menu-bar-item` use. The
 * parent derives the rest from its position: `past` before it, `future` after.
 * With none marked, step 1 is current. With more than one, the last one wins
 * and a warning goes to the console in a dev build: a flow that forgets to
 * clear the previous step still points at the furthest one. A child can
 * override what is derived with a `status` of its own, for flows that jump
 * back or skip a step.
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
 *
 * @slot - `nldd-step-indicator-item` children
 *
 * @example
 * ```html
 * <nldd-step-indicator accessible-label="Voortgang aanvraag">
 *   <nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
 *   <nldd-step-indicator-item text="Controle" current></nldd-step-indicator-item>
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
 * One step in an `nldd-step-indicator`. `current` marks the step you are on;
 * the parent derives the status of the others and the number of each, which
 * live here as internal state rather than as public API. `status` overrides
 * what is derived.
 *
 * @element nldd-step-indicator-item
 *
 * @attr {string} status - `past` | `current` | `future`; overrides what the parent derives
 * @attr {string} text - Label under the disc
 * @attr {string} icon - Icon in the disc instead of the number or the check mark
 * @attr {boolean} current - Marks the step you are on (`aria-current="step"`). Set it on one step; with more than one the last wins, with none step 1 is current
 * @attr {string} href - Makes the step a link (back to a completed step, for instance)
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

	@property({ type: Boolean, reflect: true })
	current = false;

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

	/** The steps, tracked so the compact view (text + bar) is driven by the same
	 *  source as the row of markers. */
	@state()
	_items: NLDDStepIndicatorItem[] = [];

	get total(): number {
		return this._items.length;
	}

	/** 1-based position of the last item marked `current`, or 1 when none is. */
	get resolvedCurrent(): number {
		const index = this._items.map(item => item.current).lastIndexOf(true);
		return index === -1 ? 1 : index + 1;
	}

	get currentItem(): NLDDStepIndicatorItem | undefined {
		return this._items.find(item => item.resolvedStatus === 'current')
			?? this._items[this.resolvedCurrent - 1];
	}

	/** `current` and `status` live on the children, so a change there has to
	 *  reach this element: the derived statuses and the compact view follow it. */
	private _observer = new MutationObserver(() => this.requestUpdate());

	private _warnedMultipleCurrent = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this._observer.observe(this, { subtree: true, attributes: true, attributeFilter: ['current', 'status'] });
		if (import.meta.env?.DEV && this.hasAttribute('current')) {
			console.warn('<nldd-step-indicator>: `current` moved to the step. Set it on the current `nldd-step-indicator-item` instead.');
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._observer.disconnect();
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
		this._syncItems();
		this._warnOnMultipleCurrent();
	}

	private _warnOnMultipleCurrent(): void {
		if (!import.meta.env?.DEV) return;
		const multiple = this._items.filter(item => item.current).length > 1;
		if (multiple && !this._warnedMultipleCurrent) {
			console.warn('<nldd-step-indicator>: more than one step has `current`; the last one wins. Mark only the step you are on.');
		}
		this._warnedMultipleCurrent = multiple;
	}

	/** Push position, derived status and status text down to the children. Push
	 *  rather than pull: a child cannot see where the current step sits. */
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
