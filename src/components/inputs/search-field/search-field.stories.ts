import { html, nothing } from 'lit';
import './search-field.js';

/**
 * De Search Field component is een zoekveld met zoekicoon, een optionele dismiss knop
 * en een optionele zoekknop.
 */
export default {
	title: 'Components/Inputs/Search Field',
	component: 'nldd-search-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/search-field/search-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		width: '',
		placeholder: 'Zoeken',
		accessibleLabel: '',
		showSearchButton: false,
		invalid: false,
		disabled: false,
		name: '',
		value: '',
		required: false,
		minlength: null,
		maxlength: null,
		pattern: '',
		noSpellcheck: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte van het veld',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: 'Vaste breedte als CSS-lengte (bv. "240px"); leeg vult de beschikbare breedte',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholdertekst',
			table: { defaultValue: { summary: 'Zoeken' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van het veld; valt terug op de placeholder',
		},
		showSearchButton: {
			name: 'show-search-button',
			control: 'boolean',
			description: 'Toont een zoekknop aan de rechterkant',
			table: { defaultValue: { summary: false } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldig; aangekondigd met aria-invalid, er wordt niets voor getekend',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam voor formulierverwerking',
		},
		value: {
			control: 'text',
			description: 'Huidige zoekwaarde',
		},
		required: {
			control: 'boolean',
			description: 'Verplicht veld',
			table: { defaultValue: { summary: false } },
		},
		minlength: {
			control: 'number',
			description: 'Minimaal aantal tekens',
			table: { type: { summary: 'number' } },
		},
		maxlength: {
			control: 'number',
			description: 'Maximaal aantal tekens',
			table: { type: { summary: 'number' } },
		},
		pattern: {
			control: 'text',
			description: 'Reguliere expressie waar de waarde aan moet voldoen, als het native `pattern`.',
		},
		noSpellcheck: {
			name: 'no-spellcheck',
			control: 'boolean',
			description: 'Zet de spellingcontrole van de browser uit',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({ size, width, placeholder, accessibleLabel, showSearchButton, invalid, disabled, name, value, required, minlength, maxlength, pattern, noSpellcheck }: Record<string, any>) => html`
	<nldd-search-field
		size=${size}
		width=${width}
		placeholder=${placeholder}
		accessible-label=${accessibleLabel}
		?show-search-button=${showSearchButton}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name}
		value=${value}
		?required=${required}
		minlength=${minlength ?? nothing}
		maxlength=${maxlength ?? nothing}
		pattern=${pattern || nothing}
		?no-spellcheck=${noSpellcheck}
	></nldd-search-field>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const MetZoekKnop = {
	render: Template,
	args: { showSearchButton: true },
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<nldd-search-field size="md" placeholder="Zoeken"></nldd-search-field>
		<nldd-search-field size="md" placeholder="Zoeken" value="Zoekterm"></nldd-search-field>
		<nldd-search-field size="md" placeholder="Zoeken" show-search-button></nldd-search-field>
		<nldd-search-field size="md" placeholder="Zoeken" value="Zoekterm" show-search-button></nldd-search-field>
		<nldd-search-field size="sm" placeholder="Zoeken"></nldd-search-field>
		<nldd-search-field size="sm" placeholder="Zoeken" value="Zoekterm"></nldd-search-field>
		<nldd-search-field size="sm" placeholder="Zoeken" show-search-button></nldd-search-field>
		<nldd-search-field size="sm" placeholder="Zoeken" value="Zoekterm" show-search-button></nldd-search-field>
		<nldd-search-field size="md" placeholder="Zoeken" disabled></nldd-search-field>
		<nldd-search-field size="md" placeholder="Zoeken" value="Zoekterm" disabled></nldd-search-field>
	</div>
`,
	parameters: { controls: { disable: true } },
};
