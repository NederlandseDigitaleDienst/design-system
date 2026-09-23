import { html, nothing } from 'lit';
import './form-field.js';
import '../validation-list/validation-list.js';
import '../form/form.js';
import '../form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-field` is een lay-outwrapper voor formulierinvoer.
 *
 * ### Labelkoppeling
 * Omdat het native `for`-attribuut de shadow DOM niet kan oversteken, koppelt
 * `nldd-form-field` het label aan de invoer via twee mechanismen:
 * - Een `@click`-handler op het label focust de invoer programmatisch.
 * - Het `accessible-label`-attribuut wordt automatisch ingesteld op het gesloten
 *   invoerelement (`nldd-text-field`, `nldd-password-field`), dat dit doorgeeft aan
 *   het interne `<input aria-label>`. Bij een native `<input>` wordt `aria-label`
 *   direct op het element gezet.
 *
 * Geen handmatige koppeling nodig.
 *
 * ```html
 * <!-- Automatisch -->
 * <nldd-form-field label="Naam">
 *   <nldd-text-field></nldd-text-field>
 * </nldd-form-field>
 *
 * <!-- Door consument opgegeven -->
 * <nldd-form-field label="Naam">
 *   <nldd-text-field input-id="name-input"></nldd-text-field>
 * </nldd-form-field>
 * ```
 *
 * ### Slots
 * - Standaard slot: de invoer, met daarnaast z'n `nldd-validation-list`.
 * - `nldd-form-field-help-text`: plaatsen naast de invoer — het component
 *   wijst zichzelf automatisch toe aan het help-slot.
 *
 * ### Foutmeldingen
 * Alles waar een waarde aan moet voldoen staat in één `nldd-validation-list`.
 * Zet `invalid` op de invoer en de lijst toont wat niet klopt; een eis die
 * alleen een server kan vaststellen noem je in `unmet` op de invoer.
 *
 * Het formulierveld reikt de lijst z'n control aan en zet hem in de
 * toegankelijke beschrijving van die control, vóór de help-tekst.
 *
 * ```html
 * <nldd-form-field label="Wachtwoord">
 *   <nldd-password-field invalid></nldd-password-field>
 *   <nldd-validation-list>
 *     <nldd-validation-item id="wachtwoord-lengte" minlength="8">Minimaal 8 tekens</nldd-validation-item>
 *     <nldd-validation-item id="wachtwoord-hoofdletter" match="[A-Z]">Een hoofdletter</nldd-validation-item>
 *   </nldd-validation-list>
 *   <nldd-form-field-help-text>
 *     We gebruiken dit alleen om je aan te melden. <a href="/help">Meer informatie</a>.
 *   </nldd-form-field-help-text>
 * </nldd-form-field>
 * ```
 */
export default {
	title: 'Components/Forms/Form Field',
	component: 'nldd-form-field',
	tags: ['autodocs'],
	args: {
		labelAlignment: 'top',
		label: 'Label',
		supportingLabel: '',
		optional: false,
		optionalLabel: '',
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
			description: 'Korte ondersteunende tekst onder het label. Voor een langere uitleg is er `nldd-form-field-help-text`.',
		},
		optional: {
			control: 'boolean',
			description: 'Markeert het veld als optioneel. Markeer de optionele velden, niet de verplichte.',
			table: { defaultValue: { summary: false } },
		},
		optionalLabel: {
			name: 'optional-label',
			control: 'text',
			description: 'Tekst van het optioneel-label.',
			table: { defaultValue: { summary: 'Optioneel' } },
		},
	},
};

const Template = ({ labelAlignment, label, supportingLabel, optional, optionalLabel }: Record<string, any>) => html`
	<nldd-form-field
		label-alignment=${labelAlignment}
		label=${label}
		supporting-label=${supportingLabel}
		?optional=${optional}
		optional-label=${optionalLabel || nothing}
	>
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const Standaard = {
	render: Template,
};

export const MetSupportingLabel = () => html`
	<nldd-form-field label="Geboortedatum" supporting-label="DD-MM-JJJJ">
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const MetHulptekst = () => html`
	<nldd-form-field label="E-mailadres">
		<nldd-form-field-help-text>
			Wij delen uw e-mailadres nooit. <a href="/privacy">Privacybeleid</a>.
		</nldd-form-field-help-text>
		<nldd-text-field type="email"></nldd-text-field>
	</nldd-form-field>
`;

export const Optioneel = () => html`
	<nldd-form-field label="Telefoonnummer" optional supporting-label="Alleen gebruikt voor tweestapsverificatie.">
		<nldd-text-field type="tel"></nldd-text-field>
	</nldd-form-field>
`;

export const MetEenFout = () => html`
	<nldd-form-field label="E-mailadres">
		<nldd-text-field invalid></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="email-apenstaartje" match="@">Een apenstaartje</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

export const MeerdereFouten = () => html`
	<nldd-form-field label="Wachtwoord">
		<nldd-text-field invalid></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="wachtwoord-verplicht" required>Vul een wachtwoord in</nldd-validation-item>
			<nldd-validation-item id="wachtwoord-lengte" minlength="8">Minimaal 8 tekens</nldd-validation-item>
		</nldd-validation-list>
		<nldd-form-field-help-text>
			We gebruiken dit alleen om je aan te melden. <a href="/help">Meer informatie</a>.
		</nldd-form-field-help-text>
	</nldd-form-field>
`;

export const LabelRechts = () => html`
	<nldd-form-field label="Volledige naam" label-alignment="right" supporting-label="Zoals vermeld in uw paspoort.">
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const LabelLinks = () => html`
	<nldd-form-field label="Volledige naam" label-alignment="left" supporting-label="Zoals vermeld in uw paspoort.">
		<nldd-text-field></nldd-text-field>
	</nldd-form-field>
`;

export const VolledigFormulierLabelBoven = () => html`
	<nldd-form novalidate>
		<nldd-form-field label="Volledige naam">
			<nldd-text-field input-id="top-volledige-naam"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="E-mailadres" supporting-label="We sturen een bevestigingsmail.">
			<nldd-text-field type="email" input-id="top-email"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="Telefoonnummer" optional supporting-label="Alleen gebruikt voor tweestapsverificatie.">
			<nldd-text-field
				type="tel"
				input-id="top-telefoon"
				invalid
			></nldd-text-field>
			<nldd-validation-list>
				<nldd-validation-item id="top-telefoon-formaat" match="^[0-9 +-]+$">Alleen cijfers, spaties, + en -</nldd-validation-item>
			</nldd-validation-list>
		</nldd-form-field>
		<nldd-form-field label="Opmerkingen" optional supporting-label="Eventuele aanvullende opmerkingen.">
			<nldd-text-field input-id="top-opmerkingen"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group>
				<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const VolledigFormulierLabelRechts = () => html`
	<div style="container-type: inline-size;">
		<nldd-form label-alignment="right" novalidate>
			<nldd-form-field label="Volledige naam" supporting-label="Zoals vermeld in uw paspoort.">
				<nldd-text-field input-id="right-full-name"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="E-mailadres" supporting-label="We sturen een bevestigingsmail.">
				<nldd-text-field type="email" input-id="rechts-email"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Telefoonnummer" optional>
				<nldd-text-field
					type="tel"
					input-id="right-phone"
					invalid
				></nldd-text-field>
				<nldd-validation-list>
					<nldd-validation-item id="rechts-telefoon-formaat" match="^[0-9 +-]+$">Alleen cijfers, spaties, + en -</nldd-validation-item>
				</nldd-validation-list>
			</nldd-form-field>
			<nldd-form-field label="Opmerkingen" optional supporting-label="Eventuele aanvullende opmerkingen.">
				<nldd-text-field input-id="right-comments"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	</div>
`;
