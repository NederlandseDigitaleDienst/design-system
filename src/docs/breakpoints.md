# Breakpoints

Het designsysteem definieert vijf vaste breakpoints die door alle responsive componenten worden gebruikt. Ze zijn beschikbaar in CSS én in JavaScript zodat media-queries en runtime-logica niet uit elkaar kunnen lopen.

| Naam    | Waarde   | In queries    | Gebruik                                           |
| ------- | -------- | ------------- | ------------------------------------------------- |
| `smMin` | `320px`  | `20rem`       | Kleinste ondersteunde viewport (kleine telefoons) |
| `smMax` | `640px`  | `40rem`       | Bovengrens van het sm-bereik                      |
| `mdMin` | `641px`  | `40.0625rem`  | Ondergrens van het md-bereik (tablets)            |
| `mdMax` | `1007px` | `62.9375rem`  | Bovengrens van het md-bereik                      |
| `lgMin` | `1008px` | `63rem`       | Ondergrens van het lg-bereik (desktops en breder) |

De componenten schrijven hun queries in `rem`. Met paginazoom rekent Safari de breedte van een container in gezoomde pixels, waardoor een query in `px` een smalle container voor een brede aanziet. Een query in `rem` schaalt mee. Bij de standaardlettergrootte van 16px zijn de twee gelijk. Wie een grotere standaardlettergrootte instelt, krijgt de smallere indeling eerder.

## Gebruik in CSS

In `@media` of `@container` query conditions moeten altijd **letterlijke waardes** staan — CSS-spec staat geen `var(--…)` toe in query conditions. Componenten in het designsysteem schrijven dus expliciet:

```css
@media (min-width: 40.0625rem) { … } /* mdMin */
@container (min-width: 63rem) { … }  /* lgMin */
```

Daarom staan de breakpoints niet als CSS custom properties in `variables.css`: `var(--…)` zou hier toch niet werken en zou alleen drift uitlokken met de canonieke definitie in `breakpoints.ts`.

## Gebruik in JavaScript / TypeScript

```ts
import { breakpointPx, breakpoints, queryBreakpoints } from '@nldd/design-system/breakpoints';

const isDesktop = matchMedia(`(min-width: ${queryBreakpoints.lgMin})`).matches;
const isTablet = matchMedia(`(min-width: ${queryBreakpoints.mdMin}) and (max-width: ${queryBreakpoints.mdMax})`).matches;

// Een breedte die je zelf meet, vergelijk je met breakpointPx: die rekent
// met de lettergrootte, net als de queries.
const isWide = element.clientWidth >= breakpointPx('lgMin'); // 1008 bij 16px

// De px-waardes blijven beschikbaar:
const lgMinPx = parseInt(breakpoints.lgMin); // 1008
```

Importeer ze altijd hier in plaats van waardes hardcoded — een toekomstige design-update past dan automatisch alle consumenten aan zonder zoek-en-vervang.
