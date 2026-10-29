import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDTaskBoard } from './task-board.js';

export function taskBoardTemplate(component: NLDDTaskBoard) {
	return html`
		<div class=${classMap({
			'task-board': true,
			'can-scroll-left': component._canScrollLeft,
			'can-scroll-right': component._canScrollRight,
			'is-dragging': component._dragging,
		})}
			role="region"
			aria-label=${component.accessibleLabel || component._t('components.task-board.accessible-label')}
			tabindex=${component._canScrollLeft || component._canScrollRight ? '0' : nothing}
			@scroll=${component._updateScroll}
		>
			<slot @slotchange=${component._updateScroll}></slot>
		</div>
		<div class="task-board__announcer"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		></div>
	`;
}
