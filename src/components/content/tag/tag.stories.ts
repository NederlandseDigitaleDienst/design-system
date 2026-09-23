import { html, nothing } from 'lit';
import './tag.js';
import { ICONS } from './../icon/icon.js';

/**
 * De Tag is een compact kenmerk dat aan iets is toegekend: een categorie, een type,
 * een rol, een keurmerk. Wat er staat verandert pas als iemand de inhoud wijzigt,
 * en een tag is niet interactief.
 *
 * Een toestand die het systeem bijhoudt ("Actief", "Verlopen") is een `nldd-badge`.
 * Kan de gebruiker het weghalen of erop klikken, dan is het een `nldd-token`.
 *
 * ## Gebruik
 * ```html
 * <nldd-tag text="Concept"></nldd-tag>
 * <nldd-tag color="success" text="Gepubliceerd"></nldd-tag>
 * ```
 */
export default {
	title: 'Components/Content/Tag',
	component: 'nldd-tag',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/tag/tag.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		variant: '',
		color: 'neutral',
		size: 'md',
		text: 'Tag',
		icon: '',
		accessibleLabel: '',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['(auto)', 'text', 'icon', 'icon-and-text'],
			mapping: { '(auto)': '' },
			description: 'Wat zichtbaar is. Bij "(auto)" bepaalt de tag dat zelf op basis van text/icon.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		color: {
			control: 'select',
			options: [
				// Semantisch
				'neutral', 'accent', 'success', 'warning', 'critical',
				// Rijkskleuren
				'lintblauw', 'donkerblauw', 'hemelblauw', 'lichtblauw',
				'paars', 'violet', 'robijnrood', 'roze', 'rood',
				'oranje', 'donkergeel', 'geel', 'donkerbruin', 'bruin',
				'donkergroen', 'groen', 'mosgroen', 'mintgroen',
			],
			description: 'Kleur: semantisch (neutral, accent, success, warning, critical) of een rijkskleur',
			table: {
				defaultValue: { summary: 'neutral' },
			},
		},
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte van de tag',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		text: {
			control: 'text',
			description: 'Tekst van de tag',
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon voor de tekst',
			table: {
				defaultValue: { summary: '(geen)' },
			},
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label (vooral nuttig bij icon-only tags)',
		},
	},
};

const Template = ({ variant, color, size, text, icon, accessibleLabel }: Record<string, any>) => html`
	<nldd-tag
		variant=${variant || nothing}
		color=${color}
		size=${size}
		icon=${icon || nothing}
		text=${text}
		accessible-label=${accessibleLabel || nothing}
	></nldd-tag>
`;

export const Standaard = {
	render: Template,
	args: {
		text: 'Tag',
	},
};

export const Kleuren = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
			<nldd-tag color="neutral" text="neutral"></nldd-tag>
			<nldd-tag color="accent" text="accent"></nldd-tag>
			<nldd-tag color="success" text="success"></nldd-tag>
			<nldd-tag color="warning" text="warning"></nldd-tag>
			<nldd-tag color="critical" text="critical"></nldd-tag>
			<nldd-tag color="lintblauw" text="lintblauw"></nldd-tag>
			<nldd-tag color="donkerblauw" text="donkerblauw"></nldd-tag>
			<nldd-tag color="hemelblauw" text="hemelblauw"></nldd-tag>
			<nldd-tag color="lichtblauw" text="lichtblauw"></nldd-tag>
			<nldd-tag color="paars" text="paars"></nldd-tag>
			<nldd-tag color="violet" text="violet"></nldd-tag>
			<nldd-tag color="robijnrood" text="robijnrood"></nldd-tag>
			<nldd-tag color="roze" text="roze"></nldd-tag>
			<nldd-tag color="rood" text="rood"></nldd-tag>
			<nldd-tag color="oranje" text="oranje"></nldd-tag>
			<nldd-tag color="donkergeel" text="donkergeel"></nldd-tag>
			<nldd-tag color="geel" text="geel"></nldd-tag>
			<nldd-tag color="donkerbruin" text="donkerbruin"></nldd-tag>
			<nldd-tag color="bruin" text="bruin"></nldd-tag>
			<nldd-tag color="donkergroen" text="donkergroen"></nldd-tag>
			<nldd-tag color="groen" text="groen"></nldd-tag>
			<nldd-tag color="mosgroen" text="mosgroen"></nldd-tag>
			<nldd-tag color="mintgroen" text="mintgroen"></nldd-tag>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Semantische varianten (`neutral`, `accent`, `success`, `warning`, `critical`) voor de meest voorkomende statussen — gebruik deze waar mogelijk, ze communiceren betekenis bovenop kleur. Daarnaast alle Rijksleuren voor categorisering waar de semantische varianten niet passen. Combineer kleur altijd met tekst zodat de tag ook zonder kleur leesbaar blijft.',
			},
		},
	},
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
			<nldd-tag size="md" text="Medium"></nldd-tag>
			<nldd-tag size="sm" text="Small"></nldd-tag>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetIcoon = {
	render: () => html`
		<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
			<nldd-tag color="success" text="Goedgekeurd" icon="check-mark"></nldd-tag>
			<nldd-tag color="warning" text="Let op" icon="alert"></nldd-tag>
			<nldd-tag color="critical" text="Afgewezen" icon="dismiss-circle"></nldd-tag>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};
