import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { breakingChanges } from './breaking-changes.js';

const CHANGELOG = `# Changelog

### Highlights

- Not released yet.

### Breaking

- **Not released yet either.**

## [0.2.0](https://example.test/compare/v0.1.0...v0.2.0) (2026-01-02)

### Highlights

- Something new.

### Breaking

- **\`size\` takes a name.** Use \`display-1\`.
  A second line of the same entry.
- **\`color\` is gone.**

### Added

- Not breaking.

## [0.1.1](https://example.test/compare/v0.1.0...v0.1.1) (2026-01-01)

### Fixed

- A fix.

## 0.1.0

### Breaking

- An old heading without a link.
`;

describe('breaking changes from the changelog', () => {
	const versions = breakingChanges(CHANGELOG);

	it('files each entry under its version, with its continuation lines', () => {
		assert.deepEqual(versions['0.2.0'], ['**`size` takes a name.** Use `display-1`.\n  A second line of the same entry.', '**`color` is gone.**']);
		assert.deepEqual(versions['0.1.0'], ['An old heading without a link.']);
	});

	it('has no entry for a version that broke nothing, or for what is not released', () => {
		assert.deepEqual(Object.keys(versions), ['0.2.0', '0.1.0']);
	});
});
