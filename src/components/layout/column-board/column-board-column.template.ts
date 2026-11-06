import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { NLDDColumnBoardColumn } from './column-board-column.js';

export function columnBoardColumnTemplate(component: NLDDColumnBoardColumn) {
	return html`
		<section class=${classMap({
			'column-board-column': true,
			'is-drop-available': component._dropState === 'available',
			'is-drop-over': component._dropState === 'over',
		})}
			aria-label=${component.label || nothing}
		>
			<div class="column-board-column__header">
				<slot name="header">
					<span class="column-board-column__title">
						${component.text}
					</span>
					<span class="column-board-column__count">
						${component._count}
					</span>
				</slot>
			</div>
			<div class=${classMap({
				'column-board-column__main': true,
				'can-scroll-up': component._canScrollUp,
				'can-scroll-down': component._canScrollDown,
			})}
				@scroll=${component._updateScroll}
			>
				<div class="column-board-column__placeholder${component._returning ? ' is-returning' : ''}"
					?hidden=${!component._placeholder}
				></div>
				<slot @slotchange=${component._handleSlotChange}></slot>
				<div class="column-board-column__footer"
					?hidden=${!component._hasFooter}
				>
					<slot name="footer" @slotchange=${component._handleFooterChange}></slot>
				</div>
				<div class="column-board-column__drop-indicator"
					?hidden=${component._dropIndex === null}
				></div>
			</div>
		</section>
	`;
}
