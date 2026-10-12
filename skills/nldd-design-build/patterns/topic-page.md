<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/topic-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: onderwerppagina

Een onderwerppagina is de [home](home-page.md) voor een onderwerp op een lager niveau in de website. De pagina geeft overzicht van wat bezoekers over dat onderwerp kunnen vinden en doen, en brengt relevante informatie en taken bij elkaar. Gebruik een [navigatiepagina](navigation-page.md) als bezoekers vooral naar onderliggende pagina’s moeten navigeren.

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar   zoeken en taal, terug naar de onderwerpen
       ├─ nldd-hero                      layout="overlap", de h1, een korte uitleg en de hoofdtaak
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

```html
<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
        back-text="Onderwerpen"
        back-href="#onderwerpen"
      >
        <nldd-menu-bar slot="utility">
          <nldd-menu-bar-item
            text="Zoeken"
            icon="magnifier"
            href="#zoeken"
            content-priority="text"
          ></nldd-menu-bar-item>
          <nldd-menu-bar-item
            text="NL"
            accessible-label="Taal: Nederlands (NL)"
            icon="globe"
            expandable
            content-priority="text"
          >
            <nldd-menu>
              <nldd-menu-item
                text="Nederlands"
                type="radio"
                selected
              ></nldd-menu-item>
              <nldd-menu-item
                text="English"
                type="radio"
                lang="en"
              ></nldd-menu-item>
            </nldd-menu>
          </nldd-menu-bar-item>
        </nldd-menu-bar>
      </nldd-top-navigation-bar>
    </nldd-skip-link>

    <nldd-hero
      layout="overlap"
      main-background="accent"
    >
      <nldd-image slot="media"></nldd-image>
      <nldd-title
        color="inherit"
        size="1"
        text="Isoleren"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-rich-text color="inherit">
        <p>Een goed geïsoleerd huis houdt de warmte binnen en is in de zomer koeler. Voor dakisolatie kun je een aanvraag doen; hieronder staat wat je daarvoor moet weten.</p>
      </nldd-rich-text>
      <nldd-spacer size="24"></nldd-spacer>
      <nldd-button
        appearance="inherit-filled"
        text="Aanvraag starten"
        href="#aanvraag-starten"
      ></nldd-button>
    </nldd-hero>

    <nldd-one-half-one-half-section vertical-alignment="center">
      <nldd-title
        slot="left"
        size="2"
        text="Isoleren houdt de warmte binnen"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Een goed geïsoleerd huis verliest minder warmte, dus je stookt minder en het blijft in de zomer koeler.</p>
        <p>Isoleren is ook vaak de eerste stap voor een warmtepomp: die werkt het best in een huis dat de warmte vasthoudt.</p>
      </nldd-rich-text>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-link
        slot="left"
        size="md"
        end-icon="arrow-right"
        href="#waarom-isoleren"
        text="Meer over wat isoleren oplevert"
      ></nldd-link>
      <nldd-image
        slot="right"
        aspect-ratio="3/2"
      ></nldd-image>
    </nldd-one-half-one-half-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Voor dakisolatie doe je een aanvraag"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="header"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="header">
        <p>Dit zijn de pagina's die je daarbij helpen, waar ze op de site ook staan.</p>
      </nldd-rich-text>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
        <nldd-card
          href="#aanvraag-indienen"
          accessible-label="Aanvraag indienen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Aanvraag indienen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Wat je nodig hebt en hoe het indienen gaat.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#behandeling-volgen"
          accessible-label="Behandeling volgen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Behandeling volgen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Bij welke stap je aanvraag ligt, en wie er aan werkt.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#bezwaar-maken"
          accessible-label="Bezwaar maken"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Bezwaar maken"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Wat je doet als je het niet eens bent met een besluit.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
      </nldd-collection>
    </nldd-simple-section>

    <nldd-one-third-two-thirds-section>
      <nldd-title
        slot="left"
        size="2"
        text="Soorten isolatie"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Welke isolatie past, hangt af van je huis: hoe oud het is, hoe het gebouwd is en wat er al gedaan is. Per soort lees je wat het oplevert en waar je op let.</p>
      </nldd-rich-text>
      <nldd-list
        slot="right"
        type="navigation"
        aria-label="Soorten isolatie"
      >
        <nldd-list-item href="#dakisolatie">
          <nldd-text-cell
            text="Dakisolatie"
            supporting-text="Het meeste effect, omdat warmte opstijgt"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#spouwmuurisolatie">
          <nldd-text-cell
            text="Spouwmuurisolatie"
            supporting-text="Voor huizen met een spouw tussen de muren"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#vloerisolatie">
          <nldd-text-cell
            text="Vloerisolatie"
            supporting-text="Warmere voeten en minder vocht"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#isolerend-glas">
          <nldd-text-cell
            text="Isolerend glas"
            supporting-text="Minder kou bij de ramen"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
      </nldd-list>
    </nldd-one-third-two-thirds-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="3"
        text="Verwante onderwerpen"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
        <nldd-card
          href="#warmtepomp"
          accessible-label="Warmtepomp"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Warmtepomp"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Van luchtwarmtepomp tot hybride, en wat je huis ervoor nodig heeft.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#energie-besparen"
          accessible-label="Energie besparen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Energie besparen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Kleine stappen die je meteen kunt zetten.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#zonnepanelen"
          accessible-label="Zonnepanelen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Zonnepanelen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Wat je moet weten voor je begint.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
      </nldd-collection>
    </nldd-simple-section>

    <nldd-page-footer slot="footer">
      <nldd-breadcrumbs slot="breadcrumbs">
        <nldd-breadcrumbs-item
          text="Home"
          href="#home"
        ></nldd-breadcrumbs-item>
        <nldd-breadcrumbs-item
          text="Onderwerpen"
          href="#onderwerpen"
        ></nldd-breadcrumbs-item>
        <nldd-breadcrumbs-item
          text="Isoleren"
          current
        ></nldd-breadcrumbs-item>
      </nldd-breadcrumbs>
      <nldd-page-footer-legal-bar slot="legal-bar">
        <nldd-page-footer-legal-bar-item
          slot="start"
          text="Nederlandse Digitale Dienst"
        ></nldd-page-footer-legal-bar-item>
        <nldd-page-footer-legal-bar-item
          slot="end"
          href="#contact"
          text="Contact"
        ></nldd-page-footer-legal-bar-item>
        <nldd-page-footer-legal-bar-item
          slot="end"
          href="#toegankelijkheid"
          text="Toegankelijkheid"
        ></nldd-page-footer-legal-bar-item>
        <nldd-page-footer-legal-bar-item
          slot="end"
          href="#privacy"
          text="Privacy"
        ></nldd-page-footer-legal-bar-item>
        <nldd-page-footer-legal-bar-item
          slot="end"
          href="#over-deze-website"
          text="Over deze website"
        ></nldd-page-footer-legal-bar-item>
      </nldd-page-footer-legal-bar>
    </nldd-page-footer>
  </nldd-page>
</nldd-shell>
```

## Waarom zo

**De onderwerppagina werkt zoals de home.** De secties introduceren wat bij het onderwerp hoort, geven de ingangen ernaartoe en scheppen de verwachting van wat je daar vindt. Wat bij de [home](home-page.md) staat over de hero, de secties en de koppen geldt hier ook. Hieronder staat alleen wat anders is.

**Een onderwerppagina heeft een terugknop en een kruimelpad.** Dat is het grote verschil met de home: er ligt een pagina boven. De bovenbalk heeft daarom een terugknop daarnaartoe, en de footer een kruimelpad dat laat zien waar je bent.

Het geraamte van de pagina, met de header en de footer, staat bij de [paginaopbouw](page-structure.md).

## Toegankelijkheid

Wat je gratis krijgt: wat bij de [paginaopbouw](page-structure.md) staat, en een knop met `href` die een echte link is.

Wat jij nog moet doen: wat bij de [paginaopbouw](page-structure.md) staat, een `heading-level` op elke titel, en een knoptekst die de taak noemt, want hij staat los van de kaarten en moet zonder de tekst eromheen te begrijpen zijn.
