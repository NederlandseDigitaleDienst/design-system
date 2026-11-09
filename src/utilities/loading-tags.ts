/**
 * The nldd-* tags whose module the autoloader is loading right now. The dev
 * check for unregistered elements reads it, so a slow load is not reported as
 * a tag that is never registered.
 */
export const loadingTags = new Set<string>();
