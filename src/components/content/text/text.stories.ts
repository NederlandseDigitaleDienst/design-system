import { html, nothing } from 'lit';
import './text.js';

/**
 * Eén stuk lopende tekst op een maat uit de typografieschaal. Dit is wat je pakt
 * waar een app anders een kale `<p>` neerzet en de typografie erft van wat de
 * pagina toevallig instelt: een regel onder een titel, een zin in een paneel,
 * een onderschrift.
 *
 * Elke combinatie die je kunt zetten bestaat al als token, dus het component kan
 * geen eigen typografie verzinnen; het benoemt alleen wat de schaal heeft.
 *
 * Niet voor koppen, dat is `nldd-title`, en niet voor een blok proza met eigen
 * ritme, afstanden en breedtes voor media, dat is `nldd-rich-text`.
 *
 * ## Gebruik
 * ```html
 * <nldd-text>Toegewezen aan Yara Nijhuis</nldd-text>
 * <nldd-text size="sm" color="secondary">Laatst bijgewerkt op 3 maart</nldd-text>
 * ```
 */
export default {
	title: 'Components/Content/Text',
	component: 'nldd-text',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/content/text/text.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	args: {
		size: 'md',
		weight: 'regular',
		lineHeight: 'snug',
		color: 'content',
		horizontalAlignment: 'left',
		text: 'Een korte regel tekst die laat zien hoe de maat, het gewicht en de regelhoogte samen uitpakken.',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xxs', 'xs', 'sm', 'md', 'lg'],
			description: 'Tekstgrootte op de body-schaal',
			table: { defaultValue: { summary: 'md' } },
		},
		weight: {
			control: 'select',
			options: ['regular', 'medium', 'bold'],
			description: 'Fontgewicht',
			table: { defaultValue: { summary: 'regular' } },
		},
		lineHeight: {
			name: 'line-height',
			control: 'select',
			options: ['flat', 'tight', 'snug', 'loose'],
			description: 'Regelhoogte',
			table: { defaultValue: { summary: 'snug' } },
		},
		color: {
			control: 'select',
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical', 'inherit'],
			description:
				'Tekstkleur. "content" en "secondary" volgen het contentkanaal van de omgeving (een lijstrij, een menu, een tabel). "inherit" neemt de kleur die hij erft, voor tekst op een gekleurd vlak.',
			table: { defaultValue: { summary: 'content' } },
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['left', 'center', 'right'],
			description: 'Uitlijning van de tekst binnen het blok',
			table: { defaultValue: { summary: 'left' } },
		},
		text: {
			control: 'text',
			description: 'De tekst zelf (de default slot)',
		},
	},
};

const Template = ({
	size,
	weight,
	lineHeight,
	color,
	horizontalAlignment,
	text,
}: Record<string, unknown>) => html`
	<nldd-text
		size=${size || nothing}
		weight=${weight || nothing}
		line-height=${lineHeight || nothing}
		color=${color || nothing}
		horizontal-alignment=${horizontalAlignment || nothing}
	>${text}</nldd-text>
`;

export const Standaard = {
	render: Template,
};

/**
 * Vijf maten, dezelfde schaal die de tokens dragen. Boven `lg` houdt het op: dat
 * is geen lopende tekst meer maar een kop, en daar is `nldd-title` voor.
 */
export const Grootten = {
	render: () => html`
		<nldd-text size="lg">lg — een regel op de grootste bodymaat</nldd-text>
		<nldd-text size="md">md — de standaard</nldd-text>
		<nldd-text size="sm">sm — een regel iets kleiner</nldd-text>
		<nldd-text size="xs">xs — voor bijschriften</nldd-text>
		<nldd-text size="xxs">xxs — het kleinste dat de schaal kent</nldd-text>
	`,
};

/**
 * Nadruk binnen de regel komt uit de tekst zelf: `<strong>` en `<b>` krijgen het
 * bold-gewicht uit de schaal. Zet je het component zelf op `weight="bold"`, dan
 * valt die nadruk weg — bolder dan bold bestaat hier niet.
 */
export const Gewichten = {
	render: () => html`
		<nldd-text weight="regular">regular — met <strong>nadruk</strong> erin</nldd-text>
		<nldd-text weight="medium">medium — met <strong>nadruk</strong> erin</nldd-text>
		<nldd-text weight="bold">bold — met <strong>nadruk</strong> erin</nldd-text>
	`,
};

/**
 * Vier regelhoogtes. `flat` en `tight` zijn voor een regel die alleen staat,
 * `snug` en `loose` voor tekst die over meerdere regels loopt.
 */
export const Regelhoogtes = {
	render: () => html`
		<div style="display: grid; gap: 16px; max-width: 320px;">
			<nldd-text line-height="flat">flat — deze tekst loopt over meer dan één regel, zodat je ziet wat de regelhoogte doet.</nldd-text>
			<nldd-text line-height="tight">tight — deze tekst loopt over meer dan één regel, zodat je ziet wat de regelhoogte doet.</nldd-text>
			<nldd-text line-height="snug">snug — deze tekst loopt over meer dan één regel, zodat je ziet wat de regelhoogte doet.</nldd-text>
			<nldd-text line-height="loose">loose — deze tekst loopt over meer dan één regel, zodat je ziet wat de regelhoogte doet.</nldd-text>
		</div>
	`,
};

/**
 * De semantische kleuren. `content` en `secondary` volgen het contentkanaal van
 * de omgeving, dus in een lijstrij kleuren ze mee als die rij oplicht.
 */
export const Kleuren = {
	render: () => html`
		<nldd-text color="content">content</nldd-text>
		<nldd-text color="secondary">secondary</nldd-text>
		<nldd-text color="accent">accent</nldd-text>
		<nldd-text color="success">success</nldd-text>
		<nldd-text color="warning">warning</nldd-text>
		<nldd-text color="critical">critical</nldd-text>
	`,
};

/**
 * Dit lijnt de woorden uit binnen het blok. Wil je het blok zelf verschuiven,
 * dan is dat `horizontal-alignment` op `nldd-container`.
 */
export const HorizontaleUitlijning = {
	render: () => html`
		<div style="display: grid; gap: 8px; max-width: 320px;">
			<nldd-text horizontal-alignment="left">left</nldd-text>
			<nldd-text horizontal-alignment="center">center</nldd-text>
			<nldd-text horizontal-alignment="right">right</nldd-text>
		</div>
	`,
};
