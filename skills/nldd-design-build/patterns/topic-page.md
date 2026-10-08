<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/topic-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: onderwerppagina

**Welk probleem dit oplost.** Alles over één thema bij elkaar brengen. Mensen zoeken op een onderwerp ("isoleren"), niet op hoe de site is ingedeeld, en wat ze nodig hebben staat vaak verspreid over meer delen van de site.

**Wanneer wel.** Een thema waar mensen mee binnenkomen, met een eigen korte uitleg, één taak die de meesten komen doen, en pagina's uit verschillende delen van de site die erbij horen.

**Wanneer niet.** Een pagina die alleen een deel van de site opent en laat zien wat eronder zit, is een [navigatiepagina](navigation-page.md): die volgt de indeling van de site, de onderwerppagina het thema. Heeft het onderwerp één pagina uitleg en verder niets, dan is het een [contentpagina](content-page.md).

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-skip-link om de nldd-top-navigation-bar
       │    └─ nldd-top-navigation-bar   zoeken en taal, terug naar de onderwerpen
       ├─ nldd-simple-section            de h1, een korte uitleg en de hoofdtaak
       ├─ nldd-simple-section            background="tinted", wat je moet weten
       │    └─ nldd-collection
       │         └─ nldd-card            href, naar pagina's waar ze ook staan
       ├─ nldd-simple-section            verwante onderwerpen, als nldd-link
       └─ slot="footer"                  nldd-page-footer
            ├─ slot="breadcrumbs"
            └─ slot="legal-bar"
```

```html
<nldd-app-view>
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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Isoleren"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Een goed geïsoleerd huis houdt de warmte binnen en is in de zomer koeler. Voor dakisolatie kun je een aanvraag doen; hieronder staat wat je daarvoor moet weten.</p>
      </nldd-rich-text>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-button
        appearance="primary"
        text="Start een aanvraag"
        href="#aanvraag-starten"
      ></nldd-button>
    </nldd-simple-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Wat je moet weten"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
        <nldd-card
          href="#dakisolatie"
          accessible-label="Dakisolatie"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Dakisolatie"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Welke isolatie onder de regeling valt en wat die moet opleveren.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#aanvraag-indienen"
          accessible-label="Een aanvraag indienen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Een aanvraag indienen"
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
          accessible-label="De behandeling volgen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="De behandeling volgen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Bij welke stap je aanvraag ligt, en wie er aan werkt.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
      </nldd-collection>
    </nldd-simple-section>

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="3"
        text="Verwante onderwerpen"
        heading-level="2"
      ></nldd-title>
      <nldd-container gap="8">
        <nldd-link
          size="md"
          href="#warmtepomp"
          text="Warmtepomp"
        ></nldd-link>
        <nldd-link
          size="md"
          href="#energie-besparen"
          text="Energie besparen"
        ></nldd-link>
      </nldd-container>
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
</nldd-app-view>
```

## Waarom zo

**De basis is die van de contentpagina.** De app view, de secties, de koppen, de vlakken, de linkkaarten en de footer werken hier precies zo. Dat staat bij de [contentpagina](content-page.md).

**De hoofdtaak staat bovenaan.** Wie op een onderwerp landt, komt meestal voor één ding. Zet die taak als primaire [`nldd-button`](../../nldd-design/reference.md#nldd-button) direct onder de uitleg, in de eerste sectie, zodat niemand eerst langs de kaarten hoeft. Het is één knop; meer taken van hetzelfde gewicht horen bij de kaarten.

**Eigen uitleg, maar kort.** Een paar zinnen over wat het onderwerp is en wat je hier vindt. Dat is het verschil met een navigatiepagina, waar de intro alleen zegt wat eronder valt. Wordt de uitleg langer dan een alinea, dan is hij een eigen contentpagina en krijgt hij een kaart.

**De kaarten volgen het thema, niet de indeling van de site.** "Dakisolatie" staat bij de regelingen, "Een aanvraag indienen" bij de aanvragen: op deze pagina staan ze naast elkaar, omdat ze over hetzelfde gaan. De kaart linkt naar de pagina waar die al staat. Je kopieert de inhoud niet, anders heb je twee versies die uit elkaar lopen.

**Verwante onderwerpen zijn links, geen kaarten.** Ze zijn een uitweg voor wie op het verkeerde onderwerp is beland, en geen taak. Een rij [`nldd-link`](../../nldd-design/reference.md#nldd-link)'s in een `nldd-container` met `gap` houdt ze rustig, onder de kaarten.

**Het kruimelpad wijst naar de onderwerpen.** Een onderwerp hangt niet onder een deel van de site, dus het kruimelpad gaat via een lijst van alle onderwerpen, niet via de plek waar de pagina's eronder staan.

## Toegankelijkheid

Wat je gratis krijgt: wat bij de [contentpagina](content-page.md) staat, en een knop met `href` die een echte link is.

Wat jij nog moet doen: wat bij de [contentpagina](content-page.md) staat, en een knoptekst die de taak noemt, want hij staat los van de kaarten en moet zonder de tekst eromheen te begrijpen zijn.
