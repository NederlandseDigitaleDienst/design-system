import { html, nothing } from 'lit';
import type { NLDDToolbar, NLDDToolbarItem, NLDDToolbarTitle } from './toolbar.js';
import type { NLDDToolbarTranslations } from './toolbar.i18n.js';
import { linkRel } from '../../../utilities/link-rel.js';
import '../icon-button/icon-button.js';

// # Item template

export function toolbarItemTemplate(component: NLDDToolbarItem) {
	return html`
		<div class="toolbar__item-content">
			<slot></slot>
		</div>
		${component.label ? html`<span class="toolbar__item-label">${component.label}</span>` : nothing}
		<slot name="overflow"></slot>
	`;
}

// # Title template

export function toolbarTitleTemplate(component: NLDDToolbarTitle) {
	const titleGroup = html`
		<div class="toolbar__title-group">
			${component.text ? html`<p class="toolbar__title">${component.text}</p>` : nothing}
			${component.supportingText ? html`<p class="toolbar__supporting-text">${component.supportingText}</p>` : nothing}
		</div>
	`;

	// The link takes the mark and the name, never the action slot: a control
	// inside a link is a control you cannot reach without following the link.
	// A new-tab link is a change of context, so it announces that (WCAG 2.1 SC 3.2.2).
	return html`
		${component.href ? html`
			<a class="toolbar__title-link"
				href=${component.href}
				target=${component.target || nothing}
				rel=${linkRel(null, component.target) || nothing}
			>
				<slot name="media"></slot>
				${titleGroup}${component.target === '_blank' ? html`<span class="toolbar__opens-in-new-tab-hint">${component._t('components.toolbar.opens-in-new-tab-label')}</span>` : nothing}
			</a>
		` : html`
			<slot name="media"></slot>
			${titleGroup}
		`}
		<slot name="action"></slot>
	`;
}

// # Types
export type ToolbarChild =
	| { type: 'title'; element: Element; minWidth: string; id: number }
	| { type: 'item'; element: Element; label: string; id: number; priority: number; hasPriority: boolean; overflowItems: Element[]; minWidth: string; maxWidth: string; width: string; isFluid: boolean }
	| { type: 'other'; element: Element; id: number };

// # Template
export function template(
	component: NLDDToolbar,
	hasCenterChildren: boolean,
	leftSpacerZero: boolean,
	rightSpacerZero: boolean,
	isSoloFluidItem: boolean,
	hasOverflow: boolean,
	menuOpen: boolean,
	label: string,
	centerOnly: boolean,
	t: (key: keyof NLDDToolbarTranslations) => string,
) {
	// Overflow button: aria-controls is intentionally omitted. ARIA IDREF
	// attributes cannot cross shadow DOM boundaries, and the menu is
	// reparented to document.body while this button lives in the toolbar's
	// shadow root — so the IDREF could not resolve from the host nor a
	// forwarded inner button. popup-type + expanded forward to the inner
	// button as aria-haspopup / aria-expanded and give sufficient AT
	// context for WCAG 2.1 AA. Restore aria-controls once nldd-menu moves
	// into the shadow root, or CSS Anchor Positioning lets the menu escape
	// the stacking context without document.body.
	return html`
		<div class="toolbar"
			role="toolbar"
			aria-label=${label || nothing}
		>
			<div class="toolbar__items">
				<slot name="start"></slot>
				${hasCenterChildren ? html`
					${centerOnly ? html`
						<div class="toolbar__center-fill">
							<slot name="center"></slot>
						</div>
					` : html`
						${leftSpacerZero ? nothing : html`<div class="toolbar__left-spacer"></div>`}
						<slot name="center"></slot>
						${rightSpacerZero ? nothing : html`<div class="toolbar__right-spacer"></div>`}
					`}
				` : isSoloFluidItem ? nothing : html`
					<div class="toolbar__flexible-spacer"></div>
				`}
				<slot name="end"></slot>
			</div>
			<div class="toolbar__overflow-button ${hasOverflow ? '' : 'is-hidden'}">
				<nldd-icon-button
					size=${component.size}
					icon="ellipsis"
					text=${t('components.toolbar.overflow-action')}
					tooltip-timing="never"
					popup-type="menu"
					?expanded=${menuOpen}
				></nldd-icon-button>
				<span class="toolbar__overflow-button-label">${t('components.toolbar.overflow-action')}</span>
			</div>
		</div>
	`;
}
