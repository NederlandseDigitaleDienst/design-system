import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { detectOS } from './os.js';
import type { OS } from './os.js';

/**
 * The shortcut hint attributes that nldd-menu-item, nldd-tooltip, nldd-button,
 * nldd-icon-button, nldd-toggle-button, nldd-segmented-control-item,
 * nldd-split-button and nldd-search-field share: `shortcut` plus a per-OS
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
	// Spaces around a '+' are spacing, not part of a key: 'Ctrl + +' is 'Ctrl++'.
	const compact = spec.trim().replace(/\s*\+\s*/g, '+');
	if (compact === '+') return ['+'];
	const MARKER = '\u0000';
	return compact
		.replace(/\+\+\+/g, `+${MARKER}+`)
		.replace(/\+\+$/, `+${MARKER}`)
		.split('+')
		.map(k => k.trim().split(MARKER).join('+'))
		.filter(Boolean);
}

/** A key as it is shown, and as it is read: `label` may be a symbol, `spoken` is a word. */
export interface DisplayKey {
	label: string;
	spoken: string;
}

interface Modifier {
	symbol: string;
	spoken: string;
}

// In the order macOS lists them in a menu: ⌃⌥⇧⌘.
const CONTROL: Modifier = { symbol: '⌃', spoken: 'Control' };
const OPTION: Modifier = { symbol: '⌥', spoken: 'Option' };
const SHIFT: Modifier = { symbol: '⇧', spoken: 'Shift' };
const COMMAND: Modifier = { symbol: '⌘', spoken: 'Command' };
const MAC_ORDER = [CONTROL, OPTION, SHIFT, COMMAND];

const MODIFIERS: Record<string, Modifier> = {
	ctrl: CONTROL, control: CONTROL, '⌃': CONTROL,
	alt: OPTION, opt: OPTION, option: OPTION, '⌥': OPTION,
	shift: SHIFT, '⇧': SHIFT,
	cmd: COMMAND, command: COMMAND, meta: COMMAND, '⌘': COMMAND,
};

/**
 * The keys of a spec as this OS shows them. On macOS the modifiers become
 * their symbols, in the macOS order (`Cmd+Shift+Z` is ⇧ ⌘ Z); elsewhere the
 * keys stay as written. A symbol is read as its name, as the speech engine
 * says nothing for ⌘ ⌥ ⇧ ⌃.
 */
export function displayKeys(spec: string, os: OS): DisplayKey[] {
	const keys = parseKeys(spec);
	if (os !== 'mac') {
		return keys.map((key) => ({ label: key, spoken: key.length === 1 && MODIFIERS[key] ? MODIFIERS[key].spoken : key }));
	}
	const modifiers = new Set<Modifier>();
	const rest: DisplayKey[] = [];
	for (const key of keys) {
		const modifier = MODIFIERS[key.toLowerCase()];
		if (modifier) modifiers.add(modifier);
		else rest.push({ label: key, spoken: key });
	}
	const ordered = MAC_ORDER.filter((modifier) => modifiers.has(modifier))
		.map(({ symbol, spoken }) => ({ label: symbol, spoken }));
	return [...ordered, ...rest];
}

// A browser cannot tell whether there is a keyboard. A device whose pointers
// cannot hover is touch-only and most likely has none; nldd-keyboard-shortcut
// hides itself on the same media query.
const NO_SHORTCUTS_QUERY = '(any-hover: none)';

/** Whether a keyboard shortcut can be used on this device, so a hint for it is worth showing. */
export function shortcutsAvailable(): boolean {
	return typeof matchMedia !== 'function' || !matchMedia(NO_SHORTCUTS_QUERY).matches;
}

/**
 * Renders the host again when shortcuts become available or unavailable, such
 * as when a pointer is attached or removed, so a shortcut in its accessible
 * name follows the visible hint. Pass `onChange` for work that a render does
 * not redo.
 */
export class ShortcutAvailabilityController implements ReactiveController {
	private _query = typeof matchMedia === 'function' ? matchMedia(NO_SHORTCUTS_QUERY) : null;
	private _onChange: () => void;

	constructor(host: ReactiveControllerHost, onChange?: () => void) {
		this._onChange = onChange ?? (() => host.requestUpdate());
		host.addController(this);
	}

	private _handleChange = () => this._onChange();

	hostConnected(): void {
		this._query?.addEventListener('change', this._handleChange);
	}

	hostDisconnected(): void {
		this._query?.removeEventListener('change', this._handleChange);
	}
}

/**
 * The shortcut as words for an accessible name ("Ctrl Z"), matching how
 * nldd-menu-item is announced. Empty without a shortcut, and where
 * shortcutsAvailable() says the key cannot be pressed, as the hint is hidden
 * there too. Read when the component renders; ShortcutAvailabilityController
 * renders it again when that changes.
 */
export function shortcutLabel(hint: ShortcutHint): string {
	if (!hasShortcut(hint) || !shortcutsAvailable()) return '';
	const spec = resolveKeys({
		keys: hint.shortcut,
		macKeys: hint.shortcutMac,
		windowsKeys: hint.shortcutWindows,
		linuxKeys: hint.shortcutLinux,
	}, detectOS());
	return displayKeys(spec, detectOS()).map((key) => key.spoken).join(' ');
}
