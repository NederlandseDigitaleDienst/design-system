/**
 * The functions of an app that do nothing with an event's name but listen to it.
 *
 * A listener in a function of the app's own, such as a hook
 * `useEvent(ref, 'tabchange', show)`, is found by its call. Renaming the event
 * there is only certain when the function passes the name on to
 * `addEventListener` and nowhere else: a function that also sends the name on
 * a bus of the app's own, or logs it, breaks when one end changes. So this
 * reads the definitions in the project, and says per function which argument
 * is the name of an event it only listens to.
 *
 * Read from the text, as the rest of the event check: a parameter whose every
 * use is the name in `add`/`removeEventListener`, or a value in an array, an
 * object or a comparison. Any other call that gets it makes the function
 * uncertain, and a name defined more than once counts only where every
 * definition agrees.
 */

const IDENTIFIER = '[A-Za-z_$][\\w$]*';

/** `function useEvent(ref, type, handler) {`, `const useEvent = (ref, type) => {` and `= function (…) {`. */
const DEFINITION = new RegExp(`(?:\\bfunction\\s+(${IDENTIFIER})\\s*(?:<[^>]*>)?\\s*\\(|\\b(?:const|let|var)\\s+(${IDENTIFIER})\\s*(?::[^=]+)?=\\s*(?:async\\s+)?(?:function\\b\\s*)?(?:<[^>]*>)?\\s*\\()`, 'g');

/** A word before a parenthesis that does not call anything. */
const NOT_A_CALL = new Set(['if', 'while', 'for', 'switch', 'return', 'typeof', 'await', 'catch', 'function', 'in', 'of', 'new']);

const LISTENS = new Set(['addEventListener', 'removeEventListener']);

/** Where the bracket at `open` closes, counting the other brackets and skipping strings. */
function closing(text, open) {
	let depth = 0;
	for (let at = open; at < text.length; at++) {
		const char = text[at];
		if (char === '"' || char === "'" || char === '`') {
			for (at++; at < text.length && text[at] !== char; at++) if (text[at] === '\\') at++;
		} else if ('([{'.includes(char)) depth++;
		else if (')]}'.includes(char) && --depth === 0) return at;
	}
	return -1;
}

/** The pieces of an argument or parameter list, split at the commas of its own level. */
function splitTop(text) {
	const parts = [];
	let depth = 0;
	let start = 0;
	for (let at = 0; at < text.length; at++) {
		const char = text[at];
		if ('([{<'.includes(char)) depth++;
		else if (')]}>'.includes(char)) depth--;
		else if (char === ',' && depth === 0) {
			parts.push(text.slice(start, at));
			start = at + 1;
		}
	}
	parts.push(text.slice(start));
	return parts.map((part) => part.trim()).filter(Boolean);
}

/** The name a parameter binds, without its type or default: `type: string = 'x'` is `type`. */
const parameterName = (part) => new RegExp(`^(?:\\.\\.\\.)?(${IDENTIFIER})`).exec(part)?.[1];

/** The call this offset is an argument of, if any: the name before the nearest open parenthesis. */
function enclosingCall(body, offset) {
	let depth = 0;
	for (let at = offset - 1; at >= 0; at--) {
		const char = body[at];
		if (')]}'.includes(char)) depth++;
		else if ('([{'.includes(char)) {
			if (depth > 0) {
				depth--;
				continue;
			}
			if (char !== '(') return undefined;
			const name = new RegExp(`(${IDENTIFIER})\\s*$`).exec(body.slice(0, at))?.[1];
			return name && !NOT_A_CALL.has(name) ? name : undefined;
		}
	}
	return undefined;
}

/** Whether every use of `name` in the body is the name of a listener, or a value that calls nothing. */
function onlyListensWith(body, name) {
	let listens = false;
	for (const match of body.matchAll(new RegExp(`(?<![\\w$.])${name.replace(/\$/g, '\\$')}(?![\\w$])`, 'g'))) {
		const call = enclosingCall(body, match.index);
		if (call === undefined) continue;
		if (!LISTENS.has(call)) return false;
		listens = true;
	}
	return listens;
}

/**
 * @param {{ source: string }[]} inputs - the files of the project the scan read
 * @returns {Map<string, number>} per function, the position of the argument that is an event it only listens to
 */
export function listenerFunctions(inputs) {
	const found = new Map();
	for (const { source } of inputs) {
		if (!/(?:add|remove)EventListener\(/.test(source)) continue;
		for (const match of source.matchAll(DEFINITION)) {
			const name = match[1] ?? match[2];
			const open = match.index + match[0].length - 1;
			const close = closing(source, open);
			if (close < 0) continue;
			const parameters = splitTop(source.slice(open + 1, close)).map(parameterName);
			const brace = source.slice(close).search(/[{]/);
			const arrow = /^\)\s*(?::[^={]+)?=>\s*[^{\s]/.test(source.slice(close));
			if (brace < 0 || arrow) continue;
			const bodyStart = close + brace;
			const body = source.slice(bodyStart, closing(source, bodyStart) + 1);
			const position = parameters.findIndex((parameter) => parameter && onlyListensWith(body, parameter));
			const before = found.get(name);
			// A name defined more than once is certain only where each definition says the same.
			found.set(name, before === undefined ? position : before === position ? position : -1);
		}
	}
	return new Map([...found].filter(([, position]) => position >= 0));
}

export { splitTop };
