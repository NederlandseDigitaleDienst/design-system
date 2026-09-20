# Patroon: een content- of landingspagina

Een marketing-, landings- of informatiepagina is geen app-shell. Je bouwt hem
niet uit split views en panelen, maar als een **verticale stapel secties**
binnen een `nldd-page`, met `nldd-collection` en `nldd-card` voor de grids en
`nldd-page-footer` onderaan.

```
nldd-app-view                    (app-shell: kleurschema-context)
  └─ nldd-page
       ├─ nldd-simple-section            (hero)
       ├─ nldd-simple-section            ("wat is het", kaart-grid)
       ├─ nldd-two-thirds-one-third-section  (uitleg + zijbalk)
       ├─ nldd-simple-section            (ecosysteem-grid)
       └─ nldd-page-footer
```

`nldd-app-view` blijft de buitenste schil; die zet de kleurschema-context.
Daarbinnen stapel je secties.

## Hero

```html
<nldd-app-view>
  <nldd-page>
    <nldd-simple-section>
      <nldd-title size="1">
        <span slot="overline">RegelRecht</span>
        <h1>van wet naar digitale werking</h1>
      </nldd-title>
      <nldd-spacer size="16"></nldd-spacer>
      <nldd-rich-text>
        <p>
          RegelRecht verkent of wetgeving als uitvoerbare code geschreven kan
          worden, zodat verschillende organisaties dezelfde wet ook hetzelfde
          toepassen.
        </p>
      </nldd-rich-text>
    </nldd-simple-section>
```

## Kaart-grid

Een rij gelijkwaardige kaarten is een `nldd-collection` (layout `grid`) met
`nldd-card`s erin. De collection regelt de responsive kolommen; geef
`item-width` voor de gewenste kaartbreedte.

```html
    <nldd-simple-section>
      <nldd-title size="2"
        slot="header"
      >
        <h2>Wat is RegelRecht?</h2>
      </nldd-title>

      <nldd-collection layout="grid"
        item-width="320px"
      >
        <nldd-card>
          <nldd-container padding="16">
            <nldd-title size="4">
              <h3>Van analoog recht naar code</h3>
            </nldd-title>
            <nldd-spacer size="8"></nldd-spacer>
            <nldd-rich-text>
              <p>Kunnen we traditionele wetgeving transformeren naar
              machine-uitvoerbare specificaties?</p>
            </nldd-rich-text>
          </nldd-container>
        </nldd-card>
        <!-- meer nldd-card's -->
      </nldd-collection>
    </nldd-simple-section>
```

Let op: `nldd-card` zet zelf geen padding (zie de referentie: "padding wordt
overgelaten aan geneste containers"). Wikkel de inhoud in een `nldd-container`
met `padding`.

## Sectie met zijbalk (2/3 + 1/3)

Voor "uitleg links, ondersteunende kaart rechts" gebruik je een kant-en-klare
page-section in plaats van zelf een grid te bouwen. De kolommen wrappen vanzelf
onder 280px.

```html
    <nldd-two-thirds-one-third-section>
      <div slot="left">
        <nldd-rich-text><!-- lopende uitleg --></nldd-rich-text>
      </div>
      <div slot="right">
        <nldd-card>
          <nldd-container padding="16"><!-- zijbalk --></nldd-container>
        </nldd-card>
      </div>
    </nldd-two-thirds-one-third-section>
```

## Een label op een kaart

Voor een statuslabel als "Vacature" gebruik je `nldd-tag` (compact,
niet-interactief), niet `nldd-badge` (dat is voor notificatie-aantallen en
statusstippen).

```html
<nldd-tag color="lintblauw"
  text="Vacature"
></nldd-tag>
```

## Footer

```html
    <nldd-page-footer>
      <nldd-container padding="24"
        gap="8"
      >
        <!-- hoofd-footerinhoud, bijv. een grid van linklijsten -->
      </nldd-container>
    </nldd-page-footer>
  </nldd-page>
</nldd-app-view>
```

## Een tinted of donkere sectie

Wil je een sectie visueel laten opvallen, gebruik dan de `background`- en
`scheme`-attributen van de page-section in plaats van eigen achtergrond-CSS. Die
cascaderen het oppervlak correct naar de componenten erin.

```html
<nldd-simple-section background="tinted">
  <!-- inhoud erft de getinte context -->
</nldd-simple-section>

<nldd-full-bleed-section scheme="inverted">
  <!-- omgekeerd kleurschema t.o.v. de pagina -->
</nldd-full-bleed-section>
```
