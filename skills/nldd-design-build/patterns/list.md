<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/list/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: lijst

**Welk probleem dit oplost.** Een verzameling records tonen die de gebruiker moet kunnen scannen, en waar per record iets mee te doen is: openen, aanvinken, een actie kiezen.

**Wanneer wel.** Een reeks gelijkwaardige items met tekst en hoogstens een paar acties per rij.

**Wanneer niet.** Vergelijkt de gebruiker kolommen met elkaar, dan is het een [`nldd-table`](../../nldd-design/reference.md#nldd-table). Gaat het om een handvol gelijkwaardige blokken met een afbeelding of veel tekst, dan is het een [`nldd-collection`](../../nldd-design/reference.md#nldd-collection) met kaarten.

## Compositie

```
nldd-list                      accessible-label, appearance, type
  └─ nldd-list-item            size, en hoogstens één van href, button, checkbox, radio
       └─ cellen, in de volgorde waarin ze staan
            nldd-icon-cell     een icoon vooraan
            nldd-spacer-cell   de ruimte tussen twee cellen
            nldd-text-cell     text, overline, supporting-text; vult de rij
            nldd-cell          een badge, een checkbox, wat de rij verder draagt
            nldd-text-cell     width="fit-content", komt daardoor achteraan
            nldd-icon-cell     de chevron van een rij die iets opent
```

```html
<nldd-list accessible-label="Dossiers">
  <nldd-list-item href="#dossier-d-318">
    <nldd-icon-cell icon="document"></nldd-icon-cell>
    <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
    <nldd-spacer-cell size="12"></nldd-spacer-cell>
    <nldd-icon-cell
      size="20"
      color="secondary"
      icon="chevron-right"
    ></nldd-icon-cell>
  </nldd-list-item>

  <nldd-list-item href="#dossier-d-319">
    <nldd-icon-cell icon="document"></nldd-icon-cell>
    <nldd-spacer-cell size="8"></nldd-spacer-cell>
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
    <nldd-spacer-cell size="12"></nldd-spacer-cell>
    <nldd-icon-cell
      size="20"
      color="secondary"
      icon="chevron-right"
    ></nldd-icon-cell>
  </nldd-list-item>
</nldd-list>
```

## Waarom zo

**Alles in een rij staat in een cel.** Een cel als [`nldd-text-cell`](../../nldd-design/reference.md#nldd-text-cell) bepaalt lettertype, grootte, kleur en uitlijning, afgestemd op de rij. Kale tekst krijgt daar niets van mee, en de [`nldd-list-item`](../../nldd-design/reference.md#nldd-list-item) waarschuwt er in development voor. Opmaak stuur je via de attributen van de cel, zoals `color` en `**vet**` in `text`, niet met eigen CSS.

**Een rij heeft een linkerkant en een rechterkant, geen derde kolom ertussen.** Links staat wat het item is: een icoon, de naam, en eronder wat die naam nodig heeft om te plaatsen. Rechts staat hoe het ervoor staat en wat je ermee kunt: de status, de chevron, het menu. Komt er informatie bij, kijk dan eerst of die als icoon vooraan past of bij de naam kan, in de ondersteunende tekst eronder of als [`nldd-tag`](../../nldd-design/reference.md#nldd-tag) direct erachter. Een eigen kolom in het midden dwingt het oog bij elke rij opnieuw te zoeken waar de grens ligt, en is op een smal scherm als eerste in de weg.

**De ruimte tussen cellen zet je met een spacer cell.** Cellen zetten zelf geen marge, dus een [`nldd-spacer-cell`](../../nldd-design/reference.md#nldd-spacer-cell) bepaalt per naad hoeveel ruimte ernaast komt. Dat is dezelfde keuze als buiten een rij: een vaste gap past bij kinderen van één soort, en een rij draagt juist verschillende soorten naast elkaar.

**Een rij die iets opent, eindigt met een chevron.** Een [`nldd-icon-cell`](../../nldd-design/reference.md#nldd-icon-cell) met `icon="chevron-right"` zegt dat er achter de rij nog iets zit, zonder dat je het woord "openen" ergens hoeft neer te zetten.

**Een status is een dot met het woord ernaast.** Een [`nldd-badge`](../../nldd-design/reference.md#nldd-badge) zonder tekst is een dot, en die zet je `decorative` naast een `nldd-text-cell` met het woord: de kleur helpt bij het scannen, het woord draagt de betekenis. Wordt de rij te smal voor een eigen kolom, dan verhuist de status naar de naam als badge mét tekst. Elke cel kent `hide-below` en `hide-above`, dus beide versies staan in dezelfde rij en alleen de passende is zichtbaar. Wat verborgen is, is `display: none`, dus een schermlezer hoort de rij één keer.

**Eén actie maakt de rij zelf de control, meer acties krijgen een menu.** Met één actie is de hele rij één groot klikvlak: `href`, `button` of `checkbox` op de [`nldd-list-item`](../../nldd-design/reference.md#nldd-list-item). Komen er acties bij die niet op elke rij hetzelfde zijn, geef de rij dan een tweede segment met een ellipsis erin en hang daar een [`nldd-menu`](../../nldd-design/reference.md#nldd-menu) aan met `anchor`. Een segment en geen losse knop, want dan ziet de hover eruit als de rest van de rij in plaats van als een vlak dat erbovenop ligt. Zet `popup-type="menu"` op dat segment, of laat het menu dat zelf doen, dan krijgt de control `aria-haspopup` en een `aria-expanded` die er ook staat als er niets open is. Geef het segment een `accessible-label` dat de rij noemt, want "Meer" is in twintig rijen twintig keer hetzelfde.

**Een [`nldd-list-item-segment`](../../nldd-design/reference.md#nldd-list-item-segment) is voor een rij waar de chevron ergens anders heen gaat dan de rij zelf.** Dat is de boom hieronder: het label opent de pagina van het team, de chevron klapt alleen de tak open. Twee bestemmingen, dus twee controls, en de rij zelf krijgt dan geen `href` of `button`, want beide tegelijk nest een control in een control. Doet de rij maar één ding, klappen, maak de rij dan zelf de knop (`button` plus `expanded`) en zet `disclosure` op de `nldd-icon-cell` van de chevron: die draait dan mee, en je houdt één groot klikvlak en één tabstop. Let op dat `disclosure` op een segment alleen markeert welke control de tak opent; zonder `button` is het segment geen knop, en dan is er geen hover, geen focus en geen toetsenbord. Springt een niveau in met een `nldd-spacer-cell`, kies die dan zo dat het eerste wat je in een kindrij ziet, het icoon of de tekst, rechts van de naam van de ouder begint en er niet onder. Precies eronder leest als hetzelfde niveau, want je oog pakt in beide rijen dat eerste element. Doe dat met twee cellen: één zo breed als de chevronknop (44px) voor de inspringing, en een kleine met `divider-start` erachter. Die tweede begint dan precies waar de naam van de ouder begint, dus daar begint ook de lijn, en het icoon van het kind staat er net rechts van.

```html
<nldd-list accessible-label="Aanvragen">
  <nldd-list-item>
    <nldd-list-item-segment
      href="#aanvraag-a-1042"
      width="full"
    >
      <nldd-text-cell
        text="Aanvraag A-1042"
        supporting-text="Dakisolatie"
      ></nldd-text-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      button
      id="acties-a-1042"
      accessible-label="Acties voor Aanvraag A-1042"
    >
      <nldd-icon-cell
        size="20"
        color="secondary"
        icon="ellipsis"
      ></nldd-icon-cell>
    </nldd-list-item-segment>
  </nldd-list-item>

  <nldd-list-item>
    <nldd-list-item-segment
      href="#aanvraag-a-1043"
      width="full"
    >
      <nldd-text-cell
        text="Aanvraag A-1043"
        supporting-text="Warmtepomp"
      ></nldd-text-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      button
      id="acties-a-1043"
      accessible-label="Acties voor Aanvraag A-1043"
    >
      <nldd-icon-cell
        size="20"
        color="secondary"
        icon="ellipsis"
      ></nldd-icon-cell>
    </nldd-list-item-segment>
  </nldd-list-item>
</nldd-list>

<nldd-menu anchor="acties-a-1042">
  <nldd-menu-item
    icon="eye"
    text="Bekijken"
  ></nldd-menu-item>
  <nldd-menu-item
    icon="edit"
    text="Bewerken"
  ></nldd-menu-item>
  <nldd-menu-item
    icon="copy"
    text="Dupliceer"
  ></nldd-menu-item>
  <nldd-menu-divider></nldd-menu-divider>
  <nldd-menu-item
    icon="trash"
    text="Verwijderen"
    destructive
  ></nldd-menu-item>
</nldd-menu>

<nldd-menu anchor="acties-a-1043">
  <nldd-menu-item
    icon="eye"
    text="Bekijken"
  ></nldd-menu-item>
  <nldd-menu-item
    icon="edit"
    text="Bewerken"
  ></nldd-menu-item>
  <nldd-menu-item
    icon="copy"
    text="Dupliceer"
  ></nldd-menu-item>
  <nldd-menu-divider></nldd-menu-divider>
  <nldd-menu-item
    icon="trash"
    text="Verwijderen"
    destructive
  ></nldd-menu-item>
</nldd-menu>
```

```html
<nldd-list
  type="tree"
  accessible-label="Dossiers per team"
>
  <nldd-list-item expanded>
    <nldd-list-item-segment
      button
      disclosure
      accessible-label="Team Uitvoering"
    >
      <nldd-icon-cell
        size="20"
        color="secondary"
        icon="chevron-right"
        disclosure
        divider-start
      ></nldd-icon-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      href="#team-uitvoering"
      width="full"
    >
      <nldd-text-cell text="Team Uitvoering"></nldd-text-cell>
    </nldd-list-item-segment>

    <nldd-list-item
      slot="children"
      href="#dossier-d-318"
    >
      <nldd-spacer-cell size="44"></nldd-spacer-cell>
      <nldd-spacer-cell
        size="8"
        divider-start
      ></nldd-spacer-cell>
      <nldd-icon-cell icon="document"></nldd-icon-cell>
      <nldd-spacer-cell size="8"></nldd-spacer-cell>
      <nldd-text-cell text="Dossier D-318"></nldd-text-cell>
    </nldd-list-item>
  </nldd-list-item>

  <nldd-list-item>
    <nldd-list-item-segment
      button
      disclosure
      accessible-label="Team Beleid"
    >
      <nldd-icon-cell
        size="20"
        color="secondary"
        icon="chevron-right"
        disclosure
        divider-start
      ></nldd-icon-cell>
    </nldd-list-item-segment>
    <nldd-list-item-segment
      href="#team-beleid"
      width="full"
    >
      <nldd-text-cell text="Team Beleid"></nldd-text-cell>
    </nldd-list-item-segment>

    <nldd-list-item
      slot="children"
      href="#dossier-d-319"
    >
      <nldd-spacer-cell size="44"></nldd-spacer-cell>
      <nldd-spacer-cell
        size="8"
        divider-start
      ></nldd-spacer-cell>
      <nldd-icon-cell icon="document"></nldd-icon-cell>
      <nldd-spacer-cell size="8"></nldd-spacer-cell>
      <nldd-text-cell text="Dossier D-319"></nldd-text-cell>
    </nldd-list-item>
  </nldd-list-item>
</nldd-list>
```

**De lijst toont zelf zijn lege toestand.** Vul `slot="empty"` en `slot="no-results"` in plaats van een eigen "Geen resultaten" naast de [`nldd-list`](../../nldd-design/reference.md#nldd-list). Dat zijn twee verschillende zinnen: `empty` betekent dat er niets is, `no-results` dat je filter niets overlaat. Bij `no-results` blijven het zoekveld en de werkbalk staan, want dat is de weg terug. Verberg de lijst dus ook niet met `hidden` als er niets in staat, want dan verdwijnt de lege toestand mee. Het verschil valt vooral op bij `type="listbox"`: daar komen de rijen uit het zoekveld van de lijst zelf, dus dat veld blijft staan en wacht de melding tot er iets getypt is. In een gewone lijst lijken de twee meer op elkaar, en is het verschil vooral of je iets kunt aanpassen of dat er simpelweg nog niets is.

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

Wat je gratis krijgt: de rollen en de pijltjesnavigatie die bij het `type` van de lijst horen, één tabstop voor de hele lijst, en een waarschuwing in development bij kale tekst of een control in een control.

Wat jij nog moet doen: een `accessible-label` op de lijst, het `type` dat past bij wat de rijen doen, en een `accessible-label` op een segment dat alleen een icoon bevat.

## Gezien in

De meest voorkomende compositie op dit systeem, in elk onderzocht product en in elk framework. De lege toestanden zijn de uitzondering: `slot="empty"` en `slot="no-results"` worden vrijwel nergens gebruikt, ook niet in apps die honderden rijen tonen. Ze doen precies wat je anders zelf nabouwt, en vrijwel niemand vindt ze.
