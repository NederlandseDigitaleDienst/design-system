/**
 * Reports a rule from src/rules/ that only the component can detect: a measurement,
 * a method called at the wrong moment, a value that needs parsing. The condition
 * stays where it can be known; what it means is in the rule, like any other.
 *
 * A rule a selector can express does not come through here.
 */

import { ruleMessages, type RuntimeRuleId } from './rule-messages.generated.js';

export function reportRule(id: RuntimeRuleId, element?: Element, detail?: string): void {
	if (!import.meta.env?.DEV) return;
	const suffix = detail ? ` (${detail})` : '';
	console.warn(`[nldd] ${id}: ${ruleMessages[id]}${suffix}`, element);
}
