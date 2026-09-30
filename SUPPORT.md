# Hulp bij het NLDD Designsysteem

## Waar je antwoord vindt

Begin bij de documentatie, want daar staat het meeste al in.

- **[Storybook](https://nederlandsedigitaledienst.github.io/design-system/)** toont elk component met z'n varianten en attributen, en je kunt er zelf aan draaien. Dit is de plek om te zien hoe iets eruitziet en werkt.
- **De [README](./README.md)** legt de installatie uit, de vijf lagen van CSS-variabelen en de opbouw van de styling.
- **De typedefinities** in `node_modules/@nldd/design-system` zijn de exacte API. Ze zijn gegenereerd uit de broncode, dus ze lopen nooit achter.
- **De `nldd`-plugin voor Claude Code** geeft een assistent dezelfde kennis, inclusief een offline referentie van elk component. Installeren staat in de [README](./README.md#claude-code-plugin).

## Waar je een vraag stelt

Kom je er niet uit, open dan een [issue](https://github.com/NederlandseDigitaleDienst/design-system/issues). Dat geldt voor alles: een bug, een component dat je mist, een patroon waarvan je niet weet hoe je het hoort te bouwen. Vragen zijn welkom, ook als het achteraf in de documentatie bleek te staan, want dan weten we dat die documentatie niet vindbaar genoeg is.

Hoe je een melding het beste opschrijft staat in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Twee uitzonderingen:

- **Kwetsbaarheden** horen niet in een openbaar issue. Die route staat in [`SECURITY.md`](./SECURITY.md).
- **Gedrag van mensen** valt onder [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) en heeft een eigen meldroute.

## Wat je kunt verwachten

Er is één maintainer, en die onderhoudt dit systeem naast ander werk. Er staat dus geen reactietermijn tegenover je vraag, en het antwoord kan zijn dat iets voorlopig niet wordt opgepakt. Wat afvalt krijgt een reden in het issue, zodat je weet waar je aan toe bent en niet blijft wachten. Wie wat beslist staat in [`PROJECT_GOVERNANCE.md`](./PROJECT_GOVERNANCE.md).

Ondersteund is de laatst gepubliceerde versie op npm. Fixes komen in een nieuwe release en worden niet teruggezet naar oudere versies.

## Waar dit project niet over gaat

Vragen over je eigen build, je framework of je applicatie vallen buiten dit project, tenzij het aan een component ligt. Werkt een component niet zoals de documentatie zegt, dan horen we het graag. Krijg je je bundler niet aan de praat, dan ben je bij je eigen team beter af.

Voor de bekende opstellingen leveren we wel een startpunt mee: platte HTML en Vue 3 staan uitgewerkt in de voorbeelden bij de `nldd`-plugin.
