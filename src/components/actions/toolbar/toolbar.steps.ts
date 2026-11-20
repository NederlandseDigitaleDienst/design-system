/**
 * What a measurement does next: read the layout, or write to it. A
 * measurement is a generator that yields at every switch, so the toolbars on a
 * page can take each step together (see runSteps).
 */
export type Phase = 'read' | 'write';
export type Steps = Generator<Phase, void, void>;

/**
 * Runs the steps of many toolbars side by side: every read of a round before
 * any write of it. A toolbar that measures by itself writes, reads, writes
 * again, and the next toolbar's read lays out the page that write made dirty:
 * a layout per toolbar per step, of a page that grows with every toolbar. Side
 * by side it is a layout per step, however many toolbars there are.
 */
export function runSteps(all: Steps[]): void {
	const runs = all.map(steps => ({ steps, next: 'read' as Phase, done: false }));
	try {
		let active = runs;
		while (active.length) {
			for (const phase of ['read', 'write'] as const) {
				for (const run of active) {
					if (run.done || run.next !== phase) continue;
					const result = run.steps.next();
					if (result.done) run.done = true;
					else run.next = result.value;
				}
			}
			active = active.filter(run => !run.done);
		}
	} finally {
		for (const run of runs) if (!run.done) run.steps.return();
	}
}
