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
	argTypes: {
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
	},
	args: {
		quote: 'Overheidsdienstverlening moet begrijpelijk, toegankelijk en inclusief zijn voor iedereen.',
		attribution: 'Team Beleid, Dossier D-319',
		cite: '',
	},
};

const Template = ({ quote, attribution, cite }: Record<string, any>) => html`
	<nldd-blockquote cite=${cite || nothing}>
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
