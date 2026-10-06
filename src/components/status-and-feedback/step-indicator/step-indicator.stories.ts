import { html } from 'lit';
import './step-indicator.js';

/**
 * Toont waar je staat in een proces van meerdere stappen. Je zet
 * `status="current"` op de stap waar je bent, en de ouder leidt daaruit af wat
 * ervoor `past` en erna `future` is. Staat die nergens, dan is stap 1 de huidige.
 *
 * Alleen horizontaal. Stappen onder elkaar bouw je als `nldd-list` met per rij
 * een `nldd-timeline-track-cell` en een `nldd-title-cell` — verticale stappen
 * dragen meestal meer dan een titel, en dat kan een lijstrij al.
 */
export default {
	title: 'Components/Status & Feedback/Step Indicator',
	component: 'nldd-step-indicator',
	tags: ['autodocs'],
	argTypes: {
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Naam van de nav; leeg valt terug op de vertaling',
			table: { defaultValue: { summary: 'Voortgang' } },
		},
	},
};

export const Standaard = {
	args: {
		accessibleLabel: 'Voortgang aanvraag',
	},
	render: ({ accessibleLabel }: Record<string, string>) => html`
		<nldd-step-indicator accessible-label=${accessibleLabel}>
			<nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
			<nldd-step-indicator-item
				text="Controle"
				status="current"
			></nldd-step-indicator-item>
			<nldd-step-indicator-item text="Bevestigen"></nldd-step-indicator-item>
		</nldd-step-indicator>
	`,
};

/**
 * De drie toestanden naast elkaar: een afgeronde stap toont een vinkje, de
 * huidige zijn cijfer in de accentkleur, en wat nog komt een open bol. De lijn
 * loopt onder de bollen door; een ring in de achtergrondkleur houdt er 2px
 * ruimte omheen, zodat de lijn de bol niet raakt.
 */
export const Statussen = {
	render: () => html`
		<nldd-step-indicator accessible-label="Voortgang">
			<nldd-step-indicator-item text="Aanvraag"></nldd-step-indicator-item>
			<nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
			<nldd-step-indicator-item
				text="Controle"
				status="current"
			></nldd-step-indicator-item>
			<nldd-step-indicator-item text="Bevestigen"></nldd-step-indicator-item>
			<nldd-step-indicator-item text="Klaar"></nldd-step-indicator-item>
		</nldd-step-indicator>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een afgeronde stap kan een link zijn (`href`) of een knop (`button`), zodat je
 * terug kunt bladeren. De knop is er voor flows zonder eigen URL per stap, zoals
 * een wizard in één venster. Zonder allebei is een stap geen control, en `href`
 * wint van `button` — dezelfde regel als `nldd-card` en `nldd-avatar`.
 */
export const Klikbaar = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 32px;">
			<nldd-step-indicator accessible-label="Voortgang met links">
				<nldd-step-indicator-item
					text="Gegevens"
					href="#stap-1"
				></nldd-step-indicator-item>
				<nldd-step-indicator-item
					text="Controle"
					href="#stap-2"
				></nldd-step-indicator-item>
				<nldd-step-indicator-item
					text="Bevestigen"
					status="current"
				></nldd-step-indicator-item>
			</nldd-step-indicator>
			<nldd-step-indicator accessible-label="Voortgang met knoppen">
				<nldd-step-indicator-item
					text="Gegevens"
					button
				></nldd-step-indicator-item>
				<nldd-step-indicator-item
					text="Controle"
					button
				></nldd-step-indicator-item>
				<nldd-step-indicator-item
					text="Bevestigen"
					status="current"
				></nldd-step-indicator-item>
			</nldd-step-indicator>
		</div>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Een eigen icoon per stap in plaats van cijfer en vinkje.
 */
export const MetIconen = {
	render: () => html`
		<nldd-step-indicator accessible-label="Voortgang">
			<nldd-step-indicator-item
				text="Profiel"
				icon="person"
			></nldd-step-indicator-item>
			<nldd-step-indicator-item
				text="Opdracht"
				icon="business-suitcase"
				status="current"
			></nldd-step-indicator-item>
			<nldd-step-indicator-item
				text="Bevestigen"
				icon="check-mark"
			></nldd-step-indicator-item>
		</nldd-step-indicator>
	`,
	parameters: { controls: { disable: true } },
};

/**
 * Onder de sm-breakpoint van het systeem (gemeten op de container, niet op de
 * viewport — dit kan in een sheet staan) klapt het component om naar één regel
 * tekst plus een segmentbalk.
 * Bolletjes en labels kosten daar precies de ruimte die je niet hebt; de balk
 * houdt wel zichtbaar uit hoeveel stappen het proces bestaat. De volledige
 * stappenlijst blijft in de DOM staan voor hulpsoftware.
 */
export const Compact = {
	render: () => html`
		<div style="max-width: 360px; padding: 16px; border: 1px dashed var(--semantics-dividers-color);">
			<nldd-step-indicator accessible-label="Voortgang aanvraag">
				<nldd-step-indicator-item text="Gegevens"></nldd-step-indicator-item>
				<nldd-step-indicator-item
					text="Controle"
					status="current"
				></nldd-step-indicator-item>
				<nldd-step-indicator-item text="Bevestigen"></nldd-step-indicator-item>
			</nldd-step-indicator>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
