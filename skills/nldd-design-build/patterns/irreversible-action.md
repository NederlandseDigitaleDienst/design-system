<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: src/patterns/irreversible-action/ (de .mdx-pagina en de .html-voorbeelden ernaast).
  Hergenereren: npm run generate:skill-docs
-->

# Patroon: onomkeerbare actie

**Welk probleem dit oplost.** De gebruiker laten kiezen over iets dat niet terug te draaien is, op een plek waar niemand er per ongeluk op klikt.

**Wanneer wel.** Als er echt geen weg terug is: een definitieve indiening, een betaling, een verwijdering zonder herstel.

**Wanneer niet.** Bijna altijd. Kan de actie ongedaan worden gemaakt, doe dat dan en meld het achteraf met een herstelmogelijkheid: mensen klikken op de automatische piloot op "OK", dus een bevestiging vangt weinig fouten. Valt er niets te kiezen, dan hoeft er ook niet onderbroken te worden. Een melding zonder keuze is een [`nldd-notification`](../../nldd-design/reference.md#nldd-notification) of een [`nldd-banner`](../../nldd-design/reference.md#nldd-banner). En liever dan een modal: een [`nldd-popover`](../../nldd-design/reference.md#nldd-popover) die aan de actie vastzit en de pagina niet afdekt. De afwegingen staan in de [ontwerprichtlijnen](../../nldd-design/design-guidelines.md#feedback-en-state).

## Compositie

```
nldd-box                     background="critical", de zone waar de actie woont
  └─ nldd-container          padding, gap
       ├─ nldd-title         heading-level, wat de zone is
       ├─ nldd-rich-text     wat er gebeurt als je de knop gebruikt
       └─ nldd-button        variant="destructive", opent de dialoog

nldd-modal-dialog            open, variant="alert", text, supporting-text
  ├─ nldd-button             slot="actions", de uitweg, variant="primary"
  └─ nldd-button             slot="actions", de actie, variant="destructive"
```

```html
<nldd-simple-section>
  <nldd-box background="critical">
    <nldd-container
      padding="16"
      gap="8"
    >
      <nldd-title
        size="5"
        text="Dossier verwijderen"
        heading-level="2"
      ></nldd-title>
      <nldd-rich-text>
        <p>Het dossier en alle documenten erin verdwijnen. Collega's die eraan werken raken hun kopie kwijt.</p>
      </nldd-rich-text>
      <nldd-button
        id="dossier-verwijderen"
        variant="destructive"
        text="Verwijder dossier"
      ></nldd-button>
    </nldd-container>
  </nldd-box>
</nldd-simple-section>

<nldd-modal-dialog
  variant="alert"
  text="Verwijder 'Dossier D-318'?"
  supporting-text="Dit dossier en alle documenten erin worden verwijderd. Dit kan niet ongedaan worden gemaakt."
>
  <nldd-button
    slot="actions"
    variant="primary"
    text="Behoud dossier"
  ></nldd-button>
  <nldd-button
    slot="actions"
    variant="destructive"
    text="Verwijder dossier"
  ></nldd-button>
</nldd-modal-dialog>
```

## Waarom zo

**De actie woont in een eigen vlak.** Een [`nldd-box`](../../nldd-design/reference.md#nldd-box) met `background="critical"` is de danger zone: getint en omlijnd in kritiek, met een eigen kopje en een zin die zegt wat er gebeurt. Zo staat een onomkeerbare knop niet tussen de gewone acties waar iemand op de automatische piloot doorheen klikt. De box draagt zelf geen ARIA, dus het kopje en de knoptekst moeten het werk doen.

**Noem het ding dat verdwijnt.** De titel van de dialoog zegt welk dossier het betreft, niet alleen dat er iets definitief gebeurt. "Verwijder definitief" vertelt hoe onherroepelijk het is, maar niet wát je kwijtraakt, en dat is precies wat iemand op dat moment wil nagaan. Dezelfde actie heet in de pagina en in de dialoog hetzelfde.

**De uitweg is de primaire knop, en staat bovenaan.** De primaire knop is waar de gebruiker op de automatische piloot naartoe gaat, en dat hoort de uitweg te zijn, niet de onomkeerbare actie. De actie zelf komt eronder, als `destructive`. Een knoptekst als "OK" zegt niet wat er gebeurt: noem de actie.

Hetzelfde blok zonder de onderbreking is de [`nldd-inline-dialog`](../../nldd-design/reference.md#nldd-inline-dialog), voor een lege toestand, een laadtoestand of een fout die de pagina niet hoeft te blokkeren. Dat is een ander probleem en krijgt zijn eigen patroon.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc, de focus die binnen de dialoog blijft en daarna terugkeert naar de knop die de dialoog opende, de naam uit `text`, en bij `variant="alert"` het icoon en de kleur die erbij horen.

Wat jij nog moet doen: een `heading-level` op het kopje van de zone, zodat die meedoet in de koppenstructuur, en knopteksten die zeggen wat er gebeurt en waarmee.

## Gezien in

Modals zijn in de onderzochte producten zeldzaam, en dat is de bedoeling: zie "wanneer niet" hierboven. Waar ze staan, staan ze voor dit geval. Het vlak met de kritieke rand komt uit Fundament, waar onomkeerbare acties in zo'n zone bij elkaar staan in plaats van los tussen de rest.
