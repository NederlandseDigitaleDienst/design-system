# Migreren vanaf Tailwind

Aanvulling op [`SKILL.md`](SKILL.md) voor codebases die van Tailwind CSS komen.
Lees eerst de hoofdskill; hieronder staat alleen wat specifiek is voor deze
herkomst.

## De compilervalstrik

Dit is het grootste gevaar van een migratie vanaf Tailwind, en het heeft geen
tegenhanger bij CSS modules of handgeschreven CSS.

**Zolang Tailwind geïnstalleerd is, verzint zijn compiler een regel voor elke
klasse die hij herkent.** `flex`, `px-4` en `bg-amber-50` werken dus zonder in
enige stylesheet van jou te bestaan. Haal je het pakket weg, dan blijven ze
compileren, komen ze langs tsc en eslint, en doen ze niets meer.

In één migratie stonden **158 van de 176 overgebleven klassen** in die staat,
inclusief elke klasse die iemand bewust had laten staan als "gedocumenteerde
uitzondering".

Gevolgen voor je planning:

- **Tailwind weghalen is geen laatste stap maar een diagnose.** Doe het vroeg
  genoeg om te kunnen repareren wat het blootlegt. "Voorlopig laten staan"
  verbergt de schade tot iemand anders het weghaalt.
- Een comment dat uitlegt waarom een klasse blijft, houdt hem niet werkend.
- Na verwijdering moet je klassencheck **falen**, niet waarschuwen.

## Waar dode klassen zich verstoppen

De voor de hand liggende grep op `className="..."` vindt het meeste en mist
precies wat het langst blijft leven:

- **Lookup-tabellen.** Een `Record<Status, string>` in je types-bestand met
  `'bg-green-100 text-green-800'` erin, die via een variabele in een span
  belandt. Dat ziet er nooit uit als markup. Scan ook `.ts`, niet alleen `.tsx`.
- **Ternaries en template literals** binnen `className={...}`.
- **Bestanden die je hebt uitgesloten.** Een uitsluiting op bestandsnaam voor
  graph-views ("die klassen zijn van reactflow") verborg 112 dode klassen over
  zes bestanden, waaronder een datatabel die als kale HTML rendeerde. Sluit uit
  op *klassenaam* (de handvol die een externe bibliotheek echt bezit), nooit op
  bestand.

Sla commentaar over bij het scannen, anders wordt een doc-comment met `h-4 w-4`
gemeld en leren mensen de check te negeren.

## De tokenbrug: nuttig, en makkelijk overschat

Centraliseer je Tailwind-thema in één blok en laat het naar `--primitives-*`
wijzen:

```css
@theme {
  --color-primary-900: var(--primitives-color-lintblauw-700);
  --font-family-sans: var(--primitives-font-family-sans-serif);
}
```

Dit werkt: CSS-variabelen zijn laat gebonden, de browser lost de keten op de
gebruiksplek op. De hele app staat daarmee in huisstijlkleuren zonder dat er één
component is omgezet, wat een goedkoop en zichtbaar eerste resultaat oplevert.

Drie kanttekeningen, want dit wordt makkelijk oververkocht:

1. **Klassen die het rauwe palet gebruiken** (`bg-gray-50`, `text-red-600`)
   schuiven niet mee, en die zitten juist op de semantisch geladen plekken:
   foutmeldingen, waarschuwingen, badge-varianten. Herleid ook de grijs-, rood-,
   amber-, emerald- en blauwschalen om een deel terug te winnen.
2. **Alpha-modifiers** (`ring-primary-500/20`) compileren naar `color-mix()`
   over een waarde die zelf al een `light-dark()`-paar is. Reken die visueel na
   in plaats van de hele aanpak weg te gooien als er één misgaat.
3. **De brug maskeert componentfouten.** Zolang hij er is, ziet een verkeerd
   opgezette container er acceptabel uit. Pas bij het weghalen van Tailwind komt
   de instorting tot nul breedte boven water. Reken daarop in je planning: het
   weghalen legt werk bloot, het rondt het niet af.

## Globale regels die botsen

Drie patronen uit een typische Tailwind-setup vechten met het designsysteem en
moeten weg of scoped worden:

- `*:focus-visible { outline: ... }` verdubbelt met de eigen focusring van de
  componenten.
- `button, a, input, select, textarea { transition: all .15s }` vecht met de
  animaties van de componenten, onder andere met de geslotte `<select>` in
  `nldd-dropdown`.
- `body { background-color: ... }`: `nldd-app-view` zet dat zelf op
  `document.body`.

Forceer verder `color-scheme: light` op de root zolang de migratie loopt. Donkere
modus komt gratis met het palet, maar half omgezette schermen met `bg-white` en
`text-gray-*` zijn er stuk in. Zet het pas aan als het laatste scherm om is.

## Wat je overhoudt

Reken op een klein eigen CSS-bestand voor wat het designsysteem bewust niet
regelt: hoe tekst afkapt (`truncate`, `line-clamp`), `text-transform` en
`letter-spacing` die `nldd-text` niet heeft, `object-fit`, `flex-shrink`,
scroll-snap, en het hover-reveal-patroon.

Houd dat bestand klein en houd jezelf eraan: elke klasse vervangt precies één
utility, en de klassencheck uit de hoofdskill bewaakt beide richtingen, zodat er
geen regel in blijft staan die niemand gebruikt. Het is geen utility-framework en
moet er geen worden.

## Iconen

Kom je van `lucide-react` of een vergelijkbare set, dan heb je een
mappingtabel nodig naar `nldd-icon`. Het gros mapt direct; een stuk of vijftien
niet. Kies dan een buurman of houd een kleine eigen SVG-set.

Let op de maatvoering: Tailwind deed dat met klassen (`h-4 w-4`), `nldd-icon`
doet het in pixels en accepteert alleen spacer-uitgelijnde maten. Je codemod
heeft dus een klasse-naar-maat-tabel nodig, en de twee kleinste schalen ronden
omhoog.
