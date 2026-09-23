import { html, nothing } from 'lit';
import './button.js';
import '../button-group/button-group.js';
import '../menu/menu.js';
import '../../layout/popover/popover.js';
import '../../layout/container/container.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import { ICONS } from './../../content/icon/icon.js';

/**
 * De Button component is het primaire interactie-element voor gebruikersacties.
 *
 * ## Gebruik
 * ```html
 * <nldd-button text="Titel"></nldd-button>
 * <nldd-button text="Download" start-icon="download"></nldd-button>
 * ```
 */
export default {
	title: 'Components/Actions/Button',
	component: 'nldd-button',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/actions/button/button.ts',
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
			description: 'Grootte van de knop. "lg" gebruikt groter font en 24px start/end-iconen.',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['left', 'center', 'right'],
			description: 'Horizontale uitlijning van de content. Vooral zichtbaar bij width="full" of een vaste breedte.',
			table: {
				defaultValue: { summary: 'center' },
			},
		},
		width: {
			control: 'text',
			description: 'Width mode: "full" (stretches to container) or any CSS length (e.g. "240px")',
		},
		maxWidth: {
			name: 'max-width',
			control: 'text',
			description: 'Maximale breedte (CSS-lengte, bijv. "320px"). Combineert met width="full": de knop volgt de container tot aan die grens. Tekst die niet past wordt afgekapt met een ellipsis.',
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
			description: 'Tekst van de knop',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst: onder de tekst (md/lg) of erachter (sm/xs), in een secundaire kleur. Telt mee in de toegankelijke naam.',
		},
		singleLine: {
			name: 'single-line',
			control: 'boolean',
			description: 'Knipt overlopende tekst af met ellipsis in plaats van te wrappen. Vereist dat de knop (of een ancestor) een max-width oplegt.',
			table: { defaultValue: { summary: false } },
		},
		startIcon: {
			name: 'start-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon voor de tekst',
			table: {
				defaultValue: { summary: '(geen)' },
			},
		},
		endIcon: {
			name: 'end-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon na de tekst',
			table: {
				defaultValue: { summary: '(geen)' },
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
			description: 'Toegankelijk label voor screen readers',
		},
		loading: {
			control: 'boolean',
			description: 'Laad-toestand: toont een activity indicator over de verborgen content, zet aria-busy en blokkeert activatie (knop blijft focusbaar).',
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
		horizontalAlignment: 'center',
		width: '',
		maxWidth: '',
		expandable: false,
		expanded: false,
		popupType: '',
		text: 'Button',
		supportingText: '',
		singleLine: false,
		startIcon: '',
		endIcon: '',
		type: 'button',
		href: '',
		target: '',
		accessibleLabel: '',
		loading: false,
		disabled: false,
	},
};

const Template = ({ variant, size, horizontalAlignment, width, maxWidth, expandable, expanded, popupType, text, supportingText, singleLine, startIcon, endIcon, type, href, target, accessibleLabel, loading, disabled }: Record<string, any>) => html`
	<nldd-button
		variant=${variant}
		size=${size}
		horizontal-alignment=${horizontalAlignment}
		width=${width || nothing}
		max-width=${maxWidth || nothing}
		type=${type}
		text=${text}
		supporting-text=${supportingText || nothing}
		href=${href || nothing}
		target=${target || nothing}
		start-icon=${startIcon || nothing}
		end-icon=${endIcon || nothing}
		popup-type=${popupType || nothing}
		accessible-label=${accessibleLabel || nothing}
		?expandable=${expandable}
		?expanded=${expanded}
		?single-line=${singleLine}
		?loading=${loading}
		?disabled=${disabled}
	></nldd-button>
`;

export const Standaard = {
	render: Template,
	args: {
		text: 'Button',
	},
};

export const HorizontaleUitlijning = {
	name: 'Horizontale uitlijning (volle breedte)',
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px; width: 320px;">
			<nldd-button width="full" horizontal-alignment="left" text="Links" start-icon="download"></nldd-button>
			<nldd-button width="full" horizontal-alignment="center" text="Midden" start-icon="download"></nldd-button>
			<nldd-button width="full" horizontal-alignment="right" text="Rechts" start-icon="download"></nldd-button>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MetSupportingText = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
			<nldd-button horizontal-alignment="left" size="lg" text="Opslaan" supporting-text="Alle wijzigingen" start-icon="download"></nldd-button>
			<nldd-button horizontal-alignment="left" size="md" text="Opslaan" supporting-text="Alle wijzigingen" start-icon="download"></nldd-button>
			<nldd-button horizontal-alignment="left" size="sm" text="Opslaan" supporting-text="3 items" start-icon="download"></nldd-button>
			<nldd-button horizontal-alignment="left" size="xs" text="Opslaan" supporting-text="3 items" start-icon="download"></nldd-button>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const VariantenNaarRol = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button variant="primary" text="Primary"></nldd-button>
		<nldd-button variant="secondary" text="Secondary"></nldd-button>
		<nldd-button variant="destructive" text="Destructive"></nldd-button>
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
		<nldd-button variant="accent-filled" text="Accent Filled"></nldd-button>
		<nldd-button variant="accent-transparent" text="Accent Transparent"></nldd-button>
		<nldd-button variant="neutral-tinted" text="Neutral Tinted"></nldd-button>
		<nldd-button variant="neutral-base" text="Neutral Base"></nldd-button>
		<nldd-button variant="neutral-transparent" text="Neutral Transparent"></nldd-button>
		<nldd-button variant="critical-tinted" text="Critical Tinted"></nldd-button>
		<nldd-button variant="critical-transparent" text="Critical Transparent"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

export const Grootten = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button size="lg" text="Large"></nldd-button>
		<nldd-button size="md" text="Medium"></nldd-button>
		<nldd-button size="sm" text="Small"></nldd-button>
		<nldd-button size="xs" text="Extra Small"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetStartIcon = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button size="lg" text="Download" start-icon="download"></nldd-button>
		<nldd-button size="md" text="Download" start-icon="download"></nldd-button>
		<nldd-button size="sm" text="Download" start-icon="download"></nldd-button>
		<nldd-button size="xs" text="Download" start-icon="download"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Button met een icoon aan de linkerkant via het <code>start-icon</code> attribute.',
			},
		},
	},
};

export const MetEndIcon = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button size="lg" text="Volgende" end-icon="arrow-right"></nldd-button>
		<nldd-button size="md" text="Volgende" end-icon="arrow-right"></nldd-button>
		<nldd-button size="sm" text="Volgende" end-icon="arrow-right"></nldd-button>
		<nldd-button size="xs" text="Volgende" end-icon="arrow-right"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Button met een icoon aan de rechterkant via het <code>end-icon</code> attribute.',
			},
		},
	},
};

export const MetBeideIconen = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button size="lg" text="Download bestand" start-icon="download" end-icon="arrow-right"></nldd-button>
		<nldd-button size="md" text="Download bestand" start-icon="download" end-icon="arrow-right"></nldd-button>
		<nldd-button size="sm" text="Download bestand" start-icon="download" end-icon="arrow-right"></nldd-button>
		<nldd-button size="xs" text="Download bestand" start-icon="download" end-icon="arrow-right"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Button met zowel een start als end icoon via de <code>start-icon</code> en <code>end-icon</code> attributes.',
			},
		},
	},
};

export const MetExpandable = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button expandable size="lg" text="Opties"></nldd-button>
		<nldd-button expandable size="md" text="Opties"></nldd-button>
		<nldd-button expandable size="sm" text="Opties"></nldd-button>
		<nldd-button expandable size="xs" text="Opties"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Button die een menu of popover opent. Gebruik de <code>expandable</code> attribute om aan te geven dat deze button een menu of popover opent.',
			},
		},
	},
};

/**
 * Slot een enkele `nldd-menu` (of `nldd-popover`) in de `popup`-slot en de
 * button wordt zijn invoker: hij ankert de overlay aan zichzelf en togglet 'm
 * op klik — geen handmatige `id`/`anchor`-koppeling. De overlay synct
 * `expanded` en `aria-haspopup` terug op de button; voeg `expandable` toe voor
 * de chevron. Gespiegeld aan `nldd-split-button`. De bestaande
 * `anchor`/`popovertarget`-route blijft werken wanneer je géén overlay slot.
 */
export const MetMenu = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button expandable text="Acties">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Bewerken" icon="pencil"></nldd-menu-item>
					<nldd-menu-item text="Dupliceren" icon="square-plus-on-square"></nldd-menu-item>
					<nldd-menu-divider></nldd-menu-divider>
					<nldd-menu-item text="Verwijderen" icon="trash" destructive></nldd-menu-item>
				</nldd-menu>
			</nldd-button>
			<nldd-button expandable variant="primary" start-icon="plus" text="Nieuw">
				<nldd-menu slot="popup">
					<nldd-menu-item text="Document" icon="file"></nldd-menu-item>
					<nldd-menu-item text="Map" icon="folder"></nldd-menu-item>
				</nldd-menu>
			</nldd-button>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Genest menu via de <code>popup</code>-slot: de button ankert en togglet het menu automatisch, zonder <code>id</code>/<code>anchor</code>-boilerplate.',
			},
		},
	},
};

/**
 * Dezelfde `popup`-slot slikt ook een `nldd-popover` voor vrije content
 * (tekst, een form). De button ankert en togglet 'm identiek; klikken in de
 * popover-content sluit 'm niet (in tegenstelling tot een menu-item). Geef de
 * popover altijd een `accessible-label`.
 */
export const MetPopover = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button expandable text="Info">
				<nldd-popover slot="popup" accessible-label="Toelichting" width="280px">
					<nldd-container padding="16" gap="8">
						<nldd-title
							size="6"
							text="Zorgtoeslag"
							heading-level="2"
						></nldd-title>
						<nldd-rich-text>
							<p>Een tegemoetkoming in de kosten van je zorgverzekering, afhankelijk van je inkomen.</p>
						</nldd-rich-text>
						<nldd-button variant="primary" text="Meer lezen"></nldd-button>
					</nldd-container>
				</nldd-popover>
			</nldd-button>
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

export const ToestandLoading = {
	name: 'Toestand loading',
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button loading size="lg" variant="primary" text="Opslaan" start-icon="download"></nldd-button>
		<nldd-button loading variant="primary" text="Opslaan"></nldd-button>
		<nldd-button loading variant="neutral-tinted" text="Opslaan" start-icon="download"></nldd-button>
		<nldd-button loading variant="critical-tinted" text="Verwijderen"></nldd-button>
		<nldd-button loading size="sm" text="Klein"></nldd-button>
		<nldd-button loading size="xs" text="Mini"></nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Laad-toestand via het <code>loading</code> attribuut: een activity indicator verschijnt over de verborgen content (geen breedte-sprong), de knop krijgt <code>aria-busy</code> en activatie is geblokkeerd terwijl de knop focusbaar blijft. De cirkel erft per variant de tekstkleur via <code>currentColor</code>.',
			},
		},
	},
};

export const EigenIcoonInDeSlot = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button text="Custom start">
			<svg slot="start-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<circle cx="10" cy="10" r="8"/>
			</svg>
		</nldd-button>
		<nldd-button text="Custom end">
			<svg slot="end-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<polygon points="10,2 18,18 2,18"/>
			</svg>
		</nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik de <code>start-icon</code> en <code>end-icon</code> slots om custom SVG iconen te plaatsen in plaats van de icon attributes.',
			},
		},
	},
};

export const TekstInDeSlot = {
	render: () => html`
	<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
		<nldd-button>
			<span slot="text">Tekst met <strong>nadruk</strong></span>
		</nldd-button>
		<nldd-button variant="secondary" accessible-label="Prijs 15 euro, was 20 euro">
			<span slot="text">Prijs <span style="text-decoration: line-through;">€20</span> €15</span>
		</nldd-button>
	</div>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik de <code>text</code> slot wanneer de knoptekst meer dan platte tekst nodig heeft (inline markup). Het <code>text</code> attribuut heeft voorrang; zet <code>accessible-label</code> wanneer de inhoud geen leesbare platte tekst is.',
			},
		},
	},
};

/**
 * De inherit-varianten leiden hun kleuren af van `currentColor` en zijn
 * bedoeld voor gekleurde vlakken (zoals de hero-main of filled-categories).
 * `inherit-filled` gebruikt de vlakkleur als labelkleur wanneer het vlak
 * `--context-parent-background-color` cascadet (zoals de hero doet); zonder
 * die context valt het label terug op een wit/zwart-contrastflip — zie het
 * derde vlak.
 */
export const OpKleurvlak = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); --context-parent-background-color: var(--semantics-categories-donkerblauw-filled-background-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-button-group orientation="horizontal">
					<nldd-button
						variant="inherit-filled"
						text="Inherit filled"
						supporting-text="Met ondertekst"
					></nldd-button>
					<nldd-button
						variant="inherit-tinted"
						text="Inherit tinted"
					></nldd-button>
					<nldd-button
						variant="inherit-filled"
						text="Open"
						expandable
						expanded
					></nldd-button>
					<nldd-button
						variant="inherit-tinted"
						text="Open"
						expandable
						expanded
					></nldd-button>
				</nldd-button-group>
			</div>
			<div style="background: var(--semantics-categories-oranje-filled-background-color); color: var(--semantics-categories-oranje-filled-content-color); --context-parent-background-color: var(--semantics-categories-oranje-filled-background-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-button-group orientation="horizontal">
					<nldd-button
						variant="inherit-filled"
						text="Inherit filled"
					></nldd-button>
					<nldd-button
						variant="inherit-tinted"
						text="Inherit tinted"
					></nldd-button>
				</nldd-button-group>
			</div>
			<div style="background: oklch(0.45 0.12 300); color: oklch(1 0 0); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-button-group orientation="horizontal">
					<nldd-button
						variant="inherit-filled"
						text="Zonder context (flip)"
					></nldd-button>
					<nldd-button
						variant="inherit-tinted"
						text="Inherit tinted"
					></nldd-button>
				</nldd-button-group>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
