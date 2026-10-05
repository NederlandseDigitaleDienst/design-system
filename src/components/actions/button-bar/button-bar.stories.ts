import { html } from 'lit';
import './button-bar.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

export default {
	title: 'Components/Actions/Button Bar',
	component: 'nldd-button-bar',
	tags: ['autodocs'],

	argTypes: {
		appearance: {
			control: 'select',
			options: ['neutral-tinted', 'neutral-base', 'secondary', 'accent-filled', 'primary', 'inherit-filled', 'inherit-tinted'],
			description: 'Visuele stijl van de knoppen, inclusief kleur',
			table: { defaultValue: { summary: 'neutral-tinted' } },
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
			description: 'Button bar size. Bij "lg" stapelen icon-button children hun label onder het icoon (mobiele actiebalk).',
			table: { defaultValue: { summary: 'md' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Disabled state',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

export const Standaard = {
	args: { appearance: 'neutral-tinted', size: 'md', disabled: false },
	render: (args: Record<string, any>) => html`
		<nldd-button-bar
			size=${args.size}
			appearance=${args.appearance}
			?disabled=${args.disabled}
		>
			<nldd-icon-button
				icon="chevron-left"
				text="Vorige"
			></nldd-icon-button>
			<nldd-button-bar-divider></nldd-button-bar-divider>
			<nldd-icon-button
				icon="chevron-right"
				text="Volgende"
			></nldd-icon-button>
		</nldd-button-bar>
	`,
};

export const Appearances = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar appearance="primary">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar appearance="secondary">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar appearance="neutral-base">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};

/**
 * De inherit-appearances leiden hun kleuren af van `currentColor` en zijn
 * bedoeld voor gekleurde vlakken. Bij `inherit-tinted` tekent de balk het
 * doorschijnende vlak één keer; de knoppen erin laten het weg, zodat
 * het niet dubbel over elkaar valt.
 * Hover, active en expanded veranderen de kleur niet, zodat het contrast met
 * het label blijft wat het vlak eromheen geeft.
 */
export const OpKleurvlak = {
	render: () => html`
		<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); --context-parent-background-color: var(--semantics-categories-donkerblauw-filled-background-color); padding: 24px; border-radius: var(--primitives-corner-radius-md); display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar appearance="inherit-filled">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar appearance="inherit-tinted">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button
				appearance="inherit-tinted"
				text="Losse knop"
			></nldd-button>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar size="lg">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
					hide-lg-text
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="md">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="sm">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="xs">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};

export const ZonderScheidingslijn = {
	args: { appearance: 'neutral-tinted', size: 'md', disabled: false },
	render: (args: Record<string, any>) => html`
		<nldd-button-bar
			size=${args.size}
			appearance=${args.appearance}
			?disabled=${args.disabled}
		>
			<nldd-button text="Cut"></nldd-button>
			<nldd-button text="Copy"></nldd-button>
			<nldd-button text="Paste"></nldd-button>
		</nldd-button-bar>
	`,
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar
				size="md"
				disabled
			>
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button
					icon="trash"
					text="Verwijder"
				></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};
