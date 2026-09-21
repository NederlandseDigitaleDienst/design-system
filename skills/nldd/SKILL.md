---
name: nldd
description: "Bouw applicaties met de web components van het NLDD Designsysteem (@nldd/design-system, Nederlandse Digitale Dienst, Rijksoverheid). Triggers: @nldd/design-system, 'nldd-' tags, vragen over layout, sheets, popovers, modals, formulieren, toegankelijkheid, CSS-variabelen (tokens) of upgraden van dit systeem. NIET voor het ontwikkelen van het design system zelf (daarvoor: /component, /css)."
metadata:
  type: reference
---

# NLDD Designsysteem: voor wie ermee bouwt

Je gebruikt deze skill als je een **applicatie** bouwt bovenop
`@nldd/design-system`: de web component-bibliotheek van de Nederlandse
Digitale Dienst (Rijksoverheid). Ben je bezig met het **ontwikkelen van het
designsysteem zelf** (nieuwe componenten, CSS-conventies), gebruik dan
`/component` en `/css`, niet deze skill.

Twee bestanden horen hierbij:

- [`reference.md`](reference.md): gegenereerde snelreferentie van elk
  `nldd-*` element met zijn attributen, slots en events.
- [`examples/`](examples/): werkende bootstrap- en patroonvoorbeelden voor
  platte HTML, Vue 3, layout-patronen en een complete content-pagina.

De levende documentatie met visuele voorbeelden staat in
[Storybook](https://nederlandsedigitaledienst.github.io/design-system/). De exacte types staan in de
`.d.ts` bestanden van het pakket. Gebruik die twee als bron van waarheid voor
detailvragen; deze skill leert je hoe je het systeem *goed* gebruikt.

## De visie: standaarden als gedrag, niet als kennis

Het uitgangspunt van dit systeem is dat een ontwikkelaar de Rijkshuisstijl, de
toegankelijkheidseisen en het interactiegedrag van een overheidsinterface niet
uit het hoofd hoeft te kennen. Die regels zitten ingebakken in de componenten.
Wie een `nldd-button` plaatst, krijgt het juiste focusgedrag, de juiste
kleurcontrasten, de juiste ARIA en het juiste toetsenbordgedrag mee, zonder er
iets voor te doen. Toegankelijkheid en huisstijl worden zo gedrag in plaats van
kennis die in iemands hoofd moet zitten.

Dat heeft één belangrijke consequentie voor jou: **als je tegen een component
vecht, gebruik je het verkeerd.** De componenten dragen opzettelijk meningen.
Werk ermee mee.

### Inhoud eerst, chroom verdient zijn plek

Begin bij de inhoud. Navigatie, werkbalken en koppen zijn er om de inhoud te
dienen, niet andersom. Voeg ze toe wanneer ze een taak ondersteunen, niet als
standaard.

- **Vermijd sticky headers tenzij de inhoud ze nodig heeft.** Een sticky kop is
  alleen verantwoord als een sectie langer is dan het scherm en de gebruiker de
  context permanent nodig heeft. `nldd-page` ondersteunt een sticky header
  (`sticky-header`) en meet zelf de hoogte zodat de inhoud er niet onder
  schuift, maar de standaard is: geen sticky. Kies je er toch voor, verantwoord
  dan waarom.
- **Minimaliseer chroom.** Een platte pagina met inhoud is bijna altijd beter
  dan dezelfde inhoud verpakt in een modal, een sheet en een werkbalk. Voeg een
  laag pas toe als de taak erom vraagt. Let op de keerzijde: chroom of een
  control weghalen alleen om het beeld op te ruimen verschuift de complexiteit,
  het lost niets op. Het bredere principe (UI in de content verwerken, niet
  minder controls om het minder controls) staat in
  [`design-guidelines.md`](design-guidelines.md).

### Progressieve onthulling op smalle schermen

Het systeem verbergt secundaire inhoud zelf wanneer de ruimte krap wordt. Leun
daarop in plaats van ertegen te werken.

- **Split views verbergen panelen van rechts naar links.** `nldd-side-by-side-split-view`
  en `nldd-navigation-split-view` stellen automatisch in welke panelen verborgen
  worden als ze niet meer passen. **Links = hoogste prioriteit.** Plaats het
  belangrijkste paneel (de hoofdinhoud) links, secundaire panelen (inspector,
  detail) rechts. Die verdwijnen dan eerst.
- **Verberg, vouw niet dicht in een vaste hoek.** Op smalle schermen verhuist
  secundaire inhoud naar een sheet of popover in plaats van samengeperst te
  blijven.

### Componeer, herstijl niet

Gebruik componenten zoals ze zijn en stuur ze via attributen en variabelen. Reik
niet in de shadow DOM, override geen interne ARIA, plak geen klassen op
childcomponenten.

- **Stuur via attributen en CSS-variabelen, niet via interne overrides.** Wil je een
  rustiger of nadrukkelijker component? Kies een ander component in plaats van
  de ARIA of de stijl van het huidige te verbouwen. De `nldd-banner` zegt het
  zelf in zijn documentatie: "if you need a quieter component, pick a different
  one rather than overriding the banner's ARIA."
- **Reik alleen in de shadow DOM als het echt moet,** en doe het dan defensief
  (zie het patroon hieronder). Het is een ontsnappingsluik, geen route.

### Leun op native HTML waar het systeem dat doet

Het systeem vervangt native elementen niet, het verpakt ze. Dat geeft je de
volledige browser-toegankelijkheid en formulierafhandeling gratis.

- **`nldd-dropdown` is een visuele schil om een native `<select>`.** Geef een
  echte `<select>` als slotted child; de browser houdt de controle over
  toetsenbord, formulierwaarde en toegankelijkheid.
- **Voor links in CMS- of markdown-output gebruik je `nldd-rich-text` met een
  rauwe `<a>`,** niet `nldd-link`. `nldd-link` is voor UI-navigatie en
  actiegebieden, niet voor lopende tekst.

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

Het pakket levert het rijkswapen op een lintblauw vlak mee, als
`@nldd/design-system/favicon.svg`. Kopieer het bestand naar de map die je
statisch serveert en verwijs ernaar:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/touch-icon.png">
```

Het pakket levert allebei: `@nldd/design-system/favicon.svg` voor de tab, en
`@nldd/design-system/touch-icon.png` voor het icoon op het beginscherm, want
daar accepteert Safari geen SVG. Die PNG is 180 bij 180, de maat die Apple
vraagt.

Wil je een andere achtergrond, bijvoorbeeld je eigen huiskleur, kopieer de SVG
dan en verander de `fill` van het eerste pad. Een favicon laadt de browser los
van de pagina, dus CSS van je site komt er niet bij: een variabele of een class
werkt hier niet.

RijksSans is uitsluitend bestemd voor publicaties van de Rijksoverheid en voor
partijen die in haar opdracht werken. De voorwaarden staan in
[`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md). Bouw
je iets daarbuiten, dan kun je 2 kanten op:

1. **Importeer `@nldd/design-system/styles/system-font`** in plaats van
   `/styles`. Dezelfde stylesheet zonder de `@font-face`-regels. Beide
   familie-stacks eindigen op een systeemfont, dus de browser valt er vanzelf
   doorheen en je hoeft niets te overschrijven.
2. **Blijf bij `/styles` en overschrijf de 2 familievariabelen.** Een `@font-face`
   waar niets naar verwijst wordt niet gedownload, dus het font komt de pagina
   niet binnen.

   ```css
   :root {
     --primitives-font-family-sans-serif: 'Jouw font', system-ui, sans-serif;
     --primitives-font-family-monospace: ui-monospace, Menlo, Consolas, monospace;
   }
   ```

De eerste weg is de schoonste: dan zit het font niet eens in je CSS.

Voor tree-shaking kun je ook per component importeren via de subpath-export
(bijv. `@nldd/design-system/button`). Frameworks die templates compileren,
moeten `nldd-*` als custom elements herkennen (in Vue: `isCustomElement`).

De complete setups, inclusief de Vue-config en het per-component importeren,
staan in [`examples/bootstrap-html.md`](examples/bootstrap-html.md) en
[`examples/bootstrap-vue.md`](examples/bootstrap-vue.md).

## De vijf CSS-lagen

Alle visuele waarden komen uit CSS-variabelen; niets is hardcoded. Dat maakt
licht/donker-thema's mogelijk via `light-dark()` en houdt je app in de
huisstijl. De variabelen zijn gelaagd:

| Laag | Prefix | Wat het is |
|------|--------|------------|
| **Primitives** | `--primitives-*` | Basiswaarden: kleur, spacing, typografie. Alle andere lagen komen hierop uit. |
| **Semantics** | `--semantics-*` | Betekenisvolle rollen: knoppen, controls, oppervlakken. |
| **Components** | `--components-*` | Component-specifiek. Zelden nodig in app-code. |
| **Context** | `--context-*` | Communicatie tussen componenten (bijv. achtergrondkleur die doorcascadeert). |
| **Lokaal** | `--_*` | **Intern aan een component. Raak deze niet aan.** |

Je hebt deze variabelen zelden nodig. Ruimte stuur je met `nldd-container` en
`nldd-spacer`, tekst met `nldd-title` en `nldd-rich-text`, en de kleuren komen
uit de componenten zelf. Pak eerst een component; dan zit de huisstijl er al in
en blijft je app meebewegen als het systeem verandert. Houd je daarna nog eigen
CSS over voor iets dat geen component is, gebruik dan `--primitives-*` in
plaats van een hardcoded waarde.

**Zet geen `light-dark()` om een primitive heen.** Elke kleur-primitive is zelf
al een `light-dark()`-paar, en de schaal kantelt mee: stap 700 is donkere tekst
in lichte modus en lichte tekst in donkere modus. Wikkel je hem in nog een
`light-dark()` met de gespiegelde stap (700 om 300), dan draai je twee keer om
en houd je in beide schema's dezelfde kleur over: donkere tekst op een donkere
achtergrond. Eén verwijzing volstaat.

`light-dark()` heb je alleen nodig voor kleuren die niet uit het palet komen, of
wanneer je per schema bewust een ándere stap wilt (bijvoorbeeld 100 in licht en
150 in donker, voor iets meer contrast).

**Licht en donker.** Het hele palet is gebouwd op `light-dark()`, dus het thema
volgt de CSS `color-scheme`. Standaard is dat de OS- of browservoorkeur. Wil je
licht of donker forceren, zet dan `color-scheme: light` (of `dark`) op een
root-element. Er is geen aparte thema-toggle-API op `nldd-app-view`.

## Gebruikspatronen

Elk patroon heeft een reden. De voorbeelden zijn gedestilleerd uit
[regelrecht](https://github.com/MinBZK/regelrecht), de productie-app die dit
systeem het meest volwassen gebruikt.

### Layout componeren

`nldd-app-view` is altijd de buitenste schil: die zet de kleurschema-context.
De documenttypografie komt uit de stylesheet, die de `body` het documentfont
geeft zodra er een app-view in de pagina staat. Importeer je alleen componenten
en geen `styles`, dan krijg je die dus niet. Wat binnen de app-view komt, hangt
af van wat je bouwt. Er zijn twee compositievormen, kies bewust:

| Vorm | Wanneer | Bouwstenen |
|------|---------|------------|
| **App-shell** | Applicaties met panelen: editors, dashboards, werkomgevingen. | `nldd-app-view` → split view → `nldd-split-view-pane` → `nldd-page` |
| **Content-pagina** | Landings-, marketing- of informatiepagina's: een verticale stapel inhoud. | `nldd-app-view` → `nldd-page` → `*-section` blokken → `nldd-page-footer` |

**App-shell** loopt van buiten naar binnen via split views:

```html
<nldd-app-view>
  <nldd-side-by-side-split-view panes="2">
    <div slot="pane-1"><!-- hoofdinhoud, hoogste prioriteit --></div>
    <div slot="pane-2"><!-- inspector, verdwijnt eerst op smal scherm --></div>
  </nldd-side-by-side-split-view>
</nldd-app-view>
```

*Waarom:* de split view regelt de responsive auto-hide. Zet de prioriteit goed
door de volgorde van de panelen.

**Content-pagina** is een stapel page-sections, geen split views:

```html
<nldd-app-view>
  <nldd-page>
    <nldd-simple-section><!-- hero --></nldd-simple-section>
    <nldd-simple-section>
      <nldd-collection layout="grid"
        item-width="320px"
      >
        <nldd-card><!-- ... --></nldd-card>
      </nldd-collection>
    </nldd-simple-section>
    <nldd-page-footer><!-- ... --></nldd-page-footer>
  </nldd-page>
</nldd-app-view>
```

*Waarom:* de `*-section` componenten (`nldd-simple-section`,
`nldd-two-thirds-one-third-section`, en de andere page-sections) regelen
responsive padding en kolom-wrapping zelf via container queries. Grids van
gelijkwaardige items bouw je met `nldd-collection` + `nldd-card`, niet met eigen
CSS-grid. Het volledige patroon staat in
[`examples/content-page.md`](examples/content-page.md).

### Sheet, modal of popover: kies bewust

Dit zijn geen uitwisselbare overlays. Elk heeft een doel:

| Surface | Gebruik voor | Niet voor |
|---------|--------------|-----------|
| **`nldd-sheet`** | Secundaire inhoud die context behoudt: formulieren, bewerk-oppervlakken, detail. Schuift in vanaf de zijkant (onderkant op mobiel). | Korte bevestigingen. |
| **`nldd-modal-dialog`** | Het uiterste geval: een onomkeerbare actie waar geen veiliger weg omheen is. Onderbreekt bewust. | Data-invoer, complexe formulieren, of bevestigingen die ook met undo kunnen. |
| **`nldd-popover`** | Lichte, niet-blokkerende panelen verankerd aan een trigger: filters, snelacties, zoekvelden. Sluit bij Esc en klik-buiten. | Inhoud die de hele aandacht vraagt. |

*Vuistregel:* secundaire inhoud op een smal scherm hoort in een **sheet**, niet
in een modal. Een modal onderbreekt; reserveer dat voor momenten die een
onderbreking verdienen.

> Wanneer is een modal überhaupt gerechtvaardigd, en wat is het primary-label in
> een bevestiging? Dat zijn ontwerpkeuzes, geen component-mechaniek. De voorkeur
> is undo boven confirm en een contextueel-window (popover) boven een modal; zie
> [`design-guidelines.md`](design-guidelines.md) ("Feedback en state").

### Imperatieve API spiegelen (sheets, popovers, modals)

Deze surfaces stellen `show()` en `hide()` beschikbaar als methoden. Spiegel je
toestand naar die calls in plaats van het element te mounten/unmounten, zodat de
animatie speelt. Spiegel óók de andere kant op, anders krijg je een
`hide()` → `@close` → `hide()` lus.

```js
// Vue, vereenvoudigd uit regelrecht
watch(() => props.open, async (open) => {
  if (!open) { sheetEl.value?.hide(); return; }
  await nextTick();
  sheetEl.value?.show();
}, { immediate: true });
```

*Waarom:* mount/unmount slaat de in- en uit-animatie over en verliest
DOM-toestand. De imperatieve methoden animeren wel.

Belangrijk: dit fragment toont alleen de `watch`-kant. De sheet sluit zichzelf
bij Esc of klik-buiten en vuurt dan `close`; koppel `@close` aan een
`emit('close')` die diezelfde `open`-state omlaag zet, niet aan een directe
`hide()`. Anders krijg je de `hide()` → `@close` → `hide()` lus. Het complete,
werkende component staat in [`examples/bootstrap-vue.md`](examples/bootstrap-vue.md).

### Lijstrijen componeren uit cellen

Bouw rijen op uit cellen binnen een `nldd-list-item`. Niet uit losse divs.

```html
<nldd-list variant="simple">
  <nldd-list-item size="md" button>
    <nldd-text-cell text="Titel" supporting-text="Ondertitel"></nldd-text-cell>
  </nldd-list-item>
</nldd-list>
```

Beschikbare cellen: `nldd-text-cell`, `nldd-icon-cell`, `nldd-title-cell`,
`nldd-description-cell`, `nldd-spacer-cell`, en meer (zie `reference.md`).

**Zet nooit kale tekst in een rij.** De cel bepaalt lettertype, grootte, kleur
en uitlijning, en stemt die af op de rijhoogte. Tekst die je er los in hangt
krijgt niets van dat alles mee: in een klikbare rij zit de slot in een `<button>`
en erft je tekst de browserstijl van een knop, wat neerkomt op 13px Arial. Loopt
je tekst over meerdere alinea's of bevat hij opmaak, gebruik dan
`nldd-rich-text` in een `nldd-cell`.

```html
<!-- Fout: kale tekst in de rij -->
<nldd-list-item button>Dossier 2024-001</nldd-list-item>

<!-- Goed -->
<nldd-list-item button>
  <nldd-text-cell text="Dossier 2024-001"></nldd-text-cell>
</nldd-list-item>

<!-- Goed, met opmaak -->
<nldd-list-item>
  <nldd-cell>
    <nldd-rich-text><p>Tekst met <strong>opmaak</strong>.</p></nldd-rich-text>
  </nldd-cell>
</nldd-list-item>
```

### Formulieren en validatiefouten

`nldd-form-field` koppelt label en input automatisch (geen `for`/`id`-gedoe).
Alles waar een waarde aan moet voldoen zet je in een
`nldd-validation-list`. Een eis die je vooraf kunt noemen krijgt een
regel en controleert zichzelf terwijl de gebruiker typt. Een eis die alleen je
server kan vaststellen krijgt er geen, en die noem je in `unmet` op de input.

```html
<nldd-form-field label="Wachtwoord">
  <nldd-password-field name="password" unmet="password-breach"></nldd-password-field>
  <nldd-validation-list hint>
    <nldd-validation-item id="password-length" minlength="8">
      Minimaal 8 tekens
    </nldd-validation-item>
    <nldd-validation-item id="password-capital" match="[A-Z]">
      Een hoofdletter
    </nldd-validation-item>
    <nldd-validation-item id="password-breach">
      Dit wachtwoord staat in een bekend datalek
    </nldd-validation-item>
  </nldd-validation-list>
</nldd-form-field>
```

Geef elk item een id die z'n veld noemt en niet alleen z'n regel. Een id moet
uniek zijn in de hele pagina, en `length` is het eerste waar drie velden in
hetzelfde formulier alle drie naar grijpen.

**Wanneer een fout verschijnt** bepaalt `invalid` op de input. `nldd-form` zet
dat attribuut zelf bij het versturen, op het moment dat de browser het
formulier afkeurt, en haalt het weg zodra het klopt. Wil je het zelf zetten, in
Vue `:invalid="hasError"` of in platte JS
`field.toggleAttribute('invalid', hasError)`, doe dat dan bij verzending en niet
terwijl iemand nog typt. Anders kleurt een veld rood over een waarde die nog
niet af is.

**De lijst heeft twee modi**, en `judging` op de lijst is de schakelaar. Vóór een
oordeel toont hij z'n hints: de eisen van het veld. Erna toont hij wat de waarde
niet haalt, en zijn de hints weg. Hij gaat vanzelf aan zodra de input op
`invalid` staat, en blijft daarna aan: repareer je de waarde, dan verdwijnt het
rood, maar de uitleg komt niet terug. Iemand die net te horen heeft gekregen wat
er mis was, hoeft niet opnieuw uitgelegd te krijgen wat het veld wil. Zet je
`judging` zelf, dan laat je de hints vallen zonder dat er iets is afgekeurd;
haal je hem weg, dan staat het veld weer op af, wat een reset wil.

Wat rood wordt volgt `invalid` en niets anders. Er staat dus nooit een rode
regel onder een veld dat er goed uitziet.

`match` is niet verankerd, anders dan het native `pattern`: `[A-Z]` betekent
"bevat een hoofdletter". Wil je dat de héle waarde een vorm heeft, zet er dan
zelf `^` en `$` omheen.

**Schrijf een item als de eis, niet als de opdracht.** Een item is geen control:
je klikt er niet op en je voert het niet uit. De gebiedende wijs bewaren we voor
knoppen, waar die een handeling aankondigt die je zelf in gang zet.

| in plaats van | schrijf |
|---|---|
| "Vul een geldig KvK-nummer in (8 cijfers)" | "Een KvK-nummer van 8 cijfers" |
| "Kies minimaal één optie" | "Minimaal één optie" |
| "Gebruik minimaal 8 tekens" | "Minimaal 8 tekens" |

Dezelfde regel doet namelijk twee dingen: vooraf staat hij er als eis, achteraf
als wat er nog niet klopt. Een bevel leest vooraf als een standje voordat er iets
aan de hand is.

*Waarom dit patroon:* zo staat een eis één keer op de pagina in plaats van
tweemaal, als uitleg vooraf en als foutmelding achteraf. Vinkjes zijn er niet:
het veld toont zelf al een validatie-icoon, en dat per regel herhalen zegt
hetzelfde drie keer.

Voor tekst die je niet tegenhoudt, zoals "We sturen een bevestigingsmail naar
dit adres", gebruik je `nldd-form-field-help-text`.

*Ontwerpkeuzes rond formulieren* (markeer optionele velden in plaats van
verplichte, volg de gedachtegang van de gebruiker in de vraagvolgorde, één veld
voor de volledige naam) staan in [`design-guidelines.md`](design-guidelines.md)
("Invoer en formulieren"). Het `optional`-attribuut op `nldd-form-field` toont
daarbij zelf de "Optioneel"-badge.

### Custom events lezen via `event.detail`

Componenten leveren hun waarde in `event.detail`, niet altijd op
`event.target.value`. Lees defensief:

```js
function onInput(event) {
  const value = event.detail?.value ?? event.target?.value;
  // ...
}
```

### Defensieve shadow-DOM toegang

Moet je echt bij een native input (bijvoorbeeld om te focussen)? Zoek dan met
een fallback, zodat je code blijft werken als de interne structuur verandert:

```js
const field = root.querySelector('nldd-search-field');
const native =
  field?.shadowRoot?.querySelector('input') ?? field?.querySelector('input');
native?.focus();
```

Dit is een ontsnappingsluik. Gebruik het spaarzaam.

### Spacing: `nldd-spacer` versus `nldd-container`

- **`nldd-container`** voor padding rond een regio en de layout van zijn
  kinderen (stack, rij, grid), met responsive `sm-` / `md-` / `lg-` varianten.
- **`nldd-spacer`** voor een kale verticale of horizontale ruimte tussen
  opeenvolgende, verschillende componenten. Ook per breakpoint instelbaar.

### Breakpoints

De grenzen zijn: `sm` ≤ 640px, `md` 641–1007px, `lg` ≥ 1008px. Het pakket
exporteert deze waarden nog niet publiek, dus als je ze in JS nodig hebt
(bijvoorbeeld om een popover anders te positioneren), hardcode ze in sync met
deze bron. **Bekende beperking:** controleer bij een pakketupdate of er
inmiddels wel een export is.

## Toegankelijkheid: wat je gratis krijgt, wat jij nog moet doen

De componenten leveren correcte ARIA, focusvolgorde, een zichtbare blauwe
focusring, `forced-colors`-ondersteuning en `prefers-reduced-motion` af. De
wettelijke lat is WCAG 2.1 AA (EN 301 549, verplicht onder het Besluit digitale
toegankelijkheid overheid). Wat het systeem voor je regelt:

- Form fields koppelen label en input automatisch (geen handmatige `for`/`id`).
- Knoppen met een popup zetten zelf `aria-haspopup`; **jij houdt `expanded`
  bij** als de popup opent en sluit.
- Banners zetten zelf `role`/`aria-live` op basis van variant. Niet overschrijven.

Wat jij nog moet doen:

- Zorg voor een **skip-link** (`nldd-skip-link`, "Direct naar de inhoud") en een
  logische focusvolgorde in je eigen markup.
- Test op **toetsenbordbediening**, **200% zoom** en **400% herschaling zonder
  horizontale scroll**.
- Geef betekenisvolle `accessible-label`s waar je tekst weglaat (icon-only
  knoppen, geslotte inhoud).

## Upgraden naar een nieuwe versie

Het systeem brengt versies uit als patches (semantic-release verhoogt het
patch-nummer bij elke `feat`, `fix` of breaking change). Het versienummer alleen
zegt dus niet of een upgrade veilig is; **de changelog wel.** Gebruik
[`changelog.md`](changelog.md) als je upgradepad.

Werkwijze bij het verhogen van je `@nldd/design-system` versie:

1. **Lees elke versie tussen jouw huidige en de doelversie.** De entries staan
   nieuwste eerst, met een kop per release (versienummer + datum). Sla niets
   over: een breaking change kan in een tussenliggende patch zitten.
2. **Scan de `Breaking` / `Breaking Changes` secties eerst.** Die bevatten
   concrete migratie-instructies: een verwijderd attribuut met zijn vervanger,
   hernoemde variabelen, gewijzigd gedrag. Een echt voorbeeld uit de changelog:
   `variant="box-on-tinted"` op `nldd-list` is verwijderd, met als vervanger
   `<nldd-list variant="box" background="base">`.
3. **Pas de migraties toe in je code** voordat je de nieuwe versie in gebruik
   neemt. Zoek je app door op de verwijderde attributen, variabelenamen of
   componenten uit de breaking entries.
4. **Lees `Highlights`, `Added` en `Changed`** voor nieuwe componenten of
   attributen die je oudere, omslachtigere code kunnen vervangen.
5. **Verifieer tegen [`reference.md`](reference.md)** of een attribuut, slot of
   event in de doelversie bestaat zoals je verwacht. Die referentie hoort bij
   exact deze release.

Vuistregel: ga niet meer dan een handvol patches in één sprong omhoog zonder de
tussenliggende `Breaking` secties te lezen. Hernoemde CSS-variabelen zijn de meest
gemiste val: je eigen thema-overrides verwijzen dan naar een naam die niet meer
bestaat, zonder foutmelding, alleen een stille terugval op de default.

## Bron van waarheid

1. **[Storybook](https://nederlandsedigitaledienst.github.io/design-system/)**: levende voorbeelden en
   controls per component.
2. **`.d.ts` types in het pakket**: de exacte, actuele API.
3. **[`reference.md`](reference.md)**: offline snelreferentie van alle elementen.
4. **[`changelog.md`](changelog.md)**: de release notes per versie. Raadpleeg
   dit als een attribuut, slot of gedrag pas vanaf een bepaalde versie bestaat,
   of om te zien wat er sinds jouw versie is veranderd.
5. **[`design-guidelines.md`](design-guidelines.md)**: de interface- en
   ontwerpvoorkeuren van het systeem (invoer en formulieren, navigatie, feedback
   en state, microcopy, visuele hiërarchie, strategie). Dit is de canonieke bron
   voor *ontwerp*keuzes; raadpleeg het bij vormgeven, microcopy schrijven of een
   UI reviewen. Deze SKILL.md beschrijft de component-*mechaniek*, de guidelines
   beschrijven de keuzes erachter.

**Iconen.** `nldd-icon name="…"` accepteert namen uit een vaste set. De
volledige lijst (iconen plus aliassen) staat onder "Iconen" in
[`reference.md`](reference.md); verzin geen naam, kies er een uit die set.

## Grenzen van deze skill

Deze skill gaat over het *gebruiken* van het designsysteem: welke componenten,
welke patronen, welke visie. Wat erbuiten valt en je zelf invult vanuit je
applicatie- en frameworkkeuzes: state-management en validatieregels,
server-side foutafhandeling, routing, en het testen van je eigen app. Voor
SSR/hydratie geldt de algemene web-componentenpraktijk (de componenten
upgraden client-side; render geen kritieke inhoud uitsluitend in hun shadow
DOM). De componenten zelf zijn los getest binnen het designsysteem; jouw
app-tests schrijf je met je eigen testopstelling.

> Voor onderhouders: `reference.md`, `changelog.md` en `design-guidelines.md`
> zijn gegenereerd (uit respectievelijk de JSDoc van de componenten, de
> root-CHANGELOG en `src/docs/design-guidelines.mdx`). Draai
> `npm run generate:skill-docs` na een API-wijziging, release of wijziging in de
> ontwerprichtlijnen en commit het resultaat. Het zijn echte bestanden, geen
> symlinks: een plugin wordt naar een geïsoleerde cache gekopieerd waarbij
> symlinks buiten de plugin-map wegvallen.
