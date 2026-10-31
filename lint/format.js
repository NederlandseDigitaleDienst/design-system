/** Renders findings. `text` is for people, `json` for agents and tools, `github` for CI. */

import { relative } from 'node:path';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const red = paint(31);
const yellow = paint(33);
const dim = paint(2);
const blue = paint(34);
const bold = paint(1);

function codeFrame(sourceLine, line, column, tag) {
	const gutter = String(line);
	const pointer = '^'.repeat(Math.max(1, tag.length + 1));
	const lead = sourceLine.slice(0, column - 1).replace(/[^\t]/g, ' ');
	return [
		`  ${dim(`${gutter} │`)} ${sourceLine}`,
		`  ${' '.repeat(gutter.length)} ${dim('│')} ${lead}${red(pointer)}`,
	].join('\n');
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** A hint is advice, so it gets one entry however often it applies. */
function hintSummary(results, root, explainRule) {
	const grouped = new Map();
	for (const { filename, findings } of results) {
		for (const { severity, rule, message, line } of findings) {
			if (severity !== 'hint') continue;
			const entry = grouped.get(rule) ?? { message, places: [] };
			entry.places.push(`${relative(root, filename)}:${line}`);
			grouped.set(rule, entry);
		}
	}
	const lines = [];
	for (const [rule, { message, places }] of grouped) {
		const shown = places.slice(0, 2).join(', ');
		const more = places.length > 2 ? `, +${places.length - 2}` : '';
		lines.push(`  ${rule}  ${dim(`${places.length}× ${shown}${more}`)}`, `    ${message}`);
		const see = explainRule?.(rule)?.see;
		if (see) lines.push(dim(`    → ${see}`));
	}
	return lines;
}

export function formatText(results, { root, files, ms, skipped, explainRule }) {
	const lines = [];
	for (const { filename, source, findings } of results) {
		const sourceLines = source.split('\n');
		for (const finding of findings.filter(({ severity }) => severity !== 'hint')) {
			const { line, column, severity, rule, message, tag } = finding;
			const location = `${relative(root, filename)}:${line}:${column}`;
			const label = { error: red('error'), warn: yellow('warn'), hint: blue('hint') }[severity];
			lines.push(`${bold(location)}  ${label}  ${rule}`, `  ${message}`);
			if (tag) lines.push(codeFrame(sourceLines[line - 1] ?? '', line, column, tag));
			lines.push(dim(`  → nldd explain ${rule}`), '');
		}
	}
	const all = results.flatMap((result) => result.findings);
	const advice = hintSummary(results, root, explainRule);
	if (advice.length > 0) lines.push(blue('Hints'), ...advice, '');
	const count = (level) => all.filter((finding) => finding.severity === level).length;
	const errors = count('error');
	const warnings = count('warn');
	const hints = count('hint') ? `, ${plural(count('hint'), 'hint')}` : '';
	const known = skipped ? dim(` (${skipped} in baseline)`) : '';
	const summary = `${plural(errors, 'error')}, ${plural(warnings, 'warning')}${hints} in ${plural(files, 'file')} (${ms} ms)`;
	lines.push(`${errors + warnings ? red('✖') : '✔'} ${summary}${known}`);
	return lines.join('\n');
}

/** Everything an agent needs to fix a finding without opening the docs. */
export function formatJson(results, { root, explainRule }) {
	const findings = results.flatMap(({ filename, findings: list }) =>
		list.map((finding) => {
			const detail = explainRule(finding.rule);
			return {
				file: relative(root, filename),
				line: finding.line,
				column: finding.column,
				severity: finding.severity,
				rule: finding.rule,
				message: finding.message,
				see: detail?.see,
				example: detail?.examples?.passed?.[0],
			};
		}),
	);
	return JSON.stringify({ findings }, null, 2);
}

function escapeGithub(text) {
	return text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

export function formatGithub(results, { root }) {
	const lines = [];
	for (const { filename, findings } of results) {
		for (const { severity, line, column, rule, message } of findings) {
			const level = { error: 'error', warn: 'warning', hint: 'notice' }[severity];
			const file = relative(root, filename);
			lines.push(`::${level} file=${file},line=${line},col=${column},title=${rule}::${escapeGithub(message)}`);
		}
	}
	return lines.join('\n');
}
