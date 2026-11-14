import { property } from 'lit/decorators.js';
import { LitElement, type ReactiveController } from 'lit';

// Abstract, so an abstract base (nldd-code-editor and nldd-text-editor share
// NLDDCodeMirrorElement) can be mixed in too.
type Constructor<T = Record<string, unknown>> = abstract new (...args: any[]) => T;

/** An element that accepts references to the elements describing it. */
export interface DescribedElement {
	describedByElements: readonly Element[];
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
		/** Set by nldd-form-field. A consumer never writes this. */
		@property({ attribute: false })
		describedByElements: readonly Element[] = [];

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
					applyDescribedBy(target, [...this.describedByElements, ...this.ownDescriptions()], onSelf);
					// Optional: nldd-button carries this mixin for its description and
					// has no validity of its own.
					const invalid = (this as { invalid?: boolean }).invalid;
					if (invalid !== undefined) applyInvalid(target, invalid, onSelf);
				},
			};
			this.addController(apply);
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
