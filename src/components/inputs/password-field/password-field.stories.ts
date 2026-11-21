import { html, nothing } from 'lit';
import './password-field.js';
import '../../layout/container/container.js';

/**
 * `nldd-password-field` is een veld voor een wachtwoord, met een knop die het
 * wachtwoord laat zien of weer verbergt.
 *
 * ## Gebruik
 * ```html
 * <nldd-password-field placeholder="Wachtwoord"></nldd-password-field>
 * ```
 */
export default {
	title: 'Components/Inputs/Password Field',
	component: 'nldd-password-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/password-field/password-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Size variant',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: 'Optional fixed width (any CSS length, bv. "240px"). Leeg = stretch.',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		accessibleDescription: {
			name: 'accessible-description',
			control: 'text',
			description: 'Toegankelijke beschrijving voor screen readers, gelezen na de naam, de rol en de toestand. Vervangt nooit het label.',
		},
		accessibleDescribedBy: {
			name: 'accessible-described-by',
			control: false,
			description: "Id's van elementen elders op de pagina die dit element beschrijven, zoals `aria-describedby`, maar doorgegeven aan de control binnenin. Gaat voor `accessible-description`.",
		},
		valid: {
			control: 'boolean',
			description: 'Valid state',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Invalid state',
			table: { defaultValue: { summary: false } },
		},
		masked: {
			control: 'boolean',
			description: 'Whether the password is masked',
			table: { defaultValue: { summary: true } },
		},
		name: {
			control: 'text',
			description: 'Form field name',
		},
		value: {
			control: 'text',
			description: 'Input value',
		},
		minlength: {
			control: 'number',
			description: 'Minimaal aantal tekens.',
			table: { type: { summary: 'number' } },
		},
		maxlength: {
			control: 'number',
			description: 'Maximaal aantal tekens.',
			table: { type: { summary: 'number' } },
		},
		pattern: {
			control: 'text',
			description: 'Reguliere expressie waar de waarde aan moet voldoen, als het native `pattern`.',
		},
		required: {
			control: 'boolean',
			description: 'Verplichte toestand',
			table: { defaultValue: { summary: false } },
		},
		autocomplete: {
			control: 'select',
			options: ['(geen)', 'off', 'current-password', 'new-password'],
			mapping: { '(geen)': '' },
			description: 'Browser autofill hint (HTML autocomplete attribute)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen toestand: de waarde blijft leesbaar en selecteerbaar, maar is hier niet te wijzigen',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Disabled state',
			table: { defaultValue: { summary: false } },
		},
	},
	args: {
		size: 'md',
		width: '',
		placeholder: 'Wachtwoord',
		accessibleLabel: '',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		valid: false,
		invalid: false,
		masked: true,
		name: 'password',
		value: '',
		minlength: null,
		maxlength: null,
		pattern: '',
		required: false,
		autocomplete: '',
		readonly: false,
		disabled: false,
	},
};

const Template = ({ size, width, placeholder, accessibleLabel, accessibleDescription, valid, invalid, masked, name, value, minlength, maxlength, pattern, required, autocomplete, readonly, disabled }: Record<string, any>) => html`
	<nldd-password-field
		size=${size}
		width=${width}
		.placeholder=${placeholder}
		accessible-label=${accessibleLabel || nothing}
		accessible-description=${accessibleDescription || nothing}
		?valid=${valid}
		?invalid=${invalid}
		.masked=${masked}
		name=${name}
		.value=${value}
		minlength=${minlength ?? nothing}
		maxlength=${maxlength ?? nothing}
		pattern=${pattern || nothing}
		?required=${required}
		autocomplete=${autocomplete}
		?readonly=${readonly}
		?disabled=${disabled}
	></nldd-password-field>
`;

export const Standaard = {
	render: Template,
};

export const ZonderMasked = {
	name: 'Zonder masked',
	render: Template,
	args: {
		masked: false,
		value: 'zichtbaar-wachtwoord',
	},
};

export const ToestandValid = {
	name: 'Toestand valid',
	render: Template,
	args: {
		valid: true,
		value: 'sterk-wachtwoord-123',
	},
};

export const ToestandInvalid = {
	name: 'Toestand invalid',
	render: Template,
	args: {
		invalid: true,
		value: '123',
	},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: {
		disabled: true,
		value: 'uitgeschakeld-wachtwoord',
	},
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-password-field placeholder="Neutraal"></nldd-password-field>
		<nldd-password-field
			.value=${"sterk-wachtwoord"}
			valid
		></nldd-password-field>
		<nldd-password-field
			.value=${"123"}
			invalid
		></nldd-password-field>
		<nldd-password-field
			.value=${"uitgeschakeld"}
			disabled
		></nldd-password-field>
		<nldd-password-field
			.value=${"zichtbaar"}
			.masked=${false}
		></nldd-password-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const Grootten = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-password-field placeholder="Middel (md)"></nldd-password-field>
		<nldd-password-field
			placeholder="Klein (sm)"
			size="sm"
		></nldd-password-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
