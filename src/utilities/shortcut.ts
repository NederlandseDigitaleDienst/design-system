import { detectOS } from './os.js';
import type { OS } from './os.js';

/**
 * The shortcut hint attributes that nldd-menu-item, nldd-tooltip, nldd-button,
 * nldd-icon-button and nldd-search-field share: `shortcut` plus a per-OS
 * override. Display only; the application binds the key.
 */
export interface ShortcutHint {
	shortcut: string;
	shortcutMac: string;
	shortcutWindows: string;
	shortcutLinux: string;
}

export interface KeysPerOS {
	keys: string;
	macKeys: string;
	windowsKeys: string;
	linuxKeys: string;
}

export function hasShortcut(hint: ShortcutHint): boolean {
	return Boolean(hint.shortcut || hint.shortcutMac || hint.shortcutWindows || hint.shortcutLinux);
}

/** The key spec for this OS, with `keys` as the fallback. */
export function resolveKeys(spec: KeysPerOS, os: OS): string {
	if (os === 'mac' && spec.macKeys) return spec.macKeys;
	if (os === 'windows' && spec.windowsKeys) return spec.windowsKeys;
	if (os === 'linux' && spec.linuxKeys) return spec.linuxKeys;
	return spec.keys;
}

/** Splits 'Ctrl+Shift+P' into keys; a trailing '++' ('Ctrl++') or '+++' is a literal '+' key. */
export function parseKeys(spec: string): string[] {
	if (!spec) return [];
	if (spec.trim() === '+') return ['+'];
	const MARKER = '\u0000';
	return spec
		.replace(/\+\+\+/g, `+${MARKER}+`)
		.replace(/\+\+$/, `+${MARKER}`)
		.split('+')
		.map(k => k.trim().replace(new RegExp(MARKER, 'g'), '+'))
		.filter(Boolean);
}

/** Whether the device can hover, the same test that hides nldd-keyboard-shortcut on touch-only devices. */
export function canHover(): boolean {
	return typeof matchMedia !== 'function' || !matchMedia('(any-hover: none)').matches;
}

/**
 * The shortcut as words for an accessible name ("Ctrl Z"), matching how
 * nldd-menu-item is announced. Empty without a shortcut, and on a touch-only
 * device, where the hint is hidden because the key cannot be pressed.
 *
 * Read when the component renders: if a pointer is attached or removed later,
 * the visible hint follows its media query at once, but the accessible name
 * keeps the old text until the component renders again.
 */
export function shortcutLabel(hint: ShortcutHint): string {
	if (!hasShortcut(hint) || !canHover()) return '';
	const spec = resolveKeys({
		keys: hint.shortcut,
		macKeys: hint.shortcutMac,
		windowsKeys: hint.shortcutWindows,
		linuxKeys: hint.shortcutLinux,
	}, detectOS());
	return parseKeys(spec).join(' ');
}
