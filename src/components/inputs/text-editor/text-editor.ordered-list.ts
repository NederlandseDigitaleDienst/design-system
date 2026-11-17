import { EditorState, Transaction } from '@codemirror/state';

/* Keeps an ordered list's numbers running in sequence. Markdown renders `1. 3. 5.`
 * as 1, 2, 3 regardless, but the *source* reads better when the digits actually
 * follow each other — so as soon as a line is recognized as an ordered item, the
 * whole list is renumbered. Every ordered list starts at 1 and each item increments.
 * An item is nested when it is indented at least as far as the text of the item
 * above (3 spaces under `1. `), as in CommonMark; less is the next item of the same
 * list. Nested lists number independently; returning to the parent indent
 * resumes its count. A run stays one list across a single blank line (a loose list),
 * but two or more blank lines end it — the next item starts a fresh list at 1, matching
 * CommonMark. Fenced code blocks are skipped (a `1.` there is literal).
 *
 * A line indented four spaces or more past the text of the item it is in (or
 * past the margin) is text, not an item, as the editor shows it.
 *
 * A line of plain text right after an item's text, with no blank line between, is a
 * lazy continuation: it belongs to that item, whatever its indent, so the list runs
 * on (CommonMark, and how the editor's own markdown parser reads it). A line that
 * opens a block of its own (a heading, a bullet, a quote, a fence, a `---`) is not.
 *
 * Lists inside a blockquote (`> 4. …`) are renumbered too: `> 4.` IS a CommonMark
 * ordered list, so it renders as 1, 2, 3 anyway — leaving a stray `4.` in the source
 * is treacherous. Each blockquote nesting level folds into the effective indent so a
 * quoted list tracks separately from one outside the quote. */

// A leading ordered-list marker: optional indent, digits, `.` or `)`, then a space
// or the line end (an empty item). The lookahead keeps the marker out of the match
// so only the digits are captured for a minimal, caret-friendly replacement. Applied
// to the line *after* stripping any blockquote marker prefix.
const ORDERED_RE = /^(\s*)(\d+)[.)](?=\s|$)/;
// Leading blockquote markers: each level is up to 3 spaces + `>` + an optional single
// space. Nested quotes repeat. Deliberately does NOT swallow the content indent after
// the last `>`, so a nested list inside a quote keeps its own indent.
const BQ_PREFIX_RE = /^(?:[ ]{0,3}>[ ]?)*/;
const FENCE_RE = /^\s*(?:```|~~~)/;
const BULLET_RE = /^\s*[-*+]\s+\S/;
// A line that opens a block of its own, so it cannot continue an item's paragraph:
// a heading, a bullet, a thematic break. A quote shows as a deeper blockquote prefix.
const BLOCK_START_RE = /^\s*(?:#{1,6}(?:\s|$)|[-*+](?:\s|$)|(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$)/;
// Each blockquote nesting level outranks any real list indent, so a list inside a
// quote never merges with one outside it. 1000 is far above any plausible indentation.
const BQ_UNIT = 1000;

export interface RenumberChange {
	from: number;
	to: number;
	insert: string;
}

/** Minimal digit-only changes that renumber every ordered list in `doc` so its
 *  items run in sequence. Empty when everything is already in order. */
export function renumberOrderedLists(doc: string): RenumberChange[] {
	const changes: RenumberChange[] = [];
	// A stack of the open list levels, deepest last: the (effective) indent of its marker,
	// the column where the text of its last item starts (a line indented that far is
	// inside the item), and the number its next item should take. The effective indent folds in the
	// blockquote depth (BQ_UNIT per `>`) so quoted and unquoted lists never conflate.
	const levels: { indent: number; content: number; next: number }[] = [];
	// The levels a line at this effective indent stays inside: those whose item text
	// it reaches.
	const inside = (indent: number): number => {
		let k = 0;
		while (k < levels.length && indent >= levels[k].content) k++;
		return k;
	};
	let offset = 0;
	let inFence = false;
	let blanks = 0; // consecutive blank lines seen (two in a row end a list)
	// The blockquote depth of the item paragraph the previous line belongs to, or -1
	// when it belongs to none. Only such a paragraph can take a lazy continuation.
	let paragraphBq = -1;

	for (const line of doc.split('\n')) {
		const lineStart = offset;
		offset += line.length + 1; // + newline

		if (FENCE_RE.test(line)) {
			inFence = !inFence;
			levels.length = 0; // a code fence breaks any open list
			blanks = 0;
			paragraphBq = -1;
			continue;
		}
		if (inFence) continue;

		// Split off any blockquote marker prefix (`> `, `> > `, …). The content after it
		// is treated like a normal line; the blockquote depth raises its effective indent.
		const bqPrefix = BQ_PREFIX_RE.exec(line)![0];
		const content = line.slice(bqPrefix.length);
		const bqDepth = (bqPrefix.match(/>/g) ?? []).length;

		// Four spaces or more past where the line stands (the text of the item it is in)
		// is text, not an item, as the editor shows it.
		let match = ORDERED_RE.exec(content);
		if (match) {
			const lineIndent = bqDepth * BQ_UNIT + match[1].length;
			const k = inside(lineIndent);
			const margin = Math.max(k > 0 ? levels[k - 1].content : 0, bqDepth * BQ_UNIT);
			if (lineIndent - margin >= 4) match = null;
		}
		if (!match) {
			// A blank line, or a blockquote line with no content (`>`) — the loose-list
			// separator inside a quote — keeps a loose list together; two in a row end it.
			if (content.trim() === '') {
				if (++blanks >= 2) levels.length = 0;
				paragraphBq = -1;
				continue;
			}
			blanks = 0;
			// Lazy continuation: plain text right after an item's text belongs to that item.
			// It may drop quote markers (`> 1. a` then `b`), never add one.
			if (paragraphBq >= bqDepth && levels.length && !BLOCK_START_RE.test(content)) continue;
			// A bullet with text opens a paragraph of its own, which text can continue too.
			paragraphBq = BULLET_RE.test(content) ? bqDepth : -1;
			// Any other line ends the lists whose item text it does not reach.
			levels.length = inside(bqDepth * BQ_UNIT + /^\s*/.exec(content)![0].length);
			continue;
		}

		blanks = 0;
		// An empty item (`1.` alone) has no paragraph to continue.
		paragraphBq = content.slice(match[0].length).trim() === '' ? -1 : bqDepth;
		const contentIndent = match[1].length;
		const indent = bqDepth * BQ_UNIT + contentIndent;
		const typed = match[2];
		// The text starts after the marker and 1 to 4 spaces; more is the text's own indent.
		const spaces = /^ */.exec(content.slice(match[0].length))![0].length;
		const contentCol = indent + match[0].length - contentIndent + (spaces >= 1 && spaces <= 4 ? spaces : 1);

		// Inside every item it reaches: a new list under the deepest. Otherwise the next
		// item of the first list whose item text it does not reach.
		const k = inside(indent);
		let target: number;
		if (k < levels.length) {
			levels.length = k + 1;
			const level = levels[k];
			target = level.next;
			level.next += 1;
			level.indent = indent;
			level.content = contentCol;
		} else {
			// First item of a new (sub)list: every ordered list starts at 1.
			target = 1;
			levels.push({ indent, content: contentCol, next: 2 });
		}

		const targetStr = String(target);
		if (targetStr !== typed) {
			const numStart = lineStart + bqPrefix.length + contentIndent;
			changes.push({ from: numStart, to: numStart + typed.length, insert: targetStr });
		}
	}

	return changes;
}

/** Renumbers ordered lists in the same transaction as the edit that disturbed them,
 *  so it's one atomic (single-undo) step and the caret/selection maps through it. */
/** Whether this change can have disturbed any numbering. It can when it adds or
 *  removes a line break, or when a line it touches is (or was) an ordered item.
 *  Typing inside a paragraph cannot, and that is the common case: without this
 *  test every keystroke read the whole document out and walked every line. */
/** What a line is to the numbering, so a change that turns one kind into another
 *  is seen. Plain text carries its quote depth: that decides what it continues. */
function lineKind(text: string): string {
	const bqPrefix = BQ_PREFIX_RE.exec(text)![0];
	const content = text.slice(bqPrefix.length);
	if (content.trim() === '') return 'blank';
	if (ORDERED_RE.test(content)) return 'ordered';
	if (BLOCK_START_RE.test(content) || FENCE_RE.test(content)) return 'block';
	return `plain${(bqPrefix.match(/>/g) ?? []).length}`;
}

function mayRenumber(tr: Transaction): boolean {
	let may = false;
	tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
		if (may) return;
		const before = tr.startState.doc;
		if (inserted.lines > 1 || before.lineAt(fromA).number !== before.lineAt(toA).number) {
			may = true; // a line break came or went, so items may have moved between lists
			return;
		}
		const ordered = (text: string): boolean => lineKind(text) === 'ordered';
		const was = before.lineAt(fromA).text;
		const now = tr.newDoc.lineAt(fromB).text;
		// A line that turns blank, plain or a block of its own can end a list or let it
		// run on (a lazy continuation), so that also renumbers.
		if (ordered(was) || ordered(now) || ordered(tr.newDoc.lineAt(toB).text) || lineKind(was) !== lineKind(now)) may = true;
	});
	return may;
}

export const orderedListRenumber = EditorState.transactionFilter.of((tr) => {
	// A change from outside (a `value` the app sets, a collaborator's edit) is content
	// as it stands: renumbering it would hand back an edit nobody made.
	if (tr.annotation(Transaction.remote)) return tr;
	if (!tr.docChanged || !mayRenumber(tr as Transaction)) return tr;
	const changes = renumberOrderedLists(tr.newDoc.toString());
	if (changes.length === 0) return tr;
	return [tr, { changes, sequential: true }];
});
