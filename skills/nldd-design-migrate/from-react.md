# Migreren vanaf React

Aanvulling op [`SKILL.md`](SKILL.md), de hoofdpagina van deze skill, voor een React-app. Lees die eerst; hieronder staat alleen wat specifiek is voor React. De booleanvalkuil onderaan geldt alleen voor React 18, want React 19 zet properties op custom elements. De events gelden voor beide: het component stopt de native `change`, welke React-versie er ook luistert.

## Events: de regel die de meeste code breekt

**React's synthetische events bereiken geen controls die in een custom element geslot zijn.**

`nldd-dropdown` is een visuele schil om een echte `<select>` die je als child meegeeft. Het component luistert op die select, roept `stopPropagation()` aan op de native `change`, en zendt daarna zijn eigen `CustomEvent` uit vanaf de host. React delegeert vanaf de root, dus:

- het gestopte native event bereikt de delegate nooit, en
- wat er wel aankomt is een `CustomEvent` die React niet op `onChange` mapt.

Een React `onChange` op die select **vuurt nooit**. Dit is geen randgeval: in één codebase maakte het **37 handlers** stil onbruikbaar. Rolbeheer werkte volledig niet, deelrechten waren niet te geven, een filter stuurde geen enkele request. Niets in de UI liet dat blijken.

Hetzelfde geldt voor:

- `nldd-text-field` en verwanten, die een eigen shadow input hebben en opnieuw uitzenden.
- `close` op sheets, popovers en modals: dat heeft `bubbles: false`, dus een `onClose`-prop vuurt nooit en een dismissal reist niet omhoog. Mis je dat, dan heeft de overlay twee klikken nodig om te heropenen.

**Schrijf op dag één één `useNlddEvent(ref, 'change', ...)`-helper** plus een `useNlddValue`-spiegel voor gecontroleerde waarden, en laat alles door je eigen wrapper-componenten lopen. Audit daarna: grep elke React-handler die gebonden is aan een element binnen een `nldd-*` tag.

### De helper moet na elke render opnieuw kijken

De voor de hand liggende versie koppelt de listener in een `useEffect(..., [])`, dus één keer bij mount. Dat gaat goed zolang het element er bij mount al is. Een stap die later opengaat, de inhoud van een sheet of een veld achter een voorwaarde verschijnt pas na een latere render, en dat element krijgt nooit een listener. Het doet stil niets, net als de `onChange` hierboven.

Laat het effect daarom na elke render draaien, vergelijk het gekoppelde element met `ref.current`, en koppel opnieuw als dat verschilt:

```tsx
import { useEffect, useRef, type RefObject } from 'react';

type Binding = { el: HTMLElement; type: string; listener: EventListener };

export function useNlddEvent<E extends Event = CustomEvent>(
  ref: RefObject<HTMLElement | null>,
  type: string,
  handler: (event: E) => void,
): void {
  // The latest handler, so a new closure each render does not mean a rebind.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const bound = useRef<Binding | null>(null);

  // No dependency array: the element behind the ref can appear or be replaced
  // in any render, without anything this hook is given changing.
  useEffect(() => {
    const el = ref.current;
    const prev = bound.current;
    if (prev && prev.el === el && prev.type === type) return;
    prev?.el.removeEventListener(prev.type, prev.listener);
    bound.current = null;
    if (!el) return;
    const listener: EventListener = (event) => handlerRef.current(event as E);
    el.addEventListener(type, listener);
    bound.current = { el, type, listener };
  });

  useEffect(() => () => {
    const prev = bound.current;
    prev?.el.removeEventListener(prev.type, prev.listener);
    bound.current = null;
  }, []);
}

export function useNlddValue<T>(
  ref: RefObject<(HTMLElement & { value: T }) | null>,
  value: T,
): void {
  // The property, not the attribute: once the user has typed, the attribute
  // no longer says what the field holds, and setting it again changes nothing.
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== value) el.value = value;
  });
}
```

Merk je dit pas achteraf, dan is het symptoom een knop of veld dat in de ene weergave werkt en in de andere niet, terwijl de code identiek is. Test elke helper daarom ook met een element dat pas na een klik verschijnt.

## Booleans: in React 18 is `false` ook aan

React 18 kent geen properties op custom elements. Het schrijft een prop als attribuut, en een booleaanse `false` wordt de tekst `"false"`. Een booleaans attribuut van een component staat aan zodra het er is, welke waarde er ook in staat. Dus `disabled={busy}` schakelt de knop altijd uit: `disabled=""` als `busy` true is, `disabled="false"` als het false is. Geen waarschuwing, geen fout. (React 19 zet de property als het element die heeft, en heeft dit probleem niet.)

Wat werkte: genereer de JSX-typen uit `custom-elements.json` en laat een booleaans attribuut alleen `true | undefined` toe. Dan weigert `tsc` `disabled={busy}` en dwingt het `disabled={busy || undefined}` af, waarmee React het attribuut weglaat.

```ts
// Generated from custom-elements.json: a boolean is present or absent, never false.
'nldd-button': {
  disabled?: true;
  text?: string;
  // ...
};
```

Het manifest typt sommige booleans als `boolean | undefined`, zoals `expanded` op `nldd-list-item` en `nldd-list-item-segment`. Behandel die in de generator net zo. Daar zit nog iets: bij `expanded` betekent `undefined` "niet uitklapbaar" en `false` "dicht maar uitklapbaar". Via een attribuut kun je alleen aan en afwezig zeggen; gemeten las het attribuut `"false"` als true en geen attribuut als `undefined`. Die derde stand zet je dus met de property, via een ref.

Let bij die audit ook op `defaultValue`. Een gecontroleerde `value=` vervangen door `defaultValue=` "om dit op te lossen" lijkt te werken en is een bug: data komt meestal uit een query, dus de eerste render heeft een lege lijst, de default bevriest op `""` en herstelt zich nooit.
