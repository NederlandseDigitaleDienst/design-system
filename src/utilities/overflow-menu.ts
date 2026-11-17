import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { NLDDMenu } from '../components/actions/menu/menu.js';
import '../components/actions/menu/menu.js';
import { focusAsLastInput } from './return-focus.js';

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
 *
 * Before an entry's action runs, focus goes to the bar's button (`handOff`).
 * Whatever the action opens, a sheet or a dialog, remembers where focus was,
 * and the entry is gone from view once the menu closes.
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
			if (!this.open) this._applyPending();
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

	/**
	 * Focus to the button that opens the menu, before what an entry stands for
	 * runs. An overlay that opens from it would otherwise remember the entry,
	 * which sits in a closed menu by the time it hands focus back, and focus
	 * ended on the body (#450).
	 */
	handOff(): void {
		const button = this._menu?.anchorElement;
		if (button instanceof HTMLElement && button.isConnected) focusAsLastInput(button);
	}

	/** Fill the menu with entries the bar built itself. */
	replace(entries: Element[]): void {
		this._fill(() => {
			this._originals.clear();
			this._copiedAttributes.clear();
			this._menu?.replaceChildren(...entries);
		});
	}

	/**
	 * Fill the menu with copies of `items`, in this order. The originals stay
	 * where the app put them, so a copy's `select`, which never reaches
	 * listeners on its original, is dispatched again on the original: every
	 * original is stamped with an id that its copy carries.
	 */
	mirror(items: Element[]): void {
		if (this.open && this._showsCopiesOf(items)) {
			this._updateCopies();
			return;
		}
		this._fill(() => {
			this._originals.clear();
			this._copiedAttributes.clear();
			this._menu?.replaceChildren(...items.map((item) => this._clone(item)));
		});
	}

	/** Whether the menu holds a copy of each of `items`, in this order. */
	private _showsCopiesOf(items: Element[]): boolean {
		const shown = [...(this._menu?.children ?? [])].map((copy) => copy.getAttribute('data-overflow-oid'));
		return shown.length === items.length
			&& items.every((item, i) => item.getAttribute('data-overflow-oid') === shown[i] && shown[i] !== null);
	}

	/**
	 * Carry what changed on the originals over to their copies, in place: a
	 * choice that checks an item shows its check mark while it blinks. Only the
	 * attributes the original has or had: the menu writes its own on an entry.
	 */
	private _updateCopies(): void {
		for (const copy of this._menu?.querySelectorAll('[data-overflow-oid]') ?? []) {
			const oid = copy.getAttribute('data-overflow-oid')!;
			const original = this._originals.get(oid);
			if (!original) continue;
			const names = new Set(original.getAttributeNames().filter((name) => name !== 'slot'));
			for (const name of this._copiedAttributes.get(oid) ?? []) {
				if (!names.has(name)) copy.removeAttribute(name);
			}
			for (const name of names) {
				const value = original.getAttribute(name)!;
				if (copy.getAttribute(name) !== value) copy.setAttribute(name, value);
			}
			this._copiedAttributes.set(oid, names);
		}
	}

	private _copiedAttributes = new Map<string, Set<string>>();
	private _pending: (() => void) | null = null;

	/**
	 * Refill now, or once the menu has closed. New entries while it is open
	 * would cut the blink of a chosen one short and skip the menu's divider
	 * pass. The entries are made from the originals as they are by then.
	 */
	private _fill(apply: () => void): void {
		if (!this._menu) return;
		if (this.open) {
			this._pending = apply;
			return;
		}
		this._pending = null;
		apply();
	}

	private _applyPending(): void {
		const apply = this._pending;
		this._pending = null;
		apply?.();
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
			this._copiedAttributes.set(oid, new Set(node.getAttributeNames().filter((name) => name !== 'slot')));
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
		this.handOff();
		original.dispatchEvent(new CustomEvent('select', {
			bubbles: true,
			composed: true,
			detail: (event as CustomEvent).detail,
		}));
	};
}
