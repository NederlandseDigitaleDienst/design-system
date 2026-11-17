import { describe, it, expect, afterEach } from 'vitest';
import { ChoiceGroup, type ChoiceOption } from './choice-group.js';
import '../components/inputs/radio-button-group/radio-button-group.js';
import '../components/inputs/radio-button-field/radio-button-field.js';
import '../components/inputs/checkbox-group/checkbox-group.js';
import '../components/inputs/checkbox-field/checkbox-field.js';
import '../components/inputs/toggle-button-group/toggle-button-group.js';
import '../components/inputs/toggle-button/toggle-button.js';

/**
 * What ChoiceGroup hands every option, checked for each group at once: the
 * name, `disabled` and `required`, whether anything is chosen, and for single
 * choice the one stop for Tab, also after a change the group did not see.
 */

interface Case {
	group: string;
	option: string;
	attrs: string;
	/** The property that holds the choice. */
	prop: 'checked' | 'selected';
	single: boolean;
	/** Whether `required` reaches the options. */
	required: boolean;
}

const cases: Case[] = [
	{ group: 'nldd-radio-button-group', option: 'nldd-radio-button-field', attrs: 'label="Optie"', prop: 'checked', single: true, required: true },
	{ group: 'nldd-checkbox-group', option: 'nldd-checkbox-field', attrs: 'label="Optie"', prop: 'checked', single: false, required: true },
	{ group: 'nldd-toggle-button-group', option: 'nldd-toggle-button', attrs: 'text="Optie"', prop: 'selected', single: true, required: true },
];

type Option = ChoiceOption & Record<string, unknown> & { updateComplete: Promise<boolean> };
type Group = HTMLElement & { name: string; disabled: boolean; required: boolean; updateComplete: Promise<boolean> };

let form: HTMLFormElement;

async function settle(els: Element[]): Promise<void> {
	for (let i = 0; i < 2; i++) {
		await Promise.all(els.map((el) => (el as Option).updateComplete));
		await new Promise((resolve) => setTimeout(resolve));
	}
}

async function mount(c: Case, groupAttrs = ''): Promise<{ group: Group; options: Option[] }> {
	form = document.createElement('form');
	const type = c.group === 'nldd-toggle-button-group' ? 'type="radio"' : '';
	form.innerHTML = `<${c.group} accessible-label="Vraag" name="vraag" ${type} ${groupAttrs}>
		${['a', 'b', 'c'].map((v) => `<${c.option} value="${v}" ${c.attrs}></${c.option}>`).join('')}
	</${c.group}>`;
	document.body.append(form);
	const group = form.firstElementChild as Group;
	const options = [...group.children] as Option[];
	await settle([group, ...options]);
	return { group, options };
}

afterEach(() => {
	form?.remove();
});

describe.each(cases)('$group', (c) => {
	it('is the group of its options', async () => {
		const { options } = await mount(c);
		expect(ChoiceGroup.of(options[0]!)).not.toBeNull();
		expect(ChoiceGroup.of(form)).toBeNull();
	});

	it('hands every option its name, also a later one', async () => {
		const { group, options } = await mount(c);
		expect(options.map((o) => o.name)).toEqual(['vraag', 'vraag', 'vraag']);
		group.name = 'anders';
		await settle([group, ...options]);
		expect(options.map((o) => o.name)).toEqual(['anders', 'anders', 'anders']);
	});

	it('enables again only what it disabled', async () => {
		const { group, options } = await mount(c);
		options[1]!.disabled = true;
		options[1]!.setAttribute('disabled', '');
		group.disabled = true;
		await settle([group, ...options]);
		expect(options.every((o) => o.disabled)).toBe(true);
		expect(options[0]!.hasAttribute('group-disabled')).toBe(true);
		expect(options[1]!.hasAttribute('group-disabled')).toBe(false);
		group.disabled = false;
		await settle([group, ...options]);
		expect(options.map((o) => o.disabled)).toEqual([false, true, false]);
	});

	it('answers required for the whole group, also when the app chooses', async () => {
		const { group, options } = await mount(c, 'required');
		expect(options.every((o) => o.required)).toBe(c.required);
		expect(form.checkValidity()).toBe(false);
		options[2]![c.prop] = true;
		await settle([group, ...options]);
		expect(options.every((o) => o._groupHasSelection)).toBe(true);
		expect(form.checkValidity()).toBe(true);
	});

	if (c.single) {
		it('keeps one choice, and one stop for Tab after a reset', async () => {
			const { group, options } = await mount(c);
			options[0]![c.prop] = true;
			await settle([group, ...options]);
			options[2]![c.prop] = true;
			await settle([group, ...options]);
			expect(options.map((o) => o[c.prop])).toEqual([false, false, true]);
			expect(new FormData(form).getAll('vraag')).toEqual(['c']);
			expect(options.map((o) => o.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);

			form.reset();
			await settle([group, ...options]);
			expect(options.some((o) => o[c.prop])).toBe(false);
			expect(options.map((o) => o.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
		});
	} else {
		it('lets every option be chosen', async () => {
			const { group, options } = await mount(c);
			options[0]![c.prop] = true;
			options[2]![c.prop] = true;
			await settle([group, ...options]);
			expect(new FormData(form).getAll('vraag')).toEqual(['a', 'c']);
		});
	}
});

describe('nested checkbox fields', () => {
	it('belong to the group around the option they are under', async () => {
		form = document.createElement('form');
		form.innerHTML = `<nldd-checkbox-group accessible-label="Vraag" name="vraag" required>
			<nldd-checkbox-field value="alles" label="Alles">
				<nldd-checkbox-field slot="children" value="a" label="A"></nldd-checkbox-field>
			</nldd-checkbox-field>
		</nldd-checkbox-group>`;
		document.body.append(form);
		const child = form.querySelector('[slot="children"]') as unknown as Option;
		const all = [...form.querySelectorAll('nldd-checkbox-group, nldd-checkbox-field')];
		await settle(all);
		expect(ChoiceGroup.of(child)).toBe(ChoiceGroup.of(child.parentElement!));
		child.checked = true;
		await settle(all);
		expect(form.checkValidity()).toBe(true);
	});
});
