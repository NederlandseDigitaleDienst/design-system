import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { choicesOf, hasNew, placesOf, readState, stateBlock } from './state.mjs';

const result = {
	from: '0.16.0',
	work: [{ rule: 'slot-needs-element', places: [{ file: 'a.html', line: 3, tag: 'nldd-title' }, { file: 'a.html', line: 9, tag: 'nldd-title' }] }],
	undecided: [{ rule: 'text-needs-element', places: [{ file: 'b.html', line: 1, tag: 'nldd-text' }] }],
	unread: ['c.php'],
};

describe('what a pull request of the action remembers', () => {
	it('counts the places without their line, which moves', () => {
		assert.deepEqual(placesOf(result), { 'slot-needs-element|a.html|nldd-title': 2, 'text-needs-element|b.html|nldd-text': 1, 'file-not-read|c.php|': 1 });
	});

	it('says there is something new only where the list holds more of a place than before', () => {
		const before = placesOf(result);
		assert.equal(hasNew(before, before), false);
		assert.equal(hasNew({ 'slot-needs-element|a.html|nldd-title': 1 }, before), false, 'fewer is not new');
		assert.equal(hasNew({ ...before, 'slot-needs-element|a.html|nldd-title': 3 }, before), true);
		assert.equal(hasNew(before, undefined), true, 'without a state everything is new');
	});

	it('writes the state at the end of the text and reads it back, with the choices before it', () => {
		const state = { from: '0.16.0', places: placesOf(result), site: { build: 'npm run build', site: 'dist' } };
		const body = `# Designsysteem van 0.16.0 naar 0.28.0\n\n## Keuzes\n\n- De kleur volgt het vlak.\n\n## Brekende wijzigingen onderweg\n\n...\n\n${stateBlock(state)}\n`;
		assert.deepEqual(readState(body), state);
		assert.equal(choicesOf(body), '- De kleur volgt het vlak.\n');
		assert.deepEqual(readState('Geschreven door een mens.'), {});
		assert.equal(choicesOf('Geen keuzes.'), '');
	});
});
