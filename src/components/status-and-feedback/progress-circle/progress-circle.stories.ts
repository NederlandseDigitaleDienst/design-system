import { html, nothing } from 'lit';
import './progress-circle.js';

const SEMANTIC_COLORS = ['neutral', 'accent', 'success', 'warning', 'critical'] as const;

const RIJKSLEUREN = [
	'lintblauw', 'donkerblauw', 'hemelblauw', 'lichtblauw',
	'paars', 'violet',
	'robijnrood', 'roze', 'rood', 'oranje',
	'donkergeel', 'geel',
	'donkerbruin', 'bruin',
	'donkergroen', 'groen', 'mosgroen', 'mintgroen',
] as const;

const ALL_COLORS = [...SEMANTIC_COLORS, ...RIJKSLEUREN];

/**
 * Een circulaire progress indicator met dezelfde mogelijkheden als de
 * progress-bar: single-value of multi-segment, progress en distribution
 * modes, 24 kleur-varianten, indeterminate, en transitions tussen
 * determinate/indeterminate. Label staat onder de cirkel.
 */
export default {
	title: 'Components/Status & Feedback/Progress Circle',
	component: 'nldd-progress-circle',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/progress-circle/progress-circle.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	argTypes: {
		mode: {
			control: 'select',
			options: ['progress', 'distribution'],
			description: 'Semantiek voor ARIA en visualisatie',
			table: { defaultValue: { summary: 'progress' } },
		},
		indeterminate: {
			control: 'boolean',
			description: 'Toont een draaiende indicator-animatie',
			table: { defaultValue: { summary: false } },
		},
		color: {
			control: 'select',
			options: ALL_COLORS,
			description: 'Kleur van het single-segment',
			table: { defaultValue: { summary: 'accent' } },
		},
		size: {
			control: 'select',
			options: ['16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'],
			description: 'Diameter in px (zelfde set als nldd-icon)',
			table: { defaultValue: { summary: '28' } },
		},
		text: {
			control: 'text',
			description: 'Label onder de cirkel',
		},
		max: {
			control: { type: 'number', min: 1 },
			description: 'Totaalwaarde',
			table: { defaultValue: { summary: 100 } },
		},
		value: {
			control: { type: 'number', min: 0 },
			description: 'Single-segment shorthand',
		},
		valueFormat: {
			name: 'value-format',
			control: 'select',
			options: ['percentage', 'absolute', 'fraction'],
			description: 'Format van de getoonde waarde',
			table: { defaultValue: { summary: 'percentage' } },
		},
		valueText: {
			name: 'value-text',
			control: 'text',
			description: 'Volledige override van de getoonde waarde',
		},
		valueDisplay: {
			name: 'value-display',
			control: 'select',
			options: ['inline', 'tooltip', 'none'],
			description: 'Waar de waarde verschijnt: inline, tooltip of verborgen',
			table: { defaultValue: { summary: 'tooltip' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Volledige override van aria-valuetext',
		},
	},
	args: {
		mode: 'progress',
		indeterminate: false,
		color: 'accent',
		size: '28',
		text: 'Bestanden uploaden',
		max: 100,
		value: 60,
		valueFormat: 'percentage',
		valueText: '',
		valueDisplay: 'tooltip',
		accessibleLabel: '',
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-progress-circle
		mode=${args.mode}
		?indeterminate=${args.indeterminate}
		color=${args.color}
		size=${args.size}
		text=${args.text || nothing}
		max=${args.max}
		value=${args.value}
		value-format=${args.valueFormat}
		value-text=${args.valueText || nothing}
		value-display=${args.valueDisplay}
		accessible-label=${args.accessibleLabel || nothing}
	></nldd-progress-circle>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; gap: 32px; align-items: center;">
			<nldd-progress-circle size="24" value="60" text="24"></nldd-progress-circle>
			<nldd-progress-circle size="32" value="60" text="32"></nldd-progress-circle>
			<nldd-progress-circle size="48" value="60" text="48"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" text="56"></nldd-progress-circle>
			<nldd-progress-circle size="80" value="60" text="80"></nldd-progress-circle>
			<nldd-progress-circle size="96" value="60" text="96"></nldd-progress-circle>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Kleuren = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: center;">
			${ALL_COLORS.map(c => html`
				<nldd-progress-circle color=${c} value="65" text=${c} size="56"></nldd-progress-circle>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MeerdereSegmenten = {
	name: 'Voortgang in meerdere segmenten',
	render: () => html`
		<nldd-progress-circle mode="progress" size="80" max="100" text="Verwerking">
			<nldd-progress-circle-segment-indicator value="40" color="success" name="Geüpload"></nldd-progress-circle-segment-indicator>
			<nldd-progress-circle-segment-indicator value="30" color="accent" name="Verwerken"></nldd-progress-circle-segment-indicator>
		</nldd-progress-circle>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'In `progress` mode tellen segmenten op naar `max`. De resterende ruimte blijft het lege track-deel. De tooltip combineert alle segmenten plus de totale voortgang.',
			},
		},
	},
};

export const ModusDistribution = {
	name: 'Modus distribution',
	render: () => html`
		<nldd-progress-circle mode="distribution" size="80" max="500" text="Opslag (500 GB)">
			<nldd-progress-circle-segment-indicator value="200" color="hemelblauw" name="Foto's"></nldd-progress-circle-segment-indicator>
			<nldd-progress-circle-segment-indicator value="100" color="oranje" name="Video's"></nldd-progress-circle-segment-indicator>
			<nldd-progress-circle-segment-indicator value="50" color="paars" name="Documenten"></nldd-progress-circle-segment-indicator>
			<nldd-progress-circle-segment-indicator value="150" color="neutral" name="Vrij"></nldd-progress-circle-segment-indicator>
		</nldd-progress-circle>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'In `distribution` mode zijn de segmenten categorieën binnen een totaal, geen voortgang. Net als progress meten ze tegen `max`; hier vult de `Vrij`-categorie (150) het restant aan tot 500, zodat de cirkel helemaal gevuld is. Gaps tussen segmenten zijn 2px. Tooltip toont alle categorieën met percentages.',
			},
		},
	},
};

export const ToestandIndeterminate = {
	name: 'Toestand indeterminate',
	render: () => html`
		<nldd-progress-circle indeterminate color="accent" text="Bezig met laden"></nldd-progress-circle>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een vaste boog draait rond de cirkel. Bij `prefers-reduced-motion` wordt de animatie vervangen door een rustige pulse.',
			},
		},
	},
};

export const Waardeformaten = {
	name: 'Waardeformaten (value-format)',
	render: () => html`
		<div style="display: flex; gap: 32px; align-items: flex-start;">
			<nldd-progress-circle size="56" value="60" max="100" text="Percentage" value-format="percentage" value-display="inline"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" max="100" text="Absoluut" value-format="absolute" value-display="inline"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" max="100" text="Breuk" value-format="fraction" value-display="inline"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" max="100" text="Custom (value-text)" value-text="Bijna klaar" value-display="inline"></nldd-progress-circle>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Waardeweergave = {
	name: 'Waardeweergave (value-display)',
	render: () => html`
		<div style="display: flex; gap: 32px; align-items: flex-start;">
			<nldd-progress-circle size="56" value="60" text="Inline (onder de label)" value-display="inline"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" text="Tooltip (hover de cirkel)" value-display="tooltip"></nldd-progress-circle>
			<nldd-progress-circle size="56" value="60" text="Verborgen" value-display="none"></nldd-progress-circle>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`value-display` bepaalt waar de waarde verschijnt: `inline` als secundaire tekst onder de label, in een `tooltip` (hover/focus de cirkel), of `none` (verborgen).',
			},
		},
	},
};

export const ZonderCaption = {
	render: () => html`
		<nldd-progress-circle size="56" value="40" value-display="none"></nldd-progress-circle>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `value-display="none"` en geen `text` verschijnt geen caption — alleen de cirkel. Handig voor inline gebruik.',
			},
		},
	},
};
