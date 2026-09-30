/**
 * Turns a pattern's Storybook page into the Markdown page the skill ships.
 *
 * A pattern lives in src/patterns/<slug>/: the example markup as .html, a
 * stories file that renders it through patternStory(), and an .mdx page with
 * the prose around it. The .mdx is Markdown plus three things only Storybook
 * understands, and each is translated here:
 *
 * - the import lines and <Meta>, which are dropped;
 * - <Canvas of={Stories.X} />, which becomes an html code block holding the
 *   markup file that story renders, so the skill shows exactly what the live
 *   example runs;
 * - links of the form ?path=/docs/..., which point into Storybook and become
 *   links a reader of the skill can follow: another pattern, the component in
 *   reference.md, or the design guidelines.
 *
 * Anything else that looks like JSX is an error rather than something to pass
 * through, because a stray <Canvas> in the skill would be a broken example.
 */

const REPO_BLOB = 'https://github.com/NederlandseDigitaleDienst/design-system/blob/main/skills/nldd-design-build/';

/** The Storybook id of a title, as Storybook sanitizes it. */
export function storybookId(title) {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Reads which markup file each story of a pattern renders.
 *
 * @param {string} stories - source of the pattern's .stories.ts
 * @returns {{ title: string, markup: Record<string, string> }} the story title
 *   and, per exported story, the file name of its markup
 */
export function parsePatternStories(stories) {
	const title = stories.match(/^\s*title:\s*'([^']+)'/m)?.[1];
	if (!title) throw new Error('Geen title gevonden in het stories-bestand.');
	const imports = Object.fromEntries(
		[...stories.matchAll(/^import (\w+) from '\.\/([\w.-]+\.html)\?raw';/gm)].map((m) => [m[1], m[2]]),
	);
	const markup = {};
	for (const m of stories.matchAll(/^export const (\w+) = patternStory\((\w+)/gm)) {
		if (!imports[m[2]]) throw new Error(`Story ${m[1]} rendert ${m[2]}, maar dat is geen geïmporteerd .html-bestand.`);
		markup[m[1]] = imports[m[2]];
	}
	return { title, markup };
}

/**
 * Rewrites one Storybook link target into a link for the skill.
 *
 * @param {string} target - the link target as written in the .mdx
 * @param {{ patterns: Record<string, string>, tags: Set<string> }} context -
 *   Storybook docs id to skill slug for every pattern, and the tags that have a
 *   section in reference.md
 */
export function rewriteLink(target, { patterns, tags }) {
	if (target.startsWith(REPO_BLOB)) return `../${target.slice(REPO_BLOB.length)}`;
	const path = target.match(/^\?path=\/docs\/([a-z0-9-]+)--docs(#[\w-]+)?$/);
	if (!path) {
		if (target.startsWith('?path=')) throw new Error(`Onbekende Storybook-link: ${target}`);
		return target;
	}
	const [, id, anchor = ''] = path;
	if (id === 'docs-ontwerprichtlijnen') return `../../nldd-design/design-guidelines.md${anchor}`;
	if (patterns[id]) return `${patterns[id]}.md${anchor}`;
	if (id.startsWith('components-')) {
		const tag = [...tags]
			.filter((t) => id.endsWith(`-${t.slice('nldd-'.length)}`))
			.sort((a, b) => b.length - a.length)[0];
		if (!tag) throw new Error(`Geen component in reference.md voor ${target}`);
		return `../../nldd-design/reference.md#${tag}`;
	}
	throw new Error(`Geen bestemming in de skill voor ${target}`);
}

/**
 * @param {object} input
 * @param {string} input.mdx - source of the pattern's .mdx page
 * @param {Record<string, string>} input.markup - story name to markup source
 * @param {{ patterns: Record<string, string>, tags: Set<string> }} input.context
 * @returns {string} the Markdown body for the skill
 */
export function patternToMarkdown({ mdx, markup, context }) {
	let inFence = false;
	const lines = [];
	for (const line of mdx.split('\n')) {
		if (/^```/.test(line)) inFence = !inFence;
		if (inFence || /^```/.test(line)) {
			lines.push(line);
			continue;
		}
		if (/^import\s.+\sfrom\s+['"][^'"]+['"];?\s*$/.test(line) || /^<Meta\b/.test(line)) continue;
		const canvas = line.match(/^<Canvas of=\{Stories\.(\w+)\}\s*\/>$/);
		if (canvas) {
			const source = markup[canvas[1]];
			if (source === undefined) throw new Error(`Geen markup voor story ${canvas[1]}.`);
			lines.push('```html', source.trimEnd(), '```');
			continue;
		}
		if (/^\s*<[A-Z]/.test(line)) throw new Error(`Niet te vertalen MDX: ${line.trim()}`);
		const heading = line.match(/^# (.+)$/);
		if (heading) {
			lines.push(`# Patroon: ${heading[1].charAt(0).toLowerCase()}${heading[1].slice(1)}`);
			continue;
		}
		lines.push(line.replace(/\]\(([^)\s]+)\)/g, (_, target) => `](${rewriteLink(target, context)})`));
	}
	return `${lines.join('\n').replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

/** The tags that have a section of their own in reference.md. */
export function referenceTags(reference) {
	return new Set([...reference.matchAll(/^### `<(nldd-[a-z0-9-]+)>`/gm)].map((m) => m[1]));
}
