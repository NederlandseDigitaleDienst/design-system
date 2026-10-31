/**
 * Lints one source text: parse, built-in checks from the component contract,
 * rules from src/rules/, then the suppressions written in the file.
 */

import { readFileSync } from 'node:fs';
import { createEngine } from './engine.js';
import { applyWrappers, parseSource } from './frontends.js';
import { BOUND, walk } from './tree.js';

export function loadData() {
	return JSON.parse(readFileSync(new URL('./data.generated.json', import.meta.url), 'utf8'));
}

/** Valid on any element, so the manifest does not list them per component. */
const GLOBAL_ATTRIBUTE =
	/^(id|class|style|slot|hidden|lang|dir|title|role|tabindex|part|inert|draggable|contenteditable|spellcheck|translate|accesskey|autofocus|enterkeyhint|inputmode|is|nonce|popover|key|ref|exportparts|itemprop|data-.*|aria-.*|on(click|change|input|submit|focus|blur|load|error|key[a-z]+|mouse[a-z]+))$/;

const ICON_ATTRIBUTES = new Set(['icon', 'start-icon', 'end-icon']);

/**
 * Kept in the code rather than src/rules/: they are generated from the contract,
 * for every component, without anyone writing a rule.
 */
export const BUILT_IN_RULES = {
	'unknown-element': {
		severity: 'error',
		description: 'The tag does not exist in this version of the design system.',
	},
	'unknown-attribute': {
		severity: 'warn',
		description: 'The component does not have this attribute, so setting it does nothing.',
	},
	'invalid-value': {
		severity: 'warn',
		description: 'The attribute only accepts a fixed set of values, and this is not one of them.',
	},
	'unknown-icon': {
		severity: 'warn',
		description: 'There is no icon with this name.',
	},
	'unknown-slot': {
		severity: 'warn',
		description: 'The parent component has no slot with this name, so the element does not render.',
	},
	deprecated: {
		severity: 'warn',
		description: 'This still works, but will go away in a later version.',
	},
};

const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

function checkAttributes(node, { tags, icons, anyChildAttrs }, report) {
	const contract = tags[node.name];
	// A parent in another file may be the one reading it, so any child attribute goes.
	const fromParent = node.parent.opaque ? anyChildAttrs : (tags[node.parent.name]?.childAttrs ?? {});
	for (const [name, value] of node.attrs) {
		const attribute = contract.attrs[name] ?? fromParent[name];
		if (ICON_ATTRIBUTES.has(name) && attribute && typeof value === 'string' && value !== '') {
			if (!icons.has(value)) report('unknown-icon', `There is no icon named "${value}".`);
		}
		if (attribute?.deprecated) {
			const detail = attribute.deprecated === true ? '' : ` ${attribute.deprecated}`;
			report('deprecated', `\`${name}\` on ${node.name} is deprecated.${detail}`);
		}
		if (attribute) {
			if (attribute.values && typeof value === 'string' && !attribute.values.includes(value)) {
				const allowed = attribute.values.filter(Boolean).join(', ');
				report('invalid-value', `\`${name}="${value}"\` is not valid on ${node.name}: use ${allowed}.`);
			}
		} else if (value === BOUND && contract.props.includes(toCamelCase(name))) {
			// A property without an attribute, which only a binding can reach.
		} else if (!GLOBAL_ATTRIBUTE.test(name.toLowerCase()) && !node.wrapped) {
			report('unknown-attribute', `${node.name} has no attribute \`${name}\`.`, name);
		}
	}
}

function checkSlot(node, tags, report) {
	const slot = node.attrs.get('slot');
	const parent = node.parent;
	if (typeof slot !== 'string' || !slot || parent.opaque || !parent.name.startsWith('nldd-')) return;
	const contract = tags[parent.name];
	if (contract && !contract.anySlot && !contract.slots.includes(slot)) {
		report('unknown-slot', `${parent.name} has no slot "${slot}".`, 'slot');
	}
}

function builtInFindings(root, context) {
	const { tags } = context;
	const findings = [];
	walk(root, (node) => {
		if (!node.name.startsWith('nldd-')) return;
		const report = (rule, message, attribute) =>
			findings.push({ rule, severity: BUILT_IN_RULES[rule].severity, message, node, attribute });
		const contract = tags[node.name];
		if (!contract) {
			report('unknown-element', `${node.name} does not exist in this version.`);
			return;
		}
		checkAttributes(node, context, report);
		checkSlot(node, tags, report);
	});
	return findings;
}

const SUPPRESSION = /nldd-lint-disable-next-line\s+([\w-]+(?:\s*,\s*[\w-]+)*)(?:\s+--\s*(\S.*?))?\s*(?:-->|\*\/|#\})/;

function readSuppressions(source) {
	const suppressed = new Map();
	const missingReason = [];
	source.split('\n').forEach((text, index) => {
		const match = text.match(SUPPRESSION);
		if (!match) return;
		if (!match[2]) missingReason.push(index + 1);
		suppressed.set(index + 2, new Set(match[1].split(',').map((id) => id.trim())));
	});
	return { suppressed, missingReason };
}

function createPositions(source) {
	const starts = [0];
	for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1);
	return (offset) => {
		let low = 0;
		let high = starts.length - 1;
		while (low < high) {
			const middle = Math.ceil((low + high) / 2);
			if (starts[middle] <= offset) low = middle;
			else high = middle - 1;
		}
		return { line: low + 1, column: offset - starts[low] + 1 };
	};
}

export function createLinter(data = loadData(), { wrappers = {}, severities = {} } = {}) {
	const context = {
		tags: data.tags,
		icons: new Set(data.icons),
		anyChildAttrs: Object.assign({}, ...Object.values(data.tags).map((tag) => tag.childAttrs)),
	};
	const engine = createEngine({ classes: data.classes });
	const rules = data.rules.filter((rule) => !rule.runtime && severities[rule.id] !== 'off');

	/** A rule about a removed name says what to use instead; the generic finding adds nothing. */
	function withoutCovered(findings) {
		return findings.filter(
			({ attribute, node }) =>
				!attribute ||
				!findings.some((other) => other.node === node && other.selector?.includes(`[${attribute}`)),
		);
	}

	function lintRoots(roots) {
		const findings = [];
		const counts = { failed: 0, passed: 0, cantTell: 0 };
		for (const root of roots) {
			findings.push(...builtInFindings(root, context));
			for (const rule of rules) {
				for (const { node, outcome } of engine.evaluate(rule, root)) {
					counts[outcome]++;
					if (outcome !== 'failed') continue;
					findings.push({
						rule: rule.id,
						severity: rule.severity,
						message: rule.message,
						node,
						selector: rule.context,
					});
				}
			}
		}
		return { findings: withoutCovered(findings), counts };
	}

	/** @returns {Promise<{ findings: object[], counts: object }>} */
	async function lintSource(source, filename) {
		const roots = applyWrappers(await parseSource(source, filename), wrappers);
		const { findings, counts } = lintRoots(roots);
		const { suppressed, missingReason } = readSuppressions(source);
		const position = createPositions(source);
		const located = findings
			.map(({ node, severity, selector, attribute, ...finding }) => ({
				...finding,
				severity: severities[finding.rule] ?? severity,
				tag: node.name,
				...position(node.offset),
			}))
			.filter((finding) => finding.severity !== 'off')
			.filter((finding) => !suppressed.get(finding.line)?.has(finding.rule));
		for (const line of missingReason) {
			located.push({
				rule: 'suppression-needs-reason',
				severity: 'warn',
				message: 'Add the reason after `--`, so the next reader knows why this rule is off here.',
				tag: '',
				line,
				column: 1,
			});
		}
		located.sort((a, b) => a.line - b.line || a.column - b.column);
		return { findings: located, counts };
	}

	/** Evaluates one rule on a snippet, for the examples of that rule. */
	async function outcomesOf(rule, snippet) {
		const isDocument = snippet.startsWith('<html');
		const parsed = isDocument
			? await parseSource(snippet, 'example.html')
			: await parseSource(`<template>${snippet}</template>`, 'example.vue');
		return parsed.flatMap((root) => engine.evaluate(rule, root).map(({ outcome }) => outcome));
	}

	return { lintSource, outcomesOf };
}

export { BOUND };
