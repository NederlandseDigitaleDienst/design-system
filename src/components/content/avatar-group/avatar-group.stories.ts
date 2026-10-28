import { html, nothing } from 'lit';
import './avatar-group.js';
import '../avatar/avatar.js';
import '../../layout/container/container.js';
import { LEYSTER, REMBRANDT, VAN_GOGH } from '../../../docs/story-portraits.js';

/**
 * De Avatar Group toont meerdere avatars als één groep: overlappend, met een ring
 * in de vlakkleur zodat ze gescheiden blijven.
 *
 * ## Gebruik
 * ```html
 * <nldd-avatar-group>
 *   <nldd-avatar name="Jan Jansen" decorative></nldd-avatar>
 *   <nldd-avatar name="Fatima El Amrani" decorative></nldd-avatar>
 * </nldd-avatar-group>
 * ```
 */
const SIZES = ['16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'];

export default {
	title: 'Components/Content/Avatar Group',
	component: 'nldd-avatar-group',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/avatar-group/avatar-group.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: '40',
		max: 3,
		accessibleLabel: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: SIZES,
			description: 'Diameter van elke avatar in px',
			table: {
				defaultValue: { summary: '40' },
			},
		},
		max: {
			control: { type: 'number', min: 1 },
			description: 'Toont hoogstens zoveel avatars; de rest gaat achter een +N-knop',
			table: {
				type: { summary: 'number' },
			},
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Beschrijft de groep als geheel (bijv. "Redactie")',
		},
	},
};

const Template = ({ size, max, accessibleLabel }: Record<string, any>) => html`
	<nldd-avatar-group
		size=${size}
		max=${max ?? nothing}
		accessible-label=${accessibleLabel || nothing}
	>
		<nldd-avatar name="Jan Jansen"></nldd-avatar>
		<nldd-avatar name="Fatima El Amrani"></nldd-avatar>
		<nldd-avatar name="Pieter de Vries"></nldd-avatar>
	</nldd-avatar-group>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="24"
			vertical-alignment="center"
		>
			${['56', '40', '32', '24'].map(size => html`
				<nldd-avatar-group size=${size}>
					<nldd-avatar
						name="Jan Jansen"
						decorative
					></nldd-avatar>
					<nldd-avatar
						name="Fatima El Amrani"
						decorative
					></nldd-avatar>
				</nldd-avatar-group>
			`)}
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De maat geldt voor de hele groep en wordt aan de avatars opgelegd. Onder de 28px schuiven ze minder ver over elkaar heen, anders blijft er van de kleinste avatar niets over.',
			},
		},
	},
};

export const MetMax = {
	render: () => html`
		<nldd-avatar-group
			max="3"
			accessible-label="Redactie"
		>
			<nldd-avatar name="Jan Jansen"></nldd-avatar>
			<nldd-avatar name="Fatima El Amrani"></nldd-avatar>
			<nldd-avatar name="Pieter de Vries"></nldd-avatar>
			<nldd-avatar name="Sanne Bakker"></nldd-avatar>
			<nldd-avatar name="Omar El Amrani"></nldd-avatar>
		</nldd-avatar-group>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `max` staan er hoogstens zoveel avatars in de rij en gaat de rest achter een knop met "+N". Die knop opent een lijst met precies die overige namen, niet met de hele groep: het getal op de knop belooft er twee, dus je krijgt er twee. De schijf is lichter dan een avatar, want hij houdt geen gezicht vast. Zet `tooltip-timing` op de avatars zodat je de namen in de rij ook kunt lezen.',
			},
		},
	},
};

const avatars = (count: number) => Array.from({ length: count }, (_, i) => html`
	<nldd-avatar
		name=${`Persoon ${i + 1}`}
		decorative
	></nldd-avatar>
`);

export const Aantallen = {
	render: () => html`
		<nldd-container gap="16">
			${['16', '24', '40', '56'].map(size => html`
				<nldd-container
					layout="wrap"
					gap="24"
					vertical-alignment="center"
				>
					${[2, 13, 101].map(count => html`
						<nldd-avatar-group
							size=${size}
							max="1"
						>
							${avatars(count + 1)}
						</nldd-avatar-group>
					`)}
				</nldd-container>
			`)}
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een langer getal staat kleiner. Past het niet meer in de schijf, dan toont de knop een ellipsis met het aantal in een tooltip: een getal van één cijfer vanaf 24px, van twee vanaf 40px, van drie vanaf 56px en van vier vanaf 80px. Het aantal staat altijd in de toegankelijke naam.',
			},
		},
	},
};

export const PastInDeBreedte = {
	render: () => html`
		<div style="resize: horizontal; overflow: hidden; width: 320px; min-width: 80px; max-width: 100%; padding: 8px; border: 1px dashed currentColor;">
			<nldd-avatar-group
				max="8"
				accessible-label="Redactie"
			>
				${avatars(12)}
			</nldd-avatar-group>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De rij loopt nooit uit zijn container. Is er geen ruimte voor alle avatars, dan toont de groep er zoveel als passen en gaat de rest achter de knop, zoals bij `max`. `max` is dan het meeste dat hij toont.',
			},
		},
	},
};

export const MetAfbeeldingen = {
	render: () => html`
		<nldd-avatar-group accessible-label="Schilders">
			<nldd-avatar
				src=${LEYSTER}
				name="Judith Leyster"
			></nldd-avatar>
			<nldd-avatar
				src=${REMBRANDT}
				name="Rembrandt van Rijn"
			></nldd-avatar>
			<nldd-avatar
				src=${VAN_GOGH}
				name="Vincent van Gogh"
			></nldd-avatar>
		</nldd-avatar-group>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een avatar met een `src` gedraagt zich in de groep als elke andere: dezelfde maat, ronding en ring, en bij een dode afbeelding valt hij terug op de initialen uit `name`. Slot geen kale `img` — die weet niets van dat alles en kan zijn naam niet als tooltip tonen.',
			},
		},
	},
};
