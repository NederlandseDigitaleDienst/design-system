import { html, nothing } from 'lit';
import './badge.js';
import { ICONS } from './../../content/icon/icon.js';

/**
 * De Badge toont de toestand van iets, of hoeveel er van iets is. Wat er staat
 * bepaalt het systeem, niet de gebruiker, en het verandert zonder dat iemand het
 * aanraakt. Een badge is nooit interactief.
 *
 * Met `number` of `text` toont hij een waarde; zonder waarde verschijnt een stip.
 * Gaat het om een kenmerk dat iemand heeft toegekend, dan is het een
 * `nldd-tag`; om zelfstandige data die de gebruiker hanteert, een `nldd-token`.
 *
 * ## Gebruik
 * ```html
 * <nldd-badge number="3"></nldd-badge>
 * <nldd-badge></nldd-badge> <!-- toont stip -->
 * <nldd-badge color="success" text="Nieuw"></nldd-badge>
 * ```
 */
const SEMANTIC_COLORS = ['critical', 'accent', 'neutral', 'warning', 'success'];
const RIJKSLEUREN = [
	'lintblauw', 'donkerblauw', 'hemelblauw', 'lichtblauw',
	'paars', 'violet',
	'robijnrood', 'roze', 'rood', 'oranje',
	'donkergeel', 'geel',
	'donkerbruin', 'bruin',
	'donkergroen', 'groen', 'mosgroen', 'mintgroen',
];
const COLORS = [...SEMANTIC_COLORS, ...RIJKSLEUREN, 'inherit'];

export default {
	title: 'Components/Status & Feedback/Badge',
	component: 'nldd-badge',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/badge/badge.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		color: 'critical',
		customColor: '',
		pulse: false,
		text: '',
		number: '3',
		max: 99,
		icon: '',
		accessibleLabel: '',
		decorative: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md'],
			description: 'Grootte',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		color: {
			control: 'select',
			options: COLORS,
			description: 'Kleurvariant. `inherit` vult met de contentkleur eromheen.',
			table: {
				defaultValue: { summary: 'critical' },
			},
		},
		customColor: {
			name: 'custom-color',
			control: 'text',
			description: 'Een eigen kleur, als CSS-waarde. Wint van `color`.',
		},
		pulse: {
			control: 'boolean',
			description: 'Laat een ring uit de badge groeien en vervagen',
			table: {
				defaultValue: { summary: false },
			},
		},
		text: {
			control: 'text',
			description: 'Tekst (heeft voorrang op number)',
		},
		number: {
			control: { type: 'text' },
			description: 'Numerieke waarde (leeg laten voor stip)',
			table: {
				type: { summary: 'number' },
			},
		},
		max: {
			control: 'number',
			description: 'Maximum getoonde waarde (daarboven "max+")',
			table: {
				defaultValue: { summary: '99' },
			},
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon naam',
			table: {
				defaultValue: { summary: '(geen)' },
			},
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screenreaders (fallback naar text/number; anders naar i18n default)',
		},
		decorative: {
			control: 'boolean',
			description: 'Verbergt de badge voor hulpsoftware (wanneer de tekst ernaast hetzelfde zegt)',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
};

const Template = ({ size, color, customColor, pulse, text, number, max, icon, accessibleLabel, decorative }: Record<string, any>) => {
	const parsed = number === '' || number === null || number === undefined ? undefined : Number(number);
	return html`
		<nldd-badge
			size=${size}
			color=${color}
			custom-color=${customColor || nothing}
			?pulse=${pulse}
			text=${text || nothing}
			number=${Number.isFinite(parsed) ? parsed! : nothing}
			max=${max}
			icon=${icon || nothing}
			accessible-label=${accessibleLabel || nothing}
			?decorative=${decorative}
		></nldd-badge>
	`;
};

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge size="md" number="3"></nldd-badge>
			<nldd-badge size="sm" number="3"></nldd-badge>
			<nldd-badge size="md"></nldd-badge>
			<nldd-badge size="sm"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const Kleuren = {
	render: () => html`
		<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
			${COLORS.map(c => html`<nldd-badge color=${c} number="3"></nldd-badge>`)}
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

/**
 * `color="inherit"` vult met de kleur van de content eromheen: het
 * `--context-content-color`-kanaal dat een list-item, tabelrij of menu op z'n
 * content zet, en anders `currentColor`. Zo reist een badge mee met de regel
 * waar hij in staat, ook als die oplicht.
 *
 * `custom-color` is voor een kleur die het systeem niet kan kennen: de mantel
 * van een kabel, een kleur die iemand zelf koos. Elke CSS-kleurwaarde mag, en
 * hij wint van `color`. De tekst erop wordt wit of zwart, gekozen op de
 * relatieve luminantie van de vulling.
 *
 * De drempel ligt op het punt waar wit en zwart hetzelfde contrast geven,
 * Y = (√21 − 1) / 20. Daardoor haalt de gekozen kleur altijd minstens 4,58:1,
 * ook bij een kleur die niemand vooraf kende. Kent de browser `contrast-color()`
 * al, dan doet die het rekenwerk.
 */
export const EigenKleur = {
	name: 'Inherit en custom-color',
	render: () => html`
		<div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
			<span style="color: #a90061; display: inline-flex; gap: 8px; align-items: center;">
				<nldd-badge color="inherit" number="3"></nldd-badge>
				Erft de kleur van deze zin
			</span>
			<nldd-badge custom-color="#f8fafc" number="3"></nldd-badge>
			<nldd-badge custom-color="#eab308" number="3"></nldd-badge>
			<nldd-badge custom-color="#3b82f6" number="3"></nldd-badge>
			<nldd-badge custom-color="#374151" number="3"></nldd-badge>
			<nldd-badge custom-color="oklch(0.6 0.2 20)" text="Eigen"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetPulse = {
	render: () => html`
		<div style="display: flex; gap: 32px; align-items: center;">
			<nldd-badge color="critical" pulse></nldd-badge>
			<nldd-badge color="success" pulse></nldd-badge>
			<nldd-badge color="accent" pulse number="3"></nldd-badge>
			<nldd-badge color="success" pulse text="Online"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een ring groeit uit de badge en vervaagt. Voor iets dat nu gebeurt: een live-verbinding, een storing die loopt. Zet hem niet op elke badge, want dan trekt niets meer de aandacht. De ring groeit als spread, niet als schaal, dus hij houdt overal dezelfde afstand: ook een brede badge krijgt geen halo die breder is dan hoog. Wie beweging heeft uitgezet (`prefers-reduced-motion`) ziet gewoon de badge.',
			},
		},
	},
};

export const Stip = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge color="critical"></nldd-badge>
			<nldd-badge color="accent"></nldd-badge>
			<nldd-badge color="neutral"></nldd-badge>
			<nldd-badge color="warning"></nldd-badge>
			<nldd-badge color="success"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Zonder text of number verschijnt automatisch een stip — ideaal voor "nieuw/ongelezen" indicatie.',
			},
		},
	},
};

export const MetTekst = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge color="accent" text="Nieuw"></nldd-badge>
			<nldd-badge color="success" text="Live"></nldd-badge>
			<nldd-badge color="warning" text="Bèta"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetGetal = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge number="1"></nldd-badge>
			<nldd-badge number="12"></nldd-badge>
			<nldd-badge number="150"></nldd-badge>
			<nldd-badge number="150" max="9"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met een numerieke waarde. Boven de max wordt "{max}+" getoond.',
			},
		},
	},
};

export const MetIcoon = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge color="success" icon="check-mark"></nldd-badge>
			<nldd-badge color="warning" icon="alert"></nldd-badge>
			<nldd-badge color="critical" icon="dismiss-circle"></nldd-badge>
			<nldd-badge color="accent" icon="info-circle"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icon-only badges worden als vierkant gerenderd — nuttig voor status-indicatoren (verified, waarschuwing, geblokkeerd).',
			},
		},
	},
};

export const MetIcoonEnTekst = {
	render: () => html`
		<div style="display: flex; gap: 16px; align-items: center;">
			<nldd-badge color="success" icon="check-mark" text="Geverifieerd"></nldd-badge>
			<nldd-badge color="warning" icon="alert" text="Let op"></nldd-badge>
			<nldd-badge color="accent" icon="info-circle" number="3"></nldd-badge>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Icon + text/number: icoon links, content rechts.',
			},
		},
	},
};

export const OpEenIcoon = {
	render: () => html`
		<div style="display: flex; gap: var(--primitives-space-24); align-items: center;">
			<span style="position: relative; display: inline-flex; width: var(--primitives-space-32); height: var(--primitives-space-32);">
				<nldd-icon icon="envelope"></nldd-icon>
				<nldd-badge
					number="3"
					style="position: absolute; top: calc(var(--primitives-space-4) * -1); right: calc(var(--primitives-space-8) * -1);"
				></nldd-badge>
			</span>
			<span style="position: relative; display: inline-flex; width: var(--primitives-space-32); height: var(--primitives-space-32);">
				<nldd-icon icon="envelope"></nldd-icon>
				<nldd-badge
					size="sm"
					number="3"
					style="position: absolute; top: calc(var(--primitives-space-4) * -1); right: calc(var(--primitives-space-6) * -1);"
				></nldd-badge>
			</span>
			<span style="position: relative; display: inline-flex; width: var(--primitives-space-32); height: var(--primitives-space-32);">
				<nldd-icon icon="envelope"></nldd-icon>
				<nldd-badge
					style="position: absolute; top: 0; right: 0;"
				></nldd-badge>
			</span>
			<span style="position: relative; display: inline-flex; width: var(--primitives-space-32); height: var(--primitives-space-32);">
				<nldd-icon icon="envelope"></nldd-icon>
				<nldd-badge
					size="sm"
					style="position: absolute; top: 0; right: 0;"
				></nldd-badge>
			</span>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Badge gepositioneerd in een hoek van een icon als notificatie-indicator.',
			},
		},
	},
};
