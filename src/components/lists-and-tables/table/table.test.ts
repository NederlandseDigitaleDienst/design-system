import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate, nextFrames, installUniversalReset } from '../../../test-utils.js';
import type { NLDDTable, NLDDTableRow } from './table.js';
import './table.js';
import '../cells/cell/cell.js';
import '../cells/text-cell/text-cell.js';
import '../cells/icon-cell/icon-cell.js';

describe('nldd-table', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-table columns="1fr 1fr"></nldd-table>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('exposes role="table" on the host', async () => {
		el = await fixture('<nldd-table columns="1fr 1fr"></nldd-table>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('table');
	});

	it('applies the columns track list as the --_table-columns custom property', async () => {
		el = await fixture('<nldd-table columns="minmax(200px, 1fr) 120px 80px"></nldd-table>');
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_table-columns')).toBe('minmax(200px, 1fr) 120px 80px');
	});

	it('updates --_table-columns when the columns attribute changes', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"></nldd-table>');
		await waitForUpdate(el);
		(el as unknown as NLDDTable).columns = '1fr 2fr';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_table-columns')).toBe('1fr 2fr');
	});

	it('sets a cells-container so cells size against the table width', async () => {
		el = await fixture('<nldd-table columns="1fr"></nldd-table>');
		await waitForUpdate(el);
		expect(el.style.containerName).toBe('cells-container');
		expect(el.style.containerType).toBe('inline-size');
	});

	it('forwards accessible-label to aria-label', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr" accessible-label="Gebruikers"></nldd-table>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-label')).toBe('Gebruikers');
	});

	it('DEV-warns and falls back to a generic name when accessible-label is missing', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"></nldd-table>');
		await waitForUpdate(el);
		// Never nameless: a generic fallback names it, and the consumer is warned.
		expect(el.getAttribute('aria-label')).toBe('Tabel');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible-label'));
		warn.mockRestore();
	});

	it('defaults the background to base and reflects tinted', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"></nldd-table>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDTable).background).toBe('base');
		expect(el.hasAttribute('background')).toBe(false);
		(el as unknown as NLDDTable).background = 'tinted';
		await waitForUpdate(el);
		expect(el.getAttribute('background')).toBe('tinted');
	});

	it('reflects the responsive column attributes', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr 1fr" sm-columns="1fr" md-columns="1fr 1fr" lg-columns="1fr 1fr 1fr"></nldd-table>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDTable).smColumns).toBe('1fr');
		expect((el as unknown as NLDDTable).mdColumns).toBe('1fr 1fr');
		expect((el as unknown as NLDDTable).lgColumns).toBe('1fr 1fr 1fr');
	});

	it('uses sm-columns when the table is sm-wide', async () => {
		const host = await fixture('<div style="width: 400px"><nldd-table columns="1fr 1fr 1fr" sm-columns="1fr"></nldd-table></div>');
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		// wait for the ResizeObserver to fire with the laid-out width
		await nextFrames();
		expect(table.style.getPropertyValue('--_table-columns')).toBe('1fr');
		cleanup(host);
	});

	it('falls back to base columns at a breakpoint without an override', async () => {
		const host = await fixture('<div style="width: 400px"><nldd-table columns="1fr 1fr 1fr" lg-columns="1fr 1fr 1fr 1fr"></nldd-table></div>');
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		// sm-wide, no sm-columns → base columns
		expect(table.style.getPropertyValue('--_table-columns')).toBe('1fr 1fr 1fr');
		cleanup(host);
	});

	it('uses lg-columns when the table is lg-wide', async () => {
		// With a row, because a table with nothing in it and nothing in
		// [slot=empty] takes itself off the page and then has no width to read.
		const host = await fixture('<div style="width: 1100px"><nldd-table columns="1fr" lg-columns="1fr 1fr 1fr 1fr"><nldd-table-row><nldd-text-cell text="A"></nldd-text-cell></nldd-table-row></nldd-table></div>');
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		expect(table.style.getPropertyValue('--_table-columns')).toBe('1fr 1fr 1fr 1fr');
		cleanup(host);
	});

	// Two cells across two fixed 300px tracks force a 600px content width.
	const wideBox = (label = '') =>
		`<div style="width: 200px"><nldd-table columns="300px 300px"${label ? ` accessible-label="${label}"` : ''}>`
		+ '<nldd-table-row><nldd-cell>A</nldd-cell><nldd-cell>B</nldd-cell></nldd-table-row>'
		+ '</nldd-table></div>';

	it('falls back to a generic name when it overflows without an accessible-label', async () => {
		const host = await fixture(wideBox());
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		expect(table.getAttribute('tabindex')).toBe('0');
		// A focusable region needs an accessible name (SC 4.1.2) → generic fallback.
		expect(table.getAttribute('aria-label')).toBe('Tabel');
		cleanup(host);
	});

	it('keeps accessible-label as the name even while scrolling', async () => {
		const host = await fixture(wideBox('Gebruikers'));
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		expect(table.getAttribute('tabindex')).toBe('0');
		expect(table.getAttribute('aria-label')).toBe('Gebruikers');
		cleanup(host);
	});

	it('is not focusable when the columns fit', async () => {
		const host = await fixture(
			'<div style="width: 600px"><nldd-table columns="100px 100px">'
			+ '<nldd-table-row><nldd-cell>A</nldd-cell><nldd-cell>B</nldd-cell></nldd-table-row>'
			+ '</nldd-table></div>',
		);
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		expect(table.hasAttribute('tabindex')).toBe(false);
		cleanup(host);
	});

	it('a selected row does not add scroll width when the columns fit', async () => {
		// The selected tint is a row background within the border-box (no bleed),
		// so it must not turn a fitting table into a (focusable) scroller.
		const host = await fixture(
			'<div style="width: 600px"><nldd-table columns="100px 100px">'
			+ '<nldd-table-row selected><nldd-cell>A</nldd-cell><nldd-cell>B</nldd-cell></nldd-table-row>'
			+ '</nldd-table></div>',
		);
		const table = host.querySelector('nldd-table') as HTMLElement;
		await waitForUpdate(table);
		await nextFrames();
		expect(table.hasAttribute('tabindex')).toBe(false);
		cleanup(host);
	});

	it('opens the empty row when there are no body rows, and says nothing of its own', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		const empty = el.shadowRoot!.querySelector('.table__empty')!;
		expect(empty.hasAttribute('hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('nldd-inline-dialog')).toBeNull();
	});

	it('keeps role="table" with a valid row/cell around the empty dialog', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		expect(el.getAttribute('role')).toBe('table');
		expect(el.shadowRoot!.querySelector('.table__empty')!.getAttribute('role')).toBe('row');
		expect(el.shadowRoot!.querySelector('.table__empty-cell')!.getAttribute('role')).toBe('cell');
	});

	it('is not empty when it has a visible body row', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"><nldd-table-row><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		expect(el.shadowRoot!.querySelector('.table__empty')!.hasAttribute('hidden')).toBe(true);
	});

	it('treats a header row alone as empty and hides the header', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"><nldd-table-row slot="header"><nldd-cell>H</nldd-cell></nldd-table-row></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		expect(el.shadowRoot!.querySelector('.table__empty')!.hasAttribute('hidden')).toBe(false);
		expect(el.classList.contains('is-empty')).toBe(true);
		// The header slot is hidden in the empty state so only the message shows.
		expect(getComputedStyle(el.shadowRoot!.querySelector('slot[name="header"]')!).display).toBe('none');
	});

	it('keeps the header visible when there are body rows', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"><nldd-table-row slot="header"><nldd-cell>H</nldd-cell></nldd-table-row><nldd-table-row><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		expect(el.classList.contains('is-empty')).toBe(false);
		expect(getComputedStyle(el.shadowRoot!.querySelector('slot[name="header"]')!).display).toBe('contents');
	});

	it('becomes empty when all body rows are hidden', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"><nldd-table-row hidden><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		expect(el.shadowRoot!.querySelector('.table__empty')!.hasAttribute('hidden')).toBe(false);
	});

	it('lets [slot=empty] content override the default dialog', async () => {
		el = await fixture<NLDDTable>('<nldd-table columns="1fr"><nldd-inline-dialog slot="empty" text="Eigen melding"></nldd-inline-dialog></nldd-table>');
		await (el as unknown as NLDDTable).updateComplete;
		// The default in-shadow dialog stays empty; the consumer's slotted one wins.
		const slotted = el.querySelector('nldd-inline-dialog[slot="empty"]');
		expect(slotted).not.toBeNull();
		expect(el.shadowRoot!.querySelector('.table__empty')!.hasAttribute('hidden')).toBe(false);
	});
});

describe('nldd-table-row', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without errors', async () => {
		el = await fixture('<nldd-table-row></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('exposes role="row" on the host', async () => {
		el = await fixture('<nldd-table-row></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('row');
	});

	it('reflects selection to aria-selected on a body row in a selectable table', async () => {
		const host = await fixture('<nldd-table selectable columns="1fr"><nldd-table-row><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		const row = host.querySelector('nldd-table-row') as NLDDTableRow;
		await waitForUpdate(row);
		expect(row.getAttribute('aria-selected')).toBe('false');
		row.selected = true;
		await waitForUpdate(row);
		expect(row.getAttribute('aria-selected')).toBe('true');
		cleanup(host);
	});

	it('omits aria-selected on rows when the table is not selectable', async () => {
		const host = await fixture('<nldd-table columns="1fr"><nldd-table-row selected><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		const row = host.querySelector('nldd-table-row') as NLDDTableRow;
		await waitForUpdate(row);
		// Visually selected, but no false selection affordance for AT.
		expect(row.hasAttribute('aria-selected')).toBe(false);
		cleanup(host);
	});

	it('does not set aria-selected on a header row, even when the table is selectable', async () => {
		const host = await fixture('<nldd-table selectable columns="1fr"><nldd-table-row slot="header"><nldd-cell>H</nldd-cell></nldd-table-row></nldd-table>');
		const row = host.querySelector('nldd-table-row') as NLDDTableRow;
		await waitForUpdate(row);
		expect(row.hasAttribute('aria-selected')).toBe(false);
		cleanup(host);
	});

	it('toggling table.selectable updates the rows aria-selected', async () => {
		const host = await fixture('<nldd-table columns="1fr"><nldd-table-row><nldd-cell>A</nldd-cell></nldd-table-row></nldd-table>');
		const table = host as NLDDTable;
		const row = host.querySelector('nldd-table-row') as NLDDTableRow;
		await waitForUpdate(table);
		expect(row.hasAttribute('aria-selected')).toBe(false);
		table.selectable = true;
		await waitForUpdate(table);
		expect(row.getAttribute('aria-selected')).toBe('false');
		cleanup(host);
	});

	it('assigns role="cell" to slotted cells in a body row', async () => {
		el = await fixture('<nldd-table-row><nldd-cell></nldd-cell><nldd-text-cell text="A"></nldd-text-cell></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-cell')!.getAttribute('role')).toBe('cell');
		expect(el.querySelector('nldd-text-cell')!.getAttribute('role')).toBe('cell');
	});

	it('assigns role="columnheader" to cells in a header row (slot="header")', async () => {
		el = await fixture('<nldd-table-row slot="header"><nldd-cell></nldd-cell></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-cell')!.getAttribute('role')).toBe('columnheader');
	});

	it('defaults a generic nldd-cell without width to width="full"', async () => {
		el = await fixture('<nldd-table-row><nldd-cell></nldd-cell></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-cell')!.getAttribute('width')).toBe('full');
	});

	it('does not override an author-set width on a generic cell', async () => {
		el = await fixture('<nldd-table-row><nldd-cell width="120px"></nldd-cell></nldd-table-row>');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-cell')!.getAttribute('width')).toBe('120px');
	});

	it('only auto-sizes generic cells, not specialised ones (icon-cell stays width-less)', async () => {
		el = await fixture('<nldd-table-row><nldd-icon-cell></nldd-icon-cell></nldd-table-row>');
		await waitForUpdate(el);
		// icon-cell has no width property; the row only touches nldd-cell.
		expect(el.querySelector('nldd-icon-cell')!.hasAttribute('width')).toBe(false);
		expect(el.querySelector('nldd-icon-cell')!.getAttribute('role')).toBe('cell');
	});

	it('reflects the selected attribute', async () => {
		el = await fixture<NLDDTableRow>('<nldd-table-row selected></nldd-table-row>');
		await waitForUpdate(el);
		expect((el as unknown as NLDDTableRow).selected).toBe(true);
		expect(el.hasAttribute('selected')).toBe(true);
	});
});

describe('nldd-table-row onder een universele reset', () => {
	let el: HTMLElement;
	let removeReset: () => void;

	afterEach(() => {
		removeReset();
		if (el) cleanup(el);
	});

	it('behoudt de rijdivider en de inline padding', async () => {
		removeReset = installUniversalReset('preflight');
		el = await fixture(`
			<div style="--semantics-tables-border-width: 2px; --semantics-tables-border-color: black; --semantics-tables-row-padding-inline: 16px;">
				<nldd-table-row></nldd-table-row>
				<span></span>
			</div>
		`);
		const row = el.querySelector('nldd-table-row') as HTMLElement;
		await waitForUpdate(row);
		const style = getComputedStyle(row);
		expect(style.borderBottomWidth).toBe('2px');
		expect(style.paddingLeft).toBe('16px');
	});
});
