import { html, nothing } from 'lit';
import './keyboard-shortcut.js';

/**
 * De KeyboardShortcut component toont een toetsencombinatie in één gecombineerde
 * container, bijvoorbeeld naast een menu-item of als hint bij een actie.
 *
 * ## Gebruik
 * ```html
 * <nldd-keyboard-shortcut keys="Ctrl+K"></nldd-keyboard-shortcut>
 *
 * <!-- Cross-platform: per OS een eigen string -->
 * <nldd-keyboard-shortcut
 *   keys="Ctrl+K"
 *   mac-keys="⌘+K"
 *   windows-keys="Ctrl+K"
 *   linux-keys="Ctrl+K"
 * ></nldd-keyboard-shortcut>
 * ```
 *
 * Het component picks zelf de juiste set op basis van de gedetecteerde OS,
 * met `keys` als fallback voor onbekende platforms.
 */
export default {
	title: 'Components/Content/Keyboard Shortcut',
	component: 'nldd-keyboard-shortcut',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/keyboard-shortcut/keyboard-shortcut.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'inherit'],
			description: "Grootte: 'sm' | 'md' | 'inherit' ('inherit' neemt de font-size van de container over en schaalt de keycaps in em)",
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		variant: {
			control: 'select',
			options: ['box', 'simple'],
			description: "'box' (default) toont elke toets als keycap; 'simple' toont de toetsen als platte tekst — lichter, voor inline gebruik zoals in een menu",
			table: {
				defaultValue: { summary: 'box' },
			},
		},
		color: {
			control: 'select',
			options: ['neutral', 'inherit'],
			description: "'neutral' (default) gebruikt de eigen kleuren; 'inherit' volgt de omringende tekstkleur (currentColor) met een doorschijnende contrast-vulling",
			table: {
				defaultValue: { summary: 'neutral' },
			},
		},
		alwaysVisible: {
			name: 'always-visible',
			control: 'boolean',
			description: 'Toon ook op touch-only devices waar shortcuts niet aanroepbaar zijn',
			table: {
				defaultValue: { summary: 'false' },
			},
		},
		keys: {
			control: 'text',
			description: 'Toetsen gescheiden door +',
		},
		macKeys: {
			name: 'mac-keys',
			control: 'text',
			description: 'Optionele override voor macOS (incl. iPhone/iPad/iPod)',
		},
		windowsKeys: {
			name: 'windows-keys',
			control: 'text',
			description: 'Optionele override voor Windows',
		},
		linuxKeys: {
			name: 'linux-keys',
			control: 'text',
			description: 'Optionele override voor Linux/ChromeOS',
		},
	},
	args: {
		size: 'md',
		variant: 'box',
		color: 'neutral',
		alwaysVisible: false,
		keys: 'Ctrl+K',
		macKeys: '',
		windowsKeys: '',
		linuxKeys: '',
	},
};

const Template = ({ size, variant, color, alwaysVisible, keys, macKeys, windowsKeys, linuxKeys }: Record<string, any>) => html`
	<nldd-keyboard-shortcut
		size=${size}
		variant=${variant}
		color=${color || nothing}
		?always-visible=${alwaysVisible}
		keys=${keys}
		mac-keys=${macKeys || nothing}
		windows-keys=${windowsKeys || nothing}
		linux-keys=${linuxKeys || nothing}
	></nldd-keyboard-shortcut>
`;

export const Standaard = {
	render: Template,
	args: {
		keys: 'Ctrl+K',
	},
};

export const VeelgebruikteSneltoetsen = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
			<nldd-keyboard-shortcut keys="Cmd+K"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut keys="Ctrl+C"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut keys="Ctrl+Shift+P"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut keys="⌘+⇧+F"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut keys="Esc"></nldd-keyboard-shortcut>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-keyboard-shortcut size="md" keys="Cmd+K"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut size="sm" keys="Cmd+K"></nldd-keyboard-shortcut>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const SchaaltMee = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
			<span style="font-size: 14px;">Druk <nldd-keyboard-shortcut size="inherit" keys="Ctrl+K" mac-keys="Cmd+K"></nldd-keyboard-shortcut> om te zoeken (14px).</span>
			<span style="font-size: 20px;">Druk <nldd-keyboard-shortcut size="inherit" keys="Ctrl+K" mac-keys="Cmd+K"></nldd-keyboard-shortcut> om te zoeken (20px).</span>
			<span style="font-size: 14px;">Of als tekst: <nldd-keyboard-shortcut size="inherit" variant="simple" keys="Ctrl+K" mac-keys="Cmd+K"></nldd-keyboard-shortcut>.</span>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: '`size="inherit"` schaalt mee met de font-size van de omringende tekst — de box-keycaps in em, de simple-variant als platte tekst.' } },
	},
};

export const Varianten = {
	render: () => html`
		<div style="display: flex; gap: 24px; align-items: center;">
			<nldd-keyboard-shortcut variant="box" keys="Cmd+K"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut variant="simple" keys="Cmd+K"></nldd-keyboard-shortcut>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: '`variant="box"` (default, keycaps) naast `variant="simple"` (platte tekst — lichter, voor inline gebruik zoals in een menu).' } },
	},
};

export const KleurInherit = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center; padding: 16px; border-radius: 8px; background: var(--semantics-categories-donkerblauw-reference-background-color); color: var(--semantics-categories-donkerblauw-reference-content-color);">
			<nldd-keyboard-shortcut color="inherit" keys="Cmd+K"></nldd-keyboard-shortcut>
			<nldd-keyboard-shortcut color="inherit" keys="Ctrl+Shift+P"></nldd-keyboard-shortcut>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: '`color="inherit"` laat de toetsen en scheidingstekens de omringende tekstkleur volgen (currentColor) — hier wit op een donkerblauw vlak. De toetsen worden een omtrek in die kleur.' } },
	},
};

export const Mac = {
	render: () => html`
		<nldd-keyboard-shortcut
			debug-os="mac"
			keys="Ctrl+K"
			mac-keys="⌘+K"
			windows-keys="Ctrl+K"
			linux-keys="Ctrl+K"
		></nldd-keyboard-shortcut>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Per-instance `debug-os="mac"` override — toont `mac-keys`.' } },
	},
};

export const Windows = {
	render: () => html`
		<nldd-keyboard-shortcut
			debug-os="windows"
			keys="Ctrl+K"
			mac-keys="⌘+K"
			windows-keys="Ctrl+K"
			linux-keys="Ctrl+K"
		></nldd-keyboard-shortcut>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Per-instance `debug-os="windows"` override — toont `windows-keys`.' } },
	},
};

export const Linux = {
	render: () => html`
		<nldd-keyboard-shortcut
			debug-os="linux"
			keys="Ctrl+K"
			mac-keys="⌘+K"
			windows-keys="Ctrl+K"
			linux-keys="Ctrl+K"
		></nldd-keyboard-shortcut>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Per-instance `debug-os="linux"` override — toont `linux-keys`.' } },
	},
};
