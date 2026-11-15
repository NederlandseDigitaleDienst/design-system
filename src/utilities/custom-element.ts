/**
 * Lit's decorator, plus the rule checks in a consumer's dev server. Every component
 * registers through here, so none of them can be imported without the checks.
 */
import './dev-checks-trigger.js';

export { customElement } from 'lit/decorators.js';

/**
 * The base class for an element without Lit. A server that renders the page has no
 * `HTMLElement`, and Lit brings only `customElements` there, so a plain
 * `extends HTMLElement` would stop the import with a ReferenceError.
 */
export const PlainElement: typeof HTMLElement =
	globalThis.HTMLElement ?? (class {} as unknown as typeof HTMLElement);
