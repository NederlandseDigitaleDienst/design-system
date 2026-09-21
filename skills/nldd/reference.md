<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Bron: de JSDoc (@element / @attr / @slot / @fires) van elk component in
  src/components, plus de iconnamen uit content/icon/icons en icon-aliases.
  Hergenereren: npm run generate:component-reference
-->

# Componentreferentie — @nldd/design-system

Elk custom element met zijn attributen, slots en events. Dit is een offline
snelreferentie; de levende documentatie met voorbeelden staat in
[Storybook](https://nederlandsedigitaledienst.github.io/design-system/), en de exacte types staan in
de `.d.ts` bestanden van het pakket.

> Deze referentie komt uit de JSDoc van de componenten. Dat elk attribuut er
> in staat, wordt in CI afgedwongen: `npm run validate:component-api`
> vergelijkt de `@property`-decorators met de `@attr`-regels.

## Actions

### `<nldd-button>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `string` | Button variant: 'primary' \| 'secondary' \| 'destructive' \| 'accent-filled' \| 'accent-transparent' \| 'neutral-tinted' \| 'neutral-base' \| 'neutral-transparent' \| 'critical-tinted' \| 'critical-transparent' \| 'inherit-filled' \| 'inherit-tinted'. The inherit variants derive their colors from currentColor, for buttons on colored surfaces; inherit-filled uses the surface color (--context-parent-background-color) as the label color, with a white/black contrast flip as a fallback. |
| `size` | `string` | Button size: 'xs' \| 'sm' \| 'md' \| 'lg' (default: 'md'). 'lg' uses larger text and 24px start/end icons. |
| `horizontal-alignment` | `string` | Horizontal alignment of the button content: 'left' \| 'center' \| 'right' (default: unset, centered). Most visible with width="full" or a fixed width. |
| `loading` | `boolean` | Loading state (default: false). Shows an activity indicator over the visually hidden content, sets aria-busy on the inner control and blocks activation, without dropping the button from the tab order (unlike disabled). The content stays laid out, so the button keeps its width. |
| `disabled` | `boolean` | Disabled state |
| `type` | `string` | Button type for form submission: 'button' \| 'submit' \| 'reset' (ignored when href is set) |
| `popovertarget` | `string` | ID of a popover element this button invokes; forwarded to the inner button. Use the popoverTargetElement property instead when the popover lives in another tree. |
| `expandable` | `boolean` | Whether the button has a icon to indicate it opens a menu or popover |
| `expanded` | `boolean` | Whether the popover/menu controlled by this button is currently open. Forwarded as aria-expanded on the inner button; toggles the is-expanded visual state. |
| `popup-type` | `string` | Type of popup container this button opens: 'menu' \| 'listbox' \| 'dialog' \| 'tree' \| 'grid'. Sets aria-haspopup on the inner button and forces aria-expanded to always be present (true/false) so screen readers know the popup state. |
| `width` | `string` | Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px') |
| `max-width` | `string` | Caps the width at this CSS length (e.g. '320px'). Combines with `width="full"`: the button follows its container up to the cap. A label that doesn't fit is truncated with an ellipsis — a cap only means something if the content respects it. |
| `text` | `string` | Button text |
| `supporting-text` | `string` | Supporting text shown below the text (md/lg) or after it (sm/xs), in a secondary color. Part of the accessible name (unless `accessible-label` is set, which replaces the whole accessible name). |
| `single-line` | `boolean` | When true, truncates overflowing text with an ellipsis instead of letting it wrap. Requires the button (or an ancestor) to constrain the width. |
| `no-highlight-border` | `boolean` | Removes the per-variant highlight border (e.g. when nldd-button-bar draws a single group border instead). |
| `no-tab` | `boolean` | Takes the button out of the tab order (tabindex="-1"), for a control owned by a roving container (e.g. a button in a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `start-icon` | `string` | Icon name for the start icon (before text) |
| `end-icon` | `string` | Icon name for the end icon (after text) |
| `accessible-label` | `string` | Accessible label for the button, overrides text for screen readers |
| `href` | `string` | When set, renders an <a> element instead of <button> |
| `target` | `string` | Link target (e.g. '_blank'); only used when href is set. With '_blank' the button adds a visually hidden "opens in new tab" announcement for screen readers (WCAG 2.1 SC 3.2.2). |
| `rel` | `string` | Link rel attribute, used with href; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `translations` | `object` | Override translation keys (e.g. the "opens in new tab" announcement); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| `text` | Slot for custom button content (e.g. text with inline markup). Used when the text attribute is empty or not set (an empty string counts as "not set", since the attribute and the unset property are indistinguishable). Provide accessible-label when the slotted content isn't plain text. |
| `start-icon` | Slot for a custom start icon (e.g. custom SVG). Only used when start-icon attribute is not set. |
| `end-icon` | Slot for a custom end icon (e.g. custom SVG). Only used when end-icon attribute is not set. |
| `popup` | A single `nldd-menu` or `nldd-popover` this button invokes. Slotting it auto-anchors the overlay to the button and toggles it on click (no id/anchor wiring). The overlay syncs `expanded` and `aria-haspopup` back onto the button. Add `expandable` for the disclosure chevron. Mirrors nldd-split-button; the manual `anchor`/`popovertarget` wiring keeps working when you don't slot an overlay. |

**Events**

| Event | Description |
| --- | --- |
| `click` | When button is clicked (not fired when disabled) |

### `<nldd-button-bar>`

A horizontal container for grouping buttons with a neutral background. Automatically propagates its size and variant to all child nldd-button and nldd-icon-button elements. Renders nldd-button-bar-divider elements as internal dividers — no separate component needed.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Bar size: 'xs' \| 'sm' \| 'md' \| 'lg' (default: 'md'). At 'lg', icon-button children stack their label below the icon (mobile action-bar style). |
| `variant` | `string` | Button variant (default: 'neutral-tinted') |
| `disabled` | `boolean` | Disabled state |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for nldd-button, nldd-icon-button and nldd-button-bar-divider elements |

### `<nldd-button-bar-divider>`

A vertical rule between groups of buttons in an `nldd-button-bar`. Purely presentational: no attributes, no slots — place it between buttons.

### `<nldd-button-group>`

A container for grouping related buttons together, either horizontally or vertically.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Button group size: 'sm' \| 'md' (default: 'md') |
| `orientation` | `string` | Layout direction: 'horizontal' \| 'vertical' (default: 'vertical') |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for buttons (max 3) |

### `<nldd-icon-button>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `string` | Button variant: 'accent-filled' \| 'accent-transparent' \| 'neutral-tinted' \| 'neutral-transparent' \| 'critical-tinted' \| 'critical-transparent' \| 'inherit-filled' \| 'inherit-tinted' \| 'primary' \| 'secondary' \| 'destructive'. The inherit variants derive their colors from currentColor, for buttons on colored surfaces. |
| `size` | `string` | Button size: 'xs' \| 'sm' \| 'md' \| 'lg' (default: 'md') |
| `hide-lg-text` | `boolean` | In lg size, hides the text label and enlarges the icon by one step (28px) |
| `no-highlight-border` | `boolean` | Removes the per-variant highlight border (e.g. when a control group draws a single border instead). |
| `loading` | `boolean` | Loading state (default: false). Shows an activity indicator over the visually hidden icon, sets aria-busy on the inner control and blocks activation, without dropping the button from the tab order (unlike disabled). |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the button out of the tab order (tabindex="-1"), for a control owned by a roving container (an nldd-token in nldd-token-field, a button in a row of an nldd-list) that manages focus itself. Still mouse- and script-focusable. |
| `type` | `string` | Button type for form submission: 'button' \| 'submit' \| 'reset' (ignored when href is set) |
| `expandable` | `boolean` | Whether the button opens a menu or popover and shows chevron next to the icon |
| `expanded` | `boolean` | Whether the popover/menu controlled by this button is currently open. Forwarded as aria-expanded on the inner button; toggles the is-expanded visual state. |
| `popup-type` | `string` | Type of popup container this button opens: 'menu' \| 'listbox' \| 'dialog' \| 'tree' \| 'grid'. Sets aria-haspopup on the inner button and forces aria-expanded to always be present (true/false) so screen readers know the popup state. |
| `width` | `string` | Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px') |
| `text` | `string` | Button text, used as aria-label and shown below the icon in lg size |
| `icon` | `string` | Icon name for the nldd-icon element. Defaults to a placeholder icon when neither this attribute nor the icon slot is set. |
| `accessible-label` | `string` | Accessible label for screen readers. Overrides text as aria-label and title tooltip. Use when the visible text alone lacks context for screen readers (e.g. text "Toon", accessible-label "Toon wachtwoord"). The text is still shown visually in lg size regardless. |
| `tooltip-timing` | `string` | Forwarded to the inner nldd-tooltip's `timing`: 'delay' (the default, a 700 ms show-delay), 'instant', or 'never' (suppress the visual tooltip; screen readers still get the aria-label). Use 'never' when the surrounding context already explains the button (e.g. spin buttons in nldd-number-field, the chevron in nldd-split-button). |
| `href` | `string` | When set, renders an <a> element instead of <button> |
| `target` | `string` | Link target (e.g. '_blank'); only used when href is set. With '_blank' the "opens in new tab" announcement is folded into the aria-label for screen readers (WCAG 2.1 SC 3.2.2). |
| `rel` | `string` | Link rel attribute, used with href; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `translations` | `object` | Override translation keys (e.g. the "opens in new tab" announcement); unset keys fall back to Dutch. |
| `popovertarget` | `string` | ID of a popover element to toggle; forwarded to the inner <button> |

**Slots**

| Slot | Description |
| --- | --- |
| `icon` | Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set; falls back to a placeholder icon when the slot is empty. |
| `popup` | A single `nldd-menu` or `nldd-popover` this button invokes. Slotting it auto-anchors the overlay to the button and toggles it on click (no id/anchor wiring). The overlay syncs `expanded` and `aria-haspopup` back onto the button. Add `expandable` for the disclosure chevron. Mirrors nldd-split-button; manual `popovertarget` wiring keeps working without a slotted overlay. |

**Events**

| Event | Description |
| --- | --- |
| `click` | When button is clicked (not fired when disabled) |

### `<nldd-menu>`

A floating menu component using the Popover API. Positioned relative to an anchor element using Floating UI. Supports filtering, keyboard navigation, and highlight management. Use nldd-menu-item and nldd-menu-divider as children. Note: Only type="button" items are supported when used inside nldd-combo-box-field. Radio and checkbox types may be used in standalone menus.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `anchor` | `string` | ID of the anchor element. Positions the menu against it AND makes it a toggle: the menu listens on document click and opens/closes itself when the click lands on the anchor. Use this for a menu hung off a button. For a menu you open yourself (a type-ahead under a text field, say), set the `anchorElement` property instead — same positioning, no toggle. |
| `placement` | `string` | Floating UI placement. Default: 'bottom-start'. |
| `empty-text` | `string` | Text of the default empty-state dialog. Falls back to Dutch i18n "Geen opties beschikbaar". |
| `empty-supporting-text` | `string` | Supporting text of the default empty-state dialog. |
| `width` | `string` | Explicit width, pinned exactly. Without it the menu sizes to its content between a minimum and a viewport-aware maximum (min(100vw - inset, 640px)). |
| `max-items` | `number` | Maximum number of visible items before scrolling. Sets --_max-items internally. Default: 0 (no limit). |
| `translations` | `object` | Override one or more translation keys. |
| `filterFn` | `Function` | Custom filter function (query, item) => boolean. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-menu-item and nldd-menu-divider elements. |
| `header` | Free content shown above the items, outside `role="menu"` (so it may hold non-menuitem content such as an avatar + name, buttons or links — reached with Tab, skipped by arrow navigation). The region is unpadded; control spacing with your own content (e.g. an `nldd-container`). Root-only: never rendered in a submenu. Example: an account identity header (nldd-identity). |
| `footer` | Free content shown below the items, outside `role="menu"` (same rules as `header`; also unpadded and root-only). Example: a short note or a link. |
| `empty` | Shown when no items are visible. Defaults to `nldd-inline-dialog` driven by `empty-text` / `empty-supporting-text`. Slot content overrides the default dialog entirely. |

### `<nldd-menu-divider>`

A horizontal rule between groups of items in an `nldd-menu`.

### `<nldd-menu-group>`

A labeled group of menu items inside an nldd-menu. Wraps its slotted items in `role="group"` with `aria-labelledby` pointing to the group's `text`, providing native ARIA group semantics that a flat title element can't deliver. The group renders an automatic divider above itself, except when it's the first child of the menu — so consumers don't need to manage separator placement around groups themselves. Spacing above the title is intentionally larger than below, to bind the title visually to the items it labels. Use the wrapper for grouping with a title; for ungrouped flat menus or a divider without a title, the existing `nldd-menu-item` + `nldd-menu-divider` flat structure keeps working unchanged.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Group title text shown above the items. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-menu-item children (the items belonging to this group). |

### `<nldd-menu-item>`

A single item within an nldd-menu.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Display text. Supports **bold** markdown syntax. |
| `value` | `string` | A value of the item's own, read off the item in a `select` handler. The default filter matches on it as well as on `text` and `aliases`. Not a form value: this component is not form-associated. |
| `href` | `string` | Optional link target. A plain button item with an href renders as an `<a>` so it is a real link (middle-click, open in new tab, copy link). Ignored for submenu openers, checkbox/radio items, and while disabled. |
| `aliases` | `string` | Space-separated alternative search terms. |
| `details` | `string` | Secondary label shown on the right side. |
| `shortcut` | `string` | Keyboard shortcut hint shown on the right, e.g. 'Cmd+E'. Display only (rendered via nldd-keyboard-shortcut) — it does not bind the key; wire up the handling in your app. Hidden on touch-only devices, where it isn't invokable. |
| `shortcut-mac` | `string` | / shortcut-windows / shortcut-linux - Per-OS overrides for `shortcut`, picked by detected OS (falls back to `shortcut`). |
| `icon` | `string` | Icon name rendered before the text (nldd-icon name). |
| `type` | `string` | Item type: 'button' \| 'checkbox' \| 'radio'. Default: 'button'. |
| `selected` | `boolean` | Selected state for checkbox and radio types. |
| `destructive` | `boolean` | Marks the item as destructive (red text; red highlight bg). Use for irreversible actions like "Delete". Color is the only built-in signal, so per WCAG 1.4.1 the item's own label must convey the destructive nature (e.g. "Verwijder") — don't rely on the red alone. Confirming the action (e.g. a follow-up dialog) is the consumer's responsibility. |
| `disabled` | `boolean` | Disabled state. |
| `query` | `string` | Query substring to bold-highlight in text. Set by menu's filter(); also settable by consumers. |
| `query-mark-mode` | `string` | 'match' \| 'predictive' (default: 'predictive'). See text-cell for details. |

**Events**

| Event | Description |
| --- | --- |
| `select` | Fired when the item is clicked and not disabled. |

### `<nldd-split-button>`

A split button combines a primary action button with a dropdown trigger. The main button performs the default action, while the icon button opens a menu or popover. Provide the dropdown by slotting an `nldd-menu` (with its `nldd-menu-item` / `nldd-menu-divider` children) or an `nldd-popover` directly: ```html <nldd-split-button text="Opslaan"> <nldd-menu> <nldd-menu-item text="Opslaan als…"></nldd-menu-item> </nldd-menu> </nldd-split-button> ``` The slotted overlay stays in the light DOM — no item-moving — so consumers keep their references and the full overlay API. The split-button anchors it to the chevron and opens it on click. When no overlay is slotted, the chevron dispatches `menu-click` and the consumer manages their own popover.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Button size: 'xs' \| 'sm' \| 'md' \| 'lg' (default: 'md') |
| `variant` | `string` | Button variant (default: 'neutral-tinted') |
| `disabled` | `boolean` | Disabled state |
| `width` | `string` | Width mode: 'full' (stretches to container) or any CSS length; the main action button fills the available space |
| `text` | `string` | Button text for the primary action |
| `icon` | `string` | Icon name shown before the text on the primary action button |
| `translations` | `object` | Translations; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | A single `nldd-menu` or `nldd-popover` that the chevron opens. |

**Events**

| Event | Description |
| --- | --- |
| `action-click` | Fired when the main button is clicked |
| `menu-click` | Fired when the dropdown trigger is clicked and no overlay is slotted |

### `<nldd-toolbar>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Toolbar size, propagated to all child controls: 'sm' \| 'md' \| 'lg' (default: 'md'). At 'lg' the overflow button (and lg-capable children like nldd-icon-button) stack their label below the icon. |
| `show-item-labels` | `boolean` | When true, shows a text label below each toolbar item and the overflow button |
| `label` | `string` | Accessible label for the toolbar. Only needed when multiple toolbars appear on the same page |
| `translations` | `object` | Override translation keys (e.g. the overflow button label); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| `start` | nldd-toolbar-item and nldd-toolbar-title elements placed at the start |
| `center` | nldd-toolbar-item and nldd-toolbar-title elements placed at the center |
| `end` | nldd-toolbar-item and nldd-toolbar-title elements placed at the end |
| `overflow` | nldd-menu-item, nldd-menu-divider and nldd-menu-group elements always shown in the overflow menu |

### `<nldd-toolbar-item>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `width` | `string` | Fluid width: a percentage (e.g. '40%') or any CSS length (e.g. '240px'). Setting it (or min-width or max-width) makes the item fluid so it grows to fill the available space. |
| `min-width` | `string` | Minimum (fluid) width as a CSS length (e.g. '240px'). Setting it also makes the item fluid. |
| `max-width` | `string` | Maximum (fluid) width as a CSS length (e.g. '480px'). Setting it also makes the item fluid. |
| `label` | `string` | Text label shown below the item when the toolbar has show-item-labels. |
| `priority` | `number` | Overflow order: items with a lower priority move into the overflow menu first (default 0). Items sharing a priority overflow together, regardless of position. |
| `size` | `'sm'\|'md'\|'lg'` | Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md') onto the item host, so size-dependent styling can key off it. |
| `show-item-labels` | `boolean` | Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's show-item-labels, so the item renders its label below the control. |
| `fluid` | `boolean` | Set by nldd-toolbar, not a consumer attribute: marks an item that grows or shrinks to fill space. Toggled synchronously during measurement, so it can appear or disappear between layout frames — do not style against it. It is not reflected as a JS property — read it with hasAttribute('fluid'). |
| `solo-fluid` | `boolean` | Set by nldd-toolbar, not a consumer attribute: the sole fluid item, allowed to shrink below its content. Same synchronous-toggle and property-read caveats as fluid. |
| `hidden` | `boolean` | Set by nldd-toolbar, not a consumer attribute, when the item moves into the overflow menu. Same synchronous-toggle caveat. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The control shown in the toolbar (e.g. nldd-icon-button) |
| `overflow` | nldd-menu-item / nldd-menu-divider / nldd-menu-group children, shown in the overflow menu when this item overflows |

### `<nldd-toolbar-title>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Title text. |
| `supporting-text` | `string` | Secondary supporting text shown below the title. |
| `align` | `string` | Text alignment: 'left' \| 'center' (default: 'left'). |
| `width` | `string` | Preferred (fluid) width as a CSS length or percentage; the title grows toward it and shrinks to min-width. |
| `min-width` | `string` | Minimum width as a CSS length (default: '0', so the title shrink-wraps its content and the next element sits against it). |
| `max-width` | `string` | Maximum width as a CSS length (default: '240px'); the title text truncates with an ellipsis beyond it. The cap is lifted while the title is the sole toolbar element (it then stretches to fill the row). |
| `size` | `'sm'\|'md'\|'lg'` | Set by nldd-toolbar, not a consumer attribute: mirrors the toolbar's size (default: 'md'), which sets the title group height and, at 'sm', the title and supporting-text fonts. |
| `href` | `string` | Makes the mark and the name one link, for the place this window belongs to (usually the app's own start). The `action` slot stays outside it: a control inside a link is a control you cannot reach without following the link. |
| `target` | `string` | Where the link opens; only meaningful with `href`. `_blank` adds rel="noopener noreferrer" and a visually hidden "opens in a new tab" announcement. |
| `translations` | `object` | Override translation keys (the new-tab announcement); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| `media` | Optional leading image before the title: a logo, a product mark, a file-type icon. Its height is capped to the title group so it cannot stretch the row; pick the size within that yourself. With no `text` the media stands alone and carries the name, so give it one (an `alt`, or an accessible label). |
| `action` | Optional trailing control (e.g. an xs nldd-icon-button), shown inline after the title and tuned to sit against it. Empty by default. |

## Content

### `<nldd-avatar>`

Shows one person or organization as a compact, round (person) or rounded (organization) representation. The content follows a fixed fallback chain: an image when `src` loads, otherwise the initials (from `initials` or derived from `name`), and otherwise a fallback icon. `type` sets both the shape and the fallback icon: `person` gives a circle with a person icon, `organization` a rounded square with a building icon. The shape belongs to the meaning and cannot be set on its own. Override the fallback icon with `icon` where that helps. Without `size` the avatar scales with its container, like `nldd-icon`; a fixed size (the same spacer-aligned scale, 16 through 96) is the exception. The initials and the icon scale along. Wide initials (WW, MMM) are scaled down automatically so they stay inside the shape. Accessibility: the host element carries the meaning. With a `name` (and without `decorative`) it gets `role="img"` with the name as its label. When the name already stands beside it as text, in an identity for instance, set `decorative` so the avatar stays hidden from assistive software. A dead `src` falls back to the initials or the icon, never to a broken-image icon.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `type` | `string` | `person` (circle, person icon) or `organization` (rounded, building icon); default `person` |
| `size` | `string` | `full` (the default) scales with the container, like nldd-icon; or a fixed size in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96). The initials and the icon scale along |
| `color` | `string` | `neutral` (the default, a neutral fill) or `inherit` (fill in the content color: the `--context-content-color` channel, or `currentColor` when that is unset; text in the contrast color, so the avatar can replace an icon in a button for instance) |
| `icon-aligned` | `boolean` | Shrinks the visible shape to 5/6 of the host, centered, so the avatar aligns optically with an icon on the same grid (an icon glyph has built-in margin) |
| `name` | `string` | Name of the person or organization; supplies the derived initials and the accessible label |
| `initials` | `string` | Explicit initials, at most 3 characters (overrides what is derived from `name`; also for organization acronyms) |
| `src` | `string` | Image source; falls back to initials or icon when it fails to load |
| `srcset` | `string` | Responsive source set for the image (the component sets `sizes` itself) |
| `icon` | `string` | Overrides the type-dependent fallback icon |
| `accessible-label` | `string` | Name of the link or button; without it `name` is used |
| `decorative` | `boolean` | Hides the avatar from assistive software (use when the name already stands beside it as text) |
| `tooltip-timing` | `string` | When the name appears as a tooltip on hover or focus: `delay` (the default, after 700ms), `instant`, or `never`. An avatar shows no text, so without a tooltip the name is readable by assistive software only. A `decorative` avatar shows none regardless: there the name already stands beside it as text |
| `href` | `string` | Makes the avatar a link to this URL; the shape itself becomes the link, so the hit area and the focus ring follow it |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for an avatar that is a link or a button inside a roving container (a row of an nldd-list). Does nothing on a decorative avatar. |
| `button` | `boolean` | Makes the avatar a button; ignored when `href` is set |
| `target` | `string` | Link target for href (e.g. '_blank'); completes rel and announces "Opens in a new tab" |
| `rel` | `string` | Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

### `<nldd-avatar-group>`

Shows several avatars as one group: they overlap, and each one gets a ring in the surface color so they stay apart where they meet. The ring uses the same mechanism as the badge, so on a colored surface you hand the color over through `--context-parent-background-color`. Slot `nldd-avatar` elements, not bare `img`. An avatar already knows what to do with a dead image, when to fall back to initials, and how to show its name as a tooltip; a loose image would have to reproduce all of that and cannot do the last one. Set `decorative` when the names already stand beside the group as text; otherwise give every avatar a name, because the group itself describes nobody. The size applies to the whole group: it is imposed on the avatars, a slotted `img` included. That keeps the row on one line whatever a consumer hands over.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Diameter of each avatar in px (spacer-aligned: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96); default 40 |
| `max` | `number` | Shows at most this many avatars; the rest go behind a "+N" button that opens them as a list of names |
| `accessible-label` | `string` | Describes the group as a whole (e.g. "Editors"); without a label the group is not a landmark of its own and the avatars speak for themselves |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | One or more `nldd-avatar` elements |

### `<nldd-blockquote>`

Shows a quote with an optional source attribution.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `cite` | `string` | URL of the source (forwarded to the <blockquote> element) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The paragraph or paragraphs of the quote; prefer <p> elements |
| `attribution` | Optional source attribution (author, title, and so on). An nldd-identity is allowed here; the em dash ("— ") is then left out. |

### `<nldd-code-viewer>`

A read-only block of code/text built on a non-editable CodeMirror 6 view. Visually pairs with nldd-code-editor (same engine, same token palette). Whitespace is preserved; long lines scroll horizontally by default. Set `wrap` to break long lines onto the next visual line. Set `language` to one of the supported grammars (yaml, json, javascript, typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql, python) to highlight the content. Without `language` the content renders plain. Grammars are loaded lazily on first use, so a page that never sets `language` ships zero grammar code. Token colors are the `--components-code-viewer-token-*` custom properties (shared with the editor via the CodeMirror highlight style). Override them per-instance to swap the theme.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'box-tinted'\|'box-base'\|'simple'` | Visual style. The two `box` values are a framed card with rounded corners, padding, fill, and a 1px border ring, and differ in which surface they fill with; `box-tinted` is the default. `simple` drops the entire frame — use when embedding inside a parent surface. |
| `language` | `string` | Grammar to highlight with. Empty disables highlighting. |
| `no-copy` | `boolean` | Hide the copy-to-clipboard button (shown by default). |
| `wrap` | `boolean` | Wrap long lines instead of horizontal scroll |
| `translations` | `object` | Override translation keys (e.g. the copy button labels and the scroll-region label); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for the code/text content (also the copy source) |

### `<nldd-icon>`

A customizable icon component that renders SVG icons from a predefined library. Icons are decorative by default: the host gets `aria-hidden="true"` automatically. If you want the icon to be announced by assistive tech, set `aria-hidden="false"` on the consumer side together with an `aria-label`. Sizing: the icon fills whatever sizes it — an `nldd-icon-cell`, a button, a menu item. `size="full"` names that default explicitly. `size="inherit"` makes it follow the surrounding text (1em), for an icon set inline in a sentence. Any spacer-aligned number (16–96) pins a fixed dimension. Reach for `inherit` rather than a global `nldd-icon { width: 1em }` rule in the consumer: such a rule wins over the component's own :host styling and so also shrinks the icons that a cell or button was already sizing correctly. Color: by default the icon inherits its parent's `color`. Set `color` to one of the functional semantics (`primary-content`, `secondary-content`, `accent`, `critical`, `warning`, `success`) or a rijkskleur (`lintblauw`, `paars`, `groen`, …). For a color the system cannot know — the jacket of a cable, a color someone picked — set `custom-color` to any CSS color.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the icon to display |
| `size` | `string` | `full` (the default) fills the container. `inherit` sizes the icon to the surrounding text (1em) and drops it onto that text's own line, for an icon set in a line of running text. Or a fixed spacer-aligned size in px (16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96). |
| `color` | `string` | Functional (`primary-content`, `secondary-content`, `accent`, `critical`, `warning`, `success`) or rijkskleur (`lintblauw`, `donkerblauw`, `hemelblauw`, `lichtblauw`, `paars`, `violet`, `robijnrood`, `roze`, `rood`, `oranje`, `donkergeel`, `geel`, `donkerbruin`, `bruin`, `donkergroen`, `groen`, `mosgroen`, `mintgroen`). Empty = inherit `color` from parent. |
| `custom-color` | `string` | A color of its own, as any CSS color value ('#a90061', 'oklch(0.6 0.2 20)', 'var(--brand-cable-blue)'). For a color the system cannot know. It wins over `color`. |
| `box` | `boolean` | Draw the icon on a filled square. `color` and `custom-color` then paint the box and the glyph takes the contrasting color, and `size` measures the box: the glyph is four fifths of it, the corner radius a fifth. |

### `<nldd-identity>`

An editorial line that shows authors or editors: optional avatar or avatars, a name line and supporting text (a role or a date, for instance). Every part is optional. The name line and the supporting text come in as an attribute or as a slot. Use the slots for richer content, such as a `<time datetime="…">` for a machine-readable date or a link to the author's profile. Slotted content replaces the matching attribute: the attribute is the slot's fallback. One avatar you slot as it is, and identity gives it its size. For more than one, slot an `nldd-avatar-group`: that overlaps them and draws the ring in the surface color. Identity does not build that group itself, because the avatars are the consumer's light DOM and a group can only style what arrives as its own child. Set the avatars to decorative (or an `img` to `alt=""`) when the names already stand in the text. On narrow widths (an sm container, 640px and under) with more than one avatar the row of avatars moves above the names, so the text keeps the full width. With one avatar the identity stays on a single line. For a single avatar you can also hand over `avatar-src` (with an optional `avatar-srcset`) as an attribute instead of slotting; its size is fixed at 40px. Slotted avatars take precedence over `avatar-src`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Name line (e.g. "Jan Jansen and Piet Pietersen"); the fallback when the text slot is empty |
| `supporting-text` | `string` | Supporting text under the name line (a role or a date, for instance); the fallback when the supporting-text slot is empty |
| `avatar-src` | `string` | Source of a single avatar (an alternative to the avatars slot); ignored as soon as the avatars slot is filled |
| `avatar-srcset` | `string` | Responsive source set for the avatar-src image |
| `avatar-alt` | `string` | Alt text for the avatar-src image; empty means decorative |

**Slots**

| Slot | Description |
| --- | --- |
| `avatars` | One avatar (`nldd-avatar` or `img`), or an `nldd-avatar-group` for more |
| `text` | Name line as rich content (a link to the author's profile, for instance) |
| `supporting-text` | Supporting text as rich content (a time element, for instance) |

### `<nldd-image>`

Wraps a native `<img>` with design-system styling: corner radius variants, aspect-ratio reservation, object-fit/position control, optional caption + credit. Renders as `<figure>` + `<figcaption>` only when a caption or credit is set — otherwise just the image, no extra wrapping. Hybrid source: the `src` attribute renders an internal `<img>`. To use a custom `<img>` or `<picture>` (e.g. with art-direction sources), slot it into the default slot and we'll style and wrap it like our own image.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `src` | `string` | Image URL |
| `alt` | `string` | Alt text for the image from `src`. Required unless `decorative`; slotted media carries its own. |
| `srcset` | `string` | Responsive source set |
| `sizes` | `string` | Source sizes hint |
| `width` | `number\|'full'` | Display width. `full` (default) fills the parent. A numeric value sets host `max-width` AND the `<img>` layout-hint width. |
| `height` | `number` | Intrinsic height (for layout reservation) |
| `loading` | `'lazy'\|'eager'` | Loading strategy (default: 'lazy'). Lazy defers fetch until the image is near the viewport — the right choice for below-the-fold content. Set to 'eager' on images that appear in the initial viewport, especially the LCP candidate (hero illustration, top-of-list thumbnail); leaving them lazy silently regresses Core Web Vitals because the LCP fetch waits for the intersection observer. Pair with `fetchpriority="high"` on the LCP image for the strongest signal. |
| `decoding` | `'async'\|'sync'\|'auto'` | Decoding hint (default: 'async') |
| `fetchpriority` | `'high'\|'low'\|'auto'` | Fetch priority hint |
| `aspect-ratio` | `string` | Aspect ratio in CSS form (e.g. "16/9", "1/1", "4/3"). "16:9" colon notation is also accepted for convenience. |
| `object-fit` | `'cover'\|'contain'\|'fill'\|'scale-down'\|'none'` | default: 'cover' |
| `object-position` | `'center'\|'top'\|'bottom'\|'left'\|'right'` | default: 'center' |
| `shape` | `'square'\|'rounded'\|'circle'` | Corner shape (default: 'square') |
| `caption` | `string` | Caption text shown below the image |
| `credit` | `string` | Smaller credit/attribution text shown beside the caption |
| `decorative` | `boolean` | Decorative image: alt is forced empty + aria-hidden |
| `lqip` | `string` | Low-quality image placeholder as a CSV string `"base,c1,c2,c3,c4,c5,c6"` — seven 0-255 bytes, each packing an 8-bit Oklab triplet (2 bits L, 3 bits a, 3 bits b). The first is the base color shown outside the cell gradients; the other six are per-cell colors in row-major 3×2 order. Generate via the encoder in `lqip-encoder.ts` or via the "LQIP encoder tool" Storybook story. Extends Lean Rada's CSS-only LQIP (https://leanrada.com/notes/css-only-lqip/) with per-cell hue — Lean's original format encodes grayscale cells only; ours encodes a color per cell so multi-color subjects survive the placeholder. |
| `translations` | `object` | Override translation keys (e.g. the message shown when the image fails to load); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Custom `<img>`, `<picture>` or inline `<svg>` (overrides the src-based default). An inline svg keeps its own colors and scales by its viewBox, so a drawing gets the same box, ratio and caption as a photo. Slotted media carries its own text alternative: an `alt` on the img (empty when it conveys nothing), or `role="img"` with an `aria-label`, `aria-labelledby` or `<title>` on the svg. The internal `error` listener is attached only to the built-in `<img>`, so slotted content does not trigger the error-state overlay automatically. Consumers slotting their own image are responsible for handling its error state (e.g. swapping the slot content or styling a fallback). |
| `caption` | Rich caption content (overrides the `caption` attribute) |

### `<nldd-keyboard-shortcut>`

Shows a key combination (such as Cmd+K or Ctrl+Shift+P) in one combined container with a semantic <kbd> element per key. On touch-only devices (no hover-capable input) the shortcut is hidden by default, because it cannot be invoked there. Use the `always-visible` attribute when the shortcut is purely informative and should stay visible. For cross-platform shortcuts you can set `mac-keys`, `windows-keys` and `linux-keys`. The component picks the right one from the detected OS, with `keys` as the fallback for unknown platforms.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `keys` | `string` | Keys separated by '+' (e.g. 'Cmd+K' or 'Ctrl+Shift+P'). Use '+++' for a literal '+' key: 'Ctrl+++' becomes 'Ctrl' + '+'. For more complex cases (a combo with several '+' keys, for instance) use the default slot with your own <kbd> elements instead of the keys attribute. |
| `mac-keys` | `string` | Optional override for macOS (iPhone/iPad/iPod included). |
| `windows-keys` | `string` | Optional override for Windows. |
| `linux-keys` | `string` | Optional override for Linux/ChromeOS. |
| `size` | `string` | Size: 'sm' \| 'md' \| 'inherit' (default: 'md'). 'inherit' takes the font-size from the container; in the box variant the keycaps then scale along in em. |
| `variant` | `string` | 'box' (default) shows each key as a keycap with a fill and a highlight edge. 'simple' shows the keys as plain text with separators: lighter, for inline use such as in a menu item. |
| `always-visible` | `boolean` | Show on touch-only devices too, where shortcuts cannot be invoked. |
| `color` | `string` | 'neutral' (default) uses the component colors of its own. 'inherit' lets the keys and separators follow the surrounding text color (currentColor), with a translucent contrast fill and highlight edge. Useful on a filled surface color or a highlighted row. |
| `debug-os` | `'mac'\|'windows'\|'linux'\|'other'` | Development aid: overrides the OS detection for this instance, so you can show several platform variants side by side in Storybook or documentation. Not meant for production use; leave it empty (default) so the real OS detection applies. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Optional custom <kbd> elements. Ignored when keys is set. |

### `<nldd-rich-text>`

A container for rich text content that automatically applies responsive typography. Uses no shadow DOM so styles apply to all nested elements. Import nldd-rich-text.css globally in your application. Children are placed in three zones: text (headings, paragraphs, lists, blockquote, div/section) reads at the `main` size; media and tables (img, figure, video, iframe, table) get the `wide` accent; everything else, code blocks and every component, gets the full `full` span with `justify-self: start`, so the room is available without being forced. Overridable per child with `data-width="main" | "wide" | "full"`. In the left-aligned layout, wide and full read as a bleed to the right; with `centered` they are symmetrical.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `spacing` | `string` | Spacing between elements: 'flat' \| 'tight' \| 'snug' (default) \| 'loose' |
| `centered` | `boolean` | Centers the main column inside the container; without it, content is left-aligned |
| `hyphens` | `boolean` | Opt-in automatic hyphenation for running text (p, li, dd). Needs a correct `lang` on the page (`lang="nl"` on `<html>`, for instance): without language information the browser does not hyphenate. An `overflow-wrap: break-word` safety net on p/li is always on, independent of this attribute, so long URLs and compounds break neatly instead of overflowing even without a dictionary. |
| `color` | `string` | 'content' (the default) takes the system's own content colors, each element its own. 'inherit' lets all text follow the color of the surface instead (for colored areas such as the filled categories). Links stay underlined as an affordance; secondary text (figcaption) gets the same color at a lowered opacity. Known v1 gaps: inline code, mark, tables and hr keep their own surfaces. |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

### `<nldd-tag>`

A compact property that has been assigned to something: a category, a type, a role, a certification. What it says changes only when someone edits the content. A tag is not interactive. Do not use it for a state the system keeps itself, such as "Active" or "Expired", because that is `nldd-badge`. If the user can remove the thing or click it, it is `nldd-token`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `color` | `string` | Color variant. Semantic: 'neutral' \| 'accent' \| 'success' \| 'warning' \| 'critical'. Rijkshuisstijl colors: 'lintblauw' \| 'donkerblauw' \| 'hemelblauw' \| 'lichtblauw' \| 'paars' \| 'violet' \| 'robijnrood' \| 'roze' \| 'rood' \| 'oranje' \| 'donkergeel' \| 'geel' \| 'donkerbruin' \| 'bruin' \| 'donkergroen' \| 'groen' \| 'mosgroen' \| 'mintgroen'. (default: 'neutral') |
| `size` | `string` | Tag size: 'sm' \| 'md' (default: 'md') |
| `text` | `string` | Tag text (alternative to the default slot) |
| `icon` | `string` | Icon before the text |
| `variant` | `string` | What is visible: 'text' \| 'icon' \| 'icon-and-text'. Unset → detected from which of text/icon is present. |
| `accessible-label` | `string` | Accessible label for screen readers. Use this on icon-only tags without visible text. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Tag text |
| `icon` | Custom icon before the text |

### `<nldd-text>`

One run of body text at a size from the type scale. It is what you reach for where an app would otherwise write a bare `<p>` and inherit whatever the page happens to set: a line under a title, a sentence in a panel, a caption. Every combination it offers exists as a token, so it cannot invent typography — it only names what the scale already has. The three axes are the same three the tokens carry: size, weight and line height. Not for headings, which is `nldd-title`, and not for a block of prose with its own rhythm, spacing and media widths, which is `nldd-rich-text`. This is one run of text and nothing around it. Color follows the context channel a list item, menu or table sets on its content, so text inside a row travels with that row as it is hovered or selected. Standalone that channel is unset and the semantic color answers. A line stops at `--semantics-text-max-width`, 40em, so it holds the same number of characters at every size and a wide column does not turn one sentence into a ruler. Override that variable, or `max-width` on the element, where a line is meant to run the full width: a label in a table cell, a value beside its own heading.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Text size on the body scale: 'xxs' \| 'xs' \| 'sm' \| 'md' \| 'lg' (default: 'md') |
| `weight` | `string` | Font weight: 'regular' \| 'medium' \| 'bold' (default: 'regular'). With 'bold' a slotted `<strong>` no longer stands out: there is nothing bolder in the scale. |
| `line-height` | `string` | Line height: 'flat' \| 'tight' \| 'snug' \| 'loose' (default: 'snug') |
| `color` | `string` | Text color: 'content' (the default) \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'critical' \| 'inherit'. 'content' and 'secondary' follow the surrounding content channel; 'inherit' takes the color it inherits, for text on a painted surface. |
| `horizontal-alignment` | `string` | Alignment of the text within the block: 'left' \| 'center' \| 'right' (default: 'left'). Aligns the words; `horizontal-alignment` on nldd-container moves the box. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The text. Inline elements work as they are: `<strong>` and `<b>` take the bold weight from the scale, `<a>`, `<em>` and components such as `nldd-tag` are left alone. |

### `<nldd-title>`

A title bar with an optional overline, title, and subtitle on the left, and a slot at the end of the title line on the right.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `number` | Visual size of the title: 1–6 (default: 3) |
| `color` | `string` | 'content' (the default) takes the system's own content colors. 'inherit' lets the title follow the text color of the surface instead (for colored areas such as the filled categories); overline and subtitle get the same color at a lowered opacity. |

**Slots**

| Slot | Description |
| --- | --- |
| `overline` | Optional overline above the title |
| _(default)_ | Title text (use h1–h6 for semantics) |
| `subtitle` | Optional subtitle below the title |
| `end` | Whatever belongs at the end of the title line: a button, a menu, a status badge, a version. Named for the position, not for a kind of content, because anything can sit there. |

### `<nldd-token>`

A self-contained piece of data the user is handling: a person in an address field, an active filter value. Alone among the three it can be operated, so it is optionally dismissable or interactive through a contextual menu. For something you only read, reach for `nldd-tag` (a trait someone assigned) or `nldd-badge` (a state or a count the system keeps).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Token text; falls back to the default slot when unset. |
| `control` | `'none' \| 'dismiss' \| 'menu'` | Control type (default: 'none') |
| `expanded` | `boolean` | Reflects whether the token's menu is open (control="menu"); managed by the token. |
| `disabled` | `boolean` | Disabled state |
| `dismiss-text` | `string` | Accessible label for the dismiss button (default: 'Verwijder') |
| `menu-text` | `string` | Accessible label for the menu button (default: 'Toon opties') |
| `roving` | `boolean` | Inside a roving-focus container (e.g. nldd-token-field): the host is the single tab stop, so the trailing control is not separately tabbable. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Token text |
| `menu` | An nldd-menu that the token opens from its menu button (control="menu"). |

**Events**

| Event | Description |
| --- | --- |
| `dismiss` | When the dismiss button is clicked |

### `<nldd-tooltip>`

A wrapper that shows a tooltip on hover or focus of its child element. It uses `display: contents`, so it does not affect the child's layout.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Tooltip text |
| `open` | `boolean` | Forces the tooltip visible, whatever hover or focus does. Use it for programmatic feedback ("Copied", for instance). Reset it to false to restore the hover behavior. |
| `placement` | `string` | Position: 'top' \| 'bottom' \| 'left' \| 'right' (default: 'bottom'; automatically 'top' on touch devices) |
| `timing` | `string` | When the tooltip appears on hover: 'instant' — right away, without a show delay. 'delay' (the default) — after the standard show delay (700ms). 'never' — the tooltip is never shown; hover and focus events are ignored, aria-describedby is suppressed, and a tooltip that is already visible disappears. The hide delay and the touch suppression stay in force under every value. A focus trigger is always instant. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The element the tooltip is shown for |

**Events**

| Event | Description |
| --- | --- |
| `nldd-tooltip-dismiss` | When a user presses Escape while `open=true`. The consumer owns the open lifecycle from there (we cannot clear `open` on our own), so this event is the consumer's chance to set `open` back to `false`. WCAG 1.4.13: a persistent hover or focus overlay has to be dismissible without moving focus. |

## Forms

### `<nldd-form>`

Nederlandse Digitale Dienst Form Component Plain custom element (extends HTMLElement, no Lit), required for light-DOM autofill. Renders a real <form> element in the LIGHT DOM around its children. Chrome's autofill engine looks for native <input> elements that have a <form> ancestor in the light DOM; with shadow-DOM inputs it can't find them, so we keep this component shadow-less. **Differs from other nldd-* components:** - No shadowRoot: all children live in the light DOM (inside the inner <form>) - No Lit: a plain HTMLElement with manual attribute mirroring - **Requires a global stylesheet import**: the vertical rhythm rules live in `dist/css/form.css` (or `global.css`), not in a component-specific shadow stylesheet. Import it as part of your app's global CSS bundle. **Two usage modes:** 1. **Auto-wrap** (default): write children directly. Component creates a `<form>` element and migrates children into it via MutationObserver. Simplest API. 2. **User-provided form** (framework-friendly): write your own `<form>` as direct child. Component detects it, takes over attribute mirroring, and skips the migration. Children stay where your framework puts them, so there is no DOM shuffling to conflict with React/Vue/Angular reconciliation. **Framework interop:** In auto-wrap mode every direct child is moved into the inner form through a MutationObserver. That works fine for most React/Vue use cases, because frameworks only mutate the DOM when their virtual DOM changes. For edge cases (animation libraries that track DOM position, SSR hydration mismatches, frameworks that actively check sibling positions) use **user-provided form** mode instead. For programmatic manipulation, use the `form` getter so you work with the inner `<form>` element directly: const inner = document.querySelector('nldd-form').form; inner.checkValidity(); inner.appendChild(myInput); // skips the migration overhead

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `string` | Form name |
| `action` | `string` | URL endpoint for submission |
| `method` | `string` | HTTP method ('get' \| 'post' \| 'dialog') |
| `novalidate` | `boolean` | Skip native browser validation |
| `enctype` | `string` | Encoding type for submission |
| `target` | `string` | Submit target ('_self' \| '_blank' \| ...) |
| `autocomplete` | `string` | 'on' \| 'off' (form-level autofill toggle) |
| `label-alignment` | `string` | Default `label-alignment` for descendant nldd-form-field and nldd-form-actions ('top' \| 'right' \| 'left'). Propagated to descendants as `form-label-alignment`. A `label-alignment` of its own on the descendant takes precedence through the CSS cascade. |

**Events**

| Event | Description |
| --- | --- |
| `submit` | — |
| `reset` | — |

### `<nldd-form-actions>`

A layout wrapper for the action buttons at the bottom of a form (typically a submit button or a button group). Follows the same responsive layout as `nldd-form-field`: with `label-alignment="right"` or `"left"` the content gets the same indent as the fields above it, thanks to a `::before` pseudo-element that acts as the spacer column where the label would sit. Inherits `label-alignment` automatically from a wrapping `<nldd-form>`: the form propagates its own `label-alignment` as `form-label-alignment` to descendant `nldd-form-actions` (and `nldd-form-field`) through a MutationObserver. An explicit `label-alignment` on the form-actions itself wins through the CSS cascade, and the form code never touches the `label-alignment` attribute of the descendant. <nldd-form label-alignment="right"> <nldd-form-field>...</nldd-form-field> <nldd-form-actions> <nldd-button-group> <nldd-button variant="primary" type="submit" text="Opslaan"></nldd-button> </nldd-button-group> </nldd-form-actions> </nldd-form>

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `label-alignment` | `string` | 'top' (default) \| 'right' \| 'left'. A value of its own always wins over the inherited form-label-alignment. |
| `form-label-alignment` | `string` | Set by a wrapping nldd-form as a fallback. Do not set it yourself in consumer code. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Action elements (button, button-group, and so on) |

### `<nldd-form-field>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `label-alignment` | `string` | 'top' (default) \| 'right' \| 'left'. A value of its own always wins over the inherited form-label-alignment. |
| `form-label-alignment` | `string` | Set by a wrapping nldd-form as a fallback. Do not set it yourself in consumer code. |
| `label` | `string` | Field label text. Omit for no-label layout. |
| `supporting-label` | `string` | Short supporting text below the label. Same typography as optional badge. |
| `optional` | `boolean` | Shows an optional badge next to the label. |
| `optional-label` | `string` | Text for the optional badge. Defaults to 'Optioneel'. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The slotted input (e.g. nldd-text-field), its nldd-validation-list and its nldd-form-field-help-text. |

### `<nldd-form-field-help-text>`

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Help text content. May contain inline elements including links. |

### `<nldd-form-section>`

Nederlandse Digitale Dienst Form Section Component Plain custom element (extends HTMLElement, no Lit). The light-DOM render works around an NVDA + Firefox a11y bug where a shadow-DOM <fieldset> + <legend> is not reliably announced as the group label for slotted controls. A native fieldset/legend in the light DOM works correctly across all AT/browser combinations. **Differs from shadow components:** - No shadowRoot: all children live in the light DOM (inside the rendered <fieldset>). - No Lit: a plain HTMLElement with manual DOM mutation. - **Requires a global stylesheet import**: `dist/css/form-section.css` (or `global.css`). Form-section has no shadow stylesheet. Renders to: <nldd-form-section> <fieldset class="form-section"> <legend class="form-section__header"> <span class="form-section__title">Title</span> <span class="form-section__subtitle">Subtitle</span> </legend> <div class="form-section__main"> [user's children] </div> </fieldset> </nldd-form-section> **Accessibility note**: the title renders as a `<legend>`. Semantically that is a **group label**, not a heading. Screen readers announce it when the user enters the fieldset, but users jumping through headings with the H key skip it. Visually it looks like a heading, so use this component for *form grouping*, not as page structure. For real page headings, use a separate heading element above the form. **Supporting-text length**: the subtitle sits as a `<span>` inside the `<legend>` so a screen reader reads it along as the group label. Side effect: on every field entry within the section, the whole legend (title + subtitle) is spoken again. Keep `supporting-text` short (roughly 80 characters or less) and use it to introduce the group ("Vul je adresgegevens in"), not for detailed instructions. For a longer explanation on one specific field, use `nldd-form-field-help-text` on that field. <nldd-form> <nldd-form-section text="Persoonsgegevens" supporting-text="Vul je gegevens in."> <nldd-form-field label="Voornaam">...</nldd-form-field> <nldd-form-field label="Achternaam">...</nldd-form-field> </nldd-form-section> <nldd-form-section text="Adres"> <nldd-form-field label="Straat">...</nldd-form-field> </nldd-form-section> <nldd-form-actions>...</nldd-form-actions> </nldd-form>

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Heading text (rendered in the `<legend>`). |
| `supporting-text` | `string` | Short description under the heading. Keep it to roughly 80 characters or less (see the a11y note). |

### `<nldd-validation-item>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `match` | `string` | Regular expression the value has to contain. Not anchored, unlike the native `pattern`: `[A-Z]` means "has a capital in it". |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |
| `required` | `boolean` | The value may not be empty. Use it on a field whose other rules would pass an empty value. |
| `hint` | `boolean` | Show this item before there is a verdict, whatever the list says. |
| `unmet` | `boolean` | Whether the value fails this item. Managed by the list; do not set it yourself. |
| `visible` | `boolean` | Whether the item is on screen. Managed by the list. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The text of the requirement. |

### `<nldd-validation-list>`

Nederlandse Digitale Dienst Validation List (Lit + TypeScript) Everything a value has to satisfy, in one list. A requirement you can state up front is an item with a rule, and it checks itself while you type. One only a server can decide is an item without a rule, and the app names it in `unmet` on the control. The list has two modes and `judging` is the switch. Before a verdict it shows its hints, which are the requirements of the field. After one it shows everything the value does not satisfy, and the hints are gone. It throws that switch itself the moment its control turns `invalid`, so when the field is judged is the consumer's decision, and the right moment is on submit. Hints are off by default. A phone number does not need its format spelled out before anyone has typed, while the rules for a password do. There are no checkmarks. The control already shows a validation icon of its own, and repeating that per line says the same thing three times.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `for` | `string` | Id of the control this list is about. Not needed inside an nldd-form-field, which hands its own control over. |
| `hint` | `boolean` | Show every item before there is a verdict, as the requirements of the field. Overridable per item. |
| `judging` | `boolean` | Drop the hints, because this field has been judged. Turned on by the list itself once its control is `invalid`, and settable by hand. What turns red follows `invalid`, not this. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-validation-item elements. |

## Inputs

### `<nldd-checkbox>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Checked state |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `decorative` | `boolean` | Renders the box without the input: no focus, no name/value, nothing announced. For a control that owns the state elsewhere, such as a list row that is itself the checkbox; putting a real input in there would nest a control inside a control. |
| `indeterminate` | `boolean` | Indeterminate state (takes precedence over checked visually) |
| `value` | `string` | Value for form submission |
| `name` | `string` | Name for form submission |
| `accessible-label` | `string` | Accessible label forwarded as aria-label to the native input. |
| `required` | `boolean` | Required state |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. Note: aria-labelledby is not supported as IDREF resolution cannot cross shadow DOM boundaries. |

**Events**

| Event | Description |
| --- | --- |
| `change` | Fired when the checkbox state changes; detail: { checked: boolean, value: string } |

### `<nldd-checkbox-field>`

A checkbox with an inline label for use in forms. Form-associated: participates in native form submission under `name` with `value` when checked (the inner nldd-checkbox sits in the shadow root and never joins the consumer's form; the field submits on its behalf).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Checked state |
| `indeterminate` | `boolean` | Indeterminate state |
| `disabled` | `boolean` | Disabled state |
| `value` | `string` | Value for form submission |
| `name` | `string` | Name for form submission |
| `label` | `string` | Label text for the checkbox |
| `required` | `boolean` | Required state |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When checked state changes; detail: { checked: boolean, value: string } |

### `<nldd-code-editor>`

A monospace editor for code, YAML, JSON and other technical content, built on CodeMirror 6 (via NLDDCodeMirrorElement). Visually pairs with nldd-code-viewer for a matching read-only surface. Default `variant="simple"` is a bare, flush editor (no frame, no focus ring) for use inside an nldd-form-field or a consumer composition that owns its own chrome and focus treatment; the caret is rendered as a prominent accent as the focus cue. `variant="input-field"` adds the framed surface (border ring, tinted fill, inner padding, radius) and a focus ring for standalone use. The simple variant has no surrounding space of its own: let a layout container own the spacing and forward clicks with `focusFromPoint()` so clicking the padding still starts editing. Optional `language` enables lazy syntax highlighting; `line-numbers` adds a gutter (click a number to move the caret to that line).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | Editor content |
| `placeholder` | `string` | Placeholder text shown while empty |
| `input-id` | `string` | Sets the id on the editable element. Set automatically by nldd-form-field. |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Field name for form submission |
| `readonly` | `boolean` | Readonly state (focusable and selectable, not editable) |
| `required` | `boolean` | Required state |
| `wrap` | `boolean` | Wrap long lines instead of horizontal scroll |
| `rows` | `number` | Minimum visible rows (the floor in every resize mode). Default: 6. |
| `resize` | `string` | 'none' (fixed) \| 'vertical' (drag) \| 'auto' (grow, default) |
| `variant` | `string` | 'simple' (default, bare) \| 'input-field' (framed surface) |
| `language` | `string` | Highlight grammar (yaml, json, javascript, typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql, python). Empty disables highlighting. |
| `line-numbers` | `boolean` | Show a line-number gutter |
| `accessible-label` | `string` | Accessible label forwarded to the editor. Set automatically by nldd-form-field. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the content changes (detail: { value }) |
| `change` | When the content is committed on blur (detail: { value }) |

### `<nldd-combo-box>`

A text input with autocomplete dropdown via nldd-menu. Add a slotted nldd-menu with nldd-menu-item children to provide options. The slotted nldd-menu keeps its default focus behavior (menu container receives focus) so that typing keeps focus on the input. The picker button moves focus to the menu explicitly on activation. Note: Only nldd-menu-item type="button" is supported. Radio and checkbox types are not supported in this context.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The selected form value |
| `text` | `string` | The text shown in the input. May differ from `value` (e.g. value="nl" → text="Nederland"). Set this when pre-populating an existing record. If left empty and `value` matches a slotted menu item, the matching item's `text` is used automatically. |
| `placeholder` | `string` | Placeholder text for the input |
| `size` | `string` | Size: 'sm' \| 'md' (default: 'md') |
| `valid` | `boolean` | Marks the field as valid |
| `invalid` | `boolean` | Marks the field as invalid |
| `disabled` | `boolean` | Disabled state |
| `readonly` | `boolean` | Read-only state: the value stays readable, selectable and in the tab order, but the menu does not open and there is nothing to clear. The input drops its combobox role and the aria that goes with it, so assistive technology is not told about a list it cannot open. Use this where the value belongs to the record rather than to the form, e.g. the product an asset is an instance of. |
| `allow-custom` | `boolean` | Allow committing free-typed values that match no option (Enter/blur). Default false: only menu options are accepted. |
| `name` | `string` | Input name for form submission |
| `autocomplete` | `string` | Browser autofill hint. Default 'off' to prevent the native autofill panel from competing with the menu dropdown. Set to a valid token (e.g. 'country', 'organization') when browser autofill is desired. |
| `accessible-label` | `string` | Accessible label forwarded as aria-label to the input. Required for screen reader accessibility. |
| `max-items` | `number` | Maximum visible items before scrolling (default: 8) |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |
| `no-spellcheck` | `boolean` | Disables browser spellchecking on the inner input |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `required` | `boolean` | Required state |
| `pattern` | `string` | Regular expression the value has to match, as the native `pattern`. |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | An nldd-menu element with nldd-menu-item and nldd-menu-divider children |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the input value changes; detail: { value: string } |
| `change` | When an option is selected or a custom value is committed; detail: { value: string } |

### `<nldd-date-field>`

A text field for a date, with an optional calendar in a popover. The value is always ISO (yyyy-mm-dd); on screen it shows the Dutch notation (dd-mm-yyyy). Typing is not masked: input is accepted generously and normalized only when the field is left. Error messages belong to nldd-form-field, not here. This field reflects only `invalid` / `valid`, like nldd-text-field.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The date as ISO (yyyy-mm-dd). With `range` an ISO 8601 interval: `yyyy-mm-dd/yyyy-mm-dd`. Empty when there is no valid date. |
| `range` | `boolean` | Pick a period: two inputs and a calendar in range mode. |
| `min` | `string` | Earliest allowed date as ISO (yyyy-mm-dd). |
| `max` | `string` | Latest allowed date as ISO (yyyy-mm-dd). |
| `no-picker` | `boolean` | Hides the calendar button. It is shown by default. |
| `placeholder` | `string` | Placeholder text. Do not put a format here; use the supporting label of nldd-form-field for that. |
| `input-id` | `string` | Sets the id on the internal input. Set automatically by nldd-form-field. |
| `size` | `string` | 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `invalid` | `boolean` | Marks the field as invalid. |
| `valid` | `boolean` | Marks the field as valid. |
| `disabled` | `boolean` | Disabled state. |
| `readonly` | `boolean` | Read-only state. |
| `required` | `boolean` | Required state. |
| `name` | `string` | Name for form submission. |
| `autocomplete` | `string` | Autocomplete hint, for example 'bday'. |
| `accessible-label` | `string` | Accessible label for the internal input. Set automatically by nldd-form-field. |
| `width` | `string` | Width. By default exactly wide enough for a date plus the icons; 'full' fills the container; 'fit-content' drops the room for the validation icon and grows again as soon as the field turns valid or invalid; or pass your own CSS length. |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| `picker` | Your own nldd-date-picker instead of the default calendar. The field keeps setting `value`, `min`, `max` and `range`; use the slot for what only a calendar knows: `week-numbers`, `first-day-of-week`, `is-date-unavailable` and its own translations. |

**Events**

| Event | Description |
| --- | --- |
| `input` | On every change. detail: { value } with the ISO date, or '' while there is no valid date. |
| `change` | When the value is committed. detail: { value } with the ISO date, or ''. |

### `<nldd-date-picker>`

A calendar for picking a date or a period. The component works on its own (inline on a page, in a filter panel) and also sits in the popover of nldd-date-field. Values are always ISO (yyyy-mm-dd). With `range` the user picks a start and an end date in two steps.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The chosen date as ISO (yyyy-mm-dd). Only without `range`. |
| `start` | `string` | Start of the period as ISO. Only with `range`. |
| `end` | `string` | End of the period as ISO. Only with `range`. |
| `range` | `boolean` | Pick a period instead of a single date. |
| `min` | `string` | Earliest allowed date: ISO, or `today` with an offset (`today-18y`). |
| `max` | `string` | Latest allowed date: ISO, or `today` with an offset (`today+1y`). |
| `first-day-of-week` | `number` | First day of the week, 0 is Sunday. Default 1 (Monday). |
| `week-numbers` | `boolean` | Shows ISO week numbers in a column on the left. |
| `width` | `string` | Width: `full` (fills the container) or a CSS length (e.g. `560px`). Empty (default) is the intrinsic width of seven day cells; the cells stretch along with the width you pass. |
| `accessible-label` | `string` | Accessible name of the calendar. |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When a date or a complete period has been chosen. detail: { value } or { start, end }. |
| `input` | Also on the intermediate step of a period, when only the start date is set. |

### `<nldd-dropdown>`

A visual wrapper around a native `<select>` element. The consumer provides a native `<select>` as a slotted child — this way the browser retains full control over form submission, accessibility and keyboard navigation, including `<optgroup>`, `data-*` attributes and dynamic changes to options.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Size: 'xs' \| 'sm' \| 'md' (default: 'md') |
| `valid` | `boolean` | Marks the field as valid |
| `invalid` | `boolean` | Marks the field as invalid |
| `disabled` | `boolean` | Disabled state; also forwarded to the slotted select |
| `expanded` | `boolean` | Reflects whether the native picker popup is open (driven internally) |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `accessible-label` | `string` | Accessible name, forwarded as aria-label to the slotted select |
| `required` | `boolean` | Required state, handed to the slotted <select>. A `required` on the <select> itself is left alone. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | A native `<select>` element with `<option>` and/or `<optgroup>` children |

**Events**

| Event | Description |
| --- | --- |
| `change` | Bubbles up from the slotted select; detail: { value: string } |

### `<nldd-file-field>`

A file picker that reads as one control: an nldd-button flush in the corner of a tinted surface, the chosen file next to it, and a dismiss button to clear it again. It wraps a hidden native `<input type="file">`, which is what makes the picker open at all — a file dialog only opens from a user gesture on a real input. The surface deliberately does not look like an input field. A border with field semantics promises you can type into it; here you can only press a button, so it uses button and surface colors instead of `--semantics-input-fields-*`. The button keeps its own tinted background and therefore sits a shade darker in the surface, which is what marks it as the thing to press. Several files are summarized, not listed: "3 bestanden" with a single cross that clears all of them. Every pick replaces the whole FileList, and rebuilding it to add or drop one file means going through DataTransfer, which does not deduplicate (even the same File object twice yields two entries) — and a File has no id, so deduplicating would come down to guessing from name, size and last-modified. A list with a cross per file would promise an edit the platform does not support. A page that does want to show the files renders its own list from the `File[]` in the change event.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Field size: 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `accept` | `string` | Comma-separated list of accepted file types, forwarded to the input (e.g. ".pdf,image/*") |
| `multiple` | `boolean` | Allows choosing more than one file |
| `accessible-label` | `string` | Accessible label forwarded to the inner input. Set automatically by nldd-form-field. |
| `input-id` | `string` | Sets the id on the native input. Set automatically by nldd-form-field. |
| `valid` | `boolean` | Marks the field as valid; shows a check icon on the right, like nldd-dropdown |
| `invalid` | `boolean` | Marks the field as invalid; shows an alert icon on the right, like nldd-dropdown |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Name for form submission |
| `required` | `boolean` | Marks the field required (invalid while no file is chosen) |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Events**

| Event | Description |
| --- | --- |
| `change` | When the chosen files change, including a clear; detail: { files: File[] } |

### `<nldd-multi-line-text-field>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The textarea value |
| `placeholder` | `string` | Placeholder text |
| `input-id` | `string` | Sets the id on the native textarea. Set automatically by nldd-form-field. |
| `size` | `string` | 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `invalid` | `boolean` | Marks the field as invalid |
| `valid` | `boolean` | Marks the field as valid |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Textarea name for form submission |
| `readonly` | `boolean` | Readonly state |
| `required` | `boolean` | Required state |
| `autocomplete` | `string` | Autocomplete hint |
| `keyboard` | `string` | Which virtual keyboard a phone or tablet raises, forwarded as `inputmode`: 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'. It changes nothing about what the field accepts, and nothing at all on a desktop. |
| `enter-key` | `string` | What the Enter key of the virtual keyboard says, forwarded as `enterkeyhint`: 'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send'. In a field where Enter starts a new line, leave it alone. |
| `rows` | `number` | Initial visible rows (minimum height). Default: 3. |
| `resize` | `string` | 'none' \| 'vertical' \| 'auto' (default). 'auto' grows with content (native field-sizing), no manual handle. |
| `accessible-label` | `string` | Accessible label forwarded to the inner textarea. Set automatically by nldd-form-field. |
| `no-spellcheck` | `boolean` | Disables browser spellchecking on the inner textarea |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When value changes |
| `change` | When value is committed (blur) |

### `<nldd-number-field>`

A numeric input field with decrement and increment buttons.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value |
| `min` | `number` | Minimum value (default: -Infinity) |
| `max` | `number` | Maximum value (default: Infinity) |
| `step` | `number` | Step size (default: 1) |
| `size` | `string` | Size: 'sm' \| 'md' (default: 'md') |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Name for form submission |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch |
| `width` | `string` | Width mode: 'full' (stretches to container) or any CSS length (e.g. '240px') |
| `hide-spin-buttons` | `boolean` | When set, hides the decrement and increment buttons |
| `accessible-label` | `string` | Accessible label (aria-label) forwarded to the native input |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the value changes (typing, +/- button, or on-commit correction); detail: { value: number } |
| `change` | When the value is committed (blur/Enter or +/- button), clamped to [min, max]; empty input falls back to the last valid value. When the committed value differs from the typed value, a matching input event is fired immediately before this one. detail: { value: number } |

### `<nldd-password-field>`

A password input field with visibility toggle and validation states.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The input value |
| `placeholder` | `string` | Placeholder text |
| `input-id` | `string` | Sets the id on the native input. Set automatically by nldd-form-field. |
| `size` | `string` | 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `valid` | `boolean` | Marks the field as valid |
| `invalid` | `boolean` | Marks the field as invalid |
| `disabled` | `boolean` | Disabled state |
| `masked` | `boolean` | Whether the password is masked (default: true) |
| `show-button-text` | `string` | Visible toggle button text when masked (default: 'Toon') |
| `hide-button-text` | `string` | Visible toggle button text when unmasked (default: 'Verberg') |
| `show-button-accessible-label` | `string` | aria-label for toggle when masked (default: 'Toon wachtwoord') |
| `hide-button-accessible-label` | `string` | aria-label for toggle when unmasked (default: 'Verberg wachtwoord') |
| `readonly` | `boolean` | Readonly state |
| `required` | `boolean` | Required state |
| `name` | `string` | Input name for form submission |
| `autocomplete` | `string` | Autocomplete hint |
| `accessible-label` | `string` | Accessible label forwarded to the inner input. Set automatically by nldd-form-field. |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `pattern` | `string` | Regular expression the value has to match, as the native `pattern`. |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the input value changes ({ detail: { value } }) |
| `change` | When the input value is committed ({ detail: { value } }) |

### `<nldd-radio-button>`

WAI-ARIA: put the buttons of one group in a container with role="radiogroup" and a name of its own. A screen reader counts the options from that container, so a bare <fieldset> (which is a group, not a radiogroup) leaves them uncounted. nldd-radio-button-group does this for you. Radio buttons with the same name, in the same form and the same tree, form one group the way native radios do: checking one unchecks the others, the arrow keys move between them, Tab stops at the group once, and a screen reader hears each one's place in it. The element itself is the radio, because an input per shadow root would leave every button a group of one. The shape is all this component draws. A radio with a label beside it is nldd-radio-button-field. <fieldset role="radiogroup" aria-labelledby="options-label"> <legend id="options-label">Kies een optie</legend> <nldd-radio-button name="options" value="1" accessible-label="Optie 1"></nldd-radio-button> <nldd-radio-button name="options" value="2" accessible-label="Optie 2"></nldd-radio-button> </fieldset>

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Checked state |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `decorative` | `boolean` | Renders the shape only: no role, no focus, no name/value, nothing announced. For a control that owns the state elsewhere, such as a list row or an nldd-radio-button-field that is itself the radio; putting a second radio in there would nest a control inside a control. |
| `required` | `boolean` | Required state. What it asks is whether anything in the group is checked, as a native radio does. |
| `focus-ring` | `boolean` | Draws the focus ring around the shape. Set by nldd-radio-button-field, which is the radio itself and holds the focus. Not part of the public API. |
| `name` | `string` | Radio group name for form submission; ties the buttons of one group together |
| `value` | `string` | Value submitted with the form when this radio button is checked |
| `accessible-label` | `string` | Accessible label, set as aria-label on this element: it is the radio. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. Note: aria-labelledby is not supported as IDREF resolution cannot cross shadow DOM boundaries. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When checked state changes; detail: { checked: boolean, value: string, name: string } |

### `<nldd-radio-button-field>`

A radio button with an inline label. Use inside nldd-radio-button-group, which sets the name and labels the group. Fields that stand on their own group by name, the way native radios do: checking one unchecks the others, the arrow keys move between them and Tab stops at the group once. Put them in a container with role="radiogroup", or a screen reader has nothing to count them from. The field is the radio: it carries the role, the state, the label it is announced by and the focus, and the nldd-radio-button inside only draws the shape. A radio of its own in there would be a second control inside a control, and a group of one to count. Form-associated: the checked field submits its `value` under `name`. Unchecking siblings is the group's job, so exactly one value per group reaches the form.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Checked state |
| `disabled` | `boolean` | Disabled state |
| `value` | `string` | Value for form submission |
| `name` | `string` | Radio group name for form submission; ties the fields of one group together. Set automatically by nldd-radio-button-group. |
| `required` | `boolean` | Required state. What it asks is whether anything in the group is checked, as a native radio does. Set automatically by nldd-radio-button-group. |
| `label` | `string` | Label text for the radio button |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When checked state changes; detail: { checked: boolean, value: string } |

### `<nldd-radio-button-group>`

Groups nldd-radio-button-field elements, handles keyboard navigation, and forwards name and disabled state to all child fields. Use inside nldd-form-field which provides the group label.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `string` | Forwarded to all slotted nldd-radio-button-field elements |
| `disabled` | `boolean` | Disables all slotted fields |
| `required` | `boolean` | Marks the group as required |
| `accessible-label` | `string` | Accessible name for the group, set as aria-label on the group |
| `accessible-labeled-by` | `string` | Id of an external label element, set as aria-labelledby on the group |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Slot for nldd-radio-button-field elements |

**Events**

| Event | Description |
| --- | --- |
| `change` | Bubbles up from the checked field; detail: { checked: boolean, value: string } |

### `<nldd-search-field>`

A search input with a leading search icon, an optional dismiss button, and an optional search button.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The search value |
| `placeholder` | `string` | Placeholder text for the input |
| `accessible-label` | `string` | Accessible label (aria-label) for the native input. Falls back to placeholder when not set. Set explicitly when a value is already present and the placeholder is no longer visible. |
| `size` | `string` | Field size: 'sm' \| 'md' (default: 'md') |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Input name for form submission |
| `show-search-button` | `boolean` | When set, shows a search button on the right |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |
| `no-spellcheck` | `boolean` | Disables browser spellchecking on the inner input |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `required` | `boolean` | Required state |
| `pattern` | `string` | Regular expression the value has to match, as the native `pattern`. |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the input value changes; detail: { value: string } |
| `change` | When the input value is committed; detail: { value: string } |
| `search` | When search is submitted via Enter or the search button; detail: { value: string } |

### `<nldd-segmented-control>`

A horizontal group of mutually exclusive (radio) or multi-select (checkbox) options. Exports both NLDDSegmentedControl and NLDDSegmentedControlItem.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | Selected value for radio type |
| `size` | `string` | Control size: 'sm' \| 'md' \| 'lg' (default: 'md') |
| `type` | `string` | Selection mode: 'radio' \| 'checkbox' (default: 'radio'). |
| `variant` | `string` | Content type for all items: 'text' \| 'icon' \| 'icon-and-text' (default: 'text') |
| `disabled` | `boolean` | Disabled state for all items |
| `width` | `string` | Width mode: 'full' (stretches to container), 'fit-content' (per-item content size), or any CSS length (e.g. '240px') |
| `name` | `string` | Name for form submission |
| `accessible-label` | `string` | Accessible name for the group, set as aria-label |
| `accessible-labeled-by` | `string` | Id of an external label element, set as aria-labelledby on the group |
| `required` | `boolean` | Marks the group as required. Enforced in radio mode; in checkbox mode only announced. |
| `invalid` | `boolean` | Marks the group as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-segmented-control-item elements |

**Events**

| Event | Description |
| --- | --- |
| `change` | When selection changes; detail: { value: string } for radio, detail: { values: string[] } for checkbox |

### `<nldd-segmented-control-item>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | Value for this item |
| `selected` | `boolean` | Whether this item is selected (set by parent) |
| `disabled` | `boolean` | Disabled state |
| `text` | `string` | Text label (shown for variant "text" and "icon-and-text"; used as aria-label and tooltip for variant "icon") |
| `icon` | `string` | Icon name for nldd-icon |
| `size` | `string` | Control size: 'sm' \| 'md' \| 'lg' (default: 'md'). Set by nldd-segmented-control. |
| `variant` | `string` | Content type: 'text' \| 'icon' \| 'icon-and-text' (default: 'text'). Set by nldd-segmented-control. |
| `input-type` | `string` | Selection mode: 'radio' \| 'checkbox' (default: 'radio'). In radio mode the item is the radio itself, in checkbox mode it renders a native checkbox. Set by nldd-segmented-control. |
| `group-name` | `string` | Name of the group for form submission, put on the native checkbox. Set by nldd-segmented-control. |
| `required` | `boolean` | Required state of the native checkbox. In radio mode the group carries the constraint. |

**Slots**

| Slot | Description |
| --- | --- |
| `icon` | Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set. |

**Events**

| Event | Description |
| --- | --- |
| `item-change` | When item is activated; detail: { value: string, checked: boolean } |

### `<nldd-stepper>`

A numeric control with increment and decrement buttons.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value |
| `min` | `number` | Minimum value (default: 0) |
| `max` | `number` | Maximum value (default: Infinity) |
| `step` | `number` | Step size (default: 1) |
| `disabled` | `boolean` | Disabled state |
| `size` | `string` | Size: 'xs' \| 'sm' \| 'md' (default: 'md') |
| `name` | `string` | Name for form submission; the value is submitted under this name |
| `accessible-label` | `string` | Accessible name for the spinbutton; falls back to a generic label |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When the value changes; detail: { value: number } |

### `<nldd-switch>`

A toggle control for on/off settings. Prefer nldd-switch-field for labeled usage — it combines the switch with a visible label. Direct use of nldd-switch requires an accessible-label attribute for screen reader accessibility.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Whether the switch is on/off |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `size` | `string` | Switch size: 'xs' \| 'sm' (default: 'sm') |
| `name` | `string` | Name for form submission; nothing is submitted when the switch is off |
| `value` | `string` | Value submitted with the form when the switch is on (default: 'on') |
| `accessible-label` | `string` | Accessible label forwarded as aria-label to the native input. Required when using nldd-switch without nldd-switch-field. |
| `required` | `boolean` | Required state |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When the switch state changes; detail: { checked: boolean, value: string } |

### `<nldd-switch-field>`

A switch toggle with an inline label for use in forms.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `checked` | `boolean` | Checked state |
| `disabled` | `boolean` | Disabled state |
| `value` | `string` | Value for form submission |
| `name` | `string` | Name for form submission |
| `label` | `string` | Label text for the switch |
| `required` | `boolean` | Required state |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When checked state changes; detail: { checked: boolean, value: string } |

### `<nldd-text-editor>`

A hybrid markdown editor built on CodeMirror 6 (via NLDDCodeMirrorElement): the document stays plain markdown text, but formatting is shown inline (bold is bold, headings are larger, links are colored) while the syntax markers stay visible, only dimmed — the iA Writer / Kirby approach. No WYSIWYG tree, so the data stays portable. Default `variant="simple"` is bare (no frame, no focus ring) for use inside a composition (e.g. a message field) that owns its chrome and focus; the caret is a prominent accent. `variant="input-field"` adds a framed surface + focus Headless: there is no built-in toolbar. A consumer drives formatting via the command methods (toggleBold/toggleItalic/toggleInlineCode/toggleStrikethrough/ toggleHeading/toggleBulletList/toggleTaskList/toggleQuote/toggleLink/runCommand to toggle, and setHeading/setList for picker-style "set" semantics), reads the active formats with getState(), listens to the nldd-text-editor-state event to render toggle states, and forwards padding clicks with focusFromPoint(). Cmd/Ctrl+B/I/E/K are bound out of the box. Commands keep focus on the editor. An inline toggle wraps the selected text (whitespace at its edges stays outside the markers), unwraps a run the caret is in, and with the caret at the very end of a run steps out of it. Bold that a typed space has broken (`**woord **`) keeps its styling while the caret is inside; the space moves outside the markers when the caret leaves. insertAtCursor(text) puts text at the caret and replaceRange(from, to, text) writes at the same clean offsets getSelection() reads. An @-mention typeahead (mentionSource) collapses to an atomic token, further typeahead lists on their own trigger (typeaheads) write what you tell them to, and a W3C-style annotation overlay (annotations) marks ranges with a dashed underline, light tint and a count badge without touching the underlying text.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | Editor content (markdown) |
| `placeholder` | `string` | Placeholder text shown while empty |
| `input-id` | `string` | Sets the id on the editable element. Set automatically by nldd-form-field. |
| `disabled` | `boolean` | Disabled state |
| `name` | `string` | Field name for form submission |
| `readonly` | `boolean` | Readonly state (focusable and selectable, not editable) |
| `required` | `boolean` | Required state |
| `wrap` | `boolean` | Wrap long lines (default true; prose wraps) |
| `rows` | `number` | Minimum visible rows (the floor in every resize mode). Default: 6. |
| `resize` | `string` | 'none' (fixed) \| 'vertical' (drag) \| 'auto' (grow, default) |
| `variant` | `string` | 'simple' (default, bare) \| 'input-field' (framed surface) |
| `accessible-label` | `string` | Accessible label forwarded to the editor. Set automatically by nldd-form-field. |
| `annotatable` | `boolean` | Enable the annotation overlay (off by default). Annotations only render when this is set. |
| `translations` | `object` | Override the editor's assistive-tech strings (the open-in-new-tab link badge and the annotation count badge). Unset keys fall back to Dutch. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When the content changes (detail: { value }) |
| `change` | When the content is committed on blur (detail: { value }) |
| `nldd-text-editor-state` | When the selection or content changes (detail: TextEditorState), for toolbar toggle state |
| `nldd-text-editor-mention` | When an @-mention is inserted (detail: MentionInsertedDetail with id, text, from, to; clean offsets, like getSelection()) |
| `nldd-text-editor-typeahead` | When a candidate from one of the `typeaheads` is chosen (detail: TypeaheadChosenDetail with trigger, candidate, from, to; clean offsets) |
| `nldd-text-editor-annotation-click` | When an annotation's count badge is clicked (detail: { ids: string[], rect: DOMRect }); rect is the badge's viewport box so a consumer can anchor its own note UI to it |

### `<nldd-text-field>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The input value |
| `placeholder` | `string` | Placeholder text |
| `input-id` | `string` | Sets the id on the native input. Set automatically by nldd-form-field. |
| `size` | `string` | 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `invalid` | `boolean` | Marks the field as invalid |
| `valid` | `boolean` | Marks the field as valid |
| `disabled` | `boolean` | Disabled state |
| `type` | `string` | Input type: 'text' \| 'email' \| 'tel' \| 'url' |
| `keyboard` | `string` | Which virtual keyboard a phone or tablet raises, forwarded as `inputmode`: 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'. It changes nothing about what the field accepts, and nothing at all on a desktop. Reach for it where the value is digits but not a quantity you would step (a house number, a postcode, a rack unit): 'numeric'. The keyboard for 'tel', 'email' and 'url' already follows from `type`. |
| `enter-key` | `string` | What the Enter key of the virtual keyboard says, forwarded as `enterkeyhint`: 'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send'. It only labels the key; what Enter does is still up to the form, and on a desktop it changes nothing. |
| `name` | `string` | Input name for form submission |
| `readonly` | `boolean` | Readonly state |
| `required` | `boolean` | Required state |
| `autocomplete` | `string` | Autocomplete hint |
| `accessible-label` | `string` | Accessible label forwarded to the inner input. Set automatically by nldd-form-field. |
| `no-spellcheck` | `boolean` | Disables browser spellchecking on the inner input |
| `width` | `string` | Optional fixed width (any CSS length, e.g. "240px"). Default: stretches to fill container. |
| `pattern` | `string` | Regular expression the value has to match, as the native `pattern`. |
| `minlength` | `number` | Fewest characters the value may have. |
| `maxlength` | `number` | Most characters the value may have. |

**Events**

| Event | Description |
| --- | --- |
| `input` | When input value changes |
| `change` | When input value is committed |

### `<nldd-time-field>`

A text field for a time. The value is always 24-hour `HH:mm`, which is how Dutch shows it too, so unlike nldd-date-field there is nothing to convert. Typing is not masked: input is accepted generously and normalized only when the field is left. Error messages belong to nldd-form-field, not here. This field reflects only `invalid` / `valid`, like nldd-text-field. What you do in the picker is a preview until you leave it. The field shows the time right away but commits it on close. "Klaar" and Enter keep the choice, and so does a click outside once you have picked something. Cancel and Escape put the old time back. On an empty field the wheels open at `min`, or otherwise at the current time rounded to `step`, which does not fill in the field yet.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The time as `HH:mm` (24-hour). Empty when there is no valid time. |
| `min` | `string` | Earliest allowed time as `HH:mm`. Also the base that `step` counts from. |
| `max` | `string` | Latest allowed time as `HH:mm`. |
| `step` | `number` | Step in minutes (default 1). Decides which times are valid, what rounding snaps to, and how far the arrow keys jump. |
| `no-picker` | `boolean` | Hides the picker button. It is shown by default. |
| `placeholder` | `string` | Placeholder text. Do not put a format here; use the supporting label of nldd-form-field for that. |
| `input-id` | `string` | Sets the id on the internal input. Set automatically by nldd-form-field. |
| `size` | `string` | 'md' (default) \| 'sm'. Set automatically by nldd-form-field. |
| `invalid` | `boolean` | Marks the field as invalid. |
| `valid` | `boolean` | Marks the field as valid. |
| `disabled` | `boolean` | Disabled state. |
| `readonly` | `boolean` | Read-only state. |
| `required` | `boolean` | Required state. |
| `name` | `string` | Name for form submission. |
| `autocomplete` | `string` | Autocomplete hint. |
| `accessible-label` | `string` | Accessible label for the internal input. Set automatically by nldd-form-field. |
| `width` | `string` | Width. By default exactly wide enough for a time plus the validation icon; 'full' fills the container; 'fit-content' drops the room for the validation icon and grows again as soon as the field turns valid or invalid; or pass your own CSS length. |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| `picker` | Your own nldd-time-picker instead of the default one. The field keeps setting `value`, `min`, `max` and `step`; use the slot for what only a picker knows, such as its own translations. |

**Events**

| Event | Description |
| --- | --- |
| `input` | On every change. detail: { value } with `HH:mm`, or '' while there is no valid time. |
| `change` | When the value is committed: on leaving the field, and on closing the picker in a way that keeps the choice. detail: { value } with `HH:mm`, or ''. |

### `<nldd-time-picker>`

Two columns, hours and minutes, that slide like a wheel past the selection in the middle. The component works on its own (inline on a page, in a filter panel) and also sits in the popover of nldd-time-field. Values are always 24-hour `HH:mm`. Scrolling is choosing: whatever comes to rest in the middle is the value. The keyboard drives that same selection, because that is what a wheel is: hour and minute are each a spinbutton. The columns underneath are aria-hidden, so the same values are not read out twice.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `string` | The chosen time as `HH:mm` (24-hour). |
| `min` | `string` | Earliest allowed time as `HH:mm`. Also the base that `step` counts from. |
| `max` | `string` | Latest allowed time as `HH:mm`. |
| `step` | `number` | Step in minutes (default 1). Decides which minutes are in the column. |
| `rows` | `number` | Height of the columns in rows (default 7, minimum 3). The chosen value always sits in the middle, so an odd number shows whole rows and an even number cuts off half a row at the top and bottom. |
| `width` | `string` | Width: `full` fills the container, or pass your own CSS length. |
| `accessible-label` | `string` | Accessible name of the picker. |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Events**

| Event | Description |
| --- | --- |
| `input` | On every change: scrolling, the arrow keys. detail: { value } with `HH:mm`. |
| `change` | When the choice is confirmed: a click on a value or on the selection, or Enter. detail: { value } with `HH:mm`. Scrolling only fires `input`, because otherwise a field showing the picker in a popover would commit as soon as you stopped scrolling. |

### `<nldd-toggle-button>`

A selectable button that toggles between selected and unselected. Available as a button (aria-pressed), a checkbox, or a radio. In radio mode the button itself is the radio: it carries the role, the state and its place in the group. A native radio in a shadow root of its own would be a group of one, counted as "1 of 1" and stopped at by Tab.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `type` | `'button' \| 'checkbox' \| 'radio'` | What the button is: a button with aria-pressed, a native checkbox, or a radio (default: 'button') |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Button size (default: 'md') |
| `selected` | `boolean` | Selected state |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `value` | `string` | Value for form submission (checkbox/radio) |
| `name` | `string` | Name for form submission (checkbox/radio) |
| `text` | `string` | Button text |
| `icon` | `string` | Icon name for nldd-icon |
| `variant` | `'text' \| 'icon' \| 'icon-and-text'` | What renders: text, icon, or both. Unset → auto-detect from text/icon attributes. |
| `accessible-label` | `string` | Accessible label; required for icon-only usage |
| `required` | `boolean` | Required state. Set by nldd-toggle-button-group. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Slots**

| Slot | Description |
| --- | --- |
| `icon` | Slot for a custom icon (e.g. custom SVG). Only used when icon attribute is not set. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When selection changes; detail: { selected: boolean, value: string } |

### `<nldd-toggle-button-group>`

Groups nldd-toggle-button elements and manages selection, keyboard navigation, and forwarding of type, name, size, and disabled state to all buttons. For type="radio" (single-select), arrow keys navigate between buttons and automatically select the focused one. For type="checkbox" (multi-select), multiple buttons can be selected simultaneously.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `type` | `'button' \| 'checkbox' \| 'radio'` | Selection mode (default: 'checkbox') |
| `name` | `string` | Forwarded to all buttons |
| `size` | `'xs' \| 'sm' \| 'md'` | Forwarded to all buttons (default: 'md') |
| `disabled` | `boolean` | Disables all buttons |
| `accessible-label` | `string` | Accessible name for the group (aria-label) |
| `accessible-labeled-by` | `string` | ID of an external label element (aria-labelledby) |
| `required` | `boolean` | Marks the group as required. Enforced in radio mode; in checkbox mode only announced. |
| `invalid` | `boolean` | Marks the control as invalid. Announced with aria-invalid; nothing is drawn for it. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-toggle-button elements |

**Events**

| Event | Description |
| --- | --- |
| `change` | Bubbles up from the changed button; detail: { selected: boolean, value: string } |

### `<nldd-token-field>`

A multi-select input that looks like a normal input field: chosen values show as dismissible tokens in a wrapping row, followed by an inline text input that stretches to fill the remaining space and wraps to a new line (growing the field) when it no longer fits. Options are supplied as a slotted nldd-menu, exactly like nldd-combo-box; the menu filters as you type, with a chevron picker button, arrow-key roving across the tokens and ElementInternals form participation.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `values` | `string` | Initial token values as a comma-separated string (e.g. "nl, be, de"). Not reflected; the live value is the `.values` array property. Values can't contain commas. |
| `placeholder` | `string` | Placeholder shown in the input |
| `type` | `string` | Input type forwarded to the inner input (e.g. 'email') |
| `autocomplete` | `string` | Autocomplete hint forwarded to the inner input |
| `accessible-label` | `string` | Accessible label forwarded as aria-label to the input |
| `allow-custom` | `boolean` | Allow free-typed values (not just menu options) |
| `valid` | `boolean` | Marks the field valid (shows the valid icon) |
| `invalid` | `boolean` | Marks the field invalid (shows the invalid icon) |
| `no-spellcheck` | `boolean` | Disables browser spellchecking on the inner input |
| `readonly` | `boolean` | Readonly: static tokens, no input/picker, read-only surface |
| `required` | `boolean` | Marks the field required (invalid when it has no tokens) |
| `disabled` | `boolean` | Disabled state |
| `token-control` | `string` | Trailing control per token: 'dismiss' (default, a ✕ that removes it) or 'menu' (a ⌄ opening a per-token action menu supplied by the template prototypes) |
| `name` | `string` | Name for form submission |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | An nldd-menu with nldd-menu-item options; each item's `value`/`text` supplies a token's value and its display label. |
| `template` | `nldd-token` prototypes supplying each token's action menu when token-control="menu": a keyless one is the shared default, a `data-value="X"` one overrides value X. Only the prototype's nested `nldd-menu` is used today; its other props are ignored. |

**Events**

| Event | Description |
| --- | --- |
| `change` | When the selected values change; detail: { values: string[] } |
| `input` | When the input text changes; detail: { value: string } |
| `token-action` | When a token's menu action is chosen (token-control="menu"); detail: { value: string, action: string } |

## Layout

### `<nldd-app-view>`

The required root shell of a Nederlandse Digitale Dienst application. Always contains a split view or an nldd-page as direct content. Set background="tinted" to give the whole application a tinted background. All descendants read --context-parent-background-color via --_background-color automatically. Individual components can override locally with their own background attribute. The same background color is forced on `document.body` so that browser- chrome surfaces (iOS overscroll bounce, status bar, page-margin areas) blend with the app instead of revealing the user-agent's default white. Cleared when the app-view disconnects. The app scrolls the DOCUMENT (root mode) or lets each `nldd-page` scroll inside its pane (nested mode). The mode is derived from the outermost horizontal split view: one column means the document scrolls, several columns mean the panes do. An app without such a split view is a single column at every width and therefore scrolls the document too — nested scrolling would cost it the rubber-band and the collapsing browser toolbar on iOS for nothing. Set `--context-scroll-mode` on the `nldd-app-view` itself to override the derived mode; an inherited value loses from it. In nested scroll mode `overscroll-behavior: none` is set on `document.documentElement` and `document.body` while the app-view is connected. Combined with `overscroll-behavior: contain` on `nldd-page`'s scroll target, this prevents iOS rubber-band on the viewport when scroll gestures land outside an `nldd-page` (e.g. on a top-bar). In root scroll mode the document itself is the scroller, so this is lifted to let the native rubber-band happen. Cleared on last disconnect.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'base'\|'tinted'` | Background color (cascades to descendants) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for the application content |

### `<nldd-bar-split-view>`

A vertical split view with a main area and an unlimited number of bar panels. Each child determines its order per breakpoint via sm-order, md-order, and lg-order. Children without order attributes are sorted by DOM order. All bars are in normal flow at every breakpoint and stack vertically. A divider is drawn only where the main pane meets an adjacent bar — directly above and/or below main — at every breakpoint (including sm). Two stacked bars on the same side never get a divider between them, so a toolbar and a tab-bar read as one visual unit. Consumers never manage dividers themselves. Give each bar a unique slot name (e.g. slot="toolbar", slot="status-bar"). Use slot="bar-1", slot="bar-2" if no meaningful name applies. The main panel always uses slot="main". Sets --context-parent-background-color, which cascades to all descendants.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Background color variant (default: inherit) |
| `above` | `'sm'\|'md'\|'lg'` | Show this panel from this breakpoint and larger |
| `below` | `'sm'\|'md'\|'lg'` | Show this panel up to and including this breakpoint |
| `only` | `'sm'\|'md'\|'lg'` | Show this panel only at this breakpoint |

**Slots**

| Slot | Description |
| --- | --- |
| `main` | Central panel for primary content |
| `*` | Any other unique slot name creates a bar panel |

### `<nldd-box>`

Use a box to visually group related components in a distinct, contained region. Boxes draw attention to a set of controls or content that belong together, helping users understand their relationship at a glance.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'tinted'\|'base'\|'critical'` | Which surface this box draws, named as it is on nldd-app-view, nldd-page, nldd-split-view-pane and nldd-card. It starts tinted where a card starts base: a box is there to stand out from the page, a card to sit on it. - `tinted` (default): a box on a plain page background. - `base`: a box on an already-tinted parent (the border ring gets +2 palette steps so it still reads against a card-on-card). - `critical`: a region whose actions are destructive or irreversible (a "danger zone"), tinted and outlined in critical. It carries no ARIA of its own: unlike nldd-banner this is not an announcement but a permanent part of the page, so the heading and the button labels have to name the danger — color is a reinforcement, never the only signal (WCAG 1.4.1). The box draws the surface and nothing else: it has no padding of its own, the same way nldd-card has none. Put an nldd-container inside it and let that set the inset, so one component owns spacing wherever it is used. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Place components inside the box, usually wrapped in an nldd-container that carries the padding |

### `<nldd-card>`

A visually bounded card with optional header, body and footer sections. The card is elevated by default. Padding is left to nested containers. With `href` the whole card becomes a link (an overlay anchor across the card), with `button` a button (an overlay button that fires a plain, composed `click`, so a click listener or htmx attribute on the card itself works directly, and Enter/Space work natively). `href` wins when both are set. Nested interactive content, footer buttons for instance, has to be lifted above it with `position: relative; z-index: 1` to stay clickable.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'base'\|'tinted'` | Surface color of the card: `base` (default) on a plain page background, `tinted` when the card should stand out against a base surface |
| `accessible-label` | `string` | Accessible name of the card; with `href`/`button` it names the link or button, otherwise the card region |
| `href` | `string` | Makes the whole card a link to this URL (empty = no link) |
| `button` | `boolean` | Makes the whole card a button; ignored when `href` is set |
| `target` | `string` | Link target for href (e.g. '_blank'); adjusts rel automatically and adds an "Opent in nieuw tabblad" announcement for '_blank' |
| `rel` | `string` | Link rel for href; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `translations` | `object` | Override translation keys (e.g. the "Opent in nieuw tabblad" announcement) |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Header content (e.g. nldd-title) |
| _(default)_ | Body content |
| `footer` | Footer content (e.g. nldd-button-group), always at the bottom |

### `<nldd-collection>`

A container for displaying collections of items. Supports grid, stack, lanes and horizontal scroll layouts. In grid and stack modes, items are paginated via a load-more button. In horizontal scroll, the prev/next controls and the edge fade appear only when the items overflow the container. With `lazy-load`, the next items are automatically loaded when the load-more button comes into view.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `layout` | `string` | Layout mode: 'grid' \| 'stack' \| 'lanes' \| 'horizontal-scroll' (default: 'grid') |
| `show-load-more` | `boolean` | Show load-more button in grid/stack (default: false) |
| `max-items` | `number` | Number of visible items per page (default: 24) |
| `lazy-load` | `boolean` | Automatically load more items when the button becomes visible |
| `item-width` | `string` | Preferred width for each item (e.g. '280px', '20rem'). In grid and lanes layouts used as the minimum column width (columns will be at least this wide; 1fr if container allows more). In horizontal scroll used as flex-basis. Never forces horizontal overflow — the value is clamped to container width. |
| `gap` | `string` | Gap between items, as a step of the spacing scale ('0', '2', '4', '6', '8', '10', '12', '16', '20', '24', '28', '32', '40', '44', '48', '56', '64', '80', '96'). Overrides the responsive default at every breakpoint; unset keeps the default. |
| `sm-gap` | `string` | Gap at sm, overriding `gap` there |
| `md-gap` | `string` | Gap at md, overriding `gap` there |
| `lg-gap` | `string` | Gap at lg, overriding `gap` there |
| `translations` | `object` | Translation overrides; unset keys fall back to Dutch. Available keys: 'components.collection.previous-action', 'components.collection.next-action', 'components.collection.load-more-action' |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for collection items |
| `footer` | Slot for custom footer content |

**Events**

| Event | Description |
| --- | --- |
| `load-more` | When the load-more button is clicked |

### `<nldd-container>`

A simple layout primitive: pick a layout mode, give it a gap, optionally align contents, and add padding. Padding can be set for all sides, per axis (inline/block), or per individual side. Specificity: per side > per axis > all sides. Responsive padding and gap have sm/md/lg variants. Each variant emits both an @media (viewport) and @container (layout-container) query. When inside a layout-container the @container query wins; otherwise the @media query provides the viewport-based fallback. Layout modes: - `stack` (default): block items, stacked vertically. The "what you expect from DOM flow" mode. - `row`: flex row, no wrapping. Items shrink or overflow. - `wrap`: flex row, items wrap to new lines. - `grid`: CSS grid, auto-fit columns at min 280px wide. - `columns`: CSS multi-column flow, 280px minimum column width, items don't split across column breaks. Alignment maps to the layout's natural axis: - `stack`: vertical = main-axis (justify-content), horizontal = cross-axis (align-items) - `row` / `wrap`: horizontal = main-axis, vertical = cross-axis - `grid`: horizontal = justify-items, vertical = align-items (per cell) - `columns`: alignment props have no effect (CSS multicol doesn't expose alignment) Item order is set per-child via attributes on the slotted children themselves: `<child order="3">` for a fixed position, or `<child sm-order="N">` / `<child md-order="N">` / `<child lg-order="N">` to override per breakpoint (resolved against THIS container's width via @container queries, same scope as the responsive padding/gap). The container observes slot changes and child attribute mutations and bridges these to `--_slot-order` / `--_slot-sm-order` / etc. custom properties on each child's inline style, which the container's CSS then reads via `::slotted(*)` inside @container queries. Cascade: `sm-order` falls back to `order` falls back to `0` at sm (and analogously for md/lg). No-op for `layout="columns"` (CSS multicol has no per-item ordering hook). The `column-count` attribute (1-8) forces an exact column count for `layout="grid"` (overrides auto-fit) and `layout="columns"` (overrides the natural width-driven count). `sm-column-count` / `md-column-count` / `lg-column-count` resolve against this container's OWN width via an `@container (...)` query on the host — not against the viewport. That lets a footer in a narrow sidebar choose its own column count independent of the surrounding page width. `layout="lanes"` packs items into balanced columns using native CSS grid lanes where supported, falling back to CSS multicol (column-order) elsewhere. CSS-only, no JS. Honours `gap` on both axes and `column-count`. Note that nldd-collection's lanes falls back to its own grid rather than to multicol: that component pages, and multicol redistributes the whole set every time load-more adds to it.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `layout` | `string` | 'stack' \| 'row' \| 'wrap' \| 'grid' \| 'columns' \| 'lanes' (default: 'stack') |
| `column-count` | `number` | Force N columns (1-8) for layout=grid/columns/lanes |
| `sm-column-count` | `number` | Column count when this container is sm-wide |
| `md-column-count` | `number` | Column count when this container is md-wide |
| `lg-column-count` | `number` | Column count when this container is lg-wide |
| `gap` | `string` | Gap between children |
| `sm-gap` | `string` | Gap at sm breakpoint |
| `md-gap` | `string` | Gap at md breakpoint |
| `lg-gap` | `string` | Gap at lg breakpoint |
| `width` | `string` | 'full' (default, fills the parent) \| 'fit-content' \| a CSS length (e.g. '480px'). A container narrower than its parent stays where its parent puts it; use the parent's horizontal-alignment to move it. |
| `min-width` | `string` | Minimum width as a CSS length (e.g. '280px') |
| `max-width` | `string` | Maximum width as a CSS length (e.g. '480px') |
| `horizontal-alignment` | `string` | 'left' \| 'center' \| 'right' |
| `vertical-alignment` | `string` | 'top' \| 'center' \| 'bottom' |
| `padding` | `string` | Padding for all sides |
| `padding-inline` | `string` | Padding for left and right |
| `padding-block` | `string` | Padding for top and bottom |
| `padding-top` | `string` | Padding top |
| `padding-right` | `string` | Padding right |
| `padding-bottom` | `string` | Padding bottom |
| `padding-left` | `string` | Padding left Breakpoints for the sm/md/lg padding attributes below: sm is up to 640px, md is 641px to 1007px, lg is 1008px and up. Each is emitted as both an |
| `sm-padding` | `string` | Padding for all sides at sm |
| `sm-padding-inline` | `string` | Padding left and right at sm |
| `sm-padding-block` | `string` | Padding top and bottom at sm |
| `sm-padding-top` | `string` | Padding top at sm |
| `sm-padding-right` | `string` | Padding right at sm |
| `sm-padding-bottom` | `string` | Padding bottom at sm |
| `sm-padding-left` | `string` | Padding left at sm |
| `md-padding` | `string` | Padding for all sides at md |
| `md-padding-inline` | `string` | Padding left and right at md |
| `md-padding-block` | `string` | Padding top and bottom at md |
| `md-padding-top` | `string` | Padding top at md |
| `md-padding-right` | `string` | Padding right at md |
| `md-padding-bottom` | `string` | Padding bottom at md |
| `md-padding-left` | `string` | Padding left at md |
| `lg-padding` | `string` | Padding for all sides at lg |
| `lg-padding-inline` | `string` | Padding left and right at lg |
| `lg-padding-block` | `string` | Padding top and bottom at lg |
| `lg-padding-top` | `string` | Padding top at lg |
| `lg-padding-right` | `string` | Padding right at lg |
| `lg-padding-bottom` | `string` | Padding bottom at lg |
| `lg-padding-left` | `string` | Padding left at lg |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Container content |

### `<nldd-divider>`

A rule that visually separates sections of content.

### `<nldd-full-bleed-section>`

A section that spans the full width without horizontal padding. Useful for background colors, images, or other content that runs edge to edge. Vertical padding and gap adjust via container queries.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface). |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme). |
| `width` | `string` | Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width. |
| `height` | `string` | Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width). |
| `padding-block` | `string` | Block (top and bottom) padding override (token 0-96; '0' strips it). |
| `padding-top` | `string` | Top padding override. |
| `padding-bottom` | `string` | Bottom padding override. |
| `sm-padding-block` | `string` | Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}). |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Content above the main content |
| _(default)_ | Main content |
| `footer` | Content below the main content |

### `<nldd-hero>`

A page header with a media area and a text panel (the main) that can stand in six positions. Every area is rectangular. With `main-width="full"` the media area sits as its own strip above or below the panel rather than behind it. On mobile the media always stacks above the full-width panel. Without media the main fills the whole area; with `main-background="base"` that area gets a border so it stays visible on the base surface. `main-background` gives the panel a surface color from the filled categories. Those carry a pure white or black content color along, so components with `color="inherit"` (title, rich-text) are guaranteed to keep their contrast.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `main-position` | `'top-left'\|'top-right'\|'bottom-left'\|'bottom-right'\|'left'\|'right'` | Position of the text panel (default: 'bottom-left'); 'left'/'right' span the full height |
| `main-width` | `'1/2'\|'2/3'\|'3/4'\|'full'` | Width of the panel (default: '1/2'); 'full' makes a full top or bottom strip and is ignored with 'left'/'right' |
| `main-background` | `string` | Surface color of the panel: 'base' (the base surface) or a category color — 'accent' (default) or a Rijkshuisstijl color such as 'lintblauw'\|'donkerblauw'\|'oranje' |
| `media-aspect-ratio` | `string` | Aspect ratio of the media area (CSS form, '16/9' or '16:9'); default '21/9'. On md/lg it sets the height of the hero, on sm the height of the media area |
| `media-src` | `string` | Source of the media area (an alternative to the media slot); ignored as soon as the media slot is filled |
| `media-srcset` | `string` | Responsive source set for media-src |
| `media-sizes` | `string` | Source sizes hint for media-src |
| `media-alt` | `string` | Alt text for media-src; empty means decorative |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface behind the hero (section API) |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme (section API) |
| `width` | `string` | Body max-width; 'full' removes the bound (section API) |
| `height` | `string` | Minimum height of the section (section API) |
| `padding-block` | `string` | Block padding override, also per edge and responsive (section API) |

**Slots**

| Slot | Description |
| --- | --- |
| `media` | Image or illustration (img or nldd-image); fills the area and is clipped. Takes precedence over the media-src attributes. Set `alt=""` when the image is decorative; otherwise give a describing alt text. |
| _(default)_ | Content of the text panel (nldd-title and nldd-rich-text with color="inherit", for instance) |

### `<nldd-navigation-split-view>`

A four-column layout with a primary sidebar, secondary sidebar, main content area, and inspector. The sidebars show navigation or lists, the main area shows primary content, and the inspector shows additional details or properties of the selection. Panes are shown automatically when content is slotted into them.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `inspector-auto-hidden` | `boolean` | Inspector hidden to free up space for other panes (read-only, set by the split view) |
| `inspector-as-sheet` | `boolean` | Always show the inspector as a sheet regardless of available space |
| `primary-sidebar-as-sheet` | `boolean` | Always show the primary sidebar as a sheet, keeping main visible at full width |
| `inspector-accessible-label` | `string` | Accessible name for the inspector sheet dialog (default: 'Details') |
| `primary-sidebar-accessible-label` | `string` | Accessible name for the primary sidebar sheet dialog (default: 'Navigatie') |
| `sidebar-as-sheet` | `boolean` | @deprecated alias for primary-sidebar-as-sheet (kept for backwards compatibility) |
| `sidebar-accessible-label` | `string` | @deprecated alias for primary-sidebar-accessible-label (kept for backwards compatibility) |

**Slots**

| Slot | Description |
| --- | --- |
| `primary-sidebar` | Left pane for primary navigation |
| `secondary-sidebar` | Second pane for secondary navigation (shown when slotted) |
| `main` | Center pane for primary content |
| `inspector` | Right pane for details or properties |
| `sidebar` | @deprecated alias for the primary-sidebar slot (kept for backwards compatibility) |

### `<nldd-one-half-one-half-section>`

A section with two equal columns side by side. The columns wrap automatically when they become smaller than 280px. Padding and gap adjust via container queries.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface). |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme). |
| `width` | `string` | Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width. |
| `height` | `string` | Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width). |
| `padding-block` | `string` | Block (top and bottom) padding override (token 0-96; '0' strips it). |
| `padding-top` | `string` | Top padding override. |
| `padding-bottom` | `string` | Bottom padding override. |
| `sm-padding-block` | `string` | Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}). |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Content above the columns |
| _(default)_ | Left column (1/2), alternative for slot="left" |
| `left` | Left column (1/2) |
| `right` | Right column (1/2) |
| `footer` | Content below the columns |

### `<nldd-one-third-two-thirds-section>`

A section with a 1/3 sidebar on the left and 2/3 main content on the right. The columns wrap automatically when they become smaller than 280px. Padding and gap adjust via container queries.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface). |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme). |
| `width` | `string` | Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width. |
| `height` | `string` | Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width). |
| `padding-block` | `string` | Block (top and bottom) padding override (token 0-96; '0' strips it). |
| `padding-top` | `string` | Top padding override. |
| `padding-bottom` | `string` | Bottom padding override. |
| `sm-padding-block` | `string` | Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}). |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Content above the columns |
| `left` | Left column (1/3) |
| _(default)_ | Right column (2/3), alternative for slot="right" |
| `right` | Right column (2/3) |
| `footer` | Content below the columns |

### `<nldd-page>`

A page layout with optional sticky header and footer. Without sticky-header, the host is the scroll container and the header is in normal flow. With sticky-header, the header becomes absolute and .page__scroll takes over scrolling, padded by the measured header height. That padding freezes once you scroll, so a collapsing bar cannot drag the content up under the cursor. In root-scroll mode (--context-scroll-mode: root, derived upstream by nldd-app-view) the page stops owning a scroller: the document scrolls and the sticky header/footer stick against the document, offset by --context-inset-top/bottom. The mode is read on connect/resize and reflected to [data-scroll] so the CSS can branch. The page passes those insets on to its own content, with its sticky header and footer added: anything sticky inside (an nldd-sidebar-section, a sticky table head) reads --context-inset-top / --context-inset-bottom and clears every bar above and below it without being told a number. The heights are measured, because a top title bar shrinks as you scroll past its anchor. While the page owns the scroller, only its own bars count: the chrome above the page sits outside that scroller and does not push sticky content down.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `sticky-header` | `boolean` | Sticky header |
| `sticky-footer` | `boolean` | Sticky footer |
| `background` | `'inherit'\|'base'\|'tinted'` | Use a gray background instead of white |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Header content |
| _(default)_ | Main content (scrollable) |
| `footer` | Footer content |

### `<nldd-page-footer>`

The footer band at the bottom of a page. Hosts three optional rows in a fixed order: breadcrumbs (top), consumer-defined main content (middle), and a legal-bar (bottom). Dividers are drawn automatically between non-empty rows. Establishes its own container query (`page-footer-container`) so the responsive padding and gap react to the footer's own width, not the viewport. The host has `id="page-footer"` so a skip-link can target it directly. Use the sub-components `nldd-page-footer-legal-bar` and `nldd-page-footer-legal-bar-item` for the bottom row.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `width` | `string` | Body max-width, mirroring a page section: 'full' removes the constraint so the content spans the full width; any CSS length (e.g. '480px') overrides the default max-width. |

**Slots**

| Slot | Description |
| --- | --- |
| `breadcrumbs` | `nldd-breadcrumbs` for the top row. |
| _(default)_ | Main footer content (typically a container with a grid of link columns). |
| `legal-bar` | `nldd-page-footer-legal-bar` for the bottom row. |

### `<nldd-page-footer-legal-bar>`

Holds the legal links row at the bottom of a `nldd-page-footer`. Items in `start` render flush-left, items in `end` flush-right, separated by spacing only (no separators). On narrow containers the two groups wrap to their own rows with `start` above `end`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `accessible-label` | `string` | Override the nav's aria-label. Defaults to the i18n value (NL: "Juridische links"). |
| `translations` | `object` | Override translation keys; unset keys fall back to the Dutch default. |

**Slots**

| Slot | Description |
| --- | --- |
| `start` | Items rendered flush-left (e.g. © notice, version). |
| `end` | Items rendered flush-right (e.g. privacy, accessibility). |

### `<nldd-page-footer-legal-bar-item>`

A single entry in an `nldd-page-footer-legal-bar`. Renders as a link when `href` is set, as plain text otherwise. Uses the content color (not the link color) so the legal bar reads as a subdued utility row.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `href` | `string` | Link target. When omitted, the item renders as plain text. |
| `text` | `string` | Item label. Falls back to the default slot. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Item label (alternative to `text`). |

### `<nldd-popover>`

A non-modal floating panel anchored to a trigger element. Built on the native Popover API (popover="auto") with Floating UI for positioning. The browser handles opening, toggling and light dismiss; this component only handles positioning and focus. The recommended use is through popovertarget, so the browser owns the toggle: <nldd-button id="info-trigger" popovertarget="info-popover">Info</nldd-button> <nldd-popover id="info-popover" anchor="info-trigger" accessible-label="Info"> <nldd-container> <p>Content of the popover.</p> </nldd-container> </nldd-popover> For a custom focus target inside the popover, put `autofocus` on the child you want. Without it the popover host itself takes focus.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `anchor` | `string` | ID of the trigger element, used for positioning |
| `placement` | `string` | Floating UI placement (default: 'bottom-start') |
| `width` | `string` | Width as a CSS length (default: 320px through --components-popover-default-width). A content-based size (`fit-content`, `min-content`, `max-content`, `auto`) is refused: the popover is an inline-size container so slotted components can adapt to it, and its width cannot then come from that same content. Such a value is ignored, with a warning in DEV. |
| `top` | `string` | CSS top position. When set (on its own, or together with other edge attributes or `centered`) Floating UI's anchor positioning is skipped and the popover stands free on the screen. The `anchor` is still needed for the ARIA link on the trigger. No effect on sm, where the bottom sheet wins. |
| `left` | `string` | CSS left position. See `top` for the semantics. |
| `right` | `string` | CSS right position. See `top` for the semantics. |
| `bottom` | `string` | CSS bottom position. See `top` for the semantics. |
| `centered` | `boolean` | Centers both axes on the viewport. Overridable per axis: `centered top="0"` is centered horizontally, aligned to the top. Mirrors CSS `place-items: center` with `align-items`/`justify-items` overrides. |
| `sm-full-height` | `boolean` | On an sm viewport (where the popover renders as a bottom sheet) fills the whole available height instead of shrinking to its content. No effect on md and up (anchored mode). Opt-in for content-heavy cases such as search results or long detail views; content-sized is the default, following the Apple and Material convention. |
| `accessible-label` | `string` | (required) Accessible name (aria-label). Falls back to the i18n default ('Popover') when unset — always give a unique, describing name. |
| `role` | `string` | ARIA role (default: 'dialog'). For informational content (a tooltip callout, a rich-text help panel) without a dialog interaction pattern, set `role="region"`. For menu-style triggers, `role="menu"` plus `aria-haspopup="menu"` on the anchor. The popover never overwrites a role that was set explicitly. |
| `translations` | `object` | Override translation keys; unset keys fall back to the Dutch default. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Free content (an nldd-container with a form or info, for instance) |

**Events**

| Event | Description |
| --- | --- |
| `open` | When the popover opens |
| `close` | When the popover closes. Does not bubble: overlays nest, and a listener on the sheet or window around this one should not hear it close. |

### `<nldd-sheet>`

An overlay component that slides in from the side or bottom of the screen. Based on the native <dialog> element for built-in accessibility, focus management, and Escape key support. On small (sm) viewports the sheet always renders as a bottom sheet, regardless of the configured placement. Render the sheet at the document root (teleport/portal it to `document.body`), never inside a split view's content flow: as a slotted flex child it would steal pane height (see `nldd-split-view-pane`).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `placement` | `string` | Sheet position: 'left' \| 'right' \| 'bottom' (default: 'right') |
| `height` | `string` | Custom height for bottom sheets (and for any sheet on sm viewports, where all placements collapse to bottom). Accepts: `'full'` (default — viewport minus top-inset, identical to omitting the attribute), `'fit-content'` (collapse to content size), or any CSS length/percentage (e.g. `'50dvh'`, `'480px'`, `'50%'`). Always clamped to `100dvh - top-inset` so the sheet can't extend past the dismiss-tap area. No effect on side sheets at md+. |
| `accessible-label` | `string` | Accessible name for the dialog, forwarded as aria-label (default: 'Venster') |
| `width` | `string` | Custom width for side sheets (left/right) as a CSS length (e.g. '480px', '32rem'). Applied from the md breakpoint up; ignored on sm (bottom sheet) and for `placement="bottom"`. Clamped to `100vw - 2 * inset` so the sheet always fits. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Sheet content |

**Events**

| Event | Description |
| --- | --- |
| `open` | Fired when the sheet is opened |
| `close` | Fired when the sheet is fully closed. Does not bubble: overlays nest, and a listener on one sheet asking about that sheet should not also hear the form it opened. |

### `<nldd-side-by-side-split-view>`

A horizontal split view with multiple equal panes side by side. The number of panes is set via the `panes` attribute. Each pane automatically gets a numbered slot: pane-1, pane-2, etc. Panes that do not fit the available width are automatically hidden.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Use a tinted background color (cascades to descendants) |
| `panes` | `number` | Number of panes (default: 2) |

**Slots**

| Slot | Description |
| --- | --- |
| `pane-1` | First pane |
| `pane-2` | Second pane |
| `pane-n` | Each subsequent pane based on the `panes` attribute |

### `<nldd-sidebar-section>`

A page section with a left sidebar alongside the main content. - **Wide (section >= 1008px):** two columns. The sidebar is a sticky, scrollable tinted box (max-width 320px) beside the main content. Its sticky top/bottom insets default to 16px; override with `sticky-top` / `sticky-bottom` so it clears other sticky page elements (e.g. a sticky header). - **Narrow (section < 1008px):** the sidebar collapses behind a sheet (a left panel on md+ viewports, a bottom sheet on mobile), and the host reflects a `collapsed` attribute. The consumer owns the trigger: place any chrome (a button, a chosen-filters bar, …) wherever you want, show it only while collapsed (e.g. `nldd-sidebar-section[collapsed] .my-trigger { … }` or by reading `collapsed` / listening to `collapse-change`), and call `show()` / `toggle()` to open the sheet. Bind `aria-expanded` via the `open`/`close` events. The sheet gets a sticky title bar by default — the `sidebar-label` as title plus a "Sluit" button — overridable via the `sheet-top-title-bar` slot. The sidebar content lives in `slot="sidebar"`. Its slot outlet moves between the box (expanded) and the sheet (collapsed) so there is a single, never-duplicated copy — the light DOM (and its state) is preserved across the switch. The box <-> sheet switch follows the section's OWN width (a ResizeObserver on the host), not the viewport — so a sidebar-section in a narrow column or a split-view pane collapses to the sheet just like one in a narrow viewport, and the sidebar never stacks above or crowds the main. Set `no-collapse` to opt out: a narrow section then stacks the sidebar (full-width) above the main instead of using a sheet. Inherits block `padding` and `height` from PageSectionMixin.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `collapsed` | `boolean` | Read-only, reflected: true while the sidebar is a sheet (the section is narrower than lg). Target it via CSS to reveal sheet-only chrome. |
| `no-collapse` | `boolean` | Opt out of the sheet: a narrow section stacks the sidebar above the main instead of collapsing. `collapsed` then stays false. |
| `width` | `string` | Body max-width: 'full' removes the constraint; any CSS length overrides the default. |
| `sticky-top` | `string` | Sticky top inset on lg (CSS length; default = 16px). |
| `sticky-bottom` | `string` | Sticky bottom inset on lg (CSS length; default = 16px). |
| `sidebar-label` | `string` | Accessible name for the sidebar (the aside landmark on lg and the sheet on sm/md). Default 'Zijbalk'. |
| `translations` | `object` | Override translation keys (sheet title fallback, dismiss label); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Main content |
| `sidebar` | Sidebar content (sticky box when expanded, a left/bottom sheet when collapsed). The box and the sheet add no padding of their own — wrap the content in a padded container (e.g. nldd-container) for inset spacing. |
| `sheet-top-title-bar` | Replaces the sheet's default title bar (when collapsed). Empty falls back to an `nldd-top-title-bar` with the `sidebar-label` as title and a "Sluit" button. |
| `header` | Content above the columns |
| `footer` | Content below the columns |

**Events**

| Event | Description |
| --- | --- |
| `open` | The sidebar sheet opened. |
| `close` | The sidebar sheet closed. |
| `collapse-change` | The collapsed state flipped because the section's width crossed the lg breakpoint; `{ collapsed }`. |

### `<nldd-simple-section>`

A basic section with responsive padding and gap based on container size. Contains optional header and footer slots. The padding and spacing between slots adjust automatically via container queries.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface). |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme). |
| `width` | `string` | Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width. |
| `horizontal-alignment` | `'left'\|'center'\|'right'` | Where the body's children sit across the body ('left' default). Use it to place something narrower than the body, such as a container with a max-width. |
| `vertical-alignment` | `'top'\|'center'\|'bottom'` | Where the body's children sit down the section ('top' default). Only visible when the section is taller than its content. |
| `height` | `string` | Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width). |
| `padding-block` | `string` | Block (top and bottom) padding override (token 0-96; '0' strips it). |
| `padding-top` | `string` | Top padding override. |
| `padding-bottom` | `string` | Bottom padding override. |
| `sm-padding-block` | `string` | Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}). |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Content above the main content |
| _(default)_ | Main content |
| `footer` | Content below the main content |

### `<nldd-spacer>`

Add explicit space between elements. Components here have no margins of their own — all whitespace is set by a spacer. Use a single `size` attribute for whitespace that's the same at every viewport. Combine with `sm-size`, `md-size` and/or `lg-size` to override the size at specific breakpoints (mobile-first cascade is intentionally avoided — each breakpoint that needs a different value declares it explicitly): - `size` applies at every breakpoint that has no per-viewport override. - `sm-size` overrides at sm (max-width: 640px). - `md-size` overrides at md (641px–1007px). - `lg-size` overrides at lg (min-width: 1008px). Use `flexible` (in any of the four attributes) to fill the remaining space in a flex container.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Base spacer size. 'flexible' or one of the fixed tokens (2–96). Default: '16'. |
| `sm-size` | `string` | Spacer size at sm breakpoint (max-width: 640px). |
| `md-size` | `string` | Spacer size at md breakpoint (641px–1007px). |
| `lg-size` | `string` | Spacer size at lg breakpoint (min-width: 1008px). |
| `direction` | `string` | Direction: 'horizontal' \| 'vertical' \| 'both' (default: 'both') |

### `<nldd-split-view-divider>`

A divider line between panels in a split view. The divider runs from edge to edge in the direction perpendicular to the orientation. An optional drag handle indicates that the divider is draggable (future functionality).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `orientation` | `string` | Orientation: 'vertical' \| 'horizontal' |
| `has-drag-handle` | `boolean` | Show a drag handle |

### `<nldd-split-view-pane>`

A simple pane container for use inside split views. The split view automatically sets context: whether a back button should be shown. The consumer sets `has-content` to indicate the pane has content. The consumer sets `back-text` on the `nldd-top-title-bar` inside the pane. The split view sets `hide-back` when the back button is not applicable. The pane automatically hides the back button via CSS when `hide-back` is active. The pane sets `--context-parent-background-color` which cascades down to all descendants. Set `background="tinted"` on a pane to give it a tinted background independently of sibling panes. Descendants such as `nldd-page` read `--context-parent-background-color` automatically. A pane stretches its slotted content to fill it (`::slotted(*) { flex-grow: 1 }`), so slot only layout content here. Overlays (`nldd-sheet`, popovers, dialogs, menus) belong at the document root — teleport/portal them to `document.body`. Do not leave an overlay as a light-DOM sibling of a split view: it gets slotted into the main pane and becomes an extra flex-grow child that steals pane height, so in document-scroll (root) mode a short page's sticky footer floats mid-screen instead of docking.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `has-content` | `boolean` | The pane has content (default: false) |
| `hide-back` | `boolean` | Hide the back button (set automatically by the split view) |
| `background` | `'inherit'\|'base'\|'tinted'` | Use a tinted background color (cascades to descendants) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Pane content |

### `<nldd-stacked-split-view>`

A vertical split view with multiple stacked panes. The number of panes is set via the `panes` attribute. Each pane automatically gets a numbered slot: pane-1, pane-2, etc. Panes that do not fit the available height are automatically hidden.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Use a tinted background color (cascades to descendants) |
| `panes` | `number` | Number of panes (default: 2) |

**Slots**

| Slot | Description |
| --- | --- |
| `pane-1` | First pane |
| `pane-2` | Second pane |
| `pane-n` | Each subsequent pane based on the `panes` attribute |

### `<nldd-two-thirds-one-third-section>`

A section with 2/3 main content on the left and a 1/3 sidebar on the right. The columns wrap automatically when they become smaller than 280px. Padding and gap adjust via container queries.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'inherit'\|'base'\|'tinted'` | Surface background ('inherit' default; 'base'/'tinted' paint and cascade a surface). |
| `scheme` | `'inherit'\|'light'\|'dark'\|'inverted'` | Color scheme ('inherit' default; 'inverted' = opposite of the surrounding page scheme). |
| `width` | `string` | Body max-width: 'full' removes the constraint so the section spans the full available width. Any CSS length (e.g. '480px') overrides the default max-width. |
| `height` | `string` | Minimum section height (any CSS length, e.g. '400px', '100dvh') (mirrors width, which sets the body max-width). |
| `padding-block` | `string` | Block (top and bottom) padding override (token 0-96; '0' strips it). |
| `padding-top` | `string` | Top padding override. |
| `padding-bottom` | `string` | Bottom padding override. |
| `sm-padding-block` | `string` | Responsive block padding (sm/md/lg, also per edge: {sm,md,lg}-padding-{top,bottom}). |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | Content above the columns |
| _(default)_ | Left column (2/3), alternative for slot="left" |
| `left` | Left column (2/3) |
| `right` | Right column (1/3) |
| `footer` | Content below the columns |

### `<nldd-window>`

A floating window based on the native <dialog> element, positionable through CSS values. Always modal. No header of its own: consumers use nldd-page with a sticky header inside for a title bar.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `no-light-dismiss` | `boolean` | A click on the backdrop does not close the window. For windows where dismissing by accident costs work: a wizard, a form with filled-in fields. Escape and the dismiss button keep working. |
| `accessible-label` | `string` | (required) Accessible name (aria-label). Falls back to the i18n default ('Venster') when unset. Always pass a unique, descriptive name per window. |
| `translations` | `object` | Override translation keys; unset keys fall back to the Dutch default. |
| `top` | `string` | CSS top position of the top edge (e.g. '0', '100px') |
| `left` | `string` | CSS left position of the left edge |
| `right` | `string` | CSS right value |
| `bottom` | `string` | CSS bottom value |
| `centered` | `boolean` | Centers both axes on the viewport. Overridable per axis: `centered top="0"` is horizontally centered, top aligned. Mirrors CSS `place-items: center` with `align-items`/`justify-items` overrides. |
| `width` | `string` | CSS width (default: var(--components-window-default-width)) |
| `height` | `string` | CSS height (default: content height) |
| `scheme` | `'inherit'\|'light'\|'dark'` | Color scheme (default 'inherit'). |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Complete window content (e.g. nldd-page) |

**Events**

| Event | Description |
| --- | --- |
| `open` | When the window opens |
| `close` | When the window has fully closed. Does not bubble: overlays can sit inside each other, and a listener on one window should not also hear the form that opened it. |

## Navigation

### `<nldd-breadcrumbs>`

A trail of `nldd-breadcrumbs-item`s separated by `›`, rendered as a `<nav>` landmark wrapping a `<div role="list">` (with each item carrying `role="listitem"`). Explicit ARIA roles travel reliably across the slot boundary where the implicit `<ol>`/`<li>` mapping is inconsistent across AT + browser combos. The trail wraps onto multiple lines when it doesn't fit, so it adapts to any width.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `accessible-label` | `string` | Override the nav's aria-label. Defaults to the i18n value (NL: "Kruimelpad"). |
| `translations` | `object` | Override translation keys; unset keys fall back to the Dutch default. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | `nldd-breadcrumbs-item` children. |

### `<nldd-breadcrumbs-item>`

A single entry in an `nldd-breadcrumbs` list. Renders as a link when `href` is set, as plain text marked `aria-current="page"` when `current` is set, and as plain text otherwise. Each item renders its own trailing `›` separator; the last item in the list hides it via `:host(:last-of-type)`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `href` | `string` | Link target. Ignored when `current` is set. |
| `current` | `boolean` | Marks this item as the current page (renders as plain text + `aria-current="page"`). Typical use is on the last item. |
| `text` | `string` | Item label. Falls back to the default slot. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Item label (alternative to `text`). |

### `<nldd-document-tab-bar>`

A horizontal tab bar for document tabs with an automatic overflow button and an end slot for action buttons. Exports both NLDDDocumentTabBar and NLDDDocumentTabBarItem.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `accessible-label` | `string` | Accessible name for the navigation landmark |
| `translations` | `object` | Translation overrides; unset keys fall back to Dutch. Available keys: 'components.document-tab-bar.overflow-action' (default: 'Meer') |
| `navigation` | `boolean` | Renders a nav landmark instead of tablist; use when items have hrefs |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-document-tab-bar-item elements |
| `end` | Action buttons (e.g. new tab) |

**Events**

| Event | Description |
| --- | --- |
| `tabchange` | Fired when a tab is selected; detail: { item } |
| `tabdismiss` | Fired when a tab is dismissed; detail: { item, nextItem } |
| `tabempty` | Fired when the last tab is dismissed |
| `nldd-reorder` | Fired when tabs are reordered via drag; detail: { fromIndex, toIndex } |

### `<nldd-document-tab-bar-item>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `selected` | `boolean` | Selected state (managed by nldd-document-tab-bar) |
| `text` | `string` | Primary text |
| `supporting-text` | `string` | Supporting text |
| `short-text` | `string` | Short primary text (visible below 200px width) |
| `short-supporting-text` | `string` | Short supporting text (visible below 200px width) |
| `href` | `string` | Optional link URL; renders an anchor instead of a div |

**Events**

| Event | Description |
| --- | --- |
| `select` | Fired when the item is activated; detail: { item } |
| `dismiss` | Fired when the dismiss button is clicked; detail: { item } |

### `<nldd-link>`

Hyperlink component with two modes: 1. **Standalone (sized)**: set `size="xs"|"sm"|"md"|"lg"` for menus, action areas or overviews. Fixed text size, `display: inline-flex` with `gap` for icon spacing. 2. **Inline (inherit)**: leave `size` out or set `size="inherit"` explicitly. The link inherits `font-size`, `line-height` and `font-family` from its surroundings. Text wraps naturally across lines (`display: inline`). Icons work here too; the natural whitespace between icon and text provides the spacing. For links in CMS or markdown output, where the `<a>` arrives as HTML, `<nldd-rich-text>` with a raw `<a>` remains the route to take.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `href` | `string` | Link target |
| `target` | `string` | Link target (e.g. '_blank'); adjusts rel automatically. With '_blank' the link adds a visually hidden "Opent in nieuw tabblad" announcement for screen readers (WCAG 2.1 SC 3.2.2). |
| `rel` | `string` | Link rel attribute; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `size` | `string` | Text size: 'inherit' (the default) follows the surrounding text and lays the link out inline, so it wraps in running prose. 'xs' \| 'sm' \| 'md' \| 'lg' pin a size and switch to inline-flex, which baseline-aligns a start or end icon with an explicit gap. |
| `text` | `string` | Link text (alternative to the default slot) |
| `start-icon` | `string` | Icon before the text |
| `end-icon` | `string` | Icon after the text |
| `accessible-label` | `string` | Accessible label for screen readers |
| `disabled` | `boolean` | Disabled state |
| `no-tab` | `boolean` | Takes the control out of the tab order (tabindex="-1"), for a control owned by a roving container (a row of an nldd-list, where the arrow keys move between rows) that manages focus itself. Still mouse- and script-focusable. |
| `translations` | `object` | Override translation keys (e.g. the "Opent in nieuw tabblad" announcement); unset keys fall back to Dutch. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Link text (alternative to the text attribute) |
| `start-icon` | Custom icon before the text |
| `end-icon` | Custom icon after the text |

### `<nldd-menu-bar>`

Horizontal row of nldd-menu-bar-item elements with automatic overflow detection. Items that do not fit are hidden behind an overflow button with a popover menu.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `overflow-text` | `string` | Text for the overflow button (default through i18n) |
| `accessible-label` | `string` | aria-label for the nav landmark |
| `compact` | `boolean` | Propagates the compact attribute to slotted items (activates content priority) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-menu-bar-item elements |

### `<nldd-menu-bar-item>`

Interactive building block for use in a menu bar. Renders as an <a> (with href) or a <button> (without href). Supports an icon, text, a disclosure indicator, and an expandable popover through a slotted `<nldd-menu>` (or another popover element).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Text of the item |
| `current` | `boolean` | Mark as the active or current item |
| `current-type` | `string` | aria-current value when current is true ('page', 'step', 'location', 'true'). Default: 'page' |
| `href` | `string` | Optional link URL. Without href it renders as a button. |
| `icon` | `string` | Optional icon name (nldd-icon) |
| `expandable` | `boolean` | Show the disclosure icon and open the slotted `<nldd-menu>` on click |
| `icon-only` | `boolean` | Hide the text visually (always) |
| `content-priority` | `'icon'\|'text'` | Decides what stays visible in compact mode: 'icon' hides the text, 'text' hides the icon |
| `compact` | `boolean` | Activates content-priority behavior (set by the parent nldd-menu-bar) |
| `disabled` | `boolean` | Turn interaction off |
| `accessible-label` | `string` | Override aria-label |
| `haspopup` | `string` | aria-haspopup value (e.g. "menu", "dialog") |
| `open` | `boolean` | Whether the linked popover or menu is open |
| `expanded` | `boolean` | Whether the matching popover is open; sets aria-expanded on the button when expandable or haspopup is set. Tracked automatically for a slotted `<nldd-menu>`. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Content of the expandable popover. Wrap items in an `<nldd-menu>` so this component does not have to duplicate the menu API (variant, accessible-label, translations, filterFn and so on). Event listeners on items work directly, because nothing is cloned anymore. |

**Events**

| Event | Description |
| --- | --- |
| `select` | On a click on a non-expandable button item (bubbles, composed) |

### `<nldd-pagination>`

A pagination control for navigating between pages of content.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `current` | `number` | Currently active page (1-based) |
| `total` | `number` | Total number of pages (recommended max: 200 for compact select performance) |
| `disabled` | `boolean` | Disabled state |
| `centered` | `boolean` | Centers the pagination in the container (host fills row, items grouped in the middle) |
| `href-pattern` | `string` | URL pattern with a {page} placeholder, renders links instead of buttons |
| `translations` | `object` | Translations; unspecified keys fall back to Dutch |

**Events**

| Event | Description |
| --- | --- |
| `page-change` | On a page change (detail: { page: number, href?: string }). Only cancelable in href mode: preventDefault() blocks navigation (SPA). |

### `<nldd-skip-link>`

Accessibility pattern that lets keyboard users skip past content. Wraps content in a default slot. Without href it focuses the first element after the skip link in the DOM (nextElementSibling). Make sure a focusable element follows the component, otherwise the skip link has no effect.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Text of the skip link. Falls back to the i18n default. |
| `href` | `string` | Optional external target id. Without href it jumps to the end of its own content. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Content that can be skipped |

### `<nldd-tab-bar>`

A horizontal navigation bar with mutually exclusive tabs. Exports both NLDDTabBar and NLDDTabBarItem.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `string` | Visual mode: 'icon-and-text' \| 'text' \| 'icon'. When unset, the variant is inferred from each item's content. Drives the layout at every size. |
| `size` | `string` | Size: 'md' \| 'lg' (default: 'md'). 'lg' enlarges the touch target; the per-variant layout is preserved (icon-and-text stacks the icon over the text, text renders large text, icon renders a larger icon-only control). |
| `navigation` | `boolean` | Renders a nav landmark instead of tablist; use for href-based items that navigate between routes |
| `disabled` | `boolean` | Disables the whole bar: dims it, blocks pointer interaction, and takes the tabs out of the tab order |
| `centered` | `boolean` | Centers the tabs in the container (host fills the row, tabs group in the middle) |
| `accessible-label` | `string` | Accessible name for the navigation region; defaults to 'Tabs' |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | nldd-tab-bar-item elements |

**Events**

| Event | Description |
| --- | --- |
| `tabchange` | When a tab is selected; detail: { item: NLDDTabBarItem } |

### `<nldd-tab-bar-item>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `current` | `boolean` | The item you are on. A tab bar switching content manages it itself and renders it as `aria-selected`; a `navigation` bar leaves it to the consumer, since it follows the route, and renders it as `aria-current="page"`. Unlike a list row, which separates `current` from `selected` because it can be both at once, a tab bar has exactly one active item. |
| `text` | `string` | Tab text; also used as accessible name for icon-only items |
| `href` | `string` | Optional link URL; renders an anchor instead of a button |
| `icon` | `string` | Icon name for nldd-icon; an alternative to the icon slot. The icon and icon-and-text variants fall back to a placeholder icon when neither is provided. |
| `size` | `'md'\|'lg'` | Size: 'md' (default) \| 'lg'. Set by nldd-tab-bar from its own size; 'lg' enlarges the touch target while keeping the variant layout. |

**Slots**

| Slot | Description |
| --- | --- |
| `icon` | Icon content |

**Events**

| Event | Description |
| --- | --- |
| `select` | When the item is activated; detail: { item: NLDDTabBarItem } |

### `<nldd-top-navigation-bar>`

The top bar of a page: a logo bar with the Rijkslogo and an optional wordmark, and below it the main bar with the website title, a back button, the global navigation and the utility navigation. On narrow widths the global navigation moves into a menu sheet behind the menu button.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `no-logo` | `boolean` | Hides the whole logo bar, wordmark included. |
| `logo-title` | `string` | Title of the wordmark next to the logo. Without it the logo stands alone. |
| `logo-subtitle` | `string` | Subtitle under the wordmark title. Only visible when there is a wordmark. |
| `logo-supporting-text-1` | `string` | First supporting line under the wordmark title. Only visible when there is a wordmark. |
| `logo-supporting-text-2` | `string` | Second supporting line under the wordmark title. Only visible when there is a wordmark. |
| `logo-href` | `string` | URL for the logo and wordmark. Without it they are not a link but an image with an accessible label. |
| `website-title` | `string` | Name of the website or application, above the menu bar. Empty leaves the title line out. |
| `website-href` | `string` | URL for the website title. Without it the title stays plain text. |
| `back-href` | `string` | URL of the back button. Without it a click fires the `back-click` event, so the consumer navigates itself. |
| `back-text` | `string` | Text of the back button. The button appears as soon as back-text or back-href is set; without text it falls back to the translation ("Terug"). |
| `width` | `string` | Limits the bar content to a max-width so it lines up with the page sections. 'full' fills the entire width, or pass your own CSS length. |

### `<nldd-top-title-bar>`

A toolbar for page and container headings with optional navigation and action buttons. The component has two states: - Default: the back button shows the previous page title as a text button - Compact (class `is-compact`): the back button is an icon button, a divider and the toolbar title are visible When `collapse-anchor` is set, the `is-compact` class is automatically applied as soon as the top of the anchor element reaches this bar's own top edge (the sticky header line). Measuring the bar rather than the page keeps it correct in both nested and root scroll modes; it also re-points at the live scroll target when the page switches mode. Without `collapse-anchor` the bar takes a static state: compact when `text` is set (so the title shows in the title-group), non-compact otherwise (so the `back-text` button stays visible). An anchored bar hides its own title from assistive technology. The anchor is the heading the title swaps in for, so both carry the same words: once you scroll past the heading, a screen reader would otherwise find the same title twice. Sighted readers see one at a time, and this makes that true for everyone. Anchor at the heading, then, and not at some other element that happens to sit at the right height: the bar hands its title over to it.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `text` | `string` | Title of the bar, rendered as the h1 in the title group. |
| `supporting-text` | `string` | Subtitle under the title. |
| `collapse-anchor` | `string` | Id of the element whose top edge triggers the compact state on scroll. Without it the state is static (see above). |
| `back-text` | `string` | Text of the back button and its accessible name. Empty hides the back button (and the divider). |
| `back-href` | `string` | URL for the back button; renders a link and suppresses the `back` event. |
| `dismiss-text` | `string` | Text of the dismiss button. Empty hides that button. |

**Slots**

| Slot | Description |
| --- | --- |
| `toolbar` | Optional buttons to the left of the dismiss button |

**Events**

| Event | Description |
| --- | --- |
| `back` | Fired when the back button is clicked (not fired when back-href is set). It bubbles and is composed, so an ancestor hears it too, which is how nldd-navigation-split-view lets a consumer catch the back of any pane in one place. Listen in one place then: bound to both this bar and an ancestor, a single press runs the handler twice. |
| `dismiss` | Fired when the dismiss button is clicked. Bubbles and is composed, with the same caveat as `back`. |

## Status & feedback

### `<nldd-activity-indicator>`

Layout placeholder that fills its parent and centers an indeterminate activity indicator. By default the indicator is held back for 1000ms so brief loading states don't flash; once the delay passes it fades in. Set `timing="instant"` to skip the delay (the fade-in still plays) — this is what embedding components such as `nldd-button` use for their loading state. The default indicator is a simple icon-sized circle that follows the shared `--context-content-color` channel (set by list-item / table / menu on their content), falling back to `currentColor` wherever that channel is unset (buttons, rich-text, standalone) — so a spinner inside a cell tracks the row's state-aware content color, while embedders relying on currentColor are unaffected. An optional label sits below (hidden unless `show-text` is set). Drop a `<nldd-progress-circle>`, `<nldd-progress-bar>` or any element in the `indicator` slot to override it. Icon alignment: the visible ring already sits at 5/6 of its box (the SVG's r=9 plus a 2-unit stroke in a 24 view-box, the same optical inset a filled icon glyph has), so a standalone spinner lines up with an icon or an `icon-aligned` `nldd-avatar` on the same grid — no extra option needed (unlike `nldd-avatar`, which fills edge-to-edge and opts in via `icon-aligned`). Overlay mode: put content in the default slot and the indicator wraps it — it becomes a `position: relative` container, renders the spinner over a dimming backdrop (opt out with `no-backdrop`), and makes the content `inert` so its controls can't be focused or clicked. Toggle loading with `complete` (`?complete=${!isLoading}`). With no slotted content it stays the standalone placeholder described above. Reconnect behavior: every `connectedCallback` resets the timer and hides the indicator again. If a consumer toggles the element via a conditional render (remove + re-insert) the indicator disappears and re-fades after another delay. Keep the element mounted and toggle visibility / `hidden` instead if you want the timer to run only once. Accessibility: while connected and not `complete` the host is a polite live region (`role="status"`). The label (`text`, or the translated "Laden" fallback) always renders as the region's content — visually hidden when `show-text` is off (the default) — so assistive tech announces the loading state when the indicator appears. Set `complete` (or unmount) to clear it.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Circle diameter on the icon scale: 16,20,24,28,32,40,44,48,56,64,80,96 (default '32') |
| `show-text` | `boolean` | Show the label under the indicator (default false; the label still feeds the accessible name) |
| `text` | `string` | Label text. Falls back to the translated "Laden" when unset. |
| `timing` | `'delay'\|'instant'` | 'delay' (the default) waits 1000ms before showing (anti-flash); 'instant' shows immediately (the fade-in still plays). |
| `complete` | `boolean` | Mark the loader as finished while keeping the element mounted; clears aria-busy and hides the indicator. |
| `no-backdrop` | `boolean` | Overlay mode dims and blurs the wrapped content with a frosted backdrop by default; set this to show only the indicator panel without dimming. No effect in standalone mode. |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Content to wrap (overlay mode); made inert while loading. Leave empty for the standalone placeholder. |
| `indicator` | Optional custom indicator; overrides the default circle (and its visually-hidden label). Consumers replacing it supply their own indicator semantics; the host's role="status" still marks the loading region. |

### `<nldd-badge>`

Shows the state of something, or how much of it there is: a status, a number of unread messages, a dot saying something is new. What it says is decided by the system, and it changes without anyone touching it. A badge is never interactive. It shows text, a number and/or an icon; with no content it becomes a dot. Put it in a corner of another element (an icon, for instance) or on its own. For a property someone assigns to something, such as a category, a role or a certification, use `nldd-tag`. For standalone data the user works with, such as a chosen person or an active filter, use `nldd-token`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Size: 'sm' \| 'md' (default: 'md') |
| `color` | `string` | Semantic ('critical' \| 'accent' \| 'neutral' \| 'warning' \| 'success'), a Rijkshuisstijl color ('lintblauw' \| 'hemelblauw' \| 'oranje' \| …), or 'inherit' to fill in the content color around it: the `--context-content-color` channel a list item, table row or menu sets, falling back to `currentColor`. Default: 'critical' |
| `custom-color` | `string` | A color of its own, as any CSS color value ('#a90061', 'oklch(0.6 0.2 20)', 'var(--brand-cable-blue)'). For a color the system cannot know: the jacket of a cable, a color someone picked. It wins over `color`. Whatever it paints, the text and icon on top become white or black, whichever contrasts. The text on it is black or white, picked on the relative luminance of the fill, so it clears 4.5:1 whatever color you hand it. |
| `pulse` | `boolean` | Grows a ring out of the badge and fades it, for something happening right now (a live connection, an outage). Respects `prefers-reduced-motion`. |
| `text` | `string` | Text (takes precedence over number) |
| `number` | `number` | Numeric value. Shortened when it is over max |
| `max` | `number` | Value above which number is shown as "{max}+" (default: 99) |
| `icon` | `string` | Icon name. Icon-only renders as a square; with text or number the icon goes on the left. |
| `accessible-label` | `string` | Accessible label for screen readers. Falls back to text/number; otherwise to the i18n default ("Notificatie"). |
| `decorative` | `boolean` | Hides the badge from assistive software (use when the text beside it says the same, such as a dot next to a status word) |

### `<nldd-banner>`

An inline notification with a tinted background per variant. Use for persistent, page-level feedback (e.g. an error summary at the top of a form). Banner is more visually present than nldd-inline-dialog — the tinted color catches the eye. If you need a quieter component, pick a different one rather than overriding the banner's ARIA. Layout: icon left, text + supporting text + optional rich content + actions in the center, optional dismiss button right. Buttons wrap to a second row on narrow viewports via nldd-button-group's flex wrapping. role and aria-live are set automatically from the variant: - critical → role="alert" (interrupts screen reader) - others → role="status" aria-live="polite" Not overridable — if you need a less prominent component, use one. aria-atomic="true" is also set so that updates to the structured region (icon + heading + supporting-text + actions) are announced as one unit rather than as a partial subtree. Trade-off: any programmatic content mutation re-reads the entire banner. Banners are designed for short, heading-scale copy — if you slot in a paragraph of rich body text and then toggle variant or supporting-text at runtime, AT will re-announce the whole thing. Keep banner content concise, or render long-form messages in a different surface.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'neutral'\|'accent'\|'success'\|'warning'\|'critical'` | Color and default icon (default: 'neutral') |
| `size` | `'sm'\|'md'` | Banner size (default: 'md'). 'sm' tightens the padding to 8px, drops the icon to 24px and uses a smaller dismiss button — for a bar that sits between chrome and content rather than a standalone page-level notice. The typography is unchanged. |
| `icon` | `string` | Icon override. Default per variant: neutral → info-circle-filled, accent → info-circle-filled, success → check-circle-filled, warning → exclamation-triangle-filled, critical → exclamation-circle-filled |
| `text` | `string` | Main text (heading or paragraph, depending on heading-level) |
| `supporting-text` | `string` | Supporting text below the heading |
| `heading-level` | `1\|2\|3\|4\|5\|6` | Renders text as h1–h6; absent renders a p |
| `dismissible` | `boolean` | Show a close button in the top-right; emits `dismiss` when clicked |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Optional rich content between text and actions (e.g. nldd-rich-text) |
| `actions` | nldd-button elements, wrapped in a horizontal nldd-button-group |

**Events**

| Event | Description |
| --- | --- |
| `dismiss` | Fired when the dismiss button is clicked. The consumer is responsible for removing/hiding the banner. |

### `<nldd-inline-dialog>`

An inline status component for empty state, confirmations and feedback. Fills the container and has no minimum width.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'alert'\|'success'\|'loading'` | Semantic variant. 'alert' / 'success' force a matching icon and color; 'loading' shows an nldd-activity-indicator (a role="status" spinner announcing "Laden") in place of the icon — for an empty state that is still loading. |
| `size` | `'md'\|'lg'` | Typography size: 'md' (default) keeps body-md text + body-sm supporting; 'lg' bumps both up a step. |
| `icon` | `string` | Name of the nldd-icon icon above the text; absent when not set. Ignored when variant is set. |
| `icon-color` | `string` | 'secondary' \| 'accent' \| 'critical' \| 'warning' \| 'success'. Overrides the default and variant icon color. |
| `text` | `string` | Main text (heading or paragraph, depending on heading-level) |
| `supporting-text` | `string` | Supporting text below the heading |
| `heading-level` | `1\|2\|3\|4\|5\|6` | Renders text as h1–h6; absent renders a p |
| `horizontal-alignment` | `'left'\|'center'` | Overrides the alignment of text, icon and actions. Unset (the default) derives it: content in the default slot means a task, which aligns left; a bare message stays centered. Left alignment also lays the actions out in a row instead of stacked full-width. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Optional custom content between text and actions |
| `actions` | nldd-button elements, wrapped in nldd-button-group (max 3) |

### `<nldd-just-in-time-education>`

A guided-discovery coach mark. Put a control (nldd-search-field, for instance) in the default slot. While `active` is set, the component lifts a callout (title + supporting text + dismiss) into the top layer through the Popover API (`popover="manual"`), anchored to the control with Floating UI. No backdrop, non-modal: the background stays interactive. The control itself stays where it is in the flow. With `dismissable` the component manages closing and fires nldd-close: - the user performs the suggested interaction on the control -> close{completed} - the dismiss button -> close{dismissed} - a click or key press OUTSIDE the coach mark -> close{ignored} Without `dismissable` nothing closes by itself (no button, no outside or slot click); the consumer then decides when to close through `active` or `complete()`. `complete()` always works and closes with close{completed}, for example only once a real search has been submitted.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `active` | `boolean` | Show the coach mark. Driven by the app; false by default. |
| `text` | `string` | Title of the callout. |
| `supporting-text` | `string` | Supporting text under the title. |
| `placement` | `string` | 'auto' \| 'top' \| 'bottom' \| 'left' \| 'right' (default 'auto'). |
| `dismissable` | `boolean` | Show the dismiss button and allow closing with one click or key press outside the coach mark. False by default: the consumer then manages closing itself. |
| `arrow-length` | `string` | Arrow length, and therefore the distance between card and control, as a CSS length (e.g. `333px`, `30vh`). Empty = the DS default; anything under 40px is clamped. |
| `no-arrow` | `boolean` | Hide the arrow; the card then sits close against the control. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The control the coach mark points at (stays in the normal flow). |

**Events**

| Event | Description |
| --- | --- |
| `nldd-close` | When the coach mark closes. detail: { reason: 'completed' \| 'dismissed' \| 'ignored' }. |

### `<nldd-modal-dialog>`

A modal window with overlay backdrop, based on the native <dialog> element. Internally renders an <nldd-inline-dialog> for the visual structure.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'alert'` | Forwarded to nldd-inline-dialog; 'alert' forces icon and color |
| `icon` | `string` | Forwarded to nldd-inline-dialog; absent when not set |
| `text` | `string` | Forwarded to nldd-inline-dialog; main text |
| `supporting-text` | `string` | Forwarded to nldd-inline-dialog; supporting text |
| `horizontal-alignment` | `'left'\|'center'` | Forwarded to nldd-inline-dialog. Unset derives it there: slotted content aligns left, a bare message stays centered. |
| `accessible-label` | `string` | Accessible name for the dialog (aria-label); falls back to text |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Optional custom content, forwarded to nldd-inline-dialog |
| `actions` | nldd-button elements, forwarded to nldd-inline-dialog |

**Events**

| Event | Description |
| --- | --- |
| `open` | When the dialog is opened |
| `close` | When the dialog is fully closed. Does not bubble: overlays nest, and a listener on one dialog asking about that dialog should not also hear the form it opened. |

### `<nldd-notification>`

A short message that arrives over the interface and leaves on its own: a save that worked, a request that failed. Not a banner, which stands in the page and stays there — this one floats, stacks, and goes away. It places itself. Write it wherever it belongs in your code and it moves to one shared region: top right from md, full width across the top below that. Nothing about the position is settable, so notifications from anywhere in an application land in the same place and stack in the same order. A modal overlay is the one thing that moves it. An nldd-sheet, nldd-window or nldd-modal-dialog paints in the browser's top layer, above the whole page and out of reach of any z-index, and while one is open everything outside it is inert. So the region goes in: into the topmost overlay that is open, and back down as they close. A notification already on screen travels with it, and one raised from inside a sheet is readable and reachable where it is raised. More than one is a deck, not a list: the front one is readable and the older ones peek out below it, so a burst of messages takes the room of roughly one. The newest is in front. Behind it a notification is a bare surface, cut to the height of the one in front; dismiss the front and it slides up into the place that came free while its message fades in, because it was standing there all along. Under the front notification sits a strip as wide as the deck and as tall as the deck is when it fans out. Pointing at it fans the deck out to fill it, which is the only hint that there is more here than the message you can read; clicking it, or moving focus into the region, lays the whole deck out as a list. Clicking or tabbing away puts it back. The notification itself is not a button: a click on the message you are reading does nothing. Only the front of the deck counts down, and only while the deck is closed: open means someone is reading. The rest wait, so nothing disappears from under the one you are reading. `critical` never leaves on its own: a failure is worth reading, and the count-down would take it away while you were. That also keeps this within WCAG 2.2.1, which allows a time limit when what disappears is not essential. The clock pauses while a pointer moves over the notification and while focus is inside it, and resumes where it left off rather than starting over. A pointer that merely happens to rest where the notification appears does not count: it never moved, so nobody is reading. role follows the variant: `critical` becomes role="alert", the rest role="status". Focus never moves on its own. Escape dismisses the notification that focus is in.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'neutral'\|'accent'\|'success'\|'warning'\|'critical'` | What kind of message this is; sets the icon color and the ARIA role (default: 'neutral') |
| `icon` | `string` | Icon override. Default per variant: neutral → info-circle-filled, accent → info-circle-filled, success → check-circle-filled, warning → exclamation-triangle-filled, critical → exclamation-circle-filled |
| `text` | `string` | The message |
| `supporting-text` | `string` | A second line under the message |
| `duration` | `number` | Milliseconds before it leaves once it is front of the deck (default: 10000). `0` keeps it until dismissed, which is what `critical` does regardless. |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| `actions` | At most 2 nldd-button elements, under the text. More than 2 is refused with a DEV warning: a message that needs three choices is a dialog. |

**Events**

| Event | Description |
| --- | --- |
| `dismiss` | Fired when the notification is dismissed, by the button, by Escape, or by its own clock. The consumer removes it. |

### `<nldd-progress-bar>`

Exports both NLDDProgressBar and NLDDProgressBarSegmentIndicator. A progress bar that supports a single value (loading-style) or multiple segments (multi-stage progress, or distribution like storage usage). The consumer provides raw values; the component computes percentages from `max`. Two modes: - `progress` (default): segments sum toward `max`; remaining space is empty track. ARIA reads "X% voltooid". - `distribution`: segments fill the bar; ARIA enumerates segments. If the sum of segment values exceeds `max`, segments are normalized proportionally to fit and a warning is logged.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `mode` | `'progress'\|'distribution'` | Semantics for ARIA and visualization (default: 'progress') |
| `max` | `number` | Total value (default: 100) |
| `value` | `number` | Single-segment shorthand (ignored when segment children are present) |
| `color` | `string` | Color for the single-segment shorthand (default: 'accent') |
| `size` | `'sm'\|'md'\|'lg'` | Height of the bar (default: 'md') |
| `text` | `string` | Label above the bar (left) |
| `value-format` | `'percentage'\|'absolute'\|'fraction'` | Format for the displayed value (default: 'percentage') |
| `value-display` | `'inline'\|'tooltip'\|'none'` | Where the value shows: inline in the caption, in a tooltip on the bar, or hidden (default: 'inline') |
| `value-text` | `string` | Full override of the displayed value |
| `accessible-label` | `string` | Full override of aria-valuetext |
| `indeterminate` | `boolean` | Shows a sliding indicator animation (only without segments) |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Place for nldd-progress-bar-segment-indicator elements |

### `<nldd-progress-bar-segment-indicator>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `number` | Share of the parent's total (default 0; <=0 hides segment) |
| `color` | `string` | Color. Semantic (neutral, accent, success, warning, critical) or a Rijkskleur. Default 'accent'. |
| `name` | `string` | Name for screenreader text (optional) |
| `tooltip-text` | `string` | Override of the auto-generated tooltip text |

### `<nldd-progress-circle>`

Exports both NLDDProgressCircle and NLDDProgressCircleSegmentIndicator. A circular progress indicator that mirrors the API of nldd-progress-bar: single-value or multi-segment, progress or distribution mode, 24 colors, fade transitions between determinate/indeterminate, indeterminate indicator. Visual differences vs the bar: - SVG arcs instead of rectangular bars. - Label below the circle (not above). - No center text; the consumer can wrap the circle if needed. - One combined tooltip on the whole circle showing all segment info (no per-segment tooltips). - Indeterminate uses a rotating elastic arc (Material-style) instead of the bar's Knight Rider scanner.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `mode` | `'progress'\|'distribution'` | Semantics for ARIA and gap behavior (default: 'progress') |
| `max` | `number` | Total value (default: 100) |
| `value` | `number` | Single-segment shorthand (ignored when segment children exist) |
| `color` | `string` | Color. Semantic (neutral, accent, success, warning, critical) or a Rijkskleur. Default 'accent'. |
| `size` | `string` | Circle diameter in px. Matches nldd-icon sizes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96 (default: '28') |
| `text` | `string` | Label below the circle |
| `value-format` | `'percentage'\|'absolute'\|'fraction'` | Format of the displayed value (default: 'percentage') |
| `value-display` | `'inline'\|'tooltip'\|'none'` | Where the value shows: inline below the label, in a tooltip, or hidden (default: 'tooltip') |
| `value-text` | `string` | Full override of the displayed value (inline + tooltip) |
| `accessible-label` | `string` | Full override of aria-valuetext |
| `indeterminate` | `boolean` | Renders the rotating elastic arc animation |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

### `<nldd-progress-circle-segment-indicator>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `value` | `number` | Share of the parent's total (default 0; <=0 hides segment) |
| `color` | `string` | Color (semantic or Rijkskleur). Default 'accent'. |
| `name` | `string` | Optional name used in the combined tooltip + screenreader text |

### `<nldd-status-bar>`

A narrow, page-wide status bar (24px) with a deep background color per variant. Use it for persistent system state: an outage, planned maintenance, a draft view or a recording in progress. The bar deliberately shows no icon and supports text only. The text itself has to name the status ("Storing: …", "Gepland onderhoud …"), so the meaning does not follow from color alone (WCAG 1.4.1). Keep the text short: the bar shows one line and truncates with an ellipsis, certainly on narrower screens. For a long message with a lot of information only the essence belongs in the bar. Point to a separate page or sheet for the rest (through `href` or `button`, for instance), where the user can read on. The whole bar can be clickable: set `href` (renders an `<a>`) or `button` (renders a `<button>`; listen for the native `click` event). Without either the bar is static. On interaction a chevron appears as an affordance. One action per bar at most; several actions, or links in running text, belong in nldd-banner. role and aria-live are set automatically from the variant: - critical → role="alert" (implies aria-live="assertive"; interrupts the screen reader) - others → role="status" aria-live="polite" Not overridable. If you need a quieter component, pick a different one. Use `critical` only for a real emergency: role="alert" interrupts the screen reader on every change of the content, so do not put text in it that changes regularly (a counting-down timer, for example).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'neutral'\|'accent'\|'success'\|'warning'\|'critical'` | Color of the bar (default: 'neutral') |
| `text` | `string` | The status text (one line; truncated with an ellipsis) |
| `href` | `string` | Makes the whole bar a link (renders an <a>) |
| `target` | `string` | Link target (e.g. '_blank'); only used with href |
| `rel` | `string` | Link rel, used with href; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `button` | `boolean` | Makes the whole bar a button; ignored when href is set |

### `<nldd-step-indicator>`

Shows where you are in a process of several steps: a row of discs with a number (or a check mark on what is done), a label under each and a line connecting them. The parent holds the truth: `current` (1-based) derives the status of every child — `past` before it, `future` after. A child can override that with a `status` of its own, for flows that jump back or skip a step. Horizontal only. For steps under each other, build an `nldd-list` with an `nldd-timeline-track-cell` and an `nldd-title-cell` per row: vertical steps usually carry more than a title, and a list row already does that. Below the sm breakpoint (a container query, so measured on the component itself rather than on the viewport) it folds into one line of text plus a segmented bar. The full list of steps stays in the DOM, only visually hidden, so assistive software hears no less than a wide screen shows. Accessibility: a `nav` with a label, holding a `role="list"` with a `role="listitem"` per step. The current step gets `aria-current="step"`, the only notion WAI-ARIA has for this. "Done" and "still to do" do not exist as ARIA tokens and travel along as visually hidden text instead.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `accessible-label` | `string` | Name of the nav; defaults to the i18n value ("Voortgang") |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |
| `current` | `number` | 1-based number of the current step (default 1) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | `nldd-step-indicator-item` children |

### `<nldd-step-indicator-item>`

One step in an `nldd-step-indicator`. The parent decides the status and the number; those live here as internal state rather than as public API, except for `status`, which overrides what `current` derives.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `status` | `string` | `past` \| `current` \| `future`; overrides what the parent derives |
| `text` | `string` | Label under the disc |
| `icon` | `string` | Icon in the disc instead of the number or the check mark |
| `href` | `string` | Makes the step a link (back to a completed step, for instance) |
| `button` | `boolean` | Makes the step a button, for flows without a URL per step; ignored when `href` is set |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Label (an alternative to `text`) |

## lists-and-tables

### `<nldd-cell>`

A generic cell for wrapping arbitrary content in a list item. Controls vertical alignment and sizing without imposing content opinions. `vertical-alignment="center"` (default) stretches the cell to fill the full row height and centers its content within that space. Use `min-height` to set a minimum centered region. For strict top alignment without a minimum height, use `vertical-alignment="top"`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `width` | `string` | 'full' \| 'fit-content' \| CSS length (e.g. '120px', '10rem'). Default: 'fit-content' |
| `min-width` | `string` | Minimum width as CSS length (e.g. '80px', '5rem') |
| `max-width` | `string` | Maximum width as CSS length (e.g. '200px', '20rem') |
| `min-height` | `string` | Minimum height as CSS length (e.g. '44px', '3rem') |
| `vertical-alignment` | `'top' \| 'center' \| 'bottom'` | Vertical alignment of slotted content (default: 'center') |
| `horizontal-alignment` | `'left' \| 'center' \| 'right'` | Horizontal alignment of slotted content (default: 'left') |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Default slot for any content (buttons, switches, icons, etc.) |

### `<nldd-description-cell>`

A cell component for displaying a title-description pair in lists. `vertical-alignment="center"` (default) stretches the cell to fill the full row height and centers its content within that space. Use `min-height` to set a minimum centered region. For strict top alignment without a minimum height, use `vertical-alignment="top"`.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `width` | `string` | 'full' \| 'fit-content' \| CSS length (e.g. '200px', '20rem'). Default: 'full' |
| `min-width` | `string` | Minimum width as CSS length (e.g. '80px', '5rem') |
| `max-width` | `string` | Maximum width as CSS length (e.g. '300px', '20rem') |
| `min-height` | `string` | Minimum height as CSS length (e.g. '44px', '3rem') |
| `vertical-alignment` | `'top' \| 'center' \| 'bottom'` | Vertical alignment (default: 'center') |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| `title` | The label displayed above the description |
| `description` | The description content |

### `<nldd-drag-handle-cell>`

A cell that displays a drag handle for reorderable list items. Always vertically centered and sized to fit the handle. To enable drag-to-reorder, add the `reorderable-only` attribute to this element. This attribute is required for `nldd-list` to detect the drag handle in the composed event path and activate pointer and keyboard drag mode: ```html <nldd-list reorderable> <nldd-list-item> <nldd-drag-handle-cell reorderable-only></nldd-drag-handle-cell> <nldd-text-cell text="Item"></nldd-text-cell> </nldd-list-item> </nldd-list> ``` Without `reorderable-only`, pointer and keyboard drag will never trigger.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Handle size: 'sm' \| 'md' (default: 'md') |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch. Sets the handle's accessible label. |

### `<nldd-icon-cell>`

A cell component for displaying icons in lists with configurable alignment and size. Set `icon` to render an `nldd-icon` by name, or slot custom content as an escape hatch for non-standard iconography.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `vertical-alignment` | `string` | Vertical alignment: 'top' \| 'center' \| 'bottom' (default: 'center') |
| `size` | `string` | Size: '16' \| '20' \| '24' \| '32' (default: '24') |
| `color` | `'content' \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'critical'` | Color variant of the icon (default: 'content') |
| `icon` | `string` | Icon name (renders `<nldd-icon>`). Takes precedence over the default slot. |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Fallback for custom icon content when `icon` is not set. |

### `<nldd-list>`

A container for `nldd-list-item` elements. The `type` attribute switches the list's a11y role and behavior: - `list` (default) — `role="list"`, items `role="listitem"`. Reorderable allowed. - `radiogroup` — `role="radiogroup"`, for a set of `nldd-list-item radio` rows: one choice, laid out as rows so each option can carry a count or a second line. The rows step out of the accessibility tree themselves (`role="none"`), so the radios are the group's own children. The arrows move focus here and activation checks, rather than the selection following focus as it does in `nldd-radio-button-group`. - `tree` — `role="tree"`, items `role="treeitem"`. Branch rows put their child rows in their own `slot="children"`, which the item renders as a `role="group"`. Level, position and set size are NOT authored: the nesting represents the hierarchy, so assistive technology derives them. A branch row must carry `expanded`; the group is hidden while it is false. Visual indentation is the consumer's — repeat a spacer-cell per level. Comes with its own keyboard, see "Tree" below. - `navigation` — host `role="navigation"`, items with `selected` get `aria-current="page"` on their inner `<a>` or `<button>`. - `form` — rows that are not actions themselves: the controls inside them are. A row of a label and a field, a switch, a menu button, or a value you cannot change at all. Semantically the same as `list` (`role="list"`, `role="listitem"`), and everything visual is unchanged; what falls away is the keyboard of a list you walk through. No arrow navigation, so no promise of it either, and no tab stop on the row: Tab goes straight to the controls, in source order, the way it does in any form. Rows that ARE actions (`href`, `button`, `checkbox`, or a segment) contradict that and warn in development. SwiftUI draws the same line between `List` and `Form`, for the same reason. - `listbox` — an accessible, filterable listbox (combobox pattern). The list renders its OWN search input (`role="combobox"`) pinned above the options; `.list__items` becomes `role="listbox"` and items become `role="option"`. Focus stays in the input, the active option moves via `aria-activedescendant`, and filtering is consumer-managed via the `input` event (toggle `[hidden]` on items). See "Listbox" below. Selection state is consumer-managed: the list never mutates `selected` itself. A list you walk through answers to the arrow keys, and there is no attribute to switch that on. Whether the keys do something is not a property of one list: it is what a reader may assume about all of them, and a per-list setting made that unknowable from the outside. It follows the type, which you can see before you touch a key. - ArrowUp / ArrowDown — move focus between the rows there is something to do with. A row of nothing but text is skipped, because focus that leads nowhere is a dead end. - Home / End — the first / last of those rows. - Tab — the list is ONE tab stop, so Tab moves past it rather than through it. Within the current row Tab walks that row's own controls: a chevron beside a checkbox, a menu button at the end. The same controls in the other rows are held out of the tab order (`tabindex="-1"`, or `no-tab` on a design-system control that keeps its tab stop in its own shadow root), and so are this row's once focus leaves the list, so tabbing back in lands on the row again. - Escape — out of a control the row holds, back onto the row. One level up, where Shift+Tab is one step back. On the row itself the list claims nothing, so Escape carries on to whatever holds the list, and a control showing a menu keeps the first press for closing that menu. While focus sits in a control a row holds, the list stands down: those keys are the control's, and a list that took them anyway would pull focus out of a combo box or a text field mid-word. What the row IS — its own link, button or segments — keeps answering here. Arrows move focus only; selection stays consumer-managed. Three types answer differently, and all three say so on screen before you touch a key: a listbox runs its keyboard from its search field, a reorderable list moves rows with the arrows, and a form has no rows to move between at all. In `type="listbox"` the list owns a native `<input role="combobox">` (mirroring how `nldd-combo-box` wires an input to a slotted listbox). Keyboard, handled on the input so focus never leaves it: - ArrowDown / ArrowUp — move the active option among the VISIBLE (non-`[hidden]`) options (wrap around). - Home / End — first / last visible option. - Enter — activate the active option by triggering its inner action (a link navigates, a button fires the consumer's handler). Selection stays consumer-managed. - Escape — clear the search value (and refire `input`). On every active change the input's `aria-activedescendant` is set to the active option's id and the option is scrolled into view. The active option (`_highlighted` on the item, a highlight) is distinct from `selected`. Filtering is the consumer's job: listen to `input` (`{ detail: { value } }`) and toggle `[hidden]` on items; after the visible set changes the list resets the active option to the first visible one. `reorderable` and the roving arrow keys are ignored in listbox mode (listbox has its own keyboard). A tree adds to that keyboard, and counts the rows of an open branch as part of the order the arrows walk: - ArrowRight — opens a closed branch; on an open one it steps to its first child. - ArrowLeft — closes an open branch; on a leaf it steps out to the parent row. - Enter — follows the row: its own link or button, or on a segmented branch the first action that is not the chevron. A branch with only a chevron folds instead. - Space — open and close, the same as Right and Left. Only while focus sits on the row itself: a row that is its own control, and a segmented action you tabbed into, handle both keys themselves. Opening and closing runs through the row's own disclosure control — the segment marked `disclosure`, or the row itself when it is a button. The list activates that control rather than writing `expanded`, so the state keeps being set in one place: the consumer's handler. A row that is a link is never activated this way, since that would navigate away. The tree is one tab stop. Focus lands on the row itself when the row has no control of its own, because that is where `treeitem` sits and it makes assistive technology announce the row rather than a button inside it. Tab then walks the controls of THAT row (a chevron beside a checkbox, say) and leaves the list after the last one. A deliberate deviation: strictly speaking a row with several controls is a `treegrid`, not a `tree`. We keep the tree semantics — level and set size are what matters here, not rows and columns — and borrow the "Tab within the row" behavior from the grid pattern. Should a tree with real columns come up, that is when `treegrid` earns its own type. On reorder (type="list" + reorderable), the list dispatches `nldd-reorder` with `fromIndex` / `toIndex` and expects the consumer to mutate the DOM (or their data model that renders the DOM). Focus is restored to the moved item's drag handle via a single `requestAnimationFrame` — this assumes the consumer reorders **synchronously** in the event handler. Async renderers (React, Vue, …) that update the DOM on a later tick will miss the focus restore and should manage focus themselves after their render commits.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `variant` | `'simple'\|'box-tinted'\|'box-base'` | Visual style (default 'simple'): `simple` is a plain vertical strip with no chrome, the two `box` values a framed card with rounded corners, fill and inset border ring. `box-tinted` for a list on a plain page, `box-base` for one on an already-tinted parent (the border ring gets +2 palette steps so it still reads against a card-on-card) |
| `type` | `'list'\|'navigation'\|'listbox'\|'tree'\|'form'\|'radiogroup'` | A11y role and behavior (default 'list'). See the docblock above. |
| `reorderable` | `boolean` | Enables drag-to-reorder and pushes `reorderable` onto the items. Only valid with `type="list"`; there the arrow keys move rows instead of focus. |
| `dividers` | `'always'\|'on-touch'\|'never'` | When to draw the lines between the items (default 'always'). `on-touch` draws them only where the primary input is touch, under `(pointer: coarse)`: a pointer has the hover highlight to tell one row from the next and a finger has nothing, so the line earns its place in the one case and is clutter in the other. `never` hides them everywhere |
| `height` | `string` | Listbox only: caps the options' scroll region at this CSS length (e.g. '320px'). Unset means no cap. |
| `accessible-label` | `string` | Accessible name, forwarded to the list in `type="list"` and to the search field in `type="listbox"`. For `type="navigation"` set `aria-label` / `aria-labelledby` on the element itself. Falls back to the i18n default. |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | List items (`nldd-list-item`) |
| `toolbar` | Controls below the search field (filters, sort, counts, view toggles). Available for every type; collapses when empty. |
| `search-bar-end` | Controls inline at the end of the search bar, beside the search field (e.g. a filter or options button). Listbox only; collapses when empty. |
| `empty` | Shown when the list has no items at all. Empty by default: what an empty list should say is the app's to write, so put an `nldd-inline-dialog` here. There is nothing to search or filter in a list with no rows, so a `[slot="toolbar"]` is hidden along with them, and an unfilled slot takes the whole list off the page. A `type="listbox"` is the exception on both counts: its search field is where the rows come from, so the field, the toolbar and the list itself stay, and the message waits until there is a query, the same as `no-results` does. A list that fetches its rows is in this state until they arrive: put an `nldd-inline-dialog variant="loading"` here to hold the place rather than have the controls appear a moment later. |
| `no-results` | Shown when the list has items but every one of them is `[hidden]`, which is what consumer-driven filtering leaves behind. A different state from `empty` and a different sentence: here the search field and the `[slot="toolbar"]` stay, because they are the way back to the rows. Falls back to `[slot="empty"]` when not given. In `type="listbox"` it is suppressed while the search field is empty (no query yet), so the consumer can show just the search field or its own hint outside the list. |

**Events**

| Event | Description |
| --- | --- |
| `nldd-reorder` | Reorderable `type="list"`: `{ fromIndex, toIndex }` on drop |
| `input` | `type="listbox"`: search value changed; `{ value }`. Toggle `[hidden]` on items to filter. |

### `<nldd-list-item>`

A row within an `nldd-list`. Renders as a link when `href` is set, as a checkbox when `checkbox` is set, as a button when `button` is set, or as a plain container otherwise. All cells and segments share one flat slot, in source order. Two rules govern every row: 1. State fills always paint the WIDENED row geometry — the row box extended by the indicator inline inset on both sides — whether or not the row is interactive. Paint never differs between a selected plain row and a selected interactive row. 2. The widened strip belongs to the ROW, never to a segment. A row with any action (its own `href`/`button`/`checkbox`, or a slotted segment) pulls itself outward (`is-interactive` host class → negative inline margin) and pads the row block back by the same amount, so content stays on the grid. A row-wide action owns that padding itself, making the whole widened box one hit area; slotted segments stay in the grid, so their footprint is position-independent and tree columns line up at any depth. By default the divider starts at the row's first text or title cell, so the line lands on the words rather than on whatever leads up to them — an icon, an avatar, a checkbox, or the spacers a tree indents with. Rows of different shapes then still line their dividers up with each other, and a tree's dividers step inward with its indentation. Text inside an `nldd-list-item-segment` counts as the row's content, and the marker is that text cell rather than the action: the action carries its own inline padding, so its edge sits before the words. A row with no text or title cell keeps the full content width. Mark a cell with `divider-start` and/or `divider-end` to place it yourself instead — an explicit marker replaces the derived one entirely, so `divider-start` on the leading cell restores the full-width line. Multiple markers resolve as the union: first `divider-start` through last `divider-end`. A start past the last end is an authoring error — the item DEV-warns and falls back to the full content width. A branch row can disclose its children in two ways: a dedicated `nldd-list-item-segment[disclosure]` segment (only the chevron is clickable), or the row itself as the control (`button` + `expanded`, the whole row toggles). In the second case, mark the chevron's `nldd-icon-cell` with `disclosure` and the row turns it with `expanded` — the same affordance, without having to trade a clickable row for a turning chevron. `checkbox` makes the WHOLE row the control: the inner action becomes a `role="checkbox"` button carrying `aria-checked`, it toggles `checked` on activation and fires `change`. Slot a visual `nldd-checkbox` (or any glyph) before the text and mark it `aria-hidden` + non-focusable — the row already conveys role and state, and a second focusable control would double the tab stops. Do NOT nest a real `<input type="checkbox">` in the action: interactive content inside a `<button>` is invalid HTML and AT announces the button, not the checked state. A `<label>` variant is not offered for the same reason it cannot work — label-to-input association walks the DOM tree, and a slotted input is not a descendant of a label in the shadow root. When it renders as a link, `target` and `rel` are forwarded to the inner `<a>` (e.g. `target="_blank" rel="noopener noreferrer"`). With `target="_blank"` the item also injects a visually hidden "opens in new tab" announcement for assistive technology (WCAG 2.1 SC 3.2.2). The item synchronizes its ARIA with its parent `nldd-list`'s `type`: - `list` parent → `role="listitem"` - `navigation` parent → `role="listitem"` + `aria-current="page"` on the inner `<a>` / `<button>` when `selected` - `listbox` parent → `role="option"` + `aria-selected` reflecting `selected`. The list points its search input's `aria-activedescendant` at the active option via `_highlighted` (separate from `selected`).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `'sm'\|'md'` | Row size (default: 'md'). Pushed onto the cells whose `size` means the same scale (nldd-text-cell, nldd-drag-handle-cell), so it is written once per row instead of once per cell. A size set on the cell itself wins. Cells where `size` means something else — pixels on nldd-icon-cell / nldd-spacer-cell, a heading scale on nldd-title-cell — are left alone. |
| `selected` | `boolean` | Marks the item as selected: it is one of the rows you picked. Selection is consumer-managed; the list never sets it. In a `navigation` parent it puts `aria-current="page"` on the inner action, in a `listbox` parent it drives `aria-selected`. |
| `current` | `boolean` | Marks the item as the one you are on: the page a menu row points at, the record a list has open. Exactly one row in a list carries it, where `selected` may be on many. It paints like `selected` at rest, and takes the highlighted fill while focus is anywhere in the row — including inside a nested `nldd-list-item-segment`, which is what a segmented row needs: the focus never reaches the row's own control, because there is none. In a `navigation` parent it puts `aria-current="page"` on the inner action. On a segmented row set it on the segment that holds the link instead: the row reads `current` off its own segments and paints itself, so it is written once, where `aria-current` belongs. |
| `button` | `boolean` | Renders the item as a `<button>`. Last of the three: `href` and `checkbox` both win over it. |
| `checkbox` | `boolean` | Makes the whole row a `role="checkbox"` control. Wins over `button`, loses to `href`. |
| `radio` | `boolean` | Makes the whole row one radio of a group: the action becomes a `role="radio"` button carrying `aria-checked`, and activation sets `checked` (never clears it) and fires `change`. Put the rows in an `nldd-list type="radiogroup"`, which is what makes them a set. Wins over `button`, loses to `href` and `checkbox`. The arrow keys move focus without checking, where a native radio group and `nldd-radio-button-group` check as they go: a row can carry more than a label, so stepping past one should not commit it. |
| `checked` | `boolean` | Checked state of a `checkbox` or `radio` row. A checkbox row toggles it on activation, a radio row only ever sets it |
| `disabled` | `boolean` | Switches the row's own control off: a `button` or `checkbox` row stops responding and dims, a `href` row gets `aria-disabled` and its click is blocked (a link cannot be disabled natively). A row without a control of its own has nothing to switch off, and segments carry their own `disabled`. The arrow keys skip a disabled row. |
| `expanded` | `boolean` | Disclosure state. Drives the `children` group's visibility AND supplies `aria-expanded` — to the row's own control when the row is interactive, or to the segment marked `disclosure`. Written once either way; the item DEV-warns when there is nowhere for it to live. |
| `href` | `string` | Renders the item as an `<a>` with this URL. Wins over `checkbox` and `button`; without any of the three the item is a plain container with no action. |
| `target` | `string` | Link target forwarded to the `<a>` (e.g. '_blank'); only applies with `href`. With '_blank' a visually hidden "opens in new tab" announcement is added for assistive technology. |
| `rel` | `string` | Link rel forwarded to the `<a>`, only with `href`; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `reorderable` | `boolean` | Set by the parent `nldd-list` when its own `reorderable` is on (with `type="list"`); consumers do not set this. Serves as a CSS hook for drag handle visibility. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Cells and segments, in source order |
| `children` | Child rows of a branch in an `nldd-list type="tree"`. Rendered as a `role="group"` below the row, hidden while `expanded` is false. The nesting IS the hierarchy, so aria-level / -posinset / -setsize are derived, not authored. The group has no styling of its own: repeat a spacer-cell per level to indent, or show depth some other way. |

**Events**

| Event | Description |
| --- | --- |
| `change` | On a `checkbox` row after it toggles, and on a `radio` row when it becomes checked; detail: { checked: boolean } |

### `<nldd-list-item-segment>`

A segment inside an `nldd-list-item`: it groups a run of cells and makes just that run clickable. Use it when a row needs more than one segment — a tree row whose chevron expands while the label toggles a checkbox, or a row that navigates with a separate button beside it. Put it in the row where its cells would go: the item has one flat slot, and a segment takes the place of the cells it covers. Where the divider starts or stops is marked on the cells themselves (`divider-start` / `divider-end`), not by the slot a segment sits in. A row is EITHER row-level interactive (`href` / `button` / `checkbox` on the `nldd-list-item`) OR segmented (one or more of these). Both at once nests a control inside a control, which is invalid HTML; the item DEV-warns. Unlike the row-wide action this does not bleed outward: a segment sits between siblings, so an outward inset would overlap them. It owns its inline padding and never drops below the row's control size, so an icon-only one still meets the WCAG 2.5.8 target size — do not add spacer cells inside it for room or hit area, that doubles the space. In a `type="listbox"` list the segment renders as a plain container (no control, not focusable) and DEV-warns: an `option` may not contain interactive descendants. The cells render unchanged, so nothing shifts.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `button` | `boolean` | Renders the segment as a `<button>`. Last of the three: `href` and `checkbox` both win over it. |
| `href` | `string` | Renders the segment as an `<a>` with this URL. Wins over `checkbox` and `button`. |
| `target` | `string` | Link target forwarded to the `<a>`; only applies with `href` |
| `rel` | `string` | Link rel forwarded to the `<a>`, only with `href`; with target '_blank', 'noopener noreferrer' is added to whatever you set |
| `checkbox` | `boolean` | Makes the segment a `role="checkbox"` control. Wins over `button`, loses to `href`. |
| `checked` | `boolean` | Checked state of a `checkbox` segment; it toggles on activation |
| `expanded` | `boolean` | Disclosure state, reflected as `aria-expanded` on the control, and painted: the segment stays lit a step above hover for as long as what it opened is on screen, so a menu reads as hanging off this row rather than floating over the list. Set it on the segment that opens something (a tree row's chevron, a menu). Leave it off entirely when the segment discloses nothing — an absent attribute emits no aria-expanded. |
| `disclosure` | `boolean` | Marks the segment as the row's disclosure control: `aria-expanded` comes from the parent item's `expanded`, so the state lives in one place. A slotted `nldd-icon-cell` rotates a quarter turn while the row is open |
| `current` | `boolean` | Marks the segment as the current page (`aria-current="page"`). The row it sits in paints itself as the current row from it, so on a segmented row this is the only place it has to be set. |
| `disabled` | `boolean` | Switches the segment off: a `button` or `checkbox` segment stops responding and dims, a `href` segment gets `aria-disabled` and its click is blocked (a link cannot be disabled natively). The arrow keys skip a row whose only segment is off. |
| `width` | `'fit-content'\|'full'` | `full` lets the segment grow to fill the row (default: 'fit-content') |
| `accessible-label` | `string` | Accessible name for the control. Set it when the segment holds only an icon, or when the cell text does not describe the action. |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The cells that belong to this segment |

**Events**

| Event | Description |
| --- | --- |
| `change` | On a `checkbox` segment after it toggles; detail: { checked: boolean } |

### `<nldd-spacer-cell>`

A cell component that provides fixed horizontal spacing within list items.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Spacer size in pixels: '2' \| '4' \| '6' \| '8' \| '10' \| '12' \| '16' \| '20' \| '24' \| '28' \| '32' \| '40' \| '44' \| '48' \| '56' \| '64' \| '80' \| '96' (default: '16') |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

### `<nldd-table>`

Exports both NLDDTable and NLDDTableRow. A data table presented as a boxed surface (rounded corners, an inset border ring, a base or tinted fill) that aligns content into shared columns using a CSS grid + subgrid. Row dividers run full-bleed to the edges; the inline padding lives on the rows, so it insets the cell content but not the dividers. Column widths are defined ONCE on the table via the `columns` attribute (a CSS grid track list), like an HTML `<colgroup>`. Rows are `<nldd-table-row>` elements whose children are the existing `nldd-cell` family — every row uses `grid-template-columns: subgrid`, so all rows snap to the same columns. Header: put one `<nldd-table-row slot="header">` in the `header` slot. Its cells become column headers (role="columnheader"). Responsive: two complementary strategies. (1) Give columns a minimum width (e.g. `minmax(160px,1fr)`) — the table is its own scroll container, so it scrolls horizontally when too narrow (no wrapper needed). (2) Drop columns at breakpoints: provide `sm-columns`/`md-columns`/ `lg-columns` (shorter track lists) and hide the dropped columns' cells with `hide-below`/`hide-above` at the matching breakpoint. The table picks the track list for its own width via the standard sm/md/lg breakpoints. Selection and sorting are intentionally NOT built in: add a column with an `nldd-cell` + `nldd-checkbox` for selection, and drive sorting from an external control (e.g. a dropdown).

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `background` | `'base'\|'tinted'` | Surface fill of the box (default 'base') |
| `columns` | `string` | CSS grid track list defining the columns once, e.g. "minmax(200px,1fr) 120px 80px" |
| `sm-columns` | `string` | Track list when the table is sm-wide (≤640px); falls back to `columns` |
| `md-columns` | `string` | Track list when the table is md-wide (641–1007px); falls back to `columns` |
| `lg-columns` | `string` | Track list when the table is lg-wide (≥1008px); falls back to `columns` |
| `accessible-label` | `string` | Accessible name for the table. Strongly recommended — role="table" needs a name. A missing label is DEV-warned and a generic fallback name is used. |
| `selectable` | `boolean` | Opt into row selection: body rows expose aria-selected (true/false). Without it, rows omit aria-selected so a non-selectable table isn't announced as selectable. |
| `translations` | `object` | Override translation keys; unset keys fall back to Dutch |

**Slots**

| Slot | Description |
| --- | --- |
| `header` | One `<nldd-table-row slot="header">` carrying the column headers |
| _(default)_ | The body rows (`<nldd-table-row>`) |
| `empty` | Shown when there are no visible body rows (the header is hidden too). Empty by default: what an empty table should say is the app's to write, so put an `nldd-inline-dialog` here. |

### `<nldd-table-row>`

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `selected` | `boolean` | Highlights the row (same treatment as nldd-list-item[selected]) |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | The row's cells (`nldd-cell` and variants), one per column |

### `<nldd-text-cell>`

A cell component for displaying text content in lists with configurable alignment, size and color. This is the most fundamental list cell component. `vertical-alignment="center"` (default) stretches the cell to fill the full row height and centers its content within that space. Use `min-height` to set a minimum centered region. For strict top alignment without a minimum height, use `vertical-alignment="top"`. Each text region (overline, main text, supporting text) accepts either a string attribute or slotted DOM content. The slot is the source of truth: if the consumer provides slotted content, it replaces the attribute-based render for that region. Use slots when you need inline elements like `<nldd-tag>`, `<a>` or `<nldd-icon>` mixed with text. Note that `query` highlighting and `**bold**` parsing only apply to the attribute path — slotted content is rendered as-is.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Cell size: 'sm' \| 'md' (default: 'md') |
| `color` | `string` | Text color variant: 'content' (the default) \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'critical'. All variants other than those two apply to all three text fields so the cell reads as a coherent state. |
| `width` | `string` | 'full' \| 'fit-content' \| CSS length (e.g. '200px', '20rem'). Default: 'full' |
| `min-width` | `string` | Minimum width as CSS length (e.g. '80px', '5rem') |
| `max-width` | `string` | Maximum width as CSS length (e.g. '200px', '20rem') |
| `min-height` | `string` | Minimum height as CSS length (e.g. '44px', '3rem') |
| `horizontal-alignment` | `string` | Horizontal alignment: 'left' \| 'center' \| 'right' (default: 'left') |
| `vertical-alignment` | `string` | Vertical alignment: 'top' \| 'center' \| 'bottom' (default: 'center') |
| `text` | `string` | Main text content. Supports **bold** syntax for inline bold segments. Falls back to default slot. |
| `overline` | `string` | Optional overline text displayed above the main content. Supports **bold**. Falls back to `overline` slot. |
| `supporting-text` | `string` | Optional supporting text displayed below the main content. Supports **bold**. Falls back to `supporting-text` slot. |
| `query` | `string` | Query substring to bold-highlight across text fields. Empty = no marking. |
| `query-mark-mode` | `string` | 'match' \| 'predictive' (default: 'predictive') |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| `overline` | Rich content for the overline region. Overrides the `overline` attribute when content is assigned. |
| _(default)_ | (default) Rich content for the main text region. Overrides the `text` attribute when content is assigned. |
| `supporting-text` | Rich content for the supporting text region. Overrides the `supporting-text` attribute when content is assigned. |

### `<nldd-timeline-track-cell>`

A cell component for displaying timeline track indicators in lists. Shows a vertical line with a dot indicating timeline position and state. The row's block padding belongs to the cell itself (via `--context-cell-padding-block`), so the line spans the cell's own box edge to edge and consecutive steps connect without gaps. By default the cell is a bare track: a line with a dot per row, for a timeline of events. With `variant="step"` the dot grows big enough for a number or an icon and you have a list of steps under each other, the vertical counterpart of `nldd-step-indicator`. The size belongs to the variant rather than to the content: every dot in a list is the same size, or the track would jump.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `status` | `'past' \| 'current' \| 'future'` | How far along this row is (default 'past'); the same values as `nldd-step-indicator-item`. It colors the dot and the track around it: covered above where you are, still ahead below |
| `size` | `'sm' \| 'md'` | How wide the lane is and so how big the dot: `sm` (default, 16px) for a timeline of events, `md` (24px) where a number or an icon has to fit. Every row in one list takes the same size, or the track jumps |
| `variant` | `'major' \| 'minor' \| 'none'` | What stands in the lane: a whole dot (`major`, the default), a smaller one for a row that belongs under the one above it (`minor`), or nothing at all (`none`) for a row that carries what a step holds rather than being a step. A `none` row keeps its `size` and its `status`, so it stays in the same lane and the track runs on in the right color |
| `direction` | `'down' \| 'up'` | The direction the timeline moves forward in: `down` (default) puts the past above, `up` below. Only the current step has half a track, so this only has an effect there |
| `position` | `'first' \| 'between' \| 'last' \| 'only'` | Place in the series (default 'between'): decides whether the line continues above the dot, below it, or on both sides. `only` is the single row in the series and gets a line on neither side: a track of one dot leads nowhere. On a `variant="none"` row, which is nothing but line, `only` leaves it out altogether: the track ends above it |
| `line` | `'auto' \| 'top' \| 'bottom' \| 'both' \| 'none'` | Which halves of the track you have covered, when `status` and `direction` get it wrong (default 'auto', which is what those two say). The halves you name are drawn as covered and the other one as still ahead, so `none` covers neither. Which halves are drawn at all stays with `position`, except that naming a half draws it: `line="both"` on a `first` row draws one above too. A row that opens a group of its own is the case for `both`, since the going carries on below it. A `variant="none"` row has one line rather than two halves, and no point where a fill could change over, so there the status colors the whole of it and `line` overrules the whole of it. On a `current` row that leans the way the timeline runs: what belongs to a point usually comes after it, so going `down` the stretch reads as still ahead and going `up` as behind you |
| `text` | `string` | Number or short text in the dot |
| `icon` | `string` | Icon name in the dot; wins over `text` |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| _(default)_ | Custom content in the dot (an alternative to `text` and `icon`) |

### `<nldd-title-cell>`

A cell component for displaying a title with optional overline and subtitle in lists. `vertical-alignment="center"` (default) stretches the cell to fill the full row height and centers its content within that space. Use `min-height` to set a minimum centered region. For strict top alignment without a minimum height, use `vertical-alignment="top"`. Each text region (overline, title, supporting text) accepts either a string attribute or slotted DOM content. The slot is the source of truth: if the consumer provides slotted content, it replaces the attribute-based render for that region. Use slots when you need inline elements like `<nldd-tag>`, `<nldd-icon>` or other components mixed with text. Note that `query` highlighting and `**bold**` parsing only apply to the attribute path — slotted content is rendered as-is.

**Attributes**

| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `1\|2\|3\|4\|5\|6` | Visual size of the title (default: 5) |
| `color` | `'content' \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'critical'` | Text color variant (default: 'content'). `secondary` demotes the title to match the muted overline/supporting-text. `accent`, `success`, `warning` and `critical` tint all three regions so the cell reads as a coherent state. |
| `width` | `string` | 'full' \| 'fit-content' \| CSS length (e.g. '200px', '20rem'). Default: 'full' |
| `min-width` | `string` | Minimum width as CSS length (e.g. '80px', '5rem') |
| `max-width` | `string` | Maximum width as CSS length (e.g. '300px', '20rem') |
| `min-height` | `string` | Minimum height as CSS length (e.g. '44px', '3rem') |
| `horizontal-alignment` | `'left' \| 'center' \| 'right'` | Horizontal alignment (default: 'left') |
| `vertical-alignment` | `'top' \| 'center' \| 'bottom'` | Vertical alignment (default: 'center') |
| `text` | `string` | Title text content. Supports **bold** syntax for inline bold segments. Falls back to default slot. |
| `overline` | `string` | Optional overline text displayed above the title. Supports **bold**. Falls back to `overline` slot. |
| `supporting-text` | `string` | Optional supporting text displayed below the title. Supports **bold**. Falls back to `supporting-text` slot. |
| `heading-level` | `number` | Heading level for the title element: 1–6 (default: none, renders a <p>) |
| `query` | `string` | Query substring to bold-highlight across text fields. Empty = no marking. |
| `query-mark-mode` | `string` | 'match' \| 'predictive' (default: 'predictive') |
| `hide-below` | `string` | Hides the element below this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. The value names the breakpoint you hide BELOW, so `hide-below="md"` is hidden in sm and visible from md up. `sm` is the open edge and never hides (DEV-warns). |
| `hide-above` | `string` | Hides the element above this breakpoint: `sm` \| `md` \| `lg`, or a CSS length. `hide-above="sm"` is hidden in md and lg. `lg` is the open edge and never hides (DEV-warns). |

**Slots**

| Slot | Description |
| --- | --- |
| `overline` | Rich content for the overline region. Overrides the `overline` attribute when content is assigned. |
| _(default)_ | (default) Rich content for the title. Overrides the `text` attribute when content is assigned. |
| `supporting-text` | Rich content for the supporting text region. Overrides the `supporting-text` attribute when content is assigned. |

## Iconen

Geldige `name`-waarden voor `<nldd-icon>` (359 iconen + 318 aliassen). Verzin geen naam; kies er een uit deze set.

**Iconen**

`accessibility`, `antenna-radio-waves`, `apartment-building`, `apartment-building-2`, `app`, `arrow-2-counter-clockwise`, `arrow-clockwise`, `arrow-down`, `arrow-down-in-bucket`, `arrow-down-left-arrow-up-right`, `arrow-left`, `arrow-left-right`, `arrow-left-to-line`, `arrow-right`, `arrow-right-in-bucket`, `arrow-right-out-bucket`, `arrow-right-to-line`, `arrow-u-turn-backward`, `arrow-u-turn-forward`, `arrow-up`, `arrow-up-arrow-down`, `arrow-up-out-bucket`, `arrow-up-right-arrow-down-left`, `at`, `bell`, `binoculars`, `blocks-9`, `bold`, `book`, `book-badge-play`, `book-badge-plus`, `bookmark`, `bookmark-filled`, `books-vertical`, `boxes-3`, `brackets-ellipsis`, `brackets-ellipsis-badge-plus`, `brick-wall`, `bug`, `bullet-list`, `business-suitcase`, `calendar-event`, `caret-down`, `caret-down-extra-small`, `caret-down-small`, `caret-left`, `caret-left-extra-small`, `caret-left-small`, `caret-right`, `caret-right-extra-small`, `caret-right-small`, `caret-up`, `caret-up-extra-small`, `caret-up-small`, `centralized-structure`, `certificate`, `chart-x-y-axis-line`, `check-circle-filled`, `check-list`, `check-mark`, `check-mark-circle`, `check-mark-circle-light`, `check-mark-extra-small`, `check-mark-small`, `chevron-double-left`, `chevron-double-left-extra-small`, `chevron-double-left-small`, `chevron-double-right`, `chevron-double-right-extra-small`, `chevron-double-right-small`, `chevron-down`, `chevron-down-extra-small`, `chevron-down-small`, `chevron-left`, `chevron-left-chevron-right`, `chevron-left-extra-small`, `chevron-left-forward-slash-chevron-right`, `chevron-left-forward-slash-chevron-right-rectangle`, `chevron-left-small`, `chevron-left-to-line`, `chevron-left-to-line-extra-small`, `chevron-left-to-line-small`, `chevron-right`, `chevron-right-extra-small`, `chevron-right-small`, `chevron-right-to-line`, `chevron-right-to-line-extra-small`, `chevron-right-to-line-small`, `chevron-up`, `chevron-up-chevron-down`, `chevron-up-extra-small`, `chevron-up-small`, `circle`, `circle-circle`, `circle-circle-light`, `circle-dashed`, `circle-filled`, `circle-filled-extra-small`, `circle-filled-small`, `circle-grid-2x2-top-left-check-mark`, `circle-light`, `clipboard`, `clipboard-bullet-list`, `clipboard-pencil`, `clipboard-square`, `clock`, `clock-arrow-clockwise`, `clock-arrow-counter-clockwise`, `clock-light`, `cloud`, `cloud-arrow-down`, `cloud-arrow-up`, `cpu`, `cylinder-2-big-small-split`, `cylinder-split`, `cylinder-split-badge-lock`, `cylinder-split-slash`, `desk-with-screen`, `diamond`, `dismiss`, `dismiss-circle`, `dismiss-circle-filled`, `dismiss-extra-small`, `dismiss-small`, `display`, `ellipsis`, `envelope`, `erlenmeyer-flask`, `erlenmeyer-flask-light`, `euro-sign`, `exclamation-2-circle`, `exclamation-2-circle-filled`, `exclamation-3-circle`, `exclamation-3-circle-filled`, `exclamation-circle`, `exclamation-circle-filled`, `exclamation-triangle`, `exclamation-triangle-filled`, `external-hard-drive`, `external-hard-drives`, `eye`, `eye-slash`, `eyeglasses`, `face-frowning`, `face-smiling`, `face-smiling-badge-plus`, `file`, `file-badge-arrow-down`, `file-badge-arrow-up`, `file-badge-minus`, `file-badge-plus`, `file-box`, `file-on-file`, `file-text`, `file-text-badge-check-mark`, `file-text-badge-check-plus`, `file-text-on-file-text`, `file-text-pencil`, `flag`, `flag-filled`, `folder`, `folder-badge-plus`, `folder-on-folder`, `folder-open`, `foundation`, `gear`, `git-branch`, `git-commit`, `git-compare`, `git-fork`, `git-merge`, `git-pull-request`, `git-pull-request-closed`, `git-pull-request-draft`, `globe`, `globe-rack-server`, `gpu`, `hand`, `hand-thumbs-down`, `hand-thumbs-up`, `handshake`, `heading-1`, `heading-2`, `heading-3`, `heading-4`, `heading-5`, `heading-6`, `heart`, `heart-filled`, `highlighter`, `house`, `house-apartment-building`, `indent-decrease`, `indent-increase`, `info-circle`, `info-circle-filled`, `italic`, `kanban-columns`, `key`, `kvm-switch`, `leaf`, `lifebuoy`, `lightbulb`, `lightning`, `link`, `link-badge-lock`, `list`, `list-arrow-down`, `list-arrow-up`, `list-decreasing-lines`, `lock-closed`, `lock-open`, `magnifier`, `map`, `map-pin`, `map-pin-badge-minus`, `map-pin-badge-plus`, `map-pin-oval`, `markdown-rectangle`, `media-backward`, `media-backward-end`, `media-backward-end-filled`, `media-backward-filled`, `media-backward-frame`, `media-backward-frame-filled`, `media-forward`, `media-forward-end`, `media-forward-end-filled`, `media-forward-filled`, `media-forward-frame`, `media-forward-frame-filled`, `media-pause`, `media-pause-filled`, `media-play`, `media-play-filled`, `media-play-pause`, `media-play-pause-filled`, `media-stop`, `media-stop-filled`, `megaphone`, `memory-chip`, `message-rectangle-text`, `microphone`, `microphone-slash`, `minus`, `minus-circle`, `minus-extra-small`, `minus-small`, `moon`, `network-structure`, `network-switch`, `note`, `numbered-list`, `paintbrush`, `paper-plane`, `paperclip`, `paragraph-sign`, `parking-sign-square`, `pci-card`, `pencil`, `pencil-on-square`, `pencil-ruler`, `person`, `person-2`, `person-badge-gear`, `person-badge-minus`, `person-badge-plus`, `person-circle`, `person-circle-badge-plus`, `person-text-rectangle`, `photo`, `photo-camera`, `photo-on-photo-angled`, `photo-slash`, `photo-stack`, `pipeline-corner-2`, `pipeline-machine-gear`, `pipeline-valve`, `plus`, `plus-small`, `point-bottom-left-to-point-top-right-s-curve-path`, `power-plug`, `printer`, `psu`, `puzzle-piece`, `puzzle-piece-badge-plus`, `puzzle-piece-filled`, `question-mark-circle`, `rack-server`, `rack-servers`, `radar`, `rectangle`, `rectangle-split-2x1`, `rectangle-split-2x3`, `rectangle-split-2x3-badge-arrow-down`, `rectangle-split-3x1`, `rectangle-stack`, `rectangle-stack-chevron-left-forward-slash-chevron-right`, `rectangle-stack-text`, `scissor`, `score-meter`, `screwdriver-wrench`, `seal-check-mark`, `seal-star`, `shield`, `shield-arrow-right-arrow-left`, `shield-check-mark`, `shield-lock`, `ship-wheel`, `ship-wheel-badge-plus`, `shopping-cart`, `sidebar-left`, `sidebar-right`, `signpost`, `slash-circle`, `slash-circle-light`, `slider-horizontal-3`, `snowflake`, `sparkles`, `speaker`, `speaker-slash`, `speaker-volume-high`, `speaker-volume-low`, `speaker-volume-medium`, `square`, `square-1`, `square-arrow-down`, `square-arrow-right-top`, `square-arrow-up`, `square-grid-2x2`, `square-grid-2x2-pencil`, `square-grid-3x3`, `square-on-square`, `square-plus-on-square`, `ssd-hard-drive`, `star`, `star-filled`, `starburst-filled`, `strikethrough`, `sun`, `tag`, `tag-on-tag`, `terminal`, `text-format-size`, `text-quote`, `timer`, `transceiver-module`, `trash`, `tray`, `tree-structure`, `triangle-square-circle`, `tulip`, `tulip-light`, `underlined`, `video-camera`, `viewfinder`, `viewfinder-line`, `waving-crossing-lines`, `wheat`

**Aliassen** (verwijzen naar een icoon hierboven)

`a11y`, `account`, `add`, `add-emoji`, `add-extension`, `add-location`, `add-module`, `add-plugin`, `add-small`, `add-user`, `ai`, `airco`, `alarm`, `alert`, `all-tasks`, `analytics`, `annotation`, `announcement`, `appearance`, `apps`, `archive`, `attach`, `attachment`, `back`, `backlog`, `backup-in-cloud`, `blocked`, `blocked-light`, `blockquote`, `bookmarked`, `books`, `brand`, `broadcast`, `broken-image`, `building`, `building-blocks`, `buildings`, `calendar`, `camera`, `cart`, `categories`, `centralized-network`, `certified`, `chart-line`, `checked`, `checked-extra-small`, `checked-small`, `checked-text-document`, `checklist`, `cli`, `close`, `close-circle`, `close-circle-filled`, `close-extra-small`, `close-small`, `code`, `code-block`, `coins`, `collapse`, `columns-2`, `columns-3`, `comment`, `companies`, `company`, `console`, `contact-card`, `cooling`, `copy`, `countdown`, `current-location`, `cut`, `dark-mode`, `database`, `day`, `delete`, `deploy`, `design`, `diploma`, `directions`, `directories`, `directory`, `disabled-database`, `discover`, `dislike`, `dns`, `document`, `documents`, `doing`, `doing-light`, `done`, `done-light`, `download`, `download-document`, `download-from-cloud`, `download-table`, `duplicate`, `edit`, `edit-text-document`, `email`, `embed`, `energy`, `error`, `event`, `exit`, `exit-full-screen`, `expand`, `explore`, `export`, `extension`, `external-link`, `favorite`, `filter`, `firewall`, `fit-to-view`, `flagged`, `folders`, `forbidden`, `form`, `forward`, `frowning`, `full-screen`, `future`, `gallery`, `gem`, `global-settings`, `graph`, `group`, `guide`, `happy`, `hard-drive`, `harvest`, `help`, `hidden`, `hide`, `hierarchy`, `high-priority`, `high-priority-filled`, `high-volume`, `history`, `home`, `hyperlink`, `icon-placeholder`, `idea`, `image`, `image-stack`, `images`, `import`, `inbox`, `indent`, `info`, `information`, `invalid`, `inventory`, `inventory-alt`, `k8s`, `kanban`, `kubernetes`, `lab`, `lab-light`, `label`, `labels`, `languages`, `library`, `license`, `light-mode`, `like`, `local-settings`, `location`, `lock`, `locked`, `locked-database`, `login`, `logout`, `love`, `low-priority`, `low-priority-filled`, `low-volume`, `magic`, `mail`, `markdown`, `medium-priority`, `medium-priority-filled`, `medium-volume`, `memory`, `menu`, `microphone-off`, `microphone-on`, `module`, `monitoring`, `more`, `mute`, `namespace`, `network`, `network-interface-card`, `network-patch-mapping`, `new`, `new-account`, `new-book`, `new-directory`, `new-document`, `new-folder`, `new-k8s`, `new-kubernetes`, `new-namespace`, `new-text-document`, `nic`, `night`, `no-priority`, `notification`, `notifications`, `now`, `office`, `offices`, `open-directory`, `open-folder`, `open-new-page`, `outdent`, `paragraph`, `parking`, `paste`, `path`, `pause`, `pause-filled`, `pipeline`, `pipeline-runner`, `play`, `play-filled`, `play-pause`, `play-pause-filled`, `plugin`, `power`, `primary`, `print`, `privacy`, `processor`, `profile`, `promotion`, `protection`, `quality`, `question`, `ram`, `rated`, `rating`, `read`, `reading-list`, `redo`, `refresh`, `reload`, `remove`, `remove-document`, `remove-extra-small`, `remove-location`, `remove-small`, `remove-user`, `sad`, `save`, `scan`, `search`, `secure`, `secure-link`, `secure-url`, `security`, `send`, `server`, `servers`, `settings`, `sfp`, `share`, `show`, `sitemap`, `smiling`, `sort`, `sort-ascending`, `sort-descending`, `stack`, `stack-code`, `stop`, `stop-filled`, `storage`, `success`, `support`, `sustainability`, `swap`, `switch`, `sync`, `table`, `table-cells`, `tags`, `tasks`, `team`, `text-document`, `text-documents`, `time`, `time-light`, `to-do`, `to-do-light`, `todos`, `tools`, `traject`, `unavailable-database`, `undo`, `unlocked`, `unsecure`, `upload`, `upload-document`, `upload-to-cloud`, `url`, `user`, `user-admin`, `user-settings`, `users`, `valid`, `verified`, `visible`, `warning`, `work`, `workplace`, `write`
