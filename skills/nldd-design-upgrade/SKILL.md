---
name: nldd-design-upgrade
description: "Verhoog de versie van @nldd/design-system in een bestaande applicatie: lees het upgradepad uit de changelog, vind de breaking changes en pas ze toe. Triggers: 'upgraden naar een nieuwe versie', 'nldd bijwerken', 'nldd-versie verhogen', 'wat is er veranderd sinds versie x', 'npm update @nldd/design-system', een afhankelijkheid die een paar versies achterloopt. Voor een nieuwe app bouwen: nldd-design-build. Voor een frontend die nog niet op dit designsysteem zit: nldd-design-migrate."
metadata:
  type: reference
---

# Een bestaande applicatie naar een nieuwere versie brengen

Je gebruikt deze skill als een applicatie al op `@nldd/design-system` draait en naar een hogere versie moet. Dat is iets anders dan de twee buren:

- Bouw je iets nieuws, dan is [`nldd-design-build`](../nldd-design-build/SKILL.md) de plek.
- Zit de frontend nog niet op dit designsysteem (Tailwind, een ander design system, server-gerenderd), dan hoort het bij [`nldd-design-migrate`](../nldd-design-migrate/SKILL.md).

Een upgrade zit daar precies tussenin: de componenten kloppen al, maar de API onder je code is bewogen. De vaardigheid is dezelfde als bij een migratie, alleen met een kleinere delta en één extra valkuil, hieronder.

## Het versienummer waarschuwt, de changelog vertelt

Zolang de major 0 is, geeft een breaking change een nieuwe minor en is elke andere release een patch: `feat`, `fix`, `refactor` en `docs`. Zo leest npm het ook: `^0.9.0` neemt 0.9.x mee, maar niet 0.10.0. Een breaking change komt dus nooit ongevraagd binnen; die haal je zelf op door de minor te verhogen.

Dat geldt vanaf 0.9.0. Daarvoor kwam alles uit als patch, ook een breaking change: `0.8.80` naar `0.8.90` ziet eruit als tien onschuldige patches en kan een verwijderd attribuut bevatten.

Een nieuwe minor zegt alleen dát er iets breekt, niet wat. Gebruik daarom de changelog van de doelversie als je upgradepad: `https://github.com/NederlandseDigitaleDienst/design-system/blob/v<doelversie>/CHANGELOG.md`. Die bevat elke versie tot en met je doel. [`changelog.md`](../nldd-design/changelog.md) in deze skill hoort bij de versie van de plugin, en die kan ouder zijn dan je doel.

## Werkwijze

Een upgrade heeft twee delen. Wat zeker is, doet een opdracht. Wat een keuze vraagt, doe jij, met de lijst die de opdracht achterlaat.

### 1. Laat de opdracht het zekere deel doen

```sh
npx @nldd/design-system@<doelversie> upgrade --report upgrade.md
```

Kies de doelversie één keer, bijvoorbeeld `0.27.1`, en gebruik die in elke stap. Met `@latest` krijg je wat vandaag de nieuwste is. De opdracht upgradet naar zijn eigen versie, want een linter kent de API van de versie waar hij bij hoort.

Hij doet vier dingen, in het hele project:

- **De versie ophogen op elke plek die hij kent**: een `package.json`, ook in een submap of een monorepo, een adres of opdracht met `@nldd/design-system@<versie>` erin, en een eigen JSON-bestand dat de versie vastlegt, met de hash van het pakket als die erbij staat. Het bereik dat je koos (`^`, `~` of exact) blijft.
- **De lockfile herschrijven**, met npm, pnpm, yarn of bun. Alleen de lockfile: `node_modules` installeer je zelf.
- **Elke fix toepassen die zeker is**: een naam of waarde die anders heet en hetzelfde betekent. Ook in Markdown en in Python.
- **Opschrijven wat overblijft**, in `upgrade.md`.

`--format json` geeft hetzelfde als gegevens, voor een script. Draai de opdracht gerust nog een keer: wat al gedaan is, laat hij staan.

### 2. Werk de lijst af

Het verslag is je werklijst. Het heeft deze delen:

| Deel | Wat je ermee doet |
|---|---|
| Nog te doen | Elke plek is een keuze die de linter niet voor je kan maken. De melding zegt wat er veranderde. Los ze allemaal op |
| Niet gelezen | Bestanden met componenten die de linter niet kan lezen. Loop ze zelf na op de oude namen uit de changelog |
| Brekende wijzigingen onderweg | Lees ze. Niet elke wijziging heeft een lintregel: een andere maat of een ander gedrag vind je alleen hier |
| Wat de linter verder vindt | Waarschuwingen van regels die nieuw kunnen zijn in deze versie. Zie [De linter in je eigen CI](#de-linter-in-je-eigen-ci) |

Verifieer bij twijfel tegen [`reference.md`](../nldd-design/reference.md) of een attribuut, slot of event in de doelversie bestaat zoals je verwacht. Die referentie hoort bij de versie van de plugin, en die kan ouder zijn dan je doel.

Waar je kiest, kies je voor wat de pagina deed voor de upgrade. Een titel die als gewone tekst bedoeld was, blijft gewone tekst. Een keuze die niet uit de changelog volgt, zet je apart in de pull request.

### 3. Lees de draaiende app

In een app met React, Vue of een ander framework is de lijst uit de bron niet compleet. Zie [Waar de linter niet komt](#waar-de-linter-niet-komt). Start de app en geef het adres mee:

```sh
npx @nldd/design-system@<doelversie> upgrade --url http://localhost:5173 --crawl --report upgrade.md
```

Het verslag krijgt dan een deel "Op de draaiende pagina", per regel en per onderdeel van je app. Eén onderdeel dat in elke rij van een lijst staat, is daar één regel met een hoog aantal: daar begin je.

### 4. Kijk

Vergelijk voor en na, zoals hieronder staat, en draai de eigen controles van het project.

Een site ging elf minors omhoog met alleen `lint --fix`, en leek daarna klaar. De koppen waren te groot en twee knoppen grijs. Alle vijf de oorzaken stonden in de `Breaking`-secties van 0.22.0, 0.23.0 en 0.25.0. Daarom staat het lezen daarvan in de lijst, en niet alleen de linter.

## Waar de versie staat

De opdracht hoogt de versie op waar hij zeker weet dat het de versie van het pakket is. Onder "De versie" in het verslag staat elke plek, en ook wat hij liet staan: een bereik als `>=0.13`, `workspace:*` of een tag is een keuze van het project.

Zoek daarna zelf nog één keer op het oude versienummer door de repository. Een versie in een Dockerfile, in een variabele van een workflow of in lopende tekst herkent de opdracht niet. Staat de versie op meer plekken, dan vergelijkt de build ze vaak en weigert hij als ze verschillen.

Zet de versie en de aanpassingen in één commit als een hook of de CI de site bouwt. Een commit met alleen de nieuwe versie is een kapotte stand, en faalt daar.

## Waar de linter niet komt

De linter leest sjablonen, componenten en Python. Dit ziet hij niet of maar half:

- **Markdown in een gewone scan.** `nldd lint` leest een Markdown-bestand alleen als je het noemt, omdat documentatie vol staat met voorbeelden die bewust fout zijn. `nldd upgrade` leest ze wel allemaal.
- **Markup in een string van een taal zonder lezer**, zoals PHP, Ruby of Go. Python leest hij: elke string met een component erin, met `{naam}` en `%s` als ingevulde waarde. Een string met een quote achter een backslash slaat hij over, en dat meldt hij als `file-not-read`.
- **Wat over meer strings of bestanden verdeeld is.** Van een element dat in de ene string opent en in de andere sluit, beoordeelt hij alleen de attributen.
- **Wat pas bij het bouwen ontstaat.** Lint daarom ook de gebouwde site: `nldd lint <buildmap>`. Daar staat alle markup bij elkaar, waar hij ook vandaan kwam.

Een bevinding in de gebouwde site wijst naar een pagina, niet naar de bron. Zoek het element terug in de repository en herstel het daar.

In een app met React, Vue of een ander framework komt er een vierde plek bij: **wat een expressie of een variabele invult**. De linter ziet `{naam}` als inhoud en `color={kleur}` als waarde, en kan geen van beide beoordelen. Hij meldt dan niets, ook als het fout is. Een app hield na `lint --fix` 13 bevindingen over en had ruim 300 keer tekst in een `nldd-text` via een expressie, die sinds 0.25.0 in een `<p>` of `<span>` hoort. Twee dingen vinden dat wel.

**De compiler.** Het pakket levert getypeerde elementen: `import '@nldd/design-system/react'` of `'@nldd/design-system/vue'`. Een waarde die niet meer bestaat is dan een typefout, ook als ze uit een variabele komt. Draai je typecontrole direct na het ophogen van de versie.

**De draaiende pagina.** `nldd lint --url` opent je app in een browser en leest de pagina zoals ze daar staat, met dezelfde regels en dezelfde uitvoer als op de bron:

```sh
npx @nldd/design-system@<doelversie> lint --url http://localhost:5173 / /aanvragen /instellingen
```

Met `--crawl` volgt hij ook de links naar pagina's van dezelfde site. Een bevinding wijst naar een regel in wat de browser heeft gebouwd, met het element erbij. In een dev-build van React of Vue staat er ook welk onderdeel van je app het tekende, en daar zoek je in de bron. `--statistics` geeft een telling per regel. Die telt wat er getekend is: één regel in een rij van een lijst telt voor elke rij mee. Staat je app achter een inlog, geef dan een opgeslagen sessie mee met `--storage-state`. De opdracht heeft Playwright met Chromium nodig, in je project of met `--playwright <module>`.

`nldd upgrade --url` doet hetzelfde en zet de uitkomst in het verslag.

Een eventnaam die via een eigen functie loopt, zoals een hook `useEvent(ref, naam, toon)` met de naam als tekst, vindt de linter als de naam van die functie over events gaat. Hij meldt het en herstelt het niet, want hij kan niet zien of je functie luistert of verstuurt. Heet je functie anders, zoek dan zelf op de oude namen.

## De linter in je eigen CI

Draait je project `nldd lint` van de vastgepinde versie, dan krijg je met de upgrade ook de regels van elke versie ertussen. Dat zijn bevindingen over markup die al zo stond, naast wat de upgrade breekt. Los ze op, of neem ze bewust op in de baseline met `--update-baseline`. Een fout (`error`) los je op: die zegt dat iets niet werkt.

Lint je in de buildmap zelf, of heet die map anders dan `dist` of `build`, dan leest de linter ook de gebundelde scripts van het designsysteem en meldt hij de stijlen van de componenten als overschrijvingen van jou. Sluit de map met de bundel dan uit, met `"exclude"` in `.nldd-lint.json`.

## Voor en na vergelijken

Wat breekt, zie je alleen door te kijken. `nldd compare` doet dat voor je, met twee versies naast elkaar:

```sh
npx @nldd/design-system@<doelversie> compare <oude versie> <nieuwe versie> --out beelden --label-before 0.22.0 --label-after 0.27.1
```

Een versie is een map met een gebouwde site, of het adres van een draaiende. Bouw een statische site twee keer, op de oude en op de nieuwe stand, en geef de twee mappen. Draai van een app met een server twee dev-servers naast elkaar, elk op een eigen poort, en geef de twee adressen met de paden die je wilt zien.

De opdracht opent elke pagina van beide versies op 1280 en op 390 pixels breed. Per pagina die verschilt schrijft hij één beeld, met voor en na naast elkaar en een omlijning om elk element van het designsysteem dat veranderde:

| Kleur | Betekenis |
|---|---|
| Roze | het element heeft een andere maat |
| Blauw | het element is even groot en ziet er anders uit, zoals een andere kleur |
| Rood | het element wordt niet meer getekend |
| Groen | het element is er nieuw |
| Grijs | andere pixels buiten een element, op een pagina die even hoog bleef |

Inhoud die alleen lager op de pagina kwam te staan, telt niet. Een pagina is pas gelijk als de twee schermafdrukken pixel voor pixel gelijk zijn. Ook deze opdracht heeft Playwright met Chromium nodig.

Rood en blauw zijn bijna altijd een fout uit de upgrade. Roze is vaak een bewuste wijziging in het designsysteem, en dan staat ze in de changelog. Zet de beelden in de pull request, met wat je erop ziet.

## Klaar

Een upgrade is klaar als dit allemaal waar is:

- `nldd upgrade` heeft onder "Nog te doen" en "Niet gelezen" niets meer staan;
- de brekende wijzigingen uit het verslag zijn gelezen, en elk punt dat de app raakt is verwerkt;
- de versie is op elke plek gelijk;
- `nldd lint` van de doelversie vindt niets nieuws in de gebouwde site;
- de typecontrole slaagt, en `nldd lint --url` vindt niets nieuws op de draaiende pagina's;
- de beelden van voor en na zijn bekeken, en wat verschilt is verklaard;
- de eigen controles van het project slagen: de build, de tests en wat er in de CI draait;
- een keuze die niet uit de changelog volgt, staat apart in de pull request.

## Wat er stil misgaat

Wat een upgrade breekt, faalt zonder foutmelding. Een onbekend attribuut, een verdwenen CSS-variabele of een hernoemd of verwijderd slot rendert gewoon niets of valt terug op een default: inhoud met `slot="indicator"` verdwijnt bijvoorbeeld stil sinds die slot van `nldd-activity-indicator` weg is. Componenten waarschuwen in een dev-build wel over een verkeerde compositie, maar juist deze drie zien ze niet aankomen. Na een upgrade is "het ziet er nog goed uit" daarom geen bewijs.

- **Hernoemde CSS-variabelen zijn de meest gemiste val.** Je eigen CSS verwijst dan naar een naam die niet meer bestaat, zonder foutmelding: de declaratie valt gewoon weg. `nldd lint` vangt dit voor `--primitives-*`, `--semantics-*`, `--components-*` en de `--context-*`-variabelen met een default (`token-not-found`) en noemt de opvolger als die er is. De changelog zet zo'n token onder `Breaking`. Een `--_*` of `--components-*` hoort niet in je eigen CSS: die zijn van één component en bewegen met dat component mee.
- **Een hernoemd event breekt ook stil.** De listener op de oude naam wordt nooit meer aangeroepen, terwijl het component zijn eigen deel nog doet: een tabbalk kiest zijn tab, maar het paneel wisselt niet. `nldd lint` vangt dit (`event-renamed`) in `addEventListener`, in `@…` en `v-on:` van Vue, Lit en Alpine, in `(…)=` van Angular en in `hx-on`, en `--fix` hernoemt het waar de naam letterlijk staat. Hij vindt de naam ook in een eigen functie die over events gaat, zoals een hook. Een naam die je zelf samenstelt (`addEventListener(prefix + 'change')`) ziet hij niet; zoek daarvoor op de oude namen uit de changelog.
- **Controleer de versie die je echt draait**, niet de versie in `package.json`. Een `^0.8.44` in `package.json` met een lockfile van maanden oud draait iets anders dan je denkt. `npm ls @nldd/design-system` geeft het antwoord.
- **Verifieer in een browser, niet in de code.** Bouw het en kijk. Dat is de enige manier om een stille terugval te zien. Zie [Voor en na vergelijken](#voor-en-na-vergelijken).

## Verder

De inhoudelijke kant van een omzetting (wat je per herkomst tegenkomt, hoe je een component-voor-component vervanging aanpakt) staat in [`nldd-design-migrate`](../nldd-design-migrate/SKILL.md). Die skill gaat uitgebreider in op wat er stil misgaat en hoe je dat merkt; bij een grote sprong omhoog is dat ook voor een upgrade nuttige stof.
