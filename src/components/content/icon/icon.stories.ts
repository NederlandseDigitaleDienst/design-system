import { html, nothing } from 'lit';
import { ICONS } from './icon.js';
import '../../layout/container/container.js';
import '../../layout/spacer/spacer.js';
import '../tag/tag.js';
import '../text/text.js';

const allIconNames = ICONS;

const FIXED_SIZES = ['16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'];
const SIZE_OPTIONS = ['full', 'inherit', ...FIXED_SIZES];

const FUNCTIONAL_COLORS = ['content', 'secondary', 'accent', 'critical', 'warning', 'success'] as const;
const RIJKSKLEUREN = [
	'lintblauw', 'donkerblauw', 'hemelblauw', 'lichtblauw',
	'paars', 'violet', 'robijnrood', 'roze',
	'rood', 'oranje', 'donkergeel', 'geel',
	'donkerbruin', 'bruin', 'donkergroen', 'groen', 'mosgroen', 'mintgroen',
] as const;

const COLOR_OPTIONS = [...FUNCTIONAL_COLORS, ...RIJKSKLEUREN];

export default {
	title: 'Components/Content/Icon',
	component: 'nldd-icon',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/icon/icon.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
		docs: {
			description: {
				component: 'A flexible icon component. By default it fills its parent and takes the content color of its context. Set `size` for a fixed spacer-aligned dimension; set `color` for a functional semantic or a rijkskleur. For a color the design system cannot know, set `custom-color` to any CSS color value. Every icon name and alias is listed under [Docs/Iconen](?path=/docs/docs-iconen--docs).',
			},
		},
	},
	argTypes: {
		icon: {
			control: 'select',
			options: allIconNames,
			description: 'Naam van het icoon (inclusief aliassen).',
			table: { defaultValue: { summary: 'circle-dashed' } },
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: '`full` vult de container, `inherit` schaalt mee met de omringende tekst (1em), of een vaste spacer-uitgelijnde maat in px.',
			table: { defaultValue: { summary: 'full' } },
		},
		color: {
			control: 'select',
			options: COLOR_OPTIONS,
			description: 'Functionele kleur of rijkskleur. `content` neemt de contentkleur van de context, de andere functionele kleuren ook de bijbehorende kleur van het vlak.',
			table: { defaultValue: { summary: 'content' } },
		},
		tile: {
			control: 'boolean',
			description: 'Teken het icoon op een tegel, een gevuld vlak. `color` en `custom-color` kleuren dan het vlak en het glyph krijgt de contrasterende kleur; `size` meet het vlak.',
			table: { defaultValue: { summary: false } },
		},
		customColor: {
			name: 'custom-color',
			control: 'color',
			description: 'Een eigen kleur, als CSS-kleurwaarde. Voor een kleur die het designsysteem niet kan kennen. Wint van `color`.',
		},
	},
	args: {
		icon: 'heart',
		size: '24',
		color: 'content',
		tile: false,
		customColor: '',
	},
};

const Template = ({ icon, size, tile, color, customColor }: Record<string, any>) => html`
	<nldd-icon
		icon=${icon}
		size=${size || nothing}
		?tile=${tile}
		color=${color === 'content' ? nothing : color}
		custom-color=${customColor || nothing}
	></nldd-icon>
`;

export const Standaard = {
	render: Template,
};

export const VolgtDeContext = {
	render: () => html`
		<div style="width: 64px; height: 64px; --context-content-color: #d52b1e;">
			<nldd-icon icon="heart"></nldd-icon>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Zonder `size` of `color` vult het icoon de parent en neemt het de contentkleur van zijn context. Een vlak van jezelf dat `color` zet, zet `--context-content-color` ernaast; hier zet een 64×64 container alleen `--context-content-color: #d52b1e`.',
			},
		},
	},
};

/**
 * `size="inherit"` zet het icoon op `1em`, dus het schaalt mee met de tekst
 * eromheen in plaats van met de container. Gebruik het voor een icoon dat in
 * een regel lopende tekst staat: bij een vaste maat in px loopt het uit de pas
 * zodra de tekst groter of kleiner wordt, en dat zie je pas bij de eerste
 * lezer die inzoomt.
 *
 * Het icoon krijgt er een `vertical-align: -0.15em` bij. Zonder die correctie
 * komt de onderrand van het vierkant op de basislijn te staan, terwijl de tekst
 * zelf deels onder die lijn doorloopt, en dan rijdt het icoon zichtbaar omhoog.
 *
 * Hoe zwaar een icoon in de regel oogt hangt af van de tekening, niet van de
 * maat. Het vak is altijd `1em`, maar een vinkje vult daarvan maar de helft in
 * de hoogte en driekwart in de breedte, terwijl een slot of een klok het vak
 * bijna volmaakt. Vandaar dat hieronder verschillende vormen naast elkaar
 * staan: één icoon zegt weinig over hoe de rest zich houdt.
 */
export const MeeMetDeTekst = {
	name: 'Mee met de tekst (size="inherit")',
	render: ({ tile }: Record<string, any>) => {
		const line = (size: string) => html`
			<nldd-text
				size=${size}
				line-height="tight"
			>
				Aanvraag A-1043 is <nldd-icon icon="check-mark" size="inherit" ?tile=${tile} color="success"></nldd-icon> goedgekeurd,
				staat <nldd-icon icon="lock-closed" size="inherit" ?tile=${tile}></nldd-icon> vast sinds
				<nldd-icon icon="calendar-event" size="inherit" ?tile=${tile}></nldd-icon> vorige week, en loopt af over
				<nldd-icon icon="clock" size="inherit" ?tile=${tile}></nldd-icon> 3 dagen.
				<nldd-icon icon="info-circle" size="inherit" ?tile=${tile} color="accent"></nldd-icon> Verlengen kan tot die tijd.
			</nldd-text>
		`;
		return html`
			<nldd-container
				gap="20"
				max-width="560px"
			>
				${line('lg')}
				${line('md')}
				${line('sm')}
			</nldd-container>
		`;
	},
	args: { tile: false },
	parameters: { controls: { include: ['tile'] } },
};

export const Grootten = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="24"
			vertical-alignment="bottom"
		>
			${[...FIXED_SIZES].reverse().map(size => html`
				<div style="text-align: center;">
					<nldd-icon
						icon="heart"
						size=${size}
					></nldd-icon>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-text
						size="sm"
						line-height="tight"
						horizontal-alignment="center"
					>
						${size}px
					</nldd-text>
				</div>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const FunctioneleKleuren = {
	render: () => html`
		<nldd-container
			layout="wrap"
			gap="24"
		>
			${FUNCTIONAL_COLORS.map(color => html`
				<div style="text-align: center;">
					<nldd-icon
						icon="heart"
						size="40"
						color=${color}
					></nldd-icon>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-text
						size="sm"
						line-height="tight"
						horizontal-alignment="center"
					>
						${color}
					</nldd-text>
				</div>
			`)}
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};

export const Rijkskleuren = {
	render: () => html`
		<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 16px;">
			${RIJKSKLEUREN.map(color => html`
				<div style="text-align: center;">
					<nldd-icon
						icon="heart"
						size="40"
						color=${color}
					></nldd-icon>
					<nldd-spacer size="8"></nldd-spacer>
					<nldd-text
						size="sm"
						line-height="tight"
						horizontal-alignment="center"
					>
						${color}
					</nldd-text>
				</div>
			`)}
		</div>
	`,
	parameters: { controls: { disable: true } },
};

export const EigenKleur = {
	name: 'Eigen kleur (custom-color)',
	render: () => html`
		<nldd-container
			layout="row"
			gap="24"
		>
			${['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'].map(color => html`
				<nldd-icon
					icon="circle-filled"
					size="40"
					custom-color=${color}
				></nldd-icon>
			`)}
		</nldd-container>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Voor een kleur die het designsysteem niet kan kennen: de mantel van een kabel, een kleur die iemand zelf koos. `custom-color` neemt elke CSS-kleurwaarde en wint van `color`.',
			},
		},
	},
};

export const OpEenTegel = {
	render: () => html`
		<nldd-container
			layout="row"
			gap="16"
		>
			<nldd-icon
				icon="terminal"
				size="40"
				tile
				color="accent"
			></nldd-icon>
			<nldd-icon
				icon="shield-check-mark"
				size="40"
				tile
				color="success"
			></nldd-icon>
			<nldd-icon
				icon="cloud"
				size="40"
				tile
				color="critical"
			></nldd-icon>
			<nldd-icon
				icon="puzzle-piece"
				size="40"
				tile
				custom-color="#a90061"
			></nldd-icon>
			<nldd-icon
				icon="tulip"
				size="40"
				tile
				custom-color="#f5c400"
			></nldd-icon>
		</nldd-container>
		<nldd-spacer size="24"></nldd-spacer>
		<div style="width: 120px; height: 200px; outline: 1px dashed #bbb;">
			<nldd-icon
				icon="heart"
				tile
				color="accent"
			></nldd-icon>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `tile` staat het icoon op een tegel, een gevuld vlak. De kleurvraag draait daarmee om: `color` en `custom-color` kleuren het vlak, en het glyph krijgt de kleur die daarop leesbaar is, wit of zwart, gekozen op luminantie. Dat paar is precies wat je zelf niet wilt kiezen. `size` meet dan het vlak: het glyph is vier vijfde daarvan, de hoekradius een vijfde. De laatste twee tonen dat de flip ook werkt bij een kleur die het designsysteem niet kent. Onderaan een vlak zonder `size` in een container van 120×200: het volgt de breedte en blijft vierkant in plaats van uit te rekken naar de hoogte van de container. Net als een icoon zonder `tile`, dat z\'n vorm ontleent aan de tekening erin.',
			},
		},
	},
};
