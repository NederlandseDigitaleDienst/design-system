---
name: component
description: Implementeer een Lit + TypeScript web component
user-invocable: true
argument-hint: <component-naam>
---

Implementeer een web component: $ARGUMENTS

## Tech Stack

| Aspect | Technologie |
|--------|-------------|
| **Framework** | [Lit](https://lit.dev/) (LitElement) |
| **Taal** | TypeScript (`.ts`) |
| **Prefix** | `nldd-` |

## WORKFLOW

### Stap 1: Bepaal component naam

1. Als gebruiker naam opgaf → gebruik die
2. Converteer naar kebab-case: "Toggle Button" → "toggle-button"
3. Bestandsnamen gebruiken de kale naam: `toggle-button.ts` (geen prefix)
4. Custom element tag krijgt `nldd-` prefix: `nldd-toggle-button`
5. Class naam: `NLDDToggleButton`

### Stap 2: Bestaand component check

Zoek in `src/components/` of het component al bestaat.

| Situatie | Mode |
|----------|------|
| Component bestaat niet | **CREATE** — nieuwe bestanden aanmaken |
| Component bestaat al | **UPDATE** — bestaande bestanden bijwerken |

### Stap 3: CSS variabelen identificeren

**Voorkeursvolgorde:**
1. `--components-{name}-*` (component-specifiek)
2. `--semantics-*` (betekenisvol)
3. `--primitives-*` (alleen als backup)

**Naamconventies:**

- **Primitives:** `--primitives-{property}-{variant}-{scale}`
  bijv. `--primitives-color-accent-750`
- **Semantics:** `--semantics-{group}-{variant}-{state}-{element}-{element-variant}-{element-state}-{property}`
  bijv. `--semantics-buttons-neutral-tinted-is-hovered-background-color`
- **Components:** `--components-{component}-{variant}-{state}-{element}-{element-variant}-{element-state}-{property}`
  bijv. `--components-checkbox-md-check-icon-size`
- **Context:** `--context-{context}-{property}`
  Gedeelde variabelen voor communicatie tussen componenten. Niet gedefinieerd in variables.css.
  bijv. `--context-parent-background-color`
- **Lokaal:** `--_{variant}-{state}-{element}-{element-variant}-{element-state}-{property}`
  Interne variabelen binnen een component. Definieer defaults in `:host`.
  bijv. `--_background-color`
  Het `{element}`-segment is de **volledige BEM-elementnaam**, niet afgekort: `--_disclosure-icon-margin-right`, niet `--_disclosure-margin-right`. Laat het element-segment weg voor het root-block (`--_background-color`). Gebruik één generieke naam als de var door meerdere elementen gedeeld wordt (bijv. `--_icon-size` voor `__start-icon` én `__end-icon`).

Primitives zijn basiswaarden — gebruik ze niet direct in componenten. Semantics geven context voor een groep componenten. Component variabelen zijn specifiek voor één component.

Zoek in `src/assets/styles/variables.css`:
```bash
grep -i "{component-naam}" src/assets/styles/variables.css
grep -i "controls.*min-size\|controls.*corner-radius" src/assets/styles/variables.css
grep -i "focus-ring" src/assets/styles/variables.css
```

### Stap 4: Bestanden aanmaken

```
src/components/{categorie}/{naam}/
  {naam}.ts           # Component class
  {naam}.styles.ts    # Styles
  {naam}.template.ts  # Render template
  {naam}.i18n.ts      # Vertalingen (optioneel, bij gebruikersgerichte tekst)
  {naam}.stories.ts   # Storybook stories
  {naam}.test.ts      # Tests
```

### Stap 5: Registreer het component

Zet een regel in `src/components/index.ts` en draai `npm run build:exports`.
Die genereert de `exports`-map in `package.json` uit dat bestand.

Sla je dit over, dan bouwt alles, slagen alle tests en staat het component
netjes in `dist`, maar heeft `package.json` er geen subpad voor. Een consument
die per component importeert, en dat doen ze, krijgt dan geen foutmelding maar
een tag die nooit upgradet: het element staat in de DOM, z'n properties zijn
`undefined` en er gebeurt niets.

---

## COMPONENT TEMPLATE

**`{naam}.ts`:**

```typescript
/**
 * Nederlandse Digitale Dienst {DisplayName} Component (Lit + TypeScript)
 *
 * @element nldd-{naam}
 * @attr {string} size - Component size: 'xs' | 'sm' | 'md' (standaard: 'md')
 * @attr {boolean} disabled - Uitgeschakelde staat
 *
 * @slot - Default slot voor content
 *
 * @fires {event-naam} - Beschrijving (detail: { ... })
 */

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './{naam}.styles.ts';
import { template } from './{naam}.template.ts';

type Size = 'xs' | 'sm' | 'md';

@customElement('nldd-{naam}')
export class NLDD{PascalName} extends LitElement {
	static override styles = styles;

	@property({ type: String, reflect: true })
	size: Size = 'md';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	override render() {
		return template(this);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'nldd-{naam}': NLDD{PascalName};
	}
}
```

**JSDoc-opmaak:**

- Proza (de beschrijving bovenaan) wrapt op ~80 tekens.
- Een tagregel (`@attr`, `@prop`, `@fires`, `@slot`, `@method`) blijft op één
  regel, hoe lang die ook wordt. Dat leest slechter in de bron, maar wel goed in
  de gegenereerde tabel — en geen enkele generator hoeft vervolgregels te
  begrijpen.
- Moet er toch gebroken worden, spring dan één niveau in. Niet uitlijnen op de
  kolom van de beschrijving: dan houd je nog maar een handvol tekens per regel
  over en lijkt de tekst afgekapt.
- Eén spatie tussen `@attr`, het type, de naam en het streepje. Niet uitlijnen in
  kolommen: dan dwingt één langere attribuutnaam je het hele blok opnieuw te
  padden, wat een diff vol witruimte oplevert zonder dat de gegenereerde docs
  veranderen.


**`{naam}.styles.ts`:**

```typescript
import { css } from 'lit';
import { unsafeCSS } from 'lit';
import { breakpoints } from '../../../assets/styles/breakpoints.ts';

const smMax = unsafeCSS(breakpoints.smMax);
const mdMin = unsafeCSS(breakpoints.mdMin);
const mdMax = unsafeCSS(breakpoints.mdMax);
const lgMin = unsafeCSS(breakpoints.lgMin);

export const styles = css`


	/* # Host */

	:host {
		display: inline-block;
	}

	:host([hidden]) {
		display: none;
	}

	:host([disabled]) {
		opacity: var(--primitives-opacity-disabled);
		pointer-events: none;
	}


	/* # Element */

	.{naam} {
		appearance: none;
		border: none;
		margin: 0;
		padding: 0;
		background: none;
		font: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		container-name: layout-container;
		container-type: inline-size;
	}

	:host([size="md"]) .{naam},
	:host(:not([size])) .{naam} {
		min-height: var(--semantics-controls-md-min-size);
		border-radius: var(--semantics-controls-md-corner-radius);
	}


	/* ## Responsive — container queries (binnen layout-container) */

	.{naam}__content {
		@container layout-container (max-width: ${smMax}) {
			/* sm: compact weergave */
		}

		@container layout-container (min-width: ${mdMin}) and (max-width: ${mdMax}) {
			/* md */
		}

		@container layout-container (min-width: ${lgMin}) {
			/* lg */
		}
	}


	/* # Focus */

	.{naam}:focus-visible {
		outline: none;
	}

	.{naam}__indicator {
		position: absolute;
		inset: var(--primitives-space-4);
		border-radius: calc(var(--semantics-controls-md-corner-radius) - var(--primitives-space-4) / 2);
		background-color: transparent;
		pointer-events: none;
	}

	.{naam}:focus-visible .{naam}__indicator {
		box-shadow: var(--semantics-focus-ring-box-shadow);
		outline: var(--semantics-focus-ring-outline);
	}


	/* # Toegankelijkheid */

	@media (forced-colors: active) {
		.{naam}:focus-visible .{naam}__indicator {
			outline: 2px solid CanvasText;
		}
	}
`;
```

**`{naam}.template.ts`:**

```typescript
import { html, TemplateResult } from 'lit';
import type { NLDD{PascalName} } from './{naam}.ts';

export function template(component: NLDD{PascalName}): TemplateResult {
	return html`
		<button class="{naam}"
			type="button"
			?disabled=${component.disabled}
		>
			<span class="{naam}__indicator"></span>
			<slot></slot>
		</button>
	`;
}
```

---

## INVOERCOMPONENTEN: `isFormInput`

Bouw je iets dat in een `nldd-form-field` gaat staan, zet dan op de klasse:

```typescript
/** Says this is the control an nldd-form-field is about, so the field can
 *  find it, name it and move focus into it. See nldd-form-field. */
static isFormInput = true;
```

Daarmee weet `nldd-form-field` welk element het veld is. Het zoekt in de light DOM naar het eerste kind dat dit zegt, ook door een `div` of een `nldd-container` heen, en koppelt daar de id, de toegankelijke naam en de foutmelding aan. Zonder de markering vindt het niets, gebeurt er niets, en waarschuwt het in DEV.

Het staat er expliciet en wordt niet afgeleid. De helft van het pakket kent `accessible-label`, dus daarop afgaan zou een `nldd-tag` naast je veld voor het veld aanzien.

Twee dingen die erbij horen:

- **Een eigen `focus()`**, die de focus doorgeeft aan de control eronder. Een klik op het label roept dat aan, en zonder gebeurt er niets. Geef een groep de gekozen optie, en anders de eerste die aan staat.
- **Een `accessible-label`**, die je doorgeeft aan het element dat de naam nodig heeft. Form-field overhandigt het bijschrift daar. Draagt je component al een eigen zichtbaar label dat de control benoemt, zoals `nldd-checkbox-field`, sla dit dan over: het bijschrift is dan niet zijn naam.

Zet het component ook in de tabellen in `form-field.test.ts`, die alle invoercomponenten langslopen van labelklik tot focus en van bijschrift tot toegankelijke naam.

## STORY TEMPLATE

**`{naam}.stories.ts`:**

### Controls conventies

- **`args` staat altijd vóór `argTypes`** in de default export
- **Args keys:** altijd camelCase (bijv. `startIcon`, `fullWidth`)
- **`name:`** het HTML attribuut in kebab-case (bijv. `name: 'start-icon'`, `name: 'full-width'`)
- **`table.defaultValue.summary:`** invullen zodra er een default is die iets zegt: `md`, `false`, `content`, of de vertaling waar het component op terugvalt (`Kruimelpad`, `Meer opties`, `Tabs`). Die laatste is de belangrijkste, want de kolom beantwoordt de vraag "wat krijg ik als ik dit niet zet". Bij een toegankelijke naam is het antwoord daarop geen detail.

  **Is de default leeg, laat de regel dan weg.** Storybook toont dan een streepje, en dat is precies wat je bedoelt. Schrijf er geen `summary: ''`, want `""` en `-` zijn dan twee manieren om hetzelfde te zeggen. Bij een select met een `(geen)`-optie zet je `(geen)` in de kolom, zodat de kolom de optie noemt die je kiest om terug te gaan.
- **`description:`** korte Nederlandse beschrijving
- **Icon controls:** gebruik `control: 'select'` met `options: ['(geen)', ...ICONS]` plus `mapping: { '(geen)': '' }` — importeer `ICONS` uit `../../content/icon/icon.ts`. Nooit een text input voor iconen.
- **Alias-naam heeft voorkeur:** kies bij het *gebruiken* van een icoon (`icon=`, `start-icon=`, in stories én consumers) de **alias-naam** boven de canonieke naam als er een alias bestaat — bijv. `harvest` i.p.v. `wheat`, `info` i.p.v. `info-circle`, `new-account` i.p.v. `person-circle-badge-plus`. Aliassen zijn betekenisvoller en stabieler; ze staan in `src/components/content/icon/icon-aliases.js`.
- **Optionele select-controls:** Storybook toont anders een leeg item of letterlijk "undefined" in de dropdown. Gebruik een label tussen haakjes (zie de volgende bullet voor welk woord) en `mapping` om dat naar de echte waarde te vertalen. Plaats dat label als eerste element in `options`. In `args` staat de **actual value** (`''` of `undefined`) — Storybook reverse-lookt via `mapping` welke label de huidige waarde representeert en toont die als geselecteerd in de UI. De render-functie ontvangt eveneens de actual value. Let op: bij opties met numerieke waarden (`1, 2, ...`) plaatst JS de integer-index keys altijd eerst in `Object.keys`, waardoor `'(geen)'` visueel onderaan de dropdown belandt; de selected-state werkt wel correct, dus accepteer dat als trade-off.
  ```ts
  // String prop met '' als "geen waarde"
  args: { variant: '' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['(geen)', 'icon-and-text', 'text', 'icon'],
      mapping: { '(geen)': '' },
      table: { defaultValue: { summary: '(geen)' } },
    },
  },

  // Number prop met undefined als "geen waarde"
  args: { headingLevel: undefined },
  argTypes: {
    headingLevel: {
      control: 'select',
      options: ['(geen)', 1, 2, 3, 4, 5, 6],
      mapping: { '(geen)': undefined },
      table: { defaultValue: { summary: '(geen)' } },
    },
  },
  ```
- **Drie labels voor "niet gezet", en ze betekenen niet hetzelfde.** Kies op wat er gebeurt als de consument niets zet, niet op wat lekker leest:
  1. **`(geen)`**: het ding is er dan niet. Geen icoon, geen variant, geen ondersteunende tekst. Verreweg het meest voorkomend.
  2. **`(auto)`**: het component vult het zelf in. Z'n eigen kleur of gap, het icoon dat bij de variant hoort, een uitlijning die het afleidt uit de slot.
  3. **`(inherit)`**: de omgeving bepaalt het. Alleen waar de waarde echt van buiten komt, zoals de grootte en kleur van `nldd-icon` die de `font-size` en `currentColor` eromheen volgen.

  Kijk naar wat het component doet, niet naar hoe het attribuut heet. `gap` is in twee componenten hetzelfde woord met een ander label:

  - **`nldd-container`** staat op `(geen)`. Leeg laten geeft daar echt `--_gap: 0`, dus het valt samen met de `0` die als optie in dezelfde dropdown staat.
  - **`nldd-collection`** staat op `(auto)`. Leeg laten geeft daar 16px op sm en 24px daarboven, en dat is iets heel anders dan een gap van 0.

  Verzin geen vierde woord: `(default)`, `(standaard)` en `(afgeleid)` hebben allemaal bestaan en zijn allemaal teruggebracht naar deze drie.

  **Staat het woord al als echte waarde in dezelfde dropdown, dan is het label bezet.** Dat is de `0` bij `nldd-container` hierboven, en het gebeurt ook zonder dat de woorden gelijk zijn: `(auto)` naast een echte `inherit` leest als twee manieren om te zeggen "haal het ergens anders vandaan", ook al betekenen ze iets anders. Kies dan geen ander label maar geef de default een naam, dan staan er twee echte waardes en heb je er helemaal geen nodig. Zo werd `color` op `nldd-title` en `nldd-rich-text` `content` naast `inherit`.
- **Volgorde consistent**: `args`, `argTypes`, template-destructuring en HTML-attributen in de template gebruiken dezelfde volgorde, volgens de canon hieronder.
- **Twee dingen laten een control naar het eind van de tabel springen.** De docs-tabel volgt de volgorde van `argTypes`, en Storybook bouwt een key opnieuw op (en zet hem dus achteraan) zodra je hem naderhand aanraakt:
  1. Een key die je in `Default.args` opnieuw zet. Zet een default die je in `Default` wilt tonen daarom in de bovenste `args`, en laat `Default` alleen `render` houden.
  2. Een `type`-override in een argType, zoals `type: { name: 'string' }`. Wil je een tekstveld voor een numerieke prop (leeg mogen laten), dan is `control: { type: 'text' }` genoeg; documenteer het echte type met `table: { type: { summary: 'number' } }`.

### Canonieke volgorde in de rest van het component

Dezelfde canon geldt buiten de stories, zodat je een component in elk bestand in dezelfde volgorde leest:

- het `@attr`-blok in de JSDoc van `{naam}.ts`;
- de `@property`-declaraties in de class, in dezelfde volgorde als dat blok;
- de attributen op het element in `{naam}.template.ts`.

`@element`, `@slot`, `@fires` en `@method` staan buiten de canon: die houden hun eigen blok, ná de attributen.

### Volgorde van de stories

`Default` staat bovenaan. Daarna één story per as, in de volgorde van de canon, en helemaal onderaan de voorbeelden die het component in een situatie laten zien (een badge op een icoon, een veld in een formulier). Zo loopt de zijbalk gelijk met de controltabel: eerst wat het ding is, dan wat het toont, dan waar het staat.

### Canonieke control volgorde

Per component: pak alleen de keys die je gebruikt en zet ze in deze volgorde. De groepering is een mentaal model — de daadwerkelijke `args`/`argTypes` is een platte lijst.

**Sorteer op wat een key doet, niet op hoe hij heet.** De groepen zijn het model, de namenlijsten eronder zijn voorbeelden. Twee componenten kunnen dezelfde naam voor iets anders gebruiken, en dan wint de betekenis. `max` is daar het schoolvoorbeeld van, en staat op drie plekken:

1. **Bij Form** als het een invoergrens is, naast `min` en `step` (`nldd-time-field`).
2. **Direct achter de prop die hij begrenst** als hij alleen de weergave daarvan aftopt. De `max` van `nldd-badge` maakt van een te hoog `number` een "max+" en betekent niets zonder `number`.
3. **Vooraan, bij groep 1**, als hij bepaalt hóéveel er verschijnt. De `max` van `nldd-avatar-group` laat avatars weg en zet er een `+N`-knop voor in de plaats: je ziet iets anders staan, en dat is een visueel dominante keuze, geen detail.

```
[1. Visueel dominant]
variant, status, size, compact, minor, color, background, pulse, layout,
panes, iconOnly, responsive, showItemLabels, inspectorAsSheet,
sidebarAsSheet, noLogo

[2. Sizing]
resize, rows, width, minWidth, maxWidth, height, minHeight, fullWidth,
itemWidth, containerSize

[3. Space]
spacing, padding, paddingInline, paddingBlock, paddingTop, paddingRight,
paddingBottom, paddingLeft
+ smPadding…, mdPadding…, lgPadding…, layoutAreaXxxxPadding…

[4. Alignment and position]
horizontalAlignment, verticalAlignment, direction, orientation, placement,
labelAlignment, top, right, bottom, left, position

[5. Main content]
text, supportingText, overline, label, supportingLabel, optional,
placeholder, number, headingLevel,
icon, startIcon, endIcon, containerColor,
quote, attribution, cite, keys,
logoTitle, logoSubtitle, logoSupportingText1, logoSupportingText2, logoHref,
websiteTitle, websiteHref, backText, backHref, dismissText

[6. Key behavior]
control, expandable

[7. A11y]
accessibleLabel

[8. Elements]
showSearchButton, hideSpinButtons, hasDragHandle, maxItems

[9. Elements content]
showText, hideText, overflowText

[10. Elements A11y]
showAccessibleLabel, hideAccessibleLabel

[11. Behavior]
modeless, movable, stickyHeader, stickyFooter, hasContent, alwaysVisible,
showLoadMore, lazyLoad, collapseAnchor, contentPriority

[12. States]
selected, checked, indeterminate, open, valid, invalid, masked, readonly, current, disabled

[13. Form]
name, value, type, min, max, step, required, total,
autocomplete, noSpellcheck, href, target, method, action, novalidate
```

**Open punt**: `type` staat onder Form (HTML input type, vaakste betekenis). Voor `segmented-control` heeft het een andere semantiek (radio/checkbox-modus); kan later via een rename naar bijv. `selectionMode` opgelost worden.

```typescript
import { html, nothing } from 'lit';
import './{naam}.ts';
import { ICONS } from '../../content/icon/icon.ts';

export default {
	title: 'Components/{Categorie}/{DisplayName}',
	component: 'nldd-{naam}',
	tags: ['autodocs'],
	parameters: {
		componentSource: {
			file: 'src/components/{categorie}/{naam}/{naam}.ts',
			repository: 'https://github.com/NederlandseDigitaleDienst/design-system',
		},
		status: { type: 'stable' },
	},
	args: {
		size: 'md',
		startIcon: '',
		fullWidth: false,
		disabled: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Componentmaat',
			table: { defaultValue: { summary: 'md' } },
		},
		startIcon: {
			name: 'start-icon',
			control: 'select',
			options: ['(geen)', ...ICONS],
			mapping: { '(geen)': '' },
			description: 'Icoon voor de tekst',
			table: { defaultValue: { summary: '(geen)' } },
		},
		fullWidth: {
			name: 'full-width',
			control: 'boolean',
			description: 'Full width',
			table: { defaultValue: { summary: false } },
		},
		disabled: {
			control: 'boolean',
			description: 'Uitgeschakelde staat',
			table: { defaultValue: { summary: false } },
		},
	},
};

const Template = ({
	size,
	startIcon,
	fullWidth,
	disabled,
}: Record<string, unknown>) => html`
	<nldd-{naam}
		size=${size || nothing}
		start-icon=${startIcon || nothing}
		?full-width=${fullWidth}
		?disabled=${disabled}
	>Label</nldd-{naam}>
`;

export const Default = Template.bind({});
```

---

## TEST TEMPLATE

**`{naam}.test.ts`:**

```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { fixture, cleanup, waitForUpdate } from '../../../test-utils.ts';
import './{naam}.ts';

describe('nldd-{naam}', () => {
	let el: HTMLElement;

	afterEach(() => {
		if (el) cleanup(el);
	});

	it('rendert zonder fouten', async () => {
		el = await fixture('<nldd-{naam}></nldd-{naam}>');
		await waitForUpdate(el);
		expect(el.shadowRoot).not.toBeNull();
	});
});
```

---

## i18n

Zie `/translation-keys` skill voor alle conventies rond translation keys, types en implementatie.

---

## SPACER COMPONENT

Gebruik `<nldd-spacer>` voor ruimte tussen verschillende soorten componenten die elkaar direct opvolgen:

```html
<!-- Vaste spacing op alle breakpoints -->
<nldd-spacer size="32"></nldd-spacer>

<!-- Per breakpoint anders -->
<nldd-spacer sm-size="16" md-size="24" lg-size="32"></nldd-spacer>

<!-- Vult beschikbare ruimte op -->
<nldd-spacer size="flexible"></nldd-spacer>
```

**Beschikbare sizes:** 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96, flexible

**Per-viewport overrides:** `sm-size` (max 640px), `md-size` (641–1007px), `lg-size` (min 1008px). Niet expliciet gezet → val terug op `size`.

---

## FORMATTING

Er is geen automatische formatter. Volg deze regels handmatig.

### Algemeen
- Gebruik **tabs** voor indentatie
- Enkele aanhalingstekens voor strings
- Puntkomma's aan einde van statements
- Trailing comma's in objecten en arrays

### HTML
- Gebruik HTML, niet XHTML: `>` niet `/>` voor void elements:
```html
<!-- GOED -->
<input class="checkbox__input" type="checkbox">

<!-- FOUT -->
<input class="checkbox__input" type="checkbox" />
```

### CSS (`.styles.ts`)
- Property waarden altijd op **één regel**, ook als ze lang zijn
- Sorteer rules per element; houd alle gedrag voor een element bij elkaar
- **Property-volgorde binnen een rule: Concentric CSS** ([bron](https://rhodesmill.org/brandon/2011/concentric-css/)) — van buiten de box naar binnen. Ná de `--_*` vars (die staan bovenin `:host`):
  1. `box-sizing`, `display`, `position`, `inset` / `top` / `right` / `bottom` / `left`, `float`, `clear`
  2. `visibility`, `opacity`, `z-index`
  3. `margin`
  4. `outline`, `outline-offset`, `border`, `border-radius`, `box-shadow`
  5. `background`, `background-*`
  6. `cursor`, `pointer-events`
  7. `width` / `min-width` / `max-width`, `height` / `min-height` / `max-height`, `overflow`
  8. `padding`
  9. layout van kinderen: `flex-*`, `grid-*`, `gap`, `align-*`, `justify-*`, `place-*`, `order`, `vertical-align`, `text-align`
  10. inhoud: `color`, `font` / `font-*`, `line-height`, `letter-spacing`, `text-decoration`, `text-overflow`, `white-space`, `content`
  11. gedrag/effect: `transition`, `transform`, `animation`, `appearance`, `isolation`, `-webkit-tap-highlight-color`
  Pseudo-elementen: `content: ''` mag bovenaan (vóór 1). Responsive breakpoint-`@container`/`@media` blijven genest, ná de properties van die rule.
- **CSS nesting** voor *responsive* breakpoint-overrides (`@container` en `@media` met sm/md/lg) — genest in de element/`:host` rule. **State/toegankelijkheid-`@media`** (`forced-colors`, `prefers-reduced-motion`, `hover`) **niet nesten** — als los blok direct ná de element-rule die het wijzigt; géén aparte sectie ervoor
- Declareer **alle** lokale CSS variabelen (`--_*`) **bovenin `:host`**, gevolgd door een lege regel die ze scheidt van de overige properties. Inclusief responsive overrides via `@container` nesting. Elementen gebruiken alleen `var(--_foo)`, nooit fallbacks: niet `var(--_foo, 100)`
- **Naam van een `--_*` var: `{element}-{property}`** — het element eerst, de CSS-property achteraan (`--_marker-size`, `--_control-hover-background-color`, `--_marker-z-index`). Niet andersom: `--_z-index-marker` leest als een familie z-indexen terwijl het een eigenschap van de marker is.
- **Volgorde van de `--_*` vars: in volgorde van eerste gebruik** in de stylesheet (de rules staan zelf in Concentric volgorde, dus dit volgt daaruit). Niet concentric- of alfabetisch sorteren. Pas dezelfde canonieke volgorde toe in élk override-blok (`:host([size=…])`, `:host([variant=…])`, `:host([expanded]…)`): elk blok somt z'n subset in die volgorde op. Herordenen is risicoloos — declaratievolgorde heeft geen cascade-effect
- Gebruik **nooit** flex shorthand (`flex: 1`), schrijf de losse properties
- Level 1 headings (`/* # Section */`): 2 lege regels ervoor, 1 erna
- Level 2 headings (`/* ## Subsection */`): 1 lege regel ervoor en erna

```css
/* GOED — CSS nesting */
.button {
	display: inline-flex;
	min-height: var(--_min-height);

	@container (min-width: 641px) {
		padding: var(--_md-padding);
	}
}

/* FOUT — niet nesten */
.button { display: inline-flex; }
@container (min-width: 641px) {
	.button { padding: var(--_md-padding); }
}
```

```css
/* GOED — vars bovenin :host, lege regel, dan de rest */
:host {
	--_min-height: var(--semantics-controls-md-min-size);
	--_logo-width: var(--primitives-space-40);

	@container layout-container (min-width: 641px) {
		--_logo-width: var(--primitives-space-44);
	}

	display: inline-flex;
	min-height: var(--_min-height);
}
.logo {
	width: var(--_logo-width);
	height: calc(var(--_logo-width) * 2);
}

/* FOUT — vars vermengd met properties zonder scheidingsregel */
:host {
	display: inline-flex;
	--_min-height: var(--semantics-controls-md-min-size);
	min-height: var(--_min-height);
}

/* FOUT — lokale var op element ipv :host */
.logo {
	--_logo-width: var(--primitives-space-40);
}

/* FOUT — fallback in var() */
.button {
	min-height: var(--_min-height, 44px);
}
```

### Templates (`.template.ts`)
- Elk attribuut op een **eigen regel**, met twee uitzonderingen:
  - `class` staat altijd op **dezelfde regel** als het element
  - Een element met **één enkel attribuut** mag op één regel
- **Nooit een class op een child component** — wrap het in een container die positie en size bepaalt; het child vult die container (bijv. `--_size: 100%`)
- Geen lege regels in templates
- **Element-content op een eigen ingesprongen regel** — ook een enkele `${...}`-interpolatie; de open- en sluittag staan dan op hun eigen regel. Zo blijven regels kort en tonen diffs alleen de gewijzigde inhoud, niet de hele tag-regel. Geldt voor losstaande elementen in de template-body. Een kort inline `html`-fragment binnen een expressie of ternary mag op één regel blijven (zie het voorbeeld hieronder); dat opsplitsen levert juist lelijke fragmenten op.

```html
<!-- GOED — class + meerdere attributen -->
<input class="checkbox__input"
	type="checkbox"
	.checked=${component.checked}
	?disabled=${component.disabled}
	@change=${component._handleChange}
>

<!-- GOED — class + één attribuut: attribuut op eigen regel -->
<div class="checkbox__box"
	aria-hidden="true"
>

<!-- GOED — één attribuut zonder class: op één regel -->
<slot name="header"></slot>

<!-- GOED — child component in wrapper -->
<span class="checkbox__icon">
	<nldd-icon name="check-mark-small"></nldd-icon>
</span>

<!-- GOED — element-content op een eigen regel -->
<p class="dialog__supporting-text">
	${component.supportingText}
</p>

<!-- GOED — kort inline html-fragment in een ternary: mag op één regel -->
${component.hasBadge ? html`<span class="dialog__badge">${component.badge}</span>` : nothing}

<!-- FOUT — content inline op de tag-regel -->
<p class="dialog__supporting-text">${component.supportingText}</p>

<!-- FOUT — class op child component -->
<nldd-icon class="checkbox__icon" name="check-mark-small"></nldd-icon>

<!-- FOUT — class op aparte regel -->
<input
	class="checkbox__input"
	type="checkbox"
>
```

### Stories (`.stories.ts`)
- Zelfde formatting conventies als templates

---

## BEM NAAMGEVING

Gebruik BEM (Block Element Modifier) + state classes:

```
.block                    /* Zelfstandig component */
.block__element           /* Onderdeel van block */
.block--modifier          /* Variant van block */
```

- Block: logische naam (`.pagination`, `.checkbox`, `.button`)
- Element: na dubbele underscore `__` (`.pagination__page-button`)
- Modifier: na dubbele hyphen `--` (`.button--primary`)
- Geen nesting: niet `.block__element__subelement`
- **Subcomponent van een block** (`nldd-{block}-{sub}`, geleverd bij en gebruikt binnen `nldd-{block}`): de shadow root gebruikt het ouder-block — root-element `.{block}__{sub}`, diepere elementen geplat met een streepje: `.{block}__{sub}-{element}`. Voorbeelden: `.menu__group-title` in `nldd-menu-group`, `.progress-bar__segment-indicator-tooltip-area` in `nldd-progress-bar-segment-indicator`. Zelfstandige componenten blijven hun eigen block (`.menu-bar-item`, `.text-cell`).
- Modifiers zijn aanvullend, nooit vervanging van base class

**Varianten vs states:**
- **BEM modifiers** voor varianten (vast): `button--primary`, `button--sm`
- **State classes** voor wisselende toestanden: `list-item.is-dragging`, `page-button.is-current`

```html
<button class="button button--primary">
<div class="list-item is-dragging">
<button class="pagination__page-button is-current">
```

---

## SLOTTED CONTENT & HOST-CSS ISOLATIE

Slotted (light-DOM) content leeft in het document van de consument. Document-CSS (Tailwind Preflight, Bootstrap Reboot, een eigen host-reset) verslaat daardoor een component z'n `::slotted()`-regels voor elke *normale* declaratie — **ongeacht specificiteit**. Zonder bescherming bloedt host-styling door en breekt de consistentie tussen overheidssites.

**Getypeerde/eigen slots** (specifiek element of `[slot=…]` waarvan de DS de styling bezit: `h1`, `a`, `p`, `img`, `[slot="title"]`, een native `<select>`) → gebruik `slottedReset`, en bij tekst ook `inheritedTextReset`, uit `assets/styles/slotted-reset.js`. Zet de reset vooraan en je eigen declaraties erná, **elk `!important`** (anders verslaat `all: revert !important` je eigen waarden):

```ts
import { slottedReset, inheritedTextReset } from '../../../assets/styles/slotted-reset.js';

::slotted(:not([slot])) {
	${slottedReset}
	${inheritedTextReset}
	color: var(--semantics-content-color) !important;
	font: var(--_font) !important;
}
```

Andere regels die hetzelfde slotted element raken (`:hover`, `@media`, een specifiekere override) moeten dan óók `!important`.

**Eigen shadow-tekst** (tekst die het component zélf rendert: labels, waarden, `::before`-content) → zet `${inheritedTextReset}` op `:host`, als guard-blok direct ná de `--_*` vars en vóór de overige properties. Dat blokkeert geërfde host-typografie (`letter-spacing`/`text-transform`/`text-align`) die anders via `body → host → :host` in je shadow-tekst lekt. **Géén `all: revert` op `:host`** — dat zou de eigen layout van het component slopen; alleen `inheritedTextReset`.

```css
:host {
	--_foo: …;

	${inheritedTextReset}
	display: …;
}
```

**Generieke `::slotted(*)`** en **custom-element/icon-slots** (`::slotted(nldd-*)`, `[slot="icon"]`) → **met rust laten**. De reset zou willekeurige content (vaak een ander nldd-component met eigen `:host`) naar UA terugzetten; die inhoud hardent zichzelf. Leg hooguit een losse structuur-prop (`flex-shrink`, `display`) `!important` op waar een host functionaliteit zou breken.

**Document-level componenten** (`*.css` zoals `rich-text.css` via `global.css`) zijn een ánder geval: hun descendant-selectors (`nldd-rich-text h1`, specificiteit 0,0,2) verslaan Preflight's kale `h1{}` (0,0,1) al op specificiteit. Geen reset/`!important` nodig voor de Preflight-case.

`text-align` zit in `inheritedTextReset` (gelockt op `start`, RTL-veilig) — de host mag niet centreren of justifyen. Heeft een component alignment nodig, bied het expliciet aan: `:host([align="center"]) ::slotted(…) { text-align: center !important }`.

**Host-layout (margin/padding/border op `:host`)** → dezelfde cascade-regel raakt ook de host zelf: een consumer-reset (`* { margin: 0; padding: 0; border: 0 }`, Tailwind Preflight's `border-width: 0`) matcht het host-element en verslaat elke normale `:host`-declaratie, ongeacht specificiteit. Doctrine:

1. **Het visuele kader hoort op een wrapper-element** in de shadow root (bv. `.banner`), niet op `:host`. De host draagt alleen het externe contract: `display`, externe sizing (`width`), positie, custom properties en `inheritedTextReset`.
2. **Kan een declaratie niet naar binnen** (negatieve margins, subgrid-deelnemers waar een wrapper de kolomrelatie breekt) → dan `!important` op de host-declaratie, met een comment die uitlegt waarom. Let op: elke andere host-rule die dezelfde property zet (varianten, `:last-child`-suppressies) moet dan óók `!important`. Gewone marges kunnen wél naar binnen met een `flow-root`-host (eigen formatting context, marge blijft interieur — zie menu-group), en een query-container kan mee naar binnen zolang de padding meeverhuist (zie container: host > `.container` > `.container__inner`).
3. `npm run validate:host-styles` (onderdeel van de build) flagt margin/padding/border met een niet-nulwaarde zonder `!important` direct op `:host`.

---

## CHECKLIST

**CSS:**
- [ ] Components → semantics → primitives volgorde
- [ ] Concentric property-volgorde binnen elke rule
- [ ] Geen fallback waarden
- [ ] Geen hardcoded waarden; geen `!important` — behalve in de slotted-reset (`::slotted()`), de host-text-reset (`:host`) en host-layout die niet naar een wrapper kan (zie SLOTTED CONTENT & HOST-CSS ISOLATIE)
- [ ] Geen margin/padding/border op `:host` zonder wrapper of `!important` — `npm run validate:host-styles` bewaakt dit
- [ ] Geen `cursor: pointer`
- [ ] Disabled: `var(--primitives-opacity-disabled)`

**Invoercomponent (staat in een nldd-form-field):**
- [ ] `static isFormInput = true`
- [ ] Eigen `focus()` naar de control eronder
- [ ] `accessible-label`, tenzij het component zijn control al zelf benoemt
- [ ] Opgenomen in de tabellen in `form-field.test.ts`

**Accessibility:**
- [ ] ARIA attributes
- [ ] Keyboard navigation
- [ ] `@media (prefers-reduced-motion)`
- [ ] `@media (forced-colors: active)`

**TypeScript:**
- [ ] TypeScript types correct
- [ ] `declare global` block
- [ ] Private methods met underscore
- [ ] Geen inline styles of templates in de component class

**Taal:**
- [ ] Story namen, JSDoc en component docs in het Nederlands
- [ ] Code comments in het Engels — **US English** (`color`, `behavior`, `center`, `gray`, `-ize`), niet Brits

**Shadow DOM:**
- [ ] Geen `part` attributen op shadow DOM elementen

**Verificatie:**
- [ ] Storybook gestart
- [ ] Component visueel gecontroleerd in Storybook
