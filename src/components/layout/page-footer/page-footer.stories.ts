import { html, nothing } from 'lit';
import './page-footer.js';
import '../../navigation/breadcrumbs/breadcrumbs.js';
import '../container/container.js';
import '../../content/rich-text/rich-text.js';
import '../../content/title/title.js';
import '../../navigation/link/link.js';

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
		width: '',
	},
	argTypes: {
		width: {
			control: 'text',
			description: "Body max-width (net als een page-section): 'full' verwijdert de constraint, of een CSS-lengte (bijv. '480px').",
		},
	},
};

export const Standaard = {
	render: (args: Record<string, string>) => html`
		<nldd-page-footer width=${args.width || nothing}>
			<nldd-breadcrumbs slot="breadcrumbs">
				<nldd-breadcrumbs-item
					text="Home"
					href="/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Documentatie"
					href="/docs/"
				></nldd-breadcrumbs-item>
				<nldd-breadcrumbs-item
					text="Architectuur"
					current
				></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>

			<nldd-container>
				<nldd-rich-text>
					<h2>Over deze site</h2>
					<p>Een verkenning van het Ministerie van Binnenlandse Zaken en Koninkrijksrelaties naar machine-leesbare wetuitvoering.</p>
					<p><a href="/contact/">Contact opnemen</a> · <a href="/over/">Over de verkenning</a></p>
				</nldd-rich-text>
			</nldd-container>

			<nldd-page-footer-legal-bar slot="legal-bar">
				<nldd-page-footer-legal-bar-item
					slot="start"
					text="© 2026 Ministerie van Binnenlandse Zaken en Koninkrijksrelaties"
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
 * `nldd-container` met `gap="8"`, een `nldd-title` met een `heading-level` en
 * de links als `nldd-link` met `size="md"`.
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
				gap="16"
			>
			<nldd-container gap="8">
				<nldd-title
					size="5"
					text="Aanvragen"
					heading-level="2"
				></nldd-title>
				<nldd-link
					size="md"
					href="#"
					text="Een aanvraag indienen"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="De behandeling volgen"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="Bezwaar maken"
				></nldd-link>
			</nldd-container>
			<nldd-container gap="8">
				<nldd-title
					size="5"
					text="Onderwerpen"
					heading-level="2"
				></nldd-title>
				<nldd-link
					size="md"
					href="#"
					text="Isoleren"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="Warmtepomp"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="Energie besparen"
				></nldd-link>
			</nldd-container>
			<nldd-container gap="8">
				<nldd-title
					size="5"
					text="Over Mijn Dienst"
					heading-level="2"
				></nldd-title>
				<nldd-link
					size="md"
					href="#"
					text="Hoe het werkt"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="Publicaties"
				></nldd-link>
			</nldd-container>
			<nldd-container gap="8">
				<nldd-title
					size="5"
					text="Meedoen"
					heading-level="2"
				></nldd-title>
				<nldd-link
					size="md"
					href="#"
					text="Werken bij"
				></nldd-link>
				<nldd-link
					size="md"
					href="#"
					text="Stage lopen"
				></nldd-link>
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
					text="© 2026 Rijksoverheid"
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
					text="Documenten"
					current
				></nldd-breadcrumbs-item>
			</nldd-breadcrumbs>
			<nldd-container>
				<nldd-rich-text>
					<p>Een paginafooter met enkel breadcrumbs en wat content.</p>
				</nldd-rich-text>
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
						text="Documentatie"
						href="/docs/"
					></nldd-breadcrumbs-item>
					<nldd-breadcrumbs-item
						text="Architectuur"
						current
					></nldd-breadcrumbs-item>
				</nldd-breadcrumbs>
				<nldd-container>
					<nldd-rich-text>
						<h2>Over deze site</h2>
						<p>Een verkenning naar machine-leesbare wetuitvoering.</p>
					</nldd-rich-text>
				</nldd-container>
				<nldd-page-footer-legal-bar slot="legal-bar">
					<nldd-page-footer-legal-bar-item
						slot="start"
						text="© 2026 Rijksoverheid"
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
