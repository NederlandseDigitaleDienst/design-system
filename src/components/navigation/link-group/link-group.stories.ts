import { html, nothing } from 'lit';
import './link-group.ts';
import '../link/link.ts';

export default {
	title: 'Components/Navigation/Link Group',
	component: 'nldd-link-group',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/link-group/link-group.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		size: 'md',
		orientation: 'horizontal',
		horizontalAlignment: 'left',
		accessibleLabel: 'Over Mijn Dienst',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg'],
			description: 'Tekstgrootte, gezet op elke link in de groep',
			table: { defaultValue: { summary: 'md' } },
		},
		orientation: {
			control: 'select',
			options: ['horizontal', 'vertical'],
			description: 'Een rij die doorloopt op de volgende regel, of onder elkaar',
			table: { defaultValue: { summary: 'horizontal' } },
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['left', 'center'],
			description: 'Uitlijning van de links',
			table: { defaultValue: { summary: 'left' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de nav-landmark',
		},
	},
};

const links = html`
	<nldd-link
		href="#"
		text="Tijdlijn"
	></nldd-link>
	<nldd-link
		href="#"
		text="Agenda"
	></nldd-link>
	<nldd-link
		href="#"
		text="Vacatures"
	></nldd-link>
	<nldd-link
		href="#"
		text="E-mailupdates"
	></nldd-link>
	<nldd-link
		href="#"
		text="Contact"
	></nldd-link>
`;

const Template = ({
	size,
	orientation,
	horizontalAlignment,
	accessibleLabel,
}: Record<string, unknown>) => html`
	<nldd-link-group
		size=${size || nothing}
		orientation=${orientation || nothing}
		horizontal-alignment=${horizontalAlignment || nothing}
		accessible-label=${accessibleLabel || nothing}
	>
		${links}
	</nldd-link-group>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			${['xs', 'sm', 'md', 'lg'].map((size) => html`
				<nldd-link-group
					size=${size}
					accessible-label="Over Mijn Dienst"
				>
					${links}
				</nldd-link-group>
			`)}
		</div>
	`,
};

export const OrientationVertical = {
	name: 'Orientation vertical',
	render: Template,
	args: { orientation: 'vertical' },
};

export const HorizontalAlignmentCenter = {
	name: 'Horizontal alignment center',
	render: () => html`
		<div style="max-width: 320px; margin-inline: auto;">
			<nldd-link-group
				horizontal-alignment="center"
				accessible-label="Over Mijn Dienst"
			>
				${links}
			</nldd-link-group>
		</div>
	`,
};
