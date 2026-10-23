import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { NLDDTooltip } from './tooltip.js';
import { hasShortcut } from '../../../utilities/shortcut.js';

export function tooltipTemplate(component: NLDDTooltip): TemplateResult {
	/* The slot is not the clickable thing: the trigger the consumer slots in is,
	   and that is a real button or link. Enter and Space on those dispatch a
	   click that bubbles to here, so a keyboard listener beside this @click
	   would never fire. */
	/* eslint-disable lit-a11y/click-events-have-key-events */
	return html`
		<slot
			@mouseenter=${component._handleTriggerEnter}
			@mouseleave=${component._handleTriggerLeave}
			@focusin=${component._handleFocusIn}
			@focusout=${component._handleFocusOut}
			@click=${component._handleTriggerActivate}
		></slot>
		<div class="tooltip"
			popover="manual"
			aria-hidden="true"
			@mouseenter=${component._handleTooltipEnter}
			@mouseleave=${component._handleTooltipLeave}
		>
			<div class="tooltip__body">
				${component.text ? html`<span class="tooltip__text">${component.text}</span>` : nothing}
				${hasShortcut(component) ? html`
					<span class="tooltip__shortcut">
						<nldd-keyboard-shortcut
							size="inherit"
							appearance="simple"
							color="inherit"
							keys=${component.shortcut || nothing}
							mac-keys=${component.shortcutMac || nothing}
							windows-keys=${component.shortcutWindows || nothing}
							linux-keys=${component.shortcutLinux || nothing}
						></nldd-keyboard-shortcut>
					</span>
				` : nothing}
			</div>
		</div>
	`;
}
/* eslint-enable lit-a11y/click-events-have-key-events */
