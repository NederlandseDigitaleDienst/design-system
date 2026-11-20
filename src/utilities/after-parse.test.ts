import { afterEach, describe, expect, it } from 'vitest';
import { afterParse } from './after-parse.js';

describe('afterParse', () => {
	let frame: HTMLIFrameElement | null = null;

	afterEach(() => {
		frame?.remove();
		frame = null;
	});

	/** A document that is still being parsed: open() keeps it loading until close(). */
	function loadingDocument(): Document {
		frame = document.createElement('iframe');
		document.body.append(frame);
		const doc = frame.contentDocument!;
		doc.open();
		return doc;
	}

	it('leaves the timing to the caller once the document is parsed', () => {
		let ran = 0;
		expect(afterParse(() => ran++)).toBe(false);
		expect(ran).toBe(0);
	});

	it('waits while the document is loading, and runs when the parse is done', () => {
		const doc = loadingDocument();
		let ran = 0;
		expect(afterParse(() => ran++, doc)).toBe(true);
		expect(ran).toBe(0);
		doc.close();
		expect(ran).toBe(1);
	});

	it('runs at the next frame when the parse goes on longer', async () => {
		const doc = loadingDocument();
		let ran = 0;
		afterParse(() => ran++, doc);
		await new Promise((done) => frame!.contentWindow!.requestAnimationFrame(() => done(undefined)));
		expect(ran).toBe(1);
		doc.close();
		expect(ran).toBe(1);
	});
});
