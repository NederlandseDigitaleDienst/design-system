import { html } from 'lit';
import './stepper.js';
import '../../layout/container/container.js';
import '../../content/text/text.js';

/**
 * De Stepper component is een numerieke control met increment en decrement knoppen.
 */
export default {
	title: 'Components/Inputs/Stepper',
	component: 'nldd-stepper',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/stepper/stepper.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Grootte van de stepper',
			table: { defaultValue: { summary: 'md' } },
		},
		value: {
			control: { type: 'number' },
			description: 'Huidige waarde',
			table: { defaultValue: { summary: 0 } },
		},
		min: {
			control: { type: 'number' },
			description: 'Minimale waarde',
			table: { defaultValue: { summary: 0 } },
		},
		max: {
			control: { type: 'number' },
			description: 'Maximale waarde',
			table: { defaultValue: { summary: 'Infinity' } },
		},
		step: {
			control: { type: 'number' },
			description: 'Stapgrootte',
			table: { defaultValue: { summary: 1 } },
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
	},
	args: {
		size: 'md',
		value: 5,
		min: 0,
		max: 10,
		step: 1,
		invalid: false,
		disabled: false,
	},
};

const Template = ({ size, value, min, max, step, invalid, disabled }: Record<string, any>) => html`
	<nldd-container
		layout="row"
		gap="16"
		vertical-alignment="center"
	>
		<nldd-text style="min-width: 2ch;">${value}</nldd-text>
		<nldd-stepper
			value=${value}
			min=${min}
			max=${max}
			step=${step}
			?invalid=${invalid}
			?disabled=${disabled}
			size=${size}
			@change=${(e: any) => {
				const display = e.target.previousElementSibling;
				if (display) display.textContent = e.detail.value;
			}}
		></nldd-stepper>
	</nldd-container>
`;

export const Standaard = {
	render: Template,
	args: {},
};

export const AlleToestanden = {
	render: () => html`
	<nldd-container gap="16">
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				5
			</nldd-text>
			<nldd-stepper
				value="5" min="0" max="10" size="xs"
				@change=${(e: any) => { e.target.previousElementSibling.textContent = e.detail.value; }}
			></nldd-stepper>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				5
			</nldd-text>
			<nldd-stepper
				value="5" min="0" max="10" size="sm"
				@change=${(e: any) => { e.target.previousElementSibling.textContent = e.detail.value; }}
			></nldd-stepper>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				5
			</nldd-text>
			<nldd-stepper
				value="5" min="0" max="10" size="md"
				@change=${(e: any) => { e.target.previousElementSibling.textContent = e.detail.value; }}
			></nldd-stepper>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				0
			</nldd-text>
			<nldd-stepper
				value="0" min="0" max="10" size="md"
				@change=${(e: any) => { e.target.previousElementSibling.textContent = e.detail.value; }}
			></nldd-stepper>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				10
			</nldd-text>
			<nldd-stepper
				value="10" min="0" max="10" size="md"
				@change=${(e: any) => { e.target.previousElementSibling.textContent = e.detail.value; }}
			></nldd-stepper>
		</nldd-container>
		<nldd-container
			layout="row"
			gap="16"
			vertical-alignment="center"
		>
			<nldd-text style="min-width: 2ch;">
				5
			</nldd-text>
			<nldd-stepper
				value="5"
				min="0"
				max="10"
				size="md"
				disabled
			></nldd-stepper>
		</nldd-container>
	</nldd-container>
`,
	parameters: { controls: { disable: true } },
};
