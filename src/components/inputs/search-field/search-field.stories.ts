import { html, nothing } from 'lit';
import './search-field.js';
import '../../layout/container/container.js';

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
		shortcut: '',
		shortcutMac: '',
		shortcutWindows: '',
		shortcutLinux: '',
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
		shortcut: {
			control: 'text',
			description: 'Sneltoets rechts in het lege veld, bijvoorbeeld `/` of `Ctrl+K`. Verdwijnt bij focus en zodra er een waarde staat. Alleen weergave: de toets zelf koppel je in je app.',
		},
		shortcutMac: {
			name: 'shortcut-mac',
			control: 'text',
			description: 'Sneltoets op macOS (en iOS), als die afwijkt van `shortcut`.',
		},
		shortcutWindows: {
			name: 'shortcut-windows',
			control: 'text',
			description: 'Sneltoets op Windows, als die afwijkt van `shortcut`.',
		},
		shortcutLinux: {
			name: 'shortcut-linux',
			control: 'text',
			description: 'Sneltoets op Linux en ChromeOS, als die afwijkt van `shortcut`.',
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

const Template = ({ size, width, placeholder, shortcut, shortcutMac, shortcutWindows, shortcutLinux, accessibleLabel, showSearchButton, invalid, disabled, name, value, required, minlength, maxlength, pattern, noSpellcheck }: Record<string, any>) => html`
	<nldd-search-field
		size=${size}
		width=${width}
		placeholder=${placeholder}
		shortcut=${shortcut || nothing}
		shortcut-mac=${shortcutMac || nothing}
		shortcut-windows=${shortcutWindows || nothing}
		shortcut-linux=${shortcutLinux || nothing}
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
	<nldd-container gap="16">
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
		></nldd-search-field>
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
			value="Zoekterm"
		></nldd-search-field>
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
			show-search-button
		></nldd-search-field>
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
			value="Zoekterm"
			show-search-button
		></nldd-search-field>
		<nldd-search-field
			size="sm"
			placeholder="Zoeken"
		></nldd-search-field>
		<nldd-search-field
			size="sm"
			placeholder="Zoeken"
			value="Zoekterm"
		></nldd-search-field>
		<nldd-search-field
			size="sm"
			placeholder="Zoeken"
			show-search-button
		></nldd-search-field>
		<nldd-search-field
			size="sm"
			placeholder="Zoeken"
			value="Zoekterm"
			show-search-button
		></nldd-search-field>
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
			disabled
		></nldd-search-field>
		<nldd-search-field
			size="md"
			placeholder="Zoeken"
			value="Zoekterm"
			disabled
		></nldd-search-field>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};

export const MetSneltoets = {
	name: 'Met shortcut',
	render: Template,
	args: { shortcut: '/', placeholder: 'Zoek een aanvraag' },
};
