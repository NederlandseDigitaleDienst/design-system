import { html } from 'lit';
import './checkbox-group.js';
import '../checkbox-field/checkbox-field.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';
/**
 * `nldd-checkbox-group` groepeert `nldd-checkbox-field` elementen zoals
 * `nldd-radio-button-group` dat doet met keuzerondjes: dezelfde opbouw, één `name` voor
 * alle velden, en een groep die een schermlezer met het label aankondigt.
 * Elk selectievakje is een eigen stap voor Tab. Met `required` moet er
 * minstens één aangevinkt zijn. In een formulier geeft `nldd-form-field` de
 * groep zijn label; daarbuiten geef je hem een naam met `accessible-label`.
 *
 * ## Gebruik
 * ```html
 * <nldd-form-field label="Waarvoor vraag je subsidie aan?">
 *   <nldd-checkbox-group name="maatregel">
 *     <nldd-checkbox-field value="dakisolatie" label="Dakisolatie"></nldd-checkbox-field>
 *     <nldd-checkbox-field value="warmtepomp" label="Warmtepomp"></nldd-checkbox-field>
 *   </nldd-checkbox-group>
 * </nldd-form-field>
 * ```
 */
export default {
	title: 'Components/Inputs/Checkbox Group',
	component: 'nldd-checkbox-group',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/checkbox-group/checkbox-group.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		accessibleLabel: 'Waarvoor vraag je subsidie aan?',
		invalid: false,
		name: 'maatregel',
		required: false,
		disabled: false,
	},
	argTypes: {
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers. In een `nldd-form-field` geeft het veld de groep zijn naam.',
		},
		accessibleLabeledBy: {
			name: 'accessible-labeled-by',
			control: false,
			description: 'Id van een element elders op de pagina dat deze groep benoemt, zoals `aria-labelledby`.',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam doorgegeven aan alle velden',
		},
		required: {
			control: 'boolean',
			description: 'Minstens één selectievakje moet aangevinkt zijn',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Schakelt alle velden uit',
			table: { defaultValue: { summary: false } },
		},
	},
};

const fields = html`
	<nldd-checkbox-field
		value="isolatie"
		label="Isolatie"
	>
		<nldd-checkbox-field
			slot="children"
			value="dakisolatie"
			checked
			label="Dakisolatie"
		></nldd-checkbox-field>
		<nldd-checkbox-field
			slot="children"
			value="vloerisolatie"
			label="Vloerisolatie"
		></nldd-checkbox-field>
	</nldd-checkbox-field>
	<nldd-checkbox-field
		value="warmtepomp"
		label="Warmtepomp"
	></nldd-checkbox-field>
	<nldd-checkbox-field
		value="zonnepanelen"
		label="Zonnepanelen"
	></nldd-checkbox-field>
`;

const Template = ({ accessibleLabel, invalid, name, required, disabled }: Record<string, unknown>) => html`
	<nldd-checkbox-group
		accessible-label=${accessibleLabel}
		?invalid=${invalid}
		name=${name}
		?required=${required}
		?disabled=${disabled}
	>
		${fields}
	</nldd-checkbox-group>
`;

export const Standaard = {
	render: Template,
};

/** In een formulier geeft het `nldd-form-field` de groep zijn label. */
export const InEenFormulier = {
	name: 'In een formulier',
	render: () => html`
	<nldd-form
		label-alignment="right"
		novalidate
	>
		<nldd-form-field label="Waarvoor vraag je subsidie aan?">
			<nldd-checkbox-group name="maatregel">
				${fields}
			</nldd-checkbox-group>
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
	parameters: { controls: { disable: true } },
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { disabled: true },
};

export const VeldDisabled = {
	name: 'Veld disabled',
	render: () => html`
	<nldd-checkbox-group
		name="maatregel"
		accessible-label="Waarvoor vraag je subsidie aan?"
	>
		<nldd-checkbox-field
			value="dakisolatie"
			checked
			label="Dakisolatie"
		></nldd-checkbox-field>
		<nldd-checkbox-field
			value="warmtepomp"
			label="Warmtepomp"
		></nldd-checkbox-field>
		<nldd-checkbox-field
			value="zonnepanelen"
			label="Zonnepanelen"
			disabled
		></nldd-checkbox-field>
	</nldd-checkbox-group>
`,
	parameters: { controls: { disable: true } },
};
