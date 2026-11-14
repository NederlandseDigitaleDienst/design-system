import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { unmentionedRemovals } from './removed-tokens.js';

const changelog = (upcoming) => `# Changelog\n\n${upcoming}\n## [0.22.0](https://example.com) (2026-11-11)\n\n### Removed\n\n- \`--semantics-old-color\`\n`;

describe('unmentionedRemovals', () => {
	const removed = {
		'--semantics-old-color': { last: '0.21.0' },
		'--semantics-gone-color': { last: '0.22.0' },
	};

	it('asks the upcoming release to name a token removed since the last one', () => {
		assert.deepEqual(unmentionedRemovals(changelog(''), removed, '0.22.0'), ['--semantics-gone-color']);
	});

	it('is satisfied once the upcoming release names it', () => {
		assert.deepEqual(unmentionedRemovals(changelog('### Removed\n\n- `--semantics-gone-color`\n'), removed, '0.22.0'), []);
	});

	it('does not count a mention in a released block', () => {
		const released = { '--semantics-old-color': { last: '0.22.0' } };
		assert.deepEqual(unmentionedRemovals(changelog(''), released, '0.22.0'), ['--semantics-old-color']);
	});

	it('leaves tokens removed in an earlier release alone', () => {
		assert.deepEqual(unmentionedRemovals(changelog(''), removed, '0.23.0'), []);
	});
});
