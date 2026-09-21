<!--
  GEGENEREERD BESTAND — niet handmatig bewerken.
  Kopie van de root CHANGELOG.md (onderhouden door semantic-release).
  Hergenereren: npm run generate:skill-docs
-->

# Changelog

All notable changes to the NLDD Designsysteem are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Versions are bumped automatically by semantic-release on merge to main —
the type of conventional-commit determines the release. Conventional types
`chore`, `docs`, `ci`, `style`, `test`, `build` are intentionally omitted
here; consult the commit history if you need that level of detail.

### Changed

- **The system is called the NLDD Designsysteem.** Half the name was English while everything under it is Dutch, down to the colors: `lintblauw`, `robijnrood`, `mosgroen`. The category is Dutch now and the organisation keeps its name. Nothing you type changes: the package is still `@nldd/design-system`, the tags are still `nldd-button` and `NLDDButton`, and the repository keeps its name. In Dutch prose it is "het designsysteem", and there is no abbreviation.

- **A redrawn favicon and touch icon.** A simpler mark on a white field, with the blue tile behind it. Both ship in `dist` and are exported as `@nldd/design-system/favicon.svg` and `/touch-icon.png`, so a page that references them picks up the new drawing. The old favicon swapped its tile and mark under `prefers-color-scheme: dark`; this one keeps its colors.

### Fixed

- **A typeahead in the text editor appears where you are typing, inside an overlay too.** The `@`-mention list and your own typeaheads in `nldd-text-editor` worked, but you could not see them once the editor sat in an `nldd-sheet`, an `nldd-modal-dialog` or an `nldd-window`: the list landed beside the page, or was cut off at the edge of the overlay. CodeMirror hangs that list in the editor, so everything around the editor applied to it. An overlay hides its overflow and cut it off, and an ancestor with a transform became the frame a `position: fixed` list measures against, which counted the overlay's offset twice. The list opens in the top layer now, the way an `nldd-menu` does: nothing around the editor reaches it, and it has the whole window instead of the room left over in a short dialog. The overlays keep no transform once they are open either, where the animation that slides an `nldd-sheet` or an `nldd-modal-dialog` in used to leave the position it ended on behind, so anything else in an overlay that positions itself against the viewport lands right as well.

- **A radio no longer holds a second radio inside it.** Since 0.8.89 `nldd-radio-button`, `nldd-radio-button-field` and `nldd-toggle-button` in radio mode carry `role="radio"` themselves, and each still rendered a native radio inside to answer `required`. Out of sight and out of the tab order, but accessibility checkers read the nesting itself: axe reported `nested-interactive` once for every option, so a radio group of two failed twice. That radio is `hidden` now. It still answers `required` in the browser's own words, and an invalid submit puts the focus and the message on the radio itself. In `nldd-segmented-control` they land where Tab would: on the chosen option, or the first one that is enabled.

- **A `rel` of your own adds to `noopener noreferrer` instead of replacing it.** On a link that opens a new tab, `nldd-button`, `nldd-icon-button` and `nldd-status-bar` dropped their `noopener noreferrer` the moment you set a `rel` yourself, so `target="_blank" rel="external"` sent the page it opened the address you came from. `nldd-list-item` and `nldd-list-item-segment` never added it at all. Every component that renders a link now does what `nldd-link`, `nldd-card` and `nldd-avatar` already did: with `target="_blank"`, `noopener noreferrer` is added to the `rel` you set.

## [0.8.91](https://github.com/NederlandseDigitaleDienst/design-system/compare/v0.8.90...v0.8.91) (2026-09-20)

## [0.8.90](https://github.com/NederlandseDigitaleDienst/design-system/compare/v0.8.89...v0.8.90) (2026-09-19)

## [0.8.89](https://github.com/NederlandseDigitaleDienst/design-system/compare/v0.8.88...v0.8.89) (2026-09-18)

### Highlights

- **A notification reaches you wherever you are working.** Since 0.8.88 a notification moves into the topmost open overlay, and this release finishes that job. One raised in a sheet, a window or a modal dialog that was already open before the first notification arrived now finds it, where it used to sit behind the backdrop, dimmed and out of reach of a click. In an overlay notifications show in the browser's top layer, in the corner of the screen, instead of inside the sheet that slides them away or the dialog that cuts them off. Escape dismisses the notification and leaves the overlay open behind it. And in Chrome and Edge the open deck stays open while you work through it: dismissing one used to fold the rest away, so every next notification meant opening the list again.

- **A radio group is one group again, and a screen reader counts it as one.** VoiceOver announced every option as "1 of 1", in `nldd-segmented-control` and just as much in `nldd-radio-button-group`, `nldd-toggle-button-group type="radio"` and loose radio buttons. Each option rendered a native radio in a shadow root of its own, and the browser groups radios within one tree only, so every option was a group of one. `aria-setsize` does not fix that: VoiceOver counts the native group it sees and ignores the number. The option itself is the radio now, and a group is one tree again. The count is right, Tab stops once per group instead of once per option, the arrow keys move and choose the way they do for native radios, and a required group holds the form until something is chosen.

### Changed

- **The edge of a surface is lighter than a line inside it.** `--semantics-surfaces-base-border-color` and `--semantics-surfaces-tinted-border-color` followed `--semantics-dividers-color`, so the outline of a card, a table or a list was drawn in the same grey as a rule between two rows. That reads hard: the edge that holds a container together was as loud as a line that separates its content. Both are one step lighter on the grey ramp now, `neutral-50` in light mode and `neutral-150` in dark, which takes a third to a half off their contrast with the surface they sit on. Everything that draws its edge from these tokens follows: `nldd-table`, `nldd-list`, `nldd-code-viewer` and `nldd-rich-text`. Dividers keep the grey they had.

### Fixed

- **A typeahead popup in `nldd-text-editor` looks like the menu it says it is.** It carried a hairline where `nldd-menu` has none and leans on its shadow alone. CodeMirror gives every tooltip a border of its own, and the popup re-themed that one instead of taking it off. It is off now.

- **Typing a bare URL in `nldd-text-editor` keeps the whole address in the link.** A `www.` address parses as a finished link long before it is finished being typed: at `www.apple.c` the editor already had a link with a badge, put the caret on the far side of that badge, and wrote the rest of the address behind a space of its own. You ended up with `www.apple.c om`, and the link pointed at `https://www.apple.c`. The caret now stays on the link's side while the address grows, so every next letter joins it. What ends a URL is what ends one in Markdown: a space, a `<`, or the punctuation GFM leaves off the end. A `[text](url)` link is unaffected, because its `)` really does finish it.

- **A `type="listbox"` keeps its search field, whatever its rows do.** Since 0.8.84 a list with no rows at all takes its search field and its `[slot="toolbar"]` off the page along with them, on the reasoning that there is nothing left to search in. That is right for rows that are already on the page and get filtered by hiding them. It is wrong for a listbox, where the search field is where the rows come from in the first place. A consumer that queries its backend per keystroke and slots the matches back in, which is the only way to reach every entry in an index of thousands, has no rows before the first query and none after a query that matched nothing, so the field went missing in exactly the two states that need it: an opening popover showed a message and no way to type. The field, the toolbar and the list itself now stay in listbox mode. And because an untouched listbox has no question to answer yet, `[slot="empty"]` waits for a query the way `[slot="no-results"]` already did: an empty search is not an empty list.

- **`nldd-image` no longer warns about a missing `alt` when the slotted image has one.** The dev warning only read the `alt` on `nldd-image` itself. Slot your own `<img alt="…">`, the way Astro's `<Image>` renders it, and the warning went off anyway, once for every image on the page. It now judges what is slotted. An `<img>` passes with any `alt`, because an empty one is how a decorative image says so. A `<picture>` around such an `<img>` passes too, and so does an `<svg>` with `role="img"` and an `aria-label`, `aria-labelledby` or `<title>`. Media hidden with `aria-hidden="true"` needs no name. The check runs again whenever the slot content changes. And an image with neither a `src` nor slotted media has nothing to judge yet, so it stays quiet until one of them arrives.

- **`nldd-notification` no longer lands behind a sheet, window or modal dialog that was already open.** Since 0.8.88 a notification moves into the topmost open overlay, but the region only started to watch for overlays when the first notification arrived. An overlay that opened before that went unnoticed. The first notification raised in it stayed on the body, dimmed behind the backdrop and out of reach of a click or the keyboard. The region now watches from the moment the code loads. And when that code loads after an overlay opened, the region looks for the overlay instead of waiting to hear about it.

- **A notification in a sheet or a modal dialog sits in the corner of the screen, above the overlay.** Since 0.8.88 a notification moves into the topmost open overlay. A sheet and a modal dialog keep a transform after their opening animation, though, and that made the overlay the box the notification was placed in. In a sheet it sat inside the sheet and slid away with it. In a modal dialog it covered the content and was cut off at the edge of the dialog. In an overlay, notifications now show in the browser's top layer, in the corner of the screen and above the overlay. And a notification that is already on screen stays put when an overlay opens or closes, where it used to slide in from off the screen all over again.

- **Escape on a notification dismisses the notification and nothing else.** With focus on its action or its dismiss button inside a sheet or a dialog, Escape dismissed the notification and closed the overlay behind it too.

- **An open list of notifications stays open while you work through it.** In Chrome and Edge, dismissing one notification from the open list folded the deck up again, and so did a click on the text of another one. Every next notification meant opening the list first. Those browsers focus a button when you click it, and the region read focus leaving as the reader moving on. Focus now opens and closes the list for the keyboard only: tabbing into the deck opens it, and tabbing away closes it. With a pointer, a click outside the notifications closes it, and a click on a button in a closed deck no longer opens it.

- **A radio group says how many options it has, and Tab stops at it once.** `nldd-segmented-control`, `nldd-radio-button-group` and `nldd-toggle-button-group type="radio"` rendered a native radio in a shadow root of its own, and the browser groups radios within one tree only. Every option was a group of one: VoiceOver announced each of them as "1 of 1", and Tab stopped at every option instead of once. The option itself is the radio now, so a group sits in one tree again. A screen reader counts the options and says which one you are on, and only the chosen option is in the tab order, or the first enabled one when nothing is chosen. The arrow keys move between the options as before, and what a group submits has not changed.

- **`nldd-radio-button`s and `nldd-radio-button-field`s that share a name behave as one group.** Loose radio buttons and fields with the same name, the way the documentation shows them, could all be checked at once, because each was a group of its own. They now group the way native radios do, by name within the same form: checking one unchecks the others, the arrow keys move between them and check the one they land on, Tab stops at the group once, and each announces its place. A field inside an `nldd-radio-button-group` keeps taking its place from the group, and a button with `no-tab` leaves Tab and the arrow keys to the container that set it. Put the options of a group in a container with `role="radiogroup"`, or in an `nldd-radio-button-group`: a screen reader counts them from there, and a bare `<fieldset>` is a group rather than a radiogroup.

- **`required` on a radio group asks for one answer, not one per option.** A required `nldd-segmented-control` never reported anything, so the form submitted with nothing chosen. A required `nldd-toggle-button-group type="radio"` and required loose `nldd-radio-button`s reported it from every option at once, so the form refused to submit even after you chose one. A single required radio outside a group refused to submit at all, chosen or not. Each of them now answers the question a radio answers: is anything in this group chosen. The browser writes the message, in the user's language, and points it at the group.

## [0.8.88](https://github.com/MinBZK/storybook/compare/v0.8.87...v0.8.88) (2026-09-15)

### Fixed

- **`nldd-page` no longer runs its own measurements into a loop.** Chromium reported `ResizeObserver loop completed with undelivered notifications` every time a page mounted or its chrome resized, and an app with a global error listener surfaced that as a red error it could do nothing about. Nothing looked wrong, because the layout settled on the next frame, but the page never reached `document_idle`, which is what browser automation waits on, and the console filled with a message that buried the real ones. Two observers were measuring the same header and writing styles that resized what the other was watching: one set `padding-top` on the scroller, and because the scroller's outer height is fixed by the flex layout, that padding shrinks the content box the other observer was measuring. There is one observer now. The padding comes from the header height that was already being measured, and a published value is written only when it changed, so a measurement that has settled cannot feed the next notification. The padding still freezes once you scroll, so a top title bar that shrinks past its anchor does not drag the content up with it.

- **`nldd-notification` works from inside a sheet, a window and a modal dialog.** A notification raised while one of those was open was created, joined the deck, counted down and removed itself without ever being seen, and nothing was logged. A modal overlay paints in the browser's top layer, above the whole page and beyond the reach of any z-index, so the region sitting on the body was behind it. Promoting the region to the top layer would not have been enough either: while a modal is open everything outside it is inert, so the message would have been visible and every click on it would have gone through to whatever sat underneath. So the region travels instead. It moves into the topmost open overlay and sinks back as they close, a notification already on screen comes along rather than being left behind, and one raised from inside a sheet is readable and reachable where it was raised. Nothing changes for a page with no overlay open, and the position is still not settable.

- **`package-lock.json` travels with the release again.** The release bumps it along with `package.json`, but it was not in the list of files the release commit carries, so that bump was thrown away every time: the lockfile sat at 0.8.83 while the package ran on to 0.8.87. Anyone installing the repository from a release tag got a lockfile naming a version four releases old. Both files are committed together from now on, and they are back in step.

## [0.8.87](https://github.com/MinBZK/storybook/compare/v0.8.86...v0.8.87) (2026-09-09)

### Highlights

- **`nldd-text-editor` had a round of polish, and it shows in the small things.** Bold no longer flickers while you type it: a space before the closing markers used to drop the run to plain text on every word boundary, and now the styling holds until you leave, when the space moves outside the markers. Wrapping a selection leaves the space out too, and a toggle at the end of a run steps out of it instead of undoing it. The caret sits on one spot whichever way it arrived, is centered on the insertion point, and has room at the edges of a line. The open-link badge behaves like a character you cannot delete: the arrows step over it, Backspace and Delete stop at it, a click lands on the side you clicked, and text goes to the side it was typed on. The list commands take an empty line, keep an item you have not typed in yet, and put the caret after the marker, and `toggleTaskList()` makes a task list. An `@` inside a word, an e-mail address, is no longer a mention. And the typeahead grew into an API: `typeaheads` for lists of your own on any trigger, with `insert` deciding what a choice writes, avatars, icons and symbols on the rows, and `insertAtCursor()` for a button of your own. One rename to take along: a candidate says `text` and `supportingText` now.

- **A dialog that holds something reads left.** Everything in this system aligns left except dialog text, which was always centered. That is right for an empty state, where an icon sits above a short line in a container with nothing else in it. It is wrong the moment the dialog holds a task: a field you slot in starts at the left edge while the heading above it sits on a second axis, and the two fight. So the alignment now follows the default slot, in `nldd-inline-dialog` and in the `nldd-modal-dialog` that renders one. Nothing to set: an empty slot is a message and stays centered, anything in the slot is a task and aligns left.

- **An Erlenmeyer flask, in two weights.** `erlenmeyer-flask` draws the conical flask in outline, a rim at the top and a band of liquid filled in at the bottom. `erlenmeyer-flask-light` is the same flask with a thinner line, on the 32 view-box the other light weights use. The aliases are `lab` and `lab-light`, for what the flask stands for: a laboratory, an experiment, a test setup.

### Added

- **Icons.** `erlenmeyer-flask` (alias `lab`) and `erlenmeyer-flask-light` (alias `lab-light`).

- **`typeaheads` on `nldd-text-editor`: your own lists next to the `@`-mention.** Each entry is a trigger character (`#`, `:`, `/`), a `source` that returns candidates for what was typed after it, and an optional `insert` that decides what a choice writes. Without one it writes the trigger, the text and a space; return the id for an emoji, or `@username ` for a system that wants a plain mention for its notifications. Lists on one trigger are merged, in order. A choice fires `nldd-text-editor-typeahead` with the trigger, the candidate and where the text sits. This is what a second trigger needed: an `autocompletion()` of your own collided with the editor's, and the workaround was a subclass reaching into the CodeMirror view. That view is not API, and with this it does not have to be. (#200, #204)

- **`avatar`, `icon` and `symbol` on a typeahead candidate.** A person or organization shows as an `nldd-avatar` (an image, or initials from the text; `avatar: {}` is enough), and its row takes two lines, its `supportingText` under the text. A channel shows as an `nldd-icon` at the size of a menu item's, an emoji as itself (`symbol`), in front of the label, so a list is scannable at a glance. The built-in mention takes them too. (#204)

- **`replaceRange(from, to, text)` on `nldd-text-editor`.** Writes at the same clean offsets `getSelection()` and the annotations read, so a consumer can act on what it found there. Both offsets are clamped into the text.

- **`setList('task')`, and a `runCommand` that reaches every method.** The list setter had bullet and ordered but no task, so an exclusive list picker could not offer one. `runCommand` now also takes `codeBlock`, `setHeading`, `setList`, `indent`, `outdent`, `undo` and `redo`; our own toolbar story needed a wrapper around it for exactly those. A name that is not a command warns instead of doing nothing, so a typo in a toolbar shows up.

- **`insertAtCursor(text)` on `nldd-text-editor`.** Puts text at the caret, in place of a selection, and leaves the caret after it with focus kept. Setting `value` replaced the whole document and reset the caret, and `paste()` reads the clipboard, so there was no way to insert a piece of text from a button of your own. (#200)

- **`toggleTaskList()` on `nldd-text-editor`, and `taskList` in its state.** The parser already read GFM task items; there was no command to make one. It turns the selected lines into `- [ ] ` items, keeping a bullet's or numbered item's indent, and back into bullets once they all are tasks, so only the box goes and the list stays. Checking a box is not a command. `runCommand('taskList')` reaches it too, and `getState().active.taskList` reports it for a toolbar.


### Changed

- **`nldd-text-editor` does a lot less work per keystroke.** Every typed character used to read the whole document out and walk it about ten times: the annotation overlay maintained its sentinels (four passes, even in an editor that never turned annotations on and had none), the ordered lists were renumbered from top to bottom, and the mention chips were rebuilt from the whole syntax tree, that last one on every arrow key too. Now the annotation work is skipped while there is nothing to anchor, the renumbering runs only when an edit can have disturbed a number (a line break came or went, or a numbered line was touched), and the mention chips are rebuilt when the selection actually covers a different mention. The sentinel bookkeeping no longer rebuilds a copy of the document to compare against, and the hanging indent walks the lines once instead of looking up each one. Nothing changes in what you see; a long document just keeps up with your typing.

- **`nldd-text-editor-state` only fires when the state changed.** It fired on every cursor move, so a toolbar re-rendered its toggles on every arrow key while none of them changed. It now carries the same `TextEditorState` as before, only when one of its values differs from the last one handed out.

- **The typeahead list of `nldd-text-editor` is at least as wide as an `nldd-menu`, 280px.** It sized itself to its longest row, so a short list of names was a narrow strip that changed width as you typed.

- **`from` and `to` in `nldd-text-editor-mention` are clean offsets.** Like `getSelection()` and the annotations: the document carries sentinels for annotations that the value never shows, and the event counted them. Without annotations nothing changes.

- **A toggle at the end of a run in `nldd-text-editor` steps out of it.** With the caret right before the closing markers, `toggleBold()` (and Cmd/Ctrl+B) stripped both markers, so bold, type, bold ended with the bold undone. It now puts the caret after the run, past a space that follows it, where the next word starts. A caret inside the word still unwraps the run, and so does a selection. Same for italic, strikethrough and inline code.

- **The favicon turns itself around in dark mode: white tile, blue arms.** Measured against a dark tab strip, the `#154273` tile sits at 1.14:1 in Firefox, 1.18:1 in Chrome and 1.35:1 in Safari. That is not a tile any more, it is the strip with white arms floating on it. The swap puts it at 11.7 to 13.8:1, and white with the arms in lintblauw is a variant the house style already has, so nothing is invented. In light mode nothing changes: there it is 7.78:1 and works as drawn. The rule travels inside the SVG, because a favicon is drawn against the browser's own chrome and no stylesheet of yours can reach it. Two things follow from that. It reads the operating system rather than your site's own light/dark toggle, so a page you have forced to dark keeps the light icon. And a browser that ignores the `<style>` falls back to the `fill` attributes, which are still the light values, so it keeps exactly the icon it had. Point your `<link rel="icon" type="image/svg+xml" sizes="any">` at it; `sizes="any"` is what keeps Chrome from preferring a `favicon.ico` you may also be serving. Recoloring the file for your own background now means two values rather than one. `touch-icon.png` is a bitmap and cannot follow, which costs nothing: it sits on a home screen, not in a tab strip.

- **`nldd-inline-dialog` and `nldd-modal-dialog` take their alignment from their slot.** Content in the default slot aligns the text, the icon and the actions left, and lays those actions out in a row at their own width instead of stacked full-width. An empty slot keeps the centered empty state exactly as it was. Both are derived rather than defaulted, so an empty state needs no attribute and a form dialog stops needing a workaround. `horizontal-alignment` overrides it in both directions, for a long message that reads badly centered or for slotted content that is symmetric on its own. `nldd-modal-dialog` forwards it. Two things the slotted case exposed along the way, neither reachable before: content in the slot now keeps its distance from the text above it, and in the centered mode it is genuinely centered rather than merely full-width.

- **`size="inherit"` on `nldd-icon` is reachable at last, and sits on the text's own line.** It sizes the icon to the text around it (`1em`), which is what you want for an icon set in a line of running text: a fixed size in px falls out of step the moment the text grows, and the first reader who zooms is the one who finds out. It rode visibly high, though, because an inline box sits with its bottom edge on the baseline while the text itself hangs below that line. A `vertical-align: -0.15em` drops it back onto the line. The value has been in the component from the start, but the story control offered neither it nor `full`, and labeled the empty option `(inherit)` while an empty size in fact fills the container. That one word said the opposite of what it did. There is a story for it now, with five different icons in a sentence at three text sizes, because how heavy an icon reads in a line comes from its drawing rather than its size: a check mark fills half its box in height where a lock or a clock nearly fills it.

### Breaking

- **`label` and `detail` on a mention candidate are `text` and `supportingText`.** The words the rest of the system uses: `text` on a button, a menu item and a title cell, and `supporting-text` under it on a button and a title cell. `MentionCandidate` is `{ id, text, supportingText? }` now, and `nldd-text-editor-mention` carries `text` instead of `label`. The typeahead candidates use the same names.

- **`modeless` is gone from `nldd-sheet` and `nldd-window`.** Both are always modal now: they open with `showModal()`, draw a backdrop and hold focus. The attribute promised an overlay you could leave open while working behind it, and the native `<dialog>` gives you the shell for that but none of the things that make it usable. Nothing in this system set it on either one, and the sheet's own story warned in its text that it did not lay out correctly. Whatever it was reaching for wants solving on its own terms rather than as a flag on a component built to be modal. `nldd-window` is still the positionable overlay: `top`, `left`, `right`, `bottom`, `centered`, `width` and `height` are what set it apart from `nldd-modal-dialog`, not this.

- **`timing="default"` is now `timing="delay"`.** On `nldd-tooltip` (a 700ms show delay) and on `nldd-activity-indicator` (a 1000ms anti-flash delay), and on the `tooltip-timing` of `nldd-avatar` and `nldd-icon-button`, which forward it. A value named for its position in the list says nothing about what it does, and it breaks the day the default moves. Beside `instant` and `never`, `delay` is the only word that says when the thing appears, which is what those two already do. Which value is the default lives in the component, and an attribute equal to the default is dropped from the DOM anyway, so leaving it out and writing it are the same thing.

- **`color="default"` on `nldd-avatar` is now `color="neutral"`.** Same reason. Not `neutral-tinted`: that fill is neutral-100 in light and neutral-300 in dark, where the shared neutral-tinted family is 75/200 on buttons and 50/150 on categories, so the name would promise a scale it is not on.

- **`color` says `content` on `nldd-title`, `nldd-rich-text`, `nldd-text`, `nldd-text-cell`, `nldd-title-cell` and `nldd-icon-cell`.** On the first two the attribute had one value, `inherit`, and leaving it off meant the system's own text colors. Nameless, so the story control had to invent a word for the empty option and landed on `(auto)`, which sat in the same dropdown as `inherit` and read as a second way of saying "take it from somewhere else". They are opposites: `content` is the system's color, `inherit` is the surface's. Both are words now and there is nothing left to label. On `nldd-text` and the three cells that same color was called `default`, which said where it sat in the list rather than what it did, next to `secondary`, `accent`, `success`, `warning` and `critical` that all say what they are. They share one color scale and are read side by side in a row, so they move together. `content` is the word the tokens already use, as in `--semantics-content-color` and the `primary-content` of `nldd-icon`.

- **`size` on `nldd-link` defaults to `inherit`.** Leaving it off already behaved as `inherit`: the CSS gives `:host(:not([size]))` and `:host([size="inherit"])` the same rules, and the story had a row saying so out loud. But the property held no value at all, so the control offered `(geen)` and `inherit` as two entries for one behavior, and reading `size` back gave `undefined`. Now it says what it does. Nothing renders differently.

- **`size` on `nldd-avatar` and `nldd-icon` defaults to `full` instead of an empty string.** `full` was already implemented on both, already in the type and already documented as the default. Only the property disagreed. Nothing renders differently. Read `size` back and you now get `full` where you got `''`.

### Fixed

- **Switching a task list to another list type takes the checkbox along.** `setList('bullet')` on `- [x] klaar` stripped the bullet and wrote a new one, leaving `- [x] klaar` unchanged; ordered gave `1. [x] klaar`. The box belongs to the marker, so it goes with it, on a line that was a list item. A paragraph that happens to start with `[x]` is text and stays as it is.

- **Wrapping a selection in `nldd-text-editor` leaves the space out.** A drag or a double-click usually takes the space after a word along, and `toggleBold()`, `toggleItalic()` and `toggleStrikethrough()` wrapped it as it was: `**woord **`, which is not bold, since a closing run may not follow whitespace. The markers now go around the text and the whitespace stays where it was, `**woord** `. A selection of nothing but whitespace is left alone. (#212)

- **Bold in `nldd-text-editor` no longer flickers while you type it.** Every space before the closing markers turned `**dit is **` back into plain text (the weight, the size of the markers, the line height) until the next letter arrived. The emphasis the caret is in is now held: its styling stays, whatever the parser says, as long as the caret is between the markers. When the caret leaves, or the editor blurs, the space that broke it is moved outside the markers, `**dit is** `, which is what wrapping a selection produces too. Enter twice at the end of a bold word closes the bold after the word. Italic and strikethrough the same. (#213)

- **The caret in `nldd-text-editor` lands on the same spot whichever way it arrives.** CodeMirror draws the caret on the side it came from: arriving from the left it measures the right edge of the letter before the position, from the right the left edge of the letter after it. On upright text those are one place. On italics they are not, because a slanted glyph overhangs its own advance, and Safari rounds each edge to a whole pixel on top of that, so arrow left and arrow right onto the same spot in a blockquote drew the caret a pixel apart. The editor now draws its own caret and uses one side unless the two are genuinely apart, which is what a link badge, an annotation count or a line wrap look like. Those keep the direction, since there the sides are different places.

- **The open-link badge in `nldd-text-editor` behaves like a character you cannot delete.** It stands at the link's end, and the caret there had two places to be: against the URL or after the badge. It was always drawn after the badge, whatever you were doing, so deleting the last character of a URL looked like editing outside the link while the next Backspace ate the URL again, and an arrow key skipped one of the two places. Now the arrows step from one side of the badge to the other before moving on, Backspace and Delete step over it instead of eating past it, a click lands on the side you clicked (CodeMirror read the side of a click from the line, not from the pointer, and put a click right of the badge on its left), deleting the character after a link leaves the caret where that character was, on the badge's right, and text goes to the side of the badge it was typed on: against the URL while you type it, after the badge once you are past it. Markdown has no boundary after a bare URL, `www.apple.comx` is one URL, so text typed right of the badge gets the space that is the boundary written in front of it; punctuation that ends a URL by itself (a period, a comma) needs none. The same two stops for a bare URL and for a `[text](url)` link; there, text typed on the link's side of the badge lands after the `)`, so after the link and its badge. (#214)

- **The caret at the end of an annotation in `nldd-text-editor` no longer jumps by the tint's padding.** Measured from the badge it stopped at the badge's edge, measured from the text after the annotation it started where that text does, and the tint's inline padding sat between the two. The badge's outside edge is the tint's edge now.

- **The caret in `nldd-text-editor` is centered on the insertion point.** CodeMirror centers its own 1.2px caret with a fixed -0.6px margin. Ours is 2px, and kept that margin, which left it 0.4px to the right of where the text breaks. It is centered from its own width now. This finishes what the earlier padding change started.

- **The line commands of `nldd-text-editor` no longer skip an empty line, drop an unfinished item, or leave the caret in front of the marker.** `setList('bullet')` on an empty document did nothing, because a blank line is treated as the gap between items and gets no marker. That rule is right in a selection and wrong when the blank line is the only one there, which is the case that matters: the empty document you start in. Switching an item that had a marker but no text yet, `- ` to numbered, produced an empty line instead of `1. `, for the same reason. And after any of these the caret stayed where it was, before the marker, so the next keystroke landed in front of it. A single blank line now takes the marker, an item stays an item across a type switch, a bare `-` counts as an item, and the caret is carried past whatever was written at it. Headings and quotes get the same caret treatment.

- **Cmd/Ctrl+] in `nldd-text-editor` nests a list item instead of making a code block.** The generic keymap bound it to a four-space indent, and four spaces at the start of a line are markdown's indented code block, so pressing it twice on plain text switched the paragraph to monospace. It now runs the editor's own list indent, and Cmd/Ctrl+[ its outdent. Off a list item both do nothing, which beats a code block nobody asked for.

- **The mention list in `nldd-text-editor` no longer opens inside a word.** The trigger looked for an `@` followed by name characters and never at what came before it, so typing an e-mail address opened the list the moment the domain matched a name: `piet@sam` offered Sam. An `@` now only counts at the start of a line or after whitespace, and not inside a backtick span or a code block, where it is quoted text. The same rule drives the reopen after a backspace, so the two cannot disagree. Two of the points raised alongside it are left for a change of their own, since they alter what your source receives: the name class is still ASCII, so an accented name is cut at the accent, and a space still ends the query, so a surname cannot be found by typing it after the first name.

- **The caret in `nldd-text-editor` stands on the insertion point instead of beside it.** It was nudged 0.6px right, to stop the first caret of a line from being clipped: the `simple` variant has no inline padding, so a caret that CodeMirror draws slightly left of the text position overhung the scroller's edge and came out thinner there than mid-line. The nudge fixed that one spot and skewed every other caret, which shows against a narrow letter. The editor now keeps room for the caret's own ink instead, its width plus the halo, so the nudge is gone and the caret sits where the text does. Measured at the first position of a line: the ink starts 1.41px inside the edge where it used to hang 1.6px over it. The text moves 3px inward in the `simple` variant, which is the visible cost.

- **`box` on `nldd-icon` stays square in a container that is not.** The filled panel took its height from the parent while its width came from the same parent's width, so in any box that was not itself square the panel stretched and the glyph with it. It holds its own ratio now, the way the icon without `box` always did: the width follows the container and the height follows the width. Only `size="full"` could hit this. A fixed size in px was square on both axes already.

- **The warning about a list that says nothing no longer fires for a list that has rows.** It read the rows off the slot, and a slot has nothing assigned until it has rendered, so the first pass called every list empty. It only warns once, so that first verdict stuck: a console with a line per list on the page teaches people to scroll past it. The rows are read from the children before that first render, where they already are, and the warning names the state the list is actually in: rows that are all hidden ask for `[slot="no-results"]` rather than for `[slot="empty"]`, and a slot that covers the state answers the question.

## [0.8.86](https://github.com/MinBZK/storybook/compare/v0.8.85...v0.8.86) (2026-09-03)

### Highlights

- **No `'unsafe-inline'` in your `style-src` for our components.** Two of them wrote styling into the page itself, which is exactly what a Content-Security-Policy stops: under a strict policy a cell hid at no width at all, and a progress circle lost the color of its ring, both without a word. The rules travel through the CSSOM now, which a policy leaves alone. What each one did is in Fixed below.

- **A favicon, as `@nldd/design-system/favicon.svg`.** The package shipped the logo, the fonts, the reset and the tokens, and left the tab strip to every site to redraw. They drifted, down to two shades of the same blue. This is the arms filling the tile on the lintje `#154273`, the pattern logius.nl and MijnOverheid Zakelijk already use, and the one that survives 16 pixels where the ribbon turns to mush. Copy it into whatever you serve statically and point a `<link rel="icon">` at it. A browser loads a favicon apart from the page, so your CSS cannot reach it: another background is a copy of the file with one `fill` changed, which is what the sites that put their own house color around it are doing anyway. There is a PNG of the same tile beside it, `@nldd/design-system/touch-icon.png`, because Safari will not take an SVG for the icon on the home screen. It is 180 square, the size Apple asks for, and it is one file rather than a ladder of sizes. This Storybook now wears both.

- **On a narrow screen the wordmark beside the ribbon is centred against it.** It started at the ribbon's midpoint and grew down from there, so a one-line wordmark hung against the bottom half of the mark with the space above it empty. It is centred now, and only what does not fit grows downward: centring a taller wordmark would push its first line off the top of the page, which is where the ribbon starts. Once it does grow it keeps 12px from that edge, and nothing under the last line, so the bar is no taller than the text in it. An auto margin does the work, so there is no height to guess and no breakpoint to keep in step with the text. Above sm nothing changes.

### Breaking

- **A CSS length in `gap` on `nldd-collection` no longer applies.** It was the only component that took one. Use the step with the same number: `gap="16px"` becomes `gap="16"`. A gap that has to change with the viewport is `sm-gap` / `md-gap` / `lg-gap` rather than a length.

- **`--context-layer-top` and `--context-layer-bottom` are now `--context-inset-top` and `--context-inset-bottom`.** The value says how much of the edge is taken by chrome that a sticky element has to clear, and layer reads as stacking order, which is what `z-index` and `@layer` are for. Inset is the word the platform already uses for this, as in `env(safe-area-inset-top)` and Android's window insets, and the same number is what `scroll-padding-top` wants, which has nothing sticky about it. Rename it wherever your app publishes or reads it. A CSS variable that no longer exists fails without a word, so nothing warns: sticky content lands against the top edge instead of below your bar. `nldd-app-view`, `nldd-page`, `nldd-sheet`, `nldd-bar-split-view` and `nldd-modal-dialog` all speak the new name.

### Added

- **`gap` is a step of the spacing scale in both components, and so is `padding` in `nldd-container`.** `nldd-collection` read `gap` as a CSS length and `nldd-container` read it as a scale step, so `gap="16"` was right in one and wrote `--_gap: 16` in the other, which is not a length: the declaration fell away and the space between the items became nothing at all, without a word. One meaning now, behind one resolver. Spacing is rhythm, so a value beside the scale is not a finer choice but a break in the pattern, and a length is refused like any other value that cannot be placed: nothing is written, the default stands, and dev names the value rather than leaving you to spot the collapse. `nldd-collection` gains `sm-gap`, `md-gap` and `lg-gap` on the way, which `nldd-container` already had and which is where a gap that has to vary belongs.

- **`layout="lanes"` on `nldd-collection`.** Items of unequal height packed into columns, the masonry `nldd-container` has had for a while, now on the component that pages. `item-width` is the minimum column width, the same as it is in `grid`. Where the browser has `grid-lanes` it uses it; where it does not it falls back to that grid rather than to the multicol `nldd-container` falls back to. That is the whole reason the two differ: multicol fills column by column and redistributes every item each time `show-load-more` adds to the set, so what you had already read moves. Grid fills row by row, like native lanes, and grows at the bottom. What you give up in the fallback is the ragged edge, which is a look rather than a behaviour.

- **A row can be a radio: `radio` on `nldd-list-item`, `type="radiogroup"` on `nldd-list`.** A choice out of a handful used to mean an `nldd-radio-button-group`, which gives every option a label and nothing else. As rows the options can carry what a filter list wants beside them, a count that lines up on the right and reads as secondary, and the whole row is the target instead of the dot. The row is the control, the way `checkbox` already was: the action becomes a `role="radio"` button with `aria-checked`, activation sets `checked` and never clears it, and `change` fires once, the way a native radio stays put when you pick what was already picked. Slot an `nldd-radio-button decorative` for the shape. The group is the parent: `type="radiogroup"` makes the items region a `role="radiogroup"` and the rows step out of the tree with `role="none"`, so the radios are the group's own children rather than list items wrapped around them.

### Changed

- **A sticky fade is 24px, and a sidebar keeps 24px from the edges.** The fade under `nldd-page`'s sticky header and above its sticky footer was 32px, and the default sticky inset of `nldd-sidebar-section` was 16px, so a box that cleared the header still began inside its fade. Both are 24px now, which is what lets the sidebar start where the fade ends. Nothing to set for it, and `sticky-top` / `sticky-bottom` still override.

### Fixed

- **An empty list and a list that found nothing are two states now, and `[slot="no-results"]` is the second one.** They used to be one: `[slot="empty"]` said the same sentence to someone who has no assets yet and to someone whose search matched none of their twenty. The list can tell them apart, because it knows both how many rows it has and how many are `[hidden]`, so it now picks the one that fits and falls back to `empty` when `no-results` is not given.

  What changes with it is the chrome. Rows that are only filtered away keep the search field and the `[slot="toolbar"]`, because those are the way back to the rows: since 0.8.84 a query that matched nothing took the whole list off the page, search field and filters included, leaving no way back at all. No rows at all hides them instead, since there is nothing to search or filter, and with nothing in `[slot="empty"]` the list still leaves the page entirely. A list that fetches its rows is in that state until they arrive: put an `nldd-inline-dialog variant="loading"` in `empty` to hold the place, rather than have the controls appear a moment later. And a slot with nothing in it draws no box any more, where an empty surface read as a skeleton that never loaded.

- **A long word in the wordmark no longer shoves the ribbon off centre.** A grid item is at least as wide as its longest word unless it is told otherwise, and the wordmark sits in one of the two tracks that hold the ribbon in the middle. One unbreakable name pushed the ribbon 137px to the left and the page 43px past the screen, so a phone got a horizontal scrollbar on the bar alone. The name wraps mid-word now, with `overflow-wrap: anywhere` rather than `break-word`, because only that one counts the break when the track is measured. Wrapped and not truncated: a name cut off by an ellipsis cannot be read at all.

- **The wordmark measures itself against the ribbon of the breakpoint it is in.** `--_logo-width` was declared per breakpoint inside the logo element itself, so everything outside it kept reading the small value: on lg the wordmark reserved 80px beside a 96px ribbon and the spacer that places it was 8px short. The declaration sits on the bar now, where the ribbon and the wordmark both read it.

- **Sticky content inside a page clears the page's own bars.** `nldd-page` said nothing about its sticky header, so an `nldd-sidebar-section` in one stuck to the top of the viewport and slid under it: the top of the sidebar sat behind the bar, and the height cap was a whole viewport where a viewport minus the bars was left, which ran the bottom of the box off the screen. The page now adds its sticky header and footer to `--context-inset-top` and `--context-inset-bottom` for its content, the same variables the shell already uses to tell the page where it may stick. `nldd-sidebar-section` reads them, so its box lands 24px below whatever is above it and ends 24px above whatever is below, the depth of the fade a sticky header casts, so it starts where that fade ends, and `sticky-top` / `sticky-bottom` go back to being for chrome the page cannot know about. The heights are measured rather than assumed, because a top title bar shrinks as you scroll past its anchor. While the page owns the scroller the bars outside it do not count, since a sticky offset there is measured against the scroller rather than the viewport. The page publishes what it is scrolling too, as `--context-scroller-height`, and the sidebar caps its height on that instead of on `100dvh`: with the page as the scroller a viewport-tall cap hung out the bottom by exactly the height of the chrome around it.

- **A named `hide-below` or `hide-above` no longer costs you `'unsafe-inline'` in your `style-src`.** The `@container` rule arrived as a `<style>` element written into the shadow root, and a Content-Security-Policy counts that as an inline stylesheet wherever it sits. On a strict `style-src 'self'` the browser dropped it without a word and the cell showed at every width, so a timeline drew its mobile and its desktop variant on top of each other. The four named breakpoints are static CSS now; nothing changes in how you write them. A custom length (`hide-below="320px"`) is the one threshold that cannot be static, so its rule is still written while the element runs. It goes into a stylesheet the shadow root adopts rather than a `<style>` element, and a policy judges the element rather than the CSSOM, so that path needs no `'unsafe-inline'` either. No component writes a `<style>` element into its own shadow root any more.

- **`nldd-progress-circle` keeps its ring color under a strict `style-src`.** The border on the track and on each segment is an SVG filter that floods the edge with a color, and that color went in as a literal `style="flood-color: …"`. A policy judges an inline style attribute the same way it judges an inline stylesheet, so on `style-src 'self'` the browser dropped it and the filter fell back to its default, which is black. The two fixed colors are ordinary rules in the component's stylesheet now, and the one that varies per segment is set through the CSSOM, which a policy leaves alone.

## [0.8.85](https://github.com/MinBZK/storybook/compare/v0.8.84...v0.8.85) (2026-08-31)

### Highlights

- **`box` on `nldd-icon`, for an icon on a filled square.** A feature card with a tinted tile, a menu with a colored category icon: common enough that consumers build it themselves out of a box and an icon, and then pick the two colors by eye. This turns the color question around instead. `color` and `custom-color` paint the box, and the glyph takes whatever contrasts with it, white or black, chosen on luminance by the same token the badge uses. That pair is the reason this is an option on the icon rather than a composition: it is the part nobody can check by looking. `size` then measures the box, so the same size renders a smaller glyph with `box` than without: four fifths of it, with a corner radius of a fifth. Both are ratios, so a decision about how a glyph sits in its box is one number in one place rather than a shape every consumer redraws.

- **A tulip, in two weights.** `tulip` draws the flower as an outline: three petals, the outer two curling up beside a pointed middle one, over a short stem. `tulip-light` is the same flower with a thinner line, drawn on a 32 view-box like the other light weights, so its line stays 2 pixels at the size it is meant for. In this set `-light` names a weight rather than a state, the way `circle-light` reads beside `circle`.

### Added

- **Icons** — `tulip` and `tulip-light`. No aliases: the name is the flower, and it says what the icon draws.

### Changed

- **A line of `nldd-text` stops at 40em.** It had no maximum at all, so in a wide column one sentence ran the full width and became a ruler. 40em is the measure the rest of the system already holds: `nldd-rich-text` caps its main column at 720px and a blockquote at the same, both against a body-md of 18. In ems rather than pixels, so the line holds the same number of characters at every size and a size added later is covered without anyone remembering to. New token, `--semantics-text-max-width`; override it, or `max-width` on the element, where a line is meant to run the full width, such as a label in a table cell.

- **`viewfinder` has the corners of `viewfinder-line`.** Each of its four arms is a pixel longer, so a corner now reaches 6 pixels out instead of 5. The two are one pair, `fit-to-view` and `scan`, and `viewfinder-line` already had the longer arms. Side by side the shorter ones read as a smaller icon rather than the same frame with a line through it.

### Fixed

- **A slotted icon in `nldd-button` gets the size the button gives its own.** The button measures the icon it renders from `start-icon` in a span of `--_icon-size`, but anything you slot into `start-icon` or `end-icon` landed in a bare slot and kept whatever size it arrived with. That slot is where a mark that is not one of our icons goes, a third-party logo for instance, and every consumer had to size it by hand against a token they first had to find. The size now applies to the slotted element itself rather than to a wrapper around the slot, so a button with no icon at all still reserves no room for one.

## [0.8.84](https://github.com/MinBZK/storybook/compare/v0.8.83...v0.8.84) (2026-08-30)

### Highlights

- **`nldd-validation-list`, everything a value has to satisfy in one list.** A requirement you can state up front is an item with a rule (`minlength`, `maxlength`, `match` or `required`) and it checks itself while you type. One only a server can decide is an item without a rule, and the app names it in `unmet` on the control. `judging` switches the two modes: before a verdict the list states what the field wants, after one those hints are gone for good and what is left is whatever the value fails. What turns red is `invalid` on the control and nothing else, so a line never goes critical under a field that looks fine. Hints are off by default: a phone number does not need its format spelled out before anyone has typed, and a password does.

- **A timeline row can leave out its dot and stay part of the track.** `variant="none"` keeps the lane the row stands in and the status of the track running through it, so a group of rows under one step reads as one stretch instead of breaking the line. Each attribute answers one question now: `size` is the lane, `variant` what stands in it, `status` how far along you are. On the row that closes a track, `position="only"` leaves the line out altogether. See Breaking for the mapping.

- **The track lines carry the same ring as the dot, on their sides only.** The dot already read over the line running under it while the line ran straight into whatever sat beside it. A spread would have banded the top and bottom too and cut the track at every row, so two offset copies of the line paint the sides and nothing else.

- **Two icons.** `note` for what you scribble beside the work, where the `file-text` family is a document you file. `screwdriver-wrench`, aliased as `tools`, for the work itself rather than for a setting, which is what `gear` is and stays.

### Breaking

- **`error-message` on an input is now `unmet`, and there is no fallback.** It names the ids of the items a value does not satisfy, which is what an `nldd-validation-list` reads. Consumers replace the attribute wherever they set it, bound forms included: Angular's `[attr.error-message]` becomes `[attr.unmet]`. Nothing warns. `nldd-form-field` reads an attribute that is not there, so every message on the page silently stops appearing. One search and replace on `error-message`, minding that `error-message-ids` is a different, internal thing and keeps its name.

- **`nldd-form-field-error-text` is gone.** An error you have to fix is a requirement the value does not meet, so it belongs in an `nldd-validation-list` beside the requirements that state themselves. Migration is per field and the ids travel with the texts: `<nldd-form-field-error-text id="password-length">Must be at least 8 characters.</nldd-form-field-error-text>` becomes `<nldd-validation-item id="password-length" minlength="8">At least 8 characters</nldd-validation-item>`, and anything only a server can decide becomes an item without a rule, still named in `unmet`. Leaving the old element in place is worse than a blank: an undefined custom element has no shadow styles, so every message renders permanently. Search for the tag; nothing warns.

- **Validation texts are the requirement, not the instruction.** The same line does two jobs, a requirement up front and, once the field is judged, what is still wrong. So "Use at least 8 characters" becomes "At least 8 characters", "Pick at least one option" becomes "At least one option", and "Enter a valid company number (8 digits)" becomes "A company number of 8 digits". This touches every message a consumer has written; the examples are in `skills/nldd/SKILL.md`.

- **An empty `nldd-list` or `nldd-table` says nothing of its own.** `empty-text` and `empty-supporting-text` are gone from both, and with them the default `nldd-inline-dialog` they fed. What an empty list means is the app's to write: "no assets yet" and "nothing matched that search" are different sentences with different next moves. Measured in the two applications that lean on this system hardest: 324 of their 330 lists set neither the attributes nor the slot, so all of them fell back on the same Dutch "Geen items" in an English interface, while 62 inline dialogs stood beside those lists in the consumer's own markup because the slot was never found. Put an `nldd-inline-dialog` in `[slot="empty"]`, which already worked and is now the only way. Empty with that slot unfilled, both take themselves off the page rather than drawing an empty surface: on a boxed list that was a tinted bar with nothing in it, which reads as a skeleton that never loaded, and it made "nothing" look different per variant. They warn once in development instead, so a blank area becomes a question to whoever is building rather than a silence for whoever is reading. `nldd-menu` keeps its default: a filter that matches nothing is a state of the control, not content of the app.

- **`nldd-timeline-track-cell` splits `variant`, `minor` and `status` into `size`, `variant` and `status`.** `variant="dot|step"` set the dot and the lane at once, `minor` sat beside it, and `status="none"` took the dot away from a list of values that is otherwise about progress, so a row without a dot lost the lane it had to stand in. Map `variant="step"` to `size="md"`, `minor` to `variant="minor"`, and `status="none"` to `variant="none"` plus the status that fits. `size` is `sm` (16px) or `md` (24px), and a number fits in `md`.

- **`selected` on `nldd-tab-bar-item` is now `current`.** The name every other navigation component uses: `nldd-menu-bar-item`, `nldd-breadcrumbs` and, since 0.8.83, `nldd-list-item`. A bar that switches content still renders `aria-selected` and a `navigation` bar `aria-current="page"`, and it was that second mode where the old name was wrong. Rename one attribute per bar. The old one does nothing, and warns in dev. `nldd-document-tab-bar-item` keeps `selected`, because those are tabs over documents rather than routes.

### Added

- **A semi-bold row in the body type scale.** The weight primitive was already there, 550, between medium at 475 and bold at 600, but the composed `font` tokens stopped at three weights. All five body sizes carry `semi-bold` in all four line heights now, twenty tokens, so the scale has no gap to step around.

- **`--semantics-surfaces-ring-thickness`, one token for the gap around something that overlaps.** A badge over its anchor, an avatar over its neighbor, a timeline dot over its line, a step marker over its track: four components draw the same ring in the surrounding background so the shape in front stays readable. They took the value from two different primitives and called it two different things. The color stays in the components on purpose: it has to be the background actually behind the element, which they read from `--context-parent-background-color`, and a `var()` at token level would freeze against `:root`.

- **`invalid` is declared on every input.** Seventeen of the twenty-six did not have it, while the message was already appearing: `nldd-form` writes the attribute and an `nldd-validation-list` reads it straight off the control. It worked because something else reached in for it, which is the problem `error-message` had. It is deliberately not drawn on a checkbox, a radio button or a switch: a red ring around one box says that option is wrong, while the question is simply unanswered. Not drawing it is no reason to stay silent, so `aria-invalid` goes on the element assistive software meets, the same one `describedTarget()` already picks.

- **`nldd-form` marks a field invalid the moment the platform says so.** Without something joining `setValidity` and the attribute, a control whose validation list refused a value blocked the submit while nothing on screen said why. The browser already picks the moment, firing `invalid` on every failing control on submit, so the form listens in the capture phase. From that first verdict the mark follows the value both ways, and every field is judged at once rather than only the ones that failed. The native bubble goes with it: Safari put its own tooltip above the field carrying the text that already stood under it. Cancelling that event also cancels the browser's move to the first failing field, so the form makes it itself, once per round: without it a failed submit leaves focus where it was, which for anyone not looking at the screen is indistinguishable from nothing having happened. A reset takes the marks off again along with the values, because a reset fires no `input` and a field would otherwise keep a mark over a value the user just cleared.

- **`required` where it was missing.** `nldd-dropdown`, `nldd-search-field`, `nldd-combo-box`, `nldd-checkbox`, `nldd-switch`, `nldd-checkbox-field`, `nldd-switch-field`, `nldd-segmented-control` and `nldd-toggle-button-group` did not have it. On a choice group it goes to the items, where the platform reads it: one required radio makes the whole group required and the browser writes its own message in the user's language. Radio mode only, because the same attribute on a checkbox means that box has to be ticked and HTML has no way to say "at least one of these"; `aria-required` goes on regardless and DEV says that nothing enforces it. `nldd-number-field` and `nldd-stepper` stay without: their value defaults to 0, so an empty one does not exist there.

- **`pattern`, `minlength` and `maxlength` on the text fields.** No input had them, so consumers fell back on their own JavaScript for something HTML has done for fifteen years, blocking the submit included. They are on `nldd-text-field`, `nldd-password-field`, `nldd-search-field` and `nldd-combo-box`. The multi-line field gets the two lengths only, because HTML has no `pattern` on a textarea.

- **`width="fit-content"` on `nldd-date-field` and `nldd-time-field`.** Both hold room at their end for a validation icon, so the field does not resize the moment it turns valid or invalid. Where a field is never validated that room is a visible gap. `fit-content` keeps only the air the text needs and takes the full slot back the moment a validation state does arrive, growing at the trailing edge so the date stays where it was. Opt-in, because only the consumer knows whether a field is ever validated.

- **`type="form"` on `nldd-list`, for rows you fill in rather than walk through.** A row of a label and a field, a switch, a menu button, or a value you cannot change. Semantically the same as `list` and visually unchanged; what falls away is the keyboard of a list you walk through. No arrow navigation and no tab stop on the row: Tab goes straight to the controls, in source order. Rows that ARE actions contradict the type and warn in development. SwiftUI draws the same line between `List` and `Form`.

- **Escape, from a control back onto its row.** One level up, where Shift+Tab is one step back. It works wherever you are in the row and puts the arrow keys back in reach. It claims the key at exactly that one level: on the row it claims nothing, so Escape carries on to whatever holds the list, and a control showing a menu keeps the first press for closing that menu.

- **`line` on `nldd-timeline-track-cell`, for a step that opens a group.** A row that opens a group of its own is not the end of the going, so it drew an open track downward while there was progress below it. `line` names the halves you have covered; the other half is track still ahead, and `none` covers neither. It is about fill, not place: which halves are drawn stays with `position`, except that calling a half covered draws it.

- **An inline `svg` in the slot of `nldd-image`.** Only an `img` and a `picture` were styled to fill the media box, so a drawing landed there at whatever size it brought along. It gets the same reset now, without `object-fit`, which does nothing on an svg because its own `viewBox` does the fitting. A drawing gets the box, the ratio and the caption a photo gets, and keeps its own colors.

- **`no-tab` on six more components.** `nldd-link`, `nldd-checkbox`, `nldd-radio-button`, `nldd-switch`, `nldd-toggle-button` and `nldd-avatar` carry the property `nldd-button` and `nldd-icon-button` already had: `tabindex="-1"` on the control in the shadow root, so a container that runs its own focus can take it out of the tab order.

### Changed

- **The title of `nldd-toolbar-title` and `nldd-top-title-bar` is semi-bold instead of medium.** Both sizes of the toolbar title, and in the title bar both the plain title and the one step smaller title that carries a subtitle. The subtitles stay regular.

### Fixed

- **`required`, `pattern`, `minlength` and `maxlength` now stop a submit.** They are handed to a control inside the shadow root, and that control is not a member of the form around the component: the form sees the host, the host sees the control, and nothing joined the two. The form-associated mixin reports the control's verdict as the host's own now, which fixes every input that renders one. A group (`nldd-segmented-control`, `nldd-toggle-button-group`) and the editors have no such control and are unchanged. Two consequences: a form that used to go through with an empty required field now stops, and outside an `nldd-form` the browser shows its own bubble, the way it does for any form control.

- **A validation list and a native constraint no longer erase each other.** `setValidity` writes the whole set of flags at once, so whoever wrote last won: a list reporting its failing rule cleared the field's `required`, and the next render cleared the rule. Both go through `setCustomValidity` now, which the mixin keeps beside the native flags rather than in place of them. A plain native input answers to the same method, so a list outside this system's inputs still works.

- **A validation list keeps listening after its field is moved.** Taking the element out of the DOM and putting it back, which is what a consumer portalling a sheet to `document.body` does, takes the input listener with it. Reconnecting found the same control as before and concluded there was nothing to wire up, leaving the list reacting to nothing. It now also checks whether it still has an observer.

- **An empty `name` or `width` no longer reaches the DOM.** Every input carried `name=""` and half of them `width=""`, on every instance in every consumer app. Twenty-two components reflect them only when they hold something now.

- **The input of `nldd-number-field` keeps its minimum width.** Three rules hung on `:host([width])`, and that selector always matched, because an empty `width` reflected to the DOM. Underneath sat a real bug: the base rule gives the input a `min-width` and the always-matching rule overwrote it with 0, taking `hide-spin-buttons` down with it, which sets 80 pixels and got 0.

- **The description of a field reaches the screen reader.** It arrived at 3 of the 26 inputs, measured against the accessibility tree: the field wrote `aria-describedby` on the input in its own shadow root while the ids it named stood in the document, and an IDREF is looked up in the tree of the element that carries it. The elements themselves go through now, via `ariaDescribedByElements`, and a mixin hands the question down through a wrapper to the component that knows which element inside itself is the control.

- **The website title in `nldd-top-navigation-bar` is a 24 by 24 target.** WCAG 2.5.8 asks that of anything you click, and this one was 20 high on a phone and 23 at medium. The row around it was 24, but that came from padding on the bar, which does nothing for the target inside it. The title carries its own minimum now, in both directions and whether or not it links anywhere.

- **Avatars in a group overlap by a fifth of their diameter, whatever that diameter is.** The overlap was a flat 8 pixels: 29% of the avatar at size 28 and 8% at size 96, so the same component read as a tight stack at one size and a row of separate circles at another. A fifth is what 8 was at the default size of 40, so a group at that size looks exactly as it did.

- **A form section stands 24 pixels from its neighbors on both sides.** It carried padding, and padding does not collapse, so it added itself to the 16 the form already puts under the preceding child. It is a margin now: 16 and 24 beside each other are 24. On both sides rather than only above, because with a top margin alone the distance under a section depended on what happened to follow it.

- **The buttons of a form stand 24 pixels below it.** Also in a form without sections, where the actions used to be one more gap like everything else. The end of a form is the end, not one more question.

- **A section heading sits 8 pixels above its fields instead of 16.** It belongs to what is under it, and the same distance on both sides left it floating between the group above and the group below.

- **A form section spaces whatever you put in it.** Its children leaned on a rule that only recognized one field followed by another, so a button or a paragraph inside a section got no room and every caller added it themselves. The section uses the same rhythm as the form around it now, and asks whether something visible follows rather than what the thing is.

- **A field label sits four pixels above its control instead of three, in the flat type rather than the tight one.** Three was close enough to read as attached and far enough to look like a mistake, and the tight leading pulled a wrapping label onto itself.

- **One gap between everything in a form.** Two fields in a row used to sit ten pixels apart instead of sixteen, and it took two container queries and four `:not()`s to say so. It bought six pixels per pair, while a toggle group or a combo box stood ten pixels from the next label. A field, a section, a button, a paragraph: whatever follows another thing stands the same distance from it now, and a section or the buttons of a form stand a step further off. The three gap tokens are two, named after what they separate: `--semantics-forms-fields-gap` and `--semantics-forms-sections-gap`. `--semantics-forms-gap` and `--semantics-forms-gap-tight` are gone; nothing outside this package used either.

- **`nldd-form-section` no longer draws lines around itself.** A section carries a heading, and a rule above and below says the same thing a second time. What gave it away was the suppressing: no line on the first child, none between two adjacent sections, none on the last, and that last exception did not work, so every form with a submit button had a rule drawn right above that button. The padding stays and is what groups.

- **A `close` from an overlay stays with the overlay it came from.** `nldd-sheet`, `nldd-window`, `nldd-modal-dialog` and `nldd-popover` fired `close` with `bubbles: true`, so an overlay inside another one reached the listener on the one around it. A consumer binding `(close)` on the outer overlay got the inner one's close as well and tore down what was still open. The event no longer bubbles. Anyone checking `event.target` to work around this can stop.

- **Escape closes what is on top, and nothing behind it.** A combo box, a token field and anything on `nldd-popover` closed on Escape and let the same press travel on, so a sheet or window behind them went too. They stop the press the way `nldd-menu` already did. With nothing open they claim nothing, so Escape still reaches the sheet.

- **A list no longer takes the arrow keys out of a control in one of its rows.** The keys were claimed by whichever list they bubbled through. A combo box in a row lost its menu on ArrowDown, and a text field lost its caret on Home. The list stands down now while the key comes from a control the row holds; what the row IS keeps answering, since a link, button or segment is not a control it holds.

- **A list is one tab stop from the outside again.** The current row hands its controls a place in the tab order, and those places stayed handed out after focus left the list, so tabbing back in dropped you into the control you had left rather than on the row. Leaving the list parks them again.

- **The clear and picker buttons of a combo box sit in the middle again.** Both are wrapped in a plain block, so the wrapper took the height of the line box it inherited and the button hung at the top of it: centered in a story, high in an app whose body sets a taller line-height. They are flex now, like the file, time and date fields.

- **A row let go outside itself no longer stays lit.** `nldd-list-item` and `nldd-list-item-segment` showed the press on `pointerdown` and cleared it on a `pointerup` on the row, which is not where the event lands when you release off the row. The release is watched on the window now, for as long as a press is running.

- **`nldd-box` and `nldd-card` take the width they are given.** An `nldd-cell` lines its content up on the left rather than stretching it, so a box or a card inside one shrank to its content: in a narrow cell that came down to a single letter with the title running vertically. As a block that already happened, as a flex item it did not.

- **The scroll mode follows a split view that arrives late.** A consumer that renders its split view behind a condition, such as a loading state or an empty state, takes it away and puts it back. While it was gone the derivation said `root`, and the split view that comes back measures itself as what it already was, so it announces nothing: every pane kept scrolling as one document until a reload. A layer arriving or leaving now re-runs the derivation.

- **A bar in a sheet keeps its back button.** A split view hides the back button of a bar inside a pane, because the menu beside you is the way back. That hiding traveled down the whole pane, so a sheet standing in one lost the back button of its own bar. A sheet starts that context over.

- **The warning about a control a row cannot reach now fires, and names the control.** It ran while the list rendered, and a slotted custom element has its shadow root by then but has not rendered into it, so the check found nothing. It waits for the control to have rendered, runs again for rows added later, and reports once. It stays quiet where nothing is wrong: a segment, a disabled or negatively-tabindexed control, and anything the component hides itself.

- **Lit no longer reports an update scheduled after an update completed.** `nldd-list`, `nldd-list-item`, `nldd-collection`, `nldd-menu`, `nldd-menu-item` and `nldd-navigation-split-view` set state from `firstUpdated`, from the first `slotchange` or from `updated`, which is a dev-mode warning on every page holding a list or a menu. What the first render needs is read from the light DOM before it now, and what can only be read afterwards is set out of the update cycle.

- **A branch row that starts collapsed no longer warns.** The row reads an absent `expanded` as collapsed and emits `aria-expanded="false"`, so the warning asked for something that was already there. The warning about `slot="children"` outside a `type="tree"` list stays, and reports once per row instead of on every change.

## [0.8.83](https://github.com/MinBZK/storybook/compare/v0.8.82...v0.8.83) (2026-08-20)

### Highlights

- **`nldd-text`, a component for body text.** New, and the one piece of typography that had no component: every line that is not a heading and not a block of prose. It offers `size` (xxs through lg), `weight`, `line-height`, `color` and `horizontal-alignment`, all of them names for what the token scale already holds, so it cannot invent typography. Color follows the content channel a row, menu or table sets, so a line travels with the row it sits in. Reach for `nldd-title` for a heading, `nldd-rich-text` for prose with its own rhythm.

- **Every list answers to the arrow keys, and a row may hold more than one control.** One list now behaves like the next: ArrowUp and ArrowDown walk the rows there is something to do with, Home and End jump to the ends, and the list as a whole is one tab stop. Within the current row Tab walks its segments and the controls in its cells, while those same controls in the other rows stay out of the tab order. Two types mean something else by the same keys, and you can see which before you touch one: a `listbox` runs its keyboard from its search field, and a `reorderable` list moves rows.

- **`current` beside `selected` in a list row.** `current` is the row you are on, `selected` a row you picked, and a list can show both. At rest they look the same, so existing lists do not change. The difference shows when focus is in the row: only the current row takes the accent fill, and it does so from a nested `nldd-list-item-segment` too. Row states now sit on the same ladder as button states, with a rest, hover and press step for each, under the names the buttons already use. Seven tokens more.

- **A color the system does not know, on a badge and an icon.** Some colors are not a category but a fact: the jacket of a cable is blue whatever the house style does. `custom-color` on `nldd-badge` and `nldd-icon` takes any CSS color value and wins over `color`, so the vocabulary of `color` stays closed and one search shows where an app steps outside the palette. On the badge, what sits on the color turns white or black, whichever contrasts better.

- **Thirty icons added, three redrawn.** Added: `cpu`, `gpu`, `memory-chip`, `psu`, `pci-card`, `transceiver-module`, `rack-server`, `rack-servers`, `external-hard-drives`, `ssd-hard-drive`, `external-hard-drive`, `network-switch`, `kvm-switch`, `power-plug`, `lightning`, `snowflake`, `boxes-3`, `clipboard-bullet-list`, `kanban-columns`, `printer`, `shield-arrow-right-arrow-left`, `waving-crossing-lines`, `circle`, `circle-circle`, `minus-circle`, `circle-light`, `circle-circle-light`, `check-mark-circle-light`, `clock-light` and `slash-circle-light`. Redrawn: `shield`, `shield-check-mark` and `shield-lock`.

### Breaking

- **`database-disabled` and `database-unavailable` are now `disabled-database` and `unavailable-database`.** The set puts the state in front everywhere else: `new-namespace`, `no-priority`, `checked-small`. Those two trailed it, and were the only aliases that did apart from the `-light` weights, which name the drawing rather than a state. Both still point at `cylinder-split-slash`. Consumers on an old name change one string.

- **`nldd-list-item-action` is now `nldd-list-item-segment`.** The component was not always an action: without `href`, `button` or `checkbox`, and inside a listbox, it renders as a plain container. What it always is, is a piece of the row with its own hit area and its own fill, which is what the docs had been calling it all along. Consumers rename the element and the import path, and the attributes stay the same. The host classes follow: `has-leading-segment` and `has-trailing-segment`.

- **Every list answers to the arrow keys, and `arrow-navigation` is gone.** Whether the arrow keys work is what a reader may assume about every list, not a setting per list, and as a setting it was unknowable from the outside. Consumers drop the attribute. Leaving it in does nothing, and warns in dev.

- **`nldd-box` paints with `background`, like every other surface.** The attribute was `variant`, which in this system is the word for what a component is, not for which surface it draws. `nldd-app-view`, `nldd-page`, `nldd-split-view-pane` and `nldd-card` all call that `background`. So `variant="base|tinted|critical"` is now `background="base|tinted|critical"`. One thing to know: a box starts on `tinted` where a card starts on `base`, because a box stands out from the page and a card sits on it. Consumers change one string per box.

- **The plus badges are named after what they make.** `add-namespace` is now `new-namespace`, `add-k8s` and `add-kubernetes` are `new-k8s` and `new-kubernetes`, and `add-text-document` is gone in favor of `new-text-document`. A namespace, a cluster and a document are made, not added. `add` stays for putting something that exists into something else, which is why `add-plugin`, `add-user`, `add-location` and `add-emoji` are unchanged. Consumers on an old name change one string.

### Added

- **Eighteen icons for a data center: the hardware and the network.** `cpu`, `gpu`, `memory-chip`, `psu`, `pci-card`, `transceiver-module`, `rack-server`, `rack-servers`, `external-hard-drives`, `ssd-hard-drive`, `external-hard-drive`, `network-switch`, `kvm-switch`, `power-plug`, `lightning`, `snowflake`, `waving-crossing-lines` (`network-patch-mapping`) and `shield-arrow-right-arrow-left` (`firewall`), with the aliases `server`, `servers`, `memory`, `ram`, `processor`, `power`, `cooling`, `airco`, `hard-drive`, `nic`, `network-interface-card`, `sfp` and `energy`. Two are named after what they draw rather than what they came in for: `network-switch`, because `switch` on its own is the verb, and `snowflake`. `arrow-left-right` gets that verb as an alias: `switch` and `swap`, for moving between two things. There are two racks: `rack-servers` drawn flat on for a diagram, and `rack-server` at an angle for a row, where three stacked bays turn into three stripes. `server` points at the angled one, `servers` at the flat one. `waving-crossing-lines` draws the runs themselves, sweeping from one side to the other and crossing on the way, rather than the nodes they connect, which is what a patch panel looks like from the front. Two of them are a pair: `external-hard-drive` is one unit, `external-hard-drives` the stack of three, aliased `storage`. The firewall shield carries the traffic it filters, two arrows passing each other, so it says what it does instead of only saying "safe".

- **Eight icons for getting things done.** The three task states read as one series: `circle` for to do and `circle-circle` for doing, beside the `check-mark-circle` the set already had, aliased as `to-do`, `doing` and `done`. `minus-circle` is in the set as well: the same ring with a bar across it. `kanban-columns` draws a board of work in columns (`kanban`), and `circle-grid-2x2-top-left-check-mark` gets the alias `all-tasks`. `circle` doubles as `no-priority`: the same ring as `low-priority` through `high-priority` with nothing in it, so that column keeps reading as a count from zero up. Four of the state icons come in a light weight drawn for 32 pixels: `circle-light`, `circle-circle-light`, `check-mark-circle-light` and `clock-light` keep the 2-pixel line on a 32 view-box instead of a 24 one, so the line stays 2 pixels at the size they are drawn for rather than growing to 2.7. Use them where a state icon leads a row at 32, and reach for the regular set below that. Aliased as `to-do-light`, `doing-light` and `done-light`.

- **Four icons outside those two groups, and one alias.** `boxes-3` for a stock of things you own (`inventory`), `clipboard-bullet-list` for that same list read as a checklist (`inventory-alt`), `printer` for printing (`print`), and `slash-circle-light` in the same light weight as the state icons (`blocked-light`). `brackets-ellipsis` gets the alias `namespace`, the meaning the brackets with the ellipsis carry wherever the console uses them.

- **`color="inherit"` on `nldd-badge`.** Fill with the content color around it (`--context-content-color`, otherwise `currentColor`), the meaning it already has on `nldd-avatar`, so a badge travels with the line it sits in.

- **`disabled` works on a row and on a link.** A segment could be switched off and a row could not, while a row can just as well be the button or the checkbox. A `button` or `checkbox` row takes the real off state and dims. A link gets `aria-disabled` and a blocked click, because an anchor cannot be switched off the way a button can, and that goes for a link segment as well: there `disabled` used to do nothing at all. Hover and press do nothing there, and the arrow keys skip it: a disabled control is not focusable, so a stop there would swallow the key. That already applied to a disabled segment, so a row whose only segment is off is no longer a stop either.

- **A `current` segment makes its whole row current.** A row built from segments has no link of its own, so `aria-current="page"` belongs on the segment that holds the link. The row reads it off its own segments and paints itself, so it is written once. Reading, not writing: the attributes stay the consumer's. `current` also appears in the controls of `nldd-list-item` and `nldd-list-item-segment` now.

- **A ticked row is painted, the same as a ticked segment.** A row that is the checkbox itself took no fill, so the same list looked different depending on where the tick sat. A ticked row is a row you picked, so it paints what `selected` paints, with the same hover and press steps. Only together with `checkbox`.

- **A segment stays lit while what it opened is on screen.** `expanded` on a segment set `aria-expanded` and turned a chevron, but left the segment looking untouched, so a menu hanging off one row floated over the list without saying which row it belonged to. It now paints the same fill as a picked row (`--components-list-item-is-expanded-background-color`, two steps above hover), and after the hover rule, so the pointer cannot dim it while the menu is open.

- **`no-tab` on `nldd-button`.** The same property `nldd-icon-button` already had: take the button out of the tab order (`tabindex="-1"` on the button in the shadow root) because a container around it manages focus itself. An `nldd-list` sets it on the buttons in the rows that are not the current one. Mouse and script still reach the button.

- **Enter follows the row in a tree.** It activates the row's own link or button, or on a branch built from segments the first one that is not the chevron. Space folds, the same as Left and Right. Enter used to fold, so a branch you could reach with the arrow keys could not be opened without hunting for a segment with Tab.

- **`readonly` on `nldd-combo-box`.** The value stays readable and submits with the form, and the control that would change it is gone rather than dimmed.

- **`keyboard` and `enter-key` on the text fields.** They set `inputmode` and `enterkeyhint`, so a phone shows the right keys and the right label on the return key.

### Changed

- **`inbox` is now `tray`, and a set of aliases moved with the way the set names things.** The file says what it draws, a tray with a slot, and `inbox` stays as the alias for what it is used for. New aliases: `time-light` on `clock-light`, `locked-database` on `cylinder-split-badge-lock`, `checked-text-document` on `file-text-badge-check-mark`, `companies` on `apartment-building-2`, `add-extension` and `add-module` on `puzzle-piece-badge-plus` (the plain piece already answered to all three words, the plus badge only to `plugin`), and the directory vocabulary is carried through the folders it was missing from: `new-directory`, `folders`, `directories`, `open-folder` and `open-directory`.

- **The three shields are redrawn on one silhouette.** `shield`, `shield-check-mark` and `shield-lock` shared a pointed crest built from arcs, and now stand on the same flat-topped, rolled-edge shield as `shield-arrow-right-arrow-left`. That shield is wider at the top and flatter, and that is the reason for it: more fits on it. A check mark, a lock or two arrows passing each other need room, and on a pointed crest such a figure runs into the slanted edges. Four shields that differ only in what they carry, rather than a family that splits the moment a fourth arrives.

- **A read-only field takes its controls away instead of dimming them.** A dimmed control invites a click that does nothing. The field keeps its value and its label, and drops the spinner, the picker and the clear button.

- **A subtitle in `nldd-title` is one step larger.** It sat two steps under the title, which read as a caption rather than as the line that belongs to it.

### Fixed

- **The text on a colored fill is picked on luminance now, and clears 4.5:1.** `--semantics-content-contrast-color` decided between black and white on OKLCH lightness, which is perceptual and parts ways with the luminance WCAG measures, so a saturated mid blue got white text at 3.68:1. The threshold is now the relative luminance where black and white give the same contrast, Y = (sqrt(21) - 1) / 20, which makes the picked color at least 4.58:1 whatever it lands on. Where the browser has `contrast-color()`, that answers instead. This reaches every component that puts content on a fill it was handed: `nldd-badge`, `nldd-avatar`, `nldd-step-indicator`, `nldd-keyboard-shortcut` and the timeline cell.

- **Switching a row off now moves the tab stop with it.** A row that carried the list's single tab stop kept it after `disabled` landed on it, so Tab reached a row that answers to nothing. The arrow keys already skipped it, and an unrelated change happened to repair it, which is the worst kind of bug: it fixes itself while you look at it. The row re-runs the roving when its own `disabled` changes, and the list watches the attribute too.

- **A read-only combo box no longer announces a list it cannot open.** The picker button and the menu were already gone, but the input kept `role="combobox"` with `aria-haspopup="listbox"`, `aria-autocomplete` and `aria-expanded`. It is a text field with a value in it, and it now says so.

- **`color="inherit"` on a badge or an avatar could paint white on white.** The fill came from the content channel around it, while the contrast flip that decides between black and white text read the inherited `color`. Those are the same value in most places, so it went unnoticed until a row set the channel to white over dark text: the badge then took a white fill and, from the dark inherited color, white text as well. Both components now set their own `color` to the fill first, the way `custom-color` already did, so the flip is computed against what is actually painted.

- **An overlay is where the app's layout context ends.** A sheet or dialog inherited the app's scroll mode, so a short page inside an overlay could float its sticky footer mid-screen. An overlay now starts its own context.

## [0.8.82](https://github.com/MinBZK/storybook/compare/v0.8.81...v0.8.82) (2026-08-11)

## [0.8.81](https://github.com/MinBZK/storybook/compare/v0.8.80...v0.8.81) (2026-08-11)

### Highlights

- **Three things a form did by itself, given back.** Enter in a single-line field submits the form again, a click on a field's label moves focus into the control, and the field's label arrives there as its accessible name. Plain HTML gives you all three for nothing, and all three stop at a shadow boundary: `<label for>` does not cross it, an IDREF does not resolve across it, and neither does form ownership. So the control has to be handed what the platform can no longer reach it with, which is what `nldd-button type="submit"` already did from the other side. What made it worse was the compensating: `nldd-form-field` recognized an input by an implementation detail that 8 of the 24 happened to have, so for the rest the name reached nobody and a screen reader announced an unnamed field. It now asks instead, and an input says `static isFormInput = true`.
- **A toolbar that had stopped watching.** Rename something and the control showing that name gets narrower, but the space stayed reserved and an item pushed into the overflow menu stayed there. It guessed which attribute meant "wider" and watched only its own width, not its children's. It now watches what the children actually take.
- **Eight new icons for version control.** `git-branch`, `git-commit`, `git-compare`, `git-fork`, `git-merge`, `git-pull-request`, `git-pull-request-closed` and `git-pull-request-draft` draw the commit graph the way a code forge already draws it: dots on a line, a line that splits off, a line that joins back. The closed request carries a cross and the draft one a dashed stem, so three states of the same request stay one family. Their names say what the icon means rather than what it shows, which is the exception in this set. A dot on a line says nothing outside a repository. The prefix is not decoration either: it keeps `branch`, `fork` and `merge` free for the branch, the cutlery and the junction that may still turn up.

### Added

- **Icons** — `git-branch`, `git-commit`, `git-compare`, `git-fork`, `git-merge`, `git-pull-request`, `git-pull-request-closed` and `git-pull-request-draft`. No aliases: these names are the functional ones.

### Fixed

- **A click on the label of `nldd-form-field` now reaches every input.** It reached about half of them. The label focuses the slotted element by hand, because a `<label for>` cannot cross a shadow boundary, and that only lands somewhere when the element is a native control or carries a `focus()` of its own. Ten did not: `nldd-dropdown`, `nldd-checkbox`, `nldd-checkbox-field`, `nldd-radio-button`, `nldd-radio-button-field`, `nldd-radio-button-group`, `nldd-segmented-control`, `nldd-stepper`, `nldd-toggle-button` and `nldd-toggle-button-group`. Each of them now delegates focus to the control it wraps, so `el.focus()` also works on its own, without reaching into shadow DOM. A group sends focus to the chosen option and falls back to the first one that is enabled, which is where the keyboard puts you when you tab in. Nothing gained a `tabindex`, so no component became an extra tab stop. Reported in [#188](https://github.com/MinBZK/storybook/issues/188).
- **The label of `nldd-form-field` reaches the control as its accessible name.** It reached 8 of the 24 inputs. A label in a shadow root cannot point at a control in the consumer's light DOM, because `for` and `aria-labelledby` are IDREFs and an IDREF only resolves inside its own tree, so the name has to be handed over. Which channel to hand it through is a question about the control, and the field was answering a question about the element kind instead: it looked for `inputId`, an implementation detail of 8 of them, and put `aria-label` on the host of all the rest. A host is not the control, so for 10 inputs the name reached nobody and a screen reader announced an unnamed field. It now asks whether the control accepts `accessible-label`, the naming channel of this system, and hands it there. `nldd-dropdown`, `nldd-radio-button-group` and `nldd-stepper` gained that attribute, so the whole set has it. A stepper without one keeps its generic "adjust the value" fallback. `nldd-radio-button-group` also warns in DEV when it has neither `accessible-label` nor `accessible-labeled-by`, which its two sibling groups already did. A group inside a labeled `nldd-form-field` is named by the field, so the warning is left for the case that really has no name.
- **A name you set closer to the control wins.** The rule that fell out of the fixes above, now in one place: an `aria-label` on a slotted `<select>` beats the `accessible-label` on the `nldd-dropdown` around it, which beats the caption of the `nldd-form-field` above that. Every layer fills a gap and takes back only what it wrote itself. Without that second half a component read "I have no name to give" as "remove the name that is there", which is how naming a `<select>` directly, the way `nldd-dropdown` documents it, quietly stopped working. The same slip sat in `nldd-radio-button-group`, `nldd-toggle-button-group` and `nldd-segmented-control`: an `aria-label` you put on the group was stripped on the first update.
- **A field without a label of its own no longer wipes the name you set.** `<nldd-form-field><nldd-text-field accessible-label="Zoeken"></nldd-form-field>` came out nameless: the field removed `accessible-label` and `aria-label` whenever it had no label to put there, including the one you wrote. It now takes back only a name it wrote itself.
- **`nldd-checkbox-field`, `nldd-radio-button-field` and `nldd-switch-field` keep their own label.** They carry a visible label that already names their control, so the caption above them is not their name and never overwrites it. A caption over a group could not say which box it meant anyway.
- **Enter in a single-line field submits the form again.** The browser does this by itself and calls it implicit submission, but only for a control that has a form owner. The real `<input>` of an nldd field sits in a shadow root, and form ownership does not cross that boundary, so there was no form to submit and pressing Enter did nothing. The field is form-associated through ElementInternals, which does know the form, and the behavior is handed back over that connection. It is what `nldd-button type="submit"` already did from the other side, so pressing the button worked and pressing Enter did not. `nldd-text-field`, `nldd-password-field`, `nldd-number-field`, `nldd-date-field` and `nldd-time-field` submit; `nldd-multi-line-text-field`, `nldd-text-editor` and `nldd-code-editor` do not, because there Enter makes a line. A field that uses Enter for something keeps it: an open date picker chooses a date, `nldd-token-field` commits a token, `nldd-search-field` searches, and only an Enter none of them acted on reaches the form. The rule the specification puts around this is reproduced too, so without a submit button a form with more than one such field stays put. An Enter that behaves differently inside this design system than outside it is worse than one that does nothing.
- **`nldd-toolbar` measures again when a control changes width.** Rename something and the control showing that name gets narrower, and the toolbar kept the old width reserved: space stayed empty and an item that had been pushed into the overflow menu stayed there until you resized the window. It watched for the wrong thing. Its mutation observer saw the `text` change and filed it under "a visible control changed, no toolbar work needed", which holds for a `selected` on a segmented control and not for the label of a button. Its resize observer watched only the toolbar itself, so a child that shrank while the toolbar stayed the same width told it nothing. It now watches how wide the children actually are, which also covers the reasons no attribute filter catches: a font that finishes loading, or your own CSS.
- **The handle of `trash` is a loop again.** It went solid black in 0.8.80, when `fill-rule="evenodd"` was optimized away and the drawing stayed as it was. Rather than putting the attribute back, the hole is now drawn against the outline instead of along with it, which is what the icon style guide asks for and what makes it hold under the default fill rule. It survives the optimizer either way now, and that is the point: the attribute was a promise the drawing did not keep on its own. `flag` and `exclamation-2-circle` lost the same attribute in that release and render identically with or without it, so those were left as they are.
- **An `nldd-menu-item` carries a menu role only inside a menu.** `menuitem` is a promise about what surrounds you, and an item on its own cannot make it true. It said it anyway, which matters in the one place the package puts a menu item outside a menu: the declaration in the `overflow` slot of an `nldd-toolbar-item`, which the toolbar clones into the real overflow menu when it collapses. The declaration stays behind in the light DOM, hidden, and rendered a full `role="menuitem"` with no menu around it. axe-core reports that as `aria-required-parent`, so a consumer following the toolbar documentation got a critical finding in their own accessibility run. Nobody met that item, since it is not rendered, but semantics that are only accidentally invisible are still wrong. The item now waits to be claimed by a menu, and `aria-checked` waits with it. The clone in the real menu is claimed there, including when it arrives while the menu is already open. Reported in [#190](https://github.com/MinBZK/storybook/issues/190).
- **`nldd-form-field` asks which of its children is the input, and looks inside a wrapper.** It took the first child that was not a help or error text and treated that as the field, so wrapping your input in a `div` or an `nldd-container` for layout sent the id, the accessible name and the error wiring to the wrapper. The field itself was left unnamed, and nothing about that was visible on screen. Every input now carries `static isFormInput = true` and the field goes looking for the first child that says so, through a wrapper if it has to. Asked rather than guessed, because half the package accepts `accessible-label` and reading that as the signal would let an `nldd-tag` beside your field be mistaken for the field. Finding nothing is a real answer: it wires up nothing and says so in DEV, naming the field by its label. A field that holds more than one input is untouched, so a radio group whose last option is "Anders" plus the text field that appears with it stays one question: the first input carries the caption and the ones after it name themselves. A consumer with an input of their own sets the same static, or names the control themselves.
- **The label of `nldd-form-field` no longer pretends to be a control label.** `_focusInput` carried an exception that skipped `preventDefault` for checkboxes and radios, to protect a native toggle. There is no such toggle to protect: the label has no `for` and does not wrap the control, so the platform sees it as labeling nothing. The exception did nothing and the comment described a relationship this component deliberately does not have. A field caption moves focus, and never ticks a box, because every checkbox carries its own label and a caption over a group could not say which one it meant.

### Changed

- **`point-bottom-left-to-point-top-right-s-curve-path` is redrawn.** Its two end points are a size smaller: the disc goes from 8 to 7 pixels across and the dot inside it from 4 to 3, with the ring around it still 2. That is the node the new `git-*` icons draw, so a route and a commit graph now sit at the same weight.

## [0.8.80](https://github.com/MinBZK/storybook/compare/v0.8.79...v0.8.80) (2026-08-10)

### Highlights

- **`nldd-notification`, a new component.** A short message that arrives over the interface and leaves on its own, where `nldd-banner` stands in the page and stays. It places itself: write it where it belongs in your code and it moves to one shared region, top right from md and full width across the top below that. Nothing about the position is settable, so notifications from anywhere in an application land in the same place and stack in the same order. The surface stays neutral and only the icon carries the color, because four colored panes floating over an interface shout. More than one is a deck rather than a list: the newest is in front and readable, the older ones peek out below it, and a burst of messages takes the room of roughly one. Pointing at the deck spreads it a little, the only hint that there is more there; clicking it or tabbing into it lays the whole deck out, and clicking or tabbing away puts it back. Only the front counts down, and only while the deck is closed, so nothing disappears from under the message you are reading, and each one that leaves brings the one behind it forward. A `critical` one never leaves on its own, which is also what keeps this inside WCAG 2.2.1. The clock pauses while you point at it or while focus is inside, and resumes where it left off. At most 2 actions, under the text rather than beside it, so they do not fight the dismiss button for the same corner.
- **`nldd-file-field`, a new component.** A file picker that reads as one control: a button flush in the corner of a tinted surface, the chosen file beside it, and a cross to clear it again. The surface deliberately does not look like an input field, because a border with field semantics promises you can type into it and here you can only press a button. Several files are summarized rather than listed, with one cross that clears all of them: every pick replaces the whole FileList, so a cross per file would promise an edit the platform does not support. A page that does want to show them renders its own list from the `File[]` in the change event. There is no `value`: browsers forbid setting a file input's value, so a file cannot be preselected.
- **`nldd-avatar-group`, a new component.** Several avatars as one group: overlapping, each with a ring in the surface color so they stay apart where they meet. The size applies to the whole group and is imposed on the avatars, a slotted `img` included, so the row stays on one line whatever a consumer hands it. The row is stacked from the left, so the first avatar is the whole one. With `max` only that many are shown and the rest go behind a `+N` button that opens the names it hides — exactly those, because that is what the number promises. The button is lighter than an avatar, because it is the one disc holding no face.
- **`nldd-avatar` can show its name as a tooltip.** An avatar shows no text, so without one the name is readable by assistive software and by nobody else. On by default, mirroring `nldd-icon-button`; `tooltip-timing="never"` turns it off, and a `decorative` avatar shows none at all, because there the name already stands beside it as text.
- **`nldd-badge` can pulse.** A ring grows out of the badge and fades, for something happening right now: a live connection, an outage in progress. It borrows the badge's own shape and color, so it works on a dot as well as on a counter, and it sits behind the content without touching layout or hit area. Motion turned off means no ring.
- **Four new icons.** `ship-wheel-badge-plus`, `puzzle-piece-badge-plus` and `brackets-ellipsis-badge-plus` are the ship's wheel, the puzzle piece and the brackets with a plus in the corner: adding a cluster, installing a plugin, making a namespace. The badge sits where a badge sits on every other icon in the set, so the thing itself stays recognizable and the plus only says what you are about to do with it. `seal-star` is that same seal as `seal-check-mark` with a star in it: where the check mark says something was verified, the star says something is the organization's own. Also reachable as `add-kubernetes` / `add-k8s`, `add-plugin`, `add-namespace` and `brand`.

### Added

- **`nldd-timeline-track-cell` knows a track of one.** `position="only"` leaves out the line on both sides, where `first` and `last` each leave a stub sticking out of a dot that connects to nothing. A history that holds a single event is a normal thing to draw, and it should look like one event rather than like the top of a list that never came.
- **`nldd-toolbar-title` can be a link.** `href` (with an optional `target`) turns the mark and the name into one link, for the place this window belongs to: in an application toolbar that is usually its own start page. It keeps the text color and draws no underline, because the name of the window you are in is not somewhere you send people away to; the focus ring is the only state it carries. The `action` slot stays outside the link — a control inside a link is a control you cannot reach without following the link.
- **`nldd-toolbar-title` has a `media` slot.** A leading image before the title: a logo, a product mark, a file-type icon that says what kind of document this is before you read which one. The mirror of the `action` slot at the other end, named after the place rather than after one kind of content. Its height is capped to the title group so nothing a consumer hands over can stretch the row; which size to draw within that is theirs, since a file icon and a logo do not want the same one. Without `text` the media stands alone and is the only thing naming the window, so give it a name of its own — an `alt` on an image. An `nldd-icon` will not do there: an icon is decoration and says nothing. The space around media and action is a gap on the title itself rather than a margin on what you slot in, so a consumer's own margin reset cannot quietly close it.
- **`nldd-badge` can be decorative.** A dot beside the word it stands for used to announce itself as "Notificatie", because a badge without text falls back to that label. With `decorative` it leaves the accessibility tree, the way `nldd-avatar` already could, so the color speaks with one voice instead of two. Use it whenever the text next to the badge already says what the color says.

### Changed

- **`nldd-badge`, `nldd-tag` and `nldd-token` now each say what they are for and point at the other two.** The tag documentation used to offer itself for "categories, statuses or metadata", which is how statuses ended up as tags. The line between them is who decides what it says: a badge is a state or a count the system keeps, a tag is a trait someone assigned, and a token is self-contained data the user handles, the only one of the three you can operate. Worth holding your tags against it.
- **The divider of `nldd-list-item` starts at the first text or title cell by default.** It used to do that only when the row opened with an icon or something else of glyph size; a row that opened with spacers, a leaf in a tree for instance, got a line across the full width. The line now lands on the words rather than on whatever came before them, so rows of different shapes line their dividers up with each other and the dividers of a tree indent along with it. Text inside an `nldd-list-item-action` counts. A row without a text or title cell keeps the full content width, and `divider-start` on an earlier cell gives that back too.

### Breaking

- **`nldd-box` draws its surface from one attribute.** `background="tinted|base"` and `variant="default|critical"` were two attributes for three states, and `critical` silently overruled `background`, so `background="base" variant="critical"` was a spelling whose first half did nothing. It is now `variant="tinted" | "base" | "critical"`, with `tinted` the default. Rename `background="base"` to `variant="base"`, drop `background="tinted"` (it is the default), and leave `variant="critical"` as it is. `variant="default"` becomes `variant="tinted"`.
- **`nldd-list` does the same.** `background` only ever applied to `variant="box"` and did nothing under `simple`, which the documentation had to say out loud. The three states are now values of one attribute: `variant="simple" | "box-tinted" | "box-base"`. Rename `variant="box"` to `variant="box-tinted"` and `variant="box" background="base"` to `variant="box-base"`. Each value says what you get, so nobody has to know which fill `box` defaulted to.
- **`no-dividers` is now `dividers`, and it can also say `on-touch`.** A pointer has the hover highlight to tell one row from the next, and a finger has nothing, so the line earns its place in the one case and is clutter in the other. That is a third state, and a second boolean beside `no-dividers` would have been the same two-attributes-for-three-states knot as above. It is now `dividers="always" | "on-touch" | "never"`, with `always` the default. Rename `no-dividers` to `dividers="never"`. `on-touch` hides the lines and brings them back under `(pointer: coarse)`, so a consumer no longer routes a viewport signal of its own into the list for this. Width was the wrong signal anyway: a narrow window on a laptop is still a mouse.
- **`nldd-code-viewer` merges its two as well.** Same split as the two above: `background` applied only to `variant="box"` and the controls panel had to hide it the rest of the time. It is now `variant="box-tinted" | "box-base" | "simple"`, with `box-tinted` the default. Drop `variant="box"` (it is the default), rename `variant="box" background="base"` to `variant="box-base"`, and leave `variant="simple"` as it is.
- **The `actions` slot of `nldd-title` is now `end`.** A title's trailing slot is a place, not a kind of content: a button fits there, and so do a menu, a status badge and a version number. Naming it after actions made every non-action in it read as a mistake. Rename `slot="actions"` to `slot="end"` on whatever you put beside a title. The `actions` slot of `nldd-banner`, `nldd-inline-dialog` and `nldd-modal-dialog` keeps its name: those really are action areas.
- **The transport icons carry a `media-` prefix.** `play`, `play-filled`, `pause`, `pause-filled`, `stop`, `stop-filled`, `play-pause` and `play-pause-filled` are now `media-play` and so on, joining `media-backward` and `media-forward` which already had it. The old names keep working as aliases, so nothing breaks; they are simply not where the family lives any more.
- **`nldd-byline` is now `nldd-identity`.** Same component, a name that says what it shows: a person or a group of people with their name and a supporting line, wherever that is useful, rather than only under an article. Rename the tag, the class (`NLDDByline` becomes `NLDDIdentity`) and the import path (`content/byline/byline.js` becomes `content/identity/identity.js`).
- **`nldd-identity` hands more than one avatar to `nldd-avatar-group`.** One avatar can still be slotted bare and gets its size from identity; from two on, wrap them: `<nldd-avatar-group slot="avatars">…</nldd-avatar-group>`. The group owns the overlap and the ring, which identity used to draw itself, so both components say one thing each.
- **`nldd-box` no longer has padding of its own.** It draws the surface and nothing else, exactly as `nldd-card` already did, so one component owns the inset wherever it is used. Wrap what is inside in an `nldd-container` and let that set it: `<nldd-box><nldd-container padding="16">…</nldd-container></nldd-box>` reproduces the old look. Without it, content now sits against the border. The token that held the old value, `--components-box-padding`, is still there as the reference for what "16" means here.

### Fixed

- **`nldd-banner` breaks a word that does not fit.** A banner carries text it did not write: a server message, an identifier, a URL. One token longer than the banner is wide ran past the edge and was clipped, taking the rest of the sentence with it. A word that cannot fit on a line of its own is now broken instead of lost.
- **`nldd-title-cell` balances its title over the lines.** It held `text-wrap: pretty`, which only keeps a single word off the last line. A title is a handful of words, and there `balance` is the rule that matters: a two-line title becomes two halves instead of a full line plus one word. `nldd-text-cell` keeps `pretty`, because a cell of running text is exactly what that rule is for.
- **An anchored `nldd-top-title-bar` hides its own title from assistive technology.** `collapse-anchor` points at the heading the bar's title swaps in for, so the two carry the same words on purpose: sighted readers see one at a time, but once you scrolled past the heading a screen reader found the title twice. The title group is now `aria-hidden` whenever the bar is anchored. Without an anchor nothing changes, because there the bar's title is the only one there is. So anchor at the heading itself, not at some other element that happens to sit at the right height.
- **`nldd-popover` says no to a content-based width instead of collapsing.** `width="fit-content"` (and `auto`, `min-content`, `max-content`) produced a popover of exactly zero pixels: the popover is an inline-size query container so slotted components can adapt to it, and containment is precisely the rule that forbids a box from taking its width from its own content. Such a value is now ignored, the popover keeps its default width, and in DEV it says so.
- **The time and date pickers no longer show a hover state on touch.** Touch reports a hover after a tap and holds it until you touch something else, so a time or a day stayed lit long after you picked it, and a finger dragging the time list lit whatever it passed. The hover now applies only to pointers that can really hover.
- **`nldd-badge` no longer writes `max="99"` on every instance.** The default was reflected to the attribute, so every badge in the DOM carried a number nobody had set. Only a `max` you set yourself shows up now.
- **The confirm button in `nldd-time-field` uses the default button style.** It stood on `neutral-base`, which made the one button in the time picker look unlike the same button everywhere else.
- **An annotation that opens the document no longer keeps a CPU core busy.** `nldd-text-editor` marks each annotation edge with an invisible widget and asks CodeMirror for the caret rectangle of the text right before it, so the caret beside a widget keeps the height of the line it sits on. At the very start of the document there is no such text, and the editor ended up asking that widget for its own position: the measure loop never settled and spun a core for as long as the editor lived. The annotation itself rendered fine, which is why this stayed invisible. It now falls back to the widget's own rectangle, the same fallback the caret already used at guarded edges.
- **`nldd-top-title-bar` now waits for a `collapse-anchor` that renders late.** A page that only draws its title once its data has arrived had no anchor when the bar connected, and the bar gave up looking: it never collapsed, so a `text` meant to appear on scroll never did. It now watches for the id and connects the moment it shows up.

## <small>0.8.79 (2026-08-07)</small>

* chore(deps-dev): bump @semantic-release/changelog from 6.0.3 to 7.0.0 (#178) ([b4f7bec](https://github.com/MinBZK/storybook/commit/b4f7bec)), closes [#178](https://github.com/MinBZK/storybook/issues/178)
* build(deps): bump the npm-minor-patch group across 1 directory with 20 updates (#177) ([5808fb9](https://github.com/MinBZK/storybook/commit/5808fb9)), closes [#177](https://github.com/MinBZK/storybook/issues/177)
* ci(deps): bump actions/checkout from 6 to 7 (#176) ([2ff8f89](https://github.com/MinBZK/storybook/commit/2ff8f89)), closes [#176](https://github.com/MinBZK/storybook/issues/176)
* ci(deps): bump actions/configure-pages from 5 to 6 (#175) ([c8528b6](https://github.com/MinBZK/storybook/commit/c8528b6)), closes [#175](https://github.com/MinBZK/storybook/issues/175)
* ci(deps): bump actions/deploy-pages from 4 to 5 (#172) ([b4f6465](https://github.com/MinBZK/storybook/commit/b4f6465)), closes [#172](https://github.com/MinBZK/storybook/issues/172)
* ci(deps): bump actions/setup-node from 6 to 7 (#174) ([8600ae4](https://github.com/MinBZK/storybook/commit/8600ae4)), closes [#174](https://github.com/MinBZK/storybook/issues/174)
* ci(deps): bump actions/upload-pages-artifact from 3 to 5 (#173) ([acfa518](https://github.com/MinBZK/storybook/commit/acfa518)), closes [#173](https://github.com/MinBZK/storybook/issues/173)

## <small>0.8.78 (2026-08-05)</small>

* feat: a time field and a time picker, plus a standalone browser bundle (#187) ([e2a94fd](https://github.com/MinBZK/storybook/commit/e2a94fd)), closes [#187](https://github.com/MinBZK/storybook/issues/187)
* ci: geef CI en Validate een read-only token en persist het niet op schijf (#170) ([65bf797](https://github.com/MinBZK/storybook/commit/65bf797)), closes [#170](https://github.com/MinBZK/storybook/issues/170) [#167](https://github.com/MinBZK/storybook/issues/167)
* ci: install dependencies with --ignore-scripts (#167) ([9f46021](https://github.com/MinBZK/storybook/commit/9f46021)), closes [#167](https://github.com/MinBZK/storybook/issues/167)
* ci: laat actions/checkout het VERSION_BUMP_TOKEN niet op schijf achter (#168) ([ecd6dc0](https://github.com/MinBZK/storybook/commit/ecd6dc0)), closes [#168](https://github.com/MinBZK/storybook/issues/168) [#167](https://github.com/MinBZK/storybook/issues/167)
* ci: publiceer vanuit een aparte job zonder dependency-code (#169) ([68964fb](https://github.com/MinBZK/storybook/commit/68964fb)), closes [#169](https://github.com/MinBZK/storybook/issues/169) [#167](https://github.com/MinBZK/storybook/issues/167)
* ci: voeg Dependabot toe met een cooldown van vijf dagen (#171) ([1c852e4](https://github.com/MinBZK/storybook/commit/1c852e4)), closes [#171](https://github.com/MinBZK/storybook/issues/171)

### Highlights

- **A time field and a time picker.** `nldd-time-field` is the counterpart of `nldd-date-field`, with the same API, so a date-and-time form no longer needs a hand-styled native input beside it. Its picker is a wheel: two columns sliding past the selection in the middle, where scrolling is choosing and CSS snapping does the work. `step` decides which minutes exist at all, `rows` how tall the wheel stands, and a row is 44px under a finger and 32px under a mouse. Nothing lands until you leave: the field previews the time as you scroll, "Klaar" keeps it, and Annuleer or Escape puts the old one back. An empty field opens on the current time rather than on midnight. On the keyboard the selection is the control: opening the picker puts focus on the hour, hour and minute are each a spinbutton, up and down set the value, left and right move between them. `nldd-time-picker` also stands on its own, inline on a page.

### Added

- **A standalone browser bundle.** `dist/nldd.min.js` is every component in one minified file, with lit, Floating UI and CodeMirror inlined: drop it on a page with a plain `<script src>` and the elements upgrade, no build step at the other end. Reachable as `@nldd/design-system/bundle` and through the `unpkg` / `jsdelivr` fields, so a CDN URL resolves to it without a path. Building it yourself? Keep using the package root; that entry leaves the dependencies external and splits into chunks, which is what a bundler wants. The file is 2 MB, 540 KB over the wire, and the npm tarball grows by that much for everyone.
- **Design guideline: viewing and editing are different tasks, so design separate screens for them.** Reading wants density and calm; editing wants labels, help text, validation, and sometimes fields that have no place in the read-only view. Pressing both into one screen, usually through inline editing, gives up something on either side. The counter-argument that the view supplies context while editing is a requirement to design for, not a reason to keep the reading layout. In `Docs/Ontwerprichtlijnen`, and in the `design-guidelines.md` that ships with the plugin.
- **Design guideline: in a modal dialog for a destructive action, "keep" gets the primary variant and goes on top.** Give the non-destructive way out (for example "Behoud document") `variant="primary"` and put the destructive action below it with `variant="destructive"`. The primary button is where a user goes on autopilot, and that should be the safe way out, not the irreversible action. It also means the way out is the first thing you meet, instead of having to pass the button you are trying to avoid. In `Docs/Ontwerprichtlijnen`, and in the `design-guidelines.md` that ships with the plugin.
- **`nldd-time-field` and `nldd-time-picker`** — a text field for a time, with an optional picker in a popover. The value is 24-hour `HH:mm`; typing is read generously (`9`, `930`, `9u30`) and normalised when you leave the field. `min`, `max`, form participation and the rest of the API mirror `nldd-date-field`. `step` sets the minute step, counted from `min`, and typed input rounds to it. The picker is a wheel where scrolling is choosing; picking a value does not close the popover, because an hour is half an answer. What you scroll past is a preview: the value is recorded when the picker closes on a route that keeps it ("Klaar", Enter on a value in the selection, or a click beside it once you have chosen), and Annuleer and Escape restore the time that was there. `no-picker` drops the button, a `picker` slot takes your own.
- **`nldd-banner`** — a `size` attribute: `md` (default) or `sm`. The small banner takes 8px of padding and a 24px icon, for a notice that has to sit inside a pane or above a toolbar without taking a block of the layout. The dismiss button follows the size and aligns with the first line.

### Changed

- **`nldd-top-navigation-bar`** — the wordmark title, subtitle and supporting text balance their lines instead of filling each one in turn. A long organization name breaks in the middle rather than leaving a single word on the second line.
- **Icons** — `viewfinder` has shorter corner brackets. The arms ran to a third of each side, which closed the shape up at small sizes and read more as a frame than as a finder.
- **`nldd-banner`, `nldd-just-in-time-education`** — the dismiss button is labelled "Verberg" instead of "Sluit". Both put the notice out of sight without resolving anything, and "Sluit" claims more than that. `nldd-document-tab-bar` and `nldd-top-navigation-bar` keep "Sluit", where it really does close something.

### Breaking

- **`nldd-banner`** — the two size-dependent custom properties carry their size in the name: `--components-banner-padding` becomes `--components-banner-md-padding` and `--components-banner-icon-size` becomes `--components-banner-md-icon-size`. Without the size segment they read as "the padding of every banner" while `sm` has its own value, and every other component names them this way. `--components-banner-corner-radius` and `--components-banner-content-color` are unchanged, because they do not differ per size. Override one of the two renamed properties and the override stops applying, silently.

### Fixed

- **`nldd-banner`** — the icon meets contrast on every variant. The icon took the variant's reference color, which is tuned to sit against a filled surface, not against the tinted one a banner actually draws. In dark mode the accent icon landed at 1.72:1 against its own background, well under the 3:1 that WCAG 1.4.11 asks of a graphical object; neutral and warning failed too. All five now take the tinted content color, which is the pair that was measured for this surface.
- **`nldd-navigation-split-view`** — the sidebar and inspector sheets no longer collapse to zero height below 641px. The `flex-basis: 0` on slotted panes now applies only where the sheet has a definite height; a content-sized sheet gets a content-sized pane. The dialog's `max-height` still caps a long sheet, and the pane's own scroll container takes it from there. A consumer restoring the basis from application CSS can drop that rule.
- **`nldd-search-field`** — one `input` event per keystroke, and one `change` per commit. The native events are composed, so without stopping them they escaped the shadow root and arrived at the host right behind ours. On the native one `detail` is the UIEvent number `0`, so a handler reading `event.detail.value` got `undefined` from it; a controlled input writing that back emptied the field as you typed. `nldd-text-field` and `nldd-password-field` already worked this way.
- **`nldd-menu`** — a menu with long items wraps at its maximum width instead of scrolling sideways. `overflow-y: auto` computes `overflow-x` to `auto` unless you say otherwise, so the menu scrolled horizontally on content that was meant to wrap.
- **A focus ring at the bottom of a sticky header no longer disappears under the fade.** The gradient that `nldd-page` draws below a `sticky-header` painted after the header's own content, so anything reaching past the header's bottom edge went under it. It now sits behind that content: same fade over the scrolling page, ring intact.

## <small>0.8.77 (2026-08-02)</small>

* fix(popover): clear a stale centering transform when the override goes (#166) ([81ee9e8](https://github.com/MinBZK/storybook/commit/81ee9e8)), closes [#166](https://github.com/MinBZK/storybook/issues/166)

### Fixed

- **`nldd-popover`** — a popover that loses its `centered` (or edge) override at runtime no longer keeps the centering transform. The override branch cleared `transform` only while it was still being taken, so a responsive popover switching from centered to anchored on a breakpoint change kept `translate(-50%, …)` on top of Floating UI's coordinates and landed half its width off its anchor, partly off screen. Floating UI positions purely through `left`/`top`, so the transform is now cleared whenever no override applies.

## <small>0.8.76 (2026-08-02)</small>

* fix(menu): set aria-haspopup on the anchor from first render (#165) ([2486d28](https://github.com/MinBZK/storybook/commit/2486d28)), closes [#165](https://github.com/MinBZK/storybook/issues/165)

### Fixed

- **`nldd-menu`** — a button that opens a menu now carries `aria-haspopup` from the first render instead of from its first open. `aria-haspopup` describes the trigger ("this button opens a menu"), not a state, and deferring it left a screen reader tabbing a row of identical "more" buttons hearing plain "button" — precisely when the type matters, since nothing has been opened yet. Because `popup-type` also decides whether `aria-expanded` is rendered at all, a button without `expandable` had neither attribute until first use. `nldd-popover` already worked this way; the two now agree. Setting `popup-type` yourself still wins, so no markup has to change.

## <small>0.8.75 (2026-08-01)</small>

* feat: font-free stylesheet entry, month picker, markdown code blocks and open-source docs (#164) ([263ffd6](https://github.com/MinBZK/storybook/commit/263ffd6)), closes [#164](https://github.com/MinBZK/storybook/issues/164)

### Highlights

- **Month and year each have their own menu.** The heading showed both with one chevron and opened a list of years only. Changing the month went by arrow, one step at a time, so a month on the other side of the year took up to six clicks. Both menus offer only what `min` and `max` allow. "Vandaag" moved out of the heading to the bottom left, which is what makes room for a month written out in full. The calendar in `nldd-date-field` opens under the input as well, instead of running off to the right of it ([#156](https://github.com/MinBZK/storybook/issues/156)).
- **Open-source documentation expanded.** A code of conduct, a route for reporting vulnerabilities, a support page, a description of who decides what, and a `publiccode.yml` for the catalogue on developer.overheid.nl. The contributing guide grew from a page of changelog conventions into an actual guide ([#149](https://github.com/MinBZK/storybook/issues/149)).
- **Host styling now survives a consuming app's CSS reset.** A universal rule like `* { margin: 0; padding: 0; border: 0 }` in a consuming app silently beat every normal `:host` declaration (CSS Scoping cascade order, [#160](https://github.com/MinBZK/storybook/issues/160)), stripping padding, dividers, and spacing from components that styled their shadow host. Banner, container, menu groups and dividers, table rows, cells, and interactive list rows now keep their layout under any reset, including Tailwind Preflight. Styling remains a CSS-variables affair — direct element styling such as `nldd-banner { padding: … }` was never a supported API and now consistently has no effect.
- **New icons.** `viewfinder-line` (alias `scan`) is the existing `viewfinder` with a scan line through it, for scanning a document or a code. `display` and `paintbrush` landed in the same batch.

### Added

- **Icons** — `viewfinder-line` (alias `scan`), `display`, `paintbrush`.
- **`nldd-card`** — a `background` attribute: `base` (default) or `tinted`, for a card that has to lift off a base surface. Customize with `--components-card-tinted-*`.
- **`@nldd/design-system/styles/system-font`** — the same stylesheet as `/styles`, without the `@font-face` rules. Both family stacks end in a system font, so they fall through on their own; nothing needs overriding. For products that may not use the Rijksoverheid house fonts (see `NOTICES.md`).
- **`@nldd/design-system/styles/variables`** — only the CSS custom properties, for a build that composes the stylesheets itself.
- **`@nldd/design-system/breakpoints`** — the breakpoints for `matchMedia` and layout logic, previously behind `/tokens`.

### Changed

- **`nldd-date-picker`** — the heading read "September 2026" with a chevron, promising both, and opened a list of years only ([#156](https://github.com/MinBZK/storybook/issues/156)). Month and year are now each their own button with their own menu, so a month on the other side of the year is two clicks instead of up to six on an arrow. "Vandaag" moves out of the heading to the bottom left, where the stacked layout already had it; that is what makes room for a month written out in full. The heading no longer wraps between month and year. The month and year buttons stand as tall as the paging controls beside them (32px, 44px stacked) instead of bare 22px text, which also satisfies the WCAG 2.5.8 target size. Both menus offer only what `min` and `max` allow, and a part with a single reachable value drops its chevron and its menu rather than opening to confirm what you already see.
- **`nldd-date-picker`** — the day numbers carry medium weight. Weight was doing no work in the calendar (today is a ring, selected is a fill), so it was free to separate the dates from the chrome around them: the weekday headers and the week numbers now recede together ([#156](https://github.com/MinBZK/storybook/issues/156)).
- **`nldd-title`** — a slotted heading is capped at a 40ch measure and balances its lines, so a title on a wide section no longer runs the full width with a lonely last word.
- **`nldd-list-item`** — a row that opens with an icon now starts its divider at the first text or title cell, so the line aligns with the words instead of the icon. Consumers no longer need a `divider-start` marker for this; an explicit marker still wins, and putting one on the icon cell restores the full-width line.
- **Document typography** — the stylesheet now gives the `body` the document font and content color as soon as an `nldd-app-view` is on the page. Apps no longer need their own `body { font: … }`. The rule sits in `@layer reset`, so any consumer rule beats it without effort; a page without an app-view is untouched.

### Breaking

- **`@nldd/design-system/tokens` is gone.** It only ever re-exported `breakpoints`, so import from `@nldd/design-system/breakpoints` instead. Same values, same names.
- **The four `--primitives-font-family-*-fallback` variables are gone.** Nothing read them, so overriding one to drop RijksSans changed nothing while looking like the switch you were after. To use a different font, override `--primitives-font-family-sans-serif` and `--primitives-font-family-monospace` — or import `/styles/system-font` and skip the `@font-face` rules entirely.

### Fixed

- **`nldd-date-field`** — the calendar hangs off the trigger, which sits at the end of the field, and opened rightward from there: on a 192px field it ran 302px past the field's right edge and barely overlapped the input it belonged to. It now opens leftward, landing under the input; against the left edge of the screen Floating UI falls back to the old direction on its own ([#156](https://github.com/MinBZK/storybook/issues/156)).
- **`nldd-rich-text`** — a markdown renderer emits a fenced code block as `<pre><code>`, and the tinted chip meant for inline code painted once per rendered line, so a three-line block showed three separate boxes ([#158](https://github.com/MinBZK/storybook/issues/158)). The frame now sits on the `pre`, where the block is, and the `code` inside hands the chip back. It carries the same inset ring as `nldd-box` and `nldd-code-viewer`, so the block stays readable on a tinted surface instead of dissolving into it.
- **`nldd-rich-text`** — a `pre` had no `overflow-x`, so a single long code line escaped the element and stretched every ancestor with it. In a narrow card that read as rich-text ignoring the card width. Long lines now scroll inside the block, as a table already did.
- **`nldd-date-picker`** — activating a paging arrow or "Vandaag" pulled focus into the day grid, so paging twice meant finding the arrow again. Focus now stays on the control that was activated; only the roving tabindex moves along, so tabbing into the grid still lands on the equivalent day.
- **`nldd-date-field` and `nldd-password-field`** — the embedded button's focus ring carries a 6px halo meant to land exactly on the field's border, but the field's `overflow: hidden` clipped it at the padding box, leaving the border to cut through the ring. The clip is gone: nothing in either field can escape without it (the input clips its own text, and the autofill background is overridden inside the input), so the ring now paints over the field the way it does over any other neighbour.
- **`nldd-popover`** — after any mouse interaction, tabbing through the popover showed no focus rings. The popover intercepted every Tab and moved focus itself (a Safari workaround), but a script-moved focus only inherits the ring state of the element it left, where a browser-moved one gets a ring unconditionally — so one ringless start poisoned every stop after it. The popover now intercepts only the hop off the container (the one Safari cannot make) and the boundary that closes it; every Tab in between is the browser's. That entry hop also serves a click on the popover's dead chrome: Tab then starts at the top of the popover instead of resuming from wherever focus happened to be.
- **`nldd-tooltip`** — activating the trigger now dismisses the tooltip. It sat in the top layer above the popover that very click had opened, because manual popovers paint over auto ones that enter later.
- **`nldd-collection`** — the previous/next arrows in `layout="horizontal-scroll"` stepped by a fixed distance, so from the end of the strip (never a whole number of items) every item stayed clipped. The arrows now snap to the nearest item edge.
- **`nldd-collection`** — reaching an end with the keyboard disabled the arrow you were standing on, and a disabled control cannot hold focus, so focus fell to the body and the next Tab restarted at the top of the page. Focus now moves to the sibling arrow.
- **`nldd-container`** — `layout="lanes"` and `layout="columns"` ignored `sm-gap`, `md-gap` and `lg-gap` and always used the base `gap`. Every layout now reads one resolved gap, so the per-breakpoint values apply to multicol too.
- **`nldd-banner`** — the visual frame (background, inset border, corner radius, padding, grid) moved from the host to a wrapper inside the shadow root, out of reach of document CSS. Use `--components-banner-*` to customize.
- **`nldd-container`** — the padding and the query container moved to a wrapper inside the shadow root (host > `.container` > `.container__inner`), out of reach of document CSS; size queries still measure the same padded interior width.
- **`nldd-menu-group` and `nldd-menu-divider`** — dividers, spacing, and padding moved to elements inside the shadow root, out of reach of document CSS; their `flow-root` hosts keep that spacing interior, so menus keep their grouping and rhythm under a reset.
- **`nldd-table-row`, the cell family, and interactive `nldd-list-item` rows** — row dividers, row padding (`--context-cell-padding-block`), and the widened inset of interactive rows shield their host declarations, since subgrid participation and negative margins cannot move into the shadow tree.

## <small>0.8.74 (2026-08-01)</small>

* docs: add EUPL-1.2 LICENSE file and ship third-party notices (#148) ([e7791ea](https://github.com/MinBZK/storybook/commit/e7791ea)), closes [#148](https://github.com/MinBZK/storybook/issues/148) [#132](https://github.com/MinBZK/storybook/issues/132)

## <small>0.8.73 (2026-07-30)</small>

* feat: 32 nieuwe iconen, icon-gallery met statusfilter en fine-tuning (#163) ([0425e4d](https://github.com/MinBZK/storybook/commit/0425e4d)), closes [#163](https://github.com/MinBZK/storybook/issues/163)

### Highlights

- **37 new icons.** Sound and image (`microphone`, `speaker` and its volume steps, `photo-camera`, `video-camera`, `photo-on-photo-angled` for a gallery, `photo-stack`), maps and wayfinding (`map`, `map-pin` and its badge variants, `map-pin-oval` for your current location, `signpost` for directions), a fuller file and folder family (`file-badge-*`, `file-on-file`, `folder-open`, `folder-badge-plus`), `arrow-clockwise` for refresh, a pair of expand and collapse arrows, `clipboard-pencil` for a form, `hand-thumbs-up` and `hand-thumbs-down` for a like and a dislike, `person-badge-minus`, `link-badge-lock` for a secure link, `slider-horizontal-3` for local settings, `text-format-size`, and `square-grid-2x2` with a pencil variant. The full list is under Added.
- **11 icons are redrawn.** The file and folder family (`file`, `file-text` and its badge and pencil variants, `file-text-on-file-text`, `folder`), the stack icons (`rectangle-stack`, `rectangle-stack-text`, `rectangle-stack-chevron-left-forward-slash-chevron-right`) and `house-apartment-building` got new artwork, so the set draws with one pen again now that it has grown.

### Added

- **Icons** — `apartment-building-2` (aliases `buildings` and `offices`), `arrow-clockwise` (aliases `refresh` and `reload`), `arrow-down-left-arrow-up-right` (aliases `expand` and `full-screen`), `arrow-up-right-arrow-down-left` (aliases `collapse` and `exit-full-screen`), `clipboard-pencil` (alias `form`), `file-badge-arrow-down` (alias `download-document`), `file-badge-arrow-up` (alias `upload-document`), `file-badge-minus` (alias `remove-document`), `file-badge-plus` (alias `new-document`), `file-on-file` (alias `documents`), `folder-badge-plus` (alias `new-folder`), `folder-open`, `hand-thumbs-up` (alias `like`), `hand-thumbs-down` (alias `dislike`), `link-badge-lock` (aliases `secure-link` and `secure-url`), `map`, `map-pin` (alias `location`), `map-pin-badge-plus` (alias `add-location`), `map-pin-badge-minus` (alias `remove-location`), `map-pin-oval` (alias `current-location`), `microphone` (alias `microphone-on`), `microphone-slash` (alias `microphone-off`), `person-badge-minus` (alias `remove-user`), `photo-camera` (alias `camera`), `photo-on-photo-angled` (alias `gallery`), `photo-stack` (aliases `image-stack` and `images`), `signpost` (alias `directions`), `slider-horizontal-3` (alias `local-settings`), `speaker`, `speaker-slash` (alias `mute`), `speaker-volume-low` (alias `low-volume`), `speaker-volume-medium` (alias `medium-volume`), `speaker-volume-high` (alias `high-volume`), `square-grid-2x2`, `square-grid-2x2-pencil`, `text-format-size` and `video-camera`.

### Changed

- **Step indicator and timeline track cell, fine-tuned.** The current step's fill is one step lighter, the number in the marker is one weight heavier (medium), and a minor dot on the plain track grew from 8px to 10px (a minor step marker stays 12px).
- **The icon gallery shows what changed.** The tiles of the latest icon batch carry a "Nieuw" or "Bijgewerkt" tag, and a segmented control next to the search field filters on "Alles", "Nieuw" and "Bijgewerkt".
- **The `refresh` and `reload` aliases point at the new `arrow-clockwise`.** They sat on `arrow-2-counter-clockwise`, which keeps `sync` — two arrows chasing each other read as synchronization, one clockwise arrow as a refresh.
- **`file-text-pencil` gains the `edit-text-document` alias**, next to `new-text-document` and `add-text-document` on its check-plus sibling.
- **The dismiss icons gain `close` aliases**: `close` for `dismiss`, and `close-circle`, `close-circle-filled`, `close-small` and `close-extra-small` for their variants.
- **`rectangle-stack` is redrawn and gains the `library` alias**, next to the existing `stack`.
- **`stack-code` is now the alias of `rectangle-stack-chevron-left-forward-slash-chevron-right`.** The icon is renamed (and redrawn) after the shape-first pattern of `chevron-left-forward-slash-chevron-right`; the old name keeps working as its functional alias.
- **The `documents` alias points at `file-on-file`.** It sat on the icon now called `file-text-on-file-text`, which keeps `text-documents` — the plain pair is the generic plural, the way `document` already sat on plain `file`.

### Breaking

- **Three icons renamed**, because `-stack` is reserved for 3 or more and these draw 2: `file-text-stack` is now `file-text-on-file-text` (with new artwork), `folder-stack` is now `folder-on-folder`, and `tag-stack` is now `tag-on-tag`. The old names are gone. The aliases `text-documents`, `directories`, `tags` and `labels` moved along and keep working.
- **`stack-text` is now `rectangle-stack-text`** (with new artwork), naming the shape it draws the way `rectangle-stack` already does.
- **`house-and-appartment-building` is now `house-apartment-building`** (with new artwork) — the spelling fixed to match `apartment-building`, and the "and" dropped from the compound.
- **`square-and-arrow-down` is now `square-arrow-down`**, dropping the "and" the way `square-arrow-up` and `square-arrow-right-top` already read. The aliases `save` and `import` moved along and keep working.
- **The media-transport icons carry a `media-` prefix**: `backward`, `forward` and their `-filled`, `-end`, `-end-filled`, `-frame` and `-frame-filled` variants are now `media-backward`, `media-forward` and so on (12 renames). The bare names were ambiguous — "forward" reads as navigation more often than as media transport — and the icon `forward` was unreachable outright, shadowed by the alias `forward` → `chevron-right` (aliases win on resolution). That alias stays, as the counterpart of `back` → `chevron-left`. `play`, `pause`, `stop` and `play-pause` keep their names: they collide with nothing and are clear as they are.

## <small>0.8.72 (2026-07-29)</small>

* fix(timeline-track-cell): laat het spoor over de rijgrens doorlopen (#162) ([950d6c1](https://github.com/MinBZK/storybook/commit/950d6c1)), closes [#162](https://github.com/MinBZK/storybook/issues/162)

### Fixed

- **The timeline track broke at every row.** An `nldd-list-item` reserves a divider's worth of space below itself, and the lines of `nldd-timeline-track-cell` stopped at the cell's edge — leaving a hairline gap between one row's track and the next. The lines that run on downward now bridge that band.

## <small>0.8.71 (2026-07-29)</small>

* feat: step indicator, tree lists and a reworked list-item (#161) ([2c87577](https://github.com/MinBZK/storybook/commit/2c87577)), closes [#161](https://github.com/MinBZK/storybook/issues/161)

### Highlights

- **New `nldd-step-indicator` for a process of several steps.** A row of markers carrying a number (or a check mark once a step is done), a label below each and a track in between. `current` on the parent derives every step's status (`past`, `current`, `future`); a step can override it. A finished step is filled with a check mark, the current one is an accent outline on a light accent field around its number, and what is still to come is a quiet grey field. With `href` or `button` a step becomes a control, so you can page back — also in a flow without a URL per step. Below the sm breakpoint (measured on the container) it collapses to one line of text plus a segmented bar, with the full list of steps still in the DOM for assistive technology. Horizontal only: steps below one another are a list of `nldd-timeline-track-cell`.
- **A list can be a tree.** `nldd-list type="tree"` makes the list a `role="tree"` of `treeitem` rows; a branch's child rows go in that row's `children` slot, which the item renders as a `role="group"` and hides while `expanded` is off. The nesting *is* the hierarchy, so level, position and set size are derived rather than authored. Disclosure works two ways: a chevron of its own (`nldd-list-item-action[disclosure]`) or the row itself as the control (`button` plus `expanded`), where an `nldd-icon-cell` marked `disclosure` turns along. Indentation stays the consumer's: repeat a spacer-cell per level. A tree brings its own keyboard, see below.
- **`nldd-timeline-track-cell` is now the vertical counterpart of the step indicator.** With `variant="step"` the marker carries a number or icon and you have a step list below one another; by default it stays the bare track for a timeline of events.
- **A tree comes with its own keyboard.** `type="tree"` is a composite widget, so it no longer waits for `arrow-navigation`: up and down move between the rows in the order they appear on screen (the rows of an open branch included), Home and End jump to the ends, Right opens a closed branch and steps into an open one, Left closes an open branch and steps out of a leaf, and Enter and Space open and close from the row itself. Opening and closing runs through the row's own disclosure control, so `expanded` keeps being written in one place — your handler; a row that is a link is never activated that way. The tree is one tab stop: focus lands on the row (that is where `treeitem` sits, so the row gets announced rather than a button inside it), wearing the system's own focus ring around the row rather than the browser's outline around the whole open branch, and Tab then walks the controls of that row, a chevron beside a checkbox included. Deliberately between two patterns: a row with several controls is strictly a `treegrid`, and we keep the tree semantics while borrowing Tab-within-the-row from the grid.
- **New icons.** `bug`, `square`, `square-1` (alias `primary`), `triangle-square-circle` (alias `categories`), `book-badge-plus` (alias `new-book`), `tag-stack` (aliases `tags` and `labels`, for a set of labels where `tag` is one) and `person-text-rectangle` (alias `contact-card`), plus the aliases `add-text-document` for `file-text-badge-check-plus`, `announcement` for `megaphone` and `company` for `apartment-building`. The alias `category` for `tag` is gone: a label is not a category, and beside the new `categories` (`triangle-square-circle`) the two read as the same thing. Use `tag` or `label`.
- **Surfaces carry their boundary with a border, from one family of tokens.** The border color of base and tinted surfaces is the divider color (one step lighter in light mode than before), its thickness is `--semantics-surfaces-border-width` and the corner radius `--semantics-surfaces-corner-radius` (10px). Cards, boxes, boxed lists, tables, the code viewer and the sidebar box all follow from that one place, and `nldd-card` loses its drop shadow to become an ordinary base surface. In dark mode the card used to be a lighter field that happened to stand out; now the border carries it in both schemes.

### Breaking

- `nldd-list-item` — the `start` and `end` slots are gone. Put the cells that sat there (avatars, spacers, icons) in the row itself, in the same place. The divider spans the full content width by default; if you used the slots to start it later or stop it earlier (after an avatar, say), mark the cell where it should begin or end with `divider-start` or `divider-end`. Without `divider-start` it starts at the front, without `divider-end` it runs to the end. The `children` slot for nested rows stays. The hover and selection fill of an interactive row is now genuinely clickable across the full painted width.
- `nldd-list-item-action` — a **segmented action**: an action covering part of the row, as opposed to the row-wide action `nldd-list-item` renders itself with `href` or `button`. Segmented actions now own a fixed inline padding and are at least as wide as the row's control size (md 44px, sm 32px), so the hit area is a square at minimum. Remove spacer cells you added inside one for room or hit area — the action handles that itself now, and leaving them in doubles the space. Icon-only actions (a chevron in a tree) get slightly wider. An action at a row edge shifts 8px towards that edge, so its outer edge lands exactly where a row-wide action's hit area begins and its contents sit on the same grid as the text of an ordinary row. It shifts, it does not grow: the width stays the control size. If you reserve the chevron zone on leaf rows in a tree, watch rows without an indent spacer in front — there a branch row's action shifts along and the zone sits 8px further out. An action mid-row is unaffected.
- `nldd-timeline-track-cell` — the attributes have new names. `step` is `status` (same values, the same vocabulary as `nldd-step-indicator-item`), `child` is `position` (it is about the place in the sequence, not a DOM relation), and the size is no longer picked in pixels but through `variant`: `dot` (default, a bare track) or `step` (a 24px marker with a number or icon in it).
- **The serif tokens are gone.** `--primitives-font-family-serif` and `-serif-fallback` pointed at `RijksoverheidSerif`, a font the system does not ship and no component used. If you referenced them, set your own stack.
- **Three corner-radius tokens are gone**, because all three said the same thing in three places: `--components-box-corner-radius`, `--components-list-corner-radius` and `--components-sidebar-section-sidebar-box-corner-radius`. Every surface now takes its radius from `--semantics-surfaces-corner-radius`; that is the only place to round them off, or square them off. New alongside it is `--semantics-surfaces-border-width`, so border and divider move together in thickness as well. Both sit at family level, because base and tinted share them (the border colors stay per variant).
- **Two icons renamed.** `rectangle-chevron-left-forward-slash-chevron-right` is now `chevron-left-forward-slash-chevron-right-rectangle`, so the shape it sits in comes last, the way the other names read. And `square-corner-4` is now `viewfinder` — four loose corners describe the drawing, not what it does. Their aliases `code-block` and `fit-to-view` are unchanged and remain the names to reach for.
- **The icon alias `category` is gone.** It pointed at `tag`, and next to the new `categories` alias (which points at `triangle-square-circle`) the pair suggested two views of one thing while they are different concepts. `icon="category"` no longer resolves; use `tag` or `label`.
- **`nldd-radio-button-field._commitFormValue()` is `commitFormValue()`.** The method was meant for `nldd-radio-button-group` (which calls it on the siblings it unchecks) but was public; it now comes from the shared mixin and therefore drops the underscore.
- **`accessible-labelled-by` is now `accessible-labeled-by`** on `nldd-segmented-control`, `nldd-radio-button-group` and `nldd-toggle-button-group`; the property is `accessibleLabeledBy`. The system writes US English, also where the HTML spec does not: the forwarded `aria-labelledby` keeps its own spelling, because that one belongs to the spec.
- **Translation keys for aria labels now end in `-label`.** `-label-text` said it twice, since the type already says it is a label. Renamed: `list.items-label-text` → `list.items-accessible-label`, `list.navigation-label-text` → `list.navigation-accessible-label`, `list.search-placeholder-text` → `list.search-placeholder-label`, `drag-handle-cell.label-text` → `drag-handle-cell.accessible-label`, `progress-bar.label-text` and `progress-circle.label-text` → `accessible-label`, their `loading-text` → `loading-label`, `activity-indicator.loading-text` → `loading-label`, `badge.notification-text` → `notification-label`, `token-field.removable-hint` → `removable-lowercase-label`, and `opens-in-new-tab-text` → `opens-in-new-tab-label` on `nldd-list-item`, `nldd-card`, `nldd-link`, `nldd-avatar`, `nldd-button` and `nldd-icon-button`. `pagination.accessibility-label` is now `pagination.accessible-label`, as everywhere else. The texts themselves are unchanged; if you override a key through `translations`, update the name.
- **Two translation keys turned US English:** `components.list.reorder-cancelled-text` and `components.document-tab-bar.reorder-cancelled-text` are now `reorder-canceled-text`. Update the key if you override it through `translations`; the Dutch default text is unchanged.
- **Every token that feeds a `border-width` is now named that way.** `--semantics-input-fields-border-thickness`, `--components-checkbox-border-thickness`, `--components-radio-button-border-thickness`, `--components-radio-button-is-selected-inner-shape-border-thickness`, `--components-switch-border-thickness`, `--components-switch-thumb-border-thickness` and `--components-keyboard-shortcut-border-thickness` end in `-border-width`. The value comes from `--primitives-border-width-*` and goes into a `border-width`, so renaming it halfway only bought a word to remember. A line that is not a border keeps `thickness`: `--semantics-dividers-thickness` feeds a `height`, and `--semantics-dividers-width` would read as how wide a divider is.
- The internal context variable `--context-list-item-min-size` is now `--context-list-item-size`. Only relevant if you hooked into it yourself.

### Added

- **`nldd-step-indicator` and `nldd-step-indicator-item`** (status & feedback) — new. On the parent: `current` (1-based), `accessible-label` and `translations`. On a step: `text`, `icon`, `status` (overrides what the parent derives), `href` or `button`.
- **`nldd-list`** — `type="tree"`, plus the `children` slot and `expanded` on `nldd-list-item` for branch rows. `disclosure` on an `nldd-icon-cell` turns the chevron along with `expanded`.
- **`divider-start` and `divider-end` on cells** — let the row divider begin or end at a cell (after the avatar, say). Several markers together span from the first start to the last end.
- **`nldd-timeline-track-cell`** — `variant` (`dot` / `step`), `minor` for a row that belongs under the one above it (a smaller marker in the same lane, so the track runs straight and nothing indents), `text` and `icon` for what the marker carries, and `direction="up"` for a timeline with the newest at the top.
- **`nldd-avatar`** — `href`, `target`, `rel`, `button` and `accessible-label`: the disc itself becomes the control, so hit area and focus ring follow the round shape instead of a square overlay, and the initials get no underline. The name comes from `accessible-label`, or else from `name`; `href` wins over `button`, as with `nldd-card`.
- **`nldd-button`** — `max-width`: caps the button at a CSS length, also alongside `width="full"` (follow the container, but no wider than this). A label that doesn't fit is truncated with an ellipsis, because a cap the content ignores isn't a cap.
- **`nldd-window`** — `no-light-dismiss`: a click beside the window no longer closes it, while Escape and the dismiss button keep working. For windows where dismissing by accident costs work, such as a wizard or a filled-in form.
- **`nldd-icon`** — `size="full"` names the existing behavior (fill whatever sizes you) and `size="inherit"` makes the icon follow the surrounding text (1em), for an icon set in a sentence. Reach for the latter rather than your own `nldd-icon { width: 1em }` rule: such a rule wins over the component and also shrinks the icons a cell or button was already sizing correctly.
- **`nldd-date-picker`** — `width`: `full` or a CSS length, next to the intrinsic seven-cell width.
- **`nldd-menu`** — the `anchorElement` property positions the menu against an element without turning it into a toggle. For a menu you open yourself (a type-ahead under a text field), where the `anchor` attribute would swallow the click on the anchor.

### Changed

- **`nldd-card` has no drop shadow and is an ordinary base surface.** Field, border and corner radius come from the same `--semantics-surfaces-base-*` family as a boxed `nldd-list` or `nldd-table`. `--components-card-box-shadow` is `none`; set it back if you want the shadow.
- **The boundary between two rows is real space now, not paint a row withholds.** An `nldd-list-item` has a 1px bottom margin and the divider hangs in it, so a hover or selection fill runs to the row's own edge. That retires the internal context variable `--context-list-item-boundary-inset`, which existed only so a slotted `nldd-list-item-action` could withhold the same pixel. A list grows 1px per row; if you measure row positions yourself, count the margin in. While dragging, the divider of the lifted row and of its drag clone is hidden.
- **Boxed lists: fills sit 4px clear of the frame, and the frame no longer clips.** The rows sit far enough inside the frame that their fills never reach its corners, so the `overflow: hidden` that rounded them off against it could go — a focus ring inside a box now paints outward like every other control instead of being cut off 4px away. The row fill follows suit and rounds off a step more tightly (6px), concentric with the 10px frame around it. Content and dividers do not move; no action needed.
- **A row can be its own disclosure control and still turn its chevron.** Mark the chevron's `nldd-icon-cell` with `disclosure` and `nldd-list-item` rotates it with `expanded`, the same affordance `nldd-list-item-action[disclosure]` already gave. Until now a tree had to choose: a chevron that turns (only the chevron clickable) or a fully clickable row (a chevron that never moves).
- **`nldd-checkbox-field` and `nldd-radio-button-field` are form-associated.** They submit `value` under `name`, exactly like `nldd-checkbox` and `nldd-radio-button`; previously the inner control sat unreachable in the field's shadow root and the value never made it into the form. `nldd-radio-button-group` keeps exactly one value in the form while the `change` event is still propagating, so a consumer serialising in its own listener (htmx, `new FormData(form)`) never sees two. Both support `form.reset()` and reflect `name`.
- **All eighteen form-associated inputs share one `FormAssociated` mixin.** `formAssociated`, the `ElementInternals`, `formDisabledCallback` and the moment of committing sat in eighteen files, each with its own `_syncFormValue`. A component now supplies only what is its own: `formValue()`, and `formState()` where the value alone cannot rebuild the control. The timing rule lives in one place: the value is committed on every render *and* has to be committed again from the handler itself with `commitFormValue()`, because a render is a task later than the event. Nothing changes on the outside, except that `internals`, `formValue()` and `commitFormValue()` now exist on each of those components.
- **`nldd-table` hands its row padding to the cells**, through the same `--context-cell-padding-block` the list uses. The inline padding stays on the row, so the full-bleed divider does not move.
- **`nldd-code-viewer` and the sidebar box follow the surface tokens.** Both took a hard-coded 1px border, and the viewer its own `corner-radius-lg`; border width and corner radius now come from `--semantics-surfaces-border-width` and `--semantics-surfaces-corner-radius`, so they move along with every other surface instead of drifting on their own.
- **`nldd-box` takes its border width from a token.** The 1px was hard-coded in the `box-shadow`; there is now `--components-box-border-width` (defaulting to `--semantics-surfaces-border-width`), and the border is painted from one composed variable, as in `nldd-card`.
- **`nldd-collection` decides its gap on container width**, not only on the viewport, and grid children get `min-width: 0`. One long unbreakable string in a card used to stretch its whole column, and every consumer had to catch that themselves.
- **`nldd-avatar`: the initials are a step smaller and lighter**, and optically centred. Capitals do not use the space below the baseline, so centring on the em box left them sitting visibly high.
- **`nldd-form-field`: more room above help and error text**, equal to the space between label and control.
- **The monospace stack has real fallbacks.** Behind `JetBrains Mono` stood the generic `monospace` alone, which on many systems is Courier New: thinner, narrower and with a smaller x-height, so code looked entirely different while the web font had not loaded (or never arrived). `ui-monospace`, `Menlo`, `Consolas` and `DejaVu Sans Mono` now come first.
- **`nldd-top-navigation-bar`: wordmark, title space and focus ring.** The wordmark text wraps within the logo instead of running on as a sentence, the website title next to the menu bar gets the same padding on its right as the menu items (so the hover state no longer bumps into it), and the focus ring of the logo link sits around the ribbon instead of the whole block.

### Fixed

- **The component reference was missing eight components.** `nldd-menu`, `nldd-menu-item`, `nldd-menu-divider`, `nldd-menu-group`, `nldd-breadcrumbs-item`, `nldd-button-bar-divider`, `nldd-page-footer-legal-bar` and `-legal-bar-item` did not appear in `skills/nldd/reference.md`: their documentation sits above their own class rather than at the top of the file, and the generator only read the first block. It now reads every block that names its element with `@element`.
- **A label of `nldd-form-field` slid over a sticky header.** The field's header deliberately sits above its own input (`z-index: 1`), but without a stacking context of its own that z-index competed in the page's nearest context and beat the sticky title bar the field scrolls under. The field now isolates itself.
- **`nldd-form` let hidden fields take up space.** The gap hung as `margin-top` on every following child, so an `<input type="hidden">` (formset bookkeeping, framework plumbing) pushed the first visible field down. The gap now hangs below the preceding child, and hidden children render no box.
- **An `nldd-button` in a flex or grid parent had an invisible full-width box.** The host stretched with the column while the button inside stayed content-sized, so the element was several times wider than what you see — surprising when you inspect it, and it swallows clicks that look like they land beside the button. The host now has a definite width and only stretches with `width="full"`.
- **A focused `nldd-card` lost the halo around its focus ring.** The ring was drawn on the card itself, combining the card's own box-shadow token with the ring's in one declaration — and that token is `none`, which cannot sit in a comma-separated shadow list, so the whole declaration was dropped. The outline still showed, the white halo that separates it from the background did not. The ring now sits in its own layer beside the card, where the card's overflow can't clip it either.
- **`nldd-card` with `href` showed the hand cursor.** The overlay link now follows `--semantics-controls-link-cursor`, like `nldd-link` and an `nldd-list-item` with `href`.
- **`nldd-collection` used the small gap at large widths** when it sat inside a container-query ancestor (a card, a page, a window, a sheet). The viewport rule was right, its container-query twin read the sm token.
- **`nldd-window` emitted `close` for a `close` from its own contents.** A nested overlay (the popover of a date field, say) fires a composed, bubbling `close` that reaches the window's own listener: consumers tore the window down while it stayed open, and the real close was then swallowed. `nldd-sheet` already guarded against this; the window now does too.
- **A radio `nldd-toggle-button-group` briefly had two values in the form.** Deselecting the other buttons waited for their next render, so a consumer serialising the form in its own `change` listener (htmx, `new FormData(form)`) saw both the old and the new value. The group now commits the deselected buttons from the handler itself, as `nldd-radio-button-group` already did.
- **Arrow navigation skipped the rows inside an open branch.** `arrow-navigation` on a `type="tree"` list walked only the top-level rows, so ArrowDown jumped over a branch's children to the next branch. It now follows the rows in the order they appear on screen.
- **A row divider ran through the focus ring of a segmented action.** The divider is rendered after the row's content, so it painted over a ring that reaches past its own box. A focused action now sits above it.
- **The first focus ring after loading a page could stay away.** The input-modality tracker only started listening once a component asked it something, which is at the first focus — so someone tabbing straight into a freshly loaded page had already pressed Tab by then, the modality still read "mouse", and the control suppressed its ring. It now listens from the moment the module loads.
- **An app without a split view scrolled its page instead of the document.** `nldd-app-view` derived the scroll mode from the outermost horizontal split view and left it unset when there was none, so those apps fell back to nested scrolling — and on iOS that costs the rubber-band and the collapsing browser toolbar. A bare-page app is a single column at every width, so it now scrolls the document. Set `--context-scroll-mode` on the `nldd-app-view` itself if you want it otherwise.
- **A tree row inside a branch could not be reached with Shift+Tab.** The rows that are not the current one carried `tabindex="-1"`, and a shadow host with a tabindex is a focus scope of its own: Chromium walks straight past such a scope when tabbing backwards if the host itself isn't tabbable. So once you had tabbed out of the tree from a nested row, the whole list was skipped on the way back, while forward navigation still found it. Rows that are not current now carry no tabindex at all.
- **A focus ring inside a branch was cut off by its own children.** A row paints its children group right after the row, in the same stacking context, so on an open branch the bottom of the ring disappeared under the first child. The focused row now sits above its group — and with focus in a child, the child still wins.
- **The last row of a tree drew a divider against the frame.** A boxed list withholds the divider of its last row, but "last" was read from the list's own rows only, so an open branch's last child kept its line — a stray divider hard against the bottom of the box. The list now walks into open branches to find the row that really paints last, and follows along as branches open and close.
- **A branch's own divider overlapped its first child.** The line under a row hangs in a 1px margin, but on a branch that margin sat after the whole subtree: the divider under the branch fell on top of the first child, and an extra line's worth of space ended up under the last one. The margin now sits under the row itself, where the divider is.
- **A nested row no longer shows the press state of the rows above it.** A branch's child rows are light-DOM children, so their pointer events travel through every ancestor row: pressing a leaf lit up its whole ancestry for a moment. A row now ignores presses that started in a row nested inside it.
- **`nldd-menu` scrolls the highlighted item into view.** During keyboard navigation the consumer sometimes keeps focus (the combo box leaves it in the input), so the browser does not scroll along. The menu now scrolls the minimum: nothing when the item is already visible, one row when stepping past an edge, and all the way back on wrap-around.
- **`nldd-sheet` and `nldd-window` report closing through every route, and ignore closes that are not theirs.** The public `close` event came only from `hide()`, but Escape on a `modeless` overlay closes through the browser's CloseWatcher, which the `cancel` handler cannot reliably stop — a modeless sheet closed silently. In the other direction, a nested component (a date field's popover, say) dispatches its `close` with `composed` and `bubbles`, and that reached the same listener: the sheet emitted its own `close` while it stayed open, and consumers tore down content on an event that was not theirs. Both now emit from whichever route actually closed, once per open cycle, and only from their own dialog.
- **`nldd-window` and `nldd-modal-dialog` no longer close on a drag that ends on the backdrop.** Selecting text or dragging a control inside the overlay and releasing outside counted as a backdrop click. Light dismiss now requires the press and the release to both land on the backdrop, the guard `nldd-sheet` already had.
- **`nldd-sheet` and `nldd-window` take no space in the flow.** Both render a `position: fixed` dialog, so the host only added an empty box. As a block it was a flex item like any other, and inside an `nldd-split-view-pane` it collected the pane's `::slotted` flex-grow and ate the height its siblings needed. Both are `display: contents` now, matching `nldd-modal-dialog` and `nldd-tooltip`.
- **`nldd-popover` moves focus itself on Tab.** Safari does not tab into the contents of a top-layer element: with the popover focused it skipped the whole thing and landed on whatever followed in the document, leaving the popover open behind you. Tab and Shift+Tab now walk the popover's own focusables.
- **`nldd-popover` absorbs the first tap outside itself on a small screen.** There it renders as a bottom sheet with a dimmed backdrop, but a popover backdrop is paint and not a barrier, so one tap dismissed the sheet and activated whatever sat under the dimming.
- **`nldd-popover`: Tab got stuck inside a popover holding a roving-tabindex widget** (a calendar grid, a toolbar). The focus scan counted every `tabindex="-1"` element as focusable, so with a calendar inside it saw 41 day buttons.
- **`nldd-toolbar` hangs its overflow menu in its own shadow root.** On `document.body` the menu went inert (visible but untouchable) as soon as the toolbar sat inside a modal dialog, since everything outside that dialog is inert then. The menu is a popover, so it escapes clipping through the top layer anyway. Each toolbar also gets its own menu id (two toolbars on a page shared one), and a single remaining fluid child now fills the row instead of stopping at half.
- **`nldd-page-footer` aligns the legal bar to the right when there are no start items.** Without them the end area was the only flex child and `space-between` put it at the start.
- **`nldd-side-by-side-split-view` and `nldd-stacked-split-view` follow the scroll mode.** Two of the five split views never took part in the root-scroll distribution, so on a narrow screen they kept clipping at viewport height while the layers inside them had already handed their scrolling to the document. Nothing scrolled at all.
- **`nldd-just-in-time-education`** no longer shows the browser's own focus ring around the whole box, text and arrow included. The container takes focus on open so Escape and the dismiss button are reachable, and it now carries the design system's ring, with an offset, and only when the coach mark was opened from the keyboard.
- **Text selection on controls** — buttons, menu items, tabs and other controls no longer show a selection highlight when dragged over on iOS and older Safari (`-webkit-user-select` alongside the standard property).

## <small>0.8.70 (2026-07-21)</small>

* feat!: nldd-date-picker en nldd-date-field, custom elements manifest en Vue-types (#155) ([e2ce97f](https://github.com/MinBZK/storybook/commit/e2ce97f)), closes [#155](https://github.com/MinBZK/storybook/issues/155)

### Highlights

- **New `nldd-date-picker`.** A calendar for a single date or a period, usable on its own (inline in a page or a filter panel) and inside `nldd-date-field`. Follows the W3C APG date picker grid: arrow keys move day by day, Page Up/Down a month, Home/End to the week's edges, and the month heading announces itself as you page. Optional ISO week numbers, a configurable first day of the week, and an `isDateUnavailable` callback to block dates. On a narrow screen or a coarse pointer it lays itself out for fingers: it fills the available width, the month navigation moves below the grid with larger buttons, and the month heading grows a step.
- **New `nldd-date-field`.** A text field for a date, with a calendar behind a button. The button opens `nldd-date-picker` in an `nldd-popover` (a bottom sheet on small screens) instead of the browser's own, which could not be dismissed in Safari. With `range` the field shows two inputs with "t/m" between them and stores one ISO 8601 interval (`2026-07-06/2026-07-20`) under one `name`, so a form gets one field rather than two that can disagree. Put your own `nldd-date-picker` in the `picker` slot to control what only a calendar knows, while the field keeps owning the value. And `min` / `max` accept `today` and `today±Nd/w/m/y`, so a relative bound needs no date arithmetic.
- **29 new icons.** Media controls: `play`, `pause`, `play-pause`, `stop`, `forward`, `backward`, `forward-end`, `backward-end`, `forward-frame`, `backward-frame`, each with a filled variant. Plus `exclamation-2-circle` (`medium-priority`), `exclamation-3-circle` (`high-priority`), both also filled, `square-corner-4` (`fit-to-view`), `person-badge-plus` (`add-user`), `antenna-radio-waves` (`broadcast`), `megaphone` and `circle-grid-2x2-top-left-check-mark`. Aliases in brackets; reach for those first, they say what the icon is for.
- **The package describes itself.** It now ships a Custom Elements Manifest, so VS Code and JetBrains give autocomplete and hover documentation for `nldd-*` tags in plain HTML without any setup. Vue consumers get generated template types with `import '@nldd/design-system/vue'`, where a prop carries the component's own type (`size` is `'md' | 'sm'`, not `string`) instead of a hand-written declaration that falls behind on every release.

### Added

- **`nldd-date-picker`** (inputs) — new component. `value` for a single date, or `range` with `start` / `end`; `min` / `max` accept an ISO date, `today`, or `today±Nd/w/m/y`; `week-numbers` adds an ISO week column; `first-day-of-week` sets the leading column; `isDateUnavailable` (property) blocks individual dates while keeping them reachable with the keyboard; `accessible-label` names the grid; `translations` overrides the Dutch defaults. Fires `input` while a period is half-chosen and `change` once a value is complete.
- **`nldd-date-field`** (inputs) — new component. A text field that reads a typed date generously (`12-3-2026`, `12/03/2026`, `12032026`, ISO) and normalizes on blur, with `nldd-date-picker` behind a calendar button. `value` is ISO, or one ISO 8601 interval with `range`; `min` / `max` accept an ISO date, `today`, or `today±Nd/w/m/y`; `no-picker` drops the button; a `picker` slot takes your own calendar. Form-associated, so it submits under one `name`.
- **Vue template types.** `import '@nldd/design-system/vue'` declares every `nldd-*` tag for Vue's template type-checking, so a Vue consumer no longer maintains a hand-written declaration that falls behind. Generated from the manifest, so it cannot: props carry the component's own types (`size` is `'md' | 'sm'`, not `string`), attributes work both as written in markup (`week-numbers`) and in the form Vue normalizes them to (`weekNumbers`), and events are the prop Vue derives from `@change`.
- **Custom Elements Manifest.** The package now ships `custom-elements.json` and points at it with the `customElements` field, so VS Code and JetBrains give autocomplete and hover documentation for `nldd-*` tags in plain HTML, with no extra setup. It is generated from the source rather than from the documentation, so a union like `'md' | 'sm'` stays a union instead of flattening to `string`. It is also the input for generated framework type declarations.

### Breaking

- **Icons: `batch` in a name is now `badge`.** Three icons show a small badge in the bottom-right corner, sharing that sub-glyph with `person-badge-gear` and `cylinder-split-badge-lock`. None of them shows a stack, so the name was simply wrong. Rename `book-batch-play` to `book-badge-play`, `file-text-batch-check-mark` to `file-text-badge-check-mark` and `file-text-batch-check-plus` to `file-text-badge-check-plus`. The old names are gone, also as aliases: a misspelling kept alive as an alias is a misspelling you keep reading in code review. The `new-text-document` alias follows the rename and needs no change.

### Changed

- **Icon: `lightbulb` redrawn.** The glyph was revised; the name is unchanged, so consumers pick up the new drawing without any code change.

### Fixed

- **`nldd-sheet` and `nldd-window` report closing through every route.** The public `close` event came only from `hide()`, but Escape on a `modeless` overlay closes through the browser's CloseWatcher, which the `cancel` handler cannot reliably stop. A modeless sheet therefore closed silently. Both now emit from whichever route actually closed, once per open cycle.
- **`nldd-popover` moves focus itself on Tab.** Safari does not tab into the contents of a top-layer element: with the popover focused it skipped the whole thing and landed on whatever followed in the document, leaving the popover open behind you. Tab and Shift+Tab now walk the popover's own focusables, and only leave (closing it) past the last one.
- **`nldd-popover` absorbs the first tap outside itself on a small screen.** There it renders as a bottom sheet with a dimmed backdrop, but a popover backdrop is paint and not a barrier, so one tap dismissed the sheet and activated whatever sat under the dimming. Tapping the anchor still closes it as before.
- **`nldd-side-by-side-split-view` and `nldd-stacked-split-view` follow the scroll mode.** Two of the five split views never took part in the root-scroll distribution, so on a narrow screen they kept clipping at viewport height while the layers inside them had already handed their scrolling to the document. Nothing scrolled at all. The side-by-side view is the one that decides the mode for everyone, since it fires `single-column-change`, but it never applied the result to itself.
- **`nldd-sheet` and `nldd-window` no longer take space in the flow.** Both render a `position: fixed` dialog, so the host only added an empty box. As a block it was a flex item like any other, and inside an `nldd-split-view-pane` it collected the pane's `::slotted` flex-grow and ate the height its siblings needed. Both are `display: contents` now, matching `nldd-modal-dialog` and `nldd-tooltip`. Every overlay in the system now measures zero in a flex column.
- **`nldd-just-in-time-education`** — the callout no longer shows the browser's own focus ring around the whole box, text and arrow included. The container takes focus on open so Escape and the dismiss button are reachable, and it now carries the design system's ring instead, with an offset, and only when the coach-mark was opened from the keyboard.
- **`nldd-popover`** — Tab no longer gets stuck inside a popover that contains a roving-tabindex widget (a calendar grid, a toolbar). The focus scan counted every `tabindex="-1"` element as focusable, so with a calendar inside it saw 41 "focusable" day buttons and never let focus move on.
- **Text selection on controls** — buttons, menu items, tabs and other controls no longer show a text selection highlight when dragged over on iOS and older Safari (`-webkit-user-select` alongside the standard property).

## <small>0.8.69 (2026-07-16)</small>

* feat: nldd-avatar, content-color token cleanup (breaking), and component fixes (#139) ([482a04f](https://github.com/MinBZK/storybook/commit/482a04f)), closes [#139](https://github.com/MinBZK/storybook/issues/139)
* ci(release): stop releasing on ci/chore/test, keep releasing what ships (#142) ([25b7645](https://github.com/MinBZK/storybook/commit/25b7645)), closes [#142](https://github.com/MinBZK/storybook/issues/142)
* ci(review): always post the review as a sticky PR comment (#143) ([d5aa290](https://github.com/MinBZK/storybook/commit/d5aa290)), closes [#143](https://github.com/MinBZK/storybook/issues/143)
* ci(review): enable track_progress so the review comment can actually be posted (#144) ([38b8483](https://github.com/MinBZK/storybook/commit/38b8483)), closes [#144](https://github.com/MinBZK/storybook/issues/144)

### Highlights

- **New `nldd-avatar`.** A person or organization avatar: an image, auto-fitting initials (derived from `name` or given explicitly), or a type icon (`person` = circle with a person icon, `organization` = rounded with a building icon). Sizes on the `nldd-icon` scale and fills its container by default. `color="inherit"` fills with the surrounding content color, and `icon-aligned` shrinks the disc to an icon's optical size so it lines up when it replaces an icon.
- **New icon.** `file-text-batch-check-plus` (`new-text-document`).
- **`nldd-activity-indicator` follows its context's content color.** The default spinner now tracks the shared `--context-content-color` channel (so a loader inside a selected list row matches the row's text), falling back to `currentColor` everywhere else.
- **`nldd-button`, `nldd-icon-button` and `nldd-split-button` open a slotted overlay.** Drop an `nldd-menu` or `nldd-popover` in the `popup` slot and the button anchors and toggles it automatically, with no `id`/`anchor` wiring.
- **`nldd-rich-text` opt-in hyphenation.** The `hyphens` attribute enables automatic word breaking for running text (p, li, dd), tuned for long Dutch compounds in narrow columns.
- **`nldd-text-editor` badges and colors bare URLs.** A plainly pasted URL (GFM autolink) now gets the same open-in-new-tab badge and link color as a Markdown link, including `www.` (→ https) and email (→ mailto).
- **`nldd-menu` header and footer slots.** Root-only `header` / `footer` slots hold free content (an account identity header, a short note, a link) outside `role="menu"` — reached with Tab, skipped by arrow navigation. `role="menu"` now lives statically on the item list.
- **Content-color token names standardised** (breaking). The buttons and categories content tokens now follow the global `content-color` / `content-secondary-color` word order, and the cross-component `--context-cell-content-*` channel is renamed to `--context-content-*`.

### Added

- **Icon** — `file-text-batch-check-plus`, with the `new-text-document` alias.
- **`nldd-rich-text`** — `hyphens` attribute for opt-in automatic hyphenation on running text (requires a correct `lang`); plus an always-on `overflow-wrap: break-word` safety net on paragraphs and list items.
- **`nldd-button` / `nldd-icon-button`** — a `popup` slot that auto-wires a nested `nldd-menu` or `nldd-popover` (anchors it, toggles on click, syncs `expanded` / `aria-haspopup`), mirroring `nldd-split-button`, which now also accepts a slotted `nldd-popover`.
- **`nldd-text-editor`** — a bare / autolinked URL (plain https, `www.`, or an email) now gets the open-in-new-tab badge and the link color, matching Markdown links; scheme-less forms are normalized (`www.` → https, email → mailto). The Markdown link's own address stays the dimmed gray.
- **`nldd-menu`** — root-only `header` / `footer` slots for free content above/below the items, outside `role="menu"` (so they may hold non-menuitem content such as an `nldd-byline`, buttons or links; reached with Tab, skipped by arrow navigation). The regions are unpadded (control spacing with your own content, e.g. `nldd-container`); `role="menu"` is now static on the item list, with the empty-state and drill-in back button as siblings outside it.
- **`nldd-inline-dialog`** — a `variant="loading"` that shows an `nldd-activity-indicator` (a `role="status"` spinner announcing "Laden") in place of the icon, for an empty state that is still loading. Sized to the icon (md/lg), shown instantly, and it overrides an explicit `icon`.
- **`nldd-avatar`** (content) — new component for a person or organization. Fallback chain image → initials → type icon; `type` (`person` / `organization`) drives shape and fallback icon; `size` on the `nldd-icon` scale (empty = fill the container, with initials and icon scaling to the box via container queries); `color` (`default` / `inherit`, where inherit fills with the `--context-content-color` channel or `currentColor` and uses the contrast color for the text); `icon-aligned` shrinks the disc to 5/6 for optical alignment with an icon; wide initials always scale to fit; a dead `src` falls back automatically; `role="img"` with the name as label, or `decorative`.
- **`nldd-page-footer`** — a `width` attribute mirroring a page section: `full` removes the body max-width, or a CSS length overrides it.

### Changed

- **`nldd-activity-indicator`** — the default circle and arc now color from `var(--context-content-color, currentColor)` instead of `currentColor` alone. Behavior is unchanged wherever the channel is unset.
- **`nldd-popover`** — now syncs its open state to a control trigger via the trigger's `expanded` / `popup-type` IDL props (so the trigger's inner button ARIA and disclosure chevron reflect the popover), falling back to `aria-*` attributes for plain element anchors. It also bails on its own anchor-click toggle when driven via `anchorElement`, so it can be nested and driven from a button.
- **`nldd-byline`** — renders its avatars with `nldd-avatar` (both the `avatar-src` path and slotted `nldd-avatar`), so a byline without an image shows initials; a slotted `<img>` still works.
- **`--semantics-buttons-neutral-tinted-divider-color`** — slightly lighter in dark mode (`neutral-450` → `neutral-350`).

### Breaking

- **Semantics content-color tokens renamed** (no aliases): `--semantics-buttons-*-primary-content-color` and the `categories` equivalents become `--semantics-*-content-color` (drop `primary`); `--semantics-*-secondary-content-color` become `--semantics-*-content-secondary-color` (qualifier after `content`). Update any consumer CSS that references them.
- **`--context-cell-content-*` renamed to `--context-content-*`** (whole family: `color`, `secondary-color`, `accent-color`, `success-color`, `warning-color`, `critical-color`). Update any consumer CSS that sets or reads these context custom properties.
- **`nldd-button` / `nldd-icon-button` overlay slot renamed `menu` → `popup`** — the slot now accepts an `nldd-menu` or an `nldd-popover`. Change `<nldd-menu slot="menu">` to `slot="popup"`. (`nldd-token` / `nldd-token-field` keep their own menu-only `slot="menu"`.)

### Fixed

- **`nldd-toolbar`** — an `align="center"` title now stays centered when it is the only visible element, including when a `slot="start"` / `slot="end"` item is `display:none` (e.g. a back button hidden on wide viewports). It previously jumped to the left. Center-only routing is measured from real rendering, so a hidden item no longer strands the title.
- **`nldd-toolbar`** — an `align="center"` title also stays centered when only one side (start or end) has items; it previously shifted by one gap toward the empty side, because the balancing spacer subtracted a gap that only exists when that side is non-empty.
- **`nldd-menu`** — a group that is the first item no longer draws a stray top divider when a `header` slot is present (the header's light-DOM element made the group lose `:first-child`).
- **`nldd-sheet`** — a drag that begins inside the sheet (selecting text in an input, dragging a control) and ends on the backdrop no longer dismisses it; only a genuine backdrop click, where the press and the release are both on the backdrop, closes.
- **`nldd-page-footer`** — when the footer is empty and only the Rijksoverheid lintje shows, it now keeps space above the lintje so a preceding tinted page section no longer butts right up against it.
## <small>0.8.68 (2026-07-16)</small>

* ci(review): let the review post inline comments and see the full diff (#141) ([819f241](https://github.com/MinBZK/storybook/commit/819f241)), closes [#141](https://github.com/MinBZK/storybook/issues/141)

## <small>0.8.67 (2026-07-15)</small>

* ci(review): fetch full history so the review can compute the PR diff (#140) ([a076e03](https://github.com/MinBZK/storybook/commit/a076e03)), closes [#140](https://github.com/MinBZK/storybook/issues/140)

## <small>0.8.66 (2026-07-13)</small>

* Text-editor improvements, icon set, toolbar & token-field commit-on-blur (#138) ([ca77ddb](https://github.com/MinBZK/storybook/commit/ca77ddb)), closes [#138](https://github.com/MinBZK/storybook/issues/138)

### Highlights

- **`nldd-text-editor` Markdown refinements.** Indent and outdent are symmetric (one outdent exactly reverses one indent), and ordered lists inside a blockquote are renumbered in sequence like any list.
- **`nldd-token-field` keeps undelimited input.** A value typed without pressing `Enter` or comma is no longer dropped — it commits as a token on blur (with `allow-custom`).
- **`nldd-app-view` document scroll mode.** The layout can hand page scrolling to the document (root) instead of an inner pane (nested), so iOS rubber-band and the collapsing Safari toolbar behave natively.
- **New icons.** `heading-1`…`heading-6`, `paragraph-sign`, `lifebuoy`, `network-structure`, `stack-text`, `wheat` (`harvest`) and `person-circle-badge-plus` (`new-account`).

### Added

- **Icons** — `heading-1`…`heading-6`, `paragraph-sign`, `lifebuoy`, `network-structure`, `stack-text`, `wheat` and `person-circle-badge-plus`, with `harvest` and `new-account` aliases.

### Changed

- **`nldd-token-field`** — free-typed text now commits as a token on blur (with `allow-custom`), so a value typed without pressing `Enter` or comma is no longer dropped when focus leaves the field.
- **`nldd-toolbar`** — the title can size to `fit-content` with an action slot beside it.
- **`nldd-app-view`** — derives a document-level scroll mode (root vs nested) so the document can own iOS rubber-band and Safari-toolbar scrolling instead of an inner pane.
- **Icons renamed** (old names kept as aliases, so nothing breaks): `centralized-network` → `centralized-structure`, `table-cells` → `rectangle-split-2x3`.

### Breaking

- **`clipboard-rectangle` icon renamed to `clipboard-square`** — the `paste` icon is reshaped from a rectangle to a square, and the old name is *not* kept as an alias, so `icon="clipboard-rectangle"` no longer resolves. Switch to `clipboard-square`; the `paste` alias already points to it.

### Fixed

- **`nldd-text-editor`** — indent and outdent are symmetric (one outdent exactly reverses one indent), and ordered lists inside a blockquote are renumbered in sequence like any list (so a quoted `> 4.` isn't left as a misleading stray number that renders as 1).

## <small>0.8.65 (2026-07-08)</small>

* feat: CodeMirror text/code editors + viewer, token-field, FOUC guard, flatter surfaces & fixes (#136 ([e490366](https://github.com/MinBZK/storybook/commit/e490366)), closes [#136](https://github.com/MinBZK/storybook/issues/136)

### Highlights

- **`nldd-text-editor` — a hybrid Markdown editor.** A CodeMirror 6 editor that shows Markdown source with live styling instead of a separate preview: headings, bold, italic, strikethrough, inline code and fenced code blocks (tinted as one surface, darker where selected), links (with an open-in-new-tab badge), bullet lists (drawn as a filled dot) and ordered lists (auto-renumbered to run in sequence as you type). It stays headless: a command API drives every action and it emits its active state back so a consumer toolbar can own the chrome. `@`-mentions collapse to a token, and opt-in annotations render a tinted range with a count badge that stays anchored across typing, undo/redo, drag-to-move and same-editor cut/paste.
- **`nldd-token-field` — a multi-select input.** Chosen values become dismissible tokens in a wrapping row; options come from a slotted `nldd-menu` that filters as you type, with a chevron picker and full keyboard support (arrow-key roving across tokens, `Backspace` to step onto and remove one, comma or `Enter` to add free-typed values with `allow-custom`). It participates in forms through `ElementInternals` (one submitted entry per value), supports `readonly` / `required`, and seeds its initial values from a comma-separated `values` attribute.
- **New icons.** Seventeen icons — `at`, `highlighter`, `strikethrough`, `indent-increase` / `indent-decrease`, `markdown-rectangle`, `rectangle-chevron-left-forward-slash-chevron-right`, `house-and-appartment-building`, `parking-sign-square`, `arrow-up-out-bucket`, `rectangle`, `rectangle-split-2x1` / `rectangle-split-3x1`, `square-grid-3x3`, `tree-structure` and `sidebar-left` / `sidebar-right` — with `indent` / `outdent`, `code-block`, `markdown`, `parking`, `upload`, `columns-2` / `columns-3`, `apps` and `hierarchy` aliases.
- **`nldd-code-editor` and `nldd-code-viewer` on CodeMirror 6.** Both are rebuilt on the same CodeMirror 6 foundation as the new text editor, for consistent syntax highlighting across many grammars (yaml, json, javascript, typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql, python). The code editor gains `simple` (bare, caret-only) and `input-field` variants, `rows` / `resize` sizing, line numbers and line wrapping; the read-only code viewer keeps its copy button and gains `simple` / `box` variants and a `tinted` / `base` background.
- **Built-in FOUC guard.** `@nldd/design-system/styles` now keeps the page hidden until every custom element has upgraded (or a 200ms fallback), so pre-upgrade web components no longer flash unstyled.
- **No more position flash on popovers.** `nldd-menu`, `nldd-popover`, `nldd-tooltip` and `nldd-just-in-time-education` no longer flash at the popover's default spot before Floating UI places them; each stays hidden until it is positioned.
- **Flatter, rectangular surfaces.** Corner radii are removed from `nldd-hero` (every element is now rectangular) and from `nldd-blockquote` (and blockquotes inside `nldd-rich-text`), which also drops its top border and top padding so a quote sits flush against a plain left rule.

### Breaking

- **`accessible-labelledby` renamed to `accessible-labelled-by`** — the design-system attribute on `nldd-segmented-control`, `nldd-radio-button-group` and `nldd-toggle-button-group` now separates the words. The property stays `accessibleLabelledBy` and the forwarded native `aria-labelledby` is unchanged; only the DS attribute name changes. Consumers using `accessible-labelledby` must switch to `accessible-labelled-by`.
- **Default values are kept out of the DOM** — reflected enum and empty-string defaults are no longer written as attributes (e.g. a `nldd-button` with the default size no longer renders `size="md"`, and an empty `supporting-text` is omitted). Non-default values still reflect, so `:host([attr=…])` styling, framework property binding and inspector editing keep working. External CSS or scripts that matched a *default* attribute (e.g. `nldd-button[size="md"]` or `getAttribute('size') === 'md'`) should read the property instead. `type` and `inherit`-style props are intentionally left reflected for now.
- **`nldd-combo-box` no longer commits free-typed values by default** — a typed value that matches no menu option is now discarded on Enter/blur (the input reverts to the current value) unless the new `allow-custom` attribute is set. Previously such values were always emitted via `change`.
- **`nldd-hero` corners removed** — `nldd-hero` is now always rectangular and the `media-corner-position` attribute (added in 0.8.64) is gone. A no-media `main-background="base"` hero takes a full border instead of only the two corner-adjacent sides.

### Added

- **Button inline-padding tokens** — `--semantics-buttons-{size}-inline-padding`, `--semantics-buttons-{size}-has-supporting-text-inline-padding` and `--semantics-buttons-{size}-is-icon-only-inline-padding` encode the icon-centering padding `(min-size − icon-size) / 2` once in the semantic layer. `nldd-button`, `nldd-icon-button`, `nldd-toggle-button`, `nldd-segmented-control` and `nldd-tab-bar` items all reference them, with `--_block-padding` / `--_inline-padding` locals.
- **`nldd-text-editor`** — a headless, hybrid Markdown editor (CodeMirror 6). Live source styling for headings, `**bold**`, `*italic*`, `~~strikethrough~~`, inline code, fenced code blocks (one tinted surface), links (plus an open-in-new-tab badge), bullet lists (a styleable filled dot) and ordered lists (renumbered to stay 1, 2, 3). `simple` and `input-field` variants, `sans` / `mono` fonts, `rows` / `resize` / `wrap`, and a form value that is always clean Markdown. A command API (`toggleBold`, `setList`, `setHeading`, `indent` / `outdent`, `toggleLink`, `toggleCodeBlock`, `undo` / `redo`, `copy` / `cut` / `paste`, `runCommand`) plus a `nldd-text-editor-state` event let a consumer toolbar own the chrome; selected text can be dragged to move it (shadow-DOM-safe). `@`-mentions collapse to a token from a consumer `mentionSource` and fire `nldd-text-editor-mention`. Opt-in annotations (`annotatable` + `annotations`) render a tinted range with a count badge, anchored by clean offset and preserved across edits, undo/redo, drag and same-editor cut/paste.
- **FOUC guard in `@nldd/design-system/styles`** — the page stays hidden until every custom element upgrades (`:defined`) or a 200ms fallback, whichever comes first; pure CSS, no JS. Also available standalone at `@nldd/design-system/styles/fouc`.
- **Icons** — `at`, `highlighter`, `strikethrough`, `indent-increase`, `indent-decrease`, `markdown-rectangle`, `rectangle-chevron-left-forward-slash-chevron-right`, `house-and-appartment-building`, `parking-sign-square`, `arrow-up-out-bucket`, `rectangle`, `rectangle-split-2x1`, `rectangle-split-3x1`, `square-grid-3x3`, `tree-structure`, `sidebar-left` and `sidebar-right`, with `indent` / `outdent`, `code-block`, `markdown`, `parking`, `upload`, `columns-2` / `columns-3`, `apps` and `hierarchy` aliases.
- **`nldd-token-field`** — a multi-select input: chosen values render as dismissible `nldd-token`s, options come from a slotted `nldd-menu` (filtered as you type) with a chevron picker button. Keyboard navigation with a single roving tab stop over the tokens (arrow keys move between them; removing a token — via `Backspace` / `Delete`, its ✕, or a menu action — keeps focus in the row, on the next token or the input); when the input is hidden (every value chosen, no custom values, no options left) the token row is the field's only tab stop, so tabbing in lands on the first token and choosing the final value moves focus onto that last token. With `token-control="menu"` each token trades its ✕ for a ⌄ that opens a per-token action menu, supplied as `nldd-token` prototypes in `slot="template"` — a keyless one is the shared menu, a `data-value="X"` one overrides value X — cloned into each token and opened with Enter / Space / ArrowDown when the token is focused; a choice fires `token-action` (`{ value, action }`) for the app to handle. Comma / `Enter` custom values via `allow-custom`, `type` / `autocomplete` / `no-spellcheck`, `readonly` / `required`, `ElementInternals` form participation (one submitted entry per value) and a comma-separated `values` attribute for declarative use.
- **`nldd-combo-box` `allow-custom`** — opt in to committing free-typed values that match no menu option (see Breaking). On open the first option is now highlighted so `Enter` selects it.
- **`nldd-collection` `gap`** — a `gap` attribute sets a fixed inter-item gap, overriding the responsive default.
- **`nldd-icon-button` `no-tab`** — takes the button out of the tab order (`tabindex="-1"`) for a control owned by a roving container (e.g. an `nldd-token` in `nldd-token-field`); it stays mouse- and script-focusable.
- **`nldd-tab-bar` `disabled`** — disables the whole bar: it dims, stops responding to pointer input, and drops every tab out of the tab order with `aria-disabled` set, so keyboard activation and link navigation are suppressed too.

### Changed

- **`nldd-code-editor`** — rebuilt on CodeMirror 6, sharing a foundation and highlight style with the code viewer and text editor. A `simple` (bare, flush, caret-only) and an `input-field` (framed surface) variant, `rows` / `resize` / `wrap` sizing, `line-numbers`, and highlight grammars for yaml, json, javascript, typescript, css, html, xml, bash, markdown, rust, gherkin, toml, sql and python. Clicking the padding or a line number now places the caret, and the accent caret is used in both variants.
- **`nldd-code-viewer`** — rebuilt on a read-only CodeMirror 6 view, so its highlighting matches the editors. `simple` / `box` variants, a `tinted` / `base` box background, `language`, `wrap`, and the copy-to-clipboard button (hide it with `no-copy`).
- **Consistent item padding** — `nldd-button`, `nldd-icon-button`, `nldd-toggle-button`, `nldd-segmented-control` and `nldd-tab-bar` items now share one block/inline padding mechanism driven by the new tokens. `nldd-toggle-button` (xs/sm) and `nldd-segmented-control` (sm) gain slightly tighter inline padding to match the button family, resolving a prior inconsistency.
- **`nldd-multi-line-text-field` default `resize`** — the default changed from `resize="vertical"` to `resize="auto"`: the field now auto-grows with its content (no drag handle) by default. Consumers who relied on the implicit vertical drag handle must set `resize="vertical"` explicitly.
- **`nldd-token`** — reworked and moved to the content category. Its label now comes from a `text` attribute (the default slot stays as a fallback). `control="menu"` renders a trailing chevron button (matching the dismiss ✕) that opens a slotted `nldd-menu` as a popover the token owns — open/close, `expanded` state, focus, and Enter / Space / ArrowDown to open it when the token itself is focused in a roving container such as `nldd-token-field`; the menu items own their `select`. This replaces the old whole-token menu button and its consumer-managed `toggle` / `controls` wiring. The whole-token focus ring is forced on a scripted focus so roving containers highlight it (incl. Safari), a `dismiss`/`menu` control button now shows its own border, a `menu-text` label was added, and a `roving` attribute takes the control button out of the tab order so a container like `nldd-token-field` stays a single tab stop.

### Fixed

- **Popover positioning** — `nldd-menu`, `nldd-popover`, `nldd-tooltip` and `nldd-just-in-time-education` no longer flash at the popover's default position for a frame before Floating UI places them.
- **`nldd-multi-line-text-field`** — the configured `rows` is now the minimum height in every resize mode, not only `resize="auto"`; a fixed or non-resizable field no longer collapses below its `rows`.
- **`nldd-banner` renders under frameworks that build elements via `document.createElement`** — aria attributes are now set in `connectedCallback` instead of the constructor, which previously threw `NotSupportedError` (e.g. under Vue) and aborted the render, so banners never appeared.
- **`nldd-text-editor` annotation undo** — annotation offsets are clamped to the document length, preventing a range error during undo when the history transiently shrinks the document.
- **`nldd-menu` empty state** — a menu whose items are all disabled no longer shows the "no options" empty state on top of the still-visible items; emptiness counts shown items, not just navigable ones.
- **`nldd-sheet` and `nldd-window` close** — only the overlay's own `nldd-top-title-bar` dismiss closes it; a `dismiss` bubbling up from another component inside it (an `nldd-token` remove button, an `nldd-banner`, an `nldd-document-tab-bar`) no longer closes the whole overlay.
- **`nldd-toolbar` overflow menu** — items that collapse into the overflow `⋯` menu now forward their activation to the original item (so a click in the overflow menu fires the item's `select`) and keep their state in sync with the originals, instead of the overflow clones going stale.
- **`nldd-sheet` content sizing** — only a slotted `nldd-page` grows to fill the sheet, so other direct children keep their intrinsic height instead of being stretched.

## <small>0.8.64 (2026-07-01)</small>

* feat: filterable listbox, sidebar-section, hero media, container lanes + box-sizing hardening (#135) ([bf48d70](https://github.com/MinBZK/storybook/commit/bf48d70)), closes [#135](https://github.com/MinBZK/storybook/issues/135)

### Highlights

- **A filterable listbox for `nldd-list`.** New `type="listbox"` turns a list into a combobox-pattern listbox: it renders its own search input, `.list__items` becomes a `role="listbox"` of `role="option"` items, and the active option moves via `aria-activedescendant` while focus stays in the input (the highlight is gated on input focus). Filtering stays consumer-managed; `toolbar` and `search-bar-end` slots and an `accessible-label` round it out.
- **`nldd-sidebar-section` page section.** A sidebar beside the main content: a sticky, scrollable tinted box (max 320px) when the section is wide, collapsing into a left sheet (a bottom sheet on mobile) with a built-in title bar when it gets narrow. The switch follows the section's own width (a ResizeObserver), not the viewport, so it adapts to the space it sits in; `no-collapse` opts out and stacks the sidebar above the main instead. Ideal for list and overview pages with a filter sidebar, or long articles with a table of contents.
- **Configurable `nldd-hero` media.** A `media-aspect-ratio` (default 21/9) plus `media-src` / `media-srcset` / `media-sizes` / `media-alt` render the hero image internally, so a simple hero needs no slotted `<img>`; slotted media still wins when present. (The old `media-corner` attribute is renamed to `media-corner-position` — see Breaking.)
- **Definition lists in `nldd-rich-text`.** Responsive `dl` / `dt` / `dd` term-definition layout, so glossaries and key/value content render as aligned term/definition pairs that adapt to the available width.
- **`nldd-card` as a link.** `href` / `target` / `rel` turn the whole card into a clickable link via an overlay anchor; `target="_blank"` auto-resolves `rel` and announces a new-tab hint, and `accessible-label` names the link without a double announcement.

### Added

- **`nldd-list` listbox** — `type="listbox"`: a filterable combobox-pattern listbox with a built-in search field, `role="listbox"`/`role="option"` items, an active option that moves via `aria-activedescendant` (focus stays in the input), plus `toolbar` and `search-bar-end` slots and an `accessible-label`.
- **`nldd-hero` media** — `media-aspect-ratio` (default 21/9) plus `media-src` / `media-srcset` / `media-sizes` / `media-alt` render an internal `<img>`; slotted media still wins when present. (See Breaking for the `media-corner` rename.)
- **`nldd-rich-text` definition lists** — responsive `dl` / `dt` / `dd` term-definition layout.
- **`nldd-card` links** — `href` / `target` / `rel` make the whole card a clickable link via an overlay anchor; `target="_blank"` auto-resolves `rel` and announces a new-tab hint, and `accessible-label` names the link.
- **`nldd-container`** — fills the full width of a flex parent (`width: 100%` + `box-sizing: border-box`).
- **`nldd-container` lanes** — `layout="lanes"`: native CSS grid-lanes where supported, CSS multicol fallback otherwise (CSS-only, no JS). Honours `gap` on both axes and `column-count`.
- **`nldd-sidebar-section`** — a page section with a left sidebar: a sticky, scrollable tinted box (max 320px) beside the main when wide, collapsing into a left sheet (bottom on mobile) with a default title bar (the `sidebar-label` as title plus a close button, overridable via the `sheet-top-title-bar` slot) when narrow. The collapse is container-driven (the section's own width via a ResizeObserver), and `no-collapse` stacks the sidebar above the main instead. It reflects a read-only `collapsed` attribute, fires `collapse-change`, and exposes `show()` / `hide()` / `toggle()` for the sheet (the consumer owns the trigger, revealed via `[collapsed]`). Tunable via `width`, `sticky-top` / `sticky-bottom` (default 16px) and `sidebar-label`.
- **`nldd-top-navigation-bar`** — a `width` attribute caps the bar content to a max-width so it lines up with page-section content; `full` spans the full width, or a CSS length overrides the default.

### Changed

- **Link colors** (default/hover/active, light + dark) now use the `accent` palette instead of `lintblauw`.
- **`nldd-search-field`** — clicking the leading icon or the field's gutter now focuses the input (native `<label>`, no JS); an empty field no longer reserves a dead click zone on the right.
- **`nldd-navigation-split-view`** — `sidebar` is renamed to `primary-sidebar`; the old slot, attributes and sheet methods keep working as deprecated aliases.
- **`nldd-icon`** — the `privacy` alias now points at `shield-lock` (was `hand`).
- **`nldd-button`** — the space between the icons and the label is now a flex gap on the button content instead of padding on the text, so text-only buttons share the same inline edge padding as icon buttons (text buttons end up marginally tighter; the icon-to-label spacing is unchanged).
- **`nldd-collection`** — the `list` layout is renamed to `stack` to match `nldd-container`.

### Fixed

- **`nldd-list`** — switching `variant` at runtime (box to simple) no longer leaves items wrongly boxed; the list now drives `variant`/`type` onto its items instead of relying on a per-item observer.
- **`nldd-just-in-time-education`** — the callout is positioned absolutely so it scrolls natively with the page, fixing the Safari bounce.
- **`nldd-rich-text`** — table columns size to their content: the `th` min-width is unset on containers ≥ 641px (the data cells already did this), and inline code inside cells may wrap so long tokens (e.g. `type_spec.precision`) no longer force a column wide.
- **`nldd-rich-text` / `nldd-container`** — the rich-text host (and container slotted items) now use `box-sizing: border-box`, so padding or a border no longer makes the element overflow its slot or grid/column track.
- **All component hosts** now pin `box-sizing: border-box`, so a consumer's global box-sizing reset (e.g. Tailwind Preflight) can no longer change a component host's box model.

### Breaking

- **`nldd-window`** — no longer draggable: drag-to-move added more complexity than a window inside a browser tab warrants. The `movable` attribute and the `window-drag-handle` hook are removed; the window stays positionable via `top`/`left`/`right`/`bottom`/`centered`. For genuine window management, open content in a new browser tab instead.
- **`nldd-breadcrumbs`** — no auto-collapse: the `no-collapse` attribute and the ellipsis expand button are removed. The trail always renders in full and wraps onto multiple lines.
- **`nldd-hero`** — the `media-corner` attribute is renamed to `media-corner-position` (freeing the `media-corner` namespace for the new media attributes).

## <small>0.8.63 (2026-06-18)</small>

* feat: just-in-time-education, list arrow-key navigation, activity-indicator overlay, plus consumer-r ([1e6bf86](https://github.com/MinBZK/storybook/commit/1e6bf86)), closes [#130](https://github.com/MinBZK/storybook/issues/130)

### Highlights

- **`nldd-just-in-time-education` coach-mark.** A new component for in-context guidance: anchored to a control with a curved dashed arrow, a dimming overlay, and three dismiss routes. Near a viewport edge it degrades gracefully — the arrow shortens first, then the card narrows (down to a usable floor), and the arrow drops once it would fall below its minimum.
- **`nldd-activity-indicator` overlay mode.** Put content in the default slot and the indicator overlays it on a small rounded panel over a frosted backdrop, making the content `inert` while loading; fades in and out via the loading state. (See Breaking.)
- **`nldd-status-bar` now mounts under Vue, React and other `createElement`-based frameworks** (reported by a consuming team). The ARIA setup moved from the constructor to `connectedCallback`: a custom-element constructor may not add attributes, so `document.createElement` previously threw `NotSupportedError` and the bar never upgraded (no shadow root, no role, height 0).
- **`nldd-inline-dialog`** no longer trips Lit's change-in-update warning on the initial slot sync (reported by a consuming team).
- **List arrow-key navigation.** Opt-in `arrow-navigation` on `nldd-list`: ArrowUp/Down move focus between the interactive items (wrapping), Home/End jump to first/last, and the list becomes a single tab stop so Tab moves past the rest. Focus only (selection stays consumer-managed). For simple lists where each item has one action; mutually exclusive with `reorderable`.

### Added

- **"Opens in new tab" announcement** on `nldd-button`, `nldd-icon-button` and `nldd-link` for `target="_blank"` links, mirroring `nldd-list-item` (WCAG 2.1 SC 3.2.2). Wording overridable via `translations`.
- **`nldd-byline` single avatar** via `avatar-src` / `avatar-srcset` attributes — no slot needed for one avatar.

### Fixed

- **`nldd-tab-bar` stays within its container** and truncates overflowing item text with an ellipsis (column-grid layout); short tabs keep their own width and icon-only items keep their fixed size. It also no longer self-selects in navigation mode.
- **`nldd-list-item` press feedback no longer flashes while scrolling on touch** — it is cleared when the touch turns into a scroll (`pointercancel`).
- **`nldd-collection`** shows its scroll controls and edge fade only when the content actually overflows.
- **`nldd-page-footer`** with no content shows only the accent line, without the gray surface.
- `width: 100%` fixes on `nldd-form-field`, `nldd-form-actions` and `nldd-document-tab-bar`.

### Breaking

- **`nldd-activity-indicator`:** a custom indicator override moved from the default slot to the new `indicator` slot, since the default slot now holds the wrapped content — `<nldd-progress-bar slot="indicator">`.
- **`nldd-list-item` translation key** `components.list-item.opens-in-new-tab-label` was renamed to `components.list-item.opens-in-new-tab-text`; update any `translations` override.

## <small>0.8.62 (2026-06-16)</small>

* fix(list): fill the width under justify-self: start parents (rich-text) (#129) ([fd11dc3](https://github.com/MinBZK/storybook/commit/fd11dc3)), closes [#129](https://github.com/MinBZK/storybook/issues/129)
* ci(release): generate the plugin version after the npm version bump (#128) ([75bc4dd](https://github.com/MinBZK/storybook/commit/75bc4dd)), closes [#128](https://github.com/MinBZK/storybook/issues/128)

## <small>0.8.61 (2026-06-16)</small>

* feat!: edge & document icons, list-item links, automatic bar-split-view dividers, and dark-mode fixe ([32e05fa](https://github.com/MinBZK/storybook/commit/32e05fa)), closes [#127](https://github.com/MinBZK/storybook/issues/127)

### Highlights

- **Edge-navigation and document icons.** New `arrow-left-to-line` / `arrow-right-to-line` and `chevron-left-to-line` / `chevron-right-to-line` glyphs for "move to edge" affordances, a `file-text-stack` document icon, and an `open-new-page` alias.
- **Automatic `nldd-bar-split-view` dividers (breaking).** Dividers now appear only where the main pane meets an adjacent bar, on every breakpoint; the consumer-managed `no-divider` attribute is removed.
- **List rows can open in a new tab.** `nldd-list-item` forwards `target` and `rel` to its anchor.
- **Dark-mode and layout polish.** Neutral tags and banners no longer blend into a tinted surface in dark mode, alongside `nldd-button` full-width / disclosure-gap and `nldd-toolbar` item-sizing fixes.

### Added

- **Icons** — `arrow-left-to-line` / `arrow-right-to-line` and `chevron-left-to-line` / `chevron-right-to-line` ("move to edge" affordances), `file-text-stack` (with `documents` aliases), and an `open-new-page` alias for `square-arrow-right-top`.
- **`nldd-list-item`** — forwards `target` and `rel` to the underlying `<a>`, so a link row can open in a new tab (`target="_blank" rel="noopener noreferrer"`). With `target="_blank"` it also injects a visually hidden "opens in new tab" announcement for assistive technology (WCAG 2.1 SC 3.2.2), overridable via the `translations` property.

### Breaking

- **`nldd-bar-split-view`** — dividers are now placed automatically wherever the main pane meets an adjacent bar (directly above and/or below it), at every breakpoint including `sm`, and never between two stacked bars on the same side. The consumer-managed `no-divider` attribute is **removed and ignored** — drop any usage. Bars on `sm` now show a divider where they meet main (previously `sm` had none).

### Fixed

- **`nldd-toolbar`** — toolbar item sizing (`width` / `min-width` / `max-width`) is now read as a DOM property as well as an attribute, so framework-set values (e.g. a Vue `width` binding) are no longer missed; real values reflect back to attributes while defaults stay unset.
- **`nldd-button`** — `full-width` no longer stretches the button vertically inside a column flex parent, and the disclosure icon (when `expandable`) no longer doubles the trailing gap.
- **`nldd-tag` / `nldd-banner`** — the neutral tinted background no longer collapses onto the tinted surface in dark mode (both resolved to the same gray, hiding the chip); it now sits a step lighter, with its border preserved.

## <small>0.8.60 (2026-06-16)</small>

* fix(plugin): laat plugin-versie de pakketversie volgen (#126) ([d90d9fd](https://github.com/MinBZK/storybook/commit/d90d9fd)), closes [#126](https://github.com/MinBZK/storybook/issues/126)
* refactor(skills): vouw ontwerprichtlijnen in de nldd-consumer-skill (#125) ([a53eaef](https://github.com/MinBZK/storybook/commit/a53eaef)), closes [#125](https://github.com/MinBZK/storybook/issues/125)

## <small>0.8.59 (2026-06-15)</small>

* feat!: richer menus, multi-level mobile nav, keyboard-shortcut variants, and a loading backdrop (#12 ([8b01ea9](https://github.com/MinBZK/storybook/commit/8b01ea9)), closes [#124](https://github.com/MinBZK/storybook/issues/124)

### Highlights

- **Richer menus.** `nldd-menu` items can now be links (`href`) and show keyboard-shortcut hints, and the menu sizes to its content up to a viewport-aware maximum.
- **Multi-level mobile navigation.** The `nldd-top-navigation-bar` mobile menu sheet now supports nested, multi-level menus with drill-down navigation and a back button per level.
- **Keyboard-shortcut variants.** `nldd-keyboard-shortcut` gained `box` and `simple` variants, `sm` / `md` / `inherit` sizes and `neutral` / `inherit` colors, so a shortcut fits both a standalone keycap and inline running text.
- **Loading backdrop.** `nldd-activity-indicator` can dim and blur the content behind it while loading (opt-in `backdrop`), and a static-skeleton-loading principle was added to the `Docs/Ontwerprichtlijnen` reference.

### Added

- **`nldd-menu`** — menu items accept an `href` (rendered as a real `<a>`, so middle-click and open-in-new-tab work) and a keyboard-shortcut hint (`shortcut`, `shortcut-mac`, `shortcut-windows`, `shortcut-linux`); the menu now sizes to its content between a minimum and `min(100vw - inset, 640px)`, with an explicit `width` to pin it.
- **`nldd-keyboard-shortcut`** — a `box` (keycap) and `simple` (plain-text) variant, `sm` / `md` / `inherit` sizes (the `inherit` size scales with the surrounding text), and `neutral` / `inherit` colors (the latter follows `currentColor`, e.g. on a colored panel).
- **`nldd-activity-indicator`** — an opt-in `backdrop` that dims and blurs the content underneath while loading: the context parent background color (fallback: base surface) at one minus the disabled opacity, plus a backdrop blur.
- **`nldd-top-navigation-bar`** — the mobile menu sheet supports multi-level (drill-down) menus, with a back button per level.

### Changed

- **`nldd-byline`** — on a small container (≤ sm), a byline with two or more avatars stacks the avatar row above the names so the text keeps the full width; single-avatar bylines stay inline.

### Breaking

- **`nldd-menu`** — the `translations` key `components.menu.back` was renamed to `components.menu.back-action` (matching the existing `components.menu.submenu-back-action`); the rendered label is unchanged. Update any `translations` override that sets the old key.

### Fixed

- **`nldd-hero`** — full-width media (`main-width="full"`) now stacks beside the text panel instead of behind it, so the media's rounded corner is no longer hidden by the panel.
- **`nldd-multi-line-text-field`** — with `resize="auto"`, the configured `rows` is honored as a minimum height, so the field no longer shrinks below it (it still grows with content).
- **`nldd-top-navigation-bar`** — menu sheet list items render as real `<button>` elements.

## <small>0.8.58 (2026-06-12)</small>

* feat!: status bar, byline, hero, on-color support, and rich-text width zones (#123) ([5932b63](https://github.com/MinBZK/storybook/commit/5932b63)), closes [#123](https://github.com/MinBZK/storybook/issues/123)

### Highlights

- **Three new components.** `nldd-status-bar` (a 24px page-level status strip with a deep background per variant, optionally a link or button), `nldd-byline` (author/editor line with overlapping avatars, a name and supporting text) and `nldd-hero` (a rijkshuisstijl page header with the shape-language rounded corner and a positionable text panel).
- **On-colored surfaces.** `color="inherit"` on `nldd-title` and `nldd-rich-text`, plus `inherit-filled` / `inherit-tinted` variants on `nldd-button` and `nldd-icon-button`, let text and controls take their color from a colored panel (the hero, a filled category) with guaranteed contrast.
- **Rich-text width zones.** Tables, code blocks and components now span wider than the reading column by default, with a `data-width` per-child override. *(Breaking.)*
- **Breadcrumbs collapse** deep trails behind an ellipsis by default. *(Breaking.)*
- **`coolgray` removed** as a category/color value, and **`nldd-list-item`** now opts into its button mode with a boolean `button` attribute. *(Breaking.)*
- **Category color styles.** Every category color now comes in three styles — `filled` (saturated), `tinted` (a soft tint with colored text and a same-hue outline) and `reference` (the true rijkshuisstijl brand color) — addressed as `--semantics-categories-{color}-{style}-*`. `nldd-tag` and `nldd-banner` adopt `tinted`; the hero paints its panel with `reference`. *(Breaking.)*
- **Design-guidelines reference.** A new `Docs/Ontwerprichtlijnen` Storybook page gathers the design system's interface principles — input and forms, navigation, feedback, microcopy, visual hierarchy and process — as one reference for design and review.

### Added

- **`nldd-status-bar`** (status & feedback) — a 24px-high, full-width status strip with a deep background per variant (`neutral`, `accent`, `success`, `warning`, `critical`). Text-only; set `href` to make the whole strip a link or `button` to make it a button, otherwise it is static. `role` / `aria-live` follow the variant.
- **`nldd-byline`** (content) — a byline with an optional `avatars` slot (overlapping, ring-separated images), a name line and supporting text. The name and supporting text accept rich content via slots (e.g. a `<time>` element or a link).
- **`nldd-hero`** (layout / page sections) — a rijkshuisstijl page header: a media surface with exactly one rounded corner (radius derived from the logo ribbon width) and a text panel placeable on six positions (`main-position`) at `1/2`, `2/3`, `3/4` or `full` width (`main-width`). `main-background` paints the panel with the reference (true brand) category color, identical in light and dark mode; without media the panel fills the hero.
- **`color="inherit"`** on `nldd-title` and `nldd-rich-text` — all text follows the surface color (`currentColor`) for use on colored panels; links keep their underline, secondary text takes a reduced-opacity tier.
- **`inherit-filled` and `inherit-tinted` button variants** on `nldd-button` and `nldd-icon-button` — derive their colors from `currentColor` for colored surfaces. `inherit-filled` uses the surface color as its label via `--context-parent-background-color`, with a white/black contrast flip as fallback. Both support the `expanded` state, and their supporting text takes the full label color (not a faded tier) so it keeps the same guaranteed contrast.
- **Brand ribbon tokens** — `--semantics-brand-ribbon-{sm,md,lg}-width`, the rijkslogo ribbon width that also drives the hero corner radius.
- **On-color tokens** — `--semantics-content-secondary-opacity` (secondary-text opacity tier) and `--semantics-content-contrast-color` (the white/black-against-`currentColor` flip).
- **`nldd-blockquote`** accepts an `nldd-byline` as its `attribution` (the leading em-dash is dropped for a byline).
- **Rich-text images** get the controls medium corner radius.
- **Category `tinted` and `reference` color styles** — alongside `filled`, each category color exposes a `tinted` style (a soft tint with a same-hue outline and colored text, ~525 steps deeper for AA contrast) and a `reference` style (the true rijkshuisstijl brand color, identical in light and dark mode via a mirrored step). Each style provides `background`, `highlight-border`, `primary-content` and `secondary-content` colors.

### Breaking

- **`nldd-list-item` interactive mode** — `type="button"` is replaced by the boolean `button` attribute, aligning the opt-in across default-static components (`nldd-list-item`, `nldd-status-bar`): `href` = link, `button` = button, neither = static. The `ListItemType` export is removed.
- **`nldd-breadcrumbs`** — trails of four or more levels now collapse by default to `Home › … › {parent} › {current}`. The ellipsis is a button that reveals the hidden levels in place (they stay in the DOM for crawlers). Set `no-collapse` to always show the full trail.
- **`nldd-rich-text` width zones** — children other than text now span wider by default. Text (headings, paragraphs, lists, `div` / `section`) and blockquotes stay at the reading measure; `img` / `figure` / `video` / `iframe` and tables take the wide accent; code blocks and components span the full column. Override per child with `data-width="main|wide|full"`.
- **`coolgray` removed** — no longer a color/category value on `nldd-badge`, `nldd-tag`, `nldd-progress-bar`, `nldd-progress-circle` or the hero `main-background`; the matching filled-semantics and component tokens are gone. The `neutral` palette (which aliases the coolgray primitives) is unaffected.
- **`--components-banner-content-secondary-color` removed** — banner supporting text now always uses the primary content color. Consumers who overrode this token to recolor the supporting text will need to remove that override.
- **Category tokens renamed and regrouped** — `--semantics-categories-filled-{color}-*` is now `--semantics-categories-{color}-filled-*`, grouped per color and moved directly below the content colors. `border-color` is renamed `highlight-border-color`, and `content-color` splits into `primary-content-color` / `secondary-content-color`.
- **Per-component category tokens removed** — the `--components-{badge,tag,progress-bar,progress-circle,banner}-{color}-{background,border,content,icon}-color` pass-throughs are gone; these components now read the `--semantics-categories-{color}-{style}-*` tokens directly. Point any external references at the semantic category tokens.

### Changed

- **Banner supporting text** now uses the primary content color instead of the secondary color.
- **`nldd-button-group`** keeps full width in its horizontal orientation, so full-width children stretch; content-sized buttons still sit at the start of the row.
- **`nldd-tag`** now uses the `tinted` category style — a soft tinted fill with same-hue text and a subtle same-hue outline, replacing the saturated filled look.
- **`nldd-banner`** is repainted from the shared category `tinted` tokens (its bundled `--components-banner-{color}-*` tokens are removed); the icon takes the saturated `reference` brand color (it is decorative, so the softer contrast against the tint is acceptable).

### Fixed

- **`nldd-code-viewer`** — prevent iOS text autosizing from inflating the code on mobile.

## <small>0.8.57 (2026-06-09)</small>

* feat!: lg size, highlight borders, new icons, and toolbar/input refinements (#122) ([e9f0570](https://github.com/MinBZK/storybook/commit/e9f0570)), closes [#122](https://github.com/MinBZK/storybook/issues/122)

### Highlights

- **A coordinated `lg` size** across the action and navigation controls — `nldd-button`, `nldd-icon-button`, `nldd-button-bar`, `nldd-split-button`, `nldd-toolbar`, `nldd-tab-bar`, `nldd-toggle-button`, and `nldd-segmented-control` — for larger touch targets and stacked icon-over-text action-bar affordances.
- **`neutral-base` button variant** — a new low-emphasis variant backed by a dedicated token set (neutral-base, per-state secondary-content, highlight-border).
- **Highlight border for controls and control groups** — a per-state highlight border drawn through an `::after` overlay (so it spans dismiss buttons instead of being clipped), both on individual controls (buttons, tokens, dropdowns) and as a single grouped border around control groups (steppers, pagination, tab bars, toggle and segmented controls, document tabs, split buttons, button bars).
- **`nldd-toolbar` items and title as elements** — `nldd-toolbar-item` and `nldd-toolbar-title` are declared custom elements that render and size their own box (`width` / `min-width` / `max-width`); the toolbar measures and lays them out, accepts `nldd-menu-group` in the overflow menu, and overflows items that share an explicit `priority` together.
- **35 new icons** — `accessibility` (`a11y`), `app`, `arrow-left-right`, `binoculars` (`explore`, `discover`), `blocks-9` (`building-blocks`), `book-batch-play`, `brick-wall`, `centralized-network`, `cylinder-2-big-small-split` (`coins`), `cylinder-split-badge-lock`, `desk-with-screen` (`workplace`), `diamond` (`gem`, `quality`), `file-box` (`archive`), `file-text-batch-check-mark`, `file-text-pencil`, `foundation`, `globe-rack-server` (`dns`), `hand` (`privacy`), `handshake`, `key`, `leaf` (`sustainability`), `pencil-ruler` (`design`), `pipeline-corner-2` (`pipeline`), `pipeline-machine-gear` (`pipeline-runner`), `pipeline-valve`, `point-bottom-left-to-point-top-right-s-curve-path` (`path`, `traject`), `radar` (`monitoring`), `score-meter`, `seal-check-mark` (`certified`), `shield` (`protection`), `shield-lock`, `shopping-cart` (`cart`), `square-and-arrow-down` (`save`, `import`), `stack-code`, `table-cells` (`table`).
- **Breadcrumbs** keep the full trail and wrap on small screens — the small-screen collapse-to-back-link is gone.

### Added

- **`lg` size** on `nldd-button`, `nldd-icon-button`, `nldd-button-bar`, `nldd-split-button`, `nldd-toolbar`, `nldd-tab-bar`, `nldd-toggle-button`, and `nldd-segmented-control`.
- **`neutral-base` button variant** plus the `--semantics-*` neutral-base, per-state secondary-content, and highlight-border tokens.
- **Highlight border**, drawn via an `::after` overlay (so it spans dismiss buttons instead of being clipped): a per-state border on individual controls (`nldd-button`, `nldd-token`, `nldd-dropdown`), and a single grouped border around control groups (`nldd-stepper`, `nldd-pagination` — focus drawn above the selected item, `nldd-tab-bar`, `nldd-toggle-button`, `nldd-segmented-control`, `nldd-document-tab-bar`, `nldd-split-button`, `nldd-button-bar`).
- **`icon-placeholder` fallback** on `nldd-tab-bar`, `nldd-toggle-button`, `nldd-segmented-control`, and `nldd-icon-button` — the icon and icon-and-text variants show a placeholder when no icon is supplied.
- **`nldd-button`**: a `supporting-text` attribute.
- **`nldd-icon-button`**: `hide-lg-text` — an icon-only `lg` control with a 28px icon and edge-stable padding.
- **`nldd-split-button`**: a full-width, left-aligned action with `no-highlight-border` on the nested controls, plus a `width` attribute (and `nldd-menu` press-drag-release now pierces shadow boundaries so it works inside the split button).
- **`nldd-document-tab-bar`**: per-state secondary content.
- **`nldd-image`**: `loaded` and `errored` host attributes for consumer CSS, and a transparent media background (gray only on error, LQIP while loading).
- **`nldd-page-sections`** (`one-half-one-half`, `one-third-two-thirds`, `two-thirds-one-third`): `__header` and `__footer` slots, rendered only when slotted.
- **`nldd-toolbar`**: `nldd-toolbar-item` and `nldd-toolbar-title` are now declared elements that render their own box and own their sizing — item `width` / `min-width` / `max-width` / `label` / `priority`, title `text` / `supporting-text` / `align` / `min-width` / `width` / `max-width`. The overflow menu also accepts `nldd-menu-group`, and items that share an explicit `priority` move in and out of the overflow menu together.
- **Icons** — the new icons (listed in Highlights) are normalized to the house format. New aliases for existing icons: `export` (→ square-arrow-up) and `settings` (→ gear).

### Changed

- **`nldd-image`**: the default shape is now square (was rounded); the `image__error-card` wrapper is dropped (the errored media provides the backdrop).
- **`nldd-card`**: square corners (border-radius removed).
- **`nldd-inline-dialog`**: smaller icons (md 48 → 40px, lg 56 → 48px).
- **`nldd-breadcrumbs`**: keeps the full trail and wraps on small screens; the small-screen collapse-to-back-link and its container-query machinery are removed.
- **Input fields**: autofill stays light in both color schemes — a light-yellow background with dark-amber text — instead of inverting in dark mode, via the new `--semantics-input-fields-is-autofill-content-color` token.

### Breaking

- **`nldd-tab-bar`**: the `compact` variant is removed. Use `size="lg"` — the icon-and-text variant at `lg` stacks the icon over the text, which is what `compact` did.
- **Button content-color tokens renamed**: `--semantics-buttons-*-content-color` → `--semantics-buttons-*-primary-content-color`, system-wide. Update any custom CSS that references them.
- **Button font tokens renamed**: `--semantics-buttons-{xs,sm,md,lg}-font` → `--semantics-buttons-{size}-primary-text-font`, system-wide. The supporting text gets its own per-size token (`--semantics-buttons-{size}-supporting-text-font`) instead of an inline primitive. Update any custom CSS that references the old names.
- **`nldd-button`**: the `horizontal-align` attribute is renamed to `horizontal-alignment`.
- **Icon renamed**: `table-badge-arrow-down` → `table-cells-badge-arrow-down`.
- **`nldd-image`**: the error translation key is renamed to `error-text`.

### Fixed

- **`nldd-rich-text`**: the table-header underline is kept (the last-row border is scoped to `tbody`).
- **`nldd-code-viewer`**: the actions button gets an isolated stacking context.
- **`nldd-table`**: the empty state no longer scrolls horizontally — the message spans the box width instead of the data columns.
- **`nldd-tab-bar`, `nldd-document-tab-bar`, `nldd-menu-bar-item`**: the link (anchor) variant shows the link cursor, matching `nldd-button`.

## <small>0.8.56 (2026-06-03)</small>

* feat(plugin): marktplaats voor de nldd-plugin (#121) ([a883ba0](https://github.com/MinBZK/storybook/commit/a883ba0)), closes [#121](https://github.com/MinBZK/storybook/issues/121)

## <small>0.8.55 (2026-06-03)</small>

* feat(plugin): consumentenskill voor het design system (#118) ([118c607](https://github.com/MinBZK/storybook/commit/118c607)), closes [#118](https://github.com/MinBZK/storybook/issues/118)

### Added

- **Consumer plugin (`nldd`)** — a Claude Code plugin with a single skill for developers building applications on `@nldd/design-system`, separate from the maintainer skills (`/component`, `/css`) that exist for the system itself. It pairs a handwritten vision and usage patterns (`skills/nldd/SKILL.md`) with a generated component reference (`skills/nldd/reference.md`, every `nldd-*` element with its attributes, slots, and events from JSDoc, plus the full icon set) and a generated copy of this changelog. Working examples cover plain HTML, Vue 3, layout/CSS tokens, and a full content page. The reference and changelog are regenerated and committed by the release pipeline so they stay in sync with the shipped version.

## <small>0.8.54 (2026-06-02)</small>

* feat!: data tables, activity indicator + loading buttons, and category reorg ([90f4951](https://github.com/MinBZK/storybook/commit/90f4951))

### Highlights

- **Data tables** — new `nldd-table` + `nldd-table-row` bring column-aligned layouts built on the existing cells. Columns are a CSS grid track list that every row shares through subgrid, a `header` slot pins the column headers, and rows are individually selectable. The table is always a boxed surface with a `base` or `tinted` background and full-bleed dividers; overflowing tables inside `nldd-rich-text` adopt the same look.
- **Activity indicator** — `nldd-progress` becomes `nldd-activity-indicator`, now defaulting to an inline, icon-sized `currentColor` ring that scales like an icon, with a `timing` choice between the 1000 ms anti-flash delay and an instant fade-in.
- **Loading buttons** — `nldd-button` and `nldd-icon-button` gain a `loading` state that overlays a centered `nldd-activity-indicator`: the label is hidden without a width jump, and the control stays focusable while it announces `aria-busy` and blocks activation.
- **Reorganized categories** — `menu` moves to **Actions** and **Lists & Menus** becomes **Lists & Tables**, making room for the new table family (import paths and Storybook nav change — see Breaking).
- **Two new icons** — `book` (aliases `guide`, `read`) and `lightbulb` (alias `idea`).

### Added

- **`nldd-table` + `nldd-table-row`**: a `columns` grid-track list applied once and shared by every row via subgrid for true column alignment; reuses `nldd-cell` (generic cells default to full width inside a table); a `header` slot rendered first with `columnheader` roles; per-row `selected` styling; an empty state ("Geen items"); and keyboard focus when the table scrolls horizontally. Always a boxed surface — `background="base"` (default) or `"tinted"`, full-bleed row dividers, inline padding on the rows.
- **`nldd-button` / `nldd-icon-button`**: a `loading` boolean that overlays a centered `nldd-activity-indicator`, hides the label without shifting width, sets `aria-busy`, blocks activation while staying focusable, and matches the control's size and color.
- **`nldd-activity-indicator`** (renamed from `nldd-progress`): a new default inline indicator — an icon-sized `currentColor` ring whose stroke scales with `size` (the `nldd-icon` scale, default `28`). A new `timing` (`'default' | 'instant'`, like `nldd-tooltip`) keeps the 1000 ms anti-flash delay or skips straight to the fade-in. `show-text` (default off) replaces `no-label`, with the accessible name always present via `aria-label`. `text`, `translations`, `complete`, and the overridable default slot are retained.
- **Cells**: `hide-below` / `hide-above` accept named breakpoints, resolved against the surrounding list/table width.
- **`nldd-rich-text`**: `<table>` elements are styled to match `nldd-table` (rounded boxed frame, full-bleed dividers, edge-inset cells).
- **Icons**: `book` (aliases `guide`, `read`) and `lightbulb` (alias `idea`).
- **Tokens**: a shared `--semantics-tables-*` range (border color/width, row padding, column gap, row min-height, selected-row colors) used by `nldd-table` and the rich-text tables.
- **`nldd-progress-bar` / `nldd-progress-circle`**: the indeterminate indicator now carries the same 1px token-colored highlight border as the determinate segment-indicators.

### Breaking

- **Component categories moved.** Import paths change: `…/lists-and-menus/*` → `…/lists-and-tables/*`, and `menu` moves to `…/actions/menu`. Storybook nav follows (`Components/Lists & Menus/*` → `Components/Lists & Tables/*`, `Menu` → `Components/Actions/Menu`).
- **`nldd-progress` → `nldd-activity-indicator`.** The element, class (`NLDDProgress` → `NLDDActivityIndicator`), and translation key are renamed with no alias. `no-label` is replaced by `show-text` (the label is now hidden by default).
- **Progress `segment` → `segment-indicator`.** `nldd-progress-bar-segment` → `nldd-progress-bar-segment-indicator` (and the circle equivalent); exported classes `NLDDProgress{Bar,Circle}Segment` → `…SegmentIndicator`; and the `--components-progress-*-segment-*` custom properties gain `-indicator`.
- **Surface tokens renamed** (same values) so the default variant is named alongside `tinted`:
  - `--semantics-surfaces-background-color` → `--semantics-surfaces-base-background-color`
  - `--semantics-surfaces-border-color` → `--semantics-surfaces-base-border-color`

### Fixed

- **`nldd-rich-text`**: the host now fills its container's width so a slotted grid resolves its `1fr` tracks in Firefox (Chrome/Safari already did).
- **`nldd-code-viewer`**: the copy button no longer sticks to the corner — it scrolls with the code.

## <small>0.8.53 (2026-05-31)</small>

* feat!: isolate slotted content, unify progress + corner-radius APIs, and refine components ([f84cfe2](https://github.com/MinBZK/storybook/commit/f84cfe2))

### Highlights

- **Slotted content is isolated from host CSS** across the text components — projected text no longer accidentally inherits host styles, keeping rendering predictable and accessible.
- **The progress bar and circle are more consistent** — they share a unified `value-display` API and aligned naming, so switching shapes is largely a one-name change: swap `nldd-progress-bar` for `nldd-progress-circle` and the attributes carry over.
- **A consistent corner-radius hierarchy** via one semantic surface token: banner, list, box and card share a single radius, and the menu aligns with the (sharp) overlay radius.

### Added

- **`nldd-segmented-control`**: an `icon-and-text` variant — items render an icon and label together (like the toggle button); the visible text carries the accessible name.
- **`nldd-toggle-button`**: shows an `icon-placeholder` when an icon variant has no icon (and for `icon-and-text` only when there is no text to fall back on).
- **`nldd-card`**: an inner highlight border that paints over the content (including full-width media), white-with-opacity and light/dark aware.
- **`nldd-banner`**: an `accent` variant with its own default icon and color.
- **`nldd-progress-circle`**: a 1px token-colored highlight border with per-size stroke widths.
- **Tokens**: `--semantics-surfaces-corner-radius` (a unified surface radius) and a medium body font-weight variant.

### Changed

- **BREAKING — `nldd-progress` / `nldd-progress-circle`**: unified `value-display` (`inline` / `tooltip` / `none`), added `value-text` to the circle, and aligned naming across the bar and circle (e.g. `header`→`caption`, `value`→`supporting-text`, `fill`→`background`, `hover-area`→`tooltip-area`). `accessible-label` now maps to `aria-valuetext` only — use `value-text` to override the visible value (inline and tooltip).
- **BREAKING — Icons**: `login`/`logout` replaced by `arrow-right-in-bucket` / `arrow-right-out-bucket` (the glyph changed; `login`/`logout`/`exit` remain as aliases).
- **Corner radius**: banner, list, box and card now share one surface tier, and the menu container follows the (sharp) overlay radius. The medium body font-weight is adopted where appropriate.

### Fixed

- **`nldd-code-editor`**: a 16px font on touch devices prevents the iOS focus-zoom (without disabling pinch-zoom).
- **`nldd-form-field`**: a tighter gap for the top-aligned header; the label stays readable over the focus ring.

## <small>0.8.52 (2026-05-29)</small>

* fix(image): use relative sample-image paths so they load under GH Pages base ([4c3150b](https://github.com/MinBZK/storybook/commit/4c3150b))

## <small>0.8.51 (2026-05-29)</small>

* feat: banner, progress family, image with LQIP, and new icons (#115) ([d217812](https://github.com/MinBZK/storybook/commit/d217812)), closes [#115](https://github.com/MinBZK/storybook/issues/115)
* docs: fix ndd -> nldd in skills en bestandsnamen uitlijnen met codebase (#117) ([50c5c68](https://github.com/MinBZK/storybook/commit/50c5c68)), closes [#117](https://github.com/MinBZK/storybook/issues/117)

### Highlights

- **Five new components**: `nldd-banner`, `nldd-progress-bar`, `nldd-progress-circle`, `nldd-progress`, and `nldd-image`. Between them they cover status messaging, loading-state visualization (single-value, multi-segment, distribution, indeterminate), and design-token-aware image presentation. The progress bar and circle share an API so swapping the shape is a one-attribute change; `nldd-progress` is a layout wrapper that delays the indicator by 1000 ms so quick loads don't flash a spinner.
- **Multi-color CSS-only LQIP placeholder** on `nldd-image`. Extends Lean Rada's CSS-only LQIP technique ([leanrada.com](https://leanrada.com/notes/css-only-lqip/)) with one quantized Oklab color per cell instead of grayscale-only cells, so photos with distinct hues (sky + foliage + warm subject) render as a multi-color placeholder rather than collapsing to a single dominant tint. No JS decoder, no blend modes — seven inline CSS variables drive seven background layers natively. A bundled `<nldd-lqip-encoder>` Storybook tool generates the `lqip` attribute string client-side.
- **Copy-to-clipboard on `nldd-code-viewer`**: a top-right button copies the rendered code with a one-shot "Copied" confirmation. Combined with the new `variant` + `background` attributes, snippets now look and behave like proper code blocks out of the box.
- **Six new icons**: `bell`, `bookmark`, `flag`, `star`, `tag`, and `photo-slash` (with a `broken-image` alias used by `nldd-image`'s error fallback). The icon gallery story also gains a search filter for easier discovery.

### Added

- `nldd-banner`: status/feedback component with semantic variants (info / success / warning / critical), filled default icons, optional dismiss button, and primary/secondary actions.
- `nldd-progress-bar` + `nldd-progress-bar-segment`: single `value` or multi-segment use, `progress` and `distribution` modes, 24 color variants (semantic + Rijkskleuren), indeterminate animation that cross-fades into and out of the determinate state, translatable copy.
- `nldd-progress-circle` + `nldd-progress-circle-segment`: circular sibling with the same API as the bar. Radius scales per size so the stroke (2–6 px on size 16–96) always stays inside the viewBox; the track color aliases the bar's so the two stay in lockstep.
- `nldd-progress`: layout placeholder that fills its parent and centers an indeterminate circle after a 1000 ms grace period. Caption defaults to a translated "Laden"; override the indicator via the default slot.
- `nldd-image`: styled `<img>` wrapper with `shape` (square / rounded / circle), `aspect-ratio` for CLS-free layout reservation, `object-fit`, `object-position`, `caption` + `credit`, a `width` attribute (`'full'` or numeric), `decorative`, and `srcset` / `sizes`. Renders `<figure>` + `<figcaption>` only when a caption or credit is present; consumer-supplied `<img>` / `<picture>` in the default slot override the internal one. Error fallback overlays a small neutral card with the new `broken-image` icon and the alt text.
- **CSS-only multi-color LQIP** for `nldd-image`. Extends Lean Rada's CSS-only LQIP technique ([leanrada.com](https://leanrada.com/notes/css-only-lqip/)) with per-cell color: the `lqip` attribute takes a CSV string `"base,c1,c2,c3,c4,c5,c6"` of seven 0-255 bytes, each packing an 8-bit Oklab triplet (2 bits L + 3 bits a + 3 bits b). The decoder renders six per-cell radial-gradients with smooth alpha falloff over the base color — no blend modes, no JS, native browser rendering. Cross-fades into the image on `load`, hides under `prefers-reduced-motion`, and the gradient is suppressed in the error state so the fallback card sits on a neutral background.
- `<nldd-lqip-encoder>` element + "LQIP encoder tool" Storybook page so consumers can generate the LQIP string in-browser. Encoder picks the base color from the dominant Oklab bucket (histogram) and quantizes every cell via brute-force `findOklabBits()` for accuracy near quantization boundaries; the tool renders the produced placeholder side-by-side with the source for visual verification.
- `nldd-code-viewer`: `variant` (`'simple' | 'box'`) and `background` (`'tinted' | 'base'`) attributes for shell-style framing, plus a copy-to-clipboard button. With `variant="simple"` + the copy button, the action pins flush to the host's top-right corner and the snippet keeps a minimum height of the button so the layout never clips it.
- `nldd-box`: `background` attribute (`'tinted'` default for a box on a plain page, `'base'` for a box on an already-tinted parent — the border ring picks the +2-step semantic so the frame still reads card-on-card).
- New surface tokens: `--semantics-surfaces-border-color` / `--semantics-surfaces-tinted-border-color` (+ matching `--components-box-*-border-color` pair). Used as a 1px inset ring across `nldd-box`, `nldd-banner`, `nldd-list`, and `nldd-code-viewer`.
- `nldd-progress`: `complete` boolean attribute clears `aria-busy` and hides the indicator while keeping the element mounted (for consumers who can't unmount). `no-label` boolean attribute suppresses the visible "Laden" caption when the surrounding UI already conveys loading.
- `nldd-image`: visually-hidden `aria-live="polite"` status region announces load failures mid-session (WCAG 4.1.3 Status Messages). The region stays empty until `_imageErrored` flips, so screen readers learn about a dynamic `src` swap that errored even though the visible error overlay was already there. Decorative images stay silent.
- `nldd-image`: `loading` and `fetchpriority` exposed as Storybook controls with LCP guidance; the `loading` JSDoc now warns that leaving `lazy` on a hero / LCP image silently regresses Core Web Vitals.
- `nldd-tooltip`: `nldd-tooltip-dismiss` event fired when Escape is pressed while `open=true`. The consumer controls the open lifecycle (e.g. an action-feedback timer) so we can't unilaterally clear it; the event lets them honor WCAG 1.4.13 (dismissible hover / focus content) without losing control.
- DEV-mode warnings on `nldd-image` for missing `alt` on non-decorative images and for non-positive `width` values that silently fall back to `full`.
- `nldd-collection`: arrow-key navigation when horizontal-scroll regions overflow, with a keyboard focus state on the scroll container.
- `nldd-tooltip`: `open` attribute for forced visibility.
- Generic horizontal-scroll regions (e.g. inside `nldd-code-viewer` and overflowing tables in `nldd-rich-text`) become keyboard-focusable when their content overflows.
- Icons: bell, bookmark, flag, star, tag, photo-slash (with `broken-image` alias).

### Changed

- `nldd-toggle-button`: variant styling is now driven from the rendered content (icon-and-text / icon-only / text-only) — the manual `variant` attribute is no longer needed.
- `nldd-collection`: focus ring renders as a shadow-DOM `::after` so it can sit above slotted cards.
- `nldd-banner` (post-initial iterations): filled default icons, lighter border + background, dismiss button alignment + spacing polished, accent variant dropped (use `nldd-inline-dialog` for accent emphasis), stories rebuilt around the new actions pattern. The edge changed from a real `border` to an inset box-shadow so child content keeps its exact position regardless of the edge weight, with a `forced-colors` fallback restoring a real border.
- `nldd-tag` and `nldd-badge` stories: `Variants` + `Rijkskleuren` merged into a single `Colors` story per component; tag color labels switched from concept-style strings (concept / nieuw / gepubliceerd / let op / afgewezen) to the semantic color names.
- Interactive controls (16 components) now have `user-select: none` on hit targets so double-tapping or shift-clicking doesn't accidentally select label text.

### Breaking

- `nldd-list`: `variant="box-on-tinted"` is removed. Use `<nldd-list variant="box" background="base">` instead. The `background` axis is also narrowed to `'tinted' | 'base'` (the old `'transparent'` value is removed — `variant="simple"` is the no-chrome case and `background` no longer applies when variant is `'simple'`).
- `nldd-code-viewer`: `no-box` boolean is removed. Use `variant="simple"` instead. `background="inherit"` is removed. The remaining `background` values are `'tinted'` (default) and `'base'`.
- Tokens renamed for the new inset-border pattern (same values, new names; rename overrides in custom themes):
  - `--semantics-surfaces-highlight-color` → `--semantics-surfaces-border-color`
  - `--semantics-surfaces-tinted-highlight-color` → `--semantics-surfaces-tinted-border-color`
  - `--components-box-highlight-color` → `--components-box-border-color`
  - `--components-box-on-tinted-background-color` → `--components-box-base-background-color`
  - `--components-box-on-tinted-background-color`'s sibling highlight token is also renamed to `--components-box-base-border-color`.
- `nldd-progress`: the `text=" "` (space-as-sentinel) trick for suppressing the loading label is gone — use the new `no-label` boolean attribute.

### Fixed

- `text-field`, `password-field`, `search-field`, `combo-box`, `multi-line-text-field`: autofill text color pinned to the content-color token via `-webkit-text-fill-color` so dark-mode autofill no longer paints dark browser-default text on the dark-amber autofill background.
- `nldd-collection`: initial left-arrow disabled state on first render.
- `nldd-top-navigation-bar`: website-title gets vertical breathing room at sm so it no longer kisses the top edge.
- Tokens: light-mode `--semantics-content-color` and link colors bumped so the new page-footer meets WCAG contrast.

## <small>0.8.50 (2026-05-28)</small>

* fix: deblokkeer pre-commit hooks (#116) ([50269f0](https://github.com/MinBZK/storybook/commit/50269f0)), closes [#116](https://github.com/MinBZK/storybook/issues/116)

## <small>0.8.49 (2026-05-26)</small>

* feat!: container order API, breadcrumbs centering fix, CHANGELOG workflow ([c1e0ad8](https://github.com/MinBZK/storybook/commit/c1e0ad8))

### Highlights

- `nldd-container`: per-child ordering replaces the boolean reverse family. Each slotted child can declare `order` / `sm-order` / `md-order` / `lg-order` (any integer, including negative) and the container observes slot + attribute mutations to bridge those to `--_slot-{attr}` inline custom properties on the child; the container's shadow CSS reads them via `::slotted(*)` inside `@container` queries with a `sm/md/lg-order → order → 0` fallback cascade. No `ResizeObserver`, no enumerated value rules — and `layout="grid"` now keeps its 2D grid track when items reorder (the previous grid→flex fallback for `reverse` is gone).
- `nldd-breadcrumbs`: `.breadcrumbs` switched from `display: block` to `display: flex` so the `inline-flex` `__level-up` link no longer sits on a baseline line-box, fixing the vertical alignment of the chevron + label at sm.
- `nldd-container` stories: control + story ordering aligned with the canonical skill groups (visueel dominant → space → alignment); optional selects use the `'(geen)'` + `mapping` pattern; booleans default to `false` so the toggle is interactive immediately (no intermediate "Set boolean" step); the defaults column is populated across all controls.
- CHANGELOG workflow: section conventions moved to `CONTRIBUTING.md`; the `## Unreleased` header is dropped — hand-written `### Highlights` / `### Breaking Changes` now sit directly above the current top version and nest naturally under the new version block that semantic-release prepends on release.

### Breaking Changes

- `nldd-container`: `reverse`, `sm-reverse`, `md-reverse`, `lg-reverse` boolean attributes are **removed**. Use per-child `order` / `sm-order` / `md-order` / `lg-order` on the slotted items instead.

  Migration — full reverse of two children:

  ```html
  <!-- before -->
  <nldd-container layout="row" reverse>
    <a>First</a>
    <b>Second</b>
  </nldd-container>

  <!-- after — either flip the DOM order, or set explicit per-child order -->
  <nldd-container layout="row">
    <a order="2">First</a>
    <b order="1">Second</b>
  </nldd-container>
  ```

  Migration — responsive flip (was `md-reverse lg-reverse` on a two-child container):

  ```html
  <!-- before -->
  <nldd-container md-reverse lg-reverse>
    <figure>…</figure>
    <p>…</p>
  </nldd-container>

  <!-- after — the second child moves before the first at md+ -->
  <nldd-container>
    <figure>…</figure>
    <p md-order="-1" lg-order="-1">…</p>
  </nldd-container>
  ```

  `layout="grid"` + reorder no longer falls back to flex — the grid track stays aligned on every breakpoint. `layout="columns"` reorder is still a no-op (CSS multicol has no per-item ordering hook).

## <small>0.8.48 (2026-05-25)</small>

* fix: padding new page-footer ([fbbdf2c](https://github.com/MinBZK/storybook/commit/fbbdf2c))

## <small>0.8.47 (2026-05-25)</small>

* feat!: page-footer, breadcrumbs, container layout API, window scheme ([f96ebf1](https://github.com/MinBZK/storybook/commit/f96ebf1)), closes [#154273](https://github.com/MinBZK/storybook/issues/154273)

### Highlights

- New `nldd-page-footer` family (page-footer + legal-bar + legal-bar-item, the latter two internal sub-components) with breadcrumbs / main / legal-bar slots, automatic dividers between non-empty rows, and a hard-coded Rijksoverheid lintje (#154273) that bleeds through the bottom padding to touch the viewport edge. Width matches the top-nav logo width responsively; height is half the width. `single-slot` attribute reflects when only one row is visible so the lintje sits symmetric within that single block.
- New `nldd-breadcrumbs` + `nldd-breadcrumbs-item` (the item is an internal sub-component): chevron-right separator, container-query-driven "‹ {parent}" fallback on sm viewports.
- New `PageSectionMixin` gives all five page-section components a shared surface API: `background` (`inherit`/`base`/`tinted`), `scheme` (`inherit`/`light`/`dark`/`inverted`), responsive block-padding (12 attrs) and `height`. Each section is its own container-query scope, so its responsive rules resolve against its own width — no outer layout-container required.
- `nldd-container` got a `layout` attribute that covers the common composition patterns: `stack` (default — block items, vertical flow), `row` (flex row, no wrap), `wrap` (flex row, wraps to new lines), `grid` (CSS grid, auto-fit columns at min 280px) and `columns` (CSS multicol, items flow vertically and break to the next column at min 280px width, never split across columns). `gap` keeps working across every mode, and `horizontal-alignment` / `vertical-alignment` map to the right axis property per layout (justify-content / justify-items / align-items). A `reverse` boolean inverts item order for stack / row / wrap natively, and for grid by falling back to flex with `wrap-reverse` (real 2D reversal at the cost of grid-track alignment on the last row); `sm-reverse` / `md-reverse` / `lg-reverse` scope the reversal to a single breakpoint. A `column-count` attribute (1-8, plus `sm-column-count` / `md-column-count` / `lg-column-count`) forces an exact column count and overrides auto-fit — the per-viewport variants resolve against this container's OWN inline-size via a self-aware `@container` query, so a footer grid wraps based on the footer's actual width rather than the viewport (allowing for clean step patterns like 4 → 2 → 1 without an intermediate 3-column phase). Internally the host now wraps the layout in a `.container` div so the host can carry `container-type: inline-size` without violating the "an element can't query itself" rule of container queries.
- Timeline-track-cell split into `*.styles.ts` + `*.template.ts` like other cell components. Own component-color tokens (`--components-timeline-track-cell-color` / `-future-background-color`). Cell stretches to its row by default so the line spans the full main-area height.
- Window keeps its position on sm viewports — previously top/right/bottom/left/centered were cleared on sm and the dialog centered. New `scheme` attribute ('inherit' | 'light' | 'dark') applies color-scheme to host + inner dialog so surfaces inside adapt.

### Breaking Changes

- `background="default"` is now `background="base"` on `nldd-app-view`, `nldd-page` and the five split-view components (`nldd-split-view-pane`, `bar`, `navigation`, `side-by-side`, `stacked`). Same paint behavior, just a clearer name that matches the new `PageSectionMixin` vocabulary. Migration: search/replace `background="default"` → `background="base"` on these elements.
- `<nldd-menu-bar-item expandable>` items must now be wrapped in an explicit `<nldd-menu>`. Previously menu-bar-item auto-created a body-attached menu and cloned the slotted items into it (which dropped JS event listeners). Migration:

  ```html
  <!-- before -->
  <nldd-menu-bar-item text="Account" expandable>
    <nldd-menu-item ...></nldd-menu-item>
    <nldd-menu-divider></nldd-menu-divider>
    <nldd-menu-item ...></nldd-menu-item>
  </nldd-menu-bar-item>

  <!-- after -->
  <nldd-menu-bar-item text="Account" expandable>
    <nldd-menu>
      <nldd-menu-item ...></nldd-menu-item>
      <nldd-menu-divider></nldd-menu-divider>
      <nldd-menu-item ...></nldd-menu-item>
    </nldd-menu>
  </nldd-menu-bar-item>
  ```

  All `<nldd-menu>` attributes (accessible-label, translations, variant, filterFn) are now reachable. Event listeners on items work directly — no more cloneNode.
- `<nldd-code>` → `<nldd-code-viewer>` (disambiguates from the unrelated `<nldd-code-editor>` input component). Class `NLDDCode` → `NLDDCodeViewer`; all 26 `--components-code-*` token-color custom properties → `--components-code-viewer-*`. Migration: search/replace `nldd-code` → `nldd-code-viewer` (skip `nldd-code-editor` matches), `NLDDCode` → `NLDDCodeViewer`, `--components-code-` → `--components-code-viewer-`.
- `nldd-container`: `direction` and `wrap` are replaced by a single `layout` attribute. Migration: `direction="row"` → `layout="row"`, `direction="row" wrap` → `layout="wrap"`, default (or `direction="column"`) → omit / `layout="stack"`. The case `direction="column" wrap` had no working semantics and is dropped. New values `layout="grid"` and `layout="columns"` are net additions.

## <small>0.8.46 (2026-05-21)</small>

### Highlights

- Buttons doen nu echt mee in formulieren: `nldd-button` en `nldd-icon-button`
  zijn form-associated, dus `type="submit"` en `type="reset"` werken nu ook
  binnen een `<form>` (voorheen deed een klik niets over de shadow-grens).
- Consistente "pressed" (active) feedback op alle neutral-tinted controls.

* feat(actions): form-associated buttons, text slot, and consistent active states ([a99a1c5](https://github.com/MinBZK/storybook/commit/a99a1c5))

## <small>0.8.45 (2026-05-21)</small>

### Highlights

Grote housekeeping-batch met een paar zichtbare features bovenop een grondige CSS-architectuur opschoning:

- **Menu uitbreidingen**: destructive variant (rode tekst + highlight, voor "Verwijder"-type acties), klik-en-sleep selectie, automatische groep-dividers, uitlijning van items met gemengde icon/check states.
- **Container layout primitive** herwerkt: nieuwe `direction` / `gap` / `horizontal-alignment` / `vertical-alignment` API, slimmer responsive padding model.
- **Internal "default-unconditional + local-var" CSS pattern** uitgerold over alle componenten — onbekende attribuutwaardes vallen nu netjes terug op de gedocumenteerde default i.p.v. "unstyled" te renderen.
- **Gestandaardiseerd variant-systeem** voor `tag`, `toggle-button` en `tab-bar` — allemaal `variant="text|icon|icon-and-text"` met auto-detect en gedeelde icon-placeholder fallback.
- **Nieuwe standalone icon API** — `<nldd-icon>` krijgt `size` en `color` attributen (functionele semantics + 18 Rijkskleuren). Voorheen alleen via de parent-container.
- **Zeven nieuwe iconen**: `clipboard`, `clipboard-rectangle`, `scissor`, `square-arrow-right-inward`, `message-rectangle-text`, `globe` (+ aliassen `paste` / `cut` / `login` / `annotation` / `comment` / `languages`).
- **Top-navigation-bar accepteert consumer-supplied `<nldd-menu-bar>`** in plaats van losse `menu-bar-item`s.
- **`<nldd-code>` houdt kleuren correct na light/dark-wissel** tijdens horizontaal scrollen — voorheen bleef weggescrollde inhoud in het oude kleurenschema hangen.
- **Changelog infrastructure**: `CHANGELOG.md` in repo + Storybook docs-page + auto-generatie via semantic-release.

### Breaking Changes

Bijna alle breaking changes zijn "onbekende/lege attribuutwaardes → fallback op default" (waar voorheen ongedefineerd gedrag was). Echte API-veranderingen:

- **`<nldd-icon name="square-and-arrow-right">` → `name="square-arrow-right"`** (rename; `logout` / `exit` aliassen blijven).
- **`<nldd-tab-bar compact>` → `variant="compact"`** (idem `<nldd-tab-bar-item>`); `responsive` boolean verwijderd.
- **`<nldd-top-navigation-bar>`** met losse `<nldd-menu-bar-item slot="global">` → wrap in `<nldd-menu-bar slot="global">`.
- **`<nldd-tag>` / `<nldd-toggle-button>`** variant-namen → `'text' | 'icon' | 'icon-and-text'`, auto-detect bij geen variant.
- **Container** (`<nldd-layout-container>`): `layout-container-{sm,md,lg}-padding*` → `sm-/md-/lg-padding*`; nieuwe `direction` / `wrap` / `gap` / `horizontal-alignment` / `vertical-alignment`.
- **Form controls** stretchen nu by default tot 100% van hun container; wrapper of `style="width: …"` voor oude shrink-to-content.
- **`<nldd-toggle-button>`** reflecteert geen `[icon-only]` meer — gebruik `[variant="icon"]`.
- **Title, button, segmented-control, switch, stepper, dropdown, combo-box, text/multi-line/search/password/number-field, split-view-divider, button-group, cells** — onbekende/lege `size`/`variant`/`orientation` → gedocumenteerde default (`md`/`text`/`vertical`) i.p.v. unstyled.

### Added

- `<nldd-icon>` `size` (spacer-aligned 16–96) en `color` (functioneel of Rijkskleur).
- Zeven nieuwe iconen + aliassen (zie Highlights).
- `<nldd-menu-item destructive>` variant.
- `<nldd-menu-group>` auto bottom-divider (parent-aware).
- Menu klik-en-sleep selectie.
- `no-spellcheck` op text-field / multi-line-text-field / search-field / combo-box.
- `<nldd-dropdown>` hover/active/expanded states + transitions.
- Container layout primitive (direction/wrap/gap/alignment).
- `variant="icon-and-text"` op tag / toggle-button / tab-bar-item; `icon-placeholder` fallback bij `variant="icon"` zonder icoon.
- `<nldd-top-navigation-bar>` consumer-supplied `<nldd-menu-bar>`.
- `CHANGELOG.md` + Storybook docs-page.

### Changed

- Globale "default-unconditional + local-var + concentric BEM order" refactor over alle categorieën.
- `<nldd-blockquote>` attribution-prefix via slot `::before`.
- Menu-item uitlijning + check-spacing.
- Popover reopen-guard gestandaardiseerd op pointerdown-flag (popover, menu, menu-bar, menu-bar-item).
- `flex: 1` shorthand → longhands.
- `--components-link-color` pinned op `lintblauw`; light-mode link-kleur feller.
- Top-navigation-bar 12px gap tussen global en utility bar.
- `<nldd-icon>` `:host` is nu `inline-flex` + `height: auto` (intrinsieke SVG-aspect) — voorkomt cross-axis stretch in flex-rijen.
- Storybook 10.3.4 → 10.4.0.

### Fixed

- `<nldd-bar-split-view>` / `<nldd-split-view-pane>` collapsten naar 0 hoogte na de `flex: 1` → longhand conversie.
- `<nldd-menu-group>` bottom divider werd niet onderdrukt wanneer een expliciete divider tussen de group en hidden items zat.
- `<nldd-icon-cell>` `::slotted` width/height var-collisie opgelost.
- `<nldd-code>` repaint na color-scheme flip (nieuwe `color-scheme-repaint` utility).
- `<nldd-page>` `isolation: isolate` — descendant z-index dekt scrollbar niet meer af.
- `<nldd-list-item>` press feedback op touch.
- `<nldd-toolbar>` pinned overflow items renderen in de popover.
- `<nldd-menu-bar>` reserveert overflow-button ruimte alleen bij overflow.
- `<nldd-top-navigation-bar>` utility-menu rechts-uitgelijnd + breathing room op max-md; consumer-set menu-bar-label wordt niet meer overschreven.
- combo-box / number-field / search-field input vult volledige wrapper hoogte.
- `<nldd-password-field>` placeholder gebruikt text-font.
- `<nldd-title>` sized variants honoreren layout-container size op smMax.
- `<nldd-document-tab-bar>` dismiss-button hover/active in dark mode.
- `<nldd-collection>` load-more button stretcht via `button[width="full"]`.

* feat!: bugs and housekeeping — menu, container, variant API, icon API, CSS refactor pass ([d53da4d](https://github.com/MinBZK/storybook/commit/d53da4d))

## <small>0.8.44 (2026-05-16)</small>

### Highlights

Substantial branch: several components reworked, **7 breaking changes**, plus accessibility improvements, bug fixes and new icons. 90 commits. Read the breaking changes before upgrading.

### Breaking Changes

- **menu**: drill-in chain reworked — opener no longer toggles its submenu; anchor state is synced. Open/close behavior changes; review any code reaching into menu internals.
- **rich-text**: rebuilt on CSS grid with named columns + new `centered` mode; blockquotes/tables now bleed wider. Check custom rich-text styling.
- **sheet**: `full-height` boolean removed → `height` attribute (`full` default | `fit-content` | CSS length); `width` for side sheets.
- **icon-button**: `hide-tooltip` removed → `tooltip-timing` (`default` | `instant` | `never`).
- **split-button**: `start-icon` → `icon`; popup-button container restructured.
- **password-field**: toggle-button attributes prefixed `button-`.
- **styles**: `is-open` CSS variables renamed to `is-expanded`.
- **link**: moved from `actions` to `navigation` — update the import path / export subpath (`navigation/link`).

### Menu (drill-in rework)

- Root-owned registry drives chain collapse instead of walking stale parent links: fixes anchor-click not closing after multiple navigations and bounce-back to root.
- Re-resolve drill-in side per reposition (no frozen/mid-chain flip).
- No sticky highlight / press-flash on touch; don't collapse on a touch-scroll started outside; reposition after scroll/resize.
- Remove orphaned drill-in submenu when the parent disconnects; close on window resize.
- Seed `aria-haspopup` for empty `popup-type`; subpixel-safe px custom-prop parsing; safe-triangle stall-dismissal 750ms → 500ms.
- **A11y: polite `role="status"` live region announces drill-in view changes (WCAG 4.1.3)** — entered submenu on drill-in, destination on back / ArrowLeft / Esc; cascade & collapse-all stay silent.

### Added

- **button**: forwards `popoverTargetElement` (IDL) across the shadow boundary — drive popovers in another shadow root.
- **menu-bar**: overflowed expandable items render as nested submenus in the overflow menu.
- **keyboard-shortcut**: per-OS overrides (`mac-keys` / `windows-keys` / `linux-keys`) + automatic OS detection.
- New icons: books-vertical, clock, clock-arrow-clockwise, eyeglasses, starburst-filled, square-on-square (+ aliases incl. `copy`).

### Changed

- **`accessible-label` exposed as a Storybook control** on 17 components that supported the attribute but lacked the control.
- WCAG target-size + simplified styling for tab-bar / segmented-control / pagination.
- Drop non-functional `aria-controls` on the overflow button; sheet warns once in DEV on missing label / invalid height.
- Refreshed u-turn arrows, puzzle-piece, books-vertical, eyeglasses, starburst-filled.
- Concentric CSS property-ordering convention documented + applied; removed unused `--primitives-space-22`; tighter button gaps.

### Fixed

- dropdown focus-state inverted to failure-safe; pagination prev/next above divider, no mouse focus ring on select.
- segmented-control icon-only items fill custom width; inputs custom width capped at container (`max-width: 100%`).
- full-bleed-section body horizontally centered (matches simple-section); touch uses `pointerdown` not `mousedown`.
- OS detection refined: Android → other, UACH `iOS` → mac, ChromeOS classified correctly (more accurate `keyboard-shortcut`).

* feat!: component reworks, breaking changes, fixes & new icons ([149f5aa](https://github.com/MinBZK/storybook/commit/149f5aa))

## <small>0.8.43 (2026-05-13)</small>

### Highlights

Brede design-system polish over componenten, tokens en a11y. Bevat meerdere breaking changes — markered met `!` per commit.

- **A11y fixes (review)** — Buttons en icon-buttons die een menu/popover openen krijgen nu correct `aria-expanded` (was: weggelaten bij `open=false`, WCAG 4.1.2 violation). Nieuwe `popup-type` attribute (`'menu' | 'listbox' | 'dialog' | 'tree' | 'grid'`) forwardt naar `aria-haspopup`. Split-button + combo-box gemigreerd naar de nieuwe API.
- **Trigger API consolidation (BREAKING)** — `open` boolean → `expanded` op `nldd-button`, `nldd-icon-button`, `nldd-token`, `nldd-menu-bar-item`. `expanded` mapt 1-op-1 op `aria-expanded`, geen botsing met HTML-native `<dialog open>` / `<details open>` (container-semantiek), en vormt een natuurlijk paar met `expandable`. Token's `toggle` event detail key ook hernoemd (`{ open }` → `{ expanded }`).
- **Tooltip API consolidation (BREAKING)** — `disabled` + `instant` booleans → één `timing` enum (`'instant' | 'default' | 'never'`). Eén concept, mutually exclusive waarden.
- **Tag/badge API consolidation (BREAKING)** — `variant` → `color` op tag en badge (pure kleurvarianten, geen style-dimensie zoals filled/outlined).
- **Token housekeeping** — nieuwe `--semantics-buttons-{size}-icon-size` + `-icon-only-icon-size` voor consistent icon-sizing in de button-familie. Ongebruikte `--primitives-breakpoint-*` vars verwijderd. Box-shadow en backdrop hebben nu één bron van waarheid (`color-scheme` CSS property) ipv een dubbele detectie via `prefers-color-scheme` media query + `data-scheme` attribuut.
- **Rename `layout-area` → `layout-container`** in container queries en CSS class — consistenter met de responsive-css conventie.
- **Rename `toolbar-title-group` → `toolbar-title`** (+ `subtext` → `supporting-text`).
- **Nieuwe features** — 19 rijkskleur-varianten op tag. `single-line` attribuut op button met ellipsis-vriendelijke layout. Responsive cells via named `list-container` (`hide-below`/`hide-above` via `VisibilityMixin`). Scoped `html, body` reset voor `<nldd-app-view>` shells (via `:has()`, in `@layer reset`). `tooltip.timing="instant"` voor directe hover-show.
- **Storybook DX** — alle stories naar NL. Optionele select-controls gebruiken het `'(geen)'` label-mapping patroon zodat de placeholder verdwijnt en de "geen waarde"-state een echte optie wordt.
- **Tests** — smoke coverage voor button/icon-button aria-expanded combinaties, popup-type forwarding, single-line, width-API en variants.

### Breaking Changes

Migration guide:

```diff
- <nldd-button open>Acties</nldd-button>
+ <nldd-button expanded>Acties</nldd-button>

- <nldd-icon-button expandable aria-haspopup="menu">…</nldd-icon-button>
+ <nldd-icon-button expandable popup-type="menu">…</nldd-icon-button>

- <nldd-tooltip disabled>…</nldd-tooltip>
+ <nldd-tooltip timing="never">…</nldd-tooltip>

- <nldd-tooltip instant>…</nldd-tooltip>
+ <nldd-tooltip timing="instant">…</nldd-tooltip>

- <nldd-tag variant="success">Live</nldd-tag>
+ <nldd-tag color="success">Live</nldd-tag>

- <nldd-toolbar-title-group text="…" subtext="…">
+ <nldd-toolbar-title text="…" supporting-text="…">

  // token toggle event
- token.addEventListener('toggle', e => { e.detail.open })
+ token.addEventListener('toggle', e => { e.detail.expanded })
```

* feat!: bugs and housekeeping — tokens, refactors, A11y fixes ([d54ed9e](https://github.com/MinBZK/storybook/commit/d54ed9e))
