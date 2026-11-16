import { html, nothing, TemplateResult } from 'lit';
import type { NLDDAdmonition } from './admonition.js';

export function admonitionTemplate(component: NLDDAdmonition): TemplateResult {
	const icon = html`
		<span class="admonition__icon"
			aria-hidden="true"
		>
			<nldd-icon icon=${component._resolvedIcon}></nldd-icon>
		</span>
	`;
	const title = (text: string) => {
		switch (component.headingLevel) {
			case 1: return html`<h1 class="admonition__title">${text}</h1>`;
			case 2: return html`<h2 class="admonition__title">${text}</h2>`;
			case 3: return html`<h3 class="admonition__title">${text}</h3>`;
			case 4: return html`<h4 class="admonition__title">${text}</h4>`;
			case 5: return html`<h5 class="admonition__title">${text}</h5>`;
			case 6: return html`<h6 class="admonition__title">${text}</h6>`;
			default: return html`<p class="admonition__title">${text}</p>`;
		}
	};
	if (component._isCollapsible) {
		return html`
			<details class="admonition"
				?open=${!component.collapsed}
				@toggle=${component._onToggle}
			>
				<summary class="admonition__title-bar">
					${icon}
					<span class="admonition__title">
						${component.text}
					</span>
					<span class="admonition__chevron"
						aria-hidden="true"
					>
						<nldd-icon icon="chevron-down"></nldd-icon>
					</span>
				</summary>
				<div class="admonition__content">
					<div class="admonition__body">
						<slot></slot>
					</div>
				</div>
			</details>
		`;
	}
	return html`
		<div class="admonition">
			${component.text ? html`
				<div class="admonition__title-bar">
					${icon}
					${title(component.text)}
				</div>
			` : nothing}
			<div class="admonition__content">
				${component.text ? nothing : icon}
				<div class="admonition__body">
					<slot></slot>
				</div>
			</div>
		</div>
	`;
}
