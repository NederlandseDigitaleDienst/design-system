import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import './link-group.js';
import '../link/link.js';

describe('nldd-link-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const group = (attrs = '') => `
		<nldd-link-group ${attrs}>
			<nldd-link href="#" text="Tijdlijn"></nldd-link>
			<nldd-link href="#" text="Agenda"></nldd-link>
			<nldd-link href="#" text="Contact"></nldd-link>
		</nldd-link-group>
	`;

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-link-group></nldd-link-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('is een nav met de links als lijst', async () => {
		el = await fixture(group('accessible-label="Over Mijn Dienst"'));
		await waitForUpdate(el);
		const nav = el.shadowRoot!.querySelector('nav')!;
		expect(nav.getAttribute('aria-label')).toBe('Over Mijn Dienst');
		expect(nav.querySelector('[role="list"]')).not.toBeNull();
		const roles = [...el.querySelectorAll('nldd-link')].map((link) => link.getAttribute('role'));
		expect(roles).toEqual(['listitem', 'listitem', 'listitem']);
	});

	it('laat aria-label weg zonder accessible-label', async () => {
		el = await fixture(group());
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('nav')!.hasAttribute('aria-label')).toBe(false);
	});

	it('zet zijn size op elke link, ook na een wijziging', async () => {
		el = await fixture(group('size="sm"'));
		await waitForUpdate(el);
		const sizes = () => [...el.querySelectorAll('nldd-link')].map((link) => link.getAttribute('size'));
		expect(sizes()).toEqual(['sm', 'sm', 'sm']);
		(el as HTMLElement & { size: string }).size = 'lg';
		await waitForUpdate(el);
		expect(sizes()).toEqual(['lg', 'lg', 'lg']);
	});

	it('geeft een link die later komt ook de size', async () => {
		el = await fixture(group());
		await waitForUpdate(el);
		const link = document.createElement('nldd-link');
		link.setAttribute('href', '#');
		link.setAttribute('text', 'Vacatures');
		el.append(link);
		await waitForUpdate(el);
		expect(link.getAttribute('size')).toBe('md');
		expect(link.getAttribute('role')).toBe('listitem');
	});

	it('legt de links op een rij die doorloopt, of onder elkaar', async () => {
		el = await fixture(group());
		await waitForUpdate(el);
		const list = el.shadowRoot!.querySelector('.link-group__items')!;
		expect(getComputedStyle(list).flexDirection).toBe('row');
		expect(getComputedStyle(list).flexWrap).toBe('wrap');
		el.setAttribute('orientation', 'vertical');
		await waitForUpdate(el);
		expect(getComputedStyle(list).flexDirection).toBe('column');
	});

	it('centreert de links met horizontal-alignment="center"', async () => {
		el = await fixture(group('horizontal-alignment="center"'));
		await waitForUpdate(el);
		const list = el.shadowRoot!.querySelector('.link-group__items')!;
		expect(getComputedStyle(list).justifyContent).toBe('center');
	});
});
