import { html, nothing } from 'lit';
import type { NLDDLink } from './link.js';
import { linkRel } from '../../../utilities/link-rel.js';
import { downloadLinkHintKey, markDownloadTarget } from '../../../utilities/link-hint.js';

interface TemplateHelpers {
	handleClick: (e: MouseEvent) => void;
	handleSlotChange: (e: Event) => void;
}

export function template(this: NLDDLink, helpers: TemplateHelpers) {
	const resolvedRel = linkRel(this.rel, this.target);
	// A link to another website or a new tab says so (WCAG 2.1 SC 3.2.2).
	// Suppressed when disabled (the <a> carries no href, so it doesn't navigate).
	const hintKey = this.disabled ? null : downloadLinkHintKey(this.href, this.target, this.download);
	if (this.href) markDownloadTarget(this, this.download, this.target);
	const linkHint = hintKey ? this._t(`components.link.${hintKey}`) : '';
	// aria-label wins the accessible-name cascade, so when one is set the hint
	// must live inside it; otherwise the name is content-derived (text or slot)
	// and the visually-hidden span below appends the hint to it.
	const ariaLabel = this.accessibleLabel
		? [this.accessibleLabel, linkHint].filter(Boolean).join(', ')
		: nothing;
	const renderLinkHint = !!linkHint && !this.accessibleLabel;
	// Icons render in both modes:
	// - sized mode: inline-flex container + gap controls spacing
	// - inherit mode: inline container, a single space between icon and label
	//   provides a natural separator. That space is only there next to an
	//   icon, and neither the <a> nor the shadow root around it holds other
	//   whitespace: in running text any stray whitespace shows up as a gap
	//   before the punctuation after the link.
	const hasStartIcon = !!this.startIcon || this._hasStartSlot;
	const hasEndIcon = !!this.endIcon || this._hasEndSlot;
	const startIcon = this.startIcon
		? html`<span class="link__start-icon"><nldd-icon icon=${this.startIcon}></nldd-icon></span>`
		: html`<slot name="start-icon" @slotchange=${helpers.handleSlotChange}></slot>`;
	const endIcon = this.endIcon
		? html`<span class="link__end-icon"><nldd-icon icon=${this.endIcon}></nldd-icon></span>`
		: html`<slot name="end-icon" @slotchange=${helpers.handleSlotChange}></slot>`;
	const label = html`<span class="link__label">${this.text ? this.text : html`<slot></slot>`}</span>`;
	return html`<a class="link"
			href=${this.disabled ? nothing : (this.href || nothing)}
			role=${this.disabled ? 'link' : nothing}
			tabindex=${this.noTab ? '-1' : (this.disabled ? '0' : nothing)}
			target=${this.disabled ? nothing : (this.target || nothing)}
			rel=${this.disabled ? nothing : (resolvedRel || nothing)}
			download=${this.disabled ? nothing : (this.download ?? nothing)}
			aria-disabled=${this.disabled ? 'true' : nothing}
			aria-label=${ariaLabel}
			@click=${helpers.handleClick}
		>${startIcon}${hasStartIcon ? ' ' : nothing}${label}${hasEndIcon ? ' ' : nothing}${endIcon}${renderLinkHint ? html`<span class="link__link-hint">, ${linkHint}</span>` : nothing}</a>`;
}
