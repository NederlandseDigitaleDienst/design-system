---
name: nldd-design-contribute
description: "Stel een wijziging voor aan @nldd/design-system: een ontbrekend component of variant, een patroon, een bug, of iets dat je nu omheen bouwt. Triggers: 'dit component mist iets', 'kan dit erbij in het designsysteem', 'een patroon voorstellen', 'bug melden in nldd', 'issue openen voor het designsysteem', 'waar meld ik dit', 'ik heb dit zelf nagebouwd'. Binnen NLDD gaat het naar het designsysteem-kanaal op Mattermost, buiten NLDD naar een GitHub-issue. Voor bouwen met het systeem: nldd-design-build. Voor een versie verhogen: nldd-design-upgrade. Zegt ook waar de onderhouderskennis zit: die zit niet in deze plugin maar als repo-locale skills in de repository zelf, dus voor het ontwikkelen van het designsysteem zelf check je die uit."
metadata:
  type: reference
---

# Iets voorstellen aan het designsysteem

Je gebruikt deze skill als je met `@nldd/design-system` werkt en iets tegenkomt dat erin zou moeten zitten: een component dat mist, een variant die je nabouwt, een compositie die je in elk project opnieuw maakt, of gedrag dat kapot is.

## Eerst: waar hoort het heen

Dat hangt af van wie je bent, en het is de enige vraag die je vooraf moet beantwoorden.

- **Werk je binnen NLDD**, dan gaat het naar het designsysteem-kanaal op Mattermost. Dat is de voorkeursroute voor intern: korter dan een issue, en de maintainer leest mee. Een gesprek daar is genoeg; je hoeft er geen issue bij te openen.
- **Werk je buiten NLDD**, dan open je een [issue](https://github.com/NederlandseDigitaleDienst/design-system/issues). Die route staat open en werkt, en is voor jou de enige plek waar je gehoord wordt.

Het gaat in beide gevallen om hetzelfde: een goed beschreven probleem. Wat hieronder staat geldt dus voor allebei, alleen de plek verschilt. En in geen van beide gevallen begin je met een pull request; daarover onderaan meer.

## Beschrijf het probleem, niet alleen je oplossing

Dit is de belangrijkste gewoonte, en de makkelijkste om over te slaan. Noem wat er in jouw interface niet lukt, niet alleen het component dat je in gedachten hebt.

Twee redenen. Vaak kan een bestaand component het al, en dan is het antwoord een attribuut in plaats van nieuw werk. En kan het niet, dan bepaalt jouw context het ontwerp: een component dat één product oplost ziet er anders uit dan een component dat de taak oplost.

Concreet, voor een ontbrekend component of variant:

- **Welke taak** van je gebruiker lukt nu niet, en wat heb je geprobeerd?
- **Wat bouw je nu in plaats daarvan?** Een omweg is het sterkste bewijs dat er iets mist. Laat hem zien, ook als je hem niet mooi vindt.
- **Waar draait het?** Het product of scherm waar dit speelt.

## Wat je bij een bug meegeeft

Of je het in het kanaal zet of in een issue, dit is wat het meeste heen en weer scheelt:

- **De versie** van `@nldd/design-system` waarin je het zag. Niet de versie in je `package.json` maar wat je echt draait: `npm ls @nldd/design-system`. Een `^0.8.44` met een oud lockfile draait iets anders dan je denkt, en de helft van de gemelde bugs blijkt al gerepareerd te zijn.
- **Welk component** het betreft, en wat je verwachtte.
- **Een klein stukje HTML** dat het laat zien. Dit scheelt het meeste tijd van alles in deze lijst.

Controleer eerst of het in de [changelog](../nldd-design/changelog.md) al langskwam, en of het attribuut of slot dat je gebruikt echt bestaat in de [referentie](../nldd-design/reference.md). Dit systeem faalt stil: een verzonnen attribuut of icoonnaam rendert niets, zonder foutmelding, en dat lijkt op een bug in het component.

**Kwetsbaarheden gaan een andere route.** Die horen niet in een openbaar issue. Meld ze via het Nationaal Cyber Security Centrum, https://www.ncsc.nl/contact/kwetsbaarheid-melden, met "MinBZK/CIO-office github security response" erbij.

## Een patroon voorstellen

Een patroon is iets anders dan een component: het beschrijft hoe je bestaande componenten samenstelt tot iets dat een taak afhandelt. De set staat in [`patterns/`](../nldd-design-build/patterns/) en blijft **expres klein**. Acht patronen die kloppen zijn nuttiger dan een catalogus die niemand bijhoudt; patroonbibliotheken gaan dood aan achterstallig onderhoud, niet aan een verkeerd formaat.

Begin daarom bij het probleem en het bewijs, niet bij de code:

- **Welke taak** lost dit op, en waarom lukt dat niet met wat er al staat?
- **Waar draait het?** Noem de producten of schermen waar deze compositie al in gebruik is. Een compositie die in meerdere producten van verschillende teams terugkomt is een patroon van het systeem; iets dat in één app staat is voorlopig een gewoonte van die app. Dat sluit niets uit, maar het bepaalt hoe hard het bewijs is.
- **Wat is de regel?** Een patroon zonder "waarom zo" is een stuk voorbeeldcode, en dat hoort in Storybook.

Let op de grens met de ontwerprichtlijnen: compositie hoort in een patroon, een ontwerpkeuze hoort in de [ontwerprichtlijnen](../nldd-design/design-guidelines.md). Die wijzen sommige dingen expliciet af, wizards en megamenu's bijvoorbeeld, dus daar komt geen patroon voor, ook niet als een product ze heeft.

## Waar je op kunt rekenen

Eerlijk over hoe dit project werkt, zodat je weet wat je krijgt:

- **De maintainer beslist**, en wat afvalt krijgt een reden, in het issue of in het kanaal. Er is geen stemming en geen commissie; bij één maintainer zou dat een proces suggereren dat er niet is.
- **Ben je het oneens**, zeg dat op dezelfde plek. Komen jullie er niet uit, dan ligt de vraag bij het NLDD-team.
- **Een afwijzing is geen oordeel over je probleem.** Een systeem dat elk verzoek inwilligt wordt onbruikbaar; "dit los je in je eigen app op" is een geldige uitkomst, en dan weet je waar je staat.

## Als je zelf code schrijft

Kan, maar meld het eerst, via het kanaal of een issue, en schrijf daarna de code. Anders bouw je misschien iets wat een bestaand component al kan, of iets dat op een ontwerpkeuze afketst die je niet kende.

### Deze plugin helpt je niet bij het bouwen aan het systeem zelf

Belangrijk om te weten, want het is een makkelijke aanname: de skills in deze plugin zijn er voor wie het pakket **gebruikt**. Ze leren je niet hoe je een component in dit systeem schrijft. Vraag je Claude met alleen deze plugin om een nieuw component te bouwen, dan mist hij de conventies en levert hij iets dat er van buiten goed uitziet en de interne regels overtreedt.

De kennis die je daarvoor nodig hebt zit in de **repository zelf**, als repo-locale skills onder `.claude/skills/`. Die reizen expres niet mee met de plugin: ze gaan over de binnenkant van dit systeem, veranderen met de codebase mee, en zouden bij een afnemer alleen in de weg zitten.

Je krijgt ze door de repository uit te checken en Claude Code daarin te starten; ze laden dan automatisch:

```
git clone https://github.com/NederlandseDigitaleDienst/design-system
cd design-system
npm ci
```

Wat er dan beschikbaar is:

| Skill | Waarvoor |
|---|---|
| `/component` | een Lit- en TypeScript-component implementeren: bestandsindeling, naamgeving, templates, de verplichte tests |
| `/css` | de CSS-conventies: breakpoints per stuk (geen mobile-first overrides), at-rule nesting, de vijf variabelenlagen |
| `/changelog` | een entry schrijven die een consument iets zegt, boven het nieuwste versieblok |
| `/translation-keys` | de conventies voor i18n-keys en microcopy |
| `/worktree` | een worktree opzetten voor een nieuwe branch, met `.env` en `.claude/` erin |
| `/storybook-manager` | Storybook-instances starten en stoppen over meerdere worktrees |

Die lijst kan met de codebase meebewegen; `ls .claude/skills/` in je checkout is de actuele waarheid.

`CONTRIBUTING.md` in die repository is de bron voor wat er van een wijziging wordt verwacht (tests in een echte browser, geen CSS-fallbacks, conventionele commits) en loopt verder dan deze skill. Eén ding dat verrast: elke `nldd-*`-tag in de documentatie wordt in CI gecontroleerd tegen de echte component-API, dus een voorbeeld met een verzonnen attribuut laat de build falen.

## De andere skills in deze plugin

Bouw je iets wat je *niet* wilt voorstellen maar wel moet werken, dan hoort dat bij [`nldd-design-build`](../nldd-design-build/SKILL.md). Loop je hier tegen iets aan na een versiebump, kijk dan eerst bij [`nldd-design-upgrade`](../nldd-design-upgrade/SKILL.md): een breaking change kan in een patch zitten.
