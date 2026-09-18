# Bijdragen aan het NLDD Designsysteem

Alles begint bij een issue. Wie beslist en waarom staat in
[`PROJECT_GOVERNANCE.md`](./PROJECT_GOVERNANCE.md).

## Een probleem melden of iets voorstellen

Open een [issue](https://github.com/NederlandseDigitaleDienst/design-system/issues). Zet er bij een
bug in welke versie van `@nldd/design-system` je gebruikt, welk component het
betreft en wat je verwachtte. Een klein stukje HTML dat het laat zien scheelt
het meeste heen en weer.

Mis je een component of een variant, beschrijf dan het probleem in je interface
en niet alleen de oplossing die je in gedachten hebt. Vaak blijkt een bestaand
component het al te kunnen, en anders helpt die context bij het ontwerp.

Voor kwetsbaarheden geldt een andere route. Die staan in
[`SECURITY.md`](./SECURITY.md) en horen niet in een openbaar issue.

### Een patroon voorstellen

Een patroon is geen component: het beschrijft hoe je bestaande componenten
samenstelt tot iets dat een taak afhandelt. De set staat in
[`skills/nldd/patterns/`](./skills/nldd/patterns/) en blijft **expres klein**;
acht patronen die kloppen zijn nuttiger dan een catalogus die niemand bijhoudt.

Stel je er een voor, begin dan bij het probleem en het bewijs, niet bij de code:

- **Welke taak** van de gebruiker lost dit op, en waarom lukt dat nu niet met wat
  er al staat?
- **Waar draait het?** Noem de producten of schermen waar deze compositie nu al
  in gebruik is. Een patroon dat in meerdere producten van verschillende teams
  terugkomt is een patroon van het systeem; iets dat in één app staat is
  voorlopig een gewoonte van die app. Dat laatste sluit niets uit, maar het
  bepaalt wel hoe hard het bewijs is.
- **Wat is de regel?** Een patroon zonder "waarom zo" is een stuk voorbeeldcode,
  en dat kan in Storybook.

Code mag later. Draait het patroon eenmaal, dan moet elke `nldd-*`-tag in de
documentatie bestaan: `npm run validate:skill-markup` controleert dat in CI,
tegen de echte component-API.

## Lokaal draaien

Je hebt Node 18 of hoger nodig.

```bash
npm ci
npx playwright install --with-deps chromium
npm run storybook
```

Storybook draait op http://localhost:6006 en is de plek waar je je wijziging
bekijkt. De tests draaien in een echte browser, vandaar Playwright.

```bash
npm test            # unit tests in de browser, blijft meekijken
npm run test:run    # dezelfde tests, één keer
npm run lint        # ESLint, inclusief de lit-a11y-regels
npm run build       # volledige build met alle validaties
```

## Wat er van een wijziging wordt verwacht

**Elk component heeft minimaal een smoke test.** Rendert het zonder fouten en
heeft het een shadowRoot. Zit er logica in (een MutationObserver, slot-beheer,
toetsenbordgedrag, statusovergangen), dan hoort daar een test bij die die
logica raakt en niet alleen het bestaan ervan.

**Visuele waarden komen uit CSS-variabelen.** Hardcodeer geen kleuren, maten of
spacing. De lagen en de voorkeursvolgorde staan in de
[README](./README.md#styling-structuur). `npm run validate:styles` faalt op een
variabele die niet bestaat, zonder fallback.

**Verander je de publieke API van een component** (attributen, slots, events),
draai dan `npm run generate:skill-docs` en commit het resultaat mee. De
gegenereerde referentie in `skills/nldd/` wordt in CI vergeleken met de JSDoc,
en loopt die uit de pas dan faalt de build.

## Commits

Het project gebruikt [conventionele commits](https://www.conventionalcommits.org/nl/).
De prefix bepaalt of er een release uit komt en welke:

| Type | Gevolg |
|------|--------|
| `feat:`, `fix:`, `perf:` | patch-release |
| `refactor:`, `style:`, `docs:`, `build:`, `revert:` | patch-release, want ze raken `dist/` of de meegeleverde skill-docs |
| `chore:`, `ci:`, `test:` | geen release |

Schrijf de titel voor de reviewer: `feat(button): variant toevoegen`. De tekst
voor de consument schrijf je met de hand in de changelog, zie hieronder.

Er staan pre-commit hooks klaar (ESLint, commitlint, witruimte). Die werken
zodra je [pre-commit](https://pre-commit.com) op je machine hebt staan.
Zonder die tool loopt het niet stuk, maar dan vangt CI het pas.

## Pull request

Er is één maintainer, dus je PR wordt door één persoon beoordeeld. Houd hem
klein genoeg om in één keer te lezen. Beschrijf wat er verandert voor iemand
die het component gebruikt, niet alleen wat je hebt aangepast.

CI draait ESLint, de unit tests, de volledige build en een reeks
sync-controles: de exports-map, de plugin-manifesten, de custom elements
manifest en de gegenereerde skill-documentatie. Die controles vergelijken
gegenereerde bestanden met de bron, dus ze falen op vergeten regeneraties en
niet op smaak.

## Changelogconventies

`CHANGELOG.md` wordt bij een merge naar main door semantic-release bijgewerkt.
Die zet een nieuw versieblok bovenaan en vult dat met een kale regel per
release, afgeleid van de commit-titels.

**De leesbare inhoud schrijf je met de hand.** Dat is bewust:
`nldd-avatar: nieuw component voor een persoon of organisatie` zegt een
consument veel meer dan `refactor(avatar): rename css var`. Commit-titels
schrijf je voor reviewers, changelog-regels voor consumenten.

Zet je entry direct bovenaan, boven het nieuwste versieblok. Gebruik geen
`## Unreleased`-kop: semantic-release schuift er vanzelf een versieblok
overheen, waardoor jouw secties onder de nieuwe versie komen te staan.

Deze secties zijn in gebruik:

- **Highlights**: korte toelichting, alleen als er iets te vertellen valt.
- **Breaking**: wijzigingen waarvoor een consument iets moet doen, met de
  migratiestap erbij.
- **Added**: nieuwe componenten, attributen, varianten.
- **Changed**: aanpassingen aan bestaand gedrag die niets breken.
- **Fixed**: opgeloste bugs.
- **Deprecated**: API's die in een volgende release verdwijnen.
- **Removed**: API's die eruit zijn.

Heb je met de hand iets aan de changelog toegevoegd, draai dan
`npm run generate:skill-changelog`. `skills/nldd/changelog.md` is een kopie die
met de plugin meereist en in sync moet blijven.

## Releases

Die gaan vanzelf. Bij een merge naar main bepaalt semantic-release de nieuwe
versie uit de commits, publiceert naar npm en commit de bijgewerkte
`CHANGELOG.md` en pluginmanifesten terug. Verhoog het versienummer niet met de
hand.
