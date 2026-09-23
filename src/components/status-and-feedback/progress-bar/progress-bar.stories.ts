import { html, nothing } from 'lit';
import './progress-bar.js';

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
 * Een progress bar toont voortgang of een verdeling. Eén waarde of meerdere
 * segmenten. Twee modes: `progress` (segmenten tellen op naar `max`, rest is
 * track) en `distribution` (segmenten verdelen het totaal, zoals
 * opslaggebruik). Geef ruwe getallen mee — wij berekenen percentages.
 */
export default {
	title: 'Components/Status & Feedback/Progress Bar',
	component: 'nldd-progress-bar',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/progress-bar/progress-bar.ts',
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
			description: 'Toont een schuivende indicator-animatie',
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
			options: ['sm', 'md', 'lg'],
			description: 'Hoogte van de bar',
			table: { defaultValue: { summary: 'md' } },
		},
		text: {
			control: 'text',
			description: 'Label boven de bar (links)',
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
			table: { defaultValue: { summary: 'inline' } },
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
		size: 'md',
		text: 'Bestanden uploaden',
		max: 100,
		value: 60,
		valueFormat: 'percentage',
		valueText: '',
		valueDisplay: 'inline',
		accessibleLabel: '',
	},
};

const Template = (args: Record<string, any>) => html`
	<nldd-progress-bar
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
	></nldd-progress-bar>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px;">
			<nldd-progress-bar size="sm" value="40" text="Klein (4px)"></nldd-progress-bar>
			<nldd-progress-bar size="md" value="60" text="Middel (8px)"></nldd-progress-bar>
			<nldd-progress-bar size="lg" value="80" text="Groot (16px)"></nldd-progress-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Kleuren = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 12px;">
			${ALL_COLORS.map(c => html`
				<nldd-progress-bar color=${c} value="65" text=${c}></nldd-progress-bar>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const MeerdereSegmenten = {
	name: 'Voortgang in meerdere segmenten',
	render: () => html`
		<nldd-progress-bar mode="progress" max="100" text="Verwerking" value-text="2 van 3 stappen voltooid">
			<nldd-progress-bar-segment-indicator value="40" color="success" name="Geüpload"></nldd-progress-bar-segment-indicator>
			<nldd-progress-bar-segment-indicator value="30" color="accent" name="Verwerken"></nldd-progress-bar-segment-indicator>
		</nldd-progress-bar>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Meerdere segmenten in `progress` mode tellen op naar `max`. De resterende ruimte blijft track. Met `name` per segment genereren wij een leesbare aria-valuetext.',
			},
		},
	},
};

export const ModusDistribution = {
	name: 'Modus distribution',
	render: () => html`
		<nldd-progress-bar mode="distribution" size="lg" max="500" text="Opslag" value-text="350 GB van 500 GB">
			<nldd-progress-bar-segment-indicator value="200" color="hemelblauw" name="Foto's" tooltip-text="Foto's: 200 GB (40%)"></nldd-progress-bar-segment-indicator>
			<nldd-progress-bar-segment-indicator value="100" color="oranje" name="Video's" tooltip-text="Video's: 100 GB (20%)"></nldd-progress-bar-segment-indicator>
			<nldd-progress-bar-segment-indicator value="50" color="paars" name="Documenten" tooltip-text="Documenten: 50 GB (10%)"></nldd-progress-bar-segment-indicator>
		</nldd-progress-bar>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'In `distribution` mode zijn de segmenten categorieën die samen een totaal vormen (bijv. opslaggebruik), geen opeenvolgende voortgang. Ze meten tegen `max` — hier 350 van 500 GB, dus de rest blijft lege track. Gebruik Rijksleuren om segmenten visueel te onderscheiden. Tooltips zijn per segment expliciet ingesteld om eenheden te tonen (GB) — zonder `tooltip-text` zou auto-tekst alleen `Foto\'s: 40%` tonen.',
			},
		},
	},
};

export const ToestandIndeterminate = {
	name: 'Toestand indeterminate',
	render: () => html`
		<nldd-progress-bar indeterminate color="accent" text="Bezig met laden"></nldd-progress-bar>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Geen bekende voortgang. De balk toont een doorlopende schuivende indicator. Bij `prefers-reduced-motion` wordt de animatie vervangen door een rustige pulse.',
			},
		},
	},
};

export const Waardeformaten = {
	name: 'Waardeformaten (value-format)',
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<nldd-progress-bar value="60" max="100" text="Percentage" value-format="percentage"></nldd-progress-bar>
			<nldd-progress-bar value="60" max="100" text="Absoluut" value-format="absolute"></nldd-progress-bar>
			<nldd-progress-bar value="60" max="100" text="Breuk" value-format="fraction"></nldd-progress-bar>
			<nldd-progress-bar value="60" max="100" text="Custom (value-text)" value-text="Bijna klaar"></nldd-progress-bar>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const Waardeweergave = {
	name: 'Waardeweergave (value-display)',
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<nldd-progress-bar value="60" text="Inline (boven de balk)" value-display="inline"></nldd-progress-bar>
			<nldd-progress-bar value="60" text="Tooltip (hover de balk)" value-display="tooltip"></nldd-progress-bar>
			<nldd-progress-bar value="60" text="Verborgen" value-display="none"></nldd-progress-bar>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: '`value-display` bepaalt waar de waarde verschijnt: `inline` boven de balk, in een `tooltip` (hover/focus de balk), of `none` (verborgen).',
			},
		},
	},
};

export const ZonderCaption = {
	render: () => html`
		<nldd-progress-bar value="40" value-display="none"></nldd-progress-bar>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `value-display="none"` verschijnt geen caption — alleen de balk. Handig voor inline gebruik.',
			},
		},
	},
};
