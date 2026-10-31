---
name: nldd-design-validate
description: "Controleer code die @nldd/design-system gebruikt met nldd lint: verplichte attributen, onbekende tags, attributen, slots, waarden en iconen, en fouten in het samenspel van componenten. Draai dit nadat je nldd-* markup hebt geschreven of gewijzigd, en voordat je klaar zegt te zijn. Triggers: 'valideer', 'lint', 'klopt dit', 'controleer de nldd-componenten', 'nldd lint', een bevinding van de nldd-hook. Bouwen: nldd-design-build. Versie verhogen: nldd-design-upgrade."
metadata:
  type: reference
---

# Controleren met `nldd lint`

Deterministisch en zonder tokens, dus draai dit in plaats van zelf markup na te lopen.

## Werkwijze

```bash
npx @nldd/design-system lint --format json src/views/Aanvraag.vue
```

1. Los elke bevinding op. Je krijgt `rule`, `message`, de plek en vaak een goed voorbeeld.
2. Is dat niet genoeg: `npx @nldd/design-system explain <rule>`.
3. Draai opnieuw tot er niets meer staat.

| Wil je | Gebruik |
|---|---|
| Regels voor een component, vóór je het gebruikt | `npx @nldd/design-system rules --for nldd-toolbar` |
| Een snippet checken zonder bestand | `... lint --stdin --filename snippet.html` |
| Een site die naar HTML bouwt (Astro, MkDocs, Hugo, Django) | `... lint dist`: werkt voor elk framework en ziet hele pagina's |
| Zien wat een upgrade breekt | `npx @nldd/design-system@latest lint` op je huidige code |

Staat het pakket niet in het project, pin dan de versie die je gebruikt: `npx @nldd/design-system@<versie> lint`. Zonder pin krijg je de nieuwste.

## Wat hij niet ziet

In broncode meldt hij alleen wat zeker fout is, per bestand. Een waarde die pas tijdens het draaien bestaat, of een kind uit een ander component, blijft buiten beeld. Tijdens het ontwikkelen vangt de browser dat op: dezelfde regels staan dan als `[nldd] ...` in de console.

Geen meldingen betekent dus niet dat het goed is. Bedoeling, koppenstructuur en de opbouw van een pagina beoordeel je zelf, met de patronen in [`nldd-design-build`](../nldd-design-build/SKILL.md).

## Past een regel niet?

Pas de code aan. Gaat de regel hier echt niet op, onderdruk hem dan met een reden:

```html
<!-- nldd-lint-disable-next-line list-item-holds-cells -- de rij wordt verderop vervangen -->
```

Past hij structureel niet, dan is dat een voorstel: zie [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md).

## In een project opnemen

```bash
npx @nldd/design-system lint --update-baseline   # accepteer wat er staat; commit .nldd-lint-baseline.json
```

| Plek | Hoe |
|---|---|
| lint-staged | `{ "*.{html,vue,tsx}": "nldd lint" }` |
| CI | `npx @nldd/design-system lint --format github` |
| pre-commit | Zie hieronder |

```yaml
- repo: local
  hooks:
    - id: nldd-lint
      name: nldd lint
      entry: nldd lint
      language: node
      additional_dependencies: ['@nldd/design-system@<versie>']
      files: \.(html|vue|tsx|jsx)$
```

Configuratie is zelden nodig. Zo nodig, in `.nldd-lint.json`:

```json
{
  "exclude": ["src/legacy/"],
  "rules": { "table-needs-columns": "off" },
  "wrappers": { "NlddButton": "nldd-button" }
}
```
