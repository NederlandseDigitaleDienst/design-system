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
 * <nldd-split-button text="Opslaan"></nldd-split-button>
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
		variant: {
			control: 'select',
			options: ['neutral-tinted', 'neutral-base', 'secondary', 'accent-filled', 'primary'],
			description: 'Button variant',
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
		disabled: {
			control: 'boolean',
			description: 'Disabled state',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		variant: 'neutral-tinted',
		size: 'md',
		width: '',
		text: 'Opslaan',
		icon: '',
		disabled: false,
	},
};

const menu = html`
	<nldd-menu>
		<nldd-menu-item text="Opslaan als…" @select=${action('select: save-as')}></nldd-menu-item>
		<nldd-menu-item text="Opslaan en sluiten" @select=${action('select: save-and-close')}></nldd-menu-item>
		<nldd-menu-divider></nldd-menu-divider>
		<nldd-menu-item text="Verwijderen" @select=${action('select: delete')}></nldd-menu-item>
	</nldd-menu>
`;

const Template = ({ variant, size, width, text, icon, disabled }: Record<string, any>) => html`
	<nldd-split-button
		variant=${variant}
		size=${size}
		width=${width || nothing}
		text=${text}
		icon=${icon || nothing}
		?disabled=${disabled}
		@action-click=${action('action-click')}
		@menu-click=${action('menu-click')}
	>${menu}</nldd-split-button>
`;

export const Standaard = {
	render: Template,
	args: {},
};

// All variants overview
export const Varianten = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-split-button text="Opslaan" variant="primary">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" variant="secondary">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" variant="neutral-base">${menu}</nldd-split-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Start icon
export const MetStartIcon = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-split-button text="Opslaan" icon="check-mark" variant="primary">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" icon="check-mark" variant="secondary">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" icon="check-mark" variant="neutral-base">${menu}</nldd-split-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

// All sizes overview
export const Grootten = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-split-button text="Opslaan" size="lg">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" size="md">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" size="sm">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" size="xs">${menu}</nldd-split-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Full width — the main action button fills the available space
export const VolleBreedte = {
	name: 'Volle breedte',
	render: () => html`
	<nldd-split-button text="Opslaan" width="full">${menu}</nldd-split-button>
`,
	parameters: {
		controls: { disable: true },
	},
};

// Disabled
export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-split-button text="Opslaan" disabled size="md">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" disabled size="sm">${menu}</nldd-split-button>
		<nldd-split-button text="Opslaan" disabled size="xs">${menu}</nldd-split-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * De chevron slikt ook een `nldd-popover` in plaats van een menu: dezelfde
 * auto-wiring (ankeren + togglen), maar met vrije content. Zonder overlay
 * vuurt de chevron nog steeds `menu-click`.
 */
export const MetPopover = {
	render: () => html`
		<nldd-split-button
			text="Delen"
			icon="share"
			@action-click=${action('action-click')}
			@menu-click=${action('menu-click')}
		>
			<nldd-popover accessible-label="Deelopties" width="280px">
				<nldd-container padding="16" gap="8">
					<nldd-title
						size="6"
						text="Deel deze pagina"
						heading-level="2"
					></nldd-title>
					<nldd-rich-text>
						<p>Kies hoe je deze pagina wilt delen met anderen.</p>
					</nldd-rich-text>
					<nldd-button variant="primary" text="Kopieer link"></nldd-button>
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
