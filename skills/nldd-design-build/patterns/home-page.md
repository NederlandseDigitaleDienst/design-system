<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/home-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: home

**Welk probleem dit oplost.** De pagina waar mensen binnenkomen. In een paar seconden moet duidelijk zijn wat dit is, wat je hier kunt en waar je verder moet.

**Wanneer wel.** De startpagina van een website, en een landings- of campagnepagina waar bezoekers vanaf een andere site binnenkomen.

**Wanneer niet.** Een pagina die één onderwerp bij elkaar brengt is een [onderwerppagina](topic-page.md). Een pagina die alleen naar de pagina's eronder leidt is een [navigatiepagina](navigation-page.md), en een pagina die iets uitlegt een [contentpagina](content-page.md). Een scherm met panelen naast elkaar is een [applicatie](application.md).

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-skip-link om de nldd-top-navigation-bar
       │    └─ nldd-top-navigation-bar   zoeken en taal, geen terugknop
       ├─ nldd-hero                      de opening, met main-background
       ├─ nldd-simple-section            background="tinted", wat je hier kunt
       │    └─ nldd-collection           layout="grid", item-width
       │         └─ nldd-card            href, met een nldd-container voor de padding
       ├─ nldd-two-thirds-one-third-section
       │    ├─ slot="left"               de lopende uitleg
       │    └─ slot="right"              een ondersteunende kaart
       ├─ nldd-simple-section            background="tinted", de oproep
       └─ slot="footer"                  nldd-page-footer
```

```html
<nldd-app-view>
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

    <nldd-hero main-background="accent">
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
    </nldd-hero>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Wat je hier kunt"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="320px"
      >
        <nldd-card
          href="#aanvraag-indienen"
          accessible-label="Een aanvraag indienen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Een aanvraag indienen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Je vult in wat er nodig is en ziet meteen welke gegevens ontbreken.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#behandeling-volgen"
          accessible-label="De behandeling volgen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="De behandeling volgen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Elke stap in de behandeling staat op je aanvraag, met wie er aan werkt.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#documenten"
          accessible-label="Documenten terugvinden"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Documenten terugvinden"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Alles wat je hebt ingestuurd of ontvangen staat bij het dossier.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
      </nldd-collection>
    </nldd-simple-section>

    <nldd-two-thirds-one-third-section>
      <nldd-title
        slot="header"
        size="2"
        text="Hoe het werkt"
        heading-level="2"
      ></nldd-title>
      <nldd-rich-text slot="left">
        <p>Een aanvraag gaat langs een vaste route: controleren, beoordelen, besluiten. Elke stap heeft een eigenaar, en je ziet waar de aanvraag ligt.</p>
        <p>Duurt een stap langer dan gepland, dan lees je op het dossier waarom, en wat er nodig is om verder te kunnen.</p>
      </nldd-rich-text>
      <nldd-card slot="right">
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="Loop je ergens vast?"
            heading-level="3"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>De behandelaar van je aanvraag kan je vertellen wat er nodig is.</p>
          </nldd-rich-text>
          <nldd-spacer size="16"></nldd-spacer>
          <nldd-button
            appearance="secondary"
            text="Neem contact op"
            href="#contact"
          ></nldd-button>
        </nldd-container>
      </nldd-card>
    </nldd-two-thirds-one-third-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        size="2"
        text="Zelf een aanvraag doen"
        supporting-text="Je hebt je DigiD nodig en tien minuten tijd."
        heading-level="2"
      ></nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-button
        appearance="primary"
        text="Start een aanvraag"
        href="#aanpak"
      ></nldd-button>
    </nldd-simple-section>

    <nldd-page-footer slot="footer">
      <nldd-container
        layout="grid"
        padding="24"
        gap="16"
      >
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Over Mijn Dienst"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="sm"
            href="#aanpak"
            text="Hoe het werkt"
          ></nldd-link>
          <nldd-link
            size="sm"
            href="#publicaties"
            text="Publicaties"
          ></nldd-link>
        </nldd-container>
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Meedoen"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="sm"
            href="#werken-bij"
            text="Werken bij"
          ></nldd-link>
          <nldd-link
            size="sm"
            href="#stage"
            text="Stage lopen"
          ></nldd-link>
        </nldd-container>
      </nldd-container>
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

**De basis is die van de contentpagina.** De app view, één sectie per inhoudsblok, de koppen, vlakken met `background` en de footer werken op een home precies zo. Dat staat bij de [contentpagina](content-page.md). Hieronder staat alleen wat een home anders doet.

**Een hero is voor de pagina's waar mensen binnenkomen.** De home, en verder elke pagina waar bezoekers vanaf een andere website op landen. Daar is de [`nldd-hero`](../../nldd-design/reference.md#nldd-hero) de paginakop: een tekstpaneel dat je een vulling geeft met `main-background`, met plaats voor beeld ernaast of erachter. Die vulling draagt een eigen inhoudskleur mee, dus geef de titel en de tekst erin `color="inherit"`, dan houden ze hoe dan ook contrast. Zonder beeld vult het paneel de hele kop. Op de andere pagina's opent een sectie met een grote titel, en dat is genoeg.

**De home is zelf het menu.** Wat je hier kunt, staat als kaarten in de inhoud, niet als een rij woorden in de bovenbalk. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur). Elke kaart heeft een `href`, en dan is de hele [`nldd-card`](../../nldd-design/reference.md#nldd-card) de link: geen losse "Lees meer"-knop eronder, want die zegt niets en verdubbelt de tabstops.

**Een set gelijkwaardige kaarten is een collection.** De [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) leidt het aantal kolommen af uit `item-width` en de beschikbare breedte, en zet de tussenruimte per breakpoint.

**Een kaart zet zelf geen padding.** De kaart laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand.

**Eén oproep, onderaan.** De getinte sectie aan het eind vraagt om één ding, met één primaire knop. Wie de pagina heeft gelezen weet dan wat de volgende stap is, en wie meteen wist waarvoor die kwam, vond het al bij de kaarten.

## Toegankelijkheid

Wat je gratis krijgt: een kaart met `href` is één link en één tabstop, en de kop van de hero houdt zijn contrast op de vulling.

Wat jij nog moet doen: wat bij de [contentpagina](content-page.md) staat, en een `accessible-label` op elke kaart die een link is.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test. Tot deze versie heette hij de contentpagina.
