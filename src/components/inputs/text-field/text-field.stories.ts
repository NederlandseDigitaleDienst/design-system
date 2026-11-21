import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './text-field.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/button-group/button-group.js';
import '../../layout/container/container.js';

/**
 * `nldd-text-field` is een tekstveld van één regel, voor bijvoorbeeld een naam,
 * een e-mailadres of een code. Zet het in een `nldd-form-field`, dat het label
 * en de maat regelt. Voor tekst over meer regels is er
 * `nldd-multi-line-text-field`.
 */
export default {
	title: 'Components/Inputs/Text Field',
	component: 'nldd-text-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/text-field/text-field.ts',
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
		name: {
			control: 'text',
			description: 'Input name for form submission',
		},
		value: {
			control: 'text',
			description: 'Input value',
		},
		type: {
			control: 'select',
			options: ['text', 'email', 'tel', 'url'],
			description: 'Input type',
			table: { defaultValue: { summary: 'text' } },
		},
		keyboard: {
			control: 'select',
			options: ['(geen)', 'none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'],
			mapping: { '(geen)': undefined },
			description: 'Welk virtueel toetsenbord opent op een telefoon of tablet (inputmode). Verandert niets aan wat het veld accepteert',
			table: { defaultValue: { summary: '(geen)' } },
		},
		enterKey: {
			name: 'enter-key',
			control: 'select',
			options: ['(geen)', 'enter', 'done', 'go', 'next', 'previous', 'search', 'send'],
			mapping: { '(geen)': undefined },
			description: 'Wat de Enter-toets op het virtuele toetsenbord zegt (enterkeyhint)',
			table: { defaultValue: { summary: '(geen)' } },
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
			description: 'Required state',
			table: { defaultValue: { summary: false } },
		},
		autocomplete: {
			control: 'text',
			description: 'Browser autofill hint (HTML autocomplete attribute, bv. "name", "email", "off")',
		},
		noSpellcheck: {
			name: 'no-spellcheck',
			control: 'boolean',
			description: 'Disables browser spellchecking on the inner input',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Readonly state',
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
		placeholder: 'Tekstveld',
		accessibleDescription: '',
		accessibleDescribedBy: '',
		valid: false,
		invalid: false,
		name: '',
		value: '',
		type: 'text',
		keyboard: undefined,
		enterKey: undefined,
		minlength: null,
		maxlength: null,
		pattern: '',
		required: false,
		autocomplete: '',
		noSpellcheck: false,
		readonly: false,
		disabled: false,
	},
};

const Template = ({ size, width, placeholder, accessibleDescription, valid, invalid, name, value, type, keyboard, enterKey, minlength, maxlength, pattern, required, autocomplete, noSpellcheck, readonly, disabled }: Record<string, any>) => html`
	<nldd-text-field
		size=${size}
		width=${width}
		.placeholder=${placeholder}
		accessible-description=${accessibleDescription || nothing}
		?valid=${valid}
		?invalid=${invalid}
		name=${name}
		.value=${value}
		type=${type}
		keyboard=${keyboard || nothing}
		enter-key=${enterKey || nothing}
		minlength=${minlength ?? nothing}
		maxlength=${maxlength ?? nothing}
		pattern=${pattern || nothing}
		?required=${required}
		autocomplete=${autocomplete}
		?no-spellcheck=${noSpellcheck}
		?readonly=${readonly}
		?disabled=${disabled}
	></nldd-text-field>
`;

export const Standaard = {
	render: Template,
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-text-field placeholder="Neutraal"></nldd-text-field>
		<nldd-text-field
			.value=${'Geldige invoer'}
			valid
		></nldd-text-field>
		<nldd-text-field
			.value=${'Ongeldige invoer'}
			invalid
		></nldd-text-field>
		<nldd-text-field
			.value=${'Uitgeschakeld'}
			disabled
		></nldd-text-field>
		<nldd-text-field
			.value=${'Alleen-lezen'}
			readonly
		></nldd-text-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const Grootten = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-text-field placeholder="Middel (md)"></nldd-text-field>
		<nldd-text-field
			placeholder="Klein (sm)"
			size="sm"
		></nldd-text-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const MetKnop = {
	render: () => html`
	<nldd-container gap="24">
		<nldd-form novalidate>
			<nldd-form-field label="E-mailadres">
				<nldd-text-field
					name="email"
					type="email"
					autocomplete="email"
				>
					<nldd-icon-button
						slot="button"
						appearance="primary"
						type="submit"
						icon="arrow-right"
						text="Schrijf in"
					></nldd-icon-button>
				</nldd-text-field>
			</nldd-form-field>
		</nldd-form>
		<nldd-form novalidate>
			<nldd-form-field label="Kortingscode">
				<nldd-text-field name="code">
					<nldd-button
						slot="button"
						type="submit"
						text="Verzilver"
					></nldd-button>
				</nldd-text-field>
			</nldd-form-field>
		</nldd-form>
		<nldd-form novalidate>
			<nldd-form-field label="Kortingscode">
				<nldd-text-field
					name="code"
					size="sm"
				>
					<nldd-button
						slot="button"
						type="submit"
						text="Verzilver"
					></nldd-button>
				</nldd-text-field>
			</nldd-form-field>
		</nldd-form>
	</nldd-container>
`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'The one action of a form that is only this field sits inside it, in the `button` slot. The field sizes the button itself.',
			},
		},
	},
};

export const InteractiefVoorbeeld = {
	render: () => html`
	<nldd-form
		label-alignment="right"
		novalidate
	>
		<nldd-form-field label="Volledige naam">
			<nldd-text-field
				name="name"
				@input=${action('input')}
				@change=${action('change')}
			></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="E-mail">
			<nldd-text-field
				name="email"
				type="email"
				@input=${action('input')}
				@change=${action('change')}
			></nldd-text-field>
		</nldd-form-field>
		<nldd-form-field label="Telefoonnummer">
			<nldd-text-field
				name="phone"
				type="tel"
				@input=${action('input')}
				@change=${action('change')}
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
				story: 'Open the browser console to see `input` and `change` events.',
			},
	},
},
};
