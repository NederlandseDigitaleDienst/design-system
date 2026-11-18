import { currentContext, describeEvent } from '../runtime.js';

/**
 * Stands in for `action` from `storybook/actions`: returns a handler that
 * reports the event on the example it was created for.
 */
export function action(name: string): (...args: unknown[]) => void {
	const context = currentContext();
	return (...args) => context?.log(name, describeEvent(args[0]));
}
