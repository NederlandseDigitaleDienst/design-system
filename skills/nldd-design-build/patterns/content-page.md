<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/content-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: contentpagina

Een contentpagina toont de details op het laagste niveau van de website. Hier vindt de bezoeker de uitleg of informatie over een specifiek onderwerp, taak of besluit. Gebruik deze pagina voor de inhoud zelf; een [home](home-page.md), [onderwerppagina](topic-page.md) of [navigatiepagina](navigation-page.md) helpt bezoekers de weg naar die inhoud te vinden.

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar   back-text en back-href naar de pagina erboven
       │              └─ nldd-menu-bar        slot="utility", zoeken en taal
       ├─ nldd-sidebar-section           sidebar-label en grow, breed een kolom, smal een sheet
       │    ├─ slot="header"             de nldd-title met de h1, en op smal de knop naar de sheet
       │    ├─ slot="sidebar"            de inhoudsopgave, een nldd-list type="navigation" met current-type="location"
       │    ├─ nldd-rich-text            de uitleg, met een id op elke h2
       │    └─ nldd-card                 de actie, na de uitleg
       ├─ nldd-simple-section            background="tinted", waar je hierna heen kunt
       │    └─ nldd-collection
       │         └─ nldd-card            href
       └─ slot="footer"                  nldd-page-footer
            ├─ slot="breadcrumbs"        waar deze pagina staat
            └─ slot="legal-bar"
```

Met een inhoudsopgave:

```html
<style>
  /* The section owns the switch; this shows the button, and the space above
     it, only when there is a sheet to open. */
  nldd-sidebar-section:not([collapsed]) :is(#inhoud-openen, nldd-spacer:has(+ #inhoud-openen)) {
    display: none;
  }

  /* The sheet has its own title bar with the same name. */
  nldd-sidebar-section[collapsed] :is(#inhoud-kop, #inhoud-kop + nldd-spacer) {
    display: none;
  }
</style>

<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
        back-text="Aanvragen"
        back-href="#aanvragen"
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

    <nldd-sidebar-section
      sidebar-label="Op deze pagina"
      grow
    >
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag indienen"
        heading-level="1"
      ></nldd-title>
      <nldd-spacer
        slot="header"
        size="16"
      ></nldd-spacer>
      <nldd-button
        slot="header"
        id="inhoud-openen"
        appearance="secondary"
        start-icon="bullet-list"
        text="Op deze pagina"
        popup-type="dialog"
      ></nldd-button>

      <nldd-container
        slot="sidebar"
        padding="16"
        padding-bottom="8"
      >
        <nldd-title
          id="inhoud-kop"
          size="5"
          text="Op deze pagina"
        ></nldd-title>
        <nldd-spacer size="8"></nldd-spacer>
        <nldd-list
          type="navigation"
          appearance="simple"
          dividers="never"
          aria-label="Op deze pagina"
        >
          <nldd-list-item
            href="#wat-je-nodig-hebt"
            current
            current-type="location"
          >
            <nldd-text-cell text="Je hebt je DigiD, het adres en een offerte nodig"></nldd-text-cell>
          </nldd-list-item>
          <nldd-list-item
            href="#zo-gaat-het"
            current-type="location"
          >
            <nldd-text-cell text="Indienen gaat in drie stappen"></nldd-text-cell>
          </nldd-list-item>
          <nldd-list-item
            href="#na-het-indienen"
            current-type="location"
          >
            <nldd-text-cell text="Je aanvraag krijgt een nummer en een behandelaar"></nldd-text-cell>
          </nldd-list-item>
        </nldd-list>
      </nldd-container>

      <nldd-rich-text>
        <p>Een aanvraag dien je online in. Je vult in wat er nodig is en ziet meteen welke gegevens nog ontbreken, dus je hoeft niet alles in één keer af te maken.</p>
        <h2 id="wat-je-nodig-hebt">Je hebt je DigiD, het adres en een offerte nodig</h2>
        <ul>
          <li>Je DigiD</li>
          <li>Het adres waar de aanvraag over gaat</li>
          <li>Een offerte of factuur van de uitvoerder</li>
        </ul>
        <h2 id="zo-gaat-het">Indienen gaat in drie stappen</h2>
        <ol>
          <li>Je kiest waarvoor je een aanvraag doet.</li>
          <li>Je vult je gegevens in en voegt de offerte toe.</li>
          <li>Je controleert alles en verstuurt de aanvraag.</li>
        </ol>
        <h2 id="na-het-indienen">Je aanvraag krijgt een nummer en een behandelaar</h2>
        <p>Op het dossier zie je bij welke stap de aanvraag ligt, en lees je wat er nodig is als een stap langer duurt dan gepland.</p>
      </nldd-rich-text>
      <nldd-spacer size="32"></nldd-spacer>
      <nldd-card background="tinted">
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="Aanvragen kost tien minuten"
            heading-level="2"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>Houd je DigiD bij de hand.</p>
          </nldd-rich-text>
          <nldd-spacer size="16"></nldd-spacer>
          <nldd-button
            appearance="primary"
            text="Aanvraag starten"
            href="#aanvraag-starten"
          ></nldd-button>
        </nldd-container>
      </nldd-card>
    </nldd-sidebar-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="3"
        text="Hier kun je verder"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
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
              <p>Elke stap staat op je aanvraag, met wie er aan werkt.</p>
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
              <p>Ben je het niet eens met een besluit, dan zie je hier hoe je dat laat weten.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#isoleren"
          accessible-label="Isoleren"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Isoleren"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Alles over isoleren bij elkaar, ook wat niet over de aanvraag gaat.</p>
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
          href="#aanvragen"
        ></nldd-breadcrumbs-item>
        <nldd-breadcrumbs-item
          text="Aanvraag indienen"
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

Zonder inhoudsopgave, voor een korte pagina:

```html
<nldd-shell>
  <nldd-page>
    <nldd-skip-link slot="header">
      <nldd-top-navigation-bar
        website-title="Mijn Dienst"
        back-text="Aanvragen"
        back-href="#aanvragen"
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

    <nldd-two-thirds-one-third-section grow>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text slot="left">
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
        <h2 id="zo-trek-je-hem-in">Intrekken doe je in je dossier</h2>
        <p>Open de aanvraag in je dossier en kies onderaan voor intrekken. Je krijgt een bevestiging in je dossier, en de behandelaar stopt met de aanvraag.</p>
        <h2 id="daarna">Intrekken kun je niet terugdraaien</h2>
        <p>Een ingetrokken aanvraag kun je niet terughalen. Wil je het later toch, dan dien je een nieuwe aanvraag in.</p>
      </nldd-rich-text>
      <nldd-card
        slot="right"
        background="tinted"
      >
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="Aanvraag nu intrekken"
            heading-level="2"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>Je hebt je DigiD nodig.</p>
          </nldd-rich-text>
          <nldd-spacer size="16"></nldd-spacer>
          <nldd-button
            appearance="primary"
            text="Naar je dossier"
            href="#dossier"
          ></nldd-button>
        </nldd-container>
      </nldd-card>
    </nldd-two-thirds-one-third-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="3"
        text="Hier kun je verder"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
        <nldd-card
          href="#aanvraag-wijzigen"
          accessible-label="Aanvraag wijzigen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Aanvraag wijzigen"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Soms is aanvullen genoeg, en hoef je niet opnieuw te beginnen.</p>
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
              <p>Ben je het niet eens met een besluit, dan zie je hier hoe je dat laat weten.</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <nldd-card
          href="#isoleren"
          accessible-label="Isoleren"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Isoleren"
              heading-level="3"
            ></nldd-title>
            <nldd-spacer size="4"></nldd-spacer>
            <nldd-rich-text>
              <p>Alles over isoleren bij elkaar, ook wat niet over de aanvraag gaat.</p>
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
          href="#aanvragen"
        ></nldd-breadcrumbs-item>
        <nldd-breadcrumbs-item
          text="Aanvraag intrekken"
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

**Geen hero, de titel is de kop.** Op een contentpagina is de tekst zelf het punt, ook voor wie er rechtstreeks vanuit een zoekmachine op landt. Een grote titel boven de tekst is genoeg, en de uitleg begint direct eronder, zonder beeld of vlak dat er eerst langs moet.

**De tekst staat in een rich text.** Een [`nldd-rich-text`](../../nldd-design/reference.md#nldd-rich-text) met gewone `h2`'s, lijsten en alinea's zet zelf het ritme en de leesbreedte. Geef elke `h2` een `id`, zodat de inhoudsopgave ernaar kan springen.

**Een inhoudsopgave alleen als er iets te overzien valt.** Heeft de tekst drie of meer `h2`'s, of is hij langer dan zo'n twee schermen, dan helpt een inhoudsopgave om te zien wat er komt en ernaartoe te springen. Bij een kortere pagina is het alleen UI die aandacht vraagt naast een tekst die je in één keer overziet. Laat hem dan weg, en gebruik een [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section): de titel in het `header`-slot, de tekst links en de kaart met de actie rechts. Op breed staat de actie dan al in beeld terwijl je leest, en op smal schuift hij onder de tekst, zoals in de versie met inhoudsopgave.

**De inhoudsopgave staat links, in de sidebar van de sectie.** De `nldd-sidebar-section` zet hem in een vaste kolom naast de tekst, die blijft staan terwijl je leest. Het is een [`nldd-list`](../../nldd-design/reference.md#nldd-list) met `type="navigation"` en een `nldd-list-item` met `href` per `h2`, met dezelfde tekst als de kop. Houd hem bij de `h2`'s; een pagina met zoveel koppen dat de lijst zelf gaat scrollen, is eigenlijk meer pagina's.

**Op smal is de inhoudsopgave een knop onder de titel.** Is de sectie te smal voor twee kolommen, dan verhuist de sidebar naar een sheet, en zou hij anders boven de tekst de inhoud omlaag duwen. De knop staat los onder de titel in het `header`-slot en verschijnt alleen als de sectie `collapsed` is, met een regel CSS die hem en de spacer erboven verbergt zolang de sectie geen sheet heeft: `nldd-sidebar-section:not([collapsed]) :is(#inhoud-openen, nldd-spacer:has(+ #inhoud-openen)) { display: none }`. Een klik roept `show()` aan. Geef de knop `popup-type="dialog"` en zet `expanded` op de `open`- en `close`-events van de sectie, dan weet een schermlezer of de sheet open is. De sheet heeft een eigen titelbalk met de `sidebar-label`, dus verberg de titel in de kolom zolang de sectie `collapsed` is.

**Een keuze in de sheet sluit eerst de sheet, en springt dan pas.** Laat je de link gewoon zijn werk doen, dan scrolt de pagina onder een sheet die nog openstaat, en zet de sheet bij het sluiten de focus terug op de knop, boven aan de pagina. Vang de klik dus af zolang de sectie `collapsed` is, roep `hide()` aan, en spring na het `close`-event naar de kop: scroll hem in beeld en geef hem de focus, met `tabindex="-1"` erop. Doe dat in een `queueMicrotask`, zodat het na het terugzetten van de focus komt en niet ervoor.

**De rij van de kop die je leest is `current`.** Zet `current-type="location"` op elke rij: de rijen wijzen naar stukken van deze pagina, en zonder dat attribuut meldt een schermlezer de actieve rij als "huidige pagina". Welke rij `current` is, houd jij bij. In het voorbeeld doet een `IntersectionObserver` dat, met een `rootMargin` die alleen het bovenste derde van het venster laat tellen: de laatste kop die daar voorbij is, is de actieve, en zolang er geen voorbij is, de eerste. Eén rij tegelijk, en die staat in de markup al op de eerste, zodat de lijst zonder JS ook klopt.

**Met een inhoudsopgave komt de actie na de uitleg.** Wat je met de uitleg doet, staat in een kaart onder de tekst, met één primaire knop. Wie gelezen heeft, vindt hem daar, en de inhoudsopgave blijft over de tekst gaan.

**De verwijzingen naar andere pagina's staan onderaan, niet in de sidebar.** Het is waar je heen kunt als je klaar bent met lezen, en dat is onderaan, op elke breedte. In de sidebar zou het op breed wel meereizen, maar op smal zit de sidebar achter de knop bovenaan, en daar zoekt niemand die net uitgelezen is. Het is een keuze per pagina en geen volledige lijst van de pagina's ernaast: pagina's uit hetzelfde onderdeel, of van elders op de site, zoals de onderwerppagina waar deze uitleg bij hoort. Waar je bent staat al in de titel, dus er is geen huidige kaart.

**De tekst groeit, niet de verwijzingen.** Een [`nldd-page`](../../nldd-design/reference.md#nldd-page) laat standaard zijn laatste sectie de hoogte opvullen die over is, zodat de footer onderaan staat. Hier is dat de sectie met verwijzingen, en bij een korte tekst op een hoog scherm wordt die getinte strook dan een groot grijs vlak. Zet daarom `grow` op de sectie met de tekst: die rekt op, en de verwijzingen blijven een strook vlak boven de footer.

Het geraamte van de pagina, met de header en de footer, staat bij de [paginaopbouw](page-structure.md).

## Toegankelijkheid

Wat je gratis krijgt: wat bij de [paginaopbouw](page-structure.md) staat, de breedte en de witruimte van de secties, het contrast van een getint of omgekeerd vlak, de koppen die de titels renderen, en de inhoudsopgave als eigen navigatie met `aria-current="location"` op de rij die je leest.

Wat jij nog moet doen: wat bij de [paginaopbouw](page-structure.md) staat, een `heading-level` op elke titel, een `aria-label` op de lijst van de inhoudsopgave, een `id` op elke kop waar die naar springt, de focus op die kop na een keuze in de sheet, en een `accessible-label` op een kaart die een link is. De link ligt als een leeg vlak over de kaart en leest de tekst erin niet voor, dus zonder label heeft hij geen naam. Neem de titel van de kaart.
