import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDColumnBoard } from './column-board.js';

export function columnBoardTemplate(component: NLDDColumnBoard) {
	return html`
		<div class=${classMap({
			'column-board': true,
			'can-scroll-left': component._canScrollLeft,
			'can-scroll-right': component._canScrollRight,
			'is-dragging': component._dragging,
		})}
			role="region"
			aria-label=${component.accessibleLabel || component._t('components.column-board.accessible-label')}
			tabindex=${component._canScrollLeft || component._canScrollRight ? '0' : nothing}
			@scroll=${component._updateScroll}
		>
			<slot @slotchange=${component._updateScroll}></slot>
		</div>
		<div class="column-board__announcer"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		></div>
	`;
}
