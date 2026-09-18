# Patroon: menu bij een knop

**Welk probleem dit oplost.** Meer acties aanbieden dan er knoppen passen, of
een keuze laten maken die niet de hele aandacht verdient: een rijmenu, een
sorteermenu, een profielmenu.

**Wanneer wel.** Een lijst acties of keuzes die bij één trigger hoort.

**Wanneer niet.** Voor de hoofdnavigatie van een site gebruik je
`nldd-menu-bar` met `nldd-menu-bar-item`. Voor een keuze uit veel opties in een
formulier gebruik je `nldd-dropdown` (een echte `<select>`). En geen
megamenu's, zie de ontwerprichtlijnen.

## Compositie

```
nldd-button (of nldd-icon-button)     popup-type="menu", expandable
  └─ slot="popup"
       └─ nldd-menu
            ├─ nldd-menu-item         (text, icon, shortcut, href)
            ├─ nldd-menu-divider
            └─ nldd-menu-group        (text = kopje boven een groep)
```

## Code

```html
<nldd-button text="Acties" popup-type="menu" expandable>
  <nldd-menu slot="popup">
    <nldd-menu-item text="Bewerken" icon="edit" shortcut="Cmd+E"></nldd-menu-item>
    <nldd-menu-item text="Dupliceren" icon="copy"></nldd-menu-item>
    <nldd-menu-divider></nldd-menu-divider>
    <nldd-menu-item text="Verwijderen" icon="trash"></nldd-menu-item>
  </nldd-menu>
</nldd-button>
```

## Waarom zo

**Nest het menu in de `popup`-slot van de knop.** Dan ankert en toggelt de knop
de overlay zelf: geen `anchor="id"`, geen id's die verder nergens voor dienen,
geen eigen klikafhandeling. De overlay synchroniseert `expanded` en
`aria-haspopup` terug naar de knop. De handmatige `anchor`-bedrading blijft
werken, maar is alleen nodig voor een trigger zonder `popup`-slot (zoals
`nldd-search-field` bij zoeksuggesties).

**Zet `popup-type` er toch expliciet bij.** Het menu zet `aria-haspopup` pas bij
de eerste keer openen. Zonder dat attribuut weet een schermlezer die de knop
ervoor tegenkomt niet dat er een menu achter zit.

**Een actie in een werkbalk hoort ook in het overloopmenu.** `nldd-toolbar`
verplaatst items naar de overloop als de ruimte krap wordt. Geef elk
`nldd-toolbar-item` daarom een `nldd-menu-item` in zijn `overflow`-slot, anders
staat de actie er niet meer en zegt het menu "Geen opties beschikbaar". Wat
altijd zichtbaar moet blijven, houd je in beeld met `priority`: items met een
lagere priority verdwijnen het eerst.

**Een menu-item met een `href` wordt een echte link.** Dan werken
middelklikken, openen in een nieuw tabblad en link kopiëren. Gebruik dat voor
navigatie, en een gewoon button-item voor een actie.

**`shortcut` toont alleen de toetscombinatie, het bindt hem niet.** De
afhandeling schrijf je zelf. Op aanraakapparaten wordt de hint verborgen, want
daar valt er niets in te toetsen.

**Voor een keuze uit een set gebruik je `type="radio"`, voor aan/uit
`type="checkbox"`.** Niet een gewoon item met een vinkje in de tekst: de types
zetten de juiste ARIA en het juiste gedrag.

## Toegankelijkheid

Wat je gratis krijgt: de menurol, pijltjesnavigatie, Esc om te sluiten, de
focus die terugkeert naar de trigger, en `aria-expanded` op de knop.

Wat jij nog moet doen: `popup-type` zetten, en de toetsafhandeling van een
`shortcut` zelf regelen.

## Gezien in

WIES verving hiermee negen handmatige `anchor="id"`-koppelingen door de
`popup`-slot: rijmenu's bij gebruikers, labels en teamleden, en de menu's in
het opdrachtenpaneel. `menu > menu-item` is ook in de Fundament Console de op
twee na meest voorkomende compositie (118 keer). Die staat halverwege dezelfde
omslag: 34 keer de `popup`-slot naast nog 49 handmatige anchors.
