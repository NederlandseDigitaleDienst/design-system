---
name: translation-keys
description: Conventies voor translation keys (i18n microcopy)
user-invocable: true
argument-hint: <component-naam>
---

Maak of controleer translation keys voor: $ARGUMENTS

## Wat is microcopy?

Woorden of zinnen in de interface die direct gerelateerd zijn aan gebruikersacties:
- De motivatie vóór de actie
- Instructies die de actie begeleiden
- De feedback nadat de gebruiker de actie heeft uitgevoerd

## Basisregels

- **Taal:** Nederlands (standaard), te overschrijven door consumer via `translations` property
- **Segmenten** gescheiden door punten (`.`)
- **Woorden** binnen een segment gescheiden door koppeltekens (`-`)
- **Placeholders** met enkele accolades: `{placeholder}`

## Organisatie van keys

### `general.*` — generieke vertalingen

Stabiele termen die over componenten heen gelden, als een woordenboek.

```
general.edit-action: Bewerk
general.optional-lowercase: optioneel
```

### `components.{naam}.*` — component-specifieke vertalingen

Keys gebonden aan herbruikbare UI-componenten.

```
components.list.drag-grabbed-text: Item opgepakt
components.toolbar.overflow-action: Meer
```

## Types (suffix van de key)

Elk key eindigt met een type dat aangeeft hoe de tekst geschreven moet worden.

### `-lowercase`, `-capitalize`

Voor exacte vertalingen van een enkel woord of vaste woordcombinatie: een woord uit het woordenboek, los van waar het gebruikt wordt. Hier is de kapitalisatie zelf het type en volgt er niets meer.

```
general.amount-capitalize: Bedrag
general.amount-lowercase: bedrag
components.date-picker.january-lowercase: januari
components.date-picker.january-capitalize: Januari
```

Is de tekst geen woordenboekwoord maar een voor deze interface geschreven beschrijving die tóch een vaste kapitalisatie nodig heeft, zet de kapitalisatie dan als modifier vóór het type. Dat gebeurt wanneer de tekst achter een langere string wordt geplakt en dus nooit met een hoofdletter kan beginnen.

```
components.date-picker.in-range-lowercase-label: in de periode
components.date-picker.unavailable-lowercase-label: niet beschikbaar
```

Voor uppercase weergave: gebruik CSS `text-transform`. Maak geen `-uppercase` keys. Voor kapitalisatie juist niet: die hoort in de vertaling, want per taal verschilt waar een hoofdletter hoort, en met CSS of `charAt(0).toUpperCase()` kan een vertaler hem niet uitzetten.

### `-title`

Kort en bondig. Taal-specifiek hoofdlettergebruik (Nederlands: alleen eerste letter).

```
components.modal-dialog.title: Modal dialoog
```

### `-text`

Altijd in zinsopbouw (sentence case).

```
components.list.drag-grabbed-text: Item opgepakt. Gebruik de pijltjestoetsen om te verplaatsen.
```

### `-label`

Korte tekst die iets beschrijft of aanduidt, zoals een form label, aria label of andere aanduiding. Kort als een titel, sentence case, geen punt.

Een aria label eindigt dus op `-label` en niet op `-label-text`: het type zegt al dat het een aanduiding is. Is het de toegankelijke naam van het component zelf (of van een benoemd onderdeel), gebruik dan `accessible-label` respectievelijk `{onderdeel}-accessible-label`.

```
general.email-label: E-mailadres
components.pagination.accessible-label: Paginering
```

### `-supporting-label`

Korte ondersteuning naast een label, zonder opmaak.

```
my-website.my-form.email-supporting-label: We sturen enkel een bevestiging.
```

### `-error-text`

Foutmelding na validatie. Alleen zichtbaar bij een fout.

```
my-website.my-form.email-is-empty-error-text: Vul een e-mailadres in.
```

### `-help-text`

Langere hulptekst, kan links of rijkere content bevatten.

```
my-website.my-form.email-help-text: U ontvangt een bevestiging per e-mail. Lees onze <a href="/privacy">Privacybeleid</a>.
```

### `-action`

Voor knoppen, links en andere acties. De sleutelnaam bevat een werkwoord dat zegt wat de actie doet. Een kaal zelfstandig naamwoord leest als een keuze: `today-action` klinkt alsof je vandaag kiest, terwijl de knop alleen naar de weergave van vandaag navigeert. Zet dat werkwoord er dan in (`view-today-action`), zodat een copywriter de tekst schrijft die bij de handeling past.

**Directe acties:** gebruik de gebiedende wijs (imperatief).
```
general.save-action: Bewaar
general.delete-action: Verwijder
components.pagination.previous-action: Vorige pagina
```

**Indirecte acties** (verwijzing naar een pagina/formulier): gebruik de infinitief in het Nederlands, met de `to-` prefix vóór het werkwoord.
```
general.to-save-action: Bewaren
general.to-login-action: Inloggen
```

### `-file-name`

Bestandsnamen zonder extensie (die voegt de backend toe).

```
general.general-conditions-file-name: algemene-voorwaarden
```

### `short-` prefix

Voeg `short-` toe vóór het type voor afkortingen.

```
general.mister-short-label: Dhr.
general.friday-short-capitalize: Vr.
```

## Bestandsstructuur

```typescript
// {naam}.i18n.ts
export const nldd{PascalName}Translations = {
	'components.{naam}.accessible-label': 'Label',
	'components.{naam}.previous-action': 'Vorige',
};

export type NLDD{PascalName}Translations = typeof nldd{PascalName}Translations;
```

## Implementatie in component

Gebruik de `withTranslations` mixin uit `src/utilities/with-translations.ts`. De mixin levert de `translations` property, de gemergede defaults en de `_t()` helper.

```typescript
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { withTranslations } from '../../../utilities/with-translations.js';
import { nldd{PascalName}Translations } from './{naam}.i18n.js';

@customElement('nldd-{naam}')
export class NLDD{PascalName} extends withTranslations(LitElement, nldd{PascalName}Translations) {
	override render() {
		return html`${this._t('components.{naam}.accessible-label')}`;
	}
}
```

Gebruik in templates `component._t('key', { var: value })` voor lookups met optionele `{var}`-placeholder-vervanging.

## Checklist

- [ ] Keys volgen de `components.{naam}.*` conventie
- [ ] Elk key eindigt met het juiste type suffix
- [ ] Directe acties in gebiedende wijs, indirecte acties in infinitief met `to-` prefix
- [ ] Placeholders met `{naam}` syntax
- [ ] Component gebruikt `withTranslations` mixin
- [ ] Consumer kan overschrijven via `translations` property
