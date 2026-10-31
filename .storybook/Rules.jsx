import data from '../lint/data.generated.json';
import { rulesOfPattern } from '../lint/rule-index.js';

/**
 * The section "Regels" on a pattern page: the rules from src/rules/ that point at
 * this pattern with `see`. A new rule appears here without touching the page.
 */
export function Rules({ pattern }) {
	const rules = rulesOfPattern(data.rules, pattern);
	if (rules.length === 0) return null;
	return (
		<>
			<h2>Regels</h2>
			<p>
				<code>nldd lint</code> controleert dit:
			</p>
			<ul>
				{rules.map((rule) => (
					<li key={rule.id}>
						<code>{rule.id}</code>: {rule.message}
					</li>
				))}
			</ul>
		</>
	);
}
