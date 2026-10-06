/**
 * Nederlandse Digitale Dienst Step Bar Component (Lit + TypeScript)
 *
 * Shows where you are in a process of several steps: a row of discs with a
 * number (or a check mark on what is done), a label under each and a line
 * connecting them. Other systems call this a stepper or a progress indicator.
 *
 * Mark the step you are on with `status="current"`. The parent derives the
 * rest from its position: `past` before it, `future` after. With none marked,
 * step 1 is current. With more than one, the last one wins and a warning goes
 * to the console in a dev build: a flow that forgets to clear the previous
 * step still points at the furthest one. A `status="past"` or
 * `status="future"` on another step overrides what is derived for that step,
 * for flows that jump back or skip a step. One attribute, the same three
 * values as `nldd-step-cell`, so a flow reads in one vocabulary
 * whether it runs across or down.
 *
 * Horizontal only. For steps under each other, build an `nldd-list` with an
 * `nldd-step-cell` and an `nldd-title-cell` per row: vertical steps
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
 * @element nldd-step-bar
 *
 * @attr {string} accessible-label - Name of the nav; defaults to the i18n value ("Voortgang")
 * @attr {object} translations - Override translation keys; unset keys fall back to Dutch
 *
 * @slot - `nldd-step-bar-item` children
 *
 * @example
 * ```html
 * <nldd-step-bar accessible-label="Voortgang aanvraag">
 *   <nldd-step-bar-item text="Gegevens"></nldd-step-bar-item>
 *   <nldd-step-bar-item text="Controle" status="current"></nldd-step-bar-item>
 *   <nldd-step-bar-item text="Bevestigen"></nldd-step-bar-item>
 * </nldd-step-bar>
 * ```
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nlddStepBarTranslations, type NLDDStepBarTranslations } from './step-bar.i18n.js';
import { stepBarStyles, stepBarItemStyles } from './step-bar.styles.js';
import { stepBarTemplate, stepBarItemTemplate } from './step-bar.template.js';
import '../../content/icon/icon.js';

/** The same three names as nldd-step-cell, so one flow reads in a
 *  single vocabulary whether it runs horizontally or vertically. */
export type StepBarStatus = 'past' | 'current' | 'future';


// # nldd-step-bar-item

/**
 * One step in an `nldd-step-bar`. `status="current"` marks the step you
 * are on; the parent derives the status of the others and the number of each,
 * which live here as internal state rather than as public API. `past` and
 * `future` override what is derived for this step.
 *
 * @element nldd-step-bar-item
 *
 * @attr {'past' | 'current' | 'future'} status - How far along this step is. `current` marks the step you are on (`aria-current="step"`) and the parent derives the others from it: with none marked step 1 is current, with more than one the last wins. `past` and `future` override what is derived for this step only
 * @attr {string} text - Label under the disc
 * @attr {string} icon - Icon in the disc instead of the number or the check mark
 * @attr {string} href - Makes the step a link (back to a completed step, for instance)
 * @attr {boolean} button - Makes the step a button, for flows without a URL per step; ignored when `href` is set
 *
 * @slot - Label (an alternative to `text`)
 */
export class NLDDStepBarItem extends LitElement {
	static override styles = stepBarItemStyles;

	@property({ type: String, reflect: true })
	status?: StepBarStatus;

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
	_derivedStatus: StepBarStatus = 'future';

	@state()
	_index = 1;

	@state()
	_statusText = '';

	/** The status that counts. An own `past` or `future` wins over the derived
	 *  one. An own `current` is what the parent derives from, so the derived
	 *  status already says it, and on a step that lost to a later one it does not
	 *  hold. */
	get resolvedStatus(): StepBarStatus {
		return this.status && this.status !== 'current' ? this.status : this._derivedStatus;
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
		return stepBarItemTemplate(this);
	}
}

// Sub-component of nldd-step-bar. The guard registration (like
// nldd-breadcrumbs-item's) keeps the first registration authoritative across HMR
// and test re-imports.
if (!customElements.get('nldd-step-bar-item')) {
	customElements.define('nldd-step-bar-item', NLDDStepBarItem);
}


// # nldd-step-bar

@customElement('nldd-step-bar')
export class NLDDStepBar extends withTranslations<NLDDStepBarTranslations>(
	LitElement,
	nlddStepBarTranslations,
) {
	static override styles = stepBarStyles;

	@property({ type: String, attribute: 'accessible-label' })
	accessibleLabel = '';

	/** The steps, tracked so the compact view (text + bar) is driven by the same
	 *  source as the row of markers. */
	@state()
	_items: NLDDStepBarItem[] = [];

	get total(): number {
		return this._items.length;
	}

	/** 1-based position of the last item with `status="current"`, or 1 when none has it. */
	get resolvedCurrent(): number {
		const index = this._items.map(item => item.status).lastIndexOf('current');
		return index === -1 ? 1 : index + 1;
	}

	get currentItem(): NLDDStepBarItem | undefined {
		return this._items.find(item => item.resolvedStatus === 'current')
			?? this._items[this.resolvedCurrent - 1];
	}

	/** `status` lives on the children, so a change there has to reach this
	 *  element: the derived statuses and the compact view follow it. */
	private _observer = new MutationObserver(() => this.requestUpdate());

	private _warnedMultipleCurrent = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this._observer.observe(this, { subtree: true, attributes: true, attributeFilter: ['status'] });
	}

	/** `current` is no longer an attribute of this element. Watched anyway, so a
	 *  leftover one gets a hint, also when a framework sets it after the first
	 *  render: Vue and React fall back to the attribute for an unknown property. */
	static override get observedAttributes(): string[] {
		return [...super.observedAttributes, 'current'];
	}

	override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
		super.attributeChangedCallback(name, old, value);
		if (import.meta.env?.DEV && name === 'current' && value !== null) {
			console.warn('<nldd-step-bar>: `current` moved to the step. Set `status="current"` on the current `nldd-step-bar-item` instead.');
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._observer.disconnect();
	}

	_onSlotChange = (e: Event): void => {
		const slot = e.target as HTMLSlotElement;
		this._items = slot.assignedElements({ flatten: true })
			.filter((el): el is NLDDStepBarItem => el.localName === 'nldd-step-bar-item');
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
		const multiple = this._items.filter(item => item.status === 'current').length > 1;
		if (multiple && !this._warnedMultipleCurrent) {
			console.warn('<nldd-step-bar>: more than one step has `status="current"`; the last one wins. Mark only the step you are on.');
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
			item._statusText = this._t(`components.step-bar.status-${item.resolvedStatus}-label`);
		});
	}

	override render() {
		return stepBarTemplate(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-step-bar': NLDDStepBar;
		'nldd-step-bar-item': NLDDStepBarItem;
	}
}
