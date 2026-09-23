import { html } from 'lit';
import './token-field.js';
import '../../actions/menu/menu.js';

/**
 * De Token Field is een multi-select invoerveld: gekozen waarden verschijnen als
 * verwijderbare tokens in een wrappende rij, gevolgd door een invoer die
 * meegroeit. Voeg een `nldd-menu` met `nldd-menu-item` elementen toe als opties
 * (net als bij de combo-box). Dit is de eerste bouwfase (frame + tokens + waarde);
 * de menu-/filterbedrading volgt.
 */
export default {
	title: 'Components/Inputs/Token Field',
	component: 'nldd-token-field',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/token-field/token-field.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'wip' },
	},
	args: {
		// Twee tokens om mee te beginnen: de controls hieronder zetten values bij
		// elke wijziging opnieuw, dus een veld dat leeg begint blijft leeg zodra je
		// aan een knop draait, ook aan readonly.
		values: ['nl', 'be'],
		placeholder: 'Land toevoegen…',
		type: 'text',
		autocomplete: '',
		accessibleLabel: 'Landen',
		allowCustom: false,
		valid: false,
		invalid: false,
		noSpellcheck: false,
		readonly: false,
		required: false,
		disabled: false,
	},
	argTypes: {
		values: {
			control: 'object',
			description: 'Geselecteerde token-waarden (array; zet via de `values`-property). Tokens die je in het veld zelf toevoegt komen hier niet in terug, dus een volgende controlwijziging zet deze lijst weer neer.',
			table: { defaultValue: { summary: '[]' } },
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder in de invoer.',
		},
		type: {
			control: 'select',
			options: ['text', 'email', 'tel', 'url'],
			description: 'Input-type doorgegeven aan de invoer (bijv. `email`).',
			table: { defaultValue: { summary: 'text' } },
		},
		autocomplete: {
			control: 'text',
			description: 'Autocomplete-hint doorgegeven aan de invoer.',
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label, doorgegeven als aria-label aan de invoer.',
		},
		allowCustom: {
			name: 'allow-custom',
			control: 'boolean',
			description: 'Sta vrij getypte waarden toe (naast de menu-opties).',
			table: { defaultValue: { summary: 'false' } },
		},
		valid: {
			control: 'boolean',
			description: 'Markeert het veld geldig (groene rand + valid-icoon rechts).',
			table: { defaultValue: { summary: 'false' } },
		},
		invalid: {
			control: 'boolean',
			description: 'Markeert het veld ongeldig (rode rand + invalid-icoon rechts).',
			table: { defaultValue: { summary: 'false' } },
		},
		noSpellcheck: {
			name: 'no-spellcheck',
			control: 'boolean',
			description: 'Schakelt browser-spellcheck op de invoer uit.',
			table: { defaultValue: { summary: 'false' } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen: statische tokens (geen dismiss), geen invoer/picker, read-only-oppervlak.',
			table: { defaultValue: { summary: 'false' } },
		},
		required: {
			control: 'boolean',
			description: 'Verplicht: ongeldig zolang er geen tokens zijn.',
			table: { defaultValue: { summary: 'false' } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat: tokens niet verwijderbaar, invoer dicht.',
			table: { defaultValue: { summary: 'false' } },
		},
	},
};

const options = html`
	<nldd-menu variant="listbox">
		<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
		<nldd-menu-item value="be" text="België"></nldd-menu-item>
		<nldd-menu-item value="de" text="Duitsland"></nldd-menu-item>
		<nldd-menu-item value="fr" text="Frankrijk"></nldd-menu-item>
	</nldd-menu>
`;

const render = (args: Record<string, unknown>) => html`
	<nldd-token-field
		.values=${(args.values as string[]) ?? []}
		placeholder=${(args.placeholder as string) ?? ''}
		type=${(args.type as string) ?? 'text'}
		autocomplete=${(args.autocomplete as string) ?? ''}
		accessible-label=${(args.accessibleLabel as string) ?? ''}
		?allow-custom=${args.allowCustom}
		?valid=${args.valid}
		?invalid=${args.invalid}
		?no-spellcheck=${args.noSpellcheck}
		?readonly=${args.readonly}
		?required=${args.required}
		?disabled=${args.disabled}
	>${options}</nldd-token-field>
`;

export const Standaard = { render };

export const Leeg = { args: { placeholder: 'Land toevoegen…', values: [] }, render };
export const MetTokens = { args: { values: ['nl', 'be', 'de'] }, render };
export const ToestandInvalid = { name: 'Toestand invalid', args: { values: ['nl'], invalid: true }, render };

export const ToestandReadonly = { name: 'Toestand readonly', args: { values: ['nl', 'be'], readonly: true }, render };

/**
 * Vrije invoer zonder opties-menu: `allow-custom` aan en geen slotted `nldd-menu`.
 * Handig voor bijvoorbeeld meerdere e-mailadressen (`type="email"`). Typ een waarde
 * en bevestig met Enter of een komma; een komma splitst ook geplakte, kommagescheiden
 * invoer.
 */
export const EigenWaarden = {
	args: {
		placeholder: 'E-mailadres toevoegen…',
		type: 'email',
		autocomplete: 'email',
		accessibleLabel: 'E-mailadressen',
		allowCustom: true,
		values: ['ada@example.com'],
	},
	render: (args: Record<string, unknown>) => html`
		<nldd-token-field
			.values=${(args.values as string[]) ?? []}
			placeholder=${(args.placeholder as string) ?? ''}
			type=${(args.type as string) ?? 'text'}
			autocomplete=${(args.autocomplete as string) ?? ''}
			accessible-label=${(args.accessibleLabel as string) ?? ''}
			?allow-custom=${args.allowCustom}
			?valid=${args.valid}
			?invalid=${args.invalid}
			?no-spellcheck=${args.noSpellcheck}
			?disabled=${args.disabled}
		></nldd-token-field>
	`,
};

/**
 * Menu-tokens: `token-control="menu"` geeft elke token een ⌄ die een actie-menu opent
 * in plaats van een ✕. Het menu lever je als `nldd-token`-prototype in `slot="template"`:
 * één zonder key is het gedeelde menu, één met `data-value="X"` is de uitzondering voor
 * die waarde (hier heeft `nl` een extra actie). Het veld kloont het menu per token; een
 * keuze vuurt `token-action` (`{ value, action }`) en de app beslist wat er gebeurt.
 * Toetsenbord: focus een token en open het menu met Enter, Spatie of Pijl omlaag;
 * pijltjes roteren tussen de tokens, Backspace verwijdert er een.
 */
export const TokensMetMenu = {
	args: {
		accessibleLabel: 'Landen',
		placeholder: 'Land toevoegen…',
		values: ['nl', 'be', 'de'],
	},
	render: (args: Record<string, unknown>) => {
		const onTokenAction = (e: Event) => {
			const { value, action } = (e as CustomEvent<{ value: string; action: string }>).detail;
			const field = e.currentTarget as HTMLElement & { values: string[] };
			if (action === 'remove') {
				field.values = field.values.filter((v) => v !== value);
			} else if (action === 'to-start') {
				field.values = [value, ...field.values.filter((v) => v !== value)];
			} else if (action === 'capital') {
				window.alert(`Hoofdstad opvragen voor: ${value}`);
			}
		};
		return html`
			<nldd-token-field
				.values=${(args.values as string[]) ?? []}
				placeholder=${(args.placeholder as string) ?? ''}
				accessible-label=${(args.accessibleLabel as string) ?? ''}
				token-control="menu"
				@token-action=${onTokenAction}
			>
				<nldd-menu variant="listbox">
					<nldd-menu-item value="nl" text="Nederland"></nldd-menu-item>
					<nldd-menu-item value="be" text="België"></nldd-menu-item>
					<nldd-menu-item value="de" text="Duitsland"></nldd-menu-item>
					<nldd-menu-item value="fr" text="Frankrijk"></nldd-menu-item>
				</nldd-menu>

				<!-- Gedeeld menu (geen key): geldt voor elke token zonder eigen prototype. -->
				<nldd-token slot="template">
					<nldd-menu slot="menu">
						<nldd-menu-item value="to-start" text="Verplaats naar begin"></nldd-menu-item>
						<nldd-menu-item value="remove" text="Verwijder" destructive></nldd-menu-item>
					</nldd-menu>
				</nldd-token>

				<!-- Uitzondering voor "nl": een extra actie bovenop het gedeelde menu. -->
				<nldd-token slot="template" data-value="nl">
					<nldd-menu slot="menu">
						<nldd-menu-item value="capital" text="Toon hoofdstad"></nldd-menu-item>
						<nldd-menu-item value="to-start" text="Verplaats naar begin"></nldd-menu-item>
						<nldd-menu-item value="remove" text="Verwijder" destructive></nldd-menu-item>
					</nldd-menu>
				</nldd-token>
			</nldd-token-field>
		`;
	},
};
