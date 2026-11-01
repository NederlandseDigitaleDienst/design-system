/**
 * Lints one source text: parse, built-in checks from the component contract,
 * rules from src/rules/, then the suppressions written in the file.
 */

import { createEngine } from './engine.js';
import { applyWrappers, parseSource } from './frontends.js';
import { BUILT_IN_RULES, createCanonical, loadData } from './rule-data.js';
import { BOUND, walk } from './tree.js';

export { BUILT_IN_RULES, createCanonical, loadData };


/** Valid on any element, so the manifest does not list them per component. */
const GLOBAL_ATTRIBUTE =
	/^(id|class|style|slot|hidden|lang|dir|title|role|tabindex|part|inert|draggable|contenteditable|spellcheck|translate|accesskey|autofocus|enterkeyhint|inputmode|is|nonce|popover|key|ref|exportparts|item(prop|scope|type|id|ref)|i18n(-.*)?|data-.*|aria-.*|hx-.*|x-.*|on(?!ly$)[a-z]+)$/;

/** Set as a property on any element: in markup these are bindings, not attributes. */
const DOM_PROPERTY = /^(textContent|innerHTML|innerText|outerHTML|className|tabIndex|aria[A-Z].*)$/;

const ICON_ATTRIBUTES = new Set(['icon', 'start-icon', 'end-icon', 'selected-icon']);


const toCamelCase = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** `[accessibleLabel]` and `:accessibleLabel` set the same thing as `accessible-label`. */
function readPropertyNames(roots, tags, isPlainHtml) {
	const visit = (node) => {
		const contract = tags[node.name];
		for (const [name, value] of contract ? [...node.attrs] : []) {
			const attribute = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			// In HTML itself a capital means nothing: the browser lowercases the name.
			if (attribute === name || !contract.attrs[attribute] || (isPlainHtml && value !== BOUND)) continue;
			node.attrs.delete(name);
			node.attrs.set(attribute, value);
		}
	};
	for (const root of roots) walk(root, visit);
	return roots;
}

function checkAttributes(node, { tags, icons, anyChildAttrs, isPlainHtml }, report) {
	if (node.templated) return;
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
			report('deprecated', `\`${name}\` on ${node.name} is deprecated.${detail}`, name);
		}
		if (attribute) {
			if (attribute.values && typeof value === 'string' && !attribute.values.includes(value)) {
				const allowed = attribute.values.filter(Boolean).join(', ');
				report('invalid-value', `\`${name}="${value}"\` is not valid on ${node.name}: use ${allowed}.`, name);
			}
		} else if (value === BOUND && contract.props.includes(toCamelCase(name))) {
			// A property without an attribute, which only a binding can reach.
		} else if (value === BOUND && DOM_PROPERTY.test(name)) {
			// Every element has this one.
		} else if (isPlainHtml && /[A-Z]/.test(name)) {
			// HTML has no capitals, so in an .html file this is a template directive.
		} else if (contract.attrs[name.toLowerCase()]) {
			// `maxLength`: no such property, so it ends up as the attribute, in lowercase.
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
			report('unknown-element', `${node.name} does not exist in this version.`, node.name);
			return;
		}
		checkAttributes(node, context, report);
		checkSlot(node, tags, report);
	});
	return findings;
}

const SUPPRESSION = /nldd-lint-disable-next-line\s+([\w-]+(?:\s*,\s*[\w-]+)*)(?:\s+--(?!-*>)\s*(\S.*?))?\s*(?:-->|\*\/|-?#\}|$)/;

function readSuppressions(source, canonical) {
	const suppressed = new Map();
	const missingReason = [];
	source.split('\n').forEach((text, index) => {
		const match = text.trimEnd().match(SUPPRESSION);
		if (!match) return;
		if (!match[2]) missingReason.push(index + 1);
		suppressed.set(index + 2, new Set(match[1].split(',').map((id) => canonical(id.trim()))));
	});
	return { suppressed, missingReason };
}

function syntaxError({ message, offset }, position) {
	const rule = 'syntax-error';
	const { severity, description } = BUILT_IN_RULES[rule];
	return { rule, severity, message: `${description} ${message}`, tag: '', ...position(offset) };
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


export function createLinter(data = loadData(), { wrappers = {}, severities: configured = {} } = {}) {
	const canonical = createCanonical(data);
	const severities = Object.fromEntries(Object.entries(configured).map(([id, level]) => [canonical(id), level]));
	const context = {
		tags: data.tags,
		icons: new Set(data.icons),
		anyChildAttrs: Object.assign({}, ...Object.values(data.tags).map((tag) => tag.childAttrs)),
	};
	const engine = createEngine({ classes: data.classes });
	const rules = data.rules.filter((rule) => !rule.runtime && severities[rule.id] !== 'off');
	const ranInSource = (id) => severities[id] !== 'off' && (rules.some((rule) => rule.id === id) || id in BUILT_IN_RULES);

	/** A rule about a name or value that is gone says what to use instead; the generic finding adds nothing. */
	function withoutCovered(findings) {
		return findings.filter(
			({ attribute, node }) =>
				!attribute || !findings.some((other) => other.node === node && other.covers?.includes(attribute)),
		);
	}

	function lintRoots(roots, isPlainHtml) {
		const findings = [];
		const counts = { failed: 0, passed: 0, cantTell: 0 };
		for (const root of roots) {
			findings.push(...builtInFindings(root, { ...context, isPlainHtml }));
			for (const rule of rules) {
				for (const { node, outcome } of engine.evaluate(rule, root)) {
					counts[outcome]++;
					// A name that is gone is wrong whatever the binding holds.
					const namesRemoved = rule.removed?.some((name) => node.attrs.get(name) === BOUND);
					if (outcome !== 'failed' && !(outcome === 'cantTell' && namesRemoved)) continue;
					findings.push({
						rule: rule.id,
						severity: rule.severity,
						message: rule.message,
						node,
						covers: [...(rule.removed ?? []), ...Object.keys(rule.fix?.value ?? {})],
						fix: rule.fix,
					});
				}
			}
		}
		return { findings: withoutCovered(findings), counts };
	}

	/** @returns {Promise<{ findings: object[], counts: object }>} */
	async function lintSource(source, filename) {
		const parsed = applyWrappers(await parseSource(source, filename), wrappers);
		const isPlainHtml = /\.(html?|j2|jinja2?)$/.test(filename);
		const roots = readPropertyNames(parsed, data.tags, isPlainHtml);
		const { findings, counts } = lintRoots(roots, isPlainHtml);
		const { suppressed, missingReason } = readSuppressions(source, canonical);
		const position = createPositions(source);
		const aboutSuppression = (rule, line, detail = BUILT_IN_RULES[rule].description) => ({
			rule,
			severity: BUILT_IN_RULES[rule].severity,
			message: detail,
			tag: '',
			line,
			column: 1,
		});
		const all = findings.map(({ node, severity, covers, attribute, ...finding }) => ({
			...finding,
			severity,
			tag: node.name,
			offset: node.offset,
			...position(node.offset),
		}));
		const fires = (line, id) => all.some((finding) => finding.line === line && finding.rule === id);
		// A rule that did not run here says nothing, and Markdown shows a suppression as an example.
		const unneeded = /\.md$/.test(filename) || parsed.length === 0 || parsed.syntaxError
			? []
			: [...suppressed].flatMap(([line, ids]) =>
					[...ids]
						.filter((id) => ranInSource(id) && !fires(line, id))
						.map((id) => aboutSuppression('suppression-not-needed', line - 1, `\`${id}\` does not fire on the next line, so this suppression can go.`)),
				);
		const located = all
			.filter((finding) => !suppressed.get(finding.line)?.has(finding.rule))
			.concat(missingReason.map((line) => aboutSuppression('suppression-needs-reason', line)), unneeded)
			.concat(parsed.syntaxError ? [syntaxError(parsed.syntaxError, position)] : [])
			.map((finding) => ({ ...finding, severity: severities[finding.rule] ?? finding.severity }))
			.filter((finding) => finding.severity !== 'off');
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
