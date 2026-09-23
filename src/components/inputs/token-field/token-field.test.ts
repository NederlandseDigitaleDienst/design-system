import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './token-field.js';

type TokenFieldEl = HTMLElement & {
	values: string[];
	_isOpen: boolean;
	_addValue(v: string): void;
	_removeValue(v: string): void;
	_togglePicker(): void;
	_handleBlur(e: FocusEvent): void;
};

describe('nldd-token-field', () => {
	let el: TokenFieldEl;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error and exposes the inline input', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags" allow-custom></nldd-token-field>');
		expect(el.shadowRoot).toBeTruthy();
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeTruthy();
	});

	it('renders a dismissible token per value', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags"></nldd-token-field>');
		el.values = ['a', 'b'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('nldd-token').length).toBe(2);
	});

	it('seeds values from a comma-separated attribute (whitespace trimmed, blanks dropped)', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags" values=" a , ,b, c "></nldd-token-field>');
		await waitForUpdate(el);
		expect(el.values).toEqual(['a', 'b', 'c']);
	});

	it('uses the slotted menu-item text as the token label', async () => {
		el = await fixture(`
			<nldd-token-field accessible-label="Tags">
				<nldd-menu>
					<nldd-menu-item value="a" text="Alpha"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		el.values = ['a'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('text')).toBe('Alpha');
	});

	it('names each dismiss button after its token', async () => {
		el = await fixture(`
			<nldd-token-field accessible-label="Tags">
				<nldd-menu>
					<nldd-menu-item value="a" text="Alpha"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		el.values = ['a'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('dismiss-text')).toBe('Verwijder "Alpha"');
	});

	it('falls back to the raw value when no matching option exists', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags"></nldd-token-field>');
		el.values = ['x'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('text')).toBe('x');
	});

	it('dismissing a token drops the value and fires change', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags"></nldd-token-field>');
		el.values = ['a', 'b'];
		await waitForUpdate(el);
		let detail: { values: string[] } | null = null;
		el.addEventListener('change', (e) => {
			detail = (e as CustomEvent<{ values: string[] }>).detail;
		});
		el._removeValue('a');
		await waitForUpdate(el);
		expect(el.values).toEqual(['b']);
		expect(detail).toEqual({ values: ['b'] });
	});

	it('dedupes on add', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags"></nldd-token-field>');
		el.values = ['a'];
		el._addValue('a');
		expect(el.values).toEqual(['a']);
	});

	it('hides the input when no options remain and custom is not allowed', async () => {
		el = await fixture(`
			<nldd-token-field accessible-label="Tags">
				<nldd-menu>
					<nldd-menu-item value="a" text="Alpha"></nldd-menu-item>
					<nldd-menu-item value="b" text="Beta"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		el.values = ['a', 'b'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
	});

	it('keeps the input visible when custom values are allowed', async () => {
		el = await fixture(`
			<nldd-token-field accessible-label="Tags" allow-custom>
				<nldd-menu>
					<nldd-menu-item value="a" text="Alpha"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		el.values = ['a'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeTruthy();
	});

	it('keeps the placeholder on the input, also with tokens present', async () => {
		el = await fixture('<nldd-token-field accessible-label="Tags" allow-custom placeholder="Voeg toe…"></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		expect(input.getAttribute('placeholder')).toBe('Voeg toe…');
		el.values = ['a'];
		await waitForUpdate(el);
		expect(input.getAttribute('placeholder')).toBe('Voeg toe…');
	});

	// — Menu wiring (F2) ——————————————————————————————————————————————————————

	const withMenu = () => fixture<TokenFieldEl>(`
		<nldd-token-field accessible-label="Landen">
			<nldd-menu variant="listbox">
				<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
				<nldd-menu-item value="be" text="België"></nldd-menu-item>
			</nldd-menu>
		</nldd-token-field>
	`);

	it('selecting an option adds it as a token and fires change', async () => {
		el = await withMenu();
		await waitForUpdate(el);
		let detail: { values: string[] } | null = null;
		el.addEventListener('change', (e) => {
			detail = (e as CustomEvent<{ values: string[] }>).detail;
		});
		el.querySelector('nldd-menu-item[value="be"]')!
			.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		expect(el.values).toEqual(['be']);
		expect(detail).toEqual({ values: ['be'] });
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('text')).toBe('België');
	});

	it('hides options that are already selected from the menu', async () => {
		el = await withMenu();
		el.values = ['nl'];
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-item[value="nl"]')!.hasAttribute('hidden')).toBe(true);
		expect(el.querySelector('nldd-menu-item[value="be"]')!.hasAttribute('hidden')).toBe(false);
	});

	it('reveals an option again when its token is removed', async () => {
		el = await withMenu();
		el.values = ['nl'];
		await waitForUpdate(el);
		el._removeValue('nl');
		await waitForUpdate(el);
		expect(el.querySelector('nldd-menu-item[value="nl"]')!.hasAttribute('hidden')).toBe(false);
	});

	// — Comma-separated custom input ——————————————————————————————————————————

	const typeInto = async (input: HTMLInputElement, value: string) => {
		input.value = value;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
	};

	it('splits comma-separated custom input into tokens, keeping the trailing part', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'a@x.com, b@y.com');
		expect(el.values).toEqual(['a@x.com']);
		expect(input.value.trim()).toBe('b@y.com');
	});

	it('commits a token on a trailing comma and clears the input', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'hello,');
		expect(el.values).toEqual(['hello']);
		expect(input.value).toBe('');
	});

	it('does not treat commas as separators without allow-custom', async () => {
		el = await withMenu(); // has options (so the input renders), no allow-custom
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'a,b');
		expect(el.values).toEqual([]);
	});

	// — Commit on blur ————————————————————————————————————————————————————————————

	it('commits free-typed text on blur (allow-custom)', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'a@x.com');
		el._handleBlur(new FocusEvent('blur'));
		await waitForUpdate(el);
		expect(el.values).toEqual(['a@x.com']);
		expect(input.value).toBe('');
	});

	it('does not commit on blur without allow-custom', async () => {
		el = await withMenu(); // options only, no allow-custom
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'freeform');
		el._handleBlur(new FocusEvent('blur'));
		await waitForUpdate(el);
		expect(el.values).toEqual([]);
	});

	// — Picker button ——————————————————————————————————————————————————————————

	it('renders a picker button and toggles the menu with it', async () => {
		el = await withMenu();
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__picker nldd-icon-button')).toBeTruthy();
		el._togglePicker();
		await waitForUpdate(el);
		expect(el._isOpen).toBe(true);
		el._togglePicker();
		await waitForUpdate(el);
		expect(el._isOpen).toBe(false);
	});

	it('highlights the first option when the menu opens', async () => {
		el = await withMenu();
		await waitForUpdate(el);
		el._togglePicker();
		await waitForUpdate(el);
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
		expect(el.querySelector('nldd-menu-item[highlighted]')?.getAttribute('value')).toBe('nl');
	});

	it('reacts to a values change without a change-in-update warning', async () => {
		// Regression: reacting to a values change in updated() re-syncs the menu,
		// which sets reactive state (_highlightedId, as filter() re-seats the
		// highlight) after the update completed — tripping Lit's change-in-update
		// warning. The reaction now runs in willUpdate() so it folds into the same
		// cycle. Menu must be present: the sync is what touches the state.
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture<TokenFieldEl>(`
			<nldd-token-field accessible-label="Tags">
				<nldd-menu>
					<nldd-menu-item value="a" text="Alpha"></nldd-menu-item>
					<nldd-menu-item value="b" text="Bravo"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		el.values = ['a']; // a values change with a menu present re-syncs the menu
		await waitForUpdate(el);
		const warnedInUpdate = warn.mock.calls.some((args) =>
			args.some((a) => typeof a === 'string' && a.includes('scheduled an update')),
		);
		warn.mockRestore();
		expect(warnedInUpdate).toBe(false);
	});

	it('renders no picker for a free-text field without a menu', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__picker')).toBeNull();
	});

	const pressEnter = (input: HTMLInputElement) =>
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

	it('commits a custom value on Enter with no menu', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'test 3');
		pressEnter(input);
		await waitForUpdate(el);
		expect(el.values).toEqual(['test 3']);
	});

	it('commits a custom value on Enter when the menu has no matching option', async () => {
		el = await fixture<TokenFieldEl>(`
			<nldd-token-field accessible-label="Landen" allow-custom>
				<nldd-menu variant="listbox">
					<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
				</nldd-menu>
			</nldd-token-field>
		`);
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		await typeInto(input, 'xyz'); // matches no option → menu closes
		pressEnter(input);
		await waitForUpdate(el);
		expect(el.values).toEqual(['xyz']);
	});

	// — Form participation (F3) ————————————————————————————————————————————————

	it('submits one form entry per token value', async () => {
		const form = document.createElement('form');
		const field = document.createElement('nldd-token-field') as TokenFieldEl;
		field.setAttribute('name', 'landen');
		form.appendChild(field);
		document.body.appendChild(form);
		field.values = ['nl', 'be'];
		await waitForUpdate(field);
		expect(new FormData(form).getAll('landen')).toEqual(['nl', 'be']);
		form.remove();
	});

	// — Keyboard navigation (F3) ———————————————————————————————————————————————

	it('Backspace focuses the last token, a second removes it and returns to the input', async () => {
		el = await withMenu();
		el.values = ['nl'];
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		const token = el.shadowRoot!.querySelectorAll('nldd-token')[0];
		expect(el.shadowRoot!.activeElement).toBe(token); // focused, not removed
		expect(el.values).toEqual(['nl']);
		token.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(el.values).toEqual([]);
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.token-field__input'));
	});

	it('removes a token on Backspace while the token is focused', async () => {
		el = await withMenu();
		el.values = ['nl', 'be'];
		await waitForUpdate(el);
		const token = el.shadowRoot!.querySelectorAll('nldd-token')[0];
		token.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		expect(el.values).toEqual(['be']);
	});

	// — Roving focus / single tab stop when the input is hidden ————————————————

	it('keeps one tab stop when the input is hidden (roving token, controls not tabbable)', async () => {
		el = await withMenu();
		el.values = ['nl', 'be']; // both options taken, no custom -> input hidden
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
		const tokens = [...el.shadowRoot!.querySelectorAll('nldd-token')];
		expect(tokens.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1']);
		for (const t of tokens) {
			expect(t.hasAttribute('roving')).toBe(true);
			const control = t.shadowRoot!.querySelector('nldd-icon-button')!;
			expect(control.hasAttribute('no-tab')).toBe(true);
			expect(control.shadowRoot!.querySelector('.icon-button')!.getAttribute('tabindex')).toBe('-1');
		}
	});

	it('focus() lands on the roving token when the input is hidden', async () => {
		el = await withMenu();
		el.values = ['nl', 'be'];
		await waitForUpdate(el);
		el.focus();
		await waitForUpdate(el);
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelectorAll('nldd-token')[0]);
	});

	it('Backspace keeps focus on a token when the input stays hidden', async () => {
		// No menu and no custom input: the input never shows, so deleting must not
		// drop focus to the body — it steps onto the token now at this position.
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags"></nldd-token-field>');
		el.values = ['a', 'b', 'c'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
		const token = el.shadowRoot!.querySelector<HTMLElement>('nldd-token')!;
		token.focus();
		token.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(el.values).toEqual(['b', 'c']);
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelectorAll('nldd-token')[0]);
	});

	it('resets the roving tab stop to the first token after focus leaves the field', async () => {
		el = await withMenu();
		el.values = ['nl', 'be']; // both options taken -> input hidden, roving active
		await waitForUpdate(el);
		const tokens = () => [...el.shadowRoot!.querySelectorAll('nldd-token')];
		// Move the roving stop to the second token.
		tokens()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		await waitForUpdate(el);
		expect(tokens().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0']);
		// Focus an element outside the field: the stop returns to the first token.
		const outside = document.createElement('button');
		document.body.appendChild(outside);
		outside.focus();
		await new Promise<void>((r) => queueMicrotask(() => r()));
		await waitForUpdate(el);
		expect(tokens().map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1']);
		outside.remove();
	});

	it('clicking empty space focuses the last token when the input is hidden', async () => {
		el = await withMenu();
		el.values = ['nl', 'be']; // all options taken -> input hidden
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
		el.shadowRoot!.querySelector('.token-field')!
			.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelectorAll('nldd-token')[1]);
	});

	it('Delete on a token moves focus to the token that took its place', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags" allow-custom></nldd-token-field>');
		el.values = ['a', 'b', 'c'];
		await waitForUpdate(el);
		const tokens = () => [...el.shadowRoot!.querySelectorAll<HTMLElement>('nldd-token')];
		tokens()[1].focus();
		tokens()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
		await waitForUpdate(el);
		await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(el.values).toEqual(['a', 'c']);
		expect(el.shadowRoot!.activeElement).toBe(tokens()[1]); // 'c' shifted into index 1
	});

	it('Backspace on the last token returns focus to the input', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags" allow-custom></nldd-token-field>');
		el.values = ['a', 'b', 'c'];
		await waitForUpdate(el);
		const tokens = () => [...el.shadowRoot!.querySelectorAll<HTMLElement>('nldd-token')];
		tokens()[2].focus();
		tokens()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(el.values).toEqual(['a', 'b']);
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.token-field__input'));
	});

	it('ArrowLeft at the start of an empty email input steps onto the last token', async () => {
		// type="email" inputs expose no caret (selectionStart is null); an empty value
		// must still count as "at the start" so ArrowLeft steps into the tokens.
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" type="email" allow-custom></nldd-token-field>');
		el.values = ['a@x.com', 'b@y.com'];
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector<HTMLInputElement>('.token-field__input')!;
		input.focus();
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		await waitForUpdate(el);
		expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelectorAll('nldd-token')[1]);
	});

	// — Menu-control tokens (token-control="menu") ————————————————————————————

	const withTokenMenu = () => fixture<TokenFieldEl>(`
		<nldd-token-field accessible-label="Landen" token-control="menu">
			<nldd-menu variant="listbox">
				<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
				<nldd-menu-item value="be" text="België"></nldd-menu-item>
			</nldd-menu>
			<nldd-token slot="template">
				<nldd-menu slot="menu">
					<nldd-menu-item value="remove" text="Verwijder" destructive></nldd-menu-item>
				</nldd-menu>
			</nldd-token>
			<nldd-token slot="template" data-value="nl">
				<nldd-menu slot="menu">
					<nldd-menu-item value="capital" text="Hoofdstad"></nldd-menu-item>
					<nldd-menu-item value="remove" text="Verwijder" destructive></nldd-menu-item>
				</nldd-menu>
			</nldd-token>
		</nldd-token-field>
	`);

	it('token-control="menu" clones the shared menu, and the data-value override where present', async () => {
		el = await withTokenMenu();
		el.values = ['nl', 'be'];
		await waitForUpdate(el);
		const tokens = [...el.shadowRoot!.querySelectorAll('nldd-token')];
		expect(tokens.map((t) => t.getAttribute('control'))).toEqual(['menu', 'menu']);
		const textsFor = (t: Element) => [...t.querySelectorAll('nldd-menu[slot="menu"] nldd-menu-item')]
			.map((i) => i.getAttribute('text'));
		expect(textsFor(tokens[0])).toEqual(['Hoofdstad', 'Verwijder']); // nl: override
		expect(textsFor(tokens[1])).toEqual(['Verwijder']); // be: shared default
	});

	it('selecting a token menu action fires token-action with the value and action', async () => {
		el = await withTokenMenu();
		el.values = ['nl', 'be'];
		await waitForUpdate(el);
		let detail: { value: string; action: string } | null = null;
		el.addEventListener('token-action', (e) => {
			detail = (e as CustomEvent<{ value: string; action: string }>).detail;
		});
		const beToken = [...el.shadowRoot!.querySelectorAll('nldd-token')]
			.find((t) => t.getAttribute('data-value') === 'be')!;
		(beToken.querySelector('nldd-menu-item[value="remove"]') as HTMLElement & { select(): void }).select();
		expect(detail).toEqual({ value: 'be', action: 'remove' });
	});

	it('an app-driven removal from a token menu moves focus to the next token', async () => {
		el = await withTokenMenu();
		el.values = ['nl', 'be'];
		await waitForUpdate(el);
		el.addEventListener('token-action', (e) => {
			const { value, action } = (e as CustomEvent<{ value: string; action: string }>).detail;
			if (action === 'remove') el.values = el.values.filter((v) => v !== value);
		});
		const tokens = () => [...el.shadowRoot!.querySelectorAll<HTMLElement>('nldd-token')];
		tokens()[0].focus(); // focus the 'nl' token, then remove it via its menu
		tokens()[0].querySelector<HTMLElement & { select(): void }>('nldd-menu-item[value="remove"]')!.select();
		await waitForUpdate(el);
		await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
		expect(el.values).toEqual(['be']);
		expect(el.shadowRoot!.activeElement).toBe(tokens()[0]); // 'be' shifted into index 0
	});

	it('an open token\'s expanded state does not leak onto another when one is removed', async () => {
		// Keyed rendering: tokens are not reused by position, so removing an "open"
		// (expanded) token can't carry that state onto the token that shifts into its slot.
		el = await withTokenMenu();
		el.values = ['nl', 'be', 'de'];
		await waitForUpdate(el);
		const tokenFor = (v: string) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('nldd-token')]
			.find((t) => t.dataset.value === v)!;
		(tokenFor('be') as HTMLElement & { expanded: boolean }).expanded = true; // its menu is "open"
		await waitForUpdate(el);
		const deBefore = tokenFor('de');
		el.values = ['nl', 'de']; // remove the expanded 'be'
		await waitForUpdate(el);
		const deAfter = tokenFor('de');
		expect(deAfter).toBe(deBefore); // same element (kept, not reused/recreated)
		expect(deAfter.hasAttribute('expanded')).toBe(false); // no stale open state leaked
	});

	it('re-clones a token menu when its template prototype changes at runtime', async () => {
		el = await withTokenMenu();
		el.values = ['be']; // 'be' uses the shared prototype (["Verwijder"])
		await waitForUpdate(el);
		const menuTexts = () => [...el.shadowRoot!.querySelectorAll('nldd-token nldd-menu[slot="menu"] nldd-menu-item')]
			.map((i) => i.getAttribute('text'));
		expect(menuTexts()).toEqual(['Verwijder']);
		// Add an action to the shared prototype at runtime; the observer re-clones it.
		const proto = el.querySelector('nldd-token[slot="template"]:not([data-value]) nldd-menu[slot="menu"]')!;
		const extra = document.createElement('nldd-menu-item');
		extra.setAttribute('value', 'edit');
		extra.setAttribute('text', 'Bewerken');
		proto.insertBefore(extra, proto.firstChild);
		await new Promise((r) => setTimeout(r, 0)); // let the MutationObserver fire
		await waitForUpdate(el);
		expect(menuTexts()).toEqual(['Bewerken', 'Verwijder']);
	});

	// — Duplicate values (F…) —————————————————————————————————————————————————

	it('dedupes values on set so the keyed render never gets duplicate keys', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags" allow-custom></nldd-token-field>');
		el.values = ['a', 'a', 'b', 'a'];
		await waitForUpdate(el);
		expect(el.values).toEqual(['a', 'b']);
		expect([...el.shadowRoot!.querySelectorAll<HTMLElement>('nldd-token')].map((t) => t.dataset.value))
			.toEqual(['a', 'b']);
	});

	it('dedupes values seeded from the comma-separated attribute', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="Tags" values="a, a, b, a"></nldd-token-field>');
		await waitForUpdate(el);
		expect(el.values).toEqual(['a', 'b']);
	});

	// — Accessibility: host name + list grouping —————————————————————————————————

	it('gives the host a group role and a name that survive the input being hidden', async () => {
		el = await withMenu(); // accessible-label="Landen", options nl/be
		el.values = ['nl', 'be']; // both taken -> input (and its aria-label) gone
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
		const internals = (el as unknown as { internals: ElementInternals }).internals;
		expect(internals.role).toBe('group');
		expect(internals.ariaLabel).toBe('Landen');
		expect(el.shadowRoot!.querySelector('[role="list"]')).not.toBeNull();
		expect([...el.shadowRoot!.querySelectorAll('nldd-token')].every((t) => t.getAttribute('role') === 'listitem'))
			.toBe(true);
	});

	it('a removable token announces that it can be removed via its accessible name', async () => {
		el = await withMenu(); // 'nl' -> "Nederland"
		el.values = ['nl'];
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('aria-label'))
			.toBe('Nederland, verwijderbaar');
	});

	// — Readonly & required (F3.5) —————————————————————————————————————————————

	it('readonly hides the input and picker and makes tokens static', async () => {
		el = await withMenu();
		el.values = ['nl'];
		(el as unknown as { readonly: boolean }).readonly = true;
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.token-field__input')).toBeNull();
		expect(el.shadowRoot!.querySelector('.token-field__picker')).toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-token')!.getAttribute('control')).toBeNull();
	});

	it('disabled: tokens leave the tab order and keyboard removal is inert', async () => {
		el = await withMenu();
		el.values = ['nl', 'be'];
		(el as unknown as { disabled: boolean }).disabled = true;
		await waitForUpdate(el);
		const tokens = [...el.shadowRoot!.querySelectorAll('nldd-token')];
		expect(tokens.every((t) => t.getAttribute('tabindex') === null)).toBe(true);
		tokens[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
		await waitForUpdate(el);
		expect(el.values).toEqual(['nl', 'be']); // not removable while disabled
	});

	it('a free-text field with no slotted menu is not exposed as a combobox', async () => {
		el = await fixture<TokenFieldEl>('<nldd-token-field accessible-label="E-mail" allow-custom></nldd-token-field>');
		await waitForUpdate(el);
		const input = el.shadowRoot!.querySelector('.token-field__input')!;
		expect(input.getAttribute('role')).toBeNull();
		expect(input.hasAttribute('aria-controls')).toBe(false);
		expect(input.hasAttribute('aria-haspopup')).toBe(false);
	});

	it('is invalid when required and empty, valid once a token is added', async () => {
		const form = document.createElement('form');
		const field = document.createElement('nldd-token-field') as TokenFieldEl;
		field.setAttribute('name', 'landen');
		field.setAttribute('required', '');
		form.appendChild(field);
		document.body.appendChild(form);
		await waitForUpdate(field);
		expect(form.checkValidity()).toBe(false);
		field.values = ['nl'];
		await waitForUpdate(field);
		expect(form.checkValidity()).toBe(true);
		form.remove();
	});

});
