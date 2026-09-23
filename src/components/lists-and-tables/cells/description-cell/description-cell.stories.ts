import { html, nothing } from 'lit';
import './description-cell.js';
import '../../../content/rich-text/rich-text.js';

export default {
	title: 'Components/Lists & Tables/Cells/Description Cell',
	component: 'nldd-description-cell',
	tags: ['autodocs'],
	args: {
		verticalAlignment: 'center',
		width: '',
		minWidth: '',
		maxWidth: '',
		minHeight: '',
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		width: {
			control: 'text',
			description: "'full', 'fit-content', of een CSS-lengte (bv. '200px', '20rem')",
			table: { defaultValue: { summary: 'full' } },
		},
		minWidth: {
			name: 'min-width',
			control: 'text',
			description: "Minimale breedte als CSS-lengte (bv. '80px', '5rem')",
		},
		maxWidth: {
			name: 'max-width',
			control: 'text',
			description: "Maximale breedte als CSS-lengte (bv. '300px', '20rem')",
		},
		minHeight: {
			name: 'min-height',
			control: 'text',
			description: "Minimale hoogte als CSS-lengte (bv. '44px', '3rem')",
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['top', 'center', 'bottom'],
			description: 'Verticale uitlijning van de cel',
			table: { defaultValue: { summary: 'center' } },
		},
		hideBelow: {
			name: 'hide-below',
			control: 'text',
			description: 'Verberg wanneer cells-container smaller is dan deze CSS-lengte (bv. "320px", "20rem")',
		},
		hideAbove: {
			name: 'hide-above',
			control: 'text',
			description: 'Verberg wanneer cells-container breder is dan deze CSS-lengte (bv. "1200px")',
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-description-cell
			width=${args.width || nothing}
			vertical-alignment=${args.verticalAlignment}
			hide-below=${args.hideBelow || nothing}
			hide-above=${args.hideAbove || nothing}
		>
			<p slot="title">Term</p>
			<p slot="description">Beschrijvingstekst</p>
		</nldd-description-cell>
	`,
};

export const MetRichText = {
	render: () => html`
		<nldd-description-cell>
			<p slot="title">Term</p>
			<nldd-rich-text slot="description">
				<p>Deze beschrijving bevat <strong>opgemaakte tekst</strong> en <a href="#">een link</a>.</p>
			</nldd-rich-text>
		</nldd-description-cell>
	`,
};

export const VerticaleUitlijning = {
	render: () => html`
		<div style="display: flex; gap: 8px; height: 80px;">
			<nldd-description-cell vertical-alignment="top" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<p slot="title">Term</p>
				<p slot="description">Boven</p>
			</nldd-description-cell>
			<nldd-description-cell vertical-alignment="center" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<p slot="title">Term</p>
				<p slot="description">Midden</p>
			</nldd-description-cell>
			<nldd-description-cell vertical-alignment="bottom" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<p slot="title">Term</p>
				<p slot="description">Onder</p>
			</nldd-description-cell>
		</div>
	`,
};
