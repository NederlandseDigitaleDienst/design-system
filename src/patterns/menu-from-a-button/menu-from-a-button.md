# Menu bij een knop

**Welk probleem dit oplost.** Meer acties aanbieden dan er knoppen passen, of een keuze laten maken die niet de hele aandacht verdient: een more-menu in een rij, een sorteermenu, een profielmenu.

**Wanneer wel.** Een lijst acties of keuzes die bij één knop hoort.

**Wanneer niet.** Voor de hoofdnavigatie van een site gebruik je een [`nldd-menu-bar`](/componenten/menu-bar/). Voor een keuze in een formulier gebruik je geen menu: bij een handvol opties een [`nldd-segmented-control`](/componenten/segmented-control/) of [`nldd-toggle-button-group`](/componenten/toggle-button-group/), bij veel opties een [`nldd-combo-box`](/componenten/combo-box/) waarin je typt, en pas als laatste een [`nldd-dropdown`](/componenten/dropdown/), zie de [ontwerprichtlijnen](/richtlijnen/#invoer-en-formulieren). En geen megamenu's, zie de [ontwerprichtlijnen](/richtlijnen/).

## Compositie

```
nldd-button (of nldd-icon-button)   expandable
  └─ nldd-menu                      slot="popup"
       ├─ nldd-menu-item            text, icon, shortcut, href
       ├─ nldd-menu-divider
       └─ nldd-menu-group           text, een kopje boven een groep items
```

<!-- voorbeeld: Standaard -->

Een keuze uit een set zijn items met `type="radio"`, iets dat aan of uit staat een item met `type="checkbox"`. Beide houden hun stand bij met `selected`.

<!-- voorbeeld: Keuzemenu -->

## Waarom zo

**Nest het menu in de `popup`-slot van de knop.** Dan hangt de [`nldd-button`](/componenten/button/) het menu zelf aan zich vast en opent en sluit die het: geen id, geen `anchor`, geen eigen klikafhandeling. Het menu meldt `expanded` en `aria-haspopup` terug aan de knop, vanaf de eerste render. Een losse `anchor` is alleen nodig voor een trigger zonder `popup`-slot.

**Een destructieve actie staat onderaan, achter een scheidingslijn.** Zo staat die niet tussen de acties waar de gebruiker snel doorheen klikt. `destructive` kleurt het menu-item rood, zie [`nldd-menu`](/componenten/menu/), maar de tekst moet zelf zeggen wat er gebeurt. Is de actie onomkeerbaar, vraag dan om [bevestiging](/patronen/irreversible-action/) of maak die ongedaan te maken.

**Een keuze is een radio-item, geen vinkje in de tekst.** Met `type="radio"` of `type="checkbox"` krijgt het item de juiste rol en de stand die een schermlezer voorleest. Een vinkje in de tekst zegt een schermlezer niets.

**Een actie in een werkbalk hoort ook in het overloopmenu.** Hoe dat werkt staat in [werkbalk met acties](/patronen/toolbar-with-actions/).

## Toegankelijkheid

Wat je gratis krijgt: de menurol, pijltjesnavigatie, Esc om te sluiten, de focus die terugkeert naar de knop, en `aria-expanded` en `aria-haspopup` op de knop.

Wat jij nog moet doen: de toets achter een `shortcut` zelf afhandelen. Het item toont alleen de combinatie.

## Gezien in

`menu > menu-item` staat in de top drie van meest gebruikte composities. De `popup`-slot is nieuwer dan de losse `anchor`, dus in bestaande code kom je beide tegen. Voor nieuwe code is de slot de route.
