import { html, nothing } from 'lit';
import type { NLDDMenuBarItem } from './menu-bar-item.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';
import '../../content/tooltip/tooltip.js';

export function template(component: NLDDMenuBarItem) {
	const safeHref = sanitizeUrl(component.href);
	const isLink = Boolean(safeHref);
	const isIconOnly = Boolean((component.iconOnly || (component.contentPriority === 'icon' && component.compact)) && component.text);
	const ariaLabel = component.accessibleLabel || (isIconOnly ? component.text : nothing);
	// Once the text is hidden, hover has to bring it back: an icon alone leaves
	// a sighted reader guessing, and at 200% zoom a bar is compact on a desktop.
	// Always rendered, with an empty text when there is nothing to show, so the
	// control is not replaced (and focus lost) when the bar turns compact.
	const hasIcon = Boolean(component.icon) || component._hasSlottedIcon;
	const showsIconOnly = Boolean(component.text) && (component.iconOnly || (component.contentPriority === 'icon' && component.compact && hasIcon));
	const tooltipText = showsIconOnly ? (component.accessibleLabel || component.text) : '';
	const ariaCurrent = component.current ? component.currentType : nothing;
	const ariaHaspopup = component.expandable ? 'menu' : (component.haspopup || nothing);
	const ariaExpanded = (component.expandable || component.haspopup) ? String(component.expanded) : nothing;
	// The slot is always rendered, so a slotted icon is noticed when it arrives;
	// the icon name is its fallback.
	const icon = html`
		<span class="menu-bar-item__icon" ?hidden=${!component.icon && !component._hasSlottedIcon}>
			<slot name="icon" @slotchange=${component._onIconSlotChange}>
				${component.icon ? html`<nldd-icon icon=${component.icon}></nldd-icon>` : nothing}
			</slot>
		</span>
	`;

	if (isLink) {
		return html`
			<nldd-tooltip text=${tooltipText}>
				<a class="menu-bar-item"
					href=${safeHref as string}
					aria-disabled=${component.disabled || nothing}
					tabindex=${component.disabled ? '-1' : nothing}
					aria-current=${ariaCurrent}
					aria-label=${ariaLabel}
					aria-haspopup=${ariaHaspopup}
					aria-expanded=${ariaExpanded}
				>
					${icon}
					<span class="menu-bar-item__text">
						${component.text}
					</span>
					${component.expandable ? html`
						<span class="menu-bar-item__disclosure-icon">
							<nldd-icon icon="chevron-down-small"></nldd-icon>
						</span>
					` : nothing}
				</a>
			</nldd-tooltip>
			<slot @slotchange=${component._onSlotChange}></slot>
		`;
	}

	return html`
		<nldd-tooltip text=${tooltipText}>
			<button class="menu-bar-item"
				type="button"
				?disabled=${component.disabled}
				aria-current=${ariaCurrent}
				aria-label=${ariaLabel}
				aria-haspopup=${ariaHaspopup}
				aria-expanded=${ariaExpanded}
				.popoverTargetElement=${component.popoverTargetElement}
				.popoverTargetAction=${component.popoverTargetAction}
			>
				${icon}
				<span class="menu-bar-item__text">
					${component.text}
				</span>
				${component.expandable ? html`
					<span class="menu-bar-item__disclosure-icon">
						<nldd-icon icon="chevron-down-small"></nldd-icon>
					</span>
				` : nothing}
			</button>
		</nldd-tooltip>
		<slot @slotchange=${component._onSlotChange}></slot>
	`;
}
