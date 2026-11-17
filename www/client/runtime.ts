/**
 * What a story can reach while it renders: the args of the example it belongs
 * to, a way to change them, and a place to report an event.
 *
 * The stories call `useArgs()` and `action()` (see shims/) as they did under
 * Storybook. Both need to know which example is rendering, and a story is a
 * plain function with no handle to its surroundings, so whoever renders it sets
 * the context for the duration of the call.
 */

export interface StoryContext {
	args: Record<string, unknown>;
	updateArgs(changes: Record<string, unknown>): void;
	log(name: string, detail: unknown): void;
}

let current: StoryContext | null = null;

export function currentContext(): StoryContext | null {
	return current;
}

export function withContext<T>(context: StoryContext, run: () => T): T {
	const previous = current;
	current = context;
	try {
		return run();
	} finally {
		current = previous;
	}
}

/** A short, readable form of whatever an event carried. */
export function describeEvent(value: unknown): string {
	const detail = value instanceof CustomEvent ? value.detail : value instanceof Event ? undefined : value;
	if (detail === undefined || detail === null) return '';
	try {
		const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
		return text.length > 120 ? `${text.slice(0, 117)}…` : text;
	} catch {
		return String(detail);
	}
}
