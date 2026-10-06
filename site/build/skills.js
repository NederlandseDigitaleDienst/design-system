/**
 * The skills of the plugin, as the site presents them.
 *
 * They are named on the landing page, on "Aan de slag" and on their own page.
 * This is the one place that says what each is for, so the three cannot drift
 * apart, and site.test.mjs checks the list against the directories in skills/:
 * a skill that is added or removed there fails the test until it is described
 * here.
 *
 * Each skill is presented by the task it does, with its name second. A reader
 * comes with something to do, not with a skill name in mind.
 */

import { codeViewer, escapeHtml } from './markdown.js';

export const SKILLS = [
	{
		name: 'nldd-design',
		task: 'Opzoeken',
		text: 'Welke componenten, attributen, slots, events en iconen er zijn, en wat er per versie veranderde.',
	},
	{
		name: 'nldd-design-build',
		task: 'Bouwen',
		text: 'Een applicatie opzetten: de patronen, en hoe je componenten samenstelt.',
	},
	{
		name: 'nldd-design-migrate',
		task: 'Omzetten',
		text: 'Een bestaande frontend overzetten, bijvoorbeeld vanaf Tailwind of een ander design system.',
	},
	{
		name: 'nldd-design-upgrade',
		task: 'Bijwerken',
		text: 'Naar een nieuwere versie gaan, met de wijzigingen uit de changelog toegepast.',
	},
	{
		name: 'nldd-design-contribute',
		task: 'Voorstellen',
		text: 'Een ontbrekend component, een patroon of een bug melden.',
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
	skillsTable: [
		'| Waarvoor | Skill | Wat hij doet |',
		'|---|---|---|',
		...SKILLS.map((skill) => `| ${skill.task} | \`${skill.name}\` | ${skill.text} |`),
	].join('\n'),
};

/** What the landing page can insert with `{{name}}`. */
export const HTML_INSERTS = {
	skillsInstall: codeViewer(INSTALL),
	skillsList: `<nldd-rich-text class="site-skills">
						<ul>
							${SKILLS.map(
								(skill) =>
									`<li><strong>${escapeHtml(skill.task)}.</strong> ${escapeHtml(skill.text)} <code>${skill.name}</code></li>`,
							).join('\n\t\t\t\t\t\t\t')}
						</ul>
					</nldd-rich-text>`,
};
