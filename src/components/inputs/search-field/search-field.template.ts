import { html, nothing, TemplateResult } from 'lit';
import type { NLDDSearchField } from './search-field.js';
import './../../actions/icon-button/icon-button.js';
import './../../actions/button/button.js';
import './../../content/icon/icon.js';

export function searchFieldTemplate(component: NLDDSearchField): TemplateResult {
	const buttonSize = component.size === 'sm' ? 'xs' : 'sm';
	// Only render the fade + end (clear / search buttons) when at least one is
	// shown; an empty end would otherwise reserve its padding as a dead click
	// zone on the right, shrinking the input's focus-on-click area.
	const hasEnd = Boolean(component.value) || component.showSearchButton;

	return html`
		<div class="search-field">
			<label class="search-field__label">
				<div class="search-field__search-icon" aria-hidden="true">
					<nldd-icon icon="search"></nldd-icon>
				</div>
				<input class="search-field__input"
					?required=${component.required}
					pattern=${component.pattern || nothing}
					minlength=${component.minlength ?? nothing}
					maxlength=${component.maxlength ?? nothing}
					type="search"
					.value=${component.value}
					placeholder=${component.placeholder}
					aria-label=${component.accessibleLabel || component.placeholder || nothing}
					?disabled=${component.disabled}
					name=${component.name || nothing}
					spellcheck=${component.noSpellcheck ? 'false' : 'true'}
					@input=${component._handleInput}
					@change=${component._handleChange}
					@keydown=${component._handleKeydown}
				>
			</label>
			${hasEnd ? html`
				<div class="search-field__input-fade"></div>
				<div class="search-field__end">
					${component.value ? html`
						<div class="search-field__clear-button">
							<nldd-icon-button
								variant="neutral-transparent"
								size=${buttonSize}
								icon="dismiss"
								text=${component._t('components.search-field.clear-action')}
								@click=${component._handleClear}
							></nldd-icon-button>
						</div>
					` : nothing}
					${component.showSearchButton ? html`
						<div class="search-field__search-button">
							<nldd-button
								variant="neutral-tinted"
								size=${buttonSize}
								text=${component._t('components.search-field.search-action')}
								@click=${component._handleSearch}
							></nldd-button>
						</div>
					` : nothing}
				</div>
			` : nothing}
		</div>
	`;
}
