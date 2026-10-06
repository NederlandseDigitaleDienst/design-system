import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate, deepActiveElement } from '../../../test-utils.js';
import type { NLDDSearchField } from './search-field.js';
import './search-field.js';

describe('nldd-search-field', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders a native search input', async () => {
		el = await fixture('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input[type="search"]')).not.toBeNull();
	});

	it('renders nldd-icon for the search icon', async () => {
		el = await fixture('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon')).not.toBeNull();
	});
});


/* ============================================================
   State
   ============================================================ */

describe('nldd-search-field – state', () => {
	let el: NLDDSearchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('forwards placeholder to native input', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field placeholder="Zoek documenten"></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('placeholder')).toBe('Zoek documenten');
	});

	it('forwards accessible-label as aria-label to native input', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field accessible-label="Zoek een document"></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-label')).toBe('Zoek een document');
	});

	it('is disabled when disabled attribute is set', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field disabled></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.disabled).toBe(true);
	});

	it('forwards name to native input', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field name="q"></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('input')!.name).toBe('q');
	});

	it('does not render dismiss button when value is empty', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).toBeNull();
	});

	it('renders dismiss button when value is set', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).not.toBeNull();
	});

	it('does not render search button when show-search-button is not set', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-button')).toBeNull();
	});

	it('renders search button when show-search-button is set', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field show-search-button></nldd-search-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-button')).not.toBeNull();
	});
});


/* ============================================================
   Input & change events
   ============================================================ */

describe('nldd-search-field – input & change events', () => {
	let el: NLDDSearchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('updates value on input', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'test';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(el.value).toBe('test');
	});

	it('dispatches input event with value detail', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'hello';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(detail?.value).toBe('hello');
	});

	// The native input event is composed and would otherwise reach the host as
	// a second `input` right behind ours, with `detail` as the UIEvent number 0
	// instead of an object. A consumer reading e.detail.value gets undefined
	// from that one, and one that writes it back empties the field as you type.
	it('emits one input event per keystroke, never the native one as well', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		const details: unknown[] = [];
		el.addEventListener('input', ((e: CustomEvent) => { details.push(e.detail); }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'a';
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
		expect(details).toEqual([{ value: 'a' }]);
	});

	it('emits one change event per commit, never the native one as well', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		const details: unknown[] = [];
		el.addEventListener('change', ((e: CustomEvent) => { details.push(e.detail); }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		(input as any).value = 'a';
		input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
		expect(details).toEqual([{ value: 'a' }]);
	});
});


/* ============================================================
   Search event
   ============================================================ */

describe('nldd-search-field – search event', () => {
	let el: NLDDSearchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('dispatches search event on Enter', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('search', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		const input = el.shadowRoot!.querySelector('input')!;
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(detail?.value).toBe('test');
	});

	it('dispatches search event on search button click', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test" show-search-button></nldd-search-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('search', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		el._handleSearch();
		expect(detail?.value).toBe('test');
	});
});


/* ============================================================
   Dismiss
   ============================================================ */

describe('nldd-search-field – dismiss', () => {
	let el: NLDDSearchField;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('clears value on dismiss', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		el._handleClear();
		await waitForUpdate(el);
		expect(el.value).toBe('');
	});

	it('dispatches change event with empty value on dismiss', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('change', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		el._handleClear();
		expect(detail?.value).toBe('');
	});

	it('hides dismiss button after dismiss', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		el._handleClear();
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-icon-button')).toBeNull();
	});

	it('dispatches input event with empty value on dismiss', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		let detail: any;
		el.addEventListener('input', ((e: CustomEvent) => { detail = e.detail; }) as EventListener);
		el._handleClear();
		expect(detail?.value).toBe('');
	});

	it('refocuses the input after dismiss', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field value="test"></nldd-search-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		el._handleClear();
		await waitForUpdate(el);
		let active: Element | null = document.activeElement;
		while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
		expect(active).toBe(input);
	});

	it('past inline host width toe als width property gezet is', async () => {
		el = await fixture('<nldd-search-field width="240px"></nldd-search-field>') as NLDDSearchField;
		await waitForUpdate(el);
		expect(el.getAttribute('width')).toBe('240px');
		expect(el.style.getPropertyValue('--_search-field-width')).toBe('240px');
	});

	it('participates in FormData via form-associated API', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-search-field name="q" value="zoekterm"></nldd-search-field></form>');
		el = form as unknown as NLDDSearchField;
		const sf = form.querySelector('nldd-search-field')!;
		await waitForUpdate(sf);
		expect(new FormData(form).get('q')).toBe('zoekterm');
	});

	it('resets to the HTML-declared initial value when the parent form is reset', async () => {
		const form = await fixture<HTMLFormElement>('<form><nldd-search-field name="q" value="default"></nldd-search-field></form>');
		el = form as unknown as NLDDSearchField;
		const sf = form.querySelector<NLDDSearchField>('nldd-search-field')!;
		await waitForUpdate(sf);
		sf.value = 'changed';
		await waitForUpdate(sf);
		form.reset();
		expect(sf.value).toBe('default');
	});

	it('focus() delegates to the inner input', async () => {
		el = await fixture<NLDDSearchField>('<nldd-search-field accessible-label="Zoek"></nldd-search-field>');
		await waitForUpdate(el);
		el.focus();
		const input = el.shadowRoot!.querySelector('input');
		expect(deepActiveElement()).toBe(input);
	});

	it('inner input keeps spellcheck=true by default', async () => {
		el = await fixture('<nldd-search-field></nldd-search-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('true');
	});

	it('no-spellcheck attribute disables spellcheck on inner input', async () => {
		el = await fixture('<nldd-search-field no-spellcheck></nldd-search-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('input')!;
		expect(input.getAttribute('spellcheck')).toBe('false');
	});
});
