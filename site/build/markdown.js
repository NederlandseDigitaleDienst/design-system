/**
 * Renders a Markdown page into the components the site is built from.
 *
 * Prose lands in an nldd-rich-text, a fenced code block becomes an
 * nldd-code-viewer and an example marker becomes a stage. The three alternate
 * as siblings, because a code viewer and a stage are components of their own
 * and do not belong inside running text.
 *
 * An example marker is the line `<!-- voorbeeld: StoryName -->`. It is an HTML
 * comment so the same file reads cleanly on GitHub, and it is the one line the
 * skill generator (scripts/lib/skill-patterns.js) translates differently: there
 * it becomes the markup itself.
 */

import { Marked } from 'marked';

const LANGUAGES = { js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', text: '', '': '' };

export function escapeHtml(text) {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** The anchor of a heading, as GitHub and the former Storybook pages derive it. */
export function headingId(text) {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.replace(/\s+/g, '-');
}

export function codeViewer(code, language = '', { wrap = false } = {}) {
	const lang = LANGUAGES[language] ?? language;
	return `<nldd-code-viewer${lang ? ` language="${lang}"` : ''}${wrap ? ' wrap' : ''}>${escapeHtml(code.replace(/\n$/, ''))}</nldd-code-viewer>`;
}

const BREAK = '\u0000break\u0000';

/**
 * @param {string} markdown
 * @param {object} options
 * @param {(path: string) => string} options.href - turns a site path into a link target
 * @param {(name: string) => string} [options.example] - renders an example marker
 * @returns {{ title: string, html: string, headings: { id: string, text: string }[] }}
 */
export function renderMarkdown(markdown, { href, example }) {
	let title = '';
	const headings = [];
	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }) {
				const inner = this.parser.parseInline(tokens);
				const text = inner.replace(/<[^>]+>/g, '');
				if (depth === 1 && !title) title = text;
				const id = headingId(text);
				if (depth === 2) headings.push({ id, text });
				return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
			},
			code({ text, lang }) {
				return `${BREAK}${codeViewer(text, (lang ?? '').trim())}${BREAK}`;
			},
			link({ href: target, tokens }) {
				const inner = this.parser.parseInline(tokens);
				const external = /^https?:/.test(target);
				const to = target.startsWith('/') ? href(target) : target;
				return `<a href="${escapeHtml(to)}"${external ? ' rel="noopener"' : ''}>${inner}</a>`;
			},
			html({ text }) {
				const marker = text.match(/^<!--\s*voorbeeld:\s*(\w+)\s*-->\s*$/);
				if (!marker) return text;
				if (!example) throw new Error(`Voorbeeld ${marker[1]} op een pagina zonder stories.`);
				return `${BREAK}${example(marker[1])}${BREAK}`;
			},
		},
	});
	const html = marked
		.parse(markdown)
		.split(BREAK)
		.map((part, index) => {
			if (index % 2 === 1) return part;
			return part.trim() ? `<nldd-rich-text>${part}</nldd-rich-text>` : '';
		})
		.filter(Boolean)
		.join('\n');
	return { title, html, headings };
}
