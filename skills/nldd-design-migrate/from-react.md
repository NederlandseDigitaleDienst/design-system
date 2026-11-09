# Migreren vanaf React

Aanvulling op [`SKILL.md`](SKILL.md), de hoofdpagina van deze skill, voor een React-app. Lees die eerst; hieronder staat alleen wat specifiek is voor React. De booleanvalkuil onderaan geldt alleen voor React 18, want React 19 zet properties op custom elements. De events gelden voor beide.

Importeer eerst de JSX-typen van het pakket, één keer, bijvoorbeeld in een `.d.ts` die je tsconfig meeneemt:

```ts
import '@nldd/design-system/react';
```

Dan kent `tsc` elke `nldd-*`-tag met zijn attributen, en weigert hij de booleanvalkuil hieronder.

## Events: wat React niet ziet

**React koppelt geen listeners aan custom events, en delegeert de rest vanaf de root.** Een event dat een component zelf uitzendt, bereikt dus geen `onChange` of `onClose` op dat component:

- `nldd-text-field` en verwanten hebben een eigen input in hun shadow root. Ze stoppen de native `change` en zenden een eigen `CustomEvent` uit vanaf de host, en dat mapt React niet op `onChange`.
- `close` op sheets, popovers en modals heeft `bubbles: false`, net als bij een native `<dialog>`. Een `onClose`-prop vuurt nooit en een dismissal reist niet omhoog. Mis je dat, dan heeft de overlay twee klikken nodig om te heropenen.

Een handler die nooit draait geeft geen fout. Rolbeheer dat niet werkt, een filter dat geen request stuurt: niets in de UI laat het zien.

`nldd-dropdown` hoort daar niet bij. De `<select>` die je meegeeft is van jou, en zijn native `change` gaat door, dus een `onChange` op die select werkt.

**Schrijf op dag één een `useNlddEvent(ref, type, handler)`-helper** plus een `useNlddValue`-spiegel voor gecontroleerde waarden, en laat alles door je eigen wrapper-componenten lopen. Zet de ref op het `nldd-*`-element zelf, niet op het control erin. Audit daarna: grep elke React-handler die gebonden is aan een element binnen een `nldd-*` tag.

Twee dingen gaan bij een gecontroleerd veld vaak mis:

- **Luister naar `input`, niet naar `change`.** `nldd-text-field` stuurt `input` bij elke toetsaanslag en `change` pas bij het verlaten van het veld. Volgt je state `change`, dan loopt hij achter op wat er getypt wordt, en zet de spiegel bij elke render tussendoor de oude waarde terug.
- **Geef de spiegel een ref naar het `nldd-*`-element.** Ook `nldd-dropdown` heeft een `value`, die naar de `<select>` erin doorgeeft.

Vervang een gecontroleerde `value=` ook niet door `defaultValue=` "om dit op te lossen". Dat lijkt te werken en is een bug: data komt meestal uit een query, dus de eerste render heeft een lege lijst, de default bevriest op `""` en herstelt zich nooit.

### De helper moet na elke render opnieuw kijken

De voor de hand liggende versie koppelt de listener in een `useEffect(..., [])`, dus één keer bij mount. Dat gaat goed zolang het element er bij mount al is. Een stap die later opengaat, de inhoud van een sheet, een veld achter een voorwaarde: zulke elementen verschijnen pas na een latere render en krijgen nooit een listener. Ze doen stil niets, net als de `onChange` hierboven.

Laat het effect daarom na elke render draaien, vergelijk het gekoppelde element met `ref.current`, en koppel opnieuw als dat verschilt:

```tsx
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

type Binding = { el: HTMLElement; type: string; listener: EventListener };

export function useNlddEvent<E extends Event = CustomEvent>(
  ref: RefObject<HTMLElement | null>,
  type: string,
  handler: (event: E) => void,
): void {
  // The latest handler, so a new closure each render does not mean a rebind.
  // Written in an effect, not during render, which React may throw away.
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
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

Het effect draait na elke render van het component dat de hook aanroept. Rendert een kindcomponent het element, en rendert de ouder daarbij niet mee, dan merkt de hook het niet. Zet de hook dan in dat kind, of koppel met een callback-ref: die roept React aan zodra het element verschijnt of verdwijnt, wie het ook rendert.

Merk je dit pas achteraf, dan is het symptoom een knop of veld dat in de ene weergave werkt en in de andere niet, terwijl de code identiek is. Test elke helper daarom ook met een element dat pas na een klik verschijnt.

## Booleans: in React 18 is `false` ook aan

React 18 kent geen properties op custom elements. Het schrijft een prop als attribuut, met de waarde als tekst. Een booleaans attribuut van een component staat aan zodra het er is, welke waarde er ook in staat. Dus `disabled={busy}` schakelt de knop altijd uit: `disabled="true"` als `busy` true is, `disabled="false"` als het false is. Geen waarschuwing, geen fout. (React 19 zet de property als het element die heeft, en heeft dit probleem niet.)

De JSX-typen van het pakket laten een booleaans attribuut alleen `true` of niets toe. Dan weigert `tsc` `disabled={busy}` en dwingt het `disabled={busy || undefined}` af, waarmee React het attribuut weglaat. In React 19 is dat strenger dan nodig, maar het klopt in beide.

Bij `expanded` op een rij zonder kinderen betekent afwezig "niet uitklapbaar". Zet `expandable` erbij voor een rij die dicht is maar wel uitklapt: dan zegt een afwezige `expanded` "dicht". Dat geldt voor `nldd-list-item` en `nldd-list-item-segment`.

## Links in een shadow root en je router

React Router, de `Link` van Next en de router van Docusaurus vangen klikken op hun eigen `<a>`-elementen. Een `nldd-link`, een `nldd-card` met `href` of een `nldd-list-item` met `href` rendert zijn anker in een shadow root, en dat ziet de router niet. Elke klik laadt dan de hele pagina opnieuw. Er gaat niets stuk en er komt geen waarschuwing; de site wordt alleen trager en verliest zijn state.

Eén listener op `document` lost het op voor de hele app. `composedPath()` geeft ook het anker in de shadow root:

```tsx
useEffect(() => {
  function onClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event
      .composedPath()
      .find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);
    // Anchors in the light DOM belong to the router's own links.
    if (!anchor || !(anchor.getRootNode() instanceof ShadowRoot)) return;
    if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  }
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}, [navigate]);
```

Sla bestanden over die geen route zijn, zoals een RSS-feed of een download zonder `download`-attribuut.

## Renderen op de server

Een framework dat op de server rendert (Next, Docusaurus, Remix) laadt je modules ook in Node, waar `customElements` niet bestaat. Laad de componenten daarom alleen in de browser, met een dynamische import achter een controle, en laat de server de tags gewoon als tekst uitschrijven:

```ts
if (typeof window !== 'undefined') {
  void import('@nldd/design-system/autoloader');
}
```

De stylesheet mag wel overal geïmporteerd worden. Wat er zonder script van de pagina overblijft, staat in [`SKILL.md`](SKILL.md) onder "Zonder JavaScript staat er geen kop".

Typ refs naar een component met zijn eigen klasse, uit het subpad van dat component, zodat `tsc` de properties en methoden kent:

```tsx
import type { NLDDSidebarSection } from '@nldd/design-system/sidebar-section';

const section = useRef<NLDDSidebarSection>(null);
```
