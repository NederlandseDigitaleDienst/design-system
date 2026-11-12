---
name: nldd-design-upgrade
description: "Verhoog de versie van @nldd/design-system in een bestaande applicatie: lees het upgradepad uit de changelog, vind de breaking changes en pas ze toe. Triggers: 'upgraden naar een nieuwe versie', 'nldd bijwerken', 'nldd-versie verhogen', 'wat is er veranderd sinds versie x', 'npm update @nldd/design-system', een afhankelijkheid die een paar versies achterloopt. Voor een nieuwe app bouwen: nldd-design-build. Voor een frontend die nog niet op dit systeem zit: nldd-design-migrate."
metadata:
  type: reference
---

# Een bestaande applicatie naar een nieuwere versie brengen

Je gebruikt deze skill als een applicatie al op `@nldd/design-system` draait en naar een hogere versie moet. Dat is iets anders dan de twee buren:

- Bouw je iets nieuws, dan is [`nldd-design-build`](../nldd-design-build/SKILL.md) de plek.
- Zit de frontend nog niet op dit systeem (Tailwind, een ander design system, server-gerenderd), dan hoort het bij [`nldd-design-migrate`](../nldd-design-migrate/SKILL.md).

Een upgrade zit daar precies tussenin: de componenten kloppen al, maar de API onder je code is bewogen. De vaardigheid is dezelfde als bij een migratie, alleen met een kleinere delta en één extra valkuil, hieronder.

## Het versienummer waarschuwt, de changelog vertelt

Zolang de major 0 is, geeft een breaking change een nieuwe minor en is elke andere release een patch: `feat`, `fix`, `refactor` en `docs`. Zo leest npm het ook: `^0.9.0` neemt 0.9.x mee, maar niet 0.10.0. Een breaking change komt dus nooit ongevraagd binnen; die haal je zelf op door de minor te verhogen.

Dat geldt vanaf 0.9.0. Daarvoor kwam alles uit als patch, ook een breaking change: `0.8.80` naar `0.8.90` ziet eruit als tien onschuldige patches en kan een verwijderd attribuut bevatten.

Een nieuwe minor zegt alleen dát er iets breekt, niet wat. Gebruik daarom de changelog van de doelversie als je upgradepad: `https://github.com/NederlandseDigitaleDienst/design-system/blob/v<doelversie>/CHANGELOG.md`. Die bevat elke versie tot en met je doel. [`changelog.md`](../nldd-design/changelog.md) in deze skill hoort bij de versie van de plugin, en die kan ouder zijn dan je doel.

## Werkwijze

1. **Lees elke versie tussen jouw huidige en de doelversie.** De entries staan nieuwste eerst, met een kop per release (versienummer + datum). Sla niets over: een breaking change kan in een tussenliggende patch zitten.
2. **Scan de `Breaking` / `Breaking Changes` secties eerst.** Die bevatten concrete migratie-instructies: een verwijderd attribuut met zijn vervanger, hernoemde variabelen, gewijzigd gedrag, en wat de layout van je pagina's verschuift zonder dat je code verandert, zoals een andere hoogte of maat. Een echt voorbeeld uit de changelog: `variant` op `nldd-button` en acht andere componenten heet nu `appearance`, met dezelfde waarden, dus `variant="primary"` wordt `<nldd-button appearance="primary" text="Bewaar">`.
3. **Pas de migraties toe in je code** voordat je de nieuwe versie in gebruik neemt. Zoek je app door op de verwijderde attributen, variabelenamen of componenten uit de breaking entries.
4. **Lees `Highlights`, `Added` en `Changed`** voor nieuwe componenten of attributen die je oudere, omslachtigere code kunnen vervangen.
5. **Verifieer tegen [`reference.md`](../nldd-design/reference.md)** of een attribuut, slot of event in de doelversie bestaat zoals je verwacht. Die referentie hoort bij exact deze release.

6. **Draai `npx @nldd/design-system@<doelversie> lint`, nog vóór je de versie verhoogt, en daarna met `--fix` voor wat alleen een andere naam kreeg.** Kies de doelversie één keer, bijvoorbeeld `0.23.0`, en gebruik die in elke stap. Met `@latest` lint je tegen wat vandaag de nieuwste is, en dat kan een andere versie zijn dan je installeert. Dat is de linter van de doelversie op je huidige code: elke bevinding is iets dat in de nieuwe versie niet meer klopt, en een baseline blijft geldig, dus wat erbij komt is je werklijst. Zie [`nldd-design-validate`](../nldd-design-validate/SKILL.md).

Vuistregel: lees bij elke nieuwe minor de `Breaking` sectie van die versie, en ga onder 0.9.0 niet meer dan een handvol patches in één sprong omhoog zonder de tussenliggende `Breaking` secties te lezen.

## Wat er stil misgaat

Wat een upgrade breekt, faalt zonder foutmelding. Een onbekend attribuut, een verdwenen CSS-variabele of een hernoemd of verwijderd slot rendert gewoon niets of valt terug op een default: inhoud met `slot="indicator"` verdwijnt bijvoorbeeld stil sinds die slot van `nldd-activity-indicator` weg is. Componenten waarschuwen in een dev-build wel over een verkeerde compositie, maar juist deze drie zien ze niet aankomen. Na een upgrade is "het ziet er nog goed uit" daarom geen bewijs.

- **Hernoemde CSS-variabelen zijn de meest gemiste val.** Je eigen CSS verwijst dan naar een naam die niet meer bestaat, zonder foutmelding: de declaratie valt gewoon weg. `nldd lint` vangt dit voor `--primitives-*`, `--semantics-*`, `--components-*` en de `--context-*`-variabelen met een default (`token-not-found`) en noemt de opvolger als die er is. De changelog zet zo'n token onder `Breaking`. Een `--_*` of `--components-*` hoort niet in je eigen CSS: die zijn van één component en bewegen met dat component mee.
- **Controleer de versie die je echt draait**, niet de versie in `package.json`. Een `^0.8.44` in `package.json` met een lockfile van maanden oud draait iets anders dan je denkt. `npm ls @nldd/design-system` geeft het antwoord.
- **Verifieer in een browser, niet in de code.** Bouw het en kijk. Dat kost een paar minuten en het is de enige manier om een stille terugval te zien.

## Verder

De inhoudelijke kant van een omzetting (wat je per herkomst tegenkomt, hoe je een component-voor-component vervanging aanpakt) staat in [`nldd-design-migrate`](../nldd-design-migrate/SKILL.md). Die skill gaat uitgebreider in op wat er stil misgaat en hoe je dat merkt; bij een grote sprong omhoog is dat ook voor een upgrade nuttige stof.
