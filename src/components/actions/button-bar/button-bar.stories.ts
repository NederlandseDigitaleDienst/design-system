import { html } from 'lit';
import './button-bar.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

export default {
	title: 'Components/Actions/Button Bar',
	component: 'nldd-button-bar',
	tags: ['autodocs'],

	argTypes: {
		variant: {
			control: 'select',
			options: ['neutral-tinted', 'neutral-base', 'secondary', 'accent-filled', 'primary'],
			description: 'Button bar variant',
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
	args: { variant: 'neutral-tinted', size: 'md', disabled: false },
	render: (args: Record<string, any>) => html`
		<nldd-button-bar size=${args.size} variant=${args.variant} ?disabled=${args.disabled}>
			<nldd-icon-button icon="chevron-left" text="Vorige"></nldd-icon-button>
			<nldd-button-bar-divider></nldd-button-bar-divider>
			<nldd-icon-button icon="chevron-right" text="Volgende"></nldd-icon-button>
		</nldd-button-bar>
	`,
};

export const Varianten = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar variant="primary">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar variant="secondary">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar variant="neutral-base">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
			<nldd-button-bar size="lg">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder" hide-lg-text></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="md">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="sm">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
			<nldd-button-bar size="xs">
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};

export const ZonderScheidingslijn = {
	args: { variant: 'neutral-tinted', size: 'md', disabled: false },
	render: (args: Record<string, any>) => html`
		<nldd-button-bar size=${args.size} variant=${args.variant} ?disabled=${args.disabled}>
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
			<nldd-button-bar size="md" disabled>
				<nldd-button text="Bewerk"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-button text="Dupliceer"></nldd-button>
				<nldd-button-bar-divider></nldd-button-bar-divider>
				<nldd-icon-button icon="trash" text="Verwijder"></nldd-icon-button>
			</nldd-button-bar>
		</div>
	`,
};
