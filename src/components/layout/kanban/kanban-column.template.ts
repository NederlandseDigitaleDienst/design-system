import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDKanbanColumn } from './kanban-column.js';

export function kanbanColumnTemplate(component: NLDDKanbanColumn) {
	return html`
		<section class=${classMap({
			'kanban-column': true,
			'is-drop-available': component._dropState === 'available',
			'is-drop-over': component._dropState === 'over',
		})}
			aria-label=${component.label || nothing}
		>
			<div class="kanban-column__header">
				<slot name="header">
					<span class="kanban-column__title">
						${component.text}
					</span>
					<span class="kanban-column__count">
						${component._count}
					</span>
				</slot>
			</div>
			<div class=${classMap({
				'kanban-column__main': true,
				'can-scroll-up': component._canScrollUp,
				'can-scroll-down': component._canScrollDown,
			})}
				@scroll=${component._updateScroll}
			>
				<div class="kanban-column__placeholder${component._returning ? ' is-returning' : ''}"
					?hidden=${!component._placeholder}
				></div>
				<slot @slotchange=${component._handleSlotChange}></slot>
				<div class="kanban-column__footer"
					?hidden=${!component._hasFooter}
				>
					<slot name="footer" @slotchange=${component._handleFooterChange}></slot>
				</div>
				<div class="kanban-column__drop-indicator"
					?hidden=${component._dropIndex === null}
				></div>
			</div>
		</section>
	`;
}
