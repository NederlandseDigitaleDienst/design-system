import { html } from 'lit';
import './form.js';
import '../../inputs/text-field/text-field.js';
import '../../inputs/password-field/password-field.js';
import '../form-field/form-field.js';
import '../form-actions/form-actions.js';
import '../form-section/form-section.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form` is een light-DOM wrapper die een echt `<form>` element rendert
 * rond z'n children. Dit is nodig om browser-autofill (Chrome, Safari) te
 * laten werken met onze shadow-DOM inputs.
 *
 * ## Gebruik
 * ```html
 * <nldd-form name="profile" novalidate>
 *   <nldd-form-field label="E-mail">
 *     <nldd-text-field name="email" autocomplete="email" type="email"></nldd-text-field>
 *   </nldd-form-field>
 *   <nldd-button type="submit" text="Verstuur"></nldd-button>
 * </nldd-form>
 * ```
 *
 * Importeer `nldd-form.css` globaal in je applicatie voor de default layout.
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
		status: { type: 'experimental' },
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
			<nldd-text-field name="email" autocomplete="email" type="email"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="Wachtwoord">
			<nldd-password-field name="password" autocomplete="current-password"></nldd-password-field>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group>
				<nldd-button variant="primary" type="submit" text="Log in"></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
};

export const Login = {
	render: () => html`
		<nldd-form name="login" label-alignment="right" novalidate>
			<nldd-form-field label="E-mail">
				<nldd-text-field name="email" autocomplete="email" type="email" required></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Wachtwoord">
				<nldd-password-field name="password" autocomplete="current-password" required></nldd-password-field>
			</nldd-form-field>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button variant="primary" type="submit" text="Log in"></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	`,
	parameters: { controls: { disable: true } },
};

export const Persoonsgegevens = {
	render: () => html`
		<nldd-form name="profile" label-alignment="right" novalidate>
			<nldd-form-field label="Voornaam">
				<nldd-text-field name="given-name" autocomplete="given-name" required></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Achternaam">
				<nldd-text-field name="family-name" autocomplete="family-name" required></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="E-mail">
				<nldd-text-field name="email" autocomplete="email" type="email" required></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Telefoonnummer">
				<nldd-text-field name="tel" autocomplete="tel" type="tel"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Straat en huisnummer">
				<nldd-text-field name="street-address" autocomplete="street-address"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Postcode">
				<nldd-text-field name="postal-code" autocomplete="postal-code"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Plaats">
				<nldd-text-field name="address-level2" autocomplete="address-level2"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-field label="Land">
				<nldd-text-field name="country-name" autocomplete="country-name"></nldd-text-field>
			</nldd-form-field>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
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
 * Groepeer bij elkaar horende velden met `nldd-form-section`. Die rendert een
 * echte `<fieldset>` met `<legend>`, dus een schermlezer noemt de naam van de
 * groep zodra je het eerste veld erin binnenkomt. Een eigen kop met een `div`
 * eromheen doet dat niet.
 */
export const MetSecties = {
	render: () => html`
		<nldd-form name="aanvraag" label-alignment="right" novalidate>
			<nldd-form-section text="Persoon">
				<nldd-form-field label="Voornaam">
					<nldd-text-field name="given-name" autocomplete="given-name" required></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="Achternaam">
					<nldd-text-field name="family-name" autocomplete="family-name" required></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
			<nldd-form-section text="Adres" supporting-text="Waar we de beschikking naartoe sturen.">
				<nldd-form-field label="Straat en huisnummer">
					<nldd-text-field name="street-address" autocomplete="street-address"></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="Postcode">
					<nldd-text-field name="postal-code" autocomplete="postal-code"></nldd-text-field>
				</nldd-form-field>
				<nldd-form-field label="Plaats">
					<nldd-text-field name="address-level2" autocomplete="address-level2"></nldd-text-field>
				</nldd-form-field>
			</nldd-form-section>
			<nldd-form-actions>
				<nldd-button-group>
					<nldd-button variant="primary" type="submit" text="Versturen"></nldd-button>
				</nldd-button-group>
			</nldd-form-actions>
		</nldd-form>
	`,
	parameters: { controls: { disable: true } },
};
