import {
	autocompletion,
	completionStatus,
	startCompletion,
	type Completion,
	type CompletionContext,
	type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorView, tooltips, type Rect } from '@codemirror/view';
import type { EditorState, Extension } from '@codemirror/state';
import { enclosingNamed } from './text-editor.syntax.js';
import '../../content/avatar/avatar.js';
import '../../content/icon/icon.js';

/* Typeaheads: a trigger character opens a list of candidates the consumer
 * supplies, and choosing one writes something in place of the trigger and the
 * query. The editor is headless and knows no users, channels or emoji; it owns
 * the interaction (the popup, the keys, the accessibility) and the consumer
 * owns the data and, if it wants, what gets inserted (#200, #204).
 *
 * The @-mention is the built-in one: it inserts a markdown-compatible token
 * that degrades to a plain link outside the editor, and the token rendering
 * lives in the markdown decoration layer. */

/** The query being typed: a trigger at the start of the line or after
 *  whitespace, followed by name characters, up to the caret. Anchored that way
 *  so a trigger inside a word (an e-mail address, `piet@sam`) stays a plain
 *  character. The name class is ASCII for now; widening it changes what a
 *  source receives and is its own change. */
const queryPatterns = new Map<string, RegExp>();
function queryPattern(triggers: readonly string[]): RegExp | null {
	const chars = Array.from(new Set(triggers.filter((t) => t.length === 1 && !/[\s\w]/.test(t)))).sort().join('');
	if (!chars) return null;
	let pattern = queryPatterns.get(chars);
	if (!pattern) {
		pattern = new RegExp(`(^|\\s)([${chars.replace(/[\\\]^-]/g, '\\$&')}])([\\w.-]*)$`);
		queryPatterns.set(chars, pattern);
	}
	return pattern;
}

/** Code is quoted verbatim, so a trigger in a fenced block, an indented block
 *  or a backtick span is not a typeahead and must not open the list. */
const CODE_NODES = new Set(['FencedCode', 'CodeBlock', 'InlineCode']);

function inCode(state: EditorState, pos: number): boolean {
	return enclosingNamed(state, pos, 1, CODE_NODES) !== null;
}

/** The typeahead query at `pos` for one of `triggers`, or null when the text
 *  before the caret is not one. `from` is the trigger, `query` the typed text
 *  without it. Both the completion source and the reopen-on-delete path go
 *  through this, so they cannot disagree about what counts as a query. */
export function typeaheadQueryAt(
	state: EditorState,
	pos: number,
	triggers: readonly string[],
): { from: number; to: number; query: string; trigger: string } | null {
	const pattern = queryPattern(triggers);
	if (!pattern) return null;
	const line = state.doc.lineAt(pos);
	const match = pattern.exec(state.sliceDoc(line.from, pos));
	if (!match) return null;
	const from = line.from + match.index + match[1].length;
	if (inCode(state, from)) return null;
	return { from, to: pos, query: match[3], trigger: match[2] };
}

export interface TypeaheadCandidate {
	/** Stable id: stored in the mention token, handed back when chosen. */
	id: string;
	/** Shown in the row after the trigger, and written after the `@` of a mention. */
	text: string;
	/** Secondary text (a role, an e-mail address, a channel's purpose): beside the
	 *  text on a row of one line, under it on a row with an avatar. The word the
	 *  button and the title cell use for the same thing. */
	supportingText?: string;
	/** The name of a DS icon, or one of its aliases, in front of the text (a channel, a category). */
	icon?: string;
	/** A character or emoji in front of the text, in the row's own font: the
	 *  thing itself, for a list where that is its best picture. */
	symbol?: string;
	/** A person or organization in front of the text: an image, or initials
	 *  from the text when there is none. `avatar: {}` is enough for initials.
	 *  The row then takes two lines, with the supporting text under the text. */
	avatar?: { src?: string; type?: 'person' | 'organization' };
}

/** The candidates for what was typed after the trigger. The source filters;
 *  the editor shows what it gets, in that order. */
export type TypeaheadSource = (query: string) => TypeaheadCandidate[] | Promise<TypeaheadCandidate[]>;

export interface Typeahead {
	/** One character that opens the list at a line start or after whitespace:
	 *  `#`, `:`, `/`. Not a letter, digit or whitespace. */
	trigger: string;
	source: TypeaheadSource;
	/** What choosing a candidate writes in place of the trigger and the query.
	 *  Without it: the trigger, the text and a space, so `#kanaal ` stays what
	 *  was typed. Return the symbol for an emoji, or `@username ` for a system
	 *  that wants a plain mention. */
	insert?: (candidate: TypeaheadCandidate) => string;
}

/** Kept under their old names for the built-in @-mention. */
export type MentionCandidate = TypeaheadCandidate;
export type MentionSource = TypeaheadSource;

export interface MentionInsertedDetail {
	id: string;
	text: string;
	from: number;
	to: number;
}

/** What the `nldd-text-editor-typeahead` event carries: which list, which
 *  candidate, and where the inserted text sits (clean offsets, like
 *  `getSelection()`). */
export interface TypeaheadChosenDetail {
	trigger: string;
	candidate: TypeaheadCandidate;
	from: number;
	to: number;
}

/** A choice as the extension reports it, in document offsets; the editor turns
 *  it into its events. */
export interface TypeaheadChoice {
	typeahead: Typeahead;
	trigger: string;
	candidate: TypeaheadCandidate;
	from: number;
	to: number;
}

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

function defaultInsert(trigger: string): (candidate: TypeaheadCandidate) => string {
	return (candidate) => `${trigger}${candidate.text} `;
}

interface CandidateCompletion extends Completion {
	candidate: TypeaheadCandidate;
}

/** The avatar, icon or symbol in front of a row, or nothing. A decorative
 *  avatar: the name stands beside it as the row's text. The icon is the size of
 *  a menu item's, and the symbol takes the same box, so a list that mixes them
 *  lines up. */
function renderLead(completion: Completion): Node | null {
	const { candidate } = completion as CandidateCompletion;
	if (candidate.avatar) {
		const avatar = document.createElement('nldd-avatar');
		avatar.setAttribute('name', candidate.text);
		avatar.setAttribute('size', '32');
		avatar.setAttribute('decorative', '');
		if (candidate.avatar.src) avatar.setAttribute('src', candidate.avatar.src);
		if (candidate.avatar.type) avatar.setAttribute('type', candidate.avatar.type);
		return avatar;
	}
	if (candidate.icon) {
		const icon = document.createElement('nldd-icon');
		icon.setAttribute('name', candidate.icon);
		icon.setAttribute('size', '20');
		icon.setAttribute('aria-hidden', 'true');
		return icon;
	}
	if (candidate.symbol) {
		const symbol = document.createElement('span');
		symbol.className = 'cm-nldd-symbol';
		symbol.textContent = candidate.symbol;
		symbol.setAttribute('aria-hidden', 'true');
		return symbol;
	}
	return null;
}

/** A row with an avatar takes two lines: the text above, the supporting text
 *  under it, like a title cell. */
function rowClass(completion: Completion): string {
	return (completion as CandidateCompletion).candidate.avatar ? 'cm-nldd-row-avatar' : '';
}

function completionSource(
	getTypeaheads: () => readonly Typeahead[],
	onChoose: (choice: TypeaheadChoice) => void,
) {
	return async (context: CompletionContext): Promise<CompletionResult | null> => {
		const lists = getTypeaheads();
		const match = typeaheadQueryAt(context.state, context.pos, lists.map((t) => t.trigger));
		if (!match) return null;
		// Every list on this trigger contributes, in the order they were given.
		const onTrigger = lists.filter((t) => t.trigger === match.trigger);
		const results = await Promise.all(onTrigger.map((t) => t.source(match.query)));
		const options: CandidateCompletion[] = [];
		results.forEach((candidates, index) => {
			const typeahead = onTrigger[index];
			const insert = typeahead.insert ?? defaultInsert(match.trigger);
			for (const candidate of candidates ?? []) {
				options.push({
					label: `${match.trigger}${candidate.text}`,
					detail: candidate.supportingText,
					candidate,
					apply: (view, _completion, from, to) => {
						const text = insert(candidate);
						view.dispatch({
							changes: { from, to, insert: text },
							selection: { anchor: from + text.length },
							userEvent: 'input.complete',
						});
						onChoose({ typeahead, trigger: match.trigger, candidate, from, to: from + text.length });
					},
				});
			}
		});
		if (!options.length) return null;
		return {
			from: match.from,
			// The sources already filtered against the query.
			filter: false,
			options,
		};
	};
}

/**
 * The box the popup has to stay inside: every ancestor that hides its overflow,
 * through the shadow boundaries, within the window.
 *
 * CodeMirror measures against the window, and an editor in an nldd-sheet or an
 * nldd-modal-dialog sits in a box far smaller than that. It saw room that was
 * not there, left the list where it was, and the overlay cut it off at its edge.
 *
 * Follows the flattened tree, the way the layout does: an editor handed to an
 * overlay is a child of the host in the DOM, but it is laid out, and clipped,
 * where its slot sits.
 */
function clippingSpace(view: EditorView): Rect {
	const win = view.dom.ownerDocument.defaultView ?? window;
	let space: Rect = { left: 0, top: 0, right: win.innerWidth, bottom: win.innerHeight };

	for (let node: Node | null = view.dom.parentNode; node; ) {
		if (node instanceof ShadowRoot) {
			node = node.host;
			continue;
		}
		if (!(node instanceof Element)) break;

		const style = win.getComputedStyle(node);
		if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
			// The content box, not the border box it clips at: a list that ends
			// exactly on the edge of a dialog reads as cut off, and this lines it
			// up with the text inside.
			const rect = node.getBoundingClientRect();
			const inset = (side: 'Left' | 'Top' | 'Right' | 'Bottom') =>
				parseFloat(style[`border${side}Width`]) + parseFloat(style[`padding${side}`]);
			space = {
				left: Math.max(space.left, rect.left + inset('Left')),
				top: Math.max(space.top, rect.top + inset('Top')),
				right: Math.min(space.right, rect.right - inset('Right')),
				bottom: Math.min(space.bottom, rect.bottom - inset('Bottom')),
			};
		}
		node = node.assignedSlot ?? node.parentNode;
	}

	return space;
}

/* CodeMirror places a tooltip with `position: fixed`, against the viewport. An
 * ancestor with a transform becomes the containing block for that, and then the
 * popup counts the ancestor's offset twice and lands beside the page: an
 * nldd-modal-dialog keeps the identity transform its opening animation ends on,
 * and a consumer's own container may carry one. Measured against the editor
 * instead, the popup follows the editor wherever it sits. */
const popupPosition = tooltips({ position: 'absolute', tooltipSpace: clippingSpace });

// The suggestion popup styled to match nldd-menu.
const popupTheme = EditorView.theme({
	'.cm-tooltip.cm-tooltip-autocomplete': {
		// CodeMirror gives every tooltip a hairline of its own; an nldd-menu has
		// none and leans on its shadow, so this one drops it too.
		border: 'none',
		// No radius on the menu itself, like nldd-menu (overlays-corner-radius).
		borderRadius: 'var(--semantics-overlays-corner-radius)',
		backgroundColor: 'var(--semantics-surfaces-base-background-color)',
		boxShadow: 'var(--components-menu-box-shadow)',
	},
	// Match CM's own specificity (.cm-tooltip.cm-tooltip-autocomplete) so the
	// body font wins over its monospace default — names read better in sans.
	'.cm-tooltip.cm-tooltip-autocomplete > ul': {
		fontFamily: 'var(--primitives-font-family-body)',
		// Match the editor body (and the inserted token), not a smaller popup size.
		fontSize: 'var(--primitives-font-size-100)',
		// The minimum of nldd-menu, so a short list of names is not a narrow strip
		// that changes width as you type.
		minWidth: 'var(--primitives-area-280)',
		boxSizing: 'border-box',
		maxHeight: '14em',
		// A small inset around the items, like nldd-menu.
		margin: '0',
		padding: 'var(--primitives-space-8)',
	},
	// The .cm-tooltip prefix matches CodeMirror's own specificity so these win
	// over its cramped defaults (1px 3px padding, pointer cursor).
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
		display: 'flex',
		alignItems: 'center',
		gap: 'var(--primitives-space-8)',
		// At least control size sm tall; bumped to md on touch (below).
		minHeight: 'var(--semantics-controls-sm-min-size)',
		boxSizing: 'border-box',
		// Space left and right, like a menu item.
		padding: 'var(--primitives-space-4) var(--primitives-space-8)',
		borderRadius: 'var(--semantics-controls-sm-corner-radius)',
		color: 'var(--semantics-content-color)',
		cursor: 'default',
	},
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li > :is(nldd-avatar, nldd-icon, .cm-nldd-symbol)': {
		flex: 'none',
	},
	// The symbol takes the icon's box, so a list that mixes them lines up.
	'.cm-nldd-symbol': {
		display: 'inline-flex',
		justifyContent: 'center',
		inlineSize: '20px',
	},
	// Two lines next to the avatar: the text, and the supporting text under it.
	// The avatar spans both and sits centered on them.
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li.cm-nldd-row-avatar': {
		display: 'grid',
		gridTemplateColumns: 'auto minmax(0, 1fr)',
		alignContent: 'center',
		// The row's gap is for the columns; the two lines sit right on each other.
		rowGap: '0',
		minHeight: 'var(--semantics-controls-md-min-size)',
	},
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li.cm-nldd-row-avatar > nldd-avatar': {
		gridRow: 'span 2',
		alignSelf: 'center',
	},
	// Tight line heights on both lines, like a title cell: with the editor's own
	// loose line height the row grows well past a list row.
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li.cm-nldd-row-avatar > .cm-completionLabel': {
		gridColumn: '2',
		font: 'var(--primitives-font-body-md-regular-tight)',
	},
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li.cm-nldd-row-avatar > .cm-completionDetail': {
		gridColumn: '2',
		marginLeft: '0',
		font: 'var(--primitives-font-body-sm-regular-tight)',
	},
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
		backgroundColor: 'var(--components-menu-item-is-highlighted-background-color)',
		color: 'var(--components-menu-item-is-highlighted-content-color)',
	},
	// CodeMirror keeps the keyboard-selected option active on hover (Enter still
	// applies that one), so hover can't share the accent 'highlighted' look —
	// that would imply two active rows. Give hover a subtler nldd-list-item look,
	// only on rows that aren't the keyboard selection.
	'@media (hover: hover)': {
		'.cm-tooltip.cm-tooltip-autocomplete > ul > li:not([aria-selected]):hover': {
			backgroundColor: 'var(--components-list-item-is-hovered-background-color)',
			color: 'var(--components-list-item-is-hovered-content-color)',
		},
	},
	'.cm-completionDetail': {
		marginLeft: 'auto',
		color: 'var(--semantics-content-secondary-color)',
		fontStyle: 'normal',
	},
	'.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail': {
		color: 'inherit',
	},
	// Larger touch targets on coarse pointers (control size md height).
	'@media (pointer: coarse)': {
		'.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
			minHeight: 'var(--semantics-controls-md-min-size)',
		},
	},
});

/**
 * The typeaheads. `getTypeaheads` is read on every keystroke, so the editor can
 * hand over its current lists; choosing a candidate writes what the list's
 * `insert` says and calls `onChoose`. Without lists it is inert.
 */
export function typeaheads(
	getTypeaheads: () => readonly Typeahead[],
	onChoose: (choice: TypeaheadChoice) => void,
): Extension {
	// CodeMirror only opens completion while typing, not on deletion. When a
	// backspace brings the query back into a matching state ("@anb" → "@an"),
	// re-open the popup right away instead of waiting for the next character.
	const reopenOnDelete = EditorView.updateListener.of((update) => {
		if (!update.docChanged || completionStatus(update.state) !== null) return;
		if (!update.transactions.some((tr) => tr.isUserEvent('delete'))) return;
		const triggers = getTypeaheads().map((t) => t.trigger);
		if (typeaheadQueryAt(update.state, update.state.selection.main.head, triggers)) startCompletion(update.view);
	});
	return [
		popupPosition,
		autocompletion({
			override: [completionSource(getTypeaheads, onChoose)],
			icons: false,
			// Before the row's text (50): its avatar, icon or symbol.
			addToOptions: [{ position: 20, render: renderLead }],
			optionClass: rowClass,
		}),
		reopenOnDelete,
		popupTheme,
	];
}
