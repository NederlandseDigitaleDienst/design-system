import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { NLDDMenu } from '../../actions/menu/menu.js';
import '../../actions/menu/menu.js';

/** What the overflow menu needs from its toolbar. */
export interface OverflowMenuHost extends ReactiveControllerHost, HTMLElement {
	readonly renderRoot: HTMLElement | DocumentFragment;
}

/**
 * The overflow menu of an nldd-toolbar: an nldd-menu holding copies of the
 * menu items of everything that did not fit, and of the toolbar's own
 * `overflow` slot.
 *
 * It lives in the toolbar's shadow root, not in document.body. It is a popover,
 * so the top layer gets it past any clipping anyway, and a menu in the body goes
 * inert (visible but untouchable) when the toolbar sits in a modal dialog:
 * everything outside the dialog is inert then.
 *
 * The menu holds clones, because the originals stay where the consumer put
 * them. A clone's `select` never reaches listeners on its original, so it is
 * sent on: every original is stamped with an id that its clone carries, and a
 * `select` from a clone is dispatched again on the original.
 */
export class ToolbarOverflowMenu implements ReactiveController {
	private static _counter = 0;

	/** Whether the menu is open. The toolbar renders its button from this. */
	open = false;

	private _menu: NLDDMenu | null = null;
	private _originals = new Map<string, Element>();

	constructor(private readonly _host: OverflowMenuHost) {
		_host.addController(this);
	}

	hostConnected(): void {
		if (this._menu) return;
		const menu = document.createElement('nldd-menu') as NLDDMenu;
		menu.setAttribute('placement', 'bottom-end');
		menu.id = `nldd-toolbar-overflow-menu-${ToolbarOverflowMenu._counter++}`;
		menu.addEventListener('toggle', (event: Event) => {
			this.open = (event as ToggleEvent).newState === 'open';
			this._host.requestUpdate();
		});
		menu.addEventListener('select', this._forwardSelect);
		this._host.renderRoot.appendChild(menu);
		this._menu = menu;
	}

	hostDisconnected(): void {
		this._menu?.remove();
		this._menu = null;
		this.open = false;
	}

	hide(): void {
		if (this.open) this._menu?.hidePopover();
	}

	/**
	 * Make `button` the menu's invoker. The browser opens and closes it
	 * natively through popovertarget, and the menu keeps `popoverTargetAction`
	 * in step with its state ('hide' while open, 'show' while closed). The
	 * default 'toggle' becomes 'show' here, for the very first click before the
	 * menu ever toggled.
	 */
	anchorTo(button: (HTMLElement & {
		popoverTargetElement?: Element | null;
		popoverTargetAction?: 'toggle' | 'show' | 'hide';
	}) | null): void {
		if (!this._menu || !button) return;
		this._menu.anchorElement = button;
		if ('popoverTargetElement' in button) button.popoverTargetElement = this._menu;
		if ('popoverTargetAction' in button && button.popoverTargetAction === 'toggle') {
			button.popoverTargetAction = 'show';
		}
	}

	/** Fill the menu with copies of `items`, in this order. */
	fill(items: Element[]): void {
		if (!this._menu) return;
		this._menu.innerHTML = '';
		this._originals.clear();
		for (const item of items) this._menu.appendChild(this._clone(item));
	}

	/** Stamps the original and every descendant with an id the clone copies.
	 *  `data-toolbar-oid` is outside the toolbar's attribute filter, so stamping
	 *  starts no new sync. */
	private _clone(original: Element): Element {
		for (const node of [original, ...original.querySelectorAll('*')]) {
			let oid = node.getAttribute('data-toolbar-oid');
			if (!oid) {
				oid = `oid-${ToolbarOverflowMenu._counter++}`;
				node.setAttribute('data-toolbar-oid', oid);
			}
			this._originals.set(oid, node);
		}
		const clone = original.cloneNode(true) as Element;
		clone.removeAttribute('slot');
		return clone;
	}

	private _forwardSelect = (event: Event): void => {
		const stamped = event.composedPath()
			.find((node): node is Element => node instanceof Element && node.hasAttribute('data-toolbar-oid'));
		const original = stamped && this._originals.get(stamped.getAttribute('data-toolbar-oid')!);
		if (!original) return;
		original.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
			detail: (event as CustomEvent).detail,
		}));
	};
}
