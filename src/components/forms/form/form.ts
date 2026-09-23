/**
 * Nederlandse Digitale Dienst Form Component
 *
 * Plain custom element (extends HTMLElement, no Lit), required for light-DOM
 * autofill. Renders a real <form> element in the LIGHT DOM around its
 * children. Chrome's autofill engine looks for native <input> elements that
 * have a <form> ancestor in the light DOM; with shadow-DOM inputs it can't
 * find them, so we keep this component shadow-less.
 *
 * **Differs from other nldd-* components:**
 * - No shadowRoot: all children live in the light DOM (inside the inner <form>)
 * - No Lit: a plain HTMLElement with manual attribute mirroring
 * - **Requires a global stylesheet import**: the vertical rhythm rules live in
 *   `dist/css/form.css` (or `global.css`), not in a component-specific shadow
 *   stylesheet. Import it as part of your app's global CSS bundle.
 *
 * **Two usage modes:**
 *
 * 1. **Auto-wrap** (default): write children directly. Component creates a
 *    `<form>` element and migrates children into it via MutationObserver.
 *    Simplest API.
 *
 * 2. **User-provided form** (framework-friendly): write your own `<form>`
 *    as direct child. Component detects it, takes over attribute mirroring,
 *    and skips the migration. Children stay where your framework puts them,
 *    so there is no DOM shuffling to conflict with React/Vue/Angular
 *    reconciliation.
 *
 * **Framework interop:**
 *
 * In auto-wrap mode every direct child is moved into the inner form through a
 * MutationObserver. That works fine for most React/Vue use cases, because
 * frameworks only mutate the DOM when their virtual DOM changes. For edge
 * cases (animation libraries that track DOM position, SSR hydration
 * mismatches, frameworks that actively check sibling positions) use
 * **user-provided form** mode instead.
 *
 * For programmatic manipulation, use the `form` getter so you work with the
 * inner `<form>` element directly:
 *
 *     const inner = document.querySelector('nldd-form').form;
 *     inner.checkValidity();
 *     inner.appendChild(myInput);  // skips the migration overhead
 *
 * @element nldd-form
 *
 * @attr {string} label-alignment - Default `label-alignment` for descendant nldd-form-field and nldd-form-actions ('top' | 'right' | 'left'). Propagated to descendants as `form-label-alignment`. A `label-alignment` of its own on the descendant takes precedence through the CSS cascade.
 * @attr {string} name - Form name
 * @attr {string} autocomplete - 'on' | 'off' (form-level autofill toggle)
 * @attr {string} target - Submit target ('_self' | '_blank' | ...)
 * @attr {string} method - HTTP method ('get' | 'post' | 'dialog')
 * @attr {string} action - URL endpoint for submission
 * @attr {string} enctype - Encoding type for submission
 * @attr {boolean} novalidate - Skip native browser validation
 *
 * @prop {HTMLFormElement | null} form - The inner <form> element (read-only). Use it for `form.checkValidity()`, direct DOM manipulation, or as the target for framework-managed children.
 *
 * Events bubble naturally from the inner <form>:
 * @fires submit
 * @fires reset
 *
 * @example
 * Global stylesheet import (once, in your app entry):
 * ```js
 * import '@nldd/design-system/styles';
 * ```
 *
 * Auto-wrap mode:
 * ```html
 * <nldd-form name="profile" novalidate>
 *   <nldd-text-field name="email" autocomplete="email"></nldd-text-field>
 *   <nldd-button type="submit" text="Verstuur"></nldd-button>
 * </nldd-form>
 * ```
 *
 * User-provided form mode (React/Vue/Angular):
 * ```html
 * <nldd-form name="profile" novalidate>
 *   <form>
 *     <nldd-text-field name="email" autocomplete="email"></nldd-text-field>
 *     <nldd-button type="submit" text="Verstuur"></nldd-button>
 *   </form>
 * </nldd-form>
 * ```
 */

const FORWARDED_ATTRIBUTES = [
	'name',
	'action',
	'method',
	'novalidate',
	'enctype',
	'target',
	'autocomplete',
] as const;

const DESCENDANT_SELECTOR = 'nldd-form-field, nldd-form-actions';

export class NLDDForm extends HTMLElement {
	static get observedAttributes() {
		return [...FORWARDED_ATTRIBUTES, 'label-alignment'];
	}

	private _form: HTMLFormElement | null = null;
	private _observer: MutationObserver | null = null;

	/**
	 * Marks a control as invalid at the moment the platform says so, and
	 * unmarks it as soon as it is fixed.
	 *
	 * `setValidity` and the `invalid` attribute answer different questions.
	 * The first is whether the value is acceptable, which decides whether the
	 * form goes; the second is whether to show that, which is a design
	 * decision about timing. Without something joining them, a control whose
	 * validation list refuses a value blocks the submit while the screen says
	 * nothing.
	 *
	 * The browser already picks the moment: it fires `invalid` on every failing
	 * control when the form is submitted. That event does not bubble, so this
	 * listens in the capture phase. Setting the attribute earlier stays the
	 * consumer's call.
	 *
	 * Cancelling that event takes the native validation bubble away, and that is
	 * the point. This system writes its own messages, under the field, in its
	 * own type: a second one from the browser says the same thing again, in
	 * browser chrome, above the field, and disappears on its own while ours
	 * stays. A field that then has nothing to say is a field that needs an
	 * nldd-validation-list, not a bubble.
	 */
	private _handleInvalid = (e: Event) => {
		e.preventDefault();
		const control = e.target as Element | null;
		if (!control) return;

		// Every control, not just this one. The browser judged the whole form,
		// and a field that happened to pass has been asked the same question as
		// the one that failed. Marking only the failures would leave two fields
		// in one form behaving differently: break the one that passed and it
		// stays quiet, while its neighbour speaks up as you type.
		for (const el of this._form?.elements ?? []) this._judged.add(el);
		this._judged.add(control);

		control.toggleAttribute('invalid', true);

		// The browser fires invalid on every failing control in tree order, so
		// the first event of a round is the field to land on. Cancelling that
		// event above takes away the native bubble and, with it, the browser's
		// own move to the first failing field. Without this a submit that fails
		// leaves focus where it was, which for anyone not looking at the screen
		// means nothing happened at all: no bubble, no focus, and no live region
		// anywhere in a form. Deferred, so the whole round has been fired and
		// the submit algorithm is done before focus moves.
		if (this._focusTarget) return;
		this._focusTarget = control as HTMLElement;
		queueMicrotask(() => {
			this._focusTarget?.focus?.();
			this._focusTarget = null;
		});
	};

	/** The first control to fail this round, focused once the round is over. */
	private _focusTarget: HTMLElement | null = null;

	/**
	 * A reset takes the marks off with the values.
	 *
	 * A reset fires no `input`, so nothing above hears it and a field that was
	 * refused keeps its mark over a value the user just cleared. `judging` goes
	 * with it: the question has been withdrawn, so the hints come back and the
	 * field is what it was before anyone submitted.
	 *
	 * Deferred because the event comes first and the values go back after it,
	 * so anything read here would still be the old one.
	 */
	private _handleReset = () => {
		queueMicrotask(() => {
			this._judged = new WeakSet<Element>();
			for (const el of this._form?.elements ?? []) el.removeAttribute('invalid');
			for (const list of this.querySelectorAll('nldd-validation-list')) {
				list.removeAttribute('judging');
			}
		});
	};

	/**
	 * From the first verdict onward, the mark follows the value.
	 *
	 * The platform has no "valid" event, so without this a control that is put
	 * right keeps its mark until the next submit: you fixed it and the field
	 * still says you did not. And it has to work the other way too. Undo the
	 * fix and the value is refused again, so a form that stays quiet leaves you
	 * with a submit that does nothing and nothing on screen saying why.
	 *
	 * Only after that first verdict, which is what `_judged` remembers. Before
	 * it, a field would turn red on the first character typed into it, about a
	 * value nobody has asked for yet.
	 */
	private _handleInput = (e: Event) => {
		const control = e.target as (Element & { internals?: ElementInternals; validity?: ValidityState }) | null;
		if (!control || !this._judged.has(control)) return;
		const validity = control.internals?.validity ?? control.validity;
		if (validity) control.toggleAttribute('invalid', !validity.valid);
	};

	/** Controls the platform has judged at least once. */
	private _judged = new WeakSet<Element>();
	/** When true, user provided their own <form> child — skip migration. */
	private _userProvidedForm = false;

	connectedCallback(): void {
		// One-time setup: detect user-provided <form> or create one ourselves.
		// Subsequent connect cycles (move in DOM) skip this block but still
		// re-attach the observer below.
		if (!this._form) {
			// User-provided form mode: framework-managed <form> as direct
			// child. We take it over for attribute-mirroring/propagation but
			// skip migration so we don't conflict with framework reconciliation.
			const userForm = this.querySelector(':scope > form');
			if (userForm) {
				this._form = userForm as HTMLFormElement;
				this._userProvidedForm = true;
				this._mirrorAttributes();
			} else {
				// Auto-wrap mode: create inner <form> and migrate initial children.
				const form = document.createElement('form');
				this._form = form;
				this._mirrorAttributes();

				// Move existing light-DOM children into the form.
				// For HTML parsed by the browser, connectedCallback fires at the
				// opening tag — children are added one-by-one AFTER and surface
				// via the MutationObserver below. This loop only matters for
				// programmatic patterns (createElement + appendChild children +
				// then attach), where children are already present at connect.
				const initialChildren = Array.from(this.childNodes);
				for (const node of initialChildren) {
					form.appendChild(node);
				}
				this.appendChild(form);
			}
		}

		// (Re-)attach the observer on every connect. After disconnectedCallback
		// nulls _observer, a subsequent connectedCallback must rebuild it —
		// otherwise children appended after a move/reconnect would never land
		// in the inner <form>.
		if (!this._observer) {
			const form = this._form;
			const userProvided = this._userProvidedForm;
			this._observer = new MutationObserver(mutations => {
				for (const m of mutations) {
					// Migrate only direct children of the host (children of
					// the nldd-form itself, NOT descendants of e.g. a nested
					// form-section). Nested children are already inside the
					// inner form via their parent migration.
					if (m.target !== this) continue;
					// In user-provided form mode: skip migration. User's
					// framework controls placement; we don't shuffle DOM.
					if (userProvided) continue;
					m.addedNodes.forEach(node => {
						if (node === form) return;
						form.appendChild(node);
					});
				}
				// Newly added descendants — also from inside a nested
				// nldd-form-section — should receive the inherited alignment.
				this._propagateLabelAlignment(this.getAttribute('label-alignment'));
			});
			// subtree:true so dynamically added form-fields inside a
			// nested form-section are pulled in by the propagation as well.
			this._observer.observe(this, { childList: true, subtree: true });
		}

		this.addEventListener('invalid', this._handleInvalid, true);
		this.addEventListener('input', this._handleInput);
		this.addEventListener('reset', this._handleReset);

		// Propagate label-alignment to current children (initial + after reconnect)
		this._propagateLabelAlignment(this.getAttribute('label-alignment'));
	}

	disconnectedCallback(): void {
		this._observer?.disconnect();
		this._observer = null;
		this.removeEventListener('invalid', this._handleInvalid, true);
		this.removeEventListener('input', this._handleInput);
		this.removeEventListener('reset', this._handleReset);
	}

	attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null): void {
		if (name === 'label-alignment') {
			this._propagateLabelAlignment(newVal);
			return;
		}
		if (!this._form) return;
		if (newVal === null) this._form.removeAttribute(name);
		else this._form.setAttribute(name, newVal);
	}

	/**
	 * Push `label-alignment` to descendant nldd-form-field and nldd-form-actions
	 * elements as a separate `form-label-alignment` attribute, defaulting to
	 * `'top'` when the form itself has no `label-alignment`. Descendant CSS
	 * uses `[label-alignment="X"]` first and falls back to
	 * `[form-label-alignment="X"]` when no own value is set, so a consumer's
	 * explicit `label-alignment` always wins automatically — without us having
	 * to track which elements we previously inherited to.
	 *
	 * Always-setting (rather than only when the form has its own value) lets
	 * downstream selectors assume the attribute is present on every descendant
	 * inside an `nldd-form`, which keeps form.css's adjacent-sibling tight-gap
	 * rule simple.
	 *
	 * The two-attribute split also avoids the historical Lit reflect-default
	 * vs MutationObserver timing race: we never touch `label-alignment` on
	 * the descendant, so a freshly upgraded Lit element reflecting its default
	 * doesn't conflict with the form's intent.
	 */
	private _propagateLabelAlignment(value: string | null): void {
		const fields = this.querySelectorAll<HTMLElement>(DESCENDANT_SELECTOR);
		fields.forEach(f => f.setAttribute('form-label-alignment', value ?? 'top'));
	}

	private _mirrorAttributes(): void {
		if (!this._form) return;
		for (const attr of FORWARDED_ATTRIBUTES) {
			const val = this.getAttribute(attr);
			if (val !== null) this._form.setAttribute(attr, val);
		}
	}

	/** The inner <form> element. Useful for `form.checkValidity()` etc. */
	get form(): HTMLFormElement | null {
		return this._form;
	}
}

if (!customElements.get('nldd-form')) {
	customElements.define('nldd-form', NLDDForm);
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-form': NLDDForm;
	}
}
