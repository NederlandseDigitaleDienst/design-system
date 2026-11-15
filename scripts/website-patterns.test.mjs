/**
 * The page patterns of a website put their headings in the HTML the server
 * sends, not in an attribute a component draws in the browser. This reads the
 * pattern markup as a server would send it, without running any script.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseDocument, DomUtils } from 'htmlparser2';

const root = resolve(import.meta.dirname, '../src/patterns');
const WEBSITE_PATTERNS = ['home-page', 'content-page', 'topic-page', 'navigation-page'];

const files = WEBSITE_PATTERNS.flatMap((slug) =>
	readdirSync(join(root, slug)).filter((file) => file.endsWith('.html')).map((file) => join(slug, file)),
);

describe('website patterns', () => {
	for (const file of files) {
		it(`${file} has its one <h1> in the HTML`, () => {
			const document = parseDocument(readFileSync(join(root, file), 'utf8'));
			const headings = DomUtils.findAll((element) => element.name === 'h1', document.children);
			assert.equal(headings.length, 1);
			assert.notEqual(DomUtils.textContent(headings[0]).trim(), '');
			const drawn = DomUtils.findAll((element) => element.name === 'nldd-title' && element.attribs['heading-level'] === '1' && 'text' in element.attribs, document.children);
			assert.deepEqual(drawn, []);
		});
	}
});
