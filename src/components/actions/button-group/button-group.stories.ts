import { html, nothing } from 'lit';
import './button-group.js';
import '../button/button.js';
import '../../layout/container/container.js';

export default {
	title: 'Components/Actions/Button Group',
	component: 'nldd-button-group',
	tags: ['autodocs'],

	args: {
		size: 'md',
		orientation: 'auto',
		width: '',
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
			description: 'Richting: `auto` is een rij, en gestapeld over de volle breedte zodra de groep zelf 480px of smaller is.',
			table: { defaultValue: { summary: 'auto' } },
		},
		width: {
			control: 'select',
			options: ['(geen)', 'full'],
			mapping: { '(geen)': '' },
			description: '`full`: de knoppen vullen de rij in gelijke delen, en staan onder elkaar zodra hun labels niet naast elkaar passen.',
			table: { defaultValue: { summary: '(geen)' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
		width=${args.width || nothing}
	>
		<nldd-button
			appearance="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			appearance="secondary"
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
			appearance="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			appearance="secondary"
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
			appearance="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			appearance="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
	</nldd-button-group>
	`,
};

/**
 * Met `width="full"` vullen de knoppen de rij in gelijke delen. Past een label
 * niet in zijn deel, dan wordt die knop breder en delen de andere de rest. Past
 * ook dat niet, dan staan ze allemaal onder elkaar. Hieronder dezelfde groep
 * in drie breedtes.
 */
export const BreedteFull = {
	name: 'Breedte full',
	render: (args: Record<string, any>) => {
		const group = (width: string) => html`
			<nldd-container width=${width}>
				<nldd-button-group
					size=${args.size}
					width="full"
				>
					<nldd-button
						appearance="primary"
						text="Aanvraag indienen"
					></nldd-button>
					<nldd-button
						appearance="secondary"
						text="Bewaar"
					></nldd-button>
				</nldd-button-group>
			</nldd-container>
		`;
		return html`
			<nldd-container gap="32">
				${group('480px')}
				${group('300px')}
				${group('240px')}
			</nldd-container>
		`;
	},
};

export const DrieKnoppen = {
	args: { size: 'md', orientation: 'vertical' },
	render: (args: Record<string, any>) => html`
	<nldd-button-group
		size=${args.size}
		orientation=${args.orientation}
	>
		<nldd-button
			appearance="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			appearance="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
		<nldd-button
			appearance="destructive"
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
			appearance="primary"
			text="Bewaar"
		></nldd-button>
		<nldd-button
			appearance="secondary"
			text="Bewaar en maak nieuwe"
		></nldd-button>
		<nldd-button
			appearance="destructive"
			text="Verwijder"
		></nldd-button>
		<nldd-button
			appearance="secondary"
			text="Een knop te veel"
		></nldd-button>
	</nldd-button-group>
	`,
};

/**
 * `auto` kijkt naar de breedte van de groep zelf, niet naar die van het venster.
 * Bij 480px of smaller, de breedte van een telefoon, staan de knoppen onder
 * elkaar over de volle breedte. Een kaart of dialoog tussen 480px en de
 * sm-grens houdt zijn rij.
 */
export const InEenSmalleContainer = {
	name: 'In een smalle container',
	render: (args: Record<string, any>) => html`
	<nldd-container width="220px">
		<nldd-button-group
			size=${args.size}
			orientation=${args.orientation}
		>
			<nldd-button
				appearance="primary"
				text="Bewaar"
			></nldd-button>
			<nldd-button
				appearance="secondary"
				text="Bewaar als concept"
			></nldd-button>
		</nldd-button-group>
	</nldd-container>
	`,
};
