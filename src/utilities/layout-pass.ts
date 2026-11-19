import { afterParse } from './after-parse.js';

/**
 * Layout reads for many hosts, in one pass.
 *
 * A host that measures itself when it renders (an offsetHeight, a
 * getComputedStyle) forces the browser to lay out the page as it is at that
 * moment. A page with many of them, each reading after the previous one wrote,
 * lays out once per host, and each of those layouts is of a page that has
 * grown: quadratic. Reading for all of them first and writing after is one
 * layout.
 *
 * `LayoutPass` collects the hosts that ask in the same tick, and runs them
 * together: at the next microtask, or after the parse while the page is still
 * loading (see afterParse). `sharedResizeObserver` does the same for resize
 * notifications: one observer for every host of a component, so its callback
 * gets them all at once, where an observer per host calls back once per host.
 */
export class LayoutPass<T> {
	private _pending = new Set<T>();

	/** @param run gets every host that asked, in the order they asked. It must
	 *  not throw: the pass has already let go of its hosts, so one that throws
	 *  drops the rest of that pass. */
	constructor(private _run: (hosts: T[]) => void) {}

	/** Adds a host to the next pass. */
	schedule(host: T, doc: Document = document): void {
		const scheduled = this._pending.size > 0;
		this._pending.add(host);
		if (scheduled) return;
		if (!afterParse(this._flush, doc)) queueMicrotask(this._flush);
	}

	/** Takes a host out of the next pass, when it left the page. */
	cancel(host: T): void {
		this._pending.delete(host);
	}

	/** Runs the pass now, for a caller that cannot wait for it. The run that
	 *  was scheduled still comes, and finds nothing, or what asked since. */
	flush = (): void => this._flush();

	private _flush = (): void => {
		if (!this._pending.size) return;
		const hosts = [...this._pending];
		this._pending.clear();
		this._run(hosts);
	};
}

/** One ResizeObserver for every host of a component. */
export interface SharedResizeObserver<T extends object> {
	observe(target: Element, host: T): void;
	/** Stops watching every target of this host. */
	unobserveAll(host: T): void;
}

/**
 * @param onResize gets the hosts with a target that changed size, each once,
 *   and only those still in the page.
 *   Like any ResizeObserver, a target is reported once when it is observed.
 */
export function sharedResizeObserver<T extends object>(onResize: (hosts: T[]) => void): SharedResizeObserver<T> {
	// A target can belong to more hosts, such as one anchor for two bars.
	const hostsOf = new WeakMap<Element, Set<T>>();
	// Weak, so a host that never calls unobserveAll is not kept alive by it.
	const targetsOf = new WeakMap<T, Set<Element>>();
	let observer: ResizeObserver | null = null;
	return {
		observe(target, host) {
			observer ??= new ResizeObserver((entries) => {
				const hosts = new Set<T>();
				for (const entry of entries) hostsOf.get(entry.target)?.forEach((of) => hosts.add(of));
				// A host that left the page in the same tick is not reported.
				const live = [...hosts].filter((host) => !(host instanceof Node) || host.isConnected);
				if (live.length) onResize(live);
			});
			const hosts = hostsOf.get(target) ?? new Set<T>();
			hostsOf.set(target, hosts);
			hosts.add(host);
			const targets = targetsOf.get(host) ?? new Set<Element>();
			targetsOf.set(host, targets);
			targets.add(target);
			observer.observe(target);
		},
		unobserveAll(host) {
			for (const target of targetsOf.get(host) ?? []) {
				const hosts = hostsOf.get(target);
				hosts?.delete(host);
				if (hosts?.size) continue;
				observer?.unobserve(target);
				hostsOf.delete(target);
			}
			targetsOf.delete(host);
		},
	};
}
