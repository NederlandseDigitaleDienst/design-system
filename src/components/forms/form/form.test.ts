import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './form.js';
import '../form-field/form-field.js';
import '../form-actions/form-actions.js';
import type { NLDDForm } from './form.js';

/**
 * NLDDForm extends HTMLElement (not Lit), so waitForUpdate does not cover its
 * MutationObserver callback: that fires outside the Lit update cycle. Use this
 * helper for "wait for pending microtasks" so the observer has had its turn. Do
 * not replace it with waitForUpdate, which would
 * timing breken.
 */
const awaitMicrotask = () => new Promise(resolve => setTimeout(resolve, 0));

describe('nldd-form', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-form></nldd-form>');
		await waitForUpdate(el);
		expect(el.querySelector('form')).not.toBeNull();
	});

	it('verplaatst children in het inner form element', async () => {
		el = await fixture(`
			<nldd-form>
				<input type="text" name="email">
				<button type="submit">Send</button>
			</nldd-form>
		`);
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.querySelector('input[name="email"]')).not.toBeNull();
		expect(form.querySelector('button[type="submit"]')).not.toBeNull();
	});

	it('forwardt name attribuut naar form', async () => {
		el = await fixture('<nldd-form name="login"></nldd-form>');
		await waitForUpdate(el);
		expect(el.querySelector('form')!.getAttribute('name')).toBe('login');
	});

	it('forwardt novalidate attribuut', async () => {
		el = await fixture('<nldd-form novalidate></nldd-form>');
		await waitForUpdate(el);
		expect(el.querySelector('form')!.hasAttribute('novalidate')).toBe(true);
	});

	it('forwardt method en action', async () => {
		el = await fixture('<nldd-form method="post" action="/login"></nldd-form>');
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.getAttribute('method')).toBe('post');
		expect(form.getAttribute('action')).toBe('/login');
	});

	it('forwardt enctype attribuut (multipart/form-data voor file upload)', async () => {
		el = await fixture('<nldd-form enctype="multipart/form-data"></nldd-form>');
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.getAttribute('enctype')).toBe('multipart/form-data');
	});

	it('forwardt target attribuut', async () => {
		el = await fixture('<nldd-form target="_blank"></nldd-form>');
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.getAttribute('target')).toBe('_blank');
	});

	it('forwardt autocomplete attribuut', async () => {
		el = await fixture('<nldd-form autocomplete="off"></nldd-form>');
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.getAttribute('autocomplete')).toBe('off');
	});

	it('verwijdert geforwarde attributen wanneer ze van de host weggehaald worden', async () => {
		el = await fixture('<nldd-form enctype="multipart/form-data" target="_blank"></nldd-form>');
		await waitForUpdate(el);
		const form = el.querySelector('form')!;
		expect(form.getAttribute('enctype')).toBe('multipart/form-data');

		el.removeAttribute('enctype');
		await waitForUpdate(el);
		expect(form.hasAttribute('enctype')).toBe(false);
		// target stays put (no impact)
		expect(form.getAttribute('target')).toBe('_blank');
	});

	it('exposeert het inner form via .form getter', async () => {
		el = await fixture('<nldd-form></nldd-form>');
		await waitForUpdate(el);
		const form = (el as NLDDForm).form;
		expect(form).toBeInstanceOf(HTMLFormElement);
	});

	it('verplaatst dynamisch toegevoegde children naar het form', async () => {
		el = await fixture('<nldd-form></nldd-form>');
		await waitForUpdate(el);

		const input = document.createElement('input');
		input.name = 'late';
		el.appendChild(input);

		// MutationObserver runs async — wait a microtask
		await awaitMicrotask();

		const form = el.querySelector('form')!;
		expect(form.querySelector('input[name="late"]')).not.toBeNull();
	});

	it('user-provided form mode: gebruikt bestaande <form> child i.p.v. nieuwe te creëren', async () => {
		// Framework-friendly mode: the user wraps content in their own <form>. The
		// component detects it and takes it over for attribute mirroring, without
		// shuffling the DOM.
		el = await fixture(`
			<nldd-form name="user-form" novalidate>
				<form>
					<input type="text" name="email">
					<button type="submit">Save</button>
				</form>
			</nldd-form>
		`);
		await waitForUpdate(el);

		// There should be one <form> only (the user's), not a second one we created
		const forms = el.querySelectorAll('form');
		expect(forms.length).toBe(1);

		// The .form getter points at the user's form
		const innerForm = (el as NLDDForm).form;
		expect(innerForm).toBe(forms[0]);

		// Attributes are mirrored
		expect(innerForm!.getAttribute('name')).toBe('user-form');
		expect(innerForm!.hasAttribute('novalidate')).toBe(true);

		// Children stay where they are (not moved)
		expect(innerForm!.querySelector('input[name="email"]')).not.toBeNull();
		expect(innerForm!.querySelector('button[type="submit"]')).not.toBeNull();
	});

	it('user-provided form mode: skipt migration voor nieuw toegevoegde direct children', async () => {
		// In user-provided mode a framework may position children outside the form
		// without us moving them there automatically.
		const wrapper = await fixture(`
			<nldd-form name="user-form">
				<form>
					<input name="initial">
				</form>
			</nldd-form>
		`);
		el = wrapper;
		await waitForUpdate(el);

		// Add a direct child to the host (BESIDE the form, not inside it)
		const stray = document.createElement('div');
		stray.dataset.testid = 'stray';
		el.appendChild(stray);
		await awaitMicrotask();

		// The stray stays a direct child of the host (not migrated into the form)
		expect(el.querySelector(':scope > [data-testid="stray"]')).not.toBeNull();
		// The form's own children are unchanged
		const innerForm = (el as NLDDForm).form!;
		expect(innerForm.children.length).toBe(1);
	});

	it('herattacht observer na disconnect/reconnect', async () => {
		const wrapper = await fixture(`
			<div>
				<div id="from"><nldd-form></nldd-form></div>
				<div id="to"></div>
			</div>
		`);
		el = wrapper;
		const form = wrapper.querySelector('nldd-form')!;
		await waitForUpdate(form);

		// Move the form to a different parent (triggers disconnect + reconnect)
		const to = wrapper.querySelector('#to')!;
		to.appendChild(form);
		await waitForUpdate(form);

		// Append a child after reconnect — observer should catch it
		const late = document.createElement('input');
		late.name = 'after-reconnect';
		form.appendChild(late);
		await awaitMicrotask();

		const innerForm = form.querySelector('form')!;
		expect(innerForm.querySelector('input[name="after-reconnect"]')).not.toBeNull();
	});


	describe('label-alignment propagation', () => {
		it('propageert label-alignment naar form-field en form-actions children als form-label-alignment', async () => {
			el = await fixture(`
				<nldd-form label-alignment="right">
					<nldd-form-field label="A"></nldd-form-field>
					<nldd-form-field label="B"></nldd-form-field>
					<nldd-form-actions></nldd-form-actions>
				</nldd-form>
			`);
			await waitForUpdate(el);

			const fields = el.querySelectorAll('nldd-form-field');
			const actions = el.querySelector('nldd-form-actions')!;
			fields.forEach(f => {
				// form-label-alignment propagated, the element's own label-alignment is NOT set
				expect(f.getAttribute('form-label-alignment')).toBe('right');
				expect(f.hasAttribute('label-alignment')).toBe(false);
			});
			expect(actions.getAttribute('form-label-alignment')).toBe('right');
			// form-actions' labelAlignment defaults to `undefined`, so Lit reflects
			// nothing: its own `label-alignment` stays absent and the cascaded
			// `form-label-alignment="right"` wins without the form having to
			// overschrijven.
			expect(actions.hasAttribute('label-alignment')).toBe(false);
		});

		it('overschrijft NIET een explicit eigen label-alignment van een form-field', async () => {
			el = await fixture(`
				<nldd-form label-alignment="right">
					<nldd-form-field label="Inherits"></nldd-form-field>
					<nldd-form-field label="Own" label-alignment="top"></nldd-form-field>
				</nldd-form>
			`);
			await waitForUpdate(el);

			const inherits = el.querySelector('nldd-form-field[label="Inherits"]') as HTMLElement;
			const own = el.querySelector('nldd-form-field[label="Own"]') as HTMLElement;

			// Inherited: form-label-alignment set, its own label-alignment not
			expect(inherits.getAttribute('form-label-alignment')).toBe('right');
			expect(inherits.hasAttribute('label-alignment')).toBe(false);

			// Own: label-alignment kept, form-label-alignment present as well but
			// the CSS cascade lets its own value win through :host(:not([label-alignment])[form-label-alignment=...])
			expect(own.getAttribute('label-alignment')).toBe('top');
			expect(own.getAttribute('form-label-alignment')).toBe('right');
		});

		it('past form-label-alignment aan wanneer parent label-alignment wijzigt', async () => {
			el = await fixture(`
				<nldd-form label-alignment="right">
					<nldd-form-field label="A"></nldd-form-field>
				</nldd-form>
			`);
			await waitForUpdate(el);

			const field = el.querySelector('nldd-form-field') as HTMLElement;
			expect(field.getAttribute('form-label-alignment')).toBe('right');

			el.setAttribute('label-alignment', 'left');
			await waitForUpdate(el);

			expect(field.getAttribute('form-label-alignment')).toBe('left');
			expect(field.hasAttribute('label-alignment')).toBe(false);
		});

		it("zet form-label-alignment terug naar 'top' wanneer parent label-alignment leegmaakt", async () => {
			el = await fixture(`
				<nldd-form label-alignment="right">
					<nldd-form-field label="A"></nldd-form-field>
					<nldd-form-field label="Own" label-alignment="top"></nldd-form-field>
				</nldd-form>
			`);
			await waitForUpdate(el);

			const inherits = el.querySelector('nldd-form-field[label="A"]') as HTMLElement;
			const own = el.querySelector('nldd-form-field[label="Own"]') as HTMLElement;

			el.removeAttribute('label-alignment');
			await waitForUpdate(el);

			// form-label-alignment falls back to the default 'top' (always set)
			expect(inherits.getAttribute('form-label-alignment')).toBe('top');
			expect(own.getAttribute('form-label-alignment')).toBe('top');

			// The descendant that had its own label-alignment keeps it
			expect(own.getAttribute('label-alignment')).toBe('top');
			// Inherits had no label-alignment of its own, so it still does not
			expect(inherits.hasAttribute('label-alignment')).toBe(false);
		});

		it('propageert ook naar later toegevoegde form-field children', async () => {
			el = await fixture('<nldd-form label-alignment="right"></nldd-form>');
			await waitForUpdate(el);

			const field = document.createElement('nldd-form-field');
			field.setAttribute('label', 'Late');
			el.appendChild(field);

			// MutationObserver runs async — wait a microtask
			await awaitMicrotask();

			expect(field.getAttribute('form-label-alignment')).toBe('right');
			expect(field.hasAttribute('label-alignment')).toBe(false);
		});

		it('propageert ook naar later toegevoegde form-actions children', async () => {
			// form-actions reflects its Lit default of 'top' onto label-alignment on
			// the first update, but since we never touch label-alignment there is no
			// race left. We only set form-label-alignment.
			el = await fixture('<nldd-form label-alignment="right"></nldd-form>');
			await waitForUpdate(el);

			const actions = document.createElement('nldd-form-actions');
			el.appendChild(actions);

			await waitForUpdate(actions);
			await awaitMicrotask();

			expect(actions.getAttribute('form-label-alignment')).toBe('right');
		});

		it("zet form-label-alignment='top' als default wanneer parent geen label-alignment heeft", async () => {
			el = await fixture(`
				<nldd-form>
					<nldd-form-field label="A"></nldd-form-field>
				</nldd-form>
			`);
			await waitForUpdate(el);

			const field = el.querySelector('nldd-form-field') as HTMLElement;
			// Always set: descendants inside nldd-form always carry
			// form-label-alignment, so downstream CSS selectors may assume the
			// attribute is there.
			expect(field.getAttribute('form-label-alignment')).toBe('top');
		});

		it('CSS cascade: expliciete eigen label-alignment wint over geërfde via container query', async () => {
			// Container >= mdMin so the @container (min-width: 40.0625rem) rule matches
			// and row layout applies for left/right alignment.
			const wrapper = await fixture(`
				<div style="width: 800px;">
					<nldd-form label-alignment="right">
						<nldd-form-field label="Inherits"></nldd-form-field>
						<nldd-form-field label="Own" label-alignment="top"></nldd-form-field>
					</nldd-form>
				</div>
			`);
			el = wrapper;
			await waitForUpdate(wrapper.querySelector('nldd-form') as HTMLElement);

			const inherits = wrapper.querySelector('nldd-form-field[label="Inherits"]')!;
			const own = wrapper.querySelector('nldd-form-field[label="Own"]')!;

			const inheritsRoot = inherits.shadowRoot!.querySelector('.form-field')!;
			const ownRoot = own.shadowRoot!.querySelector('.form-field')!;

			// Inherits → label-alignment=right → row layout
			expect(getComputedStyle(inheritsRoot).flexDirection).toBe('row');
			// Own (label-alignment=top) means column layout, not overridden by the
			// container query on the parent's right alignment
			expect(getComputedStyle(ownRoot).flexDirection).toBe('column');
		});
	});
});
