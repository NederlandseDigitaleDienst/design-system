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
       ├─ nldd-hero                      layout="overhang", de h1, een korte uitleg en de hoofdtaak
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

    <nldd-hero
      layout="overhang"
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
        text="Start een aanvraag"
        href="#aanvraag-starten"
      ></nldd-button>
    </nldd-hero>

    <nldd-one-half-one-half-section>
      <nldd-title
        slot="left"
        size="2"
        text="Waarom isoleren"
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
        shape="rounded"
      ></nldd-image>
    </nldd-one-half-one-half-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Wat je moet weten"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="header"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="header">
        <p>Voor dakisolatie doe je een aanvraag. Dit zijn de pagina's die je daarbij helpen, waar ze op de site ook staan.</p>
      </nldd-rich-text>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
</nldd-app-view>
```

## Waarom zo

**De basis is die van de contentpagina.** De app view, de secties, de koppen, de vlakken, de linkkaarten en de footer werken hier precies zo. Dat staat bij de [contentpagina](content-page.md).

**Een onderwerp opent met een hero.** Op een onderwerp landen mensen vaak rechtstreeks, vanuit een zoekmachine of een andere site, en dan is het net als de [home](home-page.md) een pagina waar ze binnenkomen. De [`nldd-hero`](../../nldd-design/reference.md#nldd-hero) is de kop, met de titel, de korte uitleg en de hoofdtaak erin. Net als op de home met `layout="overhang"`: het vlak valt over de afbeelding en loopt eronder door. Geef de titel en de tekst `color="inherit"`, zodat ze het contrast van de vulling volgen.

**De hoofdtaak staat bovenaan.** Wie op een onderwerp landt, komt meestal voor één ding. Zet die taak als [`nldd-button`](../../nldd-design/reference.md#nldd-button) direct onder de uitleg in de hero, zodat niemand eerst langs de kaarten hoeft. Op de vulling van de hero is dat `appearance="inherit-filled"`: die neemt zijn kleuren van het vlak, waar een gewone primaire knop wegvalt tegen een accentkleur. Het is één knop; meer taken van hetzelfde gewicht horen bij de kaarten.

**Eigen uitleg, maar kort.** Een paar zinnen over wat het onderwerp is en wat je hier vindt. Dat is het verschil met een navigatiepagina, waar de intro alleen zegt wat eronder valt. Wordt de uitleg langer dan een alinea, dan is hij een eigen contentpagina en krijgt hij een kaart.

**Uitleg met beeld, als je meer te zeggen hebt dan de intro.** Waarom het onderwerp ertoe doet, staat in een sectie met de tekst links en een afbeelding rechts. Hoe je die bouwt, staat bij de [home](home-page.md); hier staat de tekst eerst, zodat hij ook op smal boven de afbeelding komt.

**De kaarten volgen het thema, niet de indeling van de site.** "Een aanvraag indienen" en "Bezwaar maken" staan bij de aanvragen, niet bij isoleren: op deze pagina staan ze toch, omdat je ze voor dit onderwerp nodig hebt. Een intro onder de titel zegt waarom. De kaart linkt naar de pagina waar die al staat. Je kopieert de inhoud niet, anders heb je twee versies die uit elkaar lopen.

**De pagina's onder het onderwerp staan in een lijst.** Wat dieper over het onderwerp gaat, zoals de soorten isolatie, staat in een `nldd-list` met `type="navigation"` in de twee derde rechts, met de titel en een korte uitleg in het derde links, net als op de [navigatiepagina](navigation-page.md). Een lijst geeft die pagina's minder gewicht dan de kaarten erboven, en dat klopt: de kaarten zijn wat de meesten komen doen, de lijst is waar je verder leest.

**Verwante onderwerpen staan onderaan, als kaarten.** Ze zijn een uitweg voor wie op het verkeerde onderwerp is beland, of verder wil. Ze staan in een getinte sectie met een `nldd-collection` van linkkaarten, net als Ook handig op de [contentpagina](content-page.md): een titel en één zin die zegt wat het andere onderwerp is. Kleiner dan de kaarten bovenaan, met een kop van `size="5"`, zodat ze niet gaan concurreren met wat je hier komt doen.

**Het kruimelpad wijst naar de onderwerpen.** Een onderwerp hangt niet onder een deel van de site, dus het kruimelpad gaat via een lijst van alle onderwerpen, niet via de plek waar de pagina's eronder staan.

## Toegankelijkheid

Wat je gratis krijgt: wat bij de [contentpagina](content-page.md) staat, en een knop met `href` die een echte link is.

Wat jij nog moet doen: wat bij de [contentpagina](content-page.md) staat, en een knoptekst die de taak noemt, want hij staat los van de kaarten en moet zonder de tekst eromheen te begrijpen zijn.
