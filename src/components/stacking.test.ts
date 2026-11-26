import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import './index.js';
import '../assets/styles/variables.css';

/**
 * A layer inside a component, such as a focused button or an input on top of
 * its drawing, stays inside it. A z-index that reaches the page paints over a
 * sticky header (nldd-page gives its header z-index 1), so every component
 * that lifts something inside isolates itself.
 */
const COMPONENTS: Record<string, string> = {
	'nldd-text-field': '<nldd-text-field accessible-label="E-mailadres"><nldd-icon-button slot="button" icon="arrow-right" text="Verstuur"></nldd-icon-button></nldd-text-field>',
	'nldd-multi-line-text-field': '<nldd-multi-line-text-field accessible-label="Toelichting"><nldd-icon-button slot="button" icon="arrow-right" text="Verstuur"></nldd-icon-button></nldd-multi-line-text-field>',
	'nldd-search-field': '<nldd-search-field accessible-label="Zoek" value="Dakisolatie"></nldd-search-field>',
	'nldd-password-field': '<nldd-password-field accessible-label="Wachtwoord" value="geheim"></nldd-password-field>',
	'nldd-combo-box': '<nldd-combo-box accessible-label="Team" value="Uitvoering" text="Uitvoering"><nldd-menu><nldd-menu-item text="Uitvoering"></nldd-menu-item></nldd-menu></nldd-combo-box>',
	'nldd-token-field': '<nldd-token-field accessible-label="Teams"><nldd-menu><nldd-menu-item text="Uitvoering"></nldd-menu-item></nldd-menu></nldd-token-field>',
	'nldd-checkbox': '<nldd-checkbox accessible-label="Akkoord"></nldd-checkbox>',
	'nldd-switch': '<nldd-switch accessible-label="Meldingen"></nldd-switch>',
	'nldd-toggle-button': '<nldd-toggle-button text="Vet" icon="text-b"></nldd-toggle-button>',
	'nldd-slider': '<nldd-slider accessible-label="Waarde" value="50"></nldd-slider>',
	'nldd-one-time-code-field': '<nldd-one-time-code-field accessible-label="Code"></nldd-one-time-code-field>',
	'nldd-accordion': '<nldd-accordion><nldd-accordion-item text="Aanvraag A-1042"><p>Dakisolatie</p></nldd-accordion-item></nldd-accordion>',
	'nldd-code-editor': '<nldd-code-editor accessible-label="Code" value="x"></nldd-code-editor>',
	'nldd-text-editor': '<nldd-text-editor accessible-label="Notitie"></nldd-text-editor>',
};

/** Every element in the light and shadow trees under root. */
function everyElement(root: ParentNode, found: Element[] = []): Element[] {
	for (const el of root.querySelectorAll('*')) {
		found.push(el);
		if (el.shadowRoot) everyElement(el.shadowRoot, found);
	}
	return found;
}

/** The layers with a z-index that paint over the header. */
function overHeader(wrapper: HTMLElement, header: HTMLElement): string[] {
	const over: string[] = [];
	for (const el of everyElement(wrapper)) {
		if (el === header || getComputedStyle(el).zIndex === 'auto') continue;
		const box = el.getBoundingClientRect();
		if (!box.width || !box.height) continue;
		const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
		if (top && top !== header) over.push(`${el.localName}.${el.classList[0] ?? ''}`);
	}
	return over;
}

describe('a layer inside a component', () => {
	let wrapper: HTMLElement;

	afterEach(() => cleanup(wrapper));

	it.each(Object.entries(COMPONENTS))('stays under a sticky header: %s', async (_tag, html) => {
		wrapper = await fixture<HTMLElement>(
			`<div style="isolation: isolate; width: 600px">
				<div class="header" style="position: relative; z-index: 1; height: 400px; background: white"></div>
				<div style="margin-top: -400px; padding: 20px">${html}</div>
			</div>`,
		);
		await waitForUpdate(wrapper);
		const header = wrapper.querySelector<HTMLElement>('.header')!;
		const over = new Set(overHeader(wrapper, header));
		// Most layers only lift while something inside has focus.
		for (const el of everyElement(wrapper)) {
			if (!(el instanceof HTMLElement) || el === header || el.tabIndex < 0) continue;
			el.focus();
			overHeader(wrapper, header).forEach((layer) => over.add(layer));
		}
		expect([...over]).toEqual([]);
	});
});
