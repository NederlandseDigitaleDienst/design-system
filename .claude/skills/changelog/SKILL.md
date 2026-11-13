---
name: changelog
description: Bewerk CHANGELOG.md — voeg release-notes/entries toe boven de laatste versie. Gebruik bij "changelog bijwerken", "release-notes schrijven", of het noteren van wijzigingen die semantic-release niet uit de commits haalt. Legt vast welke ### kopjes mogen, in welke volgorde (Highlights altijd eerst, dan Breaking, Added, Changed, Fixed), en wat de pipeline zelf doet.
user-invocable: true
---

# Changelog

`CHANGELOG.md` wordt grotendeels **automatisch** beheerd door semantic-release (Keep a Changelog 1.1.0 + SemVer). Deze skill is voor het **handmatig** toevoegen van entries — highlights, context, dingen die niet uit de commits blijken — zónder dat het misgaat.

## Wat de pipeline doet (nooit zelf doen)

Bij elke merge naar `main` zet semantic-release bovenaan een nieuw versieblok:

```
## [0.8.57](https://github.com/NederlandseDigitaleDienst/design-system/compare/v0.8.56...v0.8.57) (2026-06-08)
```

→ De `## [{versie}]({compare-link}) ({datum})`-kop komt **van de pipeline**. Die schrijf je dus **nooit zelf**.

## Wat jij doet: changes boven de laatste versie

Handmatige entries komen **bovenaan het bestand, bóven het nieuwste versieblok**, en **beginnen met `### Highlights`** — niveau `###`, geen `##`. Bij de volgende release schuift de pipeline de nieuwe `## {versie}` + commits eróverheen, zodat jouw secties netjes ónder dat nieuwe versieblok belanden.

**Terwijl je schrijft** (vóór de release):

```
# Changelog
… intro …

### Highlights          ← jouw nieuwe entries, bovenaan, niveau ###
- …
### Breaking
- …
### Added
- …
### Changed
- …
### Fixed
- …

## [0.8.56](…/compare/v0.8.55...v0.8.56) (2026-06-03)   ← vorige (laatste) release, blijft staan
…
```

**Na de volgende merge** voegt de pipeline het versieblok eroverheen — jouw secties horen er dan vanzelf onder:

```
## [0.8.57](…/compare/v0.8.56...v0.8.57) (2026-06-08)   ← door pipeline toegevoegd

### Highlights                                          ← jouw entries, nu onder de nieuwe versie
- …
```

### Niet doen (dit gaat meestal mis)

- ❌ **Geen** `## {versie}` of datum zelf toevoegen — dat doet de pipeline.
- ❌ **Geen** `## Unreleased`-kop — past niet in het semantic-release-format.
- ❌ **Geen** `##` voor je secties — gebruik `###`.
- ❌ Niet onderaan of in een ouder versieblok plakken — altijd helemaal bovenaan, boven de laatste `## [x.y.z](…) (datum)`.
- ❌ Versie niet zelf verhogen — conventionele commits bepalen de bump.
- ❌ Niets boven `### Highlights`, ook `### Breaking` niet. Hoe belangrijk een breaking change ook is: hij komt direct onder Highlights, en als hij ertoe doet staat hij daarnaast als bullet in Highlights zelf.

## De kopjes (`###`)

Altijd in deze volgorde, en alleen de kopjes die van toepassing zijn:

1. `### Highlights`
2. `### Breaking`
3. `### Added`
4. `### Changed`
5. `### Deprecated`
6. `### Removed`
7. `### Fixed`
8. `### Security`

`npm run validate:changelog` controleert dit voor elk blok, in de pre-commit-hook en in `validate.yml`: alleen deze kopjes, elk één keer, in deze volgorde. Met `-- --fix` zet hij de kopjes van elk blok op volgorde.

Highlights staat altijd bovenaan, ook als er iets breekt. Een belangrijke breaking change krijgt een bullet in Highlights (verwijs dan met "See Breaking.") en staat daarnaast in volle lengte onder `### Breaking`.

| Kopje | Waarvoor |
|-------|----------|
| `### Highlights` | Korte prozasamenvatting van de belangrijkste punten van de release. Project-specifiek; staat altijd vooraan. **Nieuwe iconen horen hier altijd (ook) in** — alle nieuwe iconen samen in één Highlights-bullet ("2 new icons."), nooit een bullet per icoon, ook bij een verder kleine release (naast hun `### Added`-regel). **Toegankelijkheidsfixes ook**: zitten er in de batch, dan altijd één bullet met het aantal ("6 accessibility fixes."), met in één zin waar ze over gaan en een verwijzing naar de secties waar ze staan. Tel elke wijziging die iets oplost voor hulptechnologie, toetsenbord, zoom of contrast, ook als ze onder `### Changed` staat. |
| `### Added` | Nieuwe features, componenten, tokens, icons. |
| `### Changed` | Wijzigingen in bestaand gedrag die **niet** breaking zijn. |
| `### Breaking` | Breaking changes: renames, verwijderde/gewijzigde API, gewijzigde import-paden, en een bewuste verandering die de layout van bestaande pagina's verschuift (een andere hoogte, maat of spacing). Zo'n verandering kan een pagina breken, met overflow, afgekapte tekst of iets dat niet meer uitlijnt, en komt anders ongevraagd binnen via `^0.x`. Wat alleen het uiterlijk verandert (een hoekradius, een kleur) breekt niets en hoort onder `Changed`; een fix die iets herstelt dat er verkeerd uitzag onder `Fixed`. Direct onder Highlights, nooit erboven; is hij belangrijk, herhaal hem dan als bullet in Highlights. Onder 1.0 geeft hij een minor release (zie de hoofd-`CLAUDE.md`). |
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
- **Na het bewerken van `CHANGELOG.md` — niet vergeten:** `npm run generate:skill-changelog` (of `npm run generate:skill-docs`). Dit regenereert `skills/nldd-design/changelog.md` (de gekopieerde changelog in de `nldd-design`-skill, de gedeelde naslag die met de plugin meereist) zodat die in sync blijft. Sla je dit over, dan lezen consumenten een changelog die achterloopt op de echte.

## Ter referentie

Welke commit-types in de changelog landen (de pipeline laat `chore`, `docs`, `ci`, `style`, `test`, `build` bewust weg) en hoe de versie wordt bepaald: zie de hoofd-`CLAUDE.md` (sectie Pakketversies / Changelog).
