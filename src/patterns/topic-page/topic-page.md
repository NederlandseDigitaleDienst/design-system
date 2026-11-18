# Onderwerppagina

Een onderwerppagina is de [home](/patronen/home-page/) voor een onderwerp op een lager niveau in de website. De pagina geeft overzicht van wat bezoekers over dat onderwerp kunnen vinden en doen, en brengt relevante informatie en taken bij elkaar. Gebruik een [navigatiepagina](/patronen/navigation-page/) als bezoekers vooral naar onderliggende pagina’s moeten navigeren.

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar   zoeken en taal, terug naar de onderwerpen
       ├─ nldd-hero                      de h1, een korte uitleg en de hoofdtaak
       │    └─ slot="media"              nldd-image, hier nog zonder beeld
       ├─ nldd-one-half-one-half-section tekst links, afbeelding rechts
       │    ├─ slot="left"               titel, tekst en een nldd-link verder
       │    └─ slot="right"              nldd-image met aspect-ratio
       ├─ nldd-simple-section            background="tinted", wat je moet weten
       │    ├─ slot="header"             de titel en een intro van een zin of twee
       │    └─ nldd-collection
       │         └─ nldd-card            href, naar pagina's waar ze ook staan
       ├─ nldd-one-third-two-thirds-section
       │    ├─ slot="left"               de titel en een korte uitleg
       │    └─ slot="right"              een nldd-list type="navigation" naar de pagina's eronder
       ├─ nldd-simple-section            background="tinted", verwante onderwerpen
       │    └─ nldd-collection
       │         └─ nldd-card            href, naar het andere onderwerp
       └─ slot="footer"                  nldd-page-footer
            ├─ slot="breadcrumbs"
            └─ slot="legal-bar"
```

<!-- voorbeeld: Standaard -->

## Waarom zo

**De onderwerppagina werkt zoals de home.** De secties introduceren wat bij het onderwerp hoort, geven de ingangen ernaartoe en scheppen de verwachting van wat je daar vindt. Wat bij de [home](/patronen/home-page/) staat over de hero, de secties en de koppen geldt hier ook. Hieronder staat alleen wat anders is.

**Een onderwerppagina heeft een terugknop en een kruimelpad.** Dat is het grote verschil met de home: er ligt een pagina boven. De bovenbalk heeft daarom een terugknop daarnaartoe, en de footer een kruimelpad dat laat zien waar je bent.

Het geraamte van de pagina, met de header en de footer, staat bij de [paginaopbouw](/patronen/page-structure/).

## Toegankelijkheid

Wat je gratis krijgt: wat bij de [paginaopbouw](/patronen/page-structure/) staat, en een knop met `href` die een echte link is.

Wat jij nog moet doen: wat bij de [paginaopbouw](/patronen/page-structure/) staat, de kop van het juiste niveau in het slot van elke titel, en een knoptekst die de taak noemt, want hij staat los van de kaarten en moet zonder de tekst eromheen te begrijpen zijn.
