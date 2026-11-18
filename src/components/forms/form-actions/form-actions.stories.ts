import { html } from 'lit';
import './form-actions.js';
import '../form/form.js';
import '../form-field/form-field.js';
import '../../inputs/text-field/text-field.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-form-actions` zet de knoppen onderaan een formulier, meestal een
 * verzendknop of een `nldd-button-group`. Gebruik het als laatste blok in een
 * `nldd-form`, onder de velden. Het volgt dezelfde lay-out als
 * `nldd-form-field`, dus de knoppen lijnen uit met de velden erboven.
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
		<nldd-form-field
			label-alignment=${labelAlignment}
			label="E-mail"
		>
			<nldd-text-field
				name="email"
				autocomplete="email"
				type="email"
			></nldd-text-field>
		</nldd-form-field>
		<nldd-form-actions label-alignment=${labelAlignment}>
			<nldd-button-group>
				<nldd-button
					appearance="primary"
					type="submit"
					text="Bewaar"
				></nldd-button>
			</nldd-button-group>
		</nldd-form-actions>
	</nldd-form>
`;

export const Standaard = {
	render: Template,
};

/**
 * Met `label-alignment="right"` staan de labels naast de velden. De knoppen
 * schuiven dan mee in en beginnen waar de velden beginnen.
 */
export const RechtsUitgelijnd = {
	render: Template,
	args: {
		labelAlignment: 'right',
	},
};
