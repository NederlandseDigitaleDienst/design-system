import { it, expect } from 'vitest';
import manifest from '../../custom-elements.json';

interface Attribute { name: string; type?: { text: string } }
interface Declaration { tagName?: string; attributes?: Attribute[] }

/** A value of the attribute's own type, so its converter really runs. */
function sample(attribute: Attribute): string {
	const type = attribute.type?.text ?? 'string';
	const literal = type.match(/'([^']*)'/);
	if (literal) return literal[1];
	if (/\bboolean\b/.test(type)) return '';
	if (/\bnumber\b/.test(type)) return '1';
	return 'x';
}

// An element already in the page upgrades while its class is defined, before
// the rest of the module has run. Anything at module level below the class
// that the constructor, a converter or connectedCallback reads is then not
// there yet (a const in its temporal dead zone throws). Tests that create
// elements after the import never see it, so this file puts every tag in the
// page first, with every attribute, and only then loads the components.
it('upgrades every component that is already in the page', async () => {
	const errors: string[] = [];
	const onError = (event: ErrorEvent) => errors.push(event.message);
	const onRejection = (event: PromiseRejectionEvent) => {
		errors.push(String(event.reason));
		event.preventDefault();
	};
	window.addEventListener('error', onError);
	window.addEventListener('unhandledrejection', onRejection);

	const declarations = (manifest as { modules: Array<{ declarations?: Declaration[] }> }).modules
		.flatMap((module) => module.declarations ?? [])
		.filter((declaration): declaration is Declaration & { tagName: string } => !!declaration.tagName);
	const host = document.createElement('div');
	for (const { tagName, attributes = [] } of declarations) {
		const el = document.createElement(tagName);
		for (const attribute of attributes) el.setAttribute(attribute.name, sample(attribute));
		host.append(el);
	}
	document.body.append(host);

	await import('./index.js');
	await new Promise((resolve) => setTimeout(resolve, 50));
	window.removeEventListener('error', onError);
	window.removeEventListener('unhandledrejection', onRejection);
	host.remove();

	expect(declarations.length).toBeGreaterThan(100);
	expect(errors).toEqual([]);
});
