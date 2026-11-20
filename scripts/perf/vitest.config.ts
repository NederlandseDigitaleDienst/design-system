import base from '../../vitest.config.ts';

/** Only the story extractor, which the normal test run leaves out. */
export default {
	...base,
	test: { ...base.test, include: ['scripts/perf/*.perf.ts'] },
};
