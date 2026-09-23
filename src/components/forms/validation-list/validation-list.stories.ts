import { html, nothing } from 'lit';
import './validation-list.js';
import '../form-field/form-field.js';
import '../form/form.js';
import '../form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../inputs/password-field/password-field.js';
import '../../inputs/radio-button-group/radio-button-group.js';
import '../../inputs/radio-button-field/radio-button-field.js';
import '../../actions/button/button.js';

export default {
	title: 'Components/Forms/Validation List',
	component: 'nldd-validation-list',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/forms/validation-list/validation-list.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
		docs: {
			description: {
				component: `
Alles waar een waarde aan moet voldoen, in één lijst.

Een eis die je vooraf kunt noemen is een item met een regel, en die controleert
zichzelf terwijl je typt. Een eis die alleen een server kan vaststellen is een
item zonder regel, en de app noemt hem in \`unmet\` op de control.

De lijst heeft twee modi en \`judging\` is de schakelaar. Vóór een oordeel toont
hij z'n hints: de eisen van het veld. Ná een oordeel toont hij alles waaraan de
waarde niet voldoet, en zijn de hints weg. De lijst zet die schakelaar zelf om
zodra z'n control op \`invalid\` staat. Wannéér een veld beoordeeld wordt is dus
een keuze van de consumer, en het moment daarvoor is bij verzending.

Hints staan standaard uit. Een telefoonnummer hoeft z'n formaat niet uit te
leggen voordat iemand iets heeft getypt, de regels van een wachtwoord wel.

Er zijn geen vinkjes. De control toont zelf al een validatie-icoon, en dat per
regel herhalen zegt hetzelfde drie keer.
				`,
			},
		},
	},
	args: {
		hint: false,
		judging: true,
		for: '',
	},
	argTypes: {
		hint: {
			control: 'boolean',
			description: 'Toon elk item voordat er een oordeel is, als de eisen van het veld. Per item te overschrijven.',
			table: { defaultValue: { summary: false } },
		},
		judging: {
			control: 'boolean',
			description: 'Laat de hints vallen, want dit veld is beoordeeld. De lijst zet dit zelf aan zodra z\'n control op invalid staat; met de hand zetten is voor een submit- of reset-handler. Wat rood wordt volgt invalid, niet dit.',
			table: { defaultValue: { summary: false } },
		},
		for: {
			control: 'text',
			description: 'Id van de control waar deze lijst over gaat. Niet nodig binnen een nldd-form-field, die reikt z\'m aan. Zet er een leeg veld-id in en de regels matchen nergens meer op.',
			table: { defaultValue: { summary: '(geen)' } },
		},
	},
};

/**
 * Een afgekeurd wachtwoord: wat er nog niet klopt staat eronder. Typ mee en zie
 * de regels uitgaan zodra je ze haalt.
 *
 * Zet `judging` uit en je ziet het veld zoals het eraan toe was vóór de
 * beoordeling: leeg, tenzij `hint` aanstaat en de eisen dus vooraf al worden
 * genoemd. De control loopt hier mee met de schakelaar, want zo staat het in een
 * echte app: het formulier keurt af, en de lijst volgt.
 */
export const Standaard = ({ hint, judging, for: control }: Record<string, unknown>) => html`
	<nldd-form-field label="Wachtwoord">
		<nldd-password-field id="password" name="password" ?invalid=${judging}></nldd-password-field>
		<nldd-validation-list ?hint=${hint} ?judging=${judging} for=${control || nothing}>
			<nldd-validation-item id="password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
			<nldd-validation-item id="password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
			<nldd-validation-item id="password-digit" match="[0-9]">Een cijfer</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/** Zonder `hint` blijft de lijst leeg tot er iets misgaat. Zo hoort een gewoon veld het te doen. */
export const AlleenBijEenFout = () => html`
	<nldd-form-field label="Telefoonnummer">
		<nldd-text-field name="phone" invalid></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="phone-characters" match="^[0-9 +-]+$">Alleen cijfers, spaties, + en -</nldd-validation-item>
			<nldd-validation-item id="phone-length" minlength="10">Minimaal 10 tekens</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/**
 * `required` is de enige regel die een lege waarde niet haalt. Op een leeg veld
 * zie je dus die ene regel, en niet meteen alle andere.
 */
export const VerplichtVeld = () => html`
	<nldd-form-field label="Nieuw wachtwoord">
		<nldd-password-field name="new-password" invalid></nldd-password-field>
		<nldd-validation-list>
			<nldd-validation-item id="new-password-empty" required>Vul een wachtwoord in</nldd-validation-item>
			<nldd-validation-item id="new-password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
			<nldd-validation-item id="new-password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/** Een item zonder regel wacht op de app: die zet z'n id in `unmet` op de control. */
export const DoorDeAppAangestuurd = () => html`
	<nldd-form-field label="Gebruikersnaam">
		<nldd-text-field name="username" value="jansen" invalid unmet="username-taken"></nldd-text-field>
		<nldd-validation-list>
			<nldd-validation-item id="username-taken">Deze gebruikersnaam is al in gebruik</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/** De twee soorten door elkaar: twee regels die zichzelf toetsen en één die van de server komt. */
export const RegelsEnServer = () => html`
	<nldd-form-field label="Wachtwoord wijzigen">
		<nldd-password-field name="changed-password" value="geheim" invalid unmet="changed-password-breach"></nldd-password-field>
		<nldd-validation-list hint>
			<nldd-validation-item id="changed-password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
			<nldd-validation-item id="changed-password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
			<nldd-validation-item id="changed-password-breach">Dit wachtwoord staat in een bekend datalek</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/**
 * Een veld dat beoordeeld is en klopt: de lijst is leeg. Ook de hints zijn weg,
 * die legden uit wat het veld wilde en dat weet je inmiddels.
 *
 * `judging` staat hier met de hand aan. Een statisch voorbeeld heeft geen
 * afkeuring achter de rug, en in een echt formulier zou het attribuut er staan
 * doordat het veld eerder op `invalid` stond.
 */
export const AlsHetGoedIs = () => html`
	<nldd-form-field label="Herhaal wachtwoord">
		<nldd-password-field name="repeat-password" value="Geheim123" valid></nldd-password-field>
		<nldd-validation-list hint judging>
			<nldd-validation-item id="repeat-password-length" minlength="8">Minimaal 8 tekens</nldd-validation-item>
			<nldd-validation-item id="repeat-password-capital" match="[A-Z]">Een hoofdletter</nldd-validation-item>
		</nldd-validation-list>
	</nldd-form-field>
`;

/**
 * Eén vraag met twee controls, en de lijst hoort bij de tweede.
 *
 * Een veld mag meer dan één control bevatten: een radiogroep met "Anders,
 * namelijk" ernaast is één vraag en hoort in één veld. `nldd-form-field` reikt
 * de lijst z'n eerste control aan, want dat is degene die het label draagt. Met
 * `for` zeg je dat je de andere bedoelt.
 *
 * Zonder dat attribuut zou de lijst de radiogroep lezen, matchte er nooit iets,
 * en bleef de regel staan zonder dat iets uitlegt waarom. Daarom waarschuwt
 * `nldd-form-field` in DEV zodra een veld meer dan één control heeft en de
 * lijst een waarde leest.
 */
export const MetFor = () => html`
	<nldd-form>
		<nldd-form-field label="Waar heb je ons gevonden?">
			<nldd-radio-button-group name="source" accessible-label="Waar heb je ons gevonden?">
				<nldd-radio-button-field value="search-engine" label="Zoekmachine"></nldd-radio-button-field>
				<nldd-radio-button-field value="other" label="Anders, namelijk"></nldd-radio-button-field>
			</nldd-radio-button-group>
			<nldd-text-field id="source-other" name="source-other" accessible-label="Anders, namelijk"></nldd-text-field>
			<nldd-validation-list for="source-other">
				<nldd-validation-item id="source-explanation" minlength="3">Minimaal 3 tekens toelichting</nldd-validation-item>
			</nldd-validation-list>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button variant="primary" type="submit" text="Versturen"></nldd-button>
		</nldd-form-actions>
	</nldd-form>
`;

/**
 * In een formulier, naast een help-tekst die iets anders doet: die houdt je niet
 * tegen en blijft dus staan.
 *
 * Verstuur met een leeg veld en de regel verschijnt. Typ een apenstaartje en hij
 * gaat uit, wis het weer en hij komt terug, want het formulier weigert dat
 * opnieuw.
 */
export const NaastHelpTekst = () => html`
	<nldd-form>
		<nldd-form-field label="E-mailadres">
			<nldd-text-field name="email"></nldd-text-field>
			<nldd-validation-list>
				<nldd-validation-item id="email-at" match="@">Een apenstaartje</nldd-validation-item>
			</nldd-validation-list>
			<nldd-form-field-help-text>We sturen een bevestigingsmail naar dit adres.</nldd-form-field-help-text>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button variant="primary" type="submit" text="Versturen"></nldd-button>
		</nldd-form-actions>
	</nldd-form>
`;

/**
 * Een verankerd patroon, voor een waarde die precies een vorm moet hebben. De
 * `^` en `$` doen hier het werk: zonder die twee zou `match` "bevat" betekenen.
 *
 * Verstuur het formulier met een lege of foute postcode en de regel verschijnt.
 * Typ `1234AB` en hij verdwijnt, samen met de rand van het veld.
 */
export const VerankerdPatroon = () => html`
	<nldd-form>
		<nldd-form-field label="Postcode">
			<nldd-text-field name="postal-code" width="160px"></nldd-text-field>
			<nldd-validation-list>
				<nldd-validation-item id="postal-code-format" match="^[0-9]{4} ?[A-Za-z]{2}$">Vier cijfers en dan twee letters, zoals 1234 AB</nldd-validation-item>
			</nldd-validation-list>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button variant="primary" type="submit" text="Versturen"></nldd-button>
		</nldd-form-actions>
	</nldd-form>
`;
