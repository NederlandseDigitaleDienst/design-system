# Migreren in een server-gerenderde app

Aanvulling op [`SKILL.md`](SKILL.md) voor codebases die HTML op de server renderen en fragmenten inwisselen: Django of Rails met htmx, Turbo, Unpoly, LiveView. Lees eerst de hoofdskill; hieronder staat alleen wat specifiek is voor deze herkomst.

Eén zin organiseert bijna alles wat hier misgaat:

> **Een swap trapt de levenscyclus van een component niet af zoals een
> paginalading dat doet.**

De componenten zijn Lit-elementen met een shadow root. Bij een paginalading loopt de hele opstart: registratie, eerste render, observers. Bij een fragmentwissel komt er markup binnen in een document dat al draait, en dan gelden er andere regels.

## Vier valkuilen op die grens

**Open een overlay met `open` in de markup.** Een net ingewisselde overlay heeft zijn shadow-`<dialog>` nog niet gerenderd. Het attribuut `open` wacht zelf op die eerste render, en werkt voor sheet, window, modal en popover zonder een regel JavaScript:

```html
<nldd-sheet open>
  <nldd-page><!-- inhoud --></nldd-page>
</nldd-sheet>
```

`show()` wacht bij sheet, window en modal ook zelf. Bij een popover moet bovendien het anker er al staan, anders opent hij niet.

**`href` en een fragment-attribuut op hetzelfde element vechten.** Componenten die intern een `<a>` renderen (`nldd-list-item`, `nldd-card`, `nldd-menu-item`) laten die anchor winnen: de browser navigeert weg en gooit de respons weg. Kies er één, of onderschep de default click.

**Een POST vanuit een shadow root kan niet via een formulier.** Uitloggen en verwijderen horen POST te zijn, maar een menu-item in een shadow root kun je niet in een `<form>` wikkelen. Doe de POST vanuit JavaScript met het CSRF-token uit de markup.

**Zelfgerenderde formuliervelden koppelen zichzelf niet.** Render je de invoervelden zelf in plaats van via een component, dan moet je de validatie-attributen expliciet meerenderen. Doe je dat niet, dan krijgt de melding hoogte nul en is hij onzichtbaar, ook voor een schermlezer.

Dezelfde familie, breder: **een component doet eenmalig werk op een moment dat jouw stack nog niet klaar is, of doet het werk alleen op een trigger die niet terugkomt.** Verplaats je elementen in de DOM of verwissel je hun inhoud, controleer dan of het component dat werk opnieuw doet.

## Zet de nieuwe stack ernaast, en sloop hem daarna expliciet

Bouw de nieuwe UI in een eigen namespace: eigen route-prefix, eigen templatemap, eigen CSS en JS. Zet er een test op die faalt als er nieuwe tags in oude templates staan of omgekeerd. Zet daarna de basistemplate om zodat alles overerft, en haal de parallelle laag weg als aparte, geplande commit.

De reden om te isoleren is duur geleerd: een eerdere poging deelde templates, CSS en JavaScript met de oude versie en deed monkey-patches tijdens het draaien. Drie bestanden moesten terug omdat ze voor het nieuwe systeem waren herschreven, waardoor een pagina van het oude systeem brak.

**De parallelle laag is geen gratis vangnet: hij verstopt bugs.** Bij het opruimen bleek die laag echte fouten te bevatten die de review pas toen zag, waaronder een 500 in een import en een ontbrekende permissiecontrole. Plan de sloop dus in, en controleer bij het verwijderen wat er meeverdwijnt: in datzelfde opruimen gingen twee decorators mee die teruggezet moesten worden.

Een volgorde die werkte:

1. De nieuwe render-laag voor formulieren naast de oude, achterwaarts compatibel, zodat je per formulier kunt omzetten.
2. Views en formulieren omzetten.
3. De basistemplate vervangen.
4. De dode render-laag en de oude dependency verwijderen.
5. Oude klassen opsporen die door JavaScript worden geïnjecteerd.

## JavaScript is de laatste schuilplaats van het oude systeem

Die vijfde stap staat er niet voor niets apart. Nadat alle templates en stylesheets om waren, zat het oude systeem nog in `static/js/`: markup voor een toast, klassen voor radio's, een selector voor foutmeldingen. Een scan over je templates ziet dat niet, want JavaScript bouwt HTML-strings op.

Zoek oude klassenamen dus ook in je JavaScript, en houd er rekening mee dat ze daar in string-concatenatie en lookup-tabellen zitten in plaats van in markup.

## Zet er een test op die het oude systeem eruit houdt

Dit is de check die de hoofdskill niet noemt, en hij is goedkoop. Definieer een lijst markers van het oude designsysteem, render een representatief formulier in een test, en assert dat geen marker in de uitvoer voorkomt. Doe dat voor de gewone render én voor de render met validatiefouten.

Drie dingen maken het werkbaar:

- **Assert op de uitvoer, niet op de bron.** De oude laag zat in Python, in templates én in JavaScript dat klassen injecteerde. Een grep op de bron dekt de eerste twee. Door de gerenderde uitvoer te toetsen vang je alle drie in één keer.
- **Markers zijn prefixen met een streepje** (`rvo-`, niet `rvo`), anders raakt de test op elk toevallig voorkomen.
- **Gebruik een testformulier dat in de test zelf staat**, geen productieformulier. Dat laatste verandert, en dan faalt de guard om een reden die niets met markers te maken heeft.

Zet er de positieve tegenhanger naast (`assert "nldd-form-field" in rendered`). Zonder die assertie slaagt de guard ook op een render die kapot en daarom leeg is, en dus per definitie geen marker bevat.

Deze guards scannen de hele templateboom en lezen JavaScript-bestanden. Dat is te traag en te globaal voor een pre-commit hook op één bestand, en precies op zijn plek in CI op elke pull request.

## Vendoren ruilt het ene risico in voor het andere

Haal je de gebouwde bundel binnen in je repo in plaats van via npm, dan geldt er iets dat je moet willen:

> **Vendoring ruilt "stil kapot gaan op een moment dat je niet koos" in voor
> "bewust achterlopen".**

Niets werkt die bundel automatisch bij, dus een hernoeming in het designsysteem kan je app niet breken. Bij npm met een caret-range komt een nieuwe minor binnen bij de eerstvolgende installatie, en een attribuut dat stil is hernoemd laat dan al je meldingen verdwijnen zonder dat iemand iets wijzigde.

De keerzijde: je loopt achter, en je weet niet hoeveel. Leg de versie daarom op één plek vast die je taakrunner en je bundel allebei gebruiken, en zet hem in de repo zodat een upgrade een zichtbare commit is.

Twee dingen om bij zo'n upgrade te doen:

- **Lees de changelog van elke tussenliggende versie, niet alleen van de doelversie.** Een hernoeming zonder terugvalgedrag en een verwijderd element kunnen in dezelfde release zitten, en dan krijg je twee faalvormen tegelijk: de meldingen verdwijnen en de oude elementen worden permanent zichtbaar, want een ongedefinieerd custom element heeft geen shadow-stijlen.
- **Loop je eigen instructiebestanden na.** Schrijf je regels op voor je team of voor een agent, dan verouderen die stil bij een upgrade. Dat bestand is wat er straks nieuwe code mee schrijft, dus het is riskanter dan een verouderd comment.

## Eigen CSS op een component: alleen met een reden die je kunt opschrijven

Mag, maar zet er een comment boven die uitlegt **waarom het component het zelf niet kan**: render-timing, de grens van een fragmentwissel, de shadow DOM. Lukt die zin niet, dan is het smaak-styling en hoort de regel weg. Stuur bij voorkeur via attributen, slots en `--components-*`-variabelen.

Dat is ook een praktische scheidslijn bij het opruimen: regels met zo'n comment laat je staan, de rest is kandidaat voor verwijdering.
