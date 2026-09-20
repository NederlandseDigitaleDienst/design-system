# Migreren vanaf een ander design system

Aanvulling op [`SKILL.md`](SKILL.md) voor codebases die al op een design system
draaiden: het NL Design System, ROOS van RVO, of een eigen componentbibliotheek.
Lees eerst de hoofdskill; hieronder staat alleen wat specifiek is voor deze
herkomst.

Dit is een andere uitgangspositie dan een migratie vanaf losse CSS. Je team
kent componenten al, je markup is al gestructureerd, en dat voelt als een
voorsprong. Dat is het ook, maar het levert twee valkuilen op die een
Tailwind-migratie niet heeft: je raadt namen die plausibel klinken, en je neemt
gewoontes mee die hier anders werken.

## Verzin geen tokennaam, ook niet een plausibele

Dit is de duurste fout vanuit deze herkomst, en hij voelt als kennis in plaats
van als gokken.

Onze variabelen hebben vier prefixen: `--primitives-`, `--semantics-`,
`--components-` en `--context-`. Er is **geen** `--nldd-`-prefix. Wie van een
ander systeem komt, schrijft toch iets als:

```css
/* Ziet eruit als een themawaarde. Bestaat niet. */
background: var(--nldd-color-surface, #fff);
```

De naam bestaat nergens, dus de browser neemt de terugval. In de lichte
weergave klopt het toevallig, want die hex is voor licht gekozen. In de donkere
weergave krijg je lichte tekst op een wit vlak.

**Een terugval maakt een verkeerde tokennaam onzichtbaar.** Dat is de reden dat
de tokencheck uit de hoofdskill `var(--x, #aabbcc)` het hardst moet vlaggen.
Zonder terugval had de kleur gewoon niets gedaan en had je het meteen gezien.

De echte namen zijn beschrijvend en Nederlands waar het om kleur gaat:
`--semantics-surfaces-base-background-color`,
`--semantics-surfaces-tinted-background-color`,
`--primitives-color-groen-500`, `-oranje-`, `-lintblauw-`. Zoek ze op in
[`reference.md`](../nldd-design/reference.md) en in
`node_modules/@nldd/design-system/dist/css/`, en grep het pakket voordat je een
naam opschrijft.

Hetzelfde geldt voor icoonnamen en voor attributen: een `variant`-waarde uit je
vorige systeem is hier meestal geen bestaande waarde, en een onbekende variant
valt stil terug op de standaard.

## De donkere weergave legt bloot wat je hebt gemist

Zet de donkere weergave aan en loop de schermen langs. Alles wat zijn kleur uit
een token haalt, beweegt mee; alles wat dat niet doet, valt op. Dat maakt van
een donkere modus een gratis controle op je hele migratie, niet alleen op je
kleurkeuzes.

Twee vormen die je zoekt: een vaste hexwaarde, en de terugval hierboven. De
tweede vind je alleen zo, want in de lichte weergave ziet hij er goed uit.

## Twee systemen naast elkaar: kies bewust

Een systeem vervangen dat er al zit, is wat anders dan CSS opruimen. Je hebt
twee werkbare vormen, en de keuze bepaalt de rest van het project:

**Alles in één keer**, per pagina of per overervingsketen, met de oude weg
ernaast tot je klaar bent. Dan kun je per route schakelen en de twee
vergelijken, wat de sterkste meetmethode oplevert die er is (zie hieronder).
Prijs: zolang beide bestaan is elke wijziging twee keer werk, en lopen ze uit de
pas. In één project gebeurde dat binnen enkele weken drie keer.

**Direct vervangen**, zonder schakelaar. Goedkoper in onderhoud, maar je hebt
geen oude pagina meer om tegen te meten, dus je moet het gedragsoppervlak
vooraf vastleggen (zie de hoofdskill).

Kies je voor de schakelaar, ruim hem dan op als eerste wat er af kan. Eén
project legde vooraf vast wanneer dat mocht: toen elk oud sjabloon een nieuwe
tegenhanger had. Dat getal, nul sjablonen zonder tegenhanger, maakte van de
sloop een taak die af kan in plaats van een migratie die blijft duren.

## De vergelijking die je alleen nú kunt maken

Zolang beide systemen dezelfde route kunnen renderen, kun je iets meten dat
later onmogelijk is: haal de pagina twee keer op, een keer oud en een keer
nieuw, en leg het **gedragsoppervlak** naast elkaar. Niet hoe het eruitziet,
maar wat de pagina kan: waar je heen kunt, wat er opgehaald wordt, welke
functies er aangeroepen worden, welke velden er zijn.

Zo zijn in één omzetting een keuzelijst, een knop die een venster opende en de
velden van een filter teruggevonden die stilzwijgend waren verdwenen. Geen van
drieën gaf een foutmelding.

Gooi die vergelijking niet zomaar weg als de oude pagina eruit gaat. Dan meet
hij de ene helft van niets tegen de andere, maar dezelfde meetlat werkt verder
met een vastgelegde lijst als bron in plaats van de oude pagina. Zie
"Meet wat een pagina DOET" in de hoofdskill.

## Wat je meeneemt zonder het te merken

**Eigen CSS op componenten.** In je vorige systeem was dat misschien normaal.
Hier is het een signaal: stuur via attributen, slots en `--components-*`, en
schrijf boven elke uitzondering waarom het component het zelf niet kan. Lukt
die zin niet, dan is het smaak.

**Sjablonen zonder aanroeper.** Bij een omzetting ontstaan wezen: een bestand
dat niemand meer rendert. Bij het opruimen haal je die weg zonder het te
merken, wat prima is, maar controleer of er niets omheen hangt.

**Dubbele bestanden per scherm.** Draai je met een schakelaar, dan krijgt elk
scherm twee sjablonen. Reken erop dat die uit de pas lopen en dat een wijziging
twee keer moet. Dat is de prijs van de vergelijkbaarheid hierboven, en hij is
het waard zolang je de sloop plant.

## Volgorde bij het opruimen

Eerst de aanroepers, dan de sjablonen, dan de omgeving, dan de afhankelijkheid.
Andersom sloop je de grond onder je voeten weg en weet je bij de eerste rode
test niet meer of het aan de sloop ligt of aan iets anders.

Draai na elke stap je hele suite. Dit is precies het soort werk waarbij vijf
halve stappen samen onvindbaar worden.
