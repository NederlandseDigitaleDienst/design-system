---
name: rule
description: Voeg een regel toe aan nldd lint vanuit een beschrijving in gewone taal. Gebruik dit bij "/rule", "maak hier een lintregel van", "dit moet de linter vangen", of als een patroon of review iets vastlegt dat elke app verkeerd kan doen.
user-invocable: true
argument-hint: <wat er mis is, in gewone taal>
---

# Een lintregel toevoegen

De aanvrager zegt wat er mis is en beslist over de gevolgen. Jij schrijft de regel.

## 1. Moet dit een regel zijn?

- Kan het component de fout onmogelijk maken? Doe dat, of zeg dat, in plaats van een regel.
- Gaat het om bedoeling, tekst of een hele pagina? Dan is het proza in het patroon of de ontwerprichtlijnen. Stop hier.
- Anders: een regel.

## 2. Schrijf `src/rules/<id>.yaml`

Altijd daar, ook als de regel over meer componenten gaat. De bestandsnaam is het id: kebab-case, beschrijft de fout, zonder componentprefix.

```yaml
severity: warn
context: nldd-button-bar
report: ':has(> nldd-toggle-button)'
message: The bar is one surface for actions, and a selected toggle breaks it.
see: patronen/toolbar-with-actions
examples:
  passed: ['<nldd-button-bar><nldd-button text="Bewaar"></nldd-button></nldd-button-bar>']
  failed: ['<nldd-button-bar><nldd-toggle-button text="Vet"></nldd-toggle-button></nldd-button-bar>']
```

| Veld | Betekenis |
|---|---|
| `context` | CSS-selector: de elementen waar het om gaat |
| `assert` | De context moet hieraan voldoen |
| `report` | De context mag hier niet aan voldoen |
| `count` | `{ of, min, max }` telt directe kinderen |
| `ref` | `{ attr, target, equal }` volgt een id naar een ander element |
| Geen van vier | De context zelf is de fout |
| `severity` | `warn`. `error` alleen voor toegankelijke namen en wat niet kan werken; een bestaande regel naar `error` vraagt een `!`-commit |
| `message` | Engels: wat hier fout is. Het waarom staat op de pagina van `see` |
| `see` | `patronen/<slug>`: de regel verschijnt vanzelf op die pagina |

In selectors:
- `[href]` betekent "heeft een waarde", behalve bij booleans.
- `:form-input` en `:cell` zijn klassen uit het manifest; schrijf geen eigen lijst tags.
- `:named-by-field` is waar waar `nldd-form-field` het label aan dit element geeft. Zet hem als laatste optie in een `assert`: `'[accessible-label], :named-by-field'`.

### Twee bijzondere gevallen

**Een naam die weg is:** `removed: ['item-width']`, met de oude naam in het `failed`-voorbeeld.

**Iets wat niet in de markup staat,** zoals een meting of een verkeerde aanroep. Het component geeft het feit door, de regel leest het:

```ts
setState(this, 'no-width', width === 0); // src/utilities/element-state.ts
```
```yaml
runtime: true
context: 'nldd-button-group:state(no-width)'
```

De naam beschrijft het feit, nooit de fout. Deze regels draaien alleen in de browser en hebben geen voorbeelden nodig. Een component bevat nooit meldingstekst.

## 3. Bewijs de regel

```bash
npm run generate:lint-data && npm run lint:rules
NLDD_LINT_CORPUS=../app-a/src,../app-b/src npm run lint:corpus <id>
```

Breekt een patroon de regel, dan klopt de regel niet of het patroon: zoek uit welke. Vraag de paden als `NLDD_LINT_CORPUS` niet gezet is.

## 4. Leg de gevolgen voor

Hoe vaak vuurt hij, in hoeveel apps, met drie voorbeelden. Vraag: terecht? De aanvrager kiest `warn`, `error` of toch niet. Vals alarm komt er niet in. Hernoem-ruis van apps op een oude versie telt niet mee.

## 5. Rond af

`npm run generate:skill-docs`, haal weg wat de regel nu dubbel maakt (een assert in de `.test.ts` van het patroon), en commit met `feat(lint): ...`.
