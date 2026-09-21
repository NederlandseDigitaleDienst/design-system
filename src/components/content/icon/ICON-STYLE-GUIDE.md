# NLDD Icon Style Guide

Stijlregels voor het ontwerpen en aanleveren van SVG-iconen in het NLDD Designsysteem.

## Canvas

| Eigenschap | Waarde |
|------------|--------|
| ViewBox | `0 0 24 24` |
| Eenheid | 1 unit = 1px bij standaardweergave |
| Center | (12, 12) |

## Rendering: fill-only

Alle iconen gebruiken uitsluitend `fill="currentColor"`. Er worden **geen strokes** gebruikt. Visuele lijnen, contouren en randen worden als gevulde paden of rects getekend.

## Lijndikte

| Element | Dikte |
|---------|-------|
| Standaard lijnen, contouren | 2px |
| Details op kleine vlakken | 1.5–2px (visueel beoordelen) |

## Line caps

Geen bolle uiteinden. Lijnuiteinden zijn **recht afgesneden** (butt-achtig via padgeometrie).

## Tussenruimte tussen lijnen

Parallelle lijnen hebben **2px ruimte** ertussen (gemeten van rand tot rand).

## Overlappende lijnen

Wanneer twee lijnen elkaar kruisen of overlappen, wordt **1px van de onderste lijn weggehaald** waar deze de bovenste raakt. Dit creëert een visueel overlap-effect waarbij de bovenste lijn "voor" de onderste lijkt te liggen.

De bovenste lijn behoudt zijn volledige 2px dikte. De onderste lijn wordt aan **beide kanten** van de kruising onderbroken met **1px witruimte**. Dit creëert een visueel overlap-effect waarbij de bovenste lijn duidelijk "voor" de onderste lijkt te liggen.

## Doorhaling (strikethrough)

Doorhalingen lopen altijd van **links boven naar rechts onder** (diagonaal, typisch 15° of een ander veelvoud van 15°). Dit geldt voor iconen die een "niet beschikbaar", "uitgeschakeld" of "verboden" concept uitdrukken (bijv. eye-slash).

## Spacing (padding van viewBox-rand)

De spacing hangt af van de oriëntatie van het icoon:

| Oriëntatie | Inline (L/R) | Block (T/B) | Voorbeeld |
|------------|-------------|-------------|-----------|
| **Horizontaal** (breder dan hoog) | 2px | 4px | list, minus, ellipsis |
| **Verticaal** (hoger dan breed) | 4px | 2px | arrow-down, chevron-up-down |
| **Vierkant** (gelijke verhoudingen) | 3px | 3px | trash, pencil, gear |
| **Cirkel** | 2px | 2px | info-circle, check-mark-circle |

> De content area van een horizontaal icoon is dus **20×16**, verticaal **16×20**, vierkant **18×18**, cirkel **20×20**.

## Groottevarianten

Drie maten: regular, small, extra-small. Elke variant verkleint de content area symmetrisch:

| Variant | Extra padding per kant | Content area (vierkant) |
|---------|----------------------|------------------------|
| Regular | +0px | 18×18 |
| Small | +2px | 14×14 |
| Extra-small | +4px | 10×10 |

De padgeometrie schaalt proportioneel mee. ViewBox blijft altijd `0 0 24 24`.

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
| Grote buitenvormen (containers, kaarten) | 3px |
| Middelgrote elementen | 2px |
| Kleine details | 1px |
| Scherpe hoeken waar passend | 0px |

De keuze is visueel: gebruik de kleinste radius die er nog goed uitziet. Geen afgeronde hoeken forceren waar scherpe hoeken beter staan.

## Cirkel-iconen template

Iconen met een cirkel als omlijsting volgen dit template:

```
Buitencirkel:  cx="12" cy="12" r="10"  (van 2 tot 22, = 2px padding)
Binnencirkel:  cx="12" cy="12" r="8"   (visuele "lijndikte" van 2px)
```

Content binnen de cirkel heeft 2–3px ruimte tot de binnenrand.

| Element binnen cirkel | Specificatie |
|-----------------------|-------------|
| Info/exclamation dot | r=1.25, gecentreerd |
| Info/exclamation lijn | 2px breed, gecentreerd op x=12 |
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

- Coördinaten snappen op **hele pixels** waar mogelijk
- Uitzondering: diagonalen op 45° produceren √2-waarden (bijv. 1.414, 10.707) — dit is acceptabel
- Vermijd subpixel-waarden bij horizontale en verticale lijnen

## SVGO optimalisatie

Iconen worden automatisch verwerkt door SVGO bij de build:

- `width` en `height` attributen worden verwijderd
- `fill="#000000"` en `fill="black"` worden omgezet naar `fill="currentColor"`
- `fill="none"` wordt verwijderd
- `viewBox` blijft behouden
- Multipass optimalisatie is ingeschakeld

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
| `-small` | Verkleinde variant (+2px padding) | `check-mark-small`, `caret-down-small` |
| `-extra-small` | Extra verkleind (+4px padding) | `chevron-right-extra-small`, `minus-extra-small` |

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

## Checklist nieuw icoon

- [ ] ViewBox is `0 0 24 24`
- [ ] Alleen `fill="currentColor"`, geen strokes
- [ ] Lijndikte is 2px
- [ ] Spacing past bij oriëntatie (H: 2/4, V: 4/2, □: 3/3, ○: 2/2)
- [ ] Hoeken zijn veelvoud van 15°
- [ ] Corner radius past bij elementgrootte (3/2/1/0)
- [ ] Rechte line caps (geen bolle uiteinden)
- [ ] 2px tussenruimte tussen parallelle lijnen
- [ ] Overlappende lijnen: 1px van onderste lijn weggehaald bij kruising
- [ ] Doorhaling loopt van links boven naar rechts onder
- [ ] Buitenvormen clockwise, gaten counterclockwise
- [ ] Coördinaten op hele pixels (behalve 45° diagonalen)
- [ ] Bestandsnaam in kebab-case
- [ ] Past visueel bij bestaande iconen in gewicht en stijl
- [ ] Naam opgenomen in `NEW_ICONS` (of `UPDATED_ICONS`) in `icon-gallery-status.ts`; oude batch eruit
