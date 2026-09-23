import { html, nothing } from 'lit';
import './cell.js';
import '../../../actions/button/button.js';

export default {
	title: 'Components/Lists & Tables/Cells/Cell',
	component: 'nldd-cell',
	tags: ['autodocs'],
	args: {
		width: '',
		minWidth: '',
		maxWidth: '',
		minHeight: '',
		horizontalAlignment: 'left',
		verticalAlignment: 'center',
		hideBelow: '',
		hideAbove: '',
	},
	argTypes: {
		width: {
			control: 'text',
			description: "'full', 'fit-content', of een CSS-lengte (bv. '120px', '10rem')",
			table: { defaultValue: { summary: 'fit-content' } },
		},
		minWidth: {
			name: 'min-width',
			control: 'text',
			description: "Minimale breedte als CSS-lengte (bv. '80px', '5rem')",
		},
		maxWidth: {
			name: 'max-width',
			control: 'text',
			description: "Maximale breedte als CSS-lengte (bv. '200px', '20rem')",
		},
		minHeight: {
			name: 'min-height',
			control: 'text',
			description: "Minimale hoogte als CSS-lengte (bv. '44px', '3rem')",
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['left', 'center', 'right'],
			description: 'Horizontale uitlijning van slotted content',
			table: { defaultValue: { summary: 'left' } },
		},
		verticalAlignment: {
			name: 'vertical-alignment',
			control: 'select',
			options: ['top', 'center', 'bottom'],
			description: 'Verticale uitlijning van slotted content',
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
		<nldd-cell
			width=${args.width || nothing}
			horizontal-alignment=${args.horizontalAlignment}
			vertical-alignment=${args.verticalAlignment}
			hide-below=${args.hideBelow || nothing}
			hide-above=${args.hideAbove || nothing}
			style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);"
		>
			<nldd-button variant="neutral-tinted" text="Knop"></nldd-button>
		</nldd-cell>
	`,
};

export const BreedteFull = {
	name: 'Breedte: full',
	render: () => html`
		<nldd-cell width="full" style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-button variant="neutral-tinted" width="full" text="Uitgerekte knop"></nldd-button>
		</nldd-cell>
	`,
};

export const BreedteFitContent = {
	name: 'Breedte: fit-content',
	render: () => html`
		<nldd-cell width="fit-content" style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-button variant="neutral-tinted" text="Past zich aan"></nldd-button>
		</nldd-cell>
	`,
};

export const BreedteVast = {
	render: () => html`
		<nldd-cell width="120px" style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-button variant="neutral-tinted" width="full" text="120px vast"></nldd-button>
		</nldd-cell>
	`,
};

export const MetMinEnMaxBreedte = {
	render: () => html`
		<nldd-cell width="full" min-width="80px" max-width="200px" style="height: 80px; border: 1px dashed var(--primitives-color-neutral-150);">
			<nldd-button variant="neutral-tinted" width="full" text="Min 80 / Max 200"></nldd-button>
		</nldd-cell>
	`,
};

export const MetMinimaleHoogte = {
	render: () => html`
		<div style="display: flex; gap: 8px; align-items: flex-start;">
			<nldd-cell vertical-alignment="top" min-height="44px" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Min-hoogte 44px"></nldd-button>
			</nldd-cell>
		</div>
	`,
};

export const VerticaleUitlijning = {
	render: () => html`
		<div style="display: flex; gap: 8px; height: 100px;">
			<nldd-cell vertical-alignment="top" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Boven"></nldd-button>
			</nldd-cell>
			<nldd-cell vertical-alignment="center" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Midden"></nldd-button>
			</nldd-cell>
			<nldd-cell vertical-alignment="bottom" style="border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Onder"></nldd-button>
			</nldd-cell>
		</div>
	`,
};

export const HorizontaleUitlijning = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 8px;">
			<nldd-cell width="240px" horizontal-alignment="left" style="height: 60px; border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Links (default)"></nldd-button>
			</nldd-cell>
			<nldd-cell width="240px" horizontal-alignment="center" style="height: 60px; border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Midden"></nldd-button>
			</nldd-cell>
			<nldd-cell width="240px" horizontal-alignment="right" style="height: 60px; border: 1px dashed var(--primitives-color-neutral-150);">
				<nldd-button variant="neutral-tinted" text="Rechts"></nldd-button>
			</nldd-cell>
		</div>
	`,
};
