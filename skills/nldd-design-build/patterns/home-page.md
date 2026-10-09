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
       ├─ nldd-hero                      de opening, layout="overhang" en main-background
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

    <nldd-hero
      layout="overhang"
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
    </nldd-hero>

    <nldd-simple-section background="tinted">
      <nldd-title
        slot="header"
        size="2"
        text="Wat je hier kunt"
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
              text="Je aanvraag"
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
              text="De behandeling"
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

    <nldd-one-half-one-half-section>
      <nldd-image
        slot="left"
        aspect-ratio="3/2"
      ></nldd-image>
      <nldd-title
        slot="right"
        size="2"
        text="Alles op één plek"
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
        text="Hoe het werkt"
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

    <nldd-one-third-two-thirds-section>
      <nldd-title
        slot="left"
        size="2"
        text="Onderwerpen"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer
        slot="left"
        size="16"
      ></nldd-spacer>
      <nldd-rich-text slot="left">
        <p>Zoek je iets over een onderwerp en niet over je aanvraag? Op de onderwerppagina staat alles over dat onderwerp bij elkaar, ook wat elders op de site staat.</p>
      </nldd-rich-text>
      <nldd-list
        slot="right"
        type="navigation"
        aria-label="Onderwerpen"
      >
        <nldd-list-item href="#isoleren">
          <nldd-text-cell
            text="Isoleren"
            supporting-text="Dak, muren, vloer en glas"
          ></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
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

**Een hero is voor de pagina's waar mensen binnenkomen.** De home, de [onderwerppagina](topic-page.md), en verder elke pagina waar bezoekers vanaf een andere website op landen. Daar is de [`nldd-hero`](../../nldd-design/reference.md#nldd-hero) de paginakop: een tekstpaneel dat je een vulling geeft met `main-background`, met plaats voor beeld ernaast of erachter. Die vulling draagt een eigen inhoudskleur mee, dus geef de titel en de tekst erin `color="inherit"`, dan houden ze hoe dan ook contrast. Zonder beeld vult het paneel de hele kop. Op de andere pagina's opent een sectie met een grote titel, en dat is genoeg. Met `layout="overhang"` valt het tekstvlak over de onderrand van de afbeelding en loopt het eronder door: zo blijft de afbeelding sfeer en draagt het vlak de pagina. Dat is de huisstijl voor een hero met beeld. Zolang er nog geen foto is, staat in het `media`-slot een [`nldd-image`](../../nldd-design/reference.md#nldd-image) zonder `src`: die toont een neutraal vlak op de plek van de foto.

**De home is zelf het menu.** Wat je hier kunt, staat als kaarten in de inhoud, niet als een rij woorden in de bovenbalk. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#navigatie-en-structuur).

**De titel noemt het onderwerp, de knop de actie.** Een kaart op de home gaat over iets waar je mee bezig bent ("Je aanvraag", "Brieven en besluiten"), en daar hoort een titel bij die dat noemt, geen opdracht. Wat je ermee doet, staat op een [`nldd-button`](../../nldd-design/reference.md#nldd-button) met `href` in de `footer` van de [`nldd-card`](../../nldd-design/reference.md#nldd-card), in een `nldd-container` met `padding-inline` en `padding-bottom`. De footer staat altijd onderaan, dus de knoppen staan in een rij op één hoogte, ook als de teksten verschillen. Geef de kaart dan geen `href`: een kaart die zelf een link is met een knop erin, zijn twee acties die over elkaar liggen. Gebruik `neutral-tinted`: de grijze vulling maakt hem op een witte kaart meteen herkenbaar als knop, en de primaire knop blijft over voor de ene oproep onderaan, zodat de kaarten keuzes bieden en de oproep de volgende stap noemt. Is een kaart alleen een weg naar een andere pagina, zoals op de [navigatiepagina](navigation-page.md), dan is de kaart zelf de link en heeft hij geen knop.

**Een rij kaarten krijgt een intro.** Eén of twee zinnen onder de titel van de sectie zeggen wat de kaarten gemeen hebben, zodat iemand niet uit vier titels hoeft af te leiden waar de rij over gaat. Zet de titel, een `nldd-spacer` en een `nldd-rich-text` los in het `header`-slot van de sectie.

**Een set gelijkwaardige kaarten is een collection.** De [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) leidt het aantal kolommen af uit `item-width` en de beschikbare breedte, en zet de tussenruimte per breakpoint.

**Een kaart zet zelf geen padding.** De kaart laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand.

**Beeld en tekst naast elkaar, in een sectie van twee helften.** Een [`nldd-one-half-one-half-section`](../../nldd-design/reference.md#nldd-one-half-one-half-section) zet de afbeelding in de ene kolom en de titel, de tekst en een link verder in de andere. Welke kant de afbeelding staat, kies je met de volgorde in de markup, en die is ook de volgorde op smal: daar stapelen de kolommen, dus een afbeelding links staat op een telefoon boven de tekst. Wissel je over de pagina heen tussen links en rechts, dan krijgt de pagina ritme; op de [onderwerppagina](topic-page.md) staat de tekst links. Geef de [`nldd-image`](../../nldd-design/reference.md#nldd-image) een `aspect-ratio`, dan reserveert hij zijn ruimte voor het beeld er is. Zonder `src` toont hij een neutraal vlak met een icoon, zoals in het voorbeeld; krijgt hij een foto, geef hem dan ook een `alt`.

**Een kaart naast de uitleg staat naast de hele uitleg.** In "Hoe het werkt" staat de titel in de linkerkolom van de [`nldd-two-thirds-one-third-section`](../../nldd-design/reference.md#nldd-two-thirds-one-third-section), met een `nldd-spacer` en de tekst eronder, en niet in het `header`-slot. Dan begint de kaart rechts op dezelfde hoogte als de titel, en hoort hij bij het hele blok in plaats van pas naast de eerste alinea te beginnen.

**Een lijst naar dieper gelegen pagina's naast een uitleg.** Waar kaarten te veel gewicht geven, zoals bij een rij onderwerpen, bouw je de sectie zoals de [navigatiepagina](navigation-page.md) met de lijst: een [`nldd-one-third-two-thirds-section`](../../nldd-design/reference.md#nldd-one-third-two-thirds-section) met de titel en een korte uitleg los in het smalle derde, en een [`nldd-list`](../../nldd-design/reference.md#nldd-list) met `type="navigation"` in de twee derde ernaast. Elke rij is een link met een `supporting-text` en eindigt op een chevron, met een `nldd-spacer-cell` ertussen. Geef de lijst een `aria-label`, gelijk aan de titel.

**Wissel de vlakken af.** Getint, wit, getint: elke sectie met `background="tinted"` of zonder, zodat de pagina ritme krijgt zonder lijnen of eigen kleuren.

**Eén oproep, onderaan.** De getinte sectie aan het eind vraagt om één ding, met één primaire knop. Wie de pagina heeft gelezen weet dan wat de volgende stap is, en wie meteen wist waarvoor die kwam, vond het al bij de kaarten.

## Toegankelijkheid

Wat je gratis krijgt: elke knop is een echte link met de actie als naam, en de kop van de hero houdt zijn contrast op de vulling.

Wat jij nog moet doen: wat bij de [contentpagina](content-page.md) staat, en een knoptekst die zonder de kaart eromheen te begrijpen is, want wie met een schermlezer door de links springt, hoort alleen die.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test. Tot deze versie heette hij de contentpagina.
