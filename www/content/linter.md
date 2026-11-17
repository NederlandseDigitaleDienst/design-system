# Linter

`nldd lint` controleert code die het designsysteem gebruikt: tags, attributen, slots, waarden en iconen die niet bestaan, en fouten in hoe componenten samen staan. Hij zit in het pakket, dus hij kent de versie die je project heeft.

## Draaien

```bash
npx @nldd/design-system lint src
```

Begin met `--fix`. Dat lost op wat alleen een andere naam kreeg, in elk framework.

| Wil je | Gebruik |
|---|---|
| Hernoemingen laten oplossen | `npx @nldd/design-system lint --fix` |
| Uitleg bij een regel | `npx @nldd/design-system explain <regel>` |
| De regels van een component, voor je het gebruikt | `npx @nldd/design-system rules --for nldd-toolbar` |
| Een gebouwde site controleren | `npx @nldd/design-system lint dist` |
| Zien wat een upgrade breekt | `npx @nldd/design-system@<doelversie> lint` |

De linter vraagt Node 20.19 of nieuwer.

## Niveaus

Een `error` of een `warn` kan CI laten falen. Een `hint` doet dat nooit: die zegt hoe iets bedoeld is en wijst naar het patroon of de richtlijn met de reden.

## Waar hij draait

Dezelfde regels draaien op drie plekken. Op broncode meldt de linter per bestand wat zeker fout is. Op gebouwde HTML ziet hij hele pagina's, voor elk framework dat naar HTML bouwt. In de browser staan ze tijdens het ontwikkelen als `[nldd]` in de console, met een bundler zoals Vite.

## Een regel onderdrukken

Een voorbeeld dat bewust afwijkt, krijgt een onderdrukking met de reden erbij. Zet op de regel erboven het commentaar `nldd-lint-disable-next-line`, dan de naam van de regel, twee streepjes en de reden.

## Alles uit het designsysteem

De groep `pure` zet een project zelf aan, met `--pure` of met `"rules": { "pure": "error" }` in `.nldd-lint.json`. Die regels melden eigen opmaak van een app: een `class`, een `style`, kale HTML of een stylesheet.
