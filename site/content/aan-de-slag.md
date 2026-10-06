# Aan de slag

Het designsysteem is één npm-pakket: `@nldd/design-system`. De componenten zijn web components, dus gewone HTML-elementen met een `nldd-`-prefix. Ze werken in elk framework, in een server-gerenderde pagina en in een los HTML-bestand.

## Installeren

```bash
npm install @nldd/design-system
```

Laad eerst de styles. Daarin zitten de CSS-variabelen en de fonts die de componenten nodig hebben. Laad daarna alle componenten, of alleen de componenten die je gebruikt.

```js
import '@nldd/design-system/styles';

import '@nldd/design-system';
// of
import { NLDDButton, NLDDCheckbox } from '@nldd/design-system';
```

Daarna schrijf je de elementen in je HTML of in je template:

```html
<nldd-button appearance="accent-filled" text="Opslaan"></nldd-button>
<nldd-checkbox-field label="Akkoord met voorwaarden"></nldd-checkbox-field>
```

Werk je voor een organisatie buiten de Rijksoverheid, laad dan `@nldd/design-system/styles/system-font` in plaats van `/styles`. Het font Rijksoverheid Sans is alleen bestemd voor de Rijksoverheid en voor wie in haar opdracht werkt.

## Met een AI-assistent

Bouw je met Claude Code of Cursor, geef je assistent dan de skills van het designsysteem. Hij gebruikt daarna de tags, attributen en patronen die er zijn, in plaats van ze te raden. In Claude Code:

{{skillsInstall}}

De plugin levert vijf skills, en je assistent kiest zelf welke hij nodig heeft:

{{skillsTable}}

Hoe je ze in Cursor zet en waar hun kennis vandaan komt, staat bij [werken met een AI-assistent](/aan-de-slag/ai-assistent/).

## Zonder bundler

Heb je geen buildstap, zoals bij een statische sitegenerator, neem dan drie dingen uit het pakket en serveer ze zelf: `dist/nldd.min.js`, `dist/css/` en `dist/fonts/`.

```html
<link rel="stylesheet" href="/nldd/css/global.css">
<script src="/nldd/nldd.min.js"></script>
```

Dat ene scriptbestand bevat alle componenten: ruim 2 MB, gzipped rond de 580 kB. Voor een applicatie is de npm-route met losse imports daarom de betere keuze.

## Begin bij de schil

Elke pagina begint met een [`nldd-app-view`](/componenten/app-view/) als buitenste element. Daarbinnen staat een [`nldd-page`](/componenten/page/) voor een pagina die je leest, of een split view voor een applicatie waarin je werkt. De twee [patronen](/patronen/) die dat uitwerken zijn de [contentpagina](/patronen/content-page/) en de [applicatie](/patronen/application/).

Lees de [ontwerprichtlijnen](/richtlijnen/) voordat je een nieuwe interface ontwerpt. De componenten zijn op die keuzes gebouwd, bijvoorbeeld dat een knop niet disabled is en dat je optionele velden markeert in plaats van verplichte.

## Aanvullen in je editor

Het pakket bevat een Custom Elements Manifest (`custom-elements.json`): een beschrijving van elke tag met zijn attributen, slots en events. VS Code en de editors van JetBrains lezen dat bestand en vullen `nldd-*`-tags in gewone HTML aan, zonder dat je iets instelt.

In Vue vertel je de compiler eerst dat `nldd-*` custom elements zijn:

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('nldd-'),
        },
      },
    }),
  ],
};
```

Met één import erbij controleert Vue ook de attributen in je templates, met de types van het component zelf:

```js
import '@nldd/design-system/vue';
```

## Een andere taal

De componenten hebben Nederlandse standaardteksten. Een interface in een andere taal zet die teksten één keer, voor het hele pakket. Zie [vertalingen](/vertalingen/).

## Bijwerken

Elke release staat in de [changelog](/changelog/), ook de wijzigingen waarvoor je je code moet aanpassen. Het versienummer zegt dat niet: het systeem is in bèta en verhoogt bij elke release alleen het laatste cijfer. Lees dus de changelog voordat je een versie verhoogt.

## Hulp en bijdragen

Klopt er iets niet, of mis je een component? [Maak een issue aan](https://github.com/NederlandseDigitaleDienst/design-system/issues). De broncode staat in dezelfde [repository](https://github.com/NederlandseDigitaleDienst/design-system) en valt onder de EUPL-1.2.
