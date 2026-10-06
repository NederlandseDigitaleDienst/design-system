/**
 * Nederlandse Digitale Dienst Keyboard Shortcut Component (Lit + TypeScript)
 *
 * Shows a key combination (such as Cmd+K or Ctrl+Shift+P) in one combined
 * container with a semantic <kbd> element per key.
 *
 * On touch-only devices (no hover-capable input) the shortcut is hidden by
 * default, because it cannot be invoked there. Use the `always-visible`
 * attribute when the shortcut is purely informative and should stay visible.
 *
 * For cross-platform shortcuts you can set `mac-keys`, `windows-keys` and
 * `linux-keys`. The component picks the right one from the detected OS, with
 * `keys` as the fallback for unknown platforms.
 *
 * @element nldd-keyboard-shortcut
 * @attr {string} keys - Keys separated by '+' (e.g. 'Cmd+K' or 'Ctrl+Shift+P').
 *   Use '+++' for a literal '+' key: 'Ctrl+++' becomes 'Ctrl' + '+'. For more
 *   complex cases (a combo with several '+' keys, for instance) use the default
 *   slot with your own <kbd> elements instead of the keys attribute.
 * @attr {string} mac-keys - Optional override for macOS (iPhone/iPad/iPod included).
 * @attr {string} windows-keys - Optional override for Windows.
 * @attr {string} linux-keys - Optional override for Linux/ChromeOS.
 * @attr {string} size - Size: 'sm' | 'md' | 'inherit' (default: 'md'). 'inherit' takes the
 *   font-size from the container; in the box variant the keycaps then scale along in em.
 * @attr {string} appearance - 'box' (default) shows each key as a keycap with a fill and a
 *   highlight edge. 'simple' shows the keys as plain text with separators: lighter, for
 *   inline use such as in a menu item.
 * @attr {boolean} always-visible - Show on touch-only devices too, where shortcuts cannot be invoked.
 * @attr {string} color - 'neutral' (default) uses the component colors of its own. 'inherit'
 *   lets the keys and separators follow the surrounding text color (currentColor), with a
 *   translucent contrast fill and highlight edge. Useful on a filled surface color or a
 *   highlighted row.
 * @attr {'mac'|'windows'|'linux'|'other'} debug-os - Development aid: overrides the OS
 *   detection for this instance, so you can show several platform variants side by side in
 *   stories or documentation. Not meant for production use; leave it empty (default) so
 *   the real OS detection applies.
 *
 * @slot - Optional custom <kbd> elements. Ignored when keys is set.
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { reflectNonDefault } from '../../../utilities/reflect-non-default.js';
import { keyboardShortcutStyles } from './keyboard-shortcut.styles.js';
import { template } from './keyboard-shortcut.template.js';
import { detectOS, type OS } from '../../../utilities/os.js';

type Size = 'sm' | 'md' | 'inherit';
type Color = 'neutral' | 'inherit';
type Appearance = 'box' | 'simple';

@customElement('nldd-keyboard-shortcut')
export class NLDDKeyboardShortcut extends LitElement {
	static override styles = keyboardShortcutStyles;

	@property({ reflect: true, converter: reflectNonDefault<string>('') })
	keys = '';

	@property({ reflect: true, attribute: 'mac-keys', converter: reflectNonDefault<string>('') })
	macKeys = '';

	@property({ reflect: true, attribute: 'windows-keys', converter: reflectNonDefault<string>('') })
	windowsKeys = '';

	@property({ reflect: true, attribute: 'linux-keys', converter: reflectNonDefault<string>('') })
	linuxKeys = '';

	@property({ reflect: true, converter: reflectNonDefault<Size>('md') })
	size: Size = 'md';

	/**
	 * 'box' (default) renders each key as a keycap with a fill and highlight
	 * border. 'simple' renders the keys as plain text with separators — lighter,
	 * for inline use such as inside a menu item.
	 */
	@property({ reflect: true, converter: reflectNonDefault<Appearance>('box') })
	appearance: Appearance = 'box';

	/**
	 * 'neutral' (default) uses the component's own palette. 'inherit' makes the
	 * keys and separators adopt the surrounding text color (currentColor), with a
	 * translucent contrast fill and highlight border — useful on filled panels or
	 * highlighted rows.
	 */
	@property({ reflect: true, converter: reflectNonDefault<Color>('neutral') })
	color: Color = 'neutral';

	@property({ type: Boolean, reflect: true, attribute: 'always-visible' })
	alwaysVisible = false;

	/**
	 * @internal — development only.
	 *
	 * Per-instance OS override that bypasses `detectOS()`. Same pattern as
	 * `debug-safe-triangle` on `nldd-menu`: useful in stories or
	 * documentation comparisons where you need different instances on the
	 * page to render as different operating systems. Don't ship this in
	 * production markup — production should rely on real OS detection.
	 */
	@property({ type: String, attribute: 'debug-os' })
	debugOS: OS | '' = '';

	/** @internal Resolved OS — the debug override when set, else detection. */
	get _resolvedOS(): OS {
		return this.debugOS || detectOS();
	}

	get _resolvedKeys(): string {
		const os = this._resolvedOS;
		if (os === 'mac' && this.macKeys) return this.macKeys;
		if (os === 'windows' && this.windowsKeys) return this.windowsKeys;
		if (os === 'linux' && this.linuxKeys) return this.linuxKeys;
		return this.keys;
	}

	get _parsedKeys(): string[] {
		const spec = this._resolvedKeys;
		if (!spec) return [];
		// '+++' encodes a literal '+' key between separators: Ctrl+++a → [Ctrl, +, a]
		const MARKER = '\u0000';
		return spec
			.replace(/\+\+\+/g, `+${MARKER}+`)
			.split('+')
			.map(k => k.trim().replace(new RegExp(MARKER, 'g'), '+'))
			.filter(Boolean);
	}

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-keyboard-shortcut': NLDDKeyboardShortcut;
	}
}
