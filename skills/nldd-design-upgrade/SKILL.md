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

1. **Lees elke versie tussen jouw huidige en de doelversie.** De entries staan nieuwste eerst, met een kop per release (versienummer + datum). Sla niets over: een breaking change kan in een tussenliggende patch zitten.
2. **Scan de `Breaking` / `Breaking Changes` secties eerst.** Die bevatten concrete migratie-instructies: een verwijderd attribuut met zijn vervanger, hernoemde variabelen, gewijzigd gedrag, en wat de layout van je pagina's verschuift zonder dat je code verandert, zoals een andere hoogte of maat. Een echt voorbeeld uit de changelog: `variant` op `nldd-button` en acht andere componenten heet nu `appearance`, met dezelfde waarden, dus `variant="primary"` wordt `<nldd-button appearance="primary" text="Bewaar">`.
3. **Pas de migraties toe in je code** voordat je de nieuwe versie in gebruik neemt. Zoek de hele repository door op de verwijderde attributen, variabelenamen of componenten uit de breaking entries, ook de bestanden die de linter niet leest. Zie [Waar de linter niet komt](#waar-de-linter-niet-komt).
4. **Lees `Highlights`, `Added` en `Changed`** voor nieuwe componenten of attributen die je oudere, omslachtigere code kunnen vervangen.
5. **Verifieer tegen [`reference.md`](../nldd-design/reference.md)** of een attribuut, slot of event in de doelversie bestaat zoals je verwacht. Die referentie hoort bij exact deze release.

6. **Draai `npx @nldd/design-system@<doelversie> lint`, nog vóór je de versie verhoogt, en daarna met `--fix` voor wat alleen een andere naam kreeg.** Kies de doelversie één keer, bijvoorbeeld `0.23.0`, en gebruik die in elke stap. Met `@latest` lint je tegen wat vandaag de nieuwste is, en dat kan een andere versie zijn dan je installeert. Dat is de linter van de doelversie op je huidige code: elke bevinding is iets dat in de nieuwe versie niet meer klopt, en een baseline blijft geldig, dus wat erbij komt is je werklijst. Zie [`nldd-design-validate`](../nldd-design-validate/SKILL.md).

Vuistregel: lees bij elke nieuwe minor de `Breaking` sectie van die versie, en ga onder 0.9.0 niet meer dan een handvol patches in één sprong omhoog zonder de tussenliggende `Breaking` secties te lezen.

Begin bij de `Breaking`-secties en niet bij de linter. Een site ging elf minors omhoog met alleen `lint --fix`, en leek daarna klaar. De koppen waren te groot en twee knoppen grijs, want de markup stond in Markdown en in Python. Alle vijf de oorzaken stonden in de `Breaking`-secties van 0.22.0, 0.23.0 en 0.25.0.

## Waar de versie staat

Zoek elke plek voordat je er één ophoogt. `package.json` en de lockfile zijn er twee. Daarnaast komt voor:

- een eigen bestand dat de versie vastpint, soms met een hash van het pakket, voor een build die het pakket zelf ophaalt;
- een adres van een CDN met de versie erin, in een template of een HTML-bestand;
- een tweede `package.json` in een map met bouwgereedschap, of meer dan één in een monorepo.

Zoek op het oude versienummer door de hele repository. Staat de versie op meer plekken, dan vergelijkt de build ze vaak en weigert hij als ze verschillen.

Zet de versie en de aanpassingen in één commit als een hook of de CI de site bouwt. Een commit met alleen de nieuwe versie is een kapotte stand, en faalt daar.

## Waar de linter niet komt

De linter leest sjablonen en componenten. Drie plekken slaat hij over:

- **Markdown**, tenzij je de bestanden noemt: `nldd lint docs/index.md`. Een scan van een map leest ze niet, omdat documentatie vol staat met voorbeelden die bewust fout zijn.
- **Markup in een string van een andere taal**, zoals Python of PHP dat HTML samenstelt. Die vind je alleen door te zoeken op de oude namen uit de changelog.
- **Wat pas bij het bouwen ontstaat.** Lint daarom ook de gebouwde site: `nldd lint <buildmap>`. Daar staat alle markup bij elkaar, waar hij ook vandaan kwam.

Een bevinding in de gebouwde site wijst naar een pagina, niet naar de bron. Zoek het element terug in de repository en herstel het daar.

In een app met React, Vue of een ander framework komt er een vierde plek bij: **wat een expressie of een variabele invult**. De linter ziet `{naam}` als inhoud en `color={kleur}` als waarde, en kan geen van beide beoordelen. Hij meldt dan niets, ook als het fout is. Een app hield na `lint --fix` 13 bevindingen over en had ruim 300 keer tekst in een `nldd-text` via een expressie, die sinds 0.25.0 in een `<p>` of `<span>` hoort. Twee dingen vinden dat wel.

**De compiler.** Het pakket levert getypeerde elementen: `import '@nldd/design-system/react'` of `'@nldd/design-system/vue'`. Een waarde die niet meer bestaat is dan een typefout, ook als ze uit een variabele komt. Draai je typecontrole direct na het ophogen van de versie.

**De dev-build.** Daar controleren de componenten de pagina zelf, met de regels van de linter, op de elementen zoals ze getekend zijn. [`collect-dev-findings.mjs`](collect-dev-findings.mjs) uit deze skill opent de pagina's van je draaiende dev-server en verzamelt wat ze in de console melden:

```sh
node <pad naar deze skill>/collect-dev-findings.mjs http://localhost:5173 / /aanvragen /instellingen --out bevindingen.json
```

Met `--crawl` volgt het ook de links naar pagina's van dezelfde herkomst. Per regel krijg je het aantal, de pagina's en een paar elementen met hun tekst. In een dev-build van React of Vue staat erbij welk onderdeel van je app het element tekende, en daar zoek je in de bron. Het aantal telt wat er getekend is: één regel in een rij van een lijst telt voor elke rij mee. Staat je app achter een inlog, geef dan een opgeslagen sessie mee met `--storage-state`. Dit werkt alleen op een dev-build van een bundler die `import.meta.env.DEV` zet, zoals Vite. In een productiebuild zitten de controles niet.

Een eventnaam die via een eigen functie loopt, zoals een hook `useEvent(ref, naam, toon)` met de naam als tekst, vindt de linter als de naam van die functie over events gaat. Hij meldt het en herstelt het niet, want hij kan niet zien of je functie luistert of verstuurt. Heet je functie anders, zoek dan zelf op de oude namen.

## De linter in je eigen CI

Draait je project `nldd lint` van de vastgepinde versie, dan krijg je met de upgrade ook de regels van elke versie ertussen. Dat zijn bevindingen over markup die al zo stond, naast wat de upgrade breekt. Los ze op, of neem ze bewust op in de baseline met `--update-baseline`. Een fout (`error`) los je op: die zegt dat iets niet werkt.

Lint je in de buildmap zelf, of heet die map anders dan `dist` of `build`, dan leest de linter ook de gebundelde scripts van het designsysteem en meldt hij de stijlen van de componenten als overschrijvingen van jou. Sluit de map met de bundel dan uit, met `"exclude"` in `.nldd-lint.json`.

## Voor en na vergelijken

Wat breekt, zie je alleen door te kijken. Doe dat met twee builds naast elkaar:

1. Bouw de site op de oude stand en bewaar de uitvoer.
2. Bouw hem op de nieuwe stand.
3. Draai [`compare-builds.mjs`](compare-builds.mjs) uit deze skill, vanuit je project:

```sh
node <pad naar deze skill>/compare-builds.mjs <oude build> <nieuwe build> <map voor de beelden> --label-before 0.22.0 --label-after 0.27.1
```

Het script opent elke pagina van beide builds op 1280 en op 390 pixels breed. Per pagina die verschilt schrijft het één beeld, met voor en na naast elkaar en een omlijning om elk element van het designsysteem dat veranderde:

| Kleur | Betekenis |
|---|---|
| Roze | het element heeft een andere maat |
| Blauw | het element is even groot en ziet er anders uit, zoals een andere kleur |
| Rood | het element wordt niet meer getekend |
| Groen | het element is er nieuw |
| Grijs | andere pixels buiten een element, op een pagina die even hoog bleef |

Inhoud die alleen lager op de pagina kwam te staan, telt niet. Een pagina is pas gelijk als de twee schermafdrukken pixel voor pixel gelijk zijn. Het script heeft Playwright met Chromium nodig, in je project of met `--playwright <module>`.

Rood en blauw zijn bijna altijd een fout uit de upgrade. Roze is vaak een bewuste wijziging in het designsysteem, en dan staat ze in de changelog. Zet de beelden in de pull request, met wat je erop ziet.

Het script werkt op een site die naar statische HTML bouwt. Heeft je app een server of een inlog nodig, dan bekijk je de schermen met de hand, op de oude en op de nieuwe stand.

## Klaar

Een upgrade is klaar als dit allemaal waar is:

- de `Breaking`-secties tussen de twee versies zijn gelezen, en elk punt dat de app raakt is verwerkt;
- de versie is op elke plek gelijk;
- `nldd lint` van de doelversie vindt niets nieuws in de bron en in de gebouwde site;
- de typecontrole slaagt, en de dev-build meldt niets nieuws in de console;
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
