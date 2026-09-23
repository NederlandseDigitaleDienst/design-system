import { html, nothing } from 'lit';
import './password-field.js';

/**
 * De Password Field component voor wachtwoordinvoer met zichtbaarheidstoggle.
 *
 * ## Gebruik
 * ```html
 * <nldd-password-field placeholder="Password field"></nldd-password-field>
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
		status: {
			type: 'stable',
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
		name: {
			control: 'text',
			description: 'Form field name',
		},
		value: {
			control: 'text',
			description: 'Input value',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text',
			table: { defaultValue: { summary: 'Password field' } },
		},
		showButtonText: {
			name: 'show-button-text',
			control: 'text',
			description: 'Zichtbare knoptekst wanneer gemaskeerd',
			table: { defaultValue: { summary: 'Toon' } },
		},
		hideButtonText: {
			name: 'hide-button-text',
			control: 'text',
			description: 'Zichtbare knoptekst wanneer zichtbaar',
			table: { defaultValue: { summary: 'Verberg' } },
		},
		showButtonAccessibleLabel: {
			name: 'show-button-accessible-label',
			control: 'text',
			description: 'aria-label for toggle button when masked',
			table: { defaultValue: { summary: 'Toon wachtwoord' } },
		},
		hideButtonAccessibleLabel: {
			name: 'hide-button-accessible-label',
			control: 'text',
			description: 'aria-label for toggle button when unmasked',
			table: { defaultValue: { summary: 'Verberg wachtwoord' } },
		},
		autocomplete: {
			control: 'select',
			options: ['(geen)', 'off', 'current-password', 'new-password'],
			mapping: { '(geen)': '' },
			description: 'Browser autofill hint (HTML autocomplete attribute)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		masked: {
			control: 'boolean',
			description: 'Whether the password is masked',
			table: { defaultValue: { summary: true } },
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
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
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
	},
	args: {
		size: 'md',
		width: '',
		name: 'password',
		value: '',
		placeholder: 'Password field',
		showButtonText: 'Toon',
		hideButtonText: 'Verberg',
		showButtonAccessibleLabel: 'Toon wachtwoord',
		hideButtonAccessibleLabel: 'Verberg wachtwoord',
		autocomplete: '',
		masked: true,
		valid: false,
		invalid: false,
		accessibleLabel: '',
		readonly: false,
		disabled: false,
		minlength: null,
		maxlength: null,
		pattern: '',
		required: false,
	},
};

const Template = ({ size, name, value, placeholder, showButtonText, hideButtonText, showButtonAccessibleLabel, hideButtonAccessibleLabel, autocomplete, masked, valid, invalid, accessibleLabel, readonly, disabled, minlength, maxlength, pattern, required, width }: Record<string, any>) => html`
	<nldd-password-field
		minlength=${minlength ?? nothing}
		maxlength=${maxlength ?? nothing}
		.value=${value}
		.placeholder=${placeholder}
		size=${size}
		?valid=${valid}
		?readonly=${readonly}
		?invalid=${invalid}
		?disabled=${disabled}
		pattern=${pattern || nothing}
		.masked=${masked}
		show-button-text=${showButtonText}
		hide-button-text=${hideButtonText}
		show-button-accessible-label=${showButtonAccessibleLabel}
		hide-button-accessible-label=${hideButtonAccessibleLabel}
		name=${name}
		?required=${required}
		autocomplete=${autocomplete}
		width=${width}
		accessible-label=${accessibleLabel || nothing}
	></nldd-password-field>
`;

export const Standaard = {
	render: Template,
};

export const ZonderMasked = {
	name: 'Zonder masked',
	render: Template,
	args: {
		value: 'visible-password',
		masked: false,
	},
};

export const ToestandValid = {
	name: 'Toestand valid',
	render: Template,
	args: {
		value: 'strong-password-123',
		valid: true,
	},
};

export const ToestandInvalid = {
	name: 'Toestand invalid',
	render: Template,
	args: {
		value: '123',
		invalid: true,
	},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: {
		value: 'disabled-password',
		disabled: true,
	},
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-password-field placeholder="Neutral"></nldd-password-field>
		<nldd-password-field .value=${"strong-password"} valid></nldd-password-field>
		<nldd-password-field .value=${"123"} invalid></nldd-password-field>
		<nldd-password-field .value=${"disabled"} disabled></nldd-password-field>
		<nldd-password-field .value=${"unmasked"} .masked=${false}></nldd-password-field>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const Grootten = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-password-field placeholder="Medium (md)"></nldd-password-field>
		<nldd-password-field placeholder="Small (sm)" size="sm"></nldd-password-field>
	</div>
`,
	parameters: { controls: { disable: true } },
};
