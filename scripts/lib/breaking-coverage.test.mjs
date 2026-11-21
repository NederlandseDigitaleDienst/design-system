import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { uncoveredBreaking } from './breaking-coverage.js';

const changelog = (breaking) => `# Changelog\n\n### Highlights\n\n- **Iets.**\n\n### Breaking\n\n${breaking}\n\n## [0.27.1](https://example.org) (2026-11-20)\n\n### Breaking\n\n- **Old, and left alone.** Nothing named.\n`;

describe('every breaking change of the upcoming release says how an upgrade finds it', () => {
	const known = ['title-size-renamed', '--semantics-old-color', 'tabchange'];

	it('is fine where an entry names a rule, or something a rule reports by itself', () => {
		const text = changelog('- **`size` on `nldd-title` takes `display-1` to `display-6`.** `title-size-renamed` renames it.\n- **A token is gone.** `--semantics-old-color` has no successor.\n- **An event got a new name.**\n  `tabchange` is `tab-change` now.');
		assert.deepEqual(uncoveredBreaking(text, known), []);
	});

	it('is fine where an entry says why no rule can find it', () => {
		assert.deepEqual(uncoveredBreaking(changelog('- **The gap in a list is 4px larger.** No rule: spacing is not in the source.'), known), []);
	});

	it('names an entry that does neither, and only in the upcoming release', () => {
		const text = changelog('- **`nldd-card` lost its shadow.** Set one yourself.\n- **Renamed.** `title-size-renamed`.');
		assert.deepEqual(uncoveredBreaking(text, known), ['`nldd-card` lost its shadow']);
	});

	it('takes a block without a Breaking section as fine', () => {
		assert.deepEqual(uncoveredBreaking('# Changelog\n\n### Added\n\n- **New.**\n', known), []);
	});
});
