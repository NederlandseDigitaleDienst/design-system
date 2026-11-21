import { html, nothing } from 'lit';
import './icon-cell.js';
import '../../../content/icon/icon.js';
import { ICONS } from '../../../content/icon/icon.js';
import '../../list/list.js';
import '../../list-item/list-item.js';

/**
 * `nldd-icon-cell` is een cel met een icoon in een rij van een `nldd-list`.
 * Geef met `icon` een naam uit de iconenset, of zet eigen inhoud in het slot
 * voor een icoon dat er niet in staat.
 */
export default {
	title: 'Components/Lists & Tables/Cells/Icon Cell',
	component: 'nldd-icon-cell',
	tags: ['autodocs'],
	args: {
		color: 'content',
		size: '24',
		verticalAlignment: 'center',
		hideAbove: '',
		hideBelow: '',
		icon: 'icon-placeholder',
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleurvariant van het icoon',
			table: { defaultValue: { summary: 'content' } },
		},
		size: {
			control: 'select',
			options: ['16', '20', '24', '32'],
			description: 'Grootte van het icoon in pixels',
			table: { defaultValue: { summary: '24' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['top', 'center', 'bottom'],
			description: 'Verticale uitlijning van het icoon',
			table: { defaultValue: { summary: 'center' } },
		},
		hideAbove: {
			name: 'hide-above',
			control: 'text',
			description: 'Verberg wanneer cells-container breder is dan deze CSS-lengte (bv. "1200px")',
		},
		hideBelow: {
			name: 'hide-below',
			control: 'text',
			description: 'Verberg wanneer cells-container smaller is dan deze CSS-lengte (bv. "320px", "20rem")',
		},
		icon: {
			control: 'select',
			options: ICONS,
			description: 'Te tonen icoon',
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-icon-cell
			color=${args.color}
			size=${args.size}
			vertical-alignment=${args.verticalAlignment}
			hide-above=${args.hideAbove || nothing}
			hide-below=${args.hideBelow || nothing}
			icon=${args.icon}
		></nldd-icon-cell>
	`,
};

export const Kleuren = {
	render: () => html`
		<nldd-list accessible-label="Kleuren">
			<nldd-list-item>
				<nldd-icon-cell
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					color="secondary"
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					color="accent"
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					color="success"
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					color="warning"
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					color="critical"
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
			</nldd-list-item>
		</nldd-list>
	`,
	parameters: {
		docs: {
			description: { story: 'Default · secondary · accent · success · warning · critical.' },
		},
	},
};

export const AlleGrootten = {
	render: () => html`
		<nldd-list accessible-label="Grootten">
			<nldd-list-item>
				<nldd-icon-cell
					size="32"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					size="24"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					size="20"
					icon="icon-placeholder"
				></nldd-icon-cell>
				<nldd-icon-cell
					size="16"
					icon="icon-placeholder"
				></nldd-icon-cell>
			</nldd-list-item>
		</nldd-list>
	`,
};

export const BovenUitgelijnd = {
	render: () => html`
		<nldd-icon-cell
			vertical-alignment="top"
			size="24"
			icon="icon-placeholder"
			class="cell-bounds cell-bounds-tall"
		></nldd-icon-cell>
	`,
};

export const EigenInhoudInDeSlot = {
	render: () => html`
		<nldd-icon-cell size="24">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<circle
					cx="12"
					cy="12"
					r="10"
				></circle>
			</svg>
		</nldd-icon-cell>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Wanneer `icon` niet is gezet, rendert de default-slot consumer-inhoud. Handig voor custom SVG\'s of iconen uit een andere library.' } },
	},
};
