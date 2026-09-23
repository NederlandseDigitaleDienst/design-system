import { html, nothing } from 'lit';
import './menu-bar-item.js';
import { ICONS } from '../../content/icon/icon.js';

export default {
	title: 'Components/Navigation/Menu Bar Item',
	component: 'nldd-menu-bar-item',
	tags: ['autodocs'],
	args: {
		expandable: false,
		iconOnly: false,
		text: 'Menu item',
		icon: '',
		href: '',
		current: false,
		contentPriority: '',
		compact: false,
		accessibleLabel: '',
		disabled: false,
	},
	argTypes: {
		expandable: { control: 'boolean', description: 'Toon disclosure icon', table: { defaultValue: { summary: false } } },
		iconOnly: { name: 'icon-only', control: 'boolean', description: 'Verberg tekst visueel (altijd)', table: { defaultValue: { summary: false } } },
		text: { control: 'text', description: 'Tekst van het item' },
		icon: { control: 'select', options: ['(geen)', ...ICONS], mapping: { '(geen)': '' }, description: 'Icon naam (nldd-icon)', table: { defaultValue: { summary: '(geen)' } } },
		href: { control: 'text', description: 'Optionele link URL' },
		current: { control: 'boolean', description: 'Markeer als actief/huidig', table: { defaultValue: { summary: false } } },
		contentPriority: {
			name: 'content-priority',
			control: 'select',
			options: ['(geen)', 'icon', 'text'],
			mapping: { '(geen)': '' },
			description: 'Bepaalt wat zichtbaar blijft in compact modus',
			table: { defaultValue: { summary: '(geen)' } },
		},
		compact: { control: 'boolean', description: 'Activeert content-priority gedrag (gezet door parent)', table: { defaultValue: { summary: false } } },
		accessibleLabel: { name: 'accessible-label', control: 'text', description: 'Toegankelijk label voor screen readers' },
		disabled: { control: 'boolean', description: 'Schakel interactie uit', table: { defaultValue: { summary: false } } },
	},
};

const Template = ({
	expandable,
	iconOnly,
	text,
	icon,
	href,
	current,
	contentPriority,
	compact,
	accessibleLabel,
	disabled,
}: Record<string, unknown>) => html`
	<nldd-menu-bar-item
		text=${text || nothing}
		icon=${icon || nothing}
		href=${href || nothing}
		?current=${current}
		?expandable=${expandable}
		?icon-only=${iconOnly}
		content-priority=${contentPriority || nothing}
		?compact=${compact}
		accessible-label=${accessibleLabel || nothing}
		?disabled=${disabled}
	></nldd-menu-bar-item>
`;

export const Standaard = {
	render: Template,
};

export const MetIcoon = {
	render: Template,
	args: {
		text: 'Zoeken',
		icon: 'magnifier',
	},
};

export const ToestandCurrent = {
	name: 'Toestand current',
	render: Template,
	args: {
		text: 'Home',
		current: true,
	},
};

export const AlsLink = {
	render: Template,
	args: {
		text: 'Home',
		href: '/',
	},
};

export const AlleenIcoon = {
	render: Template,
	args: {
		text: 'Zoeken',
		icon: 'magnifier',
		iconOnly: true,
	},
};

export const ContentPriorityIcon = {
	name: 'Content-priority icon',
	render: Template,
	args: {
		text: 'Zoeken',
		icon: 'magnifier',
		contentPriority: 'icon',
		compact: true,
	},
};

export const ContentPriorityText = {
	name: 'Content-priority text',
	render: Template,
	args: {
		text: 'Mijn DigID',
		icon: 'person',
		contentPriority: 'text',
		compact: true,
	},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: Template,
	args: {
		text: 'Uitgeschakeld',
		disabled: true,
	},
};

export const MetExpandable = {
	render: () => html`
		<nldd-menu-bar-item text="Account" icon="person" expandable>
			<nldd-menu>
				<nldd-menu-item text="Mijn profiel"></nldd-menu-item>
				<nldd-menu-item text="Instellingen"></nldd-menu-item>
				<nldd-menu-divider></nldd-menu-divider>
				<nldd-menu-item text="Log uit"></nldd-menu-item>
			</nldd-menu>
		</nldd-menu-bar-item>
	`,
	parameters: { controls: { disable: true } },
};

export const AlleToestanden = {
	render: () => html`
		<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
			<nldd-menu-bar-item text="Default"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Current" current></nldd-menu-bar-item>
			<nldd-menu-bar-item text="With Icon" icon="magnifier"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Icon Only" icon="magnifier" icon-only></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Priority Icon" icon="magnifier" content-priority="icon"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Priority Icon (compact)" icon="magnifier" content-priority="icon" compact></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Priority Text" icon="person" content-priority="text"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Priority Text (compact)" icon="person" content-priority="text" compact></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Disabled" disabled></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Link" href="/"></nldd-menu-bar-item>
			<nldd-menu-bar-item text="Expandable" expandable>
				<nldd-menu>
					<nldd-menu-item text="Optie 1"></nldd-menu-item>
					<nldd-menu-item text="Optie 2"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
