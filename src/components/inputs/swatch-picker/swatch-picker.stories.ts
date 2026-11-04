import { html, nothing } from 'lit';
import './swatch-picker.ts';
import '../../forms/form-field/form-field.ts';

export default {
	title: 'Components/Inputs/Swatch Picker',
	component: 'nldd-swatch-picker',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/swatch-picker/swatch-picker.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		size: 'md',
		accessibleLabel: 'Kleur',
		invalid: false,
		disabled: false,
		name: '',
		value: 'rood',
		required: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Grootte van de staaltjes, op de schaal van de controls',
			table: { defaultValue: { summary: 'md' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de groep; in een nldd-form-field geeft het veld de naam',
		},
		invalid: {
			control: 'boolean',
			description: 'Markeert de groep als ongeldig, alleen voor hulptechnologie',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat voor alle staaltjes',
			table: { defaultValue: { summary: false } },
		},
		name: {
			control: 'text',
			description: 'Naam voor het formulier',
		},
		value: {
			control: 'text',
			description: 'Waarde van het gekozen staaltje',
		},
		required: {
			control: 'boolean',
			description: 'Er moet iets gekozen zijn',
			table: { defaultValue: { summary: false } },
		},
	},
};

const COLORS = ['lintblauw', 'hemelblauw', 'paars', 'robijnrood', 'rood', 'oranje', 'geel', 'groen', 'mosgroen', 'donkerbruin'];

const colors = html`
	${COLORS.map((color) => html`
		<nldd-swatch-picker-item
			color=${color}
			value=${color}
		></nldd-swatch-picker-item>
	`)}
`;

/** A woven pattern in two colors, as a stand-in for a photo of a fabric. */
const weave = (warp: string, weft: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="${warp}"/><path d="M0 0h8v4H0zM8 8h8v4H8z" fill="${weft}"/><path d="M4 4h4v8H4zM12 12h4v4h-4zM12 0h4v4h-4z" fill="${weft}" opacity=".6"/></svg>`)}`;

const fabrics = [
	{ value: 'bordeaux', text: 'Bordeaux', image: weave('#5a1f2b', '#a8324a') },
	{ value: 'olijf', text: 'Olijf', image: weave('#4a4a2a', '#9a9a3a') },
	{ value: 'zand', text: 'Zand', image: weave('#8a7f6a', '#c9b98f') },
	{ value: 'jeans', text: 'Jeans', image: weave('#4a5a7a', '#8aa0c8') },
	{ value: 'framboos', text: 'Framboos', image: weave('#7a3a5a', '#d070a0') },
	{ value: 'antraciet', text: 'Antraciet', image: weave('#2a2a2a', '#5a5a5a') },
];

const Template = ({
	size,
	accessibleLabel,
	invalid,
	disabled,
	name,
	value,
	required,
}: Record<string, unknown>) => html`
	<nldd-swatch-picker
		size=${size || nothing}
		accessible-label=${accessibleLabel || nothing}
		?invalid=${invalid}
		?disabled=${disabled}
		name=${name || nothing}
		value=${value || nothing}
		?required=${required}
	>
		${colors}
	</nldd-swatch-picker>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			${['xs', 'sm', 'md'].map((size) => html`
				<nldd-swatch-picker
					size=${size}
					accessible-label="Kleur"
					value="rood"
				>
					${colors}
				</nldd-swatch-picker>
			`)}
		</div>
	`,
};

/**
 * Een kleur buiten de categorieën gaat in `custom-color`, met een naam in
 * `text`: een kleurcode zegt een schermlezer niets.
 */
export const MetCustomColor = {
	name: 'Met custom-color',
	render: () => html`
		<nldd-swatch-picker
			accessible-label="Kleur"
			value="huisstijl"
		>
			<nldd-swatch-picker-item
				custom-color="#7a1f3d"
				text="Huisstijl"
				value="huisstijl"
			></nldd-swatch-picker-item>
			<nldd-swatch-picker-item
				custom-color="#ffffff"
				text="Wit"
				value="wit"
			></nldd-swatch-picker-item>
			<nldd-swatch-picker-item
				custom-color="#f2f2f2"
				text="Lichtgrijs"
				value="lichtgrijs"
			></nldd-swatch-picker-item>
			<nldd-swatch-picker-item
				custom-color="#1a1a1a"
				text="Zwart"
				value="zwart"
			></nldd-swatch-picker-item>
		</nldd-swatch-picker>
	`,
};

/**
 * Een patroon of materiaal gaat in `image`, met een naam in `text`. Geef met
 * `image-srcset` een tweede resolutie voor scherpe schermen.
 */
export const MetAfbeeldingen = {
	name: 'Met afbeeldingen',
	render: () => html`
		<nldd-swatch-picker
			accessible-label="Stof"
			value="bordeaux"
		>
			${fabrics.map((fabric) => html`
				<nldd-swatch-picker-item
					image=${fabric.image}
					text=${fabric.text}
					value=${fabric.value}
				></nldd-swatch-picker-item>
			`)}
		</nldd-swatch-picker>
	`,
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: { disabled: true },
};

export const ItemDisabled = {
	name: 'Item disabled',
	render: () => html`
		<nldd-swatch-picker
			accessible-label="Kleur"
			value="rood"
		>
			<nldd-swatch-picker-item
				color="lintblauw"
				value="lintblauw"
			></nldd-swatch-picker-item>
			<nldd-swatch-picker-item
				color="rood"
				value="rood"
			></nldd-swatch-picker-item>
			<nldd-swatch-picker-item
				color="groen"
				value="groen"
				disabled
			></nldd-swatch-picker-item>
		</nldd-swatch-picker>
	`,
};

export const InEenFormulierveld = {
	name: 'In een formulierveld',
	render: () => html`
		<nldd-form-field label="Kleur van het label">
			<nldd-swatch-picker
				name="kleur"
				required
			>
				${colors}
			</nldd-swatch-picker>
		</nldd-form-field>
	`,
};
