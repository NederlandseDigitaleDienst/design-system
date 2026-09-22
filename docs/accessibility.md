# Accessibility Documentation

## Overview

The NLDD Designsysteem is built with accessibility at its core, ensuring compliance with **DigiToegankelijk** (Dutch Digital Accessibility Standard) and **WCAG 2.1 Level AA** requirements. All components are developed following WAI-ARIA authoring practices and are designed to work seamlessly with assistive technologies.

### Core Principles

- **Perceivable**: All components provide appropriate visual and programmatic information
- **Operable**: Full keyboard navigation support with visible focus indicators
- **Understandable**: Consistent interaction patterns and clear feedback
- **Robust**: Compatible with current and future assistive technologies

### Compliance Standards

- **DigiToegankelijk**: Dutch accessibility standard for government websites
- **WCAG 2.1 Level AA**: International web accessibility guidelines
- **WAI-ARIA 1.2**: Accessible Rich Internet Applications specifications
- **EN 301 549**: European accessibility standard

---

## Accessibility Patterns in Lit Components

All components are built with Lit and implement accessibility features directly in their component styles and templates. The following patterns are used consistently across the design system.

### 1. Visually-Hidden Content

Screen reader-only content should be hidden visually while remaining accessible to assistive technologies. Since components use shadow DOM, visually-hidden styles must be defined in each component's `static styles` or applied via global stylesheet to light DOM content.

**Recommended CSS (add to component styles or global stylesheet):**
```css
.visually-hidden,
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

**Usage:**
```html
<button>
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Delete item</span>
</button>
```

**WCAG Reference:** WCAG 1.3.1 Info and Relationships

---

### 2. Reduced Motion Support

Respects user preferences for reduced motion to accommodate users with vestibular disorders. Add to each component's `static styles` where animations or transitions are used.

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
	animation-duration: 0.01ms !important;
	animation-iteration-count: 1 !important;
	transition-duration: 0.01ms !important;
	scroll-behavior: auto !important;
  }
}
```

**WCAG Reference:** WCAG 2.3.3 Animation from Interactions (Level AAA)

---

### 3. High Contrast Mode Support

All components are tested and optimized for Windows High Contrast Mode and other forced color schemes. Add to each component's `static styles`.

**Features:**
- Ensures focus rings remain visible with system colors
- Form controls maintain visible borders
- Selected states use system highlight colors
- Disabled states use system gray colors

**Implementation:**
```css
@media (forced-colors: active) {
  :focus-visible {
	outline: 2px solid CanvasText !important;
	outline-offset: 2px !important;
  }

  [role="checkbox"],
  [role="radio"],
  [role="switch"] {
	border: 2px solid CanvasText !important;
  }

  [aria-checked="true"] {
	background-color: Highlight !important;
	color: HighlightText !important;
  }
}
```

---

### 4. Focus Management

Consistent, visible focus indicators across all interactive components. Each component implements focus styles in its `static styles`.

**Focus Ring Specifications:**
- **Inner ring**: 2px solid, color via `--semantics-focus-ring-center-color` (#0f172a)
- **Outer ring**: 2px double, color via `--semantics-focus-ring-edge-color` (#ffffff)
- **Thickness tokens**: `--semantics-focus-ring-center-thickness`, `--semantics-focus-ring-edge-thickness`
- **Strategy**: `:focus-visible` to avoid showing focus on mouse clicks

**Standard implementation in Lit component styles:**
```css
.my-element:focus-within {
  box-shadow: var(--semantics-focus-ring-box-shadow);
  outline: var(--semantics-focus-ring-outline);
}

@media (forced-colors: active) {
  .my-element:focus-within {
	outline: 2px solid CanvasText !important;
	outline-offset: 2px !important;
  }
}
```

**WCAG Reference:** WCAG 2.4.7 Focus Visible

---

### 5. ARIA in Lit Templates

ARIA attributes are set directly in Lit templates using standard attribute bindings. Set attributes explicitly in the component's `render()` method.

```typescript
// Set ARIA attributes directly in the template
override render() {
  return html`
	<div
	  role="checkbox"
	  aria-checked=${this.checked}
	  aria-disabled=${this.disabled}
	  tabindex=${this.disabled ? -1 : 0}
	>
	  <slot></slot>
	</div>
  `;
}
```

For dynamic ARIA updates, use Lit's reactive properties with `reflect: true`:

```typescript
@property({ type: Boolean, reflect: true })
checked = false;

@property({ type: Boolean, reflect: true })
disabled = false;
```

---

## Component Accessibility Patterns

### Form Controls

#### Checkbox (`ndd-checkbox`)

**ARIA Attributes:**
- `role="checkbox"` - Identifies as checkbox
- `aria-checked="true|false|mixed"` - Indicates checked state (mixed for indeterminate)
- `aria-disabled="true|false"` - Indicates disabled state
- `tabindex="0"` - Makes keyboard focusable (removed when disabled)

**Keyboard Interaction:**
- `Space`: Toggle checked state
- `Tab`: Move to next focusable element

**Usage:**
```html
<label>
  <ndd-checkbox checked aria-label="Accept terms"></ndd-checkbox>
  I accept the terms and conditions
</label>
```

**WCAG Reference:** WCAG 4.1.2 Name, Role, Value

---

#### Radio Button (`ndd-radio`)

**ARIA Attributes:**
- `role="radio"` - Identifies as radio button
- `aria-checked="true|false"` - Indicates selected state
- `aria-disabled="true|false"` - Indicates disabled state
- Container must have `role="radiogroup"` with `aria-labelledby`

**Keyboard Interaction:**
- `Space` / `Enter`: Select radio button
- `Arrow Up` / `Arrow Left`: Select previous radio in group
- `Arrow Down` / `Arrow Right`: Select next radio in group
- `Tab`: Move to next focusable element (only one radio in group is tabbable)

**Usage:**
```html
<div role="radiogroup" aria-labelledby="payment-label">
  <span id="payment-label">Payment method</span>
  <ndd-radio name="payment" value="card" checked>Credit card</ndd-radio>
  <ndd-radio name="payment" value="ideal">iDEAL</ndd-radio>
  <ndd-radio name="payment" value="paypal">PayPal</ndd-radio>
</div>
```

**WCAG Reference:** WAI-ARIA Radio Group Pattern

---

#### Switch (`ndd-switch`)

**ARIA Attributes:**
- `role="switch"` - Identifies as toggle switch
- `aria-checked="true|false"` - Indicates on/off state
- `aria-disabled="true|false"` - Indicates disabled state
- `aria-label` or `aria-labelledby` required for accessible name

**Keyboard Interaction:**
- `Space` / `Enter`: Toggle switch state
- `Tab`: Move to next focusable element

**Usage:**
```html
<label>
  <ndd-switch checked aria-label="Enable notifications"></ndd-switch>
  Enable push notifications
</label>
```

**WCAG Reference:** WAI-ARIA Switch Pattern

---

### Navigation

#### Menu Bar (`ndd-menu-bar`)

**ARIA Attributes:**
- Menu items should be placed inside for semantic navigation
- Overflow menu: `aria-haspopup="menu"`, `aria-expanded="true|false"`, `aria-controls="menu-id"`
- Dropdown items: `role="menu"` with `role="menuitem"` children

**Keyboard Interaction:**
- `Arrow Left`: Move to previous menu item
- `Arrow Right`: Move to next menu item
- `Home`: Jump to first menu item
- `End`: Jump to last menu item
- `Enter` / `Space`: Open overflow menu
- `Arrow Down` / `Arrow Up`: Navigate overflow menu items
- `Escape`: Close overflow menu and return focus to button

**Usage:**
```html
<nav aria-label="Main navigation">
  <ndd-menu-bar has-overflow-menu overflow-label="Meer">
	<ndd-menu-item selected>Home</ndd-menu-item>
	<ndd-menu-item>Over ons</ndd-menu-item>
	<ndd-menu-item>Contact</ndd-menu-item>
  </ndd-menu-bar>
</nav>
```

**WCAG Reference:** WAI-ARIA Menu Button Pattern

---

### Buttons

#### Button (`ndd-button`)

**ARIA Attributes:**
- Native `<button>` element (no additional role needed)
- `aria-disabled="true|false"` - Mirrors disabled state
- `type="button|submit|reset"` - Indicates button purpose

**Keyboard Interaction:**
- `Space` / `Enter`: Activate button
- `Tab`: Move to next focusable element

**Usage:**
```html
<ndd-button variant="accent-filled" size="md">
  Verzenden
</ndd-button>
```

---

#### Icon Button (`ndd-icon-button`)

**ARIA Attributes:**
- `aria-label` - **Required** accessible label for icon-only buttons
- `aria-disabled="true|false"` - Indicates disabled state

**Keyboard Interaction:**
- `Space` / `Enter`: Activate button
- `Tab`: Move to next focusable element

**Usage:**
```html
<ndd-icon-button
  variant="accent-transparent"
  aria-label="Sluiten">
  <svg><!-- Close icon --></svg>
</ndd-icon-button>
```

**Important:** Icon buttons MUST have an `aria-label` since there is no visible text.

**WCAG Reference:** WCAG 1.1.1 Non-text Content

---

## Keyboard Shortcuts Reference

### Global Navigation

| Shortcut | Action |
|----------|--------|
| `Tab` | Move focus to next focusable element |
| `Shift` + `Tab` | Move focus to previous focusable element |
| `Enter` | Activate button, link, or focused element |
| `Space` | Activate button, toggle checkbox/switch |
| `Escape` | Close modal, dropdown, or overlay |

### Form Controls

| Component | Shortcut | Action |
|-----------|----------|--------|
| Checkbox | `Space` | Toggle checked state |
| Radio Button | `Space` / `Enter` | Select radio |
| Radio Button | `Arrow Up` / `Arrow Left` | Select previous radio |
| Radio Button | `Arrow Down` / `Arrow Right` | Select next radio |
| Switch | `Space` / `Enter` | Toggle on/off |

### Navigation Components

| Component | Shortcut | Action |
|-----------|----------|--------|
| Menu Bar | `Arrow Left` | Previous menu item |
| Menu Bar | `Arrow Right` | Next menu item |
| Menu Bar | `Home` | First menu item |
| Menu Bar | `End` | Last menu item |
| Overflow Menu | `Arrow Down` | Next dropdown item |
| Overflow Menu | `Arrow Up` | Previous dropdown item |
| Overflow Menu | `Escape` | Close menu, return focus |

---

## Testing Guide

### Automated Testing

The design system includes automated accessibility testing tools.

#### ESLint lit-a11y Rules

Lint all components for common accessibility issues:

```bash
npm run lint:a11y
```

**What it checks:**
- Missing `aria-label` on icon buttons
- Correct ARIA role usage
- Valid ARIA attribute values
- Accessible form labels
- Heading hierarchy

#### pa11y-ci (Automated Browser Testing)

Run automated accessibility tests in a real browser:

```bash
npm run test:a11y:storybook
```

**What it checks:**
- Color contrast ratios (WCAG AA: 4.5:1 for text)
- Missing alt text on images
- Form label associations
- ARIA role validity
- Keyboard accessibility

---

### Manual Keyboard Testing

Test all components with keyboard only (no mouse).

#### Checklist

- [ ] **Tab Order**: Can you reach all interactive elements with `Tab`?
- [ ] **Focus Visible**: Is there a visible focus indicator on all elements?
- [ ] **Logical Order**: Does the tab order follow visual layout?
- [ ] **Keyboard Traps**: Can you escape from all components?
- [ ] **Shortcuts Work**: Do all keyboard shortcuts function correctly?
- [ ] **Skip Links**: Can you skip repetitive navigation? (if applicable)

#### Testing Process

1. **Unplug your mouse** or don't touch it
2. Use `Tab` to navigate through the page
3. Verify focus indicators are clearly visible
4. Test all interactive elements with keyboard shortcuts
5. Ensure no keyboard traps exist

**WCAG Reference:** WCAG 2.1.1 Keyboard, WCAG 2.4.3 Focus Order

---

### Screen Reader Testing

Test with VoiceOver (macOS built-in screen reader).

#### Getting Started with VoiceOver

**Activate VoiceOver:**
- `Cmd` + `F5` - Toggle VoiceOver on/off
- `Cmd` + `Fn` + `F5` - On newer Macs

**Basic Navigation:**
- `Control` + `Option` + `Arrow Right` - Next element
- `Control` + `Option` + `Arrow Left` - Previous element
- `Control` + `Option` + `Space` - Activate element
- `Control` - Stop speaking

#### Screen Reader Checklist

- [ ] **All content is announced**: No missing text or labels
- [ ] **Roles are correct**: "Button", "Checkbox", "Radio button", etc.
- [ ] **States are announced**: "Checked", "Disabled", "Expanded"
- [ ] **Form labels**: All inputs have associated labels
- [ ] **Error messages**: Errors are announced clearly
- [ ] **Dynamic changes**: Live regions announce updates
- [ ] **Landmarks**: Navigation, main, complementary regions exist

#### Testing Specific Components

**Checkbox:**
- Should announce "Checkbox, [label], [checked/unchecked]"

**Radio Button:**
- Should announce "Radio button, [label], [1 of 3], [selected/not selected]"

**Switch:**
- Should announce "Switch, [label], [on/off]"

**Button:**
- Should announce "Button, [label]"

**Icon Button:**
- Should announce "Button, [aria-label]"

**Menu:**
- Should announce "Menu, [item count]" and navigate with arrows

**WCAG Reference:** WCAG 1.3.1 Info and Relationships, WCAG 4.1.2 Name, Role, Value

---

### Visual Testing

Test with different visual settings and zoom levels.

#### Zoom and Magnification

Test at **200% zoom** minimum (WCAG AA requirement):

```bash
# Browser zoom
Cmd + '+' (increase)
Cmd + '-' (decrease)
Cmd + '0' (reset)
```

**Checklist:**
- [ ] Content doesn't overflow or get cut off
- [ ] Horizontal scrolling is not required
- [ ] Text remains readable
- [ ] Interactive elements remain clickable
- [ ] Layout adapts appropriately

**WCAG Reference:** WCAG 1.4.4 Resize Text

---

#### Color Contrast

Ensure sufficient contrast ratios:

**WCAG AA Requirements:**
- **Normal text** (< 18pt): 4.5:1 contrast ratio
- **Large text** (≥ 18pt or 14pt bold): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio (borders, icons)
- **Focus indicators**: 3:1 contrast ratio

**CSS variabelen:**
```css
--primitives-color-accent-100: #154273    /* Lintblauw - primary accent */
--primitives-color-neutral-800: #0f172a  /* Dark text on light backgrounds */
--primitives-color-neutral-0: #ffffff    /* Light backgrounds */
```

**Testing Tools:**
- Chrome DevTools: Contrast ratio shown in color picker
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser extensions: axe DevTools, WAVE

**WCAG Reference:** WCAG 1.4.3 Contrast (Minimum)

---

#### Dark Mode / Color Schemes

Test with different color schemes:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles if implemented */
}
```

**Note:** Currently, the design system uses a light color scheme. Dark mode support is planned for future releases.

---

## Developer Checklist

Use this checklist when creating new components or features.

### Semantic HTML

- [ ] Use native HTML elements when possible (`<button>`, `<a>`, `<input>`)
- [ ] Avoid `<div>` or `<span>` for interactive elements
- [ ] Use headings (`<h1>` - `<h6>`) in logical order
- [ ] Use landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`

### ARIA

- [ ] Add `role` attribute only when native HTML is insufficient
- [ ] Set `aria-label` or `aria-labelledby` for all form controls
- [ ] Use `aria-describedby` for additional help text
- [ ] Update `aria-checked`, `aria-expanded`, `aria-disabled` as state changes via Lit reactive properties
- [ ] Never use ARIA when native HTML can do the job

**ARIA Rule #1:** No ARIA is better than bad ARIA.

### Keyboard Navigation

- [ ] All interactive elements are keyboard accessible
- [ ] `Tab` order is logical and follows visual layout
- [ ] Custom keyboard shortcuts are documented
- [ ] No keyboard traps exist
- [ ] Focus remains visible at all times

### Focus Management

- [ ] Visible focus indicator on all interactive elements using `--semantics-focus-ring-*` tokens
- [ ] Focus indicator has 3:1 contrast ratio minimum
- [ ] Use `:focus-visible` to avoid mouse focus rings
- [ ] Don't remove outlines with `outline: none` without replacement
- [ ] Manage focus when content changes (modals, dropdowns)
- [ ] Include `forced-colors` fallback in component styles

### Color and Contrast

- [ ] Text contrast ratio meets WCAG AA (4.5:1 for normal text)
- [ ] UI component contrast meets WCAG AA (3:1)
- [ ] Don't rely on color alone to convey information
- [ ] Test in Windows High Contrast Mode
- [ ] Provide visual focus indicators with sufficient contrast

### Forms

- [ ] All inputs have associated `<label>` or `aria-label`
- [ ] Error messages are programmatically associated with inputs
- [ ] Required fields are marked with `aria-required="true"`
- [ ] Error messages are announced to screen readers
- [ ] Form validation is accessible

### Dynamic Content

- [ ] Use `aria-live` regions for dynamic updates
- [ ] Set `aria-live="polite"` for non-critical updates
- [ ] Set `aria-live="assertive"` for critical alerts
- [ ] Announce loading states to screen readers
- [ ] Manage focus when content is added/removed

### Images and Icons

- [ ] Decorative images have `aria-hidden="true"` or empty `alt=""`
- [ ] Informative images have meaningful `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] SVG icons have `aria-hidden="true"`
- [ ] Icon fonts are hidden from screen readers

### Lit-specific

- [ ] Use `reflect: true` on boolean ARIA-related properties so attributes stay in sync
- [ ] Set ARIA attributes directly in `render()` templates, not via external helpers
- [ ] Add `prefers-reduced-motion` and `forced-colors` blocks to component `static styles` where animations or borders are used

### Testing

- [ ] Test with keyboard only (unplug mouse)
- [ ] Test with VoiceOver (macOS) or NVDA (Windows)
- [ ] Test at 200% browser zoom
- [ ] Run automated tests: `npm run lint:a11y`
- [ ] Test in Windows High Contrast Mode (if possible)
- [ ] Validate HTML with W3C Validator

---

## Resources

### Standards and Guidelines

- [DigiToegankelijk](https://www.digitoegankelijk.nl/) - Dutch accessibility standard
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) - ARIA specification
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) - Component patterns

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [pa11y-ci](https://github.com/pa11y/pa11y-ci) - Automated CI testing

### Screen Readers

- **VoiceOver** (macOS/iOS) - Built-in, free
- **NVDA** (Windows) - Free, open source
- **JAWS** (Windows) - Commercial

### Learning Resources

- [WebAIM](https://webaim.org/) - Web accessibility articles and guides
- [The A11Y Project](https://www.a11yproject.com/) - Community-driven accessibility resources
- [Inclusive Components](https://inclusive-components.design/) - Accessible component patterns

---

## Support

For accessibility questions or to report accessibility issues:

1. Check this documentation first
2. Review component-specific Storybook documentation
3. Consult the WAI-ARIA Authoring Practices Guide
4. File an issue in the project repository with the label `accessibility`

**Our commitment:** All accessibility issues are treated as high priority and will be addressed promptly to ensure DigiToegankelijk and WCAG 2.1 AA compliance.
