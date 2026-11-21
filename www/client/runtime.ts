/**
 * What a story can reach while it renders: the args of the example it belongs
 * to, and a way to change them.
 *
 * The stories call `useArgs()` and `action()` (see shims/) as they did under
 * Storybook. Both need to know which example is rendering, and a story is a
 * plain function with no handle to its surroundings, so whoever renders it sets
 * the context for the duration of the call.
 */

export interface StoryContext {
	args: Record<string, unknown>;
	updateArgs(changes: Record<string, unknown>): void;
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
