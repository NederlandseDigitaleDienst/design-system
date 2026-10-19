<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/navigation-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: navigatiepagina

Een navigatiepagina helpt bezoekers hun weg te vinden naar onderliggende pagina’s. De pagina kan ook uitleg of andere content bevatten, maar de nadruk ligt op de keuzes en routes die bezoekers vanaf hier kunnen volgen. Ligt de nadruk vooral op het onderwerp zelf, met uitleg en uitgelichte informatie, kies dan een [onderwerppagina](topic-page.md).

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar   zoeken en taal, terug naar de home
       ├─ nldd-one-third-two-thirds-section    met een lijst
       │    ├─ slot="left"               de nldd-title met de h1 en een korte intro
       │    └─ slot="right"              een nldd-list type="navigation"
       ├─ nldd-simple-section            of, met kaarten
       │    ├─ slot="header"             de nldd-title met de h1 en een korte intro
       │    └─ nldd-collection           layout="grid", met een nldd-card per pagina
       └─ slot="footer"                  nldd-page-footer
            ├─ slot="breadcrumbs"        waar deze pagina staat
            └─ slot="legal-bar"
```

Met een lijst:

```html
<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
        back-text="Home"
        back-href="#home"
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

    <nldd-one-third-two-thirds-section>
      <nldd-title
        slot="left"
        size="1"
        text="Aanvragen"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Alles over het indienen en volgen van een aanvraag, van wat je nodig hebt tot wat je doet als je het niet eens bent met het besluit.</p>
      </nldd-rich-text>
      <nldd-list
        slot="right"
        type="navigation"
        accessible-label="Aanvragen"
      >
        <nldd-list-item href="#aanvraag-indienen">
          <nldd-text-cell
            text="Aanvraag indienen"
            supporting-text="Wat je nodig hebt en hoe het indienen gaat."
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#behandeling-volgen">
          <nldd-text-cell
            text="Behandeling volgen"
            supporting-text="Bij welke stap je aanvraag ligt, en wie er aan werkt."
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#aanvraag-wijzigen">
          <nldd-text-cell
            text="Aanvraag wijzigen"
            supporting-text="Gegevens aanvullen of een offerte vervangen, zolang de aanvraag loopt."
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#aanvraag-intrekken">
          <nldd-text-cell
            text="Aanvraag intrekken"
            supporting-text="Stoppen met een aanvraag die nog in behandeling is."
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#besluit-begrijpen">
          <nldd-text-cell
            text="Besluit begrijpen"
            supporting-text="Wat er in het besluit staat en wat het voor je betekent."
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#bezwaar-maken">
          <nldd-text-cell
            text="Bezwaar maken"
            supporting-text="Wat je doet als je het niet eens bent met een besluit."
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

    <nldd-page-footer slot="footer">
      <nldd-breadcrumbs slot="breadcrumbs">
        <nldd-breadcrumbs-item
          text="Home"
          href="#home"
        ></nldd-breadcrumbs-item>
        <nldd-breadcrumbs-item
          text="Aanvragen"
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

Met kaarten:

```html
<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
        back-text="Home"
        back-href="#home"
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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvragen"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer
        slot="header"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="header">
        <p>Alles over het indienen en volgen van een aanvraag, van wat je nodig hebt tot wat je doet als je het niet eens bent met het besluit.</p>
      </nldd-rich-text>
      <nldd-collection
        layout="grid"
        item-min-width="280px"
      >
        <nldd-card
          href="#aanvraag-indienen"
          accessible-label="Aanvraag indienen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Aanvraag indienen"
              heading-level="2"
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
              size="4"
              text="Behandeling volgen"
              heading-level="2"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Bij welke stap je aanvraag ligt, en wie er aan werkt.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#aanvraag-wijzigen"
          accessible-label="Aanvraag wijzigen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Aanvraag wijzigen"
              heading-level="2"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Gegevens aanvullen of een offerte vervangen, zolang de aanvraag loopt.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#aanvraag-intrekken"
          accessible-label="Aanvraag intrekken"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Aanvraag intrekken"
              heading-level="2"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Stoppen met een aanvraag die nog in behandeling is.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#besluit-begrijpen"
          accessible-label="Besluit begrijpen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Besluit begrijpen"
              heading-level="2"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Wat er in het besluit staat en wat het voor je betekent.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#bezwaar-maken"
          accessible-label="Bezwaar maken"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Bezwaar maken"
              heading-level="2"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Wat je doet als je het niet eens bent met een besluit.</p>
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
          text="Aanvragen"
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

**De pagina helpt bezoekers verder.** Een navigatiepagina helpt bezoekers kiezen waar ze verder gaan. Een korte introductie geeft context. Eventuele contentsecties staan onder de navigatie en lichten het onderwerp verder toe. De nadruk ligt op de onderliggende pagina’s: bezoekers moeten kunnen zien welke routes er zijn en welke route bij hen past. Ligt de nadruk vooral op uitleg of uitgelichte informatie over het onderwerp, dan past een [onderwerppagina](topic-page.md) beter.

**Zet de navigatie op een plek waar bezoekers die snel zien.** Bij een lijst staan de titel en korte introductie naast de navigatie. Zo zien bezoekers op een breed scherm meteen welke routes er zijn. Kies je voor kaarten, zet de titel en introductie erboven en geef de kaarten de ruimte eronder. Op een smal scherm staat de introductie in beide gevallen boven de navigatie. Houd die daarom kort.

**Kies één vorm voor de navigatie.** Gebruik een lijst als de titels duidelijk maken waar een link naartoe gaat. Een lijst is rustig en makkelijk te scannen, ook als er veel pagina’s zijn. Kaarten geven keuzes meer nadruk en ruimte voor een toelichting of afbeelding. Ze passen vooral bij een klein aantal pagina’s die duidelijk van elkaar verschillen. Eventuele contentsecties volgen onder de lijst of kaarten.

**Maak elke keuze één duidelijke link.** Maak de hele rij of kaart klikbaar. Zo is elke keuze één link en één tabstop. Een losse knop of link met “Lees meer” herhaalt de link en voegt een extra tabstop toe. In een lijst laat een chevron zien dat de rij naar een andere pagina leidt.

**Schrijf titels die de bestemming benoemen.** Laat de titel zeggen waar de link naartoe gaat, bijvoorbeeld "Aanvraag wijzigen". Een korte toelichting kan helpen om vergelijkbare keuzes van elkaar te onderscheiden. Houd die toelichting bij de keuze zelf; de uitgebreide uitleg hoort op de pagina waar de link naartoe leidt.

**Gebruik koppen op de juiste plek.** Kaarttitels zijn koppen. Als er geen andere sectiekop boven de kaarten staat, volgen ze direct op de paginatitel. Lijstrijen zijn geen koppen. Geef kaartcomponenten die je op meerdere plekken gebruikt het juiste kopniveau mee.

Het geraamte van de pagina, met de header en de footer, staat bij de [paginaopbouw](page-structure.md).

## Toegankelijkheid

Wat je gratis krijgt: elke rij en elke kaart is één link en één tabstop, een lijst met `type="navigation"` is een eigen navigatie, en op smal staat alles in de volgorde waarin je het leest.

Wat jij nog moet doen: wat bij de [paginaopbouw](page-structure.md) staat, een `heading-level` op elke titel, een `accessible-label` op de lijst, en een titel die zonder de zin eronder ook te begrijpen is. Bij kaarten is die titel ook het `accessible-label`, dus een schermlezer die door de links springt hoort alleen die.

## Gezien in

De pagina [Over deze website](https://digitaledienst.overheid.nl/over/) van de Nederlandse Digitale Dienst is een navigatiepagina met de lijst: een titel, een intro van twee regels, en een rij links met een chevron naar toegankelijkheid, privacy, copyright, archivering en het melden van een kwetsbaarheid. Het kruimelpad staat in de footer.
