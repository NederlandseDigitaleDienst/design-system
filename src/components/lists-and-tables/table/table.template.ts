import { html } from 'lit';

export function tableTemplate() {
	// Two bare slots (no rowgroup wrappers): the slots are display:contents so
	// the slotted <nldd-table-row> elements become direct grid items of the
	// table and can use `grid-template-columns: subgrid`. The header slot is
	// rendered first so the header row sits above the body rows.
	//
	// The empty state spans all columns below the rows. It keeps role="row" >
	// role="cell" so the host stays a valid role="table" (an inline-dialog as a
	// direct table child would be invalid ARIA); it's removed from the a11y tree
	// while [hidden]. What an empty table should say is the app's to write, so
	// the slot is empty until a consumer fills it. Rows that are all hidden
	// show the no-results slot instead, when one is given.
	// Starts hidden — the table toggles `hidden` imperatively from _updateEmpty
	// (avoids a reactive re-render scheduled out of firstUpdated).
	return html`
		<slot name="header"></slot>
		<slot></slot>
		<div class="table__empty"
			role="row"
			hidden
		>
			<div class="table__empty-cell"
				role="cell"
			>
				<slot name="empty"></slot>
				<slot name="no-results"
					hidden
				></slot>
			</div>
		</div>
	`;
}

export function tableRowTemplate(onSlotChange: (e: Event) => void) {
	// display:contents (in styles) so the slotted cells are grid items of this
	// row's subgrid. The slot's ::after renders the selected background.
	return html`<slot @slotchange=${onSlotChange}></slot>`;
}
