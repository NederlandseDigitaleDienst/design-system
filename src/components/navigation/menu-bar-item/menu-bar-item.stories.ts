import { html, nothing } from 'lit';
import './menu-bar-item.js';
import '../../content/avatar/avatar.js';
import { ICONS } from '../../content/icon/icon.js';
import '../../layout/container/container.js';

export default {
	title: 'Components/Navigation/Menu Bar Item',
	component: 'nldd-menu-bar-item',
	tags: ['autodocs'],
	args: {
		expandable: false,
		iconOnly: false,
		text: 'Aanvragen',
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
		text: 'Mijn account',
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
		<nldd-menu-bar-item
			text="Mijn account"
			icon="account"
			expandable
		>
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

/**
 * Het `icon`-slot neemt de plek van het icoon in, bijvoorbeeld voor een
 * `nldd-avatar` van wie er is ingelogd. Het krijgt de maat van een icoon en
 * volgt `content-priority` en `icon-only` zoals het icoon dat doet: het tweede
 * item is `compact` en toont alleen de avatar, met de tekst als toegankelijke
 * naam.
 */
export const MetAvatar = {
	name: 'Met avatar',
	render: () => html`
		<nldd-container
			layout="row"
			gap="16"
		>
			<nldd-menu-bar-item
				text="Mijn account"
				expandable
				content-priority="icon"
			>
				<nldd-avatar
					slot="icon"
					color="inherit"
					name="Anouk de Vries"
					decorative
					icon-aligned
				></nldd-avatar>
				<nldd-menu>
					<nldd-menu-item text="Profiel"></nldd-menu-item>
					<nldd-menu-item text="Log uit"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Mijn account"
				expandable
				content-priority="icon"
				compact
			>
				<nldd-avatar
					slot="icon"
					color="inherit"
					name="Anouk de Vries"
					decorative
					icon-aligned
				></nldd-avatar>
				<nldd-menu>
					<nldd-menu-item text="Profiel"></nldd-menu-item>
					<nldd-menu-item text="Log uit"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const AlleToestanden = {
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="8"
			vertical-alignment="center"
		>
			<nldd-menu-bar-item text="Standaard"></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Huidig"
				current
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Met icoon"
				icon="magnifier"
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Alleen icoon"
				icon="magnifier"
				icon-only
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Voorrang icoon"
				icon="magnifier"
				content-priority="icon"
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Voorrang icoon (compact)"
				icon="magnifier"
				content-priority="icon"
				compact
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Voorrang tekst"
				icon="person"
				content-priority="text"
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Voorrang tekst (compact)"
				icon="person"
				content-priority="text"
				compact
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Uitgeschakeld"
				disabled
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Link"
				href="/"
			></nldd-menu-bar-item>
			<nldd-menu-bar-item
				text="Uitklapbaar"
				expandable
			>
				<nldd-menu>
					<nldd-menu-item text="Aanvraag A-1042"></nldd-menu-item>
					<nldd-menu-item text="Aanvraag A-1043"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};
