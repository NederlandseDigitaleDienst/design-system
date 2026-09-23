import { html, nothing } from 'lit';
import './icon-button.js';
import '../menu/menu.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import { ICONS } from './../../content/icon/icon.js';

/**
 * De Icon Button component is een vierkante knop voor icoon-only acties.
 *
 * ## Gebruik
 * ```html
 * <nldd-icon-button text="Annuleer" icon="dismiss"></nldd-icon-button>
 * ```
 */
export default {
	title: 'Components/Actions/Icon Button',
	component: 'nldd-icon-button',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/actions/icon-button/icon-button.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'primary',
				'secondary',
				'destructive',
				'accent-filled',
				'accent-transparent',
				'neutral-tinted',
				'neutral-base',
				'neutral-transparent',
				'critical-tinted',
				'critical-transparent',
				'inherit-filled',
				'inherit-tinted',
			],
			description: 'Visuele stijlvariant',
			table: {
				defaultValue: { summary: 'neutral-tinted' },
			},
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
			description: 'Grootte van de knop',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		width: {
			control: 'text',
			description: 'Width mode: "full" (stretches to container) or any CSS length (e.g. "240px")',
		},
		hideLgText: {
			name: 'hide-lg-text',
			control: 'boolean',
			description: 'In lg-formaat: verbergt het tekstlabel en vergroot het icoon één stap (28px)',
			table: {
				defaultValue: { summary: 'false' },
			},
		},
		expandable: {
			name: 'expandable',
			control: 'boolean',
			description: 'Voegt een chevron toe om aan te geven dat deze knop een menu of popover opent',
			table: {
				defaultValue: { summary: false },
			},
		},
		expanded: {
			control: 'boolean',
			description: 'Geeft aan dat het popover/menu uitgeklapt is. Wordt geforward als aria-expanded op de inner button en activeert de is-expanded visuele state.',
			table: {
				defaultValue: { summary: false },
			},
		},
		popupType: {
			name: 'popup-type',
			control: 'select',
			options: ['(geen)', 'menu', 'listbox', 'dialog', 'tree', 'grid'],
			mapping: { '(geen)': '' },
			description: 'Type popup-container dat deze knop opent. Zet aria-haspopup op de inner button en zorgt dat aria-expanded altijd aanwezig is (true/false) zodat screenreaders de popup-staat kennen.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		text: {
			control: 'text',
			description: 'Tekst die als aria-label en title tooltip wordt gebruikt, en zichtbaar is als label onder het icoon in lg formaat',
		},
		icon: {
			control: 'select',
			options: ICONS,
			description: 'Icoon naam voor nldd-icon',
			table: {
				defaultValue: { summary: 'icon-placeholder' },
			},
		},
		type: {
			control: 'select',
			options: ['button', 'submit', 'reset'],
			description: 'Type attribuut voor formulierverwerking',
			table: {
				defaultValue: { summary: 'button' },
			},
		},
		href: {
			control: 'text',
			description: 'Wanneer gezet, wordt het element als link gerenderd in plaats van het opgegeven type',
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			mapping: { '(geen)': '' },
			description: 'Link target (alleen gebruikt als href is gezet)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Overschrijft de tekst als aria-label en title tooltip voor schermlezer-context. Gebruik als de zichtbare tekst onvoldoende context biedt (bijv. tekst "Toon", accessible-label "Toon wachtwoord"). De tekst blijft zichtbaar in lg formaat.',
		},
		tooltipTiming: {
			name: 'tooltip-timing',
			control: 'select',
			options: ['delay', 'instant', 'never'],
			description: 'Forwarded naar de inner nldd-tooltip `timing`. `never` onderdrukt de visuele tooltip (aria-label blijft intact). Gebruik `never` wanneer de context al duidelijk is (bv. spin-knoppen in nldd-number-field, chevron in nldd-split-button).',
			table: {
				defaultValue: { summary: 'delay' },
			},
		},
		loading: {
			control: 'boolean',
			description: 'Laad-toestand: toont een activity indicator over het verborgen icoon, zet aria-busy en blokkeert activatie (knop blijft focusbaar).',
			table: {
				defaultValue: { summary: false },
			},
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		variant: 'neutral-tinted',
		size: 'md',
		width: '',
		hideLgText: false,
		expandable: false,
		expanded: false,
		popupType: '',
		text: 'Annuleer',
		icon: 'dismiss',
		type: 'button',
		href: '',
		target: '',
		accessibleLabel: '',
		tooltipTiming: 'delay',
		loading: false,
		disabled: false,
	},
};

const Template = ({ variant, size, width, hideLgText, expandable, expanded, popupType, text, icon, type, href, target, accessibleLabel, tooltipTiming, loading, disabled }: Record<string, any>) => html`
	<nldd-icon-button
		variant=${variant}
		size=${size}
		width=${width || nothing}
		?hide-lg-text=${hideLgText}
		icon=${icon}
		text=${text}
		popup-type=${popupType || nothing}
		?expandable=${expandable}
		?expanded=${expanded}
		type=${type}
		href=${href || nothing}
		target=${target || nothing}
		?loading=${loading}
		?disabled=${disabled}
		accessible-label=${accessibleLabel || nothing}
		tooltip-timing=${tooltipTiming || nothing}
	></nldd-icon-button>
`;

export const Standaard = {
	render: Template,
	args: {
		icon: 'dismiss',
		text: 'Annuleer',
	},
};

export const VariantenNaarRol = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button variant="primary" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="secondary" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="destructive" icon="delete" text="Verwijder"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Role based buttons zijn aliases van de appearance based buttons.',
			},
	},
},
};

export const VariantenNaarUiterlijk = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button variant="accent-filled" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="accent-transparent" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="neutral-tinted" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="neutral-base" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="neutral-transparent" icon="add" text="Voeg toe"></nldd-icon-button>
		<nldd-icon-button variant="critical-tinted" icon="delete" text="Verwijder"></nldd-icon-button>
		<nldd-icon-button variant="critical-transparent" icon="delete" text="Verwijder"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

export const Grootten = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button size="lg" icon="dismiss" text="Annuleer"></nldd-icon-button>
		<nldd-icon-button size="md" icon="dismiss" text="Annuleer"></nldd-icon-button>
		<nldd-icon-button size="sm" icon="dismiss" text="Annuleer"></nldd-icon-button>
		<nldd-icon-button size="xs" icon="dismiss" text="Annuleer"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

export const GrootteLg = {
	name: 'Grootte lg',
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button size="lg" icon="download" text="Download"></nldd-icon-button>
		<nldd-icon-button size="lg" icon="global-settings" text="Instellingen"></nldd-icon-button>
		<nldd-icon-button size="lg" icon="search" text="Zoeken"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icon button in lg formaat toont automatisch de tekst als label onder het icoon.',
			},
	},
},
};

export const MetAccessibleLabel = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button icon="eye" text="Toon" accessible-label="Toon wachtwoord"></nldd-icon-button>
		<nldd-icon-button icon="eye-slash" text="Verberg" accessible-label="Verberg wachtwoord"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik <code>accessible-label</code> als de zichtbare tekst onvoldoende context biedt voor schermlezers. De zichtbare tekst blijft ongewijzigd.',
			},
	},
},
};

export const MetExpandable = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button expandable size="lg" icon="global-settings" text="Instellingen"></nldd-icon-button>
		<nldd-icon-button expandable size="md" icon="global-settings" text="Instellingen"></nldd-icon-button>
		<nldd-icon-button expandable size="sm" icon="global-settings" text="Instellingen"></nldd-icon-button>
		<nldd-icon-button expandable size="xs" icon="global-settings" text="Instellingen"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icon button die een menu of popover opent. Gebruik de <code>expandable</code> attribute om aan te geven dat deze button een menu of popover toont.',
			},
	},
},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button disabled variant="accent-filled" icon="delete" text="Verwijderen"></nldd-icon-button>
		<nldd-icon-button disabled variant="neutral-tinted" icon="delete" text="Verwijderen"></nldd-icon-button>
		<nldd-icon-button disabled variant="critical-tinted" icon="delete" text="Verwijderen"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

export const ToestandLoading = {
	name: 'Toestand loading',
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button loading variant="primary" icon="download" text="Opslaan"></nldd-icon-button>
		<nldd-icon-button loading variant="neutral-tinted" icon="download" text="Opslaan"></nldd-icon-button>
		<nldd-icon-button loading size="lg" icon="download" text="Download"></nldd-icon-button>
		<nldd-icon-button loading size="sm" icon="dismiss" text="Annuleer"></nldd-icon-button>
		<nldd-icon-button loading size="xs" icon="dismiss" text="Annuleer"></nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Laad-toestand via het <code>loading</code> attribuut: een activity indicator verschijnt over het verborgen icoon, de knop krijgt <code>aria-busy</code> en activatie is geblokkeerd terwijl de knop focusbaar blijft.',
			},
		},
	},
};

export const EigenIcoonInDeSlot = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-icon-button text="Custom">
			<svg slot="icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<circle cx="10" cy="10" r="8"/>
			</svg>
		</nldd-icon-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik de <code>icon</code> slot om een custom SVG icoon te plaatsen in plaats van het <code>icon</code> attribute.',
			},
	},
},
};

/**
 * Het klassieke overflow-menu ("kebab"): slot een enkele `nldd-menu` (of
 * `nldd-popover`) in de `popup`-slot en de icon-button ankert en togglet 'm
 * automatisch — geen `id`/`anchor`-koppeling. De overlay synct `expanded` en
 * `aria-haspopup` terug op de knop. Gespiegeld aan `nldd-split-button`.
 */
export const MetMenu = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-icon-button icon="ellipsis" text="Meer acties">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Bewerken" icon="pencil"></nldd-menu-item>
					<nldd-menu-item text="Dupliceren" icon="square-plus-on-square"></nldd-menu-item>
					<nldd-menu-divider></nldd-menu-divider>
					<nldd-menu-item text="Verwijderen" icon="trash" destructive></nldd-menu-item>
				</nldd-menu>
			</nldd-icon-button>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Overflow-menu via de <code>popup</code>-slot: de icon-button ankert en togglet het menu automatisch, zonder <code>id</code>/<code>anchor</code>-boilerplate.',
			},
		},
	},
};

/**
 * Dezelfde `popup`-slot slikt ook een `nldd-popover` voor vrije content. De
 * icon-button ankert en togglet 'm identiek; content-klikken sluiten 'm niet.
 * Geef de popover altijd een `accessible-label`.
 */
export const MetPopover = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-icon-button icon="info-circle" text="Info">
				<nldd-popover slot="popup" accessible-label="Toelichting" width="280px">
					<nldd-container padding="16" gap="8">
						<nldd-title size="6"
							text="Zorgtoeslag"
							heading-level="2"
						></nldd-title>
						<nldd-rich-text>
							<p>Een tegemoetkoming in de kosten van je zorgverzekering, afhankelijk van je inkomen.</p>
						</nldd-rich-text>
					</nldd-container>
				</nldd-popover>
			</nldd-icon-button>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Genest popover via de <code>popup</code>-slot: zelfde auto-wiring als een menu, maar met vrije content die klikbaar blijft.',
			},
		},
	},
};
