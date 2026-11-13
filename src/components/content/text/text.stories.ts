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
 * <nldd-text size="sm" color="secondary">Vorige week bijgewerkt</nldd-text>
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
		smCustomSize: '',
		mdCustomSize: '',
		lgCustomSize: '',
		weight: 'regular',
		lineHeight: 'snug',
		color: 'content',
		horizontalAlignment: 'left',
		text: 'Een korte regel tekst die laat zien hoe de maat, het gewicht en de regelhoogte samen uitpakken.',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xxs', 'xs', 'sm', 'md', 'lg', 'display-6', 'display-5', 'display-4', 'display-3', 'display-2', 'display-1'],
			description: 'Tekstgrootte: de body-schaal, of een display-maat voor grote letters die geen kop zijn',
			table: { defaultValue: { summary: 'md' } },
		},
		smCustomSize: {
			name: 'sm-custom-size',
			control: 'text',
			description: 'Eigen grootte bij sm, elke CSS-lengte, voor een statement groter dan `display-1`. Een breedte zonder waarde houdt `size`; nooit kleiner dan `display-1`.',
		},
		mdCustomSize: {
			name: 'md-custom-size',
			control: 'text',
			description: 'Eigen grootte bij md',
		},
		lgCustomSize: {
			name: 'lg-custom-size',
			control: 'text',
			description: 'Eigen grootte bij lg',
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
			options: ['content', 'secondary', 'accent', 'success', 'warning', 'critical'],
			description:
				'Tekstkleur. Elke kleur volgt het vlak eromheen (een lijstrij, een menu, een hero) via de context die dat vlak doorgeeft.',
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
	smCustomSize,
	mdCustomSize,
	lgCustomSize,
	weight,
	lineHeight,
	color,
	horizontalAlignment,
	text,
}: Record<string, unknown>) => html`
	<nldd-text
		size=${size || nothing}
		sm-custom-size=${smCustomSize || nothing}
		md-custom-size=${mdCustomSize || nothing}
		lg-custom-size=${lgCustomSize || nothing}
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
 * Vijf maten voor lopende tekst, dezelfde schaal die de tokens dragen. Daarboven
 * is het geen lopende tekst meer: een kop is `nldd-title`, grote letters die geen
 * kop zijn krijgen een display-maat.
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
 * Voor grote letters die geen kop zijn, zoals een getal of een statement op een
 * landingspagina. De maten en de typografie zijn die van `nldd-title`, en ze
 * volgen de breedte zoals een titel dat doet. `weight` en `line-height` horen bij
 * de body-maten en doen hier niets.
 */
export const DisplayMaten = {
	name: 'Display-maten',
	render: () => html`
	<nldd-text size="display-6">display-6</nldd-text>
	<nldd-text size="display-5">display-5</nldd-text>
	<nldd-text size="display-4">display-4</nldd-text>
	<nldd-text size="display-3">display-3</nldd-text>
	<nldd-text size="display-2">display-2</nldd-text>
	<nldd-text size="display-1">display-1</nldd-text>
`,
	parameters: { controls: { disable: true } },
};

/**
 * Voor een statement dat groter moet dan `display-1` geef je per breedte een
 * eigen grootte, met `sm-`, `md-` en `lg-custom-size`. Een breedte zonder waarde
 * houdt de maat uit `size`, dus tekst die op een breed scherm groot is, breekt
 * nooit op een smal scherm. De tekst neemt het gewicht, het lettertype en de
 * regelhoogte van `display-1` over en wordt nooit kleiner.
 */
export const EigenGrootte = {
	name: 'Eigen grootte',
	render: () => html`
	<nldd-text size="display-1" sm-custom-size="64px" md-custom-size="96px" lg-custom-size="128px">245</nldd-text>
	<nldd-text size="lg" color="secondary">regels voor toegankelijkheid en gebruiksgemak</nldd-text>
`,
	parameters: { controls: { disable: true } },
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

/**
 * Inline elementen zien eruit zoals in `nldd-rich-text`: vet, schuin, een link,
 * `code` op een getint vlak, een gemarkeerd woord, een citaat en mentions, met
 * en zonder link. Dat geldt voor elementen direct in de tekst.
 */
export const InlineElementen = {
	render: () => html`
		<nldd-text>
			Aanvraag A-1042 is <strong>in behandeling</strong> en wacht op een <em>controle</em>.
			Zet <code>no-picker</code> om de knop weg te laten, lees meer over
			<a href="#dakisolatie">de voorwaarden voor dakisolatie</a>, of let op de
			<mark>gemarkeerde datum</mark>.
			<a href="#anouk" data-mention>Anouk de Vries</a> vroeg om <q>een nieuwe offerte</q>, en
			<span data-mention>Bram Jansen</span> kijkt mee.
		</nldd-text>
	`,
};
