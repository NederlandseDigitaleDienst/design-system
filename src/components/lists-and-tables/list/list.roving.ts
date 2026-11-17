import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Where a row stands in the roving tab stop of its list.
 *
 * - `off`: the list runs no roving (a listbox, a form, a reorderable list), so
 *   the row and its controls keep their own tab stops.
 * - `stop`: the one row Tab lands on. Its controls are reachable from there.
 * - `rest`: reached only with the arrow keys.
 */
export type RovingState = 'off' | 'stop' | 'rest';

/** What the roving needs from a row. Writing `_roving` puts the row's tab stops
 *  in place straight away, also when the value does not change. */
export interface RovingRow extends HTMLElement {
	_roving: RovingState;
	readonly selected: boolean;
	/** Everything but the row itself out of the tab order. */
	_parkControls(): void;
}

export interface ListRovingOptions<Row extends RovingRow> {
	/** Whether the list answers to the arrow keys at all. */
	enabled(): boolean;
	/** Every row, nested ones included. */
	rows(): Row[];
	/** The rows the arrows stop at, in the order they paint. */
	stops(): Row[];
	/** The row an event came from. */
	rowOf(event: Event): Row | undefined;
	/** After the stops were picked, with the rows the arrows reach. */
	onStops?(stops: Row[]): void;
}

/**
 * The roving tab stop of a list: one row is the tab stop, the arrow keys move
 * it, and a list is one stop from the outside. The list decides which rows
 * there are and which of them are stops; this decides which one is current and
 * keeps that in step with where focus is.
 */
export class ListRoving<Row extends RovingRow> implements ReactiveController {
	private _scheduled = false;

	constructor(
		private readonly _host: ReactiveControllerHost & HTMLElement,
		private readonly _options: ListRovingOptions<Row>,
	) {
		_host.addController(this);
	}

	hostConnected(): void {
		this._host.addEventListener('focusin', this._onFocusIn);
		this._host.addEventListener('focusout', this._onFocusOut);
	}

	hostDisconnected(): void {
		this._host.removeEventListener('focusin', this._onFocusIn);
		this._host.removeEventListener('focusout', this._onFocusOut);
	}

	/** The row Tab lands on, if the roving runs. */
	get current(): Row | undefined {
		return this._options.rows().find((row) => row._roving === 'stop');
	}

	/**
	 * Pick the stops again, in a microtask: the list asks for this from inside
	 * its update, and setting a row's reactive state there would trip Lit's
	 * change-in-update warning. Coalesced, so many asks make one pass.
	 */
	update(): void {
		if (this._scheduled) return;
		this._scheduled = true;
		queueMicrotask(() => {
			this._scheduled = false;
			this._apply();
		});
	}

	/**
	 * Make `row` the current one, now: the caller hands it focus in the same
	 * tick, and a row without a tab stop cannot take it. Every row, not only the
	 * stops: Escape can leave a row that is no stop marked current.
	 */
	moveTo(row: Row): void {
		for (const each of this._options.rows()) each._roving = each === row ? 'stop' : 'rest';
	}

	/** The current row stays the current one while it is still a stop, else the
	 *  selected one, else the first. */
	private _apply(): void {
		const enabled = this._options.enabled();
		const rows = this._options.rows();
		const stops = enabled ? this._options.stops() : [];
		this._options.onStops?.(stops);
		if (!enabled) {
			for (const row of rows) if (row._roving !== 'off') row._roving = 'off';
			return;
		}
		if (stops.length === 0) {
			for (const row of rows) if (row._roving === 'off') row._roving = 'rest';
			return;
		}
		const entry = stops.find((row) => row._roving === 'stop')
			?? stops.find((row) => row.selected)
			?? stops[0];
		this.moveTo(entry);
	}

	private _onFocusIn = (event: FocusEvent): void => {
		if (!this._options.enabled()) return;
		const row = this._options.rowOf(event);
		if (!row) return;
		// Wherever focus lands (Tab in, a click, a script) is where the arrows go on from.
		if (row._roving !== 'stop' && this._options.stops().includes(row)) {
			this.moveTo(row);
			return;
		}
		// Back on the row it was on: leaving the list parked its controls.
		if (row._roving === 'stop') row._roving = 'stop';
	};

	/**
	 * Focus gone from the list: park everything but the row.
	 *
	 * The stops a row hands out to its controls last as long as the row is the
	 * current one, so without this they are still there after you tab away, and
	 * Shift+Tab back in lands inside the control you left rather than on the row.
	 *
	 * Deferred: focus moving between two controls of the same row fires focusout
	 * before focusin, and `relatedTarget` is retargeted at a shadow boundary, so
	 * the only reliable answer to "did focus leave" is the one you get after it
	 * has landed.
	 */
	private _onFocusOut = (): void => {
		if (!this._options.enabled()) return;
		queueMicrotask(() => {
			if (!this._host.isConnected || this._containsFocus()) return;
			for (const row of this._options.rows()) row._parkControls();
		});
	};

	/** document.activeElement only names the outermost host, so this walks down
	 *  the chain of active elements: at every level, is this the list or inside it. */
	private _containsFocus(): boolean {
		let node: Element | null = document.activeElement;
		while (node) {
			if (node === this._host || this._host.contains(node)) return true;
			node = node.shadowRoot?.activeElement ?? null;
		}
		return false;
	}
}
