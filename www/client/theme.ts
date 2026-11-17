/**
 * The theme a visitor chose in the bar, kept for every page behind the landing
 * page. So a component can be looked at in the color of your own organization
 * on its own page.
 *
 * A theme is an attribute on <html>, as in an application: `data-nldd-theme`.
 * Without a choice it is not set, which is lintblauw.
 */

const KEY = 'nldd-site-theme';
const DEFAULT_THEME = 'lintblauw';

/** The chosen theme, or the default when there is none. */
export function chosenTheme(): string {
	// Storage can be unavailable, in a private window or with cookies blocked.
	try {
		return localStorage.getItem(KEY) ?? DEFAULT_THEME;
	} catch {
		return DEFAULT_THEME;
	}
}

/** Puts a theme on the page. */
export function showTheme(theme: string): void {
	if (theme === DEFAULT_THEME) delete document.documentElement.dataset.nlddTheme;
	else document.documentElement.dataset.nlddTheme = theme;
}

/** Puts a theme on the page and remembers it for the next one. */
export function chooseTheme(theme: string): void {
	showTheme(theme);
	try {
		if (theme === DEFAULT_THEME) localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, theme);
	} catch {
		// The page still changes; the choice just does not travel along.
	}
}

/**
 * Calls back when the choice changes in another document of the site: an
 * example in a frame follows the page it is shown on.
 */
export function onThemeChosenElsewhere(callback: (theme: string) => void): void {
	addEventListener('storage', (event) => {
		if (event.key === KEY) callback(event.newValue ?? DEFAULT_THEME);
	});
}
