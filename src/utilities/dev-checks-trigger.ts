/**
 * Starts the rule checks in a consumer's dev server. A separate file, so a
 * production build drops this branch and with it the import of the rules.
 * Tests stay out: they set up wrong markup on purpose.
 */
if (import.meta.env?.DEV && import.meta.env?.MODE !== 'test') {
	void import('./dev-checks.js').then(({ startDevChecks }) => startDevChecks());
}
