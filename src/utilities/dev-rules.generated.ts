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
		"id": "avatar-needs-name",
		"message": "An avatar with `href` or `button` needs `accessible-label` or `name`, or the control has no accessible name.",
		"context": "nldd-avatar:is([href]:not([href=\"\"]), [button])",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), [name]:not([name=\"\"])"
	},
	{
		"id": "bar-split-view-children-need-slot",
		"message": "Every child of nldd-bar-split-view needs a `slot`, or it does not render.",
		"context": "nldd-bar-split-view",
		"report": ":has(> :not([slot]))"
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
		"id": "button-needs-name",
		"message": "nldd-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"]), :has(> [slot=\"text\"])"
	},
	{
		"id": "card-link-needs-name",
		"message": "A card that is a link or button needs `accessible-label`: the control has no text of its own.",
		"context": "nldd-card:is([href]:not([href=\"\"]), [button])",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "combo-box-needs-name",
		"message": "nldd-combo-box needs `accessible-label` or a labeled nldd-form-field around it, or it has no accessible name.",
		"context": "nldd-combo-box",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "document-tab-bar-needs-name",
		"message": "nldd-document-tab-bar needs `accessible-label` for a meaningful navigation landmark name; without one it falls back to a generic name.",
		"context": "nldd-document-tab-bar",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
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
		"id": "icon-button-needs-name",
		"message": "nldd-icon-button needs `text` or `accessible-label`, otherwise it has no accessible name.",
		"context": "nldd-icon-button",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"])"
	},
	{
		"id": "list-form-row-is-action",
		"message": "type=\"form\" says the rows are not actions and the controls inside them are, so its rows carry no keyboard of their own. This one is a link, a button, a checkbox or a set of segments. Use type=\"list\" for rows you activate, and put the action in a cell if it belongs to a form row.",
		"context": "nldd-list[type=\"form\"] > nldd-list-item",
		"report": ":is([href]:not([href=\"\"]), [button], [checkbox], :has(> nldd-list-item-segment))"
	},
	{
		"id": "list-item-children-need-tree",
		"message": "`slot=\"children\"` nests rows, which only carries meaning in an nldd-list with type=\"tree\" or type=\"navigation\". Elsewhere the group has no owner and assistive technology cannot read the hierarchy.",
		"context": "nldd-list-item:has(> nldd-list-item[slot=\"children\"])",
		"assert": "nldd-list[type=\"tree\"] *, nldd-list[type=\"navigation\"] *"
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
		"id": "number-field-needs-name",
		"message": "nldd-number-field needs `accessible-label` or a labeled nldd-form-field around it, or a screen reader cannot announce its purpose.",
		"context": "nldd-number-field",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
	},
	{
		"id": "popover-needs-name",
		"message": "nldd-popover needs `accessible-label`, or a screen reader announces it without a name.",
		"context": "nldd-popover",
		"assert": "[accessible-label]:not([accessible-label=\"\"])"
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
		"id": "switch-needs-name",
		"message": "nldd-switch needs `accessible-label` or a labeled nldd-form-field around it, or use nldd-switch-field. Without one it has no accessible name.",
		"context": "nldd-switch",
		"assert": "[accessible-label]:not([accessible-label=\"\"]), nldd-form-field[label]:not([label=\"\"]) *"
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
		"id": "tabs-with-href-need-navigation",
		"message": "Tabs with `href` go to another page: add `navigation`, so the bar is a nav with aria-current=\"page\" instead of a tablist, and set `current` on the tab of the page you are on.",
		"context": "nldd-tab-bar:not([navigation]):has(nldd-tab-bar-item[href]:not([href=\"\"]))"
	},
	{
		"id": "task-board-column-needs-name",
		"message": "nldd-task-board-column needs `text` or `accessible-label`; it is what a screen reader hears when an item moves to it.",
		"context": "nldd-task-board-column",
		"assert": "[text]:not([text=\"\"]), [accessible-label]:not([accessible-label=\"\"])"
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
	}
];
