import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDStepBar, NLDDStepBarItem } from './step-bar.js';

export function stepBarTemplate(component: NLDDStepBar): TemplateResult {
	const label = component.accessibleLabel || component._t('components.step-bar.accessible-label');
	const current = component.resolvedCurrent;
	const total = component.total;
	const currentTitle = component.currentItem?.text ?? '';
	const compactText = component._t('components.step-bar.compact-text', { current, total });

	return html`
		<nav class="step-bar"
			aria-label=${label || nothing}
		>
			<div class="step-bar__items"
				role="list"
			>
				<slot @slotchange=${component._onSlotChange}></slot>
			</div>
			${total > 0 ? html`
				<p class="step-bar__compact-text"
					aria-hidden="true"
				>
					${currentTitle ? html`<span class="step-bar__compact-title">${currentTitle}</span>` : nothing}
					<span class="step-bar__compact-count">${compactText}</span>
				</p>
				<div class="step-bar__compact-bar"
					aria-hidden="true"
				>
					${Array.from({ length: total }, (_, index) => html`
						<span class="step-bar__compact-bar-segment"
							?data-filled=${index + 1 <= current}
						></span>
					`)}
				</div>
			` : nothing}
		</nav>
	`;
}

export function stepBarItemTemplate(component: NLDDStepBarItem): TemplateResult {
	const status = component.resolvedStatus;
	// A past step shows a check mark instead of its number; the number stays in
	// the status text for anyone who can't see it.
	const marker = component.icon
		? html`<nldd-icon class="step-bar__item-icon" icon=${component.icon}></nldd-icon>`
		: status === 'past'
			? html`<nldd-icon class="step-bar__item-icon" icon="check-mark"></nldd-icon>`
			: html`<span class="step-bar__item-number">${component._index}</span>`;

	const content = html`
		<span class="step-bar__item-marker"
			aria-hidden="true"
		>${marker}</span>
		<span class="step-bar__item-title">
			${component.text || html`<slot></slot>`}
			<span class="step-bar__item-status">, ${component._statusText}</span>
		</span>
	`;

	return html`
		<div class="step-bar__item is-${status}">
			${component.href ? html`
				<a class="step-bar__item-control"
					href=${component.href}
				>${content}</a>
			` : component.button ? html`
				<button class="step-bar__item-control"
					type="button"
				>${content}</button>
			` : content}
		</div>
	`;
}
