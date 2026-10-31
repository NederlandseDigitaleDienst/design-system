---
name: nldd-design-validate
description: "Controleer code die @nldd/design-system gebruikt met nldd lint: verplichte attributen, onbekende tags, attributen, slots, waarden en iconen, en fouten in het samenspel van componenten. Draai dit nadat je nldd-* markup hebt geschreven of gewijzigd, en voordat je klaar zegt te zijn. Triggers: 'valideer', 'lint', 'klopt dit', 'controleer de nldd-componenten', 'nldd lint', een bevinding van de nldd-hook. Bouwen: nldd-design-build. Versie verhogen: nldd-design-upgrade."
metadata:
  type: reference
---

# Controleren met `nldd lint`

De linter is deterministisch en kost geen tokens, dus draai hem in plaats van zelf markup na te lopen. Hij kent de API van precies de versie die in het project staat.

## Werkwijze

1. Draai de linter op wat je hebt gewijzigd:

   ```bash
   npx @nldd/design-system lint --format json src/views/Aanvraag.vue
   ```

   Dat werkt ook als het pakket niet in het project staat, bijvoorbeeld bij server-gerenderde HTML met de CDN-build.

2. Los elke bevinding op. Een bevinding geeft `rule`, `message`, de plek, en vaak een goed voorbeeld in `example`. Is dat niet genoeg, dan geeft `npx @nldd/design-system explain <rule>` de regel, het waarom en voorbeelden.
3. Draai de linter opnieuw, tot er niets meer staat.

Een snippet controleren vóór je hem opslaat kan ook:

```bash
echo '<nldd-icon-button icon="plus"></nldd-icon-button>' | npx @nldd/design-system lint --stdin --filename snippet.html
```

Wat er geldt voor een component vóór je het gebruikt, vraag je op met `npx @nldd/design-system rules --for nldd-toolbar`.

## Wat je met een bevinding doet

Pas de code aan. Onderdruk een regel alleen als hij hier echt niet opgaat, met de reden erbij:

```html
<!-- nldd-lint-disable-next-line list-item-holds-cells -- de rij wordt verderop vervangen -->
```

Past een regel structureel niet, dan is dat een voorstel voor het designsysteem: zie [`nldd-design-contribute`](../nldd-design-contribute/SKILL.md).

## Wat de linter niet ziet

Hij leest per bestand en meldt alleen wat zeker fout is. Een waarde die pas bij het draaien bekend is, of een kind uit een ander component, blijft dus buiten beeld. Wat hij niet meldt is daarmee niet bewezen goed: hele pagina's, koppenstructuur en bedoeling kun je alleen zelf beoordelen, aan de hand van de patronen in [`nldd-design-build`](../nldd-design-build/SKILL.md).

## In een project opnemen

```bash
npx @nldd/design-system lint --update-baseline   # accepteer wat er staat, meld alleen nieuwe bevindingen
```

Commit `.nldd-lint-baseline.json`. Daarna:

- lint-staged: `{ "*.{html,vue,tsx}": "nldd lint" }`
- CI: `npx @nldd/design-system lint --format github` geeft annotaties op de pull request.
- pre-commit, ook in een repo zonder Node:

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

Andere instellingen zijn zelden nodig. Staan ze er wel, dan in `.nldd-lint.json`:

```json
{
  "exclude": ["src/legacy/"],
  "rules": { "table-needs-columns": "off" },
  "wrappers": { "NlddButton": "nldd-button" }
}
```
