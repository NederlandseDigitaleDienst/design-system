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
<nldd-button appearance="accent-filled" text="Opslaan"></nldd-button>
<nldd-checkbox-field label="Akkoord met voorwaarden"></nldd-checkbox-field>
<nldd-switch-field label="Meldingen inschakelen"></nldd-switch-field>
```

## Storybook

Bekijk de live component documentatie: **https://nederlandsedigitaledienst.github.io/design-system/**

## Plugin voor AI-assistenten

De `nldd-design-system`-plugin geeft een AI-assistent de kennis om met `@nldd/design-system` te werken: de juiste tags, attributen, CSS-tokens en patronen. Hij staat in de NLDD-marketplace, [`NederlandseDigitaleDienst/ai-plugins`](https://github.com/NederlandseDigitaleDienst/ai-plugins), met een manifest voor Claude Code en een voor Cursor. Hij levert vijf skills:

| Skill | Waarvoor |
|-------|----------|
| `nldd-design` | Opzoeken: welke componenten, attributen, slots, events en iconen er zijn, wat er per versie veranderde, en de ontwerprichtlijnen. |
| `nldd-design-build` | Een applicatie bouwen: de visie erachter, de basispatronen en hoe je componenten samenstelt. |
| `nldd-design-migrate` | Een bestaande frontend omzetten naar dit systeem. |
| `nldd-design-upgrade` | Een applicatie die al op dit systeem draait naar een nieuwere versie brengen. |
| `nldd-design-contribute` | Een wijziging voorstellen: een ontbrekend component, een patroon, of een bug. |

De assistent kiest zelf welke hij nodig heeft. In Claude Code kun je er ook een aanroepen met `/nldd-design`, of met `/nldd-design-system:nldd-design` als een skill van je eigen project dezelfde naam draagt.

### Claude Code

```
/plugin marketplace add NederlandseDigitaleDienst/ai-plugins
/plugin install nldd-design-system@nldd
```

Bijwerken naar een nieuwere versie doe je met `/plugin marketplace update nldd`.

### Cursor

Importeer de marketplace via **Dashboard → Settings → Plugins → Import** met de repository `NederlandseDigitaleDienst/ai-plugins`, en zet daarna `nldd-design-system` aan.

Deze route is in Claude Code gemeten en in Cursor nog niet. Loopt hij bij jou anders, meld het dan in een [issue](https://github.com/NederlandseDigitaleDienst/ai-plugins/issues).

### Heb je de plugin al als `nldd@nldd-plugins`?

Dan blijft hij werken. Deze repository is tot 1 maart 2027 ook zelf nog een Claude Code marketplace (`nldd-plugins`), en wie de plugin daaruit heeft krijgt dezelfde skills en dezelfde updates. Daarna verdwijnt die marketplace en krijg je geen updates meer, dus stap voor die tijd over:

```
/plugin marketplace add NederlandseDigitaleDienst/ai-plugins
/plugin install nldd-design-system@nldd
/plugin uninstall nldd@nldd-plugins
/plugin marketplace remove nldd-plugins
```

Staat de plugin in de `.claude/settings.json` van een project, vervang dan daar de twee verwijzingen:

```json
{
  "extraKnownMarketplaces": {
    "nldd": {
      "source": { "source": "github", "repo": "NederlandseDigitaleDienst/ai-plugins" }
    }
  },
  "enabledPlugins": {
    "nldd-design-system@nldd": true
  }
}
```

Een tijd lang de oude en de nieuwe tegelijk aan hebben kan geen kwaad: de skills verschijnen één keer.

Eén ding verandert ook als je niet overstapt. De plugin zelf heet nu `nldd-design-system`, dus de lange vorm van een skillnaam is `/nldd-design-system:nldd-design` en niet meer `/nldd:nldd-design`. De korte vorm (`/nldd-design`) blijft gelijk. Heb je de lange vorm ergens vastgelegd, bijvoorbeeld als `Skill(nldd:nldd-design-build)` in een permissieregel of in een hook, pas die dan aan: de zoekopdracht hieronder vindt ze.

### Kom je van een versie met één `nldd`-skill?

Waar er één skill `nldd` was, zijn er nu vijf met een naam die zegt waar ze over gaan. Verwijs je ergens zelf naar de oude skillnaam, dan breekt dat, en de eerste twee zonder foutmelding:

1. in je eigen `CLAUDE.md`, `.claude/rules/*.md` of `AGENTS.md` ("gebruik de nldd skill"). Claude vindt hem niet en gaat verder zonder;
2. in subagent-definities (`.claude/agents/*.md`) en hooks die op de naam matchen;
3. in `Skill(nldd)` in permissieregels: die matcht niet meer, dus je krijgt een prompt waar je die eerder niet had;
4. in scripts of CI die `claude -p "/nldd ..."` aanroepen.

Eén zoekopdracht vindt ze:

```
rg -n '(^|[^-\w@])nldd([^-\w/]|$)' --glob '!node_modules' CLAUDE.md AGENTS.md .claude/
```

Hij slaat `@nldd/design-system` en de `nldd-*`-tags over. Wat hij ook vindt zijn `nldd:` (de oude lange vorm) en `nldd@nldd-plugins` (de oude installatie); voor beide staat hierboven wat je ermee doet.

Er blijft tot 1 maart 2027 een `nldd`-skill achter die niets doet dan doorverwijzen.

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
| `appearance`       | string  | `neutral-tinted` | `primary`, `secondary`, `destructive`, `accent-filled`, `accent-transparent`, `neutral-tinted`, `neutral-base`, `neutral-transparent`, `critical-tinted`, `critical-transparent`, `inherit-filled`, `inherit-tinted` |
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

CSS variabelen zijn georganiseerd in vier lagen:

| Laag | Prefix | Beschrijving |
| ---- | ------ | ------------ |
| **Primitives** | `--primitives-*` | Basis waarden (kleuren, spacing, typography) |
| **Semantics** | `--semantics-*` | Betekenisvolle variabelen (buttons, controls, surfaces) |
| **Context** | `--context-*` | Gedeelde variabelen voor communicatie tussen componenten |
| **Local** | `--_{component}-*` | Interne variabelen van één component, met zijn tag zonder `nldd-` voorop (niet bedoeld voor extern gebruik) |

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

/* Context — communicatie tussen componenten */
--context-parent-background-color: var(--semantics-surfaces-base-background-color);

/* Local — intern binnen een component, in zijn :host. Wijst naar semantics
   of primitives, en draagt de naam van het component. */
--_box-background-color: var(--semantics-surfaces-tinted-background-color);
--_button-group-sm-gap: var(--primitives-space-6);
```

De kleurpaletten staan in `src/assets/styles/colors.generated.css` en worden gegenereerd; de accent-laag wijst naar een van die paletten, zodat één regel de huisstijlkleur van het hele systeem bepaalt.

## Feedback en verzoeken

Mis je een component of wil je een wijziging voorstellen? [Maak een issue aan](https://github.com/NederlandseDigitaleDienst/design-system/issues).

## Fonts

Het designsysteem gebruikt twee fonts, met verschillende licenties:

- **JetBrains Mono** (monospace) — vrij te gebruiken onder de [SIL Open Font License 1.1](https://openfontlicense.org).
- **Rijksoverheid Sans** (`RijksSansWeb`) — auteursrechtelijk beschermd door de Staat der Nederlanden. **Uitsluitend bedoeld voor publicaties van de Rijksoverheid** of partijen die in opdracht van de Rijksoverheid werken. Voor ander gebruik is voorafgaande schriftelijke toestemming vereist; neem contact op met de Rijksvoorlichtingsdienst.

Volledige licentie-informatie staat in [`NOTICES.md`](./NOTICES.md). Door de fonts mee te leveren in deze repository wordt geen licentie verleend buiten het hierboven beschreven kader.

## Licentie (License)

Copyright © 2026 Staat der Nederlanden.

De broncode van dit designsysteem valt onder de **EUPL-1.2**. De volledige licentietekst staat in [`LICENSE`](./LICENSE).

De fontbestanden in `src/assets/fonts/`, het logo en de huisstijlelementen van de Rijksoverheid (zoals het lint en de huisstijlkleuren) vallen daar niet onder; die zijn uitsluitend bestemd voor de Rijksoverheid en partijen die in haar opdracht werken, zie [`NOTICES.md`](./NOTICES.md).

Verder horen bij dit project een [gedragscode](./CODE_OF_CONDUCT.md), een [beveiligingsbeleid](./SECURITY.md), een [bijdragegids](./CONTRIBUTING.md), een [ondersteuningspagina](./SUPPORT.md) en een beschrijving van [wie waarover beslist](./PROJECT_GOVERNANCE.md).

## Waar het designsysteem draait

Publieke repositories van overheidsorganisaties die `@nldd/design-system` gebruiken, met de plek waar je het resultaat kunt bekijken. Een project staat hier als het de componenten of de tokens gebruikt en de broncode of de site voor iedereen te openen is. Ontbreekt jouw project? [Maak een issue aan](https://github.com/NederlandseDigitaleDienst/design-system/issues) of stuur een pull request op deze lijst.

### Nederlandse Digitale Dienst

De [Nederlandse Digitale Dienst](https://digitaledienst.overheid.nl) is gestart met RegelRecht, Fundament en MijnOverheid Zakelijk. Hun broncode staat in andere GitHub-organisaties dan die van de dienst.

#### RegelRecht

Alle frontends staan in [MinBZK/regelrecht](https://github.com/MinBZK/regelrecht).

| Wat | Live | Broncode |
| --- | ---- | -------- |
| Website en documentatie | [regelrecht.rijks.app](https://regelrecht.rijks.app) | [`docs/`](https://github.com/MinBZK/regelrecht/tree/main/docs) |
| Editor voor regelgeving | [editor.regelrecht.rijks.app](https://editor.regelrecht.rijks.app) | [`frontend/`](https://github.com/MinBZK/regelrecht/tree/main/frontend) |
| Demo-werkruimte | [demo.regelrecht.rijks.app](https://demo.regelrecht.rijks.app) | [`frontend-demo/`](https://github.com/MinBZK/regelrecht/tree/main/frontend-demo) |
| Wetgevingsproces | [lawmaking.regelrecht.rijks.app](https://lawmaking.regelrecht.rijks.app) | [`frontend-lawmaking/`](https://github.com/MinBZK/regelrecht/tree/main/frontend-lawmaking) |
| Proof-of-concepts | [poc.regelrecht.rijks.app](https://poc.regelrecht.rijks.app) | [`frontend-poc-portal/`](https://github.com/MinBZK/regelrecht/tree/main/frontend-poc-portal) en de andere `frontend-poc-*`-mappen |

#### Fundament

De soevereine overheidscloud. Alle frontends staan in [fundament-oss/fundament](https://github.com/fundament-oss/fundament).

| Wat | Live | Broncode |
| --- | ---- | -------- |
| Website en documentatie | [docs.fundament.projects.digilab.network](https://docs.fundament.projects.digilab.network) | [`docs-frontend/`](https://github.com/fundament-oss/fundament/tree/main/docs-frontend) |
| Console | [console.fundament.projects.digilab.network](https://console.fundament.projects.digilab.network) | [`console-frontend/`](https://github.com/fundament-oss/fundament/tree/main/console-frontend) |
| Marketplace voor plugins | [marketplace.fundament.projects.digilab.network](https://marketplace.fundament.projects.digilab.network) | [`marketplace-frontend/`](https://github.com/fundament-oss/fundament/tree/main/marketplace-frontend) |
| DCIM (datacenter infrastructure management) | geen publieke URL | [`dcim-frontend/`](https://github.com/fundament-oss/fundament/tree/main/dcim-frontend) |

#### MijnOverheid Zakelijk

| Wat | Live | Broncode |
| --- | ---- | -------- |
| Website: kleuren, iconen en favicon, en de presentaties | [mijnoverheidzakelijk.nl](https://mijnoverheidzakelijk.nl) | [MinBZK/moza-site](https://github.com/MinBZK/moza-site) |

#### De dienst zelf

| Wat | Live | Broncode |
| --- | ---- | -------- |
| Website van de Nederlandse Digitale Dienst | [digitaledienst.overheid.nl](https://digitaledienst.overheid.nl) | geen publieke repository |

#### Overige projecten

| Wat | Live | Broncode |
| --- | ---- | -------- |
| NeRDS, de Nederlandse Richtlijn Digitale Systemen | [nederlandsedigitaledienst.github.io/NeRDS](https://nederlandsedigitaledienst.github.io/NeRDS/) | [NederlandseDigitaleDienst/NeRDS](https://github.com/NederlandseDigitaleDienst/NeRDS) |
| Ruimte, een werkinstrument voor het samenstellen van een formatie | [nederlandsedigitaledienst.github.io/ruimte](https://nederlandsedigitaledienst.github.io/ruimte/) | [NederlandseDigitaleDienst/ruimte](https://github.com/NederlandseDigitaleDienst/ruimte) |

### Andere overheidsorganisaties

| Wat | Live | Broncode |
| --- | ---- | -------- |
| Bouwmeester, beheer van het beleidscorpus van BZK | [bouwmeester.rijks.app](https://bouwmeester.rijks.app) | [BureauArchitectuurDigitaleOverheid/bouwmeester](https://github.com/BureauArchitectuurDigitaleOverheid/bouwmeester) |
| ZAD, Zelfservice Applicatie Deployment | [zad.rijksapp.nl](https://zad.rijksapp.nl) | [RijksICTGilde/RIG-Cluster](https://github.com/RijksICTGilde/RIG-Cluster) |
| Wies, een overzicht van wie waar aan werkt | [wies.rijksorganisatieodi.nl](https://wies.rijksorganisatieodi.nl) (achter een login) | [RijksICTGilde/wies](https://github.com/RijksICTGilde/wies) |
| Lord of the Components, dat Jinja2-templates omzet naar NLDD-componenten | een bibliotheek, geen site | [RijksICTGilde/lord-of-the-components](https://github.com/RijksICTGilde/lord-of-the-components) |
| Invulhulp voor AI-compliance-formulieren (proof of concept) | geen publieke URL | [MinFin-NL/invulhulp](https://github.com/MinFin-NL/invulhulp) |
