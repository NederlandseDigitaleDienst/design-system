/* eslint-disable lit-a11y/click-events-have-key-events -- the field wrapper only
   forwards a padding click to focus the inner input; keyboard users tab straight
   to that input, so it needs no key handler of its own. */
import { html, nothing, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import type { NLDDTokenField } from './token-field.js';
import '../../content/token/token.js';
import '../../content/icon/icon.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';

function renderValidationIcon(component: NLDDTokenField): TemplateResult | typeof nothing {
	const name = component.invalid ? 'invalid' : component.valid ? 'valid' : null;
	if (!name) return nothing;
	return html`
		<div class="token-field__validation-icon-area">
			<nldd-icon class="token-field__validation-icon"
				icon=${name}
				aria-hidden="true"
			></nldd-icon>
		</div>
	`;
}

function renderInput(component: NLDDTokenField): TemplateResult {
	return html`
		<input class="token-field__input"
			type=${component.type || 'text'}
			autocomplete=${component.autocomplete || nothing}
			spellcheck=${component.noSpellcheck ? 'false' : nothing}
			role=${component._hasMenu ? 'combobox' : nothing}
			aria-label=${component.accessibleLabel || nothing}
			aria-haspopup=${component._hasMenu ? 'listbox' : nothing}
			aria-autocomplete=${component._hasMenu ? 'list' : nothing}
			aria-controls=${component._hasMenu ? component._menuId : nothing}
			aria-expanded=${component._hasMenu ? (component._isOpen ? 'true' : 'false') : nothing}
			aria-activedescendant=${component._highlightedId || nothing}
			aria-invalid=${component.invalid ? 'true' : nothing}
			.value=${component._text}
			placeholder=${component.placeholder || nothing}
			?disabled=${component.disabled}
			@input=${component._handleInput}
			@blur=${component._handleBlur}
			@keydown=${component._handleKeydown}
		>
	`;
}

function renderPicker(component: NLDDTokenField): TemplateResult {
	return html`
		<div class="token-field__picker">
			<nldd-icon-button
				variant="neutral-tinted"
				size="sm"
				icon="chevron-down"
				text=${component._t('components.token-field.open-menu-action')}
				tooltip-timing="never"
				?disabled=${component.disabled}
				?expanded=${component._isOpen}
				popup-type="listbox"
				@pointerdown=${component._handlePickerPointerdown}
				@click=${component._togglePicker}
			></nldd-icon-button>
		</div>
	`;
}

/** One token in the row. `token-control="menu"` renders a ⌄ that opens a per-token
 *  action menu — a clone of the matching `nldd-token[slot="template"]` prototype's
 *  menu — which the token wires itself; a selection bubbles to `token-action`.
 *  Otherwise it is a ✕ that removes the value. Readonly tokens carry no control. */
function renderToken(component: NLDDTokenField, value: string, index: number): TemplateResult {
	const tabindex = component.readonly || component.disabled
		? nothing
		: (!component._showInput && index === component._rovingIndex ? '0' : '-1');
	const label = component._labelFor(value);
	// A removable token announces that it can be removed (its ✕, or Backspace while it
	// holds the roving focus); the plain label alone gives a screen reader no hint.
	const ariaLabel = component.readonly
		? nothing
		: `${label}, ${component._t('components.token-field.removable-lowercase-label')}`;

	if (!component.readonly && component.tokenControl === 'menu') {
		return html`
			<nldd-token
				role="listitem"
				aria-label=${ariaLabel}
				text=${label}
				control="menu"
				tabindex=${tabindex}
				?roving=${!component.readonly}
				menu-text=${`${component._t('components.token-field.token-menu-action')} "${label}"`}
				?disabled=${component.disabled}
				data-value=${value}
				@keydown=${(e: KeyboardEvent) => component._handleTokenKeydown(e, index)}
				@select=${(e: Event) => component._handleTokenAction(e, value)}
			>
				${component._tokenMenuFor(value)}
			</nldd-token>
		`;
	}

	return html`
		<nldd-token
			role="listitem"
			aria-label=${ariaLabel}
			text=${label}
			control=${component.readonly ? nothing : 'dismiss'}
			tabindex=${tabindex}
			?roving=${!component.readonly}
			dismiss-text=${`${component._t('components.token-field.dismiss-action')} "${label}"`}
			?disabled=${component.disabled}
			data-value=${value}
			@dismiss=${() => component._handleTokenDismiss(value, index)}
			@keydown=${(e: KeyboardEvent) => component._handleTokenKeydown(e, index)}
		></nldd-token>
	`;
}

export function tokenFieldTemplate(component: NLDDTokenField): TemplateResult {
	return html`
		<div class="token-field"
			data-invalid=${component.invalid ? '' : nothing}
			data-valid=${component.valid && !component.invalid ? '' : nothing}
			@click=${component._handleFieldClick}
		>
			<div class="token-field__list" role="list">
				${repeat(
					component.values,
					(value) => value,
					(value, index) => renderToken(component, value, index),
				)}
			</div>
			${component._showInput || component._showPicker
				? html`
					<div class="token-field__input-area">
						${component._showInput ? renderInput(component) : nothing}
						${component._showPicker ? renderPicker(component) : nothing}
					</div>
				`
				: nothing}
			${renderValidationIcon(component)}
		</div>
		<slot @slotchange=${component._onSlotChange}></slot>
	`;
}
