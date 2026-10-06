<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/menu-from-a-button/ (de .md-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: menu bij een knop

**Welk probleem dit oplost.** Meer acties aanbieden dan er knoppen passen, of een keuze laten maken die niet de hele aandacht verdient: een more-menu in een rij, een sorteermenu, een profielmenu.

**Wanneer wel.** Een lijst acties of keuzes die bij één knop hoort.

**Wanneer niet.** Voor de hoofdnavigatie van een site gebruik je een [`nldd-menu-bar`](../../nldd-design/reference.md#nldd-menu-bar). Voor een keuze in een formulier gebruik je geen menu: bij een handvol opties een [`nldd-segmented-control`](../../nldd-design/reference.md#nldd-segmented-control) of [`nldd-toggle-button-group`](../../nldd-design/reference.md#nldd-toggle-button-group), bij veel opties een [`nldd-combo-box`](../../nldd-design/reference.md#nldd-combo-box) waarin je typt, en pas als laatste een [`nldd-dropdown`](../../nldd-design/reference.md#nldd-dropdown), zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren). En geen megamenu's, zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md).

## Compositie

```
nldd-button (of nldd-icon-button)   expandable
  └─ nldd-menu                      slot="popup"
       ├─ nldd-menu-item            text, icon, shortcut, href
       ├─ nldd-menu-divider
       └─ nldd-menu-group           text, een kopje boven een groep items
```

```html
<nldd-button
  text="Acties"
  expandable
>
  <nldd-menu slot="popup">
    <nldd-menu-item
      text="Bewerk"
      icon="edit"
      shortcut="Cmd+E"
    ></nldd-menu-item>
    <nldd-menu-item
      text="Dupliceer"
      icon="copy"
    ></nldd-menu-item>
    <nldd-menu-divider></nldd-menu-divider>
    <nldd-menu-item
      text="Verwijder"
      icon="delete"
      destructive
    ></nldd-menu-item>
  </nldd-menu>
</nldd-button>
```

Een keuze uit een set zijn items met `type="radio"`, iets dat aan of uit staat een item met `type="checkbox"`. Beide houden hun stand bij met `selected`.

```html
<nldd-button
  text="Nieuwste eerst"
  start-icon="sort"
  expandable
>
  <nldd-menu slot="popup">
    <nldd-menu-item
      type="radio"
      text="Nieuwste eerst"
      selected
    ></nldd-menu-item>
    <nldd-menu-item
      type="radio"
      text="Oudste eerst"
    ></nldd-menu-item>
    <nldd-menu-item
      type="radio"
      text="Naam (A-Z)"
    ></nldd-menu-item>
  </nldd-menu>
</nldd-button>
```

## Waarom zo

**Nest het menu in de `popup`-slot van de knop.** Dan hangt de [`nldd-button`](../../nldd-design/reference.md#nldd-button) het menu zelf aan zich vast en opent en sluit die het: geen id, geen `anchor`, geen eigen klikafhandeling. Het menu meldt `expanded` en `aria-haspopup` terug aan de knop, vanaf de eerste render. Een losse `anchor` is alleen nodig voor een trigger zonder `popup`-slot.

**Een destructieve actie staat onderaan, achter een scheidingslijn.** Zo staat die niet tussen de acties waar de gebruiker snel doorheen klikt. `destructive` kleurt het menu-item rood, zie [`nldd-menu`](../../nldd-design/reference.md#nldd-menu), maar de tekst moet zelf zeggen wat er gebeurt. Is de actie onomkeerbaar, vraag dan om [bevestiging](irreversible-action.md) of maak die ongedaan te maken.

**Een keuze is een radio-item, geen vinkje in de tekst.** Met `type="radio"` of `type="checkbox"` krijgt het item de juiste rol en de stand die een schermlezer voorleest. Een vinkje in de tekst zegt een schermlezer niets.

**Een actie in een werkbalk hoort ook in het overloopmenu.** Hoe dat werkt staat in [werkbalk met acties](toolbar-with-actions.md).

## Toegankelijkheid

Wat je gratis krijgt: de menurol, pijltjesnavigatie, Esc om te sluiten, de focus die terugkeert naar de knop, en `aria-expanded` en `aria-haspopup` op de knop.

Wat jij nog moet doen: de toets achter een `shortcut` zelf afhandelen. Het item toont alleen de combinatie.

## Gezien in

`menu > menu-item` staat in de top drie van meest gebruikte composities. De `popup`-slot is nieuwer dan de losse `anchor`, dus in bestaande code kom je beide tegen. Voor nieuwe code is de slot de route.
