<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/page-with-sections/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: pagina met secties

**Welk probleem dit oplost.** Een pagina opbouwen die op elke schermbreedte
leesbaar blijft, met inhoud die niet te breed uitloopt en witruimte die overal
hetzelfde is, zonder zelf een grid of mediaquery te schrijven.

**Wanneer wel.** Vrijwel elke pagina, van een contentpagina tot een
overzichtsscherm in een applicatie.

**Wanneer niet.** Voor een werkomgeving met panelen naast elkaar (een lijst met
een detail, een editor met een inspector) begin je met een split view, en zet je
de pagina's daarbinnen. Zie hieronder.

## Compositie

```
nldd-app-view                  de buitenste schil
  └─ nldd-page
       ├─ slot="header"        nldd-top-navigation-bar of nldd-top-title-bar
       ├─ nldd-simple-section  één per inhoudsblok
       │    ├─ nldd-title      slot="header", text en heading-level
       │    └─ de inhoud       nldd-rich-text, nldd-list, nldd-collection, nldd-form, …
       └─ slot="footer"        nldd-page-footer
```

```html
<nldd-app-view>
  <nldd-page>
    <nldd-top-navigation-bar slot="header"
      website-title="Mijn Dienst"
    ></nldd-top-navigation-bar>

    <nldd-simple-section>
      <nldd-title slot="header"
        size="1"
        overline="Dossier"
        text="Aanvraag 2024-001"
        heading-level="1"
      >
        <nldd-button slot="end"
          variant="primary"
          text="Nieuwe aanvraag"
        ></nldd-button>
      </nldd-title>
      <nldd-rich-text>
        <p>Een korte inleiding op deze pagina.</p>
      </nldd-rich-text>
    </nldd-simple-section>

    <nldd-simple-section background="tinted">
      <nldd-title slot="header"
        size="2"
        text="Openstaande taken"
        heading-level="2"
      ></nldd-title>
      <nldd-list variant="box-base"
        accessible-label="Openstaande taken"
      >
        <nldd-list-item href="#documenten-controleren">
          <nldd-text-cell text="Documenten controleren"
            supporting-text="Voor vrijdag"
          ></nldd-text-cell>
        </nldd-list-item>
        <nldd-list-item href="#besluit-versturen">
          <nldd-text-cell text="Besluit versturen"
            supporting-text="Na goedkeuring"
          ></nldd-text-cell>
        </nldd-list-item>
      </nldd-list>
    </nldd-simple-section>
  </nldd-page>
</nldd-app-view>
```

## Waarom zo

**De app view is altijd de buitenste schil.** De
[app view](../../nldd-design/reference.md#nldd-app-view) zet de achtergrond en
bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont
komt uit de stylesheet van het pakket, zodra er een app view op de pagina staat.

**Eén sectie per inhoudsblok.** Een
[simple section](../../nldd-design/reference.md#nldd-simple-section)
regelt zelf de leesbreedte en de witruimte, en geeft de titel in zijn
`header`-slot de juiste afstand tot de inhoud. Herhaal de sectie in plaats van er
zelf kolommen in te bouwen, en geef een blok een eigen vlak met `background` op
de sectie, niet met een achtergrondkleur van jezelf.

**Eén `h1` per pagina, en geen niveau overslaan.** `size` op een
[title](../../nldd-design/reference.md#nldd-title) is hoe hij eruitziet,
`heading-level` wat hij is. Dat maakt een herbruikbaar blok eenvoudig: geef het
een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en
op een overzichtspagina een `h2`, en laat de grootte los daarvan.

**Een sticky header alleen als de inhoud erom vraagt.** Een
[pagina](../../nldd-design/reference.md#nldd-page) kan zijn header laten
meelopen, maar standaard doet hij dat niet: elke balk die blijft staan, kost
ruimte die de inhoud nodig heeft. Zie de
[ontwerprichtlijnen](../../nldd-design/design-guidelines.md#visueel-en-layout).

## Panelen naast elkaar: begin met een split view

Bouw je een werkomgeving in plaats van een pagina, dan is de split view de
laag direct onder de app view, en staat in elk paneel een eigen pagina. De
[side-by-side split view](../../nldd-design/reference.md#nldd-side-by-side-split-view)
laat panelen van rechts naar links verdwijnen als het scherm smal wordt. Zet
de hoofdinhoud dus in `pane-1` en het detail of de inspector rechts.

```html
<nldd-app-view>
  <nldd-side-by-side-split-view panes="2">
    <nldd-split-view-pane slot="pane-1">
      <nldd-page landmarks="page">
        <nldd-top-title-bar slot="header"
          text="Dossiers"
        ></nldd-top-title-bar>
        <nldd-simple-section>
          <nldd-list accessible-label="Dossiers">
            <nldd-list-item href="#dossier-2024-001">
              <nldd-text-cell text="Dossier 2024-001"
                supporting-text="In behandeling"
              ></nldd-text-cell>
            </nldd-list-item>
            <nldd-list-item href="#dossier-2024-002">
              <nldd-text-cell text="Dossier 2024-002"
                supporting-text="Afgerond"
              ></nldd-text-cell>
            </nldd-list-item>
          </nldd-list>
        </nldd-simple-section>
      </nldd-page>
    </nldd-split-view-pane>

    <nldd-split-view-pane slot="pane-2"
      background="tinted"
    >
      <nldd-page accessible-label="Dossier 2024-001">
        <nldd-top-title-bar slot="header"
          text="Dossier 2024-001"
          heading-level="2"
        ></nldd-top-title-bar>
        <nldd-simple-section>
          <nldd-rich-text>
            <p>Het detail van het gekozen dossier. Dit paneel verdwijnt als eerste als het scherm smal wordt.</p>
          </nldd-rich-text>
        </nldd-simple-section>
      </nldd-page>
    </nldd-split-view-pane>
  </nldd-side-by-side-split-view>
</nldd-app-view>
```

**Elk paneel heeft een titelbalk, maar de pagina heeft één `h1`.** Een
[titelbalk](../../nldd-design/reference.md#nldd-top-title-bar) rendert
standaard een `h1`. Geef de titelbalk van een paneel naast de hoofdinhoud
daarom `heading-level="2"`.

**Zeg welk paneel de hoofdinhoud draagt, met `landmarks="page"`.** Een document
heeft één `main`, één banner en één contentinfo, dus een
[pagina](../../nldd-design/reference.md#nldd-page) in een paneel houdt die niet
vanzelf: ze wordt een sectie zonder landmarks. Welk paneel de hoofdinhoud is,
weet alleen de applicatie, dus dat zet je er zelf op. Geef de andere panelen een
`accessible-label`, dan zijn het benoemde regio's waar een schermlezergebruiker
naartoe kan springen, met een naam die zegt wat erin staat.

Voor balken boven of onder de hoofdinhoud, zoals een werkbalk of een
statusbalk, is er de
[bar split view](../../nldd-design/reference.md#nldd-bar-split-view).

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte, de responsieve witruimte, de achtergrond
en het contrast dat daarbij hoort, en de koppen die de titels renderen.

Wat jij nog moet doen: een `heading-level` op elke titel en titelbalk, zodat de
koppenstructuur klopt, en een
[skip link](../../nldd-design/reference.md#nldd-skip-link) bovenaan als er
navigatie boven de inhoud staat.

## Gezien in

`page > simple-section` en `simple-section > title` zijn de meest voorkomende
composities op dit systeem, in elk onderzocht product. Een uitgewerkte content-
en landingspagina met hero, kaartenraster en footer staat in
[content-page](../examples/content-page.md).
