import type { EditorView } from '@codemirror/view';
import { EditorSelection, type EditorState } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';
import { EMPHASIS_MARKERS, heldEmphasisField, holdEmphasis, repairChangesFor } from './text-editor.emphasis.js';
import { enclosingNamed, inCodeBlock, isRuleLine } from './text-editor.syntax.js';
import { isMentionLink } from './text-editor.mention.js';

/* Markdown editing operations for the headless command API. Each works on the
 * main selection and leaves focus on the editor, so a
 * consumer toolbar can drive formatting without owning any editor internals. */

export type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TextEditorActiveFormats {
	bold: boolean;
	italic: boolean;
	inlineCode: boolean;
	codeBlock: boolean;
	strikethrough: boolean;
	link: boolean;
	bulletList: boolean;
	orderedList: boolean;
	/** A GFM task item (`- [ ]` / `- [x]`); also reports as bulletList. */
	taskList: boolean;
	quote: boolean;
	heading: HeadingLevel;
}

export interface TextEditorState {
	active: TextEditorActiveFormats;
	/** Whether the selection is collapsed (a caret, no range). */
	empty: boolean;
	/** Whether the list item at the caret can be nested deeper / outdented. */
	canIndent: boolean;
	canOutdent: boolean;
	/** Whether there is history to undo / redo (drives the history buttons). */
	canUndo: boolean;
	canRedo: boolean;
}

export const EMPTY_FORMATS: TextEditorActiveFormats = {
	bold: false,
	italic: false,
	inlineCode: false,
	codeBlock: false,
	strikethrough: false,
	link: false,
	bulletList: false,
	orderedList: false,
	taskList: false,
	quote: false,
	heading: 0,
};

function enclosing(view: EditorView, pos: number, nodeName: string, side: -1 | 0 | 1 = 1): SyntaxNode | null {
	return enclosingNamed(view.state, pos, side, nodeName);
}

/** An inline format is "active" for the caret only when the node encloses it on
 *  *both* sides. At the outer edge (just before the opening marker or just after
 *  the closing one) only one side is inside, and text typed there lands outside
 *  the format — so the toolbar must not light up. This mirrors what typing does. */
function enclosingInline(view: EditorView, pos: number, nodeName: string): SyntaxNode | null {
	const left = enclosing(view, pos, nodeName, -1);
	const right = enclosing(view, pos, nodeName, 1);
	return left && right && left.from === right.from && left.to === right.to ? right : null;
}

/** Wrap each selection range with `marker`, or unwrap it when it is already
 *  wrapped. A caret at the very end of the wrapped text steps out of the run
 *  instead: bold, type, bold ends with the caret after the bold, ready for the
 *  next word, not with the bold undone. */
export function toggleInlineWrap(view: EditorView, marker: string, nodeName: string): void {
	// CodeMirror's `readOnly` facet only gates its own built-in commands, not a raw
	// `view.dispatch`, so every editing helper here must refuse a read-only view
	// itself — otherwise the command API and the Mod-b/i/e/k keymap would mutate a
	// read-only (or disabled) editor.
	if (view.state.readOnly) return;
	const { state } = view;
	const len = marker.length;
	const held = state.field(heldEmphasisField, false);
	view.dispatch(state.changeByRange((range) => {
		// A drag or a double-click takes the space after a word along, and
		// `**woord **` is not bold: a closing run may not follow whitespace. So the
		// markers go around the text and the whitespace stays where it was (#212).
		const text = state.sliceDoc(range.from, range.to);
		const lead = /^\s*/.exec(text)![0].length;
		if (!range.empty && lead === text.length) return { range };
		const from = range.from + lead;
		const to = range.to - /\s*$/.exec(text)![0].length;
		// The run the range is in: parsed, or held while a typed space has broken it.
		const wrap = enclosing(view, from, nodeName)
			?? (held && held.name === nodeName && from >= held.from && to <= held.to ? held : null);
		if (wrap) {
			const content = state.sliceDoc(wrap.from + len, wrap.to - len);
			if (range.empty && from === wrap.to - len && content.trim()) {
				// Step out. Whitespace typed at the end goes outside the markers first,
				// so the caret lands after it, and after any space already there: where
				// the next word starts.
				const run = { from: wrap.from, to: wrap.to, name: nodeName, marker: state.sliceDoc(wrap.from, wrap.from + len), live: false };
				const changes = EMPHASIS_MARKERS.has(nodeName) ? repairChangesFor(state, run) : [];
				let pos = wrap.to;
				while (/[ \t]/.test(state.sliceDoc(pos, pos + 1))) pos++;
				return { changes, range: EditorSelection.cursor(pos) };
			}
			const changes = state.changes([
				{ from: wrap.from, to: wrap.from + len },
				{ from: wrap.to - len, to: wrap.to },
			]);
			return {
				changes,
				range: EditorSelection.range(changes.mapPos(range.anchor), changes.mapPos(range.head)),
			};
		}
		return {
			changes: [
				{ from, insert: marker },
				{ from: to, insert: marker },
			],
			range: EditorSelection.range(from + len, to + len),
			// Empty markers parse as nothing, so the hold on them is started by hand.
			effects: range.empty && range === state.selection.main && EMPHASIS_MARKERS.has(nodeName)
				? holdEmphasis.of({ from, to: from + 2 * len, name: nodeName, marker })
				: undefined,
		};
	}));
	view.focus();
}

/** Build a change that turns `line.text` into `next` by touching only the span
 *  that differs (shared prefix and suffix are left untouched). Replacing the whole
 *  line would collapse any annotation anchored inside it — its offsets map to the
 *  line boundary. Returns null when nothing changed. */
function minimalLineChange(
	line: { from: number; text: string },
	next: string,
): { from: number; to: number; insert: string } | null {
	const old = line.text;
	if (next === old) return null;
	let p = 0;
	while (p < old.length && p < next.length && old[p] === next[p]) p++;
	let s = 0;
	while (s < old.length - p && s < next.length - p && old[old.length - 1 - s] === next[next.length - 1 - s]) s++;
	return { from: line.from + p, to: line.from + old.length - s, insert: next.slice(p, next.length - s) };
}

/** Dispatch line-level changes with the selection carried along. A caret that
 *  sits exactly where a marker is inserted (column 0 of an empty line, say) is
 *  mapped to *after* the insertion, so what is typed next lands in the item and
 *  not in front of its marker. Plain mapping would leave it before. */
function dispatchLineChanges(view: EditorView, changes: { from: number; to?: number; insert?: string }[]): void {
	if (changes.length) {
		const { state } = view;
		const set = state.changes(changes);
		const sel = state.selection.main;
		view.dispatch({ changes: set, selection: { anchor: set.mapPos(sel.anchor, 1), head: set.mapPos(sel.head, 1) } });
	}
	view.focus();
}

/** The selected line range, and whether it is a single blank line. The line
 *  commands skip blank lines because they separate items, but when the blank
 *  line is the only one selected (an empty document, a fresh paragraph) it is
 *  the whole target and must take the marker. */
function selectedLines(view: EditorView): { first: number; last: number; loneBlank: boolean } {
	const { state } = view;
	const { from, to } = state.selection.main;
	const first = state.doc.lineAt(from).number;
	const last = state.doc.lineAt(to).number;
	return { first, last, loneBlank: first === last && state.doc.line(first).text.trim() === '' };
}

function mapSelectedLines(view: EditorView, transform: (text: string) => string): void {
	if (view.state.readOnly) return; // guards toggleHeading/setHeading/toggleBulletList/toggleQuote
	const { state } = view;
	const { first, last } = selectedLines(view);
	const changes: { from: number; to: number; insert: string }[] = [];
	for (let i = first; i <= last; i++) {
		const line = state.doc.line(i);
		const change = minimalLineChange(line, transform(line.text));
		if (change) changes.push(change);
	}
	dispatchLineChanges(view, changes);
}

function everySelectedLine(view: EditorView, predicate: (text: string) => boolean): boolean {
	const { first, last } = selectedLines(view);
	for (let i = first; i <= last; i++) {
		if (!predicate(view.state.doc.line(i).text)) return false;
	}
	return true;
}

/** Set the selected lines to heading `level`, or toggle them back to body. */
export function toggleHeading(view: EditorView, level: HeadingLevel): void {
	mapSelectedLines(view, (text) => {
		const match = text.match(/^(#{1,6})\s+/);
		const current = match ? match[1].length : 0;
		const body = match ? text.slice(match[0].length) : text;
		if (level === 0 || current === level) return body;
		return `${'#'.repeat(level)} ${body}`;
	});
}

/** Set the selected lines to heading `level` (0 = paragraph), without toggling.
 *  Suited to a picker where choosing a level always applies it. */
export function setHeading(view: EditorView, level: HeadingLevel): void {
	mapSelectedLines(view, (text) => {
		const body = text.replace(/^#{1,6}\s+/, '');
		return level === 0 ? body : `${'#'.repeat(level)} ${body}`;
	});
}

export function toggleBulletList(view: EditorView): void {
	// Accept every markdown bullet char (- * +), matching readActiveFormats and the
	// render guard. If the toggle recognized fewer chars than the state reader, a
	// "+ item" line would report active yet the toggle couldn't strip it (it'd add
	// another "- " instead), so state and toggle would disagree.
	const re = /^(\s*)[-*+]\s+/;
	const { loneBlank } = selectedLines(view);
	const allBulleted = !loneBlank && everySelectedLine(view, (t) => re.test(t) || t.trim() === '');
	mapSelectedLines(view, (t) => {
		if (t.trim() === '' && !loneBlank) return t;
		if (allBulleted) return t.replace(re, '$1');
		return re.test(t) ? t : t.replace(/^(\s*)/, '$1- ');
	});
}

const TASK_RE = /^(\s*)[-*+]\s+\[[ xX]\]\s+/;

/** Turn the selected lines into GFM task items (`- [ ] `), or back into plain
 *  bullets when they all are tasks already. A bullet or numbered item keeps its
 *  indent and becomes a task; toggling off leaves a bullet rather than bare text,
 *  so the list survives and only the box goes. Checking a box is not this
 *  command's job. */
export function toggleTaskList(view: EditorView): void {
	const { loneBlank } = selectedLines(view);
	const allTasks = !loneBlank && everySelectedLine(view, (t) => TASK_RE.test(t) || t.trim() === '');
	mapSelectedLines(view, (t) => {
		if (t.trim() === '' && !loneBlank) return t;
		if (allTasks) return t.replace(TASK_RE, '$1- ');
		if (TASK_RE.test(t)) return t;
		return t.replace(LIST_STRIP_RE, '$1').replace(/^(\s*)/, '$1- [ ] ');
	});
}

const LIST_STRIP_RE = /^(\s*)(?:[-*+]|\d+[.)])(?:\s+|$)/;
// The checkbox of a task item, once its bullet has been stripped. It belongs to
// the marker, so switching a task list to another type takes it along.
const TASK_BOX_RE = /^(\s*)\[[ xX]\]\s+/;

export type ListType = 'none' | 'bullet' | 'ordered' | 'task';

/** Set the selected lines to a list of `type`, replacing any existing list
 *  marker; `'none'` strips it. Ordered items are numbered within the selection.
 *  Unlike the toggles, this cleanly switches between list types (for a picker). */
export function setList(view: EditorView, type: ListType): void {
	if (view.state.readOnly) return;
	const { state } = view;
	const { first, last, loneBlank } = selectedLines(view);
	const changes: { from: number; to: number; insert: string }[] = [];
	let number = 0;
	for (let i = first; i <= last; i++) {
		const line = state.doc.line(i);
		// 'none' clears the leading indent too — bare text can't carry list
		// indentation (4+ spaces would even parse as a code block); the list types
		// keep it ($1) so nesting survives a switch between bullet and ordered.
		const withoutMarker = line.text.replace(LIST_STRIP_RE, type === 'none' ? '' : '$1');
		// A blank line between items separates them and takes no marker. A line
		// that carried a marker stays an item across the switch, even with no text
		// behind it yet, and a lone blank line is the whole target.
		const wasItem = withoutMarker !== line.text;
		// Only on a line that was an item: elsewhere a leading "[x] " is text.
		const stripped = wasItem ? withoutMarker.replace(TASK_BOX_RE, type === 'none' ? '' : '$1') : withoutMarker;
		let next = stripped;
		if (type !== 'none' && (stripped.trim() !== '' || wasItem || loneBlank)) {
			number += 1;
			const marker = type === 'bullet' ? '- ' : type === 'task' ? '- [ ] ' : `${number}. `;
			next = stripped.replace(/^(\s*)/, `$1${marker}`);
		}
		// Only rewrite the marker, not the whole line — keeps annotations alive.
		const change = minimalLineChange(line, next);
		if (change) changes.push(change);
	}
	dispatchLineChanges(view, changes);
}

/** The nearest list item above line `lineNumber` whose indent `accepts`: the
 *  item a line is nested under, or would be. A blank line is skipped (a loose
 *  list); a line that is no list item ends the list, and then there is none. */
function precedingItem(state: EditorState, lineNumber: number, accepts: (indent: number) => boolean): RegExpMatchArray | null {
	for (let j = lineNumber - 1; j >= 1; j--) {
		const text = state.doc.line(j).text;
		if (text.trim() === '') continue;
		const prev = text.match(LIST_STRIP_RE);
		if (!prev) return null;
		if (accepts(prev[1].length)) return prev;
	}
	return null;
}

/** Nest the selected list item(s) under the nearest preceding item at the same
 *  level, indenting only as far as that parent's content column. That keeps the
 *  item a valid nested list — 4+ spaces with no parent would parse as an indented
 *  code block — so a first or standalone item (no parent) is left untouched. */
export function indentListItems(view: EditorView): void {
	if (view.state.readOnly) return;
	const { state } = view;
	const { from, to } = state.selection.main;
	const first = state.doc.lineAt(from).number;
	const last = state.doc.lineAt(to).number;
	const changes: { from: number; insert: string }[] = [];
	for (let i = first; i <= last; i++) {
		const line = state.doc.line(i);
		const match = line.text.match(LIST_STRIP_RE);
		if (!match) continue;
		const indent = match[1].length;
		// The nearest item at this level or shallower is the one to nest under.
		const parentContentColumn = precedingItem(state, i, (p) => p <= indent)?.[0].length ?? -1;
		if (parentContentColumn > indent) {
			changes.push({ from: line.from, insert: ' '.repeat(parentContentColumn - indent) });
		}
	}
	if (changes.length) view.dispatch({ changes });
	view.focus();
}

/** Un-nest the selected list item(s) by one level: the inverse of
 *  indentListItems. Each item's leading indent drops to that of the nearest
 *  preceding shallower item (the one it is nested under), or to column 0 when
 *  there is no shallower parent. Keeps indent and outdent symmetric — one
 *  outdent exactly reverses one indent. (CodeMirror's generic indentLess removed
 *  a fixed indent unit instead, so a list indent took two outdents to undo.) */
export function outdentListItems(view: EditorView): void {
	if (view.state.readOnly) return;
	const { state } = view;
	const { from, to } = state.selection.main;
	const first = state.doc.lineAt(from).number;
	const last = state.doc.lineAt(to).number;
	const changes: { from: number; to: number }[] = [];
	for (let i = first; i <= last; i++) {
		const line = state.doc.line(i);
		const match = line.text.match(LIST_STRIP_RE);
		if (!match) continue;
		const indent = match[1].length;
		if (indent === 0) continue;
		// The item this one is nested under is the nearest shallower one; an orphan
		// indent falls back to column 0.
		const targetIndent = precedingItem(state, i, (p) => p < indent)?.[1].length ?? 0;
		changes.push({ from: line.from, to: line.from + (indent - targetIndent) });
	}
	if (changes.length) view.dispatch({ changes });
	view.focus();
}

/** Whether the list item at the caret can be nested deeper (it has a preceding
 *  item at the same level to nest under). Drives the indent button's disabled state. */
export function canIndentListItem(view: EditorView): boolean {
	const { state } = view;
	const line = state.doc.lineAt(state.selection.main.head);
	const match = line.text.match(LIST_STRIP_RE);
	if (!match) return false;
	const indent = match[1].length;
	const parent = precedingItem(state, line.number, (p) => p <= indent);
	return parent !== null && parent[0].length > indent;
}

/** Whether the list item at the caret is nested (indented) and so can be outdented. */
export function canOutdentListItem(view: EditorView): boolean {
	const match = view.state.doc.lineAt(view.state.selection.main.head).text.match(LIST_STRIP_RE);
	return !!match && match[1].length > 0;
}

/** Backspace at a list item's content start (right after the marker) removes the
 *  marker and its trailing space — the item's own indent is kept — so a top-level
 *  item cleanly returns to column 0 for every number, not just the first. CodeMirror's
 *  default deleteMarkupBackward instead aligns the content under the previous item,
 *  leaving stray whitespace on items 2, 3, … Returns false (so other handlers run)
 *  unless the caret sits exactly at a list marker's end outside a code block. */
export function clearListMarkerBackward(view: EditorView): boolean {
	// Consume Backspace entirely on a read-only editor. Returning false would hand it
	// to the markdown language's deleteMarkupBackward, which (unlike @codemirror/commands)
	// does NOT check readOnly and would delete the marker anyway. This binding is
	// already Prec.highest to sit in front of it, so swallowing here is the fix.
	if (view.state.readOnly) return true;
	const { state } = view;
	const sel = state.selection.main;
	if (!sel.empty) return false;
	const line = state.doc.lineAt(sel.head);
	const marker = line.text.match(/^(\s*)(?:\d+[.)]|[-*+])\s/);
	if (!marker || sel.head !== line.from + marker[0].length) return false;
	// A leading marker in a code block is literal text, not a list.
	if (inCodeBlock(state, line.from)) return false;
	const from = line.from + marker[1].length; // keep the item's own indent
	view.dispatch({
		changes: { from, to: line.from + marker[0].length },
		selection: { anchor: from },
		userEvent: 'delete.backward',
	});
	return true;
}

export function toggleQuote(view: EditorView): void {
	const re = /^(\s*)>\s?/;
	const allQuoted = everySelectedLine(view, (t) => re.test(t) || t.trim() === '');
	mapSelectedLines(view, (t) => {
		if (t.trim() === '') return t;
		if (allQuoted) return t.replace(re, '$1');
		return re.test(t) ? t : t.replace(/^(\s*)/, '$1> ');
	});
}

/** Wrap the selection as a markdown link. Caret lands where the user types next:
 *  inside `[]` if there's no text, inside `()` if there's no href, else after. */
// The non-mention Link node enclosing `pos`, or null. Mentions own their click,
// so they don't count as a "link" for the link button.
function realLinkAt(view: EditorView, pos: number): SyntaxNode | null {
	const link = enclosing(view, pos, 'Link');
	return link && !isMentionLink(view.state, link) ? link : null;
}

export function toggleLink(view: EditorView, href = ''): void {
	if (view.state.readOnly) return;
	// In a link already → unwrap it (drop the [ ]( ) markers, keep the text).
	const link = realLinkAt(view, view.state.selection.main.head);
	if (link) {
		const text = view.state.sliceDoc(link.from, link.to).replace(/^\[(.*)\]\([^)]*\)$/, '$1');
		view.dispatch({
			changes: { from: link.from, to: link.to, insert: text },
			selection: EditorSelection.range(link.from, link.from + text.length),
		});
		view.focus();
		return;
	}
	view.dispatch(view.state.changeByRange((range) => {
		const text = view.state.sliceDoc(range.from, range.to);
		const insert = `[${text}](${href})`;
		let caret: number;
		if (!text) caret = range.from + 1;
		else if (!href) caret = range.from + 1 + text.length + 2;
		else caret = range.from + insert.length;
		return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(caret) };
	}));
	view.focus();
}

/** Wrap the selected lines in a ``` fenced code block, or unwrap if already in one. */
export function toggleCodeBlock(view: EditorView): void {
	if (view.state.readOnly) return;
	const { state } = view;
	const { from, to } = state.selection.main;
	const first = state.doc.lineAt(from);
	const last = state.doc.lineAt(to);
	const prev = first.number > 1 ? state.doc.line(first.number - 1) : null;
	const next = last.number < state.doc.lines ? state.doc.line(last.number + 1) : null;
	const fenced = !!prev?.text.trim().startsWith('```') && !!next?.text.trim().startsWith('```');
	if (fenced && prev && next) {
		view.dispatch({ changes: [{ from: prev.from, to: first.from }, { from: last.to, to: next.to }] });
	} else {
		view.dispatch({ changes: [{ from: first.from, insert: '```\n' }, { from: last.to, insert: '\n```' }] });
	}
	view.focus();
}

export function readActiveFormats(view: EditorView): TextEditorActiveFormats {
	const { state } = view;
	const pos = state.selection.main.head;
	const held = state.field(heldEmphasisField, false);
	// Inline marks light up only when the caret is *within* them on both sides,
	// so an edge caret (where typed text lands outside the format) stays inactive.
	// A run held while a typed space has broken it counts as within too.
	const has = (name: string) => enclosingInline(view, pos, name) !== null || held?.name === name;
	const lineText = state.doc.lineAt(pos).text;
	const lineStart = state.doc.lineAt(pos).from;
	const headingMatch = lineText.match(/^(#{1,6})\s/);
	// In a code block a leading marker is literal text, not a list/heading — the
	// regex-based checks below would otherwise report it. (The syntax-tree checks,
	// like bold or quote, already ignore code content.)
	const codeBlock = inCodeBlock(state, lineStart);
	return {
		bold: has('StrongEmphasis'),
		italic: has('Emphasis'),
		inlineCode: has('InlineCode'),
		codeBlock,
		strikethrough: has('Strikethrough'),
		link: realLinkAt(view, pos) !== null,
		// Lists from the line's own marker. (Resolving the tree at a line-end caret
		// can spill into the next line and flip-flop the toolbar state.)
		bulletList: !codeBlock && /^\s*[-*+]\s/.test(lineText) && !isRuleLine(state, lineStart),
		orderedList: !codeBlock && /^\s*\d+[.)]\s/.test(lineText),
		taskList: !codeBlock && TASK_RE.test(lineText),
		// Quote from the Blockquote node at the line's *start* — that catches lazy
		// continuation lines (part of the quote but with no '>') too, while resolving
		// at line.from (not the caret) keeps it stable at the line end.
		quote: enclosing(view, lineStart, 'Blockquote') !== null,
		heading: (codeBlock || !headingMatch ? 0 : headingMatch[1].length) as HeadingLevel,
	};
}
