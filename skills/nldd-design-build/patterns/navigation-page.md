<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/navigation-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: navigatiepagina

**Welk probleem dit oplost.** Iemand één niveau dieper brengen. Tussen de home en de contentpagina's staan pagina's die een deel van de site openen ("alles over aanvragen"), en die alleen laten zien wat eronder zit.

**Wanneer wel.** Een deel van de site met meer pagina's dan de home kwijt kan, waar een bezoeker eerst moet kiezen voor die iets leest.

**Wanneer niet.** Heeft de pagina eigen uitleg nodig, of brengt hij pagina's uit verschillende delen van de site bij elkaar rond één thema, dan is het een [onderwerppagina](topic-page.md). Staan er maar twee of drie pagina's onder, dan horen die als kaarten op de pagina erboven en is deze tussenstap overbodig. Een lijst records om in te zoeken of te filteren is een [lijst](list.md).

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-skip-link om de nldd-top-navigation-bar
       │    └─ nldd-top-navigation-bar   zoeken en taal, terug naar de home
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
<nldd-app-view>
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
        aria-label="Aanvragen"
      >
        <nldd-list-item href="#aanvraag-indienen">
          <nldd-text-cell
            text="Een aanvraag indienen"
            supporting-text="Wat je nodig hebt en hoe het indienen gaat."
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#behandeling-volgen">
          <nldd-text-cell
            text="De behandeling volgen"
            supporting-text="Bij welke stap je aanvraag ligt, en wie er aan werkt."
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#aanvraag-wijzigen">
          <nldd-text-cell
            text="Een aanvraag wijzigen"
            supporting-text="Gegevens aanvullen of een offerte vervangen, zolang de aanvraag loopt."
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#aanvraag-intrekken">
          <nldd-text-cell
            text="Een aanvraag intrekken"
            supporting-text="Stoppen met een aanvraag die nog in behandeling is."
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-icon-cell
            size="20"
            color="secondary"
            icon="chevron-right"
          ></nldd-icon-cell>
        </nldd-list-item>
        <nldd-list-item href="#besluit-begrijpen">
          <nldd-text-cell
            text="Het besluit begrijpen"
            supporting-text="Wat er in het besluit staat en wat het voor je betekent."
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
</nldd-app-view>
```

Met kaarten:

```html
<nldd-app-view>
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
        item-width="280px"
      >
        <nldd-card
          href="#aanvraag-indienen"
          accessible-label="Een aanvraag indienen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Een aanvraag indienen"
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
          accessible-label="De behandeling volgen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="De behandeling volgen"
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
          accessible-label="Een aanvraag wijzigen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Een aanvraag wijzigen"
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
          accessible-label="Een aanvraag intrekken"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Een aanvraag intrekken"
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
          accessible-label="Het besluit begrijpen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="4"
              text="Het besluit begrijpen"
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
</nldd-app-view>
```

## Waarom zo

**De basis is die van de contentpagina.** De app view, de secties, de koppen, de vlakken en de footer werken hier precies zo. Dat staat bij de [contentpagina](content-page.md).

**Een lijst staat naast de intro, kaarten eronder.** Bij een lijst zet een [`nldd-one-third-two-thirds-section`](../../nldd-design/reference.md#nldd-one-third-two-thirds-section) de titel en een intro van een paar zinnen in het smalle derde, en de lijst in de twee derde ernaast. Een lijst is smal van zichzelf en vult die kolom, en zo staat de keuze op een breed scherm meteen naast de uitleg. Een raster kaarten heeft de breedte nodig: in twee derde passen er maar twee naast elkaar. Daar staan de titel en de intro dus in het `header`-slot van een `nldd-simple-section`, met de collectie over de volle breedte eronder. Op smal komt de intro in beide gevallen eerst. Houd hem daarom kort: geen hero, geen inleiding van drie alinea's, geen uitgelicht vlak. Wie hier is, wil kiezen. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur).

**Een lijst of kaarten, en geen mengvorm.** Een [`nldd-list`](../../nldd-design/reference.md#nldd-list) met `type="navigation"` is rustig en makkelijk te scannen, en houdt het ook met tien pagina's vol: kies hem als de titels voor zich spreken. Een [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) met kaarten geeft elke keuze meer gewicht en ruimte voor een zin of een afbeelding, en past bij een handvol pagina's die echt van elkaar verschillen. Kies er één per pagina: twee vormen naast elkaar suggereren een rangorde die er niet is.

**Een rij eindigt op een chevron.** Een `nldd-icon-cell` met `chevron-right` rechts in de rij zegt dat de rij verder leidt, en is in de lijst wat de rand van een kaart in de collectie is: het teken dat je hier kunt klikken. Zet er een `nldd-spacer-cell` voor, zodat een lange titel nooit tegen het icoon aan loopt.

**Elke rij en elke kaart is één link.** Een `nldd-list-item` met `href` is in zijn geheel de link, met de tekst van zijn cel als naam. Een [`nldd-card`](../../nldd-design/reference.md#nldd-card) met `href` ook, maar daar is `accessible-label` de naam van die link: zet daar de titel van de kaart in. Een losse "Lees meer" of een knop eronder voegt niets toe en verdubbelt de tabstops.

**De titel zegt waar de link heen gaat, de zin waarom je erop klikt.** Schrijf de titel als de taak ("Een aanvraag wijzigen"), niet als een bak ("Informatie", "Documenten"). De zin eronder, als `supporting-text` in de lijst of als tekst in de kaart, helpt kiezen tussen twee links die op elkaar lijken, en is niet het begin van de uitleg: die staat op de pagina waar de link heen gaat.

**De kaartkoppen zijn een `h2`.** Er staat geen sectiekop tussen de paginatitel en de kaarten, dus komen ze direct onder de `h1`. Een kaart die je ook elders gebruikt, krijgt zijn kopniveau als parameter. De rijen van een lijst zijn geen koppen.

**De volgorde volgt de taak.** Wat de meeste mensen komen doen staat eerst, en daarna de rest in de volgorde waarin het zich voordoet: indienen, volgen, wijzigen of intrekken, het besluit, bezwaar. Alfabetisch is alleen een volgorde als niemand weet wat er gezocht wordt.

**Het kruimelpad staat onderaan.** Net als op de contentpagina, in de `breadcrumbs`-rij van de [`nldd-page-footer`](../../nldd-design/reference.md#nldd-page-footer). Bovenaan zou het boven de keuze komen te staan die iemand hier komt maken.

## Toegankelijkheid

Wat je gratis krijgt: elke rij en elke kaart is één link en één tabstop, een lijst met `type="navigation"` is een eigen navigatie, en op smal staat alles in de volgorde waarin je het leest.

Wat jij nog moet doen: wat bij de [contentpagina](content-page.md) staat, een `aria-label` op de lijst, en een titel die zonder de zin eronder ook te begrijpen is. Bij kaarten is die titel ook het `accessible-label`, dus een schermlezer die door de links springt hoort alleen die.

## Gezien in

De pagina [Over deze website](https://digitaledienst.overheid.nl/over/) van de Nederlandse Digitale Dienst is een navigatiepagina met de lijst: een titel, een intro van twee regels, en een rij links met een chevron naar toegankelijkheid, privacy, copyright, archivering en het melden van een kwetsbaarheid. Het kruimelpad staat in de footer.
