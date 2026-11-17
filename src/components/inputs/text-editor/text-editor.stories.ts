import { html, nothing } from 'lit';
import { action } from 'storybook/actions';
import './text-editor.js';
import '../../actions/toolbar/toolbar.js';
import '../../inputs/segmented-control/segmented-control.js';
import '../../inputs/toggle-button/toggle-button.js';
import '../../actions/button/button.js';
import '../../actions/button-bar/button-bar.js';
import '../../status-and-feedback/modal-dialog/modal-dialog.js';
import '../../layout/sheet/sheet.js';
import '../../layout/container/container.js';
import '../../actions/icon-button/icon-button.js';
import '../../actions/menu/menu.js';
import '../../layout/spacer/spacer.js';
import '../../forms/form-field/form-field.js';

const SAMPLE = `# Aanvraag A-1042

Een **vetgedrukte** en *cursieve* zin met \`inline code\`. Lees meer over [dakisolatie](https://www.example.nl/dakisolatie).

> Een blockquote met toelichting.

- Eerste punt
- Tweede punt
  - Een genest punt

1. Aanvraag indienen
2. Beoordeling door team Uitvoering

- [x] Gegevens gecontroleerd
- [ ] Besluit versturen

---

## Subkop

Tekst met ~~doorhaling~~ (GFM).

\`\`\`bash
npm run test:a11y
\`\`\``;

/* The formatting toolbar of the stories: markup only. Each control names its
 * command in `text-editor-command`, and the editor runs it and keeps its state,
 * in the toolbar and in its overflow menu alike. `slot` puts it in the editor's
 * frame; `editorId` points it at an editor elsewhere on the page. */
function formatToolbar({ slot, editorId }: { slot?: string; editorId?: string } = {}) {
	return html`
		<nldd-toolbar
			slot=${slot ?? nothing}
			text-editor-for=${editorId ?? nothing}
			accessible-label="Opmaak"
		>
			<nldd-toolbar-item slot="start" label="Nadruk">
				<nldd-segmented-control type="checkbox" variant="icon" accessible-label="Nadruk">
					<nldd-segmented-control-item text-editor-command="bold" value="bold" text="Vet" shortcut="Ctrl+B" shortcut-mac="Cmd+B" icon="bold"></nldd-segmented-control-item>
					<nldd-segmented-control-item text-editor-command="italic" value="italic" text="Cursief" shortcut="Ctrl+I" shortcut-mac="Cmd+I" icon="italic"></nldd-segmented-control-item>
					<nldd-segmented-control-item text-editor-command="strikethrough" value="strikethrough" text="Doorhalen" icon="strikethrough"></nldd-segmented-control-item>
				</nldd-segmented-control>
				<nldd-menu-group slot="overflow" text="Nadruk">
					<nldd-menu-item type="checkbox" text-editor-command="bold" text="Vet" shortcut="Ctrl+B" shortcut-mac="Cmd+B" icon="bold"></nldd-menu-item>
					<nldd-menu-item type="checkbox" text-editor-command="italic" text="Cursief" shortcut="Ctrl+I" shortcut-mac="Cmd+I" icon="italic"></nldd-menu-item>
					<nldd-menu-item type="checkbox" text-editor-command="strikethrough" text="Doorhalen" icon="strikethrough"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Code">
				<nldd-toggle-button text-editor-command="inlineCode" variant="icon" icon="code" accessible-label="Code" shortcut="Ctrl+E" shortcut-mac="Cmd+E"></nldd-toggle-button>
				<nldd-menu-item slot="overflow" type="checkbox" text-editor-command="inlineCode" text="Code" shortcut="Ctrl+E" shortcut-mac="Cmd+E" icon="code"></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Link">
				<nldd-toggle-button text-editor-command="link" variant="icon" icon="link" accessible-label="Link" shortcut="Ctrl+K" shortcut-mac="Cmd+K"></nldd-toggle-button>
				<nldd-menu-item slot="overflow" type="checkbox" text-editor-command="link" text="Link" shortcut="Ctrl+K" shortcut-mac="Cmd+K" icon="link"></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Citaat">
				<nldd-toggle-button text-editor-command="quote" variant="icon" icon="text-quote" accessible-label="Citaat"></nldd-toggle-button>
				<nldd-menu-item slot="overflow" type="checkbox" text-editor-command="quote" text="Citaat" icon="text-quote"></nldd-menu-item>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Lijst">
				<nldd-segmented-control text-editor-command="setList" type="radio" variant="icon" value="none" accessible-label="Lijst">
					<nldd-segmented-control-item value="none" text="Geen lijst" icon="minus"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="bullet" text="Opsomming" icon="bullet-list"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="ordered" text="Genummerd" icon="numbered-list"></nldd-segmented-control-item>
					<nldd-segmented-control-item value="task" text="Taken" icon="checkbox-list"></nldd-segmented-control-item>
				</nldd-segmented-control>
				<nldd-menu-group slot="overflow" text="Lijst">
					<nldd-menu-item type="radio" text-editor-command="setList:none" text="Geen lijst" icon="minus"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setList:bullet" text="Opsomming" icon="bullet-list"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setList:ordered" text="Genummerd" icon="numbered-list"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setList:task" text="Taken" icon="checkbox-list"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Inspringen">
				<nldd-button-bar>
					<nldd-icon-button text-editor-command="indent" icon="indent-increase" text="Meer inspringen" shortcut="Ctrl+]" shortcut-mac="Cmd+]"></nldd-icon-button>
					<nldd-button-bar-divider></nldd-button-bar-divider>
					<nldd-icon-button text-editor-command="outdent" icon="indent-decrease" text="Minder inspringen" shortcut="Ctrl+[" shortcut-mac="Cmd+["></nldd-icon-button>
				</nldd-button-bar>
				<nldd-menu-group slot="overflow" text="Inspringen">
					<nldd-menu-item text-editor-command="indent" text="Meer inspringen" shortcut="Ctrl+]" shortcut-mac="Cmd+]" icon="indent-increase"></nldd-menu-item>
					<nldd-menu-item text-editor-command="outdent" text="Minder inspringen" shortcut="Ctrl+[" shortcut-mac="Cmd+[" icon="indent-decrease"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="start" label="Tekststijl">
				<nldd-button expandable text="Tekststijl">
					<nldd-menu slot="popup">
						<nldd-menu-item type="radio" text-editor-command="setHeading:0" text="Paragraaf"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item type="radio" text-editor-command="setHeading:1" text="Kop 1"></nldd-menu-item>
						<nldd-menu-item type="radio" text-editor-command="setHeading:2" text="Kop 2"></nldd-menu-item>
						<nldd-menu-item type="radio" text-editor-command="setHeading:3" text="Kop 3"></nldd-menu-item>
						<nldd-menu-item type="radio" text-editor-command="setHeading:4" text="Kop 4"></nldd-menu-item>
						<nldd-menu-item type="radio" text-editor-command="setHeading:5" text="Kop 5"></nldd-menu-item>
						<nldd-menu-item type="radio" text-editor-command="setHeading:6" text="Kop 6"></nldd-menu-item>
						<nldd-menu-divider></nldd-menu-divider>
						<nldd-menu-item type="radio" text-editor-command="codeBlock" text="Codeblok"></nldd-menu-item>
					</nldd-menu>
				</nldd-button>
				<nldd-menu-group slot="overflow" text="Tekststijl">
					<nldd-menu-item type="radio" text-editor-command="setHeading:0" text="Paragraaf"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:1" text="Kop 1"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:2" text="Kop 2"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:3" text="Kop 3"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:4" text="Kop 4"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:5" text="Kop 5"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="setHeading:6" text="Kop 6"></nldd-menu-item>
					<nldd-menu-item type="radio" text-editor-command="codeBlock" text="Codeblok"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="end" label="Klembord">
				<nldd-button-bar>
					<nldd-icon-button text-editor-command="copy" icon="copy" text="Kopieer" shortcut="Ctrl+C" shortcut-mac="Cmd+C"></nldd-icon-button>
					<nldd-button-bar-divider></nldd-button-bar-divider>
					<nldd-icon-button text-editor-command="cut" icon="cut" text="Knip" shortcut="Ctrl+X" shortcut-mac="Cmd+X"></nldd-icon-button>
					<nldd-button-bar-divider></nldd-button-bar-divider>
					<nldd-icon-button text-editor-command="paste" icon="paste" text="Plak" shortcut="Ctrl+V" shortcut-mac="Cmd+V"></nldd-icon-button>
				</nldd-button-bar>
				<nldd-menu-group slot="overflow" text="Klembord">
					<nldd-menu-item text-editor-command="copy" text="Kopieer" shortcut="Ctrl+C" shortcut-mac="Cmd+C" icon="copy"></nldd-menu-item>
					<nldd-menu-item text-editor-command="cut" text="Knip" shortcut="Ctrl+X" shortcut-mac="Cmd+X" icon="cut"></nldd-menu-item>
					<nldd-menu-item text-editor-command="paste" text="Plak" shortcut="Ctrl+V" shortcut-mac="Cmd+V" icon="paste"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
			<nldd-toolbar-item slot="end" label="Geschiedenis">
				<nldd-button-bar>
					<nldd-icon-button text-editor-command="undo" icon="undo" text="Maak ongedaan" shortcut="Ctrl+Z" shortcut-mac="Cmd+Z"></nldd-icon-button>
					<nldd-button-bar-divider></nldd-button-bar-divider>
					<nldd-icon-button text-editor-command="redo" icon="redo" text="Voer opnieuw uit" shortcut="Ctrl+Y" shortcut-mac="Cmd+Shift+Z"></nldd-icon-button>
				</nldd-button-bar>
				<nldd-menu-group slot="overflow" text="Geschiedenis">
					<nldd-menu-item text-editor-command="undo" text="Maak ongedaan" shortcut="Ctrl+Z" shortcut-mac="Cmd+Z" icon="undo"></nldd-menu-item>
					<nldd-menu-item text-editor-command="redo" text="Voer opnieuw uit" shortcut="Ctrl+Y" shortcut-mac="Cmd+Shift+Z" icon="redo"></nldd-menu-item>
				</nldd-menu-group>
			</nldd-toolbar-item>
		</nldd-toolbar>
	`;
}

export default {
	title: 'Components/Inputs/Text Editor',
	component: 'nldd-text-editor',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/inputs/text-editor/text-editor.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'beta' },
	},
	args: {
		embedded: false,
		syntax: 'hidden',
		value: SAMPLE,
		placeholder: '',
		rows: 8,
		resize: 'auto',
		wrap: true,
		invalid: false,
		readonly: false,
		required: false,
		noSpellcheck: false,
		disabled: false,
		accessibleLabel: 'Tekst',
	},
	argTypes: {
		embedded: {
			control: 'boolean',
			description: 'Zonder kader, vulling, padding en focusring, voor een editor in een eigen compositie die die zelf levert',
			table: { defaultValue: { summary: false } },
		},
		syntax: {
			control: 'select',
			options: ['hidden', 'visible'],
			description: 'Opmaaktekens. "hidden" verbergt ze en toont ze waar de cursor of selectie een constructie raakt; "visible" laat ze gedimd staan, voor wie markdown schrijft.',
			table: { defaultValue: { summary: 'hidden' } },
		},
		value: {
			control: 'text',
			description: 'De inhoud (markdown)',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder tekst',
		},
		rows: {
			control: 'number',
			description: 'Minimale zichtbare regels (de vloer in elke resize-modus)',
			table: { defaultValue: { summary: 6 } },
		},
		resize: {
			control: 'select',
			options: ['none', 'vertical', 'auto'],
			description: 'Resize-gedrag. auto = groeit mee, vertical = slepen vanaf rows, none = vast.',
			table: { defaultValue: { summary: 'auto' } },
		},
		wrap: {
			control: 'boolean',
			description: 'Lange regels afbreken (default aan; proza wrapt)',
			table: { defaultValue: { summary: true } },
		},
		invalid: {
			control: 'boolean',
			description: 'Ongeldige staat. Wordt aangekondigd met aria-invalid; er wordt niets voor getekend.',
			table: { defaultValue: { summary: false } },
		},
		readonly: {
			control: 'boolean',
			description: 'Alleen-lezen staat',
			table: { defaultValue: { summary: false } },
		},
		required: {
			control: 'boolean',
			description: 'Verplichte staat.',
			table: { defaultValue: { summary: false } },
		},
		noSpellcheck: {
			name: 'no-spellcheck',
			control: 'boolean',
			description: 'Zet de spellingscontrole uit. Standaard aan, zonder code, URL\'s en mentions.',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
		accessibleLabel: {
			name: 'accessible-label',
			control: 'text',
			description: 'Toegankelijk label',
			table: { defaultValue: { summary: 'Tekst' } },
		},
	},
};

const Template = ({
	embedded,
	syntax,
	value,
	placeholder,
	rows,
	resize,
	wrap,
	invalid,
	readonly,
	required,
	noSpellcheck,
	disabled,
	accessibleLabel,
}: Record<string, any>) => html`
	<nldd-text-editor
		?embedded=${embedded}
		syntax=${syntax as string}
		.value=${value || ''}
		placeholder=${placeholder || nothing}
		rows=${rows as number}
		resize=${resize as string}
		?wrap=${wrap}
		?readonly=${readonly}
		?invalid=${invalid}
		?required=${required}
		?no-spellcheck=${noSpellcheck}
		?disabled=${disabled}
		accessible-label=${accessibleLabel || nothing}
	></nldd-text-editor>
`;

export const Standaard = {
	render: Template,
};

export const Embedded = {
	render: () => html`
		<nldd-text-editor
			embedded
			rows="10"
			.value=${SAMPLE}
			accessible-label="Tekst"
		></nldd-text-editor>
	`,
	parameters: {
		docs: {
			description: {
				story: 'Embedded heeft geen kader, vulling, padding of focusring. Bij focus toont een prominente accent-caret waar je staat. Bedoeld om in een eigen compositie te plaatsen die zelf de chrome en focusbehandeling levert, zoals de werkbalk-voorbeelden hieronder.',
			},
		},
	},
};

export const Links = {
	render: () => html`
		<nldd-text-editor
			rows="10"
			accessible-label="Tekst"
			.value=${[
				'Een markdown-link: [Mijn Dienst](https://www.example.nl).',
				'',
				'En een plat geplakte URL: https://www.example.nl/aanvragen — die krijgt dezelfde badge.',
				'',
				'Ook www.example.nl en info@example.nl worden herkend.',
			].join('\n')}
		></nldd-text-editor>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Elke link krijgt een "open in nieuw tabblad"-badge — niet alleen markdown-links (`[tekst](url)`), maar ook plat geplakte URL\'s (GFM-autolinks). Scheme-loze vormen krijgen er een: `www.…` → https, een e-mailadres → mailto. De badge is direct klikbaar zonder eerst de caret te plaatsen.',
			},
		},
	},
};

export const MetPlaceholder = {
	render: () => html`
		<nldd-text-editor
			rows="6"
			placeholder="Schrijf hier je toelichting in markdown…"
			accessible-label="Tekst"
		></nldd-text-editor>
	`,
	parameters: { controls: { disable: true } },
};

export const Vermeldingen = {
	render: () => {
		const users = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
			{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
			{ id: '5', text: 'Emma Bakker', supportingText: 'Beleid' },
		];
		const source = (query: string) =>
			users.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
		const sample = 'Bespreek dit met [@Anouk de Vries](user:1) en [@Bram Jansen](user:2).\n\nTyp `@` om iemand te noemen.';
		return html`
			<nldd-text-editor
				rows="8"
				accessible-label="Tekst"
				.value=${sample}
				.mentionSource=${source}
				@mention=${(event: CustomEvent) => action('mention')(event.detail)}
			></nldd-text-editor>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Typ `@` voor een typeahead. De editor kent zelf geen gebruikers: de consumer levert kandidaten via de `mentionSource`-property (aangeroepen met de tekst na `@`). Een keuze voegt een markdown-token `[@Naam](user:id)` in (als token gerenderd, degradeert tot een gewone link) en vuurt `mention` met id + range. Vindt de bron niemand, dan zegt de lijst dat ("Niets gevonden"): typ `@xyz`. Een eigen tekst geef je met `mentionEmptyText`.',
			},
		},
	},
};

export const VermeldingenInEenOverlay = {
	render: () => {
		const users = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
			{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
			{ id: '5', text: 'Emma Bakker', supportingText: 'Beleid' },
		];
		const source = (query: string) =>
			users.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
		const tags = [
			{ trigger: '#', source: (query: string) => ['beleid', 'begroting', 'besluit', 'bezwaar']
				.filter((tag) => tag.startsWith(query.toLowerCase()))
				.map((tag) => ({ id: tag, text: tag, symbol: '#' })) },
		];
		const open = (e: Record<string, any>) => e.currentTarget.nextElementSibling.show();
		return html`
			<nldd-button
				appearance="primary"
				text="Notitie toevoegen"
				@click=${open}
			></nldd-button>
			<!-- nldd-lint-disable-next-line modal-dialog-no-form -- Tests the typeahead in a modal, next to the sheet that an app should use. -->
			<nldd-modal-dialog accessible-label="Notitie">
				<nldd-text-editor
					rows="6"
					accessible-label="Notitie"
					.value=${'Typ `@` voor een naam of `#` voor een label.'}
					.mentionSource=${source}
					.typeaheads=${tags}
				></nldd-text-editor>
				<nldd-button
					slot="actions"
					appearance="primary"
					text="Bewaar"
				></nldd-button>
				<nldd-button
					slot="actions"
					appearance="neutral-tinted"
					text="Annuleer"
				></nldd-button>
			</nldd-modal-dialog>

			<nldd-button
				appearance="secondary"
				text="Notitie toevoegen in sheet"
				@click=${open}
			></nldd-button>
			<nldd-sheet accessible-label="Notitie in een sheet">
				<nldd-container padding="16">
					<nldd-text-editor
						rows="6"
						accessible-label="Notitie"
						.value=${'Ook hier: typ `@` of `#`.'}
						.mentionSource=${source}
						.typeaheads=${tags}
					></nldd-text-editor>
				</nldd-container>
			</nldd-sheet>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De typeahead in een overlay. Open de dialog of de sheet en typ `@` of `#`: de lijst hoort pal onder de cursor te staan, in z\'n volle hoogte, en niet ergens naast het scherm. CodeMirror hangt zijn lijst in de editor, dus gold alles eromheen ook voor de lijst: een overlay verbergt z\'n overflow en knipte hem af, en een voorouder met een transform werd het referentiekader voor een `fixed` popup, waardoor hij naast de pagina belandde. De lijst opent nu in de top layer, net als een nldd-menu. Test dit met het browservenster op de voorgrond: CodeMirror plaatst de popup in een `requestAnimationFrame`, en die staat stil in een achtergrondtab.',
			},
		},
	},
};

export const Typeaheads = {
	render: () => {
		const people = [
			{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid', avatar: {} },
			{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie', avatar: {} },
			{ id: '3', text: 'Chen Wei', supportingText: 'Data', avatar: {} },
			{ id: '4', text: 'Mijn Dienst', supportingText: 'Organisatie', avatar: { type: 'organization' as const } },
		];
		const channels = [
			{ id: 'algemeen', text: 'algemeen', supportingText: 'Het hele team', icon: 'tag' },
			{ id: 'dakisolatie', text: 'dakisolatie', supportingText: 'Het traject', icon: 'tag' },
			{ id: 'vragen', text: 'vragen', supportingText: 'Hulp en vragen', icon: 'tag' },
		];
		// The shortcode convention of Mattermost and Slack: `:smile:`, the closing
		// colon in the text. Without an `insert` a choice writes `:smile: `, which
		// those systems render themselves; this editor does not, so it writes the
		// emoji itself.
		const emoji = [
			{ id: 'smile', text: 'smile:', symbol: '😄' },
			{ id: 'thumbsup', text: 'thumbsup:', symbol: '👍' },
			{ id: 'tada', text: 'tada:', symbol: '🎉' },
			{ id: 'thinking', text: 'thinking:', symbol: '🤔' },
		];
		const filter = <T extends { text: string }>(items: T[]) => (query: string) =>
			items.filter((item) => item.text.toLowerCase().includes(query.toLowerCase()));
		const typeaheads = [
			{ trigger: '#', source: filter(channels), emptyText: (query: string) => (query ? `Geen kanaal met "${query}" in de naam` : undefined) },
			{ trigger: ':', source: filter(emoji), insert: (candidate: { symbol?: string }) => `${candidate.symbol} ` },
		];
		const sample = 'Typ `@` voor een persoon, `#` voor een kanaal en `:` voor een emoji.';
		const insertDate = (event: Event): void => {
			const editor = (event.currentTarget as Element).parentElement?.querySelector('nldd-text-editor') as unknown as { insertAtCursor(text: string): void } | null;
			editor?.insertAtCursor(new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }));
		};
		return html`
			<div class="demo-editor">
				<nldd-text-editor
					rows="8"
					accessible-label="Bericht"
					.value=${sample}
					.mentionSource=${filter(people)}
					.typeaheads=${typeaheads}
					@mention=${(event: CustomEvent) => action('mention')(event.detail)}
					@typeahead=${(event: CustomEvent) => action('typeahead')(event.detail)}
				></nldd-text-editor>
				<nldd-button
					appearance="secondary"
					text="Datum invoegen"
					@click=${insertDate}
				></nldd-button>
			</div>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Naast de ingebouwde `@`-mention geef je eigen lijsten op via de `typeaheads`-property: een trigger-teken, een `source` met kandidaten voor wat er na de trigger is getypt, en optioneel een `insert` die bepaalt wat een keuze schrijft. Standaard is dat de trigger, de `text` en een spatie: met `text: "smile:"` dus `:smile: `, de shortcode die Mattermost en Slack zelf renderen. Deze editor doet dat niet, dus hier schrijft `:` de emoji zelf. Meerdere lijsten op één trigger worden samengevoegd. Een kandidaat kan een `avatar` meekrijgen (persoon of organisatie, initialen of een afbeelding; de rij wordt dan tweeregelig met `supportingText` eronder), een `icon` (op de maat van een menu-item) of een `symbol` (een teken of emoji, de emoji zelf als beeld). Een keuze uit een eigen lijst vuurt `typeahead` met de trigger, de kandidaat en de positie. Vindt een lijst niets, dan zegt hij "Typ om te zoeken" of "Niets gevonden"; met `emptyText` geeft een lijst een eigen tekst, zoals het kanaal hier (typ `#xyz`). De knop laat `insertAtCursor(tekst)` zien: tekst op de caret, in plaats van een selectie.',
			},
		},
	},
};

export const Annotaties = {
	render: () => {
		const sample =
			'Mijn Dienst werkt aan een toegankelijk designsysteem. Componenten zijn herbruikbaar en consistent.\n\nFeedback is welkom op elk onderdeel.';
		const at = (needle: string) => {
			const start = sample.indexOf(needle);
			return { start, end: start + needle.length, quote: needle };
		};
		const annotations = [
			{ id: 'a1', ...at('toegankelijk designsysteem') },
			{ id: 'a2', ...at('herbruikbaar en consistent') },
			// Two annotations on the same text merge into one underline + a "2" badge.
			{ id: 'a3', ...at('Feedback') },
			{ id: 'a4', ...at('Feedback is welkom') },
		];
		return html`
			<nldd-text-editor
				rows="8"
				annotatable
				accessible-label="Tekst"
				.value=${sample}
				.annotations=${annotations}
			></nldd-text-editor>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Annotaties leven buiten de markdown (de tekst blijft schoon); de consumer levert ze via de `annotations`-property. Elke annotatie ankert op een teken-offset (met de geciteerde tekst voor her-ankeren) en rendert als een lichte tint met een telbadge aan het einde. Eén kleur voor alle annotaties: het type komt uit de pane van de consumer, niet uit de kleur. Annotaties op dezelfde tekst mergen tot één vlak met een gecombineerde telling.',
			},
		},
	},
};

export const AnnotatiesMaken = {
	render: () => {
		const wrap = document.createElement('div');
		wrap.style.display = 'grid';
		wrap.style.gap = '8px';

		const bar = document.createElement('div');
		bar.style.display = 'flex';
		bar.style.gap = '12px';
		bar.style.alignItems = 'center';

		// The "comment" affordance lives in the consumer's toolbar (not inside the
		// editor): it reads getSelection() and adds an annotation on the range.
		const commentBtn = document.createElement('nldd-icon-button');
		commentBtn.setAttribute('icon', 'comment');
		commentBtn.setAttribute('text', 'Reactie toevoegen');
		commentBtn.setAttribute('appearance', 'secondary');

		const status = document.createElement('span');

		const editor = document.createElement('nldd-text-editor');
		editor.setAttribute('rows', '6');
		editor.setAttribute('annotatable', '');
		editor.setAttribute('accessible-label', 'Tekst');
		(editor as unknown as { value: string }).value =
			'Selecteer een stuk tekst en klik op de reactie-knop om er een annotatie op te plaatsen. Klik daarna op de telbadge om de annotation-click te zien.';

		interface StoryAnnotation { id: string; start: number; end: number; quote: string }
		const annotations: StoryAnnotation[] = [];
		let counter = 0;
		const sync = () => {
			(editor as unknown as { annotations: StoryAnnotation[] }).annotations = [...annotations];
			status.textContent = `${annotations.length} annotatie(s)`;
		};
		sync();

		// The button stays enabled; a click without a selection says what is missing.
		commentBtn.addEventListener('click', () => {
			const sel = (editor as unknown as { getSelection(): StoryAnnotation & { empty: boolean } }).getSelection();
			if (sel.empty) {
				status.textContent = 'Selecteer eerst een stuk tekst';
				return;
			}
			counter += 1;
			annotations.push({ id: `note-${counter}`, start: sel.start, end: sel.end, quote: sel.quote });
			sync();
		});
		editor.addEventListener('annotation-click', (e) => {
			status.textContent = `Geklikt op: ${(e as CustomEvent<{ ids: string[] }>).detail.ids.join(', ')}`;
		});

		bar.append(commentBtn, status);
		wrap.append(bar, editor);
		return wrap;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'De volledige authoring-loop zoals een consumer (bijv. regelrecht) hem bouwt: een "reactie"-knop in de eigen toolbar leest `getSelection()` (clean offsets + quote) en voegt een annotatie toe. De knop blijft bruikbaar: zonder selectie zegt hij wat er ontbreekt, in plaats van uitgeschakeld te staan zonder reden. Een klik op de telbadge vuurt `annotation-click` met de id(s). Annotaties bewegen mee met edits; `getAnnotations()` geeft de mee-geschoven posities terug om op te slaan.',
			},
		},
	},
};

const MIXED_USERS = [
	{ id: '1', text: 'Anouk de Vries', supportingText: 'Beleid' },
	{ id: '2', text: 'Bram Jansen', supportingText: 'Communicatie' },
	{ id: '3', text: 'Chen Wei', supportingText: 'Data' },
	{ id: '4', text: 'Dewi Pratama', supportingText: 'Juridisch' },
];
const mixedSource = (query: string) =>
	MIXED_USERS.filter((user) => user.text.toLowerCase().includes(query.toLowerCase()));
const MIXED_SAMPLE = [
	'# Projectupdate toegankelijkheid',
	'',
	'We verbeteren het **burgerportaal** met [@Anouk de Vries](user:1). De `WCAG 2.2`-criteria zijn leidend, zie de [WCAG-richtlijn](https://www.w3.org/TR/WCAG22/).',
	'',
	'## Actiepunten',
	'',
	'- Contrast op de knoppen verhogen',
	'- Focus-states nalopen met [@Bram Jansen](user:2)',
	'- Screenreader-tests inplannen voor de livegang',
	'',
	'> Let op: de deadline is volgende week vrijdag.',
	'',
	'Voer de toegankelijkheidscheck uit met:',
	'',
	'```bash',
	'npm run test:a11y',
	'```',
	'',
	'Noem iemand met `@` of selecteer tekst voor een annotatie.',
].join('\n');

export const Gemengd = {
	render: () => {
		const sample = MIXED_SAMPLE;
		const source = mixedSource;
		const at = (needle: string) => {
			const start = sample.indexOf(needle);
			return { start, end: start + needle.length, quote: needle };
		};
		const annotations = [
			{ id: 'm1', ...at('leidend') },
			{ id: 'm2', ...at('Contrast op de knoppen verhogen') },
			{ id: 'm3', ...at('deadline is volgende week vrijdag') },
			// Overlapping pair → one block with a "2" badge.
			{ id: 'm4', ...at('Screenreader-tests') },
			{ id: 'm5', ...at('Screenreader-tests inplannen voor de livegang') },
		];
		return html`
			<nldd-text-editor
				rows="15"
				annotatable
				accessible-label="Tekst"
				.value=${sample}
				.mentionSource=${source}
				.annotations=${annotations}
				@mention=${(event: CustomEvent) => action('mention')(event.detail)}
			>${formatToolbar({ slot: 'toolbar' })}</nldd-text-editor>
		`;
	},
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Alles samen: een werkbalk in het `toolbar`-slot boven een editor met annotaties en @-mentions, door verschillende soorten content heen (koppen, vet, inline code, een lijst, een blockquote en links). De annotatie-overlay en de mention-tokens bestaan naast elkaar zonder elkaar in de weg te zitten; de tekst blijft schone markdown.',
			},
		},
	},
};

export const MetWerkbalk = {
	render: () => html`
		<nldd-text-editor rows="10" .value=${SAMPLE} accessible-label="Tekst">
			${formatToolbar({ slot: 'toolbar' })}
		</nldd-text-editor>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een `nldd-toolbar` in het `toolbar`-slot staat binnen de rand van de editor. Elk control met `text-editor-command` is gekoppeld: de editor voert het commando uit, zet de focus terug in de tekst en houdt `selected` en `disabled` bij, ook in het overloopmenu. Een argument staat na een dubbele punt (`setHeading:2`), en op een `nldd-segmented-control` met `text-editor-command="setList"` is de waarde van het gekozen item het argument. Groeit de editor mee met zijn tekst, dan blijft de werkbalk bovenaan plakken. Er is geen koppelcode: wat hier staat is alle markup.',
			},
		},
	},
};

export const EmbeddedMetWerkbalk = {
	render: () => html`
		<nldd-text-editor embedded rows="10" .value=${SAMPLE} accessible-label="Tekst">
			${formatToolbar({ slot: 'toolbar' })}
		</nldd-text-editor>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Met `embedded` valt het kader weg en zorgt de compositie eromheen voor de randen. De werkbalk staat gelijk met de tekst, met 8px tot de scheidingslijn.',
			},
		},
	},
};

export const WerkbalkElders = {
	render: () => html`
		${formatToolbar({ editorId: 'notities' })}
		<nldd-spacer size="16"></nldd-spacer>
		<nldd-form-field label="Notities">
			<nldd-text-editor id="notities" rows="8" .value=${SAMPLE}></nldd-text-editor>
		</nldd-form-field>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Een werkbalk die niet bij de editor staat, zoals in een balk van de pagina of een sheet, wijst met `text-editor-for` naar het id van de editor. Dat mag op elk element: de controls erin met `text-editor-command` sturen die editor. In een `nldd-form-field` kan de werkbalk ook binnen het veld staan: het veld slaat een `nldd-toolbar` over en koppelt zijn label aan de editor.',
			},
		},
	},
};

const HIDDEN_SYNTAX_SAMPLE = [
	'# Projectupdate toegankelijkheid',
	'',
	'We verbeteren het **burgerportaal** met [@Anouk de Vries](user:1). De `WCAG 2.2`-criteria zijn *leidend*, zie de [WCAG-richtlijn](https://www.w3.org/TR/WCAG22/), en wat ~~niet meer~~ geldt halen we weg.',
	'',
	'## Actiepunten',
	'',
	'- **Contrast** op de knoppen verhogen',
	'- Focus-states nalopen met [@Bram Jansen](user:2)',
	'- Screenreader-tests *inplannen* voor de livegang',
	'',
	'- [x] Toetsenbordroute vastleggen',
	'- [ ] Resultaten delen met het team',
	'',
	'> Let op: de deadline is volgende week vrijdag.',
	'',
	'---',
	'',
	'### Planning',
	'',
	'Voer de check uit met `npm run test:a11y` en meld het **resultaat** aan *team Uitvoering*:',
	'',
	'```bash',
	'npm ci',
	'npm run test:a11y',
	'```',
].join('\n');

export const ZichtbareOpmaak = {
	render: () => html`
		<nldd-text-editor
			syntax="visible"
			rows="15"
			accessible-label="Tekst"
			.value=${HIDDEN_SYNTAX_SAMPLE}
			.mentionSource=${mixedSource}
		>${formatToolbar({ slot: 'toolbar' })}</nldd-text-editor>
	`,
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: 'Standaard zijn de tekens van vet, cursief, doorhalen, inline code, links en de `#` van koppen verborgen, is een opsommingsteken een bolletje, een citaat een lijn links, is `---` een scheidingslijn en verliest een codeblok zijn ```-regels. Waar de cursor of selectie een constructie raakt, komen de tekens terug. Met `syntax="visible"` blijven alle tekens gedimd staan, zoals hier: voor wie markdown schrijft. De waarde is in beide gevallen gewone markdown.',
			},
		},
	},
};
