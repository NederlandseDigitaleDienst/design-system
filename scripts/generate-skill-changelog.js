/**
 * Copies the root CHANGELOG.md into the nldd skill as changelog.md.
 *
 * The skill bundles the release notes so a consumer can read them offline and
 * so they survive plugin installation. A symlink would NOT survive: Claude Code
 * copies a plugin into an isolated cache and skips symlinks whose target lies
 * outside the plugin directory, so `changelog.md -> ../../CHANGELOG.md` would
 * break after a marketplace install. Hence a real copy, regenerated from the
 * single source of truth (the root CHANGELOG that semantic-release maintains).
 *
 * WARNING: overwrites skills/nldd-design/changelog.md in-place. Run
 * `npm run generate:skill-docs` after a release and commit the result.
 *
 * Usage: node scripts/generate-skill-changelog.js
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedHeader, readSource, writeGenerated } from './lib/skill-doc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(__dirname, '../CHANGELOG.md');
const outputPath = resolve(__dirname, '../skills/nldd-design/changelog.md');

const header = generatedHeader('Kopie van de root CHANGELOG.md (onderhouden door semantic-release).');

const changelog = readSource(
	sourcePath,
	'Draai dit script na een release, als semantic-release de CHANGELOG heeft bijgewerkt.',
);

writeGenerated(outputPath, header + changelog);
