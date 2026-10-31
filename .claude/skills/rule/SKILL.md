---
name: rule
description: Voeg een regel toe aan nldd lint vanuit een beschrijving in gewone taal. Gebruik dit bij "/rule", "maak hier een lintregel van", "dit moet de linter vangen", of als een patroon, warning of review iets vastlegt dat elke app verkeerd kan doen.
user-invocable: true
argument-hint: <wat er mis is, in gewone taal>
---

# Een lintregel toevoegen

De aanvrager beschrijft wat er mis is en beslist over de gevolgen. Jij schrijft de regel.

## 1. Past dit in een regel?

Een regel controleert structuur in één bestand: welke tags, attributen en kinderen er staan. Past het daar niet in (de bedoeling van een tekst, de opbouw van een hele pagina), zeg dat dan en stop: het hoort als proza in het patroon of de ontwerprichtlijnen.

Kan het component het zelf goed doen, dan gaat een betere default voor op een regel.

## 2. Schrijf `src/rules/<id>.yaml`

Elke regel staat in zijn eigen bestand in `src/rules/`, ook als hij over meer componenten gaat. De bestandsnaam is het id: kebab-case, beschrijft de fout, zonder componentprefix.

```yaml
severity: warn
context: nldd-button-bar
report: ':has(nldd-toggle-button)'
message: A button bar holds actions, not toggles.
see: patronen/toolbar-with-actions
examples:
  passed: ['<nldd-button-bar><nldd-button text="Bewaar"></nldd-button></nldd-button-bar>']
  failed: ['<nldd-button-bar><nldd-toggle-button text="Vet"></nldd-toggle-button></nldd-button-bar>']
```

- `context` is een CSS-selector: waar de regel over gaat.
- Daarnaast hoogstens één van:
  - `assert`: de context moet aan deze selector voldoen.
  - `report`: de context mag er niet aan voldoen.
  - `count`: `{ of, min, max }` telt directe kinderen.
  - `ref`: `{ attr, target, equal }` volgt een id naar een ander element.
  - Geen van vier: de context zelf is de fout.
- `:form-input` en `:cell` zijn klassen uit het manifest. Schrijf geen eigen lijst tags.
- `severity` is `warn`. `error` alleen voor toegankelijke namen en voor wat niet kan werken, en bij een bestaande regel alleen met een `!`-commit.
- `message` is Engels en zegt wat hier fout is. Het waarom staat op de pagina waar `see` naar wijst; schrijf het niet over.
- `see` is `patronen/<slug>` als de regel bij een patroon hoort. De regel verschijnt dan vanzelf op die pagina. Zonder `see` staat hij alleen bij zijn componenten.

Neem een bestaande `console.warn` over, schrijf dan precies dezelfde conditie op, want de code is daar de waarheid.

Gaat de regel over een naam die weg is, zet die dan in `removed`, met de oude naam in het `failed`-voorbeeld: `removed: ['item-width']`. De selector mag hem dan noemen, en dat hij er staat is genoeg.

Elke regel is een selector. Staat wat je wilt zien niet in de markup (een meting, een methode die verkeerd wordt aangeroepen, een waarde die geparsed moet worden), kijk dan eerst of het component de fout onmogelijk kan maken. Zo niet, dan stelt het component het feit beschikbaar met `setState(this, 'no-width', conditie)` uit `src/utilities/element-state.ts`, en leest de regel het met `:state()`: `runtime: true`, `context: 'nldd-button-group:state(no-width)'`, zonder voorbeelden. De naam is kort, kebab-case en beschrijft het feit, nooit de fout. Kan het feit weer verdwijnen, geef dan de conditie mee; bij een eenmalige gebeurtenis, zoals een methode-aanroep, zet je hem op `true`. Een component bevat geen meldingstekst en weet niets van regels. `lint:rules` faalt op een `console.warn` in een component en op een state die niets zet.

## 3. Bewijs de regel

```bash
npm run generate:lint-data && npm run lint:rules
NLDD_LINT_CORPUS=../app-a/src,../app-b/src npm run lint:corpus <id>
```

`lint:rules` faalt als een voorbeeld niet doet wat het claimt, als een selector iets noemt dat niet bestaat, of als een patroon de regel breekt. Breekt een patroon hem, dan klopt of de regel niet, of het patroon: zoek uit welke.

Vraag de corpus-paden als `NLDD_LINT_CORPUS` niet gezet is.

## 4. Leg de gevolgen voor

Laat zien hoe vaak de regel vuurt, in hoeveel apps, met drie voorbeelden, en vraag: is dit terecht? De aanvrager kiest: `warn`, `error` of toch niet. Een regel met vals alarm komt er niet in. Apps op een oude versie geven hernoem-ruis; tel die niet mee.

## 5. Rond af

```bash
npm run generate:skill-docs
```

Voeg een bestaande check niet dubbel toe: wat de regel controleert, haal je weg uit de `.test.ts` van het patroon. Commit met `feat(lint): ...`.
