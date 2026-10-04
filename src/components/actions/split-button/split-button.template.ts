import { html, nothing } from 'lit';
import type { NLDDSplitButton } from './split-button.js';

export function template(this: NLDDSplitButton) {
	return html`
		<div class="split-button">
			<nldd-button
				appearance=${this.appearance}
				size=${this.size}
				text=${this.text}
				start-icon=${this.icon || nothing}
				horizontal-alignment="left"
				width="full"
				no-highlight-border
				?disabled=${this.disabled}
				@click=${this._handleActionClick}
			></nldd-button>
			<div class="split-button__divider"></div>
			<div class="split-button__popup-button">
				<nldd-icon-button
					appearance=${this.appearance}
					size=${this.size}
					icon="chevron-down-small"
					text=${this._t('components.split-button.menu-action')}
					tooltip-timing="never"
					no-highlight-border
					hide-lg-text
					?disabled=${this.disabled}
					?expanded=${this._menuIsOpen}
					popup-type="menu"
					@click=${this._handleMenuClick}
				></nldd-icon-button>
			</div>
		</div>
		<slot @slotchange=${this._popup.handleSlotChange}></slot>
	`;
}
