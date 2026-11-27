import { html } from 'lit';
import './form-field.js';
import '../validation-list/validation-list.js';
import '../form/form.js';
import '../form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../content/text/text.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-field` zet het label, een ondersteunend label, de validatie en een
 * hulptekst om één invoerveld. Gebruik het om elk veld in een formulier. Het
 * koppelt het label zelf aan de invoer, dus een `for` of `id` schrijf je niet.
 */
export default {
	title: 'Components/Forms/Form Field',
	component: 'nldd-form-field',
	tags: ['autodocs'],
	args: {
		labelAlignment: 'top',
		label: 'Label',
		supportingLabel: '',
		helpText: '',
		optional: false,
	},
	argTypes: {
		labelAlignment: {
			name: 'label-alignment',
			control: 'select',
			options: ['top', 'right', 'left'],
			description: 'Plaats van het label: boven de invoer, of in een kolom ernaast (rechts of links uitgelijnd). Op een smalle container altijd boven. Een eigen waarde wint van die van het formulier.',
			table: { defaultValue: { summary: 'top' } },
		},
		label: {
			control: 'text',
			description: 'Label van het veld. Het veld geeft het ook als toegankelijke naam aan de invoer.',
		},
		supportingLabel: {
			name: 'supporting-label',
			control: 'text',
			description: 'Korte ondersteunende tekst onder het label. Een schermlezer leest hem voor als beschrijving van de invoer.',
		},
		helpText: {
			name: 'help-text',
			control: 'text',
			description: 'Hulptekst onder de invoer, als platte tekst. Een hulptekst met een link zet je in een `nldd-text` in het slot `help-text`.',
		},
		optional: {
			control: 'boolean',
			description: 'Markeert het veld als optioneel. Markeer de optionele velden, niet de verplichte.',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({ labelAlignment, label, supportingLabel, helpText, optional }: Record<string, any>) => html`
	<nldd-form-field
		label-alignment=${labelAlignment}
		label=${label}
		supporting-label=${supportingLabel}
		help-text=${helpText}
		?optional=${optional}
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const Standaard = {
	render: Template,
};

export const MetSupportingLabel = () => html`
	<nldd-form-field
		label="Geboortedatum"
		supporting-label="DD-MM-JJJJ"
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const MetHulptekst = () => html`
	<nldd-form-field
		label="Gebruikersnaam"
		help-text="Dit is de naam die anderen zien. Je kunt hem later nog wijzigen."
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

/**
 * Staat er een link in de hulptekst, zet die dan in een `nldd-text` in het slot
 * `help-text`. Het veld geeft die tekst de grootte, kleur en dikte van een
 * hulptekst.
 */
export const MetHulptekstEnLink = () => html`
	<nldd-form-field label="E-mailadres">
		<nldd-text-field type="email"></nldd-text-field>
		<nldd-text slot="help-text">
			<p>Wij delen uw e-mailadres nooit. <a href="/privacy">Privacybeleid</a>.</p>
		</nldd-text>
	</nldd-form-field>
`;

export const Optioneel = () => html`
	<nldd-form-field
		label="Telefoonnummer"
		optional
		supporting-label="Alleen gebruikt voor tweestapsverificatie."
	>
		<nldd-text-field type="tel"></nldd-text-field>
	</nldd-form-field>
`;

/**
 * Wat een waarde moet halen staat in één `nldd-validation-list` in het veld.
 * Zet `invalid` op de invoer, dan toont de lijst wat er niet klopt.
 */
export const MetEenFout = () => html`
	<nldd-form-field label="E-mailadres">
		<nldd-text-field
			type="email"
			value="jan.voorbeeld.nl"
			invalid
		></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="email-apenstaartje" match="@">Een apenstaartje</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

export const MeerdereFouten = () => html`
	<nldd-form-field label="Wachtwoord">
		<nldd-text-field invalid></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="wachtwoord-verplicht" required>Een wachtwoord is verplicht</nldd-validation-item>
			<nldd-validation-item id="wachtwoord-lengte" minlength="8">Minimaal 8 tekens</nldd-validation-item>
		</nldd-validation-list>
		<nldd-text slot="help-text">
			<p>We gebruiken dit alleen om je aan te melden. <a href="/help">Hoe we je wachtwoord bewaren</a>.</p>
		</nldd-text>
	</nldd-form-field>
`;

export const LabelRechts = () => html`
	<nldd-form-field
		label="Volledige naam"
		label-alignment="right"
		supporting-label="Zoals vermeld in uw paspoort."
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const LabelLinks = () => html`
	<nldd-form-field
		label="Volledige naam"
		label-alignment="left"
		supporting-label="Zoals vermeld in uw paspoort."
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const VolledigFormulierLabelBoven = () => html`
	<nldd-form novalidate>
		<nldd-form-field label="Volledige naam">
			<nldd-text-field input-id="top-volledige-naam"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field
			label="E-mailadres"
			supporting-label="We sturen een bevestigingsmail."
		>
			<nldd-text-field
				type="email"
				input-id="top-email"
			></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field
			label="Telefoonnummer"
			optional
			supporting-label="Alleen gebruikt voor tweestapsverificatie."
		>
			<nldd-text-field
				type="tel"
				input-id="top-telefoon"
				value="06 twaalf"
				invalid
			></nldd-text-field>
			<nldd-validation-list>
				<nldd-validation-item id="top-telefoon-formaat" match="^[0-9 +-]+$">Alleen cijfers, spaties, + en -</nldd-validation-item>
			</nldd-validation-list>
		</nldd-form-field>
		<nldd-form-field
			label="Opmerkingen"
			optional
			supporting-label="Eventuele aanvullende opmerkingen."
		>
			<nldd-text-field input-id="top-opmerkingen"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group>
				<nldd-button
					appearance="primary"
					type="submit"
					text="Bewaar"
				></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const VolledigFormulierLabelRechts = () => html`
	<div style="container-type: inline-size;">
		<nldd-form
			label-alignment="right"
			novalidate
		>
			<nldd-form-field
				label="Volledige naam"
				supporting-label="Zoals vermeld in uw paspoort."
			>
				<nldd-text-field input-id="right-full-name"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field
				label="E-mailadres"
				supporting-label="We sturen een bevestigingsmail."
			>
				<nldd-text-field
					type="email"
					input-id="rechts-email"
				></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field
				label="Telefoonnummer"
				optional
			>
				<nldd-text-field
					type="tel"
					input-id="right-phone"
					value="06 twaalf"
					invalid
				></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="rechts-telefoon-formaat" match="^[0-9 +-]+$">Alleen cijfers, spaties, + en -</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
			<nldd-form-field
				label="Opmerkingen"
				optional
				supporting-label="Eventuele aanvullende opmerkingen."
			>
				<nldd-text-field input-id="right-comments"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button
						appearance="primary"
						type="submit"
						text="Bewaar"
					></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	</div>
`;
