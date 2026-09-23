<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/menu-from-a-button/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: menu bij een knop

**Welk probleem dit oplost.** Meer acties aanbieden dan er knoppen passen, of een keuze laten maken die niet de hele aandacht verdient: een rijmenu, een sorteermenu, een profielmenu.

**Wanneer wel.** Een lijst acties of keuzes die bij één knop hoort.

**Wanneer niet.** Voor de hoofdnavigatie van een site gebruik je een [menu bar](../../nldd-design/reference.md#nldd-menu-bar). Voor een keuze uit veel opties in een formulier gebruik je een [dropdown](../../nldd-design/reference.md#nldd-dropdown). En geen megamenu's, zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md).

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

Een keuze uit een set is een groep items met `type="radio"`, iets dat aan of uit staat een item met `type="checkbox"`. Beide houden hun stand bij met `selected`.

```html
<nldd-button
  text="Sorteer"
  start-icon="sort"
  expandable
>
  <nldd-menu slot="popup">
    <nldd-menu-group text="Sorteer op">
      <nldd-menu-item
        type="radio"
        text="Datum"
        selected
      ></nldd-menu-item>
      <nldd-menu-item
        type="radio"
        text="Naam"
      ></nldd-menu-item>
    </nldd-menu-group>
    <nldd-menu-divider></nldd-menu-divider>
    <nldd-menu-item
      type="checkbox"
      text="Toon afgesloten zaken"
    ></nldd-menu-item>
  </nldd-menu>
</nldd-button>
```

## Waarom zo

**Nest het menu in de `popup`-slot van de knop.** Dan hangt de [knop](../../nldd-design/reference.md#nldd-button) het menu zelf aan zich vast en opent en sluit hij het: geen id, geen `anchor`, geen eigen klikafhandeling. Het menu meldt `expanded` en `aria-haspopup` terug aan de knop, vanaf de eerste render. Een losse `anchor` is alleen nodig voor een trigger zonder `popup`-slot.

**Een destructieve actie staat onderaan, achter een scheidingslijn.** Zo staat hij niet tussen de acties waar de gebruiker snel doorheen klikt. `destructive` kleurt het [item](../../nldd-design/reference.md#nldd-menu) rood, maar de tekst moet zelf zeggen wat er gebeurt. Is de actie onomkeerbaar, vraag dan om [bevestiging](confirm.md) of maak hem ongedaan te maken.

**Een keuze is een radio-item, geen vinkje in de tekst.** Met `type="radio"` of `type="checkbox"` krijgt het item de juiste rol en de stand die een schermlezer voorleest. Een vinkje in de tekst zegt een schermlezer niets.

**Een actie in een werkbalk hoort ook in het overloopmenu.** Hoe dat werkt staat in [werkbalk met acties](toolbar-with-actions.md).

## Toegankelijkheid

Wat je gratis krijgt: de menurol, pijltjesnavigatie, Esc om te sluiten, de focus die terugkeert naar de knop, en `aria-expanded` en `aria-haspopup` op de knop.

Wat jij nog moet doen: de toets achter een `shortcut` zelf afhandelen. Het item toont alleen de combinatie.

## Gezien in

`menu > menu-item` staat in de top drie van meest gebruikte composities. De `popup`-slot is nieuwer dan de losse `anchor`, dus in bestaande code kom je beide tegen. Voor nieuwe code is de slot de route.
