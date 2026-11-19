/**
 * Work for many hosts at the next animation frame, in one callback.
 *
 * A host that asks for its own frame gets its own callback, and the browser
 * runs the microtasks between two callbacks: a Lit render of the host before
 * lands between them, so each host reads a layout that the one before it has
 * just changed. One frame for all of them lets `run` read for every host
 * first and write after, so the page lays out once.
 *
 * Like LayoutPass (layout-pass.ts), but at the frame the hosts asked for,
 * for work that waited a frame before it was shared.
 */
export class FramePass<T> {
	private _pending = new Set<T>();
	private _frame: number | null = null;

	/** @param run gets every host that asked, in the order they asked. */
	constructor(private _run: (hosts: T[]) => void) {}

	/** Adds a host to the next frame. */
	schedule(host: T): void {
		this._pending.add(host);
		this._frame ??= requestAnimationFrame(this._flush);
	}

	/** Takes a host out of the next frame, when it left the page. */
	cancel(host: T): void {
		this._pending.delete(host);
	}

	private _flush = (): void => {
		this._frame = null;
		if (!this._pending.size) return;
		const hosts = [...this._pending];
		this._pending.clear();
		this._run(hosts);
	};
}
