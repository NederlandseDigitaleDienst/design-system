---
name: nldd-design-upgrade
description: "Verhoog de versie van @nldd/design-system in een bestaande applicatie: lees het upgradepad uit de changelog, vind de breaking changes en pas ze toe. Triggers: 'upgraden naar een nieuwe versie', 'nldd bijwerken', 'nldd-versie verhogen', 'wat is er veranderd sinds versie x', 'npm update @nldd/design-system', een afhankelijkheid die een paar versies achterloopt. Voor een nieuwe app bouwen: nldd-design-build. Voor een frontend die nog niet op dit systeem zit: nldd-design-migrate."
metadata:
  type: reference
---

# Een bestaande applicatie naar een nieuwere versie brengen

Je gebruikt deze skill als een applicatie al op `@nldd/design-system` draait en
naar een hogere versie moet. Dat is iets anders dan de twee buren:

- Bouw je iets nieuws, dan is [`nldd-design-build`](../nldd-design-build/SKILL.md) de plek.
- Zit de frontend nog niet op dit systeem (Tailwind, een ander design system,
  server-gerenderd), dan hoort het bij
  [`nldd-design-migrate`](../nldd-design-migrate/SKILL.md).

Een upgrade zit daar precies tussenin: de componenten kloppen al, maar de API
onder je code is bewogen. De vaardigheid is dezelfde als bij een migratie, alleen
met een kleinere delta en één extra valkuil, hieronder.

## Het versienummer zegt niets, de changelog alles

Dit is het belangrijkste dat je over dit systeem moet weten voordat je upgradet.
semantic-release verhoogt het **patch**-nummer bij elke `feat`, `fix` en
breaking change. Er is dus geen major- of minor-signaal: `0.8.80` naar `0.8.90`
ziet uit als tien onschuldige patches en kan een verwijderd attribuut bevatten.

Leun daarom nooit op het versienummer om te beoordelen of een sprong veilig is.
Gebruik [`changelog.md`](../nldd-design/changelog.md) als je upgradepad.

## Werkwijze

1. **Lees elke versie tussen jouw huidige en de doelversie.** De entries staan
   nieuwste eerst, met een kop per release (versienummer + datum). Sla niets
   over: een breaking change kan in een tussenliggende patch zitten.
2. **Scan de `Breaking` / `Breaking Changes` secties eerst.** Die bevatten
   concrete migratie-instructies: een verwijderd attribuut met zijn vervanger,
   hernoemde variabelen, gewijzigd gedrag. Een echt voorbeeld uit de changelog:
   `variant="box-on-tinted"` op `nldd-list` is verwijderd, met als vervanger
   `<nldd-list variant="box" background="base">`.
3. **Pas de migraties toe in je code** voordat je de nieuwe versie in gebruik
   neemt. Zoek je app door op de verwijderde attributen, variabelenamen of
   componenten uit de breaking entries.
4. **Lees `Highlights`, `Added` en `Changed`** voor nieuwe componenten of
   attributen die je oudere, omslachtigere code kunnen vervangen.
5. **Verifieer tegen [`reference.md`](../nldd-design/reference.md)** of een
   attribuut, slot of event in de doelversie bestaat zoals je verwacht. Die
   referentie hoort bij exact deze release.

Vuistregel: ga niet meer dan een handvol patches in één sprong omhoog zonder de
tussenliggende `Breaking` secties te lezen.

## Wat er stil misgaat

Alles in dit systeem faalt zonder foutmelding. Een onbekend attribuut, een
verdwenen CSS-variabele of een hernoemd slot rendert gewoon niets of valt terug
op een default. Er komt geen console-waarschuwing. Na een upgrade is "het ziet er
nog goed uit" daarom geen bewijs.

- **Hernoemde CSS-variabelen zijn de meest gemiste val.** Je eigen
  thema-overrides verwijzen dan naar een naam die niet meer bestaat, zonder
  foutmelding, alleen een stille terugval op de default. Zoek je CSS door op de
  variabelenamen uit de `Breaking` entries.
- **Controleer de versie die je echt draait**, niet de versie in `package.json`.
  Een `^0.8.44` in `package.json` met een lockfile van maanden oud draait iets
  anders dan je denkt. `npm ls @nldd/design-system` geeft het antwoord.
- **Verifieer in een browser, niet in de code.** Bouw het en kijk. Dat kost een
  paar minuten en het is de enige manier om een stille terugval te zien.

## Verder

De inhoudelijke kant van een omzetting (wat je per herkomst tegenkomt, hoe je
een component-voor-component vervanging aanpakt) staat in
[`nldd-design-migrate`](../nldd-design-migrate/SKILL.md). Die skill gaat
uitgebreider in op wat er stil misgaat en hoe je dat merkt; bij een grote sprong
omhoog is dat ook voor een upgrade nuttige stof.
