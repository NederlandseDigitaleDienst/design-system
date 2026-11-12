/**
 * A token that leaves variables.css breaks every stylesheet that names it, without
 * a sound: the browser drops the declaration. So the changelog of the release that
 * removes it names it. The generator of the lint data records each removal in
 * src/assets/styles/removed-tokens.json with the last version that had it, which
 * is the version in package.json until the release that removes it.
 */

/** The text above the first `## ` heading: what the next release gets. */
export const upcoming = (changelog) => changelog.split(/\n(?=## )/)[0];

/** Tokens removed since the last release that the changelog does not name yet. */
export function unmentionedRemovals(changelog, removedTokens, version) {
	const text = upcoming(changelog);
	return Object.entries(removedTokens)
		.filter(([name, { last }]) => last === version && !text.includes(name))
		.map(([name]) => name);
}
