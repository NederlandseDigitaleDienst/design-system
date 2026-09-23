import { html, nothing } from 'lit';
import type { NLDDMenuItem, NLDDMenu, NLDDMenuGroup } from './menu.js';
import { sanitizeUrl } from '../../../utilities/sanitize-url.js';

const menuRoleMap = {
	menu: 'menu',
	listbox: 'listbox',
} as const;

const itemRoleMap = {
	button: { menu: 'menuitem', listbox: 'option' },
	checkbox: { menu: 'menuitemcheckbox', listbox: 'option' },
	radio: { menu: 'menuitemradio', listbox: 'option' },
} as const;

export function menuTemplate(this: NLDDMenu, isEmpty: boolean, variant: 'menu' | 'listbox') {
	// role="menu"/"listbox" is now STATIC on .menu__list, which only ever owns
	// nldd-menu-item children. The empty-state and the drill-in back button live
	// in .menu__main as siblings of the list (outside the role), so an empty or
	// filtered menu never needs to drop the role to stay ARIA-valid.
	const menuRole = menuRoleMap[variant];
	// Back button shows when this menu is itself a submenu and we're rendering
	// in drill-in mode (touch / narrow viewport). The label is the parent
	// item's text — gives the user context about which level they're in.
	const showBack = this._isSubmenu && this._drillInMode && this._parentItem !== null;
	// Header/footer are ROOT-ONLY: never rendered in a submenu (identity and
	// account-level actions belong to the root menu, not a nested level). The
	// slot is only in the DOM on the root, so submenu-slotted header/footer
	// content is simply not projected.
	const isRoot = !this._isSubmenu;
	return html`
		<div class="menu"
			tabindex="-1"
			@touchstart=${this._handleMenuTouchStart}
			@touchmove=${this._handleMenuTouchMove}
			@touchend=${this._handleMenuTouchEnd}
			@touchcancel=${this._handleMenuTouchEnd}
		>
			${isRoot ? html`
				<div class="menu__header"
					?hidden=${!this._hasHeader}
				>
					<slot
						name="header"
						@slotchange=${this._onHeaderSlotChange}
					></slot>
				</div>
			` : nothing}
			<div class="menu__main">
				${showBack ? html`
					<button class="menu__back-button"
						type="button"
						aria-label=${this._resolvedBackLabel}
						@click=${this._handleBack}
						@mouseenter=${this._handleBackMouseenter}
					>
						<nldd-icon-cell
							size="20"
							icon="chevron-left"
						></nldd-icon-cell>
						<nldd-spacer-cell size="6"></nldd-spacer-cell>
						<nldd-text-cell text=${this._parentItem!.text}></nldd-text-cell>
					</button>
					<!-- Pure visual divider; role="none" keeps strict ARIA validators
					     quiet (a focusable role="separator" inside a menu would need
					     aria-valuenow et al.; this one is decorative). -->
					<div class="menu__back-button-divider"
						role="none"
					></div>
				` : nothing}
				<div class="menu__list"
					role=${menuRole}
				>
					<slot @slotchange=${this._claimItems}></slot>
				</div>
				${isEmpty ? html`
					<div class="menu__empty">
						<slot name="empty">
							<nldd-inline-dialog
								text=${this._resolvedEmptyText}
								supporting-text=${this.emptySupportingText || nothing}
							></nldd-inline-dialog>
						</slot>
					</div>
				` : nothing}
			</div>
			${isRoot ? html`
				<div class="menu__footer"
					?hidden=${!this._hasFooter}
				>
					<slot
						name="footer"
						@slotchange=${this._onFooterSlotChange}
					></slot>
				</div>
			` : nothing}
		</div>
		<!-- Drill-in view-change announcer (WCAG 4.1.3). Sibling of .menu so
		     it sits outside role="menu"'s required-children set. Updated via
		     _announce(); empty and inert until a drill-in transition. -->
		<div class="menu__live-region"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		></div>
	`;
}

export function menuItemTemplate(this: NLDDMenuItem, variant: 'menu' | 'listbox' | null = null) {
	const hasCheckState = this.type !== 'button' && variant === 'menu';
	// No role until a menu claims this item. `menuitem` says there is a menu
	// around you, and an item sitting on its own cannot make that true: it is
	// then a button, and says so. aria-checked and aria-selected fall away with
	// it, both being part of the same promise.
	const role = variant ? itemRoleMap[this.type][variant] : nothing;
	const hasSubmenu = this._hasSubmenu;
	// A plain button item with an href renders as a real link. Submenu openers,
	// checkbox/radio items, and disabled items keep the button — they need its
	// richer behavior (popover invoker, check state, inert disabling).
	// Sanitize the href so a caller-supplied javascript:/data:/vbscript:/blob:
	// URL can't become an XSS vector; a blocked URL yields '' and falls back to
	// the button branch. Mirrors the nav-bar sheet (top-navigation-bar.ts).
	const safeHref = sanitizeUrl(this.href) ?? '';
	const asLink = !!safeHref && this.type === 'button' && !hasSubmenu && !this.disabled;

	const content = html`
		${hasCheckState ? html`
			<nldd-icon-cell
				size="24"
				horizontal-alignment="center"
				icon=${this.selected ? 'check-mark' : nothing}
			></nldd-icon-cell>
			<nldd-spacer-cell size="4"></nldd-spacer-cell>
		` : nothing}
		${this.icon ? html`
			<nldd-icon-cell
				size="20"
				icon=${this.icon}
			></nldd-icon-cell>
			<nldd-spacer-cell size="8"></nldd-spacer-cell>
		` : nothing}
		<nldd-text-cell
			text=${this.text}
			query=${this.query}
			query-mark-mode=${this.queryMarkMode}
		></nldd-text-cell>
		${this.details ? html`
			<nldd-spacer-cell size="8"></nldd-spacer-cell>
			<nldd-text-cell
				width="fit-content"
				horizontal-alignment="right"
				color="secondary"
				text=${this.details}
			></nldd-text-cell>
		` : nothing}
		<!--
			Accessibility (intentional decision): the shortcut is deliberately NOT
			aria-hidden. It is announced as part of the item's accessible name —
			e.g. "Ongedaan maken Ctrl Z" — so screen-reader users learn the
			accelerator, the way native OS menus surface it. aria-keyshortcuts was
			considered and rejected: the menu item itself does not handle the key
			(the application's global shortcut does), so the plain announcement is
			the deliberate choice rather than a missing aria-hidden.
		-->
		${(this.shortcut || this.shortcutMac || this.shortcutWindows || this.shortcutLinux) ? html`
			<nldd-spacer-cell size="8"></nldd-spacer-cell>
			<nldd-text-cell
				width="fit-content"
				size="md"
				color="secondary"
				horizontal-alignment="right"
			>
				<nldd-keyboard-shortcut
					size="inherit"
					variant="simple"
					color="inherit"
					keys=${this.shortcut || nothing}
					mac-keys=${this.shortcutMac || nothing}
					windows-keys=${this.shortcutWindows || nothing}
					linux-keys=${this.shortcutLinux || nothing}
				></nldd-keyboard-shortcut>
			</nldd-text-cell>
		` : nothing}
		${hasSubmenu ? html`
			<nldd-spacer-cell size="6"></nldd-spacer-cell>
			<nldd-icon-cell
				size="20"
				icon="chevron-right"
			></nldd-icon-cell>
		` : nothing}
	`;

	return html`
		${asLink ? html`
			<a class="menu__item"
				href=${safeHref}
				role=${role}
				aria-current=${this.selected ? 'page' : nothing}
				@click=${this._handleClick}
			>${content}</a>
		` : html`
			<button class="menu__item"
				type="button"
				role=${role}
				?disabled=${this.disabled}
				aria-checked=${hasCheckState ? String(this.selected) : nothing}
				aria-selected=${variant === 'listbox' ? String(this.selected) : nothing}
				aria-haspopup=${hasSubmenu ? 'menu' : nothing}
				aria-expanded=${hasSubmenu ? String(this._submenuOpen) : nothing}
				aria-controls=${hasSubmenu && this._submenuEl?.id ? this._submenuEl.id : nothing}
				.popoverTargetElement=${this._submenuEl}
				@click=${this._handleClick}
			>${content}</button>
		`}
		<!--
			Project the slotted nldd-menu (the submenu, if any) into the flat
			tree. Without this slot, a light-DOM child nldd-menu sits outside
			any flat tree — and the Popover API uses the flat tree to locate
			a popover's ancestor popover. Without an ancestor, calling
			showPopover() on the submenu would dismiss the parent menu (its
			DOM ancestor) instead of stacking on top of it. The slot itself
			has no visible effect because the submenu is display:none until
			it opens its own popover.
		-->
		<slot></slot>
	`;
}

export function menuDividerTemplate() {
	return html`<div class="menu__divider"
		role="separator"
	></div>`;
}

export function menuGroupTemplate(component: NLDDMenuGroup) {
	// aria-hidden on the title prevents AT from announcing it twice — once as
	// standalone text and again as the group label via aria-labelledby. The
	// label reference still reads the hidden node's text content, which is
	// the standard pattern for this kind of labeling.
	return html`
		<div class="menu__group">
			<div class="menu__group-title"
				id=${component._titleId}
				aria-hidden="true"
			>${component.text}</div>
			<div class="menu__group-items"
				role="group"
				aria-labelledby=${component._titleId}
			>
				<slot></slot>
			</div>
		</div>
	`;
}
