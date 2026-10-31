import { describe, it, expect, afterEach, vi } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import '../../../assets/styles/variables.css';
import './avatar-group.js';

describe('nldd-avatar-group', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-avatar-group></nldd-avatar-group>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('slot de avatars in de groep', async () => {
		el = await fixture(`
			<nldd-avatar-group>
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot')!;
		expect(slot.assignedElements().length).toBe(2);
	});

	it('is geen groep voor hulpsoftware zonder accessible-label', async () => {
		el = await fixture('<nldd-avatar-group><nldd-avatar name="Jan" decorative></nldd-avatar></nldd-avatar-group>');
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.avatar-group')!;
		expect(group.getAttribute('role')).toBeNull();
		expect(group.getAttribute('aria-label')).toBeNull();
	});

	it('wordt een gelabelde groep met accessible-label', async () => {
		el = await fixture('<nldd-avatar-group accessible-label="Redactie"><nldd-avatar name="Jan" decorative></nldd-avatar></nldd-avatar-group>');
		await waitForUpdate(el);
		const group = el.shadowRoot!.querySelector('.avatar-group')!;
		expect(group.getAttribute('role')).toBe('group');
		expect(group.getAttribute('aria-label')).toBe('Redactie');
	});

	it('houdt alles zichtbaar zolang er niet meer dan max avatars zijn', async () => {
		el = await fixture(`
			<nldd-avatar-group max="3">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar-group__overflow-button')).toBeNull();
		expect(el.shadowRoot!.querySelector('nldd-popover')).toBeNull();
	});

	it('zet alles voorbij max achter een +N knop met hun namen', async () => {
		el = await fixture(`
			<nldd-avatar-group max="2">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
				<nldd-avatar name="Fatima Ahmadi" decorative></nldd-avatar>
				<nldd-avatar name="Sanne de Vries" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);

		const knop = el.shadowRoot!.querySelector('.avatar-group__overflow-button')!;
		expect(knop.textContent!.trim()).toBe('+2');

		// The names behind the button are exactly those past max, in the same order.
		const namen = Array.from(el.shadowRoot!.querySelectorAll('nldd-text-cell'))
			.map(cel => cel.getAttribute('text'));
		expect(namen).toEqual(['Fatima Ahmadi', 'Sanne de Vries']);

		// And the rule that hides the rest counts from the first one that no longer fits.
		const regels = el.shadowRoot!.querySelector('#generated-rules')!.textContent!;
		expect(regels).toContain(':nth-child(n + 3)');
	});

	it('verbergt niemand bij max="0"', async () => {
		el = await fixture(`
			<nldd-avatar-group max="0">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.avatar-group__overflow-button')).toBeNull();
	});

	// No assertions on the sizes and the overlap: the test document carries no
	// design tokens, so every --_* that resolves to one computes to nothing
	// here. Those are checked in Storybook (Sizes and Overlap stories).
	const groupWith = (size: string, extra: number) => fixture(`
		<nldd-avatar-group size="${size}" max="1">
			${Array.from({ length: extra + 1 }, (_, i) => `<nldd-avatar name="Persoon ${i}" decorative></nldd-avatar>`).join('')}
		</nldd-avatar-group>
	`);

	it('toont het aantal als het in de schijf past', async () => {
		el = await groupWith('40', 12);
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.avatar-group__overflow-button')!;
		expect(button.textContent!.trim()).toBe('+12');
		expect(el.shadowRoot!.querySelector('nldd-tooltip')).toBeNull();
	});

	it('toont een ellipsis met het aantal in een tooltip als het niet past', async () => {
		el = await groupWith('32', 12);
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.avatar-group__overflow-button')!;
		expect(button.textContent!.trim()).toBe('');
		expect(button.querySelector('nldd-icon')!.getAttribute('icon')).toBe('ellipsis');
		expect(button.getAttribute('aria-label')).toContain('12');
		expect(el.shadowRoot!.querySelector('nldd-tooltip')!.getAttribute('text')).toContain('12');
	});
	const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

	const groupIn = async (width: number, attrs: string, count: number) => {
		const group = await fixture(`
			<div style="width: ${width}px">
				<nldd-avatar-group ${attrs}>
					${Array.from({ length: count }, (_, i) => `<nldd-avatar name="Persoon ${i}" decorative></nldd-avatar>`).join('')}
				</nldd-avatar-group>
			</div>
		`);
		await nextFrame();
		const inner = group.querySelector('nldd-avatar-group') as HTMLElement & { updateComplete: Promise<boolean> };
		await inner.updateComplete;
		return { wrapper: group, el: inner };
	};

	const overflowText = (group: HTMLElement) =>
		group.shadowRoot!.querySelector('.avatar-group__overflow-button')?.getAttribute('aria-label') ?? null;

	it('toont minder avatars als de container te smal is', async () => {
		// 40px per avatar, 8px overlap: 100px holds one avatar and the button.
		const { wrapper, el: group } = await groupIn(100, 'max="4"', 6);
		el = wrapper;
		expect(overflowText(group)).toContain('5');
		expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(100);
	});

	it('toont er weer meer als de container groeit, tot max', async () => {
		const { wrapper, el: group } = await groupIn(100, 'max="4"', 6);
		el = wrapper;
		wrapper.style.width = '600px';
		await nextFrame();
		await group.updateComplete;
		expect(overflowText(group)).toContain('2');
	});

	it('komt tot rust in een container die zo breed is als de groep', async () => {
		// fit-content takes its width from the group, the group its fit from the
		// width: a loop if the width followed the avatars that are shown.
		const { wrapper, el: group } = await groupIn(100, 'max="4"', 6);
		el = wrapper;
		wrapper.style.width = 'fit-content';
		wrapper.style.maxWidth = '100px';
		await nextFrame();
		await group.updateComplete;
		const first = overflowText(group);
		for (let i = 0; i < 5; i++) await nextFrame();
		expect(overflowText(group)).toBe(first);
		expect((group as unknown as { isUpdatePending: boolean }).isUpdatePending).toBe(false);
	});

	it('past zich ook zonder max aan de breedte aan', async () => {
		const { wrapper, el: group } = await groupIn(140, '', 6);
		el = wrapper;
		// 140px holds four discs (8 + 4 × 32 = 136): three avatars and the button.
		expect(overflowText(group)).toContain('3');
		wrapper.style.width = '600px';
		await nextFrame();
		await group.updateComplete;
		expect(overflowText(group)).toBeNull();
	});
	it('waarschuwt bij klikbare avatars onder maat 32', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		el = await fixture(`
			<nldd-avatar-group size="28">
				<nldd-avatar name="Jan Jansen" href="#"></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" href="#"></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		expect(warn.mock.calls.some(([m]) => String(m).includes('avatar-group-target-too-small') && String(m).includes('size="28"'))).toBe(true);
		warn.mockClear();
		(el as HTMLElement).setAttribute('size', '32');
		await waitForUpdate(el);
		expect(warn.mock.calls.some(([m]) => String(m).includes('avatar-group-target-too-small'))).toBe(false);
		warn.mockRestore();
	});

	it('geeft de lijst een titelbalk met de naam van de groep', async () => {
		el = await fixture(`
			<nldd-avatar-group max="1" accessible-label="Redactie">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		const bar = el.shadowRoot!.querySelector('nldd-popover nldd-top-title-bar')!;
		expect(bar.getAttribute('text')).toBe('Redactie');
		expect(bar.getAttribute('dismiss-text')).toBe('Sluit');
	});

	it('laat de knop open staan zolang de lijst open is', async () => {
		el = await fixture(`
			<nldd-avatar-group max="1">
				<nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
				<nldd-avatar name="Piet Pietersen" decorative></nldd-avatar>
			</nldd-avatar-group>
		`);
		await waitForUpdate(el);
		const button = el.shadowRoot!.querySelector('.avatar-group__overflow-button') as HTMLButtonElement;
		const popover = el.shadowRoot!.querySelector('nldd-popover') as HTMLElement;
		const resting = getComputedStyle(button).backgroundColor;

		button.click();
		await waitForUpdate(el);
		expect(popover.matches(':popover-open')).toBe(true);
		expect(button.getAttribute('aria-expanded')).toBe('true');
		const expanded = getComputedStyle(button).backgroundColor;
		expect(expanded).not.toBe(resting);

		popover.hidePopover();
		await waitForUpdate(el);
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(getComputedStyle(button).backgroundColor).toBe(resting);
	});
});
