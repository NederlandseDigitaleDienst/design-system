import { html, nothing } from 'lit';
import './link.js';
import { ICONS } from './../../content/icon/icon.js';
import '../../layout/container/container.js';
import '../../content/text/text.js';
import '../../content/title/title.js';
import '../../layout/spacer/spacer.js';
import '../../layout/popover/popover.js';

/**
 * `nldd-link` werkt in twee modi:
 *
 * - **Sized** (`size="xs|sm|md|lg"`) — standalone link met vaste tekstgrootte,
 *   ondersteunt icons. Voor menu's, actiegebieden, overzichten.
 * - **Inherit** (geen `size`) — erft font-size, line-height en font-family van
 *   omgeving. Tekst wraps natuurlijk over regels. Voor links in lopende tekst,
 *   custom layouts of cells.
 *
 * Voor links in HTML-content (CMS, markdown) blijft `<nldd-rich-text>` met raw
 * `<a>` de juiste route — die styled `a` selectors via globale CSS.
 *
 * ## Gebruik
 * ```html
 * <!-- Standalone met expliciete grootte -->
 * <nldd-link
 * 	href="/pad"
 * 	size="md"
 * 	text="Voorwaarden voor dakisolatie"
 * ></nldd-link>
 * <nldd-link
 * 	href="https://example.com"
 * 	target="_blank"
 * 	size="md"
 * 	text="Warmtepompen vergelijken"
 * 	end-icon="arrow-up-right"
 * ></nldd-link>
 *
 * <!-- Inline in tekst, erft van parent -->
 * <p>Lees meer over de <nldd-link href="/voorwaarden">voorwaarden</nldd-link>.</p>
 * ```
 */
export default {
	title: 'Components/Navigation/Link',
	component: 'nldd-link',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/link/link.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['inherit', 'xs', 'sm', 'md', 'lg'],
			description: '`inherit` volgt de tekst eromheen en zet de link inline, zodat hij meeloopt in een alinea. `xs` tot `lg` leggen een maat vast en schakelen naar inline-flex. Icons werken in beide modi.',
			table: {
				defaultValue: { summary: 'inherit' },
			},
		},
		text: {
			control: 'text',
			description: 'Tekst van de link',
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
		href: {
			control: 'text',
			description: 'Link doel',
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			description: 'Link target (stelt rel automatisch bij voor _blank)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		download: {
			control: 'select',
			options: ['(geen)', 'download', 'download="aanvraag-A-1042.pdf"'],
			mapping: { '(geen)': null, download: '', 'download="aanvraag-A-1042.pdf"': 'aanvraag-A-1042.pdf' },
			description: 'Slaat het bestand op in plaats van het te openen (alleen met href); een waarde wordt de bestandsnaam',
		},
		interestfor: {
			control: false,
			description: 'Id van een `nldd-popover` elders op de pagina die laat zien waar de link heen gaat. Hij opent als je de aanwijzer op de link laat rusten, bij focus en bij lang drukken op touch. Een klik volgt de link gewoon. Zet de popover buiten de alinea: een `<p>` erin zou die sluiten.',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		accessibleDescription: {
			name: 'accessible-description',
			control: 'text',
			description: 'Toegankelijke beschrijving voor screen readers, gelezen na de naam, de rol en de toestand. Vervangt nooit het label.',
		},
		accessibleDescribedBy: {
			name: 'accessible-described-by',
			control: false,
			description: "Id's van elementen elders op de pagina die dit element beschrijven, zoals `aria-describedby`, maar doorgegeven aan de control binnenin. Gaat voor `accessible-description`.",
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		size: 'md',
		text: 'Voorwaarden voor dakisolatie',
		startIcon: '',
		endIcon: '',
		href: '#',
		target: '',
		download: '(geen)',
		accessibleLabel: '',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		disabled: false,
	},
};

const Template = ({ size, text, startIcon, endIcon, href, target, download, accessibleLabel, accessibleDescription, disabled }: Record<string, any>) => html`
	<nldd-link
		href=${href || nothing}
		target=${target || nothing}
		download=${download ?? nothing}
		size=${size || nothing}
		text=${text}
		start-icon=${startIcon || nothing}
		end-icon=${endIcon || nothing}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
		?disabled=${disabled}
	></nldd-link>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<nldd-container
			gap="8"
			horizontal-alignment="left"
		>
			<nldd-link
				href="#"
				size="lg"
				text="Voorwaarden voor dakisolatie"
			></nldd-link>
			<nldd-link
				href="#"
				size="md"
				text="Voorwaarden voor dakisolatie"
			></nldd-link>
			<nldd-link
				href="#"
				size="sm"
				text="Voorwaarden voor dakisolatie"
			></nldd-link>
			<nldd-link
				href="#"
				size="xs"
				text="Voorwaarden voor dakisolatie"
			></nldd-link>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const InLopendeTekst = {
	render: () => html`
		<nldd-container
			gap="24"
			max-width="560px"
		>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
					text="In een h2 — link erft display-grootte"
				></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-title size="display-2">
					<h2>Lees meer over <nldd-link href="#voorwaarden">de voorwaarden</nldd-link>.</h2>
				</nldd-title>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
					text="In body-md — link is body-md"
				></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					<p>Wil je subsidie aanvragen voor dakisolatie? Bekijk dan eerst <nldd-link href="https://example.com" target="_blank">de voorwaarden voor dakisolatie</nldd-link> op de website van Mijn Dienst.</p>
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
					text="In body-sm — link is body-sm"
				></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="sm">
					<p>Disclaimer: deze pagina is informatief. Voor juridische details zie <nldd-link href="#disclaimer">de disclaimer</nldd-link>.</p>
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
					text="Lange link wraps over regels (display: inline)"
				></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-container max-width="280px">
					<nldd-text>
						<p>Lees meer over <nldd-link href="#">de voorwaarden voor dakisolatie en wat je moet aanleveren bij je aanvraag</nldd-link> voordat je begint.</p>
					</nldd-text>
				</nldd-container>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
					text="Met end-icon (externe link) — natuurlijke whitespace tussen tekst en icon"
				></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					<p>Vergelijk vooraf <nldd-link href="https://example.com" target="_blank" end-icon="square-arrow-right-top">de soorten warmtepompen</nldd-link> en wat ze kosten.</p>
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					<p>Expliciete <code>size="inherit"</code> doet hetzelfde als geen size</p>
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					<p>Lees ook <nldd-link href="#" size="inherit">de toelichting bij Aanvraag A-1042</nldd-link> voor de stand van zaken.</p>
				</nldd-text>
			</nldd-container>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: `
Zonder \`size\` attribuut (of met \`size="inherit"\`) erft \`<nldd-link>\` font-size, line-height en font-family van de omgeving — gebruik dit voor links in lopende tekst. De link rendert als pure inline-element zodat tekst natuurlijk over regels wrapt.

Icons werken ook in inherit mode: de natuurlijke whitespace tussen icon en tekst zorgt voor de spacing.
				`.trim(),
			},
		},
	},
};

export const MetStartIcon = {
	render: () => html`
		<nldd-container
			gap="8"
			horizontal-alignment="left"
		>
			<nldd-link
				href="#"
				text="Aanvraag A-1042 (pdf, 2 MB)"
				start-icon="download"
			></nldd-link>
			<nldd-link
				href="#"
				text="Terug naar aanvragen"
				start-icon="arrow-left"
			></nldd-link>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetEndIcon = {
	render: () => html`
		<nldd-container
			gap="8"
			horizontal-alignment="left"
		>
			<nldd-link
				href="#"
				text="Aanvraag A-1042"
				end-icon="arrow-right"
			></nldd-link>
			<nldd-link
				href="https://example.com"
				target="_blank"
				text="Warmtepompen vergelijken"
				end-icon="square-arrow-right-top"
			></nldd-link>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik een end-icon om richting of externe navigatie te indiceren.',
			},
		},
	},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
		<nldd-link
			href="#"
			text="Aanvraag A-1043"
			disabled
		></nldd-link>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetVoorproefjeOpInteresse = {
	render: () => html`
		<nldd-text>
			<p>
				De stand van zaken staat bij
				<nldd-link
					href="#aanvraag-a-1042"
					interestfor="voorproefje-a-1042"
				>Aanvraag A-1042</nldd-link>.
			</p>
		</nldd-text>
		<nldd-popover
			id="voorproefje-a-1042"
			accessible-label="Aanvraag A-1042"
			width="240px"
		>
			<nldd-container padding="12">
				<nldd-text text="Aanvraag A-1042"></nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text
					size="sm"
					color="secondary"
					text="Dakisolatie, in behandeling"
				></nldd-text>
			</nldd-container>
		</nldd-popover>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een popover waar <code>interestfor</code> naar wijst, laat zien waar de link heen gaat. Hij opent als je de aanwijzer op de link laat rusten, als de link focus krijgt en bij lang drukken op touch. Een klik of een tik volgt de link gewoon. De popover staat buiten de alinea, zodat zijn inhoud die niet kan breken. Alleen informatie: zet er geen link of knop in.',
			},
		},
	},
};

export const MetEigenAnker = {
	render: () => html`
		<nldd-container
			horizontal-alignment="left"
		>
			<nldd-link size="md"><a href="#aanvraag-a-1042">Aanvraag A-1042</a></nldd-link>
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-link size="md">
				<a href="#aanvraag-a-1043">Aanvraag A-1043 <nldd-icon icon="arrow-right"></nldd-icon></a>
			</nldd-link>
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-link
				size="md"
				disabled
			><a href="#dossier-d-318">Dossier D-318</a></nldd-link>
			<nldd-spacer size="8"></nldd-spacer>
			<nldd-text>
				<p>
					Lees meer over
					<nldd-link><a href="https://example.com">warmtepompen</a></nldd-link>.
				</p>
			</nldd-text>
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een eigen <code>&lt;a&gt;</code> in het slot. Het component tekent dan geen link en geeft de jouwe zijn opmaak, uit de globale stylesheet. Zo staat de link al in de HTML voordat het script draait, en krijgt een router de klik: zet er de <code>&lt;Link&gt;</code> van je router in. Alles van de link staat op de <code>&lt;a&gt;</code>, een icoon ook. <code>disabled</code> op <code>nldd-link</code> werkt ook hier: de klik gaat nergens heen, ook niet naar je router.',
			},
		},
	},
};
