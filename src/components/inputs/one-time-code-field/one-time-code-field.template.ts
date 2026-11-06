import { html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { BOX, type NLDDOneTimeCodeField } from './one-time-code-field.js';

function renderBox(component: NLDDOneTimeCodeField, index: number): TemplateResult {
	const character = component.charAt(index);
	const active = index === component.activeBox;
	const caret = active && !component.readonly;
	return html`
		<div class=${classMap({ 'one-time-code-field__box': true, 'is-filled': character !== '', 'is-active': active })}>
			${character === '' ? (caret ? html`<span class="one-time-code-field__caret"></span>` : nothing) : html`
				<span class="one-time-code-field__character">
					${character}
					${caret ? html`<span class="one-time-code-field__caret is-after"></span>` : nothing}
				</span>
			`}
		</div>
	`;
}

function renderBoxes(component: NLDDOneTimeCodeField): TemplateResult[] {
	const parts = component.formatParts;
	if (!parts) return Array.from({ length: component.boxes }, (_, index) => renderBox(component, index));
	let index = 0;
	// Inline on purpose: the separator keeps its white space, so a line break here would show.
	return parts.map((part) => (part === BOX ? renderBox(component, index++) : html`<span class="one-time-code-field__separator">${part}</span>`));
}

export function oneTimeCodeFieldTemplate(component: NLDDOneTimeCodeField): TemplateResult {
	return html`
		<div class="one-time-code-field">
			<input class="one-time-code-field__input"
				id=${component.inputId || nothing}
				type="text"
				inputmode=${component.type === 'alphanumeric' ? 'text' : 'numeric'}
				autocomplete="one-time-code"
				autocapitalize=${component.uppercase ? 'characters' : 'off'}
				spellcheck="false"
				pattern=${component.pattern}
				maxlength=${component.boxes}
				.value=${component.value}
				?disabled=${component.disabled}
				?readonly=${component.readonly}
				?required=${component.required}
				name=${component.name || nothing}
				aria-label=${component.accessibleLabel || nothing}
				aria-invalid=${component.invalid ? 'true' : nothing}
				@focus=${component._handleFocus}
				@blur=${component._handleBlur}
				@pointerdown=${component._handlePointerDown}
				@select=${component._keepNativeCaretAtEnd}
				@pointerup=${component._keepNativeCaretAtEnd}
				@keydown=${component._handleKeydown}
				@beforeinput=${component._handleBeforeInput}
				@input=${component._handleInput}
				@change=${component._handleChange}
			>
			<div class="one-time-code-field__boxes"
				aria-hidden="true"
			>
				${renderBoxes(component)}
			</div>
		</div>
	`;
}
