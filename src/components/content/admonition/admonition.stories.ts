import { html, nothing } from 'lit';
import './admonition.js';
import '../rich-text/rich-text.js';
import '../../layout/container/container.js';
import { ICONS } from '../icon/icon.js';

/**
 * `nldd-admonition` zet een opmerking, tip of waarschuwing apart in lopende
 * tekst, zoals een `:::warning` in een markdownpagina. Het is inhoud, geen
 * melding: hij wordt niet voorgelezen bij het laden en is niet weg te klikken.
 * Voor een melding die reageert op wat de gebruiker doet of wat er verandert,
 * gebruik je `nldd-banner`.
 */
export default {
	title: 'Components/Content/Admonition',
	component: 'nldd-admonition',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/admonition/admonition.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
		docs: {
			// role="note" is set on the host by the component itself.
			source: {
				transform: (code: string) => code.replace(/\s+role="note"/g, ''),
			},
		},
	},
	args: {
		variant: 'neutral',
		text: 'Wat je nodig hebt',
		headingLevel: undefined,
		icon: '',
		collapsible: false,
		collapsed: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['neutral', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleur en standaard-icoon',
			table: { defaultValue: { summary: 'neutral' } },
		},
		text: {
			control: 'text',
			description: 'Titel in de balk boven de inhoud; zonder titel is er geen balk',
		},
		headingLevel: {
			name: 'heading-level',
			control: 'select',
			options: ['(geen)', 1, 2, 3, 4, 5, 6],
			mapping: { '(geen)': undefined },
			description: 'Rendert de titel als h1–h6; afwezig rendert als p. Niet met collapsible',
			table: { defaultValue: { summary: '(geen)' } },
		},
		icon: {
			control: 'select',
			options: ['(auto)', ...ICONS],
			mapping: { '(auto)': '' },
			description: 'Override van het standaard-icoon',
			table: { defaultValue: { summary: '(auto)' } },
		},
		collapsible: {
			control: 'boolean',
			description: 'De titelbalk klapt de inhoud in en uit; heeft een titel nodig',
			table: { defaultValue: { summary: false } },
		},
		collapsed: {
			control: 'boolean',
			description: 'Of een inklapbare admonition dicht staat',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({
	variant,
	text,
	headingLevel,
	icon,
	collapsible,
	collapsed,
}: Record<string, any>) => html`
	<nldd-admonition
		variant=${variant === 'neutral' ? nothing : variant}
		text=${text || nothing}
		heading-level=${headingLevel ?? nothing}
		icon=${icon || nothing}
		?collapsible=${collapsible}
		?collapsed=${collapsed}
	>
		<nldd-rich-text>
			<p>Bij een aanvraag voor dakisolatie horen de offerte van het isolatiebedrijf en een foto van het dak voor de isolatie.</p>
		</nldd-rich-text>
	</nldd-admonition>
`;

export const Standaard = {
	render: Template,
};

export const Varianten = {
	render: () => html`
		<nldd-container gap="16">
			<nldd-admonition text="Opmerking">
				<nldd-rich-text>
					<p>Team Uitvoering beoordeelt de aanvraag in de volgorde waarin hij binnenkomt.</p>
				</nldd-rich-text>
			</nldd-admonition>
			<nldd-admonition
				variant="accent"
				text="Goed om te weten"
			>
				<nldd-rich-text>
					<p>Je kunt een aanvraag bewaren en later afmaken.</p>
				</nldd-rich-text>
			</nldd-admonition>
			<nldd-admonition
				variant="success"
				text="Tip"
				icon="idea"
			>
				<nldd-rich-text>
					<p>Een foto van het hele schuine dak maakt de beoordeling sneller.</p>
				</nldd-rich-text>
			</nldd-admonition>
			<nldd-admonition
				variant="warning"
				text="Let op"
			>
				<nldd-rich-text>
					<p>Haal de oude isolatie weg voordat je de foto maakt.</p>
				</nldd-rich-text>
			</nldd-admonition>
			<nldd-admonition
				variant="critical"
				text="Waarschuwing"
			>
				<nldd-rich-text>
					<p>Een aanvraag zonder offerte wordt afgewezen.</p>
				</nldd-rich-text>
			</nldd-admonition>
		</nldd-container>
	`,
};

export const ZonderTitel = {
	name: 'Zonder titel',
	render: () => html`
		<nldd-admonition variant="accent">
			<nldd-rich-text>
				<p>Je kunt een aanvraag bewaren en later afmaken.</p>
			</nldd-rich-text>
		</nldd-admonition>
	`,
};

export const Collapsible = {
	render: () => html`
		<nldd-container gap="16">
			<nldd-admonition
				variant="accent"
				text="Welke stukken horen bij de aanvraag?"
				collapsible
			>
				<nldd-rich-text>
					<p>De offerte van het isolatiebedrijf en een foto van het dak voor de isolatie.</p>
					<ul>
						<li>De offerte noemt de isolatiewaarde.</li>
						<li>De foto laat het hele schuine dak zien.</li>
					</ul>
				</nldd-rich-text>
			</nldd-admonition>
			<nldd-admonition
				text="Hoe lang duurt de beoordeling?"
				collapsible
				collapsed
			>
				<nldd-rich-text>
					<p>Team Uitvoering neemt binnen acht weken een besluit over de aanvraag.</p>
				</nldd-rich-text>
			</nldd-admonition>
		</nldd-container>
	`,
};

export const InLopendeTekst = {
	name: 'In lopende tekst',
	render: () => html`
		<nldd-rich-text>
			<h3>Aanvraag A-1042</h3>
			<p>Team Uitvoering beoordeelt de aanvraag voor dakisolatie. Wat er nodig is voor het besluit, staat hieronder.</p>
			<nldd-admonition
				variant="warning"
				text="Let op"
			>
				<nldd-rich-text>
					<p>Haal de oude isolatie weg voordat je de foto maakt.</p>
				</nldd-rich-text>
			</nldd-admonition>
			<p>Na het besluit hoor je hoe hoog de bijdrage is en wanneer die wordt uitbetaald.</p>
		</nldd-rich-text>
	`,
};
