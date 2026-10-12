# Toegankelijkheid

Een component kan een pagina niet toegankelijk maken, maar wel veel werk uit handen nemen. Deze pagina zegt waar we op bouwen, wat de componenten zelf doen, wat jij nog moet doen en hoe we testen.

## Waar we op bouwen

We bouwen voor WCAG 2.2 niveau AA. Dat is een stap verder dan wat DigiToegankelijk (EN 301 549) nu vraagt, WCAG 2.1 niveau AA. Voor rollen en toetsenbordgedrag volgen de componenten de WAI-ARIA Authoring Practices.

Of een pagina voldoet, bepaal je per pagina. De componenten zijn daarvoor een voorwaarde en geen garantie: met de juiste onderdelen kun je nog steeds een pagina bouwen die niet te volgen is.

## Wat de componenten zelf doen

- **Rol, naam en toestand.** Elk component zet de juiste rol en de juiste `aria`-attributen op het element dat ze nodig heeft, ook als dat in een shadow root zit.
- **Toetsenbord.** Alles wat je kunt aanklikken, kun je ook met het toetsenbord bedienen. Een groep zoals een lijst, een menu of een tabbalk is één tabstop, en binnen de groep ga je verder met de pijltjestoetsen.
- **Focus.** De focusring komt uit één token en is op elk oppervlak zichtbaar. Een sheet en een modal dialog houden de focus bij zich zolang ze open zijn en geven hem daarna terug aan waar je vandaan kwam.
- **Formaat.** Een control is standaard 44 pixels hoog. De kleinere formaten zijn er voor dichte schermen.
- **Contrast op een vlak.** Een vlak geeft zijn inhoudskleur door aan wat erin staat, dus tekst op een gekleurd of getint vlak houdt zijn contrast. Zet daarvoor `background` op het component en `color="inherit"` op de tekst erin.
- **Beweging en contrastmodus.** Componenten met een animatie volgen `prefers-reduced-motion`. In de contrastmodus van het besturingssysteem (`forced-colors`) blijven randen, toestanden en de focusring zichtbaar.
- **Meldingen.** Een [`nldd-status-bar`](https://nederlandsedigitaledienst.github.io/design-system/?path=/docs/components-status-feedback-status-bar--docs) en een [`nldd-notification`](https://nederlandsedigitaledienst.github.io/design-system/?path=/docs/components-status-feedback-notification--docs) melden zichzelf aan een schermlezer.
- **Standaardteksten.** Ingebouwde teksten, zoals de naam van een sluitknop, zijn Nederlands en zet je in één keer om naar een andere taal. Zie [Vertalingen](https://nederlandsedigitaledienst.github.io/design-system/?path=/docs/docs-vertalingen--docs).
- **Waarschuwingen tijdens het bouwen.** Mist een component iets wat het nodig heeft, zoals een naam op een knop met alleen een icoon, dan zegt het dat in de console. Alleen in development.

## Wat jij nog moet doen

- **Geef een naam aan wat geen zichtbare tekst heeft.** Een knop met alleen een icoon, een kaart die een link is en een lijst krijgen een `accessible-label`.
- **Houd de koppen op orde.** Eén `h1` per pagina, en geen niveau overslaan. `size` op een titel is hoe hij eruitziet, `heading-level` wat hij is.
- **Beschrijf afbeeldingen.** Een afbeelding die iets zegt krijgt een `alt`; een afbeelding die alleen sfeer is krijgt `decorative`.
- **Zet de taal.** Een `lang` op de pagina, en op elk stuk tekst in een andere taal.
- **Koppel een label aan elk veld.** Zet een invoerveld in een `nldd-form-field`, dan zitten het label, de hulptekst en de foutmelding eraan vast.
- **Schrijf de markup in de volgorde waarin je leest.** Wat op een breed scherm naast elkaar staat, staat op een smal scherm onder elkaar, in de volgorde van de markup. Een schermlezer volgt die ook.

Wat een component precies doet en vraagt, staat op zijn eigen pagina. Elk patroon heeft een sectie Toegankelijkheid, met wat je gratis krijgt en wat jij nog moet doen.

## Hoe we testen

- **Automatisch, bij elke wijziging.** ESLint draait alle regels van `eslint-plugin-lit-a11y` over de templates. De tests draaien in een echte browser en controleren rollen, namen, focus en toetsenbord, op een aantal plekken met axe erbij.
- **In Storybook.** Elke story heeft een tabblad Accessibility dat axe over het voorbeeld laat lopen.
- **Met de hand.** Met het toetsenbord, met VoiceOver in Safari, op 200% tekstgrootte en in de contrastmodus. Dat vinden de automatische controles niet: of een volgorde logisch is, of een melding op het juiste moment komt, of een naam iets zegt.

## Iets gevonden

Meld het in een [issue](https://github.com/NederlandseDigitaleDienst/design-system/issues), met het component, wat je deed en welke hulpsoftware je gebruikte.
