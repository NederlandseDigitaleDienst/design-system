import { describe, it, expect, afterEach } from 'vitest';
import axe from 'axe-core';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import '../components/forms/form-field/form-field.js';
import '../components/inputs/radio-button/radio-button.js';
import '../components/inputs/radio-button-field/radio-button-field.js';
import '../components/inputs/radio-button-group/radio-button-group.js';
import '../components/inputs/segmented-control/segmented-control.js';
import '../components/inputs/toggle-button/toggle-button.js';
import '../components/inputs/toggle-button-group/toggle-button-group.js';

const cases: { name: string; markup: string }[] = [
	{
		name: 'nldd-radio-button-field in a group in a form field',
		markup: `<nldd-form-field label="Optie" required>
			<nldd-radio-button-group name="optie" required>
				<nldd-radio-button-field value="1" label="Een"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Twee"></nldd-radio-button-field>
			</nldd-radio-button-group>
		</nldd-form-field>`,
	},
	{
		name: 'loose nldd-radio-buttons',
		markup: `<div role="radiogroup" aria-label="Los">
			<nldd-radio-button name="los" value="1" required accessible-label="Een"></nldd-radio-button>
			<nldd-radio-button name="los" value="2" required accessible-label="Twee"></nldd-radio-button>
		</div>`,
	},
	{
		name: 'nldd-toggle-button-group type="radio"',
		markup: `<nldd-toggle-button-group type="radio" name="view" accessible-label="Weergave" required>
			<nldd-toggle-button value="list" text="Lijst"></nldd-toggle-button>
			<nldd-toggle-button value="grid" text="Raster"></nldd-toggle-button>
		</nldd-toggle-button-group>`,
	},
	{
		name: 'nldd-segmented-control',
		markup: `<nldd-segmented-control required name="view" accessible-label="Weergave">
			<nldd-segmented-control-item value="list" text="Lijst"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="grid" text="Raster"></nldd-segmented-control-item>
		</nldd-segmented-control>`,
	},
];

describe('no interactive element inside another', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	for (const { name, markup } of cases) {
		it(name, async () => {
			el = await fixture<HTMLElement>(`<div>${markup}</div>`);
			for (const child of el.querySelectorAll('*')) {
				if ((child as { updateComplete?: Promise<unknown> }).updateComplete) await waitForUpdate(child as HTMLElement);
			}
			const result = await axe.run(el, { runOnly: ['nested-interactive'] });
			const found = result.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' > ')));
			expect(found).toEqual([]);
		});
	}
});
