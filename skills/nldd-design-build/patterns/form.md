<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/form/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: formulier

Een formulier verzamelt de gegevens die nodig zijn om een taak uit te voeren of een aanvraag te versturen. Gebruik het als iemand informatie moet invullen of keuzes moet doorgeven. Vraag alleen wat nodig is, leg onduidelijke vragen uit en vertel wat er na het verzenden gebeurt.

## Compositie

```
nldd-form                              name, method, label-alignment
  ├─ nldd-form-section                 text, supporting-text; een groep velden
  │    └─ nldd-form-field              label, optional
  │         ├─ het invoerveld          nldd-text-field, nldd-dropdown, …
  │         ├─ nldd-validation-list    de eisen aan de waarde
  │         └─ nldd-form-field-help-text  uitleg die niets tegenhoudt
  └─ nldd-form-actions
       └─ nldd-button-group            de primaire actie, type="submit"
```

```html
<nldd-form
  name="aanvraag"
  method="post"
>
  <nldd-form-field label="Je vraag">
    <nldd-multi-line-text-field
      name="vraag"
      required
    ></nldd-multi-line-text-field>
    <nldd-validation-list>
      <nldd-validation-item required>Je vraag is nodig om te kunnen versturen.</nldd-validation-item>
    </nldd-validation-list>
  </nldd-form-field>

  <nldd-form-section
    text="Hoe kunnen we je bereiken?"
    supporting-text="We gebruiken je gegevens alleen om je vraag te beantwoorden."
  >
    <nldd-form-field
      label="Naam"
      optional
    >
      <nldd-text-field
        name="naam"
        autocomplete="name"
      ></nldd-text-field>
    </nldd-form-field>

    <nldd-form-field label="E-mailadres">
      <nldd-text-field
        name="email"
        type="email"
        autocomplete="email"
        required
      ></nldd-text-field>
      <nldd-validation-list>
        <nldd-validation-item required>Een e-mailadres is nodig om te kunnen antwoorden.</nldd-validation-item>
        <nldd-validation-item match="@">Een e-mailadres bevat een apenstaartje.</nldd-validation-item>
      </nldd-validation-list>
    </nldd-form-field>

  </nldd-form-section>

  <nldd-form-actions>
    <nldd-button-group>
      <nldd-button
        appearance="primary"
        type="submit"
        text="Verstuur aanvraag"
      ></nldd-button>
    </nldd-button-group>
  </nldd-form-actions>
</nldd-form>
```

De volgorde volgt het gedachteproces en niet de database, zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren).

## Waarom zo

**Het veld regelt de koppelingen, jij zet alleen de onderdelen erin.** Een [`nldd-form-field`](../../nldd-design/reference.md#nldd-form-field) vindt het invoerveld tussen zijn kinderen en koppelt het label, de eisen en de hulptekst eraan. Geen `for` en geen `id`: zet je die zelf, dan ga je ertegen in.

**Een form section is voor de groepsnaam en de gedeelde uitleg.** Een [`nldd-form-section`](../../nldd-design/reference.md#nldd-form-section) rendert een `fieldset` met een `legend`, en die legend hoort een schermlezer bij elk veld in de groep. Dat is winst zodra dezelfde labels twee keer voorkomen (je eigen naam en die van degene voor wie je aanvraagt) of zodra één zin voor alle velden geldt, zoals hier waarom je die gegevens vraagt.

**Zet `label-alignment` op het formulier, niet per veld.** Het [`nldd-form`](../../nldd-design/reference.md#nldd-form) geeft die door aan elk veld en aan de acties, zodat de knoppen onder de velden uitkomen en niet onder de labels. Daarom staan de acties in een [`nldd-form-actions`](../../nldd-design/reference.md#nldd-form-actions) en niet los onder het formulier.

**Eén primaire actie, zonder "Annuleer" ernaast.** Een uitweg pal naast de knop die verstuurt kost bij een misklik alles wat er is ingevuld. Heeft het formulier een uitweg nodig, zet die dan op afstand, bijvoorbeeld in de titelbalk. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren).

**Zet de actie in een button group, ook als het er één is.** De [`nldd-button-group`](../../nldd-design/reference.md#nldd-button-group) kijkt naar de eigen breedte: een rij, en bij 480px of smaller gestapeld over de volle breedte. Dat scheelt je een `width="full"` die je in een breder formulier weer niet wilt, en komt er later een tweede knop bij, dan hoeft er niets te veranderen.

**De knop hoort in het formulier.** Binnen `nldd-form` verstuurt `type="submit"` het formulier zelf, met de validatie en de foutafhandeling die daarbij horen. Moet de knop er toch buiten staan, bijvoorbeeld in een sticky footer, geef het [`nldd-form`](../../nldd-design/reference.md#nldd-form) dan een `id` en de knop een `form` die daarnaar wijst. Zonder een van die twee is het een knop zonder formulier, en die doet niets.

**Markeer wat optioneel is, niet wat verplicht is.** `optional` op het veld toont zelf het label "Optioneel". Waarom dat zo is, staat in de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren).

**De eisen staan in een validation list.** Een [`nldd-validation-list`](../../nldd-design/reference.md#nldd-validation-list) toont een eis pas als de waarde er niet aan voldoet, en koppelt de fout aan het veld. Schrijf een item als eis en niet als opdracht, zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#copywriting): dezelfde regel staat er vooraf als wat het veld wil en achteraf als wat er nog niet klopt, dus hij moet op allebei die momenten kloppen. Tekst die niemand tegenhoudt, zoals "We sturen een bevestigingsmail naar dit adres", is geen eis maar een `nldd-form-field-help-text`. Een optioneel veld is niet `required`, en een lege waarde komt door elke eis heen. Een formaateis mag er dus wel onder: een telefoonnummer dat je mag weglaten, moet nog steeds een telefoonnummer zijn als je het invult.

**Importeer de globale stylesheet.** [`nldd-form`](../../nldd-design/reference.md#nldd-form) en de form section staan in de light DOM, dus hun opmaak zit in `@nldd/design-system/styles` en niet in een shadow root. Laat je die stylesheet weg, dan lijkt het formulier kapot.

## Toegankelijkheid

Wat je gratis krijgt: de koppeling van label en veld, de groepsnaam van elke form section, de fout die aan het veld gekoppeld wordt, en de focus die bij het versturen naar het eerste veld gaat dat niet klopt.

Wat jij nog moet doen: `autocomplete` per veld, want de browser kan niet raden wat een veld betekent, en een `type` die bij de invoer past, zoals `email` of `tel`.

## Gezien in

Een form field met een invoerveld erin is een van de meest voorkomende composities op dit systeem. De form section juist niet, terwijl apps de groepering wel met de hand nabouwen: daarom staat die hier in de compositie.

## Regels

`nldd lint` controleert dit:

- `combo-box-needs-name`: nldd-combo-box needs `accessible-label` or a labeled nldd-form-field around it, or it has no accessible name.
- `editor-needs-name`: An editor needs `accessible-label`, `input-id` or a labeled nldd-form-field around it, or it has no accessible name (WCAG SC 4.1.2).
- `form-action-in-button-group`: Put the action in a nldd-button-group, also when there is only one.
- `form-field-needs-input`: nldd-form-field holds no form input, so the label cannot name anything or move focus into it.
- `form-section-needs-name`: nldd-form-section needs `text` or `supporting-text`: without either its fieldset has no accessible name, and a screen reader announces just "group" or nothing.
- `multi-line-text-field-needs-name`: nldd-multi-line-text-field needs `accessible-label`, `input-id` or a labeled nldd-form-field around it, or it has no accessible name.
- `number-field-needs-name`: nldd-number-field needs `accessible-label` or a labeled nldd-form-field around it, or a screen reader cannot announce its purpose.
- `optional-field-required`: Drop `required`, or `optional`: the field cannot be both.
- `radio-button-group-needs-name`: nldd-radio-button-group needs `accessible-label`, `accessible-labeled-by` or a labeled nldd-form-field around it, or it has no accessible name.
- `segmented-control-required-not-enforced`: `required` on a checkbox group is announced but not enforced: HTML has no way to say "at least one of these", so the form still submits with nothing selected. Check it yourself on submit, or use radio mode.
- `submit-button-needs-form`: Put this button in the form, or give the nldd-form an `id` and point `form` at it. As it stands it submits nothing.
- `switch-needs-name`: nldd-switch needs `accessible-label` or a labeled nldd-form-field around it, or use nldd-switch-field. Without one it has no accessible name.
- `toggle-button-group-required-not-enforced`: `required` on a checkbox group is announced but not enforced: HTML has no way to say "at least one of these", so the form still submits with nothing selected. Check it yourself on submit, or use radio mode.

Hints: zo is het bedoeld. Die laten niets falen.

- `exit-next-to-primary`: Move this away from the primary action, for example to the title bar, so a misclick does not cost what was entered.
- `field-for-and-id-by-hand`: Drop this: nldd-form-field finds the input among its children and connects the label, the rules and the help text itself.
- `field-marker-in-label`: Set `optional` on the fields that may stay empty, which shows the badge, and write no marker in the label.
- `field-type-missing`: Set the `type` that fits, `email` or `tel`, which brings the right keyboard and validation.
- `form-action-outside-actions`: Put the actions in nldd-form-actions, which lines them up with the fields instead of the labels.
- `label-alignment-per-field`: Set `label-alignment` on nldd-form, which passes it to every field and to the actions, so the buttons line up with the fields.
- `title-in-form`: Use nldd-form-section with `text`: its legend reaches a screen reader with every field in the group.
