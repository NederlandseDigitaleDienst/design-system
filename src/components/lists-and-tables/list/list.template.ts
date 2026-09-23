import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { ListType } from './list.js';

/** Listbox-mode props for the list's own search input (combobox pattern). */
export interface ListboxOptions {
	listboxId: string;
	searchValue: string;
	activeId: string;
	searchPlaceholder: string;
	searchAccessibleLabel: string;
	searchClearLabel: string;
	hasSearchBarEnd: boolean;
	onSearchInput: (event: Event) => void;
	onSearchKeyDown: (event: KeyboardEvent) => void;
	onSearchFocus: () => void;
	onSearchBlur: () => void;
	onClearClick: () => void;
	onSearchBarEndSlotChange: (event: Event) => void;
}

export interface ListTemplateProps {
	itemsLabel: string;
	hasToolbar: boolean;
	type: ListType;
	isEmpty: boolean;
	hasItems: boolean;
	hasEmptyState: boolean;
	hasNoResultsState: boolean;
	listbox: ListboxOptions;
}

export const template = ({
	itemsLabel,
	hasToolbar,
	type,
	isEmpty,
	hasItems,
	hasEmptyState,
	hasNoResultsState,
	listbox,
}: ListTemplateProps) => {
	const isNavigation = type === 'navigation';
	const isListbox = type === 'listbox';
	// Navigation: the host carries role="navigation" with its own label; an
	// extra aria-label on the inner role="list" would make the landmark name
	// and the inner list name stack in screen-reader announcements. Listbox:
	// the input is the labeled control, so the listbox itself stays unlabeled.
	const skipItemsLabel = isNavigation || isListbox;
	// Role on .list__items: role="listbox" in listbox mode, role="tree" for a
	// tree, else role="list".
	// The empty-state (a non-option) is now a SIBLING of .list__items inside
	// .list__main, so .list__items only ever contains options/items — the role
	// can be set unconditionally per type (it's hidden when empty anyway).
	const itemsRole = isListbox
		? 'listbox'
		: type === 'tree'
			? 'tree'
			: type === 'radiogroup'
				? 'radiogroup'
				: 'list';
	// Two ways to show nothing, and they are not the same thing. Rows that exist
	// but are all filtered away is "no results": the way back is the search field
	// and the toolbar, so those stay. No rows at all is "empty": there is nothing
	// to search or filter, so the controls go with it, except in a listbox (see
	// showControls). A list that loads its rows
	// later is empty for a moment; that is the consumer's to cover, with a
	// loading state in [slot="empty"].
	const isNoResults = isEmpty && hasItems;
	// In listbox mode an empty search has no "no results" meaning yet, and no
	// "empty" one either: both are an answer to a question nobody has asked, so
	// both are suppressed and the consumer shows just the search field (and may
	// place its own hint outside the list). They appear once a query is present.
	// A slot with nothing in it is nothing to show either: the surface would be a
	// bare box, which reads as a skeleton that never loaded.
	const untouched = isListbox && listbox.searchValue === '';
	const noResultsFallsBack = isNoResults && !hasNoResultsState && hasEmptyState;
	const showNoResults = isNoResults && hasNoResultsState && !untouched;
	const showEmpty = ((!isNoResults && isEmpty && hasEmptyState) || noResultsFallsBack) && !untouched;
	const showMain = !isEmpty || showEmpty || showNoResults;
	// Nothing to search in and nothing to filter: the controls belong to the rows.
	// A listbox is the exception, because its search field is where the rows come
	// from: the consumer either hides the rows that do not match or fetches them
	// per query, and a field that leaves with the rows leaves no way back to any.
	const showControls = hasItems || isListbox;
	return html`
		<div class="list">
			<div class="list__header">
				${isListbox ? html`
					<div class="list__search-bar" ?hidden=${!showControls}>
						<div class="list__search-field">
							<label class="list__search-field-label">
								<div class="list__search-field-icon"
									aria-hidden="true"
								>
									<nldd-icon icon="search"></nldd-icon>
								</div>
								<input class="list__search-field-input"
									type="text"
									role="combobox"
									aria-controls=${listbox.listboxId}
									aria-expanded=${!isEmpty}
									aria-autocomplete="list"
									aria-activedescendant=${listbox.activeId || nothing}
									aria-label=${listbox.searchAccessibleLabel}
									placeholder=${listbox.searchPlaceholder}
									.value=${listbox.searchValue}
									@input=${listbox.onSearchInput}
									@keydown=${listbox.onSearchKeyDown}
									@focus=${listbox.onSearchFocus}
									@blur=${listbox.onSearchBlur}
								>
							</label>
							${listbox.searchValue ? html`
								<div class="list__search-field-end">
									<div class="list__search-field-clear">
										<nldd-icon-button
											variant="neutral-transparent"
											size="sm"
											icon="dismiss"
											text=${listbox.searchClearLabel}
											tooltip-timing="never"
											@click=${listbox.onClearClick}
										></nldd-icon-button>
									</div>
								</div>
							` : nothing}
						</div>
						<div class="list__search-bar-end" ?hidden=${!listbox.hasSearchBarEnd}>
							<slot name="search-bar-end" @slotchange=${listbox.onSearchBarEndSlotChange}></slot>
						</div>
					</div>
				` : nothing}
				<div class="list__toolbar" ?hidden=${!hasToolbar || !showControls}>
					<slot name="toolbar"></slot>
				</div>
			</div>
			<div class="list__main" ?hidden=${!showMain}>
				<div class="list__items"
					id=${ifDefined(isListbox ? listbox.listboxId : undefined)}
					role=${itemsRole}
					aria-label=${ifDefined(skipItemsLabel ? undefined : itemsLabel)}
					?hidden=${isEmpty}
				>
					<slot></slot>
				</div>
				<div class="list__empty"
					?hidden=${!showEmpty && !showNoResults}
				>
					<slot name="empty" ?hidden=${!showEmpty}></slot>
					<slot name="no-results" ?hidden=${!showNoResults}></slot>
				</div>
			</div>
		</div>
		<div class="list__polite-announcer"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		></div>
		<div class="list__assertive-announcer"
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		></div>
	`;
};
