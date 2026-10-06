# Migreren met een statische sitegenerator

Aanvulling op [`SKILL.md`](SKILL.md), de hoofdpagina van deze skill, voor sites die uit Markdown worden gebouwd: MkDocs, en in dezelfde vorm Hugo of Eleventy. Lees die eerst; hieronder staat alleen wat specifiek is voor deze herkomst.

Het verschil met een applicatie: de inhoud is niet van jou. Auteurs schrijven Markdown, en jij bezit alleen het thema en de build.

## Laat de Markdown staan, zet de HTML om

Vervang de admonitions, takenlijsten en codeblokken van de auteurs niet door `nldd-*`-tags in de bron. Auteurs kennen de Markdown-vorm, en contentvalidators (een linkchecker, een linter op koppen) lezen die ook. Zet je de bron om, dan breek je beide en moet elke nieuwe pagina het opnieuw goed doen.

Zet in plaats daarvan de gerenderde HTML om in een build-hook: de generator maakt van Markdown zijn gewone HTML, en jouw hook herschrijft daarin wat een component moet worden. De omzetting staat dan op één plek, en een pagina die morgen wordt geschreven krijgt die vanzelf.

Het thema (de basistemplate met kop, navigatie en voet) schrijf je wel direct in componenten. Dat is jouw markup.

Twee dingen die daarbij stil misgaan:

**Python-Markdown wikkelt een onbekende tag in een `<p>`.** Staat er toch een component in een Markdown-bestand, dan behandelt de parser een tag die hij niet kent als inline HTML, ook aan het begin van een regel. Je `nldd-container` belandt in een alinea, de browser sluit die alinea zodra er blokinhoud in staat, en je houdt lege `<p>`-elementen met marge over. Registreer de tagnamen als blokelement in een kleine Markdown-extensie:

```python
from markdown.extensions import Extension

NLDD_BLOCK_TAGS = ["nldd-container", "nldd-card", "nldd-collection"]


class NlddBlockTags(Extension):
    def extendMarkdown(self, md):
        md.block_level_elements.extend(NLDD_BLOCK_TAGS)
```

Zet in die lijst wat je in Markdown gebruikt. Je merkt het gat aan een `p > nldd-*` in de gerenderde HTML; een assertie daarop in de build is goedkoper dan de lijst volledig houden.

**Een dev-server herlaadt je build-hook niet.** De server bouwt opnieuw als een pagina verandert, maar houdt de hook die hij bij het starten heeft geladen. Pas je de hook aan en meet je direct daarna in de browser, dan meet je de oude code. Herstart de server na elke wijziging aan de hook, of meet tegen een verse build.

## De bundel zonder bundler

Een sitegenerator heeft meestal geen npm-stap. Haal de tarball van het pakket dan tijdens de build van de registry, en neem er `dist/nldd.min.js`, `dist/css/` en `dist/fonts/` uit. `custom-elements.json` zit in dezelfde tarball, dus je markupcheck leest de manifest van precies de versie die je uitlevert.

Leg de versie en de integriteitshash (`dist.integrity` uit de registry) samen in één bestand vast, en laat de build falen als de hash niet klopt. Een upgrade is dan een zichtbare commit van twee regels. De hash staat alleen hier beschreven. Wat een vastgezette versie je oplevert en kost staat in [`server-rendered.md`](server-rendered.md) onder vendoren, en geldt hier net zo.

## Twee dingen om vooraf te beslissen

Geen van beide is een defect. Het zijn eigenschappen van web components die bij een contentsite zwaarder wegen dan bij een applicatie, en waar een reviewer naar gaat vragen.

**Zonder JavaScript rendert niets uit een shadow root.** De topnavigatie verdwijnt, en elke titel die via een attribuut is gezet (`nldd-title text="..."`) ook. Wat in de light DOM staat blijft leesbaar: de tekst in een `nldd-rich-text`, en dus de inhoud van elke pagina. Een `<noscript>` met de navigatielinks als gewone `<a>`-elementen dekt het ergste. Beslis of dat genoeg is voordat je begint, want de oude site werkte waarschijnlijk volledig zonder script.

**De hele bundel laadt op elke pagina.** Zonder bundler is er niets dat ongebruikte componenten weglaat. In 0.8.93 is `dist/nldd.min.js` ruim 2 MB, gzipped rond de 580 kB, tegenover een pagina die eerder een paar kilobyte script had. De browser cachet de bundel na de eerste pagina. De losse modules in `dist/components/` zijn geen uitweg zonder meer: die importeren `lit` op naam, dus je hebt een import map of alsnog een bundler nodig, en je beheert dan zelf welke pagina welke module laadt. Meet het en leg de keuze vast.

## Het gedragsoppervlak van een gegenereerde site

De gedragscheck uit `SKILL.md` leest gerenderde HTML, en die heb je hier gratis: de build-uitvoer is de hele site. Leg het oppervlak vast uit de uitvoermap vóór de omzetting en vergelijk na elke build.

Let op het pad waaronder de site draait. Een 404-pagina linkt met absolute paden, want die wordt op elke diepte getoond, en daar zit het basispad van de site in. Een preview van een pull request draait onder een ander pad, dus een vastgelegd oppervlak met het productiepad erin faalt op elke preview. Haal het basispad uit elke bestemming voordat je vergelijkt.
