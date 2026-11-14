import { describe, it, expect } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './text-editor.js';

type Api = HTMLElement & {
	value: string;
	updateComplete: Promise<unknown>;
	shadowRoot: ShadowRoot;
	view: {
		state: { selection: { main: { from: number; to: number; head: number } } };
		contentDOM: HTMLElement;
		dispatch(spec: unknown): void;
	};
	toggleBold(): void;
	toggleItalic(): void;
	toggleStrikethrough(): void;
	toggleInlineCode(): void;
	undo(): void;
	getState(): { active: { bold: boolean; italic: boolean } };
};

async function withValue(markdown: string): Promise<Api> {
	const el = await fixture<Api>('<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>');
	el.value = markdown;
	await el.updateComplete;
	await waitForUpdate(el);
	return el;
}

/** Type `text` at the caret, the way a keystroke does. */
function type(el: Api, text: string): void {
	const { head } = el.view.state.selection.main;
	el.view.dispatch({ changes: { from: head, insert: text }, selection: { anchor: head + text.length }, userEvent: 'input.type' });
}

function select(el: Api, anchor: number, head?: number): void {
	el.view.dispatch({ selection: { anchor, head } });
}

/** The text rendered inside bold runs (the `.cm-md-strong` mark), markers included. */
function boldText(el: Api): string {
	return Array.from(el.shadowRoot.querySelectorAll('.cm-md-strong')).map((node) => node.textContent).join('');
}

// #212: the toggles wrapped the selection literally, whitespace at its edges
// included, and `**woord **` is not bold.
describe('nldd-text-editor emphasis: wrapping a selection', () => {
	it('puts the markers around the word, not around the space that came with it', async () => {
		const el = await withValue('een woord hier');
		select(el, 4, 10); // "woord "
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('een **woord** hier');
		// The selection stays on the word, ready for the next toggle.
		expect(el.view.state.selection.main.from).toBe(6);
		expect(el.view.state.selection.main.to).toBe(11);
		cleanup(el);
	});

	it('the same for a space in front, and for italic and strikethrough', async () => {
		const el = await withValue('een woord hier');
		select(el, 3, 9); // " woord"
		el.toggleItalic();
		await waitForUpdate(el);
		expect(el.value).toBe('een *woord* hier');
		select(el, 4, 12); // "*woord* ", the run with the space after it
		el.toggleItalic();
		await waitForUpdate(el);
		expect(el.value).toBe('een woord hier');
		select(el, 4, 10);
		el.toggleStrikethrough();
		await waitForUpdate(el);
		expect(el.value).toBe('een ~~woord~~ hier');
		cleanup(el);
	});

	it('leaves a selection of nothing but whitespace alone', async () => {
		const el = await withValue('een woord hier');
		select(el, 3, 4);
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('een woord hier');
		cleanup(el);
	});

	it('unwraps a run selected whole, markers and trailing space included', async () => {
		const el = await withValue('een **woord** hier');
		select(el, 4, 14); // "**woord** "
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('een woord hier');
		expect(el.view.state.selection.main.from).toBe(4);
		expect(el.view.state.selection.main.to).toBe(10);
		cleanup(el);
	});
});

// #213: every space typed before the closing markers made the run fall back
// to plain text until the next letter arrived.
describe('nldd-text-editor emphasis: holding while typing', () => {
	it('keeps the bold styling when a space is typed before the closing markers', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		type(el, ' ');
		await waitForUpdate(el);
		expect(el.value).toBe('**woord **');
		expect(boldText(el)).toBe('**woord **');
		expect(el.getState().active.bold).toBe(true);
		type(el, 'en');
		await waitForUpdate(el);
		expect(boldText(el)).toBe('**woord en**');
		cleanup(el);
	});

	it('moves the space outside the markers when the caret leaves', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		type(el, ' ');
		select(el, 10); // past the closing markers
		await waitForUpdate(el);
		expect(el.value).toBe('**woord** ');
		expect(el.view.state.selection.main.head).toBe(10);
		expect(boldText(el)).toBe('**woord**');
		expect(el.getState().active.bold).toBe(false);
		cleanup(el);
	});

	it('does so on blur too, with the caret staying inside for the toolbar command that follows', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		type(el, ' ');
		el.view.contentDOM.dispatchEvent(new FocusEvent('blur'));
		await waitForUpdate(el);
		expect(el.value).toBe('**woord** ');
		expect(el.view.state.selection.main.head).toBe(7);
		expect(el.getState().active.bold).toBe(true);
		// The toolbar's bold button, clicked to switch bold off: steps out, past the space.
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('**woord** ');
		expect(el.view.state.selection.main.head).toBe(10);
		cleanup(el);
	});

	it('holds fresh markers too, and puts a leading space out in front', async () => {
		const el = await withValue('');
		select(el, 0);
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('****');
		expect(boldText(el)).toBe('****');
		type(el, ' woord');
		await waitForUpdate(el);
		expect(boldText(el)).toBe('** woord**');
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe(' **woord**');
		expect(el.view.state.selection.main.head).toBe(10);
		cleanup(el);
	});

	it('a paragraph break ends the run and closes it after the text', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		type(el, '\n\n');
		await waitForUpdate(el);
		expect(el.value).toBe('**woord**\n\n');
		expect(el.view.state.selection.main.head).toBe(11);
		cleanup(el);
	});

	it('the same in a list, where Enter writes the next item marker', async () => {
		const el = await withValue('- **woord**');
		select(el, 9);
		type(el, '\n- ');
		await waitForUpdate(el);
		expect(el.value).toBe('- **woord**\n- ');
		expect(el.view.state.selection.main.head).toBe(14);
		cleanup(el);
	});

	it('leaves a break that fell inside the run alone', async () => {
		const el = await withValue('*woord meer*');
		select(el, 6);
		type(el, '\n\n');
		await waitForUpdate(el);
		expect(el.value).toBe('*woord\n\n meer*');
		cleanup(el);
	});

	it('lets go when the markers are typed apart', async () => {
		const el = await withValue('**woord**');
		select(el, 4);
		type(el, '**');
		await waitForUpdate(el);
		expect(el.value).toBe('**wo**ord**');
		expect(boldText(el)).toBe('**wo**');
		cleanup(el);
	});

	it('is undone as its own step', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		type(el, ' ');
		select(el, 10);
		await waitForUpdate(el);
		expect(el.value).toBe('**woord** ');
		el.undo();
		await waitForUpdate(el);
		expect(el.value).toBe('**woord **');
		cleanup(el);
	});
});

describe('nldd-text-editor emphasis: the toggle at the end of a run', () => {
	it('steps out of the run instead of unwrapping it', async () => {
		const el = await withValue('**woord**');
		select(el, 7);
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('**woord**');
		expect(el.view.state.selection.main.head).toBe(9);
		cleanup(el);
	});

	it('takes a typed trailing space along, so bold, type, bold ends where the next word starts', async () => {
		const el = await withValue('');
		el.toggleBold();
		await waitForUpdate(el);
		type(el, 'woord ');
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('**woord** ');
		expect(el.view.state.selection.main.head).toBe(10);
		expect(el.getState().active.bold).toBe(false);
		cleanup(el);
	});

	it('still unwraps for a caret inside the word', async () => {
		const el = await withValue('**woord**');
		select(el, 4);
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('woord');
		expect(el.view.state.selection.main.head).toBe(2);
		cleanup(el);
	});

	it('removes markers with nothing between them', async () => {
		const el = await withValue('');
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('****');
		el.toggleBold();
		await waitForUpdate(el);
		expect(el.value).toBe('');
		cleanup(el);
	});

	it('also steps out of inline code', async () => {
		const el = await withValue('`code`');
		select(el, 5);
		el.toggleInlineCode();
		await waitForUpdate(el);
		expect(el.value).toBe('`code`');
		expect(el.view.state.selection.main.head).toBe(6);
		cleanup(el);
	});
});

// #414: bold without a selection left `****` in the value when nothing was typed,
// and on an editor that never had focus it landed at the start.
describe('nldd-text-editor emphasis: an empty pair', () => {
	it('takes away an empty pair once the caret leaves it', async () => {
		const el = await withValue('Ontwikkeling en onderhoud');
		el.view.contentDOM.focus();
		select(el, 12);
		el.toggleBold();
		expect(el.value).toBe('Ontwikkeling**** en onderhoud');
		select(el, 0);
		await Promise.resolve();
		await waitForUpdate(el);
		expect(el.value).toBe('Ontwikkeling en onderhoud');
		cleanup(el);
	});

	it('keeps the pair once something is typed in it', async () => {
		const el = await withValue('Ontwikkeling en onderhoud');
		el.view.contentDOM.focus();
		select(el, 12);
		el.toggleBold();
		type(el, ' x');
		select(el, 0);
		await Promise.resolve();
		await waitForUpdate(el);
		expect(el.value).toContain('**x**');
		cleanup(el);
	});

	it('works at the end of the text on an editor that never had focus', async () => {
		const el = await withValue('Ontwikkeling en onderhoud');
		el.toggleBold();
		expect(el.value).toBe('Ontwikkeling en onderhoud****');
		expect(el.view.state.selection.main.head).toBe('Ontwikkeling en onderhoud**'.length);
		cleanup(el);
	});
});
