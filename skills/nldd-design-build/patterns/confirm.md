<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/confirm/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: bevestigen

**Welk probleem dit oplost.** De gebruiker een keuze laten maken over iets dat
niet terug te draaien is. Hetzelfde blok meldt ook een lege of mislukte
toestand, met een weg vooruit.

**Wanneer wel.** Als er echt geen weg terug is: een definitieve indiening, een
betaling, een verwijdering zonder herstel.

**Wanneer niet.** Bijna altijd. Kan de actie ongedaan worden gemaakt, doe dat
dan en meld het achteraf met een herstelmogelijkheid: mensen klikken op de
automatische piloot op "OK", dus een bevestiging vangt weinig fouten. Valt er
niets te kiezen, dan hoeft er ook niet onderbroken te worden. Een melding zonder
keuze is een [notification](../../nldd-design/reference.md#nldd-notification)
of een [banner](../../nldd-design/reference.md#nldd-banner). En liever
dan een modal: een [popover](../../nldd-design/reference.md#nldd-popover) die
aan de actie vastzit en de pagina niet afdekt. De afwegingen staan in de
[ontwerprichtlijnen](../../nldd-design/design-guidelines.md#feedback-en-state).

## Compositie

```
nldd-modal-dialog            open, variant, text, supporting-text
  ├─ nldd-button             slot="actions", de uitweg, variant="primary"
  └─ nldd-button             slot="actions", de actie, variant="destructive"
```

```html
<nldd-button
  id="document-verwijderen"
  variant="destructive"
  text="Verwijder document"
></nldd-button>

<nldd-modal-dialog
  variant="alert"
  text="Document definitief verwijderen?"
  supporting-text="Dit document en zijn versies worden verwijderd. Dit kan niet ongedaan worden gemaakt."
>
  <nldd-button
    slot="actions"
    variant="primary"
    text="Behoud document"
  ></nldd-button>
  <nldd-button
    slot="actions"
    variant="destructive"
    text="Verwijder definitief"
  ></nldd-button>
</nldd-modal-dialog>
```

Onder de modal zit een
[inline dialog](../../nldd-design/reference.md#nldd-inline-dialog):
hetzelfde blok zonder de onderbreking. Gebruik dat rechtstreeks in een sectie of
een lijst, voor een lege toestand, een laadtoestand of een fout die de pagina
niet hoeft te blokkeren.

```html
<nldd-simple-section>
  <nldd-inline-dialog
    icon="search"
    text="Geen resultaten"
    supporting-text="Er is niets dat bij je filters past."
    heading-level="2"
  >
    <nldd-button
      slot="actions"
      variant="secondary"
      text="Wis alle filters"
    ></nldd-button>
  </nldd-inline-dialog>
</nldd-simple-section>
```

## Waarom zo

**De uitweg is de primaire knop, en staat bovenaan.** De primaire knop is waar
de gebruiker op de automatische piloot naartoe gaat, en dat hoort de uitweg te
zijn, niet de onomkeerbare actie. De actie zelf komt eronder, als
`destructive`. Een knoptekst als "OK" zegt niet wat er gebeurt: noem de actie.

**Geef het blok in een pagina een `heading-level`, in een modal niet.** Midden
in een pagina hoort een lege toestand in de koppenstructuur, en
`heading-level="2"` maakt van de `text` een echte kop. In een modal is een
alinea juist goed: de dialoog heeft zijn eigen naam, de `text` of anders
`accessible-label`.

**Open de modal met `open`, net als een sheet.** De
[modal dialog](../../nldd-design/reference.md#nldd-modal-dialog) zet
`open` zelf uit als de gebruiker hem sluit met Esc of een klik ernaast. Bind
`open` samen met `close` aan je toestand, en zet hem na een keuze zelf uit.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc, de focus die binnen de
dialoog blijft en daarna terugkeert naar de knop die hem opende, de naam uit
`text`, en bij `variant="alert"` het icoon en de kleur die erbij horen.

Wat jij nog moet doen: een `heading-level` waar het blok in de paginastructuur
meedoet, en knopteksten die zeggen wat er gebeurt.

## Gezien in

De inline variant wordt in de praktijk veel vaker gebruikt dan de onderbrekende
modal. Dat is de bedoeling: zie "wanneer niet" hierboven.
