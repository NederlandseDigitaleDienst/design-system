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
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Cmd+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const container = el.shadowRoot!.querySelector('.keyboard-shortcut')!;
		expect(container.tagName).toBe('KBD');
	});

	it('renders one inner kbd per key', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Cmd+Shift+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
		expect(keys.length).toBe(3);
		expect(keys[0].textContent).toBe('Cmd');
		expect(keys[1].textContent).toBe('Shift');
		expect(keys[2].textContent).toBe('K');
	});

	it('wraps all keys in a single container', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Cmd+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const containers = el.shadowRoot!.querySelectorAll('.keyboard-shortcut');
		expect(containers.length).toBe(1);
		expect(containers[0].querySelectorAll('.keyboard-shortcut__key').length).toBe(2);
	});

	it('renders keycaps side by side, without a "+" between them', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Ctrl+Shift+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelectorAll('.keyboard-shortcut__separator').length).toBe(0);
	});

	it('joins the keys with "+" as text', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" appearance="text" keys="Ctrl+Shift+K"></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const separators = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__separator');
		expect(separators.length).toBe(2);
		separators.forEach(s => expect(s.textContent).toBe('+'));
	});

	it('treats "+++" as separator + literal + key + separator', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Ctrl+++a"></nldd-keyboard-shortcut>');
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
			expect(keys[0].textContent).toBe('⌃Control');
			expect(keys[1].textContent).toBe('K');
		});

		it('picks mac-keys on mac', async () => {
			el = await fixture('<nldd-keyboard-shortcut debug-os="mac" keys="Ctrl+K" mac-keys="Option+K"></nldd-keyboard-shortcut>');
			await waitForUpdate(el);
			const keys = el.shadowRoot!.querySelectorAll('.keyboard-shortcut__key');
			expect(keys[0].textContent).toBe('⌥Option');
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
		el = await fixture('<nldd-keyboard-shortcut color="content" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.getAttribute('color')).toBe('content');
	});

	it('color="content" takes the key + separator colors from the context', async () => {
		el = await fixture('<nldd-keyboard-shortcut color="content" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const cs = getComputedStyle(el);
		const context = cs.getPropertyValue('--context-content-color').trim();
		expect(cs.getPropertyValue('--_keyboard-shortcut-content-color').trim()).toBe(context);
		expect(cs.getPropertyValue('--_keyboard-shortcut-separator-color').trim()).toBe(context);
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

	it('defaults to appearance="keycap"', async () => {
		el = await fixture('<nldd-keyboard-shortcut keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect((el as unknown as { appearance: string }).appearance).toBe('keycap');
		expect(el.hasAttribute('appearance')).toBe(false);
	});

	it('reflects appearance="text"', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="text" keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.getAttribute('appearance')).toBe('text');
	});

	it('writes text on macOS without a "+", as a macOS menu does', async () => {
		el = await fixture('<nldd-keyboard-shortcut appearance="text" debug-os="mac" keys="Ctrl+K" mac-keys="Cmd+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(el.shadowRoot!.querySelector('.keyboard-shortcut__separator')).toBeNull();
	});
});

describe('nldd-keyboard-shortcut on macOS', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	const keysOf = (host: HTMLElement) => [...host.shadowRoot!.querySelectorAll('.keyboard-shortcut__key')];

	it('shows the modifiers as symbols in the order of a macOS menu', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="mac" keys="Cmd+Shift+Z" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const shown = keysOf(el).map((key) => key.querySelector('[aria-hidden="true"]')?.textContent ?? key.textContent);
		expect(shown).toEqual(['⇧', '⌘', 'Z']);
	});

	it('hides a symbol from assistive tech and reads its name instead', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="mac" keys="⌥+⌘+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		const [option, command, k] = keysOf(el);
		expect(option.querySelector('[aria-hidden="true"]')!.textContent).toBe('⌥');
		expect(option.querySelector('.keyboard-shortcut__spoken')!.textContent).toBe('Option');
		expect(command.querySelector('.keyboard-shortcut__spoken')!.textContent).toBe('Command');
		expect(k.children.length).toBe(0);
	});

	it('leaves the keys as written elsewhere', async () => {
		el = await fixture('<nldd-keyboard-shortcut debug-os="windows" keys="Shift+Ctrl+K" always-visible></nldd-keyboard-shortcut>');
		await waitForUpdate(el);
		expect(keysOf(el).map((key) => key.textContent)).toEqual(['Shift', 'Ctrl', 'K']);
	});
});

describe('nldd-keyboard-shortcut size', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('size="inherit" on the text appearance takes the container font-size', async () => {
		el = await fixture('<div style="font-size: 22px;"><nldd-keyboard-shortcut size="inherit" appearance="text" keys="Cmd+K" always-visible></nldd-keyboard-shortcut></div>');
		const ks = el.querySelector('nldd-keyboard-shortcut')!;
		await waitForUpdate(ks);
		const key = ks.shadowRoot!.querySelector('.keyboard-shortcut__key')!;
		expect(getComputedStyle(key).fontSize).toBe('22px');
	});

	it('rounds a keycap by a fifth of its height, as a tile, also on a wide key', async () => {
		el = await fixture('<div style="font-size: 20px;"><nldd-keyboard-shortcut debug-os="windows" size="inherit" keys="Shift" always-visible></nldd-keyboard-shortcut></div>');
		const ks = el.querySelector('nldd-keyboard-shortcut')!;
		await waitForUpdate(ks);
		const key = ks.shadowRoot!.querySelector('.keyboard-shortcut__key')!;
		const { height, width } = key.getBoundingClientRect();
		expect(width).toBeGreaterThan(height);
		expect(parseFloat(getComputedStyle(key).borderTopLeftRadius)).toBeCloseTo(height * 0.2, 1);
	});
});
