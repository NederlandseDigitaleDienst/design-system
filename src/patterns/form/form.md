# Formulier

**Welk probleem dit oplost.** Gegevens van iemand vragen, in een indeling die leesbaar blijft, met labels die aan hun veld vastzitten en fouten die op de juiste plek en het juiste moment verschijnen.

**Wanneer wel.** Elke keer dat je invoervelden verzamelt die samen verstuurd worden.

**Wanneer niet.** Voor één los zoekveld in een werkbalk gebruik je een [`nldd-search-field`](/componenten/search-field/) zonder formulier eromheen. Velden waarmee iemand een lijst kleiner maakt zijn geen formulier maar filters, zie [filteren](/patronen/filtering/). En is het te veel voor één scherm, dan knip je het in losse pagina’s met een [`nldd-step-indicator`](/componenten/step-indicator/) erboven, elk met hun eigen formulier.

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

<!-- voorbeeld: Standaard -->

De volgorde volgt het gedachteproces en niet de database, zie de [ontwerprichtlijnen](/richtlijnen/#invoer-en-formulieren).

## Waarom zo

**Het veld regelt de koppelingen, jij zet alleen de onderdelen erin.** Een [`nldd-form-field`](/componenten/form-field/) vindt het invoerveld tussen zijn kinderen en koppelt het label, de eisen en de hulptekst eraan. Geen `for` en geen `id`: zet je die zelf, dan ga je ertegen in.

**Een form section is voor de groepsnaam en de gedeelde uitleg.** Een [`nldd-form-section`](/componenten/form-section/) rendert een `fieldset` met een `legend`, en die legend hoort een schermlezer bij elk veld in de groep. Dat is winst zodra dezelfde labels twee keer voorkomen (je eigen naam en die van degene voor wie je aanvraagt) of zodra één zin voor alle velden geldt, zoals hier waarom je die gegevens vraagt.

**Zet `label-alignment` op het formulier, niet per veld.** Het [`nldd-form`](/componenten/form/) geeft die door aan elk veld en aan de acties, zodat de knoppen onder de velden uitkomen en niet onder de labels. Daarom staan de acties in een [`nldd-form-actions`](/componenten/form-actions/) en niet los onder het formulier.

**Eén primaire actie, zonder "Annuleer" ernaast.** Een uitweg pal naast de knop die verstuurt kost bij een misklik alles wat er is ingevuld. Heeft het formulier een uitweg nodig, zet die dan op afstand, bijvoorbeeld in de titelbalk. Zie de [ontwerprichtlijnen](/richtlijnen/#invoer-en-formulieren).

**Zet de actie in een button group, ook als het er één is.** De [`nldd-button-group`](/componenten/button-group/) kijkt naar de eigen breedte: boven de sm-grens een rij, daaronder gestapeld over de volle breedte. Dat scheelt je een `width="full"` die je in een breder formulier weer niet wilt, en komt er later een tweede knop bij, dan hoeft er niets te veranderen.

**De knop hoort in het formulier.** Binnen `nldd-form` verstuurt `type="submit"` het formulier zelf, met de validatie en de foutafhandeling die daarbij horen. Moet de knop er toch buiten staan, bijvoorbeeld in een sticky footer, geef het [`nldd-form`](/componenten/form/) dan een `id` en de knop een `form` die daarnaar wijst. Zonder een van die twee is het een knop zonder formulier, en die doet niets.

**Markeer wat optioneel is, niet wat verplicht is.** `optional` op het veld toont zelf het label "Optioneel". Waarom dat zo is, staat in de [ontwerprichtlijnen](/richtlijnen/#invoer-en-formulieren).

**De eisen staan in een validation list.** Een [`nldd-validation-list`](/componenten/validation-list/) toont een eis pas als de waarde er niet aan voldoet, en koppelt de fout aan het veld. Schrijf een item als eis en niet als opdracht, zie de [ontwerprichtlijnen](/richtlijnen/#copywriting): dezelfde regel staat er vooraf als wat het veld wil en achteraf als wat er nog niet klopt, dus hij moet op allebei die momenten kloppen. Tekst die niemand tegenhoudt, zoals "We sturen een bevestigingsmail naar dit adres", is geen eis maar een `nldd-form-field-help-text`. En een veld dat optioneel is heeft geen eis, dus ook geen lijst.

**Importeer de globale stylesheet.** [`nldd-form`](/componenten/form/) en de form section staan in de light DOM, dus hun opmaak zit in `@nldd/design-system/styles` en niet in een shadow root. Laat je die stylesheet weg, dan lijkt het formulier kapot.

## Toegankelijkheid

Wat je gratis krijgt: de koppeling van label en veld, de groepsnaam van elke form section, de fout die aan het veld gekoppeld wordt, en de focus die bij het versturen naar het eerste veld gaat dat niet klopt.

Wat jij nog moet doen: `autocomplete` per veld, want de browser kan niet raden wat een veld betekent, en een `type` die bij de invoer past, zoals `email` of `tel`.

## Gezien in

Een form field met een invoerveld erin is een van de meest voorkomende composities op dit systeem. De form section juist niet, terwijl apps de groepering wel met de hand nabouwen: daarom staat die hier in de compositie.
