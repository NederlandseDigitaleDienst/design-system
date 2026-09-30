import {
	Decoration,
	ViewPlugin,
	WidgetType,
	type DecorationSet,
	type EditorView,
	type ViewUpdate,
} from '@codemirror/view';
import { RangeSetBuilder, type EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { MENTION_HREF_PREFIX } from './text-editor.mentions.js';
import { enclosingNode } from './text-editor.syntax.js';
import { textCaretBox } from './text-editor.caret.js';
import '../../content/icon/icon.js';

/* Render a small "open in new tab" badge right after every real (non-mention)
 * link, so a link can be followed without leaving the editor — directly clickable,
 * no need to place the caret first. Mentions own their own click, so they're skipped. */

/** Builds the badge's accessible label from a link's destination. Supplied by the
 *  host so the string is localizable; defaults to Dutch at the call site. */
export type OpenInNewTabLabel = (url: string) => string;

class LinkOpenWidget extends WidgetType {
	constructor(readonly href: string, readonly label: OpenInNewTabLabel) {
		super();
	}

	eq(other: LinkOpenWidget): boolean {
		return other.href === this.href;
	}

	toDOM(): HTMLElement {
		const anchor = document.createElement('a');
		anchor.className = 'cm-link-badge';
		anchor.href = this.href;
		anchor.target = '_blank';
		anchor.rel = 'noopener noreferrer';
		anchor.setAttribute('aria-label', this.label(this.href));
		const icon = document.createElement('nldd-icon');
		icon.setAttribute('icon', 'external-link');
		icon.setAttribute('aria-hidden', 'true');
		anchor.append(icon);
		// The editor steals mousedown to place the caret; keep the click ours.
		anchor.addEventListener('mousedown', (event) => event.preventDefault());
		return anchor;
	}

	ignoreEvent(): boolean {
		return true; // let the anchor handle its own click
	}

	/** The caret at the link's end has two places to be, and `side` says which: on
	 *  the link's side of the badge, or after the badge. Both at text height, not
	 *  the badge's own box (taller, and it would flip with the arrival direction).
	 *  The cursor layer treats the badge as a character with a stop on either
	 *  side, whether the link is a bare URL (text typed on the link's side extends
	 *  it) or a `[text](url)` link (text typed there lands after the link, and
	 *  so after its badge). Ignoring `side` drew both after the badge, so deleting
	 *  the last character of a URL looked like editing outside it. */
	coordsAt(dom: HTMLElement, _pos: number, side: number): { left: number; right: number; top: number; bottom: number } | null {
		const badge = dom.getBoundingClientRect();
		const box = textCaretBox(dom) ?? { top: badge.top, bottom: badge.bottom };
		const cs = getComputedStyle(dom);
		const x = side < 0 ? badge.left - parseFloat(cs.marginLeft) : badge.right + parseFloat(cs.marginRight);
		return { left: x, right: x, top: box.top, bottom: box.bottom };
	}
}

/** Normalize a Markdown reference label for matching: drop the surrounding
 *  brackets, collapse internal whitespace and lowercase (labels are
 *  case-insensitive per CommonMark). */
function normaliseLabel(raw: string): string {
	return raw.replace(/^\[|\]$/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Map of reference label → URL, from every link reference definition
 *  (`[ref]: https://…`) in the doc, so reference-style links can resolve their
 *  destination. Definitions usually sit at the bottom, so this scans the whole
 *  tree, not just the viewport. */
function referenceDefs(state: EditorState): Map<string, string> {
	const defs = new Map<string, string>();
	syntaxTree(state).iterate({
		enter: (node) => {
			if (node.name !== 'LinkReference') return;
			let label: string | null = null;
			let url: string | null = null;
			for (let c = node.node.firstChild; c; c = c.nextSibling) {
				if (c.name === 'LinkLabel') label = normaliseLabel(state.sliceDoc(c.from, c.to));
				else if (c.name === 'URL') url = state.sliceDoc(c.from, c.to);
			}
			if (label && url && !defs.has(label)) defs.set(label, url);
		},
	});
	return defs;
}

/** Only follow schemes that are safe to put in a clickable anchor. The editor's
 *  value is consumer/document-supplied Markdown, so a `[text](javascript:…)` (or
 *  `data:` / `vbscript:`) link must never become a real, clickable badge —
 *  `target="_blank"` does NOT neutralise those; they execute in the current
 *  document. A URL with no scheme (relative, `#anchor`, `?query`, `//host`) just
 *  navigates, so it is allowed; a schemed URL must be http(s)/mailto/tel. */
export function isSafeHref(href: string): boolean {
	// Read the scheme through the SAME normalisation the URL parser applies, or a
	// disguised scheme slips through as "relative": the parser strips leading C0
	// controls + space and removes tab/newline/CR anywhere, so `javascript:`
	// and `java\tscript:` both resolve to `javascript:` even though the raw string
	// fails the scheme regex. Drop every control/space char before testing (only for
	// the safety decision — the real href is untouched); a scheme that survives must
	// be in the allowlist.
	// eslint-disable-next-line no-control-regex -- matching control chars is the point: they are the bypass vectors the URL parser strips before resolving the scheme.
	const normalized = href.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
	if (!/^[a-z][a-z0-9+.-]*:/i.test(normalized)) return true; // no scheme → relative, safe
	return /^(?:https?|mailto|tel):/i.test(normalized);
}

/** The link's destination, or null for a mention, an unsafe scheme, or a link
 *  without a resolvable URL. Handles both inline links (`[text](url)`) and
 *  reference-style links (`[text][ref]`), resolving the latter against `refs`. */
function hrefOf(state: EditorState, link: SyntaxNode, refs: Map<string, string>): string | null {
	let label: string | null = null;
	for (let child = link.firstChild; child; child = child.nextSibling) {
		if (child.name === 'URL') {
			const href = state.sliceDoc(child.from, child.to);
			return href && !href.startsWith(MENTION_HREF_PREFIX) && isSafeHref(href) ? href : null;
		}
		if (child.name === 'LinkLabel') label = normaliseLabel(state.sliceDoc(child.from, child.to));
	}
	if (label) {
		const href = refs.get(label);
		return href && !href.startsWith(MENTION_HREF_PREFIX) && isSafeHref(href) ? href : null;
	}
	return null;
}

/** True when a URL node is the destination of a Markdown construct rather than a
 *  bare autolink in prose: an inline/reference link (`[text](url)` / `[ref]: url`)
 *  or an image (`![alt](url)`). Those URLs must not get a second badge — the link
 *  is already badged via its `Link` node, and a definition or image source is not
 *  a link to follow. Skipping them also keeps the badge ranges in document order
 *  for the RangeSetBuilder (a child URL's end precedes its container's end). */
export function inLinkContext(node: SyntaxNode): boolean {
	for (let p = node.parent; p; p = p.parent) {
		if (p.name === 'Link' || p.name === 'LinkReference' || p.name === 'Image') return true;
	}
	return false;
}

/** Href for a bare/autolinked URL node (GFM autolink): the sliced text, with a
 *  scheme added for GFM's scheme-less forms (`www.…` → https, `a@b.c` → mailto).
 *  Rejects mentions and unsafe schemes, mirroring the Markdown-link path. */
function bareHref(state: EditorState, node: SyntaxNode): string | null {
	const raw = state.sliceDoc(node.from, node.to);
	if (!raw || raw.startsWith(MENTION_HREF_PREFIX)) return null;
	let href = raw;
	// An already-schemed URL (https://, mailto:, …) is taken as-is; only GFM's
	// scheme-less autolink forms need one added.
	if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
		if (/^www\./i.test(raw)) href = `https://${raw}`;            // GFM www autolink
		else if (/^[^\s@]+@[^\s@]+$/.test(raw)) href = `mailto:${raw}`; // GFM email autolink
	}
	return isSafeHref(href) ? href : null;
}

function buildBadges(view: EditorView, label: OpenInNewTabLabel): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	const tree = syntaxTree(view.state);
	const refs = referenceDefs(view.state);
	// side -1 draws the badge before the caret, so the caret at the link end sits
	// to the RIGHT of the badge — text typed there lands after it, not wedged
	// between the link and the badge.
	const badge = (to: number, href: string): void =>
		builder.add(to, to, Decoration.widget({ widget: new LinkOpenWidget(href, label), side: -1 }));
	for (const { from, to } of view.visibleRanges) {
		tree.iterate({
			from,
			to,
			enter: (node) => {
				if (node.name === 'Link') {
					const href = hrefOf(view.state, node.node, refs);
					if (href) badge(node.to, href);
					return;
				}
				// Bare/autolinked URL: a standalone URL node (GFM turns a plainly
				// pasted https/www/email into one), i.e. not the destination inside a
				// [text](url) link — that URL is already handled via its Link above.
				if (node.name === 'URL' && !inLinkContext(node.node)) {
					const href = bareHref(view.state, node.node);
					if (href) badge(node.to, href);
				}
			},
		});
	}
	return builder.finish();
}

/** Adds an "open link" badge after every real link in the viewport. `label` builds
 *  the badge's accessible label from the destination, so the host can localize it. */
export function linkOpenBadge(label: OpenInNewTabLabel): ViewPlugin<{ decorations: DecorationSet }> {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildBadges(view, label);
			}

			update(update: ViewUpdate): void {
				if (update.docChanged || update.viewportChanged) this.decorations = buildBadges(update.view, label);
			}
		},
		{ decorations: (plugin) => plugin.decorations }
	);
}

/** Whether a link with a badge ends at `pos`: a `[text](url)` link or a bare
 *  URL, with a destination the badge accepts. The same tests as `buildBadges`,
 *  so a mention (a link too, but without a badge) is not one. */
export function linkEndsAt(state: EditorState, pos: number): boolean {
	let refs: Map<string, string> | null = null;
	return enclosingNode(state, pos, -1, (node) => {
		if (node.to !== pos) return false;
		if (node.name === 'Link') return hrefOf(state, node, (refs ??= referenceDefs(state))) !== null;
		return node.name === 'URL' && !inLinkContext(node) && bareHref(state, node) !== null;
	}) !== null;
}

/** Whether a bare URL with a badge ends at `pos`: the link that text typed at
 *  its end extends, unlike a `[text](url)` link, which ends at its `)`. */
export function bareUrlEndsAt(state: EditorState, pos: number): boolean {
	return enclosingNode(
		state,
		pos,
		-1,
		(node) => node.name === 'URL' && node.to === pos && !inLinkContext(node) && bareHref(state, node) !== null,
	) !== null;
}
