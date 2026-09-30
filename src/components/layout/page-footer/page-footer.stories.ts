import { html, nothing } from 'lit';
import './page-footer.js';
import '../../navigation/breadcrumbs/breadcrumbs.js';
import '../container/container.js';
import '../../content/rich-text/rich-text.js';

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
