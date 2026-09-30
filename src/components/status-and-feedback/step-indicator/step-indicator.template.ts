import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDStepIndicator, NLDDStepIndicatorItem } from './step-indicator.js';

export function stepIndicatorTemplate(component: NLDDStepIndicator): TemplateResult {
	const label = component.accessibleLabel || component._t('components.step-indicator.accessible-label');
	const current = component.resolvedCurrent;
	const total = component.total;
	const currentTitle = component.currentItem?.text ?? '';
	const compactText = component._t('components.step-indicator.compact-text', { current, total });

	return html`
		<nav class="step-indicator"
			aria-label=${label || nothing}
		>
			<div class="step-indicator__items"
				role="list"
			>
				<slot @slotchange=${component._onSlotChange}></slot>
			</div>
			${total > 0 ? html`
				<p class="step-indicator__compact-text"
					aria-hidden="true"
				>
					${currentTitle ? html`<span class="step-indicator__compact-title">${currentTitle}</span>` : nothing}
					<span class="step-indicator__compact-count">${compactText}</span>
				</p>
				<div class="step-indicator__compact-bar"
					aria-hidden="true"
				>
					${Array.from({ length: total }, (_, index) => html`
						<span class="step-indicator__compact-bar-segment"
							?data-filled=${index + 1 <= current}
						></span>
					`)}
				</div>
			` : nothing}
		</nav>
	`;
}

export function stepIndicatorItemTemplate(component: NLDDStepIndicatorItem): TemplateResult {
	const status = component.resolvedStatus;
	// A past step shows a check mark instead of its number; the number stays in
	// the status text for anyone who can't see it.
	const marker = component.icon
		? html`<nldd-icon class="step-indicator__item-icon" icon=${component.icon}></nldd-icon>`
		: status === 'past'
			? html`<nldd-icon class="step-indicator__item-icon" icon="check-mark"></nldd-icon>`
			: html`<span class="step-indicator__item-number">${component._index}</span>`;

	const content = html`
		<span class="step-indicator__item-marker"
			aria-hidden="true"
		>${marker}</span>
		<span class="step-indicator__item-title">
			${component.text || html`<slot></slot>`}
			<span class="step-indicator__item-status">, ${component._statusText}</span>
		</span>
	`;

	return html`
		<div class="step-indicator__item is-${status}">
			${component.href ? html`
				<a class="step-indicator__item-control"
					href=${component.href}
				>${content}</a>
			` : component.button ? html`
				<button class="step-indicator__item-control"
					type="button"
				>${content}</button>
			` : content}
		</div>
	`;
}
