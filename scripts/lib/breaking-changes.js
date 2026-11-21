/**
 * The entries under `### Breaking` in the changelog, per version. `nldd upgrade`
 * ships with them, so it can say which breaking changes lie between the version
 * a project has and the one it goes to, without the changelog or a network.
 */

/**
 * @param {string} changelog - CHANGELOG.md
 * @returns {Record<string, string[]>} per released version, its breaking entries as Markdown
 */
export function breakingChanges(changelog) {
	const versions = {};
	let version;
	let inBreaking = false;
	let entry;
	const close = () => {
		if (entry !== undefined) versions[version].push(entry.trimEnd());
		entry = undefined;
	};
	for (const line of changelog.split('\n')) {
		const heading = /^## \[?(\d+\.\d+\.\d+)\]?/.exec(line);
		if (heading || /^#{2,3} /.test(line)) {
			close();
			if (heading) version = heading[1];
			inBreaking = !heading && /^### Breaking\b/.test(line);
			continue;
		}
		// What stands above the first version heading is not released yet, and has no version to file it under.
		if (!version || !inBreaking) continue;
		if (line.startsWith('- ')) {
			close();
			versions[version] ??= [];
			entry = line.slice(2);
		} else if (entry !== undefined && line.trim()) entry += `\n${line}`;
	}
	close();
	return versions;
}
