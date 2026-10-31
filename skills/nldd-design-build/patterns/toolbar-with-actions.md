<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/toolbar-with-actions/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: werkbalk met acties

Een werkbalk bundelt acties die gelden voor een heel scherm of paneel, zoals iets nieuws maken, filteren, exporteren of van weergave wisselen. Gebruik de werkbalk als er meerdere van zulke acties zijn en ze ook op een smal scherm bereikbaar moeten blijven. Gaat een actie over één rij, plaats die dan bij die rij in de [lijst](list.md). Is er maar één actie, gebruik dan een losse knop.

## Compositie

```
nldd-toolbar                       size, label
  ├─ nldd-toolbar-item             slot="start" | "center" | "end", priority
  │    ├─ de control               nldd-button, nldd-icon-button, nldd-search-field, …
  │    └─ nldd-menu-item           slot="overflow", dezelfde actie in het menu
  └─ nldd-menu-item                slot="overflow", acties die altijd in het menu staan
```

```html
<nldd-toolbar>
  <nldd-toolbar-item
    slot="start"
    priority="1"
  >
    <nldd-button
      appearance="primary"
      text="Nieuw document"
      start-icon="add"
    ></nldd-button>
    <nldd-menu-item
      slot="overflow"
      text="Nieuw document"
      icon="add"
    ></nldd-menu-item>
  </nldd-toolbar-item>

  <nldd-toolbar-item slot="start">
    <nldd-button
      appearance="secondary"
      text="Filter"
      start-icon="filter"
    ></nldd-button>
    <nldd-menu-item
      slot="overflow"
      text="Filter"
      icon="filter"
    ></nldd-menu-item>
  </nldd-toolbar-item>

  <nldd-toolbar-item slot="end">
    <nldd-icon-button
      icon="settings"
      text="Instellingen"
    ></nldd-icon-button>
    <nldd-menu-item
      slot="overflow"
      text="Instellingen"
      icon="settings"
    ></nldd-menu-item>
  </nldd-toolbar-item>
</nldd-toolbar>
```

## Waarom zo

**Elk item heeft een alternatief in het overloopmenu.** Als de ruimte krap wordt, verhuist de [`nldd-toolbar`](../../nldd-design/reference.md#nldd-toolbar) items naar de overloop. Zonder `nldd-menu-item` in `slot="overflow"` is de actie dan weg. Dat zie je op een breed scherm nooit, dus het item waarschuwt er in development al voor bij het laden.

**De primaire actie krijgt de hoogste `priority`.** Items met een lagere priority verhuizen als eerste. Wat altijd zichtbaar moet blijven, zet je hoger, en de plek in de HTML doet daarvoor niet ter zake.

**Een tabbalk krijgt als alternatief een menugroep met radio-items.** Een keuze uit een set is in het menu precies wat een tab in de balk is: een `nldd-menu-group` met een `type="radio"`-item per tab, en de actieve tab `selected`. Beide volgen dezelfde toestand in je eigen code. Geef de tabbalk een hoge priority, zodat die als laatste naar de overloop gaat.

```html
<nldd-toolbar>
  <nldd-toolbar-item
    slot="start"
    priority="2"
  >
    <nldd-tab-bar accessible-label="Weergave">
      <nldd-tab-bar-item
        text="Overzicht"
        current
      ></nldd-tab-bar-item>
      <nldd-tab-bar-item text="Tijdlijn"></nldd-tab-bar-item>
      <nldd-tab-bar-item text="Documenten"></nldd-tab-bar-item>
    </nldd-tab-bar>
    <nldd-menu-group
      slot="overflow"
      text="Weergave"
    >
      <nldd-menu-item
        type="radio"
        text="Overzicht"
        selected
      ></nldd-menu-item>
      <nldd-menu-item
        type="radio"
        text="Tijdlijn"
      ></nldd-menu-item>
      <nldd-menu-item
        type="radio"
        text="Documenten"
      ></nldd-menu-item>
    </nldd-menu-group>
  </nldd-toolbar-item>

  <nldd-toolbar-item slot="end">
    <nldd-button
      appearance="secondary"
      text="Deel"
      start-icon="share"
    ></nldd-button>
    <nldd-menu-item
      slot="overflow"
      text="Deel"
      icon="share"
    ></nldd-menu-item>
  </nldd-toolbar-item>
</nldd-toolbar>
```

**Zet `size` op de werkbalk, niet op elke knop.** De werkbalk geeft die door aan alle controls erin.

## Toegankelijkheid

Wat je gratis krijgt: de toolbar-rol, de overloopknop met zijn label en `aria-expanded`, en een tabbalk en menu met de rollen die bij een keuze horen.

Wat jij nog moet doen: een `text` op elke `nldd-icon-button`, een `accessible-label` op de werkbalk als er meer dan één op de pagina staat, en het overloop-alternatief per item.

## Gezien in

Werkbalken staan in elke applicatie op dit systeem. De lege overloop is in meerdere producten los van elkaar tegengekomen: die is op een breed scherm onzichtbaar en valt pas op als iemand het venster smal maakt.

## Regels

`nldd lint` controleert dit:

- `toolbar-control-size-no-effect`: The toolbar overwrites this size with its own. Set `size` on nldd-toolbar, which passes it to every control in it.
- `toolbar-item-needs-overflow`: Give this item an alternative in `slot="overflow"`: on a narrow screen it moves to the overflow menu, and without one it is gone.

Hints: zo is het bedoeld. Die laten niets falen.

- `tab-bar-needs-priority`: Give the tab bar a high `priority`, so it is the last to move to the overflow.
- `tab-bar-overflow-needs-radio-group`: Give the tab bar an nldd-menu-group in `slot="overflow"`, with a type="radio" item per tab.
- `toolbar-needs-two-actions`: Use a plain button for a single action.
- `toolbar-primary-needs-priority`: Give the primary action the highest `priority`, so it is the last to move to the overflow.
- `toolbar-second-needs-name`: Give each toolbar an `accessible-label` when a page has more than one.
