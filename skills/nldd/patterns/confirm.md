# Patroon: bevestigen

**Welk probleem dit oplost.** De gebruiker een keuze laten maken over iets dat
niet terug te draaien is, of hem een lege of mislukte toestand melden met een
weg vooruit.

**Wanneer wel.** Als er écht geen weg terug is: een definitieve indiening, een
betaling, een verwijdering zonder herstel.

**Wanneer niet.** Bijna altijd. **Undo gaat boven confirm:** mensen klikken op
autopilot "OK", dus een bevestigingsdialoog vangt weinig fouten. Autosave met
versies is beter dan "wil je opslaan?". Kun je de actie ongedaan maken, doe dat
dan en meld het achteraf met een herstelmogelijkheid. En **bied nooit een modal
met één knop aan**: valt er niets te kiezen, dan hoeft er ook niet onderbroken te
worden.

Liever nog dan een modal: een contextueel window (`nldd-popover`) dat aan de
actie vastzit en de pagina niet afdekt. Wegkijken is dan annuleren, en de
informatie die de gebruiker nodig heeft om te beslissen blijft in beeld.

## Compositie

```
nldd-modal-dialog              (de onderbreking; show() / hide())
  └─ forwardt naar nldd-inline-dialog
       ├─ variant / icon       (alert forceert icoon en kleur)
       ├─ text                 (de vraag)
       ├─ supporting-text      (het gevolg)
       └─ slot="actions"       (nldd-button, hoogstens 3)
```

`nldd-inline-dialog` is hetzelfde blok zonder de onderbreking. Gebruik dat
rechtstreeks, in een sectie of een lijst, voor een lege toestand, een
laadtoestand of een foutmelding die de pagina niet hoeft te blokkeren.

## Code

Een onomkeerbare actie. Let op de volgorde van de knoppen:

```html
<nldd-modal-dialog
  variant="alert"
  text="Document definitief verwijderen?"
  supporting-text="Dit document en zijn versies worden verwijderd. Dit kan niet ongedaan worden gemaakt."
  accessible-label="Document verwijderen"
>
  <nldd-button slot="actions" variant="primary" text="Behoud document"></nldd-button>
  <nldd-button slot="actions" variant="destructive" text="Verwijder definitief"></nldd-button>
</nldd-modal-dialog>
```

Een lege toestand in de pagina, zonder onderbreking:

```html
<nldd-simple-section>
  <nldd-inline-dialog
    icon="search"
    text="Geen resultaten"
    supporting-text="Pas je filters aan om meer te zien."
    heading-level="2"
  >
    <nldd-button slot="actions" variant="secondary" text="Filters wissen"></nldd-button>
  </nldd-inline-dialog>
</nldd-simple-section>
```

## Waarom zo

**De veilige uitweg krijgt `variant="primary"` en staat bovenaan.** De
primaire knop is waar de gebruiker op autopilot naartoe gaat, en dat hoort de
uitweg te zijn, niet de onomkeerbare actie. De destructieve actie komt eronder
met `variant="destructive"`. Zo komt de gebruiker de uitweg als eerste tegen in
plaats van eerst langs de knop te moeten die hij juist wil vermijden.

**Zet een destructieve knop niet pal naast een bevestigende knop.** Geef ze
visuele en fysieke afstand, anders kost een misklik data.

**Kies bewust tussen sheet, modal en popover.** Deze drie zijn niet
uitwisselbaar:

| Surface | Waarvoor | Niet voor |
|---|---|---|
| `nldd-sheet` | Secundaire inhoud die context bewaart: formulieren, detail. | Korte bevestigingen. |
| `nldd-modal-dialog` | Het uiterste geval: onomkeerbaar, geen veiliger weg. | Data-invoer, complexe formulieren, bevestigingen die met undo kunnen. |
| `nldd-popover` | Licht, niet-blokkerend, verankerd aan een trigger. | Inhoud die de volle aandacht vraagt. |

**`text` wordt een `<p>` tenzij je `heading-level` zet.** In een lege toestand
midden in een pagina wil je meestal een echte kop (`heading-level="2"`), zodat
de koppenstructuur klopt. In een modal is een `<p>` juist goed: de dialoog heeft
zijn eigen naam via `accessible-label`.

**Laat de uitlijning met rust.** Zonder `horizontal-alignment` leidt het
component die zelf af: eigen inhoud in de standaardslot betekent een taak en
lijnt links uit, een kale melding blijft gecentreerd. Links uitlijnen zet de
knoppen ook op een rij in plaats van gestapeld over de volle breedte.

**Hoogstens drie knoppen.** De `actions`-slot wikkelt ze in een
`nldd-button-group`, en meer dan drie keuzes is geen bevestiging meer.

**`close` bubbelt niet.** Overlays nesten, dus een listener op deze dialoog hoort
niet ook het formulier dat hij opende. Spiegel je toestand naar `show()` en
`hide()`, net als bij een sheet.

**Voor een melding die niet om een keuze vraagt** gebruik je
`nldd-notification` (een korte melding die zelf verdwijnt) of `nldd-banner`
(een mededeling die in de pagina blijft staan), geen dialoog.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, Esc om te sluiten, de focusval en de focus
die terugkeert naar de trigger. `variant="alert"` forceert het bijpassende icoon
en de bijpassende kleur, dus zet die niet zelf.

Wat jij nog moet doen: een `accessible-label` die zegt waar de dialoog over gaat
(hij valt terug op `text`), en een `heading-level` waar het blok in de
paginastructuur meedoet.

## Gezien in

`inline-dialog > button` komt in de helft van de onderzochte producten voor, en
`modal-dialog > button` in een kwart: de inline-variant wordt dus veel vaker
gebruikt dan de onderbrekende, wat precies de bedoeling is. WIES bouwde zijn
foutpagina's expres op een inline dialog in plaats van op een modal.
