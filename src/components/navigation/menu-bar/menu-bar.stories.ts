import { html, nothing } from 'lit';
import './menu-bar.js';

export default {
	title: 'Components/Navigation/Menu Bar',
	component: 'nldd-menu-bar',
	tags: ['autodocs'],
	args: {
		compact: false,
		overflowText: '',
		accessibleLabel: 'Navigatie',
	},
	argTypes: {
		compact: { control: 'boolean', description: 'Propageert compact naar slotted items', table: { defaultValue: { summary: false } } },
		overflowText: { name: 'overflow-text', control: 'text', description: 'Tekst voor de overflow button', table: { defaultValue: { summary: 'Meer opties' } } },
		accessibleLabel: { name: 'accessible-label', control: 'text', description: 'aria-label voor de nav landmark' },
	},
};

const layoutArea = 'container-type: inline-size; container-name: layout-container; background-color: var(--semantics-surfaces-base-background-color);';

const Template = ({
	compact,
	overflowText,
	accessibleLabel,
}: Record<string, unknown>) => html`
	<div style=${layoutArea}>
		<nldd-menu-bar
			accessible-label=${(accessibleLabel as string) || nothing}
			overflow-text=${(overflowText as string) || nothing}
			?compact=${compact}
		>
			<nldd-menu-bar-item text="Home" current></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Aanvragen & activeren"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Manieren van inloggen"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Veiligheid"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Hulp"></nldd-menu-bar-item>
		</nldd-menu-bar>
	</div>
`;

export const Standaard = {
	render: Template,
};

export const WeinigItems = {
	render: () => html`
		<div style=${layoutArea}>
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home" current></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Contact"></nldd-menu-bar-item>
			</nldd-menu-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const VeelItems = {
	render: () => html`
		<div style=${layoutArea}>
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home" current></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Onderwerpen"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Documenten en publicaties"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Ministeries"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Contact"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Actueel"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Vraag en antwoord"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Wetten en regelgeving"></nldd-menu-bar-item>
			</nldd-menu-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const SmalleContainer = {
	render: () => html`
		<div style="${layoutArea} max-width: 400px;">
			<nldd-menu-bar>
				<nldd-menu-bar-item text="Home" current></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Aanvragen & activeren"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Manieren van inloggen"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Veiligheid"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Hulp"></nldd-menu-bar-item>
			</nldd-menu-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MetExpandableItems = {
	render: () => html`
		<div style=${layoutArea}>
			<nldd-menu-bar>
				<nldd-menu-bar-item text="NL" expandable content-priority="icon">
					<nldd-menu>
						<nldd-menu-item text="Nederlands" type="radio" selected></nldd-menu-item>
						<nldd-menu-item text="English" type="radio"></nldd-menu-item>
						<nldd-menu-item text="Papiamentu" type="radio"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
				<nldd-menu-bar-item text="Zoeken" icon="magnifier" content-priority="icon"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Account" icon="person" expandable content-priority="text">
					<nldd-menu>
						<nldd-menu-item text="Mijn profiel"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Log uit"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Compact = {
	render: () => html`
		<div style=${layoutArea}>
			<nldd-menu-bar compact>
				<nldd-menu-bar-item text="NL" expandable content-priority="icon">
					<nldd-menu>
						<nldd-menu-item text="Nederlands" type="radio" selected></nldd-menu-item>
						<nldd-menu-item text="English" type="radio"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
				<nldd-menu-bar-item text="Zoeken" icon="magnifier" content-priority="icon"></nldd-menu-bar-item>
				<nldd-menu-bar-item text="Mijn DigID" icon="person" expandable content-priority="text">
					<nldd-menu>
						<nldd-menu-item text="Mijn gegevens"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item text="Log uit"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
