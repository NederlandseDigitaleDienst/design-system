# Bootstrap: platte HTML

Web components werken overal. Voor een server-gerenderde app (FastAPI/Jinja,
Django, een statische site) heb je geen framework nodig. Bundel de import of
laad hem als module.

## Met een bundler (Vite, esbuild)

```js
// main.js, één keer bij het opstarten
import '@nldd/design-system';        // registreert alle nldd-* componenten
import '@nldd/design-system/styles'; // CSS-variabelen + Rijksoverheid-fonts
```

RijksSans is uitsluitend bestemd voor publicaties van de Rijksoverheid en voor
partijen die in haar opdracht werken, zie
[`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md). Bouw
je iets daarbuiten, importeer dan `@nldd/design-system/styles/system-font`:
dezelfde stylesheet zonder de `@font-face`-regels, waarna de familie-stacks
vanzelf op een systeemfont uitkomen.

```html
<script type="module" src="/main.js"></script>
```

## Minimale pagina

`nldd-app-view` is de app-shell: hij zet de kleurschema-context. De
documenttypografie komt uit de stylesheet, die de `body` het documentfont geeft
zodra er een app-view op de pagina staat. Plaats je inhoud erin.

```html
<nldd-app-view>
  <nldd-page>
    <nldd-container
      padding="16"
      sm-padding="8"
    >
      <nldd-title
        size="1"
        text="Subsidieaanvraag"
        heading-level="1"
      ></nldd-title>

      <nldd-spacer size="24"></nldd-spacer>

      <nldd-form>
        <nldd-form-field label="KvK-nummer">
          <nldd-text-field
            name="kvk"
            type="text"
          ></nldd-text-field>
        </nldd-form-field>

        <nldd-form-field label="Gevraagd bedrag">
          <nldd-number-field
            name="bedrag"
            min="0"
          ></nldd-number-field>
        </nldd-form-field>

        <nldd-form-actions>
          <nldd-button
            variant="primary"
            type="submit"
            text="Aanvraag indienen"
          ></nldd-button>
        </nldd-form-actions>
      </nldd-form>
    </nldd-container>
  </nldd-page>
</nldd-app-view>
```

Let op:

- **`nldd-form-field` koppelt label en input zelf.** Geen handmatige `for`/`id`.
- **`type="submit"`** op de knop werkt: de knop is form-associated en stuurt het
  omliggende `<form>` aan, ook over de shadow-grens heen.
- **Geen inline styles.** Wil je ruimte rond de inhoud sturen, gebruik dan
  `nldd-container` (padding) en `nldd-spacer` (verticale ruimte), of je eigen
  CSS met `--primitives-*` variabelen.

## Een native select in een dropdown

`nldd-dropdown` verpakt een native `<select>`. Geef de echte `<select>` als
child; de browser houdt de controle.

```html
<nldd-form-field label="Regeling">
  <nldd-dropdown>
    <select name="regeling">
      <option value="">Kies een regeling</option>
      <option value="wbso">WBSO</option>
      <option value="mit">MIT</option>
    </select>
  </nldd-dropdown>
</nldd-form-field>
```
