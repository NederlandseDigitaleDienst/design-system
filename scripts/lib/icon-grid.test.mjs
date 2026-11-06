import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { GRID, scaleIcon, scalePathData, viewBoxSize } from './icon-grid.js';

test('scales coordinates but not arc rotation and flags', () => {
	assert.equal(scalePathData('M12 2a10 10 0 1 1 0 20', 4), 'M48 8a40 40 0 1 1 0 80');
});

test('leaves no float noise', () => {
	assert.equal(scalePathData('M.28 .07h1.01', 4), 'M1.12.28h4.04');
});

test('brings 24 and 32 icons to 96 and leaves 96 alone', () => {
	const regular = '<svg viewBox="0 0 24 24">\n\t<path fill="currentColor" d="M3 3h18v18H3z"/>\n</svg>';
	assert.equal(
		scaleIcon(regular),
		'<svg viewBox="0 0 96 96">\n\t<path fill="currentColor" d="M12 12h72v72H12z"/>\n</svg>',
	);
	const light = '<svg viewBox="0 0 32 32"><path d="M1 1h30"/></svg>';
	assert.equal(scaleIcon(light), '<svg viewBox="0 0 96 96"><path d="M3 3h90"/></svg>');
	const done = '<svg viewBox="0 0 96 96"><path d="M1 1h3"/></svg>';
	assert.equal(scaleIcon(done), done);
});

test('refuses an unknown grid, a shape or a transform', () => {
	assert.throws(() => scaleIcon('<svg viewBox="0 0 20 20"><path d="M0 0"/></svg>'));
	assert.throws(() => scaleIcon('<svg viewBox="0 0 24 24"><circle r="2"/></svg>'));
	assert.throws(() => scaleIcon('<svg viewBox="0 0 24 24"><g transform="scale(2)"><path d="M0 0"/></g></svg>'));
});

test('every icon is on the grid', () => {
	const dir = new URL('../../src/components/content/icon/icons/', import.meta.url);
	const off = readdirSync(dir)
		.filter((f) => f.endsWith('.svg'))
		.filter((f) => viewBoxSize(readFileSync(new URL(f, dir), 'utf8')) !== GRID);
	assert.deepEqual(off, []);
});
