import { describe, it, expect, afterEach } from 'vitest';
import type { FormAssociatedElement } from './form-associated-mixin.js';
import '../components/inputs/checkbox/checkbox.js';
import '../components/inputs/checkbox-field/checkbox-field.js';
import '../components/inputs/switch/switch.js';
import '../components/inputs/switch-field/switch-field.js';
import '../components/inputs/radio-button/radio-button.js';
import '../components/inputs/radio-button-field/radio-button-field.js';
import '../components/inputs/toggle-button/toggle-button.js';
import '../components/inputs/text-field/text-field.js';
import '../components/inputs/password-field/password-field.js';
import '../components/inputs/search-field/search-field.js';
import '../components/inputs/multi-line-text-field/multi-line-text-field.js';
import '../components/inputs/one-time-code-field/one-time-code-field.js';
import '../components/inputs/number-field/number-field.js';
import '../components/inputs/stepper/stepper.js';
import '../components/inputs/slider/slider.js';
import '../components/inputs/date-field/date-field.js';
import '../components/inputs/time-field/time-field.js';
import '../components/inputs/combo-box/combo-box.js';
import '../components/inputs/segmented-control/segmented-control.js';
import '../components/inputs/swatch-picker/swatch-picker.js';
import '../components/inputs/token-field/token-field.js';

/**
 * The value lifecycle FormAssociated owns, checked for every input at once: a
 * form reset puts the value back to its default (the attribute, or what a
 * framework set before the first render), and a restore from bfcache fills
 * in what was saved.
 */

interface Case {
	tag: string;
	/** Attributes besides `name`, with the default value in them. */
	attrs: string;
	children?: string;
	/** The property that holds the value, and a value other than the default. */
	prop: string;
	other: unknown;
	/** What the form submits under `field` for the default and for `other`. */
	submitsDefault: string;
	submitsOther: string;
	/** For a value that does not reflect: the attribute and a later default. */
	attribute?: [name: string, value: string, submits: string];
}

const segments = `
	<nldd-segmented-control-item value="a" text="Alpha"></nldd-segmented-control-item>
	<nldd-segmented-control-item value="b" text="Beta"></nldd-segmented-control-item>`;
const swatches = `
	<nldd-swatch-picker-item color="rood" value="rood"></nldd-swatch-picker-item>
	<nldd-swatch-picker-item custom-color="#7a1f3d" text="Huisstijl" value="huisstijl"></nldd-swatch-picker-item>`;

const cases: Case[] = [
	{ tag: 'nldd-checkbox', attrs: 'value="on" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-checkbox-field', attrs: 'value="on" label="Optie" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-switch', attrs: 'value="on" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-switch-field', attrs: 'value="on" label="Optie" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-radio-button', attrs: 'value="on" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-radio-button-field', attrs: 'value="on" label="Optie" checked', prop: 'checked', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-toggle-button', attrs: 'type="checkbox" value="on" text="Aan" selected', prop: 'selected', other: false, submitsDefault: 'on', submitsOther: '' },
	{ tag: 'nldd-text-field', attrs: 'accessible-label="Veld" value="Dakisolatie"', prop: 'value', other: 'Warmtepomp', submitsDefault: 'Dakisolatie', submitsOther: 'Warmtepomp', attribute: ['value', 'Zonnepanelen', 'Zonnepanelen'] },
	{ tag: 'nldd-password-field', attrs: 'accessible-label="Veld" value="geheim"', prop: 'value', other: 'anders', submitsDefault: 'geheim', submitsOther: 'anders', attribute: ['value', 'nieuw', 'nieuw'] },
	{ tag: 'nldd-search-field', attrs: 'accessible-label="Veld" value="A-1042"', prop: 'value', other: 'A-1043', submitsDefault: 'A-1042', submitsOther: 'A-1043', attribute: ['value', 'D-318', 'D-318'] },
	{ tag: 'nldd-multi-line-text-field', attrs: 'accessible-label="Veld" value="Eerst"', prop: 'value', other: 'Daarna', submitsDefault: 'Eerst', submitsOther: 'Daarna', attribute: ['value', 'Later', 'Later'] },
	{ tag: 'nldd-one-time-code-field', attrs: 'accessible-label="Veld" value="123456"', prop: 'value', other: '654321', submitsDefault: '123456', submitsOther: '654321', attribute: ['value', '111111', '111111'] },
	{ tag: 'nldd-number-field', attrs: 'accessible-label="Veld" value="5"', prop: 'value', other: 7, submitsDefault: '5', submitsOther: '7', attribute: ['value', '9', '9'] },
	{ tag: 'nldd-stepper', attrs: 'accessible-label="Veld" value="2" max="10"', prop: 'value', other: 3, submitsDefault: '2', submitsOther: '3', attribute: ['value', '4', '4'] },
	{ tag: 'nldd-slider', attrs: 'accessible-label="Veld" value="20"', prop: 'value', other: 40, submitsDefault: '20', submitsOther: '40', attribute: ['value', '60', '60'] },
	{ tag: 'nldd-date-field', attrs: 'accessible-label="Veld" value="2026-12-31"', prop: 'value', other: '2026-01-15', submitsDefault: '2026-12-31', submitsOther: '2026-01-15', attribute: ['value', '2026-06-01', '2026-06-01'] },
	{ tag: 'nldd-time-field', attrs: 'accessible-label="Veld" value="09:00"', prop: 'value', other: '10:30', submitsDefault: '09:00', submitsOther: '10:30', attribute: ['value', '11:15', '11:15'] },
	{ tag: 'nldd-combo-box', attrs: 'accessible-label="Veld" value="nl" text="Nederland"', prop: 'value', other: 'be', submitsDefault: 'nl', submitsOther: 'be', attribute: ['value', 'de', 'de'] },
	{ tag: 'nldd-segmented-control', attrs: 'accessible-label="Optie" value="a"', children: segments, prop: 'value', other: 'b', submitsDefault: 'a', submitsOther: 'b' },
	{ tag: 'nldd-swatch-picker', attrs: 'accessible-label="Kleur" value="rood"', children: swatches, prop: 'value', other: 'huisstijl', submitsDefault: 'rood', submitsOther: 'huisstijl' },
];

type Control = HTMLElement & FormAssociatedElement & Record<string, unknown> & { updateComplete: Promise<boolean> };

let form: HTMLFormElement;

async function mount(c: Case, attrs = c.attrs, before?: (el: Control) => void): Promise<Control> {
	form = document.createElement('form');
	form.innerHTML = `<${c.tag} name="field" ${attrs}>${c.children ?? ''}</${c.tag}>`;
	const el = form.firstElementChild as Control;
	before?.(el);
	document.body.append(form);
	await settle(el);
	return el;
}

async function settle(el: Control): Promise<void> {
	await el.updateComplete;
	await new Promise((resolve) => setTimeout(resolve));
	await el.updateComplete;
}

const submitted = () => new FormData(form).getAll('field').join(',');

afterEach(() => {
	form?.remove();
});

describe.each(cases)('$tag', (c) => {
	it('resets to its default after a change', async () => {
		const el = await mount(c);
		expect(submitted()).toBe(c.submitsDefault);
		el[c.prop] = c.other;
		await settle(el);
		expect(submitted()).toBe(c.submitsOther);
		form.reset();
		await settle(el);
		expect(submitted()).toBe(c.submitsDefault);
	});

	it('resets to what a framework set before the first render', async () => {
		// The same control without the default in its markup: the framework sets the property.
		const bare = c.attrs.replace(new RegExp(`\\s${c.prop === 'value' ? 'value="[^"]*"' : c.prop}`), '');
		const boolean = c.prop !== 'value';
		// A boolean starts on and is switched off; a value starts on `other` and moves to the markup default.
		const el = await mount(c, bare, (control) => { control[c.prop] = boolean ? true : c.other; });
		const initial = boolean ? c.submitsDefault : c.submitsOther;
		expect(submitted()).toBe(initial);
		el[c.prop] = boolean ? false : typeof c.other === 'number' ? Number(c.submitsDefault) : c.submitsDefault;
		await settle(el);
		expect(submitted()).not.toBe(initial);
		form.reset();
		await settle(el);
		expect(submitted()).toBe(initial);
	});

	if (c.attribute) {
		const [name, value, submits] = c.attribute;
		it('resets to the attribute as it is now, as a native input does', async () => {
			const el = await mount(c);
			el[c.prop] = c.other;
			el.setAttribute(name, value);
			await settle(el);
			el[c.prop] = c.other;
			await settle(el);
			form.reset();
			await settle(el);
			expect(submitted()).toBe(submits);
		});
	}

	it('restores what bfcache saved', async () => {
		const source = await mount(c);
		source[c.prop] = c.other;
		await settle(source);
		const state = source.formState() ?? source.formValue();
		form.remove();

		const el = await mount(c);
		el.formStateRestoreCallback(state, 'restore');
		await settle(el);
		expect(submitted()).toBe(c.submitsOther);
	});
});

describe('nldd-token-field', () => {
	it('resets to the values a framework set before the first render', async () => {
		const c = { tag: 'nldd-token-field', attrs: 'accessible-label="Tags" allow-custom' } as Case;
		const el = await mount(c, c.attrs, (control) => { control.values = ['Dakisolatie']; });
		el.values = ['Dakisolatie', 'Warmtepomp'];
		await settle(el);
		form.reset();
		await settle(el);
		expect(el.values).toEqual(['Dakisolatie']);
	});
});

describe('nldd-token-field restore', () => {
	it('restores the values bfcache saved', async () => {
		const c = { tag: 'nldd-token-field', attrs: 'accessible-label="Tags" allow-custom' } as Case;
		const source = await mount(c, c.attrs, (control) => { control.values = ['Dakisolatie']; });
		source.values = ['Dakisolatie', 'Warmtepomp'];
		await settle(source);
		const state = source.formState() ?? source.formValue();
		form.remove();

		const el = await mount(c);
		el.formStateRestoreCallback(state, 'restore');
		await settle(el);
		expect(submitted()).toBe('Dakisolatie,Warmtepomp');
	});
});

describe('state restore', () => {
	/** The class whose formStateRestoreCallback a control runs. */
	const restoredBy = (tag: string): unknown => {
		let proto = customElements.get(tag)!.prototype;
		while (!Object.prototype.hasOwnProperty.call(proto, 'formStateRestoreCallback')) proto = Object.getPrototypeOf(proto);
		return proto.constructor;
	};
	const mixinOf = (tag: string): unknown => {
		let ctor = customElements.get(tag) as unknown as { formAssociated?: boolean } | null;
		while (ctor && !Object.prototype.hasOwnProperty.call(ctor, 'formAssociated')) ctor = Object.getPrototypeOf(ctor);
		return ctor;
	};

	// The mixin fills one property; a value in more than one needs the control's own.
	it.each([...cases.map((c) => c.tag), 'nldd-token-field'])('%s restores each property that holds its value', (tag) => {
		const properties = (customElements.get(tag) as unknown as { formProperties: readonly string[] }).formProperties;
		if (properties.length === 1) return;
		expect(restoredBy(tag)).not.toBe(mixinOf(tag));
	});
});
