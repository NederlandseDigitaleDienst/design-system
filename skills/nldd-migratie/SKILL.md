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

Hang alle vier in pre-commit **en** in CI. Zorg dat je lokale hook hetzelfde
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
3. De event-, value- en overlay-helpers schrijven, plus getypte JSX-bindings.
4. Het oude CSS-framework **vroeg** weghalen en repareren wat dat blootlegt.
5. De app-shell omzetten (layout, navigatie, header), achter een vlag als de
   navigatie voor iedereen verandert.
6. Je eigen primitives herimplementeren (Button, Input, Select, Card) met
   behoud van hun API. Dat converteert de nette aanroepplekken in één klap.
7. Schermen omzetten, goedkoopste eerst, zodat het idioom zich zet waar een fout
   weinig kost.
8. Browser-sweep per pagina: nulbreedte, tab-stops, koppen, computed styles op
   alles wat op een tabel lijkt.
9. De commentronde.

Reken erop dat de verhouding rauwe markup je schatting bepaalt. In dit geval
stonden 292 rauwe `<button>` tegenover 61 `<Button>`: het herimplementeren van
de primitive converteerde een vijfde, de rest was handwerk op de aanroepplek.
Tel allebei voordat je iets belooft.
