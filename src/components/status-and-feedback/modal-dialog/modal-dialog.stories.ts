import { html, nothing } from 'lit';
import { useArgs } from 'storybook/preview-api';
import './modal-dialog.js';
import '../../actions/button/button.js';
import '../../inputs/text-field/text-field.js';
import '../../forms/form-field/form-field.js';
import { ICONS } from '../../content/icon/icon.js';

/**
 * De Modal Dialog is een modaal venster met overlay backdrop.
 * Gebruik `nldd-inline-dialog` voor een inline variant zonder overlay.
 *
 * ## Gebruik
 * ```html
 * <nldd-modal-dialog
 *   text="Bevestiging vereist"
 *   supporting-text="Dit kan niet ongedaan worden gemaakt."
 * >
 *   <nldd-button slot="actions" variant="primary" text="Bevestig"></nldd-button>
 *   <nldd-button slot="actions" variant="neutral-tinted" text="Annuleer"></nldd-button>
 * </nldd-modal-dialog>
 * ```
 */
export default {
	title: 'Components/Status & Feedback/Modal Dialog',
	component: 'nldd-modal-dialog',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/status-and-feedback/modal-dialog/modal-dialog.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		variant: '',
		horizontalAlignment: '',
		text: 'Dialog titel',
		supportingText: 'Ondersteunende tekst voor aanvullende context.',
		icon: '',
		accessibleLabel: '',
		open: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['(geen)', 'alert'],
			mapping: { '(geen)': '' },
			description: 'Semantische variant. `alert` dwingt een icoon en kleur af.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		horizontalAlignment: {
			name: 'horizontal-alignment',
			control: 'select',
			options: ['(auto)', 'left', 'center'],
			mapping: { '(auto)': '' },
			description: 'Uitlijning van tekst, icoon en acties. Zonder waarde leidt de dialoog hem af: eigen inhoud in de slot lijnt links uit, een kale melding blijft gecentreerd.',
			table: { defaultValue: { summary: '(auto)' } },
		},
		text: {
			control: 'text',
			description: 'Hoofdtekst',
		},
		supportingText: {
			name: 'supporting-text',
			control: 'text',
			description: 'Ondersteunende tekst',
		},
		icon: {
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon boven de tekst.',
			table: { defaultValue: { summary: '(geen)' } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijke naam van de dialoog. Zonder label neemt de dialoog de hoofdtekst over.',
			table: { defaultValue: { summary: 'hoofdtekst' } },
		},
		open: {
			control: 'boolean',
			description: 'Of de dialoog open is. Aanzetten opent de dialoog; sluit de dialoog zichzelf (Escape, de achtergrond), dan gaat `open` vanzelf weer uit.',
			table: { defaultValue: { summary: false } },
		},
	},
};

const openNext = (e: Record<string, any>) => e.currentTarget.nextElementSibling.show();

// Set the property rather than the arg: a story further down a docs page renders
// with its initial args and does not redraw when they change. The open and close
// events keep the control in step.
const setNextOpen = (e: Record<string, any>) => { e.currentTarget.nextElementSibling.open = true; };
const setClosed = (e: Record<string, any>) => { e.target.closest('nldd-modal-dialog').open = false; };

export const Standaard = (args: Record<string, any>) => {
	const [, updateArgs] = useArgs();
	return html`
		<nldd-button
			variant="primary"
			text="Open modal dialog"
			@click=${setNextOpen}
		></nldd-button>
		<nldd-modal-dialog
			variant=${args.variant || nothing}
			horizontal-alignment=${args.horizontalAlignment || nothing}
			text=${args.text}
			supporting-text=${args.supportingText}
			icon=${args.icon || nothing}
			accessible-label=${args.accessibleLabel || nothing}
			?open=${args.open}
			@open=${() => updateArgs({ open: true })}
			@close=${() => updateArgs({ open: false })}
		>
			<nldd-button
				slot="actions"
				variant="primary"
				text="Bevestig"
				@click=${setClosed}
			></nldd-button>
			<nldd-button
				slot="actions"
				variant="neutral-tinted"
				text="Annuleer"
				@click=${setClosed}
			></nldd-button>
		</nldd-modal-dialog>
	`;
};

export const ZonderIcoon = {
	render: () => html`
	<nldd-button
		variant="primary"
		text="Open modal dialog"
		@click=${openNext}
	></nldd-button>
	<nldd-modal-dialog
		text="Bevestiging vereist"
		supporting-text="Weet u zeker dat u door wilt gaan? Dit kan niet ongedaan worden gemaakt."
	>
		<nldd-button
			slot="actions"
			variant="primary"
			text="Bevestig"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
		<nldd-button
			slot="actions"
			variant="neutral-tinted"
			text="Annuleer"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
	</nldd-modal-dialog>
`,
	parameters: { controls: { disable: true } },
};

export const MetIcoon = {
	render: () => html`
	<nldd-button
		variant="primary"
		text="Open modal dialog"
		@click=${openNext}
	></nldd-button>
	<nldd-modal-dialog
		icon="check-mark-circle"
		text="Succesvol opgeslagen"
		supporting-text="Uw wijzigingen zijn opgeslagen."
	>
		<nldd-button
			slot="actions"
			variant="primary"
			text="Sluiten"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
	</nldd-modal-dialog>
`,
	parameters: { controls: { disable: true } },
};

export const VariantAlert = {
	name: 'Variant alert',
	render: () => html`
	<nldd-button
		variant="primary"
		text="Open modal dialog"
		@click=${openNext}
	></nldd-button>
	<nldd-modal-dialog
		variant="alert"
		text="Niet opgeslagen"
		supporting-text="Als u doorgaat gaan uw wijzigingen verloren."
	>
		<nldd-button
			slot="actions"
			variant="primary"
			text="Doorgaan"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
		<nldd-button
			slot="actions"
			variant="neutral-tinted"
			text="Annuleer"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
	</nldd-modal-dialog>
`,
	parameters: { controls: { disable: true } },
};

/**
 * De uitlijning erft de modal van `nldd-inline-dialog`, die hij intern rendert.
 * Zet je een formulier in de slot, dan lijnen kop, tekst en knoppen links uit en
 * komen de knoppen naast elkaar. Zonder slot blijft een korte bevestiging
 * gecentreerd, zoals in de stories hierboven.
 *
 * Wil je daarvan afwijken, dan geeft `horizontal-alignment` op de modal door aan
 * de inline dialog erbinnen.
 */
export const MetFormulier = {
	name: 'Met formulier (links uitgelijnd)',
	render: () => html`
	<nldd-button
		variant="primary"
		text="Open modal dialog"
		@click=${openNext}
	></nldd-button>
	<nldd-modal-dialog
		icon="write"
		text="Map hernoemen"
		supporting-text="De nieuwe naam is meteen zichtbaar voor iedereen met toegang."
	>
		<nldd-form-field label="Naam">
				<nldd-text-field value="Beleidsstukken 2026"></nldd-text-field>
			</nldd-form-field>
		<nldd-button
			slot="actions"
			variant="primary"
			text="Opslaan"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
		<nldd-button
			slot="actions"
			variant="neutral-tinted"
			text="Annuleer"
			@click=${(e: any) => e.target.closest('nldd-modal-dialog').hide()}
		></nldd-button>
	</nldd-modal-dialog>
`,
	parameters: { controls: { disable: true } },
};
