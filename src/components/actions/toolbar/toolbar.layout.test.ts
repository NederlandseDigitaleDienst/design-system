import { describe, it, expect } from 'vitest';
import type { ToolbarChild } from './toolbar.template.js';
import { areaWidth, fillsRowAlone, groupForOverflow, overflowOrder } from './toolbar.layout.js';

const element = document.createElement('div');
let nextId = 0;
const item = (label: string, priority = 0, isFluid = false): ToolbarChild => ({
	type: 'item', element, label, id: nextId++, priority, hasPriority: priority !== 0,
	overflowItems: [], minWidth: '', maxWidth: '', width: '', isFluid,
});
const title = (): ToolbarChild => ({ type: 'title', element, id: nextId++ });
const labels = (children: ToolbarChild[]) => children.map(c => (c.type === 'item' ? c.label : c.type));

describe('overflowOrder', () => {
	it('moves the lowest priority first, then end, center and start, each from the outside in', () => {
		const order = overflowOrder(
			[item('s1'), item('s2')],
			[item('c1')],
			[item('e1'), item('e2'), item('low', -1)],
		);
		expect(labels(order)).toEqual(['low', 'e2', 'e1', 'c1', 's2', 's1']);
	});

	it('leaves titles out', () => {
		expect(labels(overflowOrder([title(), item('a')], [], []))).toEqual(['a']);
	});
});

describe('groupForOverflow', () => {
	it('keeps items of one explicit priority together, wherever they are', () => {
		const order = overflowOrder([item('s', 2)], [], [item('e1'), item('e2', 2)]);
		const groups = groupForOverflow(order).map(group => labels(group));
		expect(groups).toEqual([['e1'], ['e2', 's']]);
	});
});

describe('areaWidth', () => {
	it('adds the visible widths and the gaps between them', () => {
		const [a, b, c] = [item('a'), item('b'), title()];
		const widths = new Map([[a.id, 40], [b.id, 60], [c.id, 100]]);
		expect(areaWidth([a, b, c], new Set(), widths, 8)).toBe(40 + 60 + 100 + 2 * 8);
		expect(areaWidth([a, b, c], new Set([b.id]), widths, 8)).toBe(40 + 100 + 8);
		expect(areaWidth([], new Set(), widths, 8)).toBe(0);
	});
});

describe('fillsRowAlone', () => {
	it('is true for a lone title or a lone fluid item, and for nothing else', () => {
		expect(fillsRowAlone([title()])).toBe(true);
		expect(fillsRowAlone([item('search', 0, true)])).toBe(true);
		expect(fillsRowAlone([item('button')])).toBe(false);
		expect(fillsRowAlone([title(), item('button')])).toBe(false);
		expect(fillsRowAlone([])).toBe(false);
	});
});
