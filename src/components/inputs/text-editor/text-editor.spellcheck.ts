import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { Facet, Prec, RangeSetBuilder, type EditorState, type Extension } from '@codemirror/state';
import type { SyntaxNodeRef } from '@lezer/common';
import { MENTION_HREF_PREFIX } from './text-editor.mentions.js';

/* Spellchecking is on for the running text and off for what the editor knows
 * is not running text: code, the address of a link, a mention. CodeMirror turns
 * it off on the whole content; this turns it on there and marks those parts
 * `spellcheck="false"`, so a consumer does not rebuild the exceptions itself. */

/** Says whether a syntax node is left out of spellchecking, and with it all it
 *  contains. A plugin that renders something of its own adds a test here, so
 *  its syntax does not get a red underline in every consumer's editor. */
export const spellcheckExclusions = Facet.define<(node: SyntaxNodeRef, state: EditorState) => boolean>();

/** Code is quoted as it is, an address is not a word, and a mention is a name
 *  someone chose; none of it is the writer's spelling to correct. The text of
 *  a link is, so a link is checked except for its URL. */
const NOT_PROSE = new Set(['InlineCode', 'FencedCode', 'CodeBlock', 'URL', 'Autolink']);

function isMention(node: SyntaxNodeRef, state: EditorState): boolean {
	if (node.name !== 'Link') return false;
	const url = node.node.getChild('URL');
	return url !== null && state.sliceDoc(url.from, url.to).startsWith(MENTION_HREF_PREFIX);
}

const builtIn = spellcheckExclusions.of((node, state) => NOT_PROSE.has(node.name) || isMention(node, state));

const noSpellcheck = Decoration.mark({ attributes: { spellcheck: 'false' } });

function exclusions(view: EditorView): DecorationSet {
	const tests = view.state.facet(spellcheckExclusions);
	const builder = new RangeSetBuilder<Decoration>();
	const tree = syntaxTree(view.state);
	// A node can reach into the next visible range; it is marked once.
	let markedTo = -1;
	for (const { from, to } of view.visibleRanges) {
		tree.iterate({
			from,
			to,
			enter: (node) => {
				if (!tests.some((test) => test(node, view.state))) return;
				if (node.to > node.from && node.from >= markedTo) {
					builder.add(node.from, node.to, noSpellcheck);
					markedTo = node.to;
				}
				// Everything inside is left out with it.
				return false;
			},
		});
	}
	return builder.finish();
}

const exclusionMarks = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = exclusions(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged || syntaxTree(update.state) !== syntaxTree(update.startState)) {
				this.decorations = exclusions(update.view);
			}
		}
	},
	{ decorations: (plugin) => plugin.decorations },
);

/**
 * Deleting left to the browser wherever the editor has nothing to add.
 *
 * Every Backspace or Delete CodeMirror handles itself costs the spelling marks
 * on the line: it writes the line anew and the browser drops them until the
 * next word is typed, in every browser. Typing does not have this, because
 * CodeMirror lets the browser insert a letter and reads it back, and a deletion
 * the browser does keeps them too. It has to be every plain deletion: a single
 * space or a selection removed by CodeMirror is enough to lose them.
 *
 * CodeMirror keeps the key where it does more than delete text inside one text
 * node: a made-up event (which has no default action) or a modifier, more than
 * one cursor, a deletion that reaches past the text node the caret is in (a
 * line join, a widget or a mark boundary next to it, or a selection across
 * them), and the indentation at the start of a line, where it removes a whole
 * indent step. List and heading markup have their own bindings, which run first
 * and only take the key when they have something to do.
 *
 * A binding that claims the key makes CodeMirror prevent the default, so the
 * editor's Backspace and Delete bindings ask this and return false when it says
 * yes: with no binding taking the key, the browser deletes and CodeMirror reads
 * the change from the DOM.
 */
const nativeDeletion = Facet.define<boolean, boolean>({ combine: (values) => values.some(Boolean) });

/** The plain, real Backspace or Delete being handled, if it is one. An observer
 *  runs before the bindings and sees the event, which a binding does not. */
const plainDeletion = new WeakMap<EditorView, 'Backspace' | 'Delete' | null>();

const watchDeletion = EditorView.domEventObservers({
	keydown(event, view) {
		const plain = event.isTrusted && !event.isComposing && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;
		plainDeletion.set(view, plain && (event.key === 'Backspace' || event.key === 'Delete') ? event.key : null);
	},
});

/** The text node and offset at `pos`, or null when the DOM there is not text. */
function textAt(view: EditorView, pos: number): { node: Text; offset: number } | null {
	const { node, offset } = view.domAtPos(pos);
	return node.nodeType === Node.TEXT_NODE ? { node: node as Text, offset } : null;
}

export function leaveDeletionToBrowser(view: EditorView, key: 'Backspace' | 'Delete'): boolean {
	if (!view.state.facet(nativeDeletion) || plainDeletion.get(view) !== key) return false;
	const { selection, doc } = view.state;
	if (selection.ranges.length > 1) return false;
	const { from, to, empty } = selection.main;
	const line = doc.lineAt(from);
	// The indentation at the start of a line is the editor's, which removes a step.
	if (!/\S/.test(view.state.sliceDoc(line.from, from)) && !(key === 'Delete' && empty)) return false;
	const start = textAt(view, from);
	if (!start) return false;
	if (!empty) {
		// A selection inside one text node, with a character left before it.
		const end = textAt(view, to);
		return end !== null && end.node === start.node && start.offset >= 1;
	}
	// One character, with another one beside it in the same text node, so the
	// caret does not end up against a boundary.
	return key === 'Backspace'
		? start.offset >= 2
		: start.offset >= 1 && start.offset <= start.node.length - 2;
}

/** Spellchecking on the content, without the parts that are not running text. */
export function spellcheck(): Extension {
	return [
		EditorView.contentAttributes.of({ spellcheck: 'true' }),
		builtIn,
		// Outermost, so it wraps the editor's own marks on a URL instead of
		// cutting them in two.
		Prec.highest(exclusionMarks),
		nativeDeletion.of(true),
		watchDeletion,
	];
}
