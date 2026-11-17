/**
 * Every committed file a script writes: which npm script produces it, what has
 * to run first, and when a drift check holds it to its source.
 *
 * - `after` names the scripts whose output this one reads. The component
 *   reference reads custom-elements.json for what mixins bring in, so it comes
 *   after generate:cem; run the other way round it describes the old manifest.
 * - `check: 'pr'` runs in validate.yml on every pull request and push to main
 *   (`npm run check:generated`). `check: 'release'` is written by the release
 *   pipeline (prepareCmd in .releaserc.json) and only has to be current then.
 *
 * `npm run generate:all` runs the producers of the 'pr' entries in this order.
 * A tracked file that says it is generated and is in no entry here fails
 * generated-files.test.mjs.
 */

export const GENERATED = [
	{
		script: 'generate:colors',
		files: ['src/assets/styles/colors.generated.css'],
		check: 'pr',
	},
	{
		script: 'generate:themes',
		after: ['generate:colors'],
		files: ['src/assets/styles/themes', 'src/assets/styles/themes.css', 'src/assets/favicon'],
		check: 'pr',
	},
	{
		script: 'generate:cem',
		files: [
			'custom-elements.json',
			'lint/data.generated.json',
			'src/assets/styles/removed-tokens.json',
			'src/translations/removed-keys.json',
			'src/utilities/dev-rules.generated.ts',
			'src/utilities/autoloader.generated.ts',
		],
		check: 'pr',
	},
	{
		script: 'generate:component-reference',
		after: ['generate:cem'],
		files: ['skills/nldd-design/reference.md'],
		check: 'pr',
	},
	{
		script: 'generate:skill-patterns',
		files: ['skills/nldd-design-build/patterns'],
		check: 'pr',
	},
	{
		script: 'generate:skill-principles',
		files: ['skills/nldd-design/design-guidelines.md'],
		check: 'pr',
	},
	{
		script: 'generate:translations',
		files: ['src/translations/nl.generated.ts'],
		check: 'pr',
	},
	{
		script: 'build:exports',
		files: ['package.json'],
		check: 'pr',
	},
	{
		script: 'generate:plugin-version',
		files: ['.claude-plugin', '.cursor-plugin'],
		check: 'pr',
	},
	{
		// Copied from the root CHANGELOG, which only gains its version heading
		// from semantic-release: between releases the copy is behind on purpose.
		script: 'generate:skill-changelog',
		files: ['skills/nldd-design/changelog.md'],
		check: 'release',
	},
	{
		// Carries the version and date of the release itself.
		script: 'generate:publiccode',
		files: ['publiccode.yml'],
		check: 'release',
	},
];

/**
 * The entries in an order where each comes after what it reads, keeping the
 * order of the table otherwise. Throws on an `after` that names no entry.
 */
export function inOrder(entries = GENERATED) {
	const byScript = new Map(entries.map((entry) => [entry.script, entry]));
	const done = new Set();
	const ordered = [];
	const visit = (entry, path = []) => {
		if (done.has(entry.script)) return;
		if (path.includes(entry.script)) throw new Error(`generated files: ${[...path, entry.script].join(' → ')} is a cycle.`);
		for (const name of entry.after ?? []) {
			const before = byScript.get(name);
			if (!before) throw new Error(`generated files: ${entry.script} comes after ${name}, which produces nothing here.`);
			visit(before, [...path, entry.script]);
		}
		done.add(entry.script);
		ordered.push(entry);
	};
	entries.forEach((entry) => visit(entry));
	return ordered;
}
