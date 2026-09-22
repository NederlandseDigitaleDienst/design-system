import { html, nothing } from 'lit';
import './spacer.js';
import '../../actions/button/button.js';

/**
 * Gebruik een spacer om ruimte tussen elementen te creëren.
 * Componenten in dit designsysteem hebben geen eigen margins — alle witruimte
 * wordt expliciet bepaald met een spacer. Dat maakt de ruimte zichtbaar en
 * aanpasbaar zonder de componenten zelf te wijzigen.
 *
 * Gebruik een spacer **tussen verschillende types componenten**: tussen een knop
 * en een tekstveld, tussen een titel en een lijst, of tussen secties onderling.
 * Zo houd je componenten herbruikbaar en onafhankelijk van hun context.
 *
 * Kies een **vaste grootte** voor ruimte die altijd gelijk blijft, override per
 * breakpoint met `sm-size` / `md-size` / `lg-size` als de ruimte met de viewport
 * mee moet bewegen, of gebruik **flexible** om een element naar het andere
 * uiteinde van een rij te duwen.
 *
 * ## Gebruik
 * ```html
 * <!-- Vaste spacing op alle breakpoints -->
 * <nldd-spacer size="32"></nldd-spacer>
 *
 * <!-- Per breakpoint anders: 16 op sm, 24 op md+ -->
 * <nldd-spacer sm-size="16" md-size="24" lg-size="24"></nldd-spacer>
 *
 * <!-- Base + één override: 16 default, 32 op lg -->
 * <nldd-spacer size="16" lg-size="32"></nldd-spacer>
 *
 * <!-- Vult beschikbare ruimte op -->
 * <nldd-spacer size="flexible"></nldd-spacer>
 * ```
 */

const SIZE_OPTIONS = [
	'flexible',
	'2',
	'4',
	'6',
	'8',
	'10',
	'12',
	'16',
	'20',
	'24',
	'28',
	'32',
	'40',
	'44',
	'48',
	'56',
	'64',
	'80',
	'96',
];

export default {
	title: 'Components/Layout/Spacer',
	component: 'nldd-spacer',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/spacer/spacer.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: { type: 'select' },
			options: SIZE_OPTIONS,
			description: 'Base spacer size, applied at every breakpoint without an override.',
			table: {
				defaultValue: { summary: '16' },
			},
		},
		smSize: {
			name: 'sm-size',
			control: { type: 'select' },
			options: ['(geen)', ...SIZE_OPTIONS],
			mapping: { '(geen)': '' },
			description: 'Override size at sm breakpoint (max-width: 640px).',
			table: { defaultValue: { summary: '(geen)' } },
		},
		mdSize: {
			name: 'md-size',
			control: { type: 'select' },
			options: ['(geen)', ...SIZE_OPTIONS],
			mapping: { '(geen)': '' },
			description: 'Override size at md breakpoint (641px–1007px).',
			table: { defaultValue: { summary: '(geen)' } },
		},
		lgSize: {
			name: 'lg-size',
			control: { type: 'select' },
			options: ['(geen)', ...SIZE_OPTIONS],
			mapping: { '(geen)': '' },
			description: 'Override size at lg breakpoint (min-width: 1008px).',
			table: { defaultValue: { summary: '(geen)' } },
		},
		direction: {
			control: 'select',
			options: ['horizontal', 'vertical', 'both'],
			description: 'Direction of spacing',
			table: {
				defaultValue: { summary: 'both' },
			},
		},
	},
	args: {
		size: '16',
		smSize: '',
		mdSize: '',
		lgSize: '',
		direction: 'both',
	},
};

export const Standaard = ({ size, smSize, mdSize, lgSize, direction }: Record<string, any>) => html`
	<div style="display: flex; flex-direction: column; align-items: flex-start;">
		<nldd-button text="Knop"></nldd-button>
		<nldd-spacer
			size=${size}
			sm-size=${smSize || nothing}
			md-size=${mdSize || nothing}
			lg-size=${lgSize || nothing}
			direction=${direction}
		></nldd-spacer>
		<nldd-button text="Knop"></nldd-button>
	</div>
`;

export const Flexibel = {
	render: () => html`
	<div style="display: flex; align-items: center;">
		<nldd-button text="Links"></nldd-button>
		<nldd-spacer size="flexible"></nldd-spacer>
		<nldd-button text="Rechts"></nldd-button>
	</div>
`,
	parameters: { controls: { disable: true } },
};

export const PerBreakpoint = {
	render: () => html`
		<div style="display: flex; flex-direction: column; align-items: flex-start;">
			<p style="font-size: 14px; color: var(--semantics-content-color); margin: 0 0 8px 0;">
				<code>sm-size="16" md-size="24" lg-size="32"</code>
			</p>
			<p style="font-size: 12px; color: var(--semantics-content-secondary-color); margin: 0 0 16px 0;">
				Verklein het browservenster om de spacer mee te zien veranderen.
			</p>
			<div style="display: flex; flex-direction: column; align-items: flex-start; border: 1px dashed var(--primitives-color-neutral-150); padding: 8px;">
				<nldd-button text="Knop"></nldd-button>
				<nldd-spacer sm-size="16" md-size="24" lg-size="32"></nldd-spacer>
				<nldd-button text="Knop"></nldd-button>
			</div>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: `
Geef per breakpoint een eigen size op. Wat niet expliciet voor een breakpoint is gezet, valt terug op de \`size\` waarde. Zo kun je bijvoorbeeld \`<nldd-spacer size="16" lg-size="32">\` schrijven om alleen op grote viewports een grotere spacer te krijgen.
				`.trim(),
			},
		},
	},
};

export const VasteGroottes = {
	render: () => html`
	<div style="display: flex; flex-direction: column;">
		${['2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'].map(
			(size) => html`
				<div style="display: flex; align-items: center;">
					<nldd-button text="${size}"></nldd-button>
					<nldd-spacer size=${size} direction="horizontal"></nldd-spacer>
					<nldd-button text="${size}"></nldd-button>
				</div>
			`,
		)}
	</div>
`,
	parameters: { controls: { disable: true } },
};
