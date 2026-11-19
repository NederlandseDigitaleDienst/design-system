import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { loadTokens } from '../../../test-tokens.js';
import type { NLDDAvatar } from './avatar.js';
import './avatar.js';

const IMAGE = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\'/%3E%3C/svg%3E';

describe('nldd-avatar', () => {
	let el: NLDDAvatar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-avatar></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('defaults to type person, default color, and a container-scaled size', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.type).toBe('person');
		expect(el.color).toBe('neutral');
		expect(el.size).toBe('full'); // full = scale to the container (like nldd-icon)
	});

	it('reflects color="content" and keeps default color unreflected', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen" color="content"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.color).toBe('content');
		expect(el.getAttribute('color')).toBe('content');
		el.color = 'neutral';
		await waitForUpdate(el);
		expect(el.hasAttribute('color')).toBe(false);
	});

	it('reflects icon-aligned and scales the shape to 5/6', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen" size="48" icon-aligned></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.iconAligned).toBe(true);
		expect(el.getAttribute('icon-aligned')).toBe('');
		// --_avatar-shape-scale drives the 5/6 shape; default avatars stay full-bleed (1).
		expect(getComputedStyle(el).getPropertyValue('--_avatar-shape-scale').trim()).toBe('calc(5 / 6)');
		el.iconAligned = false;
		await waitForUpdate(el);
		expect(el.hasAttribute('icon-aligned')).toBe(false);
		expect(getComputedStyle(el).getPropertyValue('--_avatar-shape-scale').trim()).toBe('1');
	});

	it('derives initials from the first and last word of the name', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedInitials).toBe('BB');
		expect(el.shadowRoot!.querySelector('.avatar__initials')!.textContent).toBe('BB');
	});

	it('derives initials from first + last word, skipping middle words', async () => {
		el = await fixture('<nldd-avatar name="Petra van der Berg"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedInitials).toBe('PB');
	});

	it('lets explicit initials override the derivation', async () => {
		el = await fixture('<nldd-avatar name="Kamer van Koophandel" initials="KvK"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedInitials).toBe('KvK');
		expect(el.shadowRoot!.querySelector('.avatar__initials')!.textContent).toBe('KvK');
	});

	it('shows an acronym of four characters, and caps longer initials there', async () => {
		el = await fixture('<nldd-avatar type="organization" initials="LVVN" decorative></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar__initials')!.textContent).toBe('LVVN');
		el.initials = 'ABCDE';
		await waitForUpdate(el);
		expect(el.resolvedInitials).toBe('ABCD');
	});

	const fitOf = (a: HTMLElement): number => Number(a.style.getPropertyValue('--_avatar-initials-fit'));
	const settle = () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

	it('scales wide initials down to fit the shape width', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDAvatar>('<nldd-avatar initials="WWWW" decorative size="48"></nldd-avatar>');
		await settle();
		expect(fitOf(el)).toBeLessThan(1);
		const initials = el.shadowRoot!.querySelector('.avatar__initials')!;
		expect(initials.getBoundingClientRect().width).toBeLessThanOrEqual(48 * 0.75 + 0.5);
		unloadTokens();
	});

	it('keeps narrow initials at full size (fit capped at 1)', async () => {
		const unloadTokens = loadTokens();
		el = await fixture<NLDDAvatar>('<nldd-avatar initials="I" decorative size="48"></nldd-avatar>');
		await settle();
		expect(fitOf(el)).toBe(1);
		unloadTokens();
	});

	// The initials scale with the shape, so one measurement of a text holds for
	// every avatar with it, at any size, and also for one that is hidden.
	it('measures a text once and fits every avatar with it, hidden ones too', async () => {
		const unloadTokens = loadTokens();
		const wrapper = await fixture(`
			<div>
				<nldd-avatar initials="MWM" decorative size="24"></nldd-avatar>
				<nldd-avatar initials="MWM" decorative size="96"></nldd-avatar>
				<div hidden><nldd-avatar initials="MWM" decorative size="48"></nldd-avatar></div>
			</div>
		`);
		el = wrapper as NLDDAvatar;
		const avatars = [...wrapper.querySelectorAll<NLDDAvatar>('nldd-avatar')];
		await settle();
		const fits = avatars.map(fitOf);
		expect(fits[0]).toBeLessThan(1);
		expect(fits[1]).toBeCloseTo(fits[0], 2);
		expect(fits[2]).toBe(fits[0]);
		const measure = avatars.map((avatar) => vi.spyOn(avatar, '_measureRatio'));
		avatars.forEach((avatar) => {
			avatar.initials = 'MWMW';
		});
		await settle();
		expect(measure.reduce((calls, spy) => calls + spy.mock.calls.length, 0)).toBe(1);
		expect(fitOf(avatars[2])).toBeLessThan(fits[0]);
		unloadTokens();
	});

	it('measures the same initials again in another font', async () => {
		const unloadTokens = loadTokens();
		const wrapper = await fixture(`
			<div>
				<nldd-avatar initials="MWM" decorative size="48"></nldd-avatar>
				<div style="--primitives-font-family-body: monospace"><nldd-avatar initials="MWM" decorative size="48"></nldd-avatar></div>
			</div>
		`);
		el = wrapper as NLDDAvatar;
		const [body, mono] = [...wrapper.querySelectorAll<NLDDAvatar>('nldd-avatar')];
		await settle();
		expect(body._ratioKey()).not.toBe(mono._ratioKey());
		// Each fit is its own: the monospace M is narrower than a body M.
		expect(fitOf(mono)).not.toBe(fitOf(body));
		unloadTokens();
	});

	it('renders the image when src is set, with an empty alt (host owns the label)', async () => {
		el = await fixture(`<nldd-avatar name="Jan Jansen" src="${IMAGE}"></nldd-avatar>`);
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector<HTMLImageElement>('.avatar__image');
		expect(img).not.toBeNull();
		expect(img!.getAttribute('alt')).toBe('');
		expect(el.shadowRoot!.querySelector('.avatar__initials')).toBeNull();
	});

	it('falls back to initials when the image errors', async () => {
		el = await fixture(`<nldd-avatar name="Bart van de Biezen" src="${IMAGE}"></nldd-avatar>`);
		await waitForUpdate(el);
		const img = el.shadowRoot!.querySelector('.avatar__image')!;
		img.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el._imageFailed).toBe(true);
		expect(el.shadowRoot!.querySelector('.avatar__image')).toBeNull();
		expect(el.shadowRoot!.querySelector('.avatar__initials')!.textContent).toBe('BB');
	});

	// The shape does not resize when the image gives way to initials, so the
	// ResizeObserver stays silent: the fallback must trigger the re-fit itself,
	// or wide initials render unscaled and spill out of the circle.
	it('re-fits the initials when a failed image falls back to them', async () => {
		el = await fixture<NLDDAvatar>(`<nldd-avatar initials="WWWW" src="${IMAGE}" size="48" decorative></nldd-avatar>`);
		await waitForUpdate(el);
		const fit = vi.spyOn(el, '_fitInitials');
		el.shadowRoot!.querySelector('.avatar__image')!.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar__initials')).not.toBeNull();
		expect(fit).toHaveBeenCalled();
	});

	it('resets the image-failed state when srcset changes', async () => {
		el = await fixture<NLDDAvatar>(`<nldd-avatar name="Bart van de Biezen" src="${IMAGE}"></nldd-avatar>`);
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('.avatar__image')!.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el._imageFailed).toBe(true);
		// A new srcset offers a fresh candidate, so the image gets another chance.
		el.srcset = `${IMAGE} 2x`;
		await waitForUpdate(el);
		expect(el._imageFailed).toBe(false);
		expect(el.shadowRoot!.querySelector('.avatar__image')).not.toBeNull();
	});

	it('resets the image-failed state when src changes', async () => {
		el = await fixture(`<nldd-avatar name="Bart van de Biezen" src="${IMAGE}"></nldd-avatar>`);
		await waitForUpdate(el);
		el.shadowRoot!.querySelector('.avatar__image')!.dispatchEvent(new Event('error'));
		await waitForUpdate(el);
		expect(el._imageFailed).toBe(true);
		el.src = `${IMAGE}#other`;
		await waitForUpdate(el);
		expect(el._imageFailed).toBe(false);
		expect(el.shadowRoot!.querySelector('.avatar__image')).not.toBeNull();
	});

	it('falls back to the person icon without image/initials', async () => {
		el = await fixture('<nldd-avatar decorative></nldd-avatar>');
		await waitForUpdate(el);
		const icon = el.shadowRoot!.querySelector('.avatar__icon');
		expect(icon).not.toBeNull();
		expect(icon!.getAttribute('icon')).toBe('person');
	});

	it('falls back to the building icon for an organization', async () => {
		el = await fixture('<nldd-avatar type="organization" decorative></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedIcon).toBe('building');
		expect(el.shadowRoot!.querySelector('.avatar__icon')!.getAttribute('icon')).toBe('building');
	});

	it('lets the icon attribute override the fallback icon', async () => {
		el = await fixture('<nldd-avatar icon="star" decorative></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedIcon).toBe('star');
		expect(el.shadowRoot!.querySelector('.avatar__icon')!.getAttribute('icon')).toBe('star');
	});

	it('exposes role=img and the name as label when named and not decorative', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.getAttribute('role')).toBe('img');
		expect(el.getAttribute('aria-label')).toBe('Bart van de Biezen');
		expect(el.hasAttribute('aria-hidden')).toBe(false);
	});

	it('is hidden from assistive tech when decorative', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen" decorative></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-hidden')).toBe('true');
		expect(el.hasAttribute('role')).toBe(false);
		expect(el.hasAttribute('aria-label')).toBe(false);
	});

	it('is hidden from assistive tech when the name is only whitespace', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar name="   "></nldd-avatar>');
		await waitForUpdate(el);
		// No initials come out of a blank name, so the icon shows; claiming
		// role="img" here would announce an image with an empty name.
		expect(el.resolvedInitials).toBe('');
		expect(el.getAttribute('aria-hidden')).toBe('true');
		expect(el.hasAttribute('role')).toBe(false);
	});

	it('is hidden from assistive tech when it has no name', async () => {
		el = await fixture('<nldd-avatar></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.getAttribute('aria-hidden')).toBe('true');
		expect(el.hasAttribute('role')).toBe(false);
	});
});

describe('nldd-avatar – full size', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('stays square in a row with a taller neighbor', async () => {
		el = await fixture<HTMLElement>('<div style="display: flex; --primitives-space-48: 48px; --primitives-space-40: 40px"><nldd-avatar size="48" decorative></nldd-avatar><nldd-avatar size="40" initials="LVVN" decorative></nldd-avatar></div>');
		const avatar = el.querySelectorAll('nldd-avatar')[1] as HTMLElement;
		await waitForUpdate(avatar);
		const { width, height } = avatar.getBoundingClientRect();
		expect(height).toBe(width);
	});

	it('size="full" names the container-filling default', async () => {
		el = await fixture<HTMLElement>('<div style="width: 56px"><nldd-avatar name="Anna Tester" size="full"></nldd-avatar></div>');
		const avatar = el.querySelector('nldd-avatar') as HTMLElement;
		await waitForUpdate(avatar);
		expect(Math.round(avatar.getBoundingClientRect().width)).toBe(56);
	});

	describe('interactief', () => {
		it('rendert een link met href en houdt de host zonder role=img', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart van de Biezen" href="/profiel/"></nldd-avatar>');
			await waitForUpdate(el);
			const link = el.shadowRoot!.querySelector('a.avatar');
			expect(link).toBeTruthy();
			expect(link!.getAttribute('href')).toBe('/profiel/');
			// The control carries the name, so the host must not carry it again.
			expect(link!.getAttribute('aria-label')).toBe('Bart van de Biezen');
			expect(el.getAttribute('role')).toBeNull();
			expect(el.getAttribute('aria-hidden')).toBeNull();
		});

		it('rendert een knop met button', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart" button></nldd-avatar>');
			await waitForUpdate(el);
			const button = el.shadowRoot!.querySelector('button.avatar');
			expect(button).toBeTruthy();
			expect(button!.getAttribute('type')).toBe('button');
		});

		it('laat href winnen van button', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart" href="/profiel/" button></nldd-avatar>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('a.avatar')).toBeTruthy();
			expect(el.shadowRoot!.querySelector('button.avatar')).toBeNull();
		});

		it('gebruikt accessible-label boven name', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart" button accessible-label="Profielmenu openen"></nldd-avatar>');
			await waitForUpdate(el);
			const button = el.shadowRoot!.querySelector('button.avatar');
			expect(button!.getAttribute('aria-label')).toBe('Profielmenu openen');
		});

		it('zet rel bij target=_blank en meldt het nieuwe tabblad', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart" href="/profiel" target="_blank"></nldd-avatar>');
			await waitForUpdate(el);
			const link = el.shadowRoot!.querySelector('a.avatar')!;
			expect(link.getAttribute('rel')).toContain('noopener');
			expect(link.getAttribute('rel')).toContain('noreferrer');
			expect(link.getAttribute('aria-label')).toContain(', opent in nieuw tabblad');
		});

		it('blijft een gewone div zonder href of button', async () => {
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart"></nldd-avatar>');
			await waitForUpdate(el);
			expect(el.shadowRoot!.querySelector('div.avatar')).toBeTruthy();
			expect(el.getAttribute('role')).toBe('img');
		});
	});

});

describe('nldd-avatar no-tab', () => {
	let el: NLDDAvatar;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('takes the link out of the tab order', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar name="Jan" href="/x" no-tab></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.getAttribute('tabindex')).toBe('-1');
	});

	it('takes the button out of the tab order', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar name="Jan" button no-tab></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('button')!.getAttribute('tabindex')).toBe('-1');
	});

	it('is in the tab order by default (no tabindex attribute)', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar name="Jan" href="/x"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('a')!.hasAttribute('tabindex')).toBe(false);
	});
});
