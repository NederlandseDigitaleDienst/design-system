import { relabel } from './text-editor.labels.js';
import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { EditorState, Prec, StateEffect, StateField, type Extension, type Range } from '@codemirror/state';
import { invertedEffects } from '@codemirror/commands';
import {
	ANNOTATION_SENTINEL as S,
	stripSentinels,
	sentinelPositions,
	docToClean,
	cleanToDoc,
	reconcileSentinels,
	type CleanGroup,
} from './text-editor.annotation-sentinels.js';
import { textCaretBox } from './text-editor.caret.js';

/* W3C-style annotation overlay. Annotations live outside the markdown (the exposed
 * text stays clean); the consumer supplies them and the component renders them as a
 * light tint with a count badge. Anchored by CLEAN character offsets, mapped through
 * edits.
 *
 * To let the caret rest on both sides of an annotation edge — just inside it and
 * just outside — each group carries a zero-width sentinel character in the CM
 * document at its start and end (a real document offset either side of the
 * boundary). The end sentinel renders as the badge; the start sentinel collapses to
 * nothing. Sentinels live only in the CM document — never in `value`, the clipboard
 * or the form (the host strips them). See text-editor.annotation-sentinels.ts. */

export interface Annotation {
	/** Stable id, owned by the consumer. */
	id: string;
	/** Character offset range in the CLEAN document (W3C TextPositionSelector). */
	start: number;
	end: number;
	/** The quoted text, kept for re-anchoring after edits (TextQuoteSelector). */
	quote?: string;
}

/** An annotation anchored in CLEAN (sentinel-free) coordinates. */
interface CleanAnn {
	id: string;
	from: number;
	to: number;
}

/** Replace the editor's annotation set (consumer offsets are clean). */
export const setAnnotations = StateEffect.define<readonly Annotation[]>();

/** Internal: the filter's freshly computed clean anchors. The field only ever
 *  updates from this, so anchoring lives in one place (the filter). */
const setAnchored = StateEffect.define<CleanAnn[]>();

/** A drag-move, in CLEAN offsets: the block [from, to) is being relocated so its
 *  first character lands at `insertAt`. mapPos can't follow moved content, so the
 *  filter uses this to carry annotations inside the block along with their text. */
export const annotationMove = StateEffect.define<{ from: number; to: number; insertAt: number }>();

/** A cut→paste inside the same editor: re-attach the annotations that were cut at the
 *  paste point. `at` is the CLEAN paste offset; each entry's from/to are relative to
 *  the pasted text. Carries the original ids, so a cut→paste is a move, not a copy. */
export const pasteAnnotations = StateEffect.define<{ at: number; anns: CleanAnn[] }>();

/** The annotations currently anchored in the document, in clean offsets. Lets the
 *  host capture what sits inside a cut so it can re-attach them on paste. */
export function currentAnnotations(state: EditorState): readonly CleanAnn[] {
	return state.field(annotationField, false) ?? [];
}

function anchorClean(list: readonly Annotation[], cleanLength: number): CleanAnn[] {
	return list
		.map((a) => ({
			id: a.id,
			from: Math.max(0, Math.min(a.start, cleanLength)),
			to: Math.max(0, Math.min(a.end, cleanLength)),
		}))
		.filter((a) => a.to > a.from);
}

/** A clean annotation's doc range: text start, and text end (just before the end
 *  sentinel). Used to map through a user edit in doc space, where the sentinel
 *  physically separates the inside edge from the outside one. */
function annToDoc(a: CleanAnn, sents: number[]): { from: number; to: number } {
	return { from: cleanToDoc(sents, a.from), to: cleanToDoc(sents, a.to - 1) + 1 };
}

/** Annotations in clean coordinates. Updated only via `setAnchored`, which the
 *  transaction filter computes (mapping through edits in doc space). */
const annotationField = StateField.define<CleanAnn[]>({
	create: () => [],
	update: (value, tr) => {
		const set = tr.effects.find((e) => e.is(setAnchored));
		return set ? set.value : value;
	},
});

// Annotations on the same text merge into one tint + one count badge.
interface Group {
	from: number;
	to: number;
	ids: string[];
}

function groupOverlapping(anns: CleanAnn[]): Group[] {
	const groups: Group[] = [];
	for (const a of [...anns].sort((x, y) => x.from - y.from || x.to - y.to)) {
		const last = groups[groups.length - 1];
		// Strict overlap only: two ranges that merely touch (one ends where the next
		// begins, e.g. [0,3] and [3,6]) stay separate tints/badges. The sentinel
		// machinery already places two sentinels at such a seam.
		if (last && a.from < last.to) {
			last.to = Math.max(last.to, a.to);
			last.ids.push(a.id);
		} else {
			groups.push({ from: a.from, to: a.to, ids: [a.id] });
		}
	}
	return groups;
}

// The badge's accessible label quotes the annotated text, truncated so a long range
// can't produce a huge label. Screen-reader-only; the visible badge shows the count.
const ANNOTATION_LABEL_MAX = 40;

function truncateQuote(text: string): string {
	return text.length > ANNOTATION_LABEL_MAX ? `${text.slice(0, ANNOTATION_LABEL_MAX)}…` : text;
}

/** Builds an annotation badge's accessible label from the count and the (already
 *  truncated) quoted text, choosing singular/plural. Supplied by the host so the
 *  string is localizable; defaults to Dutch at the call site. */
export type AnnotationCountLabel = (count: number, quote: string) => string;

class AnnotationBadge extends WidgetType {
	readonly ariaLabel: string;

	constructor(readonly ids: string[], readonly quote: string, label: AnnotationCountLabel) {
		super();
		this.ariaLabel = label(ids.length, truncateQuote(quote));
	}

	eq(other: AnnotationBadge): boolean {
		return (
			other.quote === this.quote &&
			other.ids.length === this.ids.length &&
			other.ids.every((id, i) => id === this.ids[i]) &&
			other.ariaLabel === this.ariaLabel
		);
	}

	toDOM(): HTMLElement {
		const badge = document.createElement('button');
		badge.className = 'cm-annotation-badge';
		badge.type = 'button';
		badge.dataset.annotations = this.ids.join(' ');
		badge.textContent = String(this.ids.length);
		badge.setAttribute('aria-label', this.ariaLabel);
		return badge;
	}

	/** Give the caret at either edge of the badge a stable, text-height rectangle.
	 *  Without this, drawSelection measures the caret from the badge's own small font,
	 *  so it renders short next to the badge and its height flips with the arrival
	 *  direction (the queried side follows the cursor's assoc). */
	coordsAt(dom: HTMLElement, pos: number, _side: number): { left: number; right: number; top: number; bottom: number } | null {
		const badge = dom.getBoundingClientRect();
		const cs = getComputedStyle(dom);
		const box = textCaretBox(dom) ?? { top: badge.top, bottom: badge.bottom };
		// Inside edge: the text's end (before the badge's left margin). Outside edge:
		// the tint's own right edge on its last line, which is where the text after
		// the annotation starts. The badge's right edge plus its margin stops short
		// of that by the tint's inline padding, and CodeMirror measures the position
		// after the sentinel from the text on the other side, so the caret there
		// jumped by that padding depending on the direction it arrived from. The
		// badge sits on the annotation's last line, so the last client rect is the
		// right one for a multi-line annotation; the bounding box would be the union
		// of every line and push the caret to the far right edge.
		const tint = dom.closest('.cm-annotation');
		const rects = tint ? tint.getClientRects() : null;
		const lastLine = rects && rects.length ? rects[rects.length - 1] : null;
		const x = pos <= 0
			? badge.left - parseFloat(cs.marginLeft)
			: (lastLine ? lastLine.right : badge.right + parseFloat(cs.marginRight));
		return { left: x, right: x, top: box.top, bottom: box.bottom };
	}
}

// inclusiveEnd lets the end sentinel's replace (the badge) nest inside the tint span.
const annotationMark = Decoration.mark({ class: 'cm-annotation', inclusiveEnd: true });
const annotationFullSelectedMark = Decoration.mark({ class: 'cm-annotation is-selected', inclusiveEnd: true });
const annotationSelectedMark = Decoration.mark({ class: 'is-selected' });
class AnnotationStart extends WidgetType {
	eq(other: WidgetType): boolean {
		return other instanceof AnnotationStart;
	}

	toDOM(): HTMLElement {
		const span = document.createElement('span');
		span.className = 'cm-annotation-start';
		return span;
	}

	coordsAt(dom: HTMLElement, pos: number, _side: number): { left: number; right: number; top: number; bottom: number } | null {
		// CodeMirror inserts a zero-width cm-widgetBuffer between the widget and the
		// content, so skip it to reach the tint span.
		let tint = dom.nextElementSibling;
		while (tint instanceof HTMLElement && tint.classList.contains('cm-widgetBuffer')) tint = tint.nextElementSibling;
		if (!(tint instanceof HTMLElement) || !tint.classList.contains('cm-annotation')) return null;
		const padLeft = parseFloat(getComputedStyle(tint).paddingInlineStart || '0');
		// The start sentinel sits on the tint's FIRST line, so measure that line, not
		// tint.getBoundingClientRect() — which for a multi-line annotation is the union
		// of every line and would draw a caret as tall as the whole token. textCaretBox
		// gives the exact body caret, but it throws (→ null) during drawSelection's
		// measure pass; the fallback then uses the first client rect, never the union.
		const firstLine = tint.getClientRects()[0] ?? tint.getBoundingClientRect();
		const box = textCaretBox(dom) ?? { top: firstLine.top, bottom: firstLine.bottom };
		const x = pos <= 0 ? firstLine.left : firstLine.left + padLeft;
		return { left: x, right: x, top: box.top, bottom: box.bottom };
	}
}

// The start sentinel: an invisible widget that pins the caret to the token's edges.
const startSentinelDeco = Decoration.replace({ widget: new AnnotationStart() });
// Dummy value for the atomic-range set (positions only; never rendered).
const atomicMark = Decoration.mark({});
// Glues the annotated text's last word to the badge so the badge never wraps onto
// a line by itself (an orphan). Only the tail is nowrap, so a long annotation still
// wraps at its earlier spaces.
// inclusiveEnd so the mark wraps the trailing badge widget at its end boundary,
// keeping the badge inside the nowrap span (a plain mark would leave it a sibling).
const badgeTailMark = Decoration.mark({ class: 'cm-annotation-tail', inclusiveEnd: true });

interface Built {
	deco: DecorationSet;
	atomic: DecorationSet;
}

/** Resolve a group's doc geometry: the text span, and where its sentinels actually
 *  sit (they may be absent when placement was guarded). */
function resolveGroup(group: Group, doc: string, sents: number[]) {
	const docFrom = cleanToDoc(sents, group.from);
	const textTo = cleanToDoc(sents, group.to - 1) + 1; // just after the last text char
	const startSent = docFrom - 1 >= 0 && doc[docFrom - 1] === S ? docFrom - 1 : null;
	const endSent = textTo < doc.length && doc[textTo] === S ? textTo : null;
	return { docFrom, textTo, startSent, endSent };
}

const NOTHING: Built = { deco: Decoration.none, atomic: Decoration.none };

function buildAll(state: EditorState, label: AnnotationCountLabel): Built {
	// Without annotations there is nothing to draw, and the document is not worth
	// walking: reading it out, stripping it and scanning it for sentinels are three
	// passes over the whole text, and they would run on every keystroke and every
	// cursor move of an editor that never turned the overlay on.
	if (!state.field(annotationField).length) return NOTHING;
	const doc = state.doc.toString();
	const sel = state.selection.main;
	const sents = sentinelPositions(doc);
	// Clamp anchors to the CLEAN document length before building. The field and the
	// document can be transiently inconsistent — most sharply on undo/redo, where
	// history reverts the text (and any non-historized sentinels linger) while the
	// field still holds pre-revert offsets. Building unclamped then emits decoration
	// ranges past the document end, and CodeMirror throws "Position N out of range"
	// diffing them. Clamping keeps every range in-bounds; the next consistent update
	// re-renders the real anchors.
	const cleanLen = doc.length - sents.length;
	const clean = stripSentinels(doc);
	const anns = state.field(annotationField)
		.map((a) => ({ id: a.id, from: Math.min(a.from, cleanLen), to: Math.min(a.to, cleanLen) }))
		.filter((a) => a.to > a.from);
	const deco: Range<Decoration>[] = [];
	const atomic: Range<Decoration>[] = [];
	for (const group of groupOverlapping(anns)) {
		if (group.to <= group.from) continue;
		const { docFrom, textTo, startSent, endSent } = resolveGroup(group, doc, sents);
		// The annotated text (sentinel-free) for the badge's accessible label.
		const quote = clean.slice(group.from, group.to);
		// The tint covers the text, plus the end sentinel (badge) when present so the
		// badge shares the tint.
		const tintTo = endSent !== null ? textTo + 1 : textTo;
		const fully = !sel.empty && sel.from <= docFrom && sel.to >= tintTo;
		deco.push((fully ? annotationFullSelectedMark : annotationMark).range(docFrom, tintTo));
		if (!fully && !sel.empty) {
			const f = Math.max(docFrom, sel.from);
			const t = Math.min(tintTo, sel.to);
			if (t > f) deco.push(annotationSelectedMark.range(f, t));
		}
		// The badge end (just past it): the sentinel slot when present, else the text end.
		const badgeEnd = endSent !== null ? endSent + 1 : textTo;
		// Start of the annotated text's last word — nowrap from here through the badge
		// keeps the two together so the badge can't orphan onto the next line.
		const tail = doc.slice(docFrom, textTo).match(/\S+$/);
		if (tail) deco.push(badgeTailMark.range(docFrom + (tail.index ?? 0), badgeEnd));
		if (endSent !== null) {
			// Two caret stops: the badge replaces the end sentinel, atomic so the caret
			// treats it as a unit and stops just before (inside) and just after (outside).
			deco.push(Decoration.replace({ widget: new AnnotationBadge(group.ids, quote, label) }).range(endSent, endSent + 1));
			atomic.push(atomicMark.range(endSent, endSent + 1));
		} else {
			// Guarded edge (would break the markdown parse): fall back to the old
			// single-stop nub — a zero-width widget at the range end, inside the tint.
			deco.push(Decoration.widget({ widget: new AnnotationBadge(group.ids, quote, label), side: -1 }).range(textTo));
		}
		if (startSent !== null) {
			deco.push(startSentinelDeco.range(startSent, startSent + 1));
			atomic.push(atomicMark.range(startSent, startSent + 1));
		}
	}
	return { deco: Decoration.set(deco, true), atomic: Decoration.set(atomic, true) };
}

/** The render field carries the badge label so its accessible text is localizable.
 *  A fresh field per overlay keeps the two concerns (rendering, atomic ranges) reading
 *  the same instance. */
function makeAnnotationRender(label: AnnotationCountLabel): StateField<Built> {
	return StateField.define<Built>({
		create: (state) => buildAll(state, label),
		update: (value, tr) => {
			// Nothing drawn and nothing to draw: skip the rebuild entirely, so an
			// editor without annotations pays nothing per keystroke.
			if (value === NOTHING && !tr.state.field(annotationField).length) return value;
			if (tr.docChanged || !tr.startState.selection.eq(tr.state.selection) || tr.effects.some((e) => e.is(setAnnotations) || e.is(relabel))) {
				return buildAll(tr.state, label);
			}
			return value;
		},
		provide: (f) => EditorView.decorations.from(f, (v) => v.deco),
	});
}

/** Maintains the document sentinels: after any annotation or text change, ensures
 *  exactly one sentinel at each group's start and end (minus guarded edges). Runs in
 *  the same transaction (atomic, single undo step) via a transaction filter. */
const annotationSentinelFilter = EditorState.transactionFilter.of((tr) => {
	const set = tr.effects.find((e) => e.is(setAnnotations));
	if (!tr.docChanged && !set) return tr;
	// No annotations before this transaction and none arriving (as a fresh set, or
	// riding along with a paste): there are no sentinels to maintain, so the
	// document is left alone. Without this an editor that never turned the overlay
	// on still read the whole text out four times per keystroke and appended a
	// transaction to store an empty anchor list.
	const arriving = set || tr.effects.some((e) => e.is(pasteAnnotations) || e.is(annotationMove));
	if (!arriving && !(tr.startState.field(annotationField, false) ?? []).length) return tr;
	const postUserDoc = tr.newDoc.toString(); // after the user's changes, before sentinels
	const cleanLen = stripSentinels(postUserDoc).length;
	let anns: CleanAnn[];
	if (set) {
		anns = anchorClean(set.value, cleanLen);
	} else {
		// Map each annotation through the user edit in DOC space (to leans right, so a
		// character typed just inside the end — before the sentinel — grows it, while
		// one typed just outside — after the sentinel — does not), then back to clean.
		const oldSents = sentinelPositions(tr.startState.doc.toString());
		const move = tr.effects.find((e) => e.is(annotationMove))?.value;
		anns = (tr.startState.field(annotationField, false) ?? [])
			.map((a) => {
				// A drag relocates whole annotations with their text. mapPos can't follow
				// moved content (a delete + a separate insert), so an annotation sitting
				// fully inside the moved block is translated to its landing spot instead of
				// being collapsed by the delete.
				if (move && a.from >= move.from && a.to <= move.to) {
					return { id: a.id, from: move.insertAt + (a.from - move.from), to: move.insertAt + (a.to - move.from) };
				}
				const doc = annToDoc(a, oldSents);
				const from = tr.changes.mapPos(doc.from, -1);
				const to = tr.changes.mapPos(doc.to, 1);
				return { id: a.id, from: docToClean(postUserDoc, from), to: docToClean(postUserDoc, to) };
			})
			.filter((a) => a.to > a.from);
		// A cut→paste re-attaches the cut annotations at the paste point (clean offsets
		// relative to the pasted text), clamped into the document.
		const paste = tr.effects.find((e) => e.is(pasteAnnotations))?.value;
		if (paste) {
			anns = anns.concat(
				paste.anns
					.map((a) => ({
						id: a.id,
						from: Math.max(0, Math.min(paste.at + a.from, cleanLen)),
						to: Math.max(0, Math.min(paste.at + a.to, cleanLen)),
					}))
					.filter((a) => a.to > a.from),
			);
		}
	}
	const groups: CleanGroup[] = groupOverlapping(anns);
	const changes = reconcileSentinels(postUserDoc, groups);
	// Re-anchor the field to the freshly computed clean annotations (authoritative).
	return [tr, { changes, effects: [setAnchored.of(anns)], sequential: true }];
});

// The transaction filter re-anchors the field on live edits, but it does NOT run on
// history transactions — so on undo/redo the document (and its sentinels) revert while
// the clean anchors would keep their pre-undo positions, drifting the annotations.
// invertedEffects stores the field's prior value alongside each anchoring change, so
// history restores the anchors in step with the document it belongs to.
const annotationHistory = invertedEffects.of((tr) => {
	if (!tr.effects.some((e) => e.is(setAnchored))) return [];
	const prior = tr.startState.field(annotationField, false) ?? [];
	return [setAnchored.of(prior)];
});

// Keep sentinels out of the clipboard: copy/cut strip them from the outgoing text,
// and paste strips any that rode in from another editor instance. The document's own
// filter re-adds the sentinels it needs, so clipboard text stays clean either way.
const annotationClipboard: Extension = [
	EditorView.clipboardOutputFilter.of((text) => stripSentinels(text)),
	EditorView.clipboardInputFilter.of((text) => stripSentinels(text)),
];

/** The annotation overlay: clean-coordinate anchoring, sentinel maintenance, and
 *  tint/badge rendering with a caret stop on each side of every edge. `countLabel`
 *  builds each badge's accessible label (count + quote, singular/plural), so the
 *  host can localize it. */
// Prec.low keeps the tint the INNERMOST mark, so it hugs the raw text and inherits
// its font (a heading, bold, etc.) — the token then scales with whatever it marks,
// instead of sitting at the base font size as an outer wrapper.
export function annotations(countLabel: AnnotationCountLabel): Extension {
	const annotationRender = makeAnnotationRender(countLabel);
	const annotationAtomic = EditorView.atomicRanges.of((view) => view.state.field(annotationRender).atomic);
	return [
		annotationField,
		Prec.highest(annotationRender),
		annotationAtomic,
		annotationSentinelFilter,
		annotationHistory,
		annotationClipboard,
	];
}
