# Patroon: een lijst filteren

**Welk probleem dit oplost.** Een lange lijst doorzoekbaar maken, met filters
die zichtbaar blijven zodat de gebruiker weet waarom hij niet alles ziet, en
met een weg terug.

**Wanneer wel.** Elke lijst of tabel die langer wordt dan een scherm, of waar
de gebruiker een deelverzameling zoekt.

**Wanneer niet.** Bij een handvol rijen filtert niemand; laat het weg. Gaat het
om één zoekterm zonder verdere criteria, dan is een `nldd-search-field` boven de
lijst genoeg en heb je geen sheet nodig.

## Compositie

```
nldd-page
  ├─ nldd-search-field       in slot="header", onder de titelbalk
  ├─ tokenstrip              de actieve filters, met een wis-alles
  │    └─ nldd-token         control="dismiss", één per waarde
  └─ nldd-list               met slots empty en no-results
       └─ rijen

nldd-sheet                   de filterkeuzes zelf
  └─ nldd-page
       ├─ nldd-top-title-bar slot="header"
       └─ nldd-form          checkboxes, radio's, datumvelden
```

## Code

De strip met actieve filters boven de lijst:

```html
<nldd-container layout="wrap" gap="8">
  <nldd-token text="Label: Spoed" control="dismiss" dismiss-text="Verwijder filter"></nldd-token>
  <nldd-token text="Team: Uitvoering" control="dismiss" dismiss-text="Verwijder filter"></nldd-token>
  <nldd-button variant="neutral-transparent" size="sm" text="Wis alle filters"></nldd-button>
</nldd-container>
```

`layout="wrap"` is hier het punt: de standaard van `nldd-container` is `stack`,
en dan staan de tokens onder elkaar in plaats van naast elkaar. Met `wrap`
lopen ze door op een volgende regel zodra er te veel filters aanstaan.

Het zoekveld vastgezet in de kop van de pagina:

```html
<nldd-page>
  <nldd-top-title-bar slot="header" text="Gebruikers"></nldd-top-title-bar>
  <nldd-search-field
    slot="header"
    placeholder="Zoek een gebruiker"
    accessible-label="Zoek een gebruiker"
  ></nldd-search-field>

  <nldd-simple-section>
    <!-- de lijst -->
  </nldd-simple-section>
</nldd-page>
```

## Waarom zo

**Zet het zoekveld in de `header`-slot, niet boven de lijst in de inhoud.**
Anders scrolt het mee en is het juist bij een lange lijst uit beeld, precies
wanneer je het nodig hebt. Staat er iets anders dan de titelbalk in de header,
dan levert dat zelf al de ruimte: geef de eerste sectie er geen extra padding
bovenop.

**Toon wélke filters aanstaan, niet hoeveel.** Een teller op een
filterknop zegt niet wat er is weggefilterd, en telt meestal filtergroepen in
plaats van waarden, zodat twee labels in één groep als "(1)" lezen. Een strip
tokens zegt het precies, en elk token is zijn eigen weg terug. Houd er een "wis
alle filters" naast: een waarde die nergens meer op uitkomt krijgt geen eigen
token, en dan is dat de enige uitweg.

**Gebruik `nldd-token`, niet `nldd-tag`.** Die drie lijken op elkaar en zijn het
niet:

| Component | Waarvoor |
|---|---|
| `nldd-tag` | Een eigenschap die iets heeft (categorie, type, rol). Niet interactief. |
| `nldd-badge` | Een toestand die het systeem zelf bijhoudt ("Actief", "Verlopen"). |
| `nldd-token` | Iets dat de gebruiker kan weghalen of aanklikken. Dus: een filterchip. |

**Render de filter-sheet gewoon in de pagina.** Een `nldd-sheet` is verborgen
tot je `show()` aanroept, dus je hoeft hem niet lui op te halen en bij het
sluiten weer weg te gooien. Doe je dat wel, dan is het formulier er meestal
niet, en dan doen zoeken en het wegklikken van een filter niets omdat de
handler het formulier niet vindt.

**Laat de lege toestand aan de lijst.** Gefilterd naar niets is een andere
toestand dan leeg: vul `slot="no-results"` met een eigen zin, zodat het
zoekveld en de toolbar blijven staan als weg terug. Zie
[lijst met rijen](list-with-rows.md).

**Geef het zoekveld een `accessible-label`.** Het valt terug op de
`placeholder`, maar zodra er een waarde in staat is die niet meer zichtbaar en
heeft een schermlezergebruiker niets.

## Toegankelijkheid

Wat je gratis krijgt: de zoekrol op het veld, de wisknop erin, en de
dismiss-knop op elk token met een eigen label.

Wat jij nog moet doen: `accessible-label` op het zoekveld, een `dismiss-text`
per token die zegt wát je weghaalt, en een zin in `no-results` die uitlegt
waarom de lijst leeg is.

## Gezien in

Dit patroon is uit productiecode gedestilleerd en daarna in een tweede product
overgenomen. De tokenstrip is het deel dat het vaakst zelf wordt nagebouwd.
