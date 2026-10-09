<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/application/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: applicatie

**Welk probleem dit oplost.** Een scherm dat de ruimte gebruikt die er is: navigatie, een lijst, het gekozen record, een inspector, zoveel ernaast als er past. Wordt het scherm smaller, dan vallen de panelen één voor één weg tot er één overblijft, zonder dat je zelf verbergt, herschikt of een tweede layout bouwt.

**Wanneer wel.** Een scherm waarop je vaak tussen informatie beweegt: zoeken, vergelijken, kiezen, bewerken.

**Wanneer niet.** Een website-pagina die iemand leest of waarmee iemand de weg vindt: een [home](home-page.md), een [onderwerppagina](topic-page.md), een [navigatiepagina](navigation-page.md) of een [contentpagina](content-page.md).

## Compositie

```
nldd-app-view                                 de buitenste schil
  └─ nldd-bar-split-view                      balken boven of onder de inhoud
       ├─ nldd-split-view-pane                slot="toolbar-md", only="md"
       │    └─ nldd-container                 met padding
       │         └─ nldd-toolbar              de hoofdwerkbalk, met een zoekknop
       ├─ nldd-split-view-pane                slot="toolbar-lg", above="lg"
       │    └─ nldd-container                 met padding
       │         └─ nldd-toolbar              dezelfde balk, met een zoekveld
       ├─ nldd-split-view-pane                slot="main"
       │    └─ nldd-navigation-split-view
       │         └─ nldd-split-view-pane      slot="primary-sidebar", "secondary-sidebar", "main", "inspector"
       │         └─ nldd-page                 landmarks, accessible-label
       │              ├─ nldd-top-title-bar   slot="header", collapse-anchor
       │              └─ nldd-simple-section
       │                   ├─ nldd-title      slot="header", het anker van de balk
       │                   ├─ nldd-toolbar    de acties van dit paneel
       │                   └─ de inhoud       een lijst, een formulier, een detail
       └─ nldd-split-view-pane                slot="toolbar-sm", only="sm"
            └─ nldd-container                 met padding
                 └─ nldd-toolbar              size="lg", dezelfde acties als icoon met label

nldd-sheet                                    het detail van een rij, in de document-root
```

```html
<nldd-app-view>
  <nldd-bar-split-view>
    <nldd-split-view-pane
      slot="toolbar-md"
      only="md"
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
              appearance="secondary"
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

    <nldd-split-view-pane
      slot="toolbar-lg"
      above="lg"
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
            slot="center"
            min-width="240px"
            width="33%"
            max-width="480px"
            priority="2"
          >
            <nldd-search-field
              placeholder="Zoek een dossier"
              accessible-label="Zoeken"
            ></nldd-search-field>
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
                    appearance="primary"
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
                    appearance="secondary"
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
                  <nldd-spacer-cell size="12"></nldd-spacer-cell>
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
                  <nldd-spacer-cell size="12"></nldd-spacer-cell>
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
      slot="toolbar-sm"
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

Een rij opent het dossier in een sheet, want het detail hoeft hier niet altijd in beeld te staan. Zou dat wel zo zijn, dan was het een derde paneel: de inspector.

## Waarom zo

**De app view is de buitenste schil, de split views zitten erin.** De [`nldd-app-view`](../../nldd-design/reference.md#nldd-app-view) zet de achtergrond en bepaalt wie er scrollt: het document, of elk paneel apart. Daarbinnen komen de split views, en pas in een paneel begint een pagina.

**Twee werkbalken, twee bereiken.** Wat voor het hele scherm geldt, hangt in de hoofdwerkbalk, een balk om de panelen heen: een [`nldd-bar-split-view`](../../nldd-design/reference.md#nldd-bar-split-view) met die balk in een eigen slot en de split view in `slot="main"`. Zet je de hoofdwerkbalk in een paneel, dan scrolt hij mee met de inhoud van dat ene paneel en geldt hij niet meer voor het scherm. Wat over de inhoud van één paneel gaat, zoals hier "Nieuw dossier" en het filter boven de lijst, krijgt juist wel een eigen [`nldd-toolbar`](../../nldd-design/reference.md#nldd-toolbar) in dat paneel. Zo blijft de hoofdwerkbalk hetzelfde terwijl je van scherm wisselt, en verhuist de andere mee met wat je aan het doen bent. Geef de hoofdwerkbalk een [`nldd-container`](../../nldd-design/reference.md#nldd-container) met padding, want de bar split view zet die zelf niet.

**Op kleine schermen hoort de hoofdwerkbalk onderaan.** Dat is bijna altijd een telefoon, en daar ligt de bovenkant buiten het bereik van een duim. Geef de [`nldd-bar-split-view`](../../nldd-design/reference.md#nldd-bar-split-view) daarom een eigen balk met `only="sm"`, op een plek ná `slot="main"` in de HTML. Die onderste krijgt ook `size="lg"`, waarmee de [`nldd-tab-bar`](../../nldd-design/reference.md#nldd-tab-bar) en de knoppen hun label onder het icoon zetten in plaats van ernaast. Een [`nldd-button`](../../nldd-design/reference.md#nldd-button) met tekst wordt daar een [`nldd-icon-button`](../../nldd-design/reference.md#nldd-icon-button) met dezelfde tekst als label: even groot om aan te raken, een stuk smaller, en je leest nog steeds wat de knop doet. Zo passen de secties en de acties naast elkaar op één rij. Dat is meteen de reden voor een eigen balk en niet één verschoven paneel: op zo’n scherm veranderen ook de knoppen.

**Wat verborgen wordt, blijft bereikbaar met een terugknop.** Op een kleiner scherm valt het paneel weg waar je vandaan kwam, en zonder weg terug zit je vast in het paneel dat overblijft. Geef de titelbalk van een paneel daarom een `back-text` met de naam van dat vorige paneel. De split view bepaalt zelf wanneer de knop nodig is en zet er anders `hide-back` op.

**Links de secties, in het midden zoeken, rechts het account.** In de hoofdwerkbalk staat links een [`nldd-tab-bar`](../../nldd-design/reference.md#nldd-tab-bar) met de secties van de applicatie, zodat je daartussen kunt wisselen hoe diep je ook in de structuur zit. Rechts staat het account, met daarachter een [menu bij een knop](menu-from-a-button.md): profiel, instellingen, uitloggen, en wat er verder over de applicatie zelf gaat. De zijbalk eronder toont dan de structuur binnen de gekozen sectie, niet nog een keer de secties zelf. Wat er verder in de balk hoort en hoe hij overloopt, staat in [werkbalk met acties](toolbar-with-actions.md).

**Zoeken is een veld zodra het scherm breed genoeg is.** Een [`nldd-search-field`](../../nldd-design/reference.md#nldd-search-field) in `slot="center"` zegt zelf wat je ermee kunt en scheelt een klik, waar een knop eerst nog iets moet openen. Geef het veld mee hoe het mag meebewegen, `min-width="240px" width="33%" max-width="480px"`, dan houdt het in een brede balk maat en schuift het in een smallere mee. Daaronder gaat die ruimte ten koste van de inhoud, dus op md staat er een knop en op een klein scherm een icoonknop. Dat zijn drie balken die elkaar per breekpunt aflossen, elk met `only` of `above`, en verder gelijk: de secties links, het account rechts.

**De naam van de applicatie hoeft niet direct zichtbaar gemaakt te worden.** Een titel of een logo kost ruimte die continu in gebruik is, en zegt wat de tab, de URL en de bookmark al zeggen tegen iemand die hier elke dag komt. Wil je de naam toch tonen, dan kan dat zowel in de hoofdwerkbalk als in de zijbalk.

**Twee lagen navigatie: een primaire en een secundaire zijbalk.** Heeft de structuur binnen een sectie zelf weer een niveau, zoals mappen met daarin lijsten, dan zet je het bovenste niveau in `slot="primary-sidebar"` en het niveau eronder in `slot="secondary-sidebar"`. De navigation split view geeft zelf de juiste van de twee als eerste op zodra de ruimte krap wordt. Eén niveau is genoeg voor de meeste schermen, en dan gebruik je alleen de primaire. Daarboven komt er geen derde zijbalk bij: zijn er meer niveaus, dan navigeer je verder in de hoofdinhoud zelf, met dezelfde terugknop in de titelbalk van dat paneel.

**In elk paneel staat een gewone pagina met secties.** Wat daarin geldt, geldt hier ook: één sectie per inhoudsblok, een titel met `heading-level`.

**De titelbalk van een paneel wijst naar de kop in de inhoud.** Met `collapse-anchor` op de [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar) en dezelfde tekst op een [`nldd-title`](../../nldd-design/reference.md#nldd-title) in de sectie blijft de balk stil zolang de kop in beeld staat, en neemt die de titel over zodra je eroverheen scrolt. De balk verbergt zijn eigen titel dan voor een schermlezer, dus de woorden moeten gelijk zijn.

**Een inspector staat er altijd, een sheet komt als je hem nodig hebt.** Hoort het detail bij het scherm en kijk je er de hele tijd naar, dan is dat een derde paneel, de inspector. Hoeft het er niet altijd te staan, zoals hier, dan open je het in een [`nldd-sheet`](../../nldd-design/reference.md#nldd-sheet): die schuift over de lijst en laat die staan. Zet hem in de document-root en niet in een paneel, zie [bewerken in een sheet](edit-in-a-sheet.md).

**Zeg welk paneel de hoofdinhoud draagt, met `landmarks="page"`.** Een document heeft één `main`, één banner en één contentinfo, dus een [`nldd-page`](../../nldd-design/reference.md#nldd-page) in een paneel houdt die niet vanzelf: die wordt een sectie zonder landmarks. Welk paneel de hoofdinhoud is, weet alleen de applicatie, dus dat zet je er zelf op. Geef de andere panelen een `accessible-label`, dan zijn het benoemde regio's waar een schermlezergebruiker naartoe kan springen, met een naam die zegt wat erin staat.

**Elk paneel heeft een titelbalk, maar het scherm heeft één `h1`.** Een [`nldd-top-title-bar`](../../nldd-design/reference.md#nldd-top-title-bar) rendert standaard een `h1`. Geef de titelbalk van een paneel naast de hoofdinhoud daarom `heading-level="2"`.

## Toegankelijkheid

Wat je gratis krijgt: het verbergen van panelen die niet meer passen, de terugknop naar het paneel dat daarbij verdween, en de rollen en namen van de landmarks in de pagina die de hoofdinhoud draagt.

Wat jij nog moet doen: `landmarks="page"` op dat ene paneel, een `accessible-label` op de andere, een `heading-level` op elke titelbalk naast de hoofdinhoud, en een [`nldd-skip-link`](../../nldd-design/reference.md#nldd-skip-link) bovenaan als er navigatie voor de inhoud staat.

## Gezien in

Elke applicatie op dit systeem begint zo. De twee dingen die het vaakst ontbreken zijn `landmarks="page"`, waardoor een scherm twee keer `main` aanbiedt of geen enkele keer, en het kopniveau van de titelbalk in het tweede paneel.
