import { html, nothing } from 'lit';
import type { NLDDAvatarGroup } from './avatar-group.js';
import '../tooltip/tooltip.js';

function overflowButton(component: NLDDAvatarGroup, label: string) {
	const fits = component._overflowCountFits;
	const digits = Math.min(String(component._overflow.length).length, 4);
	const button = html`
		<button class="avatar-group__overflow-button avatar-group__overflow-button--digits-${digits}"
			id=${component._triggerId}
			type="button"
			aria-label=${label}
			popovertarget=${component._popoverId}
		>
			${fits
				? `+${component._overflow.length}`
				: html`<nldd-icon class="avatar-group__overflow-icon" icon="ellipsis"></nldd-icon>`}
		</button>
	`;
	return fits ? button : html`<nldd-tooltip text=${label}>${button}</nldd-tooltip>`;
}

export function avatarGroupTemplate(component: NLDDAvatarGroup) {
	const overflow = component._overflow;
	const label = component._t('components.avatar-group.overflow-label')
		.replace('{count}', String(overflow.length));
	// On sm the list is a bottom sheet, and its title bar says whose names these are.
	const title = component.accessibleLabel || component._t('components.avatar-group.overflow-popover-label');

	return html`
		<style id="generated-rules"></style>
		<div class="avatar-group"
			role=${component.accessibleLabel ? 'group' : nothing}
			aria-label=${component.accessibleLabel || nothing}
		>
			<slot @slotchange=${component._onSlotChange}></slot>
			${overflow.length > 0 ? overflowButton(component, label) : nothing}
		</div>
		${overflow.length > 0 ? html`
			<nldd-popover
				id=${component._popoverId}
				anchor=${component._triggerId}
				placement="bottom-end"
				accessible-label=${title}
			>
				<nldd-page
					landmarks="region"
					sticky-header
				>
					<nldd-top-title-bar
						class="avatar-group__overflow-title-bar"
						slot="header"
						text=${title}
						heading-level="2"
						dismiss-text=${component._t('components.avatar-group.overflow-close')}
					></nldd-top-title-bar>
					<nldd-container
						padding-inline="16"
						padding-block="8"
					>
						<nldd-list dividers="never">
							${overflow.map(entry => html`
								<nldd-list-item size="sm">
									<nldd-cell width="fit-content">
										${entry.avatar}
									</nldd-cell>
									<nldd-spacer-cell size="8"></nldd-spacer-cell>
									<nldd-text-cell
										width="full"
										text=${entry.name}
									></nldd-text-cell>
								</nldd-list-item>
							`)}
						</nldd-list>
					</nldd-container>
				</nldd-page>
			</nldd-popover>
		` : nothing}
	`;
}
