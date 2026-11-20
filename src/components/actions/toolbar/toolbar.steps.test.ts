import { describe, expect, it } from 'vitest';
import { runSteps, type Steps } from './toolbar.steps.js';

/** A measurement that logs what it does: `reads` reads, each followed by a write. */
function* steps(name: string, rounds: number, log: string[]): Steps {
	for (let i = 0; i < rounds; i++) {
		log.push(`${name} reads`);
		yield 'write';
		log.push(`${name} writes`);
		yield 'read';
	}
	log.push(`${name} done`);
}

describe('runSteps', () => {
	it('reads for every toolbar before any of them writes', () => {
		const log: string[] = [];
		runSteps([steps('a', 2, log), steps('b', 2, log)]);
		expect(log).toEqual([
			'a reads', 'b reads', 'a writes', 'b writes',
			'a reads', 'b reads', 'a writes', 'b writes',
			'a done', 'b done',
		]);
	});

	it('lets a toolbar that needs fewer steps finish first', () => {
		const log: string[] = [];
		runSteps([steps('a', 1, log), steps('b', 2, log)]);
		expect(log).toEqual([
			'a reads', 'b reads', 'a writes', 'b writes',
			'a done', 'b reads', 'b writes', 'b done',
		]);
	});

	it('ends every measurement when one of them throws', () => {
		let finished = false;
		function* failing(): Steps {
			yield 'write';
			throw new Error('boom');
		}
		function* waiting(): Steps {
			try {
				yield 'write';
				yield 'read';
			} finally {
				finished = true;
			}
		}
		expect(() => runSteps([failing(), waiting()])).toThrow('boom');
		expect(finished).toBe(true);
	});
});
