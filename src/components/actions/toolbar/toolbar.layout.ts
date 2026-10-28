import type { ToolbarChild } from './toolbar.template.js';

/**
 * The rules of the toolbar's layout that need no DOM: in which order items
 * move into the overflow menu, which of them go together, how wide an area is,
 * and when a spacer gives way. The toolbar measures; these decide.
 */

/** A toolbar child narrowed to an item; the overflow works on these. */
export type OverflowItem = Extract<ToolbarChild, { type: 'item' }>;

/** Only the items of a list of children. */
export function itemsOf(children: ToolbarChild[]): OverflowItem[] {
	return children.filter((c): c is OverflowItem => c.type === 'item');
}

/**
 * The order in which items move into the overflow menu: the lowest priority
 * first, then end before center before start, and within an area from the
 * outside in (last first).
 */
export function overflowOrder(start: ToolbarChild[], center: ToolbarChild[], end: ToolbarChild[]): OverflowItem[] {
	return [
		...itemsOf(end).map((item, index) => ({ item, areaOrder: 0, index })),
		...itemsOf(center).map((item, index) => ({ item, areaOrder: 1, index })),
		...itemsOf(start).map((item, index) => ({ item, areaOrder: 2, index })),
	]
		.sort((a, b) => {
			if (a.item.priority !== b.item.priority) return a.item.priority - b.item.priority;
			if (a.areaOrder !== b.areaOrder) return a.areaOrder - b.areaOrder;
			return b.index - a.index;
		})
		.map(({ item }) => item);
}

/**
 * Groups items in overflow order. Items with an explicit priority that share a
 * value form one group and overflow together regardless of their position;
 * items without a priority each form their own group.
 */
export function groupForOverflow(items: OverflowItem[]): OverflowItem[][] {
	const groups: OverflowItem[][] = [];
	const byPriority = new Map<number, OverflowItem[]>();
	for (const child of items) {
		if (!child.hasPriority) {
			groups.push([child]);
			continue;
		}
		const existing = byPriority.get(child.priority);
		if (existing) {
			existing.push(child);
			continue;
		}
		const group: OverflowItem[] = [child];
		byPriority.set(child.priority, group);
		groups.push(group);
	}
	return groups;
}

/** How wide an area is: its visible items and titles plus the gaps between
 *  them. Items in the overflow menu take no room. */
export function areaWidth(
	children: ToolbarChild[],
	overflowIds: ReadonlySet<number>,
	widths: ReadonlyMap<number, number>,
	itemGap: number,
): number {
	const visible = children.filter(c => !overflowIds.has(c.id));
	const gaps = Math.max(0, visible.length - 1) * itemGap;
	return gaps + visible.reduce((sum, child) =>
		(child.type === 'item' || child.type === 'title') ? sum + (widths.get(child.id) ?? 0) : sum, 0);
}

/**
 * Whether the spacers left and right of the center give way: a spacer whose
 * share of the row is used up by its side drops to zero, so the center moves
 * off-center rather than overlapping. With nothing at either side both go.
 */
export function spacerZeros(
	hostWidth: number,
	itemGap: number,
	overflowButtonWidth: number,
	startWidth: number,
	centerWidth: number,
	endWidth: number,
): { leftZero: boolean; rightZero: boolean } {
	if (startWidth === 0 && endWidth === 0) return { leftZero: true, rightZero: true };
	const leftSpacer = hostWidth / 2 - startWidth - centerWidth / 2 - itemGap;
	const rightSpacer = hostWidth / 2 - endWidth - centerWidth / 2 - itemGap - overflowButtonWidth;
	return { leftZero: leftSpacer <= 0, rightZero: rightSpacer <= 0 };
}

/** Whether the one thing left in the row fills it: a title, or a fluid item.
 *  The flexible spacer then drops out, or it would claim half the row. */
export function fillsRowAlone(children: ToolbarChild[]): boolean {
	if (children.length !== 1) return false;
	const [only] = children;
	return only.type === 'title' || (only.type === 'item' && only.isFluid);
}
