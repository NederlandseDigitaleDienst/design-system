import { html, nothing } from 'lit';
import './page-footer.js';
import '../../navigation/breadcrumbs/breadcrumbs.js';
import '../container/container.js';
import '../../content/text/text.js';
import '../spacer/spacer.js';
import '../../content/title/title.js';
import '../../navigation/link/link.js';
import '../../navigation/link-group/link-group.js';

export default {
	title: 'Components/Layout/Page Footer',
	component: 'nldd-page-footer',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-footer/page-footer.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		noRibbon: false,
		width: '',
	},
	argTypes: {
		noRibbon: { name: 'no-ribbon', control: 'boolean', description: 'Laat het lint en zijn ruimte weg, voor een site buiten de Rijksoverheid', table: { defaultValue: { summary: false } } },
		width: {
			control: 'text',
			description: "Body max-width (net als een page-section): 'full' verwijdert de constraint, of een CSS-lengte (bijv. '480px').",
		},
	},
};

export const Standaard = {
	render: (args: Record<string, string | boolean>) => html`
		<nldd-page-footer ?no-ribbon=${args.noRibbon} width=${args.width || nothing}>
			<nldd-breadcrumbs slot="breadcrumbs">
				<nldd-breadcrumbs-item
					text="Home"
					href="/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Aanvragen"
					href="/aanvragen/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Aanvraag A-1042"
					current
				></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>

			<nldd-container>
				<nldd-title
					text="Over deze website"
					heading-level="2"
				></nldd-title>
				<nldd-spacer size="12"></nldd-spacer>
				<nldd-text>
					Op Mijn Dienst vraag je subsidie aan voor isolatie en een warmtepomp, en volg je wat er met je aanvraag gebeurt.
				</nldd-text>
				<nldd-spacer size="16"></nldd-spacer>
				<nldd-link-group accessible-label="Over deze website">
					<nldd-link
						href="/contact/"
						text="Contact opnemen"
					></nldd-link>
					<nldd-link
						href="/over/"
						text="Over Mijn Dienst"
					></nldd-link>
				</nldd-link-group>
			</nldd-container>

			<nldd-page-footer-legal-bar slot="legal-bar">
				<nldd-page-footer-legal-bar-item
					slot="start"
					text="Mijn Dienst"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Privacy"
					href="/privacy/"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Cookies"
					href="/cookies/"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Toegankelijkheid"
					href="/toegankelijkheid/"
				></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		</nldd-page-footer>
	`,
};

/**
 * Kolommen met links in de rij voor eigen inhoud, voor wat op de hele site
 * geldt. Een `nldd-container` met `layout="grid"` zet ze naast elkaar:
 * `lg-column-count="4"`, en op sm en md twee per rij. De kolomtelling volgt
 * de breedte van de footer zelf, niet het venster. Geef de container geen
 * `padding`: de footer zet zelf de ruimte rond elke rij. Elke kolom is een
 * `nldd-container` met een `nldd-title` met een `heading-level`, een
 * `nldd-spacer` van 8 en de links in een `nldd-link-group` met
 * `orientation="vertical"`, die de kop als `accessible-label` krijgt.
 */
export const MetKolommen = {
	name: 'Met kolommen',
	render: () => html`
		<nldd-page-footer>
			<nldd-container
				layout="grid"
				sm-column-count="2"
				md-column-count="2"
				lg-column-count="4"
				gap="24"
			>
			<nldd-container>
				<nldd-title
					size="display-5"
					text="Aanvragen"
					heading-level="2"
				></nldd-title>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-link-group
					orientation="vertical"
					accessible-label="Aanvragen"
				>
					<nldd-link
						href="#"
						text="Een aanvraag indienen"
					></nldd-link>
					<nldd-link
						href="#"
						text="De behandeling volgen"
					></nldd-link>
					<nldd-link
						href="#"
						text="Bezwaar maken"
					></nldd-link>
				</nldd-link-group>
			</nldd-container>
			<nldd-container>
				<nldd-title
					size="display-5"
					text="Onderwerpen"
					heading-level="2"
				></nldd-title>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-link-group
					orientation="vertical"
					accessible-label="Onderwerpen"
				>
					<nldd-link
						href="#"
						text="Isoleren"
					></nldd-link>
					<nldd-link
						href="#"
						text="Warmtepomp"
					></nldd-link>
					<nldd-link
						href="#"
						text="Energie besparen"
					></nldd-link>
				</nldd-link-group>
			</nldd-container>
			<nldd-container>
				<nldd-title
					size="display-5"
					text="Over Mijn Dienst"
					heading-level="2"
				></nldd-title>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-link-group
					orientation="vertical"
					accessible-label="Over Mijn Dienst"
				>
					<nldd-link
						href="#"
						text="Hoe het werkt"
					></nldd-link>
					<nldd-link
						href="#"
						text="Publicaties"
					></nldd-link>
				</nldd-link-group>
			</nldd-container>
			<nldd-container>
				<nldd-title
					size="display-5"
					text="Meedoen"
					heading-level="2"
				></nldd-title>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-link-group
					orientation="vertical"
					accessible-label="Meedoen"
				>
					<nldd-link
						href="#"
						text="Werken bij"
					></nldd-link>
					<nldd-link
						href="#"
						text="Stage lopen"
					></nldd-link>
				</nldd-link-group>
			</nldd-container>
			</nldd-container>
			<nldd-page-footer-legal-bar slot="legal-bar">
				<nldd-page-footer-legal-bar-item
					slot="start"
					text="Mijn Dienst"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Privacy"
					href="/privacy/"
				></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		</nldd-page-footer>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Alleen een legal-bar — handig voor pagina's zonder breadcrumbs of
 * uitgebreide footer-inhoud.
 */
export const AlleenLegalBar = {
	render: () => html`
		<nldd-page-footer>
			<nldd-page-footer-legal-bar slot="legal-bar">
				<nldd-page-footer-legal-bar-item
					slot="start"
					text="Mijn Dienst"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Privacy"
					href="/privacy/"
				></nldd-page-footer-legal-bar-item>
				<nldd-page-footer-legal-bar-item
					slot="end"
					text="Toegankelijkheid"
					href="/toegankelijkheid/"
				></nldd-page-footer-legal-bar-item>
			</nldd-page-footer-legal-bar>
		</nldd-page-footer>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Lege footer — geen breadcrumbs, main of legal-bar. De grijze band valt weg en
 * alleen het Rijksoverheid-lintje blijft over.
 */
export const Leeg = {
	render: () => html`
		<nldd-page-footer></nldd-page-footer>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Breadcrumbs en main zonder legal-bar — bijvoorbeeld in een
 * applicatie-context waar wettelijke links elders staan.
 */
export const ZonderLegalBar = {
	render: () => html`
		<nldd-page-footer>
			<nldd-breadcrumbs slot="breadcrumbs">
				<nldd-breadcrumbs-item
					text="Home"
					href="/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Aanvragen"
					current
				></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
			<nldd-container>
				<nldd-text>
					Heb je een vraag over je aanvraag? Noem dan altijd het nummer van de aanvraag.
				</nldd-text>
			</nldd-container>
		</nldd-page-footer>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Op een smalle container zakken de body-max-width-constraints terug en
 * past de padding zich aan via container queries — niet via viewport-queries.
 */
export const Smal = {
	render: () => html`
		<div style="max-width: 360px; border: 1px dashed var(--semantics-dividers-color);">
			<nldd-page-footer>
				<nldd-breadcrumbs slot="breadcrumbs">
					<nldd-breadcrumbs-item
						text="Home"
						href="/"
					></nldd-breadcrumbs-item>
					<nldd-breadcrumbs-item
						text="Aanvragen"
						href="/aanvragen/"
					></nldd-breadcrumbs-item>
					<nldd-breadcrumbs-item
						text="Aanvraag A-1042"
						current
					></nldd-breadcrumbs-item>
				</nldd-breadcrumbs>
				<nldd-container>
					<nldd-title
						text="Over deze website"
						heading-level="2"
					></nldd-title>
					<nldd-spacer size="12"></nldd-spacer>
					<nldd-text>
						Op Mijn Dienst vraag je subsidie aan en volg je je aanvraag.
					</nldd-text>
				</nldd-container>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item
						slot="start"
						text="Mijn Dienst"
					></nldd-page-footer-legal-bar-item>
					<nldd-page-footer-legal-bar-item
						slot="end"
						text="Privacy"
						href="/privacy/"
					></nldd-page-footer-legal-bar-item>
					<nldd-page-footer-legal-bar-item
						slot="end"
						text="Toegankelijkheid"
						href="/toegankelijkheid/"
					></nldd-page-footer-legal-bar-item>
				</nldd-page-footer-legal-bar>
			</nldd-page-footer>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
