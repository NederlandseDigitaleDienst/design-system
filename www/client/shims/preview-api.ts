import { currentContext } from '../runtime.js';

type Args = Record<string, unknown>;

/**
 * Stands in for `useArgs` from `storybook/preview-api`: the args of the
 * example that is rendering, and a function that changes them and redraws it.
 * A story uses it to write `open` back when an overlay opens or closes.
 */
export function useArgs(): [Args, (changes: Args) => void] {
	const context = currentContext();
	return [context?.args ?? {}, (changes) => context?.updateArgs(changes)];
}
