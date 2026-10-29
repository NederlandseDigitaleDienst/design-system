import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDTaskBoard } from './task-board.js';
import type { NLDDTaskBoardColumn } from './task-board-column.js';

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

export function taskBoardColumnTemplate(component: NLDDTaskBoardColumn) {
	return html`
		<section class=${classMap({
			'task-board-column': true,
			'is-drop-available': component._dropState === 'available',
			'is-drop-over': component._dropState === 'over',
		})}
			aria-label=${component.label || nothing}
		>
			<div class="task-board-column__header">
				<slot name="header">
					<span class="task-board-column__title">
						${component.text}
					</span>
					<span class="task-board-column__count">
						${component._count}
					</span>
				</slot>
			</div>
			<div class="task-board-column__body">
				<div class="task-board-column__placeholder${component._returning ? ' is-returning' : ''}"
					?hidden=${!component._placeholder}
				></div>
				<slot @slotchange=${component._handleSlotChange}></slot>
				<div class="task-board-column__footer"
					?hidden=${!component._hasFooter}
				>
					<slot name="footer" @slotchange=${component._handleFooterChange}></slot>
				</div>
				<div class="task-board-column__drop-indicator"
					?hidden=${component._dropIndex === null}
				></div>
			</div>
		</section>
	`;
}
