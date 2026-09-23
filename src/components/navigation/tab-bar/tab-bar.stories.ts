import { html, nothing } from 'lit';
import './tab-bar.js';
import './../../content/icon/icon.js';

export default {
	title: 'Components/Navigation/Tab Bar',
	component: 'nldd-tab-bar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/tab-bar/tab-bar.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['(auto)', 'icon-and-text', 'text', 'icon'],
			mapping: { '(auto)': '' },
			description: 'Standaard variant voor alle items. Kan per item worden overschreven met een eigen variant attribuut. Bij "(auto)" bepaalt elk item dat zelf op basis van text/icon. Bepaalt de layout bij elke grootte.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		size: {
			control: 'select',
			options: ['md', 'lg'],
			description: 'Grootte. "lg" vergroot het touch target en behoudt de variant-layout: icon-and-text stapelt het icoon boven de tekst (mobiele bottom-bar stijl), text toont grote tekst, icon toont een groter icon-only control.',
			table: { defaultValue: { summary: 'md' } },
		},
		centered: {
			control: 'boolean',
			description: 'Centreert de tabs in de container (host vult de rij, tabs groeperen in het midden)',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Schakelt de hele balk uit: dimt hem, blokkeert muisinteractie en haalt de tabs uit de tab-volgorde',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
			table: { defaultValue: { summary: 'Tabs' } },
		},
	},
	args: {
		variant: '',
		size: 'md',
		centered: false,
		disabled: false,
		accessibleLabel: '',
	},
};

// Every item always has both icon and text for accessible, complete markup.
// variant on the item forces a specific visual presentation.
const tabBarItems = html`
	<nldd-tab-bar-item current text="Home" icon="home"></nldd-tab-bar-item>
	<nldd-tab-bar-item text="Profiel" icon="profile"></nldd-tab-bar-item>
	<nldd-tab-bar-item text="Zoeken" icon="search"></nldd-tab-bar-item>
`;

const Template = ({ variant, size, centered, disabled, accessibleLabel }: Record<string, any>) => html`
	<nldd-tab-bar
		variant=${variant || nothing}
		size=${size || nothing}
		?centered=${centered}
		?disabled=${disabled}
		accessible-label=${accessibleLabel || nothing}
	>
		${tabBarItems}
	</nldd-tab-bar>
`;

export const Standaard = {
	render: Template,
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
	<nldd-tab-bar disabled accessible-label="Uitgeschakeld">
		${tabBarItems}
	</nldd-tab-bar>
`,
	parameters: { controls: { disable: true } },
};

export const MetTekstVariant = {
	render: () => html`
	<nldd-tab-bar variant="text">
		${tabBarItems}
	</nldd-tab-bar>
`,
	parameters: { controls: { disable: true } },
};

export const MetIconenVariant = {
	render: () => html`
	<nldd-tab-bar variant="icon">
		${tabBarItems}
	</nldd-tab-bar>
`,
	parameters: { controls: { disable: true } },
};


export const Groot = {
	name: 'Groot (lg)',
	render: () => html`
	<div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
		<nldd-tab-bar size="lg" variant="icon-and-text" accessible-label="Icon en tekst">
			${tabBarItems}
		</nldd-tab-bar>
		<nldd-tab-bar size="lg" variant="text" accessible-label="Tekst">
			${tabBarItems}
		</nldd-tab-bar>
		<nldd-tab-bar size="lg" variant="icon" accessible-label="Icoon">
			${tabBarItems}
		</nldd-tab-bar>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const Gecentreerd = {
	render: () => html`
	<div style="container-type: inline-size; container-name: layout-container;">
		<nldd-tab-bar centered>
			${tabBarItems}
		</nldd-tab-bar>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const Gemengd = {
	render: () => html`
	<nldd-tab-bar>
		<nldd-tab-bar-item
			current
			variant="text"
			text="Home"
			icon="home"
		></nldd-tab-bar-item>
		<nldd-tab-bar-item
			variant="text"
			text="Profiel"
			icon="profile"
		></nldd-tab-bar-item>
		<nldd-tab-bar-item
			variant="icon"
			text="Zoeken"
			icon="search"
		></nldd-tab-bar-item>
	</nldd-tab-bar>
`,
	parameters: { controls: { disable: true } },
};

export const Navigatie = {
	render: () => html`
	<nldd-tab-bar navigation accessible-label="Hoofdnavigatie">
		<nldd-tab-bar-item
			current
			text="Home"
			icon="home"
			href="/home"
		></nldd-tab-bar-item>
		<nldd-tab-bar-item
			text="Profiel"
			icon="profile"
			href="/profiel"
		></nldd-tab-bar-item>
		<nldd-tab-bar-item
			text="Zoeken"
			icon="search"
			href="/zoeken"
		></nldd-tab-bar-item>
	</nldd-tab-bar>
`,
	parameters: { controls: { disable: true } },
};
