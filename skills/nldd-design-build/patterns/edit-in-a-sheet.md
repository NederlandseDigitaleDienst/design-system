<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/edit-in-a-sheet/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: bewerken in een sheet

**Welk probleem dit oplost.** Iets laten bewerken of een detail laten zien, zonder de gebruiker weg te halen van waar hij was. De lijst of de pagina eronder blijft in beeld, dus de context blijft staan.

**Wanneer wel.** Secundaire inhoud die de context moet bewaren: een bewerkformulier, een detailweergave, een filterpaneel, instellingen.

**Wanneer niet.** Voor een korte bevestiging is een sheet te zwaar, zie [bevestigen](confirm.md). Voor een licht paneel dat aan één knop hangt, zoals een snelle filter, gebruik je een [popover](../../nldd-design/reference.md#nldd-popover). En bekijken en bewerken zijn verschillende taken: pers ze niet in één scherm met inline bewerken.

## Compositie

```
nldd-sheet                     open, placement, width
  └─ nldd-page                 sticky-footer
       ├─ nldd-top-title-bar   slot="header", met text en dismiss-text
       ├─ nldd-simple-section  de inhoud, hier een nldd-form
       └─ nldd-container       slot="footer", met de primaire actie
```

```html
<nldd-button
  id="aanvraag-bewerken"
  variant="primary"
  text="Bewerk aanvraag"
></nldd-button>

<nldd-sheet
  placement="right"
  width="480px"
>
  <nldd-page sticky-footer>
    <nldd-top-title-bar
      slot="header"
      text="Aanvraag bewerken"
      dismiss-text="Sluiten"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-form name="aanvraag">
        <nldd-form-field label="Titel">
          <nldd-text-field name="titel"></nldd-text-field>
        </nldd-form-field>
        <nldd-form-field
          label="Toelichting"
          optional
        >
          <nldd-multi-line-text-field name="toelichting"></nldd-multi-line-text-field>
        </nldd-form-field>
      </nldd-form>
    </nldd-simple-section>

    <nldd-container
      slot="footer"
      padding="16"
    >
      <nldd-button
        variant="primary"
        text="Bewaar"
        width="full"
      ></nldd-button>
    </nldd-container>
  </nldd-page>
</nldd-sheet>
```

## Waarom zo

**De uitweg staat bovenin, de primaire actie onderin.** "Sluiten" zit in de [titelbalk](../../nldd-design/reference.md#nldd-top-title-bar) en "Bewaar" in de footer. Zo staat de uitweg niet naast de knop waar de gebruiker op de automatische piloot naartoe gaat. Zet dus geen "Annuleer" naast "Bewaar"; zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md).

**Open de sheet met `open`, en laat hem in de DOM staan.** De [sheet](../../nldd-design/reference.md#nldd-sheet) zet `open` zelf weer uit als de gebruiker hem sluit, met Esc, een klik ernaast of de sluitknop. Bind `open` daarom samen met `close` aan je eigen toestand:

```html
<!-- Vue -->
<nldd-sheet :open="isOpen" @close="isOpen = false">
  <nldd-page><!-- zoals hierboven --></nldd-page>
</nldd-sheet>
```

Mount je de sheet pas op het moment dat hij open moet, dan slaat de animatie over en verlies je wat er in het formulier stond. Het complete Vue-component staat in [bootstrap-vue](../examples/bootstrap-vue.md).

**Luister naar `close`, niet ook naar `dismiss`.** De sluitknop in de titelbalk vuurt `dismiss`, en dat event bubbelt. De sheet vangt het zelf op, sluit en vuurt `close`. Bind je beide, dan loopt je handler twee keer op één klik.

**De titel is ook de naam van de sheet.** Een schermlezer noemt de sheet naar de `text` van de titelbalk, ook als die verandert. Zet `accessible-label` alleen als de naam anders moet luiden dan de titel.

**Op een smal scherm is elke sheet een bottom sheet.** Alle plaatsingen klappen op sm naar onderen, en `width` geldt pas vanaf md. Met `sticky-footer` op de pagina blijft "Bewaar" in beeld, hoe lang het formulier ook wordt.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc en met een klik naast de sheet, de focus die binnen de sheet blijft en daarna terugkeert naar de knop die hem opende, en de naam uit de titelbalk.

Wat jij nog moet doen: een `text` op de titelbalk, en een `dismiss-text`, zodat er een zichtbare sluitknop is.

## Gezien in

Deze compositie komt voor in vrijwel elke applicatie op dit systeem, in Vue, Angular en server-gerenderde templates.
