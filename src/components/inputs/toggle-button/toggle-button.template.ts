import { html, nothing, TemplateResult } from 'lit';
import type { NLDDToggleButton } from './toggle-button.js';
import '../../content/tooltip/tooltip.js';


export function toggleButtonTemplate(component: NLDDToggleButton): TemplateResult {
	/* `variant` forces what's rendered (not just styling):
	 * - 'icon'          → suppress text even if provided
	 * - 'text'          → suppress icon even if provided
	 * - 'icon-and-text' → same as unset: render whatever is there
	 *
	 * Styling (square vs auto, icon size) is driven entirely by what's
	 * in the DOM via :has(.toggle-button__text) in the stylesheet. */
	const showText = component.variant !== 'icon' && !!component.text;
	const showIcon = component.variant !== 'text' && component._hasIcon;

	/* The icon and icon-and-text variants reserve an icon area; show a placeholder
	 * whenever the consumer provided no icon (attribute or slot). */
	const showPlaceholder = component.variant === 'icon'
		|| component.variant === 'icon-and-text';

	/* When variant="icon" hides a provided text, fall the text back to
	 * aria-label so screen readers still announce the button. Explicit
	 * accessible-label always wins. */
	const ariaLabel = component.accessibleLabel
		|| (component.variant === 'icon' && component.text ? component.text : '')
		|| nothing;

	/* Tooltip surfaces the off-screen label when an icon is visible but
	 * no text is. accessible-label takes precedence; text is the fallback
	 * (e.g. variant="icon" + text="Bold" → tooltip shows "Bold"). */
	const isIconOnlyDisplay = showIcon && !showText;
	const tooltipText = isIconOnlyDisplay ? (component.accessibleLabel || component.text || '') : '';

	/* Always render the icon area so the slot stays in shadow DOM for
	 * assignment + slotchange detection — even when variant="text" hides
	 * it visually (CSS handles that via :host([variant="text"]) below).
	 * Without the slot present, slotted content can't be projected and a
	 * subsequent variant change couldn't pick it up because no slotchange
	 * would have fired. An empty slot collapses to 0×0 via display:contents,
	 * so it costs nothing visually. */
	const icon = component.icon
		? html`<nldd-icon class="toggle-button__icon"
				name=${component.icon}
			></nldd-icon>`
		: html`<slot name="icon"
				@slotchange=${component.requestUpdate}
			>${showPlaceholder ? html`<nldd-icon class="toggle-button__icon"
					name="icon-placeholder"
				></nldd-icon>` : nothing}</slot>`;

	const textContent = showText
		? html`<span class="toggle-button__text">${component.text}</span>`
		: nothing;

	let result: TemplateResult;

	if (component.type === 'radio') {
		// The radio is this element: the role, the state and the place in the
		// group sit on it, and nothing here is announced or focused. The input
		// only answers `required` for the form, and what a radio asks there is
		// whether anything in its group is selected. The name is for the platform:
		// a radio without one is in no group, and a radio in no group never reports
		// a missing value. It is hidden, since rendered it would be a radio inside the
		// element that is the radio, and hidden it still reports.
		result = html`
			<div class="toggle-button">
				<input class="toggle-button__validation-input"
					type="radio"
					name="nldd-validation"
					hidden
					?required=${component.required}
					?disabled=${component.disabled}
					.checked=${component._groupHasSelection}
				>
				${icon}
				${textContent}
			</div>
		`;
	} else if (component.type === 'checkbox') {
		result = html`
			<label class="toggle-button">
				<input class="toggle-button__input"
					type="checkbox"
					.checked=${component.selected}
					?disabled=${component.disabled}
					?required=${component.required}
					name=${component.name || nothing}
					value=${component.value}
					aria-label=${ariaLabel}
					tabindex=${component.noTab ? '-1' : nothing}
					@change=${component._handleInputChange}
				>
				${icon}
				${textContent}
			</label>
		`;
	} else {
		result = html`
			<button class="toggle-button"
				type="button"
				aria-pressed=${component.selected}
				?disabled=${component.disabled}
				aria-label=${ariaLabel}
				tabindex=${component.noTab ? '-1' : nothing}
				@click=${component._handleButtonClick}
			>
				${icon}
				${textContent}
			</button>
		`;
	}

	if (tooltipText) {
		return html`<nldd-tooltip text=${tooltipText}>${result}</nldd-tooltip>`;
	}
	return result;
}
