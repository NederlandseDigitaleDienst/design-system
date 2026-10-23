import { describe, it, expect, afterEach } from 'vitest';
import { hasShortcut, parseKeys, resolveKeys, shortcutLabel } from './shortcut.js';
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

	it('spells the shortcut as words for an accessible name', () => {
		_setOSOverride('windows');
		expect(shortcutLabel(hint({ shortcut: 'Alt+P', shortcutMac: 'Option+P' }))).toBe('Alt P');
		_setOSOverride('mac');
		expect(shortcutLabel(hint({ shortcut: 'Alt+P', shortcutMac: 'Option+P' }))).toBe('Option P');
		expect(shortcutLabel(hint())).toBe('');
	});
});
