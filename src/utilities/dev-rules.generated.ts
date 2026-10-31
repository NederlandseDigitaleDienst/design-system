// Generated from src/rules/ by scripts/generate-lint-data.js. Do not edit.
import type { DevRule } from './dev-checks.js';

export const devRules: DevRule[] = [
	{
		"id": "avatar-group-holds-avatars",
		"message": "nldd-avatar-group sizes, stacks and rings its avatars, and only an nldd-avatar carries the name that the tooltip and the overflow list read.",
		"context": "nldd-avatar-group",
		"report": ":has(> :not(nldd-avatar))"
	},
	{
		"id": "avatar-group-target-too-small",
		"message": "Avatars that are links or buttons overlap, so each keeps too small a target (WCAG 2.5.8). Use size 32 or larger.",
		"context": "nldd-avatar-group:is([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"28\"])",
		"report": ":has(> nldd-avatar:is([href]:not([href=\"\"]), [button]))"
	},
	{
		"id": "avatar-needs-name",
		"message": "An avatar with `href` or `button` needs `accessible-label` or `name`, or the control has no accessible name.",
		"context": "nldd-avatar:is([href]:not([href=\"\"]), [button])",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [name]:not([name=\"\"])"
	},
	{
		"id": "avatar-target-too-small",
		"message": "A link or button under 24px is too small a target (WCAG 2.5.8) unless nothing else to click lies within 24px of its center. Use size 24 or larger.",
		"context": "nldd-avatar:is([href]:not([href=\"\"]), [button]):is([size=\"16\"], [size=\"20\"])"
	},
	{
		"id": "bar-split-view-children-need-slot",
		"message": "Every child of nldd-bar-split-view needs a `slot`, or it does not render.",
		"context": "nldd-bar-split-view",
		"report": ":has(> :not([slot]))"
	},
	{
		"id": "button-form-id-not-a-form",
		"message": "The id in `form` is an element without a form, so this button submits nothing. An nldd-form only has one once it has rendered.",
		"context": "nldd-button:state(form-target-not-a-form)"
	},
	{
		"id": "button-form-id-not-found",
		"message": "Nothing in this root has the id in `form`, so this button submits nothing.",
		"context": "nldd-button:state(no-form-target)"
	},
	{
		"id": "button-group-at-most-three",
		"message": "nldd-button-group holds three buttons at most; the rest are hidden.",
		"context": "nldd-button-group",
		"count": {
			"of": "*",
			"max": 3
		}
	},
	{
		"id": "button-group-zero-width",
		"message": "The group is 0 wide, so its buttons are invisible. It takes its width from its parent (it is a container query while orientation is auto), and a parent that sizes itself from its content leaves nothing to take. Give the group or that parent a width.",
		"context": "nldd-button-group:state(no-width)"
	},
	{
		"id": "button-needs-name",
		"message": "nldd-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"]), :has(> [slot=\"text\"])"
	},
	{
		"id": "button-size-set-on-group",
		"message": "A button has a size of its own, but the group sets its `size` on all its buttons. Set the size on the group.",
		"context": "nldd-button-group:state(own-size-overwritten)"
	},
	{
		"id": "card-link-needs-name",
		"message": "A card that is a link or button needs `accessible-label`: the control has no text of its own.",
		"context": "nldd-card:is([href]:not([href=\"\"]), [button])",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "code-viewer-diff-lines-dropped",
		"message": "Lines of the diff fall outside the line counts of their @@ header and are not shown. Check the counts in the hunk headers.",
		"context": "nldd-code-viewer:state(diff-lines-dropped)"
	},
	{
		"id": "code-viewer-diff-words-unavailable",
		"message": "The word marks of a diff need @codemirror/merge, which did not load, so the diff shows without them.",
		"context": "nldd-code-viewer:state(no-diff-words)"
	},
	{
		"id": "code-viewer-max-height-invalid",
		"message": "`max-height` is not a CSS length, so it is ignored. Give it a unit, such as \"400px\" or \"50vh\".",
		"context": "nldd-code-viewer:state(invalid-max-height)"
	},
	{
		"id": "collection-item-width-renamed",
		"message": "The `item-width` attribute is now `item-min-width`. Rename it here and on every other nldd-collection.",
		"context": "nldd-collection[item-width]"
	},
	{
		"id": "combo-box-needs-name",
		"message": "nldd-combo-box needs `accessible-label` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-combo-box",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "combo-box-needs-popover-api",
		"message": "The Popover API is not supported in this browser. The dropdown will not open.",
		"context": "nldd-combo-box:state(no-popover-api)"
	},
	{
		"id": "document-tab-bar-needs-name",
		"message": "nldd-document-tab-bar needs `accessible-label` for a meaningful navigation landmark name; without one it falls back to a generic name.",
		"context": "nldd-document-tab-bar",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "download-target-no-effect",
		"message": "`target` does nothing with `download`, which saves the file instead of opening it. Remove one of the two.",
		"context": "nldd-link:state(download-with-target), nldd-button:state(download-with-target), nldd-icon-button:state(download-with-target), nldd-card:state(download-with-target), nldd-list-item:state(download-with-target), nldd-list-item-segment:state(download-with-target)"
	},
	{
		"id": "dropdown-select-needs-name",
		"message": "The slotted `<select>` has no accessible name. Add an `aria-label` or `aria-labelledby` attribute to the `<select>` element.",
		"context": "nldd-dropdown:state(unnamed-select)"
	},
	{
		"id": "editor-needs-name",
		"message": "An editor needs `accessible-label`, `input-id` or a labeled nldd-form-field around it, or it has no accessible name (WCAG SC 4.1.2).",
		"context": "nldd-code-editor, nldd-text-editor",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [input-id]:not([input-id=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "form-action-in-button-group",
		"message": "Put the action in a nldd-button-group, also when there is only one.",
		"context": "nldd-form-actions",
		"assert": ":has(> nldd-button-group)"
	},
	{
		"id": "form-field-list-reads-first-control",
		"message": "More than one control, and the validation list has rules that read a value: it reads the first one. Set `for` on the list if it should read another.",
		"context": "nldd-form-field:state(list-reads-first-control)"
	},
	{
		"id": "form-field-needs-input",
		"message": "nldd-form-field holds no form input, so the label cannot name anything or move focus into it.",
		"context": "nldd-form-field:has(> :not(nldd-form-field-help-text, nldd-validation-list))",
		"assert": ":has(:is(nldd-checkbox, nldd-checkbox-field, nldd-code-editor, nldd-combo-box, nldd-date-field, nldd-date-picker, nldd-dropdown, nldd-file-field, nldd-multi-line-text-field, nldd-number-field, nldd-password-field, nldd-radio-button, nldd-radio-button-field, nldd-radio-button-group, nldd-search-field, nldd-segmented-control, nldd-slider, nldd-stepper, nldd-switch, nldd-switch-field, nldd-text-editor, nldd-text-field, nldd-time-field, nldd-time-picker, nldd-toggle-button, nldd-toggle-button-group, nldd-token-field))"
	},
	{
		"id": "form-section-needs-name",
		"message": "nldd-form-section needs `text` or `supporting-text`: without either its fieldset has no accessible name, and a screen reader announces just \"group\" or nothing.",
		"context": "nldd-form-section",
		"assert": "[text]:not([text=\"\"]), [supporting-text]:not([supporting-text=\"\"])"
	},
	{
		"id": "hero-corner-covered",
		"message": "This corner sits under the panel, so the rounded corner does not show. Choose a corner the panel leaves free, or leave the value empty to let the hero choose.",
		"context": "nldd-hero:state(corner-covered)"
	},
	{
		"id": "hero-corner-full-width",
		"message": "`corner` with width=\"full\" runs the hero to the edge of the screen. A shape with a rounded corner always keeps a margin around it; leave width=\"full\" off or drop the corner.",
		"context": "nldd-hero:is([corner]:not([corner=\"\"]), [corner=\"\"])[width=\"full\"]"
	},
	{
		"id": "hero-corner-unknown",
		"message": "This is not a corner, so the hero chooses one. Use \"top-left\", \"top-right\", \"bottom-left\" or \"bottom-right\", or leave the value empty.",
		"context": "nldd-hero:state(corner-unknown)"
	},
	{
		"id": "hero-corner-unsupported",
		"message": "`corner` only applies with layout=\"contained\" and the panel in a corner or along a side, so this hero stays rectangular. Set layout=\"contained\" and put the panel in a corner or along a side, or drop the corner.",
		"context": "nldd-hero:state(corner-unsupported)"
	},
	{
		"id": "hero-height-unused",
		"message": "`height` is not used on a hero, whose height comes from its image. Use `media-height` for a fixed height, or `media-aspect-ratio`.",
		"context": "nldd-hero[height]:not([height=\"\"])"
	},
	{
		"id": "hero-main-width-invalid",
		"message": "`main-width` is not \"auto\", \"full\" or a CSS width, and falls back to \"auto\", which follows the content between 480px and 640px.",
		"context": "nldd-hero:state(invalid-main-width)"
	},
	{
		"id": "hero-overlap-panel-too-short",
		"message": "With layout=\"overlap\" the panel is shorter than `overlap-size` and ends inside the image. Give it more content or a smaller `overlap-size`, or set layout=\"contained\" to keep the panel on the image.",
		"context": "nldd-hero:state(short-overlap-panel)"
	},
	{
		"id": "hide-above-lg-no-effect",
		"message": "hide-above=\"lg\" never hides anything: there is no breakpoint above lg. The smallest value that hides is \"sm\". Leave the attribute off if you meant \"always visible\".",
		"context": ":is(nldd-cell, nldd-description-cell, nldd-drag-handle-cell, nldd-icon-cell, nldd-spacer-cell, nldd-step-cell, nldd-text-cell, nldd-title-cell)[hide-above=\"lg\"]"
	},
	{
		"id": "hide-below-sm-no-effect",
		"message": "hide-below=\"sm\" never hides anything: there is no breakpoint below sm. The value names the breakpoint you hide below, so the smallest one that hides is \"md\". Leave the attribute off if you meant \"always visible\".",
		"context": ":is(nldd-cell, nldd-description-cell, nldd-drag-handle-cell, nldd-icon-cell, nldd-spacer-cell, nldd-step-cell, nldd-text-cell, nldd-title-cell)[hide-below=\"sm\"]"
	},
	{
		"id": "icon-button-needs-name",
		"message": "nldd-icon-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-icon-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "icon-name-renamed",
		"message": "The `name` attribute is now `icon`. Rename it here and on every other nldd-icon.",
		"context": "nldd-icon[name]"
	},
	{
		"id": "icon-not-found",
		"message": "This icon does not exist.",
		"context": "nldd-icon:state(unknown-icon)"
	},
	{
		"id": "image-needs-alt",
		"message": "A non-decorative image needs a non-empty `alt`. Set `decorative` if the image conveys no information.",
		"context": "nldd-image:state(no-alt)"
	},
	{
		"id": "image-slotted-needs-alternative",
		"message": "The slotted image has no text alternative. Give the `<img>` an `alt` (empty when the image conveys no information), or give the `<svg>` `role=\"img\"` and an `aria-label`, `aria-labelledby` or `<title>`.",
		"context": "nldd-image:state(slotted-without-alternative)"
	},
	{
		"id": "image-width-invalid",
		"message": "`width` is not a positive number. Falling back to \"full\".",
		"context": "nldd-image:state(invalid-width)"
	},
	{
		"id": "list-arrow-navigation-removed",
		"message": "`arrow-navigation` is the default now and the attribute does nothing; remove it.",
		"context": "nldd-list[arrow-navigation]"
	},
	{
		"id": "list-control-keeps-tab-stop",
		"message": "A control in a list-item keeps its tab stop in its own shadow root and has no `no-tab`, so the row cannot take it out of the tab order and the arrow keys skip that row. If the rows of this list are not actions themselves, it is a form: set type=\"form\" and the roving falls away. Otherwise give the component `no-tab`, or wrap the control in an nldd-list-item-segment.",
		"context": "nldd-list:state(control-keeps-tab-stop)"
	},
	{
		"id": "list-empty-needs-empty-slot",
		"message": "No items and nothing in [slot=\"empty\"], so the list renders a blank area. Put an nldd-inline-dialog in that slot saying what is not there and what the next move is.",
		"context": "nldd-list:state(empty):not(:has(> [slot=\"empty\"]))"
	},
	{
		"id": "list-form-row-is-action",
		"message": "type=\"form\" says the rows are not actions and the controls inside them are, so its rows carry no keyboard of their own. This one is a link, a button, a checkbox or a set of segments. Use type=\"list\" for rows you activate, and put the action in a cell if it belongs to a form row.",
		"context": "nldd-list[type=\"form\"] > nldd-list-item",
		"report": ":is([href]:not([href=\"\"]), [button], [checkbox], :has(> nldd-list-item-segment))"
	},
	{
		"id": "list-hidden-rows-need-no-results",
		"message": "Every item is hidden and nothing is in [slot=\"no-results\"], so the list renders a blank area. Put an nldd-inline-dialog in that slot saying what is not there and what the next move is.",
		"context": "nldd-list:state(filtered):not(:has(> [slot=\"empty\"], > [slot=\"no-results\"]))"
	},
	{
		"id": "list-item-bare-text",
		"message": "Bare text sits directly in a row. Wrap it in a cell, or it gets none of the typography, size and alignment, and falls back to the browser's button font in a clickable row.",
		"context": "nldd-list-item:state(bare-text)"
	},
	{
		"id": "list-item-children-need-tree",
		"message": "`slot=\"children\"` nests rows, which only carries meaning in an nldd-list with type=\"tree\" or type=\"navigation\". Elsewhere the group has no owner and assistive technology cannot read the hierarchy.",
		"context": "nldd-list-item:has(> nldd-list-item[slot=\"children\"])",
		"assert": "nldd-list[type=\"tree\"] *, nldd-list[type=\"navigation\"] *"
	},
	{
		"id": "list-item-divider-degenerate",
		"message": "`divider-start` lies past the last `divider-end`, so the divider falls back to the full content width.",
		"context": "nldd-list-item:state(degenerate-divider)"
	},
	{
		"id": "list-item-expanded-in-navigation",
		"message": "`expanded` does nothing on a row with sub-pages in an nldd-list with type=\"navigation\": they are always shown, so the attribute is ignored. Use type=\"tree\" for sections that fold away.",
		"context": "nldd-list-item:state(expanded-in-navigation)"
	},
	{
		"id": "list-item-expanded-needs-control",
		"message": "`expanded` needs somewhere to live: make the row interactive (href, button or checkbox), or mark the segment that does the disclosing with `disclosure`.",
		"context": "nldd-list-item:state(expanded-without-control)"
	},
	{
		"id": "list-item-holds-cells",
		"message": "A row takes cells and segments. Anything else sits outside its layout.",
		"context": "nldd-list-item",
		"report": ":has(> :not([slot], :is(nldd-cell, nldd-description-cell, nldd-drag-handle-cell, nldd-icon-cell, nldd-spacer-cell, nldd-step-cell, nldd-text-cell, nldd-title-cell), nldd-list-item-segment))"
	},
	{
		"id": "list-item-needs-list",
		"message": "nldd-list-item needs a parent nldd-list, which gives the row its type and keyboard behaviour.",
		"context": "nldd-list-item",
		"assert": "nldd-list nldd-list-item"
	},
	{
		"id": "list-item-nested-control",
		"message": "A control sits in a row that is its own control (href, button, checkbox or radio). A control inside a control is invalid HTML and doubles the tab stop. With more than one action, give each its own nldd-list-item-segment and leave the row without an action.",
		"context": "nldd-list-item:state(nested-control)"
	},
	{
		"id": "list-item-segment-disclosure-and-expanded",
		"message": "`disclosure` takes aria-expanded from the row, so the `expanded` on this action is ignored. Drop one of the two.",
		"context": "nldd-list-item-segment[disclosure]",
		"report": "[expanded=\"\"], [expanded]:not([expanded=\"\"])"
	},
	{
		"id": "list-item-segment-no-control-in-listbox",
		"message": "A segment in a type=\"listbox\" list renders as a plain container: an `option` may not contain interactive descendants. Move the segment out of the listbox, or drive selection from the option itself.",
		"context": "nldd-list[type=\"listbox\"] nldd-list-item-segment",
		"report": ":is([href]:not([href=\"\"]), [button], [checkbox])"
	},
	{
		"id": "list-reorderable-needs-list-type",
		"message": "`reorderable` is only valid when type=\"list\", and is ignored here.",
		"context": "nldd-list[reorderable]",
		"report": "[type]:not([type=\"\"]):not([type=\"list\"])"
	},
	{
		"id": "menu-bar-needs-name",
		"message": "No `accessible-label` set. A page with more than one nav landmark needs a unique label on each (WCAG 1.3.1).",
		"context": "nldd-menu-bar:state(unnamed)"
	},
	{
		"id": "menu-filter-in-navigation",
		"message": "filter() belongs to a menu of actions or options. A navigation menu is a short list of links and is not filtered.",
		"context": "nldd-menu[variant=\"navigation\"]:state(filtered)"
	},
	{
		"id": "menu-navigation-holds-links",
		"message": "variant=\"navigation\" is a list of links. A checkbox or radio item, or a shortcut, belongs to an action menu and has no role to live in here. Use the default variant for actions.",
		"context": "nldd-menu[variant=\"navigation\"] nldd-menu-item",
		"report": ":is([type]:not([type=\"\"]):not([type=\"button\"]), [shortcut]:not([shortcut=\"\"]))"
	},
	{
		"id": "modal-dialog-needs-two-actions",
		"message": "One action leaves nothing to choose. Tell the user with an nldd-notification or an inline message, or give the dialog a real choice.",
		"context": "nldd-modal-dialog:has(> [slot=\"actions\"])",
		"count": {
			"of": "[slot=\"actions\"]",
			"min": 2
		}
	},
	{
		"id": "multi-line-text-field-needs-name",
		"message": "nldd-multi-line-text-field needs `accessible-label`, `input-id` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-multi-line-text-field",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [input-id]:not([input-id=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "no-page-footer-in-section",
		"message": "nldd-page-footer has its own slot on nldd-page and sets its own width and spacing.",
		"context": ":is(nldd-simple-section, nldd-full-bleed-section, nldd-sidebar-section) nldd-page-footer"
	},
	{
		"id": "no-sheet-in-split-view",
		"message": "Render nldd-sheet at the document root: inside a pane it is clipped by that pane.",
		"context": "nldd-split-view-pane nldd-sheet"
	},
	{
		"id": "no-sticky-header-on-website",
		"message": "A website lets its header scroll away: a fixed one takes room from the content.",
		"context": "nldd-page[sticky-header]:has(nldd-top-navigation-bar)"
	},
	{
		"id": "no-toggle-button-in-button-bar",
		"message": "The bar is one surface for actions, and a selected toggle breaks it. Use nldd-toggle-button-group for a row of toggles, or nldd-segmented-control for one choice out of a few.",
		"context": "nldd-button-bar",
		"report": ":has(nldd-toggle-button)"
	},
	{
		"id": "notification-at-most-two-actions",
		"message": "At most 2 actions: a message that needs three choices is a decision, and a decision belongs in a dialog that waits for it.",
		"context": "nldd-notification",
		"count": {
			"of": "[slot=\"actions\"]",
			"max": 2
		}
	},
	{
		"id": "number-field-needs-name",
		"message": "nldd-number-field needs `accessible-label` or a labeled nldd-form-field around it, or a screen reader cannot announce its purpose.",
		"context": "nldd-number-field",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "page-footer-duplicate-id",
		"message": "Another element already has id=\"page-footer\". Set a unique id on this instance so skip links target the right one.",
		"context": "nldd-page-footer:state(duplicate-id)"
	},
	{
		"id": "page-second-main",
		"message": "A second page renders a main landmark, which a document may have only one of. Leave `landmarks` at \"auto\" on pages in a pane or an overlay, or set landmarks=\"region\" on the ones that are not the document's page.",
		"context": "nldd-page:state(second-main)"
	},
	{
		"id": "popover-anchor-not-found",
		"message": "Anchor element not found. Set `anchor` or `anchorElement` before calling show().",
		"context": "nldd-popover:state(no-anchor)"
	},
	{
		"id": "popover-needs-name",
		"message": "nldd-popover needs `accessible-label`, or a screen reader announces it without a name.",
		"context": "nldd-popover",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "popover-width-content-sized",
		"message": "This `width` is not supported and is ignored: the popover is an inline-size query container, so its width cannot come from its own content. Give it a CSS length instead.",
		"context": "nldd-popover:is([width=\"auto\"], [width=\"fit-content\"], [width=\"min-content\"], [width=\"max-content\"], [width^=\"fit-content(\"])"
	},
	{
		"id": "progress-bar-segments-exceed-max",
		"message": "The sum of the segment values exceeds `max`. Segments are normalized proportionally.",
		"context": "nldd-progress-bar:state(exceeds-max)"
	},
	{
		"id": "radio-button-group-needs-name",
		"message": "nldd-radio-button-group needs `accessible-label`, `accessible-labeled-by` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-radio-button-group",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [accessible-labeled-by]:not([accessible-labeled-by=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "segmented-control-needs-name",
		"message": "nldd-segmented-control needs `accessible-label`, `accessible-labeled-by` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-segmented-control",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [accessible-labeled-by]:not([accessible-labeled-by=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "segmented-control-required-not-enforced",
		"message": "`required` on a checkbox group is announced but not enforced: HTML has no way to say \"at least one of these\", so the form still submits with nothing selected. Check it yourself on submit, or use radio mode.",
		"context": "nldd-segmented-control[required]",
		"report": "[type=\"checkbox\"]"
	},
	{
		"id": "sheet-height-invalid",
		"message": "Invalid `height`. Falling back to full height. Use \"full\", \"fit-content\", or a valid CSS length (such as \"50dvh\" or \"480px\").",
		"context": "nldd-sheet:state(invalid-height)"
	},
	{
		"id": "sheet-needs-name",
		"message": "No `accessible-label` and no nldd-top-title-bar with text inside. Screen readers will announce this dialog with a generic name. Give the title bar a text, or set `accessible-label`.",
		"context": "nldd-sheet:state(unnamed)"
	},
	{
		"id": "skip-link-no-target",
		"message": "No rendered element follows the skip link, so it has nothing to move focus to. Put the content it skips to right after it, or point `href` at the id of the target.",
		"context": "nldd-skip-link:state(no-target)"
	},
	{
		"id": "skip-link-target-not-focusable",
		"message": "The target did not take focus, so the skip link did nothing. It is probably hidden or inert.",
		"context": "nldd-skip-link:state(target-not-focusable)"
	},
	{
		"id": "status-bar-below-top-bar",
		"message": "The status bar sits below a top bar. It belongs above it, as the first thing on the screen.",
		"context": "nldd-status-bar:state(below-top-bar)"
	},
	{
		"id": "step-bar-current-moved",
		"message": "`current` moved to the step. Set `status=\"current\"` on the current nldd-step-bar-item instead.",
		"context": "nldd-step-bar[current]"
	},
	{
		"id": "step-bar-one-current-step",
		"message": "More than one step has `status=\"current\"`; the last one wins. Mark only the step you are on.",
		"context": "nldd-step-bar",
		"count": {
			"of": "nldd-step-bar-item[status=\"current\"]",
			"max": 1
		}
	},
	{
		"id": "step-cell-content-needs-wide-dot",
		"message": "`text` and `icon` only fit in a full dot on a wide track (`size=\"md\"` with `level=\"major\"`); they are not shown here.",
		"context": "nldd-step-cell:is([text]:not([text=\"\"]), [icon]:not([icon=\"\"]))",
		"assert": "[size=\"md\"]:not([level=\"minor\"], [level=\"none\"])"
	},
	{
		"id": "step-cell-marker-offset-invalid",
		"message": "`marker-offset` is not a CSS length or percentage, so the dot falls back to `vertical-alignment`. Use a length such as \"1rem\" or a percentage such as \"25%\".",
		"context": "nldd-step-cell:state(invalid-marker-offset)"
	},
	{
		"id": "submenu-added-after-mount",
		"message": "An nldd-menu child was added after mount. Submenu attachment is resolved once at firstUpdated, so this menu will not be treated as a submenu. Define the nldd-menu child before the item is connected to the DOM.",
		"context": "nldd-menu-item:state(late-submenu)"
	},
	{
		"id": "switch-needs-name",
		"message": "nldd-switch needs `accessible-label` or a labeled nldd-form-field around it, or use nldd-switch-field. Without one it has no accessible name.",
		"context": "nldd-switch",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "tab-bar-item-selected-renamed",
		"message": "`selected` is now `current` and the old attribute does nothing; rename it.",
		"context": "nldd-tab-bar-item[selected]"
	},
	{
		"id": "tab-bar-needs-name",
		"message": "nldd-tab-bar needs `accessible-label`, so a screen reader can say what the tabs are for.",
		"context": "nldd-tab-bar",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "table-needs-columns",
		"message": "nldd-table needs `columns`, a CSS grid track list, or its cells do not line up.",
		"context": "nldd-table",
		"assert": "[columns]:not([columns=\"\"])"
	},
	{
		"id": "table-needs-name",
		"message": "nldd-table needs `accessible-label`: role=\"table\" takes its name from there.",
		"context": "nldd-table",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "table-silent-empty",
		"message": "No rows and nothing in [slot=\"empty\"], so the table renders a blank area. Put an nldd-inline-dialog in that slot saying what is not there and what the next move is.",
		"context": "nldd-table:state(empty):not(:has(> [slot=\"empty\"])), nldd-table:state(filtered):not(:has(> [slot=\"empty\"], > [slot=\"no-results\"]))"
	},
	{
		"id": "tabs-with-href-need-navigation",
		"message": "Tabs with `href` go to another page: add `navigation`, so the bar is a nav with aria-current=\"page\" instead of a tablist, and set `current` on the tab of the page you are on.",
		"context": "nldd-tab-bar:not([navigation]):has(nldd-tab-bar-item[href]:not([href=\"\"]))"
	},
	{
		"id": "tag-icon-only-needs-name",
		"message": "An icon-only tag without an `accessible-label` has no accessible name. Add `accessible-label` so screen readers can announce it.",
		"context": "nldd-tag:state(unnamed)"
	},
	{
		"id": "task-board-column-needs-name",
		"message": "nldd-task-board-column needs `text` or `accessible-label`; it is what a screen reader hears when an item moves to it.",
		"context": "nldd-task-board-column",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "task-board-move-item-invalid",
		"message": "moveItem() needs an item in one of the board's columns and a column of the board.",
		"context": "nldd-task-board:state(invalid-move)"
	},
	{
		"id": "text-editor-typeahead-query-invalid",
		"message": "The query of this typeahead is not a valid regular expression; the default is used.",
		"context": "nldd-text-editor:state(invalid-typeahead-query)"
	},
	{
		"id": "text-editor-unknown-command",
		"message": "runCommand() got a name that is not a command.",
		"context": "nldd-text-editor:state(unknown-command)"
	},
	{
		"id": "text-field-keyboard-contradicts-type",
		"message": "`keyboard` contradicts `type`, which already raises a keyboard of its own. Drop one of the two.",
		"context": "nldd-text-field:state(keyboard-contradicts-type)"
	},
	{
		"id": "title-custom-size-below-floor",
		"message": "This custom size is smaller than size 1 at this breakpoint and shows as size 1. Use `size` for headings up to size 1.",
		"context": "nldd-title:state(custom-size-below-floor)"
	},
	{
		"id": "title-custom-size-invalid",
		"message": "This is not a size the title can use, so it keeps its size from the scale at this breakpoint. Use a length such as \"96px\" or \"6rem\", not a keyword.",
		"context": "nldd-title:state(invalid-custom-size)"
	},
	{
		"id": "title-subtitle-slot-renamed",
		"message": "The subtitle slot is now supporting-text. Rename slot=\"subtitle\" to slot=\"supporting-text\", or use the `supporting-text` attribute, here and on every other nldd-title.",
		"context": "nldd-title",
		"report": ":has(> [slot=\"subtitle\"])"
	},
	{
		"id": "toggle-button-group-needs-name",
		"message": "nldd-toggle-button-group needs `accessible-label`, `accessible-labeled-by` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-toggle-button-group",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [accessible-labeled-by]:not([accessible-labeled-by=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "toggle-button-group-required-not-enforced",
		"message": "`required` on a checkbox group is announced but not enforced: HTML has no way to say \"at least one of these\", so the form still submits with nothing selected. Check it yourself on submit, or use radio mode.",
		"context": "nldd-toggle-button-group[required]",
		"report": ":not([type=\"radio\"], [type=\"button\"])"
	},
	{
		"id": "toggle-button-icon-needs-icon",
		"message": "nldd-toggle-button with variant=\"icon\" has no `icon` and no slot=\"icon\" content, so a placeholder icon is shown.",
		"context": "nldd-toggle-button[variant=\"icon\"]",
		"assert": "[icon]:not([icon=\"\"]), :has(> [slot=\"icon\"])"
	},
	{
		"id": "toggle-button-needs-name",
		"message": "nldd-toggle-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-toggle-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "toolbar-item-needs-overflow",
		"message": "Give this item an alternative in `slot=\"overflow\"`: on a narrow screen it moves to the overflow menu, and without one it is gone.",
		"context": "nldd-toolbar-item",
		"assert": ":has(> [slot=\"overflow\"])"
	},
	{
		"id": "top-navigation-bar-same-href",
		"message": "`logo-href` and `website-href` go to the same page; leave out `logo-href` so the start page is one link instead of two.",
		"context": "nldd-top-navigation-bar:state(same-href)"
	},
	{
		"id": "top-title-bar-anchor-missing",
		"message": "`collapse-anchor` matches nothing yet. If it never renders, the bar keeps its own title and reads it out twice.",
		"context": "nldd-top-title-bar:state(no-anchor)"
	},
	{
		"id": "validation-item-rule-and-unmet",
		"message": "This item has a rule of its own and is also named in `unmet`. The rule decides, and the name is ignored: it is a snapshot of the previous check and cannot be newer than the value. Drop it from `unmet`, or take the rule off the item.",
		"context": "nldd-validation-list:state(rule-and-unmet)"
	},
	{
		"id": "window-needs-name",
		"message": "No `accessible-label` and no nldd-top-title-bar with text inside. Screen readers will announce this window with a generic name. Give the title bar a text, or set `accessible-label`.",
		"context": "nldd-window:state(unnamed)"
	},
	{
		"id": "invalid-value-button-bar-size",
		"message": "`size` on nldd-button-bar takes: lg, md, sm, xs.",
		"context": "nldd-button-bar[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-button-group-size",
		"message": "`size` on nldd-button-group takes: md, sm.",
		"context": "nldd-button-group[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-button-group-orientation",
		"message": "`orientation` on nldd-button-group takes: auto, horizontal, vertical.",
		"context": "nldd-button-group[orientation]:not([orientation=\"auto\"], [orientation=\"horizontal\"], [orientation=\"vertical\"])"
	},
	{
		"id": "invalid-value-button-group-width",
		"message": "`width` on nldd-button-group takes: full.",
		"context": "nldd-button-group[width]:not([width=\"\"], [width=\"full\"])"
	},
	{
		"id": "invalid-value-button-appearance",
		"message": "`appearance` on nldd-button takes: accent-filled, accent-transparent, critical-tinted, critical-transparent, destructive, inherit-filled, inherit-tinted, neutral-base, neutral-tinted, neutral-transparent, primary, secondary.",
		"context": "nldd-button[appearance]:not([appearance=\"accent-filled\"], [appearance=\"accent-transparent\"], [appearance=\"critical-tinted\"], [appearance=\"critical-transparent\"], [appearance=\"destructive\"], [appearance=\"inherit-filled\"], [appearance=\"inherit-tinted\"], [appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"], [appearance=\"neutral-transparent\"], [appearance=\"primary\"], [appearance=\"secondary\"])"
	},
	{
		"id": "invalid-value-button-size",
		"message": "`size` on nldd-button takes: lg, md, sm, xs.",
		"context": "nldd-button[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-button-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-button takes: center, left, right.",
		"context": "nldd-button[horizontal-alignment]:not([horizontal-alignment=\"\"], [horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-button-popup-type",
		"message": "`popup-type` on nldd-button takes: dialog, grid, listbox, menu, tree.",
		"context": "nldd-button[popup-type]:not([popup-type=\"dialog\"], [popup-type=\"grid\"], [popup-type=\"listbox\"], [popup-type=\"menu\"], [popup-type=\"tree\"])"
	},
	{
		"id": "invalid-value-button-type",
		"message": "`type` on nldd-button takes: button, reset, submit.",
		"context": "nldd-button[type]:not([type=\"button\"], [type=\"reset\"], [type=\"submit\"])"
	},
	{
		"id": "invalid-value-icon-button-appearance",
		"message": "`appearance` on nldd-icon-button takes: accent-filled, accent-transparent, critical-tinted, critical-transparent, destructive, inherit-filled, inherit-tinted, neutral-base, neutral-tinted, neutral-transparent, primary, secondary.",
		"context": "nldd-icon-button[appearance]:not([appearance=\"accent-filled\"], [appearance=\"accent-transparent\"], [appearance=\"critical-tinted\"], [appearance=\"critical-transparent\"], [appearance=\"destructive\"], [appearance=\"inherit-filled\"], [appearance=\"inherit-tinted\"], [appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"], [appearance=\"neutral-transparent\"], [appearance=\"primary\"], [appearance=\"secondary\"])"
	},
	{
		"id": "invalid-value-icon-button-size",
		"message": "`size` on nldd-icon-button takes: lg, md, sm, xs.",
		"context": "nldd-icon-button[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-icon-button-type",
		"message": "`type` on nldd-icon-button takes: button, reset, submit.",
		"context": "nldd-icon-button[type]:not([type=\"button\"], [type=\"reset\"], [type=\"submit\"])"
	},
	{
		"id": "invalid-value-icon-button-popup-type",
		"message": "`popup-type` on nldd-icon-button takes: dialog, grid, listbox, menu, tree.",
		"context": "nldd-icon-button[popup-type]:not([popup-type=\"dialog\"], [popup-type=\"grid\"], [popup-type=\"listbox\"], [popup-type=\"menu\"], [popup-type=\"tree\"])"
	},
	{
		"id": "invalid-value-icon-button-tooltip-timing",
		"message": "`tooltip-timing` on nldd-icon-button takes: delay, instant, never.",
		"context": "nldd-icon-button[tooltip-timing]:not([tooltip-timing=\"delay\"], [tooltip-timing=\"instant\"], [tooltip-timing=\"never\"])"
	},
	{
		"id": "invalid-value-menu-item-type",
		"message": "`type` on nldd-menu-item takes: button, checkbox, radio.",
		"context": "nldd-menu-item[type]:not([type=\"button\"], [type=\"checkbox\"], [type=\"radio\"])"
	},
	{
		"id": "invalid-value-menu-item-query-mark-mode",
		"message": "`query-mark-mode` on nldd-menu-item takes: match, predictive.",
		"context": "nldd-menu-item[query-mark-mode]:not([query-mark-mode=\"match\"], [query-mark-mode=\"predictive\"])"
	},
	{
		"id": "invalid-value-menu-variant",
		"message": "`variant` on nldd-menu takes: listbox, menu, navigation.",
		"context": "nldd-menu[variant]:not([variant=\"listbox\"], [variant=\"menu\"], [variant=\"navigation\"])"
	},
	{
		"id": "invalid-value-split-button-size",
		"message": "`size` on nldd-split-button takes: lg, md, sm, xs.",
		"context": "nldd-split-button[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-toolbar-title-align",
		"message": "`align` on nldd-toolbar-title takes: center, left.",
		"context": "nldd-toolbar-title[align]:not([align=\"center\"], [align=\"left\"])"
	},
	{
		"id": "invalid-value-toolbar-size",
		"message": "`size` on nldd-toolbar takes: lg, md, sm.",
		"context": "nldd-toolbar[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-avatar-type",
		"message": "`type` on nldd-avatar takes: organization, person.",
		"context": "nldd-avatar[type]:not([type=\"organization\"], [type=\"person\"])"
	},
	{
		"id": "invalid-value-avatar-size",
		"message": "`size` on nldd-avatar takes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96, full.",
		"context": "nldd-avatar[size]:not([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"64\"], [size=\"80\"], [size=\"96\"], [size=\"full\"])"
	},
	{
		"id": "invalid-value-avatar-color",
		"message": "`color` on nldd-avatar takes: inherit, neutral.",
		"context": "nldd-avatar[color]:not([color=\"inherit\"], [color=\"neutral\"])"
	},
	{
		"id": "invalid-value-avatar-tooltip-timing",
		"message": "`tooltip-timing` on nldd-avatar takes: delay, instant, never.",
		"context": "nldd-avatar[tooltip-timing]:not([tooltip-timing=\"delay\"], [tooltip-timing=\"instant\"], [tooltip-timing=\"never\"])"
	},
	{
		"id": "invalid-value-code-viewer-appearance",
		"message": "`appearance` on nldd-code-viewer takes: box-base, box-tinted, simple.",
		"context": "nldd-code-viewer[appearance]:not([appearance=\"box-base\"], [appearance=\"box-tinted\"], [appearance=\"simple\"])"
	},
	{
		"id": "invalid-value-icon-size",
		"message": "`size` on nldd-icon takes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96, full, inherit.",
		"context": "nldd-icon[size]:not([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"64\"], [size=\"80\"], [size=\"96\"], [size=\"full\"], [size=\"inherit\"])"
	},
	{
		"id": "invalid-value-icon-color",
		"message": "`color` on nldd-icon takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, oranje, paars, primary-content, robijnrood, rood, roze, secondary-content, success, violet, warning.",
		"context": "nldd-icon[color]:not([color=\"\"], [color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"oranje\"], [color=\"paars\"], [color=\"primary-content\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"secondary-content\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-image-loading",
		"message": "`loading` on nldd-image takes: eager, lazy.",
		"context": "nldd-image[loading]:not([loading=\"eager\"], [loading=\"lazy\"])"
	},
	{
		"id": "invalid-value-image-decoding",
		"message": "`decoding` on nldd-image takes: async, auto, sync.",
		"context": "nldd-image[decoding]:not([decoding=\"async\"], [decoding=\"auto\"], [decoding=\"sync\"])"
	},
	{
		"id": "invalid-value-image-fetchpriority",
		"message": "`fetchpriority` on nldd-image takes: auto, high, low.",
		"context": "nldd-image[fetchpriority]:not([fetchpriority=\"auto\"], [fetchpriority=\"high\"], [fetchpriority=\"low\"])"
	},
	{
		"id": "invalid-value-image-object-fit",
		"message": "`object-fit` on nldd-image takes: contain, cover, fill, none, scale-down.",
		"context": "nldd-image[object-fit]:not([object-fit=\"contain\"], [object-fit=\"cover\"], [object-fit=\"fill\"], [object-fit=\"none\"], [object-fit=\"scale-down\"])"
	},
	{
		"id": "invalid-value-image-object-position",
		"message": "`object-position` on nldd-image takes: bottom, center, left, right, top.",
		"context": "nldd-image[object-position]:not([object-position=\"bottom\"], [object-position=\"center\"], [object-position=\"left\"], [object-position=\"right\"], [object-position=\"top\"])"
	},
	{
		"id": "invalid-value-image-shape",
		"message": "`shape` on nldd-image takes: circle, rounded, square.",
		"context": "nldd-image[shape]:not([shape=\"circle\"], [shape=\"rounded\"], [shape=\"square\"])"
	},
	{
		"id": "invalid-value-keyboard-shortcut-size",
		"message": "`size` on nldd-keyboard-shortcut takes: inherit, md, sm.",
		"context": "nldd-keyboard-shortcut[size]:not([size=\"inherit\"], [size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-keyboard-shortcut-appearance",
		"message": "`appearance` on nldd-keyboard-shortcut takes: box, simple.",
		"context": "nldd-keyboard-shortcut[appearance]:not([appearance=\"box\"], [appearance=\"simple\"])"
	},
	{
		"id": "invalid-value-keyboard-shortcut-color",
		"message": "`color` on nldd-keyboard-shortcut takes: inherit, neutral.",
		"context": "nldd-keyboard-shortcut[color]:not([color=\"inherit\"], [color=\"neutral\"])"
	},
	{
		"id": "invalid-value-rich-text-color",
		"message": "`color` on nldd-rich-text takes: content, inherit.",
		"context": "nldd-rich-text[color]:not([color=\"content\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-rich-text-spacing",
		"message": "`spacing` on nldd-rich-text takes: flat, loose, snug, tight.",
		"context": "nldd-rich-text[spacing]:not([spacing=\"flat\"], [spacing=\"loose\"], [spacing=\"snug\"], [spacing=\"tight\"])"
	},
	{
		"id": "invalid-value-tag-variant",
		"message": "`variant` on nldd-tag takes: icon, icon-and-text, text.",
		"context": "nldd-tag[variant]:not([variant=\"\"], [variant=\"icon\"], [variant=\"icon-and-text\"], [variant=\"text\"])"
	},
	{
		"id": "invalid-value-tag-color",
		"message": "`color` on nldd-tag takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, neutral, oranje, paars, robijnrood, rood, roze, success, violet, warning.",
		"context": "nldd-tag[color]:not([color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"neutral\"], [color=\"oranje\"], [color=\"paars\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-tag-size",
		"message": "`size` on nldd-tag takes: md, sm.",
		"context": "nldd-tag[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-text-size",
		"message": "`size` on nldd-text takes: lg, md, sm, xs, xxs.",
		"context": "nldd-text[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"], [size=\"xxs\"])"
	},
	{
		"id": "invalid-value-text-weight",
		"message": "`weight` on nldd-text takes: bold, medium, regular.",
		"context": "nldd-text[weight]:not([weight=\"bold\"], [weight=\"medium\"], [weight=\"regular\"])"
	},
	{
		"id": "invalid-value-text-line-height",
		"message": "`line-height` on nldd-text takes: flat, loose, snug, tight.",
		"context": "nldd-text[line-height]:not([line-height=\"flat\"], [line-height=\"loose\"], [line-height=\"snug\"], [line-height=\"tight\"])"
	},
	{
		"id": "invalid-value-text-color",
		"message": "`color` on nldd-text takes: accent, content, critical, inherit, secondary, success, warning.",
		"context": "nldd-text[color]:not([color=\"accent\"], [color=\"content\"], [color=\"critical\"], [color=\"inherit\"], [color=\"secondary\"], [color=\"success\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-text-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-text takes: center, left, right.",
		"context": "nldd-text[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-title-color",
		"message": "`color` on nldd-title takes: content, inherit.",
		"context": "nldd-title[color]:not([color=\"content\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-token-control",
		"message": "`control` on nldd-token takes: dismiss, menu, none.",
		"context": "nldd-token[control]:not([control=\"dismiss\"], [control=\"menu\"], [control=\"none\"])"
	},
	{
		"id": "invalid-value-tooltip-placement",
		"message": "`placement` on nldd-tooltip takes: bottom, left, right, top.",
		"context": "nldd-tooltip[placement]:not([placement=\"bottom\"], [placement=\"left\"], [placement=\"right\"], [placement=\"top\"])"
	},
	{
		"id": "invalid-value-tooltip-timing",
		"message": "`timing` on nldd-tooltip takes: delay, instant, never.",
		"context": "nldd-tooltip[timing]:not([timing=\"delay\"], [timing=\"instant\"], [timing=\"never\"])"
	},
	{
		"id": "invalid-value-form-actions-label-alignment",
		"message": "`label-alignment` on nldd-form-actions takes: left, right, top.",
		"context": "nldd-form-actions[label-alignment]:not([label-alignment=\"left\"], [label-alignment=\"right\"], [label-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-form-field-label-alignment",
		"message": "`label-alignment` on nldd-form-field takes: left, right, top.",
		"context": "nldd-form-field[label-alignment]:not([label-alignment=\"left\"], [label-alignment=\"right\"], [label-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-checkbox-field-color",
		"message": "`color` on nldd-checkbox-field takes: inherit.",
		"context": "nldd-checkbox-field[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-checkbox-color",
		"message": "`color` on nldd-checkbox takes: inherit.",
		"context": "nldd-checkbox[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-code-editor-resize",
		"message": "`resize` on nldd-code-editor takes: auto, none, vertical.",
		"context": "nldd-code-editor[resize]:not([resize=\"auto\"], [resize=\"none\"], [resize=\"vertical\"])"
	},
	{
		"id": "invalid-value-code-editor-appearance",
		"message": "`appearance` on nldd-code-editor takes: input-field, simple.",
		"context": "nldd-code-editor[appearance]:not([appearance=\"input-field\"], [appearance=\"simple\"])"
	},
	{
		"id": "invalid-value-combo-box-size",
		"message": "`size` on nldd-combo-box takes: md, sm.",
		"context": "nldd-combo-box[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-date-field-size",
		"message": "`size` on nldd-date-field takes: md, sm.",
		"context": "nldd-date-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-dropdown-size",
		"message": "`size` on nldd-dropdown takes: md, sm, xs.",
		"context": "nldd-dropdown[size]:not([size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-file-field-variant",
		"message": "`variant` on nldd-file-field takes: area, control.",
		"context": "nldd-file-field[variant]:not([variant=\"area\"], [variant=\"control\"])"
	},
	{
		"id": "invalid-value-file-field-size",
		"message": "`size` on nldd-file-field takes: md, sm.",
		"context": "nldd-file-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-multi-line-text-field-size",
		"message": "`size` on nldd-multi-line-text-field takes: md, sm.",
		"context": "nldd-multi-line-text-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-multi-line-text-field-keyboard",
		"message": "`keyboard` on nldd-multi-line-text-field takes: decimal, email, none, numeric, search, tel, text, url.",
		"context": "nldd-multi-line-text-field[keyboard]:not([keyboard=\"decimal\"], [keyboard=\"email\"], [keyboard=\"none\"], [keyboard=\"numeric\"], [keyboard=\"search\"], [keyboard=\"tel\"], [keyboard=\"text\"], [keyboard=\"url\"])"
	},
	{
		"id": "invalid-value-multi-line-text-field-enter-key",
		"message": "`enter-key` on nldd-multi-line-text-field takes: done, enter, go, next, previous, search, send.",
		"context": "nldd-multi-line-text-field[enter-key]:not([enter-key=\"done\"], [enter-key=\"enter\"], [enter-key=\"go\"], [enter-key=\"next\"], [enter-key=\"previous\"], [enter-key=\"search\"], [enter-key=\"send\"])"
	},
	{
		"id": "invalid-value-multi-line-text-field-resize",
		"message": "`resize` on nldd-multi-line-text-field takes: auto, none, vertical.",
		"context": "nldd-multi-line-text-field[resize]:not([resize=\"auto\"], [resize=\"none\"], [resize=\"vertical\"])"
	},
	{
		"id": "invalid-value-number-field-size",
		"message": "`size` on nldd-number-field takes: md, sm.",
		"context": "nldd-number-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-password-field-size",
		"message": "`size` on nldd-password-field takes: md, sm.",
		"context": "nldd-password-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-radio-button-field-color",
		"message": "`color` on nldd-radio-button-field takes: inherit.",
		"context": "nldd-radio-button-field[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-radio-button-color",
		"message": "`color` on nldd-radio-button takes: inherit.",
		"context": "nldd-radio-button[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-search-field-size",
		"message": "`size` on nldd-search-field takes: md, sm.",
		"context": "nldd-search-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-segmented-control-item-appearance",
		"message": "`appearance` on nldd-segmented-control-item takes: neutral-base, neutral-tinted.",
		"context": "nldd-segmented-control-item[appearance]:not([appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"])"
	},
	{
		"id": "invalid-value-segmented-control-item-size",
		"message": "`size` on nldd-segmented-control-item takes: lg, md, sm.",
		"context": "nldd-segmented-control-item[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-segmented-control-item-variant",
		"message": "`variant` on nldd-segmented-control-item takes: icon, icon-and-text, text.",
		"context": "nldd-segmented-control-item[variant]:not([variant=\"icon\"], [variant=\"icon-and-text\"], [variant=\"text\"])"
	},
	{
		"id": "invalid-value-segmented-control-item-input-type",
		"message": "`input-type` on nldd-segmented-control-item takes: checkbox, radio.",
		"context": "nldd-segmented-control-item[input-type]:not([input-type=\"checkbox\"], [input-type=\"radio\"])"
	},
	{
		"id": "invalid-value-segmented-control-appearance",
		"message": "`appearance` on nldd-segmented-control takes: neutral-base, neutral-tinted.",
		"context": "nldd-segmented-control[appearance]:not([appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"])"
	},
	{
		"id": "invalid-value-segmented-control-size",
		"message": "`size` on nldd-segmented-control takes: lg, md, sm.",
		"context": "nldd-segmented-control[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-segmented-control-type",
		"message": "`type` on nldd-segmented-control takes: checkbox, radio.",
		"context": "nldd-segmented-control[type]:not([type=\"checkbox\"], [type=\"radio\"])"
	},
	{
		"id": "invalid-value-segmented-control-variant",
		"message": "`variant` on nldd-segmented-control takes: icon, icon-and-text, text.",
		"context": "nldd-segmented-control[variant]:not([variant=\"icon\"], [variant=\"icon-and-text\"], [variant=\"text\"])"
	},
	{
		"id": "invalid-value-slider-size",
		"message": "`size` on nldd-slider takes: md, sm, xs.",
		"context": "nldd-slider[size]:not([size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-slider-tooltip-timing",
		"message": "`tooltip-timing` on nldd-slider takes: instant, never.",
		"context": "nldd-slider[tooltip-timing]:not([tooltip-timing=\"instant\"], [tooltip-timing=\"never\"])"
	},
	{
		"id": "invalid-value-stepper-size",
		"message": "`size` on nldd-stepper takes: md, sm, xs.",
		"context": "nldd-stepper[size]:not([size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-switch-field-color",
		"message": "`color` on nldd-switch-field takes: inherit.",
		"context": "nldd-switch-field[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-switch-size",
		"message": "`size` on nldd-switch takes: sm, xs.",
		"context": "nldd-switch[size]:not([size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-switch-color",
		"message": "`color` on nldd-switch takes: inherit.",
		"context": "nldd-switch[color]:not([color=\"\"], [color=\"inherit\"])"
	},
	{
		"id": "invalid-value-text-editor-resize",
		"message": "`resize` on nldd-text-editor takes: auto, none, vertical.",
		"context": "nldd-text-editor[resize]:not([resize=\"auto\"], [resize=\"none\"], [resize=\"vertical\"])"
	},
	{
		"id": "invalid-value-text-editor-appearance",
		"message": "`appearance` on nldd-text-editor takes: input-field, simple.",
		"context": "nldd-text-editor[appearance]:not([appearance=\"input-field\"], [appearance=\"simple\"])"
	},
	{
		"id": "invalid-value-text-editor-syntax",
		"message": "`syntax` on nldd-text-editor takes: hidden, visible.",
		"context": "nldd-text-editor[syntax]:not([syntax=\"hidden\"], [syntax=\"visible\"])"
	},
	{
		"id": "invalid-value-text-field-size",
		"message": "`size` on nldd-text-field takes: md, sm.",
		"context": "nldd-text-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-text-field-type",
		"message": "`type` on nldd-text-field takes: email, tel, text, url.",
		"context": "nldd-text-field[type]:not([type=\"email\"], [type=\"tel\"], [type=\"text\"], [type=\"url\"])"
	},
	{
		"id": "invalid-value-text-field-keyboard",
		"message": "`keyboard` on nldd-text-field takes: decimal, email, none, numeric, search, tel, text, url.",
		"context": "nldd-text-field[keyboard]:not([keyboard=\"decimal\"], [keyboard=\"email\"], [keyboard=\"none\"], [keyboard=\"numeric\"], [keyboard=\"search\"], [keyboard=\"tel\"], [keyboard=\"text\"], [keyboard=\"url\"])"
	},
	{
		"id": "invalid-value-text-field-enter-key",
		"message": "`enter-key` on nldd-text-field takes: done, enter, go, next, previous, search, send.",
		"context": "nldd-text-field[enter-key]:not([enter-key=\"done\"], [enter-key=\"enter\"], [enter-key=\"go\"], [enter-key=\"next\"], [enter-key=\"previous\"], [enter-key=\"search\"], [enter-key=\"send\"])"
	},
	{
		"id": "invalid-value-time-field-size",
		"message": "`size` on nldd-time-field takes: md, sm.",
		"context": "nldd-time-field[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-toggle-button-group-type",
		"message": "`type` on nldd-toggle-button-group takes: button, checkbox, radio.",
		"context": "nldd-toggle-button-group[type]:not([type=\"button\"], [type=\"checkbox\"], [type=\"radio\"])"
	},
	{
		"id": "invalid-value-toggle-button-group-appearance",
		"message": "`appearance` on nldd-toggle-button-group takes: accent-transparent, neutral-base, neutral-tinted, neutral-transparent.",
		"context": "nldd-toggle-button-group[appearance]:not([appearance=\"accent-transparent\"], [appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"], [appearance=\"neutral-transparent\"])"
	},
	{
		"id": "invalid-value-toggle-button-group-size",
		"message": "`size` on nldd-toggle-button-group takes: lg, md, sm, xs.",
		"context": "nldd-toggle-button-group[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-toggle-button-type",
		"message": "`type` on nldd-toggle-button takes: button, checkbox, radio.",
		"context": "nldd-toggle-button[type]:not([type=\"button\"], [type=\"checkbox\"], [type=\"radio\"])"
	},
	{
		"id": "invalid-value-toggle-button-appearance",
		"message": "`appearance` on nldd-toggle-button takes: accent-transparent, neutral-base, neutral-tinted, neutral-transparent.",
		"context": "nldd-toggle-button[appearance]:not([appearance=\"accent-transparent\"], [appearance=\"neutral-base\"], [appearance=\"neutral-tinted\"], [appearance=\"neutral-transparent\"])"
	},
	{
		"id": "invalid-value-toggle-button-size",
		"message": "`size` on nldd-toggle-button takes: lg, md, sm, xs.",
		"context": "nldd-toggle-button[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-toggle-button-variant",
		"message": "`variant` on nldd-toggle-button takes: icon, icon-and-text, text.",
		"context": "nldd-toggle-button[variant]:not([variant=\"\"], [variant=\"icon\"], [variant=\"icon-and-text\"], [variant=\"text\"])"
	},
	{
		"id": "invalid-value-token-field-token-control",
		"message": "`token-control` on nldd-token-field takes: dismiss, menu.",
		"context": "nldd-token-field[token-control]:not([token-control=\"dismiss\"], [token-control=\"menu\"])"
	},
	{
		"id": "invalid-value-box-background",
		"message": "`background` on nldd-box takes: accent-tinted, base, critical, tinted.",
		"context": "nldd-box[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"critical\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-card-background",
		"message": "`background` on nldd-card takes: accent-tinted, base, tinted.",
		"context": "nldd-card[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-collection-layout",
		"message": "`layout` on nldd-collection takes: grid, horizontal-scroll, lanes, stack.",
		"context": "nldd-collection[layout]:not([layout=\"grid\"], [layout=\"horizontal-scroll\"], [layout=\"lanes\"], [layout=\"stack\"])"
	},
	{
		"id": "invalid-value-collection-gap",
		"message": "`gap` on nldd-collection takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-collection[gap]:not([gap=\"0\"], [gap=\"10\"], [gap=\"12\"], [gap=\"16\"], [gap=\"2\"], [gap=\"20\"], [gap=\"24\"], [gap=\"28\"], [gap=\"32\"], [gap=\"4\"], [gap=\"40\"], [gap=\"44\"], [gap=\"48\"], [gap=\"56\"], [gap=\"6\"], [gap=\"64\"], [gap=\"8\"], [gap=\"80\"], [gap=\"96\"])"
	},
	{
		"id": "invalid-value-collection-sm-gap",
		"message": "`sm-gap` on nldd-collection takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-collection[sm-gap]:not([sm-gap=\"0\"], [sm-gap=\"10\"], [sm-gap=\"12\"], [sm-gap=\"16\"], [sm-gap=\"2\"], [sm-gap=\"20\"], [sm-gap=\"24\"], [sm-gap=\"28\"], [sm-gap=\"32\"], [sm-gap=\"4\"], [sm-gap=\"40\"], [sm-gap=\"44\"], [sm-gap=\"48\"], [sm-gap=\"56\"], [sm-gap=\"6\"], [sm-gap=\"64\"], [sm-gap=\"8\"], [sm-gap=\"80\"], [sm-gap=\"96\"])"
	},
	{
		"id": "invalid-value-collection-md-gap",
		"message": "`md-gap` on nldd-collection takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-collection[md-gap]:not([md-gap=\"0\"], [md-gap=\"10\"], [md-gap=\"12\"], [md-gap=\"16\"], [md-gap=\"2\"], [md-gap=\"20\"], [md-gap=\"24\"], [md-gap=\"28\"], [md-gap=\"32\"], [md-gap=\"4\"], [md-gap=\"40\"], [md-gap=\"44\"], [md-gap=\"48\"], [md-gap=\"56\"], [md-gap=\"6\"], [md-gap=\"64\"], [md-gap=\"8\"], [md-gap=\"80\"], [md-gap=\"96\"])"
	},
	{
		"id": "invalid-value-collection-lg-gap",
		"message": "`lg-gap` on nldd-collection takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-collection[lg-gap]:not([lg-gap=\"0\"], [lg-gap=\"10\"], [lg-gap=\"12\"], [lg-gap=\"16\"], [lg-gap=\"2\"], [lg-gap=\"20\"], [lg-gap=\"24\"], [lg-gap=\"28\"], [lg-gap=\"32\"], [lg-gap=\"4\"], [lg-gap=\"40\"], [lg-gap=\"44\"], [lg-gap=\"48\"], [lg-gap=\"56\"], [lg-gap=\"6\"], [lg-gap=\"64\"], [lg-gap=\"8\"], [lg-gap=\"80\"], [lg-gap=\"96\"])"
	},
	{
		"id": "invalid-value-container-layout",
		"message": "`layout` on nldd-container takes: columns, grid, lanes, row, stack, wrap.",
		"context": "nldd-container[layout]:not([layout=\"columns\"], [layout=\"grid\"], [layout=\"lanes\"], [layout=\"row\"], [layout=\"stack\"], [layout=\"wrap\"])"
	},
	{
		"id": "invalid-value-container-gap",
		"message": "`gap` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[gap]:not([gap=\"0\"], [gap=\"10\"], [gap=\"12\"], [gap=\"16\"], [gap=\"2\"], [gap=\"20\"], [gap=\"24\"], [gap=\"28\"], [gap=\"32\"], [gap=\"4\"], [gap=\"40\"], [gap=\"44\"], [gap=\"48\"], [gap=\"56\"], [gap=\"6\"], [gap=\"64\"], [gap=\"8\"], [gap=\"80\"], [gap=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-gap",
		"message": "`sm-gap` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-gap]:not([sm-gap=\"0\"], [sm-gap=\"10\"], [sm-gap=\"12\"], [sm-gap=\"16\"], [sm-gap=\"2\"], [sm-gap=\"20\"], [sm-gap=\"24\"], [sm-gap=\"28\"], [sm-gap=\"32\"], [sm-gap=\"4\"], [sm-gap=\"40\"], [sm-gap=\"44\"], [sm-gap=\"48\"], [sm-gap=\"56\"], [sm-gap=\"6\"], [sm-gap=\"64\"], [sm-gap=\"8\"], [sm-gap=\"80\"], [sm-gap=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-gap",
		"message": "`md-gap` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-gap]:not([md-gap=\"0\"], [md-gap=\"10\"], [md-gap=\"12\"], [md-gap=\"16\"], [md-gap=\"2\"], [md-gap=\"20\"], [md-gap=\"24\"], [md-gap=\"28\"], [md-gap=\"32\"], [md-gap=\"4\"], [md-gap=\"40\"], [md-gap=\"44\"], [md-gap=\"48\"], [md-gap=\"56\"], [md-gap=\"6\"], [md-gap=\"64\"], [md-gap=\"8\"], [md-gap=\"80\"], [md-gap=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-gap",
		"message": "`lg-gap` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-gap]:not([lg-gap=\"0\"], [lg-gap=\"10\"], [lg-gap=\"12\"], [lg-gap=\"16\"], [lg-gap=\"2\"], [lg-gap=\"20\"], [lg-gap=\"24\"], [lg-gap=\"28\"], [lg-gap=\"32\"], [lg-gap=\"4\"], [lg-gap=\"40\"], [lg-gap=\"44\"], [lg-gap=\"48\"], [lg-gap=\"56\"], [lg-gap=\"6\"], [lg-gap=\"64\"], [lg-gap=\"8\"], [lg-gap=\"80\"], [lg-gap=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding",
		"message": "`padding` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding]:not([padding=\"0\"], [padding=\"10\"], [padding=\"12\"], [padding=\"16\"], [padding=\"2\"], [padding=\"20\"], [padding=\"24\"], [padding=\"28\"], [padding=\"32\"], [padding=\"4\"], [padding=\"40\"], [padding=\"44\"], [padding=\"48\"], [padding=\"56\"], [padding=\"6\"], [padding=\"64\"], [padding=\"8\"], [padding=\"80\"], [padding=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-inline",
		"message": "`padding-inline` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-inline]:not([padding-inline=\"0\"], [padding-inline=\"10\"], [padding-inline=\"12\"], [padding-inline=\"16\"], [padding-inline=\"2\"], [padding-inline=\"20\"], [padding-inline=\"24\"], [padding-inline=\"28\"], [padding-inline=\"32\"], [padding-inline=\"4\"], [padding-inline=\"40\"], [padding-inline=\"44\"], [padding-inline=\"48\"], [padding-inline=\"56\"], [padding-inline=\"6\"], [padding-inline=\"64\"], [padding-inline=\"8\"], [padding-inline=\"80\"], [padding-inline=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-block",
		"message": "`padding-block` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-top",
		"message": "`padding-top` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-right",
		"message": "`padding-right` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-right]:not([padding-right=\"0\"], [padding-right=\"10\"], [padding-right=\"12\"], [padding-right=\"16\"], [padding-right=\"2\"], [padding-right=\"20\"], [padding-right=\"24\"], [padding-right=\"28\"], [padding-right=\"32\"], [padding-right=\"4\"], [padding-right=\"40\"], [padding-right=\"44\"], [padding-right=\"48\"], [padding-right=\"56\"], [padding-right=\"6\"], [padding-right=\"64\"], [padding-right=\"8\"], [padding-right=\"80\"], [padding-right=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-bottom",
		"message": "`padding-bottom` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-container-padding-left",
		"message": "`padding-left` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[padding-left]:not([padding-left=\"0\"], [padding-left=\"10\"], [padding-left=\"12\"], [padding-left=\"16\"], [padding-left=\"2\"], [padding-left=\"20\"], [padding-left=\"24\"], [padding-left=\"28\"], [padding-left=\"32\"], [padding-left=\"4\"], [padding-left=\"40\"], [padding-left=\"44\"], [padding-left=\"48\"], [padding-left=\"56\"], [padding-left=\"6\"], [padding-left=\"64\"], [padding-left=\"8\"], [padding-left=\"80\"], [padding-left=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding",
		"message": "`sm-padding` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding]:not([sm-padding=\"0\"], [sm-padding=\"10\"], [sm-padding=\"12\"], [sm-padding=\"16\"], [sm-padding=\"2\"], [sm-padding=\"20\"], [sm-padding=\"24\"], [sm-padding=\"28\"], [sm-padding=\"32\"], [sm-padding=\"4\"], [sm-padding=\"40\"], [sm-padding=\"44\"], [sm-padding=\"48\"], [sm-padding=\"56\"], [sm-padding=\"6\"], [sm-padding=\"64\"], [sm-padding=\"8\"], [sm-padding=\"80\"], [sm-padding=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-inline",
		"message": "`sm-padding-inline` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-inline]:not([sm-padding-inline=\"0\"], [sm-padding-inline=\"10\"], [sm-padding-inline=\"12\"], [sm-padding-inline=\"16\"], [sm-padding-inline=\"2\"], [sm-padding-inline=\"20\"], [sm-padding-inline=\"24\"], [sm-padding-inline=\"28\"], [sm-padding-inline=\"32\"], [sm-padding-inline=\"4\"], [sm-padding-inline=\"40\"], [sm-padding-inline=\"44\"], [sm-padding-inline=\"48\"], [sm-padding-inline=\"56\"], [sm-padding-inline=\"6\"], [sm-padding-inline=\"64\"], [sm-padding-inline=\"8\"], [sm-padding-inline=\"80\"], [sm-padding-inline=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-block",
		"message": "`sm-padding-block` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-top",
		"message": "`sm-padding-top` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-right",
		"message": "`sm-padding-right` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-right]:not([sm-padding-right=\"0\"], [sm-padding-right=\"10\"], [sm-padding-right=\"12\"], [sm-padding-right=\"16\"], [sm-padding-right=\"2\"], [sm-padding-right=\"20\"], [sm-padding-right=\"24\"], [sm-padding-right=\"28\"], [sm-padding-right=\"32\"], [sm-padding-right=\"4\"], [sm-padding-right=\"40\"], [sm-padding-right=\"44\"], [sm-padding-right=\"48\"], [sm-padding-right=\"56\"], [sm-padding-right=\"6\"], [sm-padding-right=\"64\"], [sm-padding-right=\"8\"], [sm-padding-right=\"80\"], [sm-padding-right=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-container-sm-padding-left",
		"message": "`sm-padding-left` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[sm-padding-left]:not([sm-padding-left=\"0\"], [sm-padding-left=\"10\"], [sm-padding-left=\"12\"], [sm-padding-left=\"16\"], [sm-padding-left=\"2\"], [sm-padding-left=\"20\"], [sm-padding-left=\"24\"], [sm-padding-left=\"28\"], [sm-padding-left=\"32\"], [sm-padding-left=\"4\"], [sm-padding-left=\"40\"], [sm-padding-left=\"44\"], [sm-padding-left=\"48\"], [sm-padding-left=\"56\"], [sm-padding-left=\"6\"], [sm-padding-left=\"64\"], [sm-padding-left=\"8\"], [sm-padding-left=\"80\"], [sm-padding-left=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding",
		"message": "`md-padding` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding]:not([md-padding=\"0\"], [md-padding=\"10\"], [md-padding=\"12\"], [md-padding=\"16\"], [md-padding=\"2\"], [md-padding=\"20\"], [md-padding=\"24\"], [md-padding=\"28\"], [md-padding=\"32\"], [md-padding=\"4\"], [md-padding=\"40\"], [md-padding=\"44\"], [md-padding=\"48\"], [md-padding=\"56\"], [md-padding=\"6\"], [md-padding=\"64\"], [md-padding=\"8\"], [md-padding=\"80\"], [md-padding=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-inline",
		"message": "`md-padding-inline` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-inline]:not([md-padding-inline=\"0\"], [md-padding-inline=\"10\"], [md-padding-inline=\"12\"], [md-padding-inline=\"16\"], [md-padding-inline=\"2\"], [md-padding-inline=\"20\"], [md-padding-inline=\"24\"], [md-padding-inline=\"28\"], [md-padding-inline=\"32\"], [md-padding-inline=\"4\"], [md-padding-inline=\"40\"], [md-padding-inline=\"44\"], [md-padding-inline=\"48\"], [md-padding-inline=\"56\"], [md-padding-inline=\"6\"], [md-padding-inline=\"64\"], [md-padding-inline=\"8\"], [md-padding-inline=\"80\"], [md-padding-inline=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-block",
		"message": "`md-padding-block` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-top",
		"message": "`md-padding-top` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-right",
		"message": "`md-padding-right` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-right]:not([md-padding-right=\"0\"], [md-padding-right=\"10\"], [md-padding-right=\"12\"], [md-padding-right=\"16\"], [md-padding-right=\"2\"], [md-padding-right=\"20\"], [md-padding-right=\"24\"], [md-padding-right=\"28\"], [md-padding-right=\"32\"], [md-padding-right=\"4\"], [md-padding-right=\"40\"], [md-padding-right=\"44\"], [md-padding-right=\"48\"], [md-padding-right=\"56\"], [md-padding-right=\"6\"], [md-padding-right=\"64\"], [md-padding-right=\"8\"], [md-padding-right=\"80\"], [md-padding-right=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-container-md-padding-left",
		"message": "`md-padding-left` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[md-padding-left]:not([md-padding-left=\"0\"], [md-padding-left=\"10\"], [md-padding-left=\"12\"], [md-padding-left=\"16\"], [md-padding-left=\"2\"], [md-padding-left=\"20\"], [md-padding-left=\"24\"], [md-padding-left=\"28\"], [md-padding-left=\"32\"], [md-padding-left=\"4\"], [md-padding-left=\"40\"], [md-padding-left=\"44\"], [md-padding-left=\"48\"], [md-padding-left=\"56\"], [md-padding-left=\"6\"], [md-padding-left=\"64\"], [md-padding-left=\"8\"], [md-padding-left=\"80\"], [md-padding-left=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding",
		"message": "`lg-padding` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding]:not([lg-padding=\"0\"], [lg-padding=\"10\"], [lg-padding=\"12\"], [lg-padding=\"16\"], [lg-padding=\"2\"], [lg-padding=\"20\"], [lg-padding=\"24\"], [lg-padding=\"28\"], [lg-padding=\"32\"], [lg-padding=\"4\"], [lg-padding=\"40\"], [lg-padding=\"44\"], [lg-padding=\"48\"], [lg-padding=\"56\"], [lg-padding=\"6\"], [lg-padding=\"64\"], [lg-padding=\"8\"], [lg-padding=\"80\"], [lg-padding=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-inline",
		"message": "`lg-padding-inline` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-inline]:not([lg-padding-inline=\"0\"], [lg-padding-inline=\"10\"], [lg-padding-inline=\"12\"], [lg-padding-inline=\"16\"], [lg-padding-inline=\"2\"], [lg-padding-inline=\"20\"], [lg-padding-inline=\"24\"], [lg-padding-inline=\"28\"], [lg-padding-inline=\"32\"], [lg-padding-inline=\"4\"], [lg-padding-inline=\"40\"], [lg-padding-inline=\"44\"], [lg-padding-inline=\"48\"], [lg-padding-inline=\"56\"], [lg-padding-inline=\"6\"], [lg-padding-inline=\"64\"], [lg-padding-inline=\"8\"], [lg-padding-inline=\"80\"], [lg-padding-inline=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-block",
		"message": "`lg-padding-block` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-top",
		"message": "`lg-padding-top` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-right",
		"message": "`lg-padding-right` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-right]:not([lg-padding-right=\"0\"], [lg-padding-right=\"10\"], [lg-padding-right=\"12\"], [lg-padding-right=\"16\"], [lg-padding-right=\"2\"], [lg-padding-right=\"20\"], [lg-padding-right=\"24\"], [lg-padding-right=\"28\"], [lg-padding-right=\"32\"], [lg-padding-right=\"4\"], [lg-padding-right=\"40\"], [lg-padding-right=\"44\"], [lg-padding-right=\"48\"], [lg-padding-right=\"56\"], [lg-padding-right=\"6\"], [lg-padding-right=\"64\"], [lg-padding-right=\"8\"], [lg-padding-right=\"80\"], [lg-padding-right=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-container-lg-padding-left",
		"message": "`lg-padding-left` on nldd-container takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-container[lg-padding-left]:not([lg-padding-left=\"0\"], [lg-padding-left=\"10\"], [lg-padding-left=\"12\"], [lg-padding-left=\"16\"], [lg-padding-left=\"2\"], [lg-padding-left=\"20\"], [lg-padding-left=\"24\"], [lg-padding-left=\"28\"], [lg-padding-left=\"32\"], [lg-padding-left=\"4\"], [lg-padding-left=\"40\"], [lg-padding-left=\"44\"], [lg-padding-left=\"48\"], [lg-padding-left=\"56\"], [lg-padding-left=\"6\"], [lg-padding-left=\"64\"], [lg-padding-left=\"8\"], [lg-padding-left=\"80\"], [lg-padding-left=\"96\"])"
	},
	{
		"id": "invalid-value-container-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-container takes: center, left, right.",
		"context": "nldd-container[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-container-vertical-alignment",
		"message": "`vertical-alignment` on nldd-container takes: bottom, center, top.",
		"context": "nldd-container[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-background",
		"message": "`background` on nldd-full-bleed-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-full-bleed-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-padding-block",
		"message": "`padding-block` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-padding-top",
		"message": "`padding-top` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-padding-bottom",
		"message": "`padding-bottom` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-md-padding-block",
		"message": "`md-padding-block` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-md-padding-top",
		"message": "`md-padding-top` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-full-bleed-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-full-bleed-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-full-bleed-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-hero-layout",
		"message": "`layout` on nldd-hero takes: contained, overlap.",
		"context": "nldd-hero[layout]:not([layout=\"contained\"], [layout=\"overlap\"])"
	},
	{
		"id": "invalid-value-hero-main-background",
		"message": "`main-background` on nldd-hero takes: accent, base.",
		"context": "nldd-hero[main-background]:not([main-background=\"accent\"], [main-background=\"base\"])"
	},
	{
		"id": "invalid-value-hero-main-position",
		"message": "`main-position` on nldd-hero takes: bottom-center, bottom-left, bottom-right, left, right, top-center, top-left, top-right.",
		"context": "nldd-hero[main-position]:not([main-position=\"bottom-center\"], [main-position=\"bottom-left\"], [main-position=\"bottom-right\"], [main-position=\"left\"], [main-position=\"right\"], [main-position=\"top-center\"], [main-position=\"top-left\"], [main-position=\"top-right\"])"
	},
	{
		"id": "invalid-value-hero-background",
		"message": "`background` on nldd-hero takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-hero[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-hero-padding-block",
		"message": "`padding-block` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-hero-padding-top",
		"message": "`padding-top` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-hero-padding-bottom",
		"message": "`padding-bottom` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-hero-sm-padding-block",
		"message": "`sm-padding-block` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-hero-sm-padding-top",
		"message": "`sm-padding-top` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-hero-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-hero-md-padding-block",
		"message": "`md-padding-block` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-hero-md-padding-top",
		"message": "`md-padding-top` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-hero-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-hero-lg-padding-block",
		"message": "`lg-padding-block` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-hero-lg-padding-top",
		"message": "`lg-padding-top` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-hero-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-hero takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-hero[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-vertical-alignment",
		"message": "`vertical-alignment` on nldd-one-half-one-half-section takes: bottom, center, top.",
		"context": "nldd-one-half-one-half-section[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-background",
		"message": "`background` on nldd-one-half-one-half-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-one-half-one-half-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-padding-block",
		"message": "`padding-block` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-padding-top",
		"message": "`padding-top` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-padding-bottom",
		"message": "`padding-bottom` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-md-padding-block",
		"message": "`md-padding-block` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-md-padding-top",
		"message": "`md-padding-top` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-half-one-half-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-one-half-one-half-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-half-one-half-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-vertical-alignment",
		"message": "`vertical-alignment` on nldd-one-third-two-thirds-section takes: bottom, center, top.",
		"context": "nldd-one-third-two-thirds-section[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-background",
		"message": "`background` on nldd-one-third-two-thirds-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-one-third-two-thirds-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-padding-block",
		"message": "`padding-block` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-padding-top",
		"message": "`padding-top` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-padding-bottom",
		"message": "`padding-bottom` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-md-padding-block",
		"message": "`md-padding-block` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-md-padding-top",
		"message": "`md-padding-top` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-one-third-two-thirds-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-one-third-two-thirds-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-one-third-two-thirds-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-background",
		"message": "`background` on nldd-sidebar-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-sidebar-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-sidebar-section-padding-block",
		"message": "`padding-block` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-padding-top",
		"message": "`padding-top` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-padding-bottom",
		"message": "`padding-bottom` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-md-padding-block",
		"message": "`md-padding-block` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-md-padding-top",
		"message": "`md-padding-top` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-sidebar-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-sidebar-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-sidebar-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-simple-section takes: center, left, right.",
		"context": "nldd-simple-section[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-simple-section-vertical-alignment",
		"message": "`vertical-alignment` on nldd-simple-section takes: bottom, center, top.",
		"context": "nldd-simple-section[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-simple-section-background",
		"message": "`background` on nldd-simple-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-simple-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-simple-section-padding-block",
		"message": "`padding-block` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-padding-top",
		"message": "`padding-top` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-padding-bottom",
		"message": "`padding-bottom` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-md-padding-block",
		"message": "`md-padding-block` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-md-padding-top",
		"message": "`md-padding-top` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-simple-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-simple-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-simple-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-vertical-alignment",
		"message": "`vertical-alignment` on nldd-two-thirds-one-third-section takes: bottom, center, top.",
		"context": "nldd-two-thirds-one-third-section[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-background",
		"message": "`background` on nldd-two-thirds-one-third-section takes: accent-tinted, base, inherit, tinted.",
		"context": "nldd-two-thirds-one-third-section[background]:not([background=\"accent-tinted\"], [background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-padding-block",
		"message": "`padding-block` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[padding-block]:not([padding-block=\"0\"], [padding-block=\"10\"], [padding-block=\"12\"], [padding-block=\"16\"], [padding-block=\"2\"], [padding-block=\"20\"], [padding-block=\"24\"], [padding-block=\"28\"], [padding-block=\"32\"], [padding-block=\"4\"], [padding-block=\"40\"], [padding-block=\"44\"], [padding-block=\"48\"], [padding-block=\"56\"], [padding-block=\"6\"], [padding-block=\"64\"], [padding-block=\"8\"], [padding-block=\"80\"], [padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-padding-top",
		"message": "`padding-top` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[padding-top]:not([padding-top=\"0\"], [padding-top=\"10\"], [padding-top=\"12\"], [padding-top=\"16\"], [padding-top=\"2\"], [padding-top=\"20\"], [padding-top=\"24\"], [padding-top=\"28\"], [padding-top=\"32\"], [padding-top=\"4\"], [padding-top=\"40\"], [padding-top=\"44\"], [padding-top=\"48\"], [padding-top=\"56\"], [padding-top=\"6\"], [padding-top=\"64\"], [padding-top=\"8\"], [padding-top=\"80\"], [padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-padding-bottom",
		"message": "`padding-bottom` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[padding-bottom]:not([padding-bottom=\"0\"], [padding-bottom=\"10\"], [padding-bottom=\"12\"], [padding-bottom=\"16\"], [padding-bottom=\"2\"], [padding-bottom=\"20\"], [padding-bottom=\"24\"], [padding-bottom=\"28\"], [padding-bottom=\"32\"], [padding-bottom=\"4\"], [padding-bottom=\"40\"], [padding-bottom=\"44\"], [padding-bottom=\"48\"], [padding-bottom=\"56\"], [padding-bottom=\"6\"], [padding-bottom=\"64\"], [padding-bottom=\"8\"], [padding-bottom=\"80\"], [padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-sm-padding-block",
		"message": "`sm-padding-block` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[sm-padding-block]:not([sm-padding-block=\"0\"], [sm-padding-block=\"10\"], [sm-padding-block=\"12\"], [sm-padding-block=\"16\"], [sm-padding-block=\"2\"], [sm-padding-block=\"20\"], [sm-padding-block=\"24\"], [sm-padding-block=\"28\"], [sm-padding-block=\"32\"], [sm-padding-block=\"4\"], [sm-padding-block=\"40\"], [sm-padding-block=\"44\"], [sm-padding-block=\"48\"], [sm-padding-block=\"56\"], [sm-padding-block=\"6\"], [sm-padding-block=\"64\"], [sm-padding-block=\"8\"], [sm-padding-block=\"80\"], [sm-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-sm-padding-top",
		"message": "`sm-padding-top` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[sm-padding-top]:not([sm-padding-top=\"0\"], [sm-padding-top=\"10\"], [sm-padding-top=\"12\"], [sm-padding-top=\"16\"], [sm-padding-top=\"2\"], [sm-padding-top=\"20\"], [sm-padding-top=\"24\"], [sm-padding-top=\"28\"], [sm-padding-top=\"32\"], [sm-padding-top=\"4\"], [sm-padding-top=\"40\"], [sm-padding-top=\"44\"], [sm-padding-top=\"48\"], [sm-padding-top=\"56\"], [sm-padding-top=\"6\"], [sm-padding-top=\"64\"], [sm-padding-top=\"8\"], [sm-padding-top=\"80\"], [sm-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-sm-padding-bottom",
		"message": "`sm-padding-bottom` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[sm-padding-bottom]:not([sm-padding-bottom=\"0\"], [sm-padding-bottom=\"10\"], [sm-padding-bottom=\"12\"], [sm-padding-bottom=\"16\"], [sm-padding-bottom=\"2\"], [sm-padding-bottom=\"20\"], [sm-padding-bottom=\"24\"], [sm-padding-bottom=\"28\"], [sm-padding-bottom=\"32\"], [sm-padding-bottom=\"4\"], [sm-padding-bottom=\"40\"], [sm-padding-bottom=\"44\"], [sm-padding-bottom=\"48\"], [sm-padding-bottom=\"56\"], [sm-padding-bottom=\"6\"], [sm-padding-bottom=\"64\"], [sm-padding-bottom=\"8\"], [sm-padding-bottom=\"80\"], [sm-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-md-padding-block",
		"message": "`md-padding-block` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[md-padding-block]:not([md-padding-block=\"0\"], [md-padding-block=\"10\"], [md-padding-block=\"12\"], [md-padding-block=\"16\"], [md-padding-block=\"2\"], [md-padding-block=\"20\"], [md-padding-block=\"24\"], [md-padding-block=\"28\"], [md-padding-block=\"32\"], [md-padding-block=\"4\"], [md-padding-block=\"40\"], [md-padding-block=\"44\"], [md-padding-block=\"48\"], [md-padding-block=\"56\"], [md-padding-block=\"6\"], [md-padding-block=\"64\"], [md-padding-block=\"8\"], [md-padding-block=\"80\"], [md-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-md-padding-top",
		"message": "`md-padding-top` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[md-padding-top]:not([md-padding-top=\"0\"], [md-padding-top=\"10\"], [md-padding-top=\"12\"], [md-padding-top=\"16\"], [md-padding-top=\"2\"], [md-padding-top=\"20\"], [md-padding-top=\"24\"], [md-padding-top=\"28\"], [md-padding-top=\"32\"], [md-padding-top=\"4\"], [md-padding-top=\"40\"], [md-padding-top=\"44\"], [md-padding-top=\"48\"], [md-padding-top=\"56\"], [md-padding-top=\"6\"], [md-padding-top=\"64\"], [md-padding-top=\"8\"], [md-padding-top=\"80\"], [md-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-md-padding-bottom",
		"message": "`md-padding-bottom` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[md-padding-bottom]:not([md-padding-bottom=\"0\"], [md-padding-bottom=\"10\"], [md-padding-bottom=\"12\"], [md-padding-bottom=\"16\"], [md-padding-bottom=\"2\"], [md-padding-bottom=\"20\"], [md-padding-bottom=\"24\"], [md-padding-bottom=\"28\"], [md-padding-bottom=\"32\"], [md-padding-bottom=\"4\"], [md-padding-bottom=\"40\"], [md-padding-bottom=\"44\"], [md-padding-bottom=\"48\"], [md-padding-bottom=\"56\"], [md-padding-bottom=\"6\"], [md-padding-bottom=\"64\"], [md-padding-bottom=\"8\"], [md-padding-bottom=\"80\"], [md-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-lg-padding-block",
		"message": "`lg-padding-block` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[lg-padding-block]:not([lg-padding-block=\"0\"], [lg-padding-block=\"10\"], [lg-padding-block=\"12\"], [lg-padding-block=\"16\"], [lg-padding-block=\"2\"], [lg-padding-block=\"20\"], [lg-padding-block=\"24\"], [lg-padding-block=\"28\"], [lg-padding-block=\"32\"], [lg-padding-block=\"4\"], [lg-padding-block=\"40\"], [lg-padding-block=\"44\"], [lg-padding-block=\"48\"], [lg-padding-block=\"56\"], [lg-padding-block=\"6\"], [lg-padding-block=\"64\"], [lg-padding-block=\"8\"], [lg-padding-block=\"80\"], [lg-padding-block=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-lg-padding-top",
		"message": "`lg-padding-top` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[lg-padding-top]:not([lg-padding-top=\"0\"], [lg-padding-top=\"10\"], [lg-padding-top=\"12\"], [lg-padding-top=\"16\"], [lg-padding-top=\"2\"], [lg-padding-top=\"20\"], [lg-padding-top=\"24\"], [lg-padding-top=\"28\"], [lg-padding-top=\"32\"], [lg-padding-top=\"4\"], [lg-padding-top=\"40\"], [lg-padding-top=\"44\"], [lg-padding-top=\"48\"], [lg-padding-top=\"56\"], [lg-padding-top=\"6\"], [lg-padding-top=\"64\"], [lg-padding-top=\"8\"], [lg-padding-top=\"80\"], [lg-padding-top=\"96\"])"
	},
	{
		"id": "invalid-value-two-thirds-one-third-section-lg-padding-bottom",
		"message": "`lg-padding-bottom` on nldd-two-thirds-one-third-section takes: 0, 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96.",
		"context": "nldd-two-thirds-one-third-section[lg-padding-bottom]:not([lg-padding-bottom=\"0\"], [lg-padding-bottom=\"10\"], [lg-padding-bottom=\"12\"], [lg-padding-bottom=\"16\"], [lg-padding-bottom=\"2\"], [lg-padding-bottom=\"20\"], [lg-padding-bottom=\"24\"], [lg-padding-bottom=\"28\"], [lg-padding-bottom=\"32\"], [lg-padding-bottom=\"4\"], [lg-padding-bottom=\"40\"], [lg-padding-bottom=\"44\"], [lg-padding-bottom=\"48\"], [lg-padding-bottom=\"56\"], [lg-padding-bottom=\"6\"], [lg-padding-bottom=\"64\"], [lg-padding-bottom=\"8\"], [lg-padding-bottom=\"80\"], [lg-padding-bottom=\"96\"])"
	},
	{
		"id": "invalid-value-page-background",
		"message": "`background` on nldd-page takes: base, inherit, tinted.",
		"context": "nldd-page[background]:not([background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-page-landmarks",
		"message": "`landmarks` on nldd-page takes: auto, page, region.",
		"context": "nldd-page[landmarks]:not([landmarks=\"auto\"], [landmarks=\"page\"], [landmarks=\"region\"])"
	},
	{
		"id": "invalid-value-popover-placement",
		"message": "`placement` on nldd-popover takes: bottom, bottom-end, bottom-start, left, left-end, left-start, right, right-end, right-start, top, top-end, top-start.",
		"context": "nldd-popover[placement]:not([placement=\"bottom\"], [placement=\"bottom-end\"], [placement=\"bottom-start\"], [placement=\"left\"], [placement=\"left-end\"], [placement=\"left-start\"], [placement=\"right\"], [placement=\"right-end\"], [placement=\"right-start\"], [placement=\"top\"], [placement=\"top-end\"], [placement=\"top-start\"])"
	},
	{
		"id": "invalid-value-sheet-placement",
		"message": "`placement` on nldd-sheet takes: bottom, left, right.",
		"context": "nldd-sheet[placement]:not([placement=\"bottom\"], [placement=\"left\"], [placement=\"right\"])"
	},
	{
		"id": "invalid-value-shell-background",
		"message": "`background` on nldd-shell takes: base, tinted.",
		"context": "nldd-shell[background]:not([background=\"base\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-spacer-size",
		"message": "`size` on nldd-spacer takes: 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96, flexible.",
		"context": "nldd-spacer[size]:not([size=\"10\"], [size=\"12\"], [size=\"16\"], [size=\"2\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"4\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"6\"], [size=\"64\"], [size=\"8\"], [size=\"80\"], [size=\"96\"], [size=\"flexible\"])"
	},
	{
		"id": "invalid-value-spacer-sm-size",
		"message": "`sm-size` on nldd-spacer takes: 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96, flexible.",
		"context": "nldd-spacer[sm-size]:not([sm-size=\"10\"], [sm-size=\"12\"], [sm-size=\"16\"], [sm-size=\"2\"], [sm-size=\"20\"], [sm-size=\"24\"], [sm-size=\"28\"], [sm-size=\"32\"], [sm-size=\"4\"], [sm-size=\"40\"], [sm-size=\"44\"], [sm-size=\"48\"], [sm-size=\"56\"], [sm-size=\"6\"], [sm-size=\"64\"], [sm-size=\"8\"], [sm-size=\"80\"], [sm-size=\"96\"], [sm-size=\"flexible\"])"
	},
	{
		"id": "invalid-value-spacer-md-size",
		"message": "`md-size` on nldd-spacer takes: 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96, flexible.",
		"context": "nldd-spacer[md-size]:not([md-size=\"10\"], [md-size=\"12\"], [md-size=\"16\"], [md-size=\"2\"], [md-size=\"20\"], [md-size=\"24\"], [md-size=\"28\"], [md-size=\"32\"], [md-size=\"4\"], [md-size=\"40\"], [md-size=\"44\"], [md-size=\"48\"], [md-size=\"56\"], [md-size=\"6\"], [md-size=\"64\"], [md-size=\"8\"], [md-size=\"80\"], [md-size=\"96\"], [md-size=\"flexible\"])"
	},
	{
		"id": "invalid-value-spacer-lg-size",
		"message": "`lg-size` on nldd-spacer takes: 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96, flexible.",
		"context": "nldd-spacer[lg-size]:not([lg-size=\"10\"], [lg-size=\"12\"], [lg-size=\"16\"], [lg-size=\"2\"], [lg-size=\"20\"], [lg-size=\"24\"], [lg-size=\"28\"], [lg-size=\"32\"], [lg-size=\"4\"], [lg-size=\"40\"], [lg-size=\"44\"], [lg-size=\"48\"], [lg-size=\"56\"], [lg-size=\"6\"], [lg-size=\"64\"], [lg-size=\"8\"], [lg-size=\"80\"], [lg-size=\"96\"], [lg-size=\"flexible\"])"
	},
	{
		"id": "invalid-value-spacer-direction",
		"message": "`direction` on nldd-spacer takes: both, horizontal, vertical.",
		"context": "nldd-spacer[direction]:not([direction=\"both\"], [direction=\"horizontal\"], [direction=\"vertical\"])"
	},
	{
		"id": "invalid-value-bar-split-view-background",
		"message": "`background` on nldd-bar-split-view takes: base, inherit, tinted.",
		"context": "nldd-bar-split-view[background]:not([background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-side-by-side-split-view-background",
		"message": "`background` on nldd-side-by-side-split-view takes: base, inherit, tinted.",
		"context": "nldd-side-by-side-split-view[background]:not([background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-split-view-divider-orientation",
		"message": "`orientation` on nldd-split-view-divider takes: horizontal, vertical.",
		"context": "nldd-split-view-divider[orientation]:not([orientation=\"horizontal\"], [orientation=\"vertical\"])"
	},
	{
		"id": "invalid-value-split-view-pane-background",
		"message": "`background` on nldd-split-view-pane takes: base, inherit, tinted.",
		"context": "nldd-split-view-pane[background]:not([background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-stacked-split-view-background",
		"message": "`background` on nldd-stacked-split-view takes: base, inherit, tinted.",
		"context": "nldd-stacked-split-view[background]:not([background=\"base\"], [background=\"inherit\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-window-scheme",
		"message": "`scheme` on nldd-window takes: dark, inherit, light.",
		"context": "nldd-window[scheme]:not([scheme=\"dark\"], [scheme=\"inherit\"], [scheme=\"light\"])"
	},
	{
		"id": "invalid-value-cell-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-cell takes: center, left, right.",
		"context": "nldd-cell[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-cell takes: bottom, center, top.",
		"context": "nldd-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-description-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-description-cell takes: bottom, center, top.",
		"context": "nldd-description-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-drag-handle-cell-size",
		"message": "`size` on nldd-drag-handle-cell takes: md, sm.",
		"context": "nldd-drag-handle-cell[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-icon-cell-size",
		"message": "`size` on nldd-icon-cell takes: 16, 20, 24, 32.",
		"context": "nldd-icon-cell[size]:not([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"32\"])"
	},
	{
		"id": "invalid-value-icon-cell-color",
		"message": "`color` on nldd-icon-cell takes: accent, content, critical, secondary, success, warning.",
		"context": "nldd-icon-cell[color]:not([color=\"accent\"], [color=\"content\"], [color=\"critical\"], [color=\"secondary\"], [color=\"success\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-icon-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-icon-cell takes: bottom, center, top.",
		"context": "nldd-icon-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-spacer-cell-size",
		"message": "`size` on nldd-spacer-cell takes: 10, 12, 16, 2, 20, 24, 28, 32, 4, 40, 44, 48, 56, 6, 64, 8, 80, 96, flexible.",
		"context": "nldd-spacer-cell[size]:not([size=\"10\"], [size=\"12\"], [size=\"16\"], [size=\"2\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"4\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"6\"], [size=\"64\"], [size=\"8\"], [size=\"80\"], [size=\"96\"], [size=\"flexible\"])"
	},
	{
		"id": "invalid-value-step-cell-level",
		"message": "`level` on nldd-step-cell takes: major, minor, none.",
		"context": "nldd-step-cell[level]:not([level=\"major\"], [level=\"minor\"], [level=\"none\"])"
	},
	{
		"id": "invalid-value-step-cell-status",
		"message": "`status` on nldd-step-cell takes: current, future, past.",
		"context": "nldd-step-cell[status]:not([status=\"current\"], [status=\"future\"], [status=\"past\"])"
	},
	{
		"id": "invalid-value-step-cell-size",
		"message": "`size` on nldd-step-cell takes: md, sm.",
		"context": "nldd-step-cell[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-step-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-step-cell takes: bottom, center, top.",
		"context": "nldd-step-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-step-cell-direction",
		"message": "`direction` on nldd-step-cell takes: down, up.",
		"context": "nldd-step-cell[direction]:not([direction=\"down\"], [direction=\"up\"])"
	},
	{
		"id": "invalid-value-step-cell-position",
		"message": "`position` on nldd-step-cell takes: between, first, last, only.",
		"context": "nldd-step-cell[position]:not([position=\"between\"], [position=\"first\"], [position=\"last\"], [position=\"only\"])"
	},
	{
		"id": "invalid-value-step-cell-line",
		"message": "`line` on nldd-step-cell takes: auto, both, bottom, none, top.",
		"context": "nldd-step-cell[line]:not([line=\"auto\"], [line=\"both\"], [line=\"bottom\"], [line=\"none\"], [line=\"top\"])"
	},
	{
		"id": "invalid-value-text-cell-size",
		"message": "`size` on nldd-text-cell takes: md, sm.",
		"context": "nldd-text-cell[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-text-cell-color",
		"message": "`color` on nldd-text-cell takes: accent, content, critical, secondary, success, warning.",
		"context": "nldd-text-cell[color]:not([color=\"accent\"], [color=\"content\"], [color=\"critical\"], [color=\"secondary\"], [color=\"success\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-text-cell-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-text-cell takes: center, left, right.",
		"context": "nldd-text-cell[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-text-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-text-cell takes: bottom, center, top.",
		"context": "nldd-text-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-text-cell-query-mark-mode",
		"message": "`query-mark-mode` on nldd-text-cell takes: match, predictive.",
		"context": "nldd-text-cell[query-mark-mode]:not([query-mark-mode=\"match\"], [query-mark-mode=\"predictive\"])"
	},
	{
		"id": "invalid-value-title-cell-color",
		"message": "`color` on nldd-title-cell takes: accent, content, critical, secondary, success, warning.",
		"context": "nldd-title-cell[color]:not([color=\"accent\"], [color=\"content\"], [color=\"critical\"], [color=\"secondary\"], [color=\"success\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-title-cell-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-title-cell takes: center, left, right.",
		"context": "nldd-title-cell[horizontal-alignment]:not([horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"], [horizontal-alignment=\"right\"])"
	},
	{
		"id": "invalid-value-title-cell-vertical-alignment",
		"message": "`vertical-alignment` on nldd-title-cell takes: bottom, center, top.",
		"context": "nldd-title-cell[vertical-alignment]:not([vertical-alignment=\"bottom\"], [vertical-alignment=\"center\"], [vertical-alignment=\"top\"])"
	},
	{
		"id": "invalid-value-title-cell-query-mark-mode",
		"message": "`query-mark-mode` on nldd-title-cell takes: match, predictive.",
		"context": "nldd-title-cell[query-mark-mode]:not([query-mark-mode=\"match\"], [query-mark-mode=\"predictive\"])"
	},
	{
		"id": "invalid-value-list-item-segment-width",
		"message": "`width` on nldd-list-item-segment takes: fit-content, full.",
		"context": "nldd-list-item-segment[width]:not([width=\"fit-content\"], [width=\"full\"])"
	},
	{
		"id": "invalid-value-list-item-segment-current-type",
		"message": "`current-type` on nldd-list-item-segment takes: date, location, page, step, time, true.",
		"context": "nldd-list-item-segment[current-type]:not([current-type=\"date\"], [current-type=\"location\"], [current-type=\"page\"], [current-type=\"step\"], [current-type=\"time\"], [current-type=\"true\"])"
	},
	{
		"id": "invalid-value-list-item-size",
		"message": "`size` on nldd-list-item takes: md, sm.",
		"context": "nldd-list-item[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-list-item-current-type",
		"message": "`current-type` on nldd-list-item takes: date, location, page, step, time, true.",
		"context": "nldd-list-item[current-type]:not([current-type=\"date\"], [current-type=\"location\"], [current-type=\"page\"], [current-type=\"step\"], [current-type=\"time\"], [current-type=\"true\"])"
	},
	{
		"id": "invalid-value-list-appearance",
		"message": "`appearance` on nldd-list takes: box-base, box-tinted, simple.",
		"context": "nldd-list[appearance]:not([appearance=\"box-base\"], [appearance=\"box-tinted\"], [appearance=\"simple\"])"
	},
	{
		"id": "invalid-value-list-type",
		"message": "`type` on nldd-list takes: form, list, listbox, navigation, radiogroup, tree.",
		"context": "nldd-list[type]:not([type=\"form\"], [type=\"list\"], [type=\"listbox\"], [type=\"navigation\"], [type=\"radiogroup\"], [type=\"tree\"])"
	},
	{
		"id": "invalid-value-list-dividers",
		"message": "`dividers` on nldd-list takes: always, never, on-touch.",
		"context": "nldd-list[dividers]:not([dividers=\"always\"], [dividers=\"never\"], [dividers=\"on-touch\"])"
	},
	{
		"id": "invalid-value-table-background",
		"message": "`background` on nldd-table takes: base, tinted.",
		"context": "nldd-table[background]:not([background=\"base\"], [background=\"tinted\"])"
	},
	{
		"id": "invalid-value-link-size",
		"message": "`size` on nldd-link takes: inherit, lg, md, sm, xs.",
		"context": "nldd-link[size]:not([size=\"inherit\"], [size=\"lg\"], [size=\"md\"], [size=\"sm\"], [size=\"xs\"])"
	},
	{
		"id": "invalid-value-menu-bar-item-current-type",
		"message": "`current-type` on nldd-menu-bar-item takes: date, location, page, step, time, true.",
		"context": "nldd-menu-bar-item[current-type]:not([current-type=\"date\"], [current-type=\"location\"], [current-type=\"page\"], [current-type=\"step\"], [current-type=\"time\"], [current-type=\"true\"])"
	},
	{
		"id": "invalid-value-tab-bar-item-_groupVariant",
		"message": "`_groupVariant` on nldd-tab-bar-item takes: icon, icon-and-text, text.",
		"context": "nldd-tab-bar-item[_groupVariant]:not([_groupVariant=\"\"], [_groupVariant=\"icon\"], [_groupVariant=\"icon-and-text\"], [_groupVariant=\"text\"])"
	},
	{
		"id": "invalid-value-tab-bar-item-size",
		"message": "`size` on nldd-tab-bar-item takes: lg, md.",
		"context": "nldd-tab-bar-item[size]:not([size=\"lg\"], [size=\"md\"])"
	},
	{
		"id": "invalid-value-tab-bar-variant",
		"message": "`variant` on nldd-tab-bar takes: icon, icon-and-text, text.",
		"context": "nldd-tab-bar[variant]:not([variant=\"\"], [variant=\"icon\"], [variant=\"icon-and-text\"], [variant=\"text\"])"
	},
	{
		"id": "invalid-value-tab-bar-size",
		"message": "`size` on nldd-tab-bar takes: lg, md.",
		"context": "nldd-tab-bar[size]:not([size=\"lg\"], [size=\"md\"])"
	},
	{
		"id": "invalid-value-activity-indicator-size",
		"message": "`size` on nldd-activity-indicator takes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96.",
		"context": "nldd-activity-indicator[size]:not([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"64\"], [size=\"80\"], [size=\"96\"])"
	},
	{
		"id": "invalid-value-activity-indicator-timing",
		"message": "`timing` on nldd-activity-indicator takes: delay, instant.",
		"context": "nldd-activity-indicator[timing]:not([timing=\"delay\"], [timing=\"instant\"])"
	},
	{
		"id": "invalid-value-badge-size",
		"message": "`size` on nldd-badge takes: md, sm.",
		"context": "nldd-badge[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-badge-color",
		"message": "`color` on nldd-badge takes: accent, critical, inherit, neutral, success, warning.",
		"context": "nldd-badge[color]:not([color=\"accent\"], [color=\"critical\"], [color=\"inherit\"], [color=\"neutral\"], [color=\"success\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-banner-variant",
		"message": "`variant` on nldd-banner takes: accent, critical, neutral, success, warning.",
		"context": "nldd-banner[variant]:not([variant=\"accent\"], [variant=\"critical\"], [variant=\"neutral\"], [variant=\"success\"], [variant=\"warning\"])"
	},
	{
		"id": "invalid-value-banner-size",
		"message": "`size` on nldd-banner takes: md, sm.",
		"context": "nldd-banner[size]:not([size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-inline-dialog-variant",
		"message": "`variant` on nldd-inline-dialog takes: alert, loading, success.",
		"context": "nldd-inline-dialog[variant]:not([variant=\"\"], [variant=\"alert\"], [variant=\"loading\"], [variant=\"success\"])"
	},
	{
		"id": "invalid-value-inline-dialog-size",
		"message": "`size` on nldd-inline-dialog takes: lg, md.",
		"context": "nldd-inline-dialog[size]:not([size=\"lg\"], [size=\"md\"])"
	},
	{
		"id": "invalid-value-inline-dialog-icon-color",
		"message": "`icon-color` on nldd-inline-dialog takes: accent, critical, secondary, success, warning.",
		"context": "nldd-inline-dialog[icon-color]:not([icon-color=\"\"], [icon-color=\"accent\"], [icon-color=\"critical\"], [icon-color=\"secondary\"], [icon-color=\"success\"], [icon-color=\"warning\"])"
	},
	{
		"id": "invalid-value-inline-dialog-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-inline-dialog takes: center, left.",
		"context": "nldd-inline-dialog[horizontal-alignment]:not([horizontal-alignment=\"\"], [horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"])"
	},
	{
		"id": "invalid-value-just-in-time-education-placement",
		"message": "`placement` on nldd-just-in-time-education takes: auto, bottom, left, right, top.",
		"context": "nldd-just-in-time-education[placement]:not([placement=\"auto\"], [placement=\"bottom\"], [placement=\"left\"], [placement=\"right\"], [placement=\"top\"])"
	},
	{
		"id": "invalid-value-modal-dialog-variant",
		"message": "`variant` on nldd-modal-dialog takes: alert, loading, success.",
		"context": "nldd-modal-dialog[variant]:not([variant=\"\"], [variant=\"alert\"], [variant=\"loading\"], [variant=\"success\"])"
	},
	{
		"id": "invalid-value-modal-dialog-horizontal-alignment",
		"message": "`horizontal-alignment` on nldd-modal-dialog takes: center, left.",
		"context": "nldd-modal-dialog[horizontal-alignment]:not([horizontal-alignment=\"\"], [horizontal-alignment=\"center\"], [horizontal-alignment=\"left\"])"
	},
	{
		"id": "invalid-value-notification-variant",
		"message": "`variant` on nldd-notification takes: accent, critical, neutral, success, warning.",
		"context": "nldd-notification[variant]:not([variant=\"accent\"], [variant=\"critical\"], [variant=\"neutral\"], [variant=\"success\"], [variant=\"warning\"])"
	},
	{
		"id": "invalid-value-progress-bar-segment-indicator-color",
		"message": "`color` on nldd-progress-bar-segment-indicator takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, neutral, oranje, paars, robijnrood, rood, roze, success, violet, warning.",
		"context": "nldd-progress-bar-segment-indicator[color]:not([color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"neutral\"], [color=\"oranje\"], [color=\"paars\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-progress-bar-variant",
		"message": "`variant` on nldd-progress-bar takes: distribution, progress.",
		"context": "nldd-progress-bar[variant]:not([variant=\"distribution\"], [variant=\"progress\"])"
	},
	{
		"id": "invalid-value-progress-bar-color",
		"message": "`color` on nldd-progress-bar takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, neutral, oranje, paars, robijnrood, rood, roze, success, violet, warning.",
		"context": "nldd-progress-bar[color]:not([color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"neutral\"], [color=\"oranje\"], [color=\"paars\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-progress-bar-size",
		"message": "`size` on nldd-progress-bar takes: lg, md, sm.",
		"context": "nldd-progress-bar[size]:not([size=\"lg\"], [size=\"md\"], [size=\"sm\"])"
	},
	{
		"id": "invalid-value-progress-bar-value-format",
		"message": "`value-format` on nldd-progress-bar takes: absolute, fraction, percentage.",
		"context": "nldd-progress-bar[value-format]:not([value-format=\"absolute\"], [value-format=\"fraction\"], [value-format=\"percentage\"])"
	},
	{
		"id": "invalid-value-progress-bar-value-display",
		"message": "`value-display` on nldd-progress-bar takes: inline, none, tooltip.",
		"context": "nldd-progress-bar[value-display]:not([value-display=\"inline\"], [value-display=\"none\"], [value-display=\"tooltip\"])"
	},
	{
		"id": "invalid-value-progress-circle-segment-indicator-color",
		"message": "`color` on nldd-progress-circle-segment-indicator takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, neutral, oranje, paars, robijnrood, rood, roze, success, violet, warning.",
		"context": "nldd-progress-circle-segment-indicator[color]:not([color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"neutral\"], [color=\"oranje\"], [color=\"paars\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-progress-circle-variant",
		"message": "`variant` on nldd-progress-circle takes: distribution, progress.",
		"context": "nldd-progress-circle[variant]:not([variant=\"distribution\"], [variant=\"progress\"])"
	},
	{
		"id": "invalid-value-progress-circle-color",
		"message": "`color` on nldd-progress-circle takes: accent, bruin, critical, donkerblauw, donkerbruin, donkergeel, donkergroen, geel, groen, hemelblauw, lichtblauw, lintblauw, mintgroen, mosgroen, neutral, oranje, paars, robijnrood, rood, roze, success, violet, warning.",
		"context": "nldd-progress-circle[color]:not([color=\"accent\"], [color=\"bruin\"], [color=\"critical\"], [color=\"donkerblauw\"], [color=\"donkerbruin\"], [color=\"donkergeel\"], [color=\"donkergroen\"], [color=\"geel\"], [color=\"groen\"], [color=\"hemelblauw\"], [color=\"lichtblauw\"], [color=\"lintblauw\"], [color=\"mintgroen\"], [color=\"mosgroen\"], [color=\"neutral\"], [color=\"oranje\"], [color=\"paars\"], [color=\"robijnrood\"], [color=\"rood\"], [color=\"roze\"], [color=\"success\"], [color=\"violet\"], [color=\"warning\"])"
	},
	{
		"id": "invalid-value-progress-circle-size",
		"message": "`size` on nldd-progress-circle takes: 16, 20, 24, 28, 32, 40, 44, 48, 56, 64, 80, 96.",
		"context": "nldd-progress-circle[size]:not([size=\"16\"], [size=\"20\"], [size=\"24\"], [size=\"28\"], [size=\"32\"], [size=\"40\"], [size=\"44\"], [size=\"48\"], [size=\"56\"], [size=\"64\"], [size=\"80\"], [size=\"96\"])"
	},
	{
		"id": "invalid-value-progress-circle-value-format",
		"message": "`value-format` on nldd-progress-circle takes: absolute, fraction, percentage.",
		"context": "nldd-progress-circle[value-format]:not([value-format=\"absolute\"], [value-format=\"fraction\"], [value-format=\"percentage\"])"
	},
	{
		"id": "invalid-value-progress-circle-value-display",
		"message": "`value-display` on nldd-progress-circle takes: inline, none, tooltip.",
		"context": "nldd-progress-circle[value-display]:not([value-display=\"inline\"], [value-display=\"none\"], [value-display=\"tooltip\"])"
	},
	{
		"id": "invalid-value-status-bar-variant",
		"message": "`variant` on nldd-status-bar takes: accent, critical, neutral, success, warning.",
		"context": "nldd-status-bar[variant]:not([variant=\"accent\"], [variant=\"critical\"], [variant=\"neutral\"], [variant=\"success\"], [variant=\"warning\"])"
	},
	{
		"id": "invalid-value-step-bar-item-status",
		"message": "`status` on nldd-step-bar-item takes: current, future, past.",
		"context": "nldd-step-bar-item[status]:not([status=\"current\"], [status=\"future\"], [status=\"past\"])"
	}
];
