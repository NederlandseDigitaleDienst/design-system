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

/** The anchor of a heading's plain text, as GitHub and the former Storybook pages derive it. */
export function headingId(text) {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.replace(/\s+/g, '-');
}

export function codeViewer(code, language = '', { wrap = false } = {}) {
	const lang = LANGUAGES[language] ?? language;
	return `<nldd-code-viewer${lang ? ` language="${lang}"` : ''}${wrap ? ' wrap' : ''}>${escapeHtml(code.replace(/\n$/, ''))}</nldd-code-viewer>`;
}

const BREAK = '\u0000break\u0000';

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

/** The text of what the Markdown renderer escaped. */
function decodeEntities(html) {
	return html.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);
}

/** Whether a token is an example or a component written in the Markdown. */
const isComponent = (token) => token.type === 'html' && /^\s*<(?:nldd-|!--\s*voorbeeld:)/.test(token.text ?? token.raw);

/**
 * A code block, an example and a component are taken out of the prose at the
 * top of the page. Inside a list or a quote that would cut the element in two:
 * a code block stays in place there, inside the prose, and an example or a
 * component is refused, with the place it was found.
 */
function markNested(tokens, { literalHtml }) {
	const component = (token) => !literalHtml && isComponent(token);
	const children = (token) => [...(token.tokens ?? []), ...(token.items ?? [])];
	const search = (token) => {
		for (const child of children(token)) {
			if (child.type === 'code') child.nested = true;
			else if (component(child)) {
				throw new Error(`Een voorbeeld of component staat in een ${token.type}, waar het de tekst in tweeën knipt: ${child.raw.trim().split('\n')[0]}`);
			}
			search(child);
		}
	};
	for (const token of tokens) if (token.type !== 'code' && !component(token)) search(token);
}

/**
 * @param {string} markdown
 * @param {object} options
 * @param {(path: string) => string} options.href - turns a site path into a link target
 * @param {(name: string) => string} [options.example] - renders an example marker
 * @param {boolean} [options.literalHtml] - shows HTML in the text as text, as a JSDoc means it
 * @returns {{ title: string, html: string, blocks: string[], headings: { id: string, text: string }[] }}
 */
export function renderMarkdown(markdown, { href, example, literalHtml = false }) {
	let title = '';
	const headings = [];
	// A heading whose text comes back gets a number, so every id is one of a kind.
	const seen = new Map();
	const uniqueId = (text) => {
		const id = headingId(text);
		const count = seen.get(id) ?? 0;
		seen.set(id, count + 1);
		return count ? `${id}-${count}` : id;
	};
	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }) {
				const inner = this.parser.parseInline(tokens);
				const text = inner.replace(/<[^>]+>/g, '');
				// The first h1 is the title of the page, which the page shows in
				// its own header.
				if (depth === 1 && !title) {
					// The title is plain text: whoever shows it escapes it.
					title = decodeEntities(text);
					return '';
				}
				const id = uniqueId(decodeEntities(text));
				if (depth === 2) headings.push({ id, text });
				return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
			},
			code({ text, lang, nested }) {
				const viewer = codeViewer(text, (lang ?? '').trim());
				return nested ? viewer : `${BREAK}${viewer}${BREAK}`;
			},
			link({ href: target, tokens }) {
				const inner = this.parser.parseInline(tokens);
				const external = /^https?:/.test(target);
				const to = target.startsWith('/') ? href(target) : target;
				return `<a href="${escapeHtml(to)}"${external ? ' rel="noopener"' : ''}>${inner}</a>`;
			},
			html({ text }) {
				if (literalHtml) return escapeHtml(text);
				const marker = text.match(/^<!--\s*voorbeeld:\s*(\w+)\s*-->\s*$/);
				// A component written in the Markdown stands on its own, outside the prose.
				if (!marker) return /^<nldd-/.test(text) ? `${BREAK}${text}${BREAK}` : text;
				if (!example) throw new Error(`Voorbeeld ${marker[1]} op een pagina zonder stories.`);
				return `${BREAK}${example(marker[1])}${BREAK}`;
			},
		},
	});
	const tokens = marked.lexer(markdown);
	markNested(tokens, { literalHtml });
	const blocks = marked
		.parser(tokens)
		.split(BREAK)
		.map((part, index) => {
			if (index % 2 === 1) return part;
			return part.trim() ? `<nldd-rich-text>${part}</nldd-rich-text>` : '';
		})
		.filter(Boolean);
	return { title, html: blocks.join('\n'), blocks, headings };
}
