# Migreren in een server-gerenderde app

Aanvulling op [`SKILL.md`](SKILL.md), de hoofdpagina van deze skill, voor codebases die HTML op de server renderen en fragmenten inwisselen: Django of Rails met htmx, Turbo, Unpoly, LiveView. Lees die eerst; hieronder staat alleen wat specifiek is voor deze herkomst.

Eén zin organiseert bijna alles wat hier misgaat:

> **Een swap trapt de levenscyclus van een component niet af zoals een paginalading dat doet.**

De componenten zijn Lit-elementen met een shadow root. Bij een paginalading loopt de hele opstart: registratie, eerste render, observers. Bij een fragmentwissel komt er markup binnen in een document dat al draait, en dan gelden er andere regels.

## Op die grens

**Open een overlay met `open` in de markup.** Een net ingewisselde overlay heeft zijn shadow-`<dialog>` nog niet gerenderd. Het attribuut `open` wacht zelf op die eerste render, en werkt voor sheet, window, modal en popover zonder een regel JavaScript:

```html
<nldd-sheet open>
  <nldd-page><!-- inhoud --></nldd-page>
</nldd-sheet>
```

`show()` wacht bij sheet, window en modal ook zelf. Bij een popover moet bovendien het anker er al staan, anders opent die niet.

**`href` en een fragment-attribuut op hetzelfde element vechten.** Componenten die intern een `<a>` renderen (`nldd-list-item`, `nldd-card`, `nldd-menu-item`) laten die anchor winnen: de browser navigeert weg en gooit de respons weg. Kies er één, of onderschep de default click.

**Een POST vanuit een menu doe je met `type="submit"`.** Uitloggen en verwijderen horen POST te zijn. Geef het `nldd-menu-item` dan `type="submit"` en wijs met `form` naar een gewoon formulier met het CSRF-token erin; het item verstuurt dat formulier zodra het gekozen wordt, zonder JavaScript van jou.

**Zelfgerenderde formuliervelden koppelen zichzelf niet.** Render je de invoervelden zelf in plaats van via een component, dan moet je de validatie-attributen expliciet meerenderen. Doe je dat niet, dan krijgt de melding hoogte nul en is die onzichtbaar, ook voor een schermlezer.

**Laat de componenten zichzelf laden.** Met `dist/cdn/autoloader.js` (zie "Laden zonder bundler" in [`nldd-design-build`](../nldd-design-build/SKILL.md)) laadt een ingewisseld fragment de componenten die erin staan, ook als de pagina ze nog niet had.

Dezelfde familie, breder: **een component doet eenmalig werk op een moment dat jouw stack nog niet klaar is, of doet het werk alleen op een trigger die niet terugkomt.** Verplaats je elementen in de DOM of verwissel je hun inhoud, controleer dan of het component dat werk opnieuw doet.

## Zet de nieuwe stack ernaast, en sloop die daarna expliciet

Bouw de nieuwe UI in een eigen namespace: eigen route-prefix, eigen templatemap en eigen JS-ingang. Zet er een test op die faalt als er nieuwe tags in oude templates staan of omgekeerd. Zet daarna de basistemplate om zodat alles overerft, en haal de parallelle laag weg als aparte, geplande commit.

De reden om te isoleren is duur geleerd: een eerdere poging deelde templates, CSS en JavaScript met de oude versie en deed monkey-patches tijdens het draaien. Drie bestanden moesten terug omdat ze voor het nieuwe systeem waren herschreven, waardoor een pagina van het oude systeem brak.

**De parallelle laag is geen gratis vangnet: die verstopt bugs.** Bij het opruimen bleek die laag echte fouten te bevatten die de review pas toen zag, waaronder een 500 in een import en een ontbrekende permissiecontrole. Plan de sloop dus in, en controleer bij het verwijderen wat er meeverdwijnt: in datzelfde opruimen gingen twee decorators mee die teruggezet moesten worden.

Een volgorde die werkte:

1. De nieuwe render-laag voor formulieren naast de oude, achterwaarts compatibel, zodat je per formulier kunt omzetten.
2. Views en formulieren omzetten.
3. De basistemplate vervangen.
4. De dode render-laag en de oude dependency verwijderen.
5. Oude klassen opsporen die door JavaScript worden geïnjecteerd.

## JavaScript is de laatste schuilplaats van het oude systeem

Die vijfde stap staat er niet voor niets apart. Nadat alle templates en stylesheets om waren, zat het oude systeem nog in `static/js/`: markup voor een notification, klassen voor radio's, een selector voor foutmeldingen. Een scan over je templates ziet dat niet, want JavaScript bouwt HTML-strings op.

Zoek oude klassenamen dus ook in je JavaScript, en houd er rekening mee dat ze daar in string-concatenatie en lookup-tabellen zitten in plaats van in markup.

## Zet er een test op die het oude systeem eruit houdt

Dit is de check die `SKILL.md` niet noemt, en die is goedkoop. Definieer een lijst markers van het oude designsysteem, render een representatief formulier in een test, en assert dat geen marker in de uitvoer voorkomt. Doe dat voor de gewone render én voor de render met validatiefouten.

Drie dingen maken het werkbaar:

- **Assert op de uitvoer, niet op de bron.** De oude laag zat in Python, in templates én in JavaScript dat klassen injecteerde. Een grep op de bron dekt de eerste twee. Door de gerenderde uitvoer te toetsen vang je alle drie in één keer.
- **Markers zijn prefixen met een streepje** (`rvo-`, niet `rvo`), anders raakt de test op elk toevallig voorkomen.
- **Gebruik een testformulier dat in de test zelf staat**, geen productieformulier. Dat laatste verandert, en dan faalt de guard om een reden die niets met markers te maken heeft.

Zet er de positieve tegenhanger naast (`assert "nldd-form-field" in rendered`). Zonder die assertie slaagt de guard ook op een render die kapot en daarom leeg is, en dus per definitie geen marker bevat.

Deze guards scannen de hele templateboom en lezen JavaScript-bestanden. Dat is te traag en te globaal voor een pre-commit hook op één bestand, en precies op zijn plek in CI op elke pull request.

## Vendoren ruilt het ene risico in voor het andere

Haal je de gebouwde bundel binnen in je repo in plaats van via npm, dan geldt er iets dat je moet willen:

> **Vendoring ruilt "stil kapot gaan op een moment dat je niet koos" in voor "bewust achterlopen".**

Niets werkt die bundel bij zonder dat jij het doet. Met npm is het verschil kleiner dan het lijkt: zolang het pakket onder 1.0 zit, is elke brekende release een minor, en `^0.20.0` neemt alleen patches mee. Een hernoeming komt dus ook via npm niet ongevraagd binnen. Vendoren is vooral een keuze voor een bouw zonder npm-stap.

De keerzijde: je loopt achter, en je weet niet hoeveel. Leg de versie daarom op één plek vast die je taakrunner en je bundel allebei gebruiken, en zet die in de repo zodat een upgrade een zichtbare commit is.

Twee dingen om bij zo'n upgrade te doen:

- **Draai de linter van de doelversie over je templates**, met `npx @nldd/design-system@<versie> lint`. Die meldt elke hernoeming en elk verwijderd element tussen jouw versie en die, en zet een hernoeming met `--fix` ook om. Wat hij niet ziet, gedrag dat anders werkt, staat in de changelog van elke tussenliggende versie. [`nldd-design-upgrade`](../nldd-design-upgrade/SKILL.md) beschrijft de hele ronde.
- **Loop je eigen instructiebestanden na.** Schrijf je regels op voor je team of voor een agent, dan verouderen die stil bij een upgrade. Dat bestand is wat er straks nieuwe code mee schrijft, dus het is riskanter dan een verouderd comment.

## Eigen CSS op een component: alleen tijdelijk, met een issue

Het doel is geen eigen CSS (zie de hoofdpagina). Moet er tijdelijk toch een regel staan, volg dan de regel voor een omweg uit [`SKILL.md`](SKILL.md#het-doel-alles-komt-uit-het-systeem). Bij server-rendering is het waarom meestal render-timing, de grens van een fragmentwissel of de shadow DOM.

Bij het opruimen is dat de scheidslijn: een regel met een open issue blijft tot dat issue is opgelost, de rest gaat nu weg.
