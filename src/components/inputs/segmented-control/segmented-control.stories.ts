import { html, nothing } from 'lit';
import './segmented-control.js';
import './../../content/icon/icon.js';

/**
 * De Segmented Control component is een horizontale groep van wederzijds exclusieve (radio)
 * of meervoudig selecteerbare (checkbox) opties.
 */
export default {
	title: 'Components/Inputs/Segmented Control',
	component: 'nldd-segmented-control',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/segmented-control/segmented-control.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['text', 'icon', 'icon-and-text'],
			name: 'variant',
			description: 'Inhoudstype van alle items: tekst, icoon, of icoon en tekst.',
			table: { defaultValue: { summary: 'text' } },
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Grootte van de control',
			table: { defaultValue: { summary: 'md' } },
		},
		width: {
			control: 'text',
			description: 'Width mode: "full" (stretches to container), "fit-content" (per-item content size), or any CSS length (e.g. "240px")',
		},
		value: {
			control: 'text',
			description: 'Geselecteerde waarde (radio) of spatie-gescheiden waarden (checkbox)',
		},
		type: {
			control: 'select',
			options: ['radio', 'checkbox'],
			description: 'Type selectie: radio (enkelvoudig) of checkbox (meervoudig)',
			table: { defaultValue: { summary: 'radio' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde toestand',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat.',
			table: { defaultValue: { summary: false } },
		},

	},
	args: {
		variant: 'text',
		size: 'md',
		width: '',
		value: 'bold',
		type: 'radio',
		accessibleLabel: '',
		invalid: false,
		disabled: false,
		required: false,
	},
};

const Template = ({ variant, size, width, value, type, accessibleLabel, invalid, disabled, required }: Record<string, any>) => html`
	<nldd-segmented-control
		value=${value}
		size=${size}
		type=${type}
		variant=${variant}
		?invalid=${invalid}
		?required=${required}
		?disabled=${disabled}
		width=${width || nothing}
		accessible-label=${accessibleLabel || nothing}
	>
		<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
		<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
		<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
	</nldd-segmented-control>
`;

export const Standaard = {
	render: Template,
	args: { value: 'bold' },
};

export const AlleToestanden = {
	render: () => html`
	<div style="display: flex; flex-direction: column; align-items: start; gap: 1rem;">
		<nldd-segmented-control value="bold" size="md">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" size="sm">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control .values=${["bold", "italic"]} type="checkbox" size="md">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" disabled size="md">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" variant="icon" size="md">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" variant="icon" size="sm">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<div style="width: 400px; display: flex; flex-direction: column; gap: 1rem;">
			<nldd-segmented-control value="bold" width="full" size="md">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-segmented-control value="bold" width="full" size="sm">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-segmented-control .values=${["bold", "italic"]} type="checkbox" width="full" size="md">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-segmented-control value="bold" disabled width="full" size="md">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-segmented-control value="bold" variant="icon" width="full" size="md">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
			<nldd-segmented-control value="bold" variant="icon" width="full" size="sm">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
		</div>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const IcoonEnTekst = {
	render: () => html`
	<div style="display: flex; flex-direction: column; align-items: start; gap: 1rem;">
		<nldd-segmented-control value="bold" variant="icon-and-text" size="md" accessible-label="Tekststijl">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" variant="icon-and-text" size="sm" accessible-label="Tekststijl">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<div style="width: 400px;">
			<nldd-segmented-control value="bold" variant="icon-and-text" width="full" size="md" accessible-label="Tekststijl">
				<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
				<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
			</nldd-segmented-control>
		</div>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const GrootteLg = {
	name: 'Grootte lg',
	render: () => html`
	<div style="display: flex; flex-direction: column; align-items: start; gap: 1rem;">
		<nldd-segmented-control value="list" variant="text" size="lg" accessible-label="Weergave">
			<nldd-segmented-control-item value="list" text="Lijst"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="grid" text="Raster"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="card" text="Kaart"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="bold" variant="icon" size="lg" accessible-label="Tekststijl">
			<nldd-segmented-control-item value="bold" text="Vet" icon="bold"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="italic" text="Cursief" icon="italic"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="underline" text="Onderstreept" icon="underlined"></nldd-segmented-control-item>
		</nldd-segmented-control>
		<nldd-segmented-control value="list" variant="icon-and-text" size="lg" accessible-label="Weergave">
			<nldd-segmented-control-item value="list" text="Lijst" icon="list"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="kaarten" text="Kaarten" icon="rectangle-stack"></nldd-segmented-control-item>
			<nldd-segmented-control-item value="agenda" text="Agenda" icon="calendar-event"></nldd-segmented-control-item>
		</nldd-segmented-control>
	</div>
`,
	parameters: { controls: { disable: true } },
};
