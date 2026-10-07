import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.js';
import { _setOSOverride, _resetOSDetectionCache } from '../../../utilities/os.js';
import './keyboard-shortcut.js';

describe('nldd-keyboard-shortcut', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('renders without error', async () => {
		el = await fixture('<nldd-keyboard-shortcut></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});

	it('uses an outer <kbd> container', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const container = el.shadowRoot!.querySelector('.keyboard-shortcut')!;
		expect(container.tagName).toBe('KBD');
	});

	it('renders one inner kbd per key', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+Shift+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
		expect(keys.length).toBe(3);
		expect(keys[0].textContent).toBe('Cmd');
		expect(keys[1].textContent).toBe('Shift');
		expect(keys[2].textContent).toBe('K');
	});

	it('wraps all keys in a single container', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const containers = el.shadowRoot!.querySelectorAll('.keyboard-shortcut');
		expect(containers.length).toBe(1);
		expect(containers[0].querySelectorAll('.keyboard-shortcut__key').length).toBe(2);
	});

	it('renders a "+" separator between keys', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+Shift+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const separators = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__separator');
		expect(separators.length).toBe(2);
		separators.forEach(s => expect(s.textContent).toBe('+'));
	});

	it('treats "+++" as separator + literal + key + separator', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Ctrl+++a"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
		expect(keys.length).toBe(3);
		expect(keys[0].textContent).toBe('Ctrl');
		expect(keys[1].textContent).toBe('+');
		expect(keys[2].textContent).toBe('a');
	});

	it('renders slot content when keys is empty', async () => {
		el = await fixture('<nldd-keyboard-shortcut><kbd>F</kbd></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const slot = el.shadowRoot!.querySelector('slot');
		expect(slot).not.toBeNull();
	});


	describe('always-visible', () => {
		it('reflecteert always-visible attribuut bij property set', async () => {
			el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			expect(el.hasAttribute('always-visible')).toBe(false);

			(el as any).alwaysVisible = true;
			await waitForUpdate(el);
			expect(el.hasAttribute('always-visible')).toBe(true);
		});

		it('parsed always-visible attribuut naar property', async () => {
			el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			expect((el as any).alwaysVisible).toBe(true);
		});

		it('default alwaysVisible is false', async () => {
			el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			expect((el as any).alwaysVisible).toBe(false);
			expect(el.hasAttribute('always-visible')).toBe(false);
		});

		it('verbergt zich op touch-only devices via @media (any-hover: none)', async () => {
			// Smoke check: the CSS block that hides the host is in the styles. Real
			// media query behavior is browser state and not easy to simulate in
			// vitest, so we verify that the rule is there.
			el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const sheets = (el.shadowRoot as ShadowRoot).adoptedStyleSheets;
			const cssText = Array.from(sheets)
				.flatMap(s => Array.from(s.cssRules))
				.map(r => r.cssText)
				.join('\n');
			expect(cssText).toContain('any-hover: none');
			expect(cssText).toContain(':not([always-visible])');
		});
	});


	describe('per-OS keys overrides', () => {
		afterEach(() => {
			_setOSOverride(null);
			_resetOSDetectionCache();
		});

		it('uses keys fallback when matching per-OS attribute is absent', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="mac" keys="Ctrl+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Ctrl');
			expect(keys[1].textContent).toBe('K');
		});

		it('picks mac-keys on mac', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="mac" keys="Ctrl+K" mac-keys="Cmd+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Cmd');
			expect(keys[1].textContent).toBe('K');
		});

		it('picks windows-keys on windows', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Ctrl+K" windows-keys="Win+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Win');
			expect(keys[1].textContent).toBe('K');
		});

		it('picks linux-keys on linux', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="linux" keys="Ctrl+K" linux-keys="Super+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Super');
			expect(keys[1].textContent).toBe('K');
		});

		it('falls back to keys when the resolved OS has no override', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="linux" keys="Ctrl+K" mac-keys="Cmd+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Ctrl');
		});

		it('falls back to keys for "other" platforms', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="other" keys="Ctrl+K" mac-keys="Cmd+K" windows-keys="Win+K" linux-keys="Super+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Ctrl');
		});

		it('debug-os takes precedence over the global _setOSOverride', async () => {
			_setOSOverride('mac');
			el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Ctrl+K" mac-keys="Cmd+K" windows-keys="Win+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('Win');
		});
	});
});

describe('nldd-keyboard-shortcut color', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('reflects the color attribute', async () => {
		el = await fixture('<nldd-keyboard-shortcut color="inherit" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('inherit');
	});

	it('color="inherit" points the key + separator colors at currentColor', async () => {
		el = await fixture('<nldd-keyboard-shortcut color="inherit" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const cs = getComputedStyle(el);
		expect(cs.getPropertyValue('--_keyboard-shortcut-content-color').trim()).toBe('currentColor');
		expect(cs.getPropertyValue('--_keyboard-shortcut-separator-color').trim()).toBe('currentColor');
	});

	it('defaults to color="neutral" with its own color tokens', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect((el as unknown as { color: string }).color).toBe('neutral');
		expect(el.hasAttribute('color')).toBe(false);
		expect(getComputedStyle(el).getPropertyValue('--_keyboard-shortcut-content-color').trim()).not.toBe('currentColor');
	});
});

describe('nldd-keyboard-shortcut appearance', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('defaults to appearance="box"', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect((el as unknown as { appearance: string }).appearance).toBe('box');
		expect(el.hasAttribute('appearance')).toBe(false);
	});

	it('reflects appearance="simple"', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="simple" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.getAttribute('appearance')).toBe('simple');
	});

	it('simple appearance strips the keycap box (no padding, no shadow)', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="simple" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const key = el.shadowRoot!.querySelector('.keyboard-shortcut__key')!;
		expect(getComputedStyle(key).paddingLeft).toBe('0px');
		expect(getComputedStyle(key).boxShadow).toBe('none');
	});

	it('simple appearance has no gap between keys', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="simple" keys="Ctrl+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(getComputedStyle(el.shadowRoot!.querySelector('.keyboard-shortcut')!).gap).toBe('0px');
	});

	it('renders the "+" separator on macOS too (no OS exception)', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="simple" debug-os="mac" keys="Ctrl+K" mac-keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.keyboard-shortcut__separator')).not.toBeNull();
		expect(el.hasAttribute('data-no-delimiter')).toBe(false);
	});
});

describe('nldd-keyboard-shortcut size', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('size="inherit" scales the box keycaps in em with a 0.75em font', async () => {
		el = await fixture('<nldd-keyboard-shortcut size="inherit" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const cs = getComputedStyle(el);
		expect(cs.getPropertyValue('--_keyboard-shortcut-size').trim()).toBe('1.5em');
		expect(cs.getPropertyValue('--_keyboard-shortcut-inline-padding').trim()).toBe('0.35em');
		expect(cs.getPropertyValue('--_keyboard-shortcut-font-size').trim()).toBe('0.75em');
	});

	it('size="inherit" on the simple appearance takes the container font-size', async () => {
		el = await fixture('<div style="font-size: 22px;"><nldd-keyboard-shortcut size="inherit" appearance="simple" keys="Cmd+K" always-visible></nldd-keyboard-shortcut></div>');
		const ks = el.querySelector('nldd-keyboard-shortcut')!;
		await waitForUpdate(ks);
		const key = ks.shadowRoot!.querySelector('.keyboard-shortcut__key')!;
		expect(getComputedStyle(key).fontSize).toBe('22px');
	});

	it('size="inherit" nudges the box keycaps up onto the text baseline', async () => {
		el = await fixture('<nldd-keyboard-shortcut size="inherit" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const container = el.shadowRoot!.querySelector('.keyboard-shortcut')!;
		expect(getComputedStyle(container).position).toBe('relative');
	});

	it('size="inherit" on the simple appearance keeps the shortcut in normal flow (no nudge)', async () => {
		el = await fixture('<nldd-keyboard-shortcut size="inherit" appearance="simple" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const container = el.shadowRoot!.querySelector('.keyboard-shortcut')!;
		expect(getComputedStyle(container).position).toBe('static');
	});
});
