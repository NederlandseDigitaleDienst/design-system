import { html, nothing } from 'lit';
import './sidebar-section.js';
import '../../page/page.js';
import type { NLDDSidebarSection } from './sidebar-section.js';
import { pageSectionArgTypes } from '../page-section-controls.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import '../../../actions/button/button.js';
import '../../../navigation/top-title-bar/top-title-bar.js';
import '../../container/container.js';

const sidebar = html`
	<nldd-title
		size="display-5"
		text="Filters"
		heading-level="2"
	></nldd-title>
	<nldd-rich-text>
		<ul>
			<li><a href="#alles">Alles</a></li>
			<li><a href="#open">Openstaand</a></li>
			<li><a href="#behandeling">In behandeling</a></li>
			<li><a href="#afgerond">Afgerond</a></li>
		</ul>
	</nldd-rich-text>
`;

const mainBody = html`
	<h2>Aanvragen</h2>
	<p>De zijbalk staat als sticky box naast deze inhoud zolang de sectie breed
	genoeg is; scroll om te zien dat de box meeloopt en zelf scrollt als-ie te
	hoog wordt.</p>
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
	tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
	quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>
	<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
	dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
	proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
	<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
	doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
	veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
	<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
	sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
`;

// Centered rich text is for the full-width story (where the body would otherwise
// run very wide); the width-constrained stories use a plain, left-aligned one.
const main = html`<nldd-rich-text>${mainBody}</nldd-rich-text>`;
const mainCentered = html`<nldd-rich-text centered>${mainBody}</nldd-rich-text>`;

// The consumer owns the trigger: a button placed in the main content (here above
// the rich text), revealed only while the sidebar is collapsed (via the [collapsed]
// CSS below), wired to the section's show() and given aria-expanded via the
// open/close events.
const triggerStyle = html`<style>
	.sidebar-trigger { display: none; }
	nldd-sidebar-section[collapsed] .sidebar-trigger { display: inline-flex; margin-bottom: 16px; }
</style>`;

const openSheet = (e: Event) =>
	(e.currentTarget as HTMLElement).closest<NLDDSidebarSection>('nldd-sidebar-section')?.show();

const reflectExpanded = (open: boolean) => (e: Event) =>
	(e.currentTarget as HTMLElement).querySelector('.sidebar-trigger')?.setAttribute('aria-expanded', String(open));

const trigger = html`
	<nldd-button class="sidebar-trigger"
		appearance="secondary"
		text="Toon filters"
		aria-haspopup="dialog"
		aria-expanded="false"
		@click=${openSheet}
	></nldd-button>
`;

/**
 * `nldd-sidebar-section` is een paginasectie met een zijbalk links naast de
 * hoofdinhoud, zoals filters of een inhoudsopgave. Is de sectie smal, dan
 * klapt de zijbalk in achter een sheet.
 */
export default {
	title: 'Components/Layout/Page Sections/Sidebar Section',
	component: 'nldd-sidebar-section',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		componentSource: {
			file: 'src/components/layout/page-sections/sidebar-section/sidebar-section.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
	},
	args: {
		width: '',
		stickyTop: '',
		stickyBottom: '',
		sidebarLabel: '',
		noCollapse: false,
	},
	argTypes: {
		width: pageSectionArgTypes.width,
		stickyTop: {
			name: 'sticky-top',
			control: 'text',
			description: 'Afstand tot de bovenkant als de zijbalk sticky is, op lg (CSS-lengte)',
			table: { defaultValue: { summary: '16px' } },
		},
		stickyBottom: {
			name: 'sticky-bottom',
			control: 'text',
			description: 'Afstand tot de onderkant als de zijbalk sticky is, op lg (CSS-lengte)',
			table: { defaultValue: { summary: '16px' } },
		},
		sidebarLabel: {
			name: 'sidebar-label',
			control: 'text',
			description: 'Toegankelijke naam voor de zijbalk (de aside op lg en de sheet op sm/md).',
			table: { defaultValue: { summary: 'Zijbalk' } },
		},
		noCollapse: {
			name: 'no-collapse',
			control: 'boolean',
			description: 'Niet inklappen tot een sheet; is de sectie smaller dan lg, dan stapelt de zijbalk boven de main.',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-page>
			${triggerStyle}
			<nldd-sidebar-section
				width=${args.width || nothing}
				sticky-top=${args.stickyTop || nothing}
				sticky-bottom=${args.stickyBottom || nothing}
				sidebar-label=${args.sidebarLabel || nothing}
				?no-collapse=${args.noCollapse}
				@open=${reflectExpanded(true)}
				@close=${reflectExpanded(false)}
			>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${trigger}
				${main}
			</nldd-sidebar-section>
		</nldd-page>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Is de sectie smal, dan opent de knop "Toon filters" de zijbalk in een sheet.',
			},
		},
	},
};

export const VolledigeBreedte = {
	render: () => html`
		<nldd-page>
			${triggerStyle}
			<nldd-sidebar-section
				sidebar-label="Filters"
				width="full"
				@open=${reflectExpanded(true)}
				@close=${reflectExpanded(false)}
			>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${trigger}
				${mainCentered}
			</nldd-sidebar-section>
		</nldd-page>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `width="full"` vervalt de body-max-width en pakt de sectie de volledige breedte. De main en de zijbalk delen die ruimte. De main gebruikt hier `centered` rich text zodat de tekstkolom niet te breed wordt.',
			},
		},
	},
};

export const EigenSheetTitelbalk = {
	render: () => html`
		<nldd-page>
			${triggerStyle}
			<nldd-sidebar-section
				sidebar-label="Filters"
				@open=${reflectExpanded(true)}
				@close=${reflectExpanded(false)}
			>
				<nldd-top-title-bar
					slot="sheet-top-title-bar"
					text="Filters"
					dismiss-text="Klaar"
				>
					<nldd-button
						slot="toolbar"
						appearance="critical-transparent"
						text="Reset"
					></nldd-button>
				</nldd-top-title-bar>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${trigger}
				${main}
			</nldd-sidebar-section>
		</nldd-page>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De `sheet-top-title-bar`-slot vervangt de default titelbalk in de sheet (alleen zichtbaar onder lg). Hier een eigen `nldd-top-title-bar` met een andere titel, een "Klaar"-knop en een extra toolbar-actie. Verklein het venster en open de sheet om \'m te zien.',
			},
		},
	},
};

export const SmallePagina = {
	render: () => html`
		<nldd-page>
			${triggerStyle}
			<nldd-sidebar-section
				sidebar-label="Filters"
				@open=${reflectExpanded(true)}
				@close=${reflectExpanded(false)}
			>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${trigger}
				${main}
			</nldd-sidebar-section>
		</nldd-page>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			story: { width: '768px' },
			description: {
				story: 'Op een pagina smaller dan lg (hier 768px) klapt de zijbalk in tot de sheet. Hij stapelt niet boven de main en neemt geen ruimte in. Een pagina in een smal paneel klapt net zo in als een smal scherm, want de sectie volgt de breedte van de pagina, niet het venster.',
			},
		},
	},
};

export const ZonderInklappen = {
	render: () => html`
		<nldd-page>
			<nldd-sidebar-section
				no-collapse
				sidebar-label="Filters"
			>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${main}
			</nldd-sidebar-section>
		</nldd-page>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			story: { width: '768px' },
			description: {
				story: 'Met `no-collapse` klapt de sectie nooit in tot een sheet. Is de pagina smaller dan lg (hier 768px), dan stapelen de zijbalk en de main gewoon boven elkaar: de zijbalk over de volle breedte en niet sticky. Geen trigger nodig.',
			},
		},
	},
};
