/**
 * Turns the form of an issue that asks to be on fleet.json into the entry, and
 * writes it into fleet.json, in alphabetical order. An entry for a repository
 * that is on the list already replaces it.
 *
 * The body of the issue is the input of a stranger, so it arrives in an
 * environment variable and is only parsed here, never run.
 *
 * Usage: ISSUE_BODY=... node scripts/fleet-request.js
 * Prints the entry as JSON; fails with the reason on a wrong request.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byRepository, fleetErrors } from './lib/fleet.js';

/** The answers of an issue form, by their heading. "_No response_" is no answer. */
export function formAnswers(body) {
	const answers = {};
	for (const section of `\n${body}`.split(/\n### /).slice(1)) {
		const [heading, ...rest] = section.split('\n');
		const value = rest.join('\n').trim();
		answers[heading.trim()] = value === '_No response_' ? '' : value;
	}
	return answers;
}

/** The entry an issue asks for. */
export function requestedEntry(body) {
	const answers = formAnswers(body);
	const entry = { repository: (answers.Repository ?? '').replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '') };
	if (/- \[[xX]\]/.test(answers.Agent ?? '')) entry.agent = true;
	if (answers.Bouwcommando) entry.build = answers.Bouwcommando;
	if (answers['Map van de site']) entry.site = answers['Map van de site'];
	return entry;
}

/** fleet.json with the entry in its place. */
export function withEntry(fleet, entry) {
	const others = fleet.repositories.filter(({ repository }) => repository.toLowerCase() !== entry.repository.toLowerCase());
	const repositories = [...others, entry].sort(byRepository);
	return { ...fleet, repositories };
}

/** One line per entry, as the file is written by hand. */
export function formatFleet(fleet) {
	const line = (entry) => `{ ${Object.entries(entry).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(', ')} }`;
	const lines = fleet.repositories.map((entry) => `\t\t${line(entry)}`);
	return lines.length === 0 ? '{\n\t"repositories": []\n}\n' : `{\n\t"repositories": [\n${lines.join(',\n')}\n\t]\n}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const path = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fleet.json');
	const entry = requestedEntry(process.env.ISSUE_BODY ?? '');
	const fleet = withEntry(JSON.parse(readFileSync(path, 'utf8')), entry);
	const errors = fleetErrors(fleet);
	if (errors.length > 0) {
		console.error(errors.join('\n'));
		process.exit(1);
	}
	writeFileSync(path, formatFleet(fleet));
	console.log(JSON.stringify(entry));
}
