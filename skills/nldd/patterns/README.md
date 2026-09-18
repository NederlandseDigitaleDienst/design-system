# Patronen

Een component beantwoordt "wat is dit ding". Een patroon beantwoordt "hoe zet ik
deze dingen samen tot iets dat een taak van de gebruiker afhandelt".

De set is expres klein. Acht patronen die kloppen zijn nuttiger dan een complete
catalogus die niet is bijgehouden. Staat jouw geval er niet bij, kijk dan of een
van deze acht de compositie al dekt; zo niet, dan is
[`../reference.md`](../reference.md) de volledige API en
[Storybook](https://minbzk.github.io/storybook/) het levende voorbeeld.

**De opbouw van een scherm**

| Patroon | Voor welke taak |
|---|---|
| [Pagina met secties](page-with-sections.md) | Een pagina opbouwen die op elke breedte leesbaar blijft |
| [Werkbalk met acties](toolbar-with-actions.md) | Acties boven een scherm die ook op smal bereikbaar blijven |

**Inhoud tonen**

| Patroon | Voor welke taak |
|---|---|
| [Lijst met rijen](list-with-rows.md) | Een reeks records tonen waar je per record iets mee doet |
| [Een lijst filteren](filter-a-list.md) | Zoeken en filteren, met zichtbare filters en een weg terug |

**Iets van de gebruiker vragen**

| Patroon | Voor welke taak |
|---|---|
| [Formulier](form.md) | Gegevens vragen, met labels, groepen en validatie |
| [Menu bij een knop](menu-from-a-button.md) | Meer acties of keuzes aanbieden dan er knoppen passen |
| [Bewerken in een sheet](edit-in-a-sheet.md) | Iets laten bewerken zonder de context weg te halen |
| [Bevestigen](confirm.md) | Een keuze over iets onomkeerbaars, of een lege toestand melden |

## Waar patronen ophouden

Deze bestanden beschrijven **compositie-mechaniek**: welk component in welk
component, en waarom die volgorde. De keuzes daarachter (wanneer een modal
gerechtvaardigd is, hoe je microcopy schrijft, waarom je optionele velden
markeert in plaats van verplichte) staan in
[`../design-guidelines.md`](../design-guidelines.md). Die blijven de canonieke
bron voor ontwerpvragen.

Twee dingen staan er bewust niet in, omdat de ontwerprichtlijnen ze afwijzen:
**wizards** ("een symptoom van een slechte onderliggende UI") en **megamenu's**.

## Hoe deze patronen tot stand komen

Ze zijn afgeleid uit code die in productie draait, niet uit wat we ons
herinneren. Twee bronnen wegen het zwaarst:

1. **De commits van de ontwerper van dit systeem in echte producten**, met de
   regel expliciet in het commitbericht. Die leveren het "waarom".
2. **Hoe vaak een compositie over verschillende producten heen terugkomt**
   (Vue, Astro, Angular en Jinja2). Dat scheidt een patroon van het systeem van
   een gewoonte van één app.

Een patroon voorstellen doe je via een issue, met het probleem en het bewijs
erbij: waar draait dit, en welke taak lost het op. Code mag later.

Elk `nldd-*`-element in deze bestanden wordt in CI gecontroleerd tegen de echte
component-API (`npm run validate:skill-markup`), dus een tag, attribuut, slot of
icoonnaam die niet bestaat laat de build falen.
