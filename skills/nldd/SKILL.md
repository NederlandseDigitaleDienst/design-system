---
name: nldd
description: "VERVANGEN. Deze skill heet nu nldd-design-bouwen. Gebruik nldd-design-bouwen om een applicatie te bouwen met @nldd/design-system, nldd-design om een component, attribuut, slot, event of icoonnaam op te zoeken of te zien wat er in een versie veranderde, en nldd-design-migreren om een bestaande frontend om te zetten. Deze verwijzing verdwijnt na 1 maart 2027."
metadata:
  type: reference
---

# Deze skill is vervangen

`nldd` betekende vier dingen tegelijk: de organisatie, het npm-pakket, de
plugin en deze skill. Hij is gesplitst in drie skills die zeggen waar ze over
gaan.

Ga verder met de juiste:

| Wat je gaat doen | Skill |
|---|---|
| een applicatie bouwen op `@nldd/design-system` | `nldd-design-bouwen` |
| opzoeken welke componenten, attributen, slots, events of iconen er zijn, of wat er in een versie is veranderd | `nldd-design` |
| een bestaande frontend omzetten naar dit design system | `nldd-design-migreren` |

De plugin heet nog steeds `nldd`, dus aan je installatie verandert niets.

## Staat `nldd` in je eigen bestanden?

Werk die verwijzingen bij. Twee daarvan breken geruisloos, dus zoek ze op in
plaats van te wachten tot je het merkt:

1. **Je eigen instructiebestanden**: `CLAUDE.md`, `.claude/rules/*.md`,
   `AGENTS.md`, of de tekst van een eigen skill die zegt "gebruik de nldd
   skill". Zonder deze doorverwijsskill zou Claude die instructie lezen, de
   skill niet vinden, en gewoon doorgaan.
2. **Subagent-definities** (`.claude/agents/*.md`) **en hooks** die op de
   skillnaam matchen.
3. **`Skill(nldd)` in permissieregels**: dat matcht niet meer, dus je krijgt
   een permissieprompt waar je die eerder niet had.
4. **Scripts die `claude -p "/nldd ..."` aanroepen.**

`enabledPlugins` en `extraKnownMarketplaces` wijzen naar `nldd@nldd-plugins`,
de plugin. Die blijft `nldd` heten, dus laat die met rust.

## Deze skill gaat weg

Hij bestaat alleen om verwijzingen naar de oude naam op te vangen en verdwijnt
**na 1 maart 2027**. Daarna is een verwijzing naar `nldd` weer stil kapot, dus
pas hem nu aan.
