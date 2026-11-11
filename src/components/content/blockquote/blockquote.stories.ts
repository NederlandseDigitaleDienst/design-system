import { html, nothing } from 'lit';
import './blockquote.js';
import '../identity/identity.js';
import '../avatar-group/avatar-group.js';
import '../avatar/avatar.js';

/**
 * De Blockquote component toont een citaat met optionele bronvermelding.
 *
 * ## Gebruik
 * ```html
 * <nldd-blockquote>
 *   <p>Het beste systeem is het systeem dat je niet ziet.</p>
 *   <p slot="attribution">Jan Jansen, team Uitvoering</p>
 * </nldd-blockquote>
 * ```
 */
export default {
	title: 'Components/Content/Blockquote',
	component: 'nldd-blockquote',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/blockquote/blockquote.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		quote: 'Overheidsdienstverlening moet begrijpelijk, toegankelijk en inclusief zijn voor iedereen.',
		attribution: 'Team Beleid, Dossier D-319',
		cite: '',
		smCustomSize: '',
		mdCustomSize: '',
		lgCustomSize: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['md', 'lg'],
			description: 'Grootte van het citaat. `lg` voor een citaat als blikvanger, zoals op een landingspagina. De bronvermelding en de rand blijven gelijk.',
			table: { defaultValue: { summary: 'md' } },
		},
		quote: {
			control: 'text',
			description: 'Citaat (default slot)',
		},
		attribution: {
			control: 'text',
			description: 'Bronvermelding (slot="attribution")',
		},
		cite: {
			control: 'text',
			description: 'URL van de bron',
		},
		smCustomSize: {
			name: 'sm-custom-size',
			control: 'text',
			description: 'Eigen grootte van het citaat bij sm, elke CSS-lengte, als `lg` niet genoeg is. Een breedte zonder waarde houdt de maat uit `size`; nooit kleiner dan die maat.',
		},
		mdCustomSize: {
			name: 'md-custom-size',
			control: 'text',
			description: 'Eigen grootte van het citaat bij md',
		},
		lgCustomSize: {
			name: 'lg-custom-size',
			control: 'text',
			description: 'Eigen grootte van het citaat bij lg',
		},
	},
};

const Template = ({ size, quote, attribution, cite, smCustomSize, mdCustomSize, lgCustomSize }: Record<string, any>) => html`
	<nldd-blockquote
		size=${size === 'md' ? nothing : size}
		cite=${cite || nothing}
		sm-custom-size=${smCustomSize || nothing}
		md-custom-size=${mdCustomSize || nothing}
		lg-custom-size=${lgCustomSize || nothing}
	>
		<p>${quote}</p>
		${attribution ? html`<p slot="attribution">${attribution}</p>` : ''}
	</nldd-blockquote>
`;

export const Standaard = {
	render: Template,
};

export const MetCite = {
	render: Template,
	args: {
		cite: 'https://example.nl/mijn-dienst/dossiers/d-319',
	},
};

/**
 * Voor een citaat als blikvanger, bijvoorbeeld op een landingspagina. Alleen
 * het citaat groeit, met zijn regelhoogte en de ruimte tussen alinea's; de
 * bronvermelding en de rand blijven gelijk.
 */
export const Lg = {
	name: 'Size lg',
	render: () => html`
	<nldd-blockquote size="lg">
		<p>Overheidsdienstverlening moet begrijpelijk, toegankelijk en inclusief zijn voor iedereen.</p>
		<p slot="attribution">Team Beleid, Dossier D-319</p>
	</nldd-blockquote>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Is `lg` niet genoeg, geef dan per breedte een eigen grootte, met `sm-`, `md-`
 * en `lg-custom-size`. Een breedte zonder waarde houdt de maat uit `size`, dus
 * een citaat dat op een breed scherm groot is, breekt nooit op een smal scherm.
 */
export const EigenGrootte = {
	name: 'Eigen grootte',
	render: () => html`
	<nldd-blockquote sm-custom-size="24px" md-custom-size="32px" lg-custom-size="40px">
		<p>Overheidsdienstverlening moet begrijpelijk, toegankelijk en inclusief zijn voor iedereen.</p>
		<p slot="attribution">Team Beleid, Dossier D-319</p>
	</nldd-blockquote>
`,
	parameters: { controls: { disable: true } },
};

export const LangCitaat = {
	render: () => html`
		<nldd-blockquote>
			<p>
				Een goede digitale dienst is als een goede ambtenaar: betrouwbaar, geduldig en altijd
				gericht op de burger die aan de andere kant van de balie staat.
			</p>
			<p>
				Of die balie nu fysiek is of een formulier op het scherm: de bedoeling blijft hetzelfde.
			</p>
			<p slot="attribution">uit het handboek ontwerpprincipes</p>
		</nldd-blockquote>
	`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * Een `nldd-identity` mag als bronvermelding in de attribution-slot; het
 * kastlijntje ("— ") wordt dan automatisch weggelaten omdat de identity zijn
 * eigen opmaak meebrengt (avatar, naam en ondersteunende tekst).
 */
export const MetIdentity = {
	render: () => html`
		<nldd-blockquote>
			<p>Het beste systeem is het systeem dat je niet ziet.</p>
			<nldd-identity
				slot="attribution"
				text="Jan Jansen"
				supporting-text="Hoofdredacteur · team Beleid"
			>
				<nldd-avatar
					slot="avatars"
					name="Jan Jansen"
					decorative
				></nldd-avatar>
			</nldd-identity>
		</nldd-blockquote>
	`,
	parameters: {
		controls: { disable: true },
	},
};
