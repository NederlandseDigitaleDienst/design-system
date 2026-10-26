import { syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import type { SyntaxNode } from '@lezer/common';

/* One question the editor asks the markdown tree everywhere: what is the caret
 * standing in? Is it a link, a code block, an emphasis, a mention. The answer is
 * always the same walk, from the innermost node at the position outward to the
 * root, and it used to be written out at every call site. */

/** The innermost node at `pos` that `match` accepts, looking outward from there.
 *  `side` decides which node a position between two of them belongs to: -1 the
 *  one that ends there, 1 the one that starts there. Null when none matches. */
export function enclosingNode(
	state: EditorState,
	pos: number,
	side: -1 | 0 | 1,
	match: (node: SyntaxNode) => boolean,
): SyntaxNode | null {
	for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, side); node; node = node.parent) {
		if (match(node)) return node;
	}
	return null;
}

/** The nodes whose text is code, quoted as it is: no list, quote or link in it. */
export const CODE_BLOCK_NODES: ReadonlySet<string> = new Set(['FencedCode', 'CodeBlock']);
export const CODE_NODES: ReadonlySet<string> = new Set([...CODE_BLOCK_NODES, 'InlineCode']);

/** Whether `pos` sits in a fenced or indented code block, where a leading `-`,
 *  `1.` or `>` is literal code. */
export function inCodeBlock(state: EditorState, pos: number): boolean {
	return enclosingNamed(state, pos, 1, CODE_BLOCK_NODES) !== null;
}

/** Whether `pos` sits in any code, the backtick span included. */
export function inCode(state: EditorState, pos: number): boolean {
	return enclosingNamed(state, pos, 1, CODE_NODES) !== null;
}

/** Call `each` with the start of every line from `from` to `to`. */
export function forEachLineStart(state: EditorState, from: number, to: number, each: (lineFrom: number) => void): void {
	for (let pos = from; pos <= to; ) {
		const line = state.doc.lineAt(pos);
		each(line.from);
		pos = line.to + 1;
	}
}

/** Whether the parse moved on between two states. The tree is parsed in the
 *  background, so a decoration built from it must be built again when it has
 *  caught up, not only when the text, the viewport or the selection changes. */
export function treeAdvanced(before: EditorState, after: EditorState): boolean {
	return syntaxTree(before) !== syntaxTree(after);
}

/** Whether the line at `lineFrom` is a thematic break (`---`, `* * *`). Its
 *  characters look like a bullet to a regular expression; to the tree they are not. */
export function isRuleLine(state: EditorState, lineFrom: number): boolean {
	return enclosingNamed(state, lineFrom, 1, 'HorizontalRule') !== null;
}

/** `enclosingNode` for the common case: a node that goes by one of these names. */
export function enclosingNamed(
	state: EditorState,
	pos: number,
	side: -1 | 0 | 1,
	names: string | ReadonlySet<string>,
): SyntaxNode | null {
	return enclosingNode(state, pos, side, typeof names === 'string' ? (node) => node.name === names : (node) => names.has(node.name));
}

/** The text of a `[text](url)` link, between its brackets; null when it is empty. */
export function linkTextRange(link: SyntaxNode): { from: number; to: number } | null {
	const marks: SyntaxNode[] = [];
	for (let child = link.firstChild; child; child = child.nextSibling) {
		if (child.name === 'LinkMark') marks.push(child);
	}
	if (marks.length < 2) return null;
	const from = marks[0].to; // after the opening '['
	const to = marks[1].from; // before the closing ']'
	return to > from ? { from, to } : null;
}
