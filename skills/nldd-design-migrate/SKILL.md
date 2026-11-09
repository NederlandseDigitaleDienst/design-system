---
name: nldd-design-migrate
description: "Zet een bestaande frontend om naar @nldd/design-system: vanaf Tailwind, CSS modules, handgeschreven componenten, een statische sitegenerator (MkDocs), of een ander design system (NL Design System, ROOS van RVO). Triggers: 'migreren naar het design system', 'omzetten naar nldd', 'Tailwind eruit', 'van ROOS naar NLDD', 'converteren naar de Rijkshuisstijl-componenten'. Voor het bouwen van een nieuwe app: nldd-design-build. Voor een app die al op dit systeem draait en alleen een hogere versie nodig heeft: nldd-design-upgrade. Voor het ontwikkelen van het designsysteem zelf: die kennis zit in de repository, niet in deze plugin, zie nldd-design-contribute."
metadata:
  type: reference
---

# Een bestaande codebase omzetten naar het NLDD Designsysteem

De `nldd-design-build` skill leert je hoe de componenten werken. Deze skill gaat over iets anders: wat er misgaat als je een **bestaande** applicatie omzet, en hoe je dat merkt voordat je gebruikers het merken.

Alles hieronder geldt ongeacht waar je vandaan komt. Is je codebase specifiek, lees dan ook:

- [`from-tailwind.md`](from-tailwind.md): de compilervalstrik, de tokenbrug, botsende globale regels, iconen.
- [`from-react.md`](from-react.md): events die React niet ziet, helpers die na elke render opnieuw koppelen, en booleans die in React 18 altijd aan staan.
- [`from-another-design-system.md`](from-another-design-system.md): je draaide al op een componentbibliotheek (NL Design System, ROOS van RVO, of een eigen systeem). Verzonnen tokennamen, de donkere weergave als controle, en twee systemen naast elkaar.
- [`server-rendered.md`](server-rendered.md): HTML op de server met fragmentwissels (htmx, Turbo, Unpoly, LiveView). Wat een swap anders doet dan een paginalading, de nieuwe stack ernaast zetten, en wat vendoren van de bundel je oplevert en kost.
- [`static-site-generator.md`](static-site-generator.md): een site die uit Markdown wordt gebouwd (MkDocs, Hugo, Eleventy). De HTML omzetten in een build-hook, de bundel zonder bundler, en wat er zonder JavaScript overblijft.

De naslag die je bij een omzetting het hardst nodig hebt, staat in de skill `nldd-design`: de [componentreferentie](../nldd-design/reference.md) om te controleren of een attribuut of icoonnaam echt bestaat, en de [changelog](../nldd-design/changelog.md) om te zien wat er tussen jouw versie en de doelversie is veranderd.

Wat je in de componentdocumentatie kunt opzoeken staat hier niet in; wat hier staat heeft in echte migraties tijd gekost.

## Het doel: alles komt uit het systeem

Een migratie is af als de app geen eigen vormgeving meer heeft. Geen stylesheet van jezelf, geen `class` of `className`, geen `style`, geen `div` of `span` die iets opmaakt, geen hexkleur, geen eigen iconenset. Wat er staat, zijn `nldd-*`-componenten met attributen en slots, en waar je er een mist een component van jezelf. Dat is de definitie van klaar, en `nldd lint --pure` bewaakt hem vanaf de eerste dag.

Elke regel eigen CSS is een plek die je bij elke release zelf moet nalopen: een hernoemde variabele, een nieuw thema of een toegankelijkheidsfix in een component bereikt hem niet.

Kan het systeem iets niet wat je nodig hebt, dan is dat een gat in het systeem. Meld het via [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md). Zet geen eigen stijl op een `nldd-*`-component om het te laten doen wat het niet kan.

Mist er een heel component, dan mag je het zelf bouwen, met een eigen naam zonder `nldd-`. Dat hoeft geen omweg te zijn: misschien wil je er zelf de controle over houden, zodat het blijft meebewegen met je project. Vertel er wel over in je melding, dan kan er besloten worden of het een officieel NLDD-component wordt. Een eigen component valt buiten de zuiverheidscheck: zet de map met zijn stijlen in `exclude` van `.nldd-lint.json`. Zie [Geen eigen vormgeving](../nldd-design-build/SKILL.md#geen-eigen-vormgeving).

Voor een omweg op of om een `nldd-*`-component geldt: tot het gat is opgelost mag hij er staan, met een onderdrukking van de regel uit `pure` die drie dingen als reden draagt: de issuelink, de versie waarop je het vaststelde, en één zin waarom het component het zelf niet kan. Lukt die zin niet, dan is het smaak en hoort de omweg weg. De rest van deze skill verwijst naar deze regel.

## Het uitgangspunt: dit systeem faalt stil

Bijna elke fout die je kunt maken rendert niets, of iets dat er bijna goed uitziet. Zonder typefout en zonder falende test. Een deel schreeuwt wel: veel componenten waarschuwen in de console over een verkeerd samengestelde rij, een ontbrekend label of een icoonnaam die niet bestaat. Die waarschuwingen zitten alleen in een dev-build, dus draai je migratie in dev en houd de console open. Wat er niet in zit, is precies wat hieronder staat.

Bij een gewone migratie vertelt je compiler het wanneer je iets breekt. Hier niet, en je testsuite evenmin. Dat ene gegeven bepaalt de hele aanpak: je kunt niet omzetten-en-doorgaan. Je moet checks bouwen die de stilte hoorbaar maken, en je moet meten in een echte browser.

Deze fouten compileren allemaal, komen langs `tsc` en eslint, en doen niets:

| Fout | Wat je ziet |
|---|---|
| Component niet geregistreerd | Kinderen renderen ongestyled |
| Onbekende icoonnaam | Niets, al waarschuwt een dev-build in de console |
| Niet-bestaande CSS-variabele | Niets |
| Niet-bestaande variabele **met** hex-fallback | De fallback rendert; de token is versiering en donkere modus bevriest |
| `className` in plaats van `class` op een rauw element | De klasse doet niets |
| React `onChange` op een geslot native control | De handler draait nooit |
| `disabled={busy}` in React 18, zonder de JSX-typen van het pakket | De knop staat altijd uit, ook als `busy` false is |
| Breedteloze container om een kind dat zijn ouder meet | Nul pixels, hoogte blijft |

## Bouw de checks vóór je iets omzet

Doe dit in de eerste uren, niet aan het eind. Elk van deze ving echte schade die niets anders zag:

1. **Zuiverheidscheck.** Zet de groep `pure` van `nldd lint` aan in `.nldd-lint.json` (`"rules": { "pure": "error" }`) en accepteer wat er nu staat met `npx @nldd/design-system lint --update-baseline`. Hij meldt elke `class` of `className`, elke `style`, kale HTML die opmaakt (`div`, `p`, `h2`, `button`, `img` en verwanten) en elk eigen stylesheet, ook een CSS-bestand en een `<style>`-blok in Vue. Kale HTML die een component zelf opmaakt, zoals de `<select>` in `nldd-dropdown` of de tekst in `nldd-rich-text`, laat hij staan; welke per component staat in de [referentie](../nldd-design/reference.md) onder "Plain HTML it styles". De baseline telt per bestand en faalt zodra een telling stijgt. Draai `--tighten-baseline` in de commit waarin een bestand schoner wordt: dat verlaagt de telling en voegt nooit iets toe, en de samenvatting zegt het als de baseline ruimer is dan nodig. `--update-baseline` accepteert ook wat nieuw is, dus dat hoort niet meer in een gewone commit. Wat bewust blijft tot een issue is opgelost, krijgt een onderdrukking volgens de regel voor een omweg hierboven (`nldd-lint-disable-next-line style-no-own -- <issue>`), niet een plek in de baseline. Klaar is een lege baseline. Een iconenbibliotheek of meldingenbibliotheek ziet de linter niet, want die zijn componenten van de app: controleer je afhankelijkheden daar zelf op.
2. **Registratiecheck.** Met de autoloader valt deze weg, en in een dev-build meldt de console elke `nldd-*`-tag die na een paar seconden nog niet geregistreerd is. Schrijf je de imports zelf uit, vergelijk dan elk gebruikt `nldd-*` element met wat er werkelijk geïmporteerd is. Lees daarbij het *template*-bestand van de ouder, niet alleen het componentbestand: `token-field.js` importeert alleen `menu.js`, terwijl de import die `nldd-token` registreert in `token-field.template.js` zit.
3. **Markupcheck.** Draai `npx @nldd/design-system lint`, zie [`nldd-design-validate`](../nldd-design-validate/SKILL.md). Hij controleert elementen, attributen, slots en icoonnamen. Icoonnamen zijn een gesloten set; een verzonnen naam rendert niets.
4. **Tokencheck.** Valideer elke `var(--primitives-*|--semantics-*)` tegen de echte tokens in `node_modules/@nldd/design-system/dist/css/*.css`. **Vlag ook letterlijke hex-kleuren**, en `var(--x, #aabbcc)` het hardst: de fallback maakt een verkeerde tokennaam onzichtbaar.
5. **Klassencheck.** Elke klasse die de app nog rendert moet een regel achter zich hebben, én elke regel in je oude CSS moet een gebruiker hebben. Beide richtingen.
6. **Gedragscheck.** De vijf hierboven toetsen of je *code* klopt. Geen van ze merkt dat er iets uit je interface verdwenen is. Zie de volgende sectie.

De token- en klassencheck zijn steigers. Ze bewaken de CSS die er tijdens de omzetting nog staat, en verdwijnen samen met het laatste stylesheet. De groep `pure` blijft aan, want hij houdt de app daarna puur. Zet hem in de config en niet alleen als `--pure` in CI: dan doet een lokale `--update-baseline` hetzelfde als CI.

Hang de eerste vijf in pre-commit **en** in CI. Zorg dat je lokale hook hetzelfde commando draait als CI: een hook op `tsc --noEmit` terwijl CI `tsc -b` draait laat kapotte commits er stelselmatig door.

Bewijs bij elke check dat die faalt. Zet er een opzettelijke fout in, kijk of die niet-nul afsluit, haal die weg. Een check die alleen ooit slaagt is geen check. Doe dat ook voor elk faalpad apart: een check met twee soorten bevindingen heeft twee uitgangen, en er is er altijd één die je nooit hebt zien afgaan.

Herhaal die proef nadat iemand aan de check zelf heeft gezeten. Een check die tijdens de migratie een overgangsstand kent ("waarschuw zolang het oude systeem er nog is") houdt na de omzetting een tak over die nooit meer bereikt wordt, en die tak kan de hele check stilzetten. Haal zulke takken weg zodra ze dood zijn, en meet daarna opnieuw dat er iets rood van wordt.

## Meet wat een pagina DOET, niet hoe die eruitziet

De checks hierboven vangen code die niet klopt. Ze vangen niet dat een keuzelijst weg is. Een omzetting mag een pagina er anders uit laten zien; wat niet mag is de pagina minder laten **doen**, en juist dat faalt stil. In één migratie verdwenen onderweg een keuzelijst, een knop die een venster opende en de invoervelden van een filter. Geen van drieën gaf een foutmelding.

Haal daarom uit de gerenderde HTML wat een pagina kan, en leg dat per route vast in een bestand:

- **bestemmingen**: `href`, form `action`, en elk attribuut dat op `-href` eindigt, want componenten schrijven die zelf;
- **fragment-adressen**: de attributen waarmee je stack HTML ophaalt;
- **aangeroepen functies**: de namen uit `onclick`, `onchange`, `oninput`, `onsubmit`;
- **besturingselementen met een naam**: `input`, `select`, `textarea`, plus een expliciete lijst componenten die écht een formulierveld zijn;
- **id's** waar script of een fragmentwissel aan kan hangen.

Twee ontwerpkeuzes maken het verschil tussen een poort die werkt en een die niemand meer leest:

**Faal alleen op wat verdwijnt.** Iets erbij is nieuw werk; iets dat weg is, is bijna altijd een ongeluk. Die asymmetrie is wat de poort bruikbaar houdt tijdens een migratie, waarin pagina's per definitie veranderen.

**Negeer alles wat vormgeving is.** Tagnamen, klassen, teksten en stylesheets tellen niet mee: dat is precies wat mag veranderen. Normaliseer daarnaast wat per verzoek of per omgeving verschilt (CSRF-waarden, cache-brekers, UUID's in paden, het basispad waaronder de site draait) en laat id's vallen die op `-label`, `-help` of `-error` eindigen: die maakt `nldd-form-field` zelf bij om een veld aan zijn label te knopen. Ze zijn interne bedrading, geen gedrag. Zonder die twee filters piept de poort altijd, en een poort die altijd piept houdt niemand in de gaten.

Het basispad is de variant die je pas in CI ziet. Absolute links bevatten het pad van de omgeving, en een preview van een pull request draait onder een ander pad dan productie: de poort is lokaal groen en faalt op elke preview.

Zo'n meetlat is klein: 150 regels met alleen een HTML-parser en reguliere expressies, zonder afhankelijkheden.

### Een poort die de verkeerde bron leest is erger dan geen poort

Toets tegen het artefact dat je uitlevert, niet tegen documentatie of een handgeschreven lijst. Eén project liet zijn iconentoets jarenlang een JSON-lijst lezen: de poort stond groen terwijl er 37 lege plekken in de interface stonden, omdat de lijst 327 namen kende en de bundel er 271 had.

> Een poort die de verkeerde bron leest geeft je het gevoel dat het gedekt is. Zonder poort had iemand die lege knoppen gevonden bij het kijken.

Lees icoonnamen dus uit het pakket, en neem de aliassen mee: namen als `search` en `edit` verwijzen naar een echt icoon en renderen gewoon, dus een poort die alleen bestandsnamen kent noemt ze ten onrechte onbekend. Onder een statische poort hoort bovendien een browsermeting, want een lijst blijft een aanname over wat de browser doet.

### Een verbouwing bewijs je met twee afdrukken

Wil je iets veranderen zonder dat het er anders uitziet (een eigen knop vervangen door `nldd-button`, het oude CSS-framework weghalen), dan zegt een unittest daar niets over. Maak in plaats daarvan een afdruk op de basiscommit, een op je werk, en vergelijk:

```
git worktree add /tmp/basis <basis-commit>
(cd /tmp/basis/... && <je snapshot-script> /tmp/snap-basis)
<je snapshot-script> /tmp/snap-nu
diff -ru /tmp/snap-basis /tmp/snap-nu
```

Leg per pagina twee dingen vast: de DOM na het laden (genormaliseerd) en een screenshot. De DOM-afdruk is de scherpe vergelijking, want een diff wijst de regel aan; de screenshot vangt wat de DOM niet laat zien, zoals vormgeving die van plaats verschoven is. Geen baseline in de repo betekent ook geen goedkeuringsstap die stilletjes verkeerd wordt afgetekend.

Normaliseer daarbij elk `id`, `for`, `aria-labelledby` en `aria-controls` met cijfers erin, anders piept elke diff op de bedrading die de componenten zelf bijmaken.

## Dode CSS is de stilste vorm van kapot

Wat je oude stijlsysteem ook was, de regel is dezelfde: een klasse of regel die na de omzetting niets meer doet, blijft compileren en blijft langs tsc en eslint komen. Je ziet het alleen aan het scherm, en pas als je erheen navigeert.

Daarom controleert de klassencheck uit de vorige sectie beide richtingen:

- **Klassen zonder regel.** De markup noemt iets dat nergens meer gedefinieerd is.
- **Regels zonder gebruiker.** Je oude CSS houdt regels over waarvan de aanroepplek is omgezet. Haal ze weg in dezelfde commit als de omzetting, niet in een opruimronde later.

Zoek daarbij verder dan het markup-attribuut. Klassen overleven het langst in lookup-tabellen (`Record<Status, string>` in je types-bestand), in ternaries en in template literals: niets daaraan ziet eruit als markup. Scan dus ook `.ts`, niet alleen `.tsx`.

En sluit nooit een heel bestand uit van de check. Een uitsluiting op bestandsnaam voor graph-views ("die klassen zijn van de graph-bibliotheek") verborg 112 dode klassen over zes bestanden, waaronder een datatabel die als kale HTML rendeerde. Sluit uit op klassenaam, en alleen voor de handvol namen die een externe bibliotheek echt bezit.

### Sommige regels dragen gedrag, geen opmaak

Inventariseer vóór je Tailwind of je globale CSS weghaalt welke regels iets *doen*. De gevaarlijke zijn de regels achter een instelling van de gebruiker die via een data-attribuut op `<html>` werkt: `[data-contrast="high"] a { text-decoration: underline }`, of `[data-show-actions] .row-actions { opacity: 1 }` voor wie acties altijd in beeld wil. Haal je het bestand weg, dan blijft de schakelaar in de instellingen staan, schrijft hij zijn attribuut nog steeds, en verandert er niets. De gedragsmeting hierboven ziet het niet, want elke link en elke knop is er nog.

Zoek dus in de CSS die weggaat op selectors met `[data-`, `:root[` en `html[`, en op `@media (prefers-*)`. Elke treffer krijgt een eigen plek in het nieuwe systeem of wordt bewust geschrapt, samen met de instelling die erbij hoort. Een instelling die niets meer doet hoort niet in de interface te blijven staan.

Kom je van Tailwind, lees dan [`from-tailwind.md`](from-tailwind.md): daar zit een extra valstrik, omdat de compiler regels verzint voor klassen die nergens bestaan.

## Importeer per subpad

`import '@nldd/design-system'` registreert elk component, en dat komt allemaal in de eerste download. In een React-app met Vite was dat 2,8 MB JavaScript. Importeer per bestand alleen de subpaden die dat bestand gebruikt (`@nldd/design-system/button`, `@nldd/design-system/sheet`); in dezelfde app zakte de eerste lading daarmee naar 1,6 MB (384 kB gzip).

De hoofdingang importeert dezelfde modules als de subpaden, dus een overgebleven `import '@nldd/design-system'` naast losse subpaden kost alleen downloadgrootte, geen tweede registratie.

Met de hand bijhouden welk bestand welke subpaden nodig heeft, houdt niemand vol. De eenvoudigste uitweg is de autoloader (`import '@nldd/design-system/autoloader'`, zie "Installeren en bootstrappen" in [`nldd-design-build`](../nldd-design-build/SKILL.md)): die laadt elk component zodra het op de pagina komt, en een importlijst is er dan niet. Wil je de imports toch uitschrijven, genereer ze dan uit `custom-elements.json`: lees per bestand de `nldd-*`-tags, zoek per tag de module die hem definieert, en schrijf de importregels. Geef het script een `--check`-stand die faalt als de imports niet kloppen, en draai die in CI. Dat is dan meteen je registratiecheck. Elke tag heeft een subpad met de naam van zijn module, ook de onderdelen van `menu`, `toolbar` en `kanban` (`@nldd/design-system/menu-item`, `@nldd/design-system/kanban-column`). Een klasse, zoals `NLDDNotification` voor zijn statische `show()`, importeer je uit hetzelfde subpad als de registratie.

## Events: wat een component zelf uitzendt

Een component met een eigen control in zijn shadow root, zoals `nldd-text-field` met zijn input, stopt de native `change` en zendt een eigen `CustomEvent` uit vanaf de host. `close` op sheets, popovers en modals heeft `bubbles: false`, net als de `close` van een native `<dialog>`. `nldd-dropdown` is anders: de `<select>` is van jou en zijn native `change` gaat gewoon door. Een framework dat luistert op het native control, of dat events vanaf de root delegeert, krijgt daardoor niets binnen, en een handler die nooit draait geeft geen fout. Luister op het `nldd-*`-element zelf, naar het event dat het component documenteert.

Kom je van React, lees dan [`from-react.md`](from-react.md): daar staan de helpers die het oplossen.

## Layout: instorten tot nul breedte

Drie vormen om te kennen:

- **`nldd-container` in een eigen element dat zijn breedte van de inhoud haalt,** zoals een `div` met `display: inline-flex`, `width: fit-content` of een float. De container is een query container op inline-size, en zo'n container telt voor zijn ouder niet mee met de breedte van zijn inhoud: hij meet 0 breed. De tekst erin breekt dan na elk woord en de pagina wordt een smalle, hoge kolom. In een `nldd-container width="fit-content"` regelt de container dat zelf; in een eigen element niet, en dat is een reden te meer om dat element weg te laten.
- **Het omgekeerde.** Een container zonder breedte kan zijn buur uithongeren: een badge-kolom groeide tot 926px en hield de naam ernaast op nul.
- **Een rij die een lange naam niet laat krimpen.** Een lange naam claimt de hele rij en duwt de rest van het scherm af. Krimpt een component niet onder zijn inhoud, dan is dat een melding, met een omweg volgens de regel bovenaan.

Spoor dit op in de browser, niet door te lezen. Loop na elke pagina de DOM langs op elementen met breedte 0 die wel inhoud hebben, en op kinderen waarvan de rechterrand buiten hun ouder valt.

## Meet in de browser, en meet het juiste

Code lezen vertelt je wat je bedoelde. Alleen de DOM vertelt wat er gebeurde.

Drie meetvalstrikken:

- **"Niets rendert op nul pixels" is niet hetzelfde als "alles werkt."** Een kruistabel rendeerde op volle grootte met `border-collapse: separate`, een sticky header op `position: static` en nul randen: zichtbaar, met afmetingen, en volledig ongestyled. De nulbreedte-sweep was al die tijd schoon. Vermoed je verlies van styling, controleer dan *computed styles* (`borderCollapse`, `position`, `backgroundColor`), geen afmetingen.
- **Gesloten dialogs vervuilen elke query.** `document.querySelectorAll('h1')` gaf op één pagina veertien resultaten, waarvan dertien uit ongeopende modals en datumkiezers in shadow roots. Filter op een niet-lege bounding box voordat je iets concludeert over koppen, focusbare elementen of duplicaten.
- **Een tab die niet tekent, meet een pagina die niet af is.** Gedrag dat op `requestAnimationFrame` wacht draait niet in een verborgen tab of een venster op de achtergrond. `nldd-top-navigation-bar` schakelt zo naar zijn compacte vorm op smalle breedtes, dus een breedte-sweep in zo'n tab meldt overloop die een echte browser niet heeft. Controleer `document.visibilityState` voordat je een meting gelooft, en wacht in je meetscript niet zelf op een frame: dat komt daar nooit.

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

Tel ook het aantal tab-stops per pagina, voor en na. Zakt een pagina van 150 naar 6, dan heb je bedieningselementen in versiering veranderd.

## Toegankelijkheid is waar deze migratie je te schande zet

De hele rechtvaardiging voor dit systeem is WCAG 2.1 AA en EN 301 549. Een toegankelijkheids*regressie* is daarmee de pijnlijkste uitkomst, en die maak je makkelijk:

- **Een kaart met een pointer-cursor is geen knop.** Een `hoverable`-prop die alleen `cursor: pointer` zet geeft muisgebruikers een affordance en toetsenbordgebruikers niets: geen tab-stop, geen rol, niets aangekondigd. Gebruik het echte `button`-attribuut van het component plus een `accessible-label`. Let op: de activatie gebeurt dan op een knop in de shadow root en komt binnen als *composed* click, die React's `onClick` niet levert. Bind die listener zelf.
- **Een kaart met `href` haalt zijn naam niet uit zijn inhoud.** De link is een leeg anker dat over de kaart ligt, dus een `nldd-title` erin benoemt hem niet. Zonder `accessible-label` meldt axe `link-name` (serious), één keer per kaart. Het component waarschuwt hiervoor in de console, maar alleen in een dev-build; laad je `nldd.min.js`, dan zie je niets (vastgesteld op 0.8.93).
- **Een kaart met eigen knoppen erin kan geen knop worden.** Een control in een knop is ongeldige HTML. Maak dan de titel het bedienbare element.
- **`aria-disabled` op een element dat geen `disabled` kent** is inert: de knop blijft volledig bedienbaar terwijl een schermlezer "uitgeschakeld" meldt. Bewaak de handler zelf.
- **Koppen vervangen door gestylede tekst** (`nldd-text weight="medium"` waar een `<h3>` stond) ziet er identiek uit en haalt de sectie volledig uit de schermlezer-navigatie. Grep je diff op verwijderde `<h2>`–`<h4>`.
- **Dubbele `<h1>`**: de titelbalk van de app-shell rendert meestal de h1 van de pagina. Een detailpagina die er zelf een toevoegt levert twee concurrerende koppen van niveau 1.
- **Selectie die alleen in kleur zit** faalt 1.4.1. Gebruik de eigen `current`/`checked` van het component, plus een tweede kanaal zoals een icoon.

Een kop is een `nldd-title` met `heading-level`: de titel rendert de kop zelf, zonder marge en in zijn eigen grootte. Is de titel meer dan tekst, zoals een link, zet dan je eigen `<h2>` met de `<a>` erin in het standaardslot van `nldd-title`: de titel maakt die kop op, en de link hoort erbij. Een kale kop daarbuiten heeft een CSS-reset nodig, en dat is eigen opmaak.

## Omzetten is geen ontwerpen

Een omzetting die alle checks haalt, ziet er daarmee nog niet goed uit. Na een volledige omzetting van een React-app stond alles op de goede plek in de goede componenten, en toch was de hiërarchie zoek: elke pagina had een andere titelmaat, overal stonden kaders, en de gekozen optie in een formulier trok meer aandacht dan de knop om te versturen. Het meeste vond een aparte ronde die alleen naar de visuele hiërarchie keek, met een reviewer die zelf niets had omgezet. Plan die ronde als eigen stap: wie de omzetting deed, ziet wat er bedoeld was.

In die ronde leverden deze punten het meeste op. De regels zelf staan elders, hier alleen waar je ze vindt:

- De paginatitel in het `header`-slot van de eerste sectie, op elke pagina gelijk: [`page-structure`](../nldd-design-build/patterns/page-structure.md).
- Navigatie tussen pagina's met `nldd-tab-bar navigation` en een `href` per item; een `nldd-segmented-control` kiest uit een vaste set ([ontwerprichtlijnen](../nldd-design/design-guidelines.md#invoer-en-formulieren)).
- Een kaart met knoppen erin is geen link; zie de kaarten onder "Toegankelijkheid" hierboven.
- Terughoudend met kaders en gekleurde vlakken: een lijst, een lege stand of een los getal heeft er meestal geen nodig ([ontwerprichtlijnen](../nldd-design/design-guidelines.md#visueel-en-layout)).
- Geen knoppen die uit staan ([ontwerprichtlijnen](../nldd-design/design-guidelines.md#invoer-en-formulieren)).

## Testen zonder backend

Hang een lokale ontwikkelomgeving nooit aan productie, ook niet met een publieke anon-sleutel die "toch alleen kan lezen". Een testscript dat een formulier invult, doet dat dan op echte gegevens. Wat werkte voor browsertests en screenshots:

1. Zet nepgegevens in `localStorage` voordat de app laadt (in Playwright met `context.add_init_script`), zodat de app opstart met een gevulde stand.
2. Breek in Playwright elk verzoek af dat niet naar localhost gaat (`context.route("**/*", ...)` met `route.abort()` voor alles daarbuiten). Een vergeten aanroep naar buiten faalt dan zichtbaar in plaats van stil productie te raken.
3. Doe een ingelogde sessie na door de module die de sessie levert te herschrijven terwijl de devserver hem serveert, alleen in de testbrowser (`page.route` op het pad van die module, met een vervangende body). De app zelf heeft dan geen testmodus nodig.

Bewijs daarnaast dat je screenshotscript de donkere modus echt aanzet: `color_scheme="dark"` op de context, en lees in de pagina `getComputedStyle(document.documentElement).colorScheme` terug voordat je een screenshot gelooft. Een `data-scheme` op `<html>` gaat voor de voorkeur van de browser, dus `matchMedia` alleen zegt niet genoeg. Zonder die controle meldden meerdere testrondes ten onrechte dat de donkere modus kapot was, terwijl het script hem nooit had aangezet.

## Controleer altijd tegen het pakket

Drie gewoonten die steeds tijd scheelden of kostten:

1. **Verzin nooit een token- of icoonnaam.** Grep het pakket. Een eerste gok als `--semantics-colors-success-graphic-base` bestond niet; de echte schaal is **Nederlands**: `--primitives-color-groen-500`, `-oranje-`, `-rood-`, `-lintblauw-`, `-paars-`, `-hemelblauw-`.
2. **Lees `custom-elements.json` voordat je aanneemt dat een attribuut bestaat.** Het is de bron van waarheid voor slots en attributen, en het documenteert gedrag dat je anders per ongeluk ontdekt (dat `disclosure` zijn `aria-expanded` van de ouderrij overneemt, dat `button` genegeerd wordt als `href` gezet is). De manifest volgt de documentatie van het component en kan achterlopen op wat het rendert: in 0.8.93 ontbraken de slots `global` en `utility` van `nldd-top-navigation-bar`. Keurt je markupcheck iets af dat in Storybook gewoon zo staat, dan beslist het template in `dist/components/`, en is het gat een melding waard.
3. **Lees de dev-waarschuwingen van de componenten.** Die vertellen precies wat je verkeerd doet, in een `console.warn` die je in een testrun nooit ziet. Grep de dist-bestanden op `console.warn` als iets zich niet gedraagt.

## Ligt het aan het systeem, meld het dan

Vecht je met een component, dan is dat meestal verkeerd gebruik. Maar soms ligt het aan het designsysteem, en dan is een workaround de duurste oplossing die je kunt kiezen.

Meld het als een component niet doet wat zijn eigen documentatie zegt, als een attribuut in `custom-elements.json` staat en niets doet, als je in de shadow DOM moet reiken voor iets gewoons, of als iets breekt na een upgrade zonder dat de changelog het noemt. Zet er **de versie die je draait** bij: dat is het belangrijkste veld, want een groot deel van wat consumenten als tekortkoming rapporteren is in een latere release al opgelost.

**Een workaround lost jouw geval op en houdt de oorzaak in stand.** Erger: die wordt een fossiel. Wordt het onderliggende probleem gerepareerd, dan blijft jouw omweg staan, met een test eronder, en niemand durft de omweg nog weg te halen omdat niemand meer weet waarom die er was.

Dat is echt gebeurd. Een consument schreef een helper die een wegwerp-childnode toevoegde en meteen weghaalde, puur om een MutationObserver te porren, omdat een foutmelding verborgen bleef nadat een veld in de DOM was verplaatst. De schade was echt en stond in de docstring: *"the error text stays hidden forever."* Het component in kwestie is later vervangen, en in die herbouw is precies dit geval meegenomen. De helper draait nog steeds, en de test eronder ook.

Twee gewoonten die dat voorkomen:

- **Zet bij elke workaround wat de regel voor een omweg bovenaan vraagt:** de issuelink, de versie en waarom het component het zelf niet kan.
- **Loop bij elke upgrade je eigen omwegen langs.** De changelog vertelt wat er verandert, niet welke van jouw reparaties overbodig zijn geworden. Dat moet je zelf nagaan, en het is de enige manier waarop een fossiel weer verdwijnt.

Houd je een lijst bij van wat het systeem niet kan, noteer dan per punt de versie waartegen je mat. Zonder dat wordt het een lijst die mensen blijven citeren nadat die niet meer waar is.

## Subagents inzetten

Parallelle agents werken goed voor het mechanische deel en slecht voor oordeelswerk.

**Goed:** een bekende lijst aanroepplekken omzetten naar een vastgesteld patroon; één dimensie van een grote diff reviewen; zoeken naar één specifieke vorm van een defect.

**Verifieer elke bevinding zelf.** In deze migratie bevatten agentrapporten: een bestand dat als getroffen werd genoemd maar de prop niet eens gebruikte, een onjuiste claim dat een export dood was, en een "dit is prima" dat leunde op een verouderd comment. Omgekeerd vond een agent de ernstigste bug van de hele PR (de dode `onChange`), die ik dagen had gemist. Behandel rapporten als aanwijzing, niet als conclusie, in beide richtingen.

**Geef agents de faalvormen mee, niet alleen de taak.** Een agent die hoort "zet dit bestand om" levert plausibele kapotte code. Een agent die hoort "dit zijn de zes manieren waarop deze bibliotheek stil faalt, zo verifieer je elk ervan, verzin geen icoonnamen" levert werk dat je kunt vertrouwen.

**Wees expliciet over wat níet meegaat.** Graph-canvassen (reactflow en vergelijkbaar) tekenen buiten de cascade en hebben geen componentequivalent. Zeg dat, en zeg erbij dat het *chroom eromheen* wel in scope is. Dat onderscheid was 93 dode klassen waard.

## Comments: beschrijf de code, niet de migratie

De migratie staat in de git-geschiedenis. Die hoort niet in de broncode.

Schrijf in de tegenwoordige tijd, als eigenschap: "de dropdown stopt de native `change` en zendt zijn eigen event uit, dus de listener zit op het element". Niet: "dit was vroeger een onChange, wat elke select in de app brak".

Verwijder alles wat er alleen staat om een eerdere toestand te beschrijven, en elk comment dat code uitlegt die er niet meer is. Incidentgetallen ("137 containers", "112 dode klassen") zijn oorlogsverhalen; die gaan eruit. Houd getallen alleen als ze het huidige gedrag begrenzen ("accepteert alleen spacer-uitgelijnde maten 16, 20, 24").

Doe dit als een bewuste ronde aan het eind. Het is meteen je laatste sweep op restanten: dezelfde grep vindt achterhaalde beweringen, en ving in dit geval drie plekken waar README en architectuurdocumentatie nog de oude stack noemden.

## Een volgorde die werkte

1. Installeren, stylesheet importeren, en componenten registreren met de autoloader of per subpad.
2. De checks bouwen, met de groep `pure` en zijn baseline voorop. Van elk bewijzen dat die faalt.
3. Het gedragsoppervlak van je bestaande pagina's vastleggen, vóór je iets omzet. Daarna is de oude pagina weg en heb je niets om tegen te meten.
4. De event-, value- en overlay-helpers schrijven, en in een React-app de JSX-typen van het pakket importeren (`@nldd/design-system/react`).
5. Per scherm de vormgeving direct vervangen door componenten, en de CSS van dat scherm in dezelfde commit weghalen. Zet inline stijlen niet eerst om naar klassen: dat verplaatst eigen CSS in plaats van hem weg te halen. Bewaar ook geen opruimronde voor het eind. Een migratie die dat deed, moest padding herstellen die onder de weggehaalde regels bleek te zitten. Wat geen component kan, wordt een issue en een uitzondering in de code met de issuelink.
6. Inventariseren welke globale regels gedrag dragen. Daarna het oude CSS-framework **vroeg** weghalen en repareren wat dat blootlegt.
7. De app-shell omzetten (layout, navigatie, header), achter een vlag als de navigatie voor iedereen verandert.
8. Je eigen primitives herimplementeren (Button, Input, Select, Card) met behoud van hun API. Dat converteert de nette aanroepplekken in één klap.
9. Schermen omzetten, goedkoopste eerst, zodat het idioom zich zet waar een fout weinig kost.
10. Browser-sweep per pagina: nulbreedte, tab-stops, koppen, computed styles op alles wat op een tabel lijkt, plus het gedragsoppervlak tegen stap 3.
11. Een ronde op visuele hiërarchie, met een reviewer die niets heeft omgezet.
12. Je eigen workarounds langslopen: welke zijn overbodig geworden.
13. De commentronde.
14. Het laatste stylesheet weghalen, de token- en klassencheck mee. De baseline is leeg, en elke onderdrukking van een regel uit `pure` wijst naar een open issue.

Reken erop dat de verhouding rauwe markup je schatting bepaalt. In dit geval stonden 292 rauwe `<button>` tegenover 61 `<Button>`: het herimplementeren van de primitive converteerde een vijfde, de rest was handwerk op de aanroepplek. Tel allebei voordat je iets belooft.
