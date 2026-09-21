# Breakpoints

Het designsysteem definieert vijf vaste breakpoints die door alle responsive componenten worden gebruikt. Ze zijn beschikbaar in CSS én in JavaScript zodat media-queries en runtime-logica niet uit elkaar kunnen lopen.

| Naam    | Waarde   | Gebruik                                           |
| ------- | -------- | ------------------------------------------------- |
| `smMin` | `320px`  | Kleinste ondersteunde viewport (kleine telefoons) |
| `smMax` | `640px`  | Bovengrens van het sm-bereik                      |
| `mdMin` | `641px`  | Ondergrens van het md-bereik (tablets)            |
| `mdMax` | `1007px` | Bovengrens van het md-bereik                      |
| `lgMin` | `1008px` | Ondergrens van het lg-bereik (desktops en breder) |

## Gebruik in CSS

In `@media` of `@container` query conditions moeten altijd **letterlijke waardes** staan — CSS-spec staat geen `var(--…)` toe in query conditions. Componenten in het designsysteem schrijven dus expliciet:

```css
@media (min-width: 641px) { … }      /* mdMin */
@container (min-width: 1008px) { … } /* lgMin */
```

Daarom staan de breakpoints niet als CSS custom properties in `variables.css`: `var(--…)` zou hier toch niet werken en zou alleen drift uitlokken met de canonieke definitie in `breakpoints.ts`.

## Gebruik in JavaScript / TypeScript

```ts
import { breakpoints } from '@nldd/design-system/breakpoints';

const isDesktop = matchMedia(`(min-width: ${breakpoints.lgMin})`).matches;
const isTablet = matchMedia(`(min-width: ${breakpoints.mdMin}) and (max-width: ${breakpoints.mdMax})`).matches;

// Of als getal voor berekeningen:
const lgMinPx = parseInt(breakpoints.lgMin); // 1008
```

Importeer ze altijd hier in plaats van waardes hardcoded — een toekomstige design-update past dan automatisch alle consumenten aan zonder zoek-en-vervang.
