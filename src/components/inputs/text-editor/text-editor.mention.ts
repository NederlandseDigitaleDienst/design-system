import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { Prec, StateField, type EditorState, type Extension, type Range } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';
import type { TypeaheadCandidate } from './text-editor.mentions.js';
import { CODE_NODES, enclosingNode, linkTextRange, treeAdvanced } from './text-editor.syntax.js';
import '../../content/icon/icon.js';

/* A mention, everywhere it shows up: how it is stored (`[@Naam](user:id)`), how
 * the editor recognizes it, and the atomic token it collapses to. The typeahead
 * that inserts one lives in text-editor.mentions.ts. */

/** Href prefix that marks a markdown link as a mention. */
export const MENTION_HREF_PREFIX = 'user:';

/** The markdown-compatible token stored for a mention (degrades to a plain link).
 *  The label's link-text delimiters are backslash-escaped and the id is
 *  percent-encoded, so a crafted candidate (e.g. a display name sourced from user
 *  data) can't break out of `[label](user:id)` into arbitrary markdown — a stray
 *  `]` or `)` would otherwise start a second, attacker-shaped link. The render
 *  layer reverses both via `unescapeMentionLabel` / `decodeMentionId`. */
export function mentionToken(candidate: TypeaheadCandidate): string {
	const label = candidate.text.replace(/[[\]\\]/g, (c) => '\\' + c);
	// encodeURIComponent leaves ( ) < > ! * ' . - _ ~ intact, but ")" closes a
	// markdown link destination — encode the parens and angle brackets on top of it
	// (decodeURIComponent reverses all of it).
	const id = encodeURIComponent(candidate.id).replace(
		/[()<>]/g,
		(c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
	);
	return `[@${label}](${MENTION_HREF_PREFIX}${id})`;
}

/** What the built-in mention writes: the token and a space to go on typing. */
export function mentionInsert(candidate: TypeaheadCandidate): string {
	return `${mentionToken(candidate)} `;
}

/** Reverse `mentionToken`'s label escaping for display. */
export function unescapeMentionLabel(label: string): string {
	return label.replace(/\\([[\]\\])/g, '$1');
}

/** Reverse `mentionToken`'s id encoding. Falls back to the raw text when it isn't
 *  valid percent-encoding (e.g. a token authored by hand before this encoding). */
export function decodeMentionId(id: string): string {
	try {
		return decodeURIComponent(id);
	} catch {
		return id;
	}
}

/** A stored mention in running text, with its `@Naam` as the first group. */
export const MENTION_TOKEN_RE = new RegExp(`\\[(@[^\\]]*)\\]\\(${MENTION_HREF_PREFIX}[^)]*\\)`, 'g');

/** Whether an address is a mention's (`user:id`), not a place to go. */
export function isMentionHref(href: string): boolean {
	return href.startsWith(MENTION_HREF_PREFIX);
}

/** Whether a `Link` node is a mention. */
export function isMentionLink(state: EditorState, link: SyntaxNode): boolean {
	const url = link.getChild('URL');
	return url !== null && isMentionHref(state.sliceDoc(url.from, url.to));
}

/* @-mentions collapse fully: the whole `[@Naam](user:id)` token is replaced by
 * an atomic token widget — the syntax is hidden, the id is protected, and the
 * cursor steps over it (backspace removes the whole mention). */
class MentionWidget extends WidgetType {
	constructor(readonly label: string, readonly id: string, readonly selected: boolean) {
		super();
	}

	eq(other: MentionWidget): boolean {
		return other.label === this.label && other.id === this.id && other.selected === this.selected;
	}

	toDOM(): HTMLElement {
		const token = document.createElement('span');
		token.className = 'cm-md-mention-token';
		token.setAttribute('data-user', this.id);
		// A name someone chose, not the writer's spelling to correct. Safari
		// ignores this inside the editor, hence the name in CSS below.
		token.setAttribute('spellcheck', 'false');
		if (this.selected) token.setAttribute('data-selected', '');
		// The @ is rendered as the DS 'at' icon — a separate, vertically-centered
		// prefix that aligns cleanly with the name.
		const at = document.createElement('nldd-icon');
		at.className = 'cm-md-mention-token-icon';
		at.setAttribute('icon', 'at');
		at.setAttribute('aria-hidden', 'true');
		const name = document.createElement('span');
		name.className = 'cm-md-mention-token-name';
		name.dataset.label = this.label;
		token.append(at, name);
		return token;
	}
}

function buildMentionChips(state: EditorState): DecorationSet {
	const ranges: Range<Decoration>[] = [];
	const sel = state.selection.main;
	syntaxTree(state).iterate({
		enter: (node) => {
			// Code holds no links; its text is often the longest part of a document.
			if (CODE_NODES.has(node.name)) return false;
			if (node.name !== 'Link') return;
			const link = node.node;
			const url = link.getChild('URL');
			if (!url || !isMentionLink(state, link)) return;
			const text = linkTextRange(link);
			if (!text) return;
			const label = unescapeMentionLabel(state.sliceDoc(text.from, text.to).replace(/^@/, ''));
			const id = decodeMentionId(state.sliceDoc(url.from, url.to).slice(MENTION_HREF_PREFIX.length));
			const selected = !sel.empty && sel.from <= link.from && sel.to >= link.to;
			ranges.push(Decoration.replace({ widget: new MentionWidget(label, id, selected) }).range(link.from, link.to));
		},
	});
	return Decoration.set(ranges, true);
}

/** Whether moving the selection from `before` to `after` changes which mention a
 *  selection covers. Only then is the chip set worth rebuilding: walking the
 *  whole syntax tree on every arrow key, to find that nothing looks different,
 *  is the expensive way to do nothing. */
function coverageChanged(chips: DecorationSet, before: { from: number; to: number }, after: { from: number; to: number }): boolean {
	let changed = false;
	chips.between(0, 1e9, (from, to) => {
		const covers = (sel: { from: number; to: number }): boolean => sel.from !== sel.to && sel.from <= from && sel.to >= to;
		if (covers(before) !== covers(after)) {
			changed = true;
			return false;
		}
		return undefined;
	});
	return changed;
}

const mentionChipField = StateField.define<DecorationSet>({
	create: (state) => buildMentionChips(state),
	// Rebuild on doc changes and on selection changes (the latter drives the
	// selected/darker state of a covered mention).
	update: (value, tr) => {
		if (tr.docChanged || treeAdvanced(tr.startState, tr.state)) return buildMentionChips(tr.state);
		if (tr.startState.selection.eq(tr.state.selection)) return value;
		return coverageChanged(value, tr.startState.selection.main, tr.state.selection.main)
			? buildMentionChips(tr.state)
			: value;
	},
	provide: (field) => EditorView.decorations.from(field),
});

// Treat each token as one unit so the cursor steps over it and backspace removes
// the whole mention rather than breaking the hidden (user:id) syntax.
const mentionAtomicRanges = EditorView.atomicRanges.of(
	(view) => view.state.field(mentionChipField, false) ?? Decoration.none,
);

/** The mention token: the chip that replaces the whole link, and the atomic range
 *  the caret steps over. Prec.highest keeps the chip the innermost decoration, so
 *  it nests inside a heading or bold run and scales with its font. */
export const mentionTokens: Extension = [Prec.highest(mentionChipField), mentionAtomicRanges];

// The mention Link node at `pos` (resolving toward `side`), or null.
function mentionLinkAt(state: EditorState, pos: number, side: -1 | 1): SyntaxNode | null {
	return enclosingNode(state, pos, side, (node) => node.name === 'Link' && isMentionLink(state, node));
}

/** The mention whose collapsed token contains `pos` (used to select it on click). */
export function mentionRangeAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, 1);
	return link ? { from: link.from, to: link.to } : null;
}

/** A mention token ending exactly at `pos` (cursor just after it — backspace). */
export function mentionRangeEndingAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, -1);
	return link && link.to === pos ? { from: link.from, to: link.to } : null;
}

/** A mention token starting exactly at `pos` (cursor just before it — delete). */
export function mentionRangeStartingAt(state: EditorState, pos: number): { from: number; to: number } | null {
	const link = mentionLinkAt(state, pos, 1);
	return link && link.from === pos ? { from: link.from, to: link.to } : null;
}

/** Two-step mention delete: the first Backspace (`dir` -1) or Delete (1) next
 *  to a mention selects the whole token, the second removes it. False when
 *  there is a selection already or no mention at the caret, so the normal
 *  delete runs. */
export function selectMentionBeforeDelete(view: EditorView, dir: -1 | 1): boolean {
	const sel = view.state.selection.main;
	if (!sel.empty) return false;
	const range = dir < 0 ? mentionRangeEndingAt(view.state, sel.head) : mentionRangeStartingAt(view.state, sel.head);
	if (!range) return false;
	view.dispatch({ selection: { anchor: range.from, head: range.to } });
	return true;
}
