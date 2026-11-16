/** A CSS time (`200ms`, `0.2s`) in milliseconds; 0 for anything else. A token
 *  read with getPropertyValue keeps the unit it was written in. */
export function cssTimeToMs(time: string): number {
	const value = parseFloat(time);
	if (Number.isNaN(value)) return 0;
	const unit = time.trim();
	return unit.endsWith('ms') ? value : unit.endsWith('s') ? value * 1000 : 0;
}
