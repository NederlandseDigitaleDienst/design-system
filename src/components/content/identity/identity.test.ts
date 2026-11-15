import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './identity.js';

const AVATAR = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\'/%3E%3C/svg%3E';

describe('nldd-identity', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-identity></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('renders text and supporting-text', async () => {
		el = await fixture('<nldd-identity text="Jan Jansen" supporting-text="Redacteur"></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text')!.textContent).toBe('Jan Jansen');
		expect(el.shadowRoot!.querySelector('.identity__supporting-text')!.textContent).toBe('Redacteur');
	});

	it('hides the text area without text and supporting-text', async () => {
		el = await fixture(`<nldd-identity><img slot="avatars" src="${AVATAR}" alt=""></nldd-identity>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text-area')!.hasAttribute('hidden')).toBe(true);
	});

	it('hides the supporting-text element when not set', async () => {
		el = await fixture('<nldd-identity text="Jan Jansen"></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text')!.hasAttribute('hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('.identity__supporting-text')!.hasAttribute('hidden')).toBe(true);
	});


	/* ============================================================
	   Text slots (attribute is the slot fallback)
	   ============================================================ */

	it('renders slotted rich content in the text and supporting-text slots', async () => {
		el = await fixture(`
			<nldd-identity>
				<span slot="text">Door <a href="/auteurs/jan">Jan Jansen</a></span>
				<time slot="supporting-text" datetime="2026-06-12">12 juni 2026</time>
			</nldd-identity>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text-area')!.hasAttribute('hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('.identity__text')!.hasAttribute('hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('.identity__supporting-text')!.hasAttribute('hidden')).toBe(false);
		const textSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="text"]')!;
		const supportingSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="supporting-text"]')!;
		expect(textSlot.assignedElements().length).toBe(1);
		expect(supportingSlot.assignedElements()[0]!.tagName).toBe('TIME');
	});

	it('uses the attribute as fallback when the slot is empty', async () => {
		el = await fixture('<nldd-identity text="Jan Jansen"></nldd-identity>');
		await waitForUpdate(el);
		const text = el.shadowRoot!.querySelector('.identity__text')!;
		expect(text.textContent).toContain('Jan Jansen');
		expect(el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="text"]')!.assignedElements().length).toBe(0);
	});

	it('shows the text area when slotted content is added at runtime', async () => {
		el = await fixture('<nldd-identity></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text-area')!.hasAttribute('hidden')).toBe(true);
		const time = document.createElement('time');
		time.setAttribute('slot', 'supporting-text');
		time.setAttribute('datetime', '2026-06-12');
		time.textContent = '12 juni 2026';
		el.appendChild(time);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text-area')!.hasAttribute('hidden')).toBe(false);
		expect(el.shadowRoot!.querySelector('.identity__text')!.hasAttribute('hidden')).toBe(true);
	});


	/* ============================================================
	   Avatar slot management
	   ============================================================ */

	it('hides the avatars area without slotted avatars', async () => {
		el = await fixture('<nldd-identity text="Jan Jansen"></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(true);
	});

	it('shows the avatars area with a slotted avatar', async () => {
		el = await fixture(`<nldd-identity text="Jan Jansen"><img slot="avatars" src="${AVATAR}" alt=""></nldd-identity>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
	});

	it('supports multiple slotted avatars', async () => {
		el = await fixture(`
			<nldd-identity text="Jan, Petra en Ahmed">
				<img slot="avatars" src="${AVATAR}" alt="">
				<img slot="avatars" src="${AVATAR}" alt="">
				<img slot="avatars" src="${AVATAR}" alt="">
			</nldd-identity>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="avatars"]')!;
		expect(slot.assignedElements().length).toBe(3);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
	});

	it('flags the wrapper as multiple-avatars only with two or more avatars', async () => {
		el = await fixture(`
			<nldd-identity text="Jan, Petra en Ahmed">
				<img slot="avatars" src="${AVATAR}" alt="">
				<img slot="avatars" src="${AVATAR}" alt="">
			</nldd-identity>
		`);
		await waitForUpdate(el);
		expect((el as any)._avatarCount).toBe(2);
		expect(el.shadowRoot!.querySelector('.identity')!.hasAttribute('data-multiple-avatars')).toBe(true);
	});

	it('does not flag a single-avatar identity as multiple', async () => {
		el = await fixture(`<nldd-identity text="Jan Jansen"><img slot="avatars" src="${AVATAR}" alt=""></nldd-identity>`);
		await waitForUpdate(el);
		expect((el as any)._avatarCount).toBe(1);
		expect(el.shadowRoot!.querySelector('.identity')!.hasAttribute('data-multiple-avatars')).toBe(false);
	});

	it('updates avatar visibility when avatars are added at runtime', async () => {
		el = await fixture('<nldd-identity text="Jan Jansen"></nldd-identity>');
		await waitForUpdate(el);
		const img = document.createElement('img');
		img.setAttribute('slot', 'avatars');
		img.setAttribute('src', AVATAR);
		img.setAttribute('alt', '');
		el.appendChild(img);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
	});

	it('keeps slot tracking across a disconnect and reconnect', async () => {
		el = await fixture(`<nldd-identity text="Jan Jansen"><img slot="avatars" src="${AVATAR}" alt=""></nldd-identity>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
		const parent = el.parentNode!;
		parent.removeChild(el);
		parent.appendChild(el);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
	});


	/* ============================================================
	   Avatar via attribuut (de slot heeft voorrang)
	   ============================================================ */

	it('renders an internal nldd-avatar (in a group) from avatar-src when nothing is slotted', async () => {
		el = await fixture(`<nldd-identity text="Jan Jansen" avatar-src="${AVATAR}"></nldd-identity>`);
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('nldd-avatar-group');
		expect(group).not.toBeNull();
		const avatar = group!.querySelector('nldd-avatar')!;
		expect(avatar).not.toBeNull();
		expect(avatar.getAttribute('src')).toBe(AVATAR);
		// No avatar-alt: the name is in the identity text, so the avatar is decorative.
		expect(avatar.hasAttribute('decorative')).toBe(true);
		expect(el.shadowRoot!.querySelector('.identity__avatars')!.hasAttribute('hidden')).toBe(false);
	});

	it('applies avatar-srcset to the internal avatar and labels it with avatar-alt', async () => {
		el = await fixture(`<nldd-identity avatar-src="${AVATAR}" avatar-srcset="${AVATAR} 2x" avatar-alt="Jan Jansen"></nldd-identity>`);
		await waitForUpdate(el);
		const avatar = el.shadowRoot!.querySelector('nldd-avatar-group nldd-avatar')!;
		expect(avatar.getAttribute('srcset')).toBe(`${AVATAR} 2x`);
		// A non-empty avatar-alt becomes the avatar's name and is not decorative.
		expect(avatar.getAttribute('name')).toBe('Jan Jansen');
		expect(avatar.hasAttribute('decorative')).toBe(false);
	});

	it('lets a slotted avatar win over avatar-src (no internal avatar)', async () => {
		el = await fixture(`<nldd-identity avatar-src="${AVATAR}"><img slot="avatars" src="${AVATAR}" alt=""></nldd-identity>`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nldd-avatar-group')).toBeNull();
		expect(el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="avatars"]')!.assignedElements().length).toBe(1);
	});
});

describe('nldd-identity with a <p> of its own in a slot', () => {
	let el: HTMLElement;

	afterEach(() => cleanup(el));

	it('draws a plain box around the <p>, so the two do not nest', async () => {
		el = await fixture('<nldd-identity><p slot="text">Door Jan Jansen</p><p slot="supporting-text"><time datetime="2026-07-13">13 juli</time></p></nldd-identity>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.identity__text')!.localName).toBe('div');
		expect(el.shadowRoot!.querySelector('.identity__supporting-text')!.localName).toBe('div');
		expect(getComputedStyle(el.querySelector('p')!).marginBlockStart).toBe('0px');
	});
});
