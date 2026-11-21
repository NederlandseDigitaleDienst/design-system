import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { createLinter } from './linter.js';
import { loadData, resolveSeverities } from './rule-data.js';
import { lintProject } from './session.js';
import { lockfileCommand } from './lockfiles.js';
import { compareVersions, raisePins } from './pins.js';
import { breakingFor, upgradeProject, withRendered } from './upgrade.js';
import { formatReport, formatSummary, splitReport } from './upgrade-report.js';

const DATA = loadData();
const severities = resolveSeverities(DATA, {});

function project(files) {
	const root = mkdtempSync(join(tmpdir(), 'nldd-upgrade-'));
	for (const [name, source] of Object.entries(files)) {
		mkdirSync(dirname(join(root, name)), { recursive: true });
		writeFileSync(join(root, name), source);
	}
	return root;
}

const read = (root, name) => readFileSync(join(root, name), 'utf8');

describe('the version, wherever a project names it', () => {
	it('orders versions by number, not as text', () => {
		assert.ok(compareVersions('0.9.0', '0.13.2') < 0);
		assert.ok(compareVersions('0.27.1', '0.27.0') > 0);
		assert.equal(compareVersions('1.0.0', '1.0.0'), 0);
	});

	it('leaves a committed copy of the package alone: its version is that of the files next to it', () => {
		const copy = JSON.stringify({ name: '@nldd/design-system', version: '0.20.0', main: 'dist/nldd.js' }, null, 2);
		assert.deepEqual(raisePins('package.json', copy, '0.28.0'), { source: copy, raised: [], left: [] });
	});

	it('keeps the address of a tarball where the record next to it stays', () => {
		const lock = JSON.stringify({ '@nldd/design-system': { version: '0.13.2', resolved: 'https://registry.npmjs.org/@nldd/design-system/-/design-system-0.13.2.tgz', integrity: 'sha512-ours' } }, null, 2);
		const { source, raised, left } = raisePins('pins.json', lock, '0.28.0', () => undefined);
		assert.equal(source, lock);
		assert.deepEqual(raised, []);
		assert.deepEqual(left.map(({ reason }) => reason), ['other-hash', 'record-stays']);
	});

	it('raises a dependency and keeps the range the project chose', () => {
		const manifest = (range) => JSON.stringify({ dependencies: { '@nldd/design-system': range, lit: '^3.0.0' } }, null, 2);
		for (const [from, to] of [['^0.13.2', '^0.27.1'], ['~0.13.2', '~0.27.1'], ['0.13.2', '0.27.1']]) {
			const { source, raised } = raisePins('package.json', manifest(from), '0.27.1');
			assert.equal(source, manifest(to));
			assert.deepEqual(raised, [{ kind: 'manifest', from: '0.13.2', line: 3 }]);
		}
	});

	it('leaves a range that is no single version, and says so', () => {
		for (const range of ['workspace:*', 'latest', '>=0.13.0', 'github:org/repo']) {
			const source = JSON.stringify({ dependencies: { '@nldd/design-system': range } });
			const result = raisePins('package.json', source, '0.27.1');
			assert.equal(result.source, source);
			assert.equal(result.left.length, 1, range);
		}
	});

	it('never lowers a version, and leaves one that is there already', () => {
		const source = JSON.stringify({ dependencies: { '@nldd/design-system': '^0.28.0' } });
		assert.equal(raisePins('package.json', source, '0.27.1').source, source);
		assert.deepEqual(raisePins('package.json', source, '0.28.0').raised, []);
	});

	it('raises a version in an address or a command', () => {
		const source = '<script type="module" src="https://cdn.jsdelivr.net/npm/@nldd/design-system@0.13.2/dist/index.js"></script>\nnpx @nldd/design-system@0.13.2 lint\n';
		const { source: raised } = raisePins('index.html', source, '0.27.1');
		assert.equal(raised, source.replaceAll('0.13.2', '0.27.1'));
	});

	it('raises an override, a resolution or any other key that is the name of the package', () => {
		const manifest = (range) => JSON.stringify({ dependencies: { '@nldd/design-system': range }, overrides: { '@nldd/design-system': range } }, null, 2);
		assert.equal(raisePins('package.json', manifest('^0.13.2'), '0.27.1').source, manifest('^0.27.1'));
		const versions = (range) => JSON.stringify({ '@nldd/design-system': range, lit: '3.0.0' });
		assert.equal(raisePins('versions.json', versions('0.13.2'), '0.27.1').source, versions('0.27.1'));
		assert.deepEqual(raisePins('versions.json', versions('see the docs'), '0.27.1').left, []);
	});

	it('leaves an address in a tag with the integrity hash of the file it loads, and says so', () => {
		const source = '<script src="https://cdn.jsdelivr.net/npm/@nldd/design-system@0.13.2/dist/index.js" integrity="sha384-abc" crossorigin="anonymous"></script>\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nldd/design-system@0.13.2/dist/styles.css">\n';
		const result = raisePins('index.html', source, '0.27.1');
		assert.equal(result.source, source.replace('@0.13.2/dist/styles', '@0.27.1/dist/styles'));
		assert.deepEqual(result.left.map(({ line }) => line), [1]);
	});

	it('raises the address of the tarball', () => {
		const source = 'curl -O https://registry.npmjs.org/@nldd/design-system/-/design-system-0.13.2.tgz\n';
		assert.equal(raisePins('fetch.sh', source, '0.27.1').source, source.replace('0.13.2', '0.27.1'));
	});

	describe('a record with a hash', () => {
		const registry = { '0.16.0': { integrity: 'sha512-AAAA', shasum: 'a'.repeat(40) }, '0.27.1': { integrity: 'sha512-BBBB', shasum: 'b'.repeat(40) } };
		const dist = (version) => registry[version];

		it('gets the version and the hash of the new one, whether it names the package or stands under its name', () => {
			const named = (version, { integrity, shasum }) => JSON.stringify({ package: '@nldd/design-system', version, integrity, shasum }, null, 2);
			assert.equal(raisePins('pinned.json', named('0.16.0', registry['0.16.0']), '0.27.1', dist).source, named('0.27.1', registry['0.27.1']));
			const keyed = (version, { integrity }) => JSON.stringify({ vendored: { '@nldd/design-system': { version, integrity } } }, null, 2);
			assert.equal(raisePins('vendor.json', keyed('0.16.0', registry['0.16.0']), '0.27.1', dist).source, keyed('0.27.1', registry['0.27.1']));
		});

		it('stays as it is when the hash is not the one the registry has for that version', () => {
			const source = JSON.stringify({ name: '@nldd/design-system', version: '0.16.0', integrity: 'sha384-of-one-file' }, null, 2);
			const result = raisePins('pinned.json', source, '0.27.1', dist);
			assert.equal(result.source, source);
			assert.equal(result.left.length, 1);
		});

		it('stays as it is when the registry does not answer', () => {
			const source = JSON.stringify({ name: '@nldd/design-system', version: '0.16.0', integrity: 'sha512-AAAA' }, null, 2);
			assert.equal(raisePins('pinned.json', source, '0.27.1').source, source);
		});
	});

	it('leaves a version in a JSON file that is not a record of the package', () => {
		const source = JSON.stringify({ name: 'my-app', version: '0.16.0', uses: '@nldd/design-system' });
		assert.equal(raisePins('app.json', source, '0.27.1').source, source);
	});

	it('finds the lockfile above a manifest, and the command that rewrites only that', () => {
		const root = project({ 'package-lock.json': '{}', 'apps/web/package.json': '{}' });
		const lock = lockfileCommand(join(root, 'apps/web'), root);
		assert.equal(lock.directory, root);
		assert.deepEqual(lock.command, ['npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund']]);
		assert.equal(lockfileCommand(join(project({ 'package.json': '{}' })), '/'), undefined);
	});
});

describe('the breaking changes on the way', () => {
	const breaking = {
		'0.13.0': ['Before the project started'],
		'0.14.0': ['`size` on `nldd-title` takes a name', '`nldd-kanban` has a new slot'],
		'0.15.0': ['`nldd-text` takes its text in a `<p>`'],
		'0.16.0': ['After the target'],
	};

	it('keeps those after the version a project has, up to the target, that name a component it uses', () => {
		const { total, touching } = breakingFor(breaking, '0.13.0', '0.15.0', '<nldd-title></nldd-title><nldd-text></nldd-text>');
		assert.equal(total, 3);
		assert.deepEqual(touching.map(({ version, uses }) => [version, uses]), [['0.14.0', ['nldd-title']], ['0.15.0', ['nldd-text']]]);
	});

	it('does not take a longer tag for a shorter one', () => {
		assert.deepEqual(breakingFor(breaking, '0.13.0', '0.15.0', '<nldd-title-cell></nldd-title-cell>').touching, []);
	});
});

describe('nldd upgrade', () => {
	const files = {
		'package.json': JSON.stringify({ dependencies: { '@nldd/design-system': '^0.20.0' } }, null, 2),
		'package-lock.json': '{}',
		'page.html': '<nldd-title size="2" heading-level="2" text="Aanvraag A-1042"></nldd-title>\n<nldd-title color="inherit" heading-level="2" text="Dossier D-318"></nldd-title>\n',
		'docs/index.md': '# Start\n\n<nldd-title size="4" heading-level="2" text="Mijn Dienst"></nldd-title>\n',
		'render.py': 'def title(level):\n    return f\'<nldd-title size="6" heading-level="{level}" text="Dakisolatie"></nldd-title>\'\n',
	};
	const upgrade = (root, options = {}) => {
		const ran = [];
		const run = (command, args) => {
			ran.push([command, ...args].join(' '));
			return { ok: true, output: '' };
		};
		return upgradeProject(DATA, { root, target: '0.27.1', breaking: { '0.22.0': ['`size` on `nldd-title` takes `display-1` to `display-6`'] }, config: {}, severities, run, ...options }).then((result) => ({ result, ran }));
	};

	it('raises the version, rewrites the lockfile and applies every fix, in each kind of file', async () => {
		const root = project(files);
		const { result, ran } = await upgrade(root);
		assert.equal(result.from, '0.20.0');
		assert.equal(result.to, '0.27.1');
		assert.match(read(root, 'package.json'), /"\^0\.27\.1"/);
		assert.deepEqual(ran, ['npm install --package-lock-only --ignore-scripts --no-audit --no-fund']);
		assert.match(read(root, 'page.html'), /size="display-2"/);
		assert.match(read(root, 'docs/index.md'), /size="display-4"/);
		assert.match(read(root, 'render.py'), /size="display-6" heading-level="\{level\}"/);
		assert.equal(result.fixed.total, 3);
		assert.deepEqual(result.fixed.byRule, { 'title-size-renamed': 3 });
	});

	it('lists what is left with its place, and changes nothing there', async () => {
		const root = project(files);
		const { result } = await upgrade(root);
		assert.deepEqual(result.work.map(({ rule, places }) => [rule, places]), [['title-color-no-effect', [{ file: 'page.html', line: 2, tag: 'nldd-title' }]]]);
		assert.match(read(root, 'page.html'), /color="inherit"/);
		assert.deepEqual(result.breaking.touching.map(({ version }) => version), ['0.22.0']);
	});

	it('keeps apart what a rule the project had already finds', async () => {
		const page = '<nldd-title text="Aanvraag A-1042"></nldd-title>\n';
		const since = (after) => ({ ...DATA, rules: DATA.rules.map((rule) => (rule.id === 'title-needs-heading-level' ? { ...rule, after } : rule)) });
		const upgraded = async (after) => (await upgradeProject(since(after), { root: project({ ...files, 'page.html': page }), target: '0.27.1', breaking: {}, config: {}, severities, run: () => ({ ok: true, output: '' }) }));
		const had = await upgraded('0.16.0');
		assert.deepEqual([had.work.length, had.standing.map(({ rule }) => rule)], [0, ['title-needs-heading-level']]);
		const brought = await upgraded('0.22.0');
		assert.deepEqual([brought.work.map(({ rule }) => rule), brought.standing.length], [['title-needs-heading-level'], 0]);
		assert.match(formatReport(had), /## Stond er al\n\n1 waarschuwing van regels die er in 0\.20\.0 ook waren/);
	});

	it('reads the project again after the list was worked, and holds what is left against the first run', async () => {
		const root = project(files);
		const { result: first } = await upgrade(root);
		// Someone works the list: the attribute that has no effect goes.
		writeFileSync(join(root, 'page.html'), read(root, 'page.html').replace(' color="inherit"', ''));
		const { result, ran } = await upgrade(root, { since: JSON.parse(JSON.stringify(first)) });
		assert.deepEqual(ran, [], 'a second reading installs nothing');
		assert.deepEqual([result.from, result.pinned, result.fixed.total], ['0.20.0', first.pinned, 3], 'the version and the fixes are those of the first run');
		assert.deepEqual(result.work, []);
		assert.deepEqual(result.earlier.work, [{ rule: 'title-color-no-effect', places: 1 }]);
		const report = formatReport({ ...result, notes: '- De kleur volgt nu het vlak.\n' });
		assert.match(report, /## Afgewerkt na de opdracht\n\nDe opdracht liet 1 plek over\..*Er staat niets meer open\./);
		assert.match(report, /- `title-color-no-effect`: van 1 naar 0/);
		assert.match(report, /## Nog te doen\n\nNiets\.[^]*## Keuzes\n\n- De kleur volgt nu het vlak\./);
	});

	it('puts notes that bring a title and headings of their own under the heading of the report', async () => {
		const { result } = await upgrade(project(files));
		const report = formatReport({ ...result, notes: '# Keuzes bij de upgrade\n\n## Wat ik liet staan\n\n- De kleur.\n\n### In de zijbalk\n\n- Het kopje.\n' });
		assert.match(report, /\n## Keuzes\n\n### Wat ik liet staan\n\n- De kleur\.\n\n#### In de zijbalk\n/);
		assert.doesNotMatch(report, /Keuzes bij de upgrade/);
	});

	it('names an old tag in a second reading only where a line still does', async () => {
		const root = project(files);
		const { result: first } = await upgrade(root);
		writeFileSync(join(root, 'notes.css'), '/* nldd-task-board-column */\n/* nldd-kanban-column */\n');
		const since = { ...first, fixed: { ...first.fixed, stillNamed: ['notes.css:1', 'notes.css:2', 'gone.css:1'] } };
		const { result } = await upgrade(root, { since });
		assert.deepEqual(result.fixed.stillNamed, ['notes.css:1']);
	});

	it('changes nothing in a second reading, also where a fix could', async () => {
		const root = project(files);
		const { result: first } = await upgrade(root);
		writeFileSync(join(root, 'page.html'), '<nldd-title size="3" heading-level="2" text="Aanvraag A-1043"></nldd-title>\n');
		const { result } = await upgrade(root, { since: first });
		assert.match(read(root, 'page.html'), /size="3"/);
		assert.deepEqual(result.work.map(({ rule }) => rule), ['title-size-renamed']);
		assert.match(formatReport(result), /- `title-size-renamed`: nieuw, 1/);
		await assert.rejects(upgrade(root, { since: { ...first, to: '0.26.0' } }), /Run the same version/);
	});

	it('cuts a report too long for one pull request at a section, and leaves nothing out', () => {
		const section = (name, lines) => `## ${name}\n\n${Array.from({ length: lines }, (_, index) => `- [ ] \`src/${name}/${index}.tsx:1\` \`<nldd-text>\``).join('\n')}`;
		const text = `# Designsysteem van 0.20.0 naar 0.27.1\n\n${section('Eerste', 40)}\n\n${section('Tweede', 40)}\n\n${section('Derde', 400)}\n`;
		assert.deepEqual(splitReport(text), [text]);
		const parts = splitReport(text, 4000);
		assert.ok(parts.length > 2 && parts.every((part) => part.length <= 4000));
		assert.match(parts[0], /^# Designsysteem van 0\.20\.0 naar 0\.27\.1\n\n## Eerste[^]*Het verslag gaat verder in de reacties hieronder\.\n$/);
		assert.match(parts[1], /^# Designsysteem van 0\.20\.0 naar 0\.27\.1 \(deel 2 van \d+\)\n\n/);
		assert.doesNotMatch(parts.at(-1), /gaat verder/);
		const places = (value) => value.match(/- \[ \] `[^`]+`/g);
		assert.deepEqual(parts.flatMap(places), places(text));
	});

	it('comes from the version the project installs, not from an old mention in a document', async () => {
		const { result } = await upgrade(project({ ...files, 'README.md': 'Sinds `npm i @nldd/design-system@0.14.0` gebruiken we het designsysteem.\n' }));
		assert.equal(result.from, '0.20.0');
	});

	it('puts an error the project made so itself under the work, and an old built-in warning apart', async () => {
		const page = '<nldd-title text="Aanvraag A-1042" heading-level="2"></nldd-title>\n';
		const config = { rules: { 'title-needs-heading-level': 'error' } };
		const suppressed = '<!-- nldd-lint-disable-next-line unknown-attribute -->\n<nldd-title text="Dossier D-318" heading-level="2" kleur="rood"></nldd-title>\n';
		const { result } = await upgrade(project({ ...files, 'page.html': page + suppressed, 'own.css': '.a { --_button-gap: 0; }\n' }), {
			config,
			severities: resolveSeverities(DATA, config.rules),
		});
		const rules = (list) => list.map(({ rule }) => rule);
		assert.ok(!rules(result.standing).includes('title-needs-heading-level'), 'an error of the project is work');
		// From 0.20.0: a built-in rule that came after it is brought, one from before it was there already.
		assert.ok(rules(result.work).includes('local-variable-no-override'));
		assert.deepEqual(rules(result.standing), ['suppression-needs-reason']);
	});

	it('installs what the lockfile lists when asked to, so the types of the project can be read', async () => {
		const { ran } = await upgrade(project(files), { install: 'full' });
		assert.deepEqual(ran, ['npm install --ignore-scripts --no-audit --no-fund']);
	});

	it('leaves the lockfile alone when told to, and says it is not rewritten', async () => {
		const { result, ran } = await upgrade(project(files), { install: false });
		assert.deepEqual(ran, []);
		assert.equal(result.lockfiles[0].ok, false);
	});

	it('has nothing left to do when run a second time', async () => {
		const root = project(files);
		await upgrade(root);
		const { result } = await upgrade(root);
		assert.deepEqual(result.pinned, []);
		assert.equal(result.fixed.total, 0);
	});

	it('writes a report that names each place once, and a summary in one line', async () => {
		const { result } = await upgrade(project(files));
		const report = formatReport(result);
		assert.match(report, /^# Designsysteem van 0\.20\.0 naar 0\.27\.1\n/);
		assert.match(report, /- `package\.json:3`: afhankelijkheid, van 0\.20\.0 naar 0\.27\.1/);
		assert.match(report, /- \[ \] `page\.html:2` `<nldd-title>`/);
		assert.match(report, /changelog\/0\.22\.0\//);
		assert.ok(!report.includes('—'));
		assert.equal(formatSummary(result), '0.20.0 -> 0.27.1 in 1 place; fixed 3 in 3 files; 1 place left to do.');
	});

	it('adds what a running page shows, per component of the app that rendered it', async () => {
		const root = project(files);
		const { result } = await upgrade(root);
		const finding = (renderedBy) => ({ rule: 'text-needs-element', severity: 'error', message: 'Text goes in an element.', line: 4, tag: 'nldd-text', renderedBy });
		const session = { files: 2, failed: [], results: [{ filename: join(root, 'rendered/index.html'), findings: [finding('Row < Page'), finding('Row < Page'), finding('Card')] }] };
		const report = formatReport(withRendered(result, session, root));
		assert.match(report, /## Op de draaiende pagina\n\n2 pagina's gelezen/);
		assert.match(report, /- \[ \] `Row`: 2\n- \[ \] `Card`: 1/);
	});
});

describe('markup in Python strings', () => {
	const lint = async (source) => (await createLinter(DATA).lintSource(source, 'render.py')).findings.filter(({ severity }) => severity !== 'hint');
	const rulesOf = async (source) => (await lint(source)).map(({ rule }) => rule);

	it('reads a literal as markup, and a hole as a bound value', async () => {
		const findings = await lint('a = f\'<nldd-title size="6" heading-level="{level}" text="{title}"></nldd-title>\'\n');
		assert.deepEqual(findings.map(({ rule, line }) => [rule, line]), [['title-size-renamed', 1]]);
		assert.ok(findings[0].fix);
	});

	it('takes a hole of `.format()` and of `%` for bound too', async () => {
		assert.deepEqual(await rulesOf('a = \'<nldd-title size="{}" heading-level="2" text="x"></nldd-title>\'.format(size)\n'), []);
		assert.deepEqual(await rulesOf('a = \'<nldd-title size="%s" heading-level="2" text="x"></nldd-title>\' % size\n'), []);
		assert.deepEqual(await rulesOf('a = f\'<nldd-button{attrs} text="Verstuur"></nldd-button>\'\n'), []);
	});

	it('says nothing about what an element holds when the literal does not close it', async () => {
		assert.deepEqual(await rulesOf("a = '<nldd-list>' + items + '</nldd-list>'\nb = '<nldd-accordion>'\n"), []);
	});

	it('leaves a docstring and a comment alone: they name markup and render none', async () => {
		const source = '"""Renders a <nldd-title size="4">."""\n# <nldd-title size="2">\n\ndef f():\n    """Gives <nldd-title size="3">."""\n    return 1\n';
		assert.deepEqual(await rulesOf(source), []);
	});

	it('reads a literal over several lines, inside brackets', async () => {
		const source = 'def f(level):\n    return (\n        f"""\n        <nldd-title size="5" heading-level="{level}" text="x"></nldd-title>\n        """\n    )\n';
		assert.deepEqual((await lint(source)).map(({ rule, line }) => [rule, line]), [['title-size-renamed', 4]]);
	});

	it('leaves a pattern that looks for markup alone, as a test has', async () => {
		const source = "import re\na = re.search(r'<nldd-buton[^>]*>', html)\nb = re.compile(r'<nldd-menu-(item|divider)[ >]')\nc = '<nldd-text-feld\\b[^>]*>'\nd = re.findall(r'<nldd-icon[^>]*icon=\\\"([^\\\"]+)\\\"', html)\ne = re.findall(r'<nldd-menu slot=\"popup\".*?</nldd-menu>', html)\n";
		assert.deepEqual(await rulesOf(source), []);
	});

	it('reads a quote behind a backslash as the quote it is, and writes no fix there', async () => {
		const findings = await lint('a = "<nldd-title size=\\"3\\" heading-level=\\"2\\" text=\\"x\\"></nldd-title>"\nb = \'<nldd-title size=\\\'display-3\\\' heading-level=\\\'2\\\' text=\\\'x\\\'></nldd-title>\'\n');
		assert.deepEqual(findings.map(({ rule, line }) => [rule, line]), [['title-size-renamed', 1]]);
		assert.equal(findings[0].fix, undefined);
	});

	it('gives what stands in a string as a warning at most, since strings were not read before', async () => {
		const source = "a = '<nldd-text>Dakisolatie</nldd-text>'\n";
		assert.deepEqual((await lint(source)).map(({ rule, severity }) => [rule, severity]), [['text-needs-element', 'warn']]);
		const inMarkup = (await createLinter(DATA).lintSource('<nldd-text>Dakisolatie</nldd-text>', 'page.html')).findings;
		assert.deepEqual(inMarkup.map(({ rule, severity }) => [rule, severity]), [['text-needs-element', 'error']]);
	});

	it('reads `\\n` between two attributes as white space', async () => {
		assert.deepEqual(await rulesOf('a = "<nldd-title\\n  size=\\"display-3\\"\\n  heading-level=\\"2\\" text=\\"x\\"></nldd-title>"\n'), []);
	});

	it('says a raw literal with a quote behind a backslash was not read', async () => {
		assert.deepEqual(await rulesOf('a = r"<nldd-title size=\\"3\\" text=\\"x\\"></nldd-title>"\n'), ['file-not-read']);
	});

	it('is found by a scan, and only where a literal holds a component', async () => {
		const root = project({ 'a.py': 'a = \'<nldd-title size="6" heading-level="2" text="x"></nldd-title>\'\n', 'b.py': 'print("plain")\n' });
		const session = await lintProject(DATA, { root, severities });
		assert.deepEqual(session.results.map(({ filename }) => filename), [join(root, 'a.py')]);
	});
});

describe('Markdown in a scan', () => {
	it('is read only on request', async () => {
		const root = project({ 'docs/a.md': '<nldd-title size="4" heading-level="2" text="x"></nldd-title>\n' });
		assert.equal((await lintProject(DATA, { root, severities })).results.length, 0);
		assert.equal((await lintProject(DATA, { root, severities, markdown: true })).results.length, 1);
	});

	it('is read for what it renders: an example in a code block or a mention is documentation', async () => {
		const page = '# Start\n\nUse `<nldd-buton>` or any `<nldd-*>`, and all <nldd-*> tags.\n\n```html\n<nldd-title size="4"></nldd-title>\n```\n';
		const root = project({ 'docs/a.md': page });
		const rulesIn = (session) => session.results.flatMap(({ findings }) => findings.map(({ rule }) => rule)).filter((rule) => rule !== 'title-needs-heading-level');
		assert.deepEqual(rulesIn(await lintProject(DATA, { root, severities, markdown: true })), []);
		assert.ok(rulesIn(await lintProject(DATA, { root, severities, paths: ['docs/a.md'] })).includes('title-size-renamed'));
	});
});

describe('an expression in JSX, read by its type', async () => {
	const { default: compiler } = await import('typescript');
	const { createTypes } = await import('./types.js');
	const { applyFixes } = await import('./fix.js');
	const component = (body) => `type Row = { label: string; count: number; note?: string; cell: unknown };\nexport function View({ row, children }: { row: Row; children: any }) {\n\treturn ${body};\n}\n`;
	const lintIn = async (body, options = {}) => {
		const root = project({ 'tsconfig.json': JSON.stringify({ compilerOptions: { jsx: 'preserve', strict: true }, include: ['*.tsx'] }) });
		const linter = createLinter(DATA, { types: options.untyped ? undefined : createTypes({ compiler }), undecided: options.undecided });
		return linter.lintSource(component(body), join(root, 'View.tsx'));
	};
	const rulesOf = async (body, options) => (await lintIn(body, options)).findings.filter(({ severity }) => severity !== 'hint').map(({ rule }) => rule);

	it('takes a string or a number for text, also where it may be missing', async () => {
		for (const expression of ['row.label', 'row.count', 'row.note', 'row.label.toUpperCase()', 'row.note ?? row.label']) {
			assert.deepEqual(await rulesOf(`<nldd-text>{${expression}}</nldd-text>`), ['text-needs-element'], expression);
		}
	});

	it('says nothing about a type that can be an element, or that did not resolve', async () => {
		for (const expression of ['children', 'row.cell', 'missing.label']) {
			assert.deepEqual(await rulesOf(`<nldd-text>{${expression}}</nldd-text>`), [], expression);
		}
	});

	it('says nothing without the types, as before', async () => {
		assert.deepEqual(await rulesOf('<nldd-text>{row.label}</nldd-text>', { untyped: true }), []);
	});

	it('puts the text in its element, expression and all', async () => {
		const body = '<nldd-text size="sm">{row.label} van {row.count}</nldd-text>';
		const { findings } = await lintIn(body);
		assert.match(applyFixes(component(body), findings).source, /<nldd-text size="sm"><p>\{row\.label\} van \{row\.count\}<\/p><\/nldd-text>/);
	});

	it('lists a place where the content stays open, for the rules someone asks about', async () => {
		const asked = { undecided: (rule) => rule.id === 'text-needs-element' };
		assert.deepEqual((await lintIn('<nldd-text>{children}</nldd-text>', asked)).undecided.map(({ rule, tag, line }) => [rule, tag, line]), [['text-needs-element', 'nldd-text', 3]]);
		// A bound attribute is open on every element, so it is no place to look.
		assert.deepEqual((await lintIn('<nldd-text text={row.label}></nldd-text>', asked)).undecided, []);
		assert.deepEqual((await lintIn('<nldd-text>{children}</nldd-text>')).undecided, []);
	});
});

describe('JSX behind `?.` or a cast', () => {
	const rulesOf = async (source) => (await createLinter(DATA).lintSource(source, 'View.tsx')).findings.filter(({ severity }) => severity !== 'hint').map(({ rule }) => rule);

	it('is read as the JSX it is', async () => {
		const view = (list) => `export const View = ({ rows }) => <nldd-list accessible-label="Aanvragen">{${list}.map((row) => <nldd-text key={row.id}>Dakisolatie</nldd-text>)}</nldd-list>;`;
		for (const list of ['rows', 'rows?', '(rows as Row[])', 'rows!']) assert.deepEqual(await rulesOf(view(list)), ['text-needs-element'], list);
	});
});

describe('text where only a line of text may stand', () => {
	it('gets a `<span>`, since a `<p>` may not stand in a button, a paragraph or other text', async () => {
		const { applyFixes } = await import('./fix.js');
		const fixedOf = async (source) => applyFixes(source, (await createLinter(DATA).lintSource(source, 'page.html')).findings).source;
		assert.match(await fixedOf('<button type="button"><nldd-text>Bewaar</nldd-text></button>\n'), /<nldd-text><span>Bewaar<\/span><\/nldd-text>/);
		assert.match(await fixedOf('<p>Status: <nldd-text weight="bold">in behandeling</nldd-text></p>\n'), /<nldd-text weight="bold"><span>in behandeling<\/span><\/nldd-text>/);
		assert.match(await fixedOf('<div><nldd-text>Dakisolatie</nldd-text></div>\n'), /<nldd-text><p>Dakisolatie<\/p><\/nldd-text>/);
	});

	it('gets a `<span>` where the app cuts the text off at the end of a line, so the ellipsis still shows', async () => {
		const { applyFixes } = await import('./fix.js');
		const fixedOf = async (source, file = 'page.html') => applyFixes(source, (await createLinter(DATA).lintSource(source, file)).findings).source;
		assert.match(await fixedOf('<div class="row hug-truncate"><nldd-text>Dossier D-318</nldd-text></div>\n'), /<nldd-text><span>Dossier D-318<\/span>/);
		assert.match(await fixedOf('<nldd-text style="white-space: nowrap; text-overflow: ellipsis">Dossier D-318</nldd-text>\n'), /<span>Dossier D-318<\/span>/);
		assert.match(await fixedOf('export const A = () => <nldd-text truncate>Dossier D-318</nldd-text>;\n', 'a.tsx'), /<span>Dossier D-318<\/span>/);
		assert.match(await fixedOf('<div class="truncated-list"><section><div><nldd-text>Dakisolatie</nldd-text></div></section></div>\n'), /<p>Dakisolatie<\/p>/, 'three levels up is too far to say');
	});
});

describe('a fix around a hole that can only be text', () => {
	it('leaves text alone in an element the app made inline, where a `<p>` would start a new line', async () => {
		const { applyFixes } = await import('./fix.js');
		const source = '<nldd-text style="display: inline">Dakisolatie</nldd-text>\n';
		const { findings } = await createLinter(DATA).lintSource(source, 'page.html');
		assert.deepEqual(findings.filter(({ rule }) => rule === 'text-needs-element').map(({ fix }) => fix), [undefined]);
		assert.equal(applyFixes(source, findings).source, source);
	});

	it('wraps `{{ }}` in Vue', async () => {
		const { applyFixes } = await import('./fix.js');
		const source = '<template>\n\t<nldd-text>{{ label }}</nldd-text>\n</template>\n';
		const { findings } = await createLinter(DATA).lintSource(source, 'View.vue');
		assert.match(applyFixes(source, findings).source, /<nldd-text><p>\{\{ label \}\}<\/p><\/nldd-text>/);
	});
});
