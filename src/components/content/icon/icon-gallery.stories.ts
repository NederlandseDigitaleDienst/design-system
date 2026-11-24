import { html, nothing } from 'lit';
import { ICONS, aliases } from './icon.js';
import { ICON_CATEGORIES } from './icon-categories.js';
import { NEW_ICONS, UPDATED_ICONS } from './icon-gallery-status.js';
import '../../actions/button/button.js';
import '../../actions/menu/menu-item.js';
import '../../actions/toolbar/toolbar.js';
import '../../actions/toolbar/toolbar-item.js';
import '../../inputs/checkbox/checkbox.js';
import '../../inputs/search-field/search-field.js';
import '../../layout/card/card.js';
import '../../layout/collection/collection.js';
import '../../layout/container/container.js';
import '../../layout/spacer/spacer.js';
import '../../lists-and-tables/cells/cell/cell.js';
import '../../lists-and-tables/cells/spacer-cell/spacer-cell.js';
import '../../lists-and-tables/cells/text-cell/text-cell.js';
import '../../lists-and-tables/list/list.js';
import '../../lists-and-tables/list-item/list-item.js';
import '../../navigation/skip-link/skip-link.js';
import '../../status-and-feedback/inline-dialog/inline-dialog.js';
import '../tag/tag.js';
import '../text/text.js';
import '../title/title.js';
import '../token/token.js';

const aliasSet = new Set(Object.keys(aliases));
const iconNames = ICONS.filter(name => !aliasSet.has(name));

const categoryOf = new Map(Object.entries(ICON_CATEGORIES).flatMap(([category, names]) => names.map(name => [name, category])));
const isFilled = (name: string) => /-filled(-|$)/.test(name);
const isLight = (name: string) => name.endsWith('-light');

interface Option {
	value: string;
	label: string;
	matches: (name: string) => boolean;
}

interface Group {
	key: string;
	title: string;
	options: Option[];
}

/** Options within a group widen the result, groups narrow it. */
const GROUPS: Group[] = [
	{
		key: 'status',
		title: 'Status',
		options: [
			{ value: 'new', label: 'Nieuw', matches: name => NEW_ICONS.has(name) },
			{ value: 'updated', label: 'Bijgewerkt', matches: name => UPDATED_ICONS.has(name) },
		],
	},
	{
		key: 'shape',
		title: 'Vorm',
		options: [
			{ value: 'outlined', label: 'Omlijnd', matches: name => !isFilled(name) },
			{ value: 'filled', label: 'Gevuld', matches: isFilled },
		],
	},
	{
		key: 'weight',
		title: 'Lijndikte',
		options: [
			{ value: 'regular', label: 'Regular', matches: name => !isLight(name) },
			{ value: 'light', label: 'Light', matches: isLight },
		],
	},
	{
		key: 'category',
		title: 'Categorie',
		options: Object.keys(ICON_CATEGORIES).map(category => ({
			value: category,
			label: category,
			matches: (name: string) => categoryOf.get(name) === category,
		})),
	},
];

const aliasesOf = (iconName: string) => Object.entries(aliases)
	.filter(([, target]) => target === iconName)
	.map(([alias]) => alias);

type Checkable = HTMLElement & { checked: boolean };

/**
 * The icon gallery, shown on the page Iconen of the website (src/docs/icons.md).
 * The page is an nldd-sidebar-section and the gallery fills it: the filters in
 * its sidebar, the search and the icons in its main.
 */
export default {
	title: 'Docs/Iconen',
	parameters: {
		controls: { disable: true },
	},
};

export const Galerij = {
	tags: ['!dev'],
	parameters: {
		controls: { disable: true },
	},
	render: () => {
		let query = '';
		const selected = new Map<string, Set<string>>(GROUPS.map(group => [group.key, new Set()]));

		const gallery = (from: Element) => from.closest<HTMLElement>('nldd-sidebar-section')!;
		// Every tile, kept while a filter takes it out of the collection: the
		// collection pages through what is in it, so only a match may be.
		let tiles: HTMLElement[] | undefined;

		const update = (root: HTMLElement) => {
			const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
			const collection = root.querySelector<HTMLElement>('#iconen')!;
			tiles ??= [...collection.querySelectorAll<HTMLElement>('[data-icon]')];
			const shown = tiles.filter(tile => {
				const name = tile.dataset.icon!;
				const matchesQuery = words.every(word => tile.dataset.searchTokens!.includes(word));
				const matchesFilters = GROUPS.every(group => {
					const values = selected.get(group.key)!;
					return values.size === 0 || group.options.some(option => values.has(option.value) && option.matches(name));
				});
				return matchesQuery && matchesFilters;
			});
			collection.replaceChildren(...shown);

			const strip = root.querySelector<HTMLElement>('[data-active-filters]')!;
			const tokens = GROUPS.flatMap(group => group.options
				.filter(option => selected.get(group.key)!.has(option.value))
				.map(option => {
					const token = document.createElement('nldd-token');
					token.setAttribute('text', `${group.title}: ${option.label}`);
					token.setAttribute('control', 'dismiss');
					token.addEventListener('dismiss', () => {
						const row = root.querySelector<Checkable>(`[data-group="${group.key}"][data-value="${CSS.escape(option.value)}"]`)!;
						row.checked = false;
						row.querySelector<Checkable>('nldd-checkbox')!.checked = false;
						selected.get(group.key)!.delete(option.value);
						update(root);
					});
					return token;
				}));
			strip.replaceChildren(...tokens);
			strip.hidden = tokens.length === 0;
			(strip.previousElementSibling as HTMLElement).hidden = tokens.length === 0;

			const filtering = tokens.length > 0 || words.length > 0;
			const count = root.querySelector<HTMLElement>('[data-count]')!;
			count.hidden = !filtering;
			(count.nextElementSibling as HTMLElement).hidden = !filtering;
			count.querySelector('p')!.textContent = `${shown.length} ${shown.length === 1 ? 'icoon' : 'iconen'}`;
			root.querySelector<HTMLElement>('[data-no-results]')!.hidden = shown.length > 0;
		};

		const handleSearch = (e: CustomEvent<{ value: string }>) => {
			// The native input event bubbles out of the shadow root too (composed,
			// detail = 0); only the component's own CustomEvent carries detail.value.
			if (typeof e.detail?.value !== 'string') return;
			query = e.detail.value;
			update(gallery(e.target as Element));
		};

		const handleRow = (e: Event) => {
			const row = e.currentTarget as Checkable;
			row.querySelector<Checkable>('nldd-checkbox')!.checked = row.checked;
			const values = selected.get(row.dataset.group!)!;
			if (row.checked) values.add(row.dataset.value!);
			else values.delete(row.dataset.value!);
			update(gallery(row));
		};

		const section = (from: Element) => gallery(from) as HTMLElement & { show(): void; toggle(): void };

		const filterGroup = (group: Group, index: number) => html`
			${index > 0 ? html`<nldd-spacer size="24"></nldd-spacer>` : nothing}
			<nldd-title
				size="display-5"
				text=${group.title}
				heading-level="2"
			></nldd-title>
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-list
				appearance="simple"
				dividers="never"
				accessible-label=${group.title}
			>
				${group.options.map(option => html`
					<nldd-list-item
						checkbox
						data-group=${group.key}
						data-value=${option.value}
						@change=${handleRow}
					>
						<nldd-cell>
							<nldd-checkbox decorative></nldd-checkbox>
						</nldd-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell text=${option.label}></nldd-text-cell>
						<nldd-spacer-cell size="8"></nldd-spacer-cell>
						<nldd-text-cell
							width="fit-content"
							horizontal-alignment="right"
							color="secondary"
							text=${String(iconNames.filter(option.matches).length)}
						></nldd-text-cell>
					</nldd-list-item>
				`)}
			</nldd-list>
		`;

		return html`
					<nldd-container
						slot="sidebar"
						padding="16"
						padding-bottom="8"
					>
						<nldd-skip-link
							sidebar-section-only="expanded"
							text="Sla filters over"
							href="#iconen"
						></nldd-skip-link>
						${GROUPS.map(filterGroup)}
					</nldd-container>

					<nldd-toolbar accessible-label="Zoeken en filteren">
						<nldd-toolbar-item
							slot="start"
							min-width="240px"
							width="100%"
							max-width="560px"
						>
							<nldd-search-field
								placeholder="Icoon op naam, alias of categorie zoeken"
								accessible-label="Icoon zoeken"
								no-spellcheck
								@input=${handleSearch}
							></nldd-search-field>
							<nldd-menu-item
								slot="overflow"
								icon="search"
								text="Zoeken"
							></nldd-menu-item>
						</nldd-toolbar-item>
						<nldd-toolbar-item
							slot="end"
							sidebar-section-only="collapsed"
						>
							<nldd-button
								appearance="secondary"
								start-icon="filter"
								text="Filters"
								@click=${(e: Event) => section(e.target as Element).toggle()}
							></nldd-button>
							<nldd-menu-item
								slot="overflow"
								icon="filter"
								text="Filters"
								@select=${(e: Event) => section(e.target as Element).show()}
							></nldd-menu-item>
						</nldd-toolbar-item>
					</nldd-toolbar>

					<nldd-spacer
						size="16"
						hidden
					></nldd-spacer>
					<nldd-container
						data-active-filters
						layout="wrap"
						gap="8"
						vertical-alignment="center"
						hidden
					></nldd-container>

					<nldd-spacer size="16"></nldd-spacer>

					<nldd-text
						data-count
						size="sm"
						color="secondary"
						aria-live="polite"
						hidden
					>
						<p></p>
					</nldd-text>
					<nldd-spacer
						size="8"
						hidden
					></nldd-spacer>

					<nldd-collection
						id="iconen"
						item-min-width="140px"
						max-items="120"
						show-load-more
						gap="16"
					>
						${iconNames.map(iconName => {
							const iconAliases = aliasesOf(iconName);
							const searchTokens = [iconName, ...iconAliases, categoryOf.get(iconName) ?? ''].join(' ').toLowerCase();
							const status = NEW_ICONS.has(iconName) ? 'new' : UPDATED_ICONS.has(iconName) ? 'updated' : undefined;
							const statusTag = status === 'new'
								? html`<nldd-tag size="sm" color="accent" text="Nieuw" style="position: absolute; top: -6px; right: -4px;"></nldd-tag>`
								: status === 'updated'
									? html`<nldd-tag size="sm" text="Bijgewerkt" style="position: absolute; top: -6px; right: -4px;"></nldd-tag>`
									: '';
							return html`
								<div
									data-icon=${iconName}
									data-search-tokens=${searchTokens}
									style="position: relative;"
								>
									<nldd-card style="height: 100%;">
										<nldd-container
											padding-top="20"
											padding-bottom="12"
											padding-inline="8"
											horizontal-alignment="center"
											style="text-align: center;"
										>
											<nldd-icon
												icon=${iconName}
												size="32"
											></nldd-icon>
											<nldd-spacer
												size="10"
												direction="vertical"
											></nldd-spacer>
											<nldd-text
												size="xs"
												line-height="tight"
												horizontal-alignment="center"
												text="${iconName}"
											></nldd-text>
											${iconAliases.length > 0 ? html`
												<nldd-text
													size="xxs"
													line-height="tight"
													color="secondary"
													horizontal-alignment="center"
													text="${iconAliases.join(', ')}"
												></nldd-text>
											` : ''}
										</nldd-container>
									</nldd-card>
									${statusTag}
								</div>
							`;
						})}
					</nldd-collection>
					<nldd-inline-dialog
						data-no-results
						icon="magnifier"
						text="Geen iconen gevonden"
						supporting-text="Pas je zoekopdracht of filters aan."
						hidden
					></nldd-inline-dialog>
		`;
	},
};
