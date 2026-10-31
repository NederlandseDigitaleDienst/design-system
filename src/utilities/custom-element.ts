/**
 * Lit's decorator, plus the rule checks in a consumer's dev server. Every component
 * registers through here, so none of them can be imported without the checks.
 */
import './dev-checks-trigger.js';

export { customElement } from 'lit/decorators.js';
