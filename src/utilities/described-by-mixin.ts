import { property } from 'lit/decorators.js';
import { LitElement, type ReactiveController } from 'lit';
import { setState } from './element-state.js';

// Abstract, so an abstract base (nldd-code-editor and nldd-text-editor share
// NLDDCodeMirrorElement) can be mixed in too.
type Constructor<T = Record<string, unknown>> = abstract new (...args: any[]) => T;

/** An element that accepts references to the elements describing it. */
export interface DescribedElement {
	describedByElements: readonly Element[];
	accessibleDescription: string;
	accessibleDescribedBy: string;
	/** The element the description belongs to. Override where it differs. */
	describedTarget(): Element | null;
	/** Elements the component itself adds to the description. */
	ownDescriptions(): readonly Element[];
}

/**
 * Points an element at the elements that describe it.
 *
 * Element references and not ids, because an id only resolves inside the tree
 * of the element that carries it. An `aria-describedby="err"` on an input in a
 * shadow root cannot find an error text in the light DOM: the attribute is
 * written, the id is right, and the description comes out empty.
 * `ariaDescribedByElements` takes the elements themselves and crosses the
 * boundary.
 */
export function applyDescribedBy(
	target: Element | null | undefined,
	elements: readonly Element[],
	onSelf = false,
): void {
	if (!target) return;

	// A component that wraps another one hands the question on rather than
	// answering it. nldd-checkbox-field renders an nldd-checkbox, and only that
	// one knows which element inside itself is the control.
	if (!onSelf && 'describedByElements' in target) {
		(target as unknown as DescribedElement).describedByElements = [...elements];
		return;
	}

	const el = target as Element & { ariaDescribedByElements: readonly Element[] | null };
	el.ariaDescribedByElements = elements.length ? [...elements] : null;
}

/**
 * Announces that a control is invalid, on the element assistive software meets.
 *
 * Nothing is drawn for it, and that is a decision rather than an omission: what
 * is wrong belongs in an nldd-validation-list, in words. A red ring
 * around a single checkbox would say the option is wrong, while it is the
 * question that is unanswered. Choosing not to show it is no reason to keep
 * quiet about it, so `aria-invalid` goes on regardless.
 *
 * A component that wraps another one hands the state on, the same way it hands
 * on the description.
 */
export function applyInvalid(target: Element | null | undefined, invalid: boolean, onSelf = false): void {
	if (!target) return;
	if (!onSelf && 'invalid' in target) {
		(target as Element & { invalid: boolean }).invalid = invalid;
		return;
	}
	if (invalid) target.setAttribute('aria-invalid', 'true');
	else target.removeAttribute('aria-invalid');
}

/**
 * Lets nldd-form-field hand a control the help and error texts that describe
 * it, wherever that control renders them.
 *
 * The component answers where, because only it knows: a text field describes
 * its inner input, a radio group describes itself because it carries the role,
 * and an editor describes the contenteditable it builds. Override
 * `describedTarget()` when the default of "the first native control in my
 * shadow root" is not it.
 *
 * A controller, not an `updated()` override: a component that defines its own
 * `updated()` would have to remember to call super, and forgetting that fails
 * silently in exactly the way this mixin exists to prevent.
 */
export function DescribedBy<T extends Constructor<LitElement>>(
	Base: T,
): T & Constructor<DescribedElement> {
	abstract class DescribedByMixin extends Base implements DescribedElement {
		/** Set by nldd-form-field. A consumer never writes this: the app has
		 *  `accessible-described-by` and `accessible-description`. */
		@property({ attribute: false })
		describedByElements: readonly Element[] = [];

		/**
		 * A description in words, read after the name, role and state, as
		 * `aria-description` would. Extra information, never the name: a button
		 * with only an icon still needs its `accessible-label`. Not shown; prefer
		 * `accessible-described-by` to text that is on the page. That one wins
		 * when it finds an element, as `aria-describedby` wins from
		 * `aria-description`.
		 */
		@property({ type: String, reflect: true, attribute: 'accessible-description' })
		accessibleDescription = '';

		/**
		 * IDs of elements whose text describes this control, separated by spaces,
		 * as `aria-describedby` takes them. Looked up in the tree of this element
		 * and handed to the control inside, where an `aria-describedby` on the
		 * host would not reach. Read after the name, role and state, after the
		 * help and error text of an nldd-form-field.
		 */
		@property({ type: String, reflect: true, attribute: 'accessible-described-by' })
		accessibleDescribedBy = '';

		/** The hidden element that carries `accessible-description` in the shadow
		 *  root, for the control to point at. Public for the same reason as
		 *  `describedTarget()`. */
		_descriptionTextElement: HTMLElement | null = null;

		constructor(...args: any[]) {
			super(...args);
			const apply: ReactiveController = {
				hostUpdated: () => {
					const target = this.describedTarget();
					// A component that is the control itself, such as an
					// nldd-radio-button carrying role="radio", puts the ARIA on its own
					// element. Handing it on there would hand it to itself, and a
					// component that does that renders forever.
					const onSelf = target === this;
					applyDescribedBy(target, [...this.describedByElements, ...this._appDescriptions(onSelf), ...this.ownDescriptions()], onSelf);
					// Optional: nldd-button carries this mixin for its description and
					// has no validity of its own.
					const invalid = (this as { invalid?: boolean }).invalid;
					if (invalid !== undefined) applyInvalid(target, invalid, onSelf);
				},
			};
			this.addController(apply);
			// An element named by `accessible-described-by` may arrive after this
			// one; look again when it matters, as focus arrives.
			this.addEventListener('focusin', () => this.requestUpdate());
		}

		/**
		 * What the app gives as the description: the elements that
		 * `accessible-described-by` names, or else the text of
		 * `accessible-description`. Public for the same reason as
		 * `describedTarget()`.
		 */
		_appDescriptions(onSelf: boolean): readonly Element[] {
			const ids = (this.accessibleDescribedBy ?? '').split(/\s+/).filter(Boolean);
			const root = this.getRootNode() as Document | ShadowRoot;
			const named = ids
				.map((id) => (root.getElementById ? root.getElementById(id) : null))
				.filter((el): el is HTMLElement => el !== null);
			setState(this, 'no-description-target', named.length < ids.length);
			const text = named.length ? '' : (this.accessibleDescription ?? '').trim();
			// A control that is this element cannot point into its own shadow
			// root, so it says the text itself.
			if (onSelf) {
				(this as unknown as { ariaDescription: string | null }).ariaDescription = text || null;
				return named;
			}
			if (text) {
				let el = this._descriptionTextElement;
				if (!el || el.getRootNode() !== this.shadowRoot) {
					el = document.createElement('span');
					el.hidden = true;
					el.dataset.description = '';
					this.shadowRoot?.append(el);
					this._descriptionTextElement = el;
				}
				el.textContent = text;
				return [el];
			}
			this._descriptionTextElement?.remove();
			this._descriptionTextElement = null;
			return named;
		}

		/**
		 * The element the description belongs to. Override where it differs.
		 *
		 * Public rather than protected because TypeScript refuses to emit a
		 * declaration for an anonymous class with protected members, and a mixin
		 * returns exactly that. Same reason `formValue()` is public in
		 * FormAssociated.
		 */
		describedTarget(): Element | null {
			return this.shadowRoot?.querySelector('input, textarea, select') ?? null;
		}

		/**
		 * Elements the component itself adds to the description, after those of
		 * nldd-form-field: the popover in the `interest` slot of nldd-button.
		 * Request an update when this changes. Public for the same reason as
		 * `describedTarget()`.
		 */
		ownDescriptions(): readonly Element[] {
			return [];
		}
	}
	// Annotated rather than inferred: an inferred mixin return type writes the
	// whole anonymous class into the .d.ts, privates of the base included, and
	// TypeScript refuses to emit that (TS4094). Nesting two mixins makes it
	// certain.
	return DescribedByMixin as unknown as T & Constructor<DescribedElement>;
}
