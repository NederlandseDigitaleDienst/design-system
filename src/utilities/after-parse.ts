/**
 * Holds on to work over a whole parent, such as the rows of a list, while the
 * HTML parser is still putting children in it.
 *
 * The parser runs the microtasks after every custom element it creates, so a
 * MutationObserver, a `slotchange` and a `queueMicrotask` all come once per
 * child while the page loads, and none of them coalesce anything. Work that
 * walks every child then runs once per child, and a page with 6000 rows in its
 * HTML takes minutes instead of a second.
 *
 * While the document is loading, this runs `task` at the next frame or when
 * the parse is done, whichever comes first, and only once. A frame comes
 * before every paint, so the page never shows the state before the task. Once
 * the document has been parsed it returns false and leaves the timing to the
 * caller, so what happens after the load stays as it was.
 *
 * Coalescing is the caller's: keep a flag, and let `task` clear it.
 *
 * ```ts
 * if (this._pending) return;
 * this._pending = true;
 * const run = () => { this._pending = false; this._refresh(); };
 * if (!afterParse(run, this.ownerDocument)) queueMicrotask(run);
 * ```
 *
 * @param doc - the document the work is in, the host's `ownerDocument`
 * @returns true when `task` waits for the parse
 */
export function afterParse(task: () => void, doc: Document = document): boolean {
	if (doc.readyState !== 'loading') return false;
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		doc.removeEventListener('readystatechange', run);
		task();
	};
	(doc.defaultView ?? window).requestAnimationFrame(run);
	doc.addEventListener('readystatechange', run);
	return true;
}
