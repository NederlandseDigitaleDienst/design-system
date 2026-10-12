<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/page-structure/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: paginaopbouw

De paginaopbouw is het geraamte dat elke pagina van een website deelt: een schil, de header bovenaan, secties met de inhoud en de footer onderaan. De [home](home-page.md), de [onderwerppagina](topic-page.md), de [navigatiepagina](navigation-page.md) en de [contentpagina](content-page.md) vullen dat geraamte elk op hun eigen manier in. Wisselen bezoekers tijdens een taak vaak tussen views, kies dan een [applicatie](application.md).

## Compositie

```
nldd-shell                            de buitenste schil
  └─ nldd-page
       ├─ slot="header"                  de header
       │    ├─ nldd-status-bar           alleen als er iets te melden is, boven de balk
       │    └─ nldd-skip-link            om de balk heen
       │         └─ nldd-top-navigation-bar    website-title, en back-text en back-href
       │              └─ slot="utility"  nldd-menu-bar met zoeken en taal
       ├─ nldd-simple-section            één sectie per inhoudsblok, met de h1 in de eerste
       ├─ nldd-simple-section            background="tinted", een vlak
       └─ slot="footer"                  de footer: nldd-page-footer
            ├─ slot="breadcrumbs"        nldd-breadcrumbs, waar deze pagina staat
            ├─ nldd-container            je eigen rij, links voor de hele site
            └─ slot="legal-bar"          nldd-page-footer-legal-bar
```

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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
    </nldd-simple-section>

    <nldd-simple-section
      background="tinted"
      grow
    >
      <nldd-title
        slot="header"
        size="3"
        text="Intrekken kun je niet terugdraaien"
        heading-level="2"
      ></nldd-title>
      <nldd-rich-text>
        <p>Wil je het later toch, dan dien je een nieuwe aanvraag in.</p>
      </nldd-rich-text>
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

**De shell staat altijd om alles heen.** De [`nldd-shell`](../../nldd-design/reference.md#nldd-shell) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont komt uit de stylesheet van het pakket, zodra er een shell op de pagina staat. Daarin staat één [`nldd-page`](../../nldd-design/reference.md#nldd-page), met de header en de footer in hun eigen slot en de secties ertussen.

**Eén sectie per inhoudsblok, en kies de soort die de indeling al heeft.** Een [`nldd-simple-section`](../../nldd-design/reference.md#nldd-simple-section) regelt zelf de leesbreedte en de witruimte, en geeft de titel in zijn `header`-slot de juiste afstand tot de inhoud. Moet een blok anders liggen, dan verwissel je de sectie in plaats van er zelf kolommen in te bouwen: [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section) en [`nldd-one-half-one-half-section`](../../nldd-design/reference.md#nldd-one-half-one-half-section) verdelen de breedte, [`nldd-sidebar-section`](../../nldd-design/reference.md#nldd-sidebar-section) zet een vast paneel naast de inhoud, en [`nldd-full-bleed-section`](../../nldd-design/reference.md#nldd-full-bleed-section) laat een vlak tot de rand lopen. Ze delen dezelfde marges en dezelfde `background`, dus afwisselen geeft ritme zonder dat de pagina uit het lood raakt.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke sectie kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling. Zet je er een eigen achtergrondkleur onder, dan weet de inhoud daar niets van en klopt het contrast niet meer.

**Eén `h1` per pagina, en geen niveau overslaan.** `size` op een [`nldd-title`](../../nldd-design/reference.md#nldd-title) is hoe die eruitziet, `heading-level` wat die is. Dat maakt een herbruikbaar blok eenvoudig: geef het een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en direct onder de paginatitel een `h2`, en laat de grootte los daarvan. De koppen in een rich text tellen gewoon mee.

## De header

De header identificeert de website en biedt toegang tot zoeken en taal. Op pagina’s onder de home geeft de terugknop bezoekers een weg naar het bovenliggende niveau.

Op een pagina met een pagina erboven:

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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-shell>
```

Op de home, zonder terugknop:

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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Regel je aanvraag online"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Dien een aanvraag in, volg de behandeling en vind je documenten terug.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-shell>
```

Houd de header beperkt tot functies die op elke pagina nodig zijn. De pagina’s vormen samen de navigatie, dus er staat geen rij met menu-items in de [`nldd-top-navigation-bar`](../../nldd-design/reference.md#nldd-top-navigation-bar). Laat de header op een website met de pagina wegscrollen: een [`nldd-page`](../../nldd-design/reference.md#nldd-page) kan hem vastzetten met `sticky-header`, maar een vaste header neemt ruimte in van de inhoud. Zie de ontwerprichtlijnen over [navigatie](../../nldd-design/design-guidelines.md#navigatie-en-structuur) en over [de sticky header](../../nldd-design/design-guidelines.md#visueel-en-layout).

Zet zoeken en taal in het `utility`-slot, als een [`nldd-menu-bar`](../../nldd-design/reference.md#nldd-menu-bar). Taal is een uitklapbaar item met de afkorting van de huidige taal als tekst ("NL"), en een `nldd-menu` met een radio-item per taal, daar met de volledige naam. Met `content-priority="text"` blijven op smalle schermen de teksten "Zoeken" en "NL" staan en vallen de iconen weg, zodat de functies herkenbaar blijven.

Heeft de site een persoonlijk deel, zoals een dossier, dan komt er een derde item bij, helemaal rechts. Voor wie niet is ingelogd is dat een link "Inloggen": het hele werkwoord, want het item leidt naar het inlogscherm en logt zelf niet in. Houd het bij één inlog voor de hele site. Zie de ontwerprichtlijnen over [knopteksten](../../nldd-design/design-guidelines.md#copywriting) en over [modes](../../nldd-design/design-guidelines.md#strategie-en-proces).

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
          <nldd-menu-bar-item
            text="Inloggen"
            icon="account"
            href="#inloggen"
            content-priority="text"
          ></nldd-menu-bar-item>
        </nldd-menu-bar>
      </nldd-top-navigation-bar>
    </nldd-skip-link>

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-shell>
```

Is iemand ingelogd, dan wordt het item een menu. In de balk staat een korte, vaste tekst ("Mijn account"), met in het `icon`-slot van het item een [`nldd-avatar`](../../nldd-design/reference.md#nldd-avatar) met de initialen: zo zie je in één oogopslag dat je bent ingelogd, en als wie. Met `content-priority="icon"` blijft op een smal scherm alleen die avatar over, en is de tekst de toegankelijke naam. Zet `icon-aligned` en `color="inherit"` op de avatar, dan lijnt hij uit met de iconen ernaast en heeft hij hun kleur; de naam staat voluit in het menu, in een [`nldd-identity`](../../nldd-design/reference.md#nldd-identity) in het `header`-slot, zodat je ziet wie er is ingelogd zonder dat een lange naam de balk vult. Het e-mailadres eronder zegt met welk account, voor wie er meer dan één heeft. Dezelfde avatar staat daar naast de naam. Hij toont de initialen uit `name`, dus er is geen foto voor nodig. Zet op beide `decorative`: de naam en de tekst van het item staan er al. Bovenaan staat de link naar het persoonlijke deel, want daar logt iemand voor in, en daaronder het profiel. "Log uit" staat onder een scheidingslijn, los van de links. Krijgt één rij een icoon, geef ze dan allemaal een, anders beginnen de teksten niet op één lijn. Uitloggen gebeurt meteen, dus dat staat in de gebiedende wijs, en het is een knop en geen link. Houd het menu hierbij: elke extra optie moet iedereen lezen en overslaan. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#strategie-en-proces).

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
          <nldd-menu-bar-item
            text="Mijn account"
            expandable
            content-priority="icon"
          >
            <nldd-avatar
              slot="icon"
              color="inherit"
              name="Anouk de Vries"
              decorative
              icon-aligned
            ></nldd-avatar>
            <nldd-menu>
              <nldd-container
                slot="header"
                padding="16"
              >
                <nldd-identity
                  text="Anouk de Vries"
                  supporting-text="anouk.devries@example.com"
                >
                  <nldd-avatar
                    slot="avatars"
                    name="Anouk de Vries"
                    decorative
                  ></nldd-avatar>
                </nldd-identity>
              </nldd-container>
              <nldd-menu-item
                text="Dossier"
                icon="folder"
                href="#dossier"
              ></nldd-menu-item>
              <nldd-menu-item
                text="Profiel"
                icon="profile"
                href="#profiel"
              ></nldd-menu-item>
              <nldd-menu-divider></nldd-menu-divider>
              <nldd-menu-item
                text="Log uit"
                icon="logout"
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
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-shell>
```

De terugknop linkt naar de bovenliggende pagina: zet `back-text` en `back-href` op de balk. Noem die bestemming, bijvoorbeeld "Aanvragen", in plaats van alleen "Terug". De knop gaat naar de pagina erboven en niet naar waar iemand vandaan kwam, en dat moet je kunnen zien. Op de home is geen terugknop nodig.

Plaats een [`nldd-skip-link`](../../nldd-design/reference.md#nldd-skip-link) om de header heen, in het `header`-slot. Zo kan iemand met het toetsenbord de header overslaan en direct naar de inhoud gaan.

Is er iets dat elke bezoeker moet weten, zoals een storing of gepland onderhoud, zet dan een [`nldd-status-bar`](../../nldd-design/reference.md#nldd-status-bar) in het `header`-slot, als eerste, boven de skip link en de balk. Hij gaat over de hele dienst en niet over deze pagina, dus hij staat boven de balk en nooit eronder. Is er niets te melden, dan staat hij er niet.

```html
<nldd-shell>
  <nldd-page>
    <nldd-status-bar
      slot="header"
      variant="warning"
      text="Gepland onderhoud: inloggen is tijdelijk niet mogelijk"
    ></nldd-status-bar>
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

    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-shell>
```

## De footer

De footer sluit de pagina af. Hij bevat het kruimelpad, links die op de hele website gelden en de juridische links. Op alle pagina’s is de footer hetzelfde; alleen het kruimelpad verschilt. De home heeft geen kruimelpad.

Op een pagina met een pagina erboven:

```html
<nldd-shell>
  <nldd-page>
    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Aanvraag intrekken"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Zolang een aanvraag nog in behandeling is, kun je hem intrekken. Je hoeft daar geen reden voor te geven.</p>
      </nldd-rich-text>
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
      <nldd-container
        layout="grid"
        sm-column-count="2"
        md-column-count="2"
        lg-column-count="3"
        gap="16"
      >
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Aanvragen"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#aanvraag-indienen"
            text="Aanvraag indienen"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#behandeling-volgen"
            text="Behandeling volgen"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#bezwaar-maken"
            text="Bezwaar maken"
          ></nldd-link>
        </nldd-container>
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Onderwerpen"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#isoleren"
            text="Isoleren"
          ></nldd-link>
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
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Mijn Dienst"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#dossier"
            text="Zo werkt je dossier"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#contact"
            text="Contact opnemen"
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
</nldd-shell>
```

Op de home, zonder kruimelpad:

```html
<nldd-shell>
  <nldd-page>
    <nldd-simple-section>
      <nldd-title
        slot="header"
        size="1"
        text="Regel je aanvraag online"
        heading-level="1"
      ></nldd-title>
      <nldd-rich-text>
        <p>Dien een aanvraag in, volg de behandeling en vind je documenten terug.</p>
      </nldd-rich-text>
    </nldd-simple-section>

    <nldd-page-footer slot="footer">
      <nldd-container
        layout="grid"
        sm-column-count="2"
        md-column-count="2"
        lg-column-count="3"
        gap="16"
      >
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Aanvragen"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#aanvraag-indienen"
            text="Aanvraag indienen"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#behandeling-volgen"
            text="Behandeling volgen"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#bezwaar-maken"
            text="Bezwaar maken"
          ></nldd-link>
        </nldd-container>
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Onderwerpen"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#isoleren"
            text="Isoleren"
          ></nldd-link>
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
        <nldd-container gap="8">
          <nldd-title
            size="5"
            text="Mijn Dienst"
            heading-level="2"
          ></nldd-title>
          <nldd-link
            size="md"
            href="#dossier"
            text="Zo werkt je dossier"
          ></nldd-link>
          <nldd-link
            size="md"
            href="#contact"
            text="Contact opnemen"
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
</nldd-shell>
```

Zet het kruimelpad in zijn eigen rij, boven de overige footerinhoud: een [`nldd-breadcrumbs`](../../nldd-design/reference.md#nldd-breadcrumbs) in het `breadcrumbs`-slot van de [`nldd-page-footer`](../../nldd-design/reference.md#nldd-page-footer). Zo kunnen bezoekers zien waar ze zijn zonder dat het vóór de inhoud komt. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur).

Gebruik de eigen rij voor links die op de hele website gelden, bijvoorbeeld gegroepeerd per onderdeel. Houd die links beperkt tot wat bezoekers onderaan elke pagina verwachten. De paginapatronen laten deze rij weg om hun voorbeeld kort te houden.

Zet Contact, Toegankelijkheid en Privacy als directe links in de juridische rij. Andere informatie over de website, zoals copyright en archivering, kan bij elkaar op een pagina "Over deze website" staan, die zelf een [navigatiepagina](navigation-page.md) is. De privacyverklaring hoort daar ook bij, maar niet alleen daar: de Europese privacytoezichthouders vragen om een directe link op elke pagina, onder een gangbare term als "Privacy" ([WP260, paragraaf 11](https://ec.europa.eu/newsroom/article29/items/622227)). Noem die pagina "Over deze website" en niet "Over", want "Over" kan net zo goed over de organisatie gaan.

De footer heeft een eigen slot en regelt zelf de breedte, de witruimte en de scheiding tussen de rijen. Plaats hem daarom niet in een inhoudssectie.

## Toegankelijkheid

De componenten regelen de leesbreedte, de witruimte, de vlakken en de koppen die de titels renderen. Ze geven de terugknop, de zoekfunctie, de taalkeuze, de skip link, het kruimelpad en de juridische links ook de juiste semantiek.

Geef zelf elke titel het juiste `heading-level` en zorg voor één `h1` per pagina. Dat geldt ook voor de titels in je eigen footerrij, zodat ze aansluiten op de koppen van de pagina. Geef het taalitem een `accessible-label` die de taal voluit noemt en de afkorting erin houdt, zoals "Taal: Nederlands (NL)": een schermlezer spelt "NL" anders als losse letters, en wie het item met spraak bedient moet het nog bij zijn zichtbare naam kunnen noemen. Geef taalnamen in andere talen een `lang`, zodat een schermlezer "English" Engels uitspreekt.
