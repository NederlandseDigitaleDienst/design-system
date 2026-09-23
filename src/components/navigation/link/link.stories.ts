import { html, nothing } from 'lit';
import './link.js';
import { ICONS } from './../../content/icon/icon.js';

/**
 * De Link component werkt in twee modi:
 *
 * - **Sized** (`size="xs|sm|md|lg"`) — standalone link met vaste tekstgrootte,
 *   ondersteunt icons. Voor menu's, actiegebieden, overzichten.
 * - **Inherit** (geen `size`) — erft font-size, line-height en font-family van
 *   omgeving. Tekst wraps natuurlijk over regels. Voor links in lopende tekst,
 *   custom layouts of cells.
 *
 * Voor links in HTML-content (CMS, markdown) blijft `<nldd-rich-text>` met raw
 * `<a>` de juiste route — die styled `a` selectors via globale CSS.
 *
 * ## Gebruik
 * ```html
 * <!-- Standalone met expliciete grootte -->
 * <nldd-link href="/pad" size="md" text="Bekijk meer"></nldd-link>
 * <nldd-link href="https://example.com" target="_blank" size="md" text="Externe" end-icon="arrow-up-right"></nldd-link>
 *
 * <!-- Inline in tekst, erft van parent -->
 * <p>Lees meer over de <nldd-link href="/voorwaarden">voorwaarden</nldd-link> hier.</p>
 * ```
 */
export default {
	title: 'Components/Navigation/Link',
	component: 'nldd-link',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/navigation/link/link.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: {
			type: 'stable',
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['inherit', 'xs', 'sm', 'md', 'lg'],
			description: '`inherit` volgt de tekst eromheen en zet de link inline, zodat hij meeloopt in een alinea. `xs` tot `lg` leggen een maat vast en schakelen naar inline-flex. Icons werken in beide modi.',
			table: {
				defaultValue: { summary: 'inherit' },
			},
		},
		text: {
			control: 'text',
			description: 'Tekst van de link',
		},
		startIcon: {
			name: 'start-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon voor de tekst',
			table: {
				defaultValue: { summary: '(geen)' },
			},
		},
		endIcon: {
			name: 'end-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon na de tekst',
			table: {
				defaultValue: { summary: '(geen)' },
			},
		},
		href: {
			control: 'text',
			description: 'Link doel',
		},
		target: {
			control: 'select',
			options: ['(geen)', '_self', '_blank', '_parent', '_top'],
			description: 'Link target (stelt rel automatisch bij voor _blank)',
			table: { defaultValue: { summary: '(geen)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label voor screen readers',
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: {
				defaultValue: { summary: false },
			},
		},
	},
	args: {
		size: 'md',
		text: 'Bekijk meer',
		startIcon: '',
		endIcon: '',
		href: '#',
		target: '',
		accessibleLabel: '',
		disabled: false,
	},
};

const Template = ({ size, text, startIcon, endIcon, href, target, accessibleLabel, disabled }: Record<string, any>) => html`
	<nldd-link
		href=${href || nothing}
		target=${target || nothing}
		size=${size || nothing}
		text=${text}
		start-icon=${startIcon || nothing}
		end-icon=${endIcon || nothing}
		accessible-label=${accessibleLabel || nothing}
		?disabled=${disabled}
	></nldd-link>
`;

export const Standaard = {
	render: Template,
};

export const Grootten = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
			<nldd-link href="#" size="lg" text="Large link"></nldd-link>
			<nldd-link href="#" size="md" text="Medium link"></nldd-link>
			<nldd-link href="#" size="sm" text="Small link"></nldd-link>
			<nldd-link href="#" size="xs" text="Extra small link"></nldd-link>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const InLopendeTekst = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 560px;">
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">In een h2 — link erft display-grootte</p>
				<h2 style="margin: 0; font: var(--primitives-font-display-2-md);">
					Lees meer over <nldd-link href="#voorwaarden">de voorwaarden</nldd-link> hier.
				</h2>
			</div>
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">In body-md — link is body-md</p>
				<p style="margin: 0; font: var(--primitives-font-body-md-regular-snug);">
					Wil je toeslag aanvragen? Bekijk dan eerst <nldd-link href="https://example.com" target="_blank">de voorwaarden op de website</nldd-link> van de Belastingdienst.
				</p>
			</div>
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">In body-sm — link is body-sm</p>
				<p style="margin: 0; font: var(--primitives-font-body-sm-regular-snug);">
					Disclaimer: deze pagina is informatief. Voor juridische details zie <nldd-link href="#disclaimer">de disclaimer</nldd-link>.
				</p>
			</div>
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">Lange link wraps over regels (display: inline)</p>
				<p style="margin: 0; max-width: 280px; font: var(--primitives-font-body-md-regular-snug);">
					Klik <nldd-link href="#">hier voor een nogal lange linktekst die over meerdere regels moet kunnen wrappen</nldd-link> en kijk wat er gebeurt.
				</p>
			</div>
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">Met end-icon (externe link) — natuurlijke whitespace tussen tekst en icon</p>
				<p style="margin: 0; font: var(--primitives-font-body-md-regular-snug);">
					Bezoek <nldd-link href="https://example.com" target="_blank" end-icon="square-arrow-right-top">de website</nldd-link> voor meer info.
				</p>
			</div>
			<div>
				<p style="margin: 0 0 4px; font-size: 12px; color: var(--primitives-color-neutral-500);">Expliciete <code>size="inherit"</code> doet hetzelfde als geen size</p>
				<p style="margin: 0; font: var(--primitives-font-body-md-regular-snug);">
					Lees ook <nldd-link href="#" size="inherit">de toelichting</nldd-link> voor context.
				</p>
			</div>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: `
Zonder \`size\` attribuut (of met \`size="inherit"\`) erft \`<nldd-link>\` font-size, line-height en font-family van de omgeving — gebruik dit voor links in lopende tekst. De link rendert als pure inline-element zodat tekst natuurlijk over regels wrapt.

Icons werken ook in inherit mode: de natuurlijke whitespace tussen icon en tekst zorgt voor de spacing.
				`.trim(),
			},
		},
	},
};

export const MetStartIcon = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
			<nldd-link href="#" text="Download bestand" start-icon="download"></nldd-link>
			<nldd-link href="#" text="Terug naar overzicht" start-icon="arrow-left"></nldd-link>
		</div>
	`,
	parameters: {
		controls: { disable: true },
	},
};

export const MetEndIcon = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
			<nldd-link href="#" text="Verder lezen" end-icon="arrow-right"></nldd-link>
			<nldd-link href="https://example.com" target="_blank" text="Externe website" end-icon="square-arrow-right-top"></nldd-link>
		</div>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Gebruik een end-icon om richting of externe navigatie te indiceren.',
			},
		},
	},
};

export const ToestandDisabled = {
	name: 'Toestand disabled',
	render: () => html`
		<nldd-link href="#" text="Uitgeschakelde link" disabled></nldd-link>
	`,
	parameters: {
		controls: { disable: true },
	},
};
