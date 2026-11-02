import { describe, it, expect, afterEach } from 'vitest';
import type { LitElement } from 'lit';
import '../components/inputs/text-field/text-field.js';
import '../components/inputs/number-field/number-field.js';
import '../components/inputs/checkbox/checkbox.js';
import '../components/inputs/dropdown/dropdown.js';
import '../components/actions/button/button.js';

const added: Element[] = [];

/** Puts an element in the page and focuses it before it has rendered. */
function addAndFocus(markup: string): LitElement {
	const wrapper = document.createElement('div');
	wrapper.innerHTML = markup;
	document.body.append(wrapper);
	added.push(wrapper);
	const el = wrapper.firstElementChild as LitElement;
	el.focus();
	return el;
}

describe('deferFocus', () => {
	afterEach(() => {
		for (const el of added.splice(0)) el.remove();
	});

	it.each([
		'<nldd-text-field accessible-label="Link"></nldd-text-field>',
		'<nldd-number-field accessible-label="Aantal"></nldd-number-field>',
		'<nldd-checkbox accessible-label="Akkoord"></nldd-checkbox>',
		'<nldd-dropdown accessible-label="Keuze"><select><option>Een</option></select></nldd-dropdown>',
		'<nldd-button text="Opslaan"></nldd-button>',
	])('takes a focus() from before the first render: %s', async (markup) => {
		const el = addAndFocus(markup);
		expect(el.hasUpdated).toBe(false);
		await el.updateComplete;
		// The dropdown hands focus to its slotted <select>, the others to their
		// own shadow root.
		const inside = el.shadowRoot!.activeElement ?? el.querySelector(':focus');
		expect(inside).not.toBeNull();
	});

	it('lets a later focus elsewhere win', async () => {
		const el = addAndFocus('<nldd-text-field accessible-label="Link"></nldd-text-field>');
		const other = document.createElement('button');
		document.body.append(other);
		added.push(other);
		other.focus();
		await el.updateComplete;
		expect(document.activeElement).toBe(other);
	});

	it('focuses straight away once rendered', async () => {
		const el = addAndFocus('<nldd-text-field accessible-label="Link"></nldd-text-field>');
		await el.updateComplete;
		el.blur();
		(document.activeElement as HTMLElement | null)?.blur();
		el.focus();
		expect(el.shadowRoot!.activeElement).not.toBeNull();
	});
});
