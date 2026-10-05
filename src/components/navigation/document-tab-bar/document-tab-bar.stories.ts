import { html } from 'lit';
import './document-tab-bar.js';
import './../../actions/icon-button/icon-button.js';


export default {
	title: 'Components/Navigation/Document Tab Bar',
	component: 'nldd-document-tab-bar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/document-tab-bar/document-tab-bar.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	argTypes: {
		accessibleLabel: {
			control: 'text',
			name: 'accessible-label',
			description: 'Toegankelijke naam voor de navigatieregio',
			table: { defaultValue: { summary: 'Tabbladen' } },
		},
	},
	args: {
		accessibleLabel: 'Documenten',
	},
};

const Template = ({ accessibleLabel }: Record<string, any>) => html`
	<nldd-document-tab-bar
		accessible-label=${accessibleLabel}
	>
		<nldd-document-tab-bar-item
			selected
			text="Artikel 2"
			supporting-text="Wet op de Zorgtoeslag"
			short-text="Art. 2"
			short-supporting-text="WZT"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 1"
			supporting-text="Zorgverzekeringswet"
			short-text="Art. 1"
			short-supporting-text="Zvw"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 3:2"
			supporting-text="Algemene wet bestuursrecht"
			short-text="Art. 3:2"
			short-supporting-text="Awb"
		></nldd-document-tab-bar-item>
		<nldd-icon-button
			slot="end"
			appearance="neutral-tinted"
			text="Nieuw tabblad"
			icon="plus"
		></nldd-icon-button>
	</nldd-document-tab-bar>
`;

export const Standaard = {
	render: Template,
};

export const VeelTabbladen = {
	render: () => html`
	<nldd-document-tab-bar accessible-label="Documenten">
		<nldd-document-tab-bar-item
			selected
			text="Artikel 2"
			supporting-text="Wet op de Zorgtoeslag"
			short-text="Art. 2"
			short-supporting-text="WZT"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 1"
			supporting-text="Zorgverzekeringswet"
			short-text="Art. 1"
			short-supporting-text="Zvw"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 68b"
			supporting-text="Zorgverzekeringswet"
			short-text="Art. 68b"
			short-supporting-text="Zvw"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 3:2"
			supporting-text="Algemene wet bestuursrecht"
			short-text="Art. 3:2"
			short-supporting-text="Awb"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 7"
			supporting-text="Algemene wet inkomensafhankelijke regelingen"
			short-text="Art. 7"
			short-supporting-text="Awir"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 67"
			supporting-text="Algemene wet inzake rijksbelastingen"
			short-text="Art. 67"
			short-supporting-text="AWR"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 18"
			supporting-text="Algemene Kinderbijslagwet"
			short-text="Art. 18"
			short-supporting-text="AKW"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 4:3"
			supporting-text="Algemene wet bestuursrecht"
			short-text="Art. 4:3"
			short-supporting-text="Awb"
		></nldd-document-tab-bar-item>
		<nldd-icon-button
			slot="end"
			appearance="neutral-tinted"
			text="Nieuw tabblad"
			icon="plus"
		></nldd-icon-button>
	</nldd-document-tab-bar>
`,
	parameters: { controls: { disable: true } },
};

export const ZonderSubtitel = {
	render: () => html`
	<nldd-document-tab-bar accessible-label="Documenten">
		<nldd-document-tab-bar-item
			selected
			text="Artikel 2"
			short-text="Art. 2"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 1"
			short-text="Art. 1"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 3:2"
			short-text="Art. 3:2"
		></nldd-document-tab-bar-item>
	</nldd-document-tab-bar>
`,
	parameters: { controls: { disable: true } },
};


export const Herschikbaar = {
	render: () => {
		const el = document.createElement('div');
		el.innerHTML = `
			<nldd-document-tab-bar accessible-label="Documenten">
				<nldd-document-tab-bar-item
					selected
					text="Artikel 2"
					supporting-text="Wet op de Zorgtoeslag"
					short-text="Art. 2"
					short-supporting-text="WZT"
				></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item
					text="Artikel 1"
					supporting-text="Zorgverzekeringswet"
					short-text="Art. 1"
					short-supporting-text="Zvw"
				></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item
					text="Artikel 3:2"
					supporting-text="Algemene wet bestuursrecht"
					short-text="Art. 3:2"
					short-supporting-text="Awb"
				></nldd-document-tab-bar-item>
				<nldd-document-tab-bar-item
					text="Artikel 7"
					supporting-text="Algemene wet inkomensafhankelijke regelingen"
					short-text="Art. 7"
					short-supporting-text="Awir"
				></nldd-document-tab-bar-item>
			</nldd-document-tab-bar>
		`;
		return el;
	},
	parameters: { controls: { disable: true } },
};

export const Navigatie = {
	render: () => html`
	<nldd-document-tab-bar
		navigation
		accessible-label="Documenten"
	>
		<nldd-document-tab-bar-item
			selected
			text="Artikel 2"
			supporting-text="Wet op de Zorgtoeslag"
			short-text="Art. 2"
			short-supporting-text="WZT"
			href="/artikel-2"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 1"
			supporting-text="Zorgverzekeringswet"
			short-text="Art. 1"
			short-supporting-text="Zvw"
			href="/artikel-1"
		></nldd-document-tab-bar-item>
		<nldd-document-tab-bar-item
			text="Artikel 3:2"
			supporting-text="Algemene wet bestuursrecht"
			short-text="Art. 3:2"
			short-supporting-text="Awb"
			href="/artikel-3-2"
		></nldd-document-tab-bar-item>
	</nldd-document-tab-bar>
`,
	parameters: { controls: { disable: true } },
};
