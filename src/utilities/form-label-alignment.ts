import { styleState } from './element-state.js';

/**
 * Gives a field or the actions of an nldd-form the label alignment of that form,
 * as `:state(form-label-left)` or `:state(form-label-right)`. Their own
 * `label-alignment` wins in their styles. The element calls it when it connects,
 * the form when its alignment or its content changes.
 */
export function syncFormLabelAlignment(element: HTMLElement): void {
	const value = element.closest('nldd-form')?.getAttribute('label-alignment');
	styleState(element, 'form-label-left', value === 'left');
	styleState(element, 'form-label-right', value === 'right');
}
