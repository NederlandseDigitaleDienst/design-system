# Beveiliging

Ontdek je een kwetsbaarheid in het NLDD Design System, meld hem dan
vertrouwelijk via GitHub:

**https://github.com/NederlandseDigitaleDienst/design-system/security/advisories/new**

Je melding is dan alleen zichtbaar voor jou en de beheerders van deze
repository. Meld een kwetsbaarheid niet in een openbaar issue.

Heb je geen GitHub-account, of meld je liever niet via GitHub, dan kan het ook
via het Nationaal Cyber Security Centrum:

**https://www.ncsc.nl/contact/kwetsbaarheid-melden**

Vermeld daarbij dat het gaat om het design system van de Nederlandse Digitale
Dienst (https://github.com/NederlandseDigitaleDienst/design-system). Het NCSC
brengt je melding dan bij ons onder de aandacht.

## Wat we van je vragen

Dit is een componentbibliotheek en geen draaiend systeem, dus een melding gaat
over het gepubliceerde pakket of de broncode. Daarmee helpen we je het snelst:

- **De versie** van `@nldd/design-system` waarin je het zag.
- **Het component of het bestand** waar het zit.
- **Hoe je het reproduceert**, met een klein stukje HTML of een code-voorbeeld
  waar het uit blijkt.
- **Wat er misgaat**, en waar mogelijk wat een aanvaller ermee zou kunnen.

Verder:

- Meld zo snel als redelijkerwijs kan, zodat de kans klein blijft dat iemand
  met kwade bedoelingen hem eerder vindt.
- Meld op een manier die de melding vertrouwelijk houdt.
- Deel de kwetsbaarheid niet met anderen voordat hij is opgelost.
- Ga niet verder dan nodig is om het bestaan aan te tonen. Bouw geen achterdeur
  en verander niets aan systemen van derden om je punt te maken.

## Wat je van ons mag verwachten

Meld je via het NCSC, dan volgt de afhandeling het beleid op
https://www.ncsc.nl/contact/kwetsbaarheid-melden. Meld je via GitHub:

- Je krijgt een reactie op je melding met een inschatting.
- Je hoort van ons hoe het staat met de oplossing. Dat gesprek loopt in de
  melding zelf, en daar kun je ook meewerken aan de fix.
- Is de kwetsbaarheid opgelost, dan publiceren we een security advisory.
- In die advisory noemen we je als ontdekker, tenzij je dat liever niet hebt.
- Je melding, en daarmee je GitHub-account, zien alleen de beheerders. Wil je
  je account er niet aan koppelen, meld dan via het NCSC.

## Welke versies

Er is één ondersteunde versie: de laatst gepubliceerde op npm. Fixes komen in
een nieuwe release en worden niet teruggezet naar oudere versies. Wat er per
release is veranderd staat in [`CHANGELOG.md`](./CHANGELOG.md).

## Geen kwetsbaarheid, wel een bug

Gaat het om een gewone fout in een component, gebruik dan de
[issues](https://github.com/NederlandseDigitaleDienst/design-system/issues). Hoe je dat het beste doet
staat in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
