# Patroon: formulier

**Welk probleem dit oplost.** Gegevens van iemand vragen, in een indeling die
leesbaar blijft, met labels die aan hun veld vastzitten en fouten die op de
juiste plek en het juiste moment verschijnen.

**Wanneer wel.** Elke keer dat je invoervelden verzamelt die samen verstuurd
worden.

**Wanneer niet.** Voor één los zoekveld in een werkbalk gebruik je
`nldd-search-field` zonder formulier eromheen. Voor een lange reeks stappen:
geen wizard, zie de ontwerprichtlijnen.

## Compositie

```
nldd-form                      (name, method, label-alignment)
  └─ nldd-form-section         (optioneel: groepeert velden onder een kop)
       └─ nldd-form-field      (label, supporting-label, optional)
            ├─ input           (nldd-text-field, nldd-dropdown, …)
            ├─ nldd-validation-list   (de eisen aan de waarde)
            └─ nldd-form-field-help-text  (uitleg die niets tegenhoudt)
  └─ nldd-form-actions
       └─ nldd-button-group
            └─ nldd-button     (type="submit")
```

## Code

```html
<nldd-form name="aanvraag" method="post">
  <nldd-form-section text="Contactgegevens" supporting-text="Zo kunnen we je bereiken.">
    <nldd-form-field label="E-mailadres">
      <nldd-text-field name="email" type="email" autocomplete="email" required></nldd-text-field>
      <nldd-form-field-help-text>
        We sturen een bevestiging naar dit adres.
      </nldd-form-field-help-text>
    </nldd-form-field>

    <nldd-form-field label="Telefoonnummer" optional>
      <nldd-text-field name="phone" type="tel" autocomplete="tel"></nldd-text-field>
    </nldd-form-field>
  </nldd-form-section>

  <nldd-form-actions>
    <nldd-button-group>
      <nldd-button variant="primary" type="submit" text="Verstuur aanvraag"></nldd-button>
      <nldd-button variant="secondary" text="Annuleer"></nldd-button>
    </nldd-button-group>
  </nldd-form-actions>
</nldd-form>
```

## Waarom zo

**Importeer de globale stylesheet.** `nldd-form` en `nldd-form-section` zijn de
twee uitzonderingen in dit systeem: ze hebben geen shadow DOM, want Chrome's
autofill vindt een native `<input>` alleen als er een `<form>` in de light DOM
boven staat, en een `<legend>` in de shadow DOM wordt door NVDA met Firefox niet
betrouwbaar als groepslabel voorgelezen. Hun opmaak (het verticale ritme, de
fieldset) zit daarom in `dist/css/form.css` en `dist/css/form-section.css`, niet
in een shadow-stylesheet. Importeer je `@nldd/design-system/styles` (of
`global.css`), dan heb je ze. Zonder die import lijkt het formulier kapot en
denk je dat het component niet werkt.

**`nldd-form-field` koppelt label en input zelf.** Geen `for`/`id`-gedoe, en het
zet ook `input-id` en `size` op de input die erin zit. Zet je die zelf, dan ga
je ertegen in.

**Groepeer met `nldd-form-section`, niet met een eigen kop plus div.** Die
rendert een echte `<fieldset>` met `<legend>`, dus een schermlezer noemt de
groepsnaam als je het eerste veld binnengaat. Let op wat het níet is: een
`<legend>` is semantisch een groepslabel en geen kop, dus wie met de H-toets
door de koppen springt, slaat hem over. Gebruik het voor het groeperen van
velden, en zet een echte kop boven het formulier voor de paginastructuur.

**Zet `label-alignment` op het formulier, niet per veld.** `nldd-form` geeft het
door aan alle `nldd-form-field`- en `nldd-form-actions`-kinderen. Een veld dat
er zelf een heeft, wint.

**Markeer optionele velden, niet verplichte.** `nldd-form-field` heeft daar
`optional` voor, dat zelf de "Optioneel"-badge toont. De reden staat in de
ontwerprichtlijnen.

**Acties horen in `nldd-form-actions`,** niet los onder het formulier: dat
component volgt de labeluitlijning van het formulier, zodat de knoppen onder de
velden uitkomen en niet onder de labels.

**Eisen aan een waarde horen in `nldd-validation-list`**, binnen hetzelfde
`nldd-form-field`. De volledige uitleg (wanneer een fout verschijnt, de twee
modi van de lijst, `unmet` voor wat alleen je server weet, en hoe je een eis
formuleert) staat in [`../SKILL.md`](../SKILL.md) onder "Formulieren en
validatiefouten". Schrijf een item als de eis ("Minimaal 8 tekens"), niet als de
opdracht ("Gebruik minimaal 8 tekens").

## Toegankelijkheid

Wat je gratis krijgt: de label-inputkoppeling, de fieldset/legend-semantiek van
`nldd-form-section`, en de foutmelding die aan het veld gekoppeld wordt.

Wat jij nog moet doen: `autocomplete` per veld zetten (de browser kan niet raden
wat een veld betekent), `type` kiezen die bij de invoer past (`email`, `tel`),
en `invalid` pas bij verzending zetten en niet terwijl iemand typt.

## Gezien in

`form-field` met een invoerveld erin is een van de meest voorkomende
composities op dit systeem. `nldd-form-section` juist niet, terwijl apps de
veldgroepering wel met de hand nabouwen: daarom staat het hier expliciet in de
compositie.
