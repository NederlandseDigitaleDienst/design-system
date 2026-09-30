import { html, nothing } from 'lit';
import type { NLDDInlineDialog } from './inline-dialog.js';

export function inlineDialogTemplate(component: NLDDInlineDialog) {
	const alignment = component._resolvedHorizontalAlignment;
	const blockClass = ['inline-dialog',
		alignment === 'left' ? 'inline-dialog--left-aligned' : '',
	].filter(Boolean).join(' ');

	return html`
		<div class=${blockClass}>
			<div class="inline-dialog__main">
				${component.variant === 'loading' ? html`
					<div class="inline-dialog__icon">
						<nldd-activity-indicator
							size=${component.size === 'lg' ? '48' : '40'}
							timing="instant"
						></nldd-activity-indicator>
					</div>
				` : component._resolvedIconName ? html`
					<div class="inline-dialog__icon">
						<nldd-icon icon=${component._resolvedIconName}></nldd-icon>
					</div>
				` : nothing}
				${component.text ? html`
					${component.headingLevel === 1 ? html`<h1 class="inline-dialog__text">${component.text}</h1>`
					: component.headingLevel === 2 ? html`<h2 class="inline-dialog__text">${component.text}</h2>`
					: component.headingLevel === 3 ? html`<h3 class="inline-dialog__text">${component.text}</h3>`
					: component.headingLevel === 4 ? html`<h4 class="inline-dialog__text">${component.text}</h4>`
					: component.headingLevel === 5 ? html`<h5 class="inline-dialog__text">${component.text}</h5>`
					: component.headingLevel === 6 ? html`<h6 class="inline-dialog__text">${component.text}</h6>`
					: html`<p class="inline-dialog__text">${component.text}</p>`}
				` : nothing}
				${component.supportingText ? html`
					<p class="inline-dialog__supporting-text">${component.supportingText}</p>
				` : nothing}
				<div class="inline-dialog__content"
					?hidden=${!component._hasContent}
				>
					<slot></slot>
				</div>
			</div>
			<div class="inline-dialog__footer"
				?hidden=${!component._hasActions}
			>
				<nldd-button-group orientation=${alignment === 'left' ? 'horizontal' : 'vertical'}>
					<slot name="actions"></slot>
				</nldd-button-group>
			</div>
		</div>
	`;
}
