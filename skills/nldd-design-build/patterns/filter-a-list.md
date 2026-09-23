<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/filter-a-list/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: een lijst filteren

**Welk probleem dit oplost.** Een lange lijst doorzoekbaar maken, met filters
die zichtbaar blijven, zodat de gebruiker weet waarom hij niet alles ziet, en
met een weg terug.

**Wanneer wel.** Elke lijst of tabel die langer wordt dan een scherm, of waar de
gebruiker een deelverzameling zoekt.

**Wanneer niet.** Bij een handvol rijen filtert niemand: laat het weg. Gaat het
om één zoekterm zonder verdere criteria, dan is een
[zoekveld](../../nldd-design/reference.md#nldd-search-field) boven de lijst
genoeg, en heb je geen sheet nodig.

## Compositie

```
nldd-page
  ├─ nldd-top-title-bar        slot="header"
  ├─ nldd-search-field         slot="header", onder de titelbalk
  └─ nldd-simple-section
       ├─ nldd-container       layout="wrap", de strip met actieve filters
       │    ├─ nldd-button     opent de sheet met filters
       │    ├─ nldd-token      control="dismiss", één per actieve waarde
       │    └─ nldd-button     "Wis alle filters"
       └─ nldd-list            met slot="no-results"

nldd-sheet                     de filterkeuzes zelf
  └─ nldd-page
       ├─ nldd-top-title-bar   slot="header"
       └─ nldd-form            met een nldd-form-section per filtergroep
```

```html
<nldd-page>
  <nldd-top-title-bar
    slot="header"
    text="Dossiers"
  ></nldd-top-title-bar>
  <nldd-search-field
    slot="header"
    placeholder="Zoek een dossier"
  ></nldd-search-field>

  <nldd-simple-section>
    <nldd-container
      layout="wrap"
      gap="8"
    >
      <nldd-button
        id="filters-openen"
        variant="secondary"
        size="sm"
        text="Filters"
        start-icon="filter"
      ></nldd-button>
      <nldd-token
        text="Status: In behandeling"
        control="dismiss"
      ></nldd-token>
      <nldd-token
        text="Team: Uitvoering"
        control="dismiss"
      ></nldd-token>
      <nldd-button
        variant="neutral-transparent"
        size="sm"
        text="Wis alle filters"
      ></nldd-button>
    </nldd-container>

    <nldd-spacer size="16"></nldd-spacer>

    <nldd-list accessible-label="Dossiers">
      <nldd-inline-dialog
        slot="no-results"
        text="Geen dossiers gevonden"
        supporting-text="Pas je zoekopdracht of filters aan."
      ></nldd-inline-dialog>
      <nldd-list-item href="#dossier-2024-001">
        <nldd-text-cell
          text="Dossier 2024-001"
          supporting-text="In behandeling, team Uitvoering"
        ></nldd-text-cell>
      </nldd-list-item>
      <nldd-list-item href="#dossier-2024-007">
        <nldd-text-cell
          text="Dossier 2024-007"
          supporting-text="In behandeling, team Uitvoering"
        ></nldd-text-cell>
      </nldd-list-item>
    </nldd-list>
  </nldd-simple-section>
</nldd-page>

<nldd-sheet
  placement="right"
  width="400px"
>
  <nldd-page sticky-footer>
    <nldd-top-title-bar
      slot="header"
      text="Filters"
      dismiss-text="Sluiten"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-form name="filters">
        <nldd-form-section text="Status">
          <nldd-checkbox-field
            name="status"
            value="in-behandeling"
            label="In behandeling"
            checked
          ></nldd-checkbox-field>
          <nldd-checkbox-field
            name="status"
            value="afgerond"
            label="Afgerond"
          ></nldd-checkbox-field>
        </nldd-form-section>
        <nldd-form-section text="Team">
          <nldd-checkbox-field
            name="team"
            value="uitvoering"
            label="Uitvoering"
            checked
          ></nldd-checkbox-field>
          <nldd-checkbox-field
            name="team"
            value="beleid"
            label="Beleid"
          ></nldd-checkbox-field>
        </nldd-form-section>
      </nldd-form>
    </nldd-simple-section>

    <nldd-container
      slot="footer"
      padding="16"
    >
      <nldd-button
        variant="primary"
        text="Toon dossiers"
        width="full"
      ></nldd-button>
    </nldd-container>
  </nldd-page>
</nldd-sheet>
```

## Waarom zo

**Het zoekveld staat in de `header`-slot, niet boven de lijst.** Anders scrolt
het mee en is het juist bij een lange lijst uit beeld, precies wanneer je het
nodig hebt.

**Toon wélke filters aanstaan, niet hoeveel.** Een strip met een
[token](../../nldd-design/reference.md#nldd-token) per actieve waarde zegt
precies wat er is weggefilterd, en elk token is zijn eigen weg terug. Een token
en geen tag of badge: alleen een token kun je weghalen. Zijn verwijderknop
noemt het token al (`Verwijder "Status: In behandeling"`), dus daar hoef je
niets voor te schrijven. Houd er "Wis alle filters" naast: een waarde die
nergens meer op uitkomt, krijgt geen eigen token, en dan is dat de enige uitweg.

**`layout="wrap"` op de strip.** De standaard van
[container](../../nldd-design/reference.md#nldd-container) is `stack`, en dan
staan de tokens onder elkaar. Met `wrap` lopen ze door op een volgende regel
zodra er te veel filters aanstaan.

**De filterkeuzes staan in een sheet die altijd in de pagina staat.** Een
[sheet](../../nldd-design/reference.md#nldd-sheet) is verborgen tot je `open`
zet, dus je hoeft hem niet pas op te halen als hij opent. Doe je dat wel, dan is
het formulier er meestal niet op het moment dat een token wordt weggeklikt, en
vindt je handler niets om bij te werken. Hoe de sheet verder in elkaar zit,
staat in [bewerken in een sheet](edit-in-a-sheet.md).

**De lijst toont zelf dat het filter niets overlaat.** Vul `slot="no-results"`
met een eigen zin. Het zoekveld en de filters blijven dan staan als weg terug,
zie [lijst met rijen](list-with-rows.md).

## Toegankelijkheid

Wat je gratis krijgt: de zoekrol op het veld en de wisknop erin, op elk token
een verwijderknop die het token noemt, en een formulier waarin elke filtergroep
een groepsnaam heeft.

Wat jij nog moet doen: een naam voor het zoekveld, en een zin in `no-results`
die uitlegt waarom de lijst leeg is. Het zoekveld neemt de `placeholder` als
naam; is die een voorbeeld in plaats van een naam, zet dan `accessible-label`.

## Gezien in

Dit patroon is uit productiecode gedestilleerd en daarna in een tweede product
overgenomen. De strip met tokens is het deel dat het vaakst zelf wordt
nagebouwd.
