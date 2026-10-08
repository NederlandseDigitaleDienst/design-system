<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/content-page/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: contentpagina

**Welk probleem dit oplost.** Eén ding uitleggen, zodat iemand het kan lezen, begrijpen en erover beslissen. Hier komt een bezoeker aan: de home, een onderwerppagina en een navigatiepagina leiden ernaartoe.

**Wanneer wel.** Een pagina die uitlegt hoe iets werkt, wat je nodig hebt, wat er daarna gebeurt.

**Wanneer niet.** Een pagina die vooral doorverwijst is een [home](home-page.md), een [onderwerppagina](topic-page.md) of een [navigatiepagina](navigation-page.md). Een scherm waarop je vaak tussen informatie beweegt (zoeken, vergelijken, kiezen, bewerken) en waar onderdelen daarvoor naast elkaar staan, is een [applicatie](application.md), en die begint bij een split view.

## Compositie

```
nldd-app-view                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  nldd-skip-link om de nldd-top-navigation-bar
       │    └─ nldd-top-navigation-bar   back-text en back-href naar de pagina erboven
       │         └─ nldd-menu-bar        slot="utility", zoeken en taal
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

<nldd-app-view>
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
        text="Een aanvraag indienen"
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
            <nldd-text-cell text="Wat je nodig hebt"></nldd-text-cell>
          </nldd-list-item>
          <nldd-list-item
            href="#zo-gaat-het"
            current-type="location"
          >
            <nldd-text-cell text="Zo gaat het"></nldd-text-cell>
          </nldd-list-item>
          <nldd-list-item
            href="#na-het-indienen"
            current-type="location"
          >
            <nldd-text-cell text="Na het indienen"></nldd-text-cell>
          </nldd-list-item>
        </nldd-list>
      </nldd-container>

      <nldd-rich-text>
        <p>Een aanvraag dien je online in. Je vult in wat er nodig is en ziet meteen welke gegevens nog ontbreken, dus je hoeft niet alles in één keer af te maken.</p>
        <h2 id="wat-je-nodig-hebt">Wat je nodig hebt</h2>
        <ul>
          <li>Je DigiD</li>
          <li>Het adres waar de aanvraag over gaat</li>
          <li>Een offerte of factuur van de uitvoerder</li>
        </ul>
        <h2 id="zo-gaat-het">Zo gaat het</h2>
        <ol>
          <li>Je kiest waarvoor je een aanvraag doet.</li>
          <li>Je vult je gegevens in en voegt de offerte toe.</li>
          <li>Je controleert alles en verstuurt de aanvraag.</li>
        </ol>
        <h2 id="na-het-indienen">Na het indienen</h2>
        <p>Je aanvraag krijgt een nummer en een behandelaar. Op het dossier zie je bij welke stap de aanvraag ligt, en lees je wat er nodig is als een stap langer duurt dan gepland.</p>
      </nldd-rich-text>
      <nldd-spacer size="32"></nldd-spacer>
      <nldd-card background="tinted">
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="Zelf een aanvraag doen"
            heading-level="2"
          ></nldd-title>
          <nldd-spacer size="8"></nldd-spacer>
          <nldd-rich-text>
            <p>Je hebt je DigiD nodig en tien minuten tijd.</p>
          </nldd-rich-text>
          <nldd-spacer size="16"></nldd-spacer>
          <nldd-button
            appearance="primary"
            text="Start een aanvraag"
            href="#aanvraag-starten"
          ></nldd-button>
        </nldd-container>
      </nldd-card>
    </nldd-sidebar-section>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="3"
        text="Ook handig"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
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
          text="Een aanvraag indienen"
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

Zonder inhoudsopgave, voor een korte pagina:

```html
<nldd-app-view>
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
        text="Een aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text slot="left">
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
        <h2 id="zo-trek-je-hem-in">Zo trek je hem in</h2>
        <p>Open de aanvraag in je dossier en kies onderaan voor intrekken. Je krijgt een bevestiging in je dossier, en de behandelaar stopt met de aanvraag.</p>
        <h2 id="daarna">Daarna</h2>
        <p>Een ingetrokken aanvraag kun je niet terughalen. Wil je het later toch, dan dien je een nieuwe aanvraag in.</p>
      </nldd-rich-text>
      <nldd-card
        slot="right"
        background="tinted"
      >
        <nldd-container padding="16">
          <nldd-title
            size="4"
            text="Je aanvraag intrekken"
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
        text="Ook handig"
        heading-level="2"
      ></nldd-title>
      <nldd-collection
        layout="grid"
        item-width="280px"
      >
        <nldd-card
          href="#aanvraag-wijzigen"
          accessible-label="Een aanvraag wijzigen"
        >
          <nldd-container padding="16">
            <nldd-title
              size="5"
              text="Een aanvraag wijzigen"
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
          text="Een aanvraag intrekken"
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

Deze regels gelden voor alle pagina's, ook voor de [home](home-page.md), de [onderwerppagina](topic-page.md) en de [navigatiepagina](navigation-page.md). Die beschrijven alleen wat ze anders doen.

**De app view is altijd de buitenste schil.** De [`nldd-app-view`](../../nldd-design/reference.md#nldd-app-view) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont komt uit de stylesheet van het pakket, zodra er een app view op de pagina staat.

**Geen hero, de titel is de kop.** Wie hier komt, heeft al gekozen. Een grote titel boven de tekst is genoeg, en de uitleg begint direct eronder, zonder beeld of vlak dat er eerst langs moet.

**Eén sectie per inhoudsblok, en kies de soort die de indeling al heeft.** Een [`nldd-simple-section`](../../nldd-design/reference.md#nldd-simple-section) regelt zelf de leesbreedte en de witruimte, en geeft de titel in zijn `header`-slot de juiste afstand tot de inhoud. Moet een blok anders liggen, dan verwissel je de sectie in plaats van er zelf kolommen in te bouwen: [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section) en [`nldd-one-half-one-half-section`](../../nldd-design/reference.md#nldd-one-half-one-half-section) verdelen de breedte, [`nldd-sidebar-section`](../../nldd-design/reference.md#nldd-sidebar-section) zet een vast paneel naast de inhoud, en [`nldd-full-bleed-section`](../../nldd-design/reference.md#nldd-full-bleed-section) laat een vlak tot de rand lopen. Ze delen dezelfde marges en dezelfde `background`, dus afwisselen geeft ritme zonder dat de pagina uit het lood raakt.

**De tekst staat in een rich text.** Een [`nldd-rich-text`](../../nldd-design/reference.md#nldd-rich-text) met gewone `h2`'s, lijsten en alinea's zet zelf het ritme en de leesbreedte. Geef elke `h2` een `id`, zodat de inhoudsopgave ernaar kan springen.

**Een inhoudsopgave alleen als er iets te overzien valt.** Heeft de tekst drie of meer `h2`'s, of is hij langer dan zo'n twee schermen, dan helpt een inhoudsopgave om te zien wat er komt en ernaartoe te springen. Bij een kortere pagina is het alleen UI die aandacht vraagt naast een tekst die je in één keer overziet. Laat hem dan weg, en gebruik een [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section): de titel in het `header`-slot, de tekst links en de kaart met de actie rechts. Op breed staat de actie dan al in beeld terwijl je leest, en op smal schuift hij onder de tekst, zoals in de versie met inhoudsopgave.

**De inhoudsopgave staat links, in de sidebar van de sectie.** De `nldd-sidebar-section` zet hem in een vaste kolom naast de tekst, die blijft staan terwijl je leest. Het is een [`nldd-list`](../../nldd-design/reference.md#nldd-list) met `type="navigation"` en een `nldd-list-item` met `href` per `h2`, met dezelfde tekst als de kop. Houd hem bij de `h2`'s; een pagina met zoveel koppen dat de lijst zelf gaat scrollen, is eigenlijk meer pagina's.

**Op smal is de inhoudsopgave een knop onder de titel.** Is de sectie te smal voor twee kolommen, dan verhuist de sidebar naar een sheet, en zou hij anders boven de tekst de inhoud omlaag duwen. De knop staat los onder de titel in het `header`-slot en verschijnt alleen als de sectie `collapsed` is, met een regel CSS die hem en de spacer erboven verbergt zolang de sectie geen sheet heeft: `nldd-sidebar-section:not([collapsed]) :is(#inhoud-openen, nldd-spacer:has(+ #inhoud-openen)) { display: none }`. Een klik roept `show()` aan. Geef de knop `popup-type="dialog"` en zet `expanded` op de `open`- en `close`-events van de sectie, dan weet een schermlezer of de sheet open is. De sheet heeft een eigen titelbalk met de `sidebar-label`, dus verberg de titel in de kolom zolang de sectie `collapsed` is.

**Een keuze in de sheet sluit eerst de sheet, en springt dan pas.** Laat je de link gewoon zijn werk doen, dan scrolt de pagina onder een sheet die nog openstaat, en zet de sheet bij het sluiten de focus terug op de knop, boven aan de pagina. Vang de klik dus af zolang de sectie `collapsed` is, roep `hide()` aan, en spring na het `close`-event naar de kop: scroll hem in beeld en geef hem de focus, met `tabindex="-1"` erop. Doe dat in een `queueMicrotask`, zodat het na het terugzetten van de focus komt en niet ervoor.

**De rij van de kop die je leest is `current`.** Zet `current-type="location"` op elke rij: de rijen wijzen naar stukken van deze pagina, en zonder dat attribuut meldt een schermlezer de actieve rij als "huidige pagina". Welke rij `current` is, houd jij bij. In het voorbeeld doet een `IntersectionObserver` dat, met een `rootMargin` die alleen het bovenste derde van het venster laat tellen: de laatste kop die daar voorbij is, is de actieve, en zolang er geen voorbij is, de eerste. Eén rij tegelijk, en die staat in de markup al op de eerste, zodat de lijst zonder JS ook klopt.

**Met een inhoudsopgave komt de actie na de uitleg.** Wat je met de uitleg doet, staat in een kaart onder de tekst, met één primaire knop. Wie gelezen heeft, vindt hem daar, en de inhoudsopgave blijft over de tekst gaan.

**Ook handig staat onderaan, niet in de sidebar.** Het is waar je heen kunt als je klaar bent met lezen, en dat is onderaan, op elke breedte. In de sidebar zou het op breed wel meereizen, maar op smal zit de sidebar achter de knop bovenaan, en daar zoekt niemand die net uitgelezen is. Het is een keuze per pagina en geen volledige lijst van de pagina's ernaast: pagina's uit hetzelfde onderdeel, of van elders op de site, zoals de onderwerppagina waar deze uitleg bij hoort. Waar je bent staat al in de titel, dus er is geen huidige kaart.

**De tekst groeit, niet Ook handig.** Een [`nldd-page`](../../nldd-design/reference.md#nldd-page) laat standaard zijn laatste sectie de hoogte opvullen die over is, zodat de footer onderaan staat. Hier is dat Ook handig, en bij een korte tekst op een hoog scherm wordt die getinte strook dan een groot grijs vlak. Zet daarom `grow` op de sectie met de tekst: die rekt op, en Ook handig blijft een strook vlak boven de footer.

**Eén `h1` per pagina, en geen niveau overslaan.** `size` op een [`nldd-title`](../../nldd-design/reference.md#nldd-title) is hoe die eruitziet, `heading-level` wat die is. Dat maakt een herbruikbaar blok eenvoudig: geef het een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en op een navigatiepagina een `h2`, en laat de grootte los daarvan. De koppen in een rich text tellen gewoon mee.

**Laat de bovenbalk wegscrollen.** Een [`nldd-page`](../../nldd-design/reference.md#nldd-page) kan zijn header vastzetten met `sticky-header`, maar doet dat standaard niet, en op een website houd je dat zo. Een [`nldd-top-navigation-bar`](../../nldd-design/reference.md#nldd-top-navigation-bar) is een flinke stapel UI, en wat daarvan blijft staan, staat de inhoud in de weg waarvoor iemand kwam. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#visueel-en-layout).

**Zoeken en taal staan rechts in de bovenbalk.** Ze horen in het `utility`-slot van de bovenbalk, als een [`nldd-menu-bar`](../../nldd-design/reference.md#nldd-menu-bar), en blijven op elke breedte staan. Zoeken is een link naar de zoekpagina. Taal is een uitklapbaar item met de afkorting van de huidige taal als tekst ("NL"), en een `nldd-menu` met een radio-item per taal, daar met de volledige naam. De afkorting houdt de balk smal, maar een schermlezer spelt hem als losse letters, dus geef het item een `accessible-label` die de taal voluit noemt en de afkorting erin houdt ("Taal: Nederlands (NL)"), zodat wie het item met spraak bedient het nog bij zijn zichtbare naam kan noemen; geef elk item dat niet Nederlands is een `lang`, zodat een schermlezer "English" ook Engels uitspreekt. Met `content-priority="text"` vallen op smal de iconen weg en blijven "Zoeken" en "NL" staan: een woord zegt meer dan een loep, en de afkorting neemt nauwelijks ruimte in.

**Elke pagina behalve de home heeft een weg terug.** Zet `back-text` en `back-href` op de bovenbalk, dan staat er een terugknop naast de naam van de website. Noem de pagina waar je heen gaat ("Aanvragen") en niet alleen "Terug": de knop gaat naar de pagina erboven, niet naar waar iemand vandaan kwam, en dan moet je dat kunnen zien. Op de home is er geen pagina erboven, dus daar staat hij niet.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke page-section kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling. Zet je er een eigen achtergrondkleur onder, dan weet de inhoud daar niets van en klopt het contrast niet meer. Loopt het vlak van rand tot rand, bijvoorbeeld om een afbeelding, pak dan de `nldd-full-bleed-section`: die heeft geen horizontale padding, dus zet er zelf een container omheen als er tekst in staat.

**Een kaart zet zelf geen padding.** De [`nldd-card`](../../nldd-design/reference.md#nldd-card) laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand. Leidt de kaart naar een andere pagina, geef hem dan een `href` en de titel als `accessible-label`: dan is de hele kaart de link.

**Het kruimelpad staat onderaan.** In de [`nldd-page-footer`](../../nldd-design/reference.md#nldd-page-footer) heeft de [`nldd-breadcrumbs`](../../nldd-design/reference.md#nldd-breadcrumbs) een eigen rij, boven je eigen inhoud en de juridische rij. Daar helpt het wie wil weten waar deze pagina staat, zonder voor te gaan op de inhoud. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur).

**De footer is een component en hoeft niet in een sectie.** De footer trekt de scheidingslijnen tussen de gevulde rijen, en draagt het id waar een skip link naartoe kan springen. Wat er in de rij voor je eigen inhoud kan, zie je op de [home](home-page.md).

**De juridische rij linkt direct naar contact, toegankelijkheid en privacy.** De rest (copyright, archivering, een kwetsbaarheid melden) mag samen op een pagina "Over deze website" staan, die zelf een [navigatiepagina](navigation-page.md) is. De privacyverklaring hoort daar ook bij, maar niet alleen daar: de Europese privacytoezichthouders vragen om een directe link op elke pagina, onder een gangbare term als "Privacy" ([WP260, paragraaf 11](https://ec.europa.eu/newsroom/article29/items/622227)). Noem die pagina "Over deze website" en niet "Over", want "Over" kan net zo goed over de organisatie gaan.

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte en de witruimte van de secties, het contrast van een getint of omgekeerd vlak, de koppen die de titels renderen, het kruimelpad als eigen navigatie met `aria-current` op deze pagina, de terugknop als link, de inhoudsopgave als eigen navigatie met `aria-current="location"` op de rij die je leest, en de juridische rij als eigen navigatie met een naam.

Wat jij nog moet doen: een `heading-level` op elke titel, ook op die in de footer, een `aria-label` op de lijst van de inhoudsopgave, een `id` op elke kop waar die naar springt, de focus op die kop na een keuze in de sheet, een `lang` op elke taal in het taalmenu die niet Nederlands is, een [`nldd-skip-link`](../../nldd-design/reference.md#nldd-skip-link) bovenaan als er navigatie voor de inhoud staat, en een `accessible-label` op een kaart die een link is. De link ligt als een leeg vlak over de kaart en leest de tekst erin niet voor, dus zonder label heeft hij geen naam. Neem de titel van de kaart.
