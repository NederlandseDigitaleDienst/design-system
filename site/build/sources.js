/**
 * Reads everything the site renders from: the story files, the Custom Elements
 * Manifest, the patterns and the package metadata.
 *
 * Nothing here is written by hand per component. A component page exists
 * because a `<name>.stories.ts` exists; its API tables come from
 * custom-elements.json, which `cem analyze` generates from the source.
 *
 * The story files are parsed, not imported: a story module pulls in Lit and the
 * components, which only run in a browser. The few things the page needs up
 * front (title, tag, export names, the JSDoc above them) are all static, so the
 * TypeScript parser is enough. Everything that depends on running the story
 * (args, the rendered markup) is left to the client.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { storybookId } from '../../scripts/lib/skill-patterns.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, '../..');
const srcDir = resolve(repoRoot, 'src');

function walk(dir, test, found = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, test, found);
		else if (test(entry.name)) found.push(full);
	}
	return found;
}

/** The text of a JSDoc block, without the comment markers. */
function cleanJsDoc(comment) {
	return comment
		.replace(/^\/\*\*+/, '')
		.replace(/\*+\/$/, '')
		.split('\n')
		.map((line) => line.replace(/^\s*\* ?/, ''))
		.join('\n')
		.trim();
}

/** The JSDoc block directly above a node, if there is one. */
function leadingJsDoc(source, node) {
	const ranges = ts.getLeadingCommentRanges(source.text, node.getFullStart()) ?? [];
	const last = ranges[ranges.length - 1];
	if (!last) return '';
	const text = source.text.slice(last.pos, last.end);
	return text.startsWith('/**') ? cleanJsDoc(text) : '';
}

function property(object, name) {
	if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
	return object.properties.find(
		(p) => ts.isPropertyAssignment(p) && p.name && p.name.getText().replace(/['"]/g, '') === name,
	)?.initializer;
}

function stringValue(node) {
	if (!node) return undefined;
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	return undefined;
}

function path(object, ...names) {
	return names.reduce((node, name) => property(node, name), object);
}

/** `KlikbareKaart` reads as "Klikbare kaart", the way a Dutch heading is cased. */
export function storyName(exportName) {
	const words = exportName.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
	return words.charAt(0) + words.slice(1).toLowerCase();
}

function kebab(exportName) {
	return exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
}

/**
 * @returns {{ file: string, title: string, tag: string|undefined, description: string,
 *   status: string|undefined, sourceFile: string|undefined, fullscreen: boolean,
 *   stories: { exportName: string, id: string, name: string, description: string, hidden: boolean }[] }}
 */
export function parseStoryFile(file) {
	const text = readFileSync(file, 'utf8');
	const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2020, true);
	const result = {
		file: relative(repoRoot, file),
		title: '',
		tag: undefined,
		description: '',
		status: undefined,
		sourceFile: undefined,
		fullscreen: false,
		stories: [],
	};
	for (const statement of source.statements) {
		if (ts.isExportAssignment(statement)) {
			const meta = statement.expression;
			result.title = stringValue(property(meta, 'title')) ?? '';
			result.tag = stringValue(property(meta, 'component'));
			result.description =
				stringValue(path(meta, 'parameters', 'docs', 'description', 'component')) ??
				leadingJsDoc(source, statement);
			result.status = stringValue(path(meta, 'parameters', 'status', 'type'));
			result.sourceFile = stringValue(path(meta, 'parameters', 'componentSource', 'file'));
			result.fullscreen = stringValue(path(meta, 'parameters', 'layout')) === 'fullscreen';
			continue;
		}
		const exported =
			ts.isVariableStatement(statement) &&
			statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
		if (!exported) continue;
		for (const declaration of statement.declarationList.declarations) {
			const exportName = declaration.name.getText();
			const init = declaration.initializer;
			const tags = property(init, 'tags');
			const hidden =
				!!tags &&
				ts.isArrayLiteralExpression(tags) &&
				tags.elements.some((e) => stringValue(e) === '!autodocs');
			result.stories.push({
				exportName,
				id: `${storybookId(result.title)}--${kebab(exportName)}`,
				name: stringValue(property(init, 'name')) ?? storyName(exportName),
				description:
					stringValue(path(init, 'parameters', 'docs', 'description', 'story')) ??
					leadingJsDoc(source, statement),
				hidden,
			});
		}
	}
	if (!result.title) throw new Error(`Geen title in ${result.file}`);
	return result;
}

/** Storybook's category titles, in Dutch for the navigation. */
const CATEGORY_LABELS = {
	Actions: 'Acties',
	Content: 'Inhoud',
	Forms: 'Formulieren',
	Inputs: 'Invoer',
	Layout: 'Layout',
	'Lists & Tables': 'Lijsten en tabellen',
	Navigation: 'Navigatie',
	'Status & Feedback': 'Status en feedback',
};

/** Every component that has a stories file, with its route and category. */
export function collectComponents() {
	const manifest = readManifest();
	return walk(resolve(srcDir, 'components'), (name) => name.endsWith('.stories.ts'))
		.map((file) => {
			const story = parseStoryFile(file);
			const [, category, name] = story.title.split('/');
			const dir = relative(repoRoot, dirname(file));
			const slug = story.tag ? story.tag.replace(/^nldd-/, '') : storybookId(name);
			// The elements declared in this component's own directory: the element
			// itself first, then the sub-elements that have no page of their own.
			const elements = manifest
				.filter((element) => dirname(element.module) === dir)
				.sort((a, b) => (a.tagName === story.tag ? -1 : b.tagName === story.tag ? 1 : 0));
			return { ...story, name, slug, category: CATEGORY_LABELS[category] ?? category, dir, elements };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** The elements of custom-elements.json, flattened, with their module path. */
export function readManifest() {
	const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'custom-elements.json'), 'utf8'));
	const elements = [];
	for (const module of manifest.modules) {
		for (const declaration of module.declarations ?? []) {
			if (declaration.customElement && declaration.tagName) {
				elements.push({ ...declaration, module: module.path });
			}
		}
	}
	return elements;
}

/** Every pattern: its prose, its stories and the markup each story renders. */
export function collectPatterns() {
	const dir = resolve(srcDir, 'patterns');
	return readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const slug = entry.name;
			const storiesFile = join(dir, slug, `${slug}.stories.ts`);
			const proseFile = join(dir, slug, `${slug}.md`);
			if (!existsSync(storiesFile) || !existsSync(proseFile)) return null;
			const story = parseStoryFile(storiesFile);
			const prose = readFileSync(proseFile, 'utf8');
			return {
				...story,
				slug,
				name: story.title.split('/')[1],
				prose,
				summary: prose.match(/\*\*Welk probleem dit oplost\.\*\*\s*(.+)/)?.[1] ?? '',
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Version, release date and counts, for the lines that prove the system is alive. */
export function readFacts() {
	const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'));
	const changelog = readFileSync(resolve(repoRoot, 'CHANGELOG.md'), 'utf8');
	const release = changelog.match(/^## \[([\d.]+)\]\([^)]*\) \((\d{4})-(\d{2})-(\d{2})\)/m);
	const months = [
		'januari', 'februari', 'maart', 'april', 'mei', 'juni',
		'juli', 'augustus', 'september', 'oktober', 'november', 'december',
	];
	const icons = readdirSync(resolve(srcDir, 'components/content/icon/icons')).filter((f) => f.endsWith('.svg'));
	return {
		version: pkg.version,
		releaseDate: release ? `${Number(release[4])} ${months[Number(release[3]) - 1]} ${release[2]}` : '',
		iconCount: icons.length,
		repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
	};
}
