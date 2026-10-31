import data from '../lint/data.generated.json';
import { rulesOfPattern } from '../lint/rule-index.js';

function RuleList({ rules }) {
	return (
		<ul>
			{rules.map((rule) => (
				<li key={rule.id}>
					<code>{rule.id}</code>: {rule.message}
				</li>
			))}
		</ul>
	);
}

/**
 * The section "Regels" on a pattern page: the rules from src/rules/ that point at
 * this pattern with `see`. A new rule appears here without touching the page.
 */
export function Rules({ pattern }) {
	const rules = rulesOfPattern(data.rules, pattern);
	const required = rules.filter((rule) => rule.severity !== 'hint');
	const hints = rules.filter((rule) => rule.severity === 'hint');
	if (rules.length === 0) return null;
	return (
		<>
			<h2>Regels</h2>
			{required.length > 0 && (
				<>
					<p>
						<code>nldd lint</code> controleert dit:
					</p>
					<RuleList rules={required} />
				</>
			)}
			{hints.length > 0 && (
				<>
					<p>Hints: zo is het bedoeld. Die laten niets falen.</p>
					<RuleList rules={hints} />
				</>
			)}
		</>
	);
}
