<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/form/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: formulier

**Welk probleem dit oplost.** Gegevens van iemand vragen, in een indeling die
leesbaar blijft, met labels die aan hun veld vastzitten en fouten die op de
juiste plek en het juiste moment verschijnen.

**Wanneer wel.** Elke keer dat je invoervelden verzamelt die samen verstuurd
worden.

**Wanneer niet.** Voor één los zoekveld in een werkbalk gebruik je een
[zoekveld](../../nldd-design/reference.md#nldd-search-field) zonder formulier
eromheen. En voor een lange reeks stappen: geen wizard, zie de
[ontwerprichtlijnen](../../nldd-design/design-guidelines.md).

## Compositie

```
nldd-form                              name, method, label-alignment
  ├─ nldd-form-section                 text, supporting-text; een groep velden
  │    └─ nldd-form-field              label, optional
  │         ├─ het invoerveld          nldd-text-field, nldd-dropdown, …
  │         ├─ nldd-validation-list    de eisen aan de waarde
  │         └─ nldd-form-field-help-text  uitleg die niets tegenhoudt
  └─ nldd-form-actions                 de primaire actie, type="submit"
```

```html
<nldd-form
  name="aanvraag"
  method="post"
>
  <nldd-form-section
    text="Contactgegevens"
    supporting-text="Zo kunnen we je bereiken."
  >
    <nldd-form-field label="E-mailadres">
      <nldd-text-field
        name="email"
        type="email"
        autocomplete="email"
        required
      ></nldd-text-field>
      <nldd-validation-list>
        <nldd-validation-item required>Vul je e-mailadres in</nldd-validation-item>
        <nldd-validation-item match="@">Een apenstaartje</nldd-validation-item>
      </nldd-validation-list>
      <nldd-form-field-help-text>
        We sturen een bevestiging naar dit adres.
      </nldd-form-field-help-text>
    </nldd-form-field>

    <nldd-form-field
      label="Telefoonnummer"
      optional
    >
      <nldd-text-field
        name="telefoon"
        type="tel"
        autocomplete="tel"
      ></nldd-text-field>
    </nldd-form-field>
  </nldd-form-section>

  <nldd-form-section text="Je vraag">
    <nldd-form-field label="Waar gaat je vraag over?">
      <nldd-multi-line-text-field
        name="vraag"
        required
      ></nldd-multi-line-text-field>
      <nldd-validation-list>
        <nldd-validation-item required>Schrijf je vraag op</nldd-validation-item>
      </nldd-validation-list>
    </nldd-form-field>
  </nldd-form-section>

  <nldd-form-actions>
    <nldd-button
      variant="primary"
      type="submit"
      text="Verstuur aanvraag"
    ></nldd-button>
  </nldd-form-actions>
</nldd-form>
```

## Waarom zo

**Het veld regelt de koppelingen, jij zet alleen de onderdelen erin.** Een
[form field](../../nldd-design/reference.md#nldd-form-field) vindt het
invoerveld tussen zijn kinderen en koppelt het label, de eisen en de hulptekst
eraan. Geen `for` en geen `id`: zet je die zelf, dan ga je ertegen in.

**Groepeer met een form section, niet met een eigen kop en een div.** Een
[form section](../../nldd-design/reference.md#nldd-form-section) rendert een
echte fieldset, dus een schermlezer noemt de groep als je het eerste veld
binnengaat. Een groepsnaam is geen kop: zet voor de paginastructuur een echte
kop boven het formulier.

**Zet `label-alignment` op het formulier, niet per veld.** Het
[formulier](../../nldd-design/reference.md#nldd-form) geeft hem door aan elk veld
en aan de acties, zodat de knoppen onder de velden uitkomen en niet onder de
labels. Daarom staan de acties in een
[form actions](../../nldd-design/reference.md#nldd-form-actions) en niet los
onder het formulier.

**Eén primaire actie, zonder "Annuleer" ernaast.** Een uitweg pal naast de knop
die verstuurt kost bij een misklik alles wat er is ingevuld. Heeft het formulier
een uitweg nodig, zet die dan op afstand, bijvoorbeeld in de titelbalk. Zie de
[ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren).

**Markeer wat optioneel is, niet wat verplicht is.** `optional` op het veld
toont zelf het label "Optioneel". Verplichte velden zijn de regel, dus die
krijgen geen sterretje.

**De eisen staan in een validation list, geschreven als eis.** Een
[validation list](../../nldd-design/reference.md#nldd-validation-list) toont een
eis pas als de waarde er niet aan voldoet, en koppelt de fout aan het veld.
Schrijf een item als de eis ("Een apenstaartje"), niet als de opdracht ("Vul een
apenstaartje in").

**Importeer de globale stylesheet.** Het formulier en de form section hebben
geen shadow DOM: autofill vindt een invoerveld alleen met een echte `<form>`
erboven, en een `<legend>` in de shadow DOM wordt niet overal als groepsnaam
voorgelezen. Hun opmaak zit daarom in `@nldd/design-system/styles`. Laat je die
stylesheet weg, dan lijkt het formulier kapot.

## Toegankelijkheid

Wat je gratis krijgt: de koppeling van label en veld, de groepsnaam van elke
form section, de fout die aan het veld gekoppeld wordt, en de focus die bij het
versturen naar het eerste veld gaat dat niet klopt.

Wat jij nog moet doen: `autocomplete` per veld, want de browser kan niet raden
wat een veld betekent, en een `type` die bij de invoer past, zoals `email` of
`tel`.

## Gezien in

Een form field met een invoerveld erin is een van de meest voorkomende
composities op dit systeem. De form section juist niet, terwijl apps de
groepering wel met de hand nabouwen: daarom staat hij hier in de compositie.
