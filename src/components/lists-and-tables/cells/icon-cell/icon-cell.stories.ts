import { html, nothing } from 'lit';
import './icon-cell.js';
import '../../../content/icon/icon.js';
import { ICONS } from '../../../content/icon/icon.js';

export default {
	title: 'Components/Lists & Tables/Cells/Icon Cell',
	component: 'nldd-icon-cell',
	tags: ['autodocs'],
	args: {
		size: '24',
		color: 'content',
		verticalAlignment: 'center',
		icon: 'icon-placeholder',
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['16', '20', '24', '32'],
			description: 'Grootte van het icoon in pixels',
			table: { defaultValue: { summary: '24' } },
		},
		color: {
			control: 'select',
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical'],
			description: 'Kleurvariant van het icoon',
			table: { defaultValue: { summary: 'content' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['top', 'center', 'bottom'],
			description: 'Verticale uitlijning van het icoon',
			table: { defaultValue: { summary: 'center' } },
		},
		icon: {
			control: 'select',
			options: ICONS,
			description: 'Te tonen icoon',
		},
		hideBelow: {
			name: 'hide-below',
			control: 'text',
			description: 'Verberg wanneer cells-container smaller is dan deze CSS-lengte (bv. "320px", "20rem")',
		},
		hideAbove: {
			name: 'hide-above',
			control: 'text',
			description: 'Verberg wanneer cells-container breder is dan deze CSS-lengte (bv. "1200px")',
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-icon-cell
			size=${args.size}
			color=${args.color}
			vertical-alignment=${args.verticalAlignment}
			icon=${args.icon}
			hide-below=${args.hideBelow || nothing}
			hide-above=${args.hideAbove || nothing}
		></nldd-icon-cell>
	`,
};

export const Kleuren = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-icon-cell size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell color="secondary" size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell color="accent" size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell color="success" size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell color="warning" size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell color="critical" size="24" icon="icon-placeholder"></nldd-icon-cell>
		</div>
	`,
	parameters: {
		docs: {
			description: { story: 'Default · secondary · accent · success · warning · critical.' },
		},
	},
};

export const AlleGrootten = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-icon-cell size="16" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell size="20" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell size="24" icon="icon-placeholder"></nldd-icon-cell>
			<nldd-icon-cell size="32" icon="icon-placeholder"></nldd-icon-cell>
		</div>
	`,
};

export const BovenUitgelijnd = {
	render: () => html`
		<nldd-icon-cell vertical-alignment="top" size="24" icon="icon-placeholder" style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);"></nldd-icon-cell>
	`,
};

export const EigenInhoudInDeSlot = {
	render: () => html`
		<nldd-icon-cell size="24">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
				<circle cx="12" cy="12" r="10"></circle>
			</svg>
		</nldd-icon-cell>
	`,
	parameters: {
		controls: { disable: true },
		docs: { description: { story: 'Wanneer `icon` niet is gezet, rendert de default-slot consumer-inhoud — handig voor custom SVG\'s of iconen uit een andere library.' } },
	},
};
