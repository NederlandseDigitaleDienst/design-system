# Patroon: bewerken in een sheet

**Welk probleem dit oplost.** Iets laten bewerken of een detail laten zien
zonder de gebruiker weg te halen van waar hij was. De lijst of de pagina
eronder blijft in beeld, dus de context blijft staan.

**Wanneer wel.** Secundaire inhoud die de context moet bewaren: een
bewerkformulier, een detailweergave, een filterpaneel, instellingen.

**Wanneer niet.** Voor een korte bevestiging is een sheet te zwaar, zie het
patroon "bevestigen". Voor een licht, niet-blokkerend paneel dat aan een knop
hangt (een filter, een snelactie) gebruik je `nldd-popover`. Bekijken en
bewerken zijn verschillende taken: pers ze niet in één scherm met inline
bewerken, zie de ontwerprichtlijnen.

## Compositie

```
nldd-sheet                     (placement, width; show() / hide())
  └─ nldd-page                 (de sheet krijgt een volledige pagina binnenin)
       ├─ nldd-top-title-bar   slot="header"  (text = de h1, dismiss-text)
       ├─ de inhoud            (nldd-form, nldd-list, …)
       └─ slot="footer"        (nldd-form-actions of een button-group)
```

## Code

```html
<nldd-sheet placement="right" width="480px" accessible-label="Aanvraag bewerken">
  <nldd-page>
    <nldd-top-title-bar
      slot="header"
      text="Aanvraag bewerken"
      dismiss-text="Sluiten"
    ></nldd-top-title-bar>

    <nldd-simple-section>
      <nldd-form name="bewerk">
        <nldd-form-field label="Titel">
          <nldd-text-field name="titel"></nldd-text-field>
        </nldd-form-field>
      </nldd-form>
    </nldd-simple-section>
  </nldd-page>
</nldd-sheet>
```

## Waarom zo

**Een sheet bevat een hele `nldd-page`.** Dat is wat je kop, inhoud en voet
oplevert met hetzelfde gedrag als een gewone pagina, inclusief het scrollen van
alleen het middendeel. Bouw de kop niet zelf met een container en een titel.

**Spiegel je toestand naar `show()` en `hide()`; mount en unmount niet.** De
sheet stelt die methoden beschikbaar en animeert. Mount je het element pas als
het open moet, dan slaat de in- en uit-animatie over en verlies je
DOM-toestand.

```js
// Vue, vereenvoudigd
watch(() => props.open, async (open) => {
  if (!open) { sheetEl.value?.hide(); return; }
  await nextTick();
  sheetEl.value?.show();
}, { immediate: true });
```

**Luister op één plek naar sluiten.** De sheet vangt het bubbelende
`dismiss`-event van de title-bar zelf op, roept intern `hide()` aan en vuurt dan
`close`. Koppel `@close` aan de state die de sheet opent, niet aan een directe
`hide()`, anders krijg je een `hide()` → `close` → `hide()`-lus. En koppel niet
óók `@dismiss` op de title-bar: dan krijg je twee sluitacties op één klik. Het
complete werkende component staat in
[`../examples/bootstrap-vue.md`](../examples/bootstrap-vue.md).

**`close` bubbelt niet, `dismiss` en `back` wel.** Overlays nesten, dus een
listener op de ene sheet hoort niet ook het formulier dat hij opende. Bij
`dismiss` en `back` is het omgekeerd: die bubbelen en zijn composed, zodat een
split view de back van elk paneel op één plek kan opvangen. Bind die dus ook op
één plek, anders loopt je handler twee keer.

**`text` op `nldd-top-title-bar` is de `h1`.** Anders dan bij `nldd-title` zet je
hier geen eigen kopelement in een slot: de bar rendert de h1 zelf.

**Op een smal scherm wordt elke sheet een bottom sheet.** Alle plaatsingen
klappen op `sm` naar onderen, en `width` geldt alleen vanaf `md`. Reken daar
niet tegen; het is het gedrag dat je wil.

**Geef een `accessible-label`** als de titel in de bar niet vanzelf de naam van
het dialoog is. De standaard is "Venster", en dat zegt een schermlezergebruiker
niets.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, het sluiten met Esc en met een klik
buiten, de focusval binnen de sheet en de focus die terugkeert naar de trigger.

Wat jij nog moet doen: een zinnige `accessible-label` of een titel in de
title-bar, en `dismiss-text` zetten zodat er een zichtbare sluitknop is.

## Gezien in

Deze compositie komt in vrijwel elke applicatie op dit systeem voor, in Vue,
Angular en server-gerenderde templates. Het imperatieve deel (`show()` en
`hide()` spiegelen) is framework-werk; het complete Vue-voorbeeld staat in
[`../examples/bootstrap-vue.md`](../examples/bootstrap-vue.md).
