import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { NLDDMenu } from '../components/actions/menu/menu.js';
import '../components/actions/menu/menu.js';

/** What the overflow menu needs from the bar it belongs to. */
export interface OverflowMenuHost extends ReactiveControllerHost, HTMLElement {
	readonly renderRoot: HTMLElement | DocumentFragment;
}

export interface OverflowMenuOptions {
	/** Prefix of the menu's id. */
	id: string;
	/** After the menu opened or closed; `open` is up to date by then. */
	onToggle?: (open: boolean) => void;
}

/**
 * The "more" menu of a bar that hides what does not fit: nldd-toolbar,
 * nldd-menu-bar and nldd-document-tab-bar. Each bar decides for itself what
 * fits; this is the menu that lists the rest.
 *
 * It lives in the bar's shadow root, not in document.body. It is a popover,
 * so the top layer gets it past any clipping anyway, and a menu in the body
 * goes inert (visible but untouchable) when the bar sits in a modal dialog:
 * everything outside the dialog is inert then. In the shadow root it also
 * inherits the bar's color scheme, language and context, with nothing to carry.
 *
 * A `select` in the menu stays in the menu: what the bar wants the app to hear
 * it sends on itself, from the original the entry stands for. Leaving it would
 * reach the bar's own listeners as if one of its items had been chosen.
 */
export class OverflowMenu implements ReactiveController {
	private static _counter = 0;

	/** Whether the menu is open. The bar renders its button from this. */
	open = false;

	private _menu: NLDDMenu | null = null;
	private _originals = new Map<string, Element>();

	constructor(
		private readonly _host: OverflowMenuHost,
		private readonly _options: OverflowMenuOptions,
	) {
		_host.addController(this);
	}

	/** The menu, while the bar is connected. */
	get menu(): NLDDMenu | null {
		return this._menu;
	}

	hostConnected(): void {
		if (this._menu) return;
		const menu = document.createElement('nldd-menu') as NLDDMenu;
		menu.setAttribute('placement', 'bottom-end');
		menu.id = `${this._options.id}-${OverflowMenu._counter++}`;
		menu.addEventListener('toggle', (event: Event) => {
			this.open = (event as ToggleEvent).newState === 'open';
			this._host.requestUpdate();
			this._options.onToggle?.(this.open);
		});
		menu.addEventListener('select', this._handleSelect);
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
		popoverTargetAction?: string;
	}) | null): void {
		if (!this._menu || !button) return;
		this._menu.anchorElement = button;
		if ('popoverTargetElement' in button) button.popoverTargetElement = this._menu;
		if ('popoverTargetAction' in button && button.popoverTargetAction === 'toggle') {
			button.popoverTargetAction = 'show';
		}
	}

	/** Fill the menu with entries the bar built itself. */
	replace(entries: Element[]): void {
		if (!this._menu) return;
		this._originals.clear();
		this._menu.replaceChildren(...entries);
	}

	/**
	 * Fill the menu with copies of `items`, in this order. The originals stay
	 * where the app put them, so a copy's `select`, which never reaches
	 * listeners on its original, is dispatched again on the original: every
	 * original is stamped with an id that its copy carries.
	 */
	mirror(items: Element[]): void {
		if (!this._menu) return;
		this._originals.clear();
		this._menu.replaceChildren(...items.map((item) => this._clone(item)));
	}

	/** `data-overflow-oid` is outside the attributes a bar watches, so
	 *  stamping starts no new sync. */
	private _clone(original: Element): Element {
		for (const node of [original, ...original.querySelectorAll('*')]) {
			let oid = node.getAttribute('data-overflow-oid');
			if (!oid) {
				oid = `oid-${OverflowMenu._counter++}`;
				node.setAttribute('data-overflow-oid', oid);
			}
			this._originals.set(oid, node);
		}
		const clone = original.cloneNode(true) as Element;
		clone.removeAttribute('slot');
		return clone;
	}

	private _handleSelect = (event: Event): void => {
		// The menu's own listener on itself still runs: this only keeps it from
		// going further.
		event.stopPropagation();
		const stamped = event.composedPath()
			.find((node): node is Element => node instanceof Element && node.hasAttribute('data-overflow-oid'));
		const original = stamped && this._originals.get(stamped.getAttribute('data-overflow-oid')!);
		if (!original) return;
		original.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
			detail: (event as CustomEvent).detail,
		}));
	};
}
