<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/home-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: home

De home is het startpunt van een website. Het laat zien wat bezoekers er kunnen vinden en doen, en helpt ze de juiste richting te kiezen. Gebruik een [onderwerppagina](topic-page.md) als startpunt voor een onderwerp op een lager niveau.

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar   zoeken en taal, geen terugknop
       ├─ nldd-hero                      de opening, layout="overlap" en main-background
       │    └─ slot="media"              nldd-image, hier nog zonder beeld
       ├─ nldd-simple-section            background="tinted", wat je hier kunt
       │    ├─ slot="header"             de titel en een intro van een zin of twee
       │    └─ nldd-collection           layout="grid", item-width
       │         └─ nldd-card            een onderwerp, een zin en een knop met de actie in de footer
       ├─ nldd-one-half-one-half-section afbeelding links, tekst rechts
       │    ├─ slot="left"               nldd-image met aspect-ratio
       │    └─ slot="right"              titel, tekst en een nldd-link verder
       ├─ nldd-two-thirds-one-third-section    background="tinted"
       │    ├─ slot="left"               de titel en de lopende uitleg
       │    └─ slot="right"              een ondersteunende kaart
       ├─ nldd-one-third-two-thirds-section
       │    ├─ slot="left"               de titel en een korte uitleg
       │    └─ slot="right"              een nldd-list type="navigation" naar de onderwerpen
       ├─ nldd-simple-section            background="tinted", de oproep
       └─ slot="footer"                  nldd-page-footer
            └─ slot="legal-bar"
```

```html
<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
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
        text="Regel je aanvraag online"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-rich-text color="inherit">
        <p>Dien een aanvraag in, volg de behandeling en vind je documenten terug, zonder dat je hoeft te weten bij welke afdeling het ligt.</p>
      </nldd-rich-text>
      <nldd-spacer size="24"></nldd-spacer>
      <nldd-button
        appearance="inherit-filled"
        text="Aanvraag starten"
        href="#aanpak"
      ></nldd-button>
    </nldd-hero>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Alles rond je aanvraag regel je hier"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="header"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="header">
        <p>Alles wat je met een aanvraag doet, begint hier. Kies wat je wilt doen, dan lees je wat ervoor nodig is.</p>
      </nldd-rich-text>
      <nldd-collection
        layout="grid"
        item-width="320px"
      >
        <nldd-card>
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Aanvraag"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Je vult in wat er nodig is en ziet meteen welke gegevens ontbreken.</p>
            </nldd-rich-text>
          </nldd-container>
          <nldd-container
            slot="footer"
            padding-inline="16"
            padding-bottom="16"
          >
            <nldd-button
              appearance="neutral-tinted"
              text="Aanvraag indienen"
              href="#aanvraag-indienen"
            ></nldd-button>
          </nldd-container>
        </nldd-card>
        <nldd-card>
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Behandeling"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Elke stap in de behandeling staat op je aanvraag, met wie er aan werkt.</p>
            </nldd-rich-text>
          </nldd-container>
          <nldd-container
            slot="footer"
            padding-inline="16"
            padding-bottom="16"
          >
            <nldd-button
              appearance="neutral-tinted"
              text="Behandeling volgen"
              href="#behandeling-volgen"
            ></nldd-button>
          </nldd-container>
        </nldd-card>
        <nldd-card>
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Brieven en besluiten"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Alles wat je hebt ingestuurd of ontvangen staat bij het dossier.</p>
            </nldd-rich-text>
          </nldd-container>
          <nldd-container
            slot="footer"
            padding-inline="16"
            padding-bottom="16"
          >
            <nldd-button
              appearance="neutral-tinted"
              text="Brieven bekijken"
              href="#brieven"
            ></nldd-button>
          </nldd-container>
        </nldd-card>
      </nldd-collection>
    </nldd-simple-section>

    <nldd-one-half-one-half-section vertical-alignment="center">
      <nldd-image
        slot="left"
        aspect-ratio="3/2"
      ></nldd-image>
      <nldd-title
        slot="right"
        size="2"
        text="Je dossier houdt alles bij elkaar"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="right"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="right">
        <p>Je aanvragen, de brieven die je kreeg en wat er nog van je nodig is, staan bij elkaar in je dossier.</p>
        <p>Zo zie je in één keer waar je staat, ook als een aanvraag langer loopt.</p>
      </nldd-rich-text>
      <nldd-spacer
        slot="right"
        size="16"
      ></nldd-spacer>
      <nldd-link
        slot="right"
        size="md"
        end-icon="arrow-right"
        href="#dossier"
        text="Zo werkt je dossier"
      ></nldd-link>
    </nldd-one-half-one-half-section>

    <nldd-two-thirds-one-third-section background="tinted">
      <nldd-title
        slot="left"
        size="2"
        text="Een aanvraag gaat langs drie vaste stappen"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Een aanvraag gaat langs een vaste route: controleren, beoordelen, besluiten. Elke stap heeft een eigenaar, en je ziet waar de aanvraag ligt.</p>
        <p>Duurt een stap langer dan gepland, dan lees je op het dossier waarom, en wat er nodig is om verder te kunnen.</p>
      </nldd-rich-text>
      <nldd-card slot="right">
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="De behandelaar helpt je verder"
            heading-level="3"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>De behandelaar van je aanvraag kan je vertellen wat er nodig is.</p>
          </nldd-rich-text>
          <nldd-spacer size="16"></nldd-spacer>
          <nldd-button
            appearance="secondary"
            text="Contact opnemen"
            href="#contact"
          ></nldd-button>
        </nldd-container>
      </nldd-card>
    </nldd-two-thirds-one-third-section>

    <nldd-one-third-two-thirds-section>
      <nldd-title
        slot="left"
        size="2"
        text="Hiervoor kun je een aanvraag doen"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Per onderwerp staat alles bij elkaar: wat het is, wat je ervoor nodig hebt en hoe je een aanvraag doet.</p>
      </nldd-rich-text>
      <nldd-list
        slot="right"
        type="navigation"
        aria-label="Hiervoor kun je een aanvraag doen"
      >
        <nldd-list-item href="#isoleren">
          <nldd-text-cell
            text="Isoleren"
            supporting-text="Dak, muren, vloer en glas"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#warmtepomp">
          <nldd-text-cell
            text="Warmtepomp"
            supporting-text="Van luchtwarmtepomp tot hybride"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#energie-besparen">
          <nldd-text-cell
            text="Energie besparen"
            supporting-text="Kleine stappen die je meteen kunt zetten"
          ></nldd-text-cell>
          <nldd-spacer-cell size="12"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#zonnepanelen">
          <nldd-text-cell
            text="Zonnepanelen"
            supporting-text="Wat je moet weten voor je begint"
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
        size="2"
        text="Aanvragen kost tien minuten"
        supporting-text="Houd je DigiD bij de hand."
        heading-level="2"
      ></nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-button
        appearance="primary"
        text="Aanvraag starten"
        href="#aanpak"
      ></nldd-button>
    </nldd-simple-section>

    <nldd-page-footer slot="footer">
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

**De home is een pagina met secties, en is zelf het menu.** Samen introduceren de secties wat eronder ligt, geven ze de ingangen ernaartoe en scheppen ze de verwachting van wat je daar vindt. Wat de site te bieden heeft staat zo in de inhoud, als kaarten en lijsten, en niet als een rij woorden in de bovenbalk. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur).

**De hero zegt waar de site voor is.** De [`nldd-hero`](../../nldd-design/reference.md#nldd-hero) is de eerste sectie. Hij noemt het belangrijkste doel, trekt de aandacht en is het visuele welkom. Is er één logische volgende stap, dan staat die erin als knop, zodat wie weet waarvoor die komt meteen verder kan. Is die er niet, dan heeft de hero geen knop. Een afbeelding mag, als die het welkom sterker maakt; wat telt staat in het paneel.

**Elke sectie introduceert één onderdeel en geeft de ingang ernaartoe.** Kies de opzet van een sectie afhankelijk van wat bij de onderliggende informatie past.

**De koppen vertellen samen het verhaal.** Zet de secties in de volgorde waarin je de site aan iemand zou uitleggen. Wie alleen de koppen leest, weet dan wat de site te bieden heeft. Lees ze daarom onder elkaar terug. Lopen ze als een verhaal, dan klopt de volgorde; hapert het, dan staat er een sectie verkeerd of zegt een kop niet wat eronder staat. Zie de ontwerprichtlijnen over [volgorde](../../nldd-design/design-guidelines.md#navigatie-en-structuur) en over [koppen](../../nldd-design/design-guidelines.md#copywriting).

Het geraamte van de pagina, met de header en de footer, staat bij de [paginaopbouw](page-structure.md).

## Toegankelijkheid

Wat je gratis krijgt: elke knop is een echte link met de actie als naam, en de kop van de hero houdt zijn contrast op de vulling.

Wat jij nog moet doen: wat bij de [paginaopbouw](page-structure.md) staat, een `heading-level` op elke titel, en een knoptekst die zonder de kaart eromheen te begrijpen is, want wie met een schermlezer door de links springt, hoort alleen die.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test. Tot deze versie heette hij de contentpagina.
