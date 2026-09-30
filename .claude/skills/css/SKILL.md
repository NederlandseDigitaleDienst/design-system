---
name: css
description: CSS-conventies voor design-system componenten — MECE breakpoints (expliciet per breakpoint, geen mobile-first overrides), at-rule nesting, lokale variabelen, comments
user-invocable: false
---

# CSS conventie

CSS-schrijfconventies voor design-system componenten: responsive (MECE breakpoints), at-rule nesting, lokale variabelen, comments.

## Responsive: expliciet per breakpoint

Schrijf responsive component-CSS **expliciet per breakpoint**. Geen mobile-first base-waarde die in `@media` of `@container` queries wordt overschreven.

## Waarom

Voor een design-system zwaarder dan voor een gewone app. Componenten worden door derden geconsumeerd, geaudit, en visueel gecontroleerd per breakpoint. Een mobile-first override creëert een impliciete cascade die de developer moet "uitrekenen": *"wat is de actuele waarde op md?"*. Met expliciet-per-breakpoint staat het antwoord direct in de regel.

Trade-off: méér CSS-regels per property dat verschilt per breakpoint. Voor design-system componenten weegt determinisme zwaarder dan kort-en-bondig.

## Regel

Een property die varieert per breakpoint mag **niet** een base-waarde buiten queries hebben. Elke variant zit in z'n eigen `@media`/`@container` block.

**Keerzijde van dezelfde regel — de breakpoint-bereiken zijn MECE** (Mutually Exclusive, Collectively Exhaustive):

- **Collectively Exhaustive**: zodra een property in één breakpoint wordt gezet, moet 'ie in **álle** breakpoint-bereiken gezet worden (sm én md én lg). Er mag geen viewport zijn waar de property ongezet blijft — omdat er geen fallback buiten de queries staat, resolveert 'ie anders leeg op een niet-gedekte viewport.
- **Mutually Exclusive**: de bereiken overlappen niet, zodat op elke viewport precies één query matcht en er nooit een override in de browser plaatsvindt.

Samen: elke viewport valt in precies één breakpoint, geen gat en geen overlap.

Een property die **niet** varieert per breakpoint blijft buiten queries — dat is de natuurlijke base.

## Voorbeeld

❌ **Mobile-first met override (vermijd):**

```css
.simple-section {
  display: flex;
  padding: var(--sm-padding);    /* sm value als "base" */

  @container (min-width: 641px) {
    padding: var(--md-padding);  /* override */
  }
  @container (min-width: 1008px) {
    padding: var(--lg-padding);  /* nog een override */
  }
}
```

✅ **Expliciet per breakpoint:**

```css
.simple-section {
  display: flex;                 /* niet-responsief: blijft in base */

  @container (max-width: 640px) {
    padding: var(--sm-padding);
  }

  @container (min-width: 641px) and (max-width: 1007px) {
    padding: var(--md-padding);
  }

  @container (min-width: 1008px) {
    padding: var(--lg-padding);
  }
}
```

## At-rule positie: nest binnen de selector

Voorkeur: `@media`/`@container` genest binnen de selector via native CSS nesting. Niet gehoist als top-level wrapper. Argumenten:

- **Lokaliteit**: alle responsive-regels voor een component-element staan bij elkaar — om uit te zoeken hoe `.foo` zich gedraagt zoek je op `.foo`, niet op alle media queries verspreid door 't bestand
- **Geen selector-duplicatie**: één keer `.foo {}`, daarbinnen alle varianten
- **Past bij component-architectuur**: elk element heeft één regel met z'n volledige verantwoordelijkheid

❌ **Wrapper rond selector (vermijd):**
```css
.foo {
  display: flex;
}

@media (max-width: 640px) {
  .foo {
    padding: 8px;
  }
}
```

✅ **Nested in selector:**
```css
.foo {
  display: flex;

  @media (max-width: 640px) {
    padding: 8px;
  }
}
```

## Lokale CSS-variabelen bovenaan

Declareer lokale custom properties (`--_*` voor private, `--components-*`/ `--context-*` voor public) bovenaan het `:host` (of vergelijkbare top-level selector) blok, gescheiden van de rest met een witregel. Zo zie je in één oogopslag wat er instelbaar is voordat je de eigen properties leest.

```css
:host {
  --_max-height: calc(100vh - var(--semantics-overlays-inset) * 2);
  --components-popover-default-width: 320px;

  display: flex;
  margin: 0;
  padding: 0;
  /* ... */
}
```

## Volgorde: kleinste breakpoint eerst

Plaats `@media`/`@container` blokken in oplopende volgorde — sm, md, lg. Binnen elk paar (eerst `@media`, dan `@container`) ook in die volgorde. Maakt scannen voorspelbaar: linksboven sm, rechtsonder lg.

```css
.foo {
  display: flex;

  @media (max-width: 640px) { … }                                /* sm */
  @media (min-width: 641px) and (max-width: 1007px) { … }        /* md */
  @media (min-width: 1008px) { … }                               /* lg */

  @container layout-container (max-width: 640px) { … }                /* sm */
  @container layout-container (min-width: 641px) and (max-width: 1007px) { … }  /* md */
  @container layout-container (min-width: 1008px) { … }               /* lg */
}
```

## Witregels tussen breakpoint-blokken

Zet een witregel tussen elk `@media`/`@container` blok binnen dezelfde selector — ook tussen twee opeenvolgende `@media` of twee opeenvolgende `@container` blokken. Dat geeft elk breakpoint visueel z'n eigen ruimte.

```css
.foo {
  display: flex;

  @media (max-width: 640px) {
    padding: 8px;
  }

  @media (min-width: 641px) and (max-width: 1007px) {
    padding: 16px;
  }

  @media (min-width: 1008px) {
    padding: 24px;
  }

  @container layout-container (max-width: 640px) {
    padding: 8px;
  }

  @container layout-container (min-width: 641px) and (max-width: 1007px) {
    padding: 16px;
  }

  @container layout-container (min-width: 1008px) {
    padding: 24px;
  }
}
```

## Wanneer welke breakpoint-bereiken

Gebruik altijd de bestaande waardes uit `src/assets/styles/breakpoints.ts`:

- `smMax` (640px) — kleinste viewport
- `mdMin` (641px) — vanaf medium
- `mdMax` (1007px) — bovengrens medium
- `lgMin` (1008px) — vanaf large

Bereik-conventie:

- **sm only**: `(max-width: ${smMax})`
- **md only**: `(min-width: ${mdMin}) and (max-width: ${mdMax})`
- **lg only**: `(min-width: ${lgMin})`
- **md+**: `(min-width: ${mdMin})` — gebruik *alleen* als de waarde voor md én lg gelijk is
- **sm+md (niet lg)**: `(max-width: ${mdMax})`

## `@container` versus `@media`

- **`@container`**: voorkeursroute voor componenten die in panes/wrappers leven — reageert op de container-breedte ipv viewport. Vereist `container-type: inline-size` op de host of een ancestor.
- **`@media`**: alleen waar de viewport echt 't relevante meetpunt is (top-level layout, of als er geen container-context is).

Veel componenten gebruiken **beide** als fallback: `@container layout-container (...)` voor componenten binnen een nldd-page/nldd-card, plus `@media (...)` als fallback voor losstaand gebruik. Beide blokken volgen dezelfde regel — geen base, alleen explicit-per-breakpoint.

## Wat blijft buiten breakpoint-queries

Properties die op alle breakpoints hetzelfde zijn:

```css
.foo {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  /* ... non-responsive properties */
}
```

Geen probleem met deze base. De regel is alleen: *als een property varieert per breakpoint*, niet één waarde buiten en de andere binnen — alle waarden binnen, elk in z'n eigen breakpoint.

## States en pseudo-classes

Override-semantiek voor non-breakpoint condities (states, attributes, pseudo-classes) blijft normaal:

```css
.button {
  background-color: var(--default);
}
.button:hover {
  background-color: var(--hover);   /* override is hier prima */
}
.button[disabled] {
  background-color: var(--disabled); /* override is hier prima */
}
```

Het anti-override patroon is **alleen** voor breakpoint-varianten.

## Pragmatische uitzondering

Voor properties met *veel* breakpoint-varianten (bv. heading sizes met 6 levels × 3 breakpoints) wordt de duplicatie aanzienlijk. Als de duplicatie de leesbaarheid eerder schaadt dan helpt — bv. wanneer je elke regel min of meer kopieert met alleen één var-naam-verschil — overweeg dan een tabel-achtige indeling met CSS-custom-properties die je per breakpoint omschakelt:

```css
.foo {
  --_padding: var(--sm-padding);   /* nog steeds een soort base, maar één var */
}
@container (min-width: ${mdMin}) {
  .foo { --_padding: var(--md-padding); }
}
@container (min-width: ${lgMin}) {
  .foo { --_padding: var(--lg-padding); }
}
.foo {
  padding: var(--_padding);        /* één plek waar 't toegepast wordt */
}
```

Deze workaround is acceptabel als de regel-explosie anders te erg wordt. Document de keuze in het component zelf.

> **Let op:** dit voorbeeld breekt bewust de eerder beschreven nesting-conventie (at-rules genest binnen selectors). Bij dit var-swap patroon is het @container blok niet "een eigenschap toevoegen aan deze selector", maar "een hele property-waarde omschakelen voor de hele cascade". Top-level wrapping leest dan duidelijker dan nesting in elke selector die de var leest. Houd het wel binnen één component.

## State-conditional layouts (label-alignment, etc.)

Sommige componenten hebben layouts die alleen wisselen op basis van een **combinatie** van state en breakpoint. Bijvoorbeeld `nldd-form-field` gaat naar row-layout alleen wanneer `[label-alignment='left'/'right']` én viewport ≥ md. Dat is een **state-conditional override**, geen mobile-first override. Patroon:

```css
.foo { flex-direction: column; }   /* default — geldt overal tenzij... */

:host([variant='wide']) .foo {
  @container (min-width: ${mdMin}) {
    flex-direction: row;            /* alleen wanneer state én viewport matchen */
  }
}
```

De convention is **niet** van toepassing hier — de base (`column`) is een universele default die overal geldt tenzij de state-selector matcht. Dit mag zo blijven.

## Host-layout is niet van jou: wrapper of `!important`

Outer-document-regels die het host-element matchen (een consumer-reset als `* { margin: 0; padding: 0; border: 0 }`) verslaan elke normale `:host`-declaratie, ongeacht specificiteit (CSS Scoping: bij normale declaraties wint de buitenste context). Zet margin, padding en border met een niet-nulwaarde daarom niet kaal op `:host`:

1. **Voorkeur**: het visuele kader op een wrapper-element in de shadow root. Marges kunnen mee zodra de host `flow-root` is (eigen formatting context), en een query-container kan mee zolang de padding meeverhuist.
2. **Kan het niet naar binnen** (negatieve margins, subgrid-deelnemers) → `!important` op de host-declaratie, met een comment. Elke andere host-rule op dezelfde property moet dan mee in `!important`.

`npm run validate:host-styles` (onderdeel van de build) bewaakt dit. Zie de component-skill (SLOTTED CONTENT & HOST-CSS ISOLATIE) voor het volledige verhaal.

## Geen overbodige comments

CSS-properties spreken voor zichzelf. Comments alleen voor het uitleggen van iets niet-vanzelfsprekends (een workaround, browser-quirk, of een ongebruikelijk patroon). Geen comments die simpelweg herhalen wat de code doet (bv. "padding per breakpoint" boven een blok met padding-rules).

## Checklist bij review

- [ ] Geen base-waarde voor een property die ook in een `@media`/`@container` voorkomt
- [ ] Breakpoint-bereiken zijn MECE: elke viewport in precies één query (collectively exhaustive — geen viewport zonder waarde; mutually exclusive — geen overlap/override)
- [ ] Breakpoints gebruiken de waardes uit `breakpoints.ts`
- [ ] Bereiken sluiten op elkaar aan (640/641, 1007/1008) — geen gat of overlap
- [ ] `@container` waar mogelijk, `@media` als fallback
- [ ] At-rules genest binnen de selector — niet op top-level gehoist
- [ ] Witregel tussen elk `@media`/`@container` blok binnen dezelfde selector
- [ ] Breakpoints in oplopende volgorde (sm → md → lg), `@media` voor `@container`
- [ ] Lokale CSS-variabelen bovenaan `:host`, witregel tussen vars en properties
- [ ] Non-responsieve properties blijven in de base regel — niet onnodig in queries herhaald
- [ ] State-conditional overrides (state + breakpoint combo) blijven met base default
- [ ] Geen margin/padding/border met niet-nulwaarde kaal op `:host` — wrapper of `!important` (validate:host-styles bewaakt dit)
- [ ] Geen overbodige uitleg-comments
