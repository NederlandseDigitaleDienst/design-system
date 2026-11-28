/**
 * What an agent found the design system cannot do: its drafts, and what became of them.
 *
 * The agent writes a draft per finding in $WORK/issues/: a first line `# title`, a line
 * `blocking: true` or `false`, then the text of the issue. Blocking means the upgrade cannot be
 * done right within what the design system offers: something looks or works worse after it, and
 * the app cannot mend that without a workaround.
 *
 * A finding is known by a fingerprint of its title. The issue that is filed for it, or the
 * comment on an issue that already said it, carries that fingerprint in a hidden marker. So a
 * later run of any repository finds the issue by searching for the fingerprint, without the run
 * that filed it telling anyone.
 *
 *   node findings.mjs read <issues dir> <repository> <tracked files>
 *       the drafts as JSON: title, text, blocking, fingerprint, and whether they name the app
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** The same finding in two apps has the same title, written the same way give or take case and spaces. */
export const fingerprintOf = (title) => createHash('sha256').update(title.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12);

/** The marker an issue or a comment carries for each finding it stands for. */
export const marker = (fingerprint) => `<!-- nldd-finding ${fingerprint} -->`;
export const markersIn = (text) => [...text.matchAll(/<!-- nldd-finding ([0-9a-f]{12}) -->/g)].map((match) => match[1]);

/**
 * Whether a text names the app: its repository, its owner, or a file it tracks. The design system
 * has the same owner as some apps, so its own addresses do not count.
 */
export function namesApp(text, repository, tracked) {
	const plain = text.replace(/NederlandseDigitaleDienst\/design-system/gi, '').replace(/design\.digitaledienst\.overheid\.nl/gi, '').toLowerCase();
	const [owner, name] = repository.toLowerCase().split('/');
	return plain.includes(name) || plain.includes(owner) || tracked.some((file) => file.includes('/') && plain.includes(file.toLowerCase()));
}

/** A draft as the agent wrote it. A draft without a title is no finding. */
export function readDraft(text) {
	const [first = '', second = '', ...rest] = text.split('\n');
	const title = first.replace(/^#\s*/, '').trim();
	const flag = /^blocking:\s*(true|false)\s*$/i.exec(second.trim());
	const body = (flag ? rest : [second, ...rest]).join('\n').trim();
	return title ? { title, body, blocking: flag?.[1].toLowerCase() === 'true', fingerprint: fingerprintOf(title) } : undefined;
}

export function readDrafts(dir, repository, tracked) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((file) => file.endsWith('.md'))
		.sort()
		.map((file) => readDraft(readFileSync(join(dir, file), 'utf8')))
		.filter(Boolean)
		.map((draft) => ({ ...draft, namesApp: namesApp(`${draft.title}\n${draft.body}`, repository, tracked) }));
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'read') {
	const [dir, repository, trackedFile] = rest;
	console.log(JSON.stringify(readDrafts(dir, repository, readFileSync(trackedFile, 'utf8').split('\n').filter(Boolean))));
}
