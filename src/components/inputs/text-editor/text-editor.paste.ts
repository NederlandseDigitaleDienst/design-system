import type { EditorState } from '@codemirror/state';
import { CODE_BLOCK_NODES, enclosingNamed } from './text-editor.syntax.js';
import { ITEM_RE, itemsAbove } from './text-editor.list-input.js';

/* Pasted text, made into the markdown it looks like. Applies when the paste
 * lands at the start of a line (or on an empty list item), never in a code
 * block, and Cmd/Ctrl+Shift+V skips it. A list of more than one line pasted at
 * the end of a line with text starts on the next line, as if pasted there.
 *
 * - The indent all pasted lines share goes; what one line has more stays, so a
 *   nested list stays nested.
 * - A list from Word, Outlook or a formatted mail arrives as `•`, a tab and the
 *   text: such a bullet becomes `- `, and a tab in the indent counts as four
 *   spaces.
 * - A pasted list nests the way typing does. With indent of its own (or typed
 *   spaces before the caret) it goes one level under the item above; without,
 *   it takes the level of the empty item it lands on, or of the item above.
 *   Each item takes the indent markdown needs under its parent. Without a list
 *   above it starts a list of its own. */

// A bullet from a word processor, with what separates it from the text. Outlook
// writes a second-level bullet as `o` and a tab.
const GLYPH_RE = /^([ \t]*)(?:[•◦▪‣·]|o(?=\t))[ \t]+/;
// A markdown marker with a tab after it, as a word processor writes a number.
const TABBED_MARKER_RE = /^([ \t]*)([-*+]|\d{1,9}[.)])\t+/;
const EMPTY_ITEM_RE = /^( *)([-*+]|\d{1,9}[.)]) $/;

/** Leading tabs as four columns each. */
function expandIndent(line: string): string {
	const indent = /^[ \t]*/.exec(line)![0];
	let columns = 0;
	for (const char of indent) columns = char === '\t' ? columns + 4 - (columns % 4) : columns + 1;
	return ' '.repeat(columns) + line.slice(indent.length);
}

const leading = (line: string): number => /^ */.exec(line)![0].length;

export interface PastePlan {
	from: number;
	to: number;
	insert: string;
}

/** What a paste of `text` at the selection should become, or null to paste it
 *  as it is. */
export function planPaste(state: EditorState, text: string): PastePlan | null {
	const { from, to } = state.selection.main;
	const line = state.doc.lineAt(from);
	// In code the paste stays as it is, unless the selection starts at the block
	// itself (a select all): then the paste replaces it and is no code.
	const code = enclosingNamed(state, from, 1, CODE_BLOCK_NODES) ?? enclosingNamed(state, line.from, 1, CODE_BLOCK_NODES);
	if (code && code.from < from) return null;
	const before = line.text.slice(0, from - line.from);
	const emptyItem = EMPTY_ITEM_RE.exec(before);
	// After the text at the end of a line, only a list applies: it starts on the next line.
	const afterText = !emptyItem && before.trim() !== '';
	if (afterText && (from !== line.to || state.doc.lineAt(to).to !== to)) return null;

	let lines = text.split('\n').map((raw) => expandIndent(raw.replace(GLYPH_RE, '$1- ').replace(TABBED_MARKER_RE, '$1$2 ')));
	const filled = lines.filter((l) => l.trim() !== '');
	if (filled.length === 0) return null;
	const shared = Math.min(...filled.map(leading));
	lines = lines.map((l) => (l.trim() === '' ? '' : l.slice(shared)));

	const firstFilled = lines.find((l) => l.trim() !== '')!;
	const isList = ITEM_RE.test(firstFilled) && /\S/.test(firstFilled.replace(ITEM_RE, ''));
	// One line stays where it lands: `- x` after text may be just text.
	if (afterText && (!isList || filled.length < 2)) return null;
	let base = 0;
	let replaceFrom = from;
	if (afterText) {
		// As on the line below this one: with indent of its own, under this item.
		const chain = itemsAbove(state, line.number + 1);
		if (chain.length) base = shared > 0 ? chain[0].contentCol : chain[0].markerCol;
		return { from, to, insert: '\n' + reindentList(lines, base).join('\n') };
	}
	if (isList) {
		const chain = itemsAbove(state, line.number);
		if (emptyItem) {
			replaceFrom = line.from; // the pasted marker takes the place of the editor's
			const indent = emptyItem[1].length;
			base = shared > 0 ? (chain.length ? chain[0].contentCol : indent + emptyItem[2].length + 1) : indent;
		} else {
			replaceFrom = line.from; // typed spaces before the caret make it nest
			if (chain.length) base = shared > 0 || before.length > 0 ? chain[0].contentCol : chain[0].markerCol;
		}
		lines = reindentList(lines, base);
	} else if (emptyItem || shared === 0) {
		// Text on an empty item, or nothing to take away: as it is.
		if (lines.join('\n') === text) return null;
	}

	const insert = lines.join('\n');
	const original = state.sliceDoc(replaceFrom, from) + text;
	return insert === original ? null : { from: replaceFrom, to, insert };
}

/** Every item at the indent markdown needs under its parent, the whole list
 *  shifted to `base`. A marker gets one space after it. A line of text under
 *  an item, indented, continues that item at the column of its text. */
function reindentList(lines: string[], base: number): string[] {
	const stack: { orig: number; content: number }[] = [];
	return lines.map((l) => {
		if (l.trim() === '') return '';
		const orig = leading(l);
		const item = ITEM_RE.exec(l);
		if (item) {
			while (stack.length && stack[stack.length - 1].orig >= orig) stack.pop();
			const col = stack.length ? stack[stack.length - 1].content : base;
			stack.push({ orig, content: col + item[2].length + 1 });
			return `${' '.repeat(col)}${item[2]} ${l.slice(item[0].length)}`;
		}
		const top = stack[stack.length - 1];
		if (top && orig > top.orig) return ' '.repeat(top.content) + l.trimStart();
		stack.length = 0;
		return ' '.repeat(base) + l.trimStart();
	});
}
