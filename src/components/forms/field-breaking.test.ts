import { describe, it, expect, afterEach } from 'vitest';
import '../../assets/styles/variables.css';
import { fixture, cleanup, waitForUpdate } from '../../test-utils.js';
import './form-field/form-field.js';
import './validation-list/validation-list.js';
import '../inputs/text-field/text-field.js';
import '../inputs/checkbox-field/checkbox-field.js';
import '../inputs/radio-button-field/radio-button-field.js';
import '../inputs/switch-field/switch-field.js';
import { wrapBodyText, wrapUiText } from '../../assets/styles/text-wrap.js';
import { wrapOf, wrapOfSets } from '../../assets/styles/text-wrap.fixtures.js';

const WORD = 'Arbeidsongeschiktheidsverzekering';

/** How far a text node anywhere under `box` runs past its right edge, in px. */
function overflowOf(box: Element): number {
	const right = box.getBoundingClientRect().right;
	let worst = 0;
	const walk = (node: Node) => {
		const children = [...node.childNodes, ...((node as Element).shadowRoot?.childNodes ?? [])];
		for (const child of children) {
			if (child.nodeType === Node.TEXT_NODE && child.textContent!.trim()) {
				const range = document.createRange();
				range.selectNodeContents(child);
				worst = Math.max(worst, range.getBoundingClientRect().right - right);
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				walk(child);
			}
		}
	};
	walk(box);
	return worst;
}

const CASES: Record<string, string> = {
	'nldd-form-field label, supporting label and help text': `
		<nldd-form-field label="${WORD}" supporting-label="Omgevingsvergunningaanvraag" help-text="Zie ${WORD}aanvraag">
			<nldd-text-field></nldd-text-field>
		</nldd-form-field>`,
	'nldd-form-field with label-alignment="left"': `
		<nldd-form-field label-alignment="left" label="${WORD}"><nldd-text-field></nldd-text-field></nldd-form-field>`,
	'nldd-checkbox-field': `<nldd-checkbox-field label="${WORD}"></nldd-checkbox-field>`,
	'nldd-radio-button-field': `<nldd-radio-button-field label="${WORD}"></nldd-radio-button-field>`,
	'nldd-switch-field': `<nldd-switch-field label="${WORD}"></nldd-switch-field>`,
};

describe('fields – breaking long words', () => {
	let el: HTMLElement;

	afterEach(() => cleanup(el));

	it.each(Object.entries(CASES))('keeps the text inside 160px: %s', async (_name, html) => {
		el = await fixture(`<div style="width: 160px">${html}</div>`);
		await waitForUpdate(el.firstElementChild as HTMLElement);
		await new Promise((r) => requestAnimationFrame(r));
		expect(overflowOf(el)).toBeLessThanOrEqual(1);
	});

	it('gives the labels wrapUiText and the help text wrapBodyText', async () => {
		el = await fixture(CASES['nldd-form-field label, supporting label and help text']);
		await waitForUpdate(el);
		const root = el.shadowRoot!;
		expect(wrapOf(root.querySelector('.form-field__label-text')!)).toEqual(wrapOfSets(wrapUiText));
		expect(wrapOf(root.querySelector('.form-field__supporting-label')!)).toEqual(wrapOfSets(wrapUiText));
		expect(wrapOf(root.querySelector('.form-field__help-text')!)).toEqual(wrapOfSets(wrapBodyText));
	});

	it.each(['checkbox-field', 'radio-button-field', 'switch-field'])('gives the label of nldd-%s wrapUiText', async (name) => {
		el = await fixture(`<nldd-${name} label="Dakisolatie"></nldd-${name}>`);
		await waitForUpdate(el);
		expect(wrapOf(el.shadowRoot!.querySelector(`.${name}__label`)!)).toEqual(wrapOfSets(wrapUiText));
	});

	it('gives a validation item wrapBodyText', async () => {
		el = await fixture(`<nldd-validation-list><nldd-validation-item required>${WORD}</nldd-validation-item></nldd-validation-list>`);
		await waitForUpdate(el);
		expect(wrapOf(el.querySelector('nldd-validation-item')!)).toEqual(wrapOfSets(wrapBodyText));
	});
});
