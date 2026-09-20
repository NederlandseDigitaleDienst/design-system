# Patroon: lijst met rijen

**Welk probleem dit oplost.** Een verzameling records tonen die de gebruiker
moet kunnen scannen, en waar hij per record iets mee kan doen: openen,
aanvinken, een actie kiezen.

**Wanneer wel.** Voor een reeks gelijkwaardige items met tekst en hoogstens een
paar actiepunten per rij.

**Wanneer niet.** Gaat het om kolommen die je met elkaar vergelijkt, dan is het
een tabel (`nldd-table` met `nldd-table-row`). Gaat het om een handvol
gelijkwaardige blokken met een plaatje of veel tekst, dan is het
`nldd-collection` met `nldd-card`.

## Compositie

```
nldd-list                      (variant, type, dividers)
  └─ nldd-list-item            (size, en hoogstens één van href/checkbox/button)
       └─ cellen in bronvolgorde
            nldd-icon-cell     (pictogram vooraan)
            nldd-text-cell     (text, overline, supporting-text)
            nldd-spacer-cell   (duwt wat erna komt naar rechts)
```

## Code

```html
<nldd-list variant="simple">
  <nldd-list-item size="md" href="/dossier/2024-001">
    <nldd-icon-cell icon="document"></nldd-icon-cell>
    <nldd-text-cell
      text="Dossier 2024-001"
      supporting-text="Laatst gewijzigd op 3 maart"
    ></nldd-text-cell>
    <nldd-spacer-cell></nldd-spacer-cell>
    <nldd-text-cell width="fit-content" color="secondary" text="In behandeling"></nldd-text-cell>
  </nldd-list-item>
</nldd-list>
```

## Waarom zo

**Zet nooit kale tekst in een rij.** De cel bepaalt lettertype, grootte, kleur
en uitlijning, en stemt die af op de rijhoogte. Tekst die je er los in hangt
krijgt niets van dat alles mee: in een klikbare rij zit de slot in een
`<button>` en erft je tekst de browserstijl van een knop, wat neerkomt op 13px
Arial.

```html
<!-- Fout -->
<nldd-list-item button>Dossier 2024-001</nldd-list-item>

<!-- Goed -->
<nldd-list-item button>
  <nldd-text-cell text="Dossier 2024-001"></nldd-text-cell>
</nldd-list-item>
```

**Eén actie maakt de rij zelf de control. Twee of meer houden losse segmenten
en laten de rij passief.** Zet je een `nldd-icon-button` in een rij die zelf al
een `href` heeft, dan nest je een control in een control: dat verdubbelt de
tabstop en de knop kan de link activeren. Het component waarschuwt daar in
development ook over. Bijkomend voordeel van de rij als control: het hele
44px-oppervlak is aanraakbaar in plaats van een icoon van 32px.

Heeft een rij écht meerdere acties nodig, gebruik dan
`nldd-list-item-segment` per actiegebied en laat de rij zelf zonder `href`,
`button` of `checkbox`. Een segment houdt zijn eigen padding en haalt de
WCAG-doelgrootte ook als het alleen een icoon bevat; voeg er geen spacer-cellen
in toe voor ruimte, dat verdubbelt de marge.

**Zet `size` op de rij, niet op elke cel.** De rij duwt zijn `size` door naar de
cellen waar die dezelfde betekenis heeft (`nldd-text-cell`,
`nldd-drag-handle-cell`), dus je schrijft het één keer per rij. Cellen waar
`size` iets anders betekent (pixels op `nldd-icon-cell` en `nldd-spacer-cell`,
een kopschaal op `nldd-title-cell`) blijven ongemoeid.

**Stuur opmaak via de attributen van de cel, niet met eigen CSS.** `text`,
`overline` en `supporting-text` snappen `**vet**`, en `color` neemt onder meer
`accent`, `secondary`, `success`, `warning` en `critical`. Eigen
`--components-*`- of `--semantics-*`-declaraties zijn niet nodig en gaan bij de
volgende versie mis.

**Let op: de icooncel heet `icon`, niet `name`.** `nldd-icon` neemt `name`,
maar `nldd-icon-cell` neemt `icon` (`<nldd-icon-cell icon="document">`). De
cel rendert de `nldd-icon` zelf.

**`selected` en `current` zijn niet hetzelfde.** `selected` betekent "dit is een
van de rijen die je hebt aangevinkt" en mag op meerdere rijen staan. `current`
betekent "dit is de rij waar je nu bent" en staat op precies één rij.

**Laat de lege toestand aan de lijst.** De lijst weet zelf wanneer er niets te
tonen is. Zet je eigen "Geen resultaten"-alinea ernaast, dan staan er twee lege
toestanden onder elkaar. Vul in plaats daarvan de slots:

```html
<nldd-list variant="simple">
  <nldd-inline-dialog slot="empty" text="Nog geen dossiers"
    supporting-text="Zodra er een aanvraag binnenkomt verschijnt die hier."
  ></nldd-inline-dialog>
  <nldd-inline-dialog slot="no-results" text="Geen dossiers gevonden"
    supporting-text="Pas je zoekopdracht of filters aan."
  ></nldd-inline-dialog>
  <!-- rijen -->
</nldd-list>
```

`empty` is "er zijn geen rijen" en `no-results` is "er zijn rijen, maar je
filter laat er geen zien". Dat zijn verschillende zinnen: bij `no-results`
blijven het zoekveld en de `toolbar` staan, want dat is de weg terug. Zonder
`no-results` valt de lijst terug op `empty`. Laadt de lijst zijn rijen nog, zet
dan een `nldd-inline-dialog variant="loading"` in `empty`, zodat de plek
behouden blijft in plaats van dat de controls een moment later verschijnen.

**Verberg de lijst niet met `[hidden]` als er niets in staat.** Dat werkt niet:
`[hidden]` verliest van de `display` die het component zelf zet, en het is
precies wat de standaard lege toestand naast die van jou laat staan.

**Meerdere alinea's of opmaak in een rij?** Gebruik `nldd-rich-text` binnen een
`nldd-cell`, niet los in de rij.

```html
<nldd-list-item>
  <nldd-cell>
    <nldd-rich-text><p>Tekst met <strong>opmaak</strong>.</p></nldd-rich-text>
  </nldd-cell>
</nldd-list-item>
```

## Toegankelijkheid

`nldd-list` heeft een `type` die de rol en het toetsenbordgedrag bepaalt:
`list` (standaard), `navigation`, `listbox`, `tree`, `form` en `radiogroup`.
Kies de juiste; daarmee krijg je de ARIA en de pijltjesnavigatie die erbij
hoort. Bij `type="list"` en `type="listbox"` geef je een `accessible-label`;
bij `type="navigation"` zet je `aria-label` op het element zelf.

Laat `dividers` op de standaard `always` staan tenzij je een reden hebt.
`on-touch` tekent de lijnen alleen waar de primaire invoer aanraking is: een
muisgebruiker heeft de hover-markering om rijen te onderscheiden, een vinger
heeft niets.

## Gezien in

De meest voorkomende compositie op dit systeem, in elk onderzocht product en in
elk framework: Vue, Angular en server-gerenderde templates.

De lege toestanden zijn de uitzondering. `slot="empty"` en `slot="no-results"`
worden vrijwel nergens gebruikt, ook niet in apps die honderden rijen renderen.
Ze bestaan, ze doen precies wat je anders zelf nabouwt, en vrijwel niemand
vindt ze. Vandaar dat ze hierboven zijn uitgeschreven.
