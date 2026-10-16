import { html, nothing } from 'lit';
import { ICONS, aliases } from './icon.js';
import { NEW_ICONS, UPDATED_ICONS } from './icon-gallery-status.js';
import '../../inputs/search-field/search-field.js';
import '../../inputs/segmented-control/segmented-control.js';
import '../../layout/card/card.js';
import '../../layout/collection/collection.js';
import '../../layout/container/container.js';
import '../../layout/spacer/spacer.js';
import '../tag/tag.js';
import '../text/text.js';

const aliasSet = new Set(Object.keys(aliases));
const iconNames = ICONS.filter(name => !aliasSet.has(name));

/** The icon gallery, shown on the Docs/Iconen page (src/docs/icons.mdx). */
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
		const applyFilters = (wrapper: HTMLElement) => {
			const query = (wrapper.dataset.query ?? '').toLowerCase().trim();
			const status = wrapper.dataset.statusFilter ?? 'all';
			wrapper.querySelectorAll<HTMLElement>('[data-search-tokens]').forEach(tile => {
				const matchesQuery = !query || tile.dataset.searchTokens!.includes(query);
				const matchesStatus = status === 'all' || tile.dataset.status === status;
				tile.style.display = matchesQuery && matchesStatus ? '' : 'none';
			});
		};
		const handleSearch = (e: CustomEvent<{ value: string }>) => {
			// The native input event bubbles out of the shadow root too (composed,
			// detail = 0); only the component's own CustomEvent carries detail.value.
			if (typeof e.detail?.value !== 'string') return;
			const wrapper = (e.target as HTMLElement).closest<HTMLElement>('[data-gallery]')!;
			wrapper.dataset.query = e.detail.value;
			applyFilters(wrapper);
		};
		const handleStatusFilter = (e: CustomEvent<{ value: string }>) => {
			const wrapper = (e.target as HTMLElement).closest<HTMLElement>('[data-gallery]')!;
			wrapper.dataset.statusFilter = e.detail.value;
			applyFilters(wrapper);
		};
		return html`
			<nldd-container
				data-gallery
				gap="16"
				padding="16"
			>
				<nldd-container
					layout="row"
					gap="12"
				>
					<nldd-search-field
						width="full"
						placeholder="Icoon op naam of alias zoeken"
						accessible-label="Icoon op naam of alias zoeken"
						no-spellcheck
						style="flex: 1;"
						@input=${handleSearch}
					></nldd-search-field>
					<nldd-segmented-control
						value="all"
						width="fit-content"
						accessible-label="Filter op status"
						@change=${handleStatusFilter}
					>
						<nldd-segmented-control-item
							value="all"
							text="Alles"
						></nldd-segmented-control-item>
						<nldd-segmented-control-item
							value="new"
							text="Nieuw"
						></nldd-segmented-control-item>
						<nldd-segmented-control-item
							value="updated"
							text="Bijgewerkt"
						></nldd-segmented-control-item>
					</nldd-segmented-control>
				</nldd-container>
				<nldd-collection
					item-min-width="180px"
					max-items="999"
					gap="16"
				>
					${iconNames.map(iconName => {
						const iconAliases = Object.entries(aliases)
							.filter(([, target]) => target === iconName)
							.map(([alias]) => alias);
						const searchTokens = [iconName, ...iconAliases].join(' ').toLowerCase();
						const status = NEW_ICONS.has(iconName) ? 'new' : UPDATED_ICONS.has(iconName) ? 'updated' : undefined;
						const statusTag = status === 'new'
							? html`<nldd-tag size="sm" color="accent" text="Nieuw" style="position: absolute; top: 8px; right: 8px;"></nldd-tag>`
							: status === 'updated'
								? html`<nldd-tag size="sm" text="Bijgewerkt" style="position: absolute; top: 8px; right: 8px;"></nldd-tag>`
								: '';
						return html`
							<nldd-card
								data-search-tokens=${searchTokens}
								data-status=${status ?? nothing}
								style="position: relative;"
							>
								${statusTag}
								<nldd-container
									padding="16"
									horizontal-alignment="center"
									style="text-align: center;"
								>
									<nldd-icon
										icon=${iconName}
										size="32"
									></nldd-icon>
									<nldd-spacer
										size="12"
										direction="vertical"
									></nldd-spacer>
									<nldd-text
										size="xs"
										line-height="tight"
										horizontal-alignment="center"
									>
										${iconName}
									</nldd-text>
									${iconAliases.length > 0 ? html`
										<nldd-text
											size="xxs"
											line-height="tight"
											color="secondary"
											horizontal-alignment="center"
										>
											${iconAliases.join(', ')}
										</nldd-text>
									` : ''}
								</nldd-container>
							</nldd-card>
						`;
					})}
				</nldd-collection>
			</nldd-container>
		`;
	},
};
