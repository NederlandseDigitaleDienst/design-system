import { html } from 'lit';
import './button-group.js';
import '../button/button.js';

export default {
	title: 'Components/Actions/Button Group',
	component: 'nldd-button-group',
	tags: ['autodocs'],

	args: {
		size: 'md',
		orientation: 'auto',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Groepsmaat',
			table: { defaultValue: { summary: 'md' } },
		},
		orientation: {
			control: 'select',
			options: ['auto', 'horizontal', 'vertical'],
			description: 'Richting: `auto` is een rij, en gestapeld over de volle breedte zodra de groep zelf smaller is dan de sm-grens.',
			table: { defaultValue: { summary: 'auto' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			variant="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
	</nldd-button-group>
	`,
};

export const OrientatieHorizontal = {
	name: 'Oriëntatie horizontal',
	args: { orientation: 'horizontal' },
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			variant="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
	</nldd-button-group>
	`,
};

export const GrootteSm = {
	name: 'Grootte sm',
	args: { size: 'sm', orientation: 'horizontal' },
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			variant="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
	</nldd-button-group>
	`,
};

export const DrieKnoppen = {
	args: { size: 'md', orientation: 'vertical' },
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			variant="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
		<nldd-button
			variant="destructive"
			text="Verwijder"
		></nldd-button>
	</nldd-button-group>
	`,
};

export const MaximaalDrieKnoppen = {
	name: 'Maximaal drie knoppen (de vierde verdwijnt)',
	args: { size: 'md', orientation: 'vertical' },
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			variant="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
		<nldd-button
			variant="destructive"
			text="Verwijder"
		></nldd-button>
		<nldd-button
			variant="secondary"
			text="Een knop te veel"
		></nldd-button>
	</nldd-button-group>
	`,
};

/**
 * `auto` kijkt naar de breedte van de groep zelf, niet naar die van het venster.
 * Onder de sm-grens staan de knoppen onder elkaar over de volle breedte.
 */
export const InEenSmalleContainer = {
	name: 'In een smalle container',
	render: (args: Record<string, any>) => html`
	<div style="width: 220px;">
		<nldd-button-group
			size=${args.size}
			orientation=${args.orientation}
		>
			<nldd-button
				variant="primary"
				text="Bewaar"
			></nldd-button>
			<nldd-button
				variant="secondary"
				text="Annuleer"
			></nldd-button>
		</nldd-button-group>
	</div>
	`,
};
