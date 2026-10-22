import { html, nothing } from 'lit';
import type { NLDDButton } from './button.js';
import { linkRel } from '../../../utilities/link-rel.js';
import { linkHintKey } from '../../../utilities/link-hint.js';
import { hasShortcut, shortcutLabel } from '../../../utilities/shortcut.js';
import '../../content/keyboard-shortcut/keyboard-shortcut.js';

interface TemplateHelpers {
	handleClick: (e: MouseEvent) => void;
}

function renderContent(component: NLDDButton) {
	// `button__text` falls back to the slot on falsy `text`. The property
	// defaults to '', so `text=""` and an absent attribute are indistinguishable
	// — both intentionally render the slot rather than an empty label.
	return html`
		<span class="button__content">
			${component.startIcon ? html`
				<span class="button__start-icon">
					<nldd-icon icon=${component.startIcon}></nldd-icon>
				</span>
			` : html`<slot name="start-icon"></slot>`}
			<span class="button__text-area">
				<span class="button__text">${component.text ? component.text : html`<slot name="text"></slot>`}</span>
				${component.supportingText ? html`<span class="button__supporting-text">${component.supportingText}</span>` : nothing}
			</span>
			${hasShortcut(component) ? html`
				<span class="button__shortcut">
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
			${component.endIcon ? html`
				<span class="button__end-icon">
					<nldd-icon icon=${component.endIcon}></nldd-icon>
				</span>
			` : html`<slot name="end-icon"></slot>`}
		</span>
		${component.expandable ? html`
			<nldd-icon class="button__disclosure-icon"
				icon="chevron-down-small"
			></nldd-icon>
		` : nothing}
	`;
}

export function template(this: NLDDButton, helpers: TemplateHelpers) {
	const content = renderContent(this);

	const buttonClass = ['button',
		this.supportingText ? 'has-supporting-text' : '',
	].filter(Boolean).join(' ');

	// `expandable` (disclosure widget signal) or `popup-type` (popup container
	// signal) both require aria-expanded to always be present so screen
	// readers know the current open/closed state. Without one of these, only
	// open=true forwards aria-expanded — keeps plain buttons free of
	// irrelevant ARIA attributes.
	const isDisclosure = this.expandable || !!this.popupType;
	const ariaExpanded = isDisclosure ? String(this.expanded) : (this.expanded ? 'true' : nothing);

	// A link to another website or a new tab says so (WCAG 2.1 SC 3.2.2).
	// Only the <a> path (href) navigates.
	const hintKey = linkHintKey(this.href, this.target);
	const linkHint = hintKey ? this._t(`components.button.${hintKey}`) : '';

	// `supporting-text` renders in a sibling span next to the text; the
	// accessible-name flat-string algorithm concatenates them without a
	// separator ("OpslaanAlle wijzigingen"). With no explicit accessible-label,
	// join them with a comma so screen readers announce the two apart. Filtering
	// empties keeps a name when only supporting-text is set — otherwise an
	// icon-less button would be nameless. (Slotted text can't be read here —
	// those consumers should set accessible-label.)
	const baseAriaLabel = this.accessibleLabel
		|| (this.supportingText ? [this.text, this.supportingText].filter(Boolean).join(', ') : '');
	// aria-label wins the accessible-name cascade, so when one is set the link
	// hint must live inside it; otherwise `nothing` leaves the name content-derived
	// and the visually-hidden span below appends the hint (it also reaches slotted
	// text, which can't be read into a string here).
	// Without an aria-label the shortcut reaches the name through the content,
	// as in nldd-menu-item; with one it has to be added to it.
	const namedAriaLabel = baseAriaLabel ? [baseAriaLabel, shortcutLabel(this)].filter(Boolean).join(' ') : '';
	const ariaLabel = namedAriaLabel
		? [namedAriaLabel, linkHint].filter(Boolean).join(', ')
		: nothing;
	const renderLinkHint = !!linkHint && !baseAriaLabel;

	// Loading: an activity indicator overlays the (opacity-hidden) content. It
	// sits OUTSIDE the <button>/<a> (a sibling, overlaid via the host's
	// position:relative) so its role="status" live region can announce "Laden"
	// without joining the button's content-derived accessible name. aria-busy
	// stays on the control as supplementary state. `instant` so it shows the
	// moment loading starts. Sizes: xs:16, sm:20, md:24.
	const ariaBusy = this.loading ? 'true' : nothing;
	const loadingIndicator = this.loading
		? html`
			<div class="button__activity-indicator">
				<nldd-activity-indicator
					timing="instant"
					size=${this.size === 'xs' ? '16' : this.size === 'sm' ? '20' : this.size === 'lg' ? '28' : '24'}
					text=${this.loadingText || nothing}
				></nldd-activity-indicator>
			</div>
		`
		: nothing;

	// A single slotted nldd-menu / nldd-popover that this button invokes. Kept in
	// a named slot so it never lands in the text/icon slots; it renders nothing
	// in flow (a popover is display:none until shown in the top layer). See
	// _handleClick.
	const popupSlot = html`<slot name="popup" @slotchange=${this._popup.handleSlotChange}></slot>`;

	if (this.href) {
		const resolvedRel = linkRel(this.rel, this.target);
		return html`
			<a class=${buttonClass}
				href=${this.href}
				target=${this.target || nothing}
				rel=${resolvedRel || nothing}
				aria-disabled=${this.disabled ? 'true' : nothing}
				aria-label=${ariaLabel}
				aria-haspopup=${this.popupType || nothing}
				aria-expanded=${ariaExpanded}
				aria-busy=${ariaBusy}
				tabindex=${this.noTab ? '-1' : nothing}
				@pointerdown=${this._popup.handlePointerdown}
				@click=${helpers.handleClick}
			>
				${content}${renderLinkHint ? html`<span class="button__link-hint">, ${linkHint}</span>` : nothing}
			</a>
			${loadingIndicator}
			${popupSlot}
		`;
	}

	// .popoverTargetElement / .popoverTargetAction are bound unguarded: in
	// browsers without Popover-invoker IDL support Lit sets a harmless expando
	// and the cross-shadow association just doesn't take effect — but those
	// browsers don't support the Popover API at all, so the menu this button
	// drives is non-functional regardless. No per-binding capability check.
	return html`
		<button class=${buttonClass}
			type=${this.type}
			?disabled=${this.disabled}
			aria-disabled=${this.disabled ? 'true' : nothing}
			aria-label=${ariaLabel}
			aria-haspopup=${this.popupType || nothing}
			aria-expanded=${ariaExpanded}
			aria-busy=${ariaBusy}
			tabindex=${this.noTab ? '-1' : nothing}
			popovertarget=${this.popovertarget || nothing}
			.popoverTargetElement=${this.popoverTargetElement}
			.popoverTargetAction=${this.popoverTargetAction}
			@pointerdown=${this._popup.handlePointerdown}
			@click=${helpers.handleClick}
		>
			${content}
		</button>
		${loadingIndicator}
		${popupSlot}
	`;
}
