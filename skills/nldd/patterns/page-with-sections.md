# Patroon: pagina met secties

**Welk probleem dit oplost.** Een pagina opbouwen die op elke schermbreedte
leesbaar blijft, met inhoud die niet te breed uitloopt en witruimte die overal
hetzelfde is, zonder zelf een grid of mediaquery te schrijven.

**Wanneer wel.** Vrijwel elke pagina, van een contentpagina tot een
overzichtsscherm in een applicatie.

**Wanneer niet.** Voor een werkomgeving met panelen naast elkaar (editor,
inspector, navigatiekolom) begin je met een split view en zet je de pagina
daarbinnen. Pagina's gaan in split views, niet andersom.

## Compositie

```
nldd-app-view                  (buitenste schil, zet de kleurschema-context)
  └─ nldd-page                 (sticky-header, background)
       ├─ slot="header"        (nldd-top-navigation-bar of nldd-top-title-bar)
       ├─ nldd-simple-section  (één per inhoudsblok, regelt zelf de breedte)
       │    ├─ nldd-title      (met een h1-h6 in de slot)
       │    └─ de inhoud       (rich-text, list, collection, form, …)
       └─ slot="footer"        (nldd-page-footer)
```

## Code

```html
<nldd-app-view>
  <nldd-page>
    <nldd-top-navigation-bar slot="header" website-title="Mijn Dienst"></nldd-top-navigation-bar>

    <nldd-simple-section>
      <nldd-title size="1">
        <span slot="overline">Dossier</span>
        <h1>Aanvraag 2024-001</h1>
        <nldd-button slot="end" variant="primary" text="Nieuwe aanvraag"></nldd-button>
      </nldd-title>
      <nldd-rich-text>
        <p>Een korte inleiding op deze pagina.</p>
      </nldd-rich-text>
    </nldd-simple-section>

    <nldd-simple-section background="tinted">
      <nldd-title size="2"><h2>Openstaande taken</h2></nldd-title>
      <nldd-list variant="box-base">
        <!-- rijen, zie het patroon "lijst met rijen" -->
      </nldd-list>
    </nldd-simple-section>
  </nldd-page>
</nldd-app-view>
```

## Waarom zo

**`nldd-app-view` is altijd de buitenste schil.** Die zet de
kleurschema-context, en de stylesheet geeft de `body` het documentfont zodra er
een app-view in de pagina staat. Importeer je alleen componenten en niet de
stijlen, dan krijg je dat niet.

**Eén sectie per inhoudsblok.** De sectie regelt zelf de maximale leesbreedte en
de responsieve padding via container queries: je hoeft er geen wrapper-div met
eigen CSS om. Herhaal de sectie in plaats van één sectie met eigen kolommen te
vullen.

**`size` op `nldd-title` is alleen visueel; de semantiek zet jij.** Zet een
echte `<h1>`, `<h2>` en zo verder in de slot. Een pagina met alleen
`nldd-title size="1"` zonder kopelement heeft geen koppenstructuur, en wie met
een schermlezer door de koppen springt vindt niets. Eén `<h1>` per pagina, en
sla geen niveaus over.

Dat laatste is een echte valkuil bij een herbruikbaar blok: een kaartcomponent
die zijn titel altijd een `h3` geeft, klopt onder een sectiekop maar springt van
`h1` naar `h3` op een overzichtspagina. Geef zo'n component een
*kopniveau-parameter* en laat de grootte uit `nldd-title` komen; die twee staan
los van elkaar.

**Wat aan het eind van de titelregel hoort, gaat in `slot="end"`.** Een knop, een
menu, een statusbadge, een versienummer. De slot heet naar de plek en niet naar
een soort inhoud, want er kan alles staan. Zet daar geen eigen flexbox met een
marge omheen.

**Vermijd een sticky header tenzij de inhoud die nodig heeft.** `nldd-page`
ondersteunt `sticky-header` en meet zelf de hoogte zodat de inhoud er niet onder
schuift, maar de standaard is: niet sticky. Verantwoord waarom als je ervoor
kiest.

**Achtergronden zet je per sectie met `background`.** `tinted` of `base` vult en
cascadeert naar de kinderen; `inherit` (de standaard) laat de sectie
doorschijnen. Zet geen eigen `background-color` op een wrapper: dan weten de
componenten binnenin niet waar ze op staan en kiezen ze de verkeerde
contrastvariant.

**Voor een raster van gelijkwaardige blokken gebruik je `nldd-collection` met
`nldd-card`,** niet een eigen CSS-grid. Voor een sectie met twee kolommen zijn er
de kant-en-klare varianten: `nldd-one-half-one-half-section`,
`nldd-two-thirds-one-third-section`, `nldd-one-third-two-thirds-section` en
`nldd-sidebar-section`.

**Zet geen wrapper-`div` in een `nldd-rich-text`.** De rich-text legt zijn
*directe* kinderen in een grid: koppen, paragrafen en figuren krijgen daardoor
hun kolom en hun onderlinge ruimte uit het systeem. Stop je ze in een `div`, dan
is die div het enige griditem, stopt het ritme daar en plakken de alinea's
tegen elkaar. Hetzelfde geldt voor een eigen `margin` op zo'n kind: in dat grid
doet die niets.

**De ouder bepaalt de ruimte, niet het blok zelf.** Een fragment dat op meer dan
één plek terechtkomt (in een sidebar én in een sheet) kan zijn eigen context
niet kennen: slot, padding en positionering horen bij wie het plaatst. Geef het
blok dus geen eigen buitenmarge, maar wikkel het bij de ouder in een
`nldd-container` met padding, of laat de sectie zijn padding doen. Doet het blok
het zelf ook, dan tel je de padding dubbel op de ene plek en mis je hem op de
andere.

**Verticale ruimte: `nldd-spacer` of `nldd-container`?** Een spacer is vaste
ruimte tussen twee verschillende dingen, en kan per breakpoint verschillen. Een
container geeft padding rond een gebied en regelt de layout van zijn kinderen.
Gebruik geen marges in eigen CSS.

```html
<!-- Vaste ruimte tussen twee componenten, eventueel per breakpoint -->
<nldd-spacer size="32"></nldd-spacer>
<nldd-spacer sm-size="16" md-size="24" lg-size="32"></nldd-spacer>

<!-- Padding rond een gebied plus de layout van de kinderen -->
<nldd-container padding="16" sm-padding="8" gap="8">
  <!-- kinderen -->
</nldd-container>
```

## Panelen naast elkaar: begin met een split view

Bouw je een werkomgeving in plaats van een pagina, dan is de buitenste laag een
split view en zit de pagina daarbinnen. De split view regelt zelf welke panelen
verdwijnen als het smal wordt, van rechts naar links: **links is de hoogste
prioriteit.** Zet de hoofdinhoud links en de inspector of het detail rechts.

```html
<nldd-app-view>
  <nldd-side-by-side-split-view panes="2">
    <div slot="pane-1"><!-- hoofdinhoud, blijft het langst zichtbaar --></div>
    <div slot="pane-2"><!-- inspector, verdwijnt eerst --></div>
  </nldd-side-by-side-split-view>
</nldd-app-view>
```

Een werkbalk naast de hoofdinhoud krijgt zijn eigen breakpoint-gedrag met
`nldd-bar-split-view`. De responsieve attributen (`above`, `below`, `only`) staan
gedocumenteerd op de split view, maar je zet ze op het kind:

```html
<nldd-app-view>
  <nldd-bar-split-view>
    <nldd-split-view-pane slot="primary-bar-md" only="md">
      <nldd-container padding="8">
        <nldd-toolbar size="md"><!-- ... --></nldd-toolbar>
      </nldd-container>
    </nldd-split-view-pane>
    <!-- hoofdinhoud -->
  </nldd-bar-split-view>
</nldd-app-view>
```

Elke unieke slotnaam op een bar-split-view maakt een nieuw balkpaneel; `main` is
het middenpaneel.

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte, de responsieve padding, de
kleurschema-context en het contrast dat daarbij hoort.

Wat jij nog moet doen: de koppenstructuur (`h1`-`h6` in de titelslots), en een
`nldd-skip-link` bovenaan als de pagina navigatie boven de inhoud heeft.

## Gezien in

`page > simple-section` en `simple-section > title` zijn de meest voorkomende
composities op dit systeem, in elk onderzocht product. De uitgewerkte content-
en landingspagina met hero, kaartenraster en footer staat in
[`../examples/content-page.md`](../examples/content-page.md).
