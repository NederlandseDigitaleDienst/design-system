---
name: nldd
description: "Wegwijzer naar de vijf nldd-skills, voor wie op de oude naam `nldd` uitkomt. Gebruik nldd-design-build om een applicatie te bouwen met @nldd/design-system, nldd-design om een component, attribuut, slot, event of icoonnaam op te zoeken of te zien wat er in een versie veranderde, nldd-design-migrate om een bestaande frontend om te zetten, nldd-design-upgrade om een versie te verhogen, en nldd-design-contribute om een wijziging voor te stellen. Alle vijf zitten in de plugin die je al hebt, die nu nldd-design-system heet. Heb je hem als nldd@nldd-plugins, stap dan voor 1 maart 2027 over naar nldd-design-system@nldd. Deze wegwijzer verdwijnt na 1 maart 2027."
metadata:
  type: reference
---

# Welke nldd-skill je nodig hebt

`nldd` is de organisatie en het npm-pakket, en daarmee geen naam die zegt wat een skill doet. De kennis zit daarom in vijf skills die dat wel doen. Deze pagina wijst je naar de juiste, en verder niets.

## De skills heb je al, de marketplace verhuist

Alle vijf zitten in de plugin die je al hebt. Die heet nu `nldd-design-system` en staat in de NLDD-marketplace, `NederlandseDigitaleDienst/ai-plugins`.

Kijk in `enabledPlugins` (in `~/.claude/settings.json` of in `.claude/settings.json` van het project) onder welke naam je hem hebt:

- **`nldd-design-system@nldd`**: je zit goed, er is niets te doen.
- **`nldd@nldd-plugins`**: dat is de oude marketplace, in de repository van het designsysteem zelf. Die blijft tot 1 maart 2027 werken en updaten en verdwijnt daarna. Stap voor die tijd over:

```
/plugin marketplace add NederlandseDigitaleDienst/ai-plugins
/plugin install nldd-design-system@nldd
/plugin uninstall nldd@nldd-plugins
/plugin marketplace remove nldd-plugins
```

Staat de verwijzing in de `.claude/settings.json` van een project, vervang dan daar `nldd-plugins` onder `extraKnownMarketplaces` door `nldd` met als bron `NederlandseDigitaleDienst/ai-plugins`, en `nldd@nldd-plugins` onder `enabledPlugins` door `nldd-design-system@nldd`. Zeg het de gebruiker als je dit tegenkomt; pas het niet ongevraagd aan.

Werkt een van de vijf niet, dan draai je een oude versie van de plugin. Werk de marketplace bij waar je hem uit hebt: `/plugin marketplace update nldd`, of `/plugin marketplace update nldd-plugins` voor de oude.

## Welke van de vijf heb je nodig

| Je gaat | Gebruik | Wat erin zit |
|---|---|---|
| een applicatie bouwen op `@nldd/design-system` | **`nldd-design-build`** | de visie, de basispatronen, bootstrap-voorbeelden voor HTML en Vue |
| opzoeken welk component, attribuut, slot, event of icoon er is, of wat er in een versie veranderde | **`nldd-design`** | de componentreferentie, de changelog, de ontwerprichtlijnen |
| een bestaande frontend omzetten naar dit systeem | **`nldd-design-migrate`** | wat er stil misgaat, per herkomst: Tailwind, een ander design system, server-gerenderd |
| een applicatie die al op dit systeem draait naar een nieuwere versie brengen | **`nldd-design-upgrade`** | het upgradepad uit de changelog, en waarom het versienummer niets zegt |
| iets voorstellen: een ontbrekend component, een patroon, een bug | **`nldd-design-contribute`** | hoe je een issue opbouwt, en waarom het probleem vóór de oplossing komt |

Weet je het niet zeker: begin bij `nldd-design-build`. Die verwijst door naar de naslag waar dat nodig is.

## Hoe je ze aanroept

Claude kiest zelf de juiste skill op basis van je vraag; je hoeft niets te typen. Wil je er expliciet een aanroepen, dan kan dat op twee manieren:

```
/nldd-design-build                        de korte vorm
/nldd-design-system:nldd-design-build     werkt altijd
```

De korte vorm gaat naar een skill van je eigen project als die toevallig dezelfde naam draagt. De vorm met `nldd-design-system:` ervoor komt gegarandeerd bij de plugin uit. Tot voor kort was dat `nldd:`; die vorm werkt niet meer.

## Zoek `nldd` op in je eigen bestanden

Dit is het echte werk, en de eerste twee breken zonder foutmelding. Deze wegwijzer vangt ze nu nog op, maar die verdwijnt.

1. **Je instructiebestanden**: `CLAUDE.md`, `.claude/rules/*.md`, `AGENTS.md`, of de tekst van een eigen skill die zegt "gebruik de nldd skill". Vervang de naam door de skill die je daar bedoelt, meestal `nldd-design-build`.
2. **Subagent-definities** (`.claude/agents/*.md`) **en hooks** die op de skillnaam matchen.
3. **`Skill(nldd)` in permissieregels**: die matcht niet meer, dus je krijgt een permissieprompt waar je die eerder niet had. Maak er `Skill(nldd-design-build)` van, of voeg alle vijf toe.
4. **Scripts of CI** die `claude -p "/nldd ..."` aanroepen.

Eén zoekopdracht vindt ze allemaal:

```
rg -n '(^|[^-\w@])nldd([^-\w/]|$)' --glob '!node_modules' CLAUDE.md AGENTS.md .claude/
```

De zoekopdracht slaat `@nldd/design-system` en de `nldd-*`-tags over. Twee dingen vindt hij wel die geen skillnaam zijn:

- `nldd:`, de oude lange vorm (`/nldd:nldd-design-build`, of `Skill(nldd:nldd-design-build)` in een permissieregel). Maak er `nldd-design-system:` van.
- `nldd@nldd-plugins`, de oude naam van de installatie. Zie hierboven hoe je die omzet.

## Deze wegwijzer gaat weg

Die bestaat alleen om verwijzingen naar de losse naam `nldd` op te vangen en om de overstap naar de nieuwe marketplace te melden, en wordt **na 1 maart 2027 verwijderd**. Daarna is zo'n verwijzing weer stil kapot, dus pas die nu aan in plaats van erop te leunen.
