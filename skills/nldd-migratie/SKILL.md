---
name: nldd-migratie
description: "Zet een bestaande frontend om naar @nldd/design-system: Tailwind, CSS modules, of handgeschreven componenten. Triggers: 'migreren naar het design system', 'omzetten naar nldd', 'Tailwind eruit', 'converteren naar de Rijkshuisstijl-componenten'. Voor het bouwen van een nieuwe app: gebruik de `nldd` skill. Voor het ontwikkelen van het design system zelf: /component, /css."
metadata:
  type: reference
---

# Een bestaande codebase omzetten naar het NLDD Design System

De `nldd` skill leert je hoe de componenten werken. Deze skill gaat over iets
anders: wat er misgaat als je een **bestaande** applicatie omzet, en hoe je dat
merkt voordat je gebruikers het merken.

Alles hieronder geldt ongeacht waar je vandaan komt. Is je codebase specifiek,
lees dan ook:

- [`van-tailwind.md`](van-tailwind.md): de compilervalstrik, de tokenbrug,
  botsende globale regels, iconen.
- [`server-gerenderd.md`](server-gerenderd.md): HTML op de server met
  fragmentwissels (htmx, Turbo, Unpoly, LiveView). Wat een swap anders doet dan
  een paginalading, de nieuwe stack ernaast zetten, en wat vendoren van de
  bundel je oplevert en kost.

Wat je in de componentdocumentatie kunt opzoeken staat hier niet in; wat hier
staat heeft in echte migraties tijd gekost.

## Het uitgangspunt: dit systeem faalt stil

Bijna elke fout die je kunt maken rendert niets, of iets dat er bijna goed
uitziet. Zonder console-melding, zonder typefout, zonder falende test.

Bij een gewone migratie vertelt je compiler het wanneer je iets breekt. Hier
niet, en je testsuite evenmin. Dat ene gegeven bepaalt de hele aanpak: je kunt
niet omzetten-en-doorgaan. Je moet checks bouwen die de stilte hoorbaar maken,
en je moet meten in een echte browser.

Deze fouten compileren allemaal, komen langs `tsc` en eslint, en doen niets:

| Fout | Wat je ziet |
|---|---|
| Component niet geregistreerd | Kinderen renderen ongestyled |
| Onbekende icoonnaam | Niets |
| Niet-bestaande CSS-variabele | Niets |
| Niet-bestaande variabele **met** hex-fallback | De fallback rendert; de token is versiering en donkere modus bevriest |
| `className` in plaats van `class` op een rauw element | De klasse doet niets |
| React `onChange` op een geslot native control | De handler draait nooit |
| Breedteloze container om een kind dat zijn ouder meet | Nul pixels, hoogte blijft |

## Bouw de checks vóór je iets omzet

Doe dit in de eerste uren, niet aan het eind. Elk van deze ving echte schade die
niets anders zag:

1. **Registratiecheck.** Vergelijk elk gebruikt `nldd-*` element met wat er
   werkelijk geïmporteerd is. Lees daarbij het *template*-bestand van de ouder,
   niet alleen het componentbestand: `token-field.js` importeert alleen
   `menu.js`, terwijl de import die `nldd-token` registreert in
   `token-field.template.js` zit.
2. **Markupcheck.** Valideer elementen, attributen, slots en icoonnamen tegen
   `custom-elements.json` van het pakket. Icoonnamen zijn een gesloten set; een
   verzonnen naam rendert niets.
3. **Tokencheck.** Valideer elke `var(--primitives-*|--semantics-*|--components-*)`
   tegen de echte tokens in `node_modules/@nldd/design-system/dist/css/*.css`.
   **Vlag ook letterlijke hex-kleuren**, en `var(--x, #aabbcc)` het hardst: de
   fallback maakt een verkeerde tokennaam onzichtbaar.
4. **Klassencheck.** Elke klasse die de app rendert moet een regel achter zich
   hebben, én elke regel in je eigen utilities-bestand moet een gebruiker
   hebben. Beide richtingen.
5. **Gedragscheck.** De vier hierboven toetsen of je *code* klopt. Geen van ze
   merkt dat er iets uit je interface verdwenen is. Zie de volgende sectie.

Hang de eerste vier in pre-commit **en** in CI. Zorg dat je lokale hook hetzelfde
commando draait als CI: een hook op `tsc --noEmit` terwijl CI `tsc -b` draait
laat kapotte commits er stelselmatig door.

Bewijs bij elke check dat hij faalt. Zet er een opzettelijke fout in, kijk of
hij niet-nul afsluit, haal hem weg. Een check die alleen ooit slaagt is geen
check. Doe dat ook voor elk faalpad apart: een check met twee soorten
bevindingen heeft twee uitgangen, en er is er altijd één die je nooit hebt zien
afgaan.

Herhaal die proef nadat iemand aan de check zelf heeft gezeten. Een check die
tijdens de migratie een overgangsstand kent ("waarschuw zolang het oude systeem
er nog is") houdt na de omzetting een tak over die nooit meer bereikt wordt, en
die tak kan de hele check stilzetten. Haal zulke takken weg zodra ze dood zijn,
en meet daarna opnieuw dat er iets rood van wordt.

## Meet wat een pagina DOET, niet hoe hij eruitziet

De vier checks hierboven vangen code die niet klopt. Ze vangen niet dat een
keuzelijst weg is. Een omzetting mag een pagina er anders uit laten zien; wat
hij niet mag is hem minder laten **doen**, en juist dat faalt stil. In één
migratie verdwenen onderweg een keuzelijst, een knop die een venster opende en
de invoervelden van een filter. Geen van drieën gaf een foutmelding.

Haal daarom uit de gerenderde HTML wat een pagina kan, en leg dat per route
vast in een bestand:

- **bestemmingen**: `href`, form `action`, en elk attribuut dat op `-href`
  eindigt, want componenten schrijven die zelf;
- **fragment-adressen**: de attributen waarmee je stack HTML ophaalt;
- **aangeroepen functies**: de namen uit `onclick`, `onchange`, `oninput`,
  `onsubmit`;
- **besturingselementen met een naam**: `input`, `select`, `textarea`, plus een
  expliciete lijst componenten die écht een formulierveld zijn;
- **id's** waar script of een fragmentwissel aan kan hangen.

Twee ontwerpkeuzes maken het verschil tussen een poort die werkt en een die
niemand meer leest:

**Faal alleen op wat verdwijnt.** Iets erbij is nieuw werk; iets dat weg is, is
bijna altijd een ongeluk. Die asymmetrie is wat de poort bruikbaar houdt
tijdens een migratie, waarin pagina's per definitie veranderen.

**Negeer alles wat vormgeving is.** Tagnamen, klassen, teksten en stylesheets
tellen niet mee: dat is precies wat mag veranderen. Normaliseer daarnaast wat
per verzoek verschilt (CSRF-waarden, cache-brekers, UUID's in paden) en laat
id's vallen die op `-label`, `-help` of `-error` eindigen: die maakt
`nldd-form-field` zelf bij om een veld aan zijn label te knopen. Ze zijn
interne bedrading, geen gedrag. Zonder die twee filters piept de poort altijd,
en een poort die altijd piept houdt niemand in de gaten.

Zo'n meetlat is klein: 150 regels met alleen een HTML-parser en reguliere
expressies, zonder afhankelijkheden.

### Een poort die de verkeerde bron leest is erger dan geen poort

Toets tegen het artefact dat je uitlevert, niet tegen documentatie of een
handgeschreven lijst. Eén project liet zijn iconentoets jarenlang een JSON-lijst
lezen: de poort stond groen terwijl er 37 lege plekken in de interface stonden,
omdat de lijst 327 namen kende en de bundel er 271 had.

> Een poort die de verkeerde bron leest geeft je het gevoel dat het gedekt is.
> Zonder poort had iemand die lege knoppen gevonden bij het kijken.

Lees icoonnamen dus uit het pakket, en neem de aliassen mee: namen als `search`
en `edit` verwijzen naar een echt icoon en renderen gewoon, dus een poort die
alleen bestandsnamen kent noemt ze ten onrechte onbekend. Onder een statische
poort hoort bovendien een browsermeting, want een lijst blijft een aanname over
wat de browser doet.

### Een verbouwing bewijs je met twee afdrukken

Verplaats je vormgeving zonder iets te willen veranderen (inline stijlen naar
klassen, `<style>`-blokken naar bestanden), dan zegt een unittest daar niets
over. Maak in plaats daarvan een afdruk op de basiscommit, een op je werk, en
vergelijk:

```
git worktree add /tmp/basis <basis-commit>
(cd /tmp/basis/... && <je snapshot-script> /tmp/snap-basis)
<je snapshot-script> /tmp/snap-nu
diff -ru /tmp/snap-basis /tmp/snap-nu
```

Leg per pagina twee dingen vast: de DOM na het laden (genormaliseerd) en een
screenshot. De DOM-afdruk is de scherpe vergelijking, want een diff wijst de
regel aan; de screenshot vangt wat de DOM niet laat zien, zoals vormgeving die
van plaats verschoven is. Geen baseline in de repo betekent ook geen
goedkeuringsstap die stilletjes verkeerd wordt afgetekend.

Normaliseer daarbij elk `id`, `for`, `aria-labelledby` en `aria-controls` met
cijfers erin, anders piept elke diff op de bedrading die de componenten zelf
bijmaken.

## Dode CSS is de stilste vorm van kapot

Wat je oude stijlsysteem ook was, de regel is dezelfde: een klasse of regel die
na de omzetting niets meer doet, blijft compileren en blijft langs tsc en eslint
komen. Je ziet het alleen aan het scherm, en pas als je erheen navigeert.

Daarom controleert de klassencheck uit de vorige sectie beide richtingen:

- **Klassen zonder regel.** De markup noemt iets dat nergens meer gedefinieerd
  is.
- **Regels zonder gebruiker.** Je eigen CSS-bestand houdt regels over waarvan de
  aanroepplek is omgezet. Een bestand dat in zijn kop zegt geen
  utility-framework te zijn, moet daaraan gehouden worden.

Zoek daarbij verder dan het markup-attribuut. Klassen overleven het langst in
lookup-tabellen (`Record<Status, string>` in je types-bestand), in ternaries en
in template literals: niets daaraan ziet eruit als markup. Scan dus ook `.ts`,
niet alleen `.tsx`.

En sluit nooit een heel bestand uit van de check. Een uitsluiting op
bestandsnaam voor graph-views ("die klassen zijn van de graph-bibliotheek")
verborg 112 dode klassen over zes bestanden, waaronder een datatabel die als
kale HTML rendeerde. Sluit uit op klassenaam, en alleen voor de handvol namen
die een externe bibliotheek echt bezit.

Kom je van Tailwind, lees dan [`van-tailwind.md`](van-tailwind.md): daar zit een
extra valstrik, omdat de compiler regels verzint voor klassen die nergens
bestaan.

## Events: de regel die de meeste code breekt

**React's synthetische events bereiken geen controls die in een custom element
geslot zijn.**

`nldd-dropdown` is een visuele schil om een echte `<select>` die je als child
meegeeft. Het component luistert op die select, roept `stopPropagation()` aan op
de native `change`, en zendt daarna zijn eigen `CustomEvent` uit vanaf de host.
React delegeert vanaf de root, dus:

- het gestopte native event bereikt de delegate nooit, en
- wat er wel aankomt is een `CustomEvent` die React niet op `onChange` mapt.

Een React `onChange` op die select **vuurt nooit**. Dit is geen randgeval: in
één codebase maakte het **37 handlers** stil onbruikbaar. Rolbeheer werkte
volledig niet, deelrechten waren niet te geven, een filter stuurde geen enkele
request. Niets in de UI liet dat blijken.

Hetzelfde geldt voor:

- `nldd-text-field` en verwanten, die een eigen shadow input hebben en opnieuw
  uitzenden.
- `close` op sheets, popovers en modals: dat heeft `bubbles: false`, dus een
  `onClose`-prop vuurt nooit en een dismissal reist niet omhoog. Mis je dat, dan
  heeft de overlay twee klikken nodig om te heropenen.

**Schrijf op dag één één `useNlddEvent(ref, 'change', ...)`-helper** plus een
`useNlddValue`-spiegel voor gecontroleerde waarden, en laat alles door je eigen
wrapper-componenten lopen. Audit daarna: grep elke React-handler die gebonden is
aan een element binnen een `nldd-*` tag.

Let bij die audit ook op `defaultValue`. Een gecontroleerde `value=` vervangen
door `defaultValue=` "om dit op te lossen" lijkt te werken en is een bug: data
komt meestal uit een query, dus de eerste render heeft een lege lijst, de
default bevriest op `""` en herstelt zich nooit.

## Layout: instorten tot nul breedte

Drie vormen om te kennen:

- **`width="fit-content"` samen met `layout="row"` rendert 0 pixels.** De host
  is `display: block` met `width: fit-content`, terwijl de layout
  `display: flex` op een element in de shadow root zet. Een block-box om een
  flex-kind dat geen intrinsieke breedte meldt, wordt nul.
- **Het omgekeerde.** Een container zonder breedte kan zijn buur uithongeren:
  een badge-kolom groeide tot 926px en hield de naam ernaast op nul.
- **Een flex-item krimpt niet onder zijn inhoud zonder `min-width: 0`.** Een
  lange naam claimt de hele rij en duwt de rest van het scherm af.

Spoor dit op in de browser, niet door te lezen. Loop na elke pagina de DOM langs
op elementen met breedte 0 die wel inhoud hebben, en op kinderen waarvan de
rechterrand buiten hun ouder valt.

## Meet in de browser, en meet het juiste

Code lezen vertelt je wat je bedoelde. Alleen de DOM vertelt wat er gebeurde.

Twee meetvalstrikken:

- **"Niets rendert op nul pixels" is niet hetzelfde als "alles werkt."** Een
  kruistabel rendeerde op volle grootte met `border-collapse: separate`, een
  sticky header op `position: static` en nul randen: zichtbaar, met afmetingen,
  en volledig ongestyled. De nulbreedte-sweep was al die tijd schoon. Vermoed je
  verlies van styling, controleer dan *computed styles* (`borderCollapse`,
  `position`, `backgroundColor`), geen afmetingen.
- **Gesloten dialogs vervuilen elke query.** `document.querySelectorAll('h1')`
  gaf op één pagina veertien resultaten, waarvan dertien uit ongeopende modals
  en datumkiezers in shadow roots. Filter op een niet-lege bounding box voordat
  je iets concludeert over koppen, focusbare elementen of duplicaten.

Bruikbare sweep, per pagina:

```js
// Alleen zichtbare koppen, inclusief shadow roots
function zichtbareKoppen(root, out = []) {
  for (const el of root.querySelectorAll('*')) {
    if (/^H[1-6]$/.test(el.tagName)) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) out.push(el.tagName + ' ' + el.textContent.trim());
    }
    if (el.shadowRoot) zichtbareKoppen(el.shadowRoot, out);
  }
  return out;
}
```

Tel ook het aantal tab-stops per pagina, voor en na. Zakt een pagina van 150
naar 6, dan heb je bedieningselementen in versiering veranderd.

## Toegankelijkheid is waar deze migratie je te schande zet

De hele rechtvaardiging voor dit systeem is WCAG 2.1 AA en EN 301 549. Een
toegankelijkheids*regressie* is daarmee de pijnlijkste uitkomst, en die maak je
makkelijk:

- **Een kaart met een pointer-cursor is geen knop.** Een `hoverable`-prop die
  alleen `cursor: pointer` zet geeft muisgebruikers een affordance en
  toetsenbordgebruikers niets: geen tab-stop, geen rol, niets aangekondigd.
  Gebruik het echte `button`-attribuut van het component plus een
  `accessible-label`. Let op: de activatie gebeurt dan op een knop in de shadow
  root en komt binnen als *composed* click, die React's `onClick` niet levert.
  Bind die listener zelf.
- **Een kaart met eigen knoppen erin kan geen knop worden.** Een control in een
  knop is ongeldige HTML. Maak dan de titel het bedienbare element.
- **`aria-disabled` op een element dat geen `disabled` kent** is inert: de knop
  blijft volledig bedienbaar terwijl een schermlezer "uitgeschakeld" meldt.
  Bewaak de handler zelf.
- **Koppen vervangen door gestylede tekst** (`nldd-text weight="medium"` waar een
  `<h3>` stond) ziet er identiek uit en haalt de sectie volledig uit de
  schermlezer-navigatie. Grep je diff op verwijderde `<h2>`–`<h4>`.
- **Dubbele `<h1>`**: de titelbalk van de app-shell rendert meestal de h1 van de
  pagina. Een detailpagina die er zelf een toevoegt levert twee concurrerende
  koppen van niveau 1.
- **Selectie die alleen in kleur zit** faalt 1.4.1. Gebruik de eigen
  `current`/`checked` van het component, plus een tweede kanaal zoals een icoon.

Voeg je een kop-tag puur voor de semantiek toe (met de stijl van het component
erbinnen), zet dan een reset zodat de standaardgrootte en -marge van de browser
niet vechten met het component:

```css
h1:not(nldd-rich-text h1), h2:not(nldd-rich-text h2) /* … */ {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
```

## Controleer altijd tegen het pakket

Drie gewoonten die steeds tijd scheelden of kostten:

1. **Verzin nooit een token- of icoonnaam.** Grep het pakket. Een eerste gok als
   `--semantics-colors-success-graphic-base` bestond niet; de echte schaal is
   **Nederlands**: `--primitives-color-groen-500`, `-oranje-`, `-rood-`,
   `-lintblauw-`, `-paars-`, `-hemelblauw-`.
2. **Lees `custom-elements.json` voordat je aanneemt dat een attribuut
   bestaat.** Het is de bron van waarheid voor slots en attributen, en het
   documenteert gedrag dat je anders per ongeluk ontdekt (dat `disclosure` zijn
   `aria-expanded` van de ouderrij overneemt, dat `button` genegeerd wordt als
   `href` gezet is).
3. **Lees de dev-waarschuwingen van de componenten.** Die vertellen precies wat
   je verkeerd doet, in een `console.warn` die je in een testrun nooit ziet.
   Grep de dist-bestanden op `console.warn` als iets zich niet gedraagt.

## Ligt het aan het systeem, meld het dan

Vecht je met een component, dan is dat meestal verkeerd gebruik. Maar soms ligt
het aan het design system, en dan is een workaround de duurste oplossing die je
kunt kiezen.

Meld het als een component niet doet wat zijn eigen documentatie zegt, als een
attribuut in `custom-elements.json` staat en niets doet, als je in de shadow DOM
moet reiken voor iets gewoons, of als iets breekt na een upgrade zonder dat de
changelog het noemt. Zet er **de versie die je draait** bij: dat is het
belangrijkste veld, want een groot deel van wat consumenten als tekortkoming
rapporteren is in een latere release al opgelost.

**Een workaround lost jouw geval op en houdt de oorzaak in stand.** Erger: hij
wordt een fossiel. Wordt het onderliggende probleem gerepareerd, dan blijft jouw
omweg staan, met een test eronder, en niemand durft hem nog weg te halen omdat
niemand meer weet waarom hij er was.

Dat is echt gebeurd. Een consument schreef een helper die een wegwerp-childnode
toevoegde en meteen weghaalde, puur om een MutationObserver te porren, omdat een
foutmelding verborgen bleef nadat een veld in de DOM was verplaatst. De schade
was echt en stond in de docstring: *"the error text stays hidden forever."* Het
component in kwestie is later vervangen, en in die herbouw is precies dit geval
meegenomen. De helper draait nog steeds, en de test eronder ook.

Twee gewoonten die dat voorkomen:

- **Schrijf boven elke workaround waaróm het component het zelf niet kan, plus
  de versie waarop je dat vaststelde.** Lukt die zin niet, dan is het geen
  workaround maar smaak.
- **Loop bij elke upgrade je eigen omwegen langs.** De changelog vertelt wat er
  verandert, niet welke van jouw reparaties overbodig zijn geworden. Dat moet je
  zelf nagaan, en het is de enige manier waarop een fossiel weer verdwijnt.

Houd je een lijst bij van wat het systeem niet kan, noteer dan per punt de
versie waartegen je mat. Zonder dat wordt het een lijst die mensen blijven
citeren nadat hij niet meer waar is.

## Subagents inzetten

Parallelle agents werken goed voor het mechanische deel en slecht voor
oordeelswerk.

**Goed:** een bekende lijst aanroepplekken omzetten naar een vastgesteld
patroon; één dimensie van een grote diff reviewen; zoeken naar één specifieke
vorm van een defect.

**Verifieer elke bevinding zelf.** In deze migratie bevatten agentrapporten: een
bestand dat als getroffen werd genoemd maar de prop niet eens gebruikte, een
onjuiste claim dat een export dood was, en een "dit is prima" dat leunde op een
verouderd comment. Omgekeerd vond een agent de ernstigste bug van de hele PR
(de dode `onChange`), die ik dagen had gemist. Behandel rapporten als aanwijzing,
niet als conclusie, in beide richtingen.

**Geef agents de faalvormen mee, niet alleen de taak.** Een agent die hoort "zet
dit bestand om" levert plausibele kapotte code. Een agent die hoort "dit zijn de
zes manieren waarop deze bibliotheek stil faalt, zo verifieer je elk ervan,
verzin geen icoonnamen" levert werk dat je kunt vertrouwen.

**Wees expliciet over wat níet meegaat.** Graph-canvassen (reactflow en
vergelijkbaar) tekenen buiten de cascade en hebben geen componentequivalent. Zeg
dat, en zeg erbij dat het *chroom eromheen* wel in scope is. Dat onderscheid was
93 dode klassen waard.

## Comments: beschrijf de code, niet de migratie

De migratie staat in de git-geschiedenis. Die hoort niet in de broncode.

Schrijf in de tegenwoordige tijd, als eigenschap: "de dropdown stopt de native
`change` en zendt zijn eigen event uit, dus de listener zit op het element".
Niet: "dit was vroeger een onChange, wat elke select in de app brak".

Verwijder alles wat er alleen staat om een eerdere toestand te beschrijven, en
elk comment dat code uitlegt die er niet meer is. Incidentgetallen ("137
containers", "112 dode klassen") zijn oorlogsverhalen; die gaan eruit. Houd
getallen alleen als ze het huidige gedrag begrenzen ("accepteert alleen
spacer-uitgelijnde maten 16, 20, 24").

Doe dit als een bewuste ronde aan het eind. Het is meteen je laatste sweep op
restanten: dezelfde grep vindt achterhaalde beweringen, en ving in dit geval drie
plekken waar README en architectuurdocumentatie nog de oude stack noemden.

## Een volgorde die werkte

1. Installeren, componenten registreren, stylesheet importeren.
2. De vier checks bouwen. Van elk bewijzen dat hij faalt.
3. Het gedragsoppervlak van je bestaande pagina's vastleggen, vóór je iets
   omzet. Daarna is de oude pagina weg en heb je niets om tegen te meten.
4. De event-, value- en overlay-helpers schrijven, plus getypte JSX-bindings.
5. Vormgeving uit de markup halen als **eigen stap**: inline stijlen en
   `<style>`-blokken naar klassen, met een afdruk vooraf en achteraf als
   bewijs dat er niets veranderde. Pas daarna vervangen door componenten.
   Andersom betaal je het terug: een migratie die de CSS-opruiming als laatste
   deed, moest padding herstellen die onder de weggehaalde regels bleek te
   zitten.
6. Het oude CSS-framework **vroeg** weghalen en repareren wat dat blootlegt.
7. De app-shell omzetten (layout, navigatie, header), achter een vlag als de
   navigatie voor iedereen verandert.
8. Je eigen primitives herimplementeren (Button, Input, Select, Card) met
   behoud van hun API. Dat converteert de nette aanroepplekken in één klap.
9. Schermen omzetten, goedkoopste eerst, zodat het idioom zich zet waar een fout
   weinig kost.
10. Browser-sweep per pagina: nulbreedte, tab-stops, koppen, computed styles op
    alles wat op een tabel lijkt, plus het gedragsoppervlak tegen stap 3.
11. Je eigen workarounds langslopen: welke zijn overbodig geworden.
12. De commentronde.

Reken erop dat de verhouding rauwe markup je schatting bepaalt. In dit geval
stonden 292 rauwe `<button>` tegenover 61 `<Button>`: het herimplementeren van
de primitive converteerde een vijfde, de rest was handwerk op de aanroepplek.
Tel allebei voordat je iets belooft.
