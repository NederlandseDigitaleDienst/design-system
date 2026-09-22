import { html, nothing } from 'lit';
import type { NLDDLink } from './link.js';
import { linkRel } from '../../../utilities/link-rel.js';

interface TemplateHelpers {
	handleClick: (e: MouseEvent) => void;
}

export function template(this: NLDDLink, helpers: TemplateHelpers) {
	const resolvedRel = linkRel(this.rel, this.target);
	// A new-tab link is a change of context, so announce it (WCAG 2.1 SC 3.2.2).
	// Suppressed when disabled (the <a> carries no href, so it doesn't navigate).
	const opensInNewTabHint = !this.disabled && this.href && this.target === '_blank'
		? this._t('components.link.opens-in-new-tab-label')
		: '';
	// aria-label wins the accessible-name cascade, so when one is set the hint
	// must live inside it; otherwise the name is content-derived (text or slot)
	// and the visually-hidden span below appends the hint to it.
	const ariaLabel = this.accessibleLabel
		? [this.accessibleLabel, opensInNewTabHint].filter(Boolean).join(', ')
		: nothing;
	const renderOpensInNewTabHint = !!opensInNewTabHint && !this.accessibleLabel;
	// Icons render in both modes:
	// - sized mode: inline-flex container + gap controls spacing
	// - inherit mode: inline container, the whitespace text node between
	//   icon span and label span provides a natural single-space separator
	return html`
		<a class="link"
			href=${this.disabled ? nothing : (this.href || nothing)}
			role=${this.disabled ? 'link' : nothing}
			tabindex=${this.noTab ? '-1' : (this.disabled ? '0' : nothing)}
			target=${this.disabled ? nothing : (this.target || nothing)}
			rel=${this.disabled ? nothing : (resolvedRel || nothing)}
			aria-disabled=${this.disabled ? 'true' : nothing}
			aria-label=${ariaLabel}
			@click=${helpers.handleClick}
		>
			${this.startIcon ? html`
				<span class="link__start-icon"><nldd-icon name=${this.startIcon}></nldd-icon></span>
			` : html`<slot name="start-icon"></slot>`}
			<span class="link__label">${this.text ? this.text : html`<slot></slot>`}</span>
			${this.endIcon ? html`
				<span class="link__end-icon"><nldd-icon name=${this.endIcon}></nldd-icon></span>
			` : html`<slot name="end-icon"></slot>`}
			${renderOpensInNewTabHint ? html`<span class="link__opens-in-new-tab-hint">${opensInNewTabHint}</span>` : nothing}
		</a>
	`;
}
