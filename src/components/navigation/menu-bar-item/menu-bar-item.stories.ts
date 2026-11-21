import { html, nothing } from 'lit';
import './menu-bar-item.js';
import '../menu-bar/menu-bar.js';
import '../../content/avatar/avatar.js';
import { ICONS } from '../../content/icon/icon.js';
import '../../layout/container/container.js';

/**
 * `nldd-menu-bar-item` is een item in een `nldd-menu-bar`: een link met `href`,
 * anders een button. Met een `nldd-menu` erin opent het een menu.
 */
export default {
	title: 'Components/Navigation/Menu Bar Item',
	component: 'nldd-menu-bar-item',
	tags: ['autodocs'],
	args: {
		iconOnly: false,
		text: 'Aanvragen',
		icon: '',
		expandable: false,
		accessibleLabel: '',
		contentPriority: '',
		current: false,
		href: '',
		disabled: false,
	},
	argTypes: {
		iconOnly: { name: 'icon-only', control: 'boolean', description: 'Verberg tekst visueel (altijd)', table: { defaultValue: { summary: false } } },
		text: { control: 'text', description: 'Tekst van het item' },
		icon: { control: 'select', options: ['(geen)', ...ICONS], mapping: { '(geen)': '' }, description: 'Icon naam (nldd-icon)', table: { defaultValue: { summary: '(geen)' } } },
		expandable: { control: 'boolean', description: 'Toon disclosure icon', table: { defaultValue: { summary: false } } },
		accessibleLabel: { name: 'accessible-label', control: 'text', description: 'Toegankelijk label voor screen readers' },
		contentPriority: {
			name: 'content-priority',
			control: 'select',
			options: ['(geen)', 'icon', 'text'],
			mapping: { '(geen)': '' },
			description: 'Bepaalt wat zichtbaar blijft in compact modus',
			table: { defaultValue: { summary: '(geen)' } },
		},
		current: { control: 'boolean', description: 'Markeer als actief/huidig', table: { defaultValue: { summary: false } } },
		href: { control: 'text', description: 'Optionele link URL' },
		disabled: { control: 'boolean', description: 'Schakel interactie uit', table: { defaultValue: { summary: false } } },
	},
};

const Template = ({
	iconOnly,
	text,
	icon,
	expandable,
	accessibleLabel,
	contentPriority,
	current,
	href,
	disabled,
}: Record<string, unknown>) => html`
	<nldd-menu-bar-item
		?icon-only=${iconOnly}
		text=${text || nothing}
		icon=${icon || nothing}
		?expandable=${expandable}
		accessible-label=${accessibleLabel || nothing}
		content-priority=${contentPriority || nothing}
		?current=${current}
		href=${href || nothing}
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
		iconOnly: true,
		text: 'Zoeken',
		icon: 'magnifier',
	},
};

/** Compact is what a bar sets on its items on a narrow screen, so these sit in one. */
const CompactTemplate = (args: Record<string, unknown>) => html`
	<nldd-menu-bar
		compact
		accessible-label="Menu"
	>${Template(args)}</nldd-menu-bar>
`;

export const ContentPriorityIcon = {
	name: 'Content-priority icon',
	render: CompactTemplate,
	args: {
		text: 'Zoeken',
		icon: 'magnifier',
		contentPriority: 'icon',
	},
};

export const ContentPriorityText = {
	name: 'Content-priority text',
	render: CompactTemplate,
	args: {
		text: 'Mijn account',
		icon: 'person',
		contentPriority: 'text',
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
 * item staat in een compacte `nldd-menu-bar` en toont alleen de avatar, met
 * de tekst als toegankelijke naam.
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
					color="content"
					name="Anouk de Vries"
					decorative
					icon-aligned
				></nldd-avatar>
				<nldd-menu>
					<nldd-menu-item text="Profiel"></nldd-menu-item>
					<nldd-menu-item text="Log uit"></nldd-menu-item>
				</nldd-menu>
			</nldd-menu-bar-item>
			<nldd-menu-bar
				compact
				accessible-label="Account"
			>
				<nldd-menu-bar-item
					text="Mijn account"
					expandable
					content-priority="icon"
				>
					<nldd-avatar
						slot="icon"
						color="content"
						name="Anouk de Vries"
						decorative
						icon-aligned
					></nldd-avatar>
					<nldd-menu>
						<nldd-menu-item text="Profiel"></nldd-menu-item>
						<nldd-menu-item text="Log uit"></nldd-menu-item>
					</nldd-menu>
				</nldd-menu-bar-item>
			</nldd-menu-bar>
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const AlleToestanden = {
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="8"
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
			<nldd-menu-bar
				compact
				accessible-label="Voorrang icoon"
			>
				<nldd-menu-bar-item
					text="Voorrang icoon (compact)"
					icon="magnifier"
					content-priority="icon"
				></nldd-menu-bar-item>
			</nldd-menu-bar>
			<nldd-menu-bar-item
				text="Voorrang tekst"
				icon="person"
				content-priority="text"
			></nldd-menu-bar-item>
			<nldd-menu-bar
				compact
				accessible-label="Voorrang tekst"
			>
				<nldd-menu-bar-item
					text="Voorrang tekst (compact)"
					icon="person"
					content-priority="text"
				></nldd-menu-bar-item>
			</nldd-menu-bar>
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
