import { html, nothing } from 'lit';
import './file-field.js';
import '../../forms/validation-list/validation-list.js';
import '../../forms/form-field/form-field.js';
import '../../layout/container/container.js';

/**
 * Een bestandskiezer die als één control leest. Leeg is het hele getinte vlak één
 * knop, met één zin in het midden: "Bestand kiezen of
 * sleep het hierheen", het eerste deel in de accentkleur. Waar je ook in het vlak
 * klikt, de bestandsdialoog gaat open. Is er een bestand gekozen, dan toont het vlak het icoon van het formaat, de naam, een
 * knop "Wijzigen" en een kruisje om het weer te wissen. Eronder zit een verborgen
 * `<input type="file">`, want een bestandsdialoog opent alleen vanuit een
 * gebruikersgebaar op een echte input.
 *
 * Het vlak lijkt bewust niet op een invoerveld. Een rand met veldsemantiek belooft
 * dat je erin kunt typen, terwijl je hier alleen kunt klikken of een bestand kunt
 * neerzetten.
 *
 * ## Slepen
 * Je kunt een bestand op het hele veld laten vallen. Een drop gaat door dezelfde
 * input als een keuze, dus hij geeft hetzelfde `change`-event en wordt op dezelfde
 * manier ingediend. `accept` en `multiple` gelden ook voor een drop: past hij
 * niet, dan blijft de vorige keuze staan en zegt het veld waarom, tot de volgende
 * actie.
 *
 * Zolang er bestanden boven de pagina hangen, krijgt elk veld een dikkere,
 * donkerdere rand, en zegt een leeg veld "Sleep het bestand hierheen". Een veld
 * met een bestand zegt dan "Sleep hierheen om te vervangen", zonder zijn knoppen. Het veld onder de pointer kleurt in de accentkleur en zegt
 * dat het ze aanneemt, of kleurt rood als het aantal of het type niet past. Een bestand dat naast
 * het veld valt, opent de browser niet meer; een drop die een andere dropzone of
 * een bewerkbaar veld afhandelt, laat het veld met rust. Op een apparaat zonder
 * hover kun je niet slepen, dus daar valt de hint weg.
 *
 * ## Gebruik
 * ```html
 * <nldd-file-field
 * 	accept=".pdf"
 * 	name="bijlage"
 * ></nldd-file-field>
 * ```
 *
 * Er is geen `value`: browsers verbieden het programmatisch zetten van een
 * bestandsselectie. De gekozen bestanden lees je uit het `change`-event of uit de
 * `files`-property.
 */
export default {
	title: 'Components/Inputs/File Field',
	component: 'nldd-file-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/file-field/file-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		accept: '',
		multiple: false,
		accessibleLabel: 'Bijlage',
		valid: false,
		invalid: false,
		disabled: false,
		name: '',
		required: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['md', 'sm'],
			description: 'Veldmaat',
			table: { defaultValue: { summary: 'md' } },
		},
		accept: {
			control: 'text',
			description: 'Toegestane bestandstypen, doorgegeven aan de input (bijv. ".pdf,image/*")',
		},
		multiple: {
			control: 'boolean',
			description: 'Meerdere bestanden kiezen',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam; wordt door nldd-form-field automatisch gezet',
		},
		valid: {
			control: 'boolean',
			description: 'Markeert het veld als geldig',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Markeert het veld als ongeldig',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam waaronder het bestand wordt ingediend',
		},
		required: {
			control: 'boolean',
			description: 'Verplicht; ongeldig zolang er geen bestand is gekozen',
			table: { defaultValue: { summary: false } },
		},
	},
};

export const Standaard = ({
	size,
	accept,
	multiple,
	accessibleLabel,
	valid,
	invalid,
	disabled,
	name,
	required,
}: Record<string, unknown>) => html`
	<nldd-file-field
		size=${size || nothing}
		accept=${accept || nothing}
		?multiple=${multiple}
		accessible-label=${accessibleLabel || nothing}
		?valid=${valid}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name || nothing}
		?required=${required}
	></nldd-file-field>
`;

/**
 * Met `multiple` verandert de zin mee en worden gekozen bestanden
 * samengevat als "3 bestanden". Het kruisje wist ze allemaal tegelijk.
 *
 * Ze worden bewust niet één voor één gelijst: elke keuze vervangt de hele
 * `FileList`, en er is geen manier om er later één uit te halen zonder de lijst
 * via `DataTransfer` opnieuw op te bouwen. Dat ontdubbelt niets, en een `File`
 * heeft geen id, dus ontdubbelen zou neerkomen op gokken op naam, grootte en
 * wijzigingsdatum. Een lijst met een kruisje per bestand zou een bewerking
 * beloven die het platform niet kent. Wil een pagina de bestanden toch tonen,
 * dan rendert die z'n eigen lijst uit de `File[]` in het change-event.
 */
export const Meerdere = {
	render: () => html`
		<nldd-file-field
			multiple
			accessible-label="Bijlagen"
		></nldd-file-field>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * In een `nldd-form-field` krijgt het veld zijn label, maat en foutmelding
 * automatisch aangereikt, net als elk ander invoerveld.
 */
export const InEenFormulierveld = {
	name: 'In een formulierveld',
	render: () => html`
		<nldd-form-field label="Bewijsstuk">
			<nldd-file-field
				accept=".pdf"
				name="bewijsstuk"
				invalid
				unmet="bewijsstuk-verplicht"
			></nldd-file-field>
			<nldd-validation-list>
				<nldd-validation-item id="bewijsstuk-verplicht">Kies een bestand</nldd-validation-item>
			</nldd-validation-list>
		</nldd-form-field>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Beide maten naast elkaar.
 */
export const Grootten = {
	render: () => html`
		<nldd-container
			gap="16"
			max-width="420px"
		>
			<nldd-file-field accessible-label="Bijlage md"></nldd-file-field>
			<nldd-file-field
				size="sm"
				accessible-label="Bijlage sm"
			></nldd-file-field>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};
