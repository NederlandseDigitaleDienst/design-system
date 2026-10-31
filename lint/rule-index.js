/** What connects a rule to the docs: the components it names and the pattern it explains. */

function selectorsOf(rule) {
	return [rule.context, rule.assert, rule.report, rule.count?.of, rule.ref?.target].filter(Boolean);
}

/** Every component a rule is about, so a rule on two components shows up at both. */
export function tagsOf(rule) {
	const named = selectorsOf(rule).flatMap((selector) => selector.match(/nldd-[a-z0-9-]+/g) ?? []);
	return [...new Set(named)];
}

export function rulesAboutTag(rules, tag) {
	return rules.filter((rule) => tagsOf(rule).includes(tag));
}

/** A rule belongs to a pattern by pointing at it, so nobody keeps a list per pattern. */
export function rulesOfPattern(rules, slug) {
	return rules.filter((rule) => rule.see === `patronen/${slug}`);
}
