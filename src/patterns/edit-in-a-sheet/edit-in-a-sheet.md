# Bewerken in een sheet

Met een sheet kan iemand iets aanpassen zonder de pagina waarop diegene werkt te verlaten. Gebruik deze vorm voor een korte, afgebakende bewerking waarbij de huidige context van belang blijft. Is de bewerking uitgebreid of vraagt die om veel uitleg, kies dan een aparte pagina.

## Compositie

```
de pagina eronder             de lijst of het detail waar de sheet vandaan komt

nldd-sheet                     open, placement, width; in de document-root
  └─ nldd-page               sticky-header, zodat de balk in beeld blijft
       ├─ nldd-top-title-bar   slot="header", met text, dismiss-text en collapse-anchor
       └─ nldd-simple-section
            ├─ nldd-title      slot="header", het id waar de balk naar wijst
            └─ nldd-form
                 ├─ nldd-form-field    per veld, met de waarde die er al staat
                 └─ nldd-form-actions
                      └─ nldd-button-group  de actie, onder het laatste veld
```

<!-- voorbeeld: Standaard -->

## Waarom zo

**De uitweg staat bovenin, de primaire actie onder het laatste veld.** "Annuleer" zit in de [`nldd-top-title-bar`](/componenten/top-title-bar/), "Bewaar" staat in `nldd-form-actions` waar je kijkt als je klaar bent met het laatste veld. Zo staan ze niet naast elkaar, en gaat niemand op de automatische piloot naar de uitweg. Zet dus geen tweede knop naast "Bewaar"; zie de [ontwerprichtlijnen](/richtlijnen/). Wordt het formulier langer dan de sheet, dan kan de actie met `sticky-footer` op de pagina in beeld blijven, maar dat is de uitzondering: de knop staat dan buiten het formulier en heeft een `form` nodig die ernaar wijst, zie [formulier](/patronen/form/).

**Noem waar de sheet over gaat.** "Aanvraag A-1042 bewerken" in plaats van "Aanvraag bewerken": een sheet opent meestal vanaf een rij tussen rijen die op elkaar lijken. De ingevulde velden zeggen het ook, maar alleen zolang ze in beeld zijn.

**De titel staat in de inhoud, de balk neemt die over bij het scrollen.** Zet een [`nldd-title`](/componenten/title/) boven het formulier en laat de [`nldd-top-title-bar`](/componenten/top-title-bar/) daarnaar wijzen met `collapse-anchor`. Zolang de kop in beeld staat is de balk stil, met alleen de uitweg erin; zodra je eroverheen scrolt, schuift de titel de balk in. Dat werkt alleen met `sticky-header` op de pagina: zonder scrolt de balk met de inhoud mee weg, en komt hij niet meer terug. Allebei dezelfde woorden dus, want de balk verbergt zijn eigen titel dan voor een schermlezer: die zou anders dezelfde titel twee keer tegenkomen.

**Zet de sheet in de document-root.** Die hoort niet in de inhoud van een split view: als slotted kind pikt die daar de hoogte van het paneel in, waarna een sticky footer los in het scherm komt te hangen. In een framework teleporteer je die naar `document.body`; [`nldd-sheet`](/componenten/sheet/) legt uit waarom.

## Een stap verder

Soms vraagt een veld om een eigen scherm, zoals een team kiezen uit een lijst. Open daarvoor geen tweede sheet over de eerste. Ga in dezelfde sheet een stap verder: een tweede [`nldd-page`](/componenten/page/) naast de eerste, met `parent` naar de pagina waar hij vandaan komt en `hidden` tot hij aan de beurt is.

<!-- voorbeeld: EenStapVerder -->

**De terugknop zegt waar je heen gaat.** De pagina met `parent` geeft zijn titelbalk een terugknop met de titel van de ouder, hier "Aanvraag A-1042 bewerken". Twee sheets over elkaar hebben elk een eigen sluitknop, en die zegt niet waar je uitkomt. "Annuleer" sluit hier de hele sheet, in elke stap.

**Wat je in de eerste stap invulde, blijft staan.** De eerste pagina gaat niet weg maar wordt verborgen, dus de titel die je net typte, staat er nog als je terugkomt.

**Een keuze gaat terug zoals de terugknop.** Roep `back()` aan op de stap: die toont de ouder en zet de focus terug op de rij die de stap opende. De gekozen waarde zet je zelf in de eerste pagina, want alleen jij weet waar hij hoort.

**Geen eigen adres.** Een stap komt niet in de URL, en de terugknop van de browser gaat er niet doorheen. Verdient een stap een adres, dan is hij een pagina van de applicatie, met `back-href` op de titelbalk.

## Toegankelijkheid

Wat je gratis krijgt: de dialoogrol, sluiten met Esc en met een klik naast de sheet, de focus die binnen de sheet blijft en daarna terugkeert naar de knop die de sheet opende, en de naam uit de titelbalk.

Wat jij nog moet doen: een `text` op de titelbalk die zegt waar de sheet over gaat, en een `dismiss-text`, zodat er een zichtbare uitweg is.

## Gezien in

Deze compositie komt voor in vrijwel elke applicatie op dit designsysteem, in Vue, Angular en server-gerenderde templates.
