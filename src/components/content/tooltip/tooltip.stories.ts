import { html } from 'lit';
import './tooltip.js';
import '../../actions/button/button.js';
import '../../actions/icon-button/icon-button.js';
import '../rich-text/rich-text.js';

/**
 * De Tooltip toont informatieve tekst bij hover of focus op een child element.
 * Gebruikt `display: contents` zodat het de layout niet beïnvloedt.
 *
 * ## Gebruik
 * ```html
 * <nldd-tooltip text="Meer informatie">
 *   <nldd-icon-button icon="info" text="Info"></nldd-icon-button>
 * </nldd-tooltip>
 * ```
 */
export default {
	title: 'Components/Content/Tooltip',
	component: 'nldd-tooltip',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/tooltip/tooltip.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	argTypes: {
		text: {
			control: 'text',
			description: 'Tooltip tekst',
		},
		placement: {
			control: 'select',
			options: ['top', 'bottom', 'left', 'right'],
			description: 'Positie van de tooltip',
			table: { defaultValue: { summary: 'bottom' } },
		},
		timing: {
			control: 'select',
			options: ['instant', 'delay', 'never'],
			description: 'Wanneer de tooltip verschijnt op hover. `instant`: direct zonder show-delay. `delay`: na de standaard show-delay (700ms). `never`: tooltip wordt nooit getoond, aria-describedby wordt onderdrukt.',
			table: { defaultValue: { summary: 'delay' } },
		},
	},
	args: {
		text: 'Dit is een tooltip',
		placement: 'bottom',
		timing: 'delay',
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<div style="display: flex; justify-content: center; padding: 4rem;">
			<nldd-tooltip
				text=${args.text}
				placement=${args.placement}
				timing=${args.timing}
			>
				<nldd-button text="Hover mij"></nldd-button>
			</nldd-tooltip>
		</div>
	`,
};

export const MetIconButton = {
	render: () => html`
		<div style="display: flex; justify-content: center; padding: 4rem;">
			<nldd-icon-button
				icon="info"
				text="Info"
			></nldd-icon-button>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icon-button rendert intern een nldd-tooltip wanneer de tekst niet zichtbaar is.',
			},
		},
	},
};

export const Posities = {
	render: () => html`
		<div style="display: flex; gap: 2rem; justify-content: center; padding: 4rem;">
			<nldd-tooltip
				text="Boven"
				placement="top"
			>
				<nldd-button text="Top"></nldd-button>
			</nldd-tooltip>
			<nldd-tooltip
				text="Onder"
				placement="bottom"
			>
				<nldd-button text="Bottom"></nldd-button>
			</nldd-tooltip>
			<nldd-tooltip
				text="Links"
				placement="left"
			>
				<nldd-button text="Left"></nldd-button>
			</nldd-tooltip>
			<nldd-tooltip
				text="Rechts"
				placement="right"
			>
				<nldd-button text="Right"></nldd-button>
			</nldd-tooltip>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MetLink = {
	render: () => html`
		<nldd-rich-text>
			<p>Lees meer over
				<nldd-tooltip text="Artikel 1: Allen die zich in Nederland bevinden, worden in gelijke gevallen gelijk behandeld.">
					<a href="#">de Grondwet</a>
				</nldd-tooltip>
				voor meer informatie.
			</p>
		</nldd-rich-text>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De tooltip kan om elk focusbaar element gewrapt worden, zoals een link.',
			},
		},
	},
};
