import { EditorSelection, EditorState, StateEffect, StateField, type ChangeSpec, type Extension, type TransactionSpec } from '@codemirror/state';
import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { enclosingNamed, enclosingNode } from './text-editor.syntax.js';

/* Emphasis that holds while you type inside it.
 *
 * CommonMark's flanking rules decide whether a `**` opens or closes, and a
 * closing run may not follow whitespace. So `**woord**` is bold and, the moment
 * a space is typed before the closing markers, `**woord **` is not: the line
 * falls back to plain text (the weight, the markers' size, the line height)
 * until the next letter arrives. A bold sentence flickers on every word
 * boundary (#213).
 *
 * The parse is right; showing it that eagerly is not. So the emphasis the caret
 * is in is remembered, and while the caret stays between its markers the styling
 * is held whatever the parser says. When the hold ends (the caret leaves, the
 * editor blurs, a paragraph break cuts the run) the whitespace that broke it is
 * moved outside the markers, `**woord** `. That is what wrapping a selection
 * produces too (#212), so bold made by typing and bold made by selecting end
 * the same. */

/** The emphasis nodes that live by the flanking rules, with the marker the
 *  editor writes for them. Inline code is not among them: a code span keeps its
 *  whitespace and never fails to close. */
export const EMPHASIS_MARKERS: ReadonlyMap<string, string> = new Map([
	['StrongEmphasis', '**'],
	['Emphasis', '*'],
	['Strikethrough', '~~'],
]);

/** The blocks that hold inline content. A held emphasis must stay within one:
 *  a paragraph break inside it (Enter twice) ends the run for good. */
const INLINE_BLOCKS = new Set([
	'Paragraph', 'ATXHeading1', 'ATXHeading2', 'ATXHeading3', 'ATXHeading4', 'ATXHeading5', 'ATXHeading6',
	'SetextHeading1', 'SetextHeading2', 'TableCell',
]);

/** What may sit between the end of a run's text and its closing marker for the
 *  marker to be moved back to the text: whitespace, and after a line break the
 *  scaffolding Enter writes for the next list item, task or quote line. Text
 *  there means the break fell inside the run, and that is left alone. */
const TRAIL_RE = /^\s*(?:\n\s*(?:(?:[-*+]|\d+[.)]|>|\[[ xX]\])\s*)*)*$/;

export interface HeldEmphasis {
	from: number;
	to: number;
	name: string;
	/** As written: `**` or `__` for strong, `*` or `_` for emphasis. */
	marker: string;
	/** The tree parses the node right now, so the styling is its own and nothing
	 *  is held. Remembered so the hold can take over the moment it stops. */
	live: boolean;
}

/** Starts a hold on markers just written around an empty selection: `****`
 *  parses as nothing, so there is no node to remember, but what is typed
 *  between them is meant to be bold. */
export const holdEmphasis = StateEffect.define<Omit<HeldEmphasis, 'live'>>({
	map: (value, mapping) => ({ ...value, from: mapping.mapPos(value.from, 1), to: mapping.mapPos(value.to, -1) }),
});

function emphasisAround(state: EditorState, pos: number, side: -1 | 1): SyntaxNode | null {
	return enclosingNode(state, pos, side, (node) => EMPHASIS_MARKERS.has(node.name));
}

function inlineBlockAt(state: EditorState, pos: number): SyntaxNode | null {
	return enclosingNamed(state, pos, 1, INLINE_BLOCKS);
}

/** The innermost emphasis the main selection is inside of on both of its sides,
 *  as the tree parses it now. Just before the opening marker or just after the
 *  closing one is outside: text typed there lands outside the emphasis. */
function liveEmphasis(state: EditorState): HeldEmphasis | null {
	const { from, to } = state.selection.main;
	const left = emphasisAround(state, from, -1);
	const right = left && emphasisAround(state, to, 1);
	if (!left || !right || left.from !== right.from || left.to !== right.to) return null;
	const len = EMPHASIS_MARKERS.get(left.name)!.length;
	return { from: left.from, to: left.to, name: left.name, marker: state.sliceDoc(left.from, left.from + len), live: true };
}

/** Whether a remembered emphasis is still worth holding: the selection is between
 *  its markers, both markers are still there, no paragraph break cut it, and
 *  the parser has not made something else of its start. (Typing `**` inside
 *  bold splits it, and then the tree's own reading should show.) */
function holds(state: EditorState, held: HeldEmphasis): boolean {
	const len = held.marker.length;
	const { from, to } = state.selection.main;
	if (from < held.from + len || to > held.to - len) return false;
	const text = state.sliceDoc(held.from, held.to);
	if (text.length < 2 * len || !text.startsWith(held.marker) || !text.endsWith(held.marker)) return false;
	const block = inlineBlockAt(state, held.from);
	if (!block || block.to < held.to) return false;
	const parsed = emphasisAround(state, held.from, 1);
	return !(parsed && parsed.name === held.name && parsed.from === held.from);
}

function mapHeld(held: HeldEmphasis, through: { changes: { mapPos(pos: number, assoc: number): number } }): HeldEmphasis {
	return { ...held, from: through.changes.mapPos(held.from, 1), to: through.changes.mapPos(held.to, -1) };
}

/** The emphasis the caret is in: the tree's own while it parses, and the held
 *  one, mapped along through edits, once it does not. Null outside any. */
export const heldEmphasisField = StateField.define<HeldEmphasis | null>({
	create: (state) => liveEmphasis(state),
	update(prev, tr) {
		// The run the caret was in comes first, live or held: if the tree has let
		// go of it (or still has not taken it up) it is held from here. The tree
		// may well parse an outer emphasis around it, and that one needs no holding.
		if (prev) {
			const held = mapHeld({ ...prev, live: false }, tr);
			if (holds(tr.state, held)) return held;
		}
		const live = liveEmphasis(tr.state);
		if (live) return live;
		const seed = tr.effects.find((effect) => effect.is(holdEmphasis));
		return seed ? { ...seed.value, live: false } : null;
	},
});

interface Repair {
	from: number;
	to: number;
	len: number;
	/** Whitespace between the opening marker and the text. */
	lead: number;
	/** What sits between the text and the closing marker. */
	trail: number;
}

/** The whitespace at the inside edges of `held`, or null when there is nothing
 *  to move: no whitespace at the edges, nothing but whitespace inside, or the
 *  markers are gone. The text ends where the opening block's text does: past
 *  a paragraph break the rest of the run can never be inside the emphasis, so
 *  it counts as trail, provided it is scaffolding and not text. */
function repairFor(state: EditorState, held: HeldEmphasis): Repair | null {
	const len = held.marker.length;
	const text = state.sliceDoc(held.from, held.to);
	if (text.length < 2 * len || !text.startsWith(held.marker) || !text.endsWith(held.marker)) return null;
	const inner = text.slice(len, text.length - len);
	const lead = /^\s*/.exec(inner)![0].length;
	const block = inlineBlockAt(state, held.from);
	const inBlock = state.sliceDoc(held.from + len, Math.min(held.to - len, block ? block.to : held.to - len));
	const contentEnd = held.from + len + inBlock.replace(/\s+$/, '').length;
	if (contentEnd <= held.from + len + lead) return null;
	const trail = held.to - len - contentEnd;
	if (!lead && !trail) return null;
	if (!TRAIL_RE.test(state.sliceDoc(contentEnd, held.to - len))) return null;
	return { from: held.from, to: held.to, len, lead, trail };
}

/** Moves the lead in front of the opening marker and the trail past the closing
 *  one. Moving the whitespace rather than the markers keeps an annotation on
 *  the text on the text. */
function repairChanges(state: EditorState, r: Repair): ChangeSpec[] {
	const changes: ChangeSpec[] = [];
	if (r.lead) {
		changes.push(
			{ from: r.from, insert: state.sliceDoc(r.from + r.len, r.from + r.len + r.lead) },
			{ from: r.from + r.len, to: r.from + r.len + r.lead },
		);
	}
	if (r.trail) {
		changes.push(
			{ from: r.to - r.len - r.trail, to: r.to - r.len },
			{ from: r.to, insert: state.sliceDoc(r.to - r.len - r.trail, r.to - r.len) },
		);
	}
	return changes;
}

/** Where a position lands after the repair. The markers and the whitespace swap
 *  places, and a caret in the whitespace goes with it past the marker: after
 *  the space it typed, outside the run. With `stay` it stays with the text,
 *  inside the markers. That is what a blur wants: a toolbar click blurs the
 *  editor before its command runs, and the command must find the caret where
 *  the typing was. */
function mapRepair(pos: number, r: Repair, stay: boolean): number {
	const contentStart = r.from + r.len + r.lead;
	const contentEnd = r.to - r.len - r.trail;
	if (r.lead) {
		if (pos > r.from && pos < r.from + r.len) return pos + r.lead;
		if (pos >= r.from + r.len && pos < contentStart) return stay ? contentStart : pos - r.len;
	}
	if (r.trail) {
		if (pos > contentEnd && pos <= r.to - r.len) return stay ? contentEnd : pos + r.len;
		if (pos > r.to - r.len && pos < r.to) return pos - r.trail;
	}
	return pos;
}

function repairSpec(state: EditorState, held: HeldEmphasis, stay: boolean): TransactionSpec | null {
	const r = repairFor(state, held);
	if (!r) return null;
	const sel = state.selection;
	return {
		changes: repairChanges(state, r),
		selection: EditorSelection.create(
			sel.ranges.map((range) => EditorSelection.range(mapRepair(range.anchor, r, stay), mapRepair(range.head, r, stay))),
			sel.mainIndex,
		),
		userEvent: 'input.emphasis',
	};
}

/** The changes that move edge whitespace out of `held`, for a command that
 *  steps out of the run itself. Empty when there is nothing to move. */
export function repairChangesFor(state: EditorState, held: HeldEmphasis): ChangeSpec[] {
	const r = repairFor(state, held);
	return r ? repairChanges(state, r) : [];
}

/** Ends a hold at once, for a blur. The display must be right while the editor
 *  is unfocused, and the value it commits must be markdown that renders the way
 *  it looked. */
export function repairHeldEmphasis(view: EditorView): void {
	const held = view.state.field(heldEmphasisField, false);
	if (!held || held.live || view.state.readOnly) return;
	const spec = repairSpec(view.state, held, true);
	if (spec) view.dispatch(spec);
}

/** Repairs an emphasis the moment its hold ends: the caret left it, or a
 *  paragraph break cut it. A dispatch during an update is an error, so the
 *  repair waits for the update to finish. A microtask is soon enough to land
 *  before the paint, so nothing flickers. */
const repairOnRelease = ViewPlugin.fromClass(class {
	private pending: HeldEmphasis | null = null;
	private destroyed = false;

	constructor(private readonly view: EditorView) {}

	update(update: ViewUpdate): void {
		if (this.pending) this.pending = mapHeld(this.pending, update);
		const before = update.startState.field(heldEmphasisField);
		if (!before) return;
		const gone = mapHeld(before, update);
		const after = update.state.field(heldEmphasisField);
		if (after && after.name === gone.name && after.from === gone.from && after.to === gone.to) return;
		this.pending = gone;
		queueMicrotask(() => this.flush());
	}

	private flush(): void {
		const held = this.pending;
		this.pending = null;
		if (!held || this.destroyed || this.view.state.readOnly) return;
		// Bold with nothing typed in it: the caret left an empty pair, which no
		// renderer makes anything of. Not on blur, where a toolbar click is
		// about to add a second format to the first.
		if (this.view.state.sliceDoc(held.from, held.to) === held.marker + held.marker) {
			this.view.dispatch({ changes: { from: held.from, to: held.to }, userEvent: 'input.emphasis' });
			return;
		}
		const spec = repairSpec(this.view.state, held, false);
		if (spec) this.view.dispatch(spec);
	}

	destroy(): void {
		this.destroyed = true;
	}
});

export const heldEmphasis: Extension = [heldEmphasisField, repairOnRelease];
