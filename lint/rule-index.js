/** What connects a rule to the docs: the components it names and the pattern it explains. */

export function selectorsOf(rule) {
	return [rule.context, rule.assert, rule.report, rule.count?.of, rule.ref?.target].filter(Boolean);
}

/** The end of the parenthesis that opens at `open`. */
function closing(selector, open) {
	let depth = 0;
	for (let i = open; i < selector.length; i++) {
		if (selector[i] === '(') depth++;
		else if (selector[i] === ')' && --depth === 0) return i;
	}
	return selector.length;
}

/**
 * A selector without what it excludes: `:not(nldd-sheet *)` is not about a
 * sheet. What it requires stays, so `:not(:has(nldd-breadcrumbs))`, a missing
 * breadcrumb, is about the breadcrumbs.
 */
function withoutExclusions(selector) {
	let out = '';
	for (let i = 0; i < selector.length; i++) {
		if (!selector.startsWith(':not(', i)) {
			out += selector[i];
			continue;
		}
		const end = closing(selector, i + 4);
		const inner = selector.slice(i + 5, end);
		for (let at = inner.indexOf(':has('); at !== -1; at = inner.indexOf(':has(', at + 1)) {
			out += ` ${withoutExclusions(inner.slice(at, closing(inner, at + 4) + 1))}`;
		}
		i = end;
	}
	return out;
}

/** Every component a rule is about, so a rule on two components shows up at both. */
export function tagsOf(rule) {
	const named = selectorsOf(rule).flatMap((selector) => withoutExclusions(selector).match(/nldd-[a-z0-9-]+/g) ?? []);
	return [...new Set([...(rule.tags ?? []), ...named])];
}

export function rulesAboutTag(rules, tag) {
	return rules.filter((rule) => tagsOf(rule).includes(tag));
}

/** A rule belongs to a pattern by pointing at it, so nobody keeps a list per pattern. */
export function rulesOfPattern(rules, slug) {
	return rules.filter((rule) => rule.see === `patronen/${slug}`);
}
