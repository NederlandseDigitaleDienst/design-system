/**
 * Sync the plugin version to the package version.
 *
 * Claude Code caches a plugin by the version in `plugin.json`: if that version
 * does not change, consumers never re-fetch the bundled skill, no matter how
 * much its content changed. So the plugin version follows the package version
 * (the single source of truth), keeping every manifest in lockstep with every
 * release that touches the skill docs.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const packageVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).version;
if (!packageVersion) {
	console.error('No version found in package.json.');
	process.exit(1);
}

/**
 * @param {string} relPath - path relative to the repo root.
 * @param {(data: any) => boolean} isSynced - whether every version the file
 *   holds already equals the package version (short-circuits no-op writes).
 * @param {(data: any) => void} setVersion - mutates the parsed data in place.
 */
function syncVersion(relPath, isSynced, setVersion) {
	const path = join(root, relPath);
	const data = JSON.parse(readFileSync(path, 'utf-8'));
	if (isSynced(data)) {
		console.log(`${relPath} already at ${packageVersion}`);
		return;
	}
	setVersion(data);
	// Preserve 2-space indentation and the trailing newline so output stays
	// byte-stable across runs.
	writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
	console.log(`${relPath} -> ${packageVersion}`);
}

syncVersion(
	'.claude-plugin/plugin.json',
	(d) => d.version === packageVersion,
	(d) => {
		d.version = packageVersion;
	},
);

syncVersion(
	'.cursor-plugin/plugin.json',
	(d) => d.version === packageVersion,
	(d) => {
		d.version = packageVersion;
	},
);

syncVersion(
	'.claude-plugin/marketplace.json',
	(d) => (d.plugins ?? []).every((p) => p.version === packageVersion),
	(d) => {
		for (const plugin of d.plugins ?? []) plugin.version = packageVersion;
	},
);
