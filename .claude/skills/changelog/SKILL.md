---
name: changelog
description: Bewerk CHANGELOG.md — voeg release-notes/entries toe boven de laatste versie. Gebruik bij "changelog bijwerken", "release-notes schrijven", of het noteren van wijzigingen die semantic-release niet uit de commits haalt. Legt vast welke ### kopjes mogen (Highlights, Added, Changed, Breaking, Fixed) en wat de pipeline zelf doet.
user-invocable: true
---

# Changelog

`CHANGELOG.md` wordt grotendeels **automatisch** beheerd door semantic-release (Keep a Changelog 1.1.0 + SemVer). Deze skill is voor het **handmatig** toevoegen van entries — highlights, context, dingen die niet uit de commits blijken — zónder dat het misgaat.

## Wat de pipeline doet (nooit zelf doen)

Bij elke merge naar `main` zet semantic-release bovenaan een nieuw versieblok:

```
## <small>0.8.57 (2026-06-08)</small>

* feat(button): add variant ([a1b2c3d](https://github.com/NederlandseDigitaleDienst/design-system/commit/a1b2c3d))
```

→ De `## <small>{versie} ({datum})</small>`-kop **én** de (squashed) commit-regels komen **van de pipeline**. Die schrijf je dus **nooit zelf**.

## Wat jij doet: changes boven de laatste versie

Handmatige entries komen **bovenaan het bestand, bóven het nieuwste versieblok**, en **beginnen met `### Highlights`** — niveau `###`, geen `##`. Bij de volgende release schuift de pipeline de nieuwe `## {versie}` + commits eróverheen, zodat jouw secties netjes ónder dat nieuwe versieblok belanden.

**Terwijl je schrijft** (vóór de release):

```
# Changelog
… intro …

### Highlights          ← jouw nieuwe entries, bovenaan, niveau ###
- …
### Added
- …
### Breaking
- …

## <small>0.8.56 (2026-06-03)</small>   ← vorige (laatste) release, blijft staan
…
```

**Na de volgende merge** voegt de pipeline het versieblok eroverheen — jouw secties horen er dan vanzelf onder:

```
## <small>0.8.57 (2026-06-08)</small>   ← door pipeline toegevoegd

* feat(button): … ([hash](url))          ← door pipeline toegevoegd
### Highlights                            ← jouw entries, nu onder de nieuwe versie
- …
```

### Niet doen (dit gaat meestal mis)

- ❌ **Geen** `## {versie}` of datum zelf toevoegen — dat doet de pipeline.
- ❌ **Geen** `## Unreleased`-kop — past niet in het semantic-release-format.
- ❌ **Geen** `##` voor je secties — gebruik `###`.
- ❌ Niet onderaan of in een ouder versieblok plakken — altijd helemaal bovenaan, boven de laatste `## <small>…</small>`.
- ❌ Versie niet zelf verhogen — conventionele commits bepalen de bump.

## De kopjes (`###`)

Volgorde: **`### Highlights` altijd eerst**, daarna per type. Gebruik alleen wat van toepassing is.

| Kopje | Waarvoor |
|-------|----------|
| `### Highlights` | Korte prozasamenvatting van de belangrijkste punten van de release. Project-specifiek; staat altijd vooraan. **Nieuwe iconen horen hier altijd (ook) in** — noem ze als eigen Highlights-bullet, ook bij een verder kleine release (naast hun `### Added`-regel). |
| `### Added` | Nieuwe features, componenten, tokens, icons. |
| `### Changed` | Wijzigingen in bestaand gedrag die **niet** breaking zijn. |
| `### Breaking` | Breaking changes: renames, verwijderde/gewijzigde API, gewijzigde import-paden. Maak prominent — het is het major-/SemVer-signaal. |
| `### Fixed` | Bugfixes. |

### Alleen wijzigingen t.o.v. de laatste release

`Changed`, `Breaking` en `Fixed` (en `Deprecated`/`Removed`) gaan **uitsluitend over wat al in een eerdere release zat**. Een component, token of feature die in dezelfde nog-niet-uitgebrachte batch onder `Added` staat, hoort **niet óók** onder `Changed`/`Breaking`/`Fixed` — er valt niets te wijzigen, breken of fixen t.o.v. de vorige versie; dat gedrag is gewoon deel van de `Added`-beschrijving.

- ❌ Nieuw `nldd-hero` → een `Changed`-regel "hero-achtergrond gebruikt nu reference".
- ✅ Beschrijf die achtergrondkleur in de `Added`-bullet van `nldd-hero` zelf.

Iets dat je tijdens dezelfde batch toevoegt én daarna weer aanpast, blijft dus één `Added`-entry met de eindstand — geen apart `Changed`/`Fixed`.

### Industrie-standaard kopjes (Keep a Changelog 1.1.0)

Dit project volgt [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). De **officiële standaard change-types** zijn:

`Added` · `Changed` · `Deprecated` · `Removed` · `Fixed` · `Security`

Dit project gebruikt daarvan **Added / Changed / Fixed** en voegt twee eigen toe: **Highlights** (samenvatting vooraan) en **Breaking** (i.p.v. breaking changes te verstoppen onder Changed/Removed). `Deprecated`, `Removed` en `Security` zijn óók geldig — pak ze als ze van toepassing zijn (bv. `### Security` bij een kwetsbaarheid). `Highlights` en `Breaking` zijn de enige niet-standaard toevoegingen.

## Format van de items

Bullet-lijst onder elk kopje; begin met de component/het token vetgedrukt:

```
### Added

- **`nldd-component`** — wat het is en doet, in één of twee zinnen.
- **Tokens** — welke `--semantics-*`-range is toegevoegd en waarvoor.
```

**Taal: US English.** De changelog is Engelstalig en gebruikt Amerikaanse spelling — `color` (niet `color`), `behavior` (niet `behavior`), `center` (niet `center`), `gray` (niet `gray`), `-ize` (niet `-ise`). Dit sluit aan op de codebase, waar API's, tokens en attributen (`color`, `--semantics-*-color`) al Amerikaans zijn.

## Helpers

- **Startpunt:** `npm run changelog:draft` — print een platte lijst van alle commits sinds de laatste `v*`-tag (met GitHub-links), om uit te curaten: highlights kiezen, ruis trimmen, in secties groeperen.
- **Na het bewerken van `CHANGELOG.md` — niet vergeten:** `npm run generate:skill-changelog` (of `npm run generate:skill-docs`). Dit regenereert `skills/nldd-design/changelog.md` (de gekopieerde changelog in de consumer-`nldd`-skill) zodat die in sync blijft. Sla je dit over, dan loopt de consumer-skill achter op de echte changelog.

## Ter referentie

Welke commit-types in de changelog landen (de pipeline laat `chore`, `docs`, `ci`, `style`, `test`, `build` bewust weg) en hoe de versie wordt bepaald: zie de hoofd-`CLAUDE.md` (sectie Pakketversies / Changelog).
