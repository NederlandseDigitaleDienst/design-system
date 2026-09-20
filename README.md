# NLDD Designsysteem

Web Components voor Nederlandse Digitale Dienst (Rijksoverheid).

## Installatie

```bash
npm install @nldd/design-system
```

### Gebruik

```javascript
// Importeer CSS variabelen en fonts (vereist voor styling)
import '@nldd/design-system/styles';

// Importeer alle componenten
import '@nldd/design-system';

// Of importeer specifieke componenten
import { NLDDButton, NLDDCheckbox, NLDDSwitch } from '@nldd/design-system';
```

```html
<!-- Gebruik in HTML -->
<nldd-button variant="accent-filled" text="Opslaan"></nldd-button>
<nldd-checkbox-field label="Akkoord met voorwaarden"></nldd-checkbox-field>
<nldd-switch-field label="Meldingen inschakelen"></nldd-switch-field>
```

## Storybook

Bekijk de live component documentatie: **https://nederlandsedigitaledienst.github.io/design-system/**

## Claude Code plugin

Deze repository is ook een Claude Code marketplace. De `nldd`-plugin geeft
Claude de kennis om met `@nldd/design-system` te werken: de juiste tags,
attributen, CSS-tokens en patronen. Hij levert vijf skills:

| Skill | Waarvoor |
|-------|----------|
| `nldd-design` | Opzoeken: welke componenten, attributen, slots, events en iconen er zijn, wat er per versie veranderde, en de ontwerprichtlijnen. |
| `nldd-design-build` | Een applicatie bouwen: de visie erachter, de basispatronen en hoe je componenten samenstelt. |
| `nldd-design-migrate` | Een bestaande frontend omzetten naar dit systeem. |
| `nldd-design-upgrade` | Een applicatie die al op dit systeem draait naar een nieuwere versie brengen. |
| `nldd-design-contribute` | Een wijziging voorstellen: een ontbrekend component, een patroon, of een bug. |

Claude kiest zelf welke hij nodig heeft; aanroepen kan ook met `/nldd-design`,
of met `/nldd:nldd-design` als een skill van je eigen project dezelfde naam
draagt.

Toevoegen en installeren:

```
/plugin marketplace add NederlandseDigitaleDienst/design-system
/plugin install nldd@nldd-plugins
```

Bijwerken naar een nieuwere versie doe je met `/plugin marketplace update nldd-plugins`.

### Kom je van een versie met één `nldd`-skill?

De plugin heette altijd al `nldd` en blijft zo heten, dus je installatie en je
`enabledPlugins` blijven werken. Wat veranderde zijn de **skills** erin: waar er
één `nldd` was, zijn er nu vier met een naam die zegt waar ze over gaan.

Verwijs je ergens zelf naar de oude skillnaam, dan breekt dat, en de eerste twee
zonder foutmelding:

1. in je eigen `CLAUDE.md`, `.claude/rules/*.md` of `AGENTS.md` ("gebruik de nldd
   skill"). Claude vindt hem niet en gaat verder zonder;
2. in subagent-definities (`.claude/agents/*.md`) en hooks die op de naam matchen;
3. in `Skill(nldd)` in permissieregels: die matcht niet meer, dus je krijgt een
   prompt waar je die eerder niet had;
4. in scripts of CI die `claude -p "/nldd ..."` aanroepen.

Eén zoekopdracht vindt ze:

```
rg -n '\bnldd\b' --glob '!node_modules' CLAUDE.md AGENTS.md .claude/
```

Laat `nldd@nldd-plugins` staan: dat is de pluginnaam en die klopt nog. Er blijft
tot 1 maart 2027 een `nldd`-skill achter die niets doet dan doorverwijzen.

## Development setup

```bash
# Dependencies installeren
npm install

# Storybook starten
npm run storybook

# Open http://localhost:6006 voor de component documentatie
```

## Componenten

### nldd-button

| Attribuut          | Type    | Default          | Beschrijving                                                                                                                                             |
| ------------------ | ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`             | string  | `''`             | Tekst van de button                                                                                                                                      |
| `variant`          | string  | `neutral-tinted` | `primary`, `secondary`, `destructive`, `accent-filled`, `accent-transparent`, `neutral-tinted`, `neutral-transparent`, `critical-tinted`, `critical-transparent` |
| `size`             | string  | `md`             | `xs`, `sm`, `md`                                                                                                                                         |
| `disabled`         | boolean | `false`          | Uitgeschakelde staat                                                                                                                                     |
| `type`             | string  | `button`         | `button`, `submit`, `reset`                                                                                                                              |
| `full-width`       | boolean | `false`          | Rekt de button uit over de volledige breedte van de container                                                                                             |
| `start-icon`       | string  | `''`             | Icoon aan het begin van de button                                                                                                                        |
| `end-icon`         | string  | `''`             | Icoon aan het einde van de button                                                                                                                        |
| `expandable`       | boolean | `false`          | Voegt een icoon toe dat aangeeft dat de button een menu of popover opent                                                                                 |
| `href`             | string  | `undefined`      | Rendert als link (`<a>`) in plaats van een button                                                                                                        |
| `accessible-label` | string  | `''`             | Toegankelijk label voor schermlezers                                                                                                                     |
| `popovertarget`    | string  | `''`             | ID van het popover-element                                                                                                                               |

Zie de [Storybook-documentatie](https://nederlandsedigitaledienst.github.io/design-system/) voor alle componenten.

## Styling structuur

CSS variabelen zijn georganiseerd in vijf lagen:

| Laag | Prefix | Beschrijving |
| ---- | ------ | ------------ |
| **Primitives** | `--primitives-*` | Basis waarden (kleuren, spacing, typography) |
| **Semantics** | `--semantics-*` | Betekenisvolle variabelen (buttons, controls, surfaces) |
| **Components** | `--components-*` | Component-specifieke variabelen |
| **Context** | `--context-*` | Gedeelde variabelen voor communicatie tussen componenten |
| **Local** | `--_*` | Interne variabelen binnen een component (niet bedoeld voor extern gebruik) |

```css
/* Primitives — basis waarden. Een kleur draagt zijn licht- en donkerwaarde
   samen in één light-dark()-paar; de rest is een kale waarde. */
--primitives-color-lintblauw-100: light-dark(oklch(0.897 0.044 253.4), oklch(0.262 0.044 253.4));
--primitives-color-accent-100: var(--primitives-color-lintblauw-100);
--primitives-space-16: 16px;

/* Semantics — verwijzen naar primitives. light-dark() staat hier om per schema
   een ANDERE stap te kiezen, niet om een kleur te definiëren. */
--semantics-buttons-accent-filled-background-color: light-dark(var(--primitives-color-accent-750), var(--primitives-color-accent-650));
--semantics-controls-md-min-size: var(--primitives-space-44);

/* Components — verwijzen naar semantics of primitives */
--components-box-background-color: var(--semantics-surfaces-tinted-background-color);
--components-button-group-sm-gap: var(--primitives-space-6);

/* Context — communicatie tussen componenten */
--context-parent-background-color: var(--semantics-surfaces-base-background-color);

/* Local — intern binnen een component */
--_background-color: var(--context-parent-background-color);
```

De kleurpaletten staan in `src/assets/styles/colors.generated.css` en worden
gegenereerd; de accent-laag wijst naar een van die paletten, zodat één regel de
huisstijlkleur van het hele systeem bepaalt.

## Feedback en verzoeken

Mis je een component of wil je een wijziging voorstellen? [Maak een issue aan](https://github.com/NederlandseDigitaleDienst/design-system/issues).

## Fonts

Het designsysteem gebruikt twee fonts, met verschillende licenties:

- **JetBrains Mono** (monospace) — vrij te gebruiken onder de
  [SIL Open Font License 1.1](https://openfontlicense.org).
- **Rijksoverheid Sans** (`RijksSansWeb`) — auteursrechtelijk beschermd
  door de Staat der Nederlanden. **Uitsluitend bedoeld voor publicaties
  van de Rijksoverheid** of partijen die in opdracht van de Rijksoverheid
  werken. Voor ander gebruik is voorafgaande schriftelijke toestemming
  vereist; neem contact op met de Rijksvoorlichtingsdienst.

Volledige licentie-informatie staat in [`NOTICES.md`](./NOTICES.md). Door
de fonts mee te leveren in deze repository wordt geen licentie verleend
buiten het hierboven beschreven kader.

## Licentie (License)

Copyright © 2026 Staat der Nederlanden.

De broncode van dit designsysteem valt onder de **EUPL-1.2**. De volledige
licentietekst staat in [`LICENSE`](./LICENSE).

De fontbestanden in `src/assets/fonts/` vallen daar niet onder; die hebben hun
eigen licenties, zie [`NOTICES.md`](./NOTICES.md).

Verder horen bij dit project een [gedragscode](./CODE_OF_CONDUCT.md), een
[beveiligingsbeleid](./SECURITY.md), een [bijdragegids](./CONTRIBUTING.md), een
[ondersteuningspagina](./SUPPORT.md) en een beschrijving van
[wie waarover beslist](./PROJECT_GOVERNANCE.md).
