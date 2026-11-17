import { LitElement } from 'lit';
import { EditorView } from '@codemirror/view';
import { EditorState, Transaction, type Compartment, type Extension } from '@codemirror/state';

/**
 * Shared base for design-system editors built on CodeMirror 6
 * (nldd-code-editor, nldd-code-viewer, nldd-text-editor).
 *
 * It owns the EditorView lifecycle, mounts the view inside the component's
 * shadow root (so CodeMirror's generated styles and selection stay scoped),
 * and offers small helpers for document and compartment updates. Subclasses
 * provide the parent element and the extension set; everything component
 * specific (form association, public attributes, events) lives there.
 */
/** The one range that differs between two texts: what `before` loses from
 *  `from` to `to`, and what takes its place. Null when they are the same. */
export function minimalChange(before: string, after: string): { from: number; to: number; insert: string } | null {
	if (before === after) return null;
	const max = Math.min(before.length, after.length);
	let start = 0;
	while (start < max && before.charCodeAt(start) === after.charCodeAt(start)) start++;
	let end = 0;
	while (end < max - start && before.charCodeAt(before.length - 1 - end) === after.charCodeAt(after.length - 1 - end)) end++;
	return { from: start, to: before.length - end, insert: after.slice(start, after.length - end) };
}

export abstract class NLDDCodeMirrorElement extends LitElement {
	protected view?: EditorView;

	/** True once the view has been mounted at least once — drives re-mount on reconnect. */
	private _hasMounted = false;

	/** Document captured on disconnect so a re-mount restores the live content. */
	private _preservedDoc?: string;

	/** The shadow-DOM element the EditorView mounts into. */
	protected abstract getEditorParent(): HTMLElement | null | undefined;

	/** The full extension set for the initial EditorState. */
	protected abstract buildExtensions(): Extension[];

	/** Current document text, or '' before the view exists. */
	protected get doc(): string {
		return this.view ? this.view.state.doc.toString() : '';
	}

	protected mountEditor(initialDoc: string): void {
		const parent = this.getEditorParent();
		if (!parent || this.view) return;
		this.view = new EditorView({
			state: EditorState.create({ doc: initialDoc, extensions: this.buildExtensions() }),
			parent,
			// Mount in the shadow root so getSelection()/focus stay scoped and
			// CodeMirror's StyleModule injects into this root, not the document.
			root: this.shadowRoot ?? undefined,
		});
		this._hasMounted = true;

		// CodeMirror builds its DOM after the render that made room for it, so
		// anything that points at .cm-content ran too early. Ask for one more
		// update now that it is there, or the description and aria-invalid land
		// nowhere and stay there.
		this.requestUpdate();
	}

	/**
	 * Per-mount setup hook, called right after the view is created — on the
	 * initial mount (from the subclass `firstUpdated`) and on every re-mount
	 * after a detach/reattach. Subclasses (re)attach observers, DOM listeners
	 * and language grammars here so they survive being moved in the DOM.
	 * Default: no-op.
	 */
	protected onEditorMounted(): void {}

	/**
	 * The document to seed the view with on a re-mount after a detach/reattach.
	 * Defaults to the document captured on disconnect — correct for editors,
	 * whose live view is the source of truth. A subclass whose source of truth
	 * lives elsewhere (e.g. the viewer, backed by its slot) overrides this to
	 * return that live text so a reattach with changed content isn't stale.
	 */
	protected getRemountDoc(): string {
		return this._preservedDoc ?? '';
	}

	protected destroyEditor(): void {
		this.view?.destroy();
		this.view = undefined;
	}

	/** Bring the document to `text` (used by the `value` property setter). Only the
	 *  range that differs changes, so the selection maps through, and the change
	 *  stays out of the undo history: it is not the user's to undo. Marked as
	 *  remote, so nothing treats it as an edit to answer (the list renumbering in
	 *  nldd-text-editor). */
	protected setDoc(text: string): void {
		const view = this.view;
		const change = view && minimalChange(view.state.doc.toString(), text);
		if (!view || !change) return;
		view.dispatch({ changes: change, annotations: [Transaction.remote.of(true), Transaction.addToHistory.of(false)] });
	}

	/** Swap a single compartment at runtime (language, readonly, wrap, …). */
	protected reconfigure(compartment: Compartment, extension: Extension): void {
		this.view?.dispatch({ effects: compartment.reconfigure(extension) });
	}

	/**
	 * Focus the editor itself, not the host. delegatesFocus handles a click or tab
	 * into the host, but a programmatic host.focus() is routed straight to
	 * CodeMirror here, whose contenteditable delegatesFocus does not reliably
	 * target.
	 */
	override focus(): void {
		this.view?.focus();
	}

	/**
	 * Focus the editor and place the caret on the line nearest a viewport point.
	 * Lets a wrapping composition forward clicks from its own padding —
	 * `editor.focusFromPoint(event.clientX, event.clientY)` — so a layout
	 * container can own the surrounding space without the editor knowing about
	 * it. No-op on a non-editable view.
	 */
	focusFromPoint(x: number, y: number): void {
		const view = this.view;
		if (!view) return;
		// No caret to move on a read-only/disabled view — a direct call is a
		// genuine no-op (matches this comment; also covers the read-only viewer
		// and text-editor). Callers that forward padding clicks already guard on
		// state.readOnly, but a bare focusFromPoint() must not move the caret.
		if (view.state.readOnly) return;
		const pos = view.posAtCoords({ x, y }, false) ?? view.state.doc.length;
		view.dispatch({ selection: { anchor: pos } });
		view.focus();
	}

	override connectedCallback(): void {
		super.connectedCallback();
		// A detach/reattach — Vue <KeepAlive>, a moved subtree, a <details> toggle —
		// runs disconnectedCallback (which destroyed the view) without re-running
		// Lit's one-shot firstUpdated. Rebuild the view from the preserved document
		// so the editor comes back populated instead of blank until a page reload.
		if (this._hasMounted && !this.view) {
			this.mountEditor(this.getRemountDoc());
			if (this.view) this.onEditorMounted();
		}
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		// Capture the live document before the view is torn down so a later
		// re-mount (see connectedCallback) restores exactly what was on screen.
		if (this.view) this._preservedDoc = this.doc;
		this.destroyEditor();
	}
}
