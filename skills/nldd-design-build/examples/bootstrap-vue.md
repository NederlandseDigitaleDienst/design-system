# Bootstrap: Vue 3 + Vite

Dit is de stack van [regelrecht](https://github.com/MinBZK/regelrecht), de
productie-app die dit systeem het meest volwassen gebruikt. De voorbeelden zijn
daaruit gedestilleerd.

## 1. Importeren

```js
// main.js
import '@nldd/design-system';
import '@nldd/design-system/styles';
```

RijksSans is uitsluitend bestemd voor publicaties van de Rijksoverheid en voor
partijen die in haar opdracht werken, zie
[`NOTICES.md`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/NOTICES.md). Bouw
je iets daarbuiten, importeer dan `@nldd/design-system/styles/system-font`:
dezelfde stylesheet zonder de `@font-face`-regels, waarna de familie-stacks
vanzelf op een systeemfont uitkomen.

## 2. Vue de custom elements laten herkennen

Zonder dit waarschuwt Vue over onbekende elementen en behandelt het `nldd-*`
tags als Vue-componenten.

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

## 4. Een sheet aansturen via de imperatieve API

`nldd-sheet` (net als popover en modal) stelt `show()` en `hide()` beschikbaar.
Mount het element niet in en uit met `v-if`; dan slaat de animatie over en
verlies je DOM-toestand. Spiegel in plaats daarvan een ref naar `show()`/`hide()`.

```vue
<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['close']);
const sheetEl = ref(null);

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      sheetEl.value?.hide();
      return;
    }
    await nextTick();
    sheetEl.value?.show();
  },
  { immediate: true },
);
</script>

<template>
  <nldd-sheet
    ref="sheetEl"
    placement="right"
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

**Eén handler, niet twee.** Luister alleen naar `@close` op de sheet, niet ook
naar `@dismiss` op de title-bar. De sheet vangt het bubbelende `dismiss`-event
zelf op en roept intern `hide()` aan, wat `close` vuurt. Zou je daarnaast
`@dismiss="emit('close')"` zetten, dan krijg je twee `close`-emits op één klik.

**Waarom de `@close` `emit('close')` aanroept en niet direct `hide()`:** de
sheet sluit zichzelf bij Esc, klik-buiten of de dismiss-knop en vuurt dan
`close`. Laat dat de gedeelde `open`-state omlaag zetten, zodat de `watch` één
keer `hide()` doet. Roep je in de handler zelf weer `hide()` aan, dan krijg je
een `hide()` → `@close` → `hide()` lus.
