import { html, nothing, TemplateResult } from 'lit';
import type { NLDDSegmentedControl, NLDDSegmentedControlItem } from './segmented-control.js';
import '../../content/tooltip/tooltip.js';

export function segmentedControlTemplate(component: NLDDSegmentedControl): TemplateResult {
	// The group carries `required`, on a radio of its own: the items are the
	// radios now and have no input to read it from. Checked as soon as something
	// is selected, because that is what a radio asks — one of these, not this one.
	// The name is for the platform: a radio without one is in no group, and a
	// radio in no group never reports a missing value. Hidden, like the one in the
	// radio button: it carries a constraint and nothing else.
	return html`
		<input class="segmented-control__validation-input"
			type="radio"
			name="nldd-validation"
			hidden
			?required=${component.required && component.type !== 'checkbox'}
			?disabled=${component.disabled}
			.checked=${!!component.value}
		>
		<slot @slotchange=${component._onSlotChange}></slot>
	`;
}

export function segmentedControlItemTemplate(component: NLDDSegmentedControlItem): TemplateResult {
	const isIcon = component.variant === 'icon';
	/* The icon and icon-and-text variants reserve an icon area; fill it with a
	 * placeholder whenever the consumer provided no icon. */
	const showPlaceholder = isIcon || component.variant === 'icon-and-text';
	const labelText = component.text || nothing;

	const content = html`
		<span class="segmented-control__item-icon"
			aria-hidden=${isIcon ? nothing : 'true'}
		>
			${component.icon
				? html`<nldd-icon name=${component.icon}></nldd-icon>`
				: html`<slot name="icon">${showPlaceholder ? html`<nldd-icon name="icon-placeholder"></nldd-icon>` : nothing}</slot>`}
		</span>
		<span class="segmented-control__item-text"
			aria-hidden=${isIcon ? 'true' : nothing}
		>
			${component.text}
		</span>`;

	// In radio mode the item itself is the radio: it carries the role, the state
	// and its place in the group, and nothing in here is announced or focused.
	// A checkbox keeps its native input, which groups by nothing and counts as one.
	const label = component.inputType === 'radio'
		? html`<div class="segmented-control__item">${content}</div>`
		: html`
			<label class="segmented-control__item">
				<input class="segmented-control__item-input"
					type="checkbox"
					name=${component.groupName || nothing}
					value=${component.value}
					.checked=${component.selected}
					?disabled=${component.disabled}
					?required=${component.required}
					aria-label=${isIcon ? labelText : nothing}
					@change=${component._handleChange}
				>
				${content}
			</label>`;

	if (isIcon && labelText) {
		return html`<nldd-tooltip text=${labelText}>${label}</nldd-tooltip>`;
	}
	return label;
}
