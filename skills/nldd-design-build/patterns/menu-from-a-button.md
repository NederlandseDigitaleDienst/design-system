<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/menu-from-a-button/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: menu bij een knop

Een menu bij een knop toont extra acties of keuzes wanneer iemand die nodig heeft. Gebruik het om meerdere verwante opties te bundelen, bijvoorbeeld acties voor één item. Zijn de acties allemaal belangrijk en vaak nodig, maak ze dan direct zichtbaar; is er maar één actie, gebruik dan een losse knop.

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

## Regels

Hints: zo is het bedoeld. Die laten niets falen.

- `menu-item-destructive-goes-last`: Put the destructive item last, behind an nldd-menu-divider, away from the actions people click through.
- `menu-needs-two-actions`: Use a plain button for a single action.
- `menu-no-manual-anchor`: Nest it in the `popup` slot of the button, which anchors it, opens it and needs no id: `anchor` is for a trigger without that slot.
- `menu-no-manual-choice`: Use type="radio" or type="checkbox" with `selected`, which gives the item the role and the state a screen reader reads out.
