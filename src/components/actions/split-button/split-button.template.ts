import { html, nothing, type TemplateResult } from 'lit';
import type { NLDDSplitButton } from './split-button.js';

export function splitButtonTemplate(component: NLDDSplitButton): TemplateResult {
	return html`
		<div class="split-button">
			<nldd-button
				appearance=${component._buttonAppearance()}
				size=${component.size}
				text=${component.text}
				start-icon=${component.icon || nothing}
				shortcut=${component.shortcut || nothing}
				shortcut-mac=${component.shortcutMac || nothing}
				shortcut-windows=${component.shortcutWindows || nothing}
				shortcut-linux=${component.shortcutLinux || nothing}
				href=${component.href || nothing}
				download=${component.download ?? nothing}
				loading-text=${component.loadingText || nothing}
				horizontal-alignment="left"
				width="full"
				no-highlight-border
				single-line
				?loading=${component.loading}
				?disabled=${component.disabled}
				@click=${component._handleActionClick}
			></nldd-button>
			<div class="split-button__divider"></div>
			<div class="split-button__popup-button">
				<nldd-icon-button
					appearance=${component._buttonAppearance()}
					size=${component.size}
					icon="chevron-down-small"
					text=${component._t('components.split-button.show-options-action', { text: component.text })}
					tooltip-timing="never"
					no-highlight-border
					hide-lg-text
					?disabled=${component.disabled}
					.popoverTargetElement=${component._popoverTarget()}
				>
					<slot name="popup" slot="popup"></slot>
					<slot slot="popup"></slot>
				</nldd-icon-button>
			</div>
		</div>
	`;
}
