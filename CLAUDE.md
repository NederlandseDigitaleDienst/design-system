# NLDD Designsysteem

Web Components voor de Nederlandse Digitale Dienst (Rijksoverheid).

## Snelreferentie

```bash
npm run www              # De website met alle componenten en patronen, op localhost:5173
npm run build:styles     # Kopieer CSS + fonts naar dist
npm run build            # Volledige build
npm run generate:all     # Alle gegenereerde bestanden, in de volgorde van wat ze lezen
```

Welk script welk gecommit bestand maakt, staat in `scripts/generated-files.js`. `npm run check:generated` draait ze allemaal en noemt per verouderd bestand het script; `validate.yml` doet hetzelfde.

## Ontwikkelworkflow

**Gebruik ALTIJD deze skills voor de juiste workflow:**

| Taak | Skill | Beschrijving |
|------|-------|--------------|
| Nieuwe branch starten | `/worktree <branch>` | Maakt worktree + kopieert .env en .claude/ |
| Component maken/updaten | `/component <naam>` | Alle regels, formatting, BEM, CSS, templates |
| Lintregel toevoegen | `/rule <wat er mis is>` | Schrijft de regel, test hem op patronen en echte apps |

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
  {naam}.stories.ts   # Stories: de voorbeelden op de pagina van het component
  {naam}.test.ts      # Unit tests
```

## CSS Variabelen

### Structuur

| Laag | Prefix | Beschrijving |
|------|--------|--------------|
| **Primitives** | `--primitives-*` | Basiswaarden (kleuren, spacing, typografie) |
| **Semantics** | `--semantics-*` | Betekenisvolle variabelen (buttons, controls, surfaces) |
| **Context** | `--context-*` | Wat een oppervlak doorgeeft aan wat erop staat. Tien ervan zijn API en hebben een default op `:root` in `variables.css` (achtergrond, tekst, secondary, vier statuskleuren en drie linkkleuren); de rest is bedrading tussen componenten |
| **Component** | `--components-*` | Waarden van één component die een thema moet kunnen zetten (`--components-badge-accent-background-color`). Alleen gelezen door dat component |
| **Lokaal** | `--_{component}-*` | Interne variabelen van één component (`--_button-background-color`). Niet voor extern gebruik |

Wat één component nodig heeft, staat als lokale variabele in zijn eigen `:host`; wat meer componenten delen, is een semantics-token. Een lokale variabele mag naar een semantics- of een primitives-token wijzen, verderop in de stijlen gebruik je alleen de lokale variabele. Wil iemand een component anders, dan is dat een issue en geen override.

De enige uitzondering is een waarde van één component die een thema moet kunnen zetten. Een thema bereikt alleen `:root`, niet de stijlen van een component. Zo'n waarde wordt een `--components-{component}-*`-token in `variables.css`, onder `# Components`. Alleen dat component leest hem. Het is geen terugkeer van de oude componentlaag: die was er om componenten van buitenaf te overschrijven, deze laag is er alleen voor thema's.

Een component dat een eigen achtergrond schildert, zet `--context-background-color` en daarnaast de tekstkleuren met `${surfaceContent}` uit `shadow-resets.ts`, of met eigen waarden als de tekst op dat vlak anders is (de hero, de tooltip). Elke regel die `color` zet (een knop, een tag, een geselecteerde rij, een label), zet `--context-content-color` in dezelfde regel, met dezelfde waarde; `validate:styles` faalt als dat ontbreekt. Uitgezonderd zijn `inherit`, `currentColor` en de systeemkleuren van forced colors. Geeft een regel bewust niets door, dan zegt hij dat met `/* No context: <reden> */` (het icoon, dat de context zelf leest). Wat erin staat leest de context: tekst (`nldd-text`, `nldd-title`, `nldd-rich-text`, de cells), de spinner, `color="content"` op badge, avatar en de controls, en de functionele kleuren van `nldd-icon`. Zo dwingt het designsysteem zijn tekstkleur af, en begint elk vlak weer bij de standaard. De tien hebben een default, dus een fallback is niet nodig.

Links lezen `--context-link-color` en zijn hover- en active-kleur. Een vlak waarop het linkblauw niet leest (de accent-hero, de tooltip, een highlighted rij), zet ze met `${linksFollowContent}` in dezelfde regel als `--context-content-color`: de link krijgt dan in elke toestand de tekstkleur. Een variant die weer een gewoon vlak is, zet ze terug met `${defaultLinks}`, dat ook in `${surfaceContent}` zit. Zet altijd alle drie: wie er één zet, krijgt bij hover het blauw van `:root` terug, en `nldd lint` meldt dat in de CSS van een app als `link-context-needs-states`.

Een custom property erft door shadow boundaries heen, naar alles wat in de flat tree onder de host hangt, ook de interne elementen van een ander component dat erin geslot wordt. Daarom draagt elke lokale variabele de naam van zijn component: een generieke `--_background-color` op `nldd-tooltip` kwam zo terecht op de knop van een `nldd-icon-button` erin. Een subcomponent dat een variabele van zijn ouder leest of overschrijft, gebruikt de naam van de ouder (`--_step-bar-ring-color` in `nldd-step-bar-item`).

### Validatie

CSS variabelen worden gevalideerd tijdens de build (`npm run validate:styles`):

- `--context-*` — Niet gevalideerd. De tien met een default in variables.css en die een component documenteert met `@cssprop` (`--context-inset-top` op `nldd-page`) zijn tokens voor `nldd lint`; elke andere in `src/` is bedrading.
  - Een app die bedrading leest of zet, krijgt `internal-context-no-use`. Een nieuwe context-variabele die apps mogen lezen of zetten, krijgt dus een `@cssprop` bij het component dat hem leest of zet, en een regel in de changelog
- `--_*` — Gevalideerd binnen dezelfde componentmap, en het voorvoegsel moet van een component in die map zijn
- `--components-*` — Gevalideerd tegen variables.css, en het voorvoegsel moet van een component in die map zijn
- `--primitives-*`, `--semantics-*` — Gevalideerd tegen variables.css

Geen fallbacks. CI faalt als variabelen ontbreken.

### Een token weghalen

Een token dat uit `variables.css` verdwijnt, breekt elke stylesheet van een app die hem noemt, en de browser zegt niets: de declaratie valt weg. `npm run generate:lint-data` (onderdeel van `generate:cem`) zet elk verdwenen token in `src/assets/styles/removed-tokens.json`, met de laatste versie die hem had. Heeft hij een opvolger, voeg dan `"use"` toe; `nldd lint` noemt die dan in zijn melding en `--fix` hernoemt hem. Een `use` is dus alleen een token met dezelfde betekenis, en hij moet zelf nog bestaan (een test in `lint/lint.test.mjs` bewaakt dat). `validate:changelog` faalt zolang de komende release een verdwenen token niet noemt; zet hem onder `### Breaking`.

Een vertaalkey gaat net zo: verdwijnt hij uit een `.i18n.ts`, dan zet `generate:lint-data` hem in `src/translations/removed-keys.json`. Voeg `"use"` toe als hij een nieuwe naam heeft, dan noemt `nldd lint` die bij een `translations`-attribuut met de oude key.

## Testen

Elk component MOET minimaal een **smoke test** hebben. Run tests met `npm test`.

1. **Smoke test** (verplicht): rendert zonder errors, heeft een shadowRoot
2. **Logica tests** (verplicht bij complexe logica): test MutationObservers, slot management, attribuut propagatie, event handlers, state transitions

**Test helpers** (`src/test-utils.ts`):
- `fixture<T>(html)` — maakt DOM element, wacht op Lit updateComplete
- `cleanup(el)` — verwijdert fixture wrapper uit DOM (gebruik in afterEach)
- `waitForUpdate(el)` — wacht op MutationObserver + Lit re-render cycle

## Taal

- Console-meldingen (`console.warn`/`console.error`), JSDoc en code-commentaar zijn US English: ze zijn voor de developer die het pakket gebruikt. UI-teksten en de vertaalde defaults blijven Nederlands.

## Git

- **NOOIT pushen zonder expliciete toestemming van de gebruiker.** Alleen pushen als de gebruiker letterlijk zegt dat je mag pushen. Commit maken mag wel, pushen niet.

## Codekwaliteit

- Pre-commit hooks: ESLint, commitlint
- Conventionele commits: `feat(button): add variant`, `fix(checkbox): focus ring`

## Pakketversies

Versies worden **automatisch** verhoogd door semantic-release bij merge naar main.

Leidend criterium: verandert de commit wat consumers krijgen (`dist/` of de meegeleverde `skills/*`)? Zo ja, dan hoort er een release uit te komen. `docs:` telt daarin mee, want de plugin-versie volgt de pakketversie: zonder release halen consumers de gewijzigde skill-docs nooit op (zie Plugin-versie).

| Commit type | Versieverhoging |
|-------------|-----------------|
| `feat:` | Patch (0.5.0 → 0.5.1) |
| `fix:`, `perf:` | Patch (0.5.0 → 0.5.1) |
| `refactor:`, `style:`, `docs:`, `build:` | Patch (raken `dist/` of de skill-docs) |
| `revert:` | Patch (een revert moet consumers ook bereiken) |
| `feat!:`, `fix!:` (elk type dat een release geeft, met `!`) of `BREAKING CHANGE:` | Minor (0.8.100 → 0.9.0) |
| `chore:`, `ci:`, `test:` | Geen, ook niet met `!` of `BREAKING CHANGE:` |
| Niet-herkend (geen conventionele prefix) | Patch (behandeld als feat) |

Zolang de major 0 is, is minor het signaal voor een brekende wijziging en is elke andere release een patch. Zo werkt semver onder 1.0, en zo leest npm het ook: `^0.9.0` neemt 0.9.x mee, maar 0.10.0 niet. Een brekende release komt dus nooit ongevraagd bij een consument binnen. Het `!` in de titel telt alleen dankzij de `breakingHeaderPattern` in `.releaserc.json`; zonder die regel ziet de commit-analyzer alleen een `BREAKING CHANGE:` in de body. Gaat het pakket naar 1.0, pas dan de regels aan: brekend wordt major en `feat` minor.

**Handmatig versie verhogen is niet nodig.** Gebruik conventionele commits en CI doet de rest.

## Changelog

`CHANGELOG.md` wordt door semantic-release beheerd: bij elke merge naar main zet het een nieuw versieblok (`## [x.y.z](compare-link) (datum)`) bovenaan, afgeleid van de conventionele commits.

**De leesbare inhoud schrijf je met de hand.** Dat is bewust: `nldd-avatar - nieuw component voor een persoon of organisatie` zegt een consument veel meer dan `refactor(avatar): rename css var`. Commit-titels schrijf je voor reviewers, changelog-entries voor consumers. Het gegenereerde deel is daarom expres niet meer dan het versiekopje; de `### Highlights` / `### Added`-secties eronder zijn handwerk.

Laat daarom de regel `"preset": "conventionalcommits"` in `.releaserc.json` staan. Haal je die weg, dan valt de release-notes-generator terug op zijn eigen default en gaat hij de notes alsnog in `### Features` / `### Bug Fixes` opdelen, wat je juist niet wilt.

Wil je toch handmatig iets toevoegen (bijv. iets dat semantic-release niet uit de commits haalt):

- Zet de entry **direct bovenaan**, boven het nieuwste versieblok. **Geen `## Unreleased`-kopje** — dat past niet in het door semantic-release gegenereerde format.
- Gebruik de Keep-a-Changelog-secties (`### Added`, `### Fixed`, `### Breaking`, …), zoals de bestaande versieblokken.
- Regenereer daarna de skill-kopie: `npm run generate:skill-changelog` (of `npm run generate:skill-docs`). `skills/nldd-design/changelog.md` is een gegenereerde kopie van de root-CHANGELOG en moet in sync blijven.

## Iconen

Een icoon is een bestand in `src/components/content/icon/icons/`; de bestandsnaam is de icoonnaam. Staat er iets **tussen haakjes** in de naam, dan is dat een alias: haal het uit de bestandsnaam en zet het in `icon-aliases.js` (`'brand': 'seal-star'`). Een icoon staat op een canvas van 96×96, regular en light allebei (`ICON-STYLE-GUIDE.md`). Optimaliseer nieuwe bestanden naar de huisstijl met `npm run optimize:icons -- <bestand.svg> …` (svgo, instellingen in `scripts/svgo.config.mjs`). Een export op 24×24 of 32×32 zet het script eerst naar 96 en rondt pas daarna af; een andere viewBox weigert het. Verder: geen `width`/`height`, `fill="currentColor"` in plaats van een vaste kleur, geen `fill-rule`, pad afgerond op één decimaal, tabs, elk pad op een eigen regel. Draai het één keer, op de export uit Figma: een tweede ronde rondt opnieuw af en verschuift het icoon.

Nieuwe en hertekende iconen krijgen een "Nieuw"- of "Bijgewerkt"-label in de icon-gallery. Die twee lijsten staan in `icon-gallery-status.ts` en worden bij elke batch **vervangen**, afgeleid uit de git-historie; dat bestand legt in zijn kop precies vast hoe je ze afleidt en welke valkuil er zit (`--follow` niet gebruiken).

Draai daarna `npm run build:icons` (registry) en `npm run generate:skill-docs` (de icoon- en aliaslijst in `skills/nldd-design/reference.md`), en zet een nieuw icoon in de changelog onder `### Highlights`.

## Ontwerprichtlijnen

De ontwerprichtlijnen staan in `src/docs/design-guidelines.md` (op de website `/richtlijnen/`): dat is de enige bron. Wijzig je ze, draai dan `npm run generate:skill-principles` (of `npm run generate:skill-docs`) en commit het resultaat. `skills/nldd-design/design-guidelines.md` is een gegenereerde kopie die met de plugin meereist en in sync moet blijven; er is geen aparte ontwerprichtlijnen-skill meer. Houd de tekst em-dash-vrij (komma's, punten of haakjes).

Een ontwerpregel staat daarmee op één plek. Een skill of een patroon mag hem hoogstens in één zin noemen met een link naar de sectie, en schrijft hem niet opnieuw uit. Doe je dat wel, dan lopen de twee versies uiteen: de sticky-headerregel stond een tijd strenger in `nldd-design-build` dan in de richtlijn zelf, en niemand zag dat.

Hetzelfde geldt een laag lager voor gedrag: wat een component doet, documenteer je in zijn JSDoc. De skills erven dat via `reference.md`, dus een compositieregel in een skill die het gedrag van één component beschrijft hoort in dat component thuis.

## Website

De website in `www/` is de documentatie: de landingspagina, en daarachter een pagina per component, per patroon en per onderwerp. Hij draait op `design.digitaledienst.overheid.nl` en is gebouwd met de componenten zelf, rechtstreeks uit `src/`. `npm run www` start hem lokaal, `npm run build:www` bouwt hem naar `www-dist/`.

De landingspagina (`www/index.html`, met `www/main.ts` en `www/styles.css`) is met de hand geschreven en blijft zoals ze is: de generator vervangt alleen haar `<head>` en haar balk, zodat ze hetzelfde menu heeft als elke pagina. De pagina's erachter worden gegenereerd (`www/build/site.js`) uit bronnen die er al zijn:

| Pagina | Bron |
|--------|------|
| `/componenten/<naam>/` | `<naam>.stories.ts` voor de voorbeelden, `custom-elements.json` voor de API-tabel |
| `/patronen/<slug>/` | `src/patterns/<slug>/`, met de lintregels die naar het patroon wijzen eronder |
| `/richtlijnen/`, `/themas/`, `/iconen/`, `/vertalingen/`, `/breakpoints/` | `src/docs/*.md` |
| `/toegankelijkheid/` | `docs/ACCESSIBILITY.md` |
| `/changelog/`, `/changelog/<versie>/` | `CHANGELOG.md`, een pagina per versie |
| `/aan-de-slag/` | `www/content/*.md` |

Een component heeft dus een pagina omdat het een stories-bestand heeft; niemand schrijft een componentpagina. De landingspagina heeft een balk met alleen het logo en de naam: ze leidt zelf, per sectie, naar de onderdelen. Elke pagina erachter is een applicatie, zoals het patroon Applicatie: een werkbalk boven een `nldd-navigation-split-view`. In de werkbalk staan een terugknop naar de landingspagina, de naam van de site en de themaknop. De eerste zijbalk heeft de secties (`NAVIGATION` in `site.js`) en onderaan de links over de site (`ABOUT`), de tweede de pagina's van een sectie die ze heeft (componenten, patronen, versies), en main de pagina zelf. Een overzicht als `/componenten/` laat main leeg, zodat een telefoon op de lijst opent. `/documentatie/` heeft alleen de secties en een lege main; daar gaat de terugknop van een pagina zonder eigen lijst heen. Wat op een smal scherm wegvalt, bereik je met de terugknop in de titelbalk. Er zijn geen breadcrumbs. Elke pagina is een eigen HTML-bestand, maar een klik herlaadt niet: `www/client/navigate.ts` haalt de volgende pagina op en vervangt alleen de panes die verschillen, zodat de zijbalken blijven staan. De themaknop opent een popover met het thema en de kleurmodus, zoals op de landingspagina: de keuze geldt voor elke pagina en elk voorbeeld, zodat je een component in de kleur van je eigen organisatie ziet.

Een voorbeeld staat altijd op een podium (`site-stage`, `www/client/stage.ts`). Dividers onder de balk en boven de bediening zeggen wat voorbeeld is en wat pagina; het vlak ertussen heeft over de volle breedte de ondergrond en het kleurenschema van het voorbeeld. De balk, de bediening en de code zijn nldd-componenten. Code van meer dan 12 regels staat op de tab Voorbeelden dicht in een accordion. De controls onder het eerste voorbeeld komen uit de attributen van het component; `argTypes` in een story vullen alleen aan. De stories importeren nog `storybook/actions` en `storybook/preview-api`; die namen wijzen via een alias naar `www/client/shims/`.

`npm run test:a11y` haalt axe over elke pagina en elk voorbeeld. Een bevinding op de site zelf faalt altijd. Bevindingen in voorbeelden staan in `www/a11y-baseline.json`: een nieuwe faalt, en een opgeloste moet eruit (`npm run test:a11y -- --update`). `www/client/stories.test.ts` rendert elke story, en `www/build/site.test.mjs` controleert dat elke interne link naar een bestaande pagina gaat.

## Patronen

Een patroon beschrijft hoe je bestaande componenten samenstelt tot iets dat een taak afhandelt; een component beschrijft één ding. Ze staan op de website onder `/patronen/` en reizen als `skills/nldd-design-build/patterns/*.md` met de plugin mee naar consumenten.

Een patroon woont in `src/patterns/<slug>/`, met vier bestanden:

- `<slug>.html`: de voorbeeldmarkup, zonder framework. Dit is de enige bron: de live story rendert hem, het codeblok op de docs-pagina toont hem en de skill neemt hem over.
- `<slug>.stories.ts`: rendert de markup via `patternStory()` uit `src/patterns/pattern-story.ts`, plus het beetje gedrag dat een consument zelf schrijft (een knop die een sheet opent).
- `<slug>.md`: de pagina op de website, met het probleem, wanneer wel en niet, de compositie en waarom zo. De regel `<!-- voorbeeld: Standaard -->` zet de story met die naam op de pagina.
- `<slug>.test.ts`: test wat het patroon belooft, op dezelfde markup.

`npm run generate:skill-patterns` (onderdeel van `generate:skill-docs`) maakt daar de skill-pagina van. De vertaling zit in `scripts/lib/skill-patterns.js` met tests ernaast: de voorbeeldregel wordt het `.html`-bestand, en een link naar een pagina van de website (`/componenten/sheet/`) wordt een link naar het andere patroon, naar de component in `reference.md` of naar de ontwerprichtlijnen. `validate.yml` controleert dat de gegenereerde pagina's bij hun bron passen. Link in de pagina dus met het pad op de website, en naar de voorbeelden in `examples/` via hun GitHub-URL. De titel en de bestandsnaam van elk patroon staan in `PATTERNS` in `scripts/lib/skill-patterns.js`; die volgorde is ook de volgorde op de website.

Een regel die over één component gaat, hoort niet in een patroon maar in de JSDoc van dat component. Een patroon houdt de compositie en de redenen die over meer componenten gaan.

De voorbeelden gebruiken één vaste cast, zodat een nieuw patroon schrijven kopiëren is en niet verzinnen: een **aanvraag** (`Aanvraag A-1042`, Dakisolatie, in behandeling; `Aanvraag A-1043`, Warmtepomp, afgerond), een **dossier** (`Dossier D-318`, team Uitvoering; `Dossier D-319`, team Beleid) en als dienstnaam **Mijn Dienst**. Geen datums, jaartallen, product- of organisatienamen, want die verouderen of vragen om een discussie die niets met het patroon te maken heeft. Lopende tekst mag gevulde tekst zijn; labels, knoppen, titels en validatieteksten blijven echt, want juist daar zijn de betekenis en de lengte het punt.

Verwijs je naar een component, dan is de linktekst de tag in backticks: `[`nldd-top-title-bar`](/componenten/top-title-bar/)`, niet "titelbalk" of "title bar". Dat is de naam die ook in de markup en in `reference.md` staat, dus wie erop zoekt vindt hem. In de zin eromheen schrijf je gewoon Nederlands ("de balk", "de rij"), want dan is net gezegd waar het over gaat.

Een patroon komt erbij via een issue, met het probleem en het bewijs erbij (waar draait het, welke taak lost het op); zie `docs/CONTRIBUTING.md`. Een patroon dat niemand meer gebruikt haal je weg.

Elk `nldd-*`-element in de skill-documentatie (`SKILL.md`, `patterns/*.md`, `examples/*.md`) en de README wordt gecontroleerd met `npm run validate:skill-markup`, dat in `validate.yml` draait. Dat zijn alle regels van `nldd lint`, hints inbegrepen: dit is wat consumenten en agents overnemen. Hetzelfde geldt voor de Lit-templates in de stories, met `npm run lint:stories`: de documentatie volgt de eigen regels. Een voorbeeld dat bewust fout is, krijgt een onderdrukking met een reden; zie Linter.

Wat compositie is hoort in een patroon; wat een ontwerpkeuze is hoort in `src/docs/design-guidelines.md`. Die richtlijnen wijzen wizards en megamenu's expliciet af, dus daar komt geen patroon voor.

## Linter

`nldd lint` (`lint/`, de `bin` van het pakket) controleert consumentencode: onbekende tags, attributen, slots, waarden en iconen, en fouten in het samenspel van componenten. Gebruik `/rule` om een regel toe te voegen.

Dezelfde regels draaien op vier plekken:

| Waar | Wat het ziet |
|------|--------------|
| Bron (`.vue`, `.tsx`, `.jsx`, `.js`, `.astro`, `.html`, `.j2`, ook Angular, Django en htmx; markup in strings van `.py` en `.js`; `.mdx` en `.md` als je ze noemt) | Vóór de commit, per bestand, alleen wat zeker fout is |
| Gebouwde HTML (`nldd lint dist`) | Hele pagina's, voor elk framework dat naar HTML bouwt. Scripts in een buildmap (`IGNORED_DIRECTORIES`) slaat hij over: in die chunks staat de CSS van de componenten zelf. Dat gaat op het pad vanaf de projectroot, dus `cd dist && nldd lint` leest ze wel. Er zijn twee vragen, elk met één antwoord: is een script uitvoer van een build (`isBuildOutput` in `lint/project.js`: het staat in een buildmap of is geminificeerd, en een scan slaat het over), en is het de code van het designsysteem zelf (`isComponentCode` in `lint/linter.js`: het leest een eigen variabele van een component, zoals `var(--_button-gap)`, en wat het zet is dan geen override, waar het ook staat) |
| Een draaiende pagina (`nldd lint --url http://localhost:5173`) | Wat een expressie of een variabele invult, en markup die een ander bestand of een andere taal samenstelt. De linter opent de pagina in een browser, schrijft het document op dat hij daar vindt en leest dat als gebouwde HTML. Met de linter van een nieuwere versie is dit de werklijst van een upgrade voor alles wat de bron onbeslist liet. Vraagt Playwright in het project |
| Browser, in DEV (`src/utilities/dev-checks.ts`) | Echte waarden en wat componenten samen renderen. Alleen met een bundler die `import.meta.env.DEV` zet, zoals Vite; Angular en server-rendered apps hebben de eerste twee rijen |

Een draaiende pagina is voor de linter HTML die de browser heeft gebouwd. `lint/rendered.js` schrijft het document op met één tag per regel, zodat een bevinding een regel heeft om naar te wijzen, en geeft het aan dezelfde `lintProject` als een bestand. Er is dus één set regels en één soort bevinding. Wat een component zelf op de pagina schrijft, is niet van de app, en daarom wijkt de draaiende pagina op vier punten af. Een hint draait er niet, want componenten schrijven zelf `style` en `id`. Stylesheets en scripts blijven buiten het document, want een dev-server zet de stijlen van het designsysteem zelf in de pagina. De `--_*`-variabelen in een `style`-attribuut vallen weg, want daarin houdt een component zijn eigen toestand bij. `unknown-attribute` en `unknown-slot` meldt hij niet, want een component noteert zijn toestand ook in attributen buiten zijn API, zoals `loaded` op een afbeelding en `slot="help"` op een helptekst. Een property telt alleen waar een regel naar een attribuut vraagt en alleen als ze afwijkt van wat een vers element heeft, zoals in de dev-checks. In een dev-build van React of Vue staat bij een bevinding welk onderdeel van de app het element tekende.

`nldd upgrade` brengt een project naar de versie van de opdracht zelf, in twee lagen. De opdracht doet wat zeker is: de versie, de lockfile en elke fix. De rest schrijft hij op als werklijst, en daar gaan de skill `nldd-design-upgrade` en een agent mee verder, want wat overblijft vraagt een keuze. Vier dingen houden dat klein en eerlijk:

- **Een pin is herkenbaar aan wat hij is, niet aan waar hij staat** (`lint/pins.js`). De naam van het pakket als sleutel in JSON, `@versie` achter de naam, het adres van de tarball, en een object dat zegt over het pakket te gaan en een `version` heeft. Een versie naast een hash gaat alleen omhoog als die hash die van het register is voor de oude versie. Een adres in een tag met `integrity` blijft staan. Een nieuwe plek is een functie erbij.
- **Per regel staat sinds wanneer hij bestaat** (`src/rules/introduced.json`, bijgehouden door `generate:lint-data`, zoals de verdwenen tokens). `after` is de laatste release zonder de regel. Daarmee weet het verslag wat de upgrade brengt: alles uit `api`, elke fout, en elke regel die na de oude versie kwam. Een waarschuwing van een regel die het project al had, staat apart onder "Stond er al".
- **Een expressie in JSX leest hij met de typen van het project** (`lint/types.js`). `{rij.label}` is tekst als het type een string of een getal is, en dan beslist een regel over tekst wat de syntax open liet. De TypeScript komt uit de `node_modules` van het project, dus dit pakket krijgt er geen afhankelijkheid bij. Een type dat niet oplost is `any`, en `any` is onbekend: zonder afhankelijkheden zijn er minder antwoorden, nooit een verkeerd. `nldd lint` doet dit alleen met `--types`, want meer zekerheid is ook meer fouten, en die mogen niet ongevraagd in de CI van een project komen.
- **Wat open blijft, staat er ook** ("Niet te beslissen in de bron"). Dat zijn de plekken waar de inhoud van een element uit een variabele of een onderdeel van de app komt en een regel die een build kan breken daarvan afhangt. Een gebonden attribuut hoort daar niet bij: dat is overal open.

Markdown leest de opdracht voor wat het rendert: markup in de lopende tekst. Een codeblok of een genoemde tag is documentatie over markup, en telt alleen als je het bestand noemt. Het verslag (`lint/upgrade-report.js`) is in het Nederlands, want het is de tekst van een pull request, en een nieuw soort bevinding hoeft er niets voor: het leest wat de linter geeft. De brekende wijzigingen komen uit `lint/breaking.generated.json`, dat de release uit de changelog schrijft (`generate:lint-breaking`). `.github/workflows/upgrade.yml` draait de opdracht met `--install` in een repository en opent de pull request, met alleen de bestanden die de repository al volgt; `upgrade-fleet.yml` doet dat na een release voor elke repository in de variabele `NLDD_FLEET`. Die lijst staat niet in git: welke apps het designsysteem gebruiken, is aan hen om te vertellen. Wie de pull request opent, volgt uit wat de aanroeper meegeeft: een GitHub App (per repository een eigen token, dus één app voor elke organisatie die hem installeert), een token van een botaccount, of niets, en dan is het `github-actions[bot]` en draait de CI van de app niet. De agent krijgt de checkout en een sleutel voor een model, en geen token van de repository: de push gebeurt in een latere stap. Verander je de opdracht of de workflow, probeer hem dan voor de release op een echte app: `upgrade-fleet.yml` met de hand, met één repository en bij `tool_ref` de branch.

Verander je iets aan de opdracht of aan een lezer, draai hem dan op echte apps voor je het vertrouwt: `npm run upgrade:corpus`, met de paden in `NLDD_UPGRADE_CORPUS`. Het script werkt op een kopie en schrijft nooit in de apps zelf. Met `--strings` noemt het elke plek in een bestand dat als strings gelezen is, en die loop je na: daar wordt een patroon of een voorbeeld het makkelijkst voor markup aangezien. Twee apps lieten drie fouten niet zien die elf wel lieten zien.

Na de agent leest de opdracht het project opnieuw (`nldd upgrade --since <json van de eerste run>`): de tekst van de pull request zegt wat de linter dan nog vindt, niet wat de agent zegt te hebben gedaan. De agent schrijft alleen zijn keuzes op, en die komen er met `--notes` onder. Een verslag dat te lang is voor één tekst op GitHub, knipt `splitReport` op een sectie; de workflow zet de delen als reacties onder de pull request. De agent draait opdrachten in andermans repository en krijgt dus zo weinig als het werk vraagt: geen token van de repository, en de sleutel voor het model blijft buiten elke opdracht die hij draait (`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`); de run controleert dat met een hook en maakt geen pull request als het niet zo was. Dat vraagt een sandbox, en niet elke build draait daarin (esbuild niet): `sandbox: false` geeft de agent de hele runner, voor een repository die je vertrouwt als je eigen. In de vloot staat de agent per repository aan (`NLDD_FLEET_AGENT`, een lijst). Het model staat vast (`claude-opus-5-5`, of `NLDD_FLEET_MODEL`) en de pull request noemt het. Een project dat naar een statische site bouwt, krijgt beelden van `nldd compare` onder de pull request. Hoe het bouwt, geeft de aanroeper mee of schrijft de agent op; de workflow voert het uit, in een stap zonder token. Het token van een app mag geen bestand bijvoegen; de beelden van de reactie staan dan in een commit op `refs/nldd/pictures`, een ref die geen branch is.

De opdracht zelf is klein gehouden: `lint/upgrade.js` stuurt aan, `lint/pins.js` weet waar een versie staat, `lint/lockfiles.js` wat een package manager draait, en `lint/upgrade-report.js` schrijft het verslag.

`nldd compare` fotografeert twee versies van een site en omlijnt wat veranderde. Wat als verandering telt staat in `lint/compare-core.js`, zonder browser: pixels en kaders erin, markeringen eruit. Dat bestand draait op twee plekken, in Node voor de tests en als tekst in de pagina waar een canvas de pixels heeft, dus het importeert niets. De tests van beide opdrachten die een browser openen staan in `lint/e2e/` en draaien met `npm run test:lint-browser`, in de job die Chromium heeft.

Elke lezer geeft `parseSource` hetzelfde terug: de bomen, hoe het bestand gelezen is (`kind`) en wat een fix er mag schrijven (`writes`). Een lezer die meer te zeggen heeft, zoals JSX over een syntaxfout of de stringlezer over wat hij niet kon lezen, zet dat in dat ene resultaat. JSX staat in `lint/jsx.js`, strings in `lint/literals.js`, de rest in `lint/frontends.js`. Een nieuwe uitzondering voor een fix is een veld in `WRITES`, geen vlag op een bevinding.

Wat een template in een tag schrijft (`{% if %}`, `{{ attrs }}`, `*ngIf`) maakt het element onzeker, nooit fout. Wijzig je de parser, draai dan `npm run lint:corpus` op elk soort consument uit de README: Vue, TSX, Astro, Angular, Jinja en gewone HTML.

Markup in een string komt uit `lint/literals.js`, voor Python en voor een script zonder `html`-template of JSX. Een taal levert alleen waar haar literals staan en waar de gaten zitten (`pythonStrings`, `scriptLiterals`); wat een literal bevat, leest `markupIn` voor elke taal hetzelfde, en `readLiterals` in `lint/frontends.js` maakt er bomen van. Een bevinding in een string is hooguit een waarschuwing. Strings werden eerder niet gelezen, en een release die niet brekend is mag de build van een project niet rood maken. Bij een brekende release kan die grens weg. Elke literal met een component is een eigen boom, een gat (`{naam}`, `${naam}`, `%s`) is een gebonden waarde, en van een element dat de literal niet sluit zijn de kinderen onbekend. Een docstring, een commentaar en een patroon dat naar markup zoekt blijven buiten beeld. Een patroon herken je aan de grammatica: na de naam van een tag komt witruimte, `/` of `>`, en `.*`, `[^` of `\s` schrijft alleen een reguliere expressie. Een escape leest hij als wat hij betekent, op dezelfde plek in het bestand: `\"` is een quote en `\n` is witruimte. In zo'n literal schrijft `--fix` niets, want een bewerking zou de backslashes terug moeten schrijven. Elke twijfel eindigt hier in onbekend en nooit in een bevinding. Een nieuwe taal is dus een scanner van haar literals, en geen nieuwe lezer. Een lezer die weet wat hij oversloeg, zet dat op `roots.unread`, en dan komt `file-not-read` daar vandaan: nu alleen nog een raw string met een quote achter een backslash die geen patroon is. Een fix die zelf een quote schrijft (een vertaalkey) doet in een string niets, want die quote kan de literal sluiten.

Een sjabloontaal zonder parser (`UNREAD_EXTENSIONS` in `lint/project.js`, zoals `.svelte` en `.php`) opent een mapscan toch: staat er `nldd-*`-markup in, dan meldt hij `file-not-read`. Zo leest een project in zo'n taal niet als gecontroleerd. Krijgt een taal een parser, haal hem dan uit die lijst.

Een component geeft wat niet in de markup staat door met `setState`, alleen in dev. De browser krijgt de regels als gewone CSS in `src/utilities/dev-rules.generated.ts` en evalueert ze met `el.matches()`. Elke regel is een selector. Wat niet in de markup staat, stelt een component beschikbaar als feit met `setState(this, 'feit', conditie)`, een CSS custom state; de regel leest die met `:state(feit)` en krijgt `runtime: true`. Het feit beschrijft wat er is, nooit de fout: `no-width`, `invalid-max-height`. Een component bevat geen meldingstekst en weet niets van regels: `lint:rules` faalt op `console.warn` en op een state die niets zet. Een attribuut in een `assert` geldt in de browser ook als de property is gezet, want een selector ziet die niet. Een `[x]` in een selector betekent "heeft een waarde", behalve bij booleans. Wat een eigen pseudo-class (`:named-by-field`, `:accepted`, een klasse als `:form-input`) betekent in de bron en wat de browser ervan krijgt, staat op één plek: `lint/rule-compiler.js`. Een nieuwe pseudo komt daar bij, en een selector die de browser niet kan draaien, weigert hij.

De linter hoort bij zijn eigen versie: hij zit in het pakket, dus een project draait de API die het heeft. Met `npx @nldd/design-system@<doelversie> lint` zie je wat een upgrade naar die versie breekt.

| Feit | Enige bron | Daaruit gegenereerd |
|------|------------|---------------------|
| API | JSDoc en TS-types | `custom-elements.json`, `reference.md`, de ingebouwde regels |
| Regel | `src/rules/<groep>/<id>.yaml` | Linter, `reference.md`, sectie `Regels` op een patroon |
| Patroon: hoe en waarom | `<slug>.md` | Website, skill-pagina |
| Voorbeeld | `<slug>.html` | Story, website, skill |

Er zijn drie niveaus: `error` en `warn` kunnen CI laten falen; een `hint` nooit. Een hint zegt hoe iets bedoeld is en wijst met `see` naar het patroon of de richtlijn. Hints draaien op broncode en gebouwde pagina's, niet in de browser: daar schrijven componenten zelf `style` en `id`, en dat zou een hint voor de markup van de app aanzien.

Eén regel, één bestand in `src/rules/<groep>/`, ook als hij over meer componenten gaat. De bestandsnaam is het regel-ID, en dat ID is API: consumers hebben het in baselines en onderdrukkingen staan. Hernoem via `aliases`. Blijft de betekenis gelijk voor elke waarde, dan krijgt een regel een `fix` in zijn YAML: `rename` (attribuut), `value` (waarde of slot), `remove` (iets dat niets meer doet) of `tag`. `nldd lint --fix` past dat toe tot er niets meer verandert, en `lint:rules` bewijst elke fix op de `failed`-voorbeelden. `lint/fix.js` weet hoe een bewerking er per framework uitziet, dus een nieuwe fix is YAML en alleen een nieuw soort bewerking is code. Een hernoemde tag neemt zijn imports, klassen en selectors mee, ook in `.ts` en `.css`, en noemt de regels die hij niet zeker weet. Een bewerking die niet zeker is, maakt geen edit: `fix.js` kiest bij twijfel altijd voor een melding. Wat niet zeker is, blijft een melding. De groep is de map en zit niet in het ID, dus een regel verhuizen breekt niets. Loop de groepen van boven naar beneden af; de eerste die past, is het:

| Groep | Vraag |
|---|---|
| `api` | Bestaat dit, en heeft het effect? |
| `a11y` | Mist hulptechnologie iets? |
| `copy` | Klopt de tekst? |
| `structure` | Klopt de samenstelling? |
| `pattern` | Is er een bedoelde manier? |
| `pure` | Komt alles uit het designsysteem? |

`pure` is de enige groep die een project zelf aanzet, met `--pure` of met een niveau in `.nldd-lint.json` (`"rules": { "pure": "error" }`). Zijn regels gaan over de eigen opmaak van een app (een `class`, `style`, kale HTML, een stylesheet), niet over het gebruik van een component, en zonder die keuze vuren ze nooit. Ze draaien daarom ook niet in de browser. Een stylesheet leest de linter als een `<style>`-element, zodat één regel een CSS-bestand, een `<style>`-blok in Vue en een `<style>` in HTML vangt. `:written(class)` matcht een attribuut dat er staat, ook met een gebonden waarde; `[class]` vraagt een waarde die we kunnen lezen. De regels waarmee `pure` begon zijn `error`, want niemand had de groep toen aan; een regel die er later bij komt, komt als `warn`, zoals elke nieuwe regel.

Een naam begint met waar hij over gaat: de tag zonder `nldd-`, of een begrip uit `CONCEPTS` in `scripts/check-lint-rules.js`. Daarna één van vier vormen: `-needs-` (iets ontbreekt), `-no-` (mag niet), `-max-` (te veel), `-goes-` (verkeerde plek). In `api` eindigt hij op `-renamed`, `-invalid`, `-no-effect` of `-not-found`. `lint:rules` bewaakt dit. Een regel hoort bij een patroon door er met `see: patronen/<slug>` naar te wijzen; hij verschijnt dan vanzelf op die pagina. Een patroon is daarmee recept plus regels, en de `.md` hoeft niet mee te veranderen.

`message` zegt wat hier fout is, in het Engels, zoals een compilerfout. Het waarom staat op de pagina waar `see` naar wijst en wordt niet overgeschreven.

Een regel komt erbij met een echte vondst. Hij heeft een `passed`- en `failed`-voorbeeld, en `npm run lint:rules` faalt als een voorbeeld niet doet wat het claimt, als een selector iets noemt dat niet bestaat, of als een patroon-`.html` de regel breekt. Zo faalt een hernoeming in dezelfde PR. Controleer met `npm run lint:corpus` wat een regel in echte apps doet; de paden komen uit `NLDD_LINT_CORPUS`, zodat er geen lokale paden in de repo belanden. Nieuwe regels komen als `warn`, want `feat:` is een patch en `^0.13.0` neemt die mee: een nieuwe `error` zou CI van consumers ongevraagd rood maken. `error` alleen via een `!`-commit. De regels uit de eerste release zijn hierop de uitzondering, omdat er toen nog geen CI van consumers op draaide. Hetzelfde geldt voor de eerste regels van een opt-in-groep zoals `pure`: die draaien pas als een project de groep aanzet. Een regel die er later bij komt, komt wel als `warn`, want een project met `"pure": "error"` krijgt hem anders meteen als fout.

Elke regel draait in twee werelden: in W+ valt alles wat onbekend is gunstig uit, in W- ongunstig. Geschonden in beide is `failed`, en alleen dat wordt gemeld. Een gebonden waarde of een kindcomponent uit een ander bestand is dus `cantTell` en nooit vals alarm. Hele pagina's zie je alleen op gebouwde HTML of in de browser.

Een attribuut dat een ouder van zijn kinderen leest (`only` op een pane) documenteer je met `@childattr` bij de ouder. Het is dan alleen op een kind van die ouder geldig. Leest hij het op alles wat erin staat, op elke diepte (`sidebar-section-only`), dan is het `@descendantattr`, en draagt het de naam van de ouder als voorvoegsel, want het komt op elementen van andere componenten te staan. Leest een component het op elk element van de pagina, ook buiten zichzelf (`text-editor-for` en `text-editor-command` van `nldd-text-editor`), dan is het `@globalattr`, met hetzelfde voorvoegsel. De linter accepteert het dan overal; of het ergens werkt, zegt een eigen regel (`text-editor-command-needs-editor`).

Kale HTML die een component zelf opmaakt (de `<select>` in `nldd-dropdown`, inline tekst in `nldd-text`, de tekst-elementen in `nldd-rich-text`) documenteer je met `@accepts` bij dat component. Wat telt is of het component het opmaakt (een `::slotted(a)`, een slot dat zijn eigen kop meebrengt), niet of het er alleen in mag staan. Het komt in het manifest en in `reference.md`, en de regels van `pure` lezen het als `:accepted`: zo'n element in het dichtstbijzijnde component dat het accepteert is geen opmaak van de app, mits elk element ertussen ook geaccepteerd is (een `<a>` in een `<h2>` in `nldd-title` wel, een `<h2>` in een slotdrager-`<span>` niet, want `::slotted` bereikt alleen directe kinderen). `lint:rules` faalt op een `::slotted(x)` zonder `@accepts x` bij het element dat die stijl gebruikt, en op een plain element dat de stylesheet van een component zonder shadow DOM bereikt (`nldd-rich-text p`). Een `class` mag alleen op een geaccepteerde `code` of `pre` (de `language-js` uit een markdown-renderer); wat in een `<svg>` staat (`:within(svg)`) is de tekening zelf.

De regels van `pure` wijken op één punt bewust af van de twee werelden: wat een bestand zelf rendert, beoordelen ze in dat bestand. Dat een ouder elders dit component in een `nldd-rich-text` zet, maakt de kale HTML die hier staat niet die van het designsysteem. Wat een bestand rendert, is in JSX wat een geëxporteerd component teruggeeft, ook door een wrapper (`memo`, `export default withRouter(Page)`) of een cast heen. Een boom onder een naam (een hulpcomponent `<Row />`, een variabele `{items}`) beoordelen ze op de plekken waar het bestand die naam gebruikt; zijn kale HTML wordt alleen gemeld als geen van die plekken hem opmaakt. Wordt de naam hier nergens als element of waarde in de markup gebruikt, is hij in het bestand meer dan eens gebonden (een parameter die hem overschaduwt), staat er een component van de app omheen, of wordt de JSX later toegewezen of in een array gezet, dan is het onzeker. Een element zonder kinderen en zonder tekst (`:blank`, een mount point) en een kale drager van een slot (`[slot]`) maken niets op. Een stylesheet geeft een melding per blok, zodat een onderdrukking of een baseline-telling één blok dekt. `:accepted`, `:written`, `:blank` en `:within` kent alleen de linter op broncode; `lint:rules` houdt ze buiten de andere groepen.

Naast de markup leest de linter CSS, in een stylesheet, een `<style>`-blok en een `style`-attribuut, met vier ingebouwde regels die geen selector kunnen zijn: `token-not-found` (een `var(--semantics-…)` die niet bestaat, of niet meer), `local-variable-no-override` (een app die een `--_*` van een component zet), `internal-context-no-use` (een app die een `--context-*` leest of zet die bedrading is) en `file-not-read` (`nldd-*`-markup in een bestand dat hij niet kan lezen). Twee ingebouwde regels gaan over kleur die niet meer aankomt: `style-color-needs-context` (een eigen element zet `color` om een icoon of tekst die de context leest, zonder `--context-content-color`) en `link-color-no-effect` (een linktoken gezet op een element, terwijl een link `--context-link-color` leest). Beide melden alleen wat zeker is. Een `style` leest de linter als string en, in JSX, als object waarvan elke sleutel vaststaat; een class kan een thema op de root zijn en blijft buiten beeld. Daarnaast zoekt `event-renamed` listeners op een event dat een andere naam kreeg: een event dat uit de `@fires` van een component verdwijnt, zet `generate:lint-data` in `src/components/removed-events.json`, en met een `"use"` erbij noemt de linter de nieuwe naam en hernoemt `--fix` hem. Een scan leest daarvoor ook `.ts`-bestanden, maar alleen op die listeners. De CSS van het designsysteem zelf herkent hij aan zijn regels: per selector, met zijn voorwaarden, de eigenschappen die hij zet. Dat overleeft bundelen en minificeren, zodat `pure` op `dist` alleen de CSS van de app meldt (`:design-system` in een selector). De lijst komt uit de stylesheets die `build:styles` meelevert.

`lint/data.generated.json` en `src/utilities/dev-rules.generated.ts` komen uit `npm run generate:lint-data` en worden gecommit, zodat een pre-commit run geen manifest van 2 MB hoeft te lezen. `generate:cem` draait het mee.

## Plugin-versie

De plugin heet `nldd-design-system` en staat in de NLDD-marketplace, een aparte repository (`NederlandseDigitaleDienst/ai-plugins`, marketplace-naam `nldd`) die naar deze repository verwijst. De manifesten hier (`.claude-plugin/plugin.json` voor Claude Code, `.cursor-plugin/plugin.json` voor Cursor) leveren de zes consumentenskills (`nldd-design`, `nldd-design-build`, `nldd-design-validate`, `nldd-design-migrate`, `nldd-design-upgrade`, `nldd-design-contribute`) uit `skills/`. Daarnaast staat er een zevende, `skills/nldd/`, die alleen doorverwijst: die vangt verwijzingen naar de oude skillnaam op en **hoort na 1 maart 2027 verwijderd te worden**, samen met de regel erover in de changelog. Die wegwijzer meldt ook de overstap naar de nieuwe marketplace. Claude Code cachet een plugin op de versie in `plugin.json`: verandert die versie niet, dan halen consumers de skills nooit opnieuw op, hoezeer de inhoud ook is gewijzigd.

Daarom volgt de plugin-versie automatisch de pakketversie. `package.json` is de enige bron; `npm run generate:plugin-version` (onderdeel van `generate:skill-docs`) schrijft die versie naar de plugin-manifesten en naar de oude marketplace. semantic-release draait dit in `prepareCmd` en commit de manifesten mee in de release-commit, zodat de plugin-versie meebeweegt met elke release die de skill-docs verandert. Bewerk de `version`-velden niet handmatig.

Deze repository is daarnaast zelf nog een Claude Code marketplace: `.claude-plugin/marketplace.json` heet `nldd-plugins` en biedt dezelfde plugin aan onder de oude naam `nldd`, zodat installaties van voor de verhuizing (`nldd@nldd-plugins`) blijven werken en updaten. Dat de entry `nldd` heet en het manifest `nldd-design-system` is dus opzet: de installatie hangt aan de entry-naam, de skill-prefix aan de manifest-naam. Hernoem de entry niet en haal het bestand niet eerder weg. Het **hoort na 1 maart 2027 verwijderd te worden**, tegelijk met `skills/nldd/`, en dan vervallen ook de regel in `sync-plugin-version.js`, de asset in `.releaserc.json` en de overstapsectie in de README.
