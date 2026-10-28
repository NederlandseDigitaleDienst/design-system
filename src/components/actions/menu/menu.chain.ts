import { carryContext, releaseContext } from '../../../utilities/carried-context.js';
import type { NLDDMenu } from './menu.js';
import type { NLDDMenuItem } from './menu-item.js';

/**
 * One open submenu in a chain: which menu opened it, from which item, and how
 * it closes. A level has three paths:
 *
 * 1. **Open.** Wire the submenu to its parent, register it with the root, and
 *    show it: beside its item in cascade mode, in place of its parent in
 *    drill-in mode.
 * 2. **One level back.** The submenu closed on its own (the back button,
 *    ArrowLeft, Escape, light-dismiss in cascade mode). Tear down, and in
 *    drill-in mode show the parent again and say where you are.
 * 3. **Collapse.** The whole chain goes (a select, the anchor, a tap outside,
 *    a resize). Tear down without showing the parent, driven from the root's
 *    registry, so it never depends on parent links that real interaction can
 *    leave stale.
 *
 * Everything a level needs is captured here when it opens, so a viewport flip
 * between cascade and drill-in mid-navigation cannot leave it half undone.
 */
export class SubmenuLevel {
	/** The root of the chain, whose registry holds this level. */
	readonly root: NLDDMenu;

	/** Where a drill-in submenu stood before it moved to <body>. */
	private _homeParent: HTMLElement | null = null;
	private _homeNextSibling: Node | null = null;

	constructor(
		readonly parent: NLDDMenu,
		readonly opener: NLDDMenuItem,
		readonly submenu: NLDDMenu,
		readonly drillIn: boolean,
	) {
		this.root = parent._rootMenu;
	}

	open(): void {
		const { parent, opener, submenu, root } = this;
		// One peer submenu at a time.
		parent._activeSubmenu?.hidePopover?.();

		submenu._parentMenu = parent;
		submenu._parentItem = opener;
		submenu._chainRoot = root;
		if (!root._openChain.includes(this)) root._openChain.push(this);

		if (this.drillIn) {
			// Every level opens at the root's anchor and placement, so the views
			// stack in one place. The back button comes from the template.
			submenu.anchorElement = root._getAnchorEl();
			submenu.placement = root.placement;
		} else {
			submenu.anchorElement = opener;
			submenu.placement = 'right-start';
		}

		parent._activeSubmenu = submenu;
		parent._activeSubmenuOpener = opener;
		parent._activeLevel = this;
		opener._submenuOpen = true;
		// What is current now sits in the submenu. The opener still shows as
		// active through aria-expanded, and :hover brings back the accent.
		opener.removeAttribute('highlighted');

		submenu.addEventListener('toggle', this._handleToggle);

		if (this.drillIn) {
			// Out of the popover stack of its parent, so the parent can close
			// without closing the submenu along with it. Put back on teardown.
			this._homeParent = submenu.parentElement;
			this._homeNextSibling = submenu.nextSibling;
			carryContext(submenu, this._homeParent);
			document.body.appendChild(submenu);
		}

		submenu.showPopover?.();

		if (this.drillIn) {
			// The view swapped: say which level you entered, the same text the
			// back button carries.
			submenu._announce(submenu._t('components.menu.submenu-title', { title: opener.text }));
			// Tells the parent's own level that this hide makes room for a
			// deeper view, and is no step back.
			parent._drillInHidingForDeeper = true;
			parent.hidePopover?.();
		} else {
			// One frame on, the submenu stands where Floating UI put it.
			requestAnimationFrame(() => {
				if (parent._activeSubmenu === submenu) parent._safeTriangle.start(submenu);
			});
		}
	}

	/** Close this level as part of collapsing the whole chain. */
	collapse(): void {
		// Off first, so this hide is not also taken for a step back.
		this.submenu.removeEventListener('toggle', this._handleToggle);
		this.submenu.hidePopover?.();
		this._teardown(false);
	}

	private _handleToggle = (event: Event): void => {
		if ((event as ToggleEvent).newState !== 'closed') return;
		// Hidden to make room for a deeper level: the chain stays, and so does
		// this listener for the real close later.
		if (this.submenu._drillInHidingForDeeper) {
			this.submenu._drillInHidingForDeeper = false;
			return;
		}
		this._teardown(true);
	};

	/** Undo what `open` did. With `stepBack`, a drill-in parent shows again and
	 *  announces itself; a collapse leaves it closed and silent. */
	private _teardown(stepBack: boolean): void {
		const { parent, opener, submenu, root } = this;
		submenu.removeEventListener('toggle', this._handleToggle);
		if (parent._activeSubmenu === submenu) {
			parent._activeSubmenu = null;
			parent._activeSubmenuOpener = null;
			parent._activeLevel = null;
		}
		submenu._parentMenu = null;
		submenu._parentItem = null;
		submenu._chainRoot = null;
		const index = root._openChain.indexOf(this);
		if (index !== -1) root._openChain.splice(index, 1);
		opener._submenuOpen = false;

		if (this.drillIn) {
			releaseContext(submenu);
			if (this._homeParent?.isConnected) {
				this._homeParent.insertBefore(submenu, this._homeNextSibling);
			} else {
				// Its home left the DOM while it stood in <body> (navigation, a
				// story teardown). Nowhere to go back to, so it goes.
				submenu.remove();
			}
			if (stepBack && parent.isConnected) {
				if (!parent.matches(':popover-open')) parent.showPopover?.();
				const destination = parent._parentItem?.text;
				parent._announce(destination
					? parent._t('components.menu.submenu-back-action', { title: destination })
					: parent._t('components.menu.back-action'));
			}
		}

		// The opener loses the in-transit accent, unless it has focus: ArrowLeft
		// focuses it before this toggle arrives, and that focus highlighted it.
		if (!opener.hasAttribute('data-focused')) opener.removeAttribute('highlighted');
		parent._safeTriangle.stop();
		parent.dispatchEvent(new CustomEvent('submenu-close', {
			detail: { submenu, item: opener },
			bubbles: true,
			composed: false,
		}));
	}
}
