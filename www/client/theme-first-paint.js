/*
 * Puts the chosen theme and color scheme on the page before it is painted. The script every
 * page runs is a module, and a module runs after the first paint: without this
 * a page would show in lintblauw first and change color right after.
 *
 * A file of its own and not a script in the page: the site's Content Security
 * Policy allows no inline script. See theme.ts for the rest.
 */
try {
	const theme = localStorage.getItem('nldd-site-theme');
	if (theme) document.documentElement.dataset.nlddTheme = theme;
	const scheme = localStorage.getItem('nldd-site-scheme');
	if (scheme) document.documentElement.dataset.scheme = scheme;
} catch {
	// Without storage there is no choice to show.
}
