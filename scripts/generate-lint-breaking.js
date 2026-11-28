/**
 * Writes lint/breaking.generated.json from CHANGELOG.md: the breaking entries
 * per released version, for `nldd upgrade`. Run by the release, after
 * semantic-release has given the newest entries their version heading.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { breakingChanges } from './lib/breaking-changes.js';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const versions = breakingChanges(readFileSync(resolve(repoRoot, 'CHANGELOG.md'), 'utf8'));
const lines = Object.entries(versions).map(([version, entries]) => `\t${JSON.stringify(version)}: ${JSON.stringify(entries)}`);
writeFileSync(resolve(repoRoot, 'lint/breaking.generated.json'), `{\n${lines.join(',\n')}\n}\n`);
console.log(`Wrote lint/breaking.generated.json (${Object.values(versions).flat().length} entries in ${lines.length} versions)`);
