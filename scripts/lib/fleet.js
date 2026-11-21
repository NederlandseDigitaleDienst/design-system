/**
 * fleet.json: the repositories that get a pull request from the design system
 * after each release. A team puts its own repository on it, with a pull
 * request of its own, so the list is what each team says about itself.
 *
 * Read here for three places: the fleet workflow, the section of the README
 * and the page on upgrading. What an entry means is said once, in FIELDS.
 */

/** What an entry may say, and of what type. */
export const FIELDS = {
	repository: { type: 'string', text: 'owner/name on GitHub' },
	agent: { type: 'boolean', text: 'an agent works the list of what is left before the pull request opens' },
	sandbox: { type: 'boolean', text: '`false` runs the commands of the agent without a sandbox; only for a repository whose content the design system trusts as its own' },
	build: { type: 'string', text: 'the command that builds the site from a clean checkout, for pictures of before and after' },
	site: { type: 'string', text: 'the directory `build` writes to' },
};

const REPOSITORY = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;

/** The order of the list: by name, without regard to case. One comparison, so the check and the form agree. */
export const byRepository = (a, b) => {
	const [x, y] = [a.repository.toLowerCase(), b.repository.toLowerCase()];
	return x < y ? -1 : x > y ? 1 : 0;
};

/**
 * @param {unknown} fleet - the parsed contents of fleet.json
 * @returns {string[]} what is wrong with it, one line each; none when it is right
 */
export function fleetErrors(fleet) {
	if (!fleet || typeof fleet !== 'object' || !Array.isArray(fleet.repositories)) return ['fleet.json holds an object with a list "repositories".'];
	const errors = [];
	const seen = new Set();
	fleet.repositories.forEach((entry, index) => {
		const at = `repositories[${index}]`;
		if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return errors.push(`${at} is not an object.`);
		for (const [key, value] of Object.entries(entry)) {
			if (!(key in FIELDS)) errors.push(`${at} has "${key}", which is not one of ${Object.keys(FIELDS).join(', ')}.`);
			else if (typeof value !== FIELDS[key].type) errors.push(`${at}.${key} is a ${FIELDS[key].type}.`);
		}
		if (typeof entry.repository !== 'string' || !REPOSITORY.test(entry.repository)) errors.push(`${at}.repository is owner/name, such as NederlandseDigitaleDienst/design-system.`);
		else if (seen.has(entry.repository.toLowerCase())) errors.push(`${entry.repository} is on the list twice.`);
		else seen.add(entry.repository.toLowerCase());
		if (Boolean(entry.build) !== Boolean(entry.site)) errors.push(`${at} needs both "build" and "site", or neither.`);
	});
	const named = fleet.repositories.map((entry) => ({ repository: String(entry?.repository ?? '') }));
	if (named.some((entry, index) => index > 0 && byRepository(named[index - 1], entry) > 0)) errors.push('The repositories are in alphabetical order, so an entry lands in one place and two teams do not edit the same line.');
	return errors;
}

/** The entries as the fleet workflow runs them: every field filled in. */
export function fleetMatrix(fleet) {
	return fleet.repositories.map(({ repository, agent = false, sandbox = true, build = '', site = '' }) => ({ repository, agent, sandbox, build, site }));
}

/** The list as Markdown, for the README and the page on upgrading. */
export function fleetMarkdown(fleet) {
	if (fleet.repositories.length === 0) return 'Nog geen repository.';
	const yes = (value) => (value ? 'ja' : 'nee');
	return [
		'| Repository | Agent | Beelden |',
		'| --- | --- | --- |',
		...fleet.repositories.map(({ repository, agent, build }) => `| [${repository}](https://github.com/${repository}) | ${yes(agent)} | ${build ? 'ja' : agent ? 'als de agent vindt hoe de site bouwt' : 'nee'} |`),
	].join('\n');
}
