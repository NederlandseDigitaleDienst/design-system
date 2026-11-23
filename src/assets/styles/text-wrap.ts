import { css, unsafeCSS, type CSSResult } from 'lit';

/**
 * How text breaks when it does not fit, per use. One set per kind of text, so
 * the decision for that kind lives here and every component that shows it
 * follows: change what body text does, and every body text changes with it.
 *
 * Each set is only about whether and where a word breaks. How the lines are
 * divided (`text-wrap: pretty` or `balance`) is a choice of the component.
 *
 * Usage, in the rule of the element that holds the text (or its host, as the
 * properties inherit into slotted content):
 *
 * ```ts
 * css`
 *   :host {
 *     ${wrapBodyText}
 *   }
 *
 *   :host([hyphens]) {
 *     ${hyphenateBodyText}
 *   }
 * `
 * ```
 *
 * Hyphenation needs a `lang` on the page; without one the browser does not
 * hyphenate, and the safety net of the set still breaks the word.
 *
 * In a `::slotted()` rule after `slottedReset`, wrap a set in
 * {@link important}, as every other declaration there is.
 *
 * A plain stylesheet (rich-text.css, text.css) cannot import these, so it
 * writes the values out with a comment naming the set. A test of that
 * component compares the two with text-wrap.fixtures.ts.
 */

/**
 * Text to read: a paragraph, a list item, the supporting text of a message.
 * Breaks at spaces and hyphens; a word wider than the line breaks between two
 * letters, so it never runs out of its box. `break-word` and not `anywhere`:
 * the minimum width of the text stays its longest word, so a column in a grid
 * or a flex row does not shrink to a single letter.
 */
export const wrapBodyText = css`
	overflow-wrap: break-word;
`;

/**
 * Opt-in hyphenation for body text, behind a `hyphens` attribute. Breaks a
 * word of at least 6 letters by syllable, with at least 3 on either side.
 */
export const hyphenateBodyText = css`
	-webkit-hyphens: auto;
	hyphens: auto;
	-webkit-hyphenate-limit-before: 3;
	-webkit-hyphenate-limit-after: 3;
	hyphenate-limit-chars: 6 3 3;
`;

/**
 * Text that is part of the interface rather than read: the text of a button,
 * a tag. Few words on a short line, often one compound, and a word cut between
 * two letters looks broken in so small a box. So, like large text, always
 * hyphenated, but only a word of at least 12 letters with 5 on either side:
 * a short word and a name of a few words stay whole. `break-word` as the
 * safety net, so the minimum width stays the longest word.
 */
export const wrapUiText = css`
	overflow-wrap: break-word;
	-webkit-hyphens: auto;
	hyphens: auto;
	-webkit-hyphenate-limit-before: 5;
	-webkit-hyphenate-limit-after: 5;
	hyphenate-limit-chars: 12 5 5;
`;

/**
 * Large text: a display size, a title, a heading. At these sizes a line holds
 * few letters, so a long compound would often be cut between two letters, and
 * it shows. Always hyphenated, but only a word of at least 12 letters with 5
 * on either side, so a short word moves to the next line whole. `anywhere` as
 * the safety net: large text gives way rather than run out of a flex row.
 */
export const wrapDisplayText = css`
	overflow-wrap: anywhere;
	-webkit-hyphens: auto;
	hyphens: auto;
	-webkit-hyphenate-limit-before: 5;
	-webkit-hyphenate-limit-after: 5;
	hyphenate-limit-chars: 12 5 5;
`;

/**
 * Inline code and file names: a tag name, a hash, a path, `besluit-A-1042.pdf`.
 * They have no spaces or syllables to break at, so they break between any two
 * characters, and their minimum width is one character: a column with code in
 * it, in a table or a grid, does not widen to the longest token.
 */
export const wrapCodeText = css`
	overflow-wrap: anywhere;
`;

/**
 * A set with `!important` on each declaration, for a `::slotted()` rule after `slottedReset`.
 * It splits on `;`, so it holds only for sets of plain declarations: a `;` inside a value,
 * in a `url()` or a string, would break it.
 */
export const important = (set: CSSResult): CSSResult => unsafeCSS(set.cssText.replace(/;/g, ' !important;'));
