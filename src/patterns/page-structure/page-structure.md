# Paginaopbouw

De paginaopbouw beschrijft de vaste basis van een websitepagina: de shell, de header, de inhoudssecties en de footer. De [home](/patronen/home-page/), de [onderwerppagina](/patronen/topic-page/), de [navigatiepagina](/patronen/navigation-page/) en de [contentpagina](/patronen/content-page/) gebruiken die basis elk op hun eigen manier. Wisselen bezoekers tijdens een taak vaak tussen views, dan kan een [applicatie](/patronen/application/) meerdere van die pagina’s vervangen door één omgeving met verschillende views.

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
            ├─ nldd-container            de hoofdinhoud, vrij in te vullen
            └─ slot="legal-bar"          nldd-page-footer-legal-bar
```

<!-- voorbeeld: Standaard -->

## Waarom zo

**De shell staat altijd om alles heen.** De [`nldd-shell`](/componenten/shell/) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont komt uit de stylesheet van het pakket, zodra er een shell op de pagina staat. Bij een website staat daarin één [`nldd-page`](/componenten/page/), met de header en de footer in hun eigen slot en de secties ertussen. Bij een [applicatie](/patronen/application/) staan er split views in, met een pagina per paneel.

**Eén sectie per inhoudsblok, en kies de sectie met de indeling die je nodig hebt.** Een [`nldd-simple-section`](/componenten/simple-section/) regelt zelf de breedte en de witruimte, en geeft de titel in zijn `header`-slot de juiste afstand tot de inhoud. Moet een blok anders liggen, dan verwissel je de sectie in plaats van er zelf kolommen in te bouwen: [`nldd-two-thirds-one-third-section`](/componenten/two-thirds-one-third-section/) en [`nldd-one-half-one-half-section`](/componenten/one-half-one-half-section/) verdelen de breedte, [`nldd-sidebar-section`](/componenten/sidebar-section/) zet een vast paneel naast de inhoud, en [`nldd-full-bleed-section`](/componenten/full-bleed-section/) laat een vlak tot de rand lopen. Ze delen dezelfde marges en dezelfde `background`, dus afwisselen geeft ritme zonder dat de pagina uit het lood raakt.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke sectie kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling.

**Eén `h1` per pagina, en geen niveau overslaan.** De kop in het slot van een [`nldd-title`](/componenten/title/) is wat die is, en daarmee ook hoe groot die standaard is. Moet een kop kleiner, geef de titel dan een `size` en geen lager niveau. Dat maakt een herbruikbaar blok eenvoudig: geef het een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en direct onder de paginatitel een `h2`, en zet een vaste `size` als het blok overal even groot moet zijn. De koppen in een rich text tellen gewoon mee.

**De kop staat in de HTML.** Een kop in het slot staat in wat de server verstuurt. Een titel met `text` en `heading-level` tekent het component pas in de browser, en dan ziet wie geen script draait hem niet: een zoekmachine die de pagina niet rendert, een linkpreview, de leesmodus. Zet de kop op een pagina van een website daarom in het slot. In een applicatie achter een login draait het script altijd, en is `text` met `heading-level` genoeg.

## De header

De header identificeert de website en biedt toegang tot zoeken en taal. Op pagina’s onder de home geeft de terugknop bezoekers een weg naar het bovenliggende niveau.

Op een onderliggende pagina:

<!-- voorbeeld: Header -->

Op de home, zonder terugknop:

<!-- voorbeeld: HeaderHome -->

**Alleen wat op elke pagina nodig is.** Houd de header beperkt tot functies die bezoekers op elke pagina nodig hebben. De pagina’s vormen samen de navigatie, dus er staat geen rij met menu-items in de [`nldd-top-navigation-bar`](/componenten/top-navigation-bar/). Laat de header op een website met de pagina wegscrollen: een [`nldd-page`](/componenten/page/) kan hem vastzetten met `sticky-header`, maar een vaste header neemt ruimte in van de inhoud. Zie de ontwerprichtlijnen over [navigatie](/richtlijnen/#navigatie-en-structuur) en over [de sticky header](/richtlijnen/#visueel-en-layout).

**Zoeken en taal.** Ze staan rechts en blijven op elke breedte zichtbaar. Zet ze in het `utility`-slot, als een [`nldd-menu-bar`](/componenten/menu-bar/). Taal is een uitklapbaar item met de afkorting van de huidige taal als tekst ("NL"), en een `nldd-menu` met een radio-item per taal, daar met de volledige naam. Met `content-priority="text"` blijven op smalle schermen de teksten "Zoeken" en "NL" staan en vallen de iconen weg, zodat de functies herkenbaar blijven.

**Inloggen.** Heeft de site een persoonlijk deel, zoals een dossier, dan komt er een derde item bij, helemaal rechts. Voor wie niet is ingelogd is dat een link "Inloggen": het hele werkwoord, want het item leidt naar het inlogscherm en logt zelf niet in. Zie de [ontwerprichtlijnen](/richtlijnen/#copywriting).

<!-- voorbeeld: HeaderLogin -->

**Account.** Is iemand ingelogd, dan wordt het item een menu, en laat het zien dat je bent ingelogd en als wie. In de balk staat een korte, vaste tekst ("Mijn account"), met in het `icon`-slot van het item een [`nldd-avatar`](/componenten/avatar/) met de initialen. Zet daar `icon-aligned` en `color="content"` op, dan lijnt hij uit met de iconen ernaast en heeft hij hun kleur. Met `content-priority="icon"` blijft op een smal scherm alleen de avatar over, en is de tekst de toegankelijke naam.

De naam staat voluit in het menu, in een [`nldd-identity`](/componenten/identity/) in het `header`-slot, zodat een lange naam de balk niet vult. Het e-mailadres eronder zegt met welk account, voor wie er meer dan één heeft. Dezelfde avatar staat daar naast de naam; hij toont de initialen uit `name`, dus er is geen foto voor nodig. Zet op beide avatars `decorative`: de naam en de tekst van het item staan er al.

In het menu staat bovenaan de link naar het persoonlijke deel, want daar logt iemand voor in, en daaronder het profiel. "Log uit" staat onder een scheidingslijn, los van de links. Uitloggen gebeurt meteen, dus dat staat in de gebiedende wijs, en het is een knop en geen link.

<!-- voorbeeld: HeaderAccount -->

**Terug naar het bovenliggende niveau.** De terugknop gaat naar de pagina erboven en niet naar waar iemand vandaan kwam, en dat moet je kunnen zien. Noem daarom de bestemming, bijvoorbeeld "Aanvragen", in plaats van alleen "Terug". Zet daarvoor `back-text` en `back-href` op de balk.

**De skip link.** Iemand met een toetsenbord moet de header kunnen overslaan en direct naar de inhoud kunnen gaan. Plaats daarvoor een [`nldd-skip-link`](/componenten/skip-link/) om de header heen, in het `header`-slot.

**Statusmeldingen.** Is er iets dat elke bezoeker moet weten, zoals een storing of gepland onderhoud, dan staat dat boven de balk en nooit eronder: het gaat over de hele dienst en niet over deze pagina. Zet een [`nldd-status-bar`](/componenten/status-bar/) in het `header`-slot, als eerste, boven de skip link en de balk.

<!-- voorbeeld: HeaderStatus -->

## De footer

De footer sluit de pagina af. Hij bevat het kruimelpad, een hoofdinhoud en de juridische links. De structuur van de footer blijft op alle pagina’s hetzelfde. Het kruimelpad verschilt per pagina, en de hoofdinhoud kan per website verschillen. De home heeft geen kruimelpad.

Op een onderliggende pagina:

<!-- voorbeeld: Footer -->

Op de home, zonder kruimelpad:

<!-- voorbeeld: FooterHome -->

**Het kruimelpad.** Het staat in zijn eigen rij, boven de overige footerinhoud: een [`nldd-breadcrumbs`](/componenten/breadcrumbs/) in het `breadcrumbs`-slot van de [`nldd-page-footer`](/componenten/page-footer/). Zie de [ontwerprichtlijnen](/richtlijnen/#navigatie-en-structuur).

**De hoofdinhoud.** Wat er tussen het kruimelpad en de juridische links staat, is vrij in te vullen per website. De paginapatronen laten dat deel weg om hun voorbeeld kort te houden.

**De juridische links.** Zet Contact, Toegankelijkheid en Privacy als directe links in de juridische rij. Andere informatie over de website, zoals copyright en archivering, kan bij elkaar op een pagina "Over deze website" staan, die zelf een [navigatiepagina](/patronen/navigation-page/) is. De privacyverklaring hoort daar ook bij, maar niet alleen daar: de Europese privacytoezichthouders vragen om een directe link op elke pagina, onder een gangbare term als "Privacy" ([WP260, paragraaf 11](https://ec.europa.eu/newsroom/article29/items/622227)). Noem die pagina "Over deze website" en niet "Over", want "Over" kan net zo goed over de organisatie gaan.

**Niet in een sectie.** De footer heeft een eigen slot en regelt zelf de breedte, de witruimte en de scheiding tussen de rijen. Plaats hem daarom niet in een inhoudssectie.

## Toegankelijkheid

De componenten regelen de breedte, de witruimte, de vlakken en de koppen die de titels renderen. Ze geven de terugknop, de zoekfunctie, de taalkeuze, de skip link, het kruimelpad en de juridische links ook de juiste semantiek.

Zet zelf in elke titel de kop van het juiste niveau en zorg voor één `h1` per pagina. Dat geldt ook voor de titels in de hoofdinhoud van de footer, zodat ze aansluiten op de koppen van de pagina. Geef het taalitem een `accessible-label` die de taal voluit noemt en de afkorting erin houdt, zoals "Taal: Nederlands (NL)": een schermlezer spelt "NL" anders als losse letters, en wie het item met spraak bedient moet het nog bij zijn zichtbare naam kunnen noemen. Geef taalnamen in andere talen een `lang`, zodat een schermlezer "English" Engels uitspreekt.
