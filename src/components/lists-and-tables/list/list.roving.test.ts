import { LitElement, html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { ListRoving, type RovingRow, type RovingState } from './list.roving.js';

/** A row with nothing but what the roving reads: a button to land on. */
class FakeRow extends HTMLElement implements RovingRow {
	selected = false;
	parked = 0;
	synced = 0;
	private _state: RovingState = 'off';

	get _roving(): RovingState {
		return this._state;
	}

	set _roving(state: RovingState) {
		this._state = state;
		this.synced++;
	}

	_parkControls(): void {
		this.parked++;
	}
}
customElements.define('fake-roving-row', FakeRow);

class FakeList extends LitElement {
	enabled = true;
	stops: FakeRow[] | null = null;

	get rows(): FakeRow[] {
		return [...this.querySelectorAll<FakeRow>('fake-roving-row')];
	}

	roving = new ListRoving<FakeRow>(this, {
		enabled: () => this.enabled,
		rows: () => this.rows,
		stops: () => this.stops ?? this.rows,
		rowOf: (event) => event.composedPath().find((node): node is FakeRow => node instanceof FakeRow),
	});

	override render() {
		return html`<slot></slot>`;
	}
}
customElements.define('fake-roving-list', FakeList);

const settle = () => new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

let list: FakeList;

async function setup(count = 3): Promise<FakeRow[]> {
	list = document.createElement('fake-roving-list') as FakeList;
	for (let i = 0; i < count; i++) {
		const row = document.createElement('fake-roving-row') as FakeRow;
		row.innerHTML = `<button>${i}</button>`;
		list.append(row);
	}
	document.body.append(list);
	await list.updateComplete;
	list.roving.update();
	await settle();
	return list.rows;
}

afterEach(() => list?.remove());

describe('ListRoving', () => {
	it('makes the first stop current and the rest reachable by arrow only', async () => {
		const rows = await setup();
		expect(rows.map((row) => row._roving)).toEqual(['stop', 'rest', 'rest']);
	});

	it('starts at the selected row', async () => {
		list = document.createElement('fake-roving-list') as FakeList;
		const rows = [0, 1, 2].map(() => document.createElement('fake-roving-row') as FakeRow);
		rows[2].selected = true;
		list.append(...rows);
		document.body.append(list);
		list.roving.update();
		await settle();
		expect(list.roving.current).toBe(rows[2]);
	});

	it('keeps the current row while it is still a stop, and moves on when it is not', async () => {
		const rows = await setup();
		list.roving.moveTo(rows[1]);
		list.roving.update();
		await settle();
		expect(list.roving.current).toBe(rows[1]);
		list.stops = [rows[0], rows[2]];
		list.roving.update();
		await settle();
		expect(list.roving.current).toBe(rows[0]);
	});

	it('coalesces asks into one pass', async () => {
		const rows = await setup();
		const before = rows[0].synced;
		list.roving.update();
		list.roving.update();
		list.roving.update();
		await settle();
		expect(rows[0].synced).toBe(before + 1);
	});

	it('switches every row off when the list stops answering to the arrows', async () => {
		const rows = await setup();
		list.enabled = false;
		list.roving.update();
		await settle();
		expect(rows.map((row) => row._roving)).toEqual(['off', 'off', 'off']);
	});

	it('follows focus to the row it lands on', async () => {
		const rows = await setup();
		rows[2].querySelector('button')!.focus();
		expect(list.roving.current).toBe(rows[2]);
	});

	it('parks the controls once focus has left the list', async () => {
		const rows = await setup();
		const outside = document.createElement('button');
		document.body.append(outside);
		rows[0].querySelector('button')!.focus();
		outside.focus();
		await settle();
		expect(rows.every((row) => row.parked === 1)).toBe(true);
		outside.remove();
	});

	it('leaves the controls alone while focus moves within the list', async () => {
		const rows = await setup();
		rows[0].querySelector('button')!.focus();
		rows[1].querySelector('button')!.focus();
		await settle();
		expect(rows.every((row) => row.parked === 0)).toBe(true);
	});
});
