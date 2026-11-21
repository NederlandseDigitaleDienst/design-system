/**
 * Stands in for `action` from `storybook/actions`. The site shows no event log,
 * so the handler does nothing; the stories keep their listeners as examples.
 */
export function action(_name: string): (...args: unknown[]) => void {
	return () => {};
}
