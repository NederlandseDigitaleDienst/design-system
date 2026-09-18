# Patroon: werkbalk met acties

**Welk probleem dit oplost.** Een rij acties aanbieden boven een scherm of
paneel die ook op een smal scherm bereikbaar blijft, zonder dat je zelf
mediaqueries schrijft of knoppen verstopt.

**Wanneer wel.** Een werkomgeving of paneel met meer dan twee acties die bij de
hele weergave horen.

**Wanneer niet.** Horen de acties bij één rij, dan horen ze in die rij (zie
[lijst met rijen](list-with-rows.md)). Is er maar één actie, zet dan een knop
neer. En voeg geen werkbalk toe omdat het er professioneel uitziet: chroom
verdient zijn plek.

## Compositie

```
nldd-toolbar                    (size, label)
  ├─ slot="start"   nldd-toolbar-item → de control (button, search-field, …)
  ├─ slot="center"  nldd-toolbar-title of items
  ├─ slot="end"     nldd-toolbar-item
  └─ slot="overflow" nldd-menu-item per actie, altijd in het overloopmenu
```

## Code

```html
<nldd-toolbar size="md" label="Documentacties">
  <nldd-toolbar-item slot="start" priority="1">
    <nldd-button variant="primary" text="Nieuw document"></nldd-button>
    <nldd-menu-item slot="overflow" text="Nieuw document" icon="plus"></nldd-menu-item>
  </nldd-toolbar-item>

  <nldd-toolbar-item slot="start">
    <nldd-button variant="secondary" text="Filter" start-icon="filter"></nldd-button>
    <nldd-menu-item slot="overflow" text="Filter" icon="filter"></nldd-menu-item>
  </nldd-toolbar-item>

  <nldd-toolbar-item slot="end">
    <nldd-icon-button icon="settings" accessible-label="Instellingen"></nldd-icon-button>
    <nldd-menu-item slot="overflow" text="Instellingen" icon="settings"></nldd-menu-item>
  </nldd-toolbar-item>
</nldd-toolbar>
```

## Waarom zo

**Geef elk item een alternatief in het overloopmenu.** De werkbalk verplaatst
items naar de overloop zodra de ruimte krap wordt. Heeft een item daar geen
`nldd-menu-item`, dan is de actie weg en zegt het menu "Geen opties
beschikbaar": de knop is verdwenen en er staat niets voor in de plaats. Dit is
de fout die je op een breed scherm nooit ziet.

**Stuur de volgorde met `priority`, niet met de plek in de HTML.** Items met een
lagere priority verhuizen als eerste naar de overloop. Wat altijd zichtbaar
moet blijven (de primaire actie) geef je een hogere priority. Items met dezelfde
priority verhuizen samen, waar ze ook staan.

**Zet `size` op de werkbalk, niet op elke knop.** De werkbalk geeft het door aan
alle child-controls. Op `lg` zetten de overloopknop en de lg-geschikte kinderen
hun label onder het icoon.

**Een `label` is alleen nodig bij meerdere werkbalken op één pagina.** Dan wel
doen: anders kan een schermlezergebruiker ze niet uit elkaar houden.

**Een fluid item groeit mee.** Zet `width`, `min-width` of `max-width` op een
`nldd-toolbar-item` en het vult de beschikbare ruimte; handig voor een zoekveld
in de balk. Zonder die attributen blijft het item zo breed als zijn inhoud.

**Een tabbalk in een paneel hoort geen menu-alternatief te krijgen** maar een
hoge `priority`: tabs die in een menu belanden zijn geen tabs meer.

## Toegankelijkheid

Wat je gratis krijgt: de toolbar-rol, de overloopknop met zijn label en de
`aria-expanded` daarop, en het doorgeven van `size` aan de controls.

Wat jij nog moet doen: een `accessible-label` op elke `nldd-icon-button` (een
icoon alleen zegt een schermlezer niets), een `label` op de werkbalk zelf als er
meer dan één is, en het overloop-alternatief per item.

## Gezien in

`toolbar > toolbar-item` staat honderden keren in het veld. WIES ontdekte de
lege-overloop-fout in productie en gaf daarna elk item een menu-alternatief;
de tabbalk in het opdrachtenpaneel kreeg `priority="1"` in plaats van een menu.
