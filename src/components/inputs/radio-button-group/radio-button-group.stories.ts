import { html } from 'lit';
import './radio-button-group.js';
import '../radio-button-field/radio-button-field.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
/**
 * De Radio Button Group groepeert `nldd-radio-button-field` elementen, beheert
 * toetsenbordnavigatie en geeft `name` en `disabled` door aan alle velden.
 * Gebruik altijd binnen `nldd-form-field` voor het groepslabel.
 *
 * ## Gebruik
 * ```html
 * <nldd-form-field label="Kies een optie">
 *   <nldd-radio-button-group name="option">
 *     <nldd-radio-button-field value="1" label="Optie 1"></nldd-radio-button-field>
 *     <nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
 *   </nldd-radio-button-group>
 * </nldd-form-field>
 * ```
 */
export default {
	title: 'Components/Inputs/Radio Button Group',
	component: 'nldd-radio-button-group',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/radio-button-group/radio-button-group.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		name: {
			control: 'text',
			description: 'Naam doorgegeven aan alle velden',
		},
		required: {
			control: 'boolean',
			description: 'Markeert de groep als verplicht',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Schakelt alle velden uit',
			table: { defaultValue: { summary: false } },
		},
	},
	args: {
		name: 'demo',
		required: false,
		invalid: false,
		disabled: false,
	},
};

const Template = ({ name, required, invalid, disabled }: Record<string, any>) => html`
	<nldd-form label-alignment="right" novalidate>
		<nldd-form-field label="Kies een optie">
			<nldd-radio-button-group
				name=${name}
				?invalid=${invalid}
				?required=${required}
				?disabled=${disabled}
			>
				<nldd-radio-button-field value="1" checked label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
				<nldd-radio-button-field value="3" label="Optie 3"></nldd-radio-button-field>
			</nldd-radio-button-group>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group orientation="horizontal">
				<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { disabled: true },
};

export const VeldDisabled = {
	name: 'Veld disabled',
	render: () => html`
	<nldd-form label-alignment="right" novalidate>
		<nldd-form-field label="Kies een optie">
			<nldd-radio-button-group name="demo">
				<nldd-radio-button-field value="1" checked label="Optie 1"></nldd-radio-button-field>
				<nldd-radio-button-field value="2" label="Optie 2"></nldd-radio-button-field>
				<nldd-radio-button-field value="3" label="Optie 3 (uitgeschakeld)" disabled></nldd-radio-button-field>
			</nldd-radio-button-group>
		</nldd-form-field>
		<nldd-form-actions>
			<nldd-button-group orientation="horizontal">
				<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`,
	parameters: { controls: { disable: true } },
};
