import { describe, it, expect, afterEach } from 'vitest';
import '../components/index.js';
import data from '../../lint/data.generated.json';
import { devRules } from './dev-rules.generated.js';
import { findRoots, findViolations } from './dev-checks.js';

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

	for (const { id, examples } of data.rules.filter((each) => each.examples)) {
		const rule = devRules.find((each) => each.id === id)!;

		it(`${id} agrees with its examples`, async () => {
			for (const example of examples!.passed) {
				await mount(example);
				expect(findViolations(root, [rule]), example).toEqual([]);
				root.remove();
			}
			for (const example of examples!.failed) {
				await mount(example.replace(/<\/?(html|body)>/g, ''));
				// The document, not root: a notification moves itself to its area.
				expect(findViolations(document, [rule]).length, example).toBeGreaterThan(0);
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

	it('looks inside an app component, and not inside our own', async () => {
		await mount('<div id="app-component"></div><nldd-button text="Bewaar"></nldd-button>');
		const shadow = root.querySelector('#app-component')!.attachShadow({ mode: 'open' });
		shadow.innerHTML = '<nldd-icon-button icon="plus"></nldd-icon-button>';
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(findViolations(root)).toEqual([]);
		const roots = findRoots(root);
		expect(roots).toEqual([root, shadow]);
		expect(roots.flatMap((each) => findViolations(each)).map(({ rule }) => rule.id)).toEqual(['icon-button-needs-name']);
	});

	it('reports an icon that does not exist on the component that renders it', async () => {
		await mount('<nldd-button text="Bewaar" start-icon="bestaat-niet"></nldd-button>');
		await (root.firstElementChild as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(findViolations(root).map(({ rule }) => rule.id)).toContain('icon-not-found');
	});

	it('takes a consumer element that says it is an input for an input', async () => {
		class MyInput extends HTMLElement {
			static isFormInput = true;
		}
		customElements.define('my-dev-checks-input', MyInput);
		await mount('<nldd-form-field label="Naam"><my-dev-checks-input></my-dev-checks-input></nldd-form-field>');
		expect(findViolations(root).map(({ rule }) => rule.id)).not.toContain('form-field-needs-input');
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
