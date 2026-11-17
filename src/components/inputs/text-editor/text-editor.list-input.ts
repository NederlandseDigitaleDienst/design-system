import { EditorView, keymap } from '@codemirror/view';
import { Prec, type EditorState, type Extension } from '@codemirror/state';
import { isolateHistory } from '@codemirror/commands';
import { deleteMarkupBackward, insertNewlineContinueMarkupCommand } from '@codemirror/lang-markdown';
import { inCodeBlock } from './text-editor.syntax.js';

/* Typing a list the way people do in a chat or in plain markdown.
 *
 * Enter on an empty item always ends the list (or steps one level out of a
 * nested one). CodeMirror's default moves an empty SECOND item down instead,
 * to make the list loose, so only the third Enter ended it. A loose list is
 * still one blank line and a typed marker away.
 *
 * A marker typed where the editor already put one does not stack: `- ` on a
 * fresh `- `, or right after the marker of an item with text, stays one bullet,`2. ` on `2. ` stays `2. `, `> ` on `> ` one quote.
 * With spaces before it, the typed marker goes one level deeper instead, and so
 * does `1. ` on a later number: it starts a list under the item above. A marker
 * of the other kind takes the place of the editor's: `1. ` on `- ` makes a
 * numbered list at that level, next to the bullets above.
 *
 * Spaces before a marker typed at the start of a line take the indent markdown
 * needs: one level deeper than the item above sits exactly under that item's
 * text (2 spaces under `- `, 3 under `1. `), whatever the number of spaces. So
 * what the editor shows as nested is nested in the rendered page too. */

/** Enter and Backspace in markdown, in place of the language's own keymap. */
export const listKeymap: Extension = Prec.high(keymap.of([
	{ key: 'Enter', run: insertNewlineContinueMarkupCommand({ nonTightLists: false }) },
	{ key: 'Backspace', run: deleteMarkupBackward },
]));

// A list marker and the indent before it.
export const ITEM_RE = /^( *)([-*+]|\d{1,9}[.)])( +|$)/;
// The start of a line up to the caret: a marker that was there, then (optional)
// spaces and a marker the user typed, ending in the space that completes it.
const STACKED_RE = /^( *)([-*+]|\d{1,9}[.)]) ( *)([-*+]|\d{1,9}[.)]) $/;
// A line that is nothing but spaces and a typed marker.
const INDENTED_RE = /^( +)([-*+]|\d{1,9}[.)]) $/;
// Two quote markers where the editor put one: `> > `, or deeper.
const STACKED_QUOTE_RE = /^((?:> ?)*> )> $/;

const ordered = (marker: string): boolean => /\d/.test(marker);

export interface Item {
	markerCol: number;
	contentCol: number;
}

/** The list items above `lineNumber` that a new item can sit under or next to,
 *  nearest first, each less indented than the one before: the item above, its
 *  parent, and so on. Stops where the list ends (two blank lines, or text
 *  without indent after a blank line). */
export function itemsAbove(state: EditorState, lineNumber: number): Item[] {
	const chain: Item[] = [];
	let limit = Infinity;
	let blanks = 0;
	for (let n = lineNumber - 1; n >= 1 && n > lineNumber - 500; n--) {
		const text = state.doc.line(n).text;
		if (text.trim() === '') {
			if (++blanks >= 2) break;
			continue;
		}
		const match = ITEM_RE.exec(text);
		if (!match) {
			if (/^\S/.test(text) && blanks > 0) break;
			blanks = 0;
			continue;
		}
		blanks = 0;
		const markerCol = match[1].length;
		if (markerCol >= limit) continue;
		chain.push({ markerCol, contentCol: markerCol + match[2].length + Math.max(1, Math.min(match[3].length, 4)) });
		limit = markerCol;
		if (markerCol === 0) break;
	}
	return chain;
}

/** The indent for an item typed with `spaces` spaces before it. More than the
 *  marker of the item above: one level under it. Otherwise the level whose
 *  marker it reaches. No list above: none. */
function indentFor(chain: Item[], spaces: number): number {
	if (chain.length === 0) return 0;
	if (spaces > chain[0].markerCol) return chain[0].contentCol;
	return chain.find((item) => item.markerCol <= spaces)?.markerCol ?? 0;
}

/** What the line should read once the space is typed, or null to leave it. */
function rewriteLine(state: EditorState, lineNumber: number, text: string): string | null {
	const quote = STACKED_QUOTE_RE.exec(text);
	if (quote) return quote[1];

	const stacked = STACKED_RE.exec(text);
	if (stacked) {
		const [, indent, placed, spaces, typed] = stacked;
		const chain = itemsAbove(state, lineNumber);
		const deeper = `${' '.repeat(chain.length ? chain[0].contentCol : indent.length + placed.length + 1)}${typed} `;
		if (spaces !== '') return deeper;
		// The other kind of marker: the typed one decides what list this is, at this level.
		if (ordered(placed) !== ordered(typed)) return `${indent}${typed} `;
		// `1.` where the editor put a later number starts a list under the item above.
		const startsList = ordered(typed) && parseInt(typed, 10) === 1 && parseInt(placed, 10) !== 1;
		return startsList ? deeper : `${indent}${placed} `;
	}

	const indented = INDENTED_RE.exec(text);
	if (indented) {
		const [, spaces, typed] = indented;
		const target = indentFor(itemsAbove(state, lineNumber), spaces.length);
		return target === spaces.length ? null : `${' '.repeat(target)}${typed} `;
	}
	return null;
}

/** Puts the typed space in first, as its own undo step, then the rewrite: Cmd+Z
 *  brings back what was typed, as it does after an autocorrection. */
export const listMarkerInput: Extension = EditorView.inputHandler.of((view, from, to, text) => {
	if (text !== ' ' || from !== to || view.state.readOnly) return false;
	const line = view.state.doc.lineAt(from);
	if (inCodeBlock(view.state, line.from)) return false;
	// The line up to the caret, with the space: the markers. Text after the
	// caret, as when a marker is typed before an item's text, stays as it is.
	const typed = line.text.slice(0, from - line.from) + ' ';
	const rewritten = rewriteLine(view.state, line.number, typed);
	if (rewritten === null || rewritten === typed) return false;
	view.dispatch({ changes: { from, insert: ' ' }, selection: { anchor: from + 1 }, userEvent: 'input.type' });
	view.dispatch({
		changes: { from: line.from, to: line.from + typed.length, insert: rewritten },
		selection: { anchor: line.from + rewritten.length },
		userEvent: 'input.complete',
		annotations: isolateHistory.of('before'),
	});
	return true;
});
