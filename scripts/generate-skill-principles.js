/**
 * Copies the canonical design-guidelines doc into the nldd skill as
 * design-guidelines.md.
 *
 * src/docs/design-guidelines.md, the page the site shows at /richtlijnen/, is
 * the single source of truth. This script wraps it in a bundled reference doc
 * inside the nldd consumer skill, so a consumer who builds with
 * @nldd/design-system gets the design principles alongside reference.md and
 * changelog.md.
 *
 * A symlink would NOT survive: Claude Code copies a plugin into an isolated
 * cache and skips symlinks whose target lies outside the plugin directory, so a
 * link to ../../src/docs/... would break after a marketplace install. Hence a
 * real copy, regenerated from the single source of truth.
 *
 * WARNING: overwrites skills/nldd-design/design-guidelines.md in-place. Run
 * `npm run generate:skill-docs` after editing the guidelines and commit the
 * result.
 *
 * Usage: node scripts/generate-skill-principles.js
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedHeader, readSource, writeGenerated } from './lib/skill-doc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(__dirname, '../src/docs/design-guidelines.md');
const outputPath = resolve(__dirname, '../skills/nldd-design/design-guidelines.md');

const source = readSource(
	sourcePath,
	'Verwacht de canonieke ontwerprichtlijnen in src/docs/design-guidelines.md.',
);

const body = `${source.replace(/^\n+/, '').trimEnd()}\n`;

const header = generatedHeader('Kopie van src/docs/design-guidelines.md (de pagina Ontwerprichtlijnen op de site).');

writeGenerated(outputPath, header + body);
