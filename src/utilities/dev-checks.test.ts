import { describe, it, expect, afterEach } from 'vitest';
import '../components/index.js';
import data from '../../lint/data.generated.json';
import { devRules } from './dev-rules.generated.js';
import { findViolations } from './dev-checks.js';

const patterns = import.meta.glob('../patterns/**/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('rules in the browser', () => {
	let root: HTMLElement;

	const mount = async (markup: string) => {
		root = document.createElement('div');
		root.innerHTML = markup;
		document.body.append(root);
		await new Promise((resolve) => setTimeout(resolve, 20));
	};

	afterEach(() => root?.remove());

	for (const rule of devRules) {
		const { examples } = data.rules.find(({ id }) => id === rule.id)!;

		it(`${rule.id} agrees with its examples`, async () => {
			for (const example of examples.passed) {
				await mount(example);
				expect(findViolations(root, [rule]), example).toEqual([]);
				root.remove();
			}
			for (const example of examples.failed) {
				await mount(example.replace(/<\/?(html|body)>/g, ''));
				expect(findViolations(root, [rule]).length, example).toBeGreaterThan(0);
				root.remove();
			}
		});
	}

	it('finds nothing in the patterns', async () => {
		for (const [file, markup] of Object.entries(patterns)) {
			await mount(markup);
			const found = findViolations(root).map(({ rule }) => `${file}: ${rule.id}`);
			expect(found).toEqual([]);
			root.remove();
		}
	});

	it('sees a value set as a property, as a framework does', async () => {
		await mount('<nldd-icon-button icon="plus"></nldd-icon-button>');
		const rule = devRules.filter(({ id }) => id === 'icon-button-needs-name');
		expect(findViolations(root, rule)).toHaveLength(1);
		const button = root.firstElementChild as HTMLElement & { accessibleLabel: string; updateComplete: Promise<boolean> };
		button.accessibleLabel = 'Sluit';
		await button.updateComplete;
		expect(findViolations(root, rule)).toEqual([]);
	});
});
