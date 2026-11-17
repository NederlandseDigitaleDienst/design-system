# Linter

`nldd lint` controleert code die het designsysteem gebruikt. Hij zit in het pakket, dus hij kent de versie die je project heeft.

```bash
npx @nldd/design-system lint src
```

## Wat hij vindt

- Tags, attributen, slots, waarden en iconen die niet bestaan, of niet meer.
- Wat hulptechnologie mist, zoals een knop zonder naam.
- Componenten die verkeerd in elkaar staan.
- Tokens in je CSS die er niet zijn.

## Veelgebruikt

### Hernoemingen laten oplossen

Begin hiermee. Het lost op wat alleen een andere naam kreeg, in elk framework.

```bash
npx @nldd/design-system lint --fix
```

### Uitleg bij een regel

```bash
npx @nldd/design-system explain button-needs-name
```

### De regels van een component

```bash
npx @nldd/design-system rules --for nldd-toolbar
```

### Een gebouwde site controleren

Werkt voor elk framework dat naar HTML bouwt, en ziet hele pagina's.

```bash
npx @nldd/design-system lint dist
```

### Zien wat een upgrade breekt

Draai de linter van de versie waar je heen wilt op je huidige code.

```bash
npx @nldd/design-system@latest lint
```

## Niveaus

- **Fout** en **waarschuwing** kunnen CI laten falen.
- **Hint** doet dat nooit. Een hint zegt hoe iets bedoeld is en wijst naar het patroon of de richtlijn met de reden.

## Waar hij draait

- **Broncode.** Per bestand, en alleen wat zeker fout is.
- **Gebouwde HTML.** Hele pagina's, na de build.
- **De browser.** Tijdens het ontwikkelen staan dezelfde regels als `[nldd]` in de console, met een bundler zoals Vite.

## Een regel onderdrukken

Een voorbeeld dat bewust afwijkt, krijgt een onderdrukking met de reden erbij. Zet op de regel erboven het commentaar `nldd-lint-disable-next-line`, dan de naam van de regel, twee streepjes en de reden.

## Alles uit het designsysteem

De groep `pure` zet een project zelf aan, met `--pure` of in `.nldd-lint.json`. Die regels melden eigen opmaak van een app: een `class`, een `style`, kale HTML of een stylesheet.

De linter vraagt Node 20.19 of nieuwer.
