import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { dependabotWithout, leaveToAction, renovateWithout } from './bots.mjs';

const YAML = createRequire(import.meta.url)('yaml');

describe('Dependabot and Renovate leave the design system to the action', () => {
	const dependabot = `version: 2
updates:
  # The app.
  - package-ecosystem: npm
    directory: /frontend
    schedule:
      interval: weekly
    ignore:
      - dependency-name: react
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
`;

	it('adds an ignore to each update of npm, and keeps the comments and the rest', () => {
		const next = dependabotWithout(dependabot, YAML);
		assert.match(next, /# The app\./);
		assert.match(next, /- dependency-name: react\n\s+# Comes as a pull request from the design system[^\n]*\n\s+- dependency-name: "?@nldd\/design-system"?/);
		assert.equal(YAML.parse(next).updates[1].ignore, undefined, 'github-actions has no npm packages');
		assert.equal(dependabotWithout(next, YAML), next, 'a second run changes nothing');
	});

	it('leaves a configuration that already ignores the package, also by a pattern', () => {
		const ignored = dependabot.replace('dependency-name: react', 'dependency-name: "@nldd/*"');
		assert.equal(dependabotWithout(ignored, YAML), ignored);
	});

	it('gives Renovate a rule at the end, where it wins, once', () => {
		const next = renovateWithout({ extends: ['config:recommended'], packageRules: [{ matchUpdateTypes: ['patch'], automerge: true }] });
		assert.deepEqual(next.packageRules.at(-1).matchPackageNames, ['@nldd/design-system']);
		assert.equal(next.packageRules.at(-1).enabled, false);
		assert.equal(renovateWithout(next), undefined);
	});

	it('writes the files of a project, and names a JSON5 file it cannot write', () => {
		const project = mkdtempSync(join(tmpdir(), 'nldd-bots-'));
		mkdirSync(join(project, '.github'));
		writeFileSync(join(project, '.github/dependabot.yml'), dependabot);
		writeFileSync(join(project, 'renovate.json'), '{\n  "extends": ["config:recommended"]\n}\n');
		writeFileSync(join(project, 'renovate.json5'), '{ extends: ["config:base"] }\n');
		assert.deepEqual(leaveToAction(project, YAML), [
			{ file: '.github/dependabot.yml', bot: 'Dependabot', written: true },
			{ file: 'renovate.json', bot: 'Renovate', written: true },
			{ file: 'renovate.json5', bot: 'Renovate', written: false },
		]);
		assert.match(readFileSync(join(project, 'renovate.json'), 'utf8'), /^\{\n {2}"extends"/, 'the indentation stays');
	});
});
