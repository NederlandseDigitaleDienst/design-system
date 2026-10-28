import { html, nothing } from 'lit';
import type { NLDDToolbar } from './toolbar.js';
import type { NLDDToolbarTranslations } from './toolbar.i18n.js';
import '../icon-button/icon-button.js';

// # Types
export type ToolbarChild =
	| { type: 'title'; element: Element; id: number }
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
