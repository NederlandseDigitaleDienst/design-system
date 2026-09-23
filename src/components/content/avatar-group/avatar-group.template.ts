import { html, nothing } from 'lit';
import type { NLDDAvatarGroup } from './avatar-group.js';

export function avatarGroupTemplate(component: NLDDAvatarGroup) {
	const overflow = component._overflow;
	const label = component._t('components.avatar-group.overflow-label')
		.replace('{count}', String(overflow.length));

	return html`
		<style id="generated-rules"></style>
		<div class="avatar-group"
			role=${component.accessibleLabel ? 'group' : nothing}
			aria-label=${component.accessibleLabel || nothing}
		>
			<slot @slotchange=${component._onSlotChange}></slot>
			${overflow.length > 0 ? html`
				<button class="avatar-group__overflow-button"
					id=${component._triggerId}
					type="button"
					aria-label=${label}
					popovertarget=${component._popoverId}
				>
					+${overflow.length}
				</button>
			` : nothing}
		</div>
		${overflow.length > 0 ? html`
			<nldd-popover
				id=${component._popoverId}
				anchor=${component._triggerId}
				placement="bottom-end"
				accessible-label=${component._t('components.avatar-group.overflow-popover-label')}
			>
				<nldd-container padding-inline="16" padding-block="8">
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
			</nldd-popover>
		` : nothing}
	`;
}
