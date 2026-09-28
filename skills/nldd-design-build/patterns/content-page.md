<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/content-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: contentpagina

**Welk probleem dit oplost.** Een landings-, informatie- of campagnepagina bouwen: lopende tekst, een raster met kaarten, een uitgelicht vlak en een footer, zonder er een applicatieschil omheen te zetten.

**Wanneer wel.** Een pagina die iets uitlegt of aanprijst aan iemand die nog niet ingelogd is.

**Wanneer niet.** Werkt de gebruiker in de pagina, dan bouw je een scherm en geen contentpagina, zie [pagina met secties](page-with-sections.md). Panelen naast elkaar, een werkbalk of een inspector horen hier niet: dat is een applicatie, en die begint bij een split view.

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-top-navigation-bar
       ├─ nldd-simple-section            de hero, met een nldd-title size="1"
       ├─ nldd-simple-section            background="tinted", een uitgelicht blok
       │    └─ nldd-collection           layout="grid", item-width
       │         └─ nldd-card            met een nldd-container voor de padding
       ├─ nldd-two-thirds-one-third-section
       │    ├─ slot="left"               de lopende uitleg
       │    └─ slot="right"              een ondersteunende kaart
       ├─ nldd-simple-section            background="tinted", de oproep
       └─ slot="footer"                  nldd-page-footer
```

```html
<nldd-app-view>
  <nldd-page>
    <nldd-top-navigation-bar
      slot="header"
      website-title="Mijn Dienst"
    ></nldd-top-navigation-bar>

    <nldd-simple-section>
      <nldd-title
        size="1"
        overline="Mijn Dienst"
        text="Regel je aanvraag online"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-rich-text>
        <p>Dien een aanvraag in, volg de behandeling en vind je documenten terug, zonder dat je weet bij welke afdeling het ligt.</p>
      </nldd-rich-text>
    </nldd-simple-section>

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
        <nldd-card>
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
        <nldd-card>
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
        <nldd-card>
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
      <nldd-card
        slot="right"
        href="#werken-bij"
      >
        <nldd-container padding="16">
          <nldd-tag
            color="lintblauw"
            text="Vacature"
          ></nldd-tag>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-title
            size="4"
            text="Werken bij Mijn Dienst"
            heading-level="3"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>We zoeken behandelaars die een aanvraag van begin tot eind volgen.</p>
          </nldd-rich-text>
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
        variant="primary"
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
            href="#contact"
            text="Contact"
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
          href="#toegankelijkheid"
          text="Toegankelijkheid"
        ></nldd-page-footer-legal-bar-item>
        <nldd-page-footer-legal-bar-item
          slot="end"
          href="#privacy"
          text="Privacy"
        ></nldd-page-footer-legal-bar-item>
      </nldd-page-footer-legal-bar>
    </nldd-page-footer>
  </nldd-page>
</nldd-app-view>
```

## Waarom zo

**Een verticale stapel secties, geen panelen.** Een contentpagina is een [`nldd-page`](../../nldd-design/reference.md#nldd-page) met secties eronder, net als elk ander scherm. Het verschil zit in wat erin staat, niet in de constructie, dus de regels uit [pagina met secties](page-with-sections.md) gelden hier onverkort: één sectie per blok, één `h1`, en geen kopniveau overslaan.

**Een rij gelijkwaardige kaarten is een collection.** De [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) leidt het aantal kolommen af uit `item-width` en de beschikbare breedte, en zet de tussenruimte per breakpoint. Een eigen CSS-grid doet hetzelfde werk over, en anders.

**Een kaart zet zelf geen padding.** De [`nldd-card`](../../nldd-design/reference.md#nldd-card) laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand.

**Uitleg links, kaart rechts: pak de sectie die dat al is.** De [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section) heeft een `left`- en een `right`-slot en laat de kolommen onder de 280px vanzelf onder elkaar vallen. Zelf twee kolommen maken kost een mediaquery die de sectie al voor je schrijft.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke page-section kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling. Zet je er een eigen achtergrondkleur onder, dan weet de inhoud daar niets van en klopt het contrast niet meer. Loopt het vlak van rand tot rand, bijvoorbeeld om een afbeelding, pak dan de [`nldd-full-bleed-section`](../../nldd-design/reference.md#nldd-full-bleed-section): die heeft geen horizontale padding, dus zet er zelf een container omheen als er tekst in staat.

**Een label op een kaart is een [`nldd-tag`](../../nldd-design/reference.md#nldd-tag).** Dat component legt uit wanneer het er juist een badge of een token is.

**De footer is een component, geen eigen blok.** De [`nldd-page-footer`](../../nldd-design/reference.md#nldd-page-footer) heeft een rij voor je eigen inhoud en een `legal-bar` eronder, trekt de scheidingslijnen tussen de gevulde rijen, en draagt het id waar een skip link naartoe kan springen.

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte en de witruimte van de secties, het contrast van een getint of omgekeerd vlak, de koppen die de titels renderen, en de juridische rij als eigen navigatie met een naam.

Wat jij nog moet doen: een `heading-level` op elke titel, ook op die in de footer, en een tekst in een kaart die een link is. Die kaart ontleent zijn naam aan wat erin staat, dus een kaart met alleen een afbeelding krijgt een `accessible-label`.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test; dit is dezelfde pagina, nu getoetst.
