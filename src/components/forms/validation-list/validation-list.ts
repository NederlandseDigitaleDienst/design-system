/**
 * Nederlandse Digitale Dienst Validation List (Lit + TypeScript)
 *
 * Everything a value has to satisfy, in one list. A requirement you can state
 * up front is an item with a rule, and it checks itself while you type. One
 * only a server can decide is an item without a rule, and the app names it in
 * `unmet` on the control.
 *
 * The list has two modes and `judging` is the switch. Before a verdict it shows
 * its hints, which are the requirements of the field. After one it shows
 * everything the value does not satisfy, and the hints are gone. It throws that
 * switch itself the moment its control turns `invalid`, so when the field is
 * judged is the consumer's decision, and the right moment is on submit.
 *
 * Hints are off by default. A phone number does not need its format spelled out
 * before anyone has typed, while the rules for a password do.
 *
 * There are no checkmarks. The control already shows a validation icon of its
 * own, and repeating that per line says the same thing three times.
 *
 * @element nldd-validation-list
 *
 * @attr {string} for - Id of the control this list is about. Not needed inside an nldd-form-field, which hands its own control over.
 * @attr {boolean} hint - Show every item before there is a verdict, as the requirements of the field. Overridable per item.
 * @attr {boolean} judging - Drop the hints, because this field has been judged. Turned on by the list itself once its control is `invalid`, and settable by hand. What turns red follows `invalid`, not this.
 *
 * @slot - nldd-validation-item elements.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @element nldd-validation-item
 *
 * One requirement of a value, with the rule that checks it. Give every item an
 * id that names its field as well as its rule: an id has to be unique in the
 * whole document, and `length` is the first thing three fields in one form will
 * all reach for. Write the text as the requirement ("Minimaal 8 tekens"), not as
 * the command ("Gebruik minimaal 8 tekens"): before a verdict it stands there as
 * what the field wants, after one as what the value does not meet.
 *
 * @attr {string} match - Regular expression the value has to contain. Not anchored, unlike the native `pattern`: `[A-Z]` means "has a capital in it".
 * @attr {number} minlength - Fewest characters the value may have.
 * @attr {number} maxlength - Most characters the value may have.
 * @attr {boolean} required - The value may not be empty. Use it on a field whose other rules would pass an empty value.
 * @attr {boolean} hint - Show this item before there is a verdict, whatever the list says.
 * @attr {boolean} unmet - Whether the value fails this item. Managed by the list; do not set it yourself.
 * @attr {boolean} visible - Whether the item is on screen. Managed by the list.
 *
 * @slot - The text of the requirement.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * @example
 * <nldd-form-field label="Wachtwoord">
 *   <nldd-password-field name="password" invalid unmet="password-breach"></nldd-password-field>
 *   <nldd-validation-list hint>
 *     <nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
 *     <nldd-validation-item id="password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
 *     <nldd-validation-item id="password-breach">Dit wachtwoord staat in een bekend datalek</nldd-validation-item>
 *   </nldd-validation-list>
 * </nldd-form-field>
 */
import { LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { validationListStyles, validationItemStyles } from './validation-list.styles.js';
import { validationListTemplate, validationItemTemplate } from './validation-list.template.js';

/** A control that can report its own validity to the form. */
interface ValidatableControl extends Element {
	internals?: ElementInternals;
	setCustomValidity?: (message: string) => void;
	value?: unknown;
}


/* ============================================================
   nldd-validation-item
   ============================================================ */

@customElement('nldd-validation-item')
export class NLDDValidationItem extends LitElement {
	static override styles = validationItemStyles;

	/** Not anchored, unlike the native `pattern`. See the note at the top. */
	@property({ type: String })
	match = '';

	@property({ type: Number })
	minlength?: number;

	@property({ type: Number })
	maxlength?: number;

	/** For a field whose other rules would pass an empty value. See `test`. */
	@property({ type: Boolean, reflect: true })
	required = false;

	@property({ type: Boolean, reflect: true })
	hint = false;

	@property({ type: Boolean, reflect: true })
	unmet = false;

	@property({ type: Boolean, reflect: true })
	visible = false;

	/** Whether this item judges itself, or waits for the app to name it. */
	get hasRule(): boolean {
		return this.required
			|| Boolean(this.match)
			|| this.minlength !== undefined
			|| this.maxlength !== undefined;
	}

	/**
	 * Whether `value` satisfies this item, or null when there is nothing to
	 * satisfy because the item carries no rule.
	 *
	 * An empty value is held against the rules like any other, so "minimaal 8
	 * tekens" fails on it, because it does. What keeps a fresh field from
	 * lighting up all of its requirements is not this method but the verdict: an
	 * item only turns critical once the control says `invalid`, and an untouched
	 * field has not been judged yet.
	 */
	test(value: string): boolean | null {
		if (!this.hasRule) return null;
		if (this.required && !value) return false;
		if (this.minlength !== undefined && value.length < this.minlength) return false;
		if (this.maxlength !== undefined && value.length > this.maxlength) return false;
		if (this.match && !new RegExp(this.match, 'u').test(value)) return false;
		return true;
	}

	override connectedCallback() {
		super.connectedCallback();
		this.setAttribute('role', 'listitem');
	}

	override render() {
		return validationItemTemplate(this);
	}
}


/* ============================================================
   nldd-validation-list
   ============================================================ */

@customElement('nldd-validation-list')
export class NLDDValidationList extends LitElement {
	static override styles = validationListStyles;

	/** Id of the control, for a list that sits outside an nldd-form-field. */
	@property({ type: String })
	for = '';

	@property({ type: Boolean, reflect: true })
	hint = false;

	/**
	 * Whether the list is judging the value or explaining what the field wants.
	 *
	 * The switch between the two modes. Off, the hints state the requirements;
	 * on, they are gone and what is left is whatever the value fails. It goes on
	 * the moment the control is `invalid`, and then stays on. A field that has
	 * been judged does not become unjudged: repair the value and the control
	 * turns valid again, but the question the hints answered has been asked and
	 * settled, so bringing them back would undo the one thing the verdict
	 * achieved.
	 *
	 * What it does not decide is what turns red. That follows `invalid` on the
	 * control and nothing else, so a line never goes critical under a field that
	 * looks fine.
	 *
	 * So when a field starts being judged is decided by whoever writes `invalid`
	 * on the control, and the moment to do that is on submit. Writing it while
	 * someone is still typing turns a field red about a value that is not
	 * finished, which is the one thing this list is built to avoid.
	 *
	 * Set it yourself to flip the mode without a control saying anything, and
	 * clear it to put the field back the way it started, which is what a reset
	 * wants.
	 */
	@property({ type: Boolean, reflect: true })
	judging = false;

	/**
	 * The control this list is about.
	 *
	 * Set by the wrapping nldd-form-field, which already answers "which control
	 * is this field about" for the label and the description. A `for` of its own
	 * wins, and setting this property directly is what a test or a story does.
	 */
	@property({ attribute: false })
	control: Element | null = null;

	/** The value to check, when there is no control to read it from. */
	@property({ attribute: false })
	value?: string;

	@state()
	private _resolved: Element | null = null;

	private _observer: MutationObserver | null = null;
	private _onInput = () => this._evaluate();

	override connectedCallback() {
		super.connectedCallback();
		this._resolve();
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._detach();
	}

	/**
	 * Resolving and latching happen before the render, not after it.
	 *
	 * Both write a reactive property, `_resolved` and `judging`, and writing one
	 * from `updated()` asks for a second render on top of the one that just
	 * finished. That is a dev-mode warning on every field that arrives already
	 * invalid. Reading what they need does not take a render: the control is
	 * found by id or handed over as a property, and the items are light DOM.
	 */
	override willUpdate(changed: PropertyValues) {
		if (changed.has('for') || changed.has('control')) this._resolve();
		this._latchJudging();
	}

	override updated() {
		this._evaluate();
	}

	/**
	 * A field that has been judged does not become unjudged, so this only ever
	 * goes on. What turns red is `invalid` and nothing else; this decides only
	 * whether the hints are still on screen.
	 */
	private _latchJudging(): void {
		if (this._resolved?.hasAttribute('invalid')) this.judging = true;
	}

	override render() {
		return validationListTemplate(this);
	}

	private get _items(): NLDDValidationItem[] {
		return Array.from(this.children)
			.filter((el): el is NLDDValidationItem => el instanceof NLDDValidationItem);
	}

	/**
	 * Finds the control and starts listening to it.
	 *
	 * `getRootNode()` and not `document`: an IDREF only resolves inside its own
	 * tree, and a consumer who puts this form inside a component of their own
	 * would otherwise find nothing.
	 */
	private _resolve(): void {
		const root = this.getRootNode() as Document | ShadowRoot;
		const next = this.for ? root.getElementById?.(this.for) ?? null : this.control;
		// `_observer` and not just the control: taking this element out of the DOM
		// and putting it back, which is what a consumer portalling a sheet to the
		// body does, runs disconnectedCallback and takes the listener with it. The
		// control never changed, so comparing only that would find no work to do
		// and the list would sit there reacting to nothing.
		if (next === this._resolved && this._observer) return;

		this._detach();
		this._resolved = next;
		if (!next) return;

		next.addEventListener('input', this._onInput);
		this._observer = new MutationObserver(() => {
			this._latchJudging();
			this._evaluate();
		});
		this._observer.observe(next, { attributes: true, attributeFilter: ['invalid', 'unmet'] });
	}

	private _detach(): void {
		this._resolved?.removeEventListener('input', this._onInput);
		this._observer?.disconnect();
		this._observer = null;
	}

	private _currentValue(): string {
		if (this.value !== undefined) return this.value;
		const control = this._resolved as ValidatableControl | null;
		return control?.value === undefined || control.value === null ? '' : String(control.value);
	}

	/**
	 * Decides per item whether it is met, and what that makes visible.
	 *
	 * An item with a rule judges itself; one without waits to be named in
	 * `unmet` on the control. Never both: a rule is held against the value as it
	 * is now, while `unmet` is a snapshot of the last check and therefore older,
	 * so letting the snapshot win would show a mistake that has been fixed.
	 */
	private _evaluate(): void {
		const control = this._resolved;
		// The two attributes answer two questions and are kept apart on purpose.
		// `invalid` decides what turns critical, so a line never goes red under a
		// field that looks fine; `judging` only decides whether the hints are
		// still on screen, and unlike `invalid` it does not come back off.
		const invalid = control?.hasAttribute('invalid') ?? false;
		const named = (control?.getAttribute('unmet') ?? '').split(' ').filter(Boolean);
		const value = this._currentValue();

		let anyVisible = false;
		let anyRuleFails = false;
		const messages: string[] = [];

		for (const item of this._items) {
			const rule = item.test(value);
			const failing = rule === null ? named.includes(item.id) : !rule;

			if (import.meta.env?.DEV && rule !== null && named.includes(item.id)) {
				console.warn(
					`<nldd-validation-list>: item "${item.id}" has a rule of its own and is also named in \`unmet\`. `
					+ 'The rule decides, and the name is ignored: it is a snapshot of the previous check and cannot be newer '
					+ 'than the value. Drop it from `unmet`, or take the rule off the item.',
				);
			}

			item.unmet = invalid && failing;
			item.visible = item.unmet || (!this.judging && (item.hint || this.hint));
			if (item.visible) anyVisible = true;
			if (rule === false) {
				anyRuleFails = true;
				messages.push(item.textContent?.trim() ?? '');
			}
		}

		this.classList.toggle('has-items', anyVisible);
		this._reportValidity(anyRuleFails, messages);
	}

	/**
	 * Hands the verdict to the control, so a form with a failing rule does not
	 * submit.
	 *
	 * Only the rules. What the app named in `unmet` it already knows, and
	 * reporting that back would be this list telling the app what the app told
	 * it.
	 *
	 * Through `setCustomValidity` and not into `internals` directly. A control
	 * reports its own `required` and `pattern` through the same channel, and
	 * `setValidity` writes the whole set of flags at once: writing here would
	 * erase those on the way in, and they would erase this on the next render.
	 * The platform's own name for a reason of your own is the one both sides
	 * understand, and a plain native input answers to it too.
	 */
	private _reportValidity(fails: boolean, messages: string[]): void {
		const control = this._resolved as ValidatableControl | null;
		if (!control?.setCustomValidity) return;
		control.setCustomValidity(fails ? messages.filter(Boolean).join('. ') : '');
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'nldd-validation-list': NLDDValidationList;
		'nldd-validation-item': NLDDValidationItem;
	}
}
