import { html } from 'lit';
import './form-section.js';
import '../form/form.js';
import '../form-field/form-field.js';
import '../form-actions/form-actions.js';
import '../../content/title/title.js';
import '../../content/text/text.js';
import '../../layout/spacer/spacer.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-section` is een deel van een formulier: een kop, met de velden
 * eronder in het ritme van een formulier. De sectie regelt de afstanden, tussen
 * de kop en de velden, tussen de velden en tussen de secties. Wat er in de kop
 * staat bepaal je zelf: meestal een `nldd-title` met een `heading-level` dat bij
 * de pagina past.
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
};

export const Standaard = {
	render: () => html`
		<nldd-form novalidate>
			<nldd-form-section>
				<nldd-title
					slot="header"
					text="Persoonsgegevens"
					heading-level="2"
					size="display-4"
				></nldd-title>
				<nldd-form-field label="Naam">
					<nldd-text-field
						name="name"
						autocomplete="name"
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
		</nldd-form>
	`,
};

/**
 * Meer dan een titel in de kop: zet de onderdelen in een eigen element in het
 * slot, met een `nldd-spacer` waar je de afstand zelf wilt bepalen.
 */
export const MetToelichtingInDeKop = {
	render: () => html`
		<nldd-form novalidate>
			<nldd-form-section>
				<div slot="header">
					<nldd-title
						text="Adres"
						heading-level="2"
						size="display-4"
					></nldd-title>
					<nldd-spacer size="4"></nldd-spacer>
					<nldd-text color="secondary">
						<p>Het adres waar je staat ingeschreven.</p>
					</nldd-text>
				</div>
				<nldd-form-field label="Straat en huisnummer">
					<nldd-text-field
						name="street-address"
						autocomplete="street-address"
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
		</nldd-form>
	`,
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
			<nldd-form-section>
				<nldd-title
					slot="header"
					text="Persoonsgegevens"
					heading-level="2"
					size="display-4"
				></nldd-title>
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
			<nldd-form-section>
				<nldd-title
					slot="header"
					text="Adres"
					heading-level="2"
					size="display-4"
				></nldd-title>
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

/**
 * Zonder kop is een sectie alleen afstand: de velden staan dan los van wat
 * ervoor en erna komt.
 */
export const ZonderKop = {
	render: () => html`
		<nldd-form novalidate>
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
