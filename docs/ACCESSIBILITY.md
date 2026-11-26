# Toegankelijkheid

Een component alleen maakt een pagina niet toegankelijk, het hangt er vaak van af hoe je het gebruikt. Maar een goed component kan veel werk uit handen nemen. Deze pagina legt uit wat je van componenten kunt verwachten, en wat je zelf nog zou moeten doen.

## Waar we op bouwen

We bouwen voor WCAG 2.2 niveau AA. Dat is een stap verder dan wat DigiToegankelijk (EN 301 549) nu vraagt, WCAG 2.1 niveau AA. Voor rollen en toetsenbordgedrag volgen de componenten de WAI-ARIA Authoring Practices.

Of een pagina voldoet, bepaal je per pagina. De componenten zijn daarvoor een voorwaarde en geen garantie: met de juiste onderdelen kun je nog steeds een pagina bouwen die niet te volgen is.

## Een designsysteem is een “authoring tool”

Wie met dit systeem bouwt, maakt webcontent met een hulpmiddel. Daar bestaat een W3C-standaard voor: [ATAG 2.0](https://www.w3.org/WAI/standards-guidelines/atag/), de Authoring Tool Accessibility Guidelines. Deel B daarvan vraagt dat een hulpmiddel je helpt om toegankelijke content te maken. We claimen geen conformiteit met ATAG, maar gebruiken deel B van ATAG wel als maatstaf voor wat het systeem hoort te doen.

| ATAG 2.0, deel B | Hier |
|---|---|
| B.2.5 Kant-en-klare content is toegankelijk | De componenten: rol, naam, toetsenbord en focus zitten erin |
| B.2.4 Sjablonen zijn toegankelijk | De [patronen](https://design.digitaledienst.overheid.nl/patronen/), elk met een sectie Toegankelijkheid |
| B.3.1 Hulp bij het controleren | [`nldd lint`](https://design.digitaledienst.overheid.nl/handleidingen/linter/), op broncode, op gebouwde pagina's en in de browser |
| B.3.2 Hulp bij het herstellen | Elke melding zegt wat er moet veranderen, en `nldd explain` laat zien hoe het goed is |
| B.4.1 Die hulp staat standaard aan, en in het zicht | Tijdens het ontwikkelen verschijnen meldingen over toegankelijkheid in de console. De regels van een component staan ook op zijn eigen pagina, op de tab Lintregels |
| B.4.2 De documentatie geeft het goede voorbeeld | Herbruikbare en geteste voorbeelden zijn beschikbaar, bij elk component en elk patroon |

## Wat de componenten zelf doen

- **Rol, naam en toestand.** Elk component zet de rol en de `aria`-attributen op het element dat ze nodig heeft, ook in een shadow root (4.1.2).
- **Toetsenbord.** Wat je kunt aanklikken, kun je met het toetsenbord bedienen. [Widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets) zoals menu's zijn één tabstop, en binnen de groep ga je verder met de pijltjestoetsen (2.1.1).
- **Focus.** De focusring komt uit één token en heeft in elk thema minstens 4,5:1 contrast met de achtergrond (2.4.7). Een sheet en een modal dialog houden de focus bij zich, sluiten met Escape en geven de focus terug aan waar je vandaan kwam (2.1.2, 2.4.3). Een `nldd-page` kan een balk hebben die blijft staan terwijl de inhoud scrolt. Krijgt een element focus dat achter die balk zou vallen, dan scrolt de pagina het in beeld (2.4.11).
- **Formaat.** Een knop en een veld zijn standaard 44 pixels hoog. Geen control is kleiner dan de 24 pixels die WCAG 2.2 voor een aanwijsgebied vraagt, ook een checkbox en de kleinste knop niet (2.5.8).
- **Contrast op een gekleurde achtergrond.** Geef je een component een achtergrondkleur met het attribuut `background`, dan krijgt de tekst erin vanzelf een kleur die daar genoeg contrast mee heeft (1.4.3).
- **Tekstgrootte.** Wanneer gebruikers tekstvergroting in hun browser gebruiken, blijft content leesbaar en functionaliteit bruikbaar (1.4.4). De kleinste breedte die we ondersteunen is 320 pixels (1.4.10).
- **Beweging en contrastinstellingen.** Animaties volgen `prefers-reduced-motion`. Bij gebruik van contrastinstellingen van het besturingssysteem (`forced-colors`) blijven randen, toestanden en de focusring zichtbaar.
- **Meldingen.** Een [`nldd-status-bar`](https://design.digitaledienst.overheid.nl/componenten/status-bar/), een [`nldd-banner`](https://design.digitaledienst.overheid.nl/componenten/banner/) en een [`nldd-notification`](https://design.digitaledienst.overheid.nl/componenten/notification/) melden zichzelf aan een schermlezer (4.1.3). Een notificatie telt niet af terwijl je hem leest, en een kritieke verdwijnt nooit vanzelf (2.2.1).
- **Wat verschijnt bij hover of focus.** Een tooltip verdwijnt niet als je er met je muis overheen gaat, blijft staan tot de hover of focus wordt weggehaald, en sluit met Escape, ook als de focus ergens anders staat (1.4.13).
- **Standaardteksten.** Ingebouwde teksten, zoals de naam van een sluitknop, zijn Nederlands en zet je in één keer om naar een andere taal. Zie [Vertalingen](https://design.digitaledienst.overheid.nl/handleidingen/vertalingen/).

## Wat jij nog moet doen

Niet alle toegankelijkheid kan binnen componenten geregeld worden. Deze zaken neem je zelf mee tijdens de implementatie van het component.

- **Geef een naam aan wat geen zichtbare tekst heeft.** Een knop met alleen een icoon, een kaart die een link is en een lijst krijgen een `accessible-label`.
- **Houd de koppen op orde.** Eén `h1` per pagina, en geen niveau overslaan. `heading-level` op een titel is wat hij is en bepaalt zijn standaardgrootte. Moet hij kleiner, geef hem dan een `size` en geen lager niveau.
- **Geef elke pagina een eigen titel.** De `<title>` zegt waar deze pagina over gaat en verschilt van die van de andere pagina's. In een app die zonder herladen navigeert, zet je hem bij elke route opnieuw.
- **Beschrijf afbeeldingen.** Een afbeelding die iets zegt krijgt een `alt`; een afbeelding die alleen sfeer is krijgt `decorative`.
- **Schrijf links en knoppen die op zichzelf staan.** "Alles over dakisolatie" zegt waar een link heen gaat, "Lees meer" niet.
- **Zet de taal.** Een `lang` op de pagina, en op elk stuk tekst in een andere taal.
- **Koppel een label aan elk veld.** Zet een invoerveld in een `nldd-form-field`, dan zitten het label, de hulptekst en de validatie eraan vast. Vraagt het veld om gegevens van de gebruiker zelf, zet dan ook `autocomplete`.
- **Schrijf de markup in een logische volgorde.** Wat op een breed scherm naast elkaar staat, staat op een smal scherm onder elkaar, in de volgorde van de markup. Een schermlezer en de Tab-toets volgen die ook.
- **Loop de pagina langs met Tab.** Of de focusvolgorde logisch is, weet je pas op de hele pagina. Soms verplaatst een pagina de focus voor je: denk aan de focus na een routewissel, en na het sluiten van een modal.
- **Zoom in tot 200% en test op 320 pixels breed.** Met alleen componenten uit dit systeem hoort dat goed te gaan. Test dit extra goed als je integreert met een bestaand CMS, een ander designsysteem of andere externe componenten die je inlaadt, denk aan een chatwidget.
- **Geef wie niet kan slepen een andere weg.** Een bord en een sorteerbare lijst verplaatsen ook met het toetsenbord. De knop of het menu voor de muis maak je zelf; [`nldd-kanban`](https://design.digitaledienst.overheid.nl/componenten/kanban/) heeft daarvoor `moveItem()`.

Wat een component precies doet en vraagt, staat op zijn eigen pagina. Elk patroon heeft een sectie Toegankelijkheid, met wat je gratis krijgt en wat jij nog moet doen.

## Wat de linter controleert

[`nldd lint`](https://design.digitaledienst.overheid.nl/handleidingen/linter/) zit in het pakket en controleert je eigen code op wat hier staat. Per component betekent dat: zet je dit in, vergeet dan dat niet. Die regels staan op de tab Lintregels van elk component.

```bash
npx @nldd/design-system lint src
```

De groep `a11y` gaat over wat hulptechnologie mist, zoals een knop zonder naam. Regels uit andere groepen tellen net zo goed mee. Een link met de tekst "Lees meer" is een regel van `copy`, een control in een control een van `structure`, en een werkbalk die op een smal scherm een actie kwijtraakt een van `pattern`. Daarom noemt elke regel het succescriterium dat hij bewaakt, en staan ze [per criterium](https://design.digitaledienst.overheid.nl/handleidingen/toegankelijkheid/#lintregels-per-succescriterium) onderaan deze pagina. Elke regel heeft een eigen pagina, met wat hij zoekt en waar hij draait.

De linter meldt alleen wat zeker fout is. Een naam die er staat maar niets zegt, een alt-tekst die de afbeelding niet beschrijft en een volgorde die niet klopt, vindt hij niet. Een schone run zegt dus niet dat de pagina voldoet.

## Wie doet wat, per succescriterium

Alle succescriteria van WCAG 2.2 op niveau A en AA. "Systeem" betekent dat je het met alleen onze componenten niet stuk krijgt, "Samen" dat het systeem een deel doet en jij de rest, "Jij" dat het systeem er niet bij kan.

Elke rij is een samenvatting: ze zegt waar het systeem helpt en waar het ophoudt, niet alles wat het criterium vraagt. Een criterium als 1.3.1 of 1.4.11 dekt veel meer gevallen dan hier in twee zinnen passen. Lees voor de volledige eis [WCAG 2.2](https://www.w3.org/Translations/WCAG22-nl/) zelf.

### Waarneembaar

| Succescriterium | Wie | Wat |
|---|---|---|
| 1.1.1 Niet-tekstuele content (A) | Samen | De linter meldt een afbeelding zonder `alt` en een icoonknop zonder naam. De tekst schrijf jij. |
| 1.2.1 tot en met 1.2.5 Op tijd gebaseerde media (A en AA) | Jij | Het systeem heeft geen speler voor audio of video. Ondertitels, transcripties en audiodescriptie horen bij je media. |
| 1.3.1 Info en relaties (A) | Samen | Een breed criterium: structuur en verbanden die je ziet, staan ook in de code. Een component zet de rol van wat het zelf is, zoals een lijst, een tabel, een kop of een groep velden. Jij kiest het component dat bij de inhoud past, het kopniveau, en zet velden in een `nldd-form-field`. |
| 1.3.2 Betekenisvolle volgorde (A) | Jij | Hulptechnologie volgt de volgorde van je markup. Zorg dat die logisch is, op elk schermformaat. |
| 1.3.3 Zintuiglijke eigenschappen (A) | Jij | Verwijs in tekst niet naar plaats, vorm of kleur alleen, zoals "de knop rechts". |
| 1.3.4 Weergavestand (AA) | Systeem | Geen component legt een stand vast. |
| 1.3.5 Identificeer het doel van de input (AA) | Jij | Zet `autocomplete` op velden die om gegevens van de gebruiker zelf vragen. |
| 1.4.1 Gebruik van kleur (A) | Samen | Kleur versterkt de betekenis en draagt hem niet. Dat vraagt jouw tekst: een statusbalk en een destructief menu-item zeggen in woorden wat ze zijn. Zie ook [Bekende afwijkingen](#bekende-afwijkingen). |
| 1.4.2 Geluidsbediening (A) | Jij | Geen component speelt geluid af. |
| 1.4.3 Contrast (minimum) (AA) | Samen | De tokens en elk thema zijn op 4,5:1 voor tekst gekozen, in licht en donker. Eigen kleuren en tekst op een afbeelding controleer je zelf. |
| 1.4.4 Herschalen van tekst (AA) | Samen | Tekst in componenten vergroot mee met de browser, zonder verlies van inhoud of functie. Test je eigen pagina op 200%. |
| 1.4.5 Afbeeldingen van tekst (AA) | Jij | Zet tekst als tekst op de pagina. |
| 1.4.10 Reflow (AA) | Samen | Componenten werken vanaf 320 pixels breed. Een actie die niet meer in een `nldd-toolbar` past, gaat naar het overloopmenu van die balk, als jij hem daar een plek geeft. |
| 1.4.11 Contrast van niet-tekstuele content (AA) | Samen | Geldt voor alles wat je moet kunnen zien om een control of een grafiek te begrijpen: randen, toestanden, iconen, de focusring. In onze componenten hebben selectie en markering minstens 3:1 en de focusring 4,5:1. Eigen iconen, grafieken en kleuren controleer je zelf. Zie ook [Bekende afwijkingen](#bekende-afwijkingen). |
| 1.4.12 Tekstafstand (AA) | Samen | Dit testen we nog niet automatisch. Controleer het op je pagina en meld wat wegvalt. |
| 1.4.13 Content bij hover of focus (AA) | Samen | Drie eisen: je kunt de extra content sluiten zonder de aanwijzer of de focus te verplaatsen, je kunt er met de aanwijzer overheen, en ze blijft staan tot je weggaat. `nldd-tooltip` voldoet aan alle drie. Wat je zelf bij hover of focus laat verschijnen, toets je zelf. |

### Bedienbaar

| Succescriterium | Wie | Wat |
|---|---|---|
| 2.1.1 Toetsenbord (A) | Samen | Elk component is met het toetsenbord te bedienen. Maak iets klikbaars met `nldd-button` of `nldd-link`, niet met een `div`. |
| 2.1.2 Geen toetsenbordval (A) | Systeem | Een sheet en een modal dialog houden de focus vast en laten hem los met Escape. |
| 2.1.4 Enkel teken sneltoetsen (A) | Jij | Geen component luistert op de hele pagina naar één letter. Sneltoetsen van je app zijn van jou. |
| 2.2.1 Timing aanpasbaar (A) | Samen | Een notificatie pauzeert bij hover en focus, en een kritieke blijft staan. Een sessie die verloopt is van jou. |
| 2.2.2 Pauzeren, stoppen, verbergen (A) | Jij | Animaties van componenten volgen de instelling voor minder beweging. Wat je zelf laat bewegen, moet te stoppen zijn. |
| 2.3.1 Drie flitsen of beneden drempelwaarde (A) | Jij | Geen component flitst. |
| 2.4.1 Blokken omzeilen (A) | Samen | `nldd-skip-link` en de landmarks van `nldd-page`. Jij zet de skiplink om de header. |
| 2.4.2 Paginatitel (A) | Jij | Elke pagina een eigen `<title>`, ook na navigeren zonder herladen. |
| 2.4.3 Focus volgorde (A) | Samen | De focus volgt de markup, en een overlay geeft hem terug. De volgorde van de pagina en de focus na een routewissel zijn van jou. |
| 2.4.4 Linkdoel (in context) (A) | Jij | De linter geeft een hint bij "Lees meer" en "Klik hier". Of een tekst klopt, beoordeel je zelf. |
| 2.4.5 Meerdere manieren (AA) | Jij | Navigatie, een zoekfunctie of een sitemap: twee wegen naar elke pagina. |
| 2.4.6 Koppen en labels (AA) | Jij | Een kop en een label zeggen wat eronder of erin staat. |
| 2.4.7 Focus zichtbaar (AA) | Systeem | Eén focusring uit één token, op elk vlak en in de contrastmodus. |
| 2.4.11 Focus niet bedekt (minimum) (AA) | Samen | `nldd-page` houdt de focus onder zijn vaste balken vandaan. Een eigen vast element, zoals een cookiebalk of een chatwidget, controleer je zelf. |
| 2.5.1 Aanwijzergebaren (A) | Jij | Geldt voor gebaren die je zelf bouwt, zoals vegen of knijpen. |
| 2.5.2 Aanwijzerannulering (A) | Systeem | Een actie gebeurt bij loslaten. Slepen van de inhoud van een sheet naar de achtergrond sluit hem niet. |
| 2.5.3 Label in naam (A) | Samen | De naam van een control is zijn zichtbare tekst. Zet je een `accessible-label`, begin dan met die tekst. |
| 2.5.4 Bewegingsactivering (A) | Jij | Geen component reageert op beweging van het apparaat. |
| 2.5.7 Sleepbewegingen (AA) | Samen | Een bord en een sorteerbare lijst verplaatsen ook met het toetsenbord. De weg zonder slepen voor de aanwijzer bouw jij, bij een bord met `moveItem()`. |
| 2.5.8 Grootte van het aanwijsgebied (minimum) (AA) | Samen | Knoppen en velden zijn standaard 44 pixels hoog, en geen control is kleiner dan 24. De linter meldt een klikbare avatar die kleiner is. |

### Begrijpelijk

| Succescriterium | Wie | Wat |
|---|---|---|
| 3.1.1 Taal van de pagina (A) | Jij | `lang` op het `html`-element. |
| 3.1.2 Taal van onderdelen (AA) | Jij | `lang` op elk stuk tekst in een andere taal. |
| 3.2.1 Bij focus (A) | Samen | Focus krijgen verstuurt of navigeert bij ons niets. Doe in je eigen code hetzelfde. |
| 3.2.2 Bij input (A) | Jij | Een keuze die meteen navigeert of verstuurt, kondig je vooraf aan. |
| 3.2.3 Consistente navigatie (AA) | Jij | Dezelfde navigatie op dezelfde plek. Het patroon [Paginaopbouw](https://design.digitaledienst.overheid.nl/patronen/page-structure/) helpt. |
| 3.2.4 Consistente identificatie (AA) | Jij | Wat hetzelfde doet, heet overal hetzelfde. |
| 3.2.6 Consistente hulp (A) | Jij | Hulp en contact staan op elke pagina op dezelfde plek. |
| 3.3.1 Foutidentificatie (A) | Samen | `nldd-form-field` koppelt de validatie aan het veld, in tekst. De melding schrijf jij. |
| 3.3.2 Labels of instructies (A) | Samen | `nldd-form-field` geeft het veld zijn label. De linter meldt een veld zonder naam. |
| 3.3.3 Foutsuggestie (AA) | Jij | Zeg in de melding hoe het wel moet. |
| 3.3.4 Foutpreventie (wettelijk, financieel, gegevens) (AA) | Jij | Laat controleren, bevestigen of terugdraaien. |
| 3.3.7 Overbodige invoer (A) | Jij | Vraag niet twee keer om hetzelfde. |
| 3.3.8 Toegankelijke authenticatie (minimum) (AA) | Samen | Het veld voor een eenmalige code neemt een geplakte code over, en de code die een telefoon aanbiedt. Het wachtwoordveld geeft `autocomplete` door. Voeg zelf geen puzzel toe. |

### Robuust

| Succescriterium | Wie | Wat |
|---|---|---|
| 4.1.2 Naam, rol, waarde (A) | Samen | Rol en toestand komen van het component, de naam van jou. De meeste lintregels gaan hierover. |
| 4.1.3 Statusberichten (AA) | Samen | Gebruik `nldd-status-bar`, `nldd-banner` of `nldd-notification`: die melden zichzelf. |

## Hoe we testen

- **Automatisch, bij elke wijziging.** ESLint draait alle regels van `eslint-plugin-lit-a11y` over de templates. De tests draaien in een echte browser en controleren rollen, namen, focus en toetsenbord, op een aantal plekken met axe erbij.
- **Op de website.** `npm run test:a11y` laat axe over elke pagina en elk voorbeeld lopen, in CI. De documentatie volgt ook de eigen lintregels.
- **Met de hand.** Met het toetsenbord, met VoiceOver in Safari, op 200% tekstgrootte en in de contrastmodus. Dat vinden de automatische controles niet: of een volgorde logisch is, of een melding op het juiste moment komt, of een naam iets zegt.

## Bekende afwijkingen

- **De rij waar je bent.** Een `nldd-list-item` met `current` heeft een lichtgrijs vlak met 1,3:1 contrast in de lichte weergave en 1,5:1 in de donkere. Dat is te weinig voor 1.4.11, en een audit rekent het ook 1.4.1 aan. Het is een bewuste keuze: de titel van de pagina en de kop zeggen al waar je bent, en `aria-current` zegt het tegen een schermlezer. Neem het op in je toegankelijkheidsverklaring.
- **Voorbeelden op deze site.** Wat axe in de voorbeelden vindt en nog niet is opgelost, staat in [`www/a11y-baseline.json`](../www/a11y-baseline.json). Een nieuwe bevinding laat de build falen.

## Iets gevonden

Meld het in een [issue](https://github.com/NederlandseDigitaleDienst/design-system/issues), met het component, wat je deed en welke hulpsoftware je gebruikte.
