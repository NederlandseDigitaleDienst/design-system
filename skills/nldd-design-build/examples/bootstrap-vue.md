# Bootstrap: Vue 3 + Vite

Dit is de stack van [regelrecht](https://github.com/MinBZK/regelrecht), de productie-app die dit systeem het meest volwassen gebruikt. De voorbeelden zijn daaruit gedestilleerd.

## 1. Importeren

```js
// main.js
import '@nldd/design-system';
import '@nldd/design-system/styles';
```

RijksSans is uitsluitend bestemd voor publicaties van de Rijksoverheid en voor partijen die in haar opdracht werken, zie [`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md). Bouw je iets daarbuiten, importeer dan `@nldd/design-system/styles/system-font`: dezelfde stylesheet zonder de `@font-face`-regels, waarna de familie-stacks vanzelf op een systeemfont uitkomen.

## 2. Vue de custom elements laten herkennen

Zonder dit waarschuwt Vue over onbekende elementen en behandelt het `nldd-*` tags als Vue-componenten.

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

## 3. Componenten gebruiken in een SFC

Custom events leveren hun waarde in `event.detail`. Lees defensief.

```vue
<script setup>
import { ref } from 'vue';

const kvk = ref('');

function onKvkInput(event) {
  // nldd-velden leveren de waarde in event.detail; val terug op target.value
  kvk.value = event.detail?.value ?? event.target?.value ?? '';
}
</script>

<template>
  <nldd-form-field label="KvK-nummer">
    <nldd-text-field
      :value="kvk"
      @input="onKvkInput"
    ></nldd-text-field>
  </nldd-form-field>
</template>
```

## 4. Een sheet openen en sluiten met `open`

`nldd-sheet` heeft, net als window, modal en popover, een attribuut `open`. Bind je toestand daaraan. Mount het element niet in en uit met `v-if`: dan slaat de animatie over en verlies je DOM-toestand.

```vue
<script setup>
defineProps({ open: Boolean });
const emit = defineEmits(['close']);
</script>

<template>
  <nldd-sheet
    placement="right"
    :open="open"
    @close="emit('close')"
  >
    <nldd-page>
      <nldd-top-title-bar
        slot="header"
        text="Bewerken"
        dismiss-text="Sluiten"
      ></nldd-top-title-bar>
      <!-- inhoud -->
    </nldd-page>
  </nldd-sheet>
</template>
```

**Laat `close` je toestand uitzetten.** De sheet sluit zichzelf bij Esc, een klik ernaast of de sluitknop. Hij zet dan `open` uit en vuurt `close`. Zet in de handler je eigen toestand uit, zodat de binding en de sheet hetzelfde zeggen.

**Eén handler, niet twee.** Luister alleen naar `@close` op de sheet, niet ook naar `@dismiss` op de title-bar. De sheet vangt het bubbelende `dismiss`-event zelf op en sluit. Zou je daarnaast `@dismiss="emit('close')"` zetten, dan krijg je twee `close`-emits op één klik.

**De titel is de naam.** De sheet neemt de tekst van zijn titelbalk over als toegankelijke naam. Een `accessible-label` is alleen nodig als de naam anders moet luiden dan de titel.
