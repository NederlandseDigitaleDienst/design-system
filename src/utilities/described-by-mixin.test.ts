import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../test-utils.js';
import '../components/actions/button/button.js';
import '../components/actions/icon-button/icon-button.js';
import '../components/navigation/link/link.js';
import '../components/inputs/text-field/text-field.js';
import '../components/inputs/toggle-button/toggle-button.js';
import '../components/inputs/checkbox-field/checkbox-field.js';
import '../components/forms/form-field/form-field.js';
import '../components/layout/popover/popover.js';

type Described = Element & { ariaDescribedByElements: Element[] | null; ariaDescription: string | null };

const textOf = (elements: Element[] | null): string[] => (elements ?? []).map((el) => el.textContent!.trim());

describe('accessible-described-by and accessible-description', () => {
	let root: HTMLElement;

	afterEach(() => {
		if (root) cleanup(root);
	});

	it('hands the elements accessible-described-by names to the control inside', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-button text="Delen" accessible-described-by="wie waarom"></nldd-button>
				<p id="wie">Gedeeld met Sam de Vries</p>
				<p id="waarom">Alleen lezen</p>
			</div>
		`);
		const button = root.querySelector('nldd-button')!;
		await waitForUpdate(button);
		const control = button.shadowRoot!.querySelector('button') as unknown as Described;
		expect(textOf(control.ariaDescribedByElements)).toEqual(['Gedeeld met Sam de Vries', 'Alleen lezen']);
	});

	it('gives the text of accessible-description to the control, unseen', async () => {
		root = await fixture<HTMLElement>('<div><nldd-button text="Delen" accessible-description="Alleen lezen"></nldd-button></div>');
		const button = root.querySelector('nldd-button')!;
		await waitForUpdate(button);
		const control = button.shadowRoot!.querySelector('button') as unknown as Described;
		const [text] = control.ariaDescribedByElements!;
		expect(text.textContent).toBe('Alleen lezen');
		expect((text as HTMLElement).hidden).toBe(true);

		button.removeAttribute('accessible-description');
		await waitForUpdate(button);
		expect(control.ariaDescribedByElements).toBeNull();
		expect(button.shadowRoot!.querySelector('[data-description]')).toBeNull();
	});

	it('takes the reference over the text when it finds an element, and the text when it finds none', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-button text="Delen" accessible-described-by="wie" accessible-description="Alleen lezen"></nldd-button>
				<p id="wie">Gedeeld met Sam de Vries</p>
			</div>
		`);
		const button = root.querySelector('nldd-button')!;
		await waitForUpdate(button);
		const control = button.shadowRoot!.querySelector('button') as unknown as Described;
		expect(textOf(control.ariaDescribedByElements)).toEqual(['Gedeeld met Sam de Vries']);

		root.querySelector('#wie')!.remove();
		button.requestUpdate();
		await waitForUpdate(button);
		expect(textOf(control.ariaDescribedByElements)).toEqual(['Alleen lezen']);
	});

	it('finds an element that arrives later, once focus comes in', async () => {
		root = await fixture<HTMLElement>('<div><nldd-button text="Delen" accessible-described-by="later"></nldd-button></div>');
		const button = root.querySelector('nldd-button')!;
		await waitForUpdate(button);
		const control = button.shadowRoot!.querySelector('button') as unknown as Described & HTMLElement;
		expect(control.ariaDescribedByElements).toBeNull();

		root.insertAdjacentHTML('beforeend', '<p id="later">Gedeeld met Noor Bakker</p>');
		control.focus();
		await waitForUpdate(button);
		expect(textOf(control.ariaDescribedByElements)).toEqual(['Gedeeld met Noor Bakker']);
	});

	it('reads the form field first, then the app, then the popover on interest', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-form-field label="Naam">
					<nldd-text-field accessible-described-by="extra"></nldd-text-field>
					<nldd-form-field-help-text>Zoals in je paspoort</nldd-form-field-help-text>
				</nldd-form-field>
				<p id="extra">Wordt gedeeld met team Beleid</p>
				<nldd-toggle-button text="2" accessible-description="Jij reageerde ook">
					<nldd-popover slot="interest">Sam de Vries</nldd-popover>
				</nldd-toggle-button>
			</div>
		`);
		const field = root.querySelector('nldd-text-field')!;
		const toggle = root.querySelector('nldd-toggle-button')!;
		await waitForUpdate(field);
		await waitForUpdate(toggle);
		const input = field.shadowRoot!.querySelector('input') as unknown as Described;
		expect(textOf(input.ariaDescribedByElements)).toEqual(['Zoals in je paspoort', 'Wordt gedeeld met team Beleid']);
		const button = toggle.shadowRoot!.querySelector('button') as unknown as Described;
		expect(textOf(button.ariaDescribedByElements)).toEqual(['Jij reageerde ook', 'Sam de Vries']);
	});

	it('reaches the control of a component inside another one', async () => {
		root = await fixture<HTMLElement>('<div><nldd-checkbox-field label="Akkoord" accessible-description="Je kunt dit later wijzigen"></nldd-checkbox-field></div>');
		const field = root.querySelector('nldd-checkbox-field')!;
		await waitForUpdate(field);
		const checkbox = field.shadowRoot!.querySelector('nldd-checkbox')!;
		await waitForUpdate(checkbox);
		const input = checkbox.shadowRoot!.querySelector('input') as unknown as Described;
		expect(textOf(input.ariaDescribedByElements)).toEqual(['Je kunt dit later wijzigen']);
	});

	it('says the text itself on a control that is the element, which cannot point into its shadow root', async () => {
		root = await fixture<HTMLElement>('<div><nldd-toggle-button type="radio" text="Lijst" accessible-description="Toont alle aanvragen"></nldd-toggle-button></div>');
		const toggle = root.querySelector('nldd-toggle-button')! as unknown as Described & HTMLElement;
		await waitForUpdate(toggle);
		expect(toggle.ariaDescription).toBe('Toont alle aanvragen');
	});

	it('describes the button of an nldd-icon-button, before its popover', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-icon-button icon="share" accessible-label="Delen" accessible-description="Alleen lezen">
					<nldd-popover slot="interest">Gedeeld met Sam de Vries</nldd-popover>
				</nldd-icon-button>
			</div>
		`);
		const iconButton = root.querySelector('nldd-icon-button')!;
		await waitForUpdate(iconButton);
		const button = iconButton.shadowRoot!.querySelector('.icon-button') as unknown as Described;
		expect(textOf(button.ariaDescribedByElements)).toEqual(['Alleen lezen', 'Gedeeld met Sam de Vries']);
	});

	it('describes the link nldd-link renders', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-link href="/aanvragen/A-1042" text="Aanvraag A-1042" accessible-described-by="status"></nldd-link>
				<p id="status">In behandeling</p>
			</div>
		`);
		const link = root.querySelector('nldd-link')!;
		await waitForUpdate(link);
		const anchor = link.shadowRoot!.querySelector('.link') as unknown as Described;
		expect(textOf(anchor.ariaDescribedByElements)).toEqual(['In behandeling']);
	});

	it('points an <a> of the app at the elements it names, and gives it the text as aria-description', async () => {
		root = await fixture<HTMLElement>(`
			<div>
				<nldd-link accessible-described-by="status"><a href="/aanvragen/A-1042">Aanvraag A-1042</a></nldd-link>
				<p id="status">In behandeling</p>
				<nldd-link accessible-description="Alleen lezen"><a href="/aanvraag.pdf" download>Aanvraag A-1042</a></nldd-link>
			</div>
		`);
		const [named, texted] = [...root.querySelectorAll('nldd-link')];
		await waitForUpdate(named);
		await waitForUpdate(texted);
		const first = named.querySelector('a') as unknown as Described;
		expect(textOf(first.ariaDescribedByElements)).toEqual(['In behandeling']);
		const second = texted.querySelector('a')!;
		expect((second as unknown as Described).ariaDescribedByElements).toBeNull();
		expect(second.getAttribute('aria-description')).toMatch(/^Alleen lezen\. \S/);

		texted.removeAttribute('accessible-description');
		await waitForUpdate(texted);
		expect(second.getAttribute('aria-description')).not.toContain('Alleen lezen');
	});
});
