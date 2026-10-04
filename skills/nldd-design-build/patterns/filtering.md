<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/filtering/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: filteren

**Welk probleem dit oplost.** Een lange lijst terugbrengen tot wat je zoekt, met de filters in beeld, zodat zichtbaar blijft waarom er iets ontbreekt, en met een weg terug.

**Wanneer wel.** Elke verzameling die langer wordt dan een scherm, of waar iemand een deelverzameling zoekt. Een lijst, een tabel, een kaartenoverzicht.

**Wanneer niet.** Bij een handvol rijen filtert niemand: laat het weg. Gaat het om één zoekterm zonder verdere criteria, dan is een [`nldd-search-field`](../../nldd-design/reference.md#nldd-search-field) boven de lijst genoeg, en heb je geen zijbalk nodig.

## Compositie

```
nldd-page
  └─ nldd-sidebar-section           sidebar-label, breed een kolom, smal een sheet
       ├─ nldd-title                slot="header", boven beide kolommen
       ├─ nldd-container            slot="sidebar", met padding
       │    ├─ nldd-title           per filtergroep
       │    └─ nldd-list            een rij per optie, de rij is de checkbox
       ├─ nldd-toolbar              zoeken links, de knop naar de filters rechts
       ├─ nldd-container            layout="wrap", de strip met actieve filters
       │    └─ nldd-token           control="dismiss", één per actieve waarde
       ├─ nldd-text                 het aantal resultaten, met aria-live
       └─ nldd-list                 met slot="no-results"
            └─ nldd-list-item       de naam, de status als dot, een chevron
```

```html
<style>
  /* The section owns the switch; this reveals the trigger only when there is
     a sheet to open. :not([hidden]) keeps the toolbar's own overflow working. */
  #filters-openen {
    display: none;
  }

  nldd-sidebar-section[collapsed] #filters-openen:not([hidden]) {
    display: inline-flex;
  }
</style>

<nldd-page>
  <nldd-sidebar-section
    sidebar-label="Filters"
    translations='{"components.sidebar-section.sheet-dismiss-action": "Klaar"}'
  >
    <nldd-title
      slot="header"
      size="2"
      text="Dossiers"
      heading-level="1"
    ></nldd-title>

    <nldd-container
      slot="sidebar"
      padding="16"
    >
      <nldd-title
        size="5"
        text="Status"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer size="4"></nldd-spacer>
      <nldd-list
        appearance="simple"
        dividers="never"
        accessible-label="Status"
      >
        <nldd-list-item
          checkbox
          checked
        >
          <nldd-cell>
            <nldd-checkbox decorative checked></nldd-checkbox>
          </nldd-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell text="In behandeling"></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell
            width="fit-content"
            horizontal-alignment="right"
            color="secondary"
            text="12"
          ></nldd-text-cell>
        </nldd-list-item>
        <nldd-list-item
          checkbox
          checked
        >
          <nldd-cell>
            <nldd-checkbox decorative checked></nldd-checkbox>
          </nldd-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell text="Afgerond"></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell
            width="fit-content"
            horizontal-alignment="right"
            color="secondary"
            text="4"
          ></nldd-text-cell>
        </nldd-list-item>
      </nldd-list>
      <nldd-spacer size="24"></nldd-spacer>
      <nldd-title
        size="5"
        text="Team"
        heading-level="2"
      ></nldd-title>
      <nldd-spacer size="4"></nldd-spacer>
      <nldd-list
        appearance="simple"
        dividers="never"
        accessible-label="Team"
      >
        <nldd-list-item
          checkbox
        >
          <nldd-cell>
            <nldd-checkbox decorative></nldd-checkbox>
          </nldd-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell text="Uitvoering"></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell
            width="fit-content"
            horizontal-alignment="right"
            color="secondary"
            text="9"
          ></nldd-text-cell>
        </nldd-list-item>
        <nldd-list-item
          checkbox
        >
          <nldd-cell>
            <nldd-checkbox decorative></nldd-checkbox>
          </nldd-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell text="Beleid"></nldd-text-cell>
          <nldd-spacer-cell size="8"></nldd-spacer-cell>
          <nldd-text-cell
            width="fit-content"
            horizontal-alignment="right"
            color="secondary"
            text="7"
          ></nldd-text-cell>
        </nldd-list-item>
      </nldd-list>
    </nldd-container>

    <nldd-toolbar label="Zoeken en filteren">
      <nldd-toolbar-item
        slot="start"
        min-width="240px"
        width="100%"
        max-width="560px"
      >
        <nldd-search-field placeholder="Zoeken"></nldd-search-field>
        <nldd-menu-item
          slot="overflow"
          icon="search"
          text="Zoeken"
        ></nldd-menu-item>
      </nldd-toolbar-item>

      <nldd-toolbar-item
        id="filters-openen"
        slot="end"
      >
        <nldd-button
          appearance="secondary"
          start-icon="filter"
          text="Filters"
        ></nldd-button>
        <nldd-menu-item
          slot="overflow"
          icon="filter"
          text="Filters"
        ></nldd-menu-item>
      </nldd-toolbar-item>
    </nldd-toolbar>

    <nldd-spacer size="16"></nldd-spacer>

    <nldd-container
      layout="wrap"
      gap="8"
      vertical-alignment="center"
    >
      <nldd-token
        text="Status: In behandeling"
        control="dismiss"
      ></nldd-token>
      <nldd-token
        text="Status: Afgerond"
        control="dismiss"
      ></nldd-token>
    </nldd-container>

    <nldd-spacer size="16"></nldd-spacer>

    <nldd-text
      size="sm"
      color="secondary"
      aria-live="polite"
    >2 dossiers</nldd-text>

    <nldd-spacer size="4"></nldd-spacer>

    <nldd-list accessible-label="Dossiers">
      <nldd-inline-dialog
        slot="no-results"
        icon="magnifier"
        text="Geen dossiers gevonden"
        supporting-text="Pas je zoekopdracht of filters aan."
      ></nldd-inline-dialog>
      <nldd-list-item href="#dossier-d-318">
        <nldd-text-cell
          hide-below="md"
          text="Dossier D-318"
          supporting-text="Team Uitvoering"
        ></nldd-text-cell>
        <nldd-text-cell
          hide-above="sm"
          supporting-text="Team Uitvoering"
        >
          Dossier D-318
          <nldd-badge
            size="sm"
            color="neutral"
            text="In behandeling"
          ></nldd-badge>
        </nldd-text-cell>
        <nldd-spacer-cell
          size="8"
          hide-below="md"
        ></nldd-spacer-cell>
        <nldd-cell hide-below="md">
          <nldd-badge
            color="neutral"
            decorative
          ></nldd-badge>
        </nldd-cell>
        <nldd-spacer-cell
          size="8"
          hide-below="md"
        ></nldd-spacer-cell>
        <nldd-text-cell
          hide-below="md"
          width="fit-content"
          text="In behandeling"
        ></nldd-text-cell>
        <nldd-spacer-cell size="8"></nldd-spacer-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
      <nldd-list-item href="#dossier-d-319">
        <nldd-text-cell
          hide-below="md"
          text="Dossier D-319"
          supporting-text="Team Beleid"
        ></nldd-text-cell>
        <nldd-text-cell
          hide-above="sm"
          supporting-text="Team Beleid"
        >
          Dossier D-319
          <nldd-badge
            size="sm"
            color="success"
            text="Afgerond"
          ></nldd-badge>
        </nldd-text-cell>
        <nldd-spacer-cell
          size="8"
          hide-below="md"
        ></nldd-spacer-cell>
        <nldd-cell hide-below="md">
          <nldd-badge
            color="success"
            decorative
          ></nldd-badge>
        </nldd-cell>
        <nldd-spacer-cell
          size="8"
          hide-below="md"
        ></nldd-spacer-cell>
        <nldd-text-cell
          hide-below="md"
          width="fit-content"
          text="Afgerond"
        ></nldd-text-cell>
        <nldd-spacer-cell size="8"></nldd-spacer-cell>
        <nldd-icon-cell
          size="20"
          color="secondary"
          icon="chevron-right"
        ></nldd-icon-cell>
      </nldd-list-item>
    </nldd-list>
  </nldd-sidebar-section>
</nldd-page>
```

Het voorbeeld is smal, dus de filters zitten hier achter de knop. Is de sectie breder dan 1008px, dan staan ze als kolom links en verdwijnt die knop.

## Waarom zo

**De filters staan naast de lijst zolang het past.** Een [`nldd-sidebar-section`](../../nldd-design/reference.md#nldd-sidebar-section) zet ze in een kolom links en schuift ze in een sheet zodra de sectie zelf te smal wordt. Dat scheelt op een breed scherm een klik per aanpassing, en je ziet waar je aan draait terwijl de lijst naast je verandert. De sectie kijkt naar haar eigen breedte en niet naar het venster, dus in een smal paneel van een split view klapt hij net zo in.

**Eén set filters, die van kolom naar sheet verhuist.** De sectie verplaatst de `sidebar`-slot tussen de twee, dus er is nooit een tweede kopie en de aangevinkte waarden blijven staan bij de wissel. Bouw dus geen eigen sheet naast een eigen kolom: dan heb je twee lijsten die uit elkaar lopen.

**De filteropties zijn een lijst, geen formulier.** Per groep een [`nldd-title`](../../nldd-design/reference.md#nldd-title) en een [`nldd-list`](../../nldd-design/reference.md#nldd-list), en de rij is zelf de checkbox: `checkbox` op de [`nldd-list-item`](../../nldd-design/reference.md#nldd-list-item), met daarin een [`nldd-checkbox`](../../nldd-design/reference.md#nldd-checkbox) die alleen `decorative` de staat toont. Zo is de hele rij het klikdoel in plaats van het vierkantje, past er een aantal achter de naam, en is er één tabstop per optie. Een filter dient ook niets in: er is geen "Opslaan", de lijst verandert terwijl je klikt, dus er valt geen formulier te versturen.

**De knop naar de filters verschijnt alleen als er een sheet is.** De sectie meldt dat zelf met `collapsed`, en jij bepaalt waar de knop staat. In het voorbeeld staat hij rechts in de werkbalk, met een regel CSS ervoor: `nldd-sidebar-section[collapsed] #filters-openen { display: inline-flex }`. Zet er ook een `nldd-menu-item` in `slot="overflow"` bij, want in een smalle werkbalk verhuist de knop naar het overflow-menu. Dat menu toont een kopie maar meldt de keuze als `select` op het origineel, dus luister daarnaar en roep `show()` aan: een menukeuze betekent openen, niet omklappen. Laat je hem altijd staan, dan opent hij op een breed scherm niets.

**Het vinkje in de rij zet je zelf mee.** De rij houdt zijn eigen `checked` bij en meldt de wissel met `change`, maar de [`nldd-checkbox`](../../nldd-design/reference.md#nldd-checkbox) erin is een eigen element met een eigen staat, en `decorative` betekent alleen dat die niets aanneemt of aankondigt. Luister dus naar `change` op de rij en zet `checked` op dat vinkje. Doe je dat niet, dan klikt de rij wel aan en verandert er niets te zien.

**In de sheet staat "Klaar" en niet "Sluit".** Een filter werkt meteen: de lijst verandert terwijl je klikt, dus er valt bij het sluiten niets te bewaren of weg te gooien. Zet daarvoor de tekst van de sluitknop om met `translations='{"components.sidebar-section.sheet-dismiss-action": "Klaar"}'`. "Sluit" zou suggereren dat je iets afbreekt, en dan gaat iemand twijfelen of de keuzes wel meetellen.

**Toon wélke filters aanstaan, niet hoeveel.** Een strip met een [`nldd-token`](../../nldd-design/reference.md#nldd-token) per actieve waarde zegt precies wat er is weggefilterd, en elk token is zijn eigen weg terug. Een token en geen tag of badge: alleen een token kun je weghalen. Zijn verwijderknop noemt het token al (`Verwijder "Status: In behandeling"`), dus daar hoef je niets voor te schrijven. Geef ook een waarde die nergens meer op uitkomt een token, met de naam die je wél kent: zonder token is dat een filter dat de lijst leegmaakt en dat je niet kunt weghalen.

**Geen knop die alles tegelijk wist.** Die staat dan naast de kruisjes die er één weghalen, dus een misklik kost je de hele selectie die je net hebt opgebouwd, en er is geen weg terug. Per token weghalen is een paar klikken meer bij de aantallen die je in de praktijk ziet, en dat is het waard. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#invoer-en-formulieren).

**De strip bestaat alleen zolang er filters zijn.** Haal met de laatste token ook de strip en de ruimte erboven weg, anders blijft er een gat staan tussen de werkbalk en de lijst waar niets meer in zit. Dat geldt voor elke losse `nldd-spacer` naast iets dat verdwijnt: die hoort bij wat eronder staat en gaat mee.

**`layout="wrap"` op de strip.** De standaard van [`nldd-container`](../../nldd-design/reference.md#nldd-container) is `stack`, en dan staan de tokens onder elkaar. Met `wrap` lopen ze door op een volgende regel zodra er te veel filters aanstaan.

**Zoeken en filteren horen in dezelfde werkbalk.** Het zoekveld is de grofste filter, dus het staat naast de rest en niet ergens anders op de pagina. Geef het toolbar-item een `min-width` en een `max-width`, dan krimpt het veld mee zonder onleesbaar te worden. Hoe de werkbalk overloopt, staat in [werkbalk met acties](toolbar-with-actions.md).

**Op een klein scherm schuift de status naar de naam.** Een eigen kolom voor de status kost daar te veel van de breedte die de naam nodig heeft. Hoe je een rij per breedte anders indeelt, staat in [lijst](list.md).

**Zet het aantal resultaten onder de filters, met `aria-live="polite"`.** Dat is het enige dat de uitkomst hoorbaar maakt: de [`nldd-list`](../../nldd-design/reference.md#nldd-list) heeft wel live regions, maar gebruikt die voor herordenen, dus filteren verloopt verder stil. Het beantwoordt ook de vraag die een filter oproept (deed dat vinkje iets, en hoeveel), en bij een lijst die pagineert zegt het hoeveel er niet in beeld staat. Houd het kort ("2 dossiers"), klein en secundair: het is een uitkomst en geen kop, dus een [`nldd-text`](../../nldd-design/reference.md#nldd-text) met `size="sm" color="secondary"`. Laat het weg zolang er niets gefilterd is, want dan telt het niets. Dat de lijst leeg is, zegt `no-results` al.

**De lijst toont zelf dat het filter niets overlaat.** Vul `slot="no-results"` met een eigen zin. Het zoekveld en de filters blijven dan staan als weg terug, zie [lijst](list.md).

## Toegankelijkheid

Wat je gratis krijgt: de zoekrol op het veld en de wisknop erin, op elk token een verwijderknop die het token noemt, een formulier waarin elke filtergroep een groepsnaam heeft, en de zijbalk als benoemde regio of als sheet met een titelbalk.

Wat jij nog moet doen: een `sidebar-label` waar die naam vandaan komt, een naam voor het zoekveld, en een zin in `no-results` die uitlegt waarom de lijst leeg is. Het zoekveld neemt de `placeholder` als naam; is die een voorbeeld in plaats van een naam, zet dan `accessible-label`.

## Gezien in

Dit patroon is uit productiecode gedestilleerd en daarna in een tweede product overgenomen. De strip met tokens is het deel dat het vaakst zelf wordt nagebouwd.
