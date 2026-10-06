import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDCard } from './card.js';
import './card.js';
import '../../../assets/styles/variables.css';
import '../../lists-and-tables/cells/cell/cell.js';

describe('nldd-card', () => {
	let el: NLDDCard;

	afterEach(() => {
		if (el) cleanup(el);
	});

	// The ring is its own layer beside the card, driven by a class instead of
	// :has(… :focus-visible): the card clips its descendants, and Safari does not
	// re-evaluate a dynamic pseudo-class inside :has().
	it('toont de focusring pas als de eigen control toetsenbordfocus heeft', async () => {
		el = await fixture<NLDDCard>('<nldd-card button accessible-label="Open"><p>Inhoud</p></nldd-card>');
		await waitForUpdate(el);
		const ring = el.shadowRoot!.querySelector('.card__focus-ring')!;
		expect(ring).not.toBeNull();
		expect(el.classList.contains('is-action-focused')).toBe(false);

		const control = el.shadowRoot!.querySelector<HTMLElement>('.card__action')!;
		control.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
		await waitForUpdate(el);
		// Programmatic focus is not focus-visible, so the ring stays away — that is
		// the same rule the pointer follows.
		expect(el.classList.contains('is-action-focused')).toBe(false);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture<NLDDCard>('<nldd-card></nldd-card>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('verbergt header als slot leeg is', async () => {
		el = await fixture<NLDDCard>('<nldd-card></nldd-card>');
		await waitForUpdate(el);
		const header = el.shadowRoot!.querySelector('.card__header') as HTMLElement;
		expect(header.hidden).toBe(true);
	});

	it('toont header als slot gevuld is', async () => {
		el = await fixture<NLDDCard>('<nldd-card><div slot="header">Titel</div></nldd-card>');
		await waitForUpdate(el);
		const header = el.shadowRoot!.querySelector('.card__header') as HTMLElement;
		expect(header.hidden).toBe(false);
	});

	it('verbergt footer als slot leeg is', async () => {
		el = await fixture<NLDDCard>('<nldd-card></nldd-card>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.card__footer') as HTMLElement;
		expect(footer.hidden).toBe(true);
	});

	it('toont footer als slot gevuld is', async () => {
		el = await fixture<NLDDCard>('<nldd-card><div slot="footer">Acties</div></nldd-card>');
		await waitForUpdate(el);
		const footer = el.shadowRoot!.querySelector('.card__footer') as HTMLElement;
		expect(footer.hidden).toBe(false);
	});

	it('rendert geen link zonder href', async () => {
		el = await fixture<NLDDCard>('<nldd-card></nldd-card>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.card__action')).toBeNull();
	});

	it('maakt de hele kaart een link met href en zet de naam op de link', async () => {
		el = await fixture<NLDDCard>('<nldd-card href="/dossier" accessible-label="Open dossier"></nldd-card>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('.card__action') as HTMLAnchorElement;
		expect(link).not.toBeNull();
		expect(link.getAttribute('href')).toBe('/dossier');
		expect(link.getAttribute('aria-label')).toBe('Open dossier');
		// The name goes on the link, not redundantly on the article as well.
		expect(el.shadowRoot!.querySelector('.card')!.getAttribute('aria-label')).toBeNull();
	});

	it('zonder href staat accessible-label op de article', async () => {
		el = await fixture<NLDDCard>('<nldd-card accessible-label="Kaart X"></nldd-card>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.card')!.getAttribute('aria-label')).toBe('Kaart X');
	});

	it('target="_blank" voegt rel en een nieuw-tabblad-melding toe', async () => {
		el = await fixture<NLDDCard>('<nldd-card href="/x" target="_blank" accessible-label="Open X"></nldd-card>');
		await waitForUpdate(el);
		const link = el.shadowRoot!.querySelector('.card__action') as HTMLAnchorElement;
		expect(link.getAttribute('rel')).toContain('noopener');
		expect(link.getAttribute('rel')).toContain('noreferrer');
		expect(link.getAttribute('aria-label')).toBe('Open X, Opent in nieuw tabblad');
	});

	it('maakt de hele kaart een knop met button en zet de naam op de knop', async () => {
		el = await fixture<NLDDCard>('<nldd-card button accessible-label="Open dossier"></nldd-card>');
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.card__action') as HTMLButtonElement;
		expect(button).not.toBeNull();
		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('type')).toBe('button');
		expect(button.getAttribute('aria-label')).toBe('Open dossier');
		expect(el.shadowRoot!.querySelector('.card')!.getAttribute('aria-label')).toBeNull();
	});

	// The click has to cross the shadow boundary: a listener or hx attribute on the
	// card itself is exactly how consumers use this.
	it('een klik op de knop komt als composed click op de host aan', async () => {
		el = await fixture<NLDDCard>('<nldd-card button accessible-label="Open"></nldd-card>');
		await waitForUpdate(el);
		let seen = false;
		el.addEventListener('click', () => { seen = true; });
		(el.shadowRoot!.querySelector('.card__action') as HTMLButtonElement).click();
		expect(seen).toBe(true);
	});

	it('href wint van button', async () => {
		el = await fixture<NLDDCard>('<nldd-card button href="/x" accessible-label="Open"></nldd-card>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.card__action')!.tagName).toBe('A');
	});

	it('background is standaard base en reflecteert niet', async () => {
		el = await fixture<NLDDCard>('<nldd-card></nldd-card>');
		await waitForUpdate(el);
		expect(el.background).toBe('base');
		expect(el.hasAttribute('background')).toBe(false);
	});

	it('background="tinted" pakt de tinted vlakkleur', async () => {
		const removeTokens = loadTokens();
		try {
			el = await fixture<NLDDCard>('<nldd-card background="tinted"></nldd-card>');
			await waitForUpdate(el);
			const card = el.shadowRoot!.querySelector('.card')!;
			const probe = document.createElement('div');
			probe.style.backgroundColor = 'var(--semantics-surfaces-tinted-background-color)';
			document.body.appendChild(probe);
			const tinted = getComputedStyle(probe).backgroundColor;
			probe.remove();
			expect(tinted).not.toBe('rgba(0, 0, 0, 0)');
			expect(getComputedStyle(card).backgroundColor).toBe(tinted);
		} finally {
			removeTokens();
		}
	});
});

describe('nldd-card in a cell', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('fills the cell instead of shrinking to its content', async () => {
		el = await fixture(`
			<nldd-cell width="full" style="width: 320px">
				<nldd-card>Kort</nldd-card>
			</nldd-cell>`);
		await waitForUpdate(el);
		const card = el.querySelector('nldd-card') as HTMLElement;
		expect(card.getBoundingClientRect().width).toBe(320);
	});
});

describe('nldd-card – hover', () => {
	let el: NLDDCard;

	afterEach(async () => {
		await userEvent.unhover(document.body);
		if (el) cleanup(el);
	});

	const look = async () => {
		const card = el.shadowRoot!.querySelector<HTMLElement>('.card')!;
		await Promise.all(card.getAnimations().map((animation) => animation.finished));
		return [getComputedStyle(card).backgroundColor, getComputedStyle(card, '::after').boxShadow];
	};

	for (const background of ['base', 'tinted']) {
		it(`steps the ${background} surface and border up on hover when the card is a link`, async () => {
			el = await fixture<NLDDCard>(`<nldd-card href="/aanvraag" accessible-label="Aanvraag A-1042" background="${background}"><p>Dakisolatie</p></nldd-card>`);
			const [restBackground, restBorder] = await look();

			await userEvent.hover(el.shadowRoot!.querySelector('.card__action')!);
			const [hoverBackground, hoverBorder] = await look();

			expect(hoverBackground).not.toBe(restBackground);
			expect(hoverBorder).not.toBe(restBorder);
		});
	}

	it('stays as it is on hover when the card is not a link or button', async () => {
		el = await fixture<NLDDCard>('<nldd-card accessible-label="Aanvraag A-1042"><p>Dakisolatie</p></nldd-card>');
		const rest = await look();

		await userEvent.hover(el.shadowRoot!.querySelector('.card')!);
		expect(await look()).toEqual(rest);
	});

	it('stays as it is while a button lifted above the overlay is hovered', async () => {
		el = await fixture<NLDDCard>(`
			<nldd-card href="/aanvraag" accessible-label="Aanvraag A-1042">
				<button slot="footer" style="position: relative; z-index: 1;">Bewerk</button>
			</nldd-card>
		`);
		const rest = await look();

		await userEvent.hover(el.querySelector('button')!);
		expect(await look()).toEqual(rest);
	});
});
