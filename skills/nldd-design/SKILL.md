---
name: nldd-design
description: "Het NLDD Designsysteem (@nldd/design-system, Nederlandse Digitale Dienst, Rijksoverheid): de componentreferentie, de release-historie en de ontwerprichtlijnen. Triggers: vragen over welke nldd-* componenten bestaan, welke attributen, slots of events een component heeft, welke icoonnamen geldig zijn, of wat er in een versie is veranderd. Bouw je een app: nldd-design-build. Zet je een bestaande app om: nldd-design-migrate. Verhoog je een versie: nldd-design-upgrade. Stel je iets voor: nldd-design-contribute."
metadata:
  type: reference
---

# NLDD Designsysteem: de naslag

Dit is de gedeelde naslag van het designsysteem. Hij hoort bij geen van beide werkwijzen in het bijzonder, want de API, de release-historie en de ontwerprichtlijnen gelden of je nu iets nieuws bouwt of iets bestaands omzet.

## Wat hier staat

- [`reference.md`](reference.md): elk `nldd-*` element met zijn attributen, slots en events, plus de volledige icoonnamenlijst. Gegenereerd uit de JSDoc van de componenten, dus dit is wat het pakket werkelijk kan.
- [`changelog.md`](changelog.md): wat er per versie veranderde, met de migratiestappen bij elke breaking change.
- [`design-guidelines.md`](design-guidelines.md): de interface- en ontwerpvoorkeuren van het systeem. Canoniek voor ontwerpkeuzes, waar de andere skills over mechaniek gaan.

## Waar je verder moet zijn

| Je gaat | Gebruik |
|---|---|
| een nieuwe applicatie bouwen | `nldd-design-build`: de visie, de patronen, hoe je componenten samenstelt |
| een bestaande applicatie omzetten | `nldd-design-migrate`: wat er stil misgaat en hoe je het merkt |
| een versie verhogen | `nldd-design-upgrade`: het upgradepad uit de changelog |
| iets voorstellen aan het systeem | `nldd-design-contribute`: hoe je een issue opbouwt |
| het designsysteem zelf ontwikkelen | niet deze skills: die kennis zit als repo-locale skills in de repository, zie `nldd-design-contribute` |

Aanroepen kan met de korte naam (`/nldd-design`) of met de plugin ervoor (`/nldd:nldd-design`). Die tweede werkt altijd; de korte gaat naar een eigen skill van je project als die toevallig dezelfde naam draagt.

## Drie gewoonten die tijd schelen

**Verzin nooit een naam.** Icoonnamen en tokennamen zijn gesloten sets. Een verzonnen icoonnaam rendert niets, een verzonnen CSS-variabele valt stil terug op niets. Zoek ze op in [`reference.md`](reference.md).

**Lees de changelog per versie, niet alleen die van je doelversie.** Een hernoeming zonder terugvalgedrag en een verwijderd element kunnen in dezelfde release zitten. Dan krijg je twee faalvormen tegelijk, en geen van beide meldt zich.

**De levende documentatie staat in [Storybook](https://nederlandsedigitaledienst.github.io/design-system/),** met visuele voorbeelden en controls per component. De exacte types staan in de `.d.ts` bestanden van het pakket. Gebruik die twee voor detailvragen; deze skills leren je hoe je het systeem goed gebruikt.

> Voor onderhouders: alle drie de bestanden hier zijn gegenereerd, uit
> respectievelijk de JSDoc van de componenten, de root-CHANGELOG en
> `src/docs/design-guidelines.mdx`. Draai `npm run generate:skill-docs` na een
> API-wijziging, release of wijziging in de ontwerprichtlijnen en commit het
> resultaat. Het zijn echte bestanden en geen symlinks: een plugin wordt naar
> een geïsoleerde cache gekopieerd waarbij symlinks buiten de plugin-map
> wegvallen.
