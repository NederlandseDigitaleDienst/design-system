import { html, nothing } from 'lit';
import './link.js';
import { ICONS } from './../../content/icon/icon.js';
import '../../layout/container/container.js';
import '../../content/text/text.js';
import '../../content/title/title.js';
import '../../layout/spacer/spacer.js';

/**
 * De Link component werkt in twee modi:
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
		status: {
			type: 'stable',
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
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
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
		disabled: false,
	},
};

const Template = ({ size, text, startIcon, endIcon, href, target, download, accessibleLabel, disabled }: Record<string, any>) => html`
	<nldd-link
		href=${href || nothing}
		target=${target || nothing}
		download=${download ?? nothing}
		size=${size || nothing}
		text=${text}
		start-icon=${startIcon || nothing}
		end-icon=${endIcon || nothing}
		accessible-label=${accessibleLabel || nothing}
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
				>
					In een h2 — link erft display-grootte
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-title size="2">
					<h2>Lees meer over <nldd-link href="#voorwaarden">de voorwaarden</nldd-link>.</h2>
				</nldd-title>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					In body-md — link is body-md
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					Wil je subsidie aanvragen voor dakisolatie? Bekijk dan eerst <nldd-link href="https://example.com" target="_blank">de voorwaarden voor dakisolatie</nldd-link> op de website van Mijn Dienst.
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					In body-sm — link is body-sm
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="sm">
					Disclaimer: deze pagina is informatief. Voor juridische details zie <nldd-link href="#disclaimer">de disclaimer</nldd-link>.
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Lange link wraps over regels (display: inline)
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-container max-width="280px">
					<nldd-text>
						Lees meer over <nldd-link href="#">de voorwaarden voor dakisolatie en wat je moet aanleveren bij je aanvraag</nldd-link> voordat je begint.
					</nldd-text>
				</nldd-container>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Met end-icon (externe link) — natuurlijke whitespace tussen tekst en icon
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					Vergelijk vooraf <nldd-link href="https://example.com" target="_blank" end-icon="square-arrow-right-top">de soorten warmtepompen</nldd-link> en wat ze kosten.
				</nldd-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="xs"
					color="secondary"
				>
					Expliciete <code>size="inherit"</code> doet hetzelfde als geen size
				</nldd-text>
				<nldd-spacer size="4"></nldd-spacer>
				<nldd-text size="md">
					Lees ook <nldd-link href="#" size="inherit">de toelichting bij Aanvraag A-1042</nldd-link> voor de stand van zaken.
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
