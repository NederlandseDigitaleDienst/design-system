/**
 * Finds the nldd-* markup in a markdown file and checks it against an API map.
 *
 * Shared so validate-skill-markup.js can be tested without its file walking and
 * process.exit, the same split as declared-attributes.js.
 *
 * The scanner tracks nesting because two of the four checks need the parent: a
 * `slot=` belongs to the surrounding component, and the split views document
 * their responsive attributes on the container while you set them on a child.
 */

/**
 * Attributes every custom element accepts, so correct HTML is not reported.
 * `slot` is checked against the parent's declared slots instead of here.
 */
const GLOBAL_ATTRS = new Set([
	'class',
	'id',
	'style',
	'slot',
	'hidden',
	'title',
	'lang',
	'dir',
	'role',
	'tabindex',
	'part',
	'exportparts',
	'is',
	'ref',
	'key',
]);

/**
 * Attributes an app sets on a form control without a property behind them, so
 * no component declares them. `unmet` names the validation items a server
 * rejected: nldd-validation-list reads it off whatever control it targets
 * (`control.getAttribute('unmet')`), which makes it part of the contract of
 * every input rather than of one component.
 */
const CONTROL_ATTRS = new Set(['unmet']);

/**
 * Framework binding syntax. The skill documents plain HTML, Vue and Angular, so
 * `:text`, `[attr.x]`, `@close`, `v-if` and `{{ … }}` are all correct in their
 * own context and carry no attribute name we could check.
 */
export function isFrameworkAttr(name) {
	return (
		name.startsWith(':') ||
		name.startsWith('@') ||
		name.startsWith('v-') ||
		name.startsWith('#') ||
		name.startsWith('*') ||
		name.startsWith('[') ||
		name.startsWith('(') ||
		name.startsWith('data-') ||
		name.startsWith('aria-') ||
		name.startsWith('{') ||
		name.includes('{{')
	);
}

/**
 * Attributes out of one opening tag's attribute text. Values may be quoted,
 * unquoted or absent (a boolean attribute).
 */
export function parseAttrs(text) {
	const attrs = [];
	const re = /([^\s=/"'<>]+)(\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	for (const m of text.matchAll(re)) {
		attrs.push({ name: m[1], value: m[4] ?? m[5] ?? m[6] });
	}
	return attrs;
}

/**
 * Every `<nldd-*>` opening tag, with its line number and the enclosing nldd
 * element. Scans the whole file rather than only fenced blocks: the prose uses
 * inline code like `<nldd-spacer size="32">` too, and that is just as copyable.
 */
export function scanTags(source) {
	const found = [];
	const stack = [];
	const re = /<(\/?)(nldd-[a-z0-9-]*)([^>]*?)(\/?)>/g;
	for (const m of source.matchAll(re)) {
		const [, closing, tag, attrText, selfClose] = m;
		const line = source.slice(0, m.index).split('\n').length;
		if (closing) {
			// Unwind to the matching open tag. A doc may show a fragment that
			// closes something it never opened, so a missing entry is ignored
			// rather than clearing the stack.
			const at = stack.lastIndexOf(tag);
			if (at !== -1) stack.length = at;
			continue;
		}
		found.push({ tag, attrText, line, parent: stack[stack.length - 1] ?? null });
		if (!selfClose) stack.push(tag);
	}
	return found;
}

/**
 * Checks one file's markup.
 *
 * @param source     markdown text
 * @param api        Map of tag -> { attrs: Set, slots: Set }
 * @param mixinAttrs Set of attribute names the shared mixins bring in
 * @param iconNames  Set of valid nldd-icon names, aliases included
 * @returns array of { line, message }
 */
export function checkMarkup(source, { api, mixinAttrs = new Set(), iconNames = new Set() }) {
	const problems = [];
	for (const { tag, attrText, line, parent } of scanTags(source)) {
		const spec = api.get(tag);
		if (!spec) {
			problems.push({ line, message: `onbekend component <${tag}>` });
			continue;
		}
		const attrs = parseAttrs(attrText);
		for (const { name, value } of attrs) {
			if (isFrameworkAttr(name)) continue;
			const attr = name.toLowerCase();
			if (attr === 'slot') {
				// `@slot *` means the component takes any slot name (the split
				// views turn each unique name into a panel), so anything goes.
				if (value && parent) {
					const parentSpec = api.get(parent);
					if (parentSpec && !parentSpec.slots.has('*') && !parentSpec.slots.has(value)) {
						problems.push({
							line,
							message: `<${tag} slot="${value}"> bestaat niet op <${parent}>`,
						});
					}
				}
				continue;
			}
			if (GLOBAL_ATTRS.has(attr) || CONTROL_ATTRS.has(attr)) continue;
			if (spec.attrs.has(attr) || mixinAttrs.has(attr)) continue;
			// Some attributes are documented on the container but belong on its
			// children: the split views document above/below/only as
			// "responsive visibility per child".
			if (parent && api.get(parent)?.attrs.has(attr)) continue;
			problems.push({ line, message: `<${tag}> heeft geen attribuut "${name}"` });
		}
		// Icon names live in `icon`, on nldd-icon and on the 17 components that
		// render one themselves (banner, tag, menu-item, icon-cell and so on).
		// Checking only nldd-icon missed those, which is how a wrong icon name
		// reached a consumer before (see the Fundament commit "repair broken
		// icon names").
		const iconAttr = attrs.find((a) => a.name.toLowerCase() === 'icon');
		// Skip a bound value: the name then comes from the app, not the doc.
		if (iconAttr?.value && !iconAttr.value.includes('{') && !iconNames.has(iconAttr.value)) {
			problems.push({ line, message: `onbekende icoonnaam "${iconAttr.value}"` });
		}
	}
	return problems;
}
