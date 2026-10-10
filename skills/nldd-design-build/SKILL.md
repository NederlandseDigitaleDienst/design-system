---
name: nldd-design-build
description: "Bouw applicaties met de web components van het NLDD Designsysteem (@nldd/design-system, Nederlandse Digitale Dienst, Rijksoverheid). Triggers: @nldd/design-system, 'nldd-' tags, vragen over layout, sheets, popovers, modals, formulieren, toegankelijkheid, CSS-variabelen (tokens). Voor een versie verhogen: nldd-design-upgrade. NIET voor het ontwikkelen van het designsysteem zelf: die kennis zit niet in deze plugin maar in de repository, zie nldd-design-contribute."
metadata:
  type: reference
---

# NLDD Designsysteem: voor wie ermee bouwt

Je gebruikt deze skill als je een **applicatie** bouwt bovenop `@nldd/design-system`: de web component-bibliotheek van de Nederlandse Digitale Dienst (Rijksoverheid). Ben je bezig met het **ontwikkelen van het design system zelf** (nieuwe componenten, CSS-conventies), gebruik dan de repo-locale skills van de repository zelf, niet deze skill. Die reizen niet mee met de plugin; [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md) zegt hoe je erbij komt.

Twee plekken horen bij deze skill:

- [`patterns/`](patterns/): de basispatronen, dus hoe je componenten samenstelt tot een scherm dat een taak van de gebruiker afhandelt. Begin hier als je iets bouwt.
- [`examples/`](examples/): het pakket aan de praat krijgen, in platte HTML en in Vue 3.

De naslag staat apart, in `nldd-design`, want die geldt ook als je niets nieuws bouwt: de [componentreferentie](../nldd-design/reference.md) met elk `nldd-*` element en de icoonnamen, de [changelog](../nldd-design/changelog.md) en de [ontwerprichtlijnen](../nldd-design/design-guidelines.md).

De levende documentatie met visuele voorbeelden staat in [Storybook](https://nederlandsedigitaledienst.github.io/design-system/). De exacte types staan in de `.d.ts` bestanden van het pakket. Gebruik die twee als bron van waarheid voor detailvragen; deze skill leert je hoe je het systeem *goed* gebruikt.

Zet je een **bestaande** applicatie om naar dit systeem in plaats van een nieuwe te bouwen, gebruik dan de `nldd-design-migrate` skill. Die gaat over wat er bij zo'n omzetting stil misgaat en hoe je dat merkt.

## De visie: standaarden als gedrag, niet als kennis

Het uitgangspunt van dit systeem is dat een ontwikkelaar de Rijkshuisstijl, de toegankelijkheidseisen en het interactiegedrag van een overheidsinterface niet uit het hoofd hoeft te kennen. Die regels zitten ingebakken in de componenten. Wie een `nldd-button` plaatst, krijgt het juiste focusgedrag, de juiste kleurcontrasten, de juiste ARIA en het juiste toetsenbordgedrag mee, zonder er iets voor te doen. Toegankelijkheid en huisstijl worden zo gedrag in plaats van kennis die in iemands hoofd moet zitten.

Dat heeft één belangrijke consequentie voor jou: **als je tegen een component vecht, gebruik je het verkeerd.** De componenten dragen opzettelijk meningen. Werk ermee mee.

Kan een component iets niet wat het zou moeten kunnen, of is het kapot, dan is dat geen gebruiksfout maar een melding waard. [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md) zegt waar zo'n melding heen gaat en hoe je die opbouwt: het probleem eerst, de oplossing later.

Wat je vormgeeft is daarmee geen keuze van deze skill. Wanneer een sticky header mag, hoeveel chroom een scherm verdient, hoe je microcopy schrijft: dat staat in [`design-guidelines.md`](../nldd-design/design-guidelines.md), en dat is de enige bron. Lees die voordat je iets ontwerpt. Hier staat de mechaniek eronder.

### Componeer, herstijl niet

Gebruik componenten zoals ze zijn en stuur ze via hun attributen. Reik niet in de shadow DOM, override geen interne ARIA, plak geen klassen op childcomponenten.

- **Stuur via attributen, niet via interne overrides.** Wil je een rustiger of nadrukkelijker component? Kies een ander component in plaats van de ARIA of de stijl van het huidige te verbouwen. De `nldd-banner` zegt het zelf in zijn documentatie: "if you need a quieter component, pick a different one rather than overriding the banner's ARIA."
- **Reik alleen in de shadow DOM als het echt moet.** Het is een ontsnappingsluik, geen route, en meestal is er een attribuut of een methode die hetzelfde doet. Zie "Focussen doe je op het component".

## Installeren en bootstrappen

```bash
npm install @nldd/design-system
```

Importeer de componenten en de stijlen één keer, bij het opstarten van je app:

```js
import '@nldd/design-system';          // registreert alle nldd-* componenten
import '@nldd/design-system/styles';   // CSS-variabelen + Rijksoverheid-fonts
```

### Favicon

Het pakket levert het rijkswapen op een lintblauw vlak mee, als `@nldd/design-system/favicon.svg`. Kopieer het bestand naar de map die je statisch serveert en verwijs ernaar:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/touch-icon.png">
```

Het pakket levert allebei: `@nldd/design-system/favicon.svg` voor de tab, en `@nldd/design-system/touch-icon.png` voor het icoon op het beginscherm, want daar accepteert Safari geen SVG. Die PNG is 180 bij 180, de maat die Apple vraagt.

Het logo, het lint en de huisstijlkleuren vallen onder dezelfde voorwaarden als RijksSans: uitsluitend voor de Rijksoverheid en partijen die in haar opdracht werken. Het rijkswapen mag alleen samen met het lint worden gebruikt. Zie [`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md).

RijksSans is uitsluitend bestemd voor publicaties van de Rijksoverheid en voor partijen die in opdracht van het Rijk werken. De voorwaarden staan in [`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md). Bouw je iets daarbuiten, dan kun je 2 kanten op:

1. **Importeer `@nldd/design-system/styles/system-font`** in plaats van `/styles`. Dezelfde stylesheet zonder de `@font-face`-regels. Beide familie-stacks eindigen op een systeemfont, dus de browser valt er vanzelf doorheen en je hoeft niets te overschrijven.
2. **Blijf bij `/styles` en overschrijf de 2 familievariabelen.** Een `@font-face` waar niets naar verwijst wordt niet gedownload, dus het font komt de pagina niet binnen.

   ```css
   :root {
     --primitives-font-family-sans-serif: 'Jouw font', system-ui, sans-serif;
     --primitives-font-family-monospace: ui-monospace, Menlo, Consolas, monospace;
   }
   ```

Serveer je de fonts zelf, bijvoorbeeld vanuit een statische site die alleen zijn eigen map publiceert, haal ze dan in je buildstap uit het pakket: `import.meta.resolve('@nldd/design-system/fonts/RijksSansWeb-Regular.woff2')` geeft het pad, en zo ook voor de andere bestanden in die map. Zet geen kopie in je eigen repository; dan blijft `NOTICES.md` de enige plek voor de voorwaarden.

De eerste weg is de schoonste: dan zit het font niet eens in je CSS. De tweede is een uitzondering op wat hieronder over variabelen staat, en die staat hier omdat er geen attribuut voor is. Voor kleur, ruimte en typografie is dat er wel.

Voor tree-shaking kun je ook per component importeren via de subpath-export (bijv. `@nldd/design-system/button`). Frameworks die templates compileren, moeten `nldd-*` als custom elements herkennen (in Vue: `isCustomElement`).

De complete setups, inclusief de Vue-config en het per-component importeren, staan in [`examples/bootstrap-html.md`](examples/bootstrap-html.md) en [`examples/bootstrap-vue.md`](examples/bootstrap-vue.md).

### Een andere taal

De componenten zijn standaard Nederlands. Een interface in een andere taal zet de teksten één keer bij het opstarten, voor het hele pakket. Het pakket levert Amerikaans Engels mee:

```js
import { setTranslations } from '@nldd/design-system/translations';
import enUS from '@nldd/design-system/translations/en-US';

setTranslations(enUS);
```

Dat bereikt ook de componenten die een ander component zelf bouwt, zoals de laadindicator in een knop of de kalender in een datumveld. Een andere taal: kopieer `@nldd/design-system/translations/nl` en vertaal de teksten. Zet geen `translations`-property op elk element om de taal te wisselen; die property is voor een uitzondering op één plek.

Een key is taal, geen inhoud. Moet één knop iets anders zeggen dan een andere ("Aan het bewaren" in plaats van "Laden"), dan is dat een attribuut op dat element, zoals `loading-text`.

## CSS-variabelen

Alle visuele waarden in de componenten komen uit CSS-variabelen en niets is hardcoded. Zo werkt licht en donker, en zo blijft de huisstijl erin zitten. Voor jou is het vooral iets om van af te blijven: de variabelen zijn de bedrading van het systeem, geen publieke API. Ze worden hernoemd, samengevoegd en verwijderd wanneer een component daarom vraagt, en de changelog beschrijft zo'n wijziging vanuit dat component, niet vanuit jouw stylesheet. Gebruik je ze toch, dan is dat op eigen risico.

Stuur een component dus via zijn attributen. Ruimte stuur je met `nldd-container` en `nldd-spacer`, tekst met `nldd-title` en `nldd-rich-text`, en de kleuren komen uit de componenten zelf. Pak eerst een component, dan zit de huisstijl er al in en beweegt je app mee als het systeem verandert.

Wat je in de devtools ziet staan, is gelaagd:

| Laag | Prefix | Wat het is |
|------|--------|------------|
| **Primitives** | `--primitives-*` | Basiswaarden: kleur, spacing, typografie. Alle andere lagen komen hierop uit. |
| **Semantics** | `--semantics-*` | Betekenisvolle rollen: knoppen, controls, oppervlakken. |
| **Context** | `--context-*` | Communicatie tussen componenten (bijv. achtergrondkleur die doorcascadeert). |
| **Lokaal** | `--_{component}-*` | **Intern aan een component, zoals `--_button-background-color`. Raak deze niet aan.** |

Er is geen componentlaag om een component mee bij te stellen. Wil je er een anders, meld het dan; zie `nldd-design-contribute`.

Houd je daarna nog eigen CSS over voor iets dat geen component is, dan is een `--primitives-*` de minst slechte keus: beter dan een hardcoded waarde, en nog steeds voor eigen rekening. Twee dingen gaan daarbij het vaakst mis.

**Zet geen `light-dark()` om een primitive heen.** Elke kleur-primitive is zelf al een `light-dark()`-paar, en de schaal kantelt mee: stap 700 is donkere tekst in lichte modus en lichte tekst in donkere modus. Wikkel je die in nog een `light-dark()` met de gespiegelde stap (700 om 300), dan draai je twee keer om en houd je in beide schema's dezelfde kleur over: donkere tekst op een donkere achtergrond. Eén verwijzing volstaat.

`light-dark()` heb je alleen nodig voor kleuren die niet uit het palet komen, of wanneer je per schema bewust een ándere stap wilt (bijvoorbeeld 100 in licht en 150 in donker, voor iets meer contrast).

**Licht en donker.** Het hele palet is gebouwd op `light-dark()`, dus het thema volgt de CSS `color-scheme`. Standaard is dat de OS- of browservoorkeur. Wil je licht of donker forceren, zet dan `color-scheme: light` (of `dark`) op een root-element. Er is geen aparte thema-toggle-API op `nldd-app-view`.

## Gebruikspatronen

Bouw je iets, begin dan bij [`patterns/`](patterns/). Daar staat elk patroon uitgewerkt met zijn compositie, werkende code en het waarom, en [`patterns/README.md`](patterns/README.md) zegt per taak welk patroon je nodig hebt.

Er zijn drie bronnen en ze overlappen niet:

| Je vraag | Het antwoord staat in |
|---|---|
| Hoe zet ik deze componenten samen tot een scherm? | [`patterns/`](patterns/) |
| Wat doet dit component, en welke attributen, slots en events heeft het? | [`reference.md`](../nldd-design/reference.md) |
| Welke van deze keuzes is de goede? | [`design-guidelines.md`](../nldd-design/design-guidelines.md) |

Wat hieronder staat, hoort in geen van de drie thuis: het gaat telkens over meer dan één component tegelijk.

### Twee compositievormen, kies bewust

`nldd-app-view` is altijd de buitenste schil. Wat daarbinnen komt, hangt af van wat je bouwt:

| Vorm | Wanneer | Het patroon |
|---|---|---|
| **Applicatie** | Een scherm met panelen: editors, dashboards, beheerschermen. | [applicatie](patterns/application.md) |
| **Pagina** | Een website: een verticale stapel inhoud. | [home](patterns/home-page.md), [onderwerppagina](patterns/topic-page.md), [navigatiepagina](patterns/navigation-page.md), [contentpagina](patterns/content-page.md) |

Het verschil zit in de laag direct onder de app-view: een split view met een pagina per paneel, of één pagina met secties eronder. Die keuze maak je aan het begin, en achteraf terugdraaien is duur. Maak die keuze dus bewust.

### Overlays: sheet, modal of popover

Welke van de drie je pakt is een ontwerpkeuze, en die staat in [`design-guidelines.md`](../nldd-design/design-guidelines.md) ("Feedback en state"): werk dat zijn context nodig heeft in een sheet, de modal voor een beslissing zonder weg terug, de popover voor iets kleins dat aan één knop hangt. Hoe je ze samenstelt staat in [bewerken in een sheet](patterns/edit-in-a-sheet.md) en [onomkeerbare actie](patterns/irreversible-action.md).

Mechanisch werken ze alle vier hetzelfde, sheet, window, modal en popover, en dat is het enige wat je hier hoeft te weten: bind `open` aan je eigen toestand, luister naar `close`, en laat het element in de DOM staan. Mount je het pas op het moment dat het open moet, dan slaan de animaties over en verlies je wat er in het formulier stond. Het complete Vue-component staat in [`examples/bootstrap-vue.md`](examples/bootstrap-vue.md).

### Custom events lezen via `event.detail`

Componenten leveren hun waarde in `event.detail`, niet altijd op `event.target.value`. Lees defensief:

```js
function onInput(event) {
  const value = event.detail?.value ?? event.target?.value;
  // ...
}
```

### Focussen doe je op het component

Elk invoercomponent geeft de focus zelf door aan de control eronder, dus `field.focus()` is genoeg. Zoek niet zelf de native input op in de shadow root: dat werkt tot de interne structuur verandert, en dan is het stil kapot.

```js
root.querySelector('nldd-search-field')?.focus();
```

Kan iets echt niet via de API, dan is de shadow root een ontsnappingsluik en geen route. Meld het ook, want dan mist er iets: zie [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md).

### Spacing: `nldd-spacer` versus `nldd-container`

- **`nldd-container`** voor padding rond een regio en de layout van zijn kinderen (stack, rij, grid), met responsive `sm-` / `md-` / `lg-` varianten.
- **`nldd-spacer`** voor een kale verticale of horizontale ruimte tussen opeenvolgende, verschillende componenten. Ook per breakpoint instelbaar.

### Breakpoints

De grenzen zijn: `sm` ≤ 640px, `md` 641–1007px, `lg` ≥ 1008px. Het pakket exporteert deze waarden nog niet publiek, dus als je ze in JS nodig hebt (bijvoorbeeld om een popover anders te positioneren), hardcode ze in sync met deze bron. **Bekende beperking:** controleer bij een pakketupdate of er inmiddels wel een export is.

## Toegankelijkheid: wat je gratis krijgt, wat jij nog moet doen

De componenten leveren correcte ARIA, focusvolgorde, een zichtbare blauwe focusring, `forced-colors`-ondersteuning en `prefers-reduced-motion` af. De wettelijke lat is WCAG 2.1 AA (EN 301 549, verplicht onder het Besluit digitale toegankelijkheid overheid). Wat het systeem voor je regelt:

- Form fields koppelen label en input automatisch (geen handmatige `for`/`id`).
- Knoppen met een popup zetten zelf `aria-haspopup`; **jij houdt `expanded` bij** als de popup opent en sluit.
- Banners zetten zelf `role`/`aria-live` op basis van variant. Niet overschrijven.

Wat jij nog moet doen:

- Zorg voor een **skip-link** (`nldd-skip-link`, "Direct naar de inhoud") en een logische focusvolgorde in je eigen markup.
- Test op **toetsenbordbediening**, **200% zoom** en **400% herschaling zonder horizontale scroll**.
- Geef betekenisvolle `accessible-label`s waar je tekst weglaat (icon-only knoppen, geslotte inhoud).

## Upgraden naar een nieuwe versie

Draait je applicatie al op dit systeem en moet de versie omhoog, gebruik dan [`nldd-design-upgrade`](../nldd-design-upgrade/SKILL.md). Kort waarom het een eigen skill is: dit project brengt alles uit als patch, ook een breaking change, dus het versienummer zegt niet of een sprong veilig is. De changelog wel.

## Bron van waarheid

1. **[Storybook](https://nederlandsedigitaledienst.github.io/design-system/)**: levende voorbeelden en controls per component.
2. **`.d.ts` types in het pakket**: de exacte, actuele API.
3. **[`reference.md`](../nldd-design/reference.md)**: offline snelreferentie van alle elementen.
4. **[`patterns/`](patterns/)**: hoe je die elementen samenstelt, met het waarom erbij. De referentie zegt wat een component kan; een patroon zegt hoe je er een taak mee afhandelt.
5. **[`changelog.md`](../nldd-design/changelog.md)**: de release notes per versie. Raadpleeg dit als een attribuut, slot of gedrag pas vanaf een bepaalde versie bestaat, of om te zien wat er sinds jouw versie is veranderd.
6. **[`design-guidelines.md`](../nldd-design/design-guidelines.md)**: de interface- en ontwerpvoorkeuren van het systeem (invoer en formulieren, navigatie, feedback en state, copywriting, visuele hiërarchie, strategie). Dit is de canonieke bron voor *ontwerp*keuzes; raadpleeg het bij vormgeven, microcopy schrijven of een UI reviewen. Deze SKILL.md beschrijft de component-*mechaniek*, de guidelines beschrijven de keuzes erachter.

**Iconen.** `icon="…"`, op `nldd-icon` en op elk component dat een icoon rendert, accepteert namen uit een vaste set. De volledige lijst (iconen plus aliassen) staat onder "Iconen" in [`reference.md`](../nldd-design/reference.md); verzin geen naam, kies er een uit die set.

## Grenzen van deze skill

Deze skill gaat over het *gebruiken* van het designsysteem: welke componenten, welke patronen, welke visie. Wat erbuiten valt en je zelf invult vanuit je applicatie- en frameworkkeuzes: state-management en validatieregels, server-side foutafhandeling, routing, en het testen van je eigen app. Voor SSR/hydratie geldt de algemene web-componentenpraktijk (de componenten upgraden client-side; render geen kritieke inhoud uitsluitend in hun shadow DOM). De componenten zelf zijn los getest binnen het designsysteem; jouw app-tests schrijf je met je eigen testopstelling.

> Voor onderhouders: `reference.md`, `changelog.md` en `design-guidelines.md` zijn gegenereerd (uit respectievelijk de JSDoc van de componenten, de root-CHANGELOG en `src/docs/design-guidelines.mdx`). Draai `npm run generate:skill-docs` na een API-wijziging, release of wijziging in de ontwerprichtlijnen en commit het resultaat. Het zijn echte bestanden, geen symlinks: een plugin wordt naar een geïsoleerde cache gekopieerd waarbij symlinks buiten de plugin-map wegvallen.
