# NLDD Icon Style Guide

Stijlregels voor het ontwerpen en aanleveren van SVG-iconen in het NLDD Designsysteem.

## Canvas

| Eigenschap | Waarde |
|------------|--------|
| ViewBox | `0 0 96 96` |
| Eenheid | 4 eenheden = 1px bij een icoon van 24px |
| Center | (48, 48) |

Regular en light delen dit grid. Regular stond vroeger op 24×24 en light op 32×32; op 96 liggen beide op hele eenheden, waar de oude grids halve en kwart pixels nodig hadden. Alle maten hieronder zijn eenheden op dit grid.

## Rendering: fill-only

Alle iconen gebruiken uitsluitend `fill="currentColor"`. Er worden **geen strokes** gebruikt. Visuele lijnen, contouren en randen worden als gevulde paden of rects getekend.

## Lijndikte

| Element | Dikte |
|---------|-------|
| Standaard lijnen, contouren (regular) | 8 |
| Standaard lijnen, contouren (light) | 6 |
| Details op kleine vlakken | 6–8 (visueel beoordelen) |

## Line caps

Geen bolle uiteinden. Lijnuiteinden zijn **recht afgesneden** (butt-achtig via padgeometrie).

## Tussenruimte tussen lijnen

Parallelle lijnen hebben **8 eenheden ruimte** ertussen (gemeten van rand tot rand).

## Overlappende lijnen

Wanneer twee lijnen elkaar kruisen of overlappen, worden **4 eenheden van de onderste lijn weggehaald** waar deze de bovenste raakt. Dit creëert een visueel overlap-effect waarbij de bovenste lijn "voor" de onderste lijkt te liggen.

De bovenste lijn behoudt zijn volledige dikte. De onderste lijn wordt aan **beide kanten** van de kruising onderbroken met **4 eenheden witruimte**. Dit creëert een visueel overlap-effect waarbij de bovenste lijn duidelijk "voor" de onderste lijkt te liggen.

## Doorhaling (strikethrough)

Doorhalingen lopen altijd van **links boven naar rechts onder** (diagonaal, typisch 15° of een ander veelvoud van 15°). Dit geldt voor iconen die een "niet beschikbaar", "uitgeschakeld" of "verboden" concept uitdrukken (bijv. eye-slash).

## Spacing (padding van viewBox-rand)

De spacing hangt af van de oriëntatie van het icoon:

| Oriëntatie | Inline (L/R) | Block (T/B) | Voorbeeld |
|------------|-------------|-------------|-----------|
| **Horizontaal** (breder dan hoog) | 8 | 16 | list, minus, ellipsis |
| **Verticaal** (hoger dan breed) | 16 | 8 | arrow-down, chevron-up-down |
| **Vierkant** (gelijke verhoudingen) | 12 | 12 | trash, pencil, gear |
| **Cirkel** | 8 | 8 | info-circle, check-mark-circle |

> De content area van een horizontaal icoon is dus **80×64**, verticaal **64×80**, vierkant **72×72**, cirkel **80×80**.

## Groottevarianten

Drie maten: regular, small, extra-small. Elke variant verkleint de content area symmetrisch:

| Variant | Extra padding per kant | Content area (vierkant) |
|---------|----------------------|------------------------|
| Regular | +0 | 72×72 |
| Small | +8 | 56×56 |
| Extra-small | +16 | 40×40 |

De padgeometrie schaalt proportioneel mee. ViewBox blijft altijd `0 0 96 96`.

## Hoeken

Gebruik bij voorkeur hoeken die een veelvoud van **15 graden** zijn:

| Hoek | Gebruik |
|------|---------|
| 0° / 90° | Horizontale en verticale lijnen |
| 45° | Chevrons, checkmarks, pijlpunten, diagonalen |
| 30° / 60° | Indien nodig voor specifieke vormen |
| 15° / 75° | Zeldzaam, alleen als andere hoeken niet passen |

## Corner radius

| Context | Radius |
|---------|--------|
| Grote buitenvormen (containers, kaarten) | 12 |
| Middelgrote elementen | 8 |
| Kleine details | 4 |
| Scherpe hoeken waar passend | 0 |

De keuze is visueel: gebruik de kleinste radius die er nog goed uitziet. Geen afgeronde hoeken forceren waar scherpe hoeken beter staan.

## Cirkel-iconen template

Iconen met een cirkel als omlijsting volgen dit template:

```
Buitencirkel:  cx="48" cy="48" r="40"  (van 8 tot 88, = 8 padding)
Binnencirkel:  cx="48" cy="48" r="32"  (visuele "lijndikte" van 8)
```

Content binnen de cirkel heeft 8–12 eenheden ruimte tot de binnenrand.

| Element binnen cirkel | Specificatie |
|-----------------------|-------------|
| Info/exclamation dot | r=5, gecentreerd |
| Info/exclamation lijn | 8 breed, gecentreerd op x=48 |
| Checkmark | 45° hoek, gecentreerd |

## Filled vs outline varianten

| Type | Implementatie |
|------|--------------|
| **Outline** | Twee of meer paths: buitenvorm + binnenvorm als negatieve ruimte |
| **Filled** | Eén path, volledig gevuld |

Beide varianten hebben dezelfde buitenafmetingen en padding.

Naamconventie: `icon-name.svg` (outline), `icon-name-filled.svg` (filled).

## Padrichting

- **Buitenvormen**: clockwise (met de klok mee)
- **Gaten / negatieve ruimte**: counterclockwise (tegen de klok in)

Dit voorkomt rendering-issues met `fill-rule: nonzero` (de standaard).

## Pixel snapping

- Coördinaten snappen op **hele eenheden** waar mogelijk
- Uitzondering: diagonalen op 45° produceren √2-waarden (bijv. 5.7, 42.8), en dat is acceptabel
- Vermijd subpixel-waarden bij horizontale en verticale lijnen

## Optimaliseren

Een nieuwe export gaat één keer door `npm run optimize:icons -- <bestand.svg> …` (svgo, instellingen in `scripts/svgo.config.mjs`):

- Exporteer op 96×96. Een export op `0 0 24 24` (regular) of `0 0 32 32` (light) zet het script eerst naar 96, zonder af te ronden, en rondt pas daarna af; een andere viewBox weigert het
- `width`, `height`, `fill-rule`, `clip-rule` en `clip-path` worden verwijderd
- Vormen (`rect`, `circle`, …) worden paden
- Een vaste kleur wordt `fill="currentColor"`
- Paden worden afgerond op één decimaal

Draai het niet nog eens op een bestand dat al geoptimaliseerd is: een tweede ronde rondt opnieuw af en verschuift het icoon.

## Naamgeving

### Bestandsnamen: beschrijf het visueel

De bestandsnaam beschrijft **wat je ziet**, niet waar het icoon voor gebruikt wordt.

| Regel | Voorbeeld |
|-------|-----------|
| Enkelvoud, kebab-case | `house`, `envelope`, `pencil` |
| Beschrijf de vorm, niet de functie | `house` (niet `home`), `pencil` (niet `edit`), `trash` (niet `delete`) |
| Samengesteld waar nodig | `arrow-down`, `check-mark-circle`, `square-and-arrow-up` |

### Suffixen

Suffixen worden in vaste volgorde toegevoegd:

**`{naam}-{variant}-{grootte}`**

| Suffix | Betekenis | Voorbeeld |
|--------|-----------|-----------|
| `-filled` | Volledig gevulde variant (vs outline) | `heart-filled`, `exclamation-triangle-filled` |
| `-circle` | Omlijst met cirkel | `check-mark-circle`, `info-circle`, `person-circle` |
| `-slash` | Doorgehaald (uitgeschakeld/verborgen) | `eye-slash` |
| `-small` | Verkleinde variant (+8 padding) | `check-mark-small`, `caret-down-small` |
| `-extra-small` | Extra verkleind (+16 padding) | `chevron-right-extra-small`, `minus-extra-small` |

Een **badge** is een klein overlay-element op het icoon. De badge-naam beschrijft de inhoud van de badge en staat als suffix vóór de grootte:

| Suffix | Voorbeeld |
|--------|-----------|
| `-badge-{inhoud}` | `person-badge-gear`, `table-cells-badge-arrow-down` |

Richting staat in de naam zelf (niet als los suffix):

| Suffix | Voorbeeld |
|--------|-----------|
| `-up`, `-down`, `-left`, `-right` | `arrow-down`, `caret-left`, `chevron-up` |
| `-up-down` | `chevron-up-down` |

### Aliases: beschrijf het doel

Aliases koppelen een **functionele naam** aan een visuele icoonnaam. Ze staan in `nldd-icon-aliases.js`.

| Visueel (bestandsnaam) | Alias (functie) |
|------------------------|-----------------|
| `house` | `home` |
| `pencil` | `write` |
| `pencil-on-square` | `edit` |
| `trash` | `remove` |
| `magnifier` | `search` |
| `eye` | `visible`, `show` |
| `eye-slash` | `hidden`, `hide` |
| `heart-filled` | `favorite`, `love` |
| `exclamation-triangle-filled` | `warning`, `alert` |
| `check-mark-circle` | `success`, `valid` |
| `exclamation-circle` | `error`, `invalid` |

Aliases mogen meerdere synoniemen hebben voor hetzelfde icoon. Groottevarianten van aliases volgen hetzelfde suffix-patroon: `add` → `plus`, `add-small` → `plus-small`.

## Gallery-status: Nieuw en Bijgewerkt

De IconGallery-story in Storybook toont een `nldd-tag` "Nieuw" of "Bijgewerkt" op de tegels van de recentste iconen. Welke iconen dat zijn staat in `icon-gallery-status.ts` (`NEW_ICONS` en `UPDATED_ICONS`).

Bij elke nieuwe iconen-batch **herbereken** je de inhoud van beide sets (niet aanvullen) over de laatste drie weken git-historie, zodat de gallery een meelopend venster markeert. Drie weken en niet alleen de batch die je nu toevoegt: een release neemt meestal één batch mee, dus wie bij elke batch schoonveegt haalt het label van de vorige weg op de dag dat die bij consumenten aankomt. De kop van `icon-gallery-status.ts` bevat het `git log`-commando en de valkuil (geen `--follow`).

- `NEW_ICONS` — iconen die nieuw zijn in dat venster
- `UPDATED_ICONS` — bestaande iconen met nieuw artwork, renames (met of zonder nieuw artwork) en iconen waarvan de aliassen zijn gewijzigd
- Valt een icoon in beide sets, dan wint "Nieuw"
- De omzetting naar het 96-grid telt niet als nieuw artwork; de kop van `icon-gallery-status.ts` zegt hoe je die commit overslaat

## Checklist nieuw icoon

- [ ] ViewBox is `0 0 96 96`
- [ ] Alleen `fill="currentColor"`, geen strokes
- [ ] Lijndikte is 8 (regular) of 6 (light)
- [ ] Spacing past bij oriëntatie (H: 8/16, V: 16/8, □: 12/12, ○: 8/8)
- [ ] Hoeken zijn veelvoud van 15°
- [ ] Corner radius past bij elementgrootte (12/8/4/0)
- [ ] Rechte line caps (geen bolle uiteinden)
- [ ] 8 eenheden tussenruimte tussen parallelle lijnen
- [ ] Overlappende lijnen: 4 eenheden van onderste lijn weggehaald bij kruising
- [ ] Doorhaling loopt van links boven naar rechts onder
- [ ] Buitenvormen clockwise, gaten counterclockwise
- [ ] Coördinaten op hele eenheden (behalve 45° diagonalen)
- [ ] Eén keer door `npm run optimize:icons`
- [ ] Bestandsnaam in kebab-case
- [ ] Past visueel bij bestaande iconen in gewicht en stijl
- [ ] Naam opgenomen in `NEW_ICONS` (of `UPDATED_ICONS`) in `icon-gallery-status.ts`; oude batch eruit
