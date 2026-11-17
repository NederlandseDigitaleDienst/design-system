/**
 * The skills of the plugin, as the site presents them.
 *
 * They are named on "Aan de slag" and on their own page. This is the one
 * place that says what each is for, so the two cannot drift
 * apart, and site.test.mjs checks the list against the directories in skills/:
 * a skill that is added or removed there fails the test until it is described
 * here.
 *
 * Each skill is presented by the task it does, with its name second. A reader
 * comes with something to do, not with a skill name in mind. The tasks, their
 * order and their icons are those of the landing page (www/index.html).
 */

export const SKILLS = [
	{
		name: 'nldd-design-build',
		task: 'Bouw een applicatie',
		icon: 'wrench',
		text: 'De patronen, en hoe je componenten samenstelt.',
	},
	{
		name: 'nldd-design-migrate',
		task: 'Zet een bestaande frontend om',
		icon: 'arrow-left-right',
		text: 'Bijvoorbeeld vanaf Tailwind of een ander design system.',
	},
	{
		name: 'nldd-design-validate',
		task: 'Valideer wat er staat',
		icon: 'check-mark-circle',
		text: 'Markup nalopen met nldd lint, voordat je klaar zegt te zijn.',
	},
	{
		name: 'nldd-design-upgrade',
		task: 'Stap over naar een nieuwe versie',
		icon: 'arrow-up-circle',
		text: 'Met de wijzigingen uit de changelog toegepast.',
	},
	{
		name: 'nldd-design',
		task: 'Zoek een component of icoon op',
		icon: 'magnifier',
		text: 'Ook attributen, slots en events, en wat er per versie veranderde.',
	},
	{
		name: 'nldd-design-contribute',
		task: 'Stel een verbetering voor',
		icon: 'lightbulb',
		text: 'Een ontbrekend component, een patroon of een bug.',
	},
];

/** The two commands that install the plugin in Claude Code. */
export const INSTALL = [
	'/plugin marketplace add NederlandseDigitaleDienst/ai-plugins',
	'/plugin install nldd-design-system@nldd',
].join('\n');

/** What a Markdown page can insert with `{{name}}`. */
export const MARKDOWN_INSERTS = {
	skillsInstall: `\`\`\`text\n${INSTALL}\n\`\`\``,
	// The same rows as on the landing page, with a line on what each one knows.
	// Written without blank lines: Markdown ends an HTML block at the first one.
	skillsList: [
		'<nldd-list appearance="box-tinted" accessible-label="De zes skills">',
		...SKILLS.map(
			(skill) => `<nldd-list-item>
	<nldd-icon-cell size="32" icon="${skill.icon}"></nldd-icon-cell>
	<nldd-spacer-cell size="12"></nldd-spacer-cell>
	<nldd-text-cell text="${skill.task}" supporting-text="**${skill.name}** ${skill.text}"></nldd-text-cell>
</nldd-list-item>`,
		),
		'</nldd-list>',
	].join('\n'),
};
