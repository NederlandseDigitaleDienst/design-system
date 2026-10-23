import { describe, it, expect, afterEach, vi } from 'vitest';
import { ShortcutAvailabilityController, hasShortcut, parseKeys, resolveKeys, shortcutLabel } from './shortcut.js';
import { _setOSOverride } from './os.js';

const hint = (overrides: Partial<Parameters<typeof shortcutLabel>[0]> = {}) => ({
	shortcut: '',
	shortcutMac: '',
	shortcutWindows: '',
	shortcutLinux: '',
	...overrides,
});

describe('shortcut', () => {
	afterEach(() => _setOSOverride(null));

	it('splits keys on "+" and reads a trailing "++" or "+++" as a literal plus key', () => {
		expect(parseKeys('Ctrl+Shift+P')).toEqual(['Ctrl', 'Shift', 'P']);
		expect(parseKeys('Ctrl+++')).toEqual(['Ctrl', '+']);
		expect(parseKeys('Ctrl++')).toEqual(['Ctrl', '+']);
		expect(parseKeys('Ctrl+Shift++')).toEqual(['Ctrl', 'Shift', '+']);
		expect(parseKeys('+')).toEqual(['+']);
		expect(parseKeys('Ctrl + +')).toEqual(['Ctrl', '+']);
		expect(parseKeys('Ctrl + Shift + P')).toEqual(['Ctrl', 'Shift', 'P']);
		expect(parseKeys('Page Up')).toEqual(['Page Up']);
		expect(parseKeys('')).toEqual([]);
	});

	it('picks the keys for the OS and falls back to keys', () => {
		const spec = { keys: 'Ctrl+K', macKeys: 'Cmd+K', windowsKeys: '', linuxKeys: '' };
		expect(resolveKeys(spec, 'mac')).toBe('Cmd+K');
		expect(resolveKeys(spec, 'windows')).toBe('Ctrl+K');
	});

	it('knows whether any shortcut is set', () => {
		expect(hasShortcut(hint())).toBe(false);
		expect(hasShortcut(hint({ shortcutLinux: 'Alt+P' }))).toBe(true);
	});

	it('renders the host again when the pointer capability changes, until it disconnects', () => {
		const listeners = new Set<() => void>();
		const query = { matches: false, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) };
		vi.stubGlobal('matchMedia', () => query);
		const host = { addController: vi.fn(), removeController: vi.fn(), requestUpdate: vi.fn(), updateComplete: Promise.resolve(true) };
		const controller = new ShortcutAvailabilityController(host);
		expect(host.addController).toHaveBeenCalledWith(controller);
		controller.hostConnected();
		listeners.forEach((fn) => fn());
		expect(host.requestUpdate).toHaveBeenCalledTimes(1);
		controller.hostDisconnected();
		expect(listeners.size).toBe(0);
		vi.unstubAllGlobals();
	});

	it('spells the shortcut as words for an accessible name', () => {
		_setOSOverride('windows');
		expect(shortcutLabel(hint({ shortcut: 'Alt+P', shortcutMac: 'Option+P' }))).toBe('Alt P');
		_setOSOverride('mac');
		expect(shortcutLabel(hint({ shortcut: 'Alt+P', shortcutMac: 'Option+P' }))).toBe('Option P');
		expect(shortcutLabel(hint())).toBe('');
	});
});
