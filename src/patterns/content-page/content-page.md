# Contentpagina

**Welk probleem dit oplost.** Een landings-, informatie- of campagnepagina bouwen: lopende tekst, een collectie kaarten, een uitgelicht vlak en een footer.

**Wanneer wel.** Een pagina waarop je informatie verwerkt: lezen, begrijpen, beslissen.

**Wanneer niet.** Een scherm waarop je vaak tussen informatie beweegt (zoeken, vergelijken, kiezen, bewerken) en waar onderdelen daarvoor naast elkaar staan: navigatie naast de inhoud, een lijst met het gekozen record ernaast, een inspector aan de zijkant. Dat is een [applicatie](/patronen/application/), en die begint bij een split view.

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

<!-- voorbeeld: Standaard -->

## Waarom zo

**De app view is altijd de buitenste schil.** De [`nldd-app-view`](/componenten/app-view/) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Het documentfont komt uit de stylesheet van het pakket, zodra er een app view op de pagina staat.

**Een hero is voor de pagina’s waar mensen binnenkomen.** De homepage, en verder elke pagina waar bezoekers vanaf een andere website op landen. Daar is de [`nldd-hero`](/componenten/hero/) de paginakop: een tekstpaneel dat je een vulling geeft met `main-background`, met plaats voor beeld ernaast of erachter. Die vulling draagt een eigen inhoudskleur mee, dus geef de titel en de tekst erin `color="inherit"`, dan houden ze hoe dan ook contrast. Zonder beeld vult het paneel de hele kop. Op de meeste andere pagina’s opent een sectie met een grote titel, en dat is genoeg.

**Eén sectie per inhoudsblok, en kies de soort die de indeling al heeft.** Een [`nldd-simple-section`](/componenten/simple-section/) regelt zelf de leesbreedte en de witruimte, en geeft de titel in zijn `header`-slot de juiste afstand tot de inhoud. Moet een blok anders liggen, dan verwissel je de sectie in plaats van er zelf kolommen in te bouwen: [`nldd-two-thirds-one-third-section`](/componenten/two-thirds-one-third-section/) en [`nldd-one-half-one-half-section`](/componenten/one-half-one-half-section/) verdelen de breedte, [`nldd-sidebar-section`](/componenten/sidebar-section/) zet een vast paneel naast de inhoud, en [`nldd-full-bleed-section`](/componenten/full-bleed-section/) laat een vlak tot de rand lopen. Ze delen dezelfde marges en dezelfde `background`, dus afwisselen geeft ritme zonder dat de pagina uit het lood raakt.

**Eén `h1` per pagina, en geen niveau overslaan.** `size` op een [`nldd-title`](/componenten/title/) is hoe die eruitziet, `heading-level` wat die is. Dat maakt een herbruikbaar blok eenvoudig: geef het een kopniveau als parameter, zodat het onder een sectiekop een `h3` kan zijn en op een overzichtspagina een `h2`, en laat de grootte los daarvan.

**Laat de bovenbalk wegscrollen.** Een [`nldd-page`](/componenten/page/) kan zijn header vastzetten met `sticky-header`, maar doet dat standaard niet, en op een contentpagina houd je dat zo. Een [`nldd-top-navigation-bar`](/componenten/top-navigation-bar/) is een flinke stapel UI, en wat daarvan blijft staan, staat de inhoud in de weg waarvoor iemand kwam. Zie de [ontwerprichtlijnen](/richtlijnen/#visueel-en-layout).

**Een set gelijkwaardige kaarten is een collection.** De [`nldd-collection`](/componenten/collection/) leidt het aantal kolommen af uit `item-width` en de beschikbare breedte, en zet de tussenruimte per breakpoint.

**Een kaart zet zelf geen padding.** De [`nldd-card`](/componenten/card/) laat dat aan de inhoud, zodat een afbeelding tot de rand kan lopen. Wikkel wat erin staat dus in een `nldd-container` met `padding`, anders plakt je tekst tegen de rand.

**Een vlak maak je met `background`, niet met eigen CSS.** Elke page-section kent het, en het cascadeert het oppervlak naar alles wat erin staat: een `nldd-card` in een getinte sectie kiest zelf een andere vulling. Zet je er een eigen achtergrondkleur onder, dan weet de inhoud daar niets van en klopt het contrast niet meer. Loopt het vlak van rand tot rand, bijvoorbeeld om een afbeelding, pak dan de [`nldd-full-bleed-section`](/componenten/full-bleed-section/): die heeft geen horizontale padding, dus zet er zelf een container omheen als er tekst in staat.

**De footer is een component en hoeft niet in een sectie.** De [`nldd-page-footer`](/componenten/page-footer/) heeft een rij voor je eigen inhoud en een `legal-bar` eronder, trekt de scheidingslijnen tussen de gevulde rijen, en draagt het id waar een skip link naartoe kan springen.

## Toegankelijkheid

Wat je gratis krijgt: de leesbreedte en de witruimte van de secties, het contrast van een getint of omgekeerd vlak, de koppen die de titels renderen, en de juridische rij als eigen navigatie met een naam.

Wat jij nog moet doen: een `heading-level` op elke titel, ook op die in de footer, een [`nldd-skip-link`](/componenten/skip-link/) bovenaan als er navigatie voor de inhoud staat, en een tekst in een kaart die een link is. Die kaart ontleent zijn naam aan wat erin staat, dus een kaart met alleen een afbeelding krijgt een `accessible-label`.

## Gezien in

Deze compositie komt van de publieke pagina's op dit systeem, waar die naast de applicatieschermen van dezelfde producten staat. Hij reisde eerder als los voorbeeld met de skill mee, zonder live voorbeeld en zonder test. Dit is dezelfde pagina, nu getoetst.
