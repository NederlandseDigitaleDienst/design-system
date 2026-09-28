<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/application/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: applicatie

**Welk probleem dit oplost.** Een werkomgeving die de ruimte gebruikt die het scherm biedt: navigatie, een lijst, het gekozen record, een inspector, zoveel ernaast als er past. Wordt het scherm smaller, dan vallen de panelen één voor één weg tot er één overblijft, zonder dat je zelf verbergt, herschikt of een tweede layout bouwt.

**Wanneer wel.** Een scherm waarop je vaak tussen informatie beweegt: zoeken, vergelijken, kiezen, bewerken.

**Wanneer niet.** Een landings-, informatie- of campagnepagina, of een scherm dat een verhaal vertelt. Dat is een [contentpagina](content-page.md).

## Compositie

```
nldd-app-view                                 de buitenste schil
  └─ nldd-bar-split-view                      balken boven of onder de inhoud
       ├─ nldd-split-view-pane                slot="toolbar", above="md"
       │    └─ nldd-container                 met padding
       │         └─ nldd-toolbar              links de secties, rechts zoeken en account
       ├─ nldd-split-view-pane                slot="main"
       │    └─ nldd-navigation-split-view
       │         └─ nldd-split-view-pane      slot="primary-sidebar", "main", "inspector"
       │         └─ nldd-page                 landmarks, accessible-label
       │              ├─ nldd-top-title-bar   slot="header", collapse-anchor
       │              └─ nldd-simple-section
       │                   ├─ nldd-title      slot="header", het anker van de balk
       │                   ├─ nldd-toolbar    de acties van dit paneel
       │                   └─ de inhoud       een lijst, een formulier, een detail
       └─ nldd-split-view-pane                slot="mobile-bar", only="sm"
            └─ nldd-container                 met padding
                 └─ nldd-toolbar              size="lg", dezelfde acties als icoon met label

nldd-sheet                                    het detail van een rij, in de document-root
nldd-side-by-side-split-view                  panelen van gelijk gewicht, slot="pane-1", "pane-2", …
```

```html
<nldd-app-view>
  <nldd-bar-split-view>
    <nldd-split-view-pane
      slot="toolbar"
      above="md"
    >
      <nldd-container padding="8">
        <nldd-toolbar label="Mijn Dienst">
          <nldd-toolbar-item
            slot="start"
            priority="3"
          >
            <nldd-tab-bar
              navigation
              accessible-label="Secties"
            >
              <nldd-tab-bar-item
                href="#dossiers"
                text="Dossiers"
                current
              ></nldd-tab-bar-item>
              <nldd-tab-bar-item
                href="#aanvragen"
                text="Aanvragen"
              ></nldd-tab-bar-item>
            </nldd-tab-bar>
            <nldd-menu-group
              slot="overflow"
              text="Secties"
            >
              <nldd-menu-item
                type="radio"
                text="Dossiers"
                selected
              ></nldd-menu-item>
              <nldd-menu-item
                type="radio"
                text="Aanvragen"
              ></nldd-menu-item>
            </nldd-menu-group>
          </nldd-toolbar-item>

          <nldd-toolbar-item
            slot="end"
            priority="2"
          >
            <nldd-button
              variant="secondary"
              start-icon="search"
              text="Zoeken"
            ></nldd-button>
            <nldd-menu-item
              slot="overflow"
              icon="search"
              text="Zoeken"
            ></nldd-menu-item>
          </nldd-toolbar-item>

          <nldd-toolbar-item
            slot="end"
            priority="1"
          >
            <nldd-icon-button
              icon="account"
              text="Account"
              expandable
            >
              <nldd-menu
                slot="popup"
                placement="bottom-end"
              >
                <nldd-menu-item
                  icon="profile"
                  text="Mijn profiel"
                ></nldd-menu-item>
                <nldd-menu-item
                  icon="settings"
                  text="Instellingen"
                ></nldd-menu-item>
                <nldd-menu-divider></nldd-menu-divider>
                <nldd-menu-item
                  icon="info"
                  text="Over Mijn Dienst"
                ></nldd-menu-item>
                <nldd-menu-item
                  icon="help"
                  text="Help"
                ></nldd-menu-item>
                <nldd-menu-divider></nldd-menu-divider>
                <nldd-menu-item
                  icon="logout"
                  text="Uitloggen"
                ></nldd-menu-item>
              </nldd-menu>
            </nldd-icon-button>
            <nldd-menu-group
              slot="overflow"
              text="Account"
            >
              <nldd-menu-item
                icon="profile"
                text="Mijn profiel"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="settings"
                text="Instellingen"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="info"
                text="Over Mijn Dienst"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="help"
                text="Help"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="logout"
                text="Uitloggen"
              ></nldd-menu-item>
            </nldd-menu-group>
          </nldd-toolbar-item>
        </nldd-toolbar>
      </nldd-container>
    </nldd-split-view-pane>

    <nldd-split-view-pane slot="main">
      <nldd-navigation-split-view>
        <nldd-split-view-pane slot="primary-sidebar">
          <nldd-page
            accessible-label="Navigatie"
            sticky-header
          >
            <nldd-top-title-bar
              slot="header"
              text="Dossiers"
              heading-level="2"
              collapse-anchor="zijbalk-titel"
            ></nldd-top-title-bar>
            <nldd-simple-section>
              <nldd-title
                id="zijbalk-titel"
                slot="header"
                size="4"
                text="Dossiers"
                heading-level="2"
              ></nldd-title>
              <nldd-list
                type="navigation"
                accessible-label="Dossiers filteren"
              >
                <nldd-list-item
                  href="#alle-dossiers"
                  current
                >
                  <nldd-text-cell text="Alle dossiers"></nldd-text-cell>
                </nldd-list-item>
                <nldd-list-item href="#team-uitvoering">
                  <nldd-text-cell text="Team Uitvoering"></nldd-text-cell>
                </nldd-list-item>
                <nldd-list-item href="#gearchiveerd">
                  <nldd-text-cell text="Gearchiveerd"></nldd-text-cell>
                </nldd-list-item>
              </nldd-list>
            </nldd-simple-section>
          </nldd-page>
        </nldd-split-view-pane>

        <nldd-split-view-pane
          slot="main"
          has-content
        >
          <nldd-page
            landmarks="page"
            sticky-header
          >
            <nldd-top-title-bar
              slot="header"
              text="Alle dossiers"
              back-text="Dossiers"
              collapse-anchor="dossiers-titel"
            ></nldd-top-title-bar>
            <nldd-simple-section>
              <nldd-title
                id="dossiers-titel"
                slot="header"
                size="2"
                text="Alle dossiers"
                heading-level="1"
              ></nldd-title>
              <nldd-toolbar label="Alle dossiers">
                <nldd-toolbar-item
                  slot="start"
                  priority="2"
                >
                  <nldd-button
                    variant="primary"
                    start-icon="add"
                    text="Nieuw dossier"
                  ></nldd-button>
                  <nldd-menu-item
                    slot="overflow"
                    text="Nieuw dossier"
                  ></nldd-menu-item>
                </nldd-toolbar-item>
                <nldd-toolbar-item slot="end">
                  <nldd-button
                    variant="secondary"
                    start-icon="filter"
                    text="Filter"
                  ></nldd-button>
                  <nldd-menu-item
                    slot="overflow"
                    icon="filter"
                    text="Filter"
                  ></nldd-menu-item>
                </nldd-toolbar-item>
              </nldd-toolbar>
              <nldd-spacer size="16"></nldd-spacer>
              <nldd-list accessible-label="Alle dossiers">
                <nldd-list-item href="#dossier-d-318">
                  <nldd-text-cell
                    text="Dossier D-318"
                    supporting-text="In behandeling"
                  ></nldd-text-cell>
                  <nldd-icon-cell
                    size="20"
                    color="secondary"
                    icon="chevron-right"
                  ></nldd-icon-cell>
                </nldd-list-item>
                <nldd-list-item href="#dossier-d-319">
                  <nldd-text-cell
                    text="Dossier D-319"
                    supporting-text="Afgerond"
                  ></nldd-text-cell>
                  <nldd-icon-cell
                    size="20"
                    color="secondary"
                    icon="chevron-right"
                  ></nldd-icon-cell>
                </nldd-list-item>
              </nldd-list>
            </nldd-simple-section>
          </nldd-page>
        </nldd-split-view-pane>
      </nldd-navigation-split-view>
    </nldd-split-view-pane>
    <nldd-split-view-pane
      slot="mobile-bar"
      only="sm"
    >
      <nldd-container padding="8">
        <nldd-toolbar
          size="lg"
          label="Mijn Dienst"
        >
          <nldd-toolbar-item slot="start">
            <nldd-tab-bar
              navigation
              accessible-label="Secties"
            >
              <nldd-tab-bar-item
                icon="folder"
                href="#dossiers"
                text="Dossiers"
                current
              ></nldd-tab-bar-item>
              <nldd-tab-bar-item
                icon="text-document"
                href="#aanvragen"
                text="Aanvragen"
              ></nldd-tab-bar-item>
            </nldd-tab-bar>
            <nldd-menu-group
              slot="overflow"
              text="Secties"
            >
              <nldd-menu-item
                type="radio"
                text="Dossiers"
                selected
              ></nldd-menu-item>
              <nldd-menu-item
                type="radio"
                text="Aanvragen"
              ></nldd-menu-item>
            </nldd-menu-group>
          </nldd-toolbar-item>

          <nldd-toolbar-item slot="end">
            <nldd-icon-button
              icon="search"
              text="Zoeken"
            ></nldd-icon-button>
            <nldd-menu-item
              slot="overflow"
              icon="search"
              text="Zoeken"
            ></nldd-menu-item>
          </nldd-toolbar-item>

          <nldd-toolbar-item slot="end">
            <nldd-icon-button
              icon="account"
              text="Account"
              expandable
            >
              <nldd-menu
                slot="popup"
                placement="top-end"
              >
                <nldd-menu-item
                  icon="profile"
                  text="Mijn profiel"
                ></nldd-menu-item>
                <nldd-menu-item
                  icon="settings"
                  text="Instellingen"
                ></nldd-menu-item>
                <nldd-menu-divider></nldd-menu-divider>
                <nldd-menu-item
                  icon="info"
                  text="Over Mijn Dienst"
                ></nldd-menu-item>
                <nldd-menu-item
                  icon="help"
                  text="Help"
                ></nldd-menu-item>
                <nldd-menu-divider></nldd-menu-divider>
                <nldd-menu-item
                  icon="logout"
                  text="Uitloggen"
                ></nldd-menu-item>
              </nldd-menu>
            </nldd-icon-button>
            <nldd-menu-group
              slot="overflow"
              text="Account"
            >
              <nldd-menu-item
                icon="profile"
                text="Mijn profiel"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="settings"
                text="Instellingen"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="info"
                text="Over Mijn Dienst"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="help"
                text="Help"
              ></nldd-menu-item>
              <nldd-menu-item
                icon="logout"
                text="Uitloggen"
              ></nldd-menu-item>
            </nldd-menu-group>
          </nldd-toolbar-item>
        </nldd-toolbar>
      </nldd-container>
    </nldd-split-view-pane>
  </nldd-bar-split-view>
</nldd-app-view>

<nldd-sheet
  placement="right"
  width="480px"
>
  <nldd-page>
    <nldd-top-title-bar
      slot="header"
      text="Dossier D-318"
      dismiss-text="Sluit"
    ></nldd-top-title-bar>
    <nldd-simple-section>
      <nldd-rich-text>
        <p>Het detail van het gekozen dossier. De lijst blijft ernaast staan, dus je ziet waar je vandaan komt.</p>
      </nldd-rich-text>
    </nldd-simple-section>
  </nldd-page>
</nldd-sheet>
```

Een rij opent het dossier in een sheet. Dat kan ook een derde paneel zijn, de inspector, maar die valt als eerste weg zodra de ruimte krap wordt. Een sheet werkt op elke breedte hetzelfde.

## Waarom zo

**Het verschil zit in het doel van het scherm.** Wie informatie verwerkt, leest, begrijpt en beslist, en heeft ruimte en rust nodig. Wie tussen informatie beweegt, zoekt, vergelijkt en kiest, en heeft dichtheid en overzicht nodig: meer tegelijk in beeld, minder stappen ertussen. Daar is dit patroon voor. Het zegt niets over wie er zit, dus dezelfde persoon krijgt hier een dicht lijstscherm en in het paneel ernaast een rustige pagina om een dossier te lezen. Zie de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#strategie-en-proces).

**De app view is de buitenste schil, de split views zitten erin.** De [`nldd-app-view`](../../nldd-design/reference.md#nldd-app-view) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Daarbinnen komen de split views, en pas in een paneel begint een pagina.

**De werkbalk die over het hele scherm gaat, staat buiten de panelen.** Die hangt in een [`nldd-bar-split-view`](../../nldd-design/reference.md#nldd-bar-split-view) om de rest heen: de balk in een eigen slot, de navigatie-split-view in `slot="main"`. Zet je die in een paneel, dan scrolt hij mee met de inhoud van dat ene paneel en geldt hij niet meer voor het scherm. Werkbalken die over de inhoud van één paneel gaan horen daar juist wel, zie verderop. Geef de balk een [`nldd-container`](../../nldd-design/reference.md#nldd-container) met padding, want de bar split view zet die zelf niet. Voor een statusbalk onderin geef je de bar split view gewoon een tweede balk.

**Op een telefoon hoort die balk onderaan.** Bovenin ligt hij buiten het bereik van een duim. Geef de [`nldd-bar-split-view`](../../nldd-design/reference.md#nldd-bar-split-view) daarom twee balken: de bovenste krijgt `above="md"`, de onderste `only="sm"` en een plek ná `slot="main"` in de HTML. Dat zijn twee panelen en niet één verschoven paneel, want op een telefoon veranderen ook de knoppen.

**En het worden andere knoppen.** De balk onderaan krijgt `size="lg"`, waarmee de [`nldd-tab-bar`](../../nldd-design/reference.md#nldd-tab-bar) en de knoppen hun label onder het icoon zetten in plaats van ernaast. Een [`nldd-button`](../../nldd-design/reference.md#nldd-button) met tekst wordt daar een [`nldd-icon-button`](../../nldd-design/reference.md#nldd-icon-button) met dezelfde tekst als label: even groot om aan te raken, een stuk smaller, en je leest nog steeds wat de knop doet. Zo passen de secties en de acties naast elkaar op één rij.

**Een paneel dat alleen komt te staan, heeft een terugknop nodig.** Geef de titelbalk van zo'n paneel een `back-text` met de naam van waar je vandaan komt. De split view bepaalt zelf wanneer die knop nodig is: staan de panelen naast elkaar, dan zet die `hide-back` op het paneel en is de knop weg. Blijft er één over, dan verschijnt hij.

**Links de secties, rechts wat altijd bereikbaar moet zijn.** In de balk staat aan de ene kant een [`nldd-tab-bar`](../../nldd-design/reference.md#nldd-tab-bar) met de secties van de applicatie, zodat je daartussen kunt wisselen hoe diep je ook in de structuur zit. Aan de andere kant staat zoeken en het account, met achter dat account een [menu bij een knop](menu-from-a-button.md): profiel, instellingen, uitloggen, en wat er verder over de applicatie zelf gaat. De zijbalk eronder toont dan de structuur binnen de gekozen sectie, niet nog een keer de secties zelf. Wat er verder in de balk hoort en hoe hij overloopt, staat in [werkbalk met acties](toolbar-with-actions.md).

**De naam van de applicatie hoeft niet in de balk.** Een titel of een logo bovenin kost de ruimte die de secties nodig hebben, en zegt wat de tab, de URL en de bookmark al zeggen tegen iemand die hier elke dag komt. Op een [contentpagina](content-page.md) ligt dat andersom: daar komt een bezoeker binnen via een zoekmachine en moet die zien van wie de pagina is, dus daar staat de naam wel in de bovenbalk en in de voettekst.

**In elk paneel staat een gewone pagina met secties.** Wat daarin geldt, geldt hier ook: één sectie per inhoudsblok, een titel met `heading-level`, een vlak met `background`. Zie [contentpagina](content-page.md).

**Navigatie, hoofdinhoud en inspector: dat is de [`nldd-navigation-split-view`](../../nldd-design/reference.md#nldd-navigation-split-view).** Die heeft benoemde slots in plaats van genummerde panelen, en weet daardoor wat er waar staat: als de ruimte krap wordt valt eerst de inspector weg, daarna klapt de primaire zijbalk in de secundaire, en op het smalst blijft één paneel over. Hij regelt ook de terugknop van een paneel dat alleen komt te staan, mits je `nldd-split-view-pane` als kind gebruikt.

**Panelen van gelijk gewicht zijn een [`nldd-side-by-side-split-view`](../../nldd-design/reference.md#nldd-side-by-side-split-view).** Die nummert zijn panelen en laat ze van rechts naar links verdwijnen, dus de hoofdinhoud staat in `pane-1` en het detail rechts.

**Twee werkbalken, twee bereiken.** De balk om alles heen draagt wat voor de hele applicatie geldt. Wat over de inhoud van één paneel gaat, zoals hier "Nieuw dossier" en het filter boven de lijst, krijgt een eigen [`nldd-toolbar`](../../nldd-design/reference.md#nldd-toolbar) in dat paneel. Zo blijft de bovenste balk hetzelfde terwijl je van scherm wisselt, en verhuist de onderste mee met wat je aan het doen bent.

**De titelbalk van een paneel wijst naar de kop in de inhoud.** Met `collapse-anchor` op de [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar) en dezelfde tekst op een [`nldd-title`](../../nldd-design/reference.md#nldd-title) in de sectie blijft de balk stil zolang de kop in beeld staat, en neemt die de titel over zodra je eroverheen scrolt. De balk verbergt zijn eigen titel dan voor een schermlezer, dus de woorden moeten gelijk zijn.

**Het detail van een rij mag een sheet zijn in plaats van een paneel.** Een derde paneel is de inspector, en die valt als eerste weg als het scherm smaller wordt, dus op een klein scherm is het detail er niet. Een [`nldd-sheet`](../../nldd-design/reference.md#nldd-sheet) schuift over de lijst en laat die staan, op elke breedte hetzelfde. Zet hem dan wel in de document-root en niet in een paneel, zie [bewerken in een sheet](edit-in-a-sheet.md).

**Zeg welk paneel de hoofdinhoud draagt, met `landmarks="page"`.** Een document heeft één `main`, één banner en één contentinfo, dus een [`nldd-page`](../../nldd-design/reference.md#nldd-page) in een paneel houdt die niet vanzelf: die wordt een sectie zonder landmarks. Welk paneel de hoofdinhoud is, weet alleen de applicatie, dus dat zet je er zelf op. Geef de andere panelen een `accessible-label`, dan zijn het benoemde regio's waar een schermlezergebruiker naartoe kan springen, met een naam die zegt wat erin staat.

**Elk paneel heeft een titelbalk, maar het scherm heeft één `h1`.** Een [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar) rendert standaard een `h1`. Geef de titelbalk van een paneel naast de hoofdinhoud daarom `heading-level="2"`.

## Toegankelijkheid

Wat je gratis krijgt: het verbergen van panelen die niet meer passen, de terugknop die een paneel krijgt zodra het alleen komt te staan, en de rollen en namen van de landmarks in de pagina die de hoofdinhoud draagt.

Wat jij nog moet doen: `landmarks="page"` op dat ene paneel, een `accessible-label` op de andere, een `heading-level` op elke titelbalk naast de hoofdinhoud, en een [`nldd-skip-link`](../../nldd-design/reference.md#nldd-skip-link) bovenaan als er navigatie voor de inhoud staat.

## Gezien in

Elke applicatie op dit systeem begint zo. De twee dingen die het vaakst ontbreken zijn `landmarks="page"`, waardoor een scherm twee keer `main` aanbiedt of geen enkele keer, en het kopniveau van de titelbalk in het tweede paneel.
