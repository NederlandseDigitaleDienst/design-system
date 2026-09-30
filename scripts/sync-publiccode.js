/**
 * Sync the release metadata in publiccode.yml to the package.
 *
 * `softwareVersion` and `releaseDate` are the only fields in that file that
 * change on every release, and they are the ones a catalog shows first. Left
 * to a human they rot within a month, so they are derived: the version from
 * package.json, the date from the newest block in CHANGELOG.md.
 *
 * Runs from semantic-release's prepareCmd, after @semantic-release/npm has
 * bumped package.json and @semantic-release/changelog has written the new
 * version block, so both sources are already the ones being released.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Reads the release date out of the newest version block of a changelog.
 *
 * The changelog header semantic-release writes:
 * ## [0.8.90](https://github.com/.../compare/v0.8.89...v0.8.90) (2026-09-19)
 *
 * Only the newest block is checked: matching the first dated header anywhere
 * in the file would silently return an older release's date if the format
 * changes. Throws instead of falling back, because a stale date that looks
 * plausible is worse than a failed release step.
 */
export function parseReleaseDate(changelog) {
	const newestHeader = changelog.match(/^## .*$/m)?.[0] ?? '';
	const dateMatch = newestHeader.match(/^## \[[\d.]+\]\([^)]*\) \((\d{4}-\d{2}-\d{2})\)$/);
	if (!dateMatch) {
		throw new Error(`No date found in the newest version block of CHANGELOG.md: ${newestHeader}`);
	}
	return dateMatch[1];
}

function main() {
	const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).version;
	if (!version) {
		console.error('No version found in package.json.');
		process.exit(1);
	}

	let releaseDate;
	try {
		releaseDate = parseReleaseDate(readFileSync(join(root, 'CHANGELOG.md'), 'utf-8'));
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}

	const path = join(root, 'publiccode.yml');
	const before = readFileSync(path, 'utf-8');
	const after = before
		.replace(/^softwareVersion: .*$/m, `softwareVersion: "${version}"`)
		.replace(/^releaseDate: .*$/m, `releaseDate: "${releaseDate}"`);

	if (!/^softwareVersion: "/m.test(after) || !/^releaseDate: "/m.test(after)) {
		console.error('publiccode.yml has no softwareVersion or releaseDate to fill.');
		process.exit(1);
	}

	if (after === before) {
		console.log(`publiccode.yml already at ${version} (${releaseDate})`);
	} else {
		writeFileSync(path, after);
		console.log(`publiccode.yml -> ${version} (${releaseDate})`);
	}
}

// Run the sync only when executed directly, not when imported for tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
