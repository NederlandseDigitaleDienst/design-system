/**
 * A breaking change reaches an app as a pull request from `nldd upgrade`. What
 * a rule finds is on its worklist, with the place; what no rule finds is only
 * a line of the changelog under "Brekende wijzigingen onderweg", and someone
 * has to find each place by hand. So every breaking change of the upcoming
 * release says which it is: it names the rule that finds it, or says why there
 * is none.
 *
 * Named means in backticks: a rule id, or a token, event or translation key
 * that is gone, which the linter reports by itself. Otherwise the entry says
 * `No rule:` and the reason, such as a change in spacing no source shows.
 */

import { upcoming } from './removed-tokens.js';

/** The bullets of one `###` section of a block, each with its continuation lines. */
function bulletsOf(block, heading) {
	const section = block.split(/\n(?=### )/).find((part) => part.startsWith(`### ${heading}\n`));
	if (!section) return [];
	return section
		.split('\n')
		.slice(1)
		.join('\n')
		.split(/\n(?=- )/)
		.map((bullet) => bullet.trim())
		.filter((bullet) => bullet.startsWith('- '));
}

/** The first sentence of a bullet, to name it in a message: its bold lead, or its first words. */
const leadOf = (bullet) => (/^- \*\*(.+?)\*\*/.exec(bullet)?.[1] ?? bullet.slice(2, 80)).replace(/[.:]$/, '');

/**
 * @param {string} changelog - CHANGELOG.md
 * @param {Iterable<string>} known - every name a rule reports on its own: rule ids, removed tokens, events and keys
 * @returns {string[]} the leads of the breaking changes of the upcoming release that name no rule and give no reason
 */
export function uncoveredBreaking(changelog, known) {
	const names = new Set(known);
	return bulletsOf(upcoming(changelog), 'Breaking')
		.filter((bullet) => {
			if (/\bNo rule: \S/.test(bullet)) return false;
			return ![...bullet.matchAll(/`([^`]+)`/g)].some(([, quoted]) => names.has(quoted));
		})
		.map(leadOf);
}
