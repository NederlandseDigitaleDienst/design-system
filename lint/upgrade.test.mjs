import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { createLinter } from './linter.js';
import { loadData, resolveSeverities } from './rule-data.js';
import { lintProject } from './session.js';
import { breakingFor, compareVersions, lockfileCommand, raisePins, upgradeProject, withRendered } from './upgrade.js';
import { formatReport, formatSummary } from './upgrade-report.js';

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

	it('raises a record of the package with its hash, or not at all', () => {
		const record = (version, integrity) => JSON.stringify({ package: '@nldd/design-system', version, integrity }, null, 2);
		const source = record('0.16.0', 'sha512-old');
		assert.equal(raisePins('pinned.json', source, '0.27.1', 'sha512-new').source, record('0.27.1', 'sha512-new'));
		const without = raisePins('pinned.json', source, '0.27.1', null);
		assert.equal(without.source, source);
		assert.equal(without.left.length, 1);
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

	it('says a literal with an escaped quote was not read', async () => {
		assert.deepEqual(await rulesOf('a = "<nldd-title size=\\"3\\" text=\\"x\\"></nldd-title>"\n'), ['file-not-read']);
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
});
