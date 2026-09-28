<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/edit-in-a-sheet/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: bewerken in een sheet

**Welk probleem dit oplost.** Bewerken of details laten zien, zonder de gebruiker weg te halen van waar het werk begon. De pagina, met bijvoorbeeld een lijst, blijft in beeld, dus de context blijft staan.

**Wanneer wel.** Secundaire inhoud die de context moet bewaren: een bewerkformulier, een detailweergave, een filterpaneel, instellingen.

**Wanneer niet.** Voor een korte en simpele bevestiging is een sheet vaak te zwaar. Voor een klein paneel dat aan één knop hangt gebruik je een [`nldd-popover`](../../nldd-design/reference.md#nldd-popover). Gebruik een [menu](menu-from-a-button.md) als het gaat om een lijst met keuzes of acties.

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
          text="Aanvraag A-1042"
          supporting-text="Dakisolatie, in behandeling"
        ></nldd-text-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
      <nldd-list-item button>
        <nldd-text-cell
          text="Aanvraag A-1043"
          supporting-text="Warmtepomp, afgerond"
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
      text="Aanvraag A-1042 bewerken"
      dismiss-text="Annuleer"
      collapse-anchor="aanvraag-titel"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-title
        id="aanvraag-titel"
        slot="header"
        size="2"
        text="Aanvraag A-1042 bewerken"
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

**De uitweg staat bovenin, de primaire actie onder het laatste veld.** "Annuleer" zit in de [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar), "Bewaar" staat in `nldd-form-actions` waar je kijkt als je klaar bent met het laatste veld. Zo staan ze niet naast elkaar, en gaat niemand op de automatische piloot naar de uitweg. Zet dus geen tweede knop naast "Bewaar"; zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md). Wordt het formulier langer dan de sheet, dan kan de actie met `sticky-footer` op de pagina in beeld blijven, maar dat is de uitzondering: de knop staat dan buiten het formulier en heeft een `form` nodig die ernaar wijst, zie [formulier](form.md).

**Noem waar de sheet over gaat.** "Aanvraag A-1042 bewerken" in plaats van "Aanvraag bewerken": een sheet opent meestal vanaf een rij tussen rijen die op elkaar lijken. De ingevulde velden zeggen het ook, maar alleen zolang ze in beeld zijn.

**De titel staat in de inhoud, de balk neemt die over bij het scrollen.** Zet een [`nldd-title`](../../nldd-design/reference.md#nldd-title) boven het formulier en laat de [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar) daarnaar wijzen met `collapse-anchor`. Zolang de kop in beeld staat is de balk stil, met alleen de uitweg erin; zodra je eroverheen scrolt, schuift de titel de balk in. Allebei dezelfde woorden dus, want de balk verbergt zijn eigen titel dan voor een schermlezer: die zou anders dezelfde titel twee keer tegenkomen.

**Zet de sheet in de document-root.** Die hoort niet in de inhoud van een split view: als slotted kind pikt die daar de hoogte van het paneel in, waarna een sticky footer los in het scherm komt te hangen. In een framework teleporteer je die naar `document.body`; [`nldd-sheet`](../../nldd-design/reference.md#nldd-sheet) legt uit waarom.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc en met een klik naast de sheet, de focus die binnen de sheet blijft en daarna terugkeert naar de knop die de sheet opende, en de naam uit de titelbalk.

Wat jij nog moet doen: een `text` op de titelbalk die zegt waar de sheet over gaat, en een `dismiss-text`, zodat er een zichtbare uitweg is.

## Gezien in

Deze compositie komt voor in vrijwel elke applicatie op dit systeem, in Vue, Angular en server-gerenderde templates.
