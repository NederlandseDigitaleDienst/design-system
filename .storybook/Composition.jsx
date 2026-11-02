import { Source } from '@storybook/addon-docs/blocks';
import { parse } from 'yaml';
import { renderComposition } from '../scripts/lib/pattern-spec.js';

const specs = import.meta.glob('../src/patterns/*/*.pattern.yaml', { query: '?raw', import: 'default', eager: true });

/**
 * The tree of a pattern, drawn from its .pattern.yaml so it cannot drift from the
 * checks. Without `format={false}` the Source block strips the leading spaces.
 */
export function Composition({ pattern }) {
	const source = specs[`../src/patterns/${pattern}/${pattern}.pattern.yaml`];
	return <Source language="text" format={false} code={renderComposition(parse(source).composition)} />;
}
