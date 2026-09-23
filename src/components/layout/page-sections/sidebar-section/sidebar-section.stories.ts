import { html, nothing } from 'lit';
import './sidebar-section.js';
import type { NLDDSidebarSection } from './sidebar-section.js';
import { pageSectionArgTypes } from '../page-section-controls.js';
import '../../../content/title/title.js';
import '../../../content/rich-text/rich-text.js';
import '../../../actions/button/button.js';
import '../../../navigation/top-title-bar/top-title-bar.js';
import '../../container/container.js';

const sidebar = html`
	<nldd-title size="sm" text="Filters"></nldd-title>
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
		variant="secondary"
		text="Toon filters"
		aria-haspopup="dialog"
		aria-expanded="false"
		@click=${openSheet}
	></nldd-button>
`;

export default {
	title: 'Components/Layout/Page Sections/Sidebar Section',
	component: 'nldd-sidebar-section',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/layout/page-sections/sidebar-section/sidebar-section.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'experimental' },
	},
	args: {
		width: '',
		sidebarLabel: '',
		noCollapse: false,
		stickyTop: '',
		stickyBottom: '',
	},
	argTypes: {
		width: pageSectionArgTypes.width,
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
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		${triggerStyle}
		<nldd-sidebar-section
			width=${args.width || nothing}
			sidebar-label=${args.sidebarLabel || nothing}
			?no-collapse=${args.noCollapse}
			sticky-top=${args.stickyTop || nothing}
			sticky-bottom=${args.stickyBottom || nothing}
			@open=${reflectExpanded(true)}
			@close=${reflectExpanded(false)}
		>
			<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
			${trigger}
			${main}
		</nldd-sidebar-section>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Linker zijbalk naast de hoofdinhoud. Is de **sectie** ≥ 1008px breed, dan is de zijbalk een sticky, scrollbare tinted box (max 320px); is-ie smaller, dan verdwijnt-ie in een sheet (een linkerpaneel op md+, een bottom-sheet op mobiel) met automatisch een sticky titelbalk (de `sidebar-label` als titel + een Sluit-knop). De switch volgt de breedte van de sectie zelf, niet de viewport (zie de SmalleContainer-story). De **trigger is van de consument**: hier een `nldd-button` boven de inhoud, alleen getoond als `[collapsed]` (CSS), gekoppeld aan `show()` en met `aria-expanded` via de open/close-events. Verklein het venster om de switch te zien.',
			},
		},
	},
};

export const VolledigeBreedte = {
	render: () => html`
		${triggerStyle}
		<nldd-sidebar-section
			width="full"
			@open=${reflectExpanded(true)}
			@close=${reflectExpanded(false)}
		>
			<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
			${trigger}
			${mainCentered}
		</nldd-sidebar-section>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `width="full"` vervalt de body-max-width en pakt de sectie de volledige breedte — main + zijbalk delen die ruimte. De main gebruikt hier `centered` rich text zodat de tekstkolom niet te breed wordt.',
			},
		},
	},
};

export const EigenSheetTitelbalk = {
	render: () => html`
		${triggerStyle}
		<nldd-sidebar-section
			@open=${reflectExpanded(true)}
			@close=${reflectExpanded(false)}
		>
			<nldd-top-title-bar slot="sheet-top-title-bar"
				text="Filters"
				dismiss-text="Klaar"
			>
				<nldd-button slot="toolbar" variant="critical-transparent" text="Reset"></nldd-button>
			</nldd-top-title-bar>
			<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
			${trigger}
			${main}
		</nldd-sidebar-section>
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

export const SmalleContainer = {
	render: () => html`
		${triggerStyle}
		<div style="max-width: 600px; margin-inline: auto; padding: 16px; outline: 1px dashed var(--semantics-surfaces-tinted-border-color);">
			<nldd-sidebar-section
				@open=${reflectExpanded(true)}
				@close=${reflectExpanded(false)}
			>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${trigger}
				${main}
			</nldd-sidebar-section>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De sectie zit in een wrapper van max. 600px. Ook op een breed scherm is de **sectie** smaller dan lg, dus klapt-ie in tot de sheet — de zijbalk stapelt niet boven de main en neemt geen ruimte in. Dit is het container-gestuurde gedrag: de switch volgt de breedte van de sectie zelf (een ResizeObserver), niet de viewport.',
			},
		},
	},
};

export const ZonderInklappen = {
	render: () => html`
		<div style="max-width: 600px; margin-inline: auto; padding: 16px; outline: 1px dashed var(--semantics-surfaces-tinted-border-color);">
			<nldd-sidebar-section no-collapse>
				<nldd-container slot="sidebar" padding="16">${sidebar}</nldd-container>
				${main}
			</nldd-sidebar-section>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `no-collapse` klapt de sectie nooit in tot een sheet. Is-ie smaller dan lg (hier in een wrapper van 600px, dus ook op een breed scherm), dan stapelen de zijbalk en de main gewoon boven elkaar — de zijbalk full-width, zonder sticky. Geen trigger nodig.',
			},
		},
	},
};
