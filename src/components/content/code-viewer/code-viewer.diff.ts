import { Decoration, EditorView, GutterMarker, WidgetType, gutter, gutterLineClass, type BlockInfo } from '@codemirror/view';
import { RangeSet, type Extension, type Range } from '@codemirror/state';
import { reportRule } from '../../../utilities/report-rule.js';

/* A unified diff, as git and every pull request tool hand it out, shown as the
 * code it changes: each line without its +, - or space, two columns with the
 * old and the new line number, a column with the sign, and a header between
 * hunks. The document holds only the code, so the grammar highlights it and a
 * selection copies code. The copy button copies the diff itself. */

export type DiffLineKind = 'added' | 'removed' | 'context';

export interface DiffLine {
	kind: DiffLineKind;
	text: string;
	oldNumber: number | null;
	newNumber: number | null;
	/** The `@@` header of the hunk this line opens, if it opens one. */
	hunk: string | null;
}

export interface ParsedDiff {
	/** The code: every line of the diff without its first character. */
	doc: string;
	lines: DiffLine[];
	added: number;
	removed: number;
}

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
const FILE_HEADER_RE = /^(diff |index |--- |\+\+\+ |new file|deleted file|similarity |rename |old mode|new mode)/;

/** Without `@@` headers every line is code, so file headers in front of it would
 *  read as a removed and an added line. They are taken off when they hold the
 *  `---` and `+++` pair that only a file header has; a code line that happens to
 *  start with `---` stays. */
function withoutLeadingFileHeader(source: string[]): string[] {
	let end = 0;
	while (end < source.length && FILE_HEADER_RE.test(source[end])) end++;
	const head = source.slice(0, end);
	const hasPair = head.some((line, i) => line.startsWith('--- ') && head[i + 1]?.startsWith('+++ '));
	return hasPair ? source.slice(end) : source;
}

/** Parse a unified diff. File headers (`diff --git`, `index`, `---`, `+++` and
 *  the like) are left out: the file name belongs to the page around the viewer.
 *  So is `\ No newline at end of file`. A hunk ends where its `@@` header says
 *  it does, so the headers of a next file in a multi-file diff are not taken for
 *  code; their name is lost, though, so give each file a viewer of its own.
 *  Without any `@@` header, every line after the file header is code and the
 *  numbers start at 1. */
export function parseUnifiedDiff(raw: string): ParsedDiff {
	const all = raw.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
	const hasHunks = all.some((line) => HUNK_RE.test(line));
	const source = hasHunks ? all : withoutLeadingFileHeader(all);
	const lines: DiffLine[] = [];
	let oldNumber = 1;
	let newNumber = 1;
	// Lines the current hunk still holds on each side; Infinity without headers.
	let oldLeft = hasHunks ? 0 : Infinity;
	let newLeft = hasHunks ? 0 : Infinity;
	let hunk: string | null = null;
	let added = 0;
	let removed = 0;
	// Lines past a hunk's counts that are not the header of a next file: a tool
	// that wrote the counts wrong loses them, which development should hear about.
	let seenHunk = false;
	let dropped = 0;
	for (const line of source) {
		const header = HUNK_RE.exec(line);
		if (header) {
			oldNumber = Number(header[1]);
			oldLeft = header[2] === undefined ? 1 : Number(header[2]);
			newNumber = Number(header[3]);
			newLeft = header[4] === undefined ? 1 : Number(header[4]);
			hunk = line;
			seenHunk = true;
			continue;
		}
		if (oldLeft <= 0 && newLeft <= 0) {
			if (seenHunk && line !== '' && !line.startsWith('\\') && !FILE_HEADER_RE.test(line)) dropped++;
			continue;
		}
		if (line.startsWith('\\')) continue;
		const sign = line[0];
		const text = line.slice(1);
		if (sign === '+') {
			lines.push({ kind: 'added', text, oldNumber: null, newNumber: newNumber++, hunk });
			newLeft--;
			added++;
		} else if (sign === '-') {
			lines.push({ kind: 'removed', text, oldNumber: oldNumber++, newNumber: null, hunk });
			oldLeft--;
			removed++;
		} else {
			// A space, or an empty line where a tool dropped the trailing space.
			lines.push({ kind: 'context', text, oldNumber: oldNumber++, newNumber: newNumber++, hunk });
			oldLeft--;
			newLeft--;
		}
		hunk = null;
	}
	if (dropped > 0 && import.meta.env?.DEV) {
		reportRule('code-viewer-diff-lines-dropped', undefined, `${dropped} line(s)`);
	}
	return { doc: lines.map((line) => line.text).join('\n'), lines, added, removed };
}

/** The removed and added lines that are one change: within a hunk, a run of
 *  removed lines directly followed by a run of added lines, paired in order.
 *  Indices are into `lines`. */
export function pairChangedLines(lines: DiffLine[]): Array<[number, number]> {
	const pairs: Array<[number, number]> = [];
	let i = 0;
	while (i < lines.length) {
		if (lines[i].kind !== 'removed') {
			i++;
			continue;
		}
		const removedFrom = i;
		while (i < lines.length && lines[i].kind === 'removed' && (i === removedFrom || !lines[i].hunk)) i++;
		const addedFrom = i;
		while (i < lines.length && lines[i].kind === 'added' && !lines[i].hunk) i++;
		for (let k = 0; k < Math.min(addedFrom - removedFrom, i - addedFrom); k++) {
			pairs.push([removedFrom + k, addedFrom + k]);
		}
	}
	return pairs;
}

export interface DiffLabels {
	addedLine(number: number): string;
	removedLine(number: number): string;
}

class NumberMarker extends GutterMarker {
	constructor(readonly text: string) {
		super();
	}

	override eq(other: NumberMarker): boolean {
		return other.text === this.text;
	}

	override toDOM(): Node {
		return document.createTextNode(this.text);
	}
}

class LineClassMarker extends GutterMarker {
	constructor(readonly className: string) {
		super();
		this.elementClass = className;
	}

	override eq(other: LineClassMarker): boolean {
		return other.className === this.className;
	}
}

/* What a screen reader says before a changed line: the gutters are hidden
 * from it, and a color says nothing. Not in the document, so not in a copy. */
class LineLabelWidget extends WidgetType {
	constructor(readonly text: string) {
		super();
	}

	override eq(other: LineLabelWidget): boolean {
		return other.text === this.text;
	}

	toDOM(): HTMLElement {
		const label = document.createElement('span');
		label.className = 'cm-diff-line-label';
		label.textContent = `${this.text}: `;
		return label;
	}
}

/* The `@@` header between hunks. A screen reader skips it: the label on each
 * changed line already says where it is. */
class HunkWidget extends WidgetType {
	constructor(readonly header: string) {
		super();
	}

	override eq(other: HunkWidget): boolean {
		return other.header === this.header;
	}

	toDOM(): HTMLElement {
		const row = document.createElement('div');
		row.className = 'cm-diff-hunk';
		row.setAttribute('aria-hidden', 'true');
		row.textContent = this.header;
		return row;
	}
}

const lineClass: Record<DiffLineKind, string> = {
	added: 'cm-diff-added',
	removed: 'cm-diff-removed',
	context: 'cm-diff-context',
};

const SIGN: Record<DiffLineKind, string> = { added: '+', removed: '−', context: '' };

/** Where each line starts in the document. */
function lineOffsets(lines: DiffLine[]): number[] {
	const starts: number[] = [];
	let pos = 0;
	for (const line of lines) {
		starts.push(pos);
		pos += line.text.length + 1;
	}
	return starts;
}

/** Line colors, gutters, hunk headers and line labels for a parsed diff. */
export function diffExtensions(parsed: ParsedDiff, labels: DiffLabels): Extension {
	const { lines } = parsed;
	if (lines.length === 0) return [];
	const lineStarts = lineOffsets(lines);

	const decorations: Range<Decoration>[] = [];
	const gutterClasses: Range<GutterMarker>[] = [];
	lines.forEach((line, i) => {
		const from = lineStarts[i];
		if (line.hunk) decorations.push(Decoration.widget({ widget: new HunkWidget(line.hunk), block: true, side: -1 }).range(from));
		decorations.push(Decoration.line({ class: lineClass[line.kind] }).range(from));
		if (line.kind === 'added') decorations.push(Decoration.widget({ widget: new LineLabelWidget(labels.addedLine(line.newNumber!)), side: -1 }).range(from));
		if (line.kind === 'removed') decorations.push(Decoration.widget({ widget: new LineLabelWidget(labels.removedLine(line.oldNumber!)), side: -1 }).range(from));
		gutterClasses.push(new LineClassMarker(lineClass[line.kind]).range(from));
	});

	const lineAt = (view: EditorView, block: BlockInfo): DiffLine | undefined => lines[view.state.doc.lineAt(block.from).number - 1];
	// A reduce, not Math.max(...): spreading a very long diff runs past the
	// engine's argument limit.
	const widest = (pick: (line: DiffLine) => number | null): string => String(lines.reduce((max, line) => Math.max(max, pick(line) ?? 0), 0));
	const numberGutter = (name: string, pick: (line: DiffLine) => number | null): Extension => gutter({
		class: `cm-diff-gutter cm-diff-${name}-gutter`,
		lineMarker: (view, block) => {
			const line = lineAt(view, block);
			const number = line ? pick(line) : null;
			return number === null ? null : new NumberMarker(String(number));
		},
		initialSpacer: () => new NumberMarker(widest(pick)),
	});

	return [
		EditorView.decorations.of(Decoration.set(decorations, true)),
		gutterLineClass.of(RangeSet.of(gutterClasses, true)),
		numberGutter('old', (line) => line.oldNumber),
		numberGutter('new', (line) => line.newNumber),
		gutter({
			class: 'cm-diff-gutter cm-diff-sign-gutter',
			lineMarker: (view, block) => {
				const line = lineAt(view, block);
				return line && line.kind !== 'context' ? new NumberMarker(SIGN[line.kind]) : null;
			},
			initialSpacer: () => new NumberMarker('+'),
		}),
	];
}

/** Above this share of a line changed, marking the words says less than
 *  marking none: the whole line is new. */
const WORD_MARK_LIMIT = 0.5;

const removedWord = Decoration.mark({ class: 'cm-diff-removed-word' });
const addedWord = Decoration.mark({ class: 'cm-diff-added-word' });

/** Marks on the words that differ between each paired removed and added line.
 *  Loads @codemirror/merge on first use, so a viewer without a diff never
 *  fetches it. */
export async function wordExtensions(parsed: ParsedDiff): Promise<Extension> {
	const pairs = pairChangedLines(parsed.lines);
	if (pairs.length === 0) return [];
	const { presentableDiff } = await import('@codemirror/merge');
	const lineStarts = lineOffsets(parsed.lines);
	const marks: Range<Decoration>[] = [];
	for (const [r, a] of pairs) {
		const before = parsed.lines[r].text;
		const after = parsed.lines[a].text;
		const changes = presentableDiff(before, after);
		if (changes.length === 0) continue;
		const changedBefore = changes.reduce((sum, c) => sum + c.toA - c.fromA, 0);
		const changedAfter = changes.reduce((sum, c) => sum + c.toB - c.fromB, 0);
		if (changedBefore + changedAfter > (before.length + after.length) * WORD_MARK_LIMIT) continue;
		for (const change of changes) {
			if (change.toA > change.fromA) marks.push(removedWord.range(lineStarts[r] + change.fromA, lineStarts[r] + change.toA));
			if (change.toB > change.fromB) marks.push(addedWord.range(lineStarts[a] + change.fromB, lineStarts[a] + change.toB));
		}
	}
	return marks.length ? EditorView.decorations.of(Decoration.set(marks, true)) : [];
}
