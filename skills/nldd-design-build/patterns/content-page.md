<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/content-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: contentpagina

**Welk probleem dit oplost.** Een landings-, informatie- of campagnepagina bouwen: lopende tekst, een collectie kaarten, een uitgelicht vlak en een footer.

**Wanneer wel.** Een pagina waarop je informatie verwerkt: lezen, begrijpen, beslissen.

**Wanneer niet.** Een scherm waarop je vaak tussen informatie beweegt (zoeken, vergelijken, kiezen, bewerken) en waar onderdelen daarvoor naast elkaar staan: navigatie naast de inhoud, een lijst met het gekozen record ernaast, een inspector aan de zijkant. Dat is een [applicatie](application.md), en die begint bij een split view.

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-skip-link om de nldd-top-navigation-bar
       ├─ nldd-hero                      de opening, met main-background
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
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar website-title="Mijn Dienst"></nldd-top-navigation-bar>
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
            variant="secondary"
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

**De app view is altijd de buitenste schil.** De [`nldd-app-view`](../../nldd-design/reference.md#nldd-app-view) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont komt uit de stylesheet van het pakket, zodra er een app view op de pagina staat.

**Een hero is voor de pagina’s waar mensen binnenkomen.** De homepage, en verder elke pagina waar bezoekers vanaf een andere website op landen. Daar is de [`nldd-hero`](../../nldd-design/reference.md#nldd-hero) de paginakop: een tekstpaneel dat je een vulling geeft met `main-background`, met plaats voor beeld ernaast of erachter. Die vulling draagt een eigen inhoudskleur mee, dus geef de titel en de tekst erin `color="inherit"`, dan houden ze hoe dan ook contrast. Zonder beeld vult het paneel de hele kop. Op de meeste andere pagina’s opent een sectie met een grote titel, en dat is genoeg.

**Eén sectie per inhoudsblok, en kies de soort die de indeling al heeft.** Een [`nldd-simple-section`](../../nldd-design/reference.md#nldd-simple-section) regelt zelf de leesbreedte en de witruimte, en geeft de titel in zijn `header`-slot de juiste afstand tot de inhoud. Moet een blok anders liggen, dan verwissel je de sectie in plaats van er zelf kolommen in te bouwen: [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section) en [`nldd-one-half-one-half-section`](../../nldd-design/reference.md#nldd-one-half-one-half-section) verdelen de breedte, [`nldd-sidebar-section`](../../nldd-design/reference.md#nldd-sidebar-section) zet een vast paneel naast de inhoud, en [`nldd-full-bleed-section`](../../nldd-design/reference.md#nldd-full-bleed-section) laat een vlak tot de rand lopen. Ze delen dezelfde marges en dezelfde `background`, dus afwisselen geeft ritme zonder dat de pagina uit het lood raakt.

**Eén `h1` per pagina, en geen niveau overslaan.** `size` op een [`nldd-title`](../../nldd-design/reference.md#nldd-title) is hoe die eruitziet, `heading-level` wat die is. Dat maakt een herbruikbaar blok eenvoudig: geef het een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en op een overzichtspagina een `h2`, en laat de grootte los daarvan.

**Laat de bovenbalk wegscrollen.** Een [`nldd-page`](../../nldd-design/reference.md#nldd-page) kan zijn header vastzetten met `sticky-header`, maar doet dat standaard niet, en op een contentpagina houd je dat zo. Een [`nldd-top-navigation-bar`](../../nldd-design/reference.md#nldd-top-navigation-bar) is een flinke stapel UI, en wat daarvan blijft staan, staat de inhoud in de weg waarvoor iemand kwam. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#visueel-en-layout).

**Een set gelijkwaardige kaarten is een collection.** De [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) leidt het aantal kolommen af uit `item-width` en de beschikbare breedte, en zet de tussenruimte per breakpoint.

**Een kaart zet zelf geen padding.** De [`nldd-card`](../../nldd-design/reference.md#nldd-card) laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke page-section kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling. Zet je er een eigen achtergrondkleur onder, dan weet de inhoud daar niets van en klopt het contrast niet meer. Loopt het vlak van rand tot rand, bijvoorbeeld om een afbeelding, pak dan de [`nldd-full-bleed-section`](../../nldd-design/reference.md#nldd-full-bleed-section): die heeft geen horizontale padding, dus zet er zelf een container omheen als er tekst in staat.

**De footer is een component en hoeft niet in een sectie.** De [`nldd-page-footer`](../../nldd-design/reference.md#nldd-page-footer) heeft een rij voor je eigen inhoud en een `legal-bar` eronder, trekt de scheidingslijnen tussen de gevulde rijen, en draagt het id waar een skip link naartoe kan springen.

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte en de witruimte van de secties, het contrast van een getint of omgekeerd vlak, de koppen die de titels renderen, en de juridische rij als eigen navigatie met een naam.

Wat jij nog moet doen: een `heading-level` op elke titel, ook op die in de footer, een [`nldd-skip-link`](../../nldd-design/reference.md#nldd-skip-link) bovenaan als er navigatie voor de inhoud staat, en een tekst in een kaart die een link is. Die kaart ontleent zijn naam aan wat erin staat, dus een kaart met alleen een afbeelding krijgt een `accessible-label`.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test. Dit is dezelfde pagina, nu getoetst.
