import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDTaskBoard, NLDDMoveEventDetail } from './task-board.js';
import './task-board.js';
import '../../layout/card/card.js';

const frames = async (count = 2) => {
	for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
};

/** A board of three columns, with buttons as items, moved in the DOM the way an
 *  app moves them in its data. */
async function board(): Promise<{ el: NLDDTaskBoard; moves: NLDDMoveEventDetail[] }> {
	const el = await fixture<NLDDTaskBoard>(`
		<nldd-task-board style="width: 900px">
			<nldd-task-board-column value="nieuw" text="Nieuw">
				<button id="a">A-1044</button>
				<button id="b">A-1045</button>
			</nldd-task-board-column>
			<nldd-task-board-column value="bezig" text="In behandeling">
				<button id="c">A-1042</button>
			</nldd-task-board-column>
			<nldd-task-board-column value="klaar" text="Afgerond"></nldd-task-board-column>
		</nldd-task-board>
	`);
	const moves: NLDDMoveEventDetail[] = [];
	el.addEventListener('nldd-move', (event) => {
		const { item, toColumn, toIndex } = (event as CustomEvent<NLDDMoveEventDetail>).detail;
		moves.push((event as CustomEvent<NLDDMoveEventDetail>).detail);
		const column = el.columns.find((candidate) => candidate.value === toColumn)!;
		const rest = column.items.filter((other) => other !== item);
		column.insertBefore(item, rest[toIndex] ?? null);
	});
	for (const column of el.columns) await waitForUpdate(column);
	return { el, moves };
}

const alt = (target: Element, key: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true, composed: true, cancelable: true }));
const announced = (el: NLDDTaskBoard) => el.shadowRoot!.querySelector('.task-board__announcer')!.textContent;
const pointer = (target: EventTarget, type: string, x: number, y: number, pointerType = 'mouse') => target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, pointerType }));
const center = (el: Element) => {
	const rect = el.getBoundingClientRect();
	return [rect.left + rect.width / 2, rect.top + rect.height / 2] as const;
};

describe('nldd-task-board', () => {
	let el: NLDDTaskBoard;

	afterEach(() => {
		if (el) cleanup(el);
		vi.restoreAllMocks();
	});

	it('renders without error', async () => {
		({ el } = await board());
		expect(el.shadowRoot).not.toBeNull();
		expect(el.columns.map((column) => column.value)).toEqual(['nieuw', 'bezig', 'klaar']);
	});

	it('names the board and its columns', async () => {
		({ el } = await board());
		expect(el.shadowRoot!.querySelector('[role="region"]')!.getAttribute('aria-label')).toBe('Takenbord');
		expect(el.columns[1].shadowRoot!.querySelector('section')!.getAttribute('aria-label')).toBe('In behandeling');
	});

	it('shows the name and the number of items in the header', async () => {
		({ el } = await board());
		const header = el.columns[0].shadowRoot!.querySelector('.task-board-column__header')!;
		expect(header.textContent!.replace(/\s+/g, ' ').trim()).toBe('Nieuw 2');
	});

	it('takes a header from the slot, and keeps text as the name', async () => {
		el = await fixture<NLDDTaskBoard>(`
			<nldd-task-board>
				<nldd-task-board-column value="x" text="Team Beleid">
					<strong slot="header">Eigen kop</strong>
					<button>D-319</button>
				</nldd-task-board-column>
			</nldd-task-board>
		`);
		const column = el.columns[0];
		await waitForUpdate(column);
		expect(column.items.map((item) => item.textContent)).toEqual(['D-319']);
		expect(column.shadowRoot!.querySelector('section')!.getAttribute('aria-label')).toBe('Team Beleid');
	});

	it('puts the footer under the items, not among them, and takes no room without one', async () => {
		el = await fixture<NLDDTaskBoard>(`
			<nldd-task-board>
				<nldd-task-board-column value="x" text="Nieuw">
					<button>A-1044</button>
					<button slot="footer">Toevoegen</button>
				</nldd-task-board-column>
				<nldd-task-board-column value="y" text="Afgerond"></nldd-task-board-column>
			</nldd-task-board>
		`);
		const [withFooter, without] = el.columns;
		await waitForUpdate(withFooter);
		await waitForUpdate(without);
		expect(withFooter.items.map((item) => item.textContent)).toEqual(['A-1044']);
		expect(withFooter.shadowRoot!.querySelector('.task-board-column__footer')!.hasAttribute('hidden')).toBe(false);
		expect(without.shadowRoot!.querySelector('.task-board-column__footer')!.hasAttribute('hidden')).toBe(true);
	});

	it('warns about a column without a name', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<NLDDTaskBoard>('<nldd-task-board><nldd-task-board-column></nldd-task-board-column></nldd-task-board>');
		await waitForUpdate(el.columns[0]);
		expect(warn.mock.calls.some(([message]) => String(message).includes('needs `text`'))).toBe(true);
	});

	it('fades the side it can scroll to, and only that side', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDTaskBoard>(`
			<nldd-task-board style="width: 400px">
				<nldd-task-board-column value="a" text="A"></nldd-task-board-column>
				<nldd-task-board-column value="b" text="B"></nldd-task-board-column>
				<nldd-task-board-column value="c" text="C"></nldd-task-board-column>
			</nldd-task-board>
		`);
		await frames(3);
		const scroller = el.shadowRoot!.querySelector('.task-board') as HTMLElement;
		const sides = () => [scroller.classList.contains('can-scroll-left'), scroller.classList.contains('can-scroll-right')];
		expect(sides()).toEqual([false, true]);
		expect(scroller.tabIndex).toBe(0);
		// Snapping pulls an arbitrary position to a column, so go to the second one.
		scroller.scrollLeft = el.columns[1].getBoundingClientRect().left - scroller.getBoundingClientRect().left;
		scroller.dispatchEvent(new Event('scroll'));
		await waitForUpdate(el);
		expect(sides()).toEqual([true, true]);
		scroller.scrollLeft = scroller.scrollWidth;
		scroller.dispatchEvent(new Event('scroll'));
		await waitForUpdate(el);
		expect(sides()).toEqual([true, false]);
		unloadTokens();
	});

	it('takes a fixed height, which every column fills and scrolls within', async () => {
		el = await fixture<NLDDTaskBoard>(`
			<nldd-task-board height="320px" style="width: 900px">
				<nldd-task-board-column text="Nieuw">${'<div style="height: 120px">A</div>'.repeat(5)}</nldd-task-board-column>
				<nldd-task-board-column text="Klaar"></nldd-task-board-column>
			</nldd-task-board>
		`);
		const unloadTokens = loadTokens();
		const [full, empty] = el.columns;
		for (const column of el.columns) await waitForUpdate(column);
		expect(el.getBoundingClientRect().height).toBe(320);
		expect(full.getBoundingClientRect().height).toBe(320);
		expect(empty.getBoundingClientRect().height).toBe(320);
		el.height = 'nonsense';
		await waitForUpdate(el);
		expect(el.style.getPropertyValue('--_task-board-height')).toBe('');
		unloadTokens();
	});

	it('fades a column at the side it can scroll to, and only that side', async () => {
		el = await fixture<NLDDTaskBoard>(`
			<nldd-task-board height="320px" style="width: 900px">
				<nldd-task-board-column text="Nieuw">${'<div style="height: 120px">A</div>'.repeat(5)}</nldd-task-board-column>
			</nldd-task-board>
		`);
		const [column] = el.columns;
		await waitForUpdate(column);
		await frames(3);
		const body = column._body;
		const classes = () => ['can-scroll-up', 'can-scroll-down'].filter((name) => body.classList.contains(name));
		expect(classes()).toEqual(['can-scroll-down']);
		body.scrollTop = 100;
		body.dispatchEvent(new Event('scroll'));
		await waitForUpdate(column);
		expect(classes()).toEqual(['can-scroll-up', 'can-scroll-down']);
		body.scrollTop = body.scrollHeight;
		body.dispatchEvent(new Event('scroll'));
		await waitForUpdate(column);
		expect(classes()).toEqual(['can-scroll-up']);
	});

	describe('keyboard', () => {
		it('moves an item to the next column with Alt and the right arrow, and says where', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			a.focus();
			alt(a, 'ArrowRight');
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', fromIndex: 0, toColumn: 'bezig', toIndex: 0 });
			expect(a.parentElement!.getAttribute('value')).toBe('bezig');
			await frames(3);
			expect(announced(el)).toBe('Verplaatst naar In behandeling, 1 van 2.');
			expect(document.activeElement).toBe(a);
		});

		it('puts focus back inside an item whose own shadow root holds it, such as an nldd-card', async () => {
			el = await fixture<NLDDTaskBoard>(`
				<nldd-task-board>
					<nldd-task-board-column value="nieuw" text="Nieuw"><nldd-card button accessible-label="A-1044"></nldd-card></nldd-task-board-column>
					<nldd-task-board-column value="bezig" text="In behandeling"></nldd-task-board-column>
				</nldd-task-board>
			`);
			el.addEventListener('nldd-move', (event) => {
				const { item, toColumn } = (event as CustomEvent<NLDDMoveEventDetail>).detail;
				el.columns.find((column) => column.value === toColumn)!.append(item);
			});
			const card = el.querySelector('nldd-card')!;
			await waitForUpdate(card);
			const inner = card.shadowRoot!.querySelector<HTMLElement>('button, [role="button"]')!;
			inner.focus();
			alt(inner, 'ArrowRight');
			await frames(2);
			expect(card.parentElement!.getAttribute('value')).toBe('bezig');
			expect(card.shadowRoot!.activeElement).toBe(inner);
		});

		it('moves an item within its column with Alt and the down arrow', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			alt(a, 'ArrowDown');
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', fromIndex: 0, toColumn: 'nieuw', toIndex: 1 });
			expect(el.columns[0].items.map((item) => item.id)).toEqual(['b', 'a']);
		});

		it('says it cannot go further at the edge, and moves nothing', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			alt(el.querySelector('#a')!, 'ArrowLeft');
			alt(el.querySelector('#a')!, 'ArrowUp');
			expect(moves).toEqual([]);
			await frames(3);
			expect(announced(el)).toBe('Kan niet verder.');
		});

		it('leaves the arrows without Alt alone', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			el.querySelector('#a')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
			expect(moves).toEqual([]);
		});
	});

	describe('moveItem()', () => {
		it('moves an item to the end of a column given by its value', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const b = el.querySelector('#b') as HTMLElement;
			expect(el.moveItem(b, 'klaar')).toBe(true);
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', fromIndex: 1, toColumn: 'klaar', toIndex: 0 });
			expect(b.parentElement).toBe(el.columns[2]);
		});

		it('does nothing for the place an item already has', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			expect(el.moveItem(el.querySelector('#c') as HTMLElement, 'bezig', 0)).toBe(false);
			expect(moves).toEqual([]);
		});
	});

	describe('readonly', () => {
		it('keeps a click on an item', async () => {
			({ el } = await board());
			el.readonly = true;
			await waitForUpdate(el);
			const a = el.querySelector('#a') as HTMLElement;
			const click = vi.fn();
			a.addEventListener('click', click);
			const [x, y] = center(a);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointerup', x, y);
			a.click();
			expect(click).toHaveBeenCalledOnce();
		});

		it('moves nothing by dragging, and says so at the item, to a screen reader and to the app', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			el.readonly = true;
			await waitForUpdate(el);
			const a = el.querySelector('#a') as HTMLElement;
			const denied = vi.fn();
			el.addEventListener('nldd-move-denied', (event) => denied((event as CustomEvent).detail.item));
			const click = vi.fn();
			a.addEventListener('click', click);
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[2]);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', tx, ty);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
			expect(denied).toHaveBeenCalledExactlyOnceWith(a);
			const layers = Array.from(document.querySelectorAll<HTMLElement>('body > [aria-hidden="true"]'));
			expect(layers.map((layer) => layer.style.cursor || layer.textContent)).toEqual(['Dit bord is alleen-lezen', 'not-allowed']);
			pointer(window, 'pointermove', tx + 20, ty);
			expect(denied).toHaveBeenCalledOnce();
			pointer(window, 'pointerup', tx, ty);
			a.click();
			expect(click).not.toHaveBeenCalled();
			expect(moves).toHaveLength(0);
			expect(a.parentElement!.getAttribute('value')).toBe('nieuw');
			await frames(3);
			expect(announced(el)).toBe('Dit bord is alleen-lezen');
			expect(document.querySelectorAll('body > [aria-hidden="true"]')).toHaveLength(1);
		});

		it('moves nothing with the keyboard, and says so', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			el.readonly = true;
			await waitForUpdate(el);
			const a = el.querySelector('#a') as HTMLElement;
			const denied = vi.fn();
			el.addEventListener('nldd-move-denied', denied);
			a.focus();
			alt(a, 'ArrowRight');
			expect(moves).toHaveLength(0);
			expect(denied).toHaveBeenCalledOnce();
			await frames(3);
			expect(announced(el)).toBe('Dit bord is alleen-lezen');
			el.readonly = false;
			await waitForUpdate(el);
			expect(document.querySelectorAll('body > [aria-hidden="true"]')).toHaveLength(0);
		});

		it('still moves with moveItem()', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			el.readonly = true;
			await waitForUpdate(el);
			expect(el.moveItem(el.querySelector('#a') as HTMLElement, 'klaar')).toBe(true);
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', toColumn: 'klaar' });
		});

		it('drops a drag that is under way when it turns on', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[2]);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x + 10, y);
			pointer(window, 'pointermove', tx, ty);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(true);
			el.readonly = true;
			await waitForUpdate(el);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
			pointer(window, 'pointerup', tx, ty);
			expect(moves).toHaveLength(0);
		});
	});

	describe('dragging', () => {
		it('moves an item dragged to another column, and swallows the click that ends it', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const click = vi.fn();
			a.addEventListener('click', click);
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[2]);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x + 10, y);
			pointer(window, 'pointermove', tx, ty);
			await waitForUpdate(el.columns[2]);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(true);
			expect(el.columns[2].shadowRoot!.querySelector('.task-board-column__drop-indicator')!.hasAttribute('hidden')).toBe(false);
			pointer(window, 'pointerup', tx, ty);
			a.click();
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', toColumn: 'klaar', toIndex: 0 });
			expect(click).not.toHaveBeenCalled();
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
			expect(document.querySelectorAll('body > [aria-hidden="true"]')).toHaveLength(0);
		});

		it('marks the placeholder instead of a line above or below its own place, and moves nothing there', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const b = el.querySelector('#b') as HTMLElement;
			const rect = a.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const column = el.columns[0];
			pointer(a, 'pointerdown', x, rect.top + 2);
			pointer(window, 'pointermove', x + 10, rect.top + 2);
			pointer(window, 'pointermove', x, rect.top + 1);
			await waitForUpdate(column);
			expect(column._returning).toBe(true);
			expect(column._dropIndex).toBe(null);
			expect(column.shadowRoot!.querySelector('.task-board-column__placeholder')!.classList.contains('is-returning')).toBe(true);
			expect(column.shadowRoot!.querySelector('.task-board-column__drop-indicator')!.hasAttribute('hidden')).toBe(true);
			pointer(window, 'pointermove', x, b.getBoundingClientRect().bottom - 1);
			await waitForUpdate(column);
			expect(column._returning).toBe(false);
			expect(column._dropIndex).toBe(2);
			pointer(window, 'pointermove', x, rect.bottom - 2);
			pointer(window, 'pointerup', x, rect.bottom - 2);
			expect(moves).toEqual([]);
		});

		it('puts the item back when it is released outside the board', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const below = el.getBoundingClientRect().bottom + 40;
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x, below);
			await Promise.all(el.columns.map((column) => waitForUpdate(column)));
			expect(el.columns.map((column) => column._dropState)).toEqual(['available', 'available', 'available']);
			expect(el.columns[0].shadowRoot!.querySelector('.task-board-column__placeholder')!.classList.contains('is-returning')).toBe(true);
			pointer(window, 'pointerup', x, below);
			expect(moves).toEqual([]);
			await frames(3);
			expect(announced(el)).toBe('Slepen geannuleerd.');
		});

		it('says above the copy that it goes back, once the pointer stays outside the board', async () => {
			({ el } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const outside = el.getBoundingClientRect().bottom + 100;
			const note = () => Array.from(document.querySelectorAll<HTMLElement>('body > [aria-hidden="true"]')).find((layer) => layer.textContent === 'Terug naar de oude plek');
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x + 10, y);
			pointer(window, 'pointermove', x, outside);
			expect(note()).toBeUndefined();
			await new Promise((resolve) => setTimeout(resolve, 350));
			expect(note()).toBeDefined();
			pointer(window, 'pointermove', x, y);
			expect(note()).toBeUndefined();
			pointer(window, 'pointermove', x, outside);
			await new Promise((resolve) => setTimeout(resolve, 350));
			pointer(window, 'pointerup', x, outside);
			expect(note()).toBeUndefined();
		});

		it('moves an item one down when it is dropped below the next one', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const b = el.querySelector('#b') as HTMLElement;
			const [x, y] = center(a);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x, b.getBoundingClientRect().bottom - 1);
			pointer(window, 'pointerup', x, b.getBoundingClientRect().bottom - 1);
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', fromIndex: 0, toColumn: 'nieuw', toIndex: 1 });
		});

		it('keeps the line above the first item inside the column', async () => {
			({ el } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const [tx] = center(el.columns[1]);
			const c = el.querySelector('#c') as HTMLElement;
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', tx, c.getBoundingClientRect().top + 1);
			await waitForUpdate(el.columns[1]);
			const indicator = el.columns[1].shadowRoot!.querySelector('.task-board-column__drop-indicator')!.getBoundingClientRect();
			const body = el.columns[1].shadowRoot!.querySelector('.task-board-column__body')!.getBoundingClientRect();
			expect(indicator.top).toBeGreaterThanOrEqual(body.top);
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		});

		it('drags a copy without the focus ring or pressed fill of the item, and turns off snapping meanwhile', async () => {
			({ el } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			a.setAttribute('data-action-focused', '');
			a.setAttribute('data-action-pressed', '');
			const [x, y] = center(a);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x + 20, y);
			await waitForUpdate(el);
			const ghost = document.querySelector('body > [aria-hidden="true"]')!;
			expect(ghost.hasAttribute('data-action-focused')).toBe(false);
			expect(ghost.hasAttribute('data-action-pressed')).toBe(false);
			expect(el.shadowRoot!.querySelector('.task-board')!.classList.contains('is-dragging')).toBe(true);
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('.task-board')!.classList.contains('is-dragging')).toBe(false);
		});

		it('scrolls the board sideways while an item is held at its edge', async () => {
			const unloadTokens = loadTokens();
			el = await fixture<NLDDTaskBoard>(`
				<nldd-task-board style="width: 400px">
					<nldd-task-board-column value="a" text="A"><button id="x">A-1044</button></nldd-task-board-column>
					<nldd-task-board-column value="b" text="B"></nldd-task-board-column>
					<nldd-task-board-column value="c" text="C"></nldd-task-board-column>
				</nldd-task-board>
			`);
			await frames(2);
			const scroller = el.shadowRoot!.querySelector('.task-board') as HTMLElement;
			const item = el.querySelector('#x') as HTMLElement;
			const [x, y] = center(item);
			const edge = scroller.getBoundingClientRect().right - 10;
			pointer(item, 'pointerdown', x, y);
			pointer(window, 'pointermove', edge, y);
			await frames(10);
			expect(scroller.scrollLeft).toBeGreaterThan(0);
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			unloadTokens();
		});

		it('marks every column available and the one under the pointer over, leaves a placeholder for the item and shows the grabbing cursor', async () => {
			({ el } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[2]);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', tx, ty);
			await Promise.all(el.columns.map((column) => waitForUpdate(column)));
			const states = el.columns.map((column) => column.shadowRoot!.querySelector('section')!.className.replace(/\s+/g, ' ').trim());
			expect(states).toEqual(['task-board-column is-drop-available', 'task-board-column is-drop-available', 'task-board-column is-drop-over']);
			expect(getComputedStyle(a).visibility).toBe('hidden');
			const placeholder = el.columns[0].shadowRoot!.querySelector('.task-board-column__placeholder')!;
			expect(placeholder.hasAttribute('hidden')).toBe(false);
			const box = placeholder.getBoundingClientRect();
			const slot = a.getBoundingClientRect();
			expect([Math.round(box.top), Math.round(box.left), Math.round(box.width), Math.round(box.height)]).toEqual([Math.round(slot.top), Math.round(slot.left), Math.round(slot.width), Math.round(slot.height)]);
			const [ox, oy] = center(el.querySelector('#c')!);
			expect(getComputedStyle(document.elementFromPoint(ox, oy)!).cursor).toBe('grabbing');
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			await Promise.all(el.columns.map((column) => waitForUpdate(column)));
			expect(el.columns.every((column) => column._dropState === null)).toBe(true);
			expect(el.columns[0].shadowRoot!.querySelector('.task-board-column__placeholder')!.hasAttribute('hidden')).toBe(true);
			expect(getComputedStyle(a).visibility).toBe('visible');
			expect(document.querySelectorAll('body > [aria-hidden="true"]')).toHaveLength(0);
		});

		it('keeps text from being selected while an item is pressed, and allows it again after', async () => {
			({ el } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const select = () => {
				const event = new Event('selectstart', { bubbles: true, cancelable: true });
				a.dispatchEvent(event);
				return event.defaultPrevented;
			};
			pointer(a, 'pointerdown', x, y);
			expect(select()).toBe(true);
			pointer(window, 'pointerup', x, y);
			expect(select()).toBe(false);
		});

		it('keeps a press that does not move a click', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', x + 2, y);
			pointer(window, 'pointerup', x + 2, y);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
			expect(moves).toEqual([]);
		});

		it('lifts an item a finger holds, and moves it', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[1]);
			pointer(a, 'pointerdown', x, y, 'touch');
			await new Promise((resolve) => setTimeout(resolve, 350));
			expect(a.hasAttribute('data-task-board-dragging')).toBe(true);
			pointer(window, 'pointermove', tx, ty, 'touch');
			pointer(window, 'pointerup', tx, ty, 'touch');
			expect(moves[0]).toMatchObject({ fromColumn: 'nieuw', toColumn: 'bezig' });
		});

		it('lets a finger that moves before the hold scroll', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			pointer(a, 'pointerdown', x, y, 'touch');
			pointer(window, 'pointermove', x, y + 30, 'touch');
			await new Promise((resolve) => setTimeout(resolve, 350));
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
			pointer(window, 'pointerup', x, y + 30, 'touch');
			expect(moves).toEqual([]);
		});

		it('drops nothing on Escape', async () => {
			let moves: NLDDMoveEventDetail[];
			({ el, moves } = await board());
			const a = el.querySelector('#a') as HTMLElement;
			const [x, y] = center(a);
			const [tx, ty] = center(el.columns[2]);
			pointer(a, 'pointerdown', x, y);
			pointer(window, 'pointermove', tx, ty);
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			pointer(window, 'pointerup', tx, ty);
			expect(moves).toEqual([]);
			expect(a.hasAttribute('data-task-board-dragging')).toBe(false);
		});
	});
});
