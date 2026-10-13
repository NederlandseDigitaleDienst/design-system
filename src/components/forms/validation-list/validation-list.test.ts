import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './validation-list.js';
import '../form-field/form-field.js';
import '../form/form.js';
import '../../inputs/text-field/text-field.js';
import type { NLDDValidationItem, NLDDValidationList } from './validation-list.js';

function item(root: ParentNode, id: string): NLDDValidationItem {
	return root.querySelector(`#${id}`) as NLDDValidationItem;
}

function list(root: ParentNode): NLDDValidationList {
	return root.querySelector('nldd-validation-list') as NLDDValidationList;
}

/** Types into the field the way the component hears it, so the list re-checks. */
async function type(field: HTMLElement, value: string): Promise<void> {
	const control = field.querySelector('nldd-text-field') as HTMLElement & { value: string };
	control.value = value;
	control.dispatchEvent(new Event('input', { bubbles: true }));
	await waitForUpdate(field);
}

describe('nldd-validation-list', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-validation-list></nldd-validation-list>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('houdt een item zonder regel verborgen tot de app hem noemt', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-breach">Staat in een datalek</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		expect(item(el, 'password-breach').visible).toBe(false);

		const control = el.querySelector('nldd-text-field')!;
		control.setAttribute('unmet', 'password-breach');
		control.setAttribute('invalid', '');
		await waitForUpdate(el);

		expect(item(el, 'password-breach').visible).toBe(true);
		expect(item(el, 'password-breach').unmet).toBe(true);
	});

	it('laat een regel zichzelf toetsen en verdwijnen zodra hij gehaald is', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);

		await type(el, 'kort');
		expect(item(el, 'password-length').unmet).toBe(true);
		expect(item(el, 'password-length').visible).toBe(true);

		await type(el, 'lang genoeg');
		expect(item(el, 'password-length').unmet).toBe(false);
		expect(item(el, 'password-length').visible).toBe(false);
	});

	it('laat een onaangeraakt veld met rust, want er is nog geen oordeel', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		expect(item(el, 'password-length').visible).toBe(true);
		expect(item(el, 'password-length').unmet).toBe(false);
	});

	it('laat `required` afgaan op leeg, ook zonder andere regels', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-empty" required>Vul een wachtwoord in</nldd-validation-item>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		// Alles wat niet voldoet, ook op leeg. Een lege waarde haalt de meeste
		// regels niet, en dat is wat er dan te repareren valt.
		expect(item(el, 'password-empty').unmet).toBe(true);
		expect(item(el, 'password-length').unmet).toBe(true);

		await type(el, 'x');
		expect(item(el, 'password-empty').unmet).toBe(false);
		expect(item(el, 'password-length').unmet).toBe(true);
	});

	it('laat een lege waarde door in een veld dat niet verplicht is', async () => {
		el = await fixture(`
			<nldd-form-field label="Website" optional>
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="website-format" match="^\\S+\\.\\S+$">Een webadres, zoals voorbeeld.nl</nldd-validation-item>
					<nldd-validation-item id="website-length" minlength="4">Minimaal 4 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field') as HTMLElement & { internals: ElementInternals };
		expect(item(el, 'website-format').unmet).toBe(false);
		expect(item(el, 'website-length').unmet).toBe(false);
		expect(control.internals.validity.customError).toBe(false);

		await type(el, 'x');
		expect(item(el, 'website-format').unmet).toBe(true);
		expect(control.internals.validity.customError).toBe(true);

		await type(el, '');
		expect(control.internals.validity.customError).toBe(false);
	});

	it('houdt de regels wel tegen leeg als de control verplicht is', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid required></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		expect(item(el, 'password-length').unmet).toBe(true);
	});

	it('leest `match` als "bevat", niet als de hele waarde', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);

		await type(el, 'abc');
		expect(item(el, 'password-capital').unmet).toBe(true);

		await type(el, 'aBc');
		expect(item(el, 'password-capital').unmet).toBe(false);
	});

	it('toont met `hint` alles vooraf, neutraal', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					<nldd-validation-item id="password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		for (const id of ['password-length', 'password-capital']) {
			expect(item(el, id).visible).toBe(true);
			expect(item(el, id).unmet).toBe(false);
		}
	});

	it('gaat niet oordelen omdat een veld goed is', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field valid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" hint minlength="8">Minimaal 8 tekens</nldd-validation-item>
					<nldd-validation-item id="password-breach">Staat in een datalek</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		// `invalid` is de enige trigger, en `valid` doet niets: een veld dat goed
		// is heeft niets te melden, dus z'n hint blijft uitleggen wat het wil.
		expect(list(el).judging).toBe(false);
		expect(item(el, 'password-length').visible).toBe(true);
		expect(item(el, 'password-breach').visible).toBe(false);
	});

	it('laat een hint die niet voldaan is wél staan na een oordeel', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					<nldd-validation-item id="password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		await type(el, 'Kort');
		expect(item(el, 'password-length').visible).toBe(true);
		expect(item(el, 'password-capital').visible).toBe(false);
	});

	it('laat de hints weg zodra het veld ooit beoordeeld is, ook als het weer goed komt', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		el.querySelector('nldd-text-field')!.removeAttribute('invalid');
		await type(el, 'LangGenoeg1');
		// Een oordeel is geen toestand waar een veld uit terugkeert. De vraag die
		// de hints beantwoordden is gesteld en beslecht.
		expect(list(el).judging).toBe(true);
		expect(item(el, 'password-length').visible).toBe(false);
	});

	it('laat met de hand de hints vallen, maar kleurt niets rood', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list hint judging>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		// `judging` gaat over de hints. Wat rood wordt volgt `invalid`, en de
		// control zegt hier niets, dus er hoort ook niets rood te staan.
		expect(item(el, 'password-length').unmet).toBe(false);
		expect(item(el, 'password-length').visible).toBe(false);

		list(el).judging = false;
		await waitForUpdate(list(el));
		expect(item(el, 'password-length').visible).toBe(true);
	});

	it('kleurt niets rood onder een veld dat er goed uitziet', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field value="kort" invalid></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		expect(item(el, 'password-length').unmet).toBe(true);

		// De consumer keurt het veld niet langer af, maar de regel faalt nog
		// steeds. Dan zwijgt de lijst: rode tekst bij een neutraal veld wijst
		// naar iets wat er niet te zien is.
		el.querySelector('nldd-text-field')!.removeAttribute('invalid');
		await waitForUpdate(list(el));
		expect(item(el, 'password-length').unmet).toBe(false);
		expect(item(el, 'password-length').visible).toBe(false);
	});

	it('laat bij verzending de lijst van een veld dat klopt met rust', async () => {
		el = await fixture(`
			<nldd-form>
				<nldd-form-field label="Naam">
					<nldd-text-field name="name"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="name-required" required>Vul een naam in</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
				<nldd-form-field label="Bijnaam">
					<nldd-text-field name="nickname" value="Bart"></nldd-text-field>
					<nldd-validation-list hint>
						<nldd-validation-item id="nickname-length" minlength="2">Minimaal 2 tekens</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</nldd-form>
		`);
		await waitForUpdate(el);

		const form = el.querySelector('form')!;
		form.addEventListener('submit', (e) => e.preventDefault());
		form.requestSubmit();
		await waitForUpdate(item(el, 'name-required').parentElement as HTMLElement);
		// De naam ontbreekt, dus die lijst gaat oordelen. De bijnaam klopt en
		// wordt dus niet afgekeurd, en dan is er ook niets te oordelen: die lijst
		// blijft uitleggen wat het veld wil.
		expect(item(el, 'name-required').unmet).toBe(true);
		expect((item(el, 'nickname-length').parentElement as NLDDValidationList).judging).toBe(false);
		expect(item(el, 'nickname-length').visible).toBe(true);
	});

	it('blijft luisteren nadat het veld verplaatst is', async () => {
		el = await fixture(`
			<div>
				<nldd-form-field label="Wachtwoord">
					<nldd-text-field value="kort" invalid></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</div>
		`);
		await waitForUpdate(el);
		expect(item(el, 'password-length').unmet).toBe(true);

		// Een consument die een sheet naar document.body portalt haalt het veld
		// even uit de DOM. Dat koppelt de listener los, en zonder dit kwam hij
		// nooit meer terug: de control was niet veranderd, dus _resolve zag geen
		// werk en de lijst reageerde nergens meer op.
		const veld = el.querySelector('nldd-form-field')!;
		const elders = document.createElement('div');
		el.appendChild(elders);
		elders.appendChild(veld);
		await waitForUpdate(el);

		await type(el, 'LangGenoeg1');
		expect(item(el, 'password-length').unmet).toBe(false);
	});

	it('vindt z\'n control via `for` als hij buiten een veld staat', async () => {
		el = await fixture(`
			<div>
				<nldd-text-field id="standalone" invalid></nldd-text-field>
				<nldd-validation-list for="standalone">
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</div>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field') as HTMLElement & { value: string };
		control.value = 'kort';
		control.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(item(el, 'password-length').unmet).toBe(true);
	});

	it('meldt een falende regel bij de control, zodat het formulier niet weggaat', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field') as HTMLElement & { value: string; internals?: ElementInternals };

		await type(el, 'kort');
		expect(control.internals?.validity.customError).toBe(true);

		await type(el, 'lang genoeg');
		expect(control.internals?.validity.valid).toBe(true);
	});

	it('staat in de beschrijving van de control, één keer', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field invalid></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		const inner = el.querySelector('nldd-text-field')!.shadowRoot!.querySelector('input')!;
		const described = (inner as Element & { ariaDescribedByElements?: readonly Element[] | null })
			.ariaDescribedByElements ?? [];
		expect(described).toEqual([el.querySelector('nldd-validation-list')]);
	});

	it('toont niets zonder `invalid`, maar blokkeert het formulier wel', async () => {
		el = await fixture(`
			<nldd-form-field label="Wachtwoord">
				<nldd-text-field></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
		`);
		await waitForUpdate(el);
		await type(el, 'kort');
		const control = el.querySelector('nldd-text-field') as HTMLElement & { internals?: ElementInternals };

		expect(item(el, 'password-length').visible).toBe(false);
		expect(control.internals?.validity.customError).toBe(true);
	});
});

describe('nldd-form markeert een control op het moment dat het platform het zegt', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('laat de native validatiebubbel weg, want we schrijven zelf', async () => {
		el = await fixture(`
			<nldd-form novalidate>
				<nldd-form-field label="Wachtwoord">
					<nldd-text-field name="password" value="kort"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</nldd-form>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field')!;

		let gemeld = false;
		control.addEventListener('invalid', e => { gemeld = e.defaultPrevented; });
		(el as HTMLElement & { form: HTMLFormElement }).form.reportValidity();
		await waitForUpdate(el);
		expect(gemeld).toBe(true);
	});

	it('zet `invalid` bij submit en haalt hem weg zodra het klopt', async () => {
		el = await fixture(`
			<nldd-form novalidate>
				<nldd-form-field label="Wachtwoord">
					<nldd-text-field name="password"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</nldd-form>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field') as HTMLElement & { value: string };

		control.value = 'kort';
		control.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(control.hasAttribute('invalid')).toBe(false);

		(el as HTMLElement & { form: HTMLFormElement }).form.checkValidity();
		await waitForUpdate(el);
		expect(control.hasAttribute('invalid')).toBe(true);
		expect(item(el, 'password-length').visible).toBe(true);

		control.value = 'lang genoeg';
		control.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(control.hasAttribute('invalid')).toBe(false);

		// En weer terug: het formulier weigert dit opnieuw, dus het veld hoort
		// dat te zeggen in plaats van stil te blijven.
		control.value = 'kort';
		control.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(control.hasAttribute('invalid')).toBe(true);
		expect(item(el, 'password-length').visible).toBe(true);
	});

	it('markeert bij verzending elk veld als beoordeeld, niet alleen het gezakte', async () => {
		el = await fixture(`
			<nldd-form novalidate>
				<nldd-form-field label="Eerste">
					<nldd-text-field name="first" value="lang genoeg"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="first-length" minlength="8">Minimaal 8</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
				<nldd-form-field label="Tweede">
					<nldd-text-field name="second" value="kort"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="second-length" minlength="8">Minimaal 8</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</nldd-form>
		`);
		await waitForUpdate(el);
		const a = el.querySelector('[name=first]') as HTMLElement & { value: string };

		(el as HTMLElement & { form: HTMLFormElement }).form.checkValidity();
		await waitForUpdate(el);
		expect(a.hasAttribute('invalid')).toBe(false);
		expect(el.querySelector('[name=second]')!.hasAttribute('invalid')).toBe(true);

		// A zakte niet en werd dus niet genoemd, maar is wel beoordeeld: breek
		// hem en hij zegt het meteen, net als z'n buurman.
		a.value = 'kort';
		a.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(a.hasAttribute('invalid')).toBe(true);
		expect(item(el, 'first-length').visible).toBe(true);
	});

	it('laat een veld dat nog nooit beoordeeld is met rust tijdens het typen', async () => {
		el = await fixture(`
			<nldd-form novalidate>
				<nldd-form-field label="Wachtwoord">
					<nldd-text-field name="password"></nldd-text-field>
					<nldd-validation-list>
						<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			</nldd-form>
		`);
		await waitForUpdate(el);
		const control = el.querySelector('nldd-text-field') as HTMLElement & { value: string };

		control.value = 'k';
		control.dispatchEvent(new Event('input', { bubbles: true }));
		await waitForUpdate(el);
		expect(control.hasAttribute('invalid')).toBe(false);
		expect(item(el, 'password-length').visible).toBe(false);
	});
});


describe('nldd-form ruimt op wat het platform niet opruimt', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const settle = () => new Promise(resolve => setTimeout(resolve, 50));

	const twoRequiredFields = `
		<nldd-form>
			<nldd-form-field label="Een">
				<nldd-text-field name="one" required></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="one-required" required>Verplicht</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
			<nldd-form-field label="Twee">
				<nldd-text-field name="two" required></nldd-text-field>
				<nldd-validation-list hint>
					<nldd-validation-item id="two-required" required>Verplicht</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
			<button type="submit">Verstuur</button>
		</nldd-form>
	`;

	it('stuurt de focus naar het eerste veld dat zakt, want de bubbel is weg', async () => {
		el = await fixture(twoRequiredFields);
		await waitForUpdate(el);
		const form = el.querySelector('form') as HTMLFormElement;
		form.addEventListener('submit', event => event.preventDefault());

		form.requestSubmit();
		await waitForUpdate(el);
		await settle();

		const active = document.activeElement as HTMLElement | null;
		expect(active?.getAttribute('name')).toBe('one');
		expect(active?.shadowRoot?.activeElement?.tagName.toLowerCase()).toBe('input');
	});

	it('haalt bij een reset de markering en het oordeel weg', async () => {
		el = await fixture(twoRequiredFields);
		await waitForUpdate(el);
		const form = el.querySelector('form') as HTMLFormElement;
		form.addEventListener('submit', event => event.preventDefault());
		const controls = Array.from(el.querySelectorAll('nldd-text-field'));
		const lists = Array.from(el.querySelectorAll('nldd-validation-list'));

		form.requestSubmit();
		await waitForUpdate(el);
		await settle();
		expect(controls.every(control => control.hasAttribute('invalid'))).toBe(true);
		expect(lists.every(list => list.hasAttribute('judging'))).toBe(true);

		form.reset();
		await waitForUpdate(el);
		await settle();
		expect(controls.some(control => control.hasAttribute('invalid'))).toBe(false);
		expect(lists.some(list => list.hasAttribute('judging'))).toBe(false);
		expect(lists[0].classList.contains('has-items')).toBe(true);
	});

	it('vraagt geen tweede render aan voor een veld dat al invalid binnenkomt', async () => {
		const warnings: string[] = [];
		const original = console.warn;
		console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
		try {
			el = await fixture(`
				<nldd-form-field label="E-mailadres">
					<nldd-text-field name="email" invalid required></nldd-text-field>
					<nldd-validation-list hint>
						<nldd-validation-item id="email-required" required>Een e-mailadres</nldd-validation-item>
					</nldd-validation-list>
				</nldd-form-field>
			`);
			await waitForUpdate(el);
			await settle();
		} finally {
			console.warn = original;
		}

		expect(warnings.filter(warning => /scheduled an update/i.test(warning))).toEqual([]);
		const list = el.querySelector('nldd-validation-list') as NLDDValidationList;
		expect(list.judging).toBe(true);
		expect(item(el, 'email-required').unmet).toBe(true);
	});
});
