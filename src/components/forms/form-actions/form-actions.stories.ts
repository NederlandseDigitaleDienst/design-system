import { html } from 'lit';
import './form-actions.js';
import '../form/form.js';
import '../form-field/form-field.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-actions` plaatst form-knoppen (typisch een submit-button of
 * button-group) onderaan een formulier. Volgt dezelfde responsive layout als
 * `nldd-form-field`: met `label-alignment="right"` of `"left"` lijnt de
 * inhoud uit met de invoervelden, dankzij een onzichtbaar spacer-kolom.
 *
 * Gebruik dezelfde `label-alignment` als de form-fields in hetzelfde formulier.
 */
export default {
	title: 'Components/Forms/Form Actions',
	component: 'nldd-form-actions',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/forms/form-actions/form-actions.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		labelAlignment: 'top',
	},
	argTypes: {
		labelAlignment: {
			name: 'label-alignment',
			control: 'select',
			options: ['top', 'right', 'left'],
			table: { defaultValue: { summary: 'top' } },
		},
	},
};

const Template = ({ labelAlignment }: Record<string, any>) => html`
	<nldd-form novalidate>
		<nldd-form-field label-alignment=${labelAlignment} label="E-mail">
			<nldd-text-field name="email" autocomplete="email" type="email"></nldd-text-field>
		</nldd-form-field>
		<nldd-form-actions label-alignment=${labelAlignment}>
			<nldd-button-group>
				<nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
};

export const RechtsUitgelijnd = {
	render: Template,
	args: {
		labelAlignment: 'right',
	},
};
