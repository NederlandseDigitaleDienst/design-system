---
name: release-update
description: Schrijf het wekelijkse Mattermost-bericht over de releases van het design system, uit CHANGELOG.md. Gebruik bij "/release-update 0.22", "schrijf de release-update", "Mattermost-bericht over de laatste versies" of als iemand vraagt wat er sinds het vorige bericht is uitgekomen. Het argument is de versie van het vorige bericht.
user-invocable: true
---

# Release-update

Schrijft een Nederlands Mattermost-bericht over alle releases sinds het vorige bericht. De bron is `CHANGELOG.md`; de changelog zelf blijft Engels.

## Gebruik

```
/release-update 0.22
```

Het argument is de versie van het vorige bericht. Het nieuwe bericht gaat over alle versieblokken in `CHANGELOG.md` die **boven** die versie staan. Bij `0.22` zijn dat dus 0.23 tot en met de nieuwste. Ontbreekt het argument, vraag dan naar de versie van het vorige bericht; gok hem niet.

## Wanneer

**Eén bericht per week, op donderdag.** Daarin staan alle releases sinds het vorige bericht samen, niet per versie. Alleen een securityfix of een fix voor iets wat in productie stukgaat, gaat meteen.

## Werkwijze

1. Lees `CHANGELOG.md` en neem elk versieblok boven de versie uit het argument. Lees ze helemaal: Highlights, Breaking, Added, Changed en Fixed.
2. Sorteer elk punt in een van de drie kopjes hieronder. Groepeer per thema, niet per versie: een onderwerp dat over drie releases verspreid staat, wordt één punt.
3. Schrijf het bericht volgens het formaat, met de toon van [example.md](example.md). Dat is het bericht over 0.23 t/m 0.25 en het voorbeeld voor lengte, woordkeus en opbouw.
4. Lever het bericht in één ```markdown-kopieerblok, zonder verslag eromheen.

## Formaat

### Kop

```
#### Design system <van> t/m <tot>
```

`<van>` en `<tot>` zijn de eerste en de nieuwste versie in het bericht, zonder patchnummer als dat 0 is (`0.23 t/m 0.25`). Bij één release staat alleen dat versienummer in de kop.

### Kopjes

In deze volgorde, en alleen als ze gevuld zijn:

1. **Nieuw component**, of **Nieuwe componenten** bij meer dan één. Nieuwe componenten staan altijd bovenaan. Per component de tag vet in backticks, en in een zin of twee wat het doet.
2. **Grote wijzigingen**: de highlights, gegroepeerd per thema. Elk punt begint met een vette kern en legt daarna in een zin of twee uit wat je ermee kunt. Iets dat het hele pakket raakt, zoals het laden op de server of de linter, hoort hier.
   - **Toegankelijkheidsfixes** staan als één geteld punt onderaan: "**4 toegankelijkheidsfixes**: …", met de fixes achter elkaar in één zin. Tel alles wat iets oplost voor hulptechnologie, toetsenbord, zoom of contrast, ook als het onder Changed of Fixed staat. Die punten komen dan niet ook nog bij de kleine wijzigingen.
3. **Kleine wijzigingen**: één regel per component, op alfabet, met de tag vet in backticks en een dubbele punt: `- **\`nldd-tag\`**: …`. Meerdere kleine punten van één component komen samen in één regel. Twee componenten met dezelfde wijziging mogen één regel delen (`**\`nldd-date-field\` en \`nldd-time-field\`**`).

Interne wijzigingen die een consument niet merkt (tests, build, refactors zonder gevolg) laat je weg.

### Upgradeblok

Alleen als er een brekende release in de reeks zit: een minor-bump, zoals 0.24 naar 0.25. Bij alleen patches valt het blok weg, want dan is er niets te migreren. Zo zegt het blok ook iets: staat het er, dan moet je iets doen.

Het staat onderaan, direct boven de changelog-link, en is positief geformuleerd. Gebruik geen woorden als "breken" of "stukgaan". Letterlijk:

```
**Upgraden?** De linter laat zien wat er in je app verandert, en past het meeste zelf aan:
`npx @nldd/design-system@<nieuwste> lint`
`npx @nldd/design-system@<nieuwste> lint --fix`
```

`<nieuwste>` is het volledige versienummer van de nieuwste release (`0.25.0`).

### Afsluiting

Altijd als laatste regel:

```
[Volledige changelog](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/CHANGELOG.md)
```

## Stijl

- Nederlands, kort: één zin of twee per punt.
- Geen gedachtestreep en geen uitroepteken.
- Schrijf wat iemand ermee kan, niet hoe het gebouwd is. Een tag, attribuut of commando staat in backticks.
- De gebruikersskill `schrijfstijl` geldt; lees hem voordat je schrijft.
