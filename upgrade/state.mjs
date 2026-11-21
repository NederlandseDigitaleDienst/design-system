/**
 * What a pull request of the action remembers between runs. It is a block at the end of its
 * text, hidden in a comment: the version the project came from, the places that were on the
 * list, and the choices made so far. A later release continues the pull request from there.
 *
 *   node state.mjs read <body>               the state, as JSON ({} without one)
 *   node state.mjs choices <body>            the section "Keuzes" of the text, without its heading
 *   node state.mjs new <upgrade.json> <state> "true" when the list has a place the state had not
 *   node state.mjs write <upgrade.json>      the state of this run, as JSON; deliver.sh adds how the
 *                                            site builds and writes it as the block
 *
 * Reads only JSON and text the action wrote itself, so it runs outside the confinement.
 */

import { readFileSync } from 'node:fs';

const MARK = 'nldd-upgrade-state';
const BLOCK = new RegExp(`<!-- ${MARK} (\\{[^]*?\\}) -->`);

/** The places of a run, counted per rule, file and element: a line moves, these do not. */
export function placesOf(result) {
	const counts = {};
	const add = (key) => (counts[key] = (counts[key] ?? 0) + 1);
	for (const { rule, places } of [...result.work, ...result.undecided]) for (const { file, tag } of places) add(`${rule}|${file}|${tag ?? ''}`);
	for (const file of result.unread) add(`file-not-read|${file}|`);
	return counts;
}

/** Whether the list holds more of a place than the state did. */
export const hasNew = (counts, before = {}) => Object.entries(counts).some(([key, count]) => count > (before[key] ?? 0));

export function readState(body) {
	try {
		return JSON.parse(BLOCK.exec(body)?.[1] ?? '{}');
	} catch {
		return {};
	}
}

export function choicesOf(body) {
	const section = /\n## Keuzes\n([^]*?)(?=\n## |\n<!-- |$)/.exec(body);
	return section ? `${section[1].trim()}\n` : '';
}

/** The block, as deliver.sh writes it with jq; here for the tests. */
export const stateBlock = (state) => `<!-- ${MARK} ${JSON.stringify(state)} -->`;

const [command, first, second] = process.argv.slice(2);
const text = (path) => readFileSync(path, 'utf8');
const json = (path) => JSON.parse(text(path));
if (command === 'read') console.log(JSON.stringify(readState(text(first))));
else if (command === 'choices') process.stdout.write(choicesOf(text(first)));
else if (command === 'new') console.log(String(hasNew(placesOf(json(first)), json(second).places)));
else if (command === 'write') console.log(JSON.stringify({ from: json(first).from, places: placesOf(json(first)) }));
