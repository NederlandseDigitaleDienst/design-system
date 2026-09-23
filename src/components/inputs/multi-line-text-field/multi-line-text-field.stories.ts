import { action } from 'storybook/actions';
import { html, nothing } from 'lit';
import './multi-line-text-field.js';
import '../../forms/form/form.js';
import '../../forms/form-field/form-field.js';
import '../../forms/form-actions/form-actions.js';
import '../../actions/button/button.js';
import '../../actions/button-group/button-group.js';

/**
 * `nldd-multi-line-text-field` is een meerregelig tekstveld op basis van
 * het native `<textarea>` element. Voor enkele regels: zie `nldd-text-field`.
 *
 * ### Validatie
 * Zet `valid` of `invalid` om het bijbehorende validatie-icoon en de
 * randkleur te tonen.
 *
 * ```html
 * <nldd-multi-line-text-field valid></nldd-multi-line-text-field>
 * <nldd-multi-line-text-field invalid></nldd-multi-line-text-field>
 * ```
 *
 * ### Hoogte en resize
 * Met `rows` zet je de initiële (en minimum) hoogte in regels. Het
 * `resize` attribuut bepaalt hoe het veld kan groeien:
 *
 * - `vertical` (default): gebruiker mag verticaal slepen
 * - `auto`: groeit automatisch mee met de inhoud (`field-sizing: content`)
 * - `none`: vaste hoogte, geen handle
 *
 * ```html
 * <nldd-multi-line-text-field resize="vertical"></nldd-multi-line-text-field>
 * <nldd-multi-line-text-field resize="auto"></nldd-multi-line-text-field>
 * <nldd-multi-line-text-field resize="none"></nldd-multi-line-text-field>
 * ```
 *
 * ### Size
 * Gebruik `size="sm"` voor de compacte variant. Wordt automatisch gezet
 * door `nldd-form-field` via diens `size` attribuut.
 */
export default {
	title: 'Components/Inputs/Multi-line Text Field',
	component: 'nldd-multi-line-text-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/multi-line-text-field/multi-line-text-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		resize: 'auto',
		rows: 3,
		width: '',
		placeholder: 'Schrijf hier je toelichting',
		name: '',
		value: '',
		minlength: null,
		maxlength: null,
		required: false,
		keyboard: undefined,
		enterKey: undefined,
		autocomplete: '',
		noSpellcheck: false,
		accessibleLabel: '',
		valid: false,
		invalid: false,
		readonly: false,
		disabled: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Size variant',
			table: { defaultValue: { summary: 'md' } },
		},
		resize: {
			control: 'select',
			options: ['none', 'vertical', 'auto'],
			description: 'Resize gedrag. "auto" (default) laat het veld meegroeien met de inhoud.',
			table: { defaultValue: { summary: 'auto' } },
		},
		rows: {
			control: 'number',
			description: 'Initiële hoogte in regels (minimum)',
			table: { defaultValue: { summary: '3' } },
		},
		width: {
			control: 'text',
			description: 'Optional fixed width (any CSS length, bv. "240px"). Leeg = stretch.',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholdertekst',
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
		name: {
			control: 'text',
			description: 'Name voor form submission',
		},
		value: {
			control: 'text',
			description: 'Veldwaarde',
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
		required: {
			control: 'boolean',
			description: 'Required state',
			table: { defaultValue: { summary: false } },
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
		autocomplete: {
			control: 'text',
			description: 'Browser autofill hint (HTML autocomplete attribute, bv. "off")',
		},
		noSpellcheck: {
			name: 'no-spellcheck',
			control: 'boolean',
			description: 'Disables browser spellchecking on the inner textarea',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
	},
};

const Template = ({ size, resize, rows, width, placeholder, valid, invalid, readonly, disabled, name, value, minlength, maxlength, required, keyboard, enterKey, autocomplete, accessibleLabel, noSpellcheck }: Record<string, any>) => html`
	<nldd-multi-line-text-field
		minlength=${minlength ?? nothing}
		size=${size}
		resize=${resize}
		rows=${rows}
		width=${width}
		.placeholder=${placeholder}
		?valid=${valid}
		?readonly=${readonly}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name}
		.value=${value}
		maxlength=${maxlength ?? nothing}
		keyboard=${keyboard || nothing}
		enter-key=${enterKey || nothing}
		?required=${required}
		autocomplete=${autocomplete}
		accessible-label=${accessibleLabel || nothing}
		?no-spellcheck=${noSpellcheck}
	></nldd-multi-line-text-field>
`;

export const Standaard = {
	render: Template,
};

export const AlleToestanden = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<nldd-multi-line-text-field placeholder="Neutral"></nldd-multi-line-text-field>
			<nldd-multi-line-text-field .value=${'Geldige inhoud op meerdere\nregels'} valid></nldd-multi-line-text-field>
			<nldd-multi-line-text-field .value=${'Ongeldige inhoud op meerdere\nregels'} invalid></nldd-multi-line-text-field>
			<nldd-multi-line-text-field .value=${'Disabled'} disabled></nldd-multi-line-text-field>
			<nldd-multi-line-text-field .value=${'Readonly inhoud die niet bewerkt mag worden.'} readonly></nldd-multi-line-text-field>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<nldd-multi-line-text-field placeholder="Medium (md)"></nldd-multi-line-text-field>
			<nldd-multi-line-text-field placeholder="Small (sm)" size="sm"></nldd-multi-line-text-field>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Met `resize="auto"` groeit het veld mee met de inhoud (native
 * `field-sizing: content`), zonder sleep-handvat. Het ingestelde aantal `rows`
 * blijft daarbij de ondergrens: het veld wordt nooit korter dan dat aantal
 * regels, maar groeit er wel voorbij. Hieronder een veld met `rows="2"` naast
 * één met `rows="5"` — beide groeien mee, maar starten op hun eigen minimum.
 */
export const Meegroeiend = {
	name: 'Meegroeiend (resize="auto")',
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<nldd-multi-line-text-field
				accessible-label="Groeit mee, minimaal 2 regels"
				placeholder="Groeit mee met de inhoud — minimaal 2 regels"
				resize="auto"
				rows="2"
			></nldd-multi-line-text-field>
			<nldd-multi-line-text-field
				accessible-label="Groeit mee, minimaal 5 regels"
				placeholder="Zelfde gedrag, maar minimaal 5 regels hoog"
				resize="auto"
				rows="5"
			></nldd-multi-line-text-field>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const InteractiefVoorbeeld = {
	render: () => html`
		<nldd-form label-alignment="right" novalidate>
			<nldd-form-field label="Toelichting">
				<nldd-multi-line-text-field
					name="notes"
					rows="4"
					@input=${action('input')}
					@change=${action('change')}
				></nldd-multi-line-text-field>
			</nldd-form-field>
			<nldd-form-field label="Aanvullende opmerkingen">
				<nldd-multi-line-text-field
					name="comments"
					resize="auto"
					rows="2"
					@input=${action('input')}
					@change=${action('change')}
				></nldd-multi-line-text-field>
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
				story: 'Open de browserconsole om `input` en `change` events te zien.',
			},
		},
	},
};
