/**
 * What `nldd upgrade` did and what is left, as Markdown: the text of a pull
 * request, and the worklist for whoever finishes it. In Dutch, as the teams
 * that get the pull request write theirs. A rule's message stays as the linter
 * gives it.
 */

const SITE = 'https://design.digitaledienst.overheid.nl';

/** More places than this under one rule and the list is cut: the count says the rest, and `nldd lint` lists them all. */
const MAX_PLACES = 12;

const plural = (count, one, more) => `${count} ${count === 1 ? one : more}`;

const KINDS = { manifest: 'afhankelijkheid', record: 'vastgelegde versie', reference: 'verwijzing' };

function versionSection({ pinned, notRaised, lockfiles, to }) {
	const lines = ['## De versie', ''];
	if (pinned.length === 0) lines.push(`Geen plek gevonden die een oudere versie dan ${to} noemt.`);
	for (const { file, kind, from, line } of pinned) lines.push(`- \`${file}:${line}\`: ${KINDS[kind]}, van ${from} naar ${to}`);
	for (const { file, command, ok, error } of lockfiles) {
		lines.push(ok ? `- \`${file}\`: bijgewerkt met \`${command}\`` : `- \`${file}\`: **niet bijgewerkt**. Draai \`${command}\`${error && error !== 'not run' ? ` (${error})` : ''}`);
	}
	if (notRaised.length > 0) {
		lines.push('', 'Niet aangepast, want hier staat iets anders dan één versie:', '');
		for (const { file, line, text } of notRaised) lines.push(`- \`${file}:${line}\`: \`${text}\``);
	}
	return lines;
}

function fixedSection({ fixed, files }) {
	if (fixed.total === 0 && fixed.references === 0) return ['## Automatisch aangepast', '', `Niets: in de ${files} gelezen bestanden stond niets wat alleen een andere naam kreeg.`];
	const lines = ['## Automatisch aangepast', '', `${plural(fixed.total, 'plek', 'plekken')} in ${plural(fixed.files, 'bestand', 'bestanden')}, door \`nldd lint --fix\`. Dit is alleen wat zeker is: een naam of waarde die anders heet en hetzelfde betekent.`, ''];
	for (const [rule, count] of Object.entries(fixed.byRule).sort((a, b) => b[1] - a[1])) lines.push(`- \`${rule}\`: ${count}`);
	if (fixed.references > 0) lines.push(`- ${plural(fixed.references, 'import, klasse of selector', 'imports, klassen en selectors')} van een hernoemde tag`);
	for (const place of fixed.stillNamed) lines.push(`- Noemt nog een oude tag: \`${place}\``);
	return lines;
}

const placeLines = ({ rule, places }) => [
	...places.slice(0, MAX_PLACES).map(({ file, line, tag }) => `- [ ] \`${file}:${line}\`${tag ? ` \`<${tag}>\`` : ''}`),
	...(places.length > MAX_PLACES ? [`- [ ] en nog ${places.length - MAX_PLACES}: \`npx nldd lint --select ${rule}\``] : []),
];

function workSection({ work, unread }) {
	if (work.length === 0 && unread.length === 0) return ['## Nog te doen', '', 'Niets. De linter van deze versie vindt geen fouten en niets wat niet meer bestaat.'];
	const total = work.reduce((sum, { places }) => sum + places.length, 0);
	const lines = ['## Nog te doen', '', `${plural(total, 'plek', 'plekken')} waar iemand moet kiezen. Ze komen van deze upgrade: iets bestaat niet meer, of een regel is nieuw sinds de versie waar de app vandaan komt.`];
	for (const entry of work) {
		lines.push('', `### \`${entry.rule}\` (${entry.places.length}${entry.severity === 'error' ? ', fout' : ''})`, '', entry.message, '', ...placeLines(entry));
	}
	if (unread.length > 0) {
		lines.push('', '### Niet gelezen', '', 'In deze bestanden staan componenten op een manier die de linter niet kan lezen. Loop ze zelf na.', '');
		for (const file of unread) lines.push(`- [ ] \`${file}\``);
	}
	return lines;
}

/** The first sentence of an entry: its bold lead, or its first line. */
const leadOf = (text) => text.split('\n')[0].replace(/^\*\*(.+?)\*\*.*$/, '$1').replace(/[.,:]$/, '');

function breakingSection({ breaking, from, to }) {
	if (!from || breaking.total === 0) return [];
	const { total, touching } = breaking;
	const lines = ['## Brekende wijzigingen onderweg', '', `Tussen ${from} en ${to} staan er ${total} in de changelog. ${touching.length === 0 ? 'Geen ervan noemt een component dat deze app gebruikt.' : `${touching.length} ${touching.length === 1 ? 'noemt' : 'noemen'} een component dat deze app gebruikt. Niet elke wijziging heeft een lintregel, dus lees ze door.`}`];
	if (touching.length > 0) {
		lines.push('', '<details>', '<summary>De lijst</summary>', '');
		for (const { version, text, uses } of touching) lines.push(`- [${version}](${SITE}/changelog/${version}/): ${leadOf(text)} (${uses.slice(0, 3).map((tag) => `\`${tag}\``).join(', ')})`);
		lines.push('', '</details>');
	}
	return lines;
}

/** Where a binding or another file decides: no finding, and still a place the upgrade can break. */
function undecidedSection({ undecided, types }) {
	if (undecided.length === 0) return [];
	const total = undecided.reduce((sum, { places }) => sum + places.length, 0);
	// With the project's TypeScript installed, a string in JSX is read as text and most of these are decided.
	const untyped = types?.without > 0 ? ['', `De typen van het project zijn niet gelezen, want TypeScript staat niet in \`node_modules\`. Met \`nldd upgrade --install\` leest de linter ze wel, en blijft hier minder over.`] : [];
	return [
		'## Niet te beslissen in de bron',
		'',
		`${plural(total, 'plek', 'plekken')} waar de inhoud van een element uit een variabele of uit een onderdeel van de app komt. Of de regel daar geldt, staat niet in dit bestand, dus de linter meldt het niet als fout. Loop ze na, of lees de draaiende app met \`--url\`.`,
		...untyped,
		...undecided.flatMap((entry) => ['', '<details>', `<summary><code>${entry.rule}</code> (${entry.places.length})</summary>`, '', entry.message, '', ...placeLines(entry), '', '</details>']),
	];
}

/** Findings of rules the project had before this upgrade: named, and not part of the work. */
function standingSection({ standing, from }) {
	if (standing.length === 0) return [];
	const total = standing.reduce((sum, { places }) => sum + places.length, 0);
	return [
		'## Stond er al',
		'',
		`${plural(total, 'waarschuwing', 'waarschuwingen')} van regels die er in ${from ?? 'deze versie'} ook waren. Ze horen niet bij deze upgrade.`,
		'',
		...standing.map(({ rule, places }) => `- \`${rule}\`: ${places.length}`),
	];
}

/** The components of the app that rendered the most places of a rule: where one change fixes many. */
function byComponent(places) {
	const counts = new Map();
	for (const { renderedBy } of places) if (renderedBy) counts.set(renderedBy, (counts.get(renderedBy) ?? 0) + 1);
	return [...counts].sort((a, b) => b[1] - a[1]);
}

function renderedSection({ rendered }) {
	if (!rendered) return [];
	const lines = ['## Op de draaiende pagina', '', `${plural(rendered.pages, 'pagina', "pagina's")} gelezen zoals de browser ze bouwt. Hier staat ook wat een expressie of een variabele invult, en dat laat de bron niet zien.`];
	for (const { url } of rendered.failed) lines.push('', `Niet geopend: ${url}`);
	if (rendered.rules.length === 0) lines.push('', 'Geen bevindingen.');
	for (const { rule, severity, message, places } of rendered.rules) {
		lines.push('', `### \`${rule}\` (${places.length}${severity === 'error' ? ', fout' : ''})`, '', message, '');
		const components = byComponent(places);
		for (const [name, count] of components.slice(0, MAX_PLACES)) lines.push(`- [ ] \`${name}\`: ${count}`);
		if (components.length === 0) for (const { file, line, tag } of places.slice(0, MAX_PLACES)) lines.push(`- [ ] \`${file}:${line}\`${tag ? ` \`<${tag}>\`` : ''}`);
	}
	return lines;
}

/**
 * @param {object} result - from upgradeProject()
 * @returns {string} Markdown
 */
export function formatReport(result) {
	const title = result.from ? `# Designsysteem van ${result.from} naar ${result.to}` : `# Designsysteem naar ${result.to}`;
	const sections = [versionSection(result), fixedSection(result), workSection(result), undecidedSection(result), renderedSection(result), breakingSection(result), standingSection(result)].filter((lines) => lines.length > 0);
	const closing = result.rendered
		? ['## Kijken', '', 'Leg oud en nieuw naast elkaar:', '', '```', 'npx nldd compare <oud> <nieuw> --out vergelijking', '```']
		: [
				'## Kijken',
				'',
				'De bron laat niet alles zien. Draai de app en lees de pagina zoals de browser hem bouwt, en leg oud en nieuw naast elkaar:',
				'',
				'```',
				'npx nldd upgrade --url http://localhost:5173 --crawl',
				'npx nldd compare <oud> <nieuw> --out vergelijking',
				'```',
			];
	return `${[[title], ...sections, closing].map((lines) => lines.join('\n')).join('\n\n')}\n`;
}

/** One line for the terminal, when the report goes to a file. */
export function formatSummary(result) {
	const rendered = result.rendered?.rules.reduce((sum, { places }) => sum + places.length, 0) ?? 0;
	const work = result.work.reduce((sum, { places }) => sum + places.length, 0) + result.unread.length + rendered;
	const version = result.pinned.length > 0 ? `${result.from} -> ${result.to} in ${plural(result.pinned.length, 'place', 'places')}` : `already at ${result.to}`;
	return `${version}; fixed ${result.fixed.total} in ${plural(result.fixed.files, 'file', 'files')}; ${plural(work, 'place', 'places')} left to do.`;
}
