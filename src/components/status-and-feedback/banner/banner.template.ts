import { html, nothing } from 'lit';
import type { NLDDBanner } from './banner.js';

export function bannerTemplate(component: NLDDBanner) {
	const heading = (text: string) => {
		switch (component.headingLevel) {
			case 1: return html`<h1 class="banner__text">${text}</h1>`;
			case 2: return html`<h2 class="banner__text">${text}</h2>`;
			case 3: return html`<h3 class="banner__text">${text}</h3>`;
			case 4: return html`<h4 class="banner__text">${text}</h4>`;
			case 5: return html`<h5 class="banner__text">${text}</h5>`;
			case 6: return html`<h6 class="banner__text">${text}</h6>`;
			default: return html`<p class="banner__text">${text}</p>`;
		}
	};
	return html`
		<div class="banner">
			<div class="banner__icon"
				aria-hidden="true"
			>
				<nldd-icon icon=${component._resolvedIcon}></nldd-icon>
			</div>
			<div class="banner__main">
				${component.text || component.supportingText ? html`
					<div class="banner__heading">
						${component.text ? heading(component.text) : nothing}
						${component.supportingText ? html`
							<p class="banner__supporting-text">${component.supportingText}</p>
						` : nothing}
					</div>
				` : nothing}
				<div class="banner__content"
					?hidden=${!component._hasContent}
				>
					<slot></slot>
				</div>
				<div class="banner__actions"
					?hidden=${!component._hasActions}
				>
					<nldd-button-group orientation="horizontal">
						<slot name="actions"></slot>
					</nldd-button-group>
				</div>
			</div>
			${component.dismissible ? html`
				<div class="banner__dismiss-button">
					<nldd-icon-button
						icon="dismiss-small"
						variant="neutral-transparent"
						size=${component.size}
						accessible-label=${component._t('components.banner.dismiss-action')}
						@click=${component._onDismissClick}
					></nldd-icon-button>
				</div>
			` : nothing}
		</div>
	`;
}
