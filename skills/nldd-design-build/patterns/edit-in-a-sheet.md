<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/edit-in-a-sheet/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: bewerken in een sheet

**Welk probleem dit oplost.** Bewerken of details laten zien, zonder de gebruiker weg te halen van waar het werk begon. De pagina, met bijvoorbeeld een lijst, blijft in beeld, dus de context blijft staan.

**Wanneer wel.** Secundaire inhoud die de context moet bewaren: een bewerkformulier, een detailweergave, een filterpaneel, instellingen.

**Wanneer niet.** Voor een korte bevestiging is een sheet te zwaar. Voor een licht paneel dat aan één knop hangt, met invoer erin, zoals twee velden voor een datumbereik, gebruik je een [popover](../../nldd-design/reference.md#nldd-popover). Is het een lijst keuzes of acties, dan is het een [menu bij een knop](menu-from-a-button.md). En bekijken en bewerken zijn verschillende taken: pers ze niet in één scherm met inline bewerken.

## Compositie

```
de pagina eronder             de lijst of het detail waar de sheet vandaan komt

nldd-sheet                     open, placement, width; in de document-root
  └─ nldd-page
       ├─ nldd-top-title-bar   slot="header", met text, dismiss-text en collapse-anchor
       └─ nldd-simple-section
            ├─ nldd-title      slot="header", het id waar de balk naar wijst
            └─ nldd-form
                 ├─ nldd-form-field    per veld, met de waarde die er al staat
                 └─ nldd-form-actions
                      └─ nldd-button-group  de actie, onder het laatste veld
```

```html
<nldd-page>
  <nldd-simple-section>
    <nldd-title
      slot="header"
      size="2"
      text="Aanvragen"
      heading-level="1"
    ></nldd-title>
    <nldd-list
      variant="box-base"
      accessible-label="Aanvragen"
    >
      <nldd-list-item button>
        <nldd-text-cell
          text="Aanvraag 2024-001"
          supporting-text="Dakisolatie, ingediend op 4 maart"
        ></nldd-text-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
      <nldd-list-item button>
        <nldd-text-cell
          text="Aanvraag 2024-002"
          supporting-text="Warmtepomp, ingediend op 11 maart"
        ></nldd-text-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
    </nldd-list>
  </nldd-simple-section>
</nldd-page>

<nldd-sheet
  placement="right"
  width="480px"
>
  <nldd-page>
    <nldd-top-title-bar
      slot="header"
      text="Aanvraag 2024-001 bewerken"
      dismiss-text="Annuleer"
      collapse-anchor="aanvraag-titel"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-title
        id="aanvraag-titel"
        slot="header"
        size="2"
        text="Aanvraag 2024-001 bewerken"
        heading-level="1"
      ></nldd-title>
      <nldd-form name="aanvraag">
        <nldd-form-field label="Titel">
          <nldd-text-field
            name="titel"
            value="Dakisolatie"
          ></nldd-text-field>
        </nldd-form-field>
        <nldd-form-field
          label="Toelichting"
          optional
        >
          <nldd-multi-line-text-field
            name="toelichting"
            value="De isolatie wordt aan de binnenzijde aangebracht."
          ></nldd-multi-line-text-field>
        </nldd-form-field>
        <nldd-form-actions>
          <nldd-button-group>
            <nldd-button
              variant="primary"
              type="submit"
              text="Bewaar"
            ></nldd-button>
          </nldd-button-group>
        </nldd-form-actions>
      </nldd-form>
    </nldd-simple-section>
  </nldd-page>
</nldd-sheet>
```

## Waarom zo

**De uitweg staat bovenin, de primaire actie onder het laatste veld.** "Annuleer" zit in de [titelbalk](../../nldd-design/reference.md#nldd-top-title-bar), "Bewaar" staat in `nldd-form-actions` waar je kijkt als je klaar bent met het laatste veld. Zo staan ze niet naast elkaar, en gaat niemand op de automatische piloot naar de uitweg. Zet dus geen tweede knop naast "Bewaar"; zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md). Wordt het formulier langer dan de sheet, dan kan de actie met `sticky-footer` op de pagina in beeld blijven, maar dat is de uitzondering.

**Zet de actie in een button group, ook als het er één is.** De [groep](../../nldd-design/reference.md#nldd-button-group) kijkt naar zijn eigen breedte: boven de sm-grens een rij, daaronder gestapeld over de volle breedte. In een sheet van 480px scheelt dat je een `width="full"` die je op een breder scherm weer niet wilt, en komt er later een tweede knop bij, dan hoeft er niets te veranderen.

**De knop hoort in het formulier.** Binnen `nldd-form` verstuurt `type="submit"` het formulier zelf, met de validatie en de foutafhandeling die daarbij horen. Moet die er toch buiten staan, bijvoorbeeld in een sticky footer, geef [het formulier](../../nldd-design/reference.md#nldd-form) dan een `id` en de knop een `form` die daarnaar wijst. Zonder een van die twee is het een knop zonder formulier, en die doet niets.

**Noem waar de sheet over gaat.** "Aanvraag 2024-001 bewerken" in plaats van "Aanvraag bewerken": een sheet opent meestal vanaf een rij tussen rijen die op elkaar lijken. De ingevulde velden zeggen het ook, maar alleen zolang ze in beeld zijn.

**De titel staat in de inhoud, de balk neemt die over bij het scrollen.** Zet een [title](../../nldd-design/reference.md#nldd-title) boven het formulier en laat de [titelbalk](../../nldd-design/reference.md#nldd-top-title-bar) daarnaar wijzen met `collapse-anchor`. Zolang de kop in beeld staat is de balk stil, met alleen de uitweg erin; zodra je eroverheen scrolt, schuift de titel de balk in. Allebei dezelfde woorden dus, want de balk verbergt zijn eigen titel dan voor een schermlezer: die zou anders dezelfde titel twee keer tegenkomen.

**Zet de sheet in de document-root.** Die hoort niet in de inhoud van een split view: als slotted kind pikt die daar de hoogte van het paneel in, waarna een sticky footer los in het scherm komt te hangen. In een framework teleporteer je die naar `document.body`; het [sheet-component](../../nldd-design/reference.md#nldd-sheet) legt uit waarom.

**Open de sheet met `open`, en laat die in de DOM staan.** De [sheet](../../nldd-design/reference.md#nldd-sheet) zet `open` zelf weer uit als de gebruiker de sheet sluit, met Esc, een klik ernaast of de sluitknop. Bind `open` daarom samen met `close` aan je eigen toestand:

```html
<!-- Vue -->
<nldd-sheet
  :open="isOpen"
  @close="isOpen = false"
>
  <nldd-page><!-- zoals hierboven --></nldd-page>
</nldd-sheet>
```

Mount je de sheet pas op het moment dat die open moet, dan slaat de animatie over en verlies je wat er in het formulier stond. Het complete Vue-component staat in [bootstrap-vue](../examples/bootstrap-vue.md).

**Luister naar `close`, niet ook naar `dismiss`.** De sluitknop in de titelbalk vuurt `dismiss`, en dat event bubbelt. De sheet vangt het zelf op, sluit en vuurt `close`. Bind je beide, dan loopt je handler twee keer op één klik.

**De titel is ook de naam van de sheet.** Een schermlezer noemt de sheet naar de `text` van de titelbalk, ook als die verandert. Zet `accessible-label` alleen als de naam anders moet luiden dan de titel.

**Op een smal scherm is elke sheet een bottom sheet.** Alle plaatsingen klappen op sm naar onderen, en `width` geldt pas vanaf md.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc en met een klik naast de sheet, de focus die binnen de sheet blijft en daarna terugkeert naar de knop die de sheet opende, en de naam uit de titelbalk.

Wat jij nog moet doen: een `text` op de titelbalk die zegt waar de sheet over gaat, en een `dismiss-text`, zodat er een zichtbare uitweg is.

## Gezien in

Deze compositie komt voor in vrijwel elke applicatie op dit systeem, in Vue, Angular en server-gerenderde templates.
