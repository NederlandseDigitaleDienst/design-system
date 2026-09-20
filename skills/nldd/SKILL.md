---
name: nldd
description: "VERVANGEN. Deze skill is opgesplitst. Gebruik nldd-design-bouwen om een applicatie te bouwen met @nldd/design-system, nldd-design om een component, attribuut, slot, event of icoonnaam op te zoeken of te zien wat er in een versie veranderde, en nldd-design-migreren om een bestaande frontend om te zetten. Alle drie zitten al in de nldd-plugin; je hoeft niets te installeren. Deze verwijzing verdwijnt na 1 maart 2027."
metadata:
  type: reference
---

# Deze skill is opgesplitst in drie

`nldd` betekende vier dingen tegelijk: de organisatie, het npm-pakket, de
plugin en deze skill. Hij is nu gesplitst in drie skills die zeggen waar ze
over gaan.

## Je hoeft niets te installeren

Alle drie zitten in dezelfde `nldd`-plugin die je al hebt. Er is geen tweede
plugin, geen extra marketplace, en `enabledPlugins` hoeft niet aangepast: dat
verwijst naar `nldd@nldd-plugins`, en die naam is niet veranderd.

Werkt een van de drie niet, dan draai je een oude versie van de plugin:

```
/plugin marketplace update nldd-plugins
```

## Welke van de drie heb je nodig

| Je gaat | Gebruik | Wat erin zit |
|---|---|---|
| een applicatie bouwen op `@nldd/design-system` | **`nldd-design-bouwen`** | de visie, de acht basispatronen, bootstrap-voorbeelden voor HTML en Vue |
| opzoeken welk component, attribuut, slot, event of icoon er is, of wat er in een versie veranderde | **`nldd-design`** | de componentreferentie, de changelog, de ontwerprichtlijnen |
| een bestaande frontend omzetten naar dit systeem | **`nldd-design-migreren`** | wat er stil misgaat, per herkomst: Tailwind, een ander design system, server-gerenderd |

Weet je het niet zeker: begin bij `nldd-design-bouwen`. Die verwijst door naar
de naslag waar dat nodig is.

## Hoe je ze aanroept

Claude kiest zelf de juiste skill op basis van je vraag; je hoeft niets te
typen. Wil je er expliciet een aanroepen, dan kan dat op twee manieren:

```
/nldd-design-bouwen          de korte vorm
/nldd:nldd-design-bouwen     werkt altijd
```

De korte vorm gaat naar een skill van je eigen project als die toevallig
dezelfde naam draagt. De vorm met `nldd:` ervoor komt gegarandeerd bij de
plugin uit.

## Zoek `nldd` op in je eigen bestanden

Dit is het echte werk, en de eerste twee breken zonder foutmelding. Deze skill
vangt ze nu nog op, maar hij verdwijnt.

1. **Je instructiebestanden**: `CLAUDE.md`, `.claude/rules/*.md`, `AGENTS.md`,
   of de tekst van een eigen skill die zegt "gebruik de nldd skill". Vervang
   de naam door de skill die je daar bedoelt, meestal `nldd-design-bouwen`.
2. **Subagent-definities** (`.claude/agents/*.md`) **en hooks** die op de
   skillnaam matchen.
3. **`Skill(nldd)` in permissieregels**: die matcht niet meer, dus je krijgt
   een permissieprompt waar je die eerder niet had. Maak er
   `Skill(nldd-design-bouwen)` van, of voeg alle drie toe.
4. **Scripts of CI** die `claude -p "/nldd ..."` aanroepen.

Eén zoekopdracht vindt ze allemaal:

```
rg -n '\bnldd\b' --glob '!node_modules' CLAUDE.md AGENTS.md .claude/
```

Laat `nldd@nldd-plugins` staan: dat is de pluginnaam en die klopt nog.

## Deze skill gaat weg

Hij bestaat alleen om verwijzingen naar de oude naam op te vangen, en wordt
**na 1 maart 2027 verwijderd**. Daarna is een verwijzing naar `nldd` weer stil
kapot, dus pas hem nu aan in plaats van erop te leunen.
