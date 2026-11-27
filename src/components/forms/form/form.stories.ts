import { html } from 'lit';
import './form.js';
import '../../inputs/text-field/text-field.js';
import '../../inputs/password-field/password-field.js';
import '../form-field/form-field.js';
import '../form-actions/form-actions.js';
import '../form-section/form-section.js';
import '../../content/title/title.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form` zet een echt `<form>` om de velden van een formulier, buiten de
 * shadow DOM. Daardoor kan de browser de velden automatisch invullen. Gebruik
 * het om elk formulier, met een `nldd-form-field` per veld en
 * `nldd-form-actions` voor de knoppen.
 *
 * ## Gebruik
 * ```html
 * <nldd-form
 * 	name="profile"
 * 	novalidate
 * >
 *   <nldd-form-field label="E-mail">
 *     <nldd-text-field name="email" autocomplete="email" type="email"></nldd-text-field>
 *   </nldd-form-field>
 *   <nldd-button type="submit" text="Verstuur"></nldd-button>
 * </nldd-form>
 * ```
 */
export default {
	title: 'Components/Forms/Form',
	component: 'nldd-form',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/forms/form/form.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		labelAlignment: 'right',
		name: 'demo-form',
		autocomplete: '',
		method: '',
		action: '',
		novalidate: false,
	},
	argTypes: {
		labelAlignment: {
			name: 'label-alignment',
			control: 'select',
			options: ['top', 'right', 'left'],
			description: 'Default label-alignment voor descendant form-fields en form-actions',
			table: { defaultValue: { summary: 'top' } },
		},
		name: {
			control: 'text',
			description: 'Form name attribuut',
		},
		autocomplete: {
			control: 'select',
			options: ['(geen)', 'on', 'off'],
			mapping: { '(geen)': '' },
			description: 'Form-level autofill toggle',
			table: { defaultValue: { summary: '(geen)' } },
		},
		method: {
			control: 'select',
			options: ['(geen)', 'get', 'post', 'dialog'],
			mapping: { '(geen)': '' },
			description: 'HTTP method',
			table: { defaultValue: { summary: '(geen)' } },
		},
		action: {
			control: 'text',
			description: 'URL endpoint voor submission',
		},
		novalidate: {
			control: 'boolean',
			description: 'Skip native browser-validatie',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

const Template = ({ labelAlignment, name, autocomplete, method, action, novalidate }: Record<string, any>) => html`
	<nldd-form
		label-alignment=${labelAlignment}
		name=${name || ''}
		autocomplete=${autocomplete || ''}
		method=${method || ''}
		action=${action || ''}
		?novalidate=${novalidate}
	>
		<nldd-form-field label="E-mail">
			<nldd-text-field
				name="email"
				autocomplete="email"
				type="email"
			></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="Wachtwoord">
			<nldd-password-field
				name="password"
				autocomplete="current-password"
			></nldd-password-field>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group>
				<nldd-button
					appearance="primary"
					type="submit"
					text="Log in"
				></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
};

export const Login = {
	render: () => html`
		<nldd-form
			name="login"
			label-alignment="right"
			novalidate
		>
			<nldd-form-field label="E-mail">
				<nldd-text-field
					name="email"
					autocomplete="email"
					type="email"
					required
				></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Wachtwoord">
				<nldd-password-field
					name="password"
					autocomplete="current-password"
					required
				></nldd-password-field>
			</nldd-form-field>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button
						appearance="primary"
						type="submit"
						text="Log in"
					></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	`,
	parameters: { controls: { disable: true } },
};

export const Persoonsgegevens = {
	render: () => html`
		<nldd-form
			name="profile"
			label-alignment="right"
			novalidate
		>
			<nldd-form-field label="Naam">
				<nldd-text-field
					name="name"
					autocomplete="name"
					required
				></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="E-mail">
				<nldd-text-field
					name="email"
					autocomplete="email"
					type="email"
					required
				></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Telefoonnummer">
				<nldd-text-field
					name="tel"
					autocomplete="tel"
					type="tel"
				></nldd-text-field>
			</nldd-form-field>
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
			<nldd-form-field label="Land">
				<nldd-text-field
					name="country-name"
					autocomplete="country-name"
				></nldd-text-field>
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
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Demonstreert correct gebruik van `autocomplete` tokens voor persoonsgegevens. Browser autofill moet alle velden vullen na het invullen en opslaan in Chrome/Safari.',
			},
		},
	},
};

/**
 * Deel een langer formulier op in `nldd-form-section`s, elk met een
 * `nldd-title` in het slot `header`. De sectie zet de afstanden van een
 * formulier om de kop en de velden.
 */
export const MetSecties = {
	render: () => html`
		<nldd-form
			name="aanvraag"
			label-alignment="right"
			novalidate
		>
			<nldd-form-section>
				<nldd-title
					slot="header"
					text="Persoon"
					heading-level="2"
					size="display-4"
				></nldd-title>
				<nldd-form-field label="Naam">
					<nldd-text-field
						name="name"
						autocomplete="name"
						required
					></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
			<nldd-form-section>
				<nldd-title
					slot="header"
					text="Adres"
					supporting-text="Waar we de beschikking naartoe sturen."
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
						text="Verstuur"
					></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	`,
	parameters: { controls: { disable: true } },
};
