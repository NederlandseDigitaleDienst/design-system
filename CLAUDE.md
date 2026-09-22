# NLDD Designsysteem

Web Components voor de Nederlandse Digitale Dienst (Rijksoverheid).

## Snelreferentie

```bash
npm run storybook        # Dev server op localhost:6006
npm run build:styles     # Kopieer CSS + fonts naar dist
npm run build            # Volledige build
```

## Ontwikkelworkflow

**Gebruik ALTIJD deze skills voor de juiste workflow:**

| Taak | Skill | Beschrijving |
|------|-------|--------------|
| Nieuwe branch starten | `/worktree <branch>` | Maakt worktree + kopieert .env en .claude/ |
| Component maken/updaten | `/component <naam>` | Alle regels, formatting, BEM, CSS, templates |
| Storybook beheren | `/storybook-manager` | Start/stop/status van Storybook instances |

**Typische flow voor nieuwe feature:**
```
/worktree feat/my-component
/component my-component
```

## Componentstructuur

```
src/components/{categorie}/{naam}/
  {naam}.ts           # Lit + TypeScript component (custom element: nldd-{naam}, class: NLDD{PascalName})
  {naam}.styles.ts    # Component styles
  {naam}.template.ts  # Render template
  {naam}.i18n.ts      # Vertalingen (optioneel)
  {naam}.stories.ts   # Storybook stories
  {naam}.test.ts      # Unit tests
```

## CSS Variabelen

### Structuur

| Laag | Prefix | Beschrijving |
|------|--------|--------------|
| **Primitives** | `--primitives-*` | Basiswaarden (kleuren, spacing, typografie) |
| **Semantics** | `--semantics-*` | Betekenisvolle variabelen (buttons, controls, surfaces) |
| **Components** | `--components-*` | Component-specifieke variabelen |
| **Context** | `--context-*` | Gedeelde variabelen voor communicatie tussen componenten |
| **Lokaal** | `--_*` | Interne variabelen binnen een component (niet voor extern gebruik) |

Voorkeursvolgorde: components → semantics → primitives.

### Validatie

CSS variabelen worden gevalideerd tijdens de build (`npm run validate:styles`):

- `--context-*` — Niet gevalideerd, niet in variables.css
- `--_*` — Gevalideerd binnen hetzelfde bestand
- `--primitives-*`, `--semantics-*`, `--components-*` — Gevalideerd tegen variables.css

Geen fallbacks. CI faalt als variabelen ontbreken.

## Testen

Elk component MOET minimaal een **smoke test** hebben. Run tests met `npm test`.

1. **Smoke test** (verplicht): rendert zonder errors, heeft een shadowRoot
2. **Logica tests** (verplicht bij complexe logica): test MutationObservers, slot management, attribuut propagatie, event handlers, state transitions

**Test helpers** (`src/test-utils.ts`):
- `fixture<T>(html)` — maakt DOM element, wacht op Lit updateComplete
- `cleanup(el)` — verwijdert fixture wrapper uit DOM (gebruik in afterEach)
- `waitForUpdate(el)` — wacht op MutationObserver + Lit re-render cycle

## Git

- **NOOIT pushen zonder expliciete toestemming van de gebruiker.** Alleen pushen als de gebruiker letterlijk zegt dat je mag pushen. Commit maken mag wel, pushen niet.

## Codekwaliteit

- Pre-commit hooks: ESLint, commitlint
- Conventionele commits: `feat(button): add variant`, `fix(checkbox): focus ring`

## Pakketversies

Versies worden **automatisch** verhoogd door semantic-release bij merge naar main.

Leidend criterium: verandert de commit wat consumers krijgen (`dist/` of de
meegeleverde `skills/nldd/*`)? Zo ja, dan hoort er een release uit te komen.
`docs:` telt daarin mee, want de plugin-versie volgt de pakketversie: zonder
release halen consumers de gewijzigde skill-docs nooit op (zie Plugin-versie).

| Commit type | Versieverhoging |
|-------------|-----------------|
| `feat:` | Patch (0.5.0 → 0.5.1) |
| `fix:`, `perf:` | Patch (0.5.0 → 0.5.1) |
| `refactor:`, `style:`, `docs:`, `build:` | Patch (raken `dist/` of de skill-docs) |
| `revert:` | Patch (een revert moet consumers ook bereiken) |
| `feat!:` of `BREAKING CHANGE:` | Patch (0.5.0 → 0.5.1) |
| `chore:`, `ci:`, `test:` | Geen |
| Niet-herkend (geen conventionele prefix) | Patch (behandeld als feat) |

**Handmatig versie verhogen is niet nodig.** Gebruik conventionele commits en CI doet de rest.

## Changelog

`CHANGELOG.md` wordt door semantic-release beheerd: bij elke merge naar main zet het een nieuw versieblok (`## <small>x.y.z (datum)</small>`) bovenaan, afgeleid van de conventionele commits.

**De leesbare inhoud schrijf je met de hand.** Dat is bewust: `nldd-avatar - nieuw component voor een persoon of organisatie` zegt een consument veel meer dan `refactor(avatar): rename css var`. Commit-titels schrijf je voor reviewers, changelog-entries voor consumers. Het gegenereerde deel is daarom expres niet meer dan een kale bullet per release (de PR-titel); de `### Highlights` / `### Added`-secties eronder zijn handwerk.

Laat daarom de regel `"preset": "conventionalcommits"` in `.releaserc.json` staan. Haal je die weg, dan valt de release-notes-generator terug op zijn eigen default en gaat hij de notes alsnog in `### Features` / `### Bug Fixes` opdelen, wat je juist niet wilt.

Wil je toch handmatig iets toevoegen (bijv. iets dat semantic-release niet uit de commits haalt):

- Zet de entry **direct bovenaan**, boven het nieuwste versieblok. **Geen `## Unreleased`-kopje** — dat past niet in het door semantic-release gegenereerde format.
- Gebruik de Keep-a-Changelog-secties (`### Added`, `### Fixed`, `### Breaking`, …), zoals de bestaande versieblokken.
- Regenereer daarna de skill-kopie: `npm run generate:skill-changelog` (of `npm run generate:skill-docs`). `skills/nldd/changelog.md` is een gegenereerde kopie van de root-CHANGELOG en moet in sync blijven.

## Iconen

Een icoon is een bestand in `src/components/content/icon/icons/`; de bestandsnaam
is de icoonnaam. Staat er iets **tussen haakjes** in de naam, dan is dat een
alias: haal het uit de bestandsnaam en zet het in `icon-aliases.js`
(`'brand': 'seal-star'`). Optimaliseer nieuwe bestanden naar de huisstijl:
geen `width`/`height`, `fill="currentColor"` in plaats van een vaste kleur,
pad afgerond op twee decimalen, tabs, elk pad op een eigen regel.

Nieuwe en hertekende iconen krijgen een "Nieuw"- of "Bijgewerkt"-label in de
icon-gallery. Die twee lijsten staan in `icon-gallery-status.ts` en worden bij
elke batch **vervangen**, afgeleid uit de git-historie; dat bestand legt in zijn
kop precies vast hoe je ze afleidt en welke valkuil er zit (`--follow` niet
gebruiken).

Draai daarna `npm run build:icons` (registry) en `npm run generate:skill-docs`
(de icoon- en aliaslijst in `skills/nldd/reference.md`), en zet een nieuw icoon
in de changelog onder `### Highlights`.

## Ontwerprichtlijnen

De ontwerprichtlijnen staan in `src/docs/design-guidelines.mdx` (Storybook "Docs/Ontwerprichtlijnen"): dat is de enige bron. Wijzig je ze, draai dan `npm run generate:skill-principles` (of `npm run generate:skill-docs`) en commit het resultaat. `skills/nldd/design-guidelines.md` is een gegenereerde kopie die met de plugin meereist en in sync moet blijven; er is geen aparte ontwerprichtlijnen-skill meer. Houd de tekst em-dash-vrij (komma's, punten of haakjes). Heb je de directory `.claude/skills/ontwerprichtlijnen/` lokaal nog staan (van de oude generator), verwijder die dan handmatig; hij is nu een ongetrackte overblijver.

## Plugin-versie

De Claude Code plugin (`.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`) levert de nldd-consumer-skill via `source: "./"`. Claude Code cachet een plugin op de versie in `plugin.json`: verandert die versie niet, dan halen consumers de skill nooit opnieuw op, hoezeer de inhoud ook is gewijzigd.

Daarom volgt de plugin-versie automatisch de pakketversie. `package.json` is de enige bron; `npm run generate:plugin-version` (onderdeel van `generate:skill-docs`) schrijft die versie naar beide plugin-manifesten. semantic-release draait dit in `prepareCmd` en commit de manifesten mee in de release-commit, zodat de plugin-versie meebeweegt met elke release die de skill-docs verandert. Bewerk de `version`-velden niet handmatig.
