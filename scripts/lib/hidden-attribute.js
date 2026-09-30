/**
 * Checks that the `hidden` attribute still hides a component.
 *
 * The browser hides `[hidden]` with a user-agent `display: none`, and any
 * author `display` on the element beats it. A component that sets a display
 * on its host has to restore the attribute with `:host([hidden]) { display:
 * none; }`, and no other host rule may win from that one again: a rule with a
 * higher specificity anywhere, or an equal one further down. The same holds
 * for the light-DOM components styled from a plain .css file, where the rule
 * is `nldd-form[hidden]`.
 *
 * Shared so validate-host-styles.js can be tested without its file walking
 * and process.exit.
 */

const HOST = /^:host(?:\(((?:[^()]|\([^()]*\))*)\))?$/;
const ELEMENT = /^(nldd-[a-z0-9-]+)((?:\[[^\]]*\]|\.[\w-]+|:[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?)*)$/;

/**
 * Counts the class-level parts of a compound: attributes, classes and
 * pseudo-classes. `:not()` and `:is()` count their argument, not themselves,
 * and `:where()` counts nothing.
 */
function classLevelCount(compound) {
	const withoutWhere = compound.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
	const attributes = (withoutWhere.match(/\[/g) ?? []).length;
	const classes = (withoutWhere.replace(/\[[^\]]*\]/g, '').match(/\.[\w-]/g) ?? []).length;
	const pseudoClasses = (withoutWhere.match(/(?<!:):(?!:)(?!not\(|is\()[\w-]+/g) ?? []).length;
	return attributes + classes + pseudoClasses;
}

/**
 * What a selector part targets, if it is the component itself: its shadow
 * host, or the element of a light-DOM component. Null for anything that
 * reaches into the component, like `:host .list__main` or `nldd-form > form`.
 */
export function selectorTarget(part) {
	const host = part.match(HOST);
	if (host) {
		const argument = host[1] ?? '';
		return {
			key: ':host',
			specificity: 1 + classLevelCount(argument),
			hidden: argument === '[hidden]',
		};
	}
	const element = part.match(ELEMENT);
	if (element) {
		return {
			key: element[1],
			specificity: 1 + 100 * classLevelCount(element[2]),
			hidden: element[2] === '[hidden]',
		};
	}
	return null;
}

function splitSelectorList(selector) {
	const parts = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < selector.length; i++) {
		const ch = selector[i];
		if (ch === '(') depth += 1;
		else if (ch === ')') depth -= 1;
		else if (ch === ',' && depth === 0) {
			parts.push(selector.slice(start, i).trim());
			start = i + 1;
		}
	}
	parts.push(selector.slice(start).trim());
	return parts;
}

/**
 * Collects every `display` declaration made directly on the component, in
 * source order. Nested at-rules inherit the selector of the rule around them.
 */
function collectDisplayRules(cssText) {
	const rules = [];
	const stack = [];
	let buffer = '';

	for (let i = 0; i < cssText.length; i++) {
		const char = cssText[i];

		if (char === '{') {
			const selector = buffer.trim();
			buffer = '';
			const parent = stack[stack.length - 1];
			if (selector.startsWith('@')) {
				stack.push({ targets: parent?.targets ?? [] });
			} else {
				const targets = splitSelectorList(selector)
					.map((part) => ({ part, target: selectorTarget(part) }))
					.filter(({ target }) => target);
				stack.push({ targets });
			}
		} else if (char === '}') {
			stack.pop();
			buffer = '';
		} else if (char === ';') {
			const declaration = buffer.trim();
			buffer = '';
			const match = declaration.match(/^display\s*:\s*([\s\S]+)$/);
			if (!match) continue;
			const important = /!important\s*$/.test(match[1]);
			const value = match[1].replace(/!important\s*$/, '').trim();
			const line = cssText.slice(0, i).split('\n').length;
			for (const { part, target } of stack[stack.length - 1]?.targets ?? []) {
				rules.push({ ...target, selector: part, value, important, line, order: rules.length });
			}
		} else {
			buffer += char;
		}
	}

	return rules;
}

/**
 * Returns the rules that leave a hidden component visible: a component that
 * sets a display without a hidden rule, and every rule that beats the hidden
 * rule.
 */
export function hiddenAttributeViolations(cssText) {
	const violations = [];
	const byTarget = Map.groupBy(collectDisplayRules(cssText), (rule) => rule.key);

	for (const [key, rules] of byTarget) {
		const shown = rules.filter((rule) => !rule.hidden && rule.value !== 'none');
		if (shown.length === 0) continue;

		const hiddenRule = rules.findLast((rule) => rule.hidden && rule.value === 'none');
		if (!hiddenRule) {
			const hiddenSelector = key === ':host' ? ':host([hidden])' : `${key}[hidden]`;
			violations.push({
				line: shown[0].line,
				message: `\`${shown[0].selector}\` sets display, but there is no \`${hiddenSelector} { display: none; }\``,
			});
			continue;
		}

		for (const rule of shown) {
			const wins = rule.important && !hiddenRule.important
				|| rule.important === hiddenRule.important && (
					rule.specificity > hiddenRule.specificity
					|| rule.specificity === hiddenRule.specificity && rule.order > hiddenRule.order
				);
			if (wins) {
				violations.push({
					line: rule.line,
					message: `\`${rule.selector}\` overrides \`${hiddenRule.selector}\` (line ${hiddenRule.line})`,
				});
			}
		}
	}

	return violations.sort((a, b) => a.line - b.line);
}
