<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/read-in-a-sheet/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: lezen in een sheet

Een rij in een lijst opent een sheet met de uitleg die erbij hoort. De pagina blijft staan zoals hij was, en wie klaar is met lezen, sluit de sheet en staat weer op dezelfde plek. Gebruik deze vorm waar je anders een [`nldd-accordion`](../../nldd-design/reference.md#nldd-accordion) zou kiezen, maar de inhoud lang is, een formulier bevat of een taak op zich is.

## Wanneer wel en niet

Een accordion klapt de inhoud uit op de plek zelf. Dat werkt voor een kort antwoord: de pagina schuift een paar regels op en je ziet nog waar je was. Bij een lange tekst duwt hij alles eronder uit beeld, en wie dichtklapt, staat ergens anders dan waar hij begon. Een sheet legt de inhoud over de pagina heen in plaats van erin, dus de pagina zelf verschuift nooit.

Kies de accordion voor korte, aanvullende inhoud. Kies deze sheet zodra de inhoud langer is dan een scherm, koppen nodig heeft, of iets vraagt om te doen. Moet er iets ingevuld worden, dan is het [bewerken in een sheet](edit-in-a-sheet.md). Zie ook de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md) over in- en uitklappen.

## Compositie

```
nldd-page                      de pagina met de lijst
  └─ nldd-simple-section
       └─ nldd-list            appearance="box-base", accessible-label
            └─ nldd-list-item  button, per onderwerp
                 ├─ nldd-text-cell     het onderwerp
                 └─ nldd-icon-cell     chevron-right: hier gaat iets open

nldd-sheet                     open, placement, width; in de document-root
  └─ nldd-page               sticky-header, zodat de balk in beeld blijft
       ├─ nldd-top-title-bar   slot="header", met text, dismiss-text en collapse-anchor
       └─ nldd-simple-section
            ├─ nldd-title      slot="header", het id waar de balk naar wijst
            └─ nldd-rich-text  de inhoud, met eigen koppen
```

```html
<nldd-page>
  <nldd-simple-section>
    <nldd-title
      slot="header"
      size="display-2"
      text="Aanvraag A-1042"
      heading-level="1"
    ></nldd-title>
    <nldd-list
      appearance="box-base"
      accessible-label="Over de aanvraag"
    >
      <nldd-list-item button>
        <nldd-text-cell text="Stukken bij de aanvraag"></nldd-text-cell>
        <nldd-spacer-cell size="12"></nldd-spacer-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
      <nldd-list-item button>
        <nldd-text-cell text="Beoordeling door team Uitvoering"></nldd-text-cell>
        <nldd-spacer-cell size="12"></nldd-spacer-cell>
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
  <nldd-page sticky-header>
    <nldd-top-title-bar
      slot="header"
      text="Stukken bij de aanvraag"
      dismiss-text="Sluit"
      collapse-anchor="onderwerp-titel"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-title
        id="onderwerp-titel"
        slot="header"
        size="display-2"
        text="Stukken bij de aanvraag"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Bij een aanvraag voor dakisolatie horen de offerte van het isolatiebedrijf en een foto van het dak voor de isolatie.</p>
        <h2>De offerte</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <ul>
          <li>De offerte noemt de isolatiewaarde.</li>
          <li>De offerte noemt de oppervlakte van het dak.</li>
        </ul>
        <h2>De foto</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-sheet>
```

## Waarom zo

**De rij zegt waar hij heen gaat.** De chevron naar rechts belooft een nieuw vlak, waar de chevron van een accordion belooft dat er iets openklapt. Het onderwerp in de rij is dezelfde zin als de titel in de sheet, zodat je ziet dat je bent aangekomen waar je op klikte.

**De sheet heeft een eigen pagina.** Daardoor krijgt de inhoud de hele hoogte van het scherm, eigen koppen en een titelbalk die met `sticky-header` in beeld blijft en de titel overneemt zodra je eroverheen scrolt, net als bij [bewerken in een sheet](edit-in-a-sheet.md). In een accordion zou een kop in de inhoud ondergeschikt zijn aan de titel van het item, en die titel scrolt weg.

**"Sluit", niet "Annuleer".** Er valt niets te annuleren: je hebt alleen gelezen. Er is ook geen primaire actie, dus de uitweg in de titelbalk is de enige knop.

**Zet de sheet in de document-root.** Om dezelfde reden als bij [bewerken in een sheet](edit-in-a-sheet.md): als kind van een split view pikt hij de hoogte van het paneel in. In een framework teleporteer je hem naar `document.body`.

## Toegankelijkheid

Wat je gratis krijgt: elke rij is een knop, de sheet heeft de dialoogrol en de naam uit de titelbalk, sluit met Esc en met een klik ernaast, en de focus gaat na het sluiten terug naar de rij die hem opende.

Wat jij nog moet doen: een `accessible-label` op de lijst, een `text` op de titelbalk die zegt waar de sheet over gaat, en een `dismiss-text`.
