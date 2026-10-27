/* Cutting a file name short in the middle, as Finder does: the start and the end
 * of a name tell files apart ("Screenshot … 15.42.11.png", "rapport-v3.pdf"),
 * so the characters that fit are shared evenly between the two, and the
 * extension always stays. CSS can only cut at the start or the end, so this
 * measures the text against the width it has. */

const ELLIPSIS = '…';

/** Splits a name at its last dot. A leading dot (".env") is no extension. */
export function splitName(name: string): [string, string] {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
}

/** Characters of the name kept in view before the extension in the first
 *  render, before anything is measured. */
const NAME_END_LENGTH = 8;

/** The split of the first render, done by CSS: a start that is cut short when it
 *  does not fit, and an end, the last characters and the extension, that stays. */
export function splitForTruncation(name: string): [string, string] {
	const [base, extension] = splitName(name);
	const cut = Math.max(0, base.length - NAME_END_LENGTH);
	return [base.slice(0, cut), base.slice(cut) + extension];
}

function compose(base: string, extension: string, kept: number): string {
	const start = base.slice(0, Math.ceil(kept / 2)).trimEnd();
	const end = base.slice(base.length - Math.floor(kept / 2)).trimStart();
	return `${start}${ELLIPSIS}${end}${extension}`;
}

/**
 * The name as it fits `width`, measured with `measure`: whole when it fits,
 * otherwise as many characters as fit, half from the start and half from the
 * end, around an ellipsis and before the extension.
 */
export function truncateMiddle(
	name: string,
	width: number,
	measure: (text: string) => number,
): { text: string; truncated: boolean } {
	if (measure(name) <= width) return { text: name, truncated: false };
	const [base, extension] = splitName(name);
	let low = 0;
	let high = base.length - 1;
	while (low < high) {
		const mid = Math.ceil((low + high) / 2);
		if (measure(compose(base, extension, mid)) <= width) low = mid;
		else high = mid - 1;
	}
	return { text: compose(base, extension, low), truncated: true };
}

/** Measures text the way `container` renders it, with a hidden span in it.
 *  Canvas text metrics drift from the page by a character or two (kerning,
 *  font features), which shows as a second, CSS ellipsis. Call `done` after. */
export function textMeasurer(container: Element): { measure: (text: string) => number; done: () => void } {
	const probe = document.createElement('span');
	probe.style.cssText = 'position: absolute; visibility: hidden; white-space: pre;';
	container.append(probe);
	return {
		measure: (text) => {
			probe.textContent = text;
			return probe.getBoundingClientRect().width;
		},
		done: () => probe.remove(),
	};
}
