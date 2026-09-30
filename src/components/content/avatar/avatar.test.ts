import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
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

	it('reflects color="inherit" and keeps default color unreflected', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen" color="inherit"></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.color).toBe('inherit');
		expect(el.getAttribute('color')).toBe('inherit');
		el.color = 'neutral';
		await waitForUpdate(el);
		expect(el.hasAttribute('color')).toBe(false);
	});

	it('reflects icon-aligned and scales the shape to 5/6', async () => {
		el = await fixture('<nldd-avatar name="Bart van de Biezen" size="48" icon-aligned></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.iconAligned).toBe(true);
		expect(el.getAttribute('icon-aligned')).toBe('');
		// --_shape-scale drives the 5/6 shape; default avatars stay full-bleed (1).
		expect(getComputedStyle(el).getPropertyValue('--_shape-scale').trim()).toBe('calc(5 / 6)');
		el.iconAligned = false;
		await waitForUpdate(el);
		expect(el.hasAttribute('icon-aligned')).toBe(false);
		expect(getComputedStyle(el).getPropertyValue('--_shape-scale').trim()).toBe('1');
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

	it('caps explicit initials at three characters', async () => {
		el = await fixture('<nldd-avatar initials="ABCDE" decorative></nldd-avatar>');
		await waitForUpdate(el);
		expect(el.resolvedInitials).toBe('ABC');
		expect(el.shadowRoot!.querySelector('.avatar__initials')!.textContent).toBe('ABC');
	});

	// The test fixture isn't laid out (zero-size shadow elements), so stub the
	// measured widths to check the fit maths deterministically. The live scaling
	// (initials always fit) is verified in the browser.
	const stubAndFit = (a: NLDDAvatar, shapeWidth: number, initialsWidth: number): number => {
		const shape = a.shadowRoot!.querySelector('.avatar')!;
		const initials = a.shadowRoot!.querySelector('.avatar__initials')!;
		Object.defineProperty(shape, 'clientWidth', { value: shapeWidth, configurable: true });
		Object.defineProperty(initials, 'scrollWidth', { value: initialsWidth, configurable: true });
		(a as unknown as { _fitInitials(): void })._fitInitials();
		return parseFloat(a.style.getPropertyValue('--_initials-fit'));
	};

	it('scales wide initials down to fit the shape width', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar initials="WWWW" decorative size="48"></nldd-avatar>');
		await waitForUpdate(el);
		// natural 60px wide inside a 48px shape → fit = 48 * 0.75 / 60
		expect(stubAndFit(el, 48, 60)).toBeCloseTo((48 * 0.75) / 60, 3);
	});

	it('keeps narrow initials at full size (fit capped at 1)', async () => {
		el = await fixture<NLDDAvatar>('<nldd-avatar initials="I" decorative size="48"></nldd-avatar>');
		await waitForUpdate(el);
		expect(stubAndFit(el, 48, 8)).toBe(1);
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
		const fit = vi.spyOn(el as unknown as { _fitInitials(): void }, '_fitInitials');
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
			el = await fixture<NLDDAvatar>('<nldd-avatar name="Bart" href="https://example.org" target="_blank"></nldd-avatar>');
			await waitForUpdate(el);
			const link = el.shadowRoot!.querySelector('a.avatar')!;
			expect(link.getAttribute('rel')).toContain('noopener');
			expect(link.getAttribute('rel')).toContain('noreferrer');
			expect(link.getAttribute('aria-label')).toContain('Opent in nieuw tabblad');
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
