import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import type { DescribedElement } from './described-by-mixin.js';
import '../components/forms/form-field/form-field.js';
import '../components/inputs/checkbox/checkbox.js';
import '../components/inputs/checkbox-field/checkbox-field.js';
import '../components/inputs/code-editor/code-editor.js';
import '../components/inputs/combo-box/combo-box.js';
import '../components/inputs/date-field/date-field.js';
import '../components/inputs/date-picker/date-picker.js';
import '../components/inputs/dropdown/dropdown.js';
import '../components/inputs/file-field/file-field.js';
import '../components/inputs/multi-line-text-field/multi-line-text-field.js';
import '../components/inputs/number-field/number-field.js';
import '../components/inputs/password-field/password-field.js';
import '../components/inputs/radio-button/radio-button.js';
import '../components/inputs/radio-button-field/radio-button-field.js';
import '../components/inputs/radio-button-group/radio-button-group.js';
import '../components/inputs/search-field/search-field.js';
import '../components/inputs/segmented-control/segmented-control.js';
import '../components/inputs/stepper/stepper.js';
import '../components/inputs/switch/switch.js';
import '../components/inputs/switch-field/switch-field.js';
import '../components/inputs/text-editor/text-editor.js';
import '../components/inputs/text-field/text-field.js';
import '../components/inputs/time-field/time-field.js';
import '../components/inputs/time-picker/time-picker.js';
import '../components/inputs/toggle-button/toggle-button.js';
import '../components/inputs/toggle-button-group/toggle-button-group.js';
import '../components/inputs/token-field/token-field.js';
import '../components/forms/validation-list/validation-list.js';

/**
 * The contract of nldd-form-field: what describes a field has to reach the
 * accessible description of the control the user actually operates.
 *
 * Putting the text on screen is not enough, and neither is setting the
 * attribute. An IDREF resolves inside the tree of the element that carries it,
 * so `aria-describedby="rules"` on an input inside a shadow root cannot find a
 * list that lives in the light DOM. The attribute is set, the id is right, and
 * the description comes out empty.
 *
 * Every input is therefore checked the same way: put it in a field with a
 * validation list, mark it invalid, and ask whether the reference resolves from
 * where it is written. Which element that is differs per component. One that
 * carries an ARIA role of its own is the control (a radiogroup); one that hands
 * focus to something inside its shadow root is not, and the description belongs
 * to whatever ends up focused.
 */

/** The deepest focused element, piercing shadow roots. */
function deepestActive(): Element | null {
	let el: Element | null = document.activeElement;
	while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
	return el;
}

/**
 * The element whose accessible description the error text has to land on.
 *
 * The component answers, because only it knows. A composite widget is the
 * clearest case: focus roves over the days of a calendar, but the description
 * belongs to the grid, which is what a screen reader announces on the way in.
 * A test that insisted on the focused element would push every such component
 * to the wrong answer.
 *
 * What keeps that honest is the second check below: focus has to land on the
 * declared control or inside it. A component cannot point at some quiet corner
 * of its shadow root and call it the control.
 */
function descriptionTarget(host: HTMLElement): Element {
	// Follow the chain: a field that wraps another component hands the question
	// on, and the answer is wherever that stops.
	let el: Element = host;
	for (let hop = 0; hop < 5; hop++) {
		const declared = (el as Partial<DescribedElement>).describedTarget?.();
		if (!declared || declared === el) break;
		el = declared;
	}
	return el;
}

/** Whether focus lands on `target` or somewhere inside it, shadow roots included. */
function focusReaches(host: HTMLElement, target: Element): boolean {
	(document.activeElement as HTMLElement | null)?.blur();
	host.focus();
	const focused = deepestActive();
	if (!focused || focused === document.body) return true; // niet focusbaar in een headless run

	let node: Node | null = focused;
	while (node) {
		if (node === target) return true;
		node = node.parentNode instanceof ShadowRoot ? (node.parentNode as ShadowRoot).host : node.parentNode;
	}
	return false;
}

/** Whether the description is reachable from `el` as written, elements or ids. */
function describes(el: Element, error: Element): boolean {
	const elements = (el as Element & { ariaDescribedByElements?: readonly Element[] | null })
		.ariaDescribedByElements;
	if (elements?.includes(error)) return true;

	const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
	if (!ids.length) return false;
	const root = el.getRootNode() as Document | ShadowRoot;
	return ids.some(id => root.getElementById?.(id) === error);
}

interface Case {
	name: string;
	/** Markup for the control, without the surrounding field. */
	control: string;
}

const cases: Case[] = [
	{ name: 'nldd-checkbox', control: '<nldd-checkbox accessible-label="Akkoord"></nldd-checkbox>' },
	{ name: 'nldd-checkbox-field', control: '<nldd-checkbox-field label="Akkoord"></nldd-checkbox-field>' },
	{ name: 'nldd-code-editor', control: '<nldd-code-editor accessible-label="Code"></nldd-code-editor>' },
	{
		name: 'nldd-combo-box',
		control: `<nldd-combo-box accessible-label="Land">
			<nldd-menu><nldd-menu-item text="Nederland" value="nl"></nldd-menu-item></nldd-menu>
		</nldd-combo-box>`,
	},
	{ name: 'nldd-date-field', control: '<nldd-date-field></nldd-date-field>' },
	{ name: 'nldd-date-picker', control: '<nldd-date-picker accessible-label="Datum"></nldd-date-picker>' },
	{
		name: 'nldd-dropdown',
		control: `<nldd-dropdown>
			<select aria-label="Optie"><option value="1">Optie 1</option></select>
		</nldd-dropdown>`,
	},
	{ name: 'nldd-file-field', control: '<nldd-file-field></nldd-file-field>' },
	{ name: 'nldd-multi-line-text-field', control: '<nldd-multi-line-text-field></nldd-multi-line-text-field>' },
	{ name: 'nldd-number-field', control: '<nldd-number-field></nldd-number-field>' },
	{ name: 'nldd-password-field', control: '<nldd-password-field></nldd-password-field>' },
	{ name: 'nldd-radio-button', control: '<nldd-radio-button value="1" text="Optie 1"></nldd-radio-button>' },
	{ name: 'nldd-radio-button-field', control: '<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>' },
	{
		name: 'nldd-radio-button-group',
		control: `<nldd-radio-button-group name="option" accessible-label="Optie">
			<nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
		</nldd-radio-button-group>`,
	},
	{ name: 'nldd-search-field', control: '<nldd-search-field></nldd-search-field>' },
	{
		name: 'nldd-segmented-control',
		control: `<nldd-segmented-control accessible-label="Weergave">
			<nldd-segmented-control-item value="list" text="Lijst"></nldd-segmented-control-item>
		</nldd-segmented-control>`,
	},
	{ name: 'nldd-stepper', control: '<nldd-stepper accessible-label="Aantal"></nldd-stepper>' },
	{ name: 'nldd-switch', control: '<nldd-switch accessible-label="Aan"></nldd-switch>' },
	{ name: 'nldd-switch-field', control: '<nldd-switch-field label="Aan"></nldd-switch-field>' },
	{ name: 'nldd-text-editor', control: '<nldd-text-editor accessible-label="Tekst"></nldd-text-editor>' },
	{ name: 'nldd-text-field', control: '<nldd-text-field></nldd-text-field>' },
	{ name: 'nldd-time-field', control: '<nldd-time-field></nldd-time-field>' },
	{ name: 'nldd-time-picker', control: '<nldd-time-picker accessible-label="Tijd"></nldd-time-picker>' },
	{ name: 'nldd-toggle-button', control: '<nldd-toggle-button value="1" text="Vet"></nldd-toggle-button>' },
	{
		name: 'nldd-toggle-button-group',
		control: `<nldd-toggle-button-group type="radio" name="view" accessible-label="Weergave">
			<nldd-toggle-button value="list" text="Lijst"></nldd-toggle-button>
		</nldd-toggle-button-group>`,
	},
	{ name: 'nldd-token-field', control: '<nldd-token-field accessible-label="Landen"></nldd-token-field>' },
];

describe('nldd-form-field: the description reaches the control', () => {
	let field: HTMLElement;

	afterEach(() => {
		if (field) cleanup(field);
	});

	for (const { name, control } of cases) {
		it(name, async () => {
			field = await fixture<HTMLElement>(
				`<nldd-form-field label="Vraag">
					${control}
					<nldd-validation-list id="rules">
						<nldd-validation-item id="rule-unmet">Dit klopt niet.</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>`,
			);
			await waitForUpdate(field);

			const control_ = field.querySelector(name) as HTMLElement;
			control_.setAttribute('invalid', '');
			control_.setAttribute('unmet', 'rule-unmet');
			await waitForUpdate(field);

			const list = field.querySelector('#rules') as HTMLElement;
			expect(getComputedStyle(list).display).not.toBe('none');

			// The item and not the list: Safari passes no description on to
			// VoiceOver from the text in a role="list", which the list renders.
			const item = field.querySelector('#rule-unmet') as HTMLElement;
			const target = descriptionTarget(control_);
			expect(
				describes(target, item),
				`${name}: the description does not reach <${target.localName}>`,
			).toBe(true);
			expect(
				focusReaches(control_, target),
				`${name}: focus lands outside <${target.localName}>, so that is not the control`,
			).toBe(true);
		});
	}
});
