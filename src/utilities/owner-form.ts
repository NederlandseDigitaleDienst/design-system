import { setState } from './element-state.js';

/**
 * The form a form-associated button acts on: the one it sits in, or the one
 * its `form` attribute names.
 *
 * The platform resolves that attribute itself, but only to a real `<form>`.
 * An `nldd-form` renders its form in the light DOM without handing it the id
 * the consumer wrote, so an id pointing at the component finds an element
 * that is not a form, and the button ends up with no form owner at all. That
 * is the whole reason a save button in a page footer, outside the form it
 * belongs to, used to do nothing.
 *
 * The id is looked up in the host's own root, the same scope the platform
 * searches: a button inside a shadow tree reaches the forms in that tree, not
 * one in the document around it. Put the two in the same tree, or hand the
 * button its form another way.
 *
 * Shared by nldd-button, nldd-split-button and a `submit` nldd-menu-item,
 * whose button sits in a shadow root and so has no form owner of its own.
 */
export function ownerForm(host: HTMLElement, internals?: ElementInternals): HTMLFormElement | null {
	const id = host.getAttribute('form');
	const root = host.getRootNode() as Document | ShadowRoot;
	const target = id && 'getElementById' in root ? root.getElementById(id) : null;
	const rendered = (target as { form?: unknown } | null)?.form;
	let form: HTMLFormElement | null = null;
	if (target instanceof HTMLFormElement) form = target;
	else if (rendered instanceof HTMLFormElement) form = rendered;
	// Nothing to submit is the silent failure this attribute exists to end:
	// the click does nothing and no error says why. Two facts, since a typo
	// and an nldd-form that has not rendered yet look identical from the
	// outside.
	setState(host, 'no-form-target', Boolean(id) && !target);
	setState(host, 'form-target-not-a-form', Boolean(target) && !form);
	// Without internals the host is not form-associated: it acts on the form it stands in.
	if (id) return form;
	return internals ? internals.form : host.closest('form');
}
