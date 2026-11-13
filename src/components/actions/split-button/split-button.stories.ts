import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './split-button.js';
import '../../actions/menu/menu.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import { ICONS } from '../../content/icon/icon.js';

/**
 * De Split Button combineert een primaire actieknop met een dropdown trigger.
 *
 * ## Gebruik
 * ```html
 * <nldd-split-button text="Bewaar">
 *   <nldd-menu slot="popup">…</nldd-menu>
 * </nldd-split-button>
 * ```
 */
export default {
	title: 'Components/Actions/Split Button',
	component: 'nldd-split-button',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/actions/split-button/split-button.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		appearance: {
			control: 'select',
			options: ['primary', 'secondary', 'accent-filled', 'neutral-tinted', 'neutral-base', 'content-filled', 'content-tinted'],
			description: 'Visuele stijl, inclusief kleur',
			table: {
				defaultValue: { summary: 'neutral-tinted' },
			},
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
			description: 'Button size',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		width: {
			control: 'text',
			description: "Breedte: 'full' of een CSS-lengte (bijv. '320px'). De actieknop vult de ruimte op.",
		},
		text: {
			control: 'text',
			description: 'Tekst van de primaire actieknop',
		},
		icon: {
			control: 'select',
			options: ['', ...ICONS],
			description: 'Icoonnaam links van de tekst op de primaire actieknop',
		},
		shortcut: {
			control: 'text',
			description: 'Sneltoets achter de tekst van de hoofdactie, bijvoorbeeld `Ctrl+S`. Alleen weergave: de toets zelf koppel je in je app.',
		},
		shortcutMac: {
			name: 'shortcut-mac',
			control: 'text',
			description: 'Sneltoets op macOS (en iOS), als die afwijkt van `shortcut`.',
		},
		shortcutWindows: {
			name: 'shortcut-windows',
			control: 'text',
			description: 'Sneltoets op Windows, als die afwijkt van `shortcut`.',
		},
		shortcutLinux: {
			name: 'shortcut-linux',
			control: 'text',
			description: 'Sneltoets op Linux en ChromeOS, als die afwijkt van `shortcut`.',
		},
		popovertarget: {
			control: false,
			description: 'Id van een `nldd-menu` of `nldd-popover` elders op de pagina dat de chevron opent en naast zich neerzet. Een overlay in de `popup`-slot wint.',
		},
		type: {
			control: 'select',
			options: ['button', 'submit', 'reset'],
			description: 'Wat de hoofdactie in een formulier doet',
			table: {
				defaultValue: { summary: 'button' },
			},
		},
		href: {
			control: 'text',
			description: 'Maakt van de hoofdactie een link',
		},
		download: {
			control: 'select',
			options: ['(geen)', 'download', 'download="aanvraag-A-1042.pdf"'],
			mapping: { '(geen)': null, download: '', 'download="aanvraag-A-1042.pdf"': 'aanvraag-A-1042.pdf' },
			description: 'Slaat het bestand op in plaats van het te openen (alleen met href); een waarde wordt de bestandsnaam',
		},
		loading: {
			control: 'boolean',
			description: 'Laadtoestand van de hoofdactie; de chevron blijft bruikbaar',
			table: {
				defaultValue: { summary: false },
			},
		},
		loadingText: {
			name: 'loading-text',
			control: 'text',
			description: 'Wat de schermlezer aankondigt tijdens loading, zoals "Aan het bewaren"',
			table: { defaultValue: { summary: 'Laden' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Disabled state',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		appearance: 'neutral-tinted',
		size: 'md',
		width: '',
		text: 'Bewaar',
		icon: '',
		shortcut: '',
		shortcutMac: '',
		shortcutWindows: '',
		shortcutLinux: '',
		popovertarget: '',
		type: 'button',
		href: '',
		download: '(geen)',
		loading: false,
		loadingText: '',
		disabled: false,
	},
};

const menu = html`
	<nldd-menu slot="popup">
		<nldd-menu-item
			text="Opslaan als…"
			@select=${action('select: save-as')}
		></nldd-menu-item>
		<nldd-menu-item
			text="Bewaar en sluit"
			@select=${action('select: save-and-close')}
		></nldd-menu-item>
		<nldd-menu-divider></nldd-menu-divider>
		<nldd-menu-item
			destructive
			text="Verwijderen"
			@select=${action('select: delete')}
		></nldd-menu-item>
	</nldd-menu>
`;

const Template = ({ appearance, size, width, text, icon, shortcut, shortcutMac, shortcutWindows, shortcutLinux, type, href, download, loading, loadingText, disabled }: Record<string, any>) => html`
	<nldd-split-button
		appearance=${appearance}
		size=${size}
		width=${width || nothing}
		text=${text}
		icon=${icon || nothing}
		shortcut=${shortcut || nothing}
		shortcut-mac=${shortcutMac || nothing}
		shortcut-windows=${shortcutWindows || nothing}
		shortcut-linux=${shortcutLinux || nothing}
		type=${type}
		href=${href || nothing}
		download=${download ?? nothing}
		?loading=${loading}
		loading-text=${loadingText || nothing}
		?disabled=${disabled}
		@action-click=${action('action-click')}
	>${menu}</nldd-split-button>
`;

export const Standaard = {
	render: Template,
	args: {},
};

// All appearances overview
export const Appearances = {
	render: () => html`
	<nldd-container
		layout="wrap"
		gap="16"
	>
		<nldd-split-button text="Bewaar" appearance="primary">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" appearance="secondary">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" appearance="neutral-base">${menu}</nldd-split-button>
	</nldd-container>
`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * De content-appearances nemen hun kleuren van `--context-content-color` en zijn
 * bedoeld voor gekleurde vlakken. Bij `content-tinted` tekent de split-button het
 * doorschijnende vlak één keer; de knoppen erin laten het weg, zodat
 * het niet dubbel over elkaar valt.
 * Hover, active en expanded veranderen de kleur niet, zodat het contrast met
 * het label blijft wat het vlak eromheen geeft.
 */
export const OpKleurvlak = {
	render: () => html`
	<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); --context-background-color: var(--semantics-categories-donkerblauw-filled-background-color); padding: 24px; border-radius: var(--primitives-corner-radius-md); display: flex; flex-wrap: wrap; gap: 16px; align-items: center; --context-content-color: var(--semantics-categories-donkerblauw-filled-content-color);">
		<nldd-split-button text="Bewaar" appearance="content-filled">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" appearance="content-tinted">${menu}</nldd-split-button>
		<nldd-button appearance="content-tinted" text="Losse knop"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Start icon
export const MetStartIcon = {
	render: () => html`
	<nldd-container
		layout="wrap"
		gap="16"
	>
		<nldd-split-button text="Bewaar" icon="check-mark" appearance="primary">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" icon="check-mark" appearance="secondary">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" icon="check-mark" appearance="neutral-base">${menu}</nldd-split-button>
	</nldd-container>
`,
	parameters: {
		controls: { disable: true },
	},
};

// All sizes overview
export const Grootten = {
	render: () => html`
	<nldd-container
		layout="wrap"
		gap="16"
		vertical-alignment="center"
	>
		<nldd-split-button text="Bewaar" size="lg">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" size="md">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" size="sm">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" size="xs">${menu}</nldd-split-button>
	</nldd-container>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Full width — the main action button fills the available space
export const VolleBreedte = {
	name: 'Volle breedte',
	render: () => html`
	<nldd-split-button text="Bewaar" width="full">${menu}</nldd-split-button>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Disabled
export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<nldd-container
		layout="wrap"
		gap="16"
		vertical-alignment="center"
	>
		<nldd-split-button text="Bewaar" disabled size="md">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" disabled size="sm">${menu}</nldd-split-button>
		<nldd-split-button text="Bewaar" disabled size="xs">${menu}</nldd-split-button>
	</nldd-container>
`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * De chevron opent ook een `nldd-popover` in plaats van een menu: dezelfde
 * koppeling (ankeren en openen), maar met vrije inhoud.
 */
export const MetPopover = {
	render: () => html`
		<nldd-split-button
			text="Delen"
			icon="share"
			@action-click=${action('action-click')}
		>
			<nldd-popover
				slot="popup"
				accessible-label="Deelopties"
				width="280px"
			>
				<nldd-container
					padding="16"
					gap="8"
				>
					<nldd-title
						size="display-6"
						text="Deel deze pagina"
						heading-level="2"
					></nldd-title>
					<nldd-rich-text>
						<p>Kies hoe je deze pagina wilt delen met anderen.</p>
					</nldd-rich-text>
					<nldd-button
						appearance="primary"
						text="Kopieer link"
					></nldd-button>
				</nldd-container>
			</nldd-popover>
		</nldd-split-button>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Split-button met een genest <code>nldd-popover</code> in plaats van een menu; zelfde auto-wiring op de chevron.',
			},
		},
	},
};

/**
 * Staat het menu ergens anders, wijs het dan aan met `popovertarget`. De chevron
 * opent het en zet het naast zich neer, dus het menu heeft alleen een `id` nodig.
 */
export const MetPopovertarget = {
	name: 'Met popovertarget',
	render: () => html`
		<nldd-split-button
			text="Bewaar"
			popovertarget="bewaar-opties"
			@action-click=${action('action-click')}
		></nldd-split-button>
		<nldd-menu id="bewaar-opties">
			<nldd-menu-item text="Opslaan als…"></nldd-menu-item>
			<nldd-menu-item text="Bewaar en sluit"></nldd-menu-item>
		</nldd-menu>
	`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * De hoofdactie kan een download zijn, met de andere formaten in het menu.
 */
export const AlsDownload = {
	name: 'Als download',
	render: () => html`
		<nldd-split-button
			text="Download PDF"
			icon="download"
			href="#"
			download="aanvraag-a-1042.pdf"
		>
			<nldd-menu slot="popup">
				<nldd-menu-item text="Download als CSV"></nldd-menu-item>
				<nldd-menu-item text="Download als Excel"></nldd-menu-item>
			</nldd-menu>
		</nldd-split-button>
	`,
	parameters: {
		controls: { disable: true },
	},
};
