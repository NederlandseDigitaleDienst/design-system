import { html } from 'lit';
import './form-section.js';
import '../form/form.js';
import '../form-field/form-field.js';
import '../form-actions/form-actions.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-section` groepeert bij elkaar horende velden in een formulier,
 * met een kop en een korte toelichting. Gebruik het als een formulier uit
 * duidelijke delen bestaat, zoals persoonsgegevens en een adres. Het rendert
 * een echte `<fieldset>` met `<legend>`, zodat een schermlezer de naam van de
 * groep noemt.
 */
export default {
	title: 'Components/Forms/Form Section',
	component: 'nldd-form-section',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/forms/form-section/form-section.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		text: 'Persoonsgegevens',
		supportingText: 'Vul je gegevens in.',
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Heading-tekst (gerenderd als `<legend>`)',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Korte beschrijving onder de heading',
		},
	},
};

// Form-section heeft een form-context nodig (vertical-rhythm regels leven in
// form.css en zijn gescoped onder nldd-form). Standalone gebruik wordt niet
// ondersteund.
const Template = ({ text, supportingText }: Record<string, any>) => html`
	<nldd-form novalidate>
		<nldd-form-section
			text=${text}
			supporting-text=${supportingText}
		>
			<nldd-form-field label="Naam">
				<nldd-text-field
					name="name"
					autocomplete="name"
				></nldd-text-field>
			</nldd-form-field>
		</nldd-form-section>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
};

/**
 * De kop staat altijd links, over de volle breedte. Ook als de velden erin
 * `label-alignment="right"` hebben.
 */
export const InEenFormulier = {
	render: () => html`
		<nldd-form
			label-alignment="right"
			novalidate
		>
			<nldd-form-section
				text="Persoonsgegevens"
				supporting-text="Vul je naam en contactgegevens in."
			>
				<nldd-form-field label="Naam">
					<nldd-text-field
						name="name"
						autocomplete="name"
					></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="E-mail">
					<nldd-text-field
						name="email"
						type="email"
						autocomplete="email"
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>

			<nldd-form-section text="Adres">
				<nldd-form-field label="Straat en huisnummer">
					<nldd-text-field
						name="street-address"
						autocomplete="street-address"
					></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="Postcode">
					<nldd-text-field
						name="postal-code"
						autocomplete="postal-code"
					></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="Plaats">
					<nldd-text-field
						name="address-level2"
						autocomplete="address-level2"
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>

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
	`,
	parameters: { controls: { disable: true } },
};

export const ZonderText = {
	render: () => html`
		<nldd-form novalidate>
			<!-- nldd-lint-disable-next-line form-section-needs-name -- Shows on purpose what a section without text looks like; an app needs text or supporting-text. -->
			<nldd-form-section>
				<nldd-form-field label="Naam">
					<nldd-text-field
						name="name"
						autocomplete="name"
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
		</nldd-form>
	`,
	parameters: { controls: { disable: true } },
};
