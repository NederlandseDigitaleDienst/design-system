<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/list-with-rows/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: lijst met rijen

**Welk probleem dit oplost.** Een verzameling records tonen die de gebruiker
moet kunnen scannen, en waar hij per record iets mee kan doen: openen,
aanvinken, een actie kiezen.

**Wanneer wel.** Een reeks gelijkwaardige items met tekst en hoogstens een paar
acties per rij.

**Wanneer niet.** Vergelijkt de gebruiker kolommen met elkaar, dan is het een
[tabel](../../nldd-design/reference.md#nldd-table). Gaat het om een handvol
gelijkwaardige blokken met een afbeelding of veel tekst, dan is het een
[collection](../../nldd-design/reference.md#nldd-collection) met kaarten.

## Compositie

```
nldd-list                      accessible-label, variant, type
  └─ nldd-list-item            size, en hoogstens één van href, button, checkbox, radio
       └─ cellen, in de volgorde waarin ze staan
            nldd-icon-cell     een icoon vooraan
            nldd-text-cell     text, overline, supporting-text; vult de rij
            nldd-text-cell     width="fit-content", komt daardoor achteraan
```

```html
<nldd-list accessible-label="Dossiers">
  <nldd-list-item href="#dossier-2024-001">
    <nldd-icon-cell icon="document"></nldd-icon-cell>
    <nldd-text-cell
      text="Dossier 2024-001"
      supporting-text="Laatst gewijzigd op 3 maart"
    ></nldd-text-cell>
    <nldd-text-cell
      width="fit-content"
      color="secondary"
      text="In behandeling"
    ></nldd-text-cell>
  </nldd-list-item>

  <nldd-list-item href="#dossier-2024-002">
    <nldd-icon-cell icon="document"></nldd-icon-cell>
    <nldd-text-cell
      text="Dossier 2024-002"
      supporting-text="Laatst gewijzigd op 28 februari"
    ></nldd-text-cell>
    <nldd-text-cell
      width="fit-content"
      color="success"
      text="Afgerond"
    ></nldd-text-cell>
  </nldd-list-item>
</nldd-list>
```

## Waarom zo

**Alles in een rij staat in een cel.** De
[cel](../../nldd-design/reference.md#nldd-text-cell) bepaalt
lettertype, grootte, kleur en uitlijning, afgestemd op de rij. Kale tekst krijgt
daar niets van mee, en de
[rij](../../nldd-design/reference.md#nldd-list-item) waarschuwt er in
development voor. Opmaak stuur je via de attributen van de cel, zoals `color`
en `**vet**` in `text`, niet met eigen CSS.

**Eén actie maakt de rij zelf de control, twee of meer krijgen elk een
segment.** Met één actie is de hele rij één groot klikvlak. Heeft een rij meer
acties, geef dan elke actie een eigen
[segment](../../nldd-design/reference.md#nldd-list-item-segment) en laat
de rij zelf zonder `href` of `button`. Beide tegelijk nest een control in een
control: een dubbele tabstop, en de knop kan de link activeren. Ook daarvoor
waarschuwt de rij.

```html
<nldd-list accessible-label="Opdrachten">
  <nldd-list-item>
    <nldd-list-item-segment
      href="#modernisering-inkoop"
      width="full"
    >
      <nldd-text-cell
        text="Modernisering Inkoop"
        supporting-text="Rijkswaterstaat"
      ></nldd-text-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      button
      accessible-label="Bewerk Modernisering Inkoop"
    >
      <nldd-icon-cell
        icon="edit"
        size="20"
      ></nldd-icon-cell>
    </nldd-list-item-segment>
  </nldd-list-item>

  <nldd-list-item>
    <nldd-list-item-segment
      href="#open-data-architectuur"
      width="full"
    >
      <nldd-text-cell
        text="Open Data Architectuur"
        supporting-text="Kadaster"
      ></nldd-text-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      button
      accessible-label="Bewerk Open Data Architectuur"
    >
      <nldd-icon-cell
        icon="edit"
        size="20"
      ></nldd-icon-cell>
    </nldd-list-item-segment>
  </nldd-list-item>
</nldd-list>
```

**De lijst toont zelf zijn lege toestand.** Vul `slot="empty"` en
`slot="no-results"` in plaats van een eigen "Geen resultaten" naast de
[lijst](../../nldd-design/reference.md#nldd-list). Dat zijn twee
verschillende zinnen: `empty` betekent dat er niets is, `no-results` dat je
filter niets overlaat. Bij `no-results` blijven het zoekveld en de werkbalk
staan, want dat is de weg terug. Verberg de lijst dus ook niet met `hidden` als
er niets in staat, want dan verdwijnt de lege toestand mee.

```html
<nldd-list accessible-label="Dossiers">
  <nldd-inline-dialog
    slot="empty"
    text="Nog geen dossiers"
    supporting-text="Zodra er een aanvraag binnenkomt, verschijnt die hier."
  ></nldd-inline-dialog>
  <nldd-inline-dialog
    slot="no-results"
    text="Geen dossiers gevonden"
    supporting-text="Pas je zoekopdracht of filters aan."
  ></nldd-inline-dialog>
</nldd-list>
```

## Toegankelijkheid

Wat je gratis krijgt: de rollen en de pijltjesnavigatie die bij het `type` van
de lijst horen, één tabstop voor de hele lijst, en een waarschuwing in
development bij kale tekst of een control in een control.

Wat jij nog moet doen: een `accessible-label` op de lijst, het `type` dat past
bij wat de rijen doen, en een `accessible-label` op een segment dat alleen een
icoon bevat.

## Gezien in

De meest voorkomende compositie op dit systeem, in elk onderzocht product en in
elk framework. De lege toestanden zijn de uitzondering: `slot="empty"` en
`slot="no-results"` worden vrijwel nergens gebruikt, ook niet in apps die
honderden rijen tonen. Ze doen precies wat je anders zelf nabouwt, en vrijwel
niemand vindt ze.
