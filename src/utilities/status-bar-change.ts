/**
 * Fired on window when an nldd-status-bar connects or disconnects, so an
 * nldd-top-navigation-bar measures again where its ribbon starts. In a module
 * of its own, so the navigation bar can listen without bundling the status bar.
 */
export const STATUS_BAR_CHANGE = 'nldd-status-bar-change';
